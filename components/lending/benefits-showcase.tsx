"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Sparkles, TrendingDown, Shield, Zap } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"

export default function BenefitsShowcase() {
  const { reputation } = useWallet()

  const benefits = [
    {
      icon: <TrendingDown className="w-5 h-5" />,
      title: "Lower Interest Rates",
      description: reputation?.tier === 'diamond' ? "2.5% APY (68% off)" :
                   reputation?.tier === 'platinum' ? "4.5% APY (44% off)" :
                   reputation?.tier === 'gold' ? "5.0% APY (38% off)" :
                   reputation?.tier === 'silver' ? "7.0% APY (13% off)" : "8.0% APY",
      color: "from-green-500 to-emerald-500"
    },
    {
      icon: <Shield className="w-5 h-5" />,
      title: "Lower Collateral",
      description: reputation?.tier === 'diamond' ? "110% required" :
                   reputation?.tier === 'platinum' ? "120% required" :
                   reputation?.tier === 'gold' ? "120% required" :
                   reputation?.tier === 'silver' ? "140% required" : "150% required",
      color: "from-blue-500 to-purple-500"
    },
    {
      icon: <Sparkles className="w-5 h-5" />,
      title: "Reputation Points",
      description: "+50 for borrowing, +100 for repaying",
      color: "from-purple-500 to-pink-500"
    },
    {
      icon: <Zap className="w-5 h-5" />,
      title: "Instant Approval",
      description: "No credit checks, instant loan approval",
      color: "from-orange-500 to-red-500"
    }
  ]

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white text-lg flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-yellow-400" />
          Your Benefits
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {benefits.map((benefit, index) => (
          <div
            key={index}
            className="p-3 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all"
          >
            <div className="flex items-start gap-3">
              <div className={`w-10 h-10 rounded-lg bg-gradient-to-br ${benefit.color} flex items-center justify-center flex-shrink-0`}>
                {benefit.icon}
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-sm font-semibold text-white mb-1">
                  {benefit.title}
                </div>
                <div className="text-xs text-gray-400">
                  {benefit.description}
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Tier Badge */}
        <div className="mt-4 p-4 rounded-lg bg-gradient-to-r from-yellow-500/10 to-orange-500/10 border border-yellow-500/30 text-center">
          <div className="text-xs text-gray-400 mb-2">Current Tier</div>
          <Badge className="text-lg px-4 py-1 bg-gradient-to-r from-yellow-500 to-orange-500 border-0">
            {reputation?.tier.toUpperCase() || 'BASIC'}
          </Badge>
          <div className="text-xs text-gray-500 mt-2">
            {reputation?.totalScore || 0}/1000 points
          </div>
        </div>
      </CardContent>
    </Card>
  )
}


