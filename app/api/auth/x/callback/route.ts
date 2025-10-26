import { NextRequest, NextResponse } from 'next/server';

const X_CLIENT_ID = process.env.NEXT_PUBLIC_X_CLIENT_ID || '';
const X_CLIENT_SECRET = process.env.X_CLIENT_SECRET || '';
const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/x/callback';

// Client-side PKCE callback handler
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const code = searchParams.get('code');
    const state = searchParams.get('state');

    console.log('📥 X OAuth callback received');
    console.log('📋 Code:', code ? 'Present' : 'Missing');
    console.log('📋 State:', state ? 'Present' : 'Missing');

    if (!code) {
      throw new Error('No authorization code received');
    }

    // Note: In client-side PKCE, we need to get code_verifier from the client
    // This will be handled by the frontend sending it to us
    
    // For now, return HTML that will handle the token exchange on the client side
    const html = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>X Authentication</title>
          <style>
            body {
              font-family: system-ui, -apple-system, sans-serif;
              display: flex;
              align-items: center;
              justify-content: center;
              min-height: 100vh;
              margin: 0;
              background: linear-gradient(135deg, #000 0%, #333 100%);
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
            <p>Processing your X account...</p>
            <div class="loader"></div>
          </div>
          <script>
            (async () => {
            // Embed server-provided params for client script
            const stateFromServer = ${JSON.stringify(state)};
            const codeFromServer = ${JSON.stringify(code)};

            // Get the code_verifier from sessionStorage
            const codeVerifier = sessionStorage.getItem('x_code_verifier');
            const savedState = sessionStorage.getItem('x_oauth_state');
            
            if (!codeVerifier) {
              console.error('❌ Code verifier not found in sessionStorage');
              document.body.innerHTML = '<div class="container"><h1>Error</h1><p>Code verifier not found. Please try again.</p></div>';
              return;
            }
            
            // Verify state
            if (stateFromServer !== savedState) {
              console.error('❌ State mismatch');
              document.body.innerHTML = '<div class="container"><h1>Error</h1><p>State mismatch. Please try again.</p></div>';
              return;
            }
            
            console.log('🔄 Exchanging code for access token...');
            
            // Exchange code for access token
            // Add a timeout so we don't hang forever if something is wrong
            const abortController = new AbortController();
            const timeoutId = setTimeout(() => abortController.abort(), 8000);

            fetch('/api/auth/x/token', {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                code: codeFromServer,
                code_verifier: codeVerifier,
                state: stateFromServer
              }),
              signal: abortController.signal
            })
            .then(response => response.json())
            .then(data => {
              clearTimeout(timeoutId);
              if (data.success) {
                console.log('✅ Token exchange successful');
                
                // Store profile in localStorage
                localStorage.setItem('uars_twitter_profile', JSON.stringify(data.profile));
                
                // Clean up sessionStorage
                sessionStorage.removeItem('x_code_verifier');
                sessionStorage.removeItem('x_oauth_state');
                
                // Redirect back to home page
                setTimeout(() => {
                  window.location.href = '/';
                }, 1000);
              } else {
                console.error('❌ Token exchange failed:', data.error);
                document.body.innerHTML = '<div class="container"><h1>Error</h1><p>' + data.error + '</p></div>';
              }
            })
            .catch(error => {
              clearTimeout(timeoutId);
              console.error('❌ Token exchange error:', error);
              document.body.innerHTML = '<div class="container"><h1>Error</h1><p>Failed to authenticate. Please try again.</p></div>';
            });
            })();
          </script>
        </body>
      </html>
    `;

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
      },
    });
  } catch (error) {
    console.error('❌ X OAuth callback error:', error);
    
    const errorHtml = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Authentication Error</title>
        </head>
        <body>
          <h2>Authentication Failed</h2>
          <p>${error instanceof Error ? error.message : 'Unknown error'}</p>
          <button onclick="window.location.href='/'">Go Back</button>
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

