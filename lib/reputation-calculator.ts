import { Achievement, ChainActivity, ReputationScore, TIER_CONFIG } from './types';

/**
 * Reputation Calculation Engine
 * Computes universal reputation scores based on achievements and activities
 */

export class ReputationCalculator {
  /**
   * Calculate DeFi Mastery Score
   * Based on liquidity provided, protocols used, and consistency
   */
  static calculateDeFiMastery(chainActivities: ChainActivity[]): number {
    let score = 0;

    for (const activity of chainActivities) {
      if (!activity.defiActivity) continue;

      const { liquidityProvided, protocolsUsed, liquidations } = activity.defiActivity;
      const liquidityUSD = parseFloat(liquidityProvided);

      // Base score from liquidity (up to 100 points)
      score += Math.min(liquidityUSD / 1000, 100);

      // Protocol diversity bonus (up to 50 points)
      score += Math.min(protocolsUsed * 3, 50);

      // Zero liquidation bonus (50 points)
      if (liquidations === 0 && liquidityUSD > 1000) {
        score += 50;
      }
    }

    return Math.min(score, 300); // Cap at 300
  }

  /**
   * Calculate NFT Expertise Score
   * Based on trading activity, profitability, and collection size
   */
  static calculateNFTExpertise(chainActivities: ChainActivity[]): number {
    let score = 0;

    for (const activity of chainActivities) {
      if (!activity.nftActivity) continue;

      const { traded, owned, profitability } = activity.nftActivity;

      // Trading volume score (up to 100 points)
      score += Math.min(traded * 1.5, 100);

      // Profitability bonus (up to 100 points)
      score += profitability * 100;

      // Collection size bonus (up to 50 points)
      score += Math.min(owned * 2, 50);
    }

    return Math.min(score, 300); // Cap at 300
  }

  /**
   * Calculate Cross-Chain Experience Score
   * Based on number of chains and activity level on each
   */
  static calculateCrossChainExperience(chainActivities: ChainActivity[]): number {
    const activeChains = chainActivities.filter(a => a.transactions > 5);
    
    // Base score: 30 points per active chain
    let score = activeChains.length * 30;

    // Bonus for high activity across multiple chains
    const highActivityChains = chainActivities.filter(a => a.transactions > 100);
    score += highActivityChains.length * 20;

    return Math.min(score, 200); // Cap at 200
  }

  /**
   * Calculate Consistency Score
   * Based on time active and regular activity patterns
   */
  static calculateConsistencyScore(chainActivities: ChainActivity[]): number {
    let score = 0;

    for (const activity of chainActivities) {
      const daysActive = (activity.lastTransaction - activity.firstTransaction) / (1000 * 60 * 60 * 24);
      const avgTxPerDay = activity.transactions / Math.max(daysActive, 1);

      // Longevity score (up to 50 points per chain)
      score += Math.min(daysActive / 10, 50);

      // Regular activity bonus (up to 30 points per chain)
      if (avgTxPerDay >= 0.5 && avgTxPerDay <= 10) {
        score += 30; // Sweet spot: regular but not spammy
      }
    }

    return Math.min(score, 200); // Cap at 200
  }

  /**
   * Calculate Governance Participation Score
   * Based on voting activity and proposal creation
   */
  static calculateGovernanceParticipation(chainActivities: ChainActivity[]): number {
    let score = 0;

    for (const activity of chainActivities) {
      if (!activity.governanceActivity) continue;

      const { votesCount, proposalsCreated, daosParticipated } = activity.governanceActivity;

      // Voting score (up to 80 points)
      score += Math.min(votesCount * 4, 80);

      // Proposal creation bonus (up to 60 points)
      score += Math.min(proposalsCreated * 20, 60);

      // DAO diversity bonus (up to 40 points)
      score += Math.min(daosParticipated.length * 10, 40);
    }

    return Math.min(score, 200); // Cap at 200
  }

  /**
   * Calculate Achievement Bonus
   * Extra points from verified achievements
   */
  static calculateAchievementBonus(achievements: Achievement[]): number {
    return achievements.reduce((total, achievement) => {
      return total + (achievement.verified ? achievement.points : achievement.points * 0.5);
    }, 0);
  }

  /**
   * Determine Tier based on total score
   */
  static determineTier(score: number): keyof typeof TIER_CONFIG {
    for (const [tier, config] of Object.entries(TIER_CONFIG)) {
      if (score >= config.min && score <= config.max) {
        return tier as keyof typeof TIER_CONFIG;
      }
    }
    return 'diamond';
  }

  /**
   * Calculate percentile (simulated for now)
   * In production, this would be based on actual user distribution
   */
  static calculatePercentile(score: number): number {
    // Simplified percentile calculation
    if (score >= 900) return Math.floor(100 - (1000 - score) / 10);
    if (score >= 800) return Math.floor(90 - (900 - score) / 10);
    if (score >= 650) return Math.floor(75 - (800 - score) / 6);
    if (score >= 500) return Math.floor(50 - (650 - score) / 6);
    return Math.floor(score / 10);
  }

  /**
   * Main calculation method - computes full reputation score
   */
  static calculateReputationScore(
    chainActivities: ChainActivity[],
    achievements: Achievement[]
  ): ReputationScore {
    // Calculate breakdown scores
    const defiMastery = this.calculateDeFiMastery(chainActivities);
    const nftExpertise = this.calculateNFTExpertise(chainActivities);
    const crossChainExperience = this.calculateCrossChainExperience(chainActivities);
    const consistencyScore = this.calculateConsistencyScore(chainActivities);
    const governanceParticipation = this.calculateGovernanceParticipation(chainActivities);

    // Base score from activities
    const baseScore = Math.floor(
      defiMastery +
      nftExpertise +
      crossChainExperience +
      consistencyScore +
      governanceParticipation
    );

    // Achievement bonus (can push score above 1000)
    const achievementBonus = this.calculateAchievementBonus(achievements);

    // Total score (capped at 1000)
    const totalScore = Math.min(baseScore + achievementBonus, 1000);

    // Determine tier and percentile
    const tier = this.determineTier(totalScore);
    const percentile = this.calculatePercentile(totalScore);

    return {
      totalScore,
      tier,
      percentile,
      breakdown: {
        defiMastery: Math.floor(defiMastery),
        nftExpertise: Math.floor(nftExpertise),
        crossChainExperience: Math.floor(crossChainExperience),
        consistencyScore: Math.floor(consistencyScore),
        governanceParticipation: Math.floor(governanceParticipation),
      },
      achievements,
      chainActivities,
      lastUpdated: Date.now(),
    };
  }

  /**
   * Calculate benefits based on reputation tier
   */
  static calculateBenefits(tier: keyof typeof TIER_CONFIG) {
    const config = TIER_CONFIG[tier];
    
    return {
      collateralRatio: Math.max(120, 150 - (config.multiplier * 5)), // Lower is better
      interestRate: Math.max(2.5, 8 - (config.multiplier * 0.5)), // Lower is better
      votingMultiplier: config.multiplier,
      idoAllocationMultiplier: config.multiplier,
      accessLevel: tier,
      skipTutorials: config.multiplier >= 3,
      premiumFeatures: config.multiplier >= 5,
    };
  }
}

