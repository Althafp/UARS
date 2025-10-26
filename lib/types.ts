// Achievement Types
export enum AchievementType {
  DEFI_MASTER = 'DEFI_MASTER',
  NFT_ROYALTY = 'NFT_ROYALTY',
  DAO_CONTRIBUTOR = 'DAO_CONTRIBUTOR',
  YIELD_FARMER = 'YIELD_FARMER',
  WHALE = 'WHALE',
  EARLY_ADOPTER = 'EARLY_ADOPTER',
  CROSS_CHAIN_EXPLORER = 'CROSS_CHAIN_EXPLORER',
  GOVERNANCE_EXPERT = 'GOVERNANCE_EXPERT',
  LIQUIDITY_PROVIDER = 'LIQUIDITY_PROVIDER',
  DEGEN_TRADER = 'DEGEN_TRADER',
}

export interface Achievement {
  id: string;
  type: AchievementType;
  name: string;
  description: string;
  chain: string;
  timestamp: number;
  points: number;
  metadata: {
    volume?: string;
    transactionCount?: number;
    protocolsUsed?: string[];
    profitability?: number;
    [key: string]: any;
  };
  verified: boolean;
}

export interface ChainActivity {
  chain: string;
  chainId: number;
  address: string;
  transactions: number;
  volume: string;
  firstTransaction: number;
  lastTransaction: number;
  protocols: string[];
  nftActivity?: {
    traded: number;
    owned: number;
    profitability: number;
  };
  defiActivity?: {
    liquidityProvided: string;
    protocolsUsed: number;
    liquidations: number;
  };
  governanceActivity?: {
    votesCount: number;
    proposalsCreated: number;
    daosParticipated: string[];
  };
}

export interface ReputationScore {
  totalScore: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  percentile: number;
  breakdown: {
    defiMastery: number;
    nftExpertise: number;
    crossChainExperience: number;
    consistencyScore: number;
    governanceParticipation: number;
  };
  achievements: Achievement[];
  chainActivities: ChainActivity[];
  lastUpdated: number;
}

export interface UserProfile {
  address: string;
  connectedWallets: string[];
  reputationScore: ReputationScore;
  universalScore: number;
  joinedAt: number;
}

// Tier Configuration
export const TIER_CONFIG = {
  bronze: { min: 0, max: 649, color: '#CD7F32', label: 'Bronze', multiplier: 1 },
  silver: { min: 650, max: 799, color: '#C0C0C0', label: 'Silver', multiplier: 2 },
  gold: { min: 800, max: 899, color: '#FFD700', label: 'Gold', multiplier: 3 },
  platinum: { min: 900, max: 949, color: '#E5E4E2', label: 'Platinum', multiplier: 5 },
  diamond: { min: 950, max: 1000, color: '#B9F2FF', label: 'Diamond', multiplier: 10 },
} as const;

// Achievement Point Values
export const ACHIEVEMENT_POINTS = {
  [AchievementType.DEFI_MASTER]: 250,
  [AchievementType.NFT_ROYALTY]: 300,
  [AchievementType.DAO_CONTRIBUTOR]: 200,
  [AchievementType.YIELD_FARMER]: 180,
  [AchievementType.WHALE]: 350,
  [AchievementType.EARLY_ADOPTER]: 150,
  [AchievementType.CROSS_CHAIN_EXPLORER]: 200,
  [AchievementType.GOVERNANCE_EXPERT]: 280,
  [AchievementType.LIQUIDITY_PROVIDER]: 220,
  [AchievementType.DEGEN_TRADER]: 190,
} as const;

// Supported Chains
export const SUPPORTED_CHAINS = [
  { name: 'Ethereum', chainId: 1, icon: '⟠', color: '#627EEA' },
  { name: 'Polygon', chainId: 137, icon: '◇', color: '#8247E5' },
  { name: 'Arbitrum', chainId: 42161, icon: '◈', color: '#28A0F0' },
  { name: 'Optimism', chainId: 10, icon: '●', color: '#FF0420' },
  { name: 'Base', chainId: 8453, icon: '◆', color: '#0052FF' },
  { name: 'Solana', chainId: 0, icon: '◉', color: '#14F195' },
  { name: 'Avalanche', chainId: 43114, icon: '▲', color: '#E84142' },
  { name: 'BNB Chain', chainId: 56, icon: '◆', color: '#F3BA2F' },
] as const;

