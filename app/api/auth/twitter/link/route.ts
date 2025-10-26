import { NextRequest, NextResponse } from 'next/server';

// In-memory storage for demo (in production, use a database)
const twitterWalletLinks = new Map<string, string>();

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, walletAddress } = body;

    if (!username || !walletAddress) {
      return NextResponse.json(
        { error: 'Username and wallet address are required' },
        { status: 400 }
      );
    }

    // Store the link (in production, save to database)
    twitterWalletLinks.set(username.toLowerCase(), walletAddress.toLowerCase());
    
    console.log(`✅ Linked Twitter @${username} to wallet ${walletAddress}`);

    return NextResponse.json({
      success: true,
      message: 'Twitter account linked to wallet',
      data: {
        username,
        walletAddress,
      },
    });
  } catch (error) {
    console.error('Twitter link error:', error);
    return NextResponse.json(
      { error: 'Failed to link Twitter account' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const username = searchParams.get('username');

    if (!username) {
      return NextResponse.json(
        { error: 'Username is required' },
        { status: 400 }
      );
    }

    const walletAddress = twitterWalletLinks.get(username.toLowerCase());

    if (!walletAddress) {
      return NextResponse.json({
        success: false,
        linked: false,
        message: 'No wallet linked to this Twitter account',
      });
    }

    return NextResponse.json({
      success: true,
      linked: true,
      data: {
        username,
        walletAddress,
      },
    });
  } catch (error) {
    console.error('Twitter link lookup error:', error);
    return NextResponse.json(
      { error: 'Failed to lookup Twitter link' },
      { status: 500 }
    );
  }
}



