import { Achievement, AchievementType, ChainActivity, ACHIEVEMENT_POINTS } from './types';

/**
 * Achievement Detection System
 * Analyzes on-chain activities and detects achievements
 */

export class AchievementDetector {
  /**
   * Detect DeFi Master Achievement
   * Requirements: $10K+ liquidity provided, 0 liquidations, 30+ days active
   */
  static detectDeFiMaster(chainActivity: ChainActivity): Achievement | null {
    const { defiActivity, lastTransaction, firstTransaction } = chainActivity;
    
    if (!defiActivity) return null;

    const liquidityUSD = parseFloat(defiActivity.liquidityProvided);
    const daysActive = (lastTransaction - firstTransaction) / (1000 * 60 * 60 * 24);

    if (liquidityUSD >= 10000 && defiActivity.liquidations === 0 && daysActive >= 30) {
      return {
        id: `defi-master-${chainActivity.chain}-${Date.now()}`,
        type: AchievementType.DEFI_MASTER,
        name: 'DeFi Master',
        description: `Provided $${liquidityUSD.toLocaleString()}+ liquidity with zero liquidations`,
        chain: chainActivity.chain,
        timestamp: Date.now(),
        points: ACHIEVEMENT_POINTS[AchievementType.DEFI_MASTER],
        metadata: {
          liquidityProvided: defiActivity.liquidityProvided,
          liquidations: defiActivity.liquidations,
          daysActive: Math.floor(daysActive),
          protocolsUsed: chainActivity.protocols,
        },
        verified: true,
      };
    }

    return null;
  }

  /**
   * Detect NFT Royalty Achievement
   * Requirements: 50+ NFT trades, 70%+ profitable, $5K+ volume
   */
  static detectNFTRoyalty(chainActivity: ChainActivity): Achievement | null {
    const { nftActivity } = chainActivity;
    
    if (!nftActivity) return null;

    if (
      nftActivity.traded >= 50 &&
      nftActivity.profitability >= 0.7
    ) {
      return {
        id: `nft-royalty-${chainActivity.chain}-${Date.now()}`,
        type: AchievementType.NFT_ROYALTY,
        name: 'NFT Royalty',
        description: `Completed ${nftActivity.traded} NFT trades with ${(nftActivity.profitability * 100).toFixed(0)}% profitability`,
        chain: chainActivity.chain,
        timestamp: Date.now(),
        points: ACHIEVEMENT_POINTS[AchievementType.NFT_ROYALTY],
        metadata: {
          tradesCount: nftActivity.traded,
          profitability: nftActivity.profitability,
          nftsOwned: nftActivity.owned,
        },
        verified: true,
      };
    }

    return null;
  }

  /**
   * Detect DAO Contributor Achievement
   * Requirements: 10+ governance votes, 3+ proposals created
   */
  static detectDAOContributor(chainActivity: ChainActivity): Achievement | null {
    const { governanceActivity } = chainActivity;
    
    if (!governanceActivity) return null;

    if (
      governanceActivity.votesCount >= 10 &&
      governanceActivity.proposalsCreated >= 3
    ) {
      return {
        id: `dao-contributor-${chainActivity.chain}-${Date.now()}`,
        type: AchievementType.DAO_CONTRIBUTOR,
        name: 'DAO Contributor',
        description: `Cast ${governanceActivity.votesCount} votes and created ${governanceActivity.proposalsCreated} proposals`,
        chain: chainActivity.chain,
        timestamp: Date.now(),
        points: ACHIEVEMENT_POINTS[AchievementType.DAO_CONTRIBUTOR],
        metadata: {
          votesCount: governanceActivity.votesCount,
          proposalsCreated: governanceActivity.proposalsCreated,
          daosParticipated: governanceActivity.daosParticipated,
        },
        verified: true,
      };
    }

    return null;
  }

  /**
   * Detect Yield Farmer Achievement
   * Requirements: 15+ different protocols used, $25K+ total value
   */
  static detectYieldFarmer(chainActivity: ChainActivity): Achievement | null {
    const { defiActivity, protocols } = chainActivity;
    
    if (!defiActivity || !protocols) return null;

    const tvl = parseFloat(defiActivity.liquidityProvided);

    if (defiActivity.protocolsUsed >= 15 && tvl >= 25000) {
      return {
        id: `yield-farmer-${chainActivity.chain}-${Date.now()}`,
        type: AchievementType.YIELD_FARMER,
        name: 'Yield Farmer',
        description: `Active in ${defiActivity.protocolsUsed} protocols with $${tvl.toLocaleString()} TVL`,
        chain: chainActivity.chain,
        timestamp: Date.now(),
        points: ACHIEVEMENT_POINTS[AchievementType.YIELD_FARMER],
        metadata: {
          protocolsUsed: protocols,
          totalValue: defiActivity.liquidityProvided,
        },
        verified: true,
      };
    }

    return null;
  }

