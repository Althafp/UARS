import { ChainActivity, Achievement, AchievementType, ACHIEVEMENT_POINTS } from './types';

/**
 * Demo Data Generator for Hackathon Presentation
 * Generates realistic-looking cross-chain activity data
 */

export function generateDemoChainActivities(): ChainActivity[] {
  return [
    {
      chain: 'Ethereum',
      chainId: 1,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      transactions: 234,
      volume: '125000',
      firstTransaction: Date.now() - (1000 * 60 * 60 * 24 * 730), // 2 years ago
      lastTransaction: Date.now() - (1000 * 60 * 60 * 24 * 2), // 2 days ago
      protocols: ['Uniswap', 'Aave', 'Compound', 'Curve', 'MakerDAO', 'Lido'],
      defiActivity: {
        liquidityProvided: '50000',
        protocolsUsed: 6,
        liquidations: 0,
      },
      nftActivity: {
        traded: 45,
        owned: 28,
        profitability: 0.62,
      },
      governanceActivity: {
        votesCount: 8,
        proposalsCreated: 2,
        daosParticipated: ['MakerDAO', 'Compound'],
      },
    },
    {
      chain: 'Polygon',
      chainId: 137,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      transactions: 456,
      volume: '45000',
      firstTransaction: Date.now() - (1000 * 60 * 60 * 24 * 365), // 1 year ago
      lastTransaction: Date.now() - (1000 * 60 * 60 * 12), // 12 hours ago
      protocols: ['QuickSwap', 'Aave', 'SushiSwap', 'Balancer'],
      defiActivity: {
        liquidityProvided: '25000',
        protocolsUsed: 4,
        liquidations: 0,
      },
      nftActivity: {
        traded: 89,
        owned: 45,
        profitability: 0.78,
      },
    },
    {
      chain: 'Arbitrum',
      chainId: 42161,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      transactions: 178,
      volume: '32000',
      firstTransaction: Date.now() - (1000 * 60 * 60 * 24 * 180), // 6 months ago
      lastTransaction: Date.now() - (1000 * 60 * 60 * 24), // 1 day ago
      protocols: ['GMX', 'Camelot', 'Radiant'],
      defiActivity: {
        liquidityProvided: '18000',
        protocolsUsed: 3,
        liquidations: 0,
      },
    },
    {
      chain: 'Base',
      chainId: 8453,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      transactions: 67,
      volume: '8500',
      firstTransaction: Date.now() - (1000 * 60 * 60 * 24 * 90), // 3 months ago
      lastTransaction: Date.now() - (1000 * 60 * 60 * 6), // 6 hours ago
      protocols: ['Aerodrome', 'BaseSwap'],
      defiActivity: {
        liquidityProvided: '5000',
        protocolsUsed: 2,
        liquidations: 0,
      },
    },
    {
      chain: 'Optimism',
      chainId: 10,
      address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      transactions: 145,
      volume: '28000',
      firstTransaction: Date.now() - (1000 * 60 * 60 * 24 * 270), // 9 months ago
      lastTransaction: Date.now() - (1000 * 60 * 60 * 48), // 2 days ago
      protocols: ['Velodrome', 'Synthetix', 'Beethoven X'],
      defiActivity: {
        liquidityProvided: '15000',
        protocolsUsed: 3,
        liquidations: 0,
      },
      governanceActivity: {
        votesCount: 15,
        proposalsCreated: 4,
        daosParticipated: ['Optimism Collective'],
      },
    },
  ];
}

