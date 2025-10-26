import { useState, useEffect } from 'react';
import { ReputationScore, ChainActivity, Achievement } from '@/lib/types';

interface UseReputationReturn {
  reputation: ReputationScore | null;
  chainActivities: ChainActivity[];
  achievements: Achievement[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useReputation(address: string | null): UseReputationReturn {
  const [reputation, setReputation] = useState<ReputationScore | null>(null);
  const [chainActivities, setChainActivities] = useState<ChainActivity[]>([]);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = async () => {
    if (!address) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch reputation data
      const reputationResponse = await fetch(`/api/reputation?address=${address}`);
      const reputationData = await reputationResponse.json();

      if (reputationData.success) {
        setReputation(reputationData.data.reputationScore);
        setChainActivities(reputationData.data.reputationScore.chainActivities);
      }

      // Fetch achievements
      const achievementsResponse = await fetch(`/api/achievements?address=${address}`);
      const achievementsData = await achievementsResponse.json();

      if (achievementsData.success) {
        setAchievements(achievementsData.data.achievements);
      }
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [address]);

  return {
    reputation,
    chainActivities,
    achievements,
    isLoading,
    error,
    refetch: fetchData,
  };
}

