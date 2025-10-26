import { NextRequest, NextResponse } from 'next/server'

// Twitter to Wallet Mapping Database
// Updated: Fix score to 742 for lawliet1818
const twitterToWallet: Record<string, { walletAddress: string; registeredAt: number }> = {
  // Example entries - replace with real data from your database
  'elonmusk': { 
    walletAddress: '0x238cF35243812cEb8b56ecd2e055A4499222e788', 
    registeredAt: Date.now() 
  },
  'vitalikbuterin': {
    walletAddress: '0x1234567890123456789012345678901234567890',
    registeredAt: Date.now()
  },
  'lawliet1818': {
    walletAddress: '0xBc3D4d4467fC3ffD2d3Dff619F09E821cA58BC60',
    registeredAt: Date.now()
  }
}

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const handle = searchParams.get('handle')?.toLowerCase().replace('@', '')

  if (!handle) {
    return NextResponse.json(
      { error: 'Twitter handle required' }, 
      { 
        status: 400,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    )
  }

  // Check if Twitter handle is registered
  const userMapping = twitterToWallet[handle]

  // CORS headers for all responses
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  if (!userMapping) {
    // User not registered
    return NextResponse.json({
      handle,
      registered: false,
      score: 0,
      tier: 'Unregistered',
      walletAddress: null
    }, { headers })
  }

  // User is registered - return their reputation score
  const walletAddress = userMapping.walletAddress
  
  // Custom scores for each user
  let displayScore = 750
  if (handle === 'lawliet1818') {
    displayScore = 742
  } else if (handle === 'elonmusk') {
    displayScore = 750
  }
  
  const displayTier = getTier(displayScore)
  
  console.log(`Returning score ${displayScore} for ${handle}`)
  
  return NextResponse.json({
    handle,
    registered: true,
    score: displayScore,
    tier: displayTier,
    walletAddress,
    registeredAt: userMapping.registeredAt
  }, { headers })
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    }
  })
}

// POST endpoint to register Twitter handle
export async function POST(request: NextRequest) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  }

  try {
    const body = await request.json()
    const { handle, walletAddress, signature } = body

    if (!handle || !walletAddress) {
      return NextResponse.json({ error: 'Handle and wallet required' }, { status: 400, headers })
    }

    // TODO: Verify signature to prove wallet ownership
    // TODO: Verify Twitter account ownership (OAuth or tweet verification)

    // For now, just store the mapping
    const cleanHandle = handle.toLowerCase().replace('@', '')
    twitterToWallet[cleanHandle] = {
      walletAddress,
      registeredAt: Date.now()
    }

    return NextResponse.json({ 
      success: true, 
      message: 'Twitter handle linked to wallet',
      handle: cleanHandle
    }, { headers })

  } catch (error) {
    console.error('Error registering Twitter handle:', error)
    return NextResponse.json({ error: 'Registration failed' }, { 
      status: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    })
  }
}

function getTier(score: number): string {
  if (score >= 1000) return 'Diamond'
  if (score >= 800) return 'Platinum'
  if (score >= 600) return 'Gold'
  if (score >= 400) return 'Silver'
  if (score >= 200) return 'Bronze'
  return 'Unregistered'
}

