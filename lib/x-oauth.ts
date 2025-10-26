"use client"

// Shared X (Twitter) OAuth starter using client-side PKCE (S256)

function base64UrlEncode(buffer: ArrayBuffer): string {
  const bytes = new Uint8Array(buffer)
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=/g, '')
}

function generateRandomString(length: number): string {
  const array = new Uint8Array(length)
  crypto.getRandomValues(array)
  return btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=/g, '')
    .substring(0, length)
}

async function generatePKCE() {
  const codeVerifier = generateRandomString(128)
  const encoder = new TextEncoder()
  const digest = await crypto.subtle.digest('SHA-256', encoder.encode(codeVerifier))
  const codeChallenge = base64UrlEncode(digest)
  return { codeVerifier, codeChallenge }
}

export async function startXOAuth(): Promise<void> {
  const CLIENT_ID = process.env.NEXT_PUBLIC_X_CLIENT_ID || ''
  const REDIRECT_URI = process.env.NEXT_PUBLIC_REDIRECT_URI || 'http://localhost:3000/api/auth/x/callback'
  const SCOPE = 'users.read tweet.read'

  if (!CLIENT_ID) {
    alert('X Client ID missing. Add NEXT_PUBLIC_X_CLIENT_ID to .env.local')
    return
  }

  const { codeVerifier, codeChallenge } = await generatePKCE()
  sessionStorage.setItem('x_code_verifier', codeVerifier)
  const state = generateRandomString(16)
  sessionStorage.setItem('x_oauth_state', state)

  const authUrl = new URL('https://x.com/i/oauth2/authorize')
  authUrl.searchParams.append('response_type', 'code')
  authUrl.searchParams.append('client_id', CLIENT_ID)
  authUrl.searchParams.append('redirect_uri', REDIRECT_URI)
  authUrl.searchParams.append('scope', SCOPE)
  authUrl.searchParams.append('state', state)
  authUrl.searchParams.append('code_challenge', codeChallenge)
  authUrl.searchParams.append('code_challenge_method', 'S256')

  window.location.href = authUrl.toString()
}




