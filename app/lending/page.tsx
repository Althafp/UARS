"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useWallet } from "@/contexts/WalletContext"
import { ArrowLeft, TrendingDown, TrendingUp, Coins, Shield, Sparkles, ExternalLink, Trophy } from "lucide-react"
import LendingDashboard from "@/components/lending/lending-dashboard"
import RatesComparison from "@/components/lending/rates-comparison"
import BorrowForm from "@/components/lending/borrow-form"
import RepayForm from "@/components/lending/repay-form"
import BenefitsShowcase from "@/components/lending/benefits-showcase"

export default function LendingPage() {
  const router = useRouter()
  const { address, isConnected, reputation, connect } = useWallet()
  const [showBenefits, setShowBenefits] = useState(false)

  useEffect(() => {
    if (isConnected && reputation) {
      // Animate benefits reveal
      setTimeout(() => setShowBenefits(true), 500)
    }
  }, [isConnected, reputation])

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="mb-8 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center mx-auto mb-8">
              <Coins className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              UARS Lending Platform
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Connect your wallet to access reputation-based lending rates
            </p>
            <Button
              size="lg"
              onClick={connect}
              className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
            >
              <Shield className="w-5 h-5" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <a
            href={`https://donut.push.network/address/${process.env.NEXT_PUBLIC_LENDING_ADDRESS}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
          >
            View Contract <ExternalLink className="w-4 h-4" />
          </a>
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
              <Coins className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              DeFi Lending Platform
            </h1>
          </div>
          <p className="text-xl text-gray-400">
            Better rates through reputation
          </p>
        </div>

        {/* Reputation Benefits Banner */}
        {showBenefits && reputation && (
          <Card className="mb-8 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border-green-500/30 animate-in fade-in slide-in-from-top duration-500">
            <CardContent className="p-6">
              <div className="flex items-center justify-between flex-wrap gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                    <Trophy className="w-8 h-8 text-white" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-white">
                        Your Reputation: {reputation.totalScore}/1000
                      </span>
                      <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
                        {reputation.tier.toUpperCase()} TIER
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-300">
                      Benefits Active: Better rates unlocked! 🎉
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-3xl font-bold text-green-400">
                    {reputation.tier === 'diamond' ? '50%' :
                     reputation.tier === 'platinum' ? '45%' :
                     reputation.tier === 'gold' ? '30%' :
                     reputation.tier === 'silver' ? '15%' : '5%'}
                  </div>
                  <div className="text-sm text-gray-400">Better Rates</div>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Forms */}
          <div className="lg:col-span-2 space-y-6">
            <RatesComparison />
            <BorrowForm />
            <RepayForm />
          </div>

          {/* Right Column - Stats & Benefits */}
          <div className="space-y-6">
            <LendingDashboard />
            <BenefitsShowcase />
          </div>
        </div>

        {/* Bottom CTA */}
        <Card className="mt-12 bg-white/5 backdrop-blur-md border-white/10">
          <CardContent className="p-8 text-center">
            <Sparkles className="w-12 h-12 text-yellow-400 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-2">
              Save Up to $50K Annually
            </h3>
            <p className="text-gray-400 mb-6">
              High reputation users save thousands in interest with better rates
            </p>
            <Button
              onClick={() => router.push('/')}
              variant="outline"
              className="border-white/20 hover:bg-white/10"
            >
              Learn More About UARS
            </Button>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}