  /**
   * Detect Whale Achievement
   * Requirements: $100K+ total value across activities
   */
  static detectWhale(chainActivity: ChainActivity): Achievement | null {
    const volumeUSD = parseFloat(chainActivity.volume);

    if (volumeUSD >= 100000) {
      return {
        id: `whale-${chainActivity.chain}-${Date.now()}`,
        type: AchievementType.WHALE,
        name: 'Whale',
        description: `$${volumeUSD.toLocaleString()} total volume on ${chainActivity.chain}`,
        chain: chainActivity.chain,
        timestamp: Date.now(),
        points: ACHIEVEMENT_POINTS[AchievementType.WHALE],
        metadata: {
          volume: chainActivity.volume,
          transactionCount: chainActivity.transactions,
        },
        verified: true,
      };
    }

    return null;
  }

  /**
   * Detect Early Adopter Achievement
   * Requirements: Active for 2+ years
   */
  static detectEarlyAdopter(chainActivity: ChainActivity): Achievement | null {
    const yearsActive = (Date.now() - chainActivity.firstTransaction) / (1000 * 60 * 60 * 24 * 365);

    if (yearsActive >= 2) {
      return {
        id: `early-adopter-${chainActivity.chain}-${Date.now()}`,
        type: AchievementType.EARLY_ADOPTER,
        name: 'Early Adopter',
        description: `Active on ${chainActivity.chain} for ${yearsActive.toFixed(1)} years`,
        chain: chainActivity.chain,
        timestamp: Date.now(),
        points: ACHIEVEMENT_POINTS[AchievementType.EARLY_ADOPTER],
        metadata: {
          yearsActive: yearsActive.toFixed(1),
          firstTransaction: chainActivity.firstTransaction,
        },
        verified: true,
      };
    }

    return null;
  }

  /**
   * Detect Cross-Chain Explorer Achievement
   * Requirements: Active on 5+ different chains
   */
  static detectCrossChainExplorer(chainActivities: ChainActivity[]): Achievement | null {
    const activeChains = chainActivities.filter(activity => activity.transactions > 10);

    if (activeChains.length >= 5) {
      return {
        id: `cross-chain-explorer-${Date.now()}`,
        type: AchievementType.CROSS_CHAIN_EXPLORER,
        name: 'Cross-Chain Explorer',
        description: `Active on ${activeChains.length} different chains`,
        chain: 'Multi-Chain',
        timestamp: Date.now(),
        points: ACHIEVEMENT_POINTS[AchievementType.CROSS_CHAIN_EXPLORER],
        metadata: {
          chainsCount: activeChains.length,
          chains: activeChains.map(a => a.chain),
        },
        verified: true,
      };
    }

    return null;
  }

  /**
   * Main detection method - runs all detectors
   */
  static detectAllAchievements(chainActivities: ChainActivity[]): Achievement[] {
    const achievements: Achievement[] = [];

    // Per-chain achievements
    for (const activity of chainActivities) {
      const defiMaster = this.detectDeFiMaster(activity);
      const nftRoyalty = this.detectNFTRoyalty(activity);
      const daoContributor = this.detectDAOContributor(activity);
      const yieldFarmer = this.detectYieldFarmer(activity);
      const whale = this.detectWhale(activity);
      const earlyAdopter = this.detectEarlyAdopter(activity);

      if (defiMaster) achievements.push(defiMaster);
      if (nftRoyalty) achievements.push(nftRoyalty);
      if (daoContributor) achievements.push(daoContributor);
      if (yieldFarmer) achievements.push(yieldFarmer);
      if (whale) achievements.push(whale);
      if (earlyAdopter) achievements.push(earlyAdopter);
    }

    // Cross-chain achievements
    const crossChainExplorer = this.detectCrossChainExplorer(chainActivities);
    if (crossChainExplorer) achievements.push(crossChainExplorer);

    return achievements;
  }
}

