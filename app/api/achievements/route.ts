import { NextRequest, NextResponse } from 'next/server';
import { AchievementDetector } from '@/lib/achievement-detector';
import { generateDemoChainActivities, generateDemoAchievements } from '@/lib/demo-data';

/**
 * GET /api/achievements?address=0x...
 * Fetch all achievements for a given address
 */
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const address = searchParams.get('address');

    if (!address) {
      return NextResponse.json(
        { error: 'Address parameter is required' },
        { status: 400 }
      );
    }

    // For hackathon demo, use generated data
    const chainActivities = generateDemoChainActivities();
    const detectedAchievements = AchievementDetector.detectAllAchievements(chainActivities);
    
    // Use demo achievements for richer display
    const allAchievements = generateDemoAchievements();

    return NextResponse.json({
      success: true,
      data: {
        address,
        achievements: allAchievements,
        detectedAchievements,
        totalPoints: allAchievements.reduce((sum, ach) => sum + ach.points, 0),
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error fetching achievements:', error);
    return NextResponse.json(
      { error: 'Failed to fetch achievements' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/achievements/mint
 * Mint a new achievement NFT on Push Chain
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { address, achievementId } = body;

    if (!address || !achievementId) {
      return NextResponse.json(
        { error: 'Address and achievementId are required' },
        { status: 400 }
      );
    }

    // In production, this would:
    // 1. Verify the achievement is valid
    // 2. Call the AchievementNFT smart contract on Push Chain
    // 3. Mint the NFT and update the reputation registry
    
    // For demo, return success
    return NextResponse.json({
      success: true,
      data: {
        address,
        achievementId,
        txHash: '0x' + Math.random().toString(16).substring(2, 66),
        minted: true,
        timestamp: Date.now(),
      },
    });
  } catch (error) {
    console.error('Error minting achievement:', error);
    return NextResponse.json(
      { error: 'Failed to mint achievement NFT' },
      { status: 500 }
    );
  }
}

