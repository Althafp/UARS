"use client"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useWallet } from "@/contexts/WalletContext"
import { Coins, Trophy, ArrowRight, Zap } from "lucide-react"
import { Badge } from "@/components/ui/badge"

const CONTRACTS = {
  lending: process.env.NEXT_PUBLIC_LENDING_ADDRESS,
  marketplace: process.env.NEXT_PUBLIC_MARKETPLACE_ADDRESS,
  tournament: process.env.NEXT_PUBLIC_TOURNAMENT_ADDRESS,
}

export default function OnChainActions() {
  const router = useRouter()
  const { isConnected } = useWallet()

  if (!isConnected) {
    return (
      <section className="py-16">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">On-Chain Actions</h2>
          <p className="text-gray-400 mb-8">Connect your wallet to interact with UARS protocols</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">
            <Zap className="w-8 h-8 inline-block mr-2 text-yellow-400" />
            On-Chain Actions
          </h2>
          <p className="text-gray-400">
            Interact with live smart contracts on Push Chain
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* DeFi Lending */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-green-500/50 transition-all group">
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Coins className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">DeFi Lending</CardTitle>
              <CardDescription className="text-gray-400">
                Borrow funds with reputation-based rates
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Your Rate</span>
                  <span className="text-green-400 font-semibold">5.0% APY</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Market Rate</span>
                  <span className="text-gray-500 line-through">8.5% APY</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">You Save</span>
                  <span className="text-green-400 font-semibold">41% vs market</span>
                </div>
              </div>

              <Badge className="w-full justify-center bg-green-500/20 text-green-300 border-green-500/30">
                +50 Points per Borrow
              </Badge>

              <Button
                onClick={() => router.push('/lending')}
                className="w-full gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 h-12"
              >
                Open Lending Platform
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Claim Achievements */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-purple-500/50 transition-all group">
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Claim Achievements</CardTitle>
              <CardDescription className="text-gray-400">
                Mint real achievement NFTs based on activity
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">DeFi Master</span>
                  <span className="text-purple-400 font-semibold">+300 pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Volume Trader</span>
                  <span className="text-purple-400 font-semibold">+150 pts</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Perfect Record</span>
                  <span className="text-purple-400 font-semibold">+250 pts</span>
                </div>
              </div>

              <Badge className="w-full justify-center bg-purple-500/20 text-purple-300 border-purple-500/30">
                8 Real NFT Achievements
              </Badge>

              <Button
                onClick={() => router.push('/achievements')}
                className="w-full gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 h-12"
              >
                Claim Achievement NFTs
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>

          {/* Gaming Tournament */}
          <Card className="bg-white/5 backdrop-blur-md border-white/10 hover:border-orange-500/50 transition-all group">
            <CardHeader>
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Trophy className="w-8 h-8 text-white" />
              </div>
              <CardTitle className="text-white">Gaming Tournament</CardTitle>
              <CardDescription className="text-gray-400">
                Join tournaments with reputation bonuses
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Benefits */}
              <div className="space-y-2">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Starting Bonus</span>
                  <span className="text-orange-400 font-semibold">+500 points</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Priority Access</span>
                  <span className="text-orange-400 font-semibold">Gold tier</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">Win Multiplier</span>
                  <span className="text-orange-400 font-semibold">3x rewards</span>
                </div>
              </div>

              <Badge className="w-full justify-center bg-orange-500/20 text-orange-300 border-orange-500/30">
                +30 Points per Join
              </Badge>

              <Button
                onClick={() => router.push('/tournament')}
                className="w-full gap-2 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 h-12"
              >
                Coming Soon
                <ArrowRight className="w-4 h-4" />
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Powered by Push Chain */}
        <div className="text-center mt-8">
          <Badge className="bg-purple-500/20 text-purple-300 border-purple-500/30 px-4 py-2">
            ⚡ Powered by Push Chain Smart Contracts
          </Badge>
        </div>
      </div>
    </section>
  )
}
