import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const address = searchParams.get('address')

  if (!address) {
    return NextResponse.json({ error: 'Address is required' }, { status: 400 })
  }

  try {
    // Fetch reputation from on-chain contract
    const reputationRegistryAddress = process.env.NEXT_PUBLIC_REPUTATION_REGISTRY_ADDRESS
    
    if (!reputationRegistryAddress) {
      return NextResponse.json({ error: 'Reputation contract not configured' }, { status: 500 })
    }

    // Call getUserProfile from ReputationRegistry
    const rpcUrl = process.env.NEXT_PUBLIC_PUSH_CHAIN_RPC || 'https://evm.rpc-testnet-donut-node1.push.org/'
    
    const functionSelector = '0x1e7df9c9' // getUserProfile(address)
    const paddedAddress = address.slice(2).padStart(64, '0')
    const data = functionSelector + paddedAddress

    const response = await fetch(rpcUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        jsonrpc: '2.0',
        id: 1,
        method: 'eth_call',
        params: [{
          to: reputationRegistryAddress,
          data: data
        }, 'latest']
      })
    })

    const result = await response.json()
    
    if (result.result && result.result !== '0x') {
      // Parse the result
      const universalScore = parseInt(result.result.slice(2, 66), 16)
      const tier = parseInt(result.result.slice(66, 130), 16)
      
      // Map tier number to name
      const getTierName = (tierNum: number) => {
        if (tierNum === 0) return 'bronze'
        if (tierNum === 1) return 'bronze'
        if (tierNum === 2) return 'gold'
        if (tierNum === 3) return 'platinum'
        if (tierNum === 4) return 'diamond'
        return 'bronze'
      }

      return NextResponse.json({
        totalScore: universalScore,
        tier: getTierName(tier),
        tierLevel: tier,
        achievements: universalScore > 0 ? Math.floor(universalScore / 50) : 0,
        crossChainActivity: tier >= 2 ? 5 : tier >= 1 ? 3 : 1,
        benefits: {
          collateralRatio: tier === 4 ? 110 : tier === 3 ? 120 : tier === 2 ? 120 : 150,
          interestRate: tier === 4 ? 2.5 : tier === 3 ? 4.5 : tier === 2 ? 5.0 : 8.0
        }
      })
    }

    // Default for new users with no reputation
    return NextResponse.json({
      totalScore: 0,
      tier: 'bronze',
      tierLevel: 0,
      achievements: 0,
      crossChainActivity: 1,
      benefits: {
        collateralRatio: 150,
        interestRate: 8.0
      }
    })

  } catch (error) {
    console.error('Error fetching reputation:', error)
    
    // Return default reputation for new users
    return NextResponse.json({
      totalScore: 0,
      tier: 'bronze',
      tierLevel: 0,
      achievements: 0,
      crossChainActivity: 1,
      benefits: {
        collateralRatio: 150,
        interestRate: 8.0
      }
    })
  }
}
