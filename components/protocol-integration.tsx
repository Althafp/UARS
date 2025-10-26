"use client"

import { Button } from "@/components/ui/button"
import { CheckCircle2, Clock, Sparkles, TrendingDown, Shield, Trophy, Coins, Link as LinkIcon } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { TIER_CONFIG } from "@/lib/types"
import { useState } from "react"

const PROTOCOLS = [
  { 
    id: 1, 
    name: "Aave V3", 
    category: "DeFi Lending", 
    status: "active", 
    icon: "💰",
    benefits: {
      bronze: { collateral: "150%", rate: "8%" },
      silver: { collateral: "140%", rate: "7%" },
      gold: { collateral: "120%", rate: "5%" },
      platinum: { collateral: "120%", rate: "4.5%" },
      diamond: { collateral: "110%", rate: "2.5%" },
    }
  },
  { 
    id: 2, 
    name: "Uniswap", 
    category: "DEX", 
    status: "active", 
    icon: "🦄",
    benefits: {
      bronze: { fee: "0.30%" },
      silver: { fee: "0.25%" },
      gold: { fee: "0.20%" },
      platinum: { fee: "0.15%" },
      diamond: { fee: "0.10%" },
    }
  },
  { 
    id: 3, 
    name: "OpenSea", 
    category: "NFT Marketplace", 
    status: "active", 
    icon: "🎨",
    benefits: {
      bronze: { fee: "2.5%", priority: "Standard" },
      silver: { fee: "2.0%", priority: "Standard" },
      gold: { fee: "1.5%", priority: "High" },
      platinum: { fee: "1.0%", priority: "VIP" },
      diamond: { fee: "0.5%", priority: "Ultra VIP" },
    }
  },
  { 
    id: 4, 
    name: "Snapshot", 
    category: "DAO Governance", 
    status: "active", 
    icon: "🗳️",
    benefits: {
      bronze: { multiplier: "1x" },
      silver: { multiplier: "2x" },
      gold: { multiplier: "3x" },
      platinum: { multiplier: "5x" },
      diamond: { multiplier: "10x" },
    }
  },
  { 
    id: 5, 
    name: "DAO Maker", 
    category: "IDO Launchpad", 
    status: "active", 
    icon: "🚀",
    benefits: {
      bronze: { allocation: "1x", guaranteed: "$0" },
      silver: { allocation: "3x", guaranteed: "$500" },
      gold: { allocation: "5x", guaranteed: "$2,500" },
      platinum: { allocation: "8x", guaranteed: "$10,000" },
      diamond: { allocation: "10x", guaranteed: "$25,000" },
    }
  },
  { 
    id: 6, 
    name: "Push Protocol", 
    category: "Notifications", 
    status: "active", 
    icon: "🔔",
    benefits: {
      bronze: { channels: "10" },
      silver: { channels: "50" },
      gold: { channels: "100" },
      platinum: { channels: "Unlimited" },
      diamond: { channels: "Unlimited + Priority" },
    }
  },
]

const USE_CASES = [
  {
    id: "defi",
    icon: <Coins className="w-6 h-6" />,
    title: "DeFi Lending",
    description: "Lower collateral & interest rates based on reputation",
    example: "Save $50K annually on loans",
    color: "from-green-500 to-emerald-500"
  },
  {
    id: "nft",
    icon: <Sparkles className="w-6 h-6" />,
    title: "NFT Trading",
    description: "Reduced fees & instant settlement for trusted traders",
    example: "0% escrow fees, VIP access",
    color: "from-purple-500 to-pink-500"
  },
  {
    id: "dao",
    icon: <Trophy className="w-6 h-6" />,
    title: "DAO Governance",
    description: "Reputation-weighted voting power",
    example: "5x-10x voting multiplier",
    color: "from-blue-500 to-cyan-500"
  },
  {
    id: "ido",
    icon: <TrendingDown className="w-6 h-6" />,
    title: "IDO Allocations",
    description: "Guaranteed allocations & higher multipliers",
    example: "$10K guaranteed allocation",
    color: "from-orange-500 to-red-500"
  },
]

export default function ProtocolIntegration() {
  const { reputation, isConnected } = useWallet()
  const [selectedUseCase, setSelectedUseCase] = useState<string | null>(null)
  
  const currentTier = reputation?.tier || 'bronze'

  return (
    <section className="py-12">
      {/* Use Cases Section */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-white mb-2">Real-World Use Cases</h2>
        <p className="text-gray-400 mb-8">See how UARS transforms your Web3 experience across protocols</p>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {USE_CASES.map((useCase) => (
            <div
              key={useCase.id}
              className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all cursor-pointer group"
              onClick={() => setSelectedUseCase(useCase.id)}
            >
              <div className={`w-12 h-12 rounded-lg bg-gradient-to-br ${useCase.color} flex items-center justify-center mb-4 group-hover:scale-110 transition-transform`}>
                {useCase.icon}
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">{useCase.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{useCase.description}</p>
              <div className="flex items-center gap-2 text-xs text-purple-300">
                <Sparkles className="w-3 h-3" />
                {useCase.example}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Protocol Integrations */}
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Protocol Integrations</h2>
        <p className="text-gray-400 mb-8">
          Your <span className="text-purple-400 font-semibold">{TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG].label}</span> tier unlocks these benefits
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {PROTOCOLS.map((protocol) => {
          const tierBenefits = protocol.benefits[currentTier as keyof typeof protocol.benefits]
          
          return (
            <div
              key={protocol.id}
              className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{protocol.icon}</div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{protocol.name}</h3>
                    <p className="text-xs text-gray-400 mt-1">{protocol.category}</p>
                  </div>
                </div>
                {protocol.status === "active" ? (
                  <CheckCircle2 className="w-5 h-5 text-green-400" />
                ) : (
                  <Clock className="w-5 h-5 text-yellow-400" />
                )}
              </div>

              {isConnected && tierBenefits && (
                <div className="mb-4 p-3 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/20">
                  <div className="text-xs text-gray-400 mb-2">Your {TIER_CONFIG[currentTier as keyof typeof TIER_CONFIG].label} Benefits:</div>
                  <div className="space-y-1">
                    {Object.entries(tierBenefits).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between text-sm">
                        <span className="text-gray-300 capitalize">{key}:</span>
                        <span className="text-white font-semibold">{value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Button 
                size="sm" 
                variant={protocol.status === "active" ? "outline" : "default"} 
                className="w-full gap-2"
              >
                <LinkIcon className="w-3 h-3" />
                {protocol.status === "active" ? "View Integration" : "Coming Soon"}
              </Button>
            </div>
          )
        })}
      </div>

      {/* Push Chain Integration Badge */}
      <div className="mt-12 bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-2xl p-8 border border-purple-500/30">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white mb-1">Powered by Push Chain</h3>
              <p className="text-gray-400">Universal reputation protocol with cross-chain verification</p>
            </div>
          </div>
          <Button size="lg" variant="outline" className="gap-2 border-purple-500/50 hover:bg-purple-500/10">
            <LinkIcon className="w-4 h-4" />
            Learn More
          </Button>
        </div>
      </div>
    </section>
  )
}
