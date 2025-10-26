"use client"

import { useEffect, useState } from "react"
import { Trophy, TrendingUp, Wallet } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { TIER_CONFIG } from "@/lib/types"
import { Button } from "@/components/ui/button"

export default function ReputationCard() {
  const { isConnected, reputation, connect, isLoading: walletLoading } = useWallet()
  const [score, setScore] = useState(0)
  const targetScore = reputation?.totalScore || 742
  const percentile = reputation?.percentile || 15

  useEffect(() => {
    setScore(0)
    const interval = setInterval(() => {
      setScore((prev) => {
        if (prev < targetScore) {
          return Math.min(prev + 20, targetScore)
        }
        return prev
      })
    }, 30)
    return () => clearInterval(interval)
  }, [targetScore])

  const getTier = (value: number) => {
    for (const [key, config] of Object.entries(TIER_CONFIG)) {
      if (value >= config.min && value <= config.max) {
        return config
      }
    }
    return TIER_CONFIG.diamond
  }

  const currentTier = getTier(score)
  const nextTierMin = Object.values(TIER_CONFIG).find((t) => t.min > score)?.min || 1000
  const progressToNext = ((score - currentTier.min) / (nextTierMin - currentTier.min)) * 100

  if (!isConnected) {
    return (
      <div className="flex justify-center">
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-12 max-w-md w-full border border-white/10 shadow-lg shadow-primary/20 text-center">
          <Wallet className="w-16 h-16 text-purple-400 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-4">Connect Your Wallet</h2>
          <p className="text-gray-400 mb-6">
            Connect your wallet to view your cross-chain reputation score and achievements
          </p>
          <Button
            size="lg"
            className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
            onClick={connect}
            disabled={walletLoading}
          >
            <Wallet className="w-4 h-4" />
            {walletLoading ? 'Connecting...' : 'Connect Wallet'}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-center">
      <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 max-w-md w-full border border-white/10 shadow-lg shadow-primary/20">
        <div className="flex items-center justify-between mb-8">
          <h2 className="text-2xl font-bold text-white">Reputation Score</h2>
          <Trophy className="w-6 h-6 text-yellow-400" />
        </div>

        {/* Circular Progress */}
        <div className="flex justify-center mb-8">
          <div className="relative w-48 h-48">
            <svg className="w-full h-full transform -rotate-90" viewBox="0 0 200 200">
              {/* Background circle */}
              <circle cx="100" cy="100" r="90" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
              {/* Progress circle */}
              <circle
                cx="100"
                cy="100"
                r="90"
                fill="none"
                stroke={currentTier.color}
                strokeWidth="8"
                strokeDasharray={`${(score / 1000) * 565.48} 565.48`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>

            {/* Center content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <div className="text-4xl font-bold text-white font-mono">{score}</div>
              <div className="text-sm text-gray-400">/ 1000</div>
            </div>
          </div>
        </div>

        {/* Tier Info */}
        <div className="text-center mb-6">
          <div
            className="inline-block px-4 py-2 rounded-lg font-semibold mb-2"
            style={{ backgroundColor: currentTier.color + "20", color: currentTier.color }}
          >
            {currentTier.label}
          </div>
          <div className="flex items-center justify-center gap-2 text-gray-400">
            <TrendingUp className="w-4 h-4" />
            <span>Top {percentile}%</span>
          </div>
        </div>

        {/* Progress to next tier */}
        <div className="space-y-2">
          <div className="flex justify-between text-xs text-gray-400">
            <span>Progress to next tier</span>
            <span>{Math.round(progressToNext)}%</span>
          </div>
          <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-purple-500 to-blue-500 transition-all duration-500"
              style={{ width: `${progressToNext}%` }}
            ></div>
          </div>
        </div>
      </div>
    </div>
  )
}
