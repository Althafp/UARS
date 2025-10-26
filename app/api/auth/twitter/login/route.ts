import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

// Twitter OAuth 2.0 configuration
const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const REDIRECT_URI = 'http://localhost:3000/api/auth/twitter/callback';

/**
 * Generate PKCE code verifier and challenge
 * Twitter REQUIRES S256 (SHA-256) hashing, NOT plain
 */
function generatePKCE() {
  // Generate random code_verifier (43-128 characters)
  const codeVerifier = crypto.randomBytes(32).toString('base64url');
  
  // Generate code_challenge using SHA-256
  const codeChallenge = crypto
    .createHash('sha256')
    .update(codeVerifier)
    .digest('base64url');
  
  return { codeVerifier, codeChallenge };
}

// Step 1: Redirect to Twitter's OAuth 2.0 authorization endpoint
export async function GET(request: NextRequest) {
  try {
    // Generate random state for CSRF protection
    const state = crypto.randomBytes(16).toString('hex');
    
    // Generate PKCE codes (REQUIRED by Twitter)
    const { codeVerifier, codeChallenge } = generatePKCE();
    
    // Build authorization URL - CORRECT TWITTER OAUTH 2.0 FORMAT
    const authUrl = new URL('https://twitter.com/i/oauth2/authorize');
    authUrl.searchParams.append('response_type', 'code');
    authUrl.searchParams.append('client_id', TWITTER_CLIENT_ID);
    authUrl.searchParams.append('redirect_uri', REDIRECT_URI);
    authUrl.searchParams.append('scope', 'tweet.read users.read offline.access');
    authUrl.searchParams.append('state', state);
    authUrl.searchParams.append('code_challenge', codeChallenge);
    authUrl.searchParams.append('code_challenge_method', 'S256'); // MUST be S256 for Twitter

    console.log('🔗 Redirecting to Twitter OAuth');
    console.log('📋 Client ID:', TWITTER_CLIENT_ID ? 'Present' : '❌ MISSING');
    console.log('📋 Redirect URI:', REDIRECT_URI);
    console.log('📋 Code Challenge Method: S256');

    // Store state and code_verifier in cookies for verification in callback
    const response = NextResponse.redirect(authUrl.toString());
    
    response.cookies.set('twitter_state', state, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600, // 10 minutes
      sameSite: 'lax',
    });
    
    response.cookies.set('twitter_code_verifier', codeVerifier, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 600,
      sameSite: 'lax',
    });

    return response;
  } catch (error) {
    console.error('❌ Twitter OAuth error:', error);
    return NextResponse.json(
      { error: 'Failed to initiate Twitter OAuth', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