export function generateDemoAchievements(): Achievement[] {
  const now = Date.now();
  
  return [
    {
      id: 'ach-1',
      type: AchievementType.DEFI_MASTER,
      name: 'DeFi Master',
      description: 'Provided $50,000+ liquidity with zero liquidations across Ethereum',
      chain: 'Ethereum',
      timestamp: now - (1000 * 60 * 60 * 24 * 30),
      points: ACHIEVEMENT_POINTS[AchievementType.DEFI_MASTER],
      metadata: {
        liquidityProvided: '50000',
        liquidations: 0,
        daysActive: 730,
        protocolsUsed: ['Uniswap', 'Aave', 'Compound', 'Curve', 'MakerDAO', 'Lido'],
      },
      verified: true,
    },
    {
      id: 'ach-2',
      type: AchievementType.NFT_ROYALTY,
      name: 'NFT Royalty',
      description: 'Completed 89 NFT trades with 78% profitability on Polygon',
      chain: 'Polygon',
      timestamp: now - (1000 * 60 * 60 * 24 * 45),
      points: ACHIEVEMENT_POINTS[AchievementType.NFT_ROYALTY],
      metadata: {
        tradesCount: 89,
        profitability: 0.78,
        nftsOwned: 45,
      },
      verified: true,
    },
    {
      id: 'ach-3',
      type: AchievementType.CROSS_CHAIN_EXPLORER,
      name: 'Cross-Chain Explorer',
      description: 'Active on 5 different blockchain networks',
      chain: 'Multi-Chain',
      timestamp: now - (1000 * 60 * 60 * 24 * 10),
      points: ACHIEVEMENT_POINTS[AchievementType.CROSS_CHAIN_EXPLORER],
      metadata: {
        chainsCount: 5,
        chains: ['Ethereum', 'Polygon', 'Arbitrum', 'Base', 'Optimism'],
      },
      verified: true,
    },
    {
      id: 'ach-4',
      type: AchievementType.EARLY_ADOPTER,
      name: 'Early Adopter',
      description: 'Active on Ethereum for 2+ years',
      chain: 'Ethereum',
      timestamp: now - (1000 * 60 * 60 * 24 * 60),
      points: ACHIEVEMENT_POINTS[AchievementType.EARLY_ADOPTER],
      metadata: {
        yearsActive: '2.0',
        firstTransaction: now - (1000 * 60 * 60 * 24 * 730),
      },
      verified: true,
    },
    {
      id: 'ach-5',
      type: AchievementType.DAO_CONTRIBUTOR,
      name: 'DAO Contributor',
      description: 'Cast 23 votes and created 6 proposals across DAOs',
      chain: 'Multi-Chain',
      timestamp: now - (1000 * 60 * 60 * 24 * 20),
      points: ACHIEVEMENT_POINTS[AchievementType.DAO_CONTRIBUTOR],
      metadata: {
        votesCount: 23,
        proposalsCreated: 6,
        daosParticipated: ['MakerDAO', 'Compound', 'Optimism Collective'],
      },
      verified: true,
    },
    {
      id: 'ach-6',
      type: AchievementType.WHALE,
      name: 'Whale',
      description: '$125,000 total volume on Ethereum',
      chain: 'Ethereum',
      timestamp: now - (1000 * 60 * 60 * 24 * 15),
      points: ACHIEVEMENT_POINTS[AchievementType.WHALE],
      metadata: {
        volume: '125000',
        transactionCount: 234,
      },
      verified: true,
    },
  ];
}

export function generateDemoUserProfile() {
  const chainActivities = generateDemoChainActivities();
  const achievements = generateDemoAchievements();

  return {
    address: '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
    connectedWallets: [
      '0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb',
      '0x8Ba1f109551bD432803012645Ac136ddd64DBA72',
    ],
    chainActivities,
    achievements,
    joinedAt: Date.now() - (1000 * 60 * 60 * 24 * 730),
  };
}

// Use case specific demo data
export const useCaseScenarios = {
  defiLending: {
    name: 'Alex - DeFi Lending Power User',
    score: 923,
    tier: 'platinum',
    benefits: {
      collateralRatio: '120%',
      interestRate: '4.5%',
      savingsAnnually: '$50,000',
    },
    history: {
      ethereum: {
        defiVolume: '$2M+',
        liquidations: 0,
        protocolsUsed: 12,
      },
    },
  },
  gaming: {
    name: 'Maya - Cross-Chain Gamer',
    score: 847,
    tier: 'gold',
    achievements: ['Tournament Champion', 'NFT Expert', 'High-Value Trader'],
    benefits: {
      skipTutorials: true,
      advancedTournamentAccess: true,
      premiumEquipment: true,
    },
  },
  nftMarketplace: {
    name: 'High-Value NFT Trader',
    score: 892,
    tier: 'platinum',
    trustFactors: {
      totalVolume: '200+ ETH',
      reliabilityScore: '100%',
      liquidityVerified: true,
      failedTransactions: 0,
    },
    benefits: {
      noEscrowNeeded: true,
      instantSettlement: true,
      zeroFees: true,
    },
  },
  daoGovernance: {
    name: 'Contributor vs Whale',
    scenarios: [
      {
        name: 'Whale A',
        tokens: '100K',
        reputation: 0.5,
        effectiveVotes: '50K',
      },
      {
        name: 'Contributor B',
        tokens: '5K',
        reputation: 5.0,
        effectiveVotes: '25K',
      },
    ],
  },
  idoLaunchpad: {
    tiers: [
      { name: 'Bronze', scoreRange: '500-649', allocation: '1x', guaranteed: 'Lottery only' },
      { name: 'Silver', scoreRange: '650-799', allocation: '3x', guaranteed: '$500' },
      { name: 'Gold', scoreRange: '800-899', allocation: '5x', guaranteed: '$2,500' },
      { name: 'Platinum', scoreRange: '900+', allocation: '10x', guaranteed: '$10,000' },
    ],
  },
};

