"use client"

import { useState, useEffect } from "react"
import { Zap, Award, CheckCircle } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { Achievement } from "@/lib/types"

const ACHIEVEMENT_ICONS: Record<string, string> = {
  DEFI_MASTER: "🏦",
  NFT_ROYALTY: "🎨",
  DAO_CONTRIBUTOR: "🗳️",
  YIELD_FARMER: "💰",
  WHALE: "🐋",
  EARLY_ADOPTER: "🚀",
  CROSS_CHAIN_EXPLORER: "🌉",
  GOVERNANCE_EXPERT: "⚖️",
  LIQUIDITY_PROVIDER: "💧",
  DEGEN_TRADER: "🎲",
}

export default function AchievementGallery() {
  const [hoveredId, setHoveredId] = useState<string | null>(null)
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const { address, isConnected } = useWallet()

  useEffect(() => {
    if (isConnected && address) {
      fetch(`/api/achievements?address=${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAchievements(data.data.achievements)
          }
        })
        .catch(err => console.error('Failed to fetch achievements:', err))
    }
  }, [address, isConnected])

  if (!isConnected) {
    return (
      <section className="py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Achievement Gallery</h2>
          <p className="text-gray-400">Connect your wallet to view your achievements</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">Achievement Gallery</h2>
            <p className="text-gray-400">Your cross-chain achievements and milestones</p>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
            <Award className="w-5 h-5 text-yellow-400" />
            <span className="text-white font-semibold">{achievements.length}</span>
            <span className="text-gray-400 text-sm">Earned</span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {achievements.map((achievement) => (
          <div
            key={achievement.id}
            onMouseEnter={() => setHoveredId(achievement.id)}
            onMouseLeave={() => setHoveredId(null)}
            className="relative bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300 cursor-pointer group"
          >
            {achievement.verified && (
              <div className="absolute top-3 right-3">
                <CheckCircle className="w-5 h-5 text-green-400" />
              </div>
            )}
            
            <div className="flex items-start justify-between mb-4">
              <div className="text-4xl">{ACHIEVEMENT_ICONS[achievement.type] || "🏆"}</div>
              <span className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30">
                {achievement.chain}
              </span>
            </div>

            <h3 className="text-lg font-semibold text-white mb-2">{achievement.name}</h3>
            <p className="text-sm text-gray-400 mb-4 line-clamp-2">{achievement.description}</p>

            <div className="flex items-center justify-between">
              <span className="text-xs text-gray-500">
                {new Date(achievement.timestamp).toLocaleDateString()}
              </span>
              <div className="flex items-center gap-1 text-yellow-400 font-semibold">
                <Zap className="w-4 h-4" />
                {achievement.points}
              </div>
            </div>

            {hoveredId === achievement.id && (
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-purple-500/10 to-blue-500/10 pointer-events-none"></div>
            )}
          </div>
        ))}
      </div>
    </section>
  )
}
