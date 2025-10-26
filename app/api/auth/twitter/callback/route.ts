import { NextRequest, NextResponse } from 'next/server';

const TWITTER_CLIENT_ID = process.env.TWITTER_CLIENT_ID || '';
const REDIRECT_URI = 'http://localhost:3000/api/auth/twitter/callback';

// Step 2: Handle callback and exchange code for access token
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('📥 Callback received. Code:', code ? 'present' : 'missing');

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Verify state for CSRF protection
    const savedState = request.cookies.get('twitter_state')?.value;
    if (!state || state !== savedState) {
      console.error('❌ State mismatch:', { received: state, saved: savedState });
      throw new Error('Invalid state parameter - possible CSRF attack');
    }

    // Get code verifier from cookie
    const codeVerifier = request.cookies.get('twitter_code_verifier')?.value;
    if (!codeVerifier) {
      console.error('❌ Code verifier not found in cookies');
      throw new Error('Code verifier not found');
    }

    console.log('🔄 Exchanging code for access token...');
    console.log('📋 Using code_verifier from cookie');

    // Step 3: Exchange authorization code for access token
    // POST to https://api.twitter.com/2/oauth2/token
    const tokenParams = new URLSearchParams({
      grant_type: 'authorization_code',
      code: code,
      client_id: TWITTER_CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      code_verifier: codeVerifier,
    });

    console.log('📤 Token request params:', {
      grant_type: 'authorization_code',
      client_id: TWITTER_CLIENT_ID ? 'Present' : '❌ MISSING',
      redirect_uri: REDIRECT_URI,
      code_verifier: 'Present',
    });

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
      throw new Error(`Failed to exchange code for token: ${errorData}`);
    }

    const tokenData = await tokenResponse.json();
    const accessToken = tokenData.access_token;

    console.log('✅ Access token received');
    console.log('📡 Fetching user profile...');

    // Step 4: Fetch user profile using access token
    // GET https://api.twitter.com/2/users/me
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
      throw new Error('Failed to fetch user profile');
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
    };

    // Store profile in localStorage via HTML page
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Twitter Authentication</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              color: white;
            }
            .container {
              text-align: center;
              padding: 2rem;
            }
            .checkmark {
              font-size: 4rem;
              margin-bottom: 1rem;
            }
            h1 {
              font-size: 1.5rem;
              margin-bottom: 0.5rem;
            }
            p {
              opacity: 0.9;
              margin-bottom: 1.5rem;
            }
            .loader {
              display: inline-block;
              width: 20px;
              height: 20px;
              border: 3px solid rgba(255,255,255,0.3);
              border-radius: 50%;
              border-top-color: white;
              animation: spin 1s ease-in-out infinite;
            }
            @keyframes spin {
              to { transform: rotate(360deg); }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="checkmark">✓</div>
            <h1>Successfully Connected!</h1>
            <p>Redirecting you back to UARS...</p>
            <div class="loader"></div>
          </div>
          <script>
            // Store profile in localStorage
            localStorage.setItem('uars_twitter_profile', JSON.stringify(${JSON.stringify(profile)}));
            
            // Redirect back to home page after 1 second
            setTimeout(() => {
              window.location.href = '/';
            }, 1000);
          </script>
        </body>
      </html>
    `;

    const response = new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });

    // Clear cookies
    response.cookies.delete('twitter_code_verifier');
    response.cookies.delete('twitter_state');

    return response;
  } catch (error) {
    console.error('Twitter callback error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <h2>Authentication Failed</h2>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="window.close()">Close</button>
        </body>
      </html>
    `;

    return new NextResponse(errorHtml, {
      status: 500,
      headers: {
        'Content-Type': 'text/html',
      },
    });
  }
}

