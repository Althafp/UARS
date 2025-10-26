import { NextRequest, NextResponse } from 'next/server';

const X_CLIENT_ID = process.env.NEXT_PUBLIC_X_CLIENT_ID || '';
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/x/callback';

// Token exchange endpoint for client-side PKCE
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { code, code_verifier, state } = body;

    console.log('🔄 Token exchange request received');
    console.log('📋 Code:', code ? 'Present' : 'Missing');
    console.log('📋 Code Verifier:', code_verifier ? 'Present' : 'Missing');

    if (!code || !code_verifier) {
      return NextResponse.json(
        { success: false, error: 'Missing code or code_verifier' },
        { status: 400 }
      );
    }

    // Exchange code for access token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: X_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: code_verifier,
    });

    console.log('📤 Exchanging code for access token...');

    const tokenResponse = await fetch('https://api.twitter.com/2/oauth2/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: tokenParams.toString(),
    });

    if (!tokenResponse.ok) {
      const errorData = await tokenResponse.text();
      console.error('❌ Token exchange failed:', errorData);
      return NextResponse.json(
        { success: false, error: `Token exchange failed: ${errorData}` },
        { status: 400 }
      );
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('✅ Access token received');
    console.log('📡 Fetching user profile...');

    // Fetch user profile
    const userResponse = await fetch(
      'https://api.twitter.com/2/users/me?user.fields=profile_image_url,name,username,description',
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      }
    );

    if (!userResponse.ok) {
      const errorData = await userResponse.text();
      console.error('❌ Failed to fetch user profile:', errorData);
      return NextResponse.json(
        { success: false, error: 'Failed to fetch user profile' },
        { status: 400 }
      );
    }

    const userData = await userResponse.json();
    const user = userData.data;

    console.log('✅ User profile fetched:', user.username);

    // Create profile object
    const profile = {
      id: user.id,
      username: user.username,
      displayName: user.name,
      profileImage: user.profile_image_url,
      description: user.description,
    };

    return NextResponse.json({
      success: true,
      profile,
      message: 'Successfully connected to X',
    });
  } catch (error) {
    console.error('❌ Token exchange error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      },
      { status: 500 }
    );
  }
}

