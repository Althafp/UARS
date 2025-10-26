import { NextRequest, NextResponse } from 'next/server';
import { generateDemoChainActivities } from '@/lib/demo-data';

/**
 * GET /api/chain-activity?address=0x...
 * Fetch cross-chain activity data for a given address
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');
    const chain = searchParams.get('chain'); // Optional: filter by specific chain

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // For hackathon demo, use generated data
    // In production, this would fetch real data from:
    // - Ethereum: Etherscan API / The Graph
    // - Polygon: Polygonscan API
    // - Arbitrum: Arbiscan API
    // - Base: Basescan API
    // - etc.
    
    let chainActivities = generateDemoChainActivities();

    // Filter by chain if specified
    if (chain) {
      chainActivities = chainActivities.filter(
        activity => activity.chain.toLowerCase() === chain.toLowerCase()
      );
    }

    // Calculate summary statistics
    const totalTransactions = chainActivities.reduce(
      (sum, activity) => sum + activity.transactions,
      0
    );
    
    const totalVolume = chainActivities.reduce(
      (sum, activity) => sum + parseFloat(activity.volume),
      0
    );

    const activeChains = chainActivities.length;

    return NextResponse.json({
      success: true,
      data: {
        address,
        chainActivities,
        summary: {
          totalTransactions,
          totalVolumeUSD: totalVolume.toFixed(2),
          activeChains,
          oldestActivity: Math.min(...chainActivities.map(a => a.firstTransaction)),
          latestActivity: Math.max(...chainActivities.map(a => a.lastTransaction)),
        },
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error fetching chain activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chain activity data' },
      { status: 500 }
    );
  }
}

