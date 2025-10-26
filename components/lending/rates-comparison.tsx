"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useWallet } from "@/contexts/WalletContext"
import { TrendingDown, Building2, AlertCircle } from "lucide-react"

export default function RatesComparison() {
  const { reputation } = useWallet()

  // Market average rates (real DeFi platforms)
  const marketRates = {
    aave: { collateral: 150, interest: 8.5, platform: "Aave" },
    compound: { collateral: 160, interest: 9.2, platform: "Compound" },
    morpho: { collateral: 155, interest: 7.8, platform: "Morpho" },
    average: { collateral: 155, interest: 8.5 }
  }

  // Calculate user rates based on tier
  const getTierBenefits = (tier: string) => {
    switch (tier) {
      case 'diamond':
        return { collateral: 110, interest: 2.5, savings: 50000, discount: 71 }
      case 'platinum':
        return { collateral: 120, interest: 4.5, savings: 35000, discount: 47 }
      case 'gold':
        return { collateral: 120, interest: 5.0, savings: 25000, discount: 41 }
      case 'silver':
        return { collateral: 140, interest: 7.0, savings: 10000, discount: 18 }
      case 'bronze':
        return { collateral: 150, interest: 8.0, savings: 5000, discount: 6 }
      default:
        return { collateral: 150, interest: 8.5, savings: 0, discount: 0 }
    }
  }

  const userBenefits = reputation ? getTierBenefits(reputation.tier) : getTierBenefits('bronze')

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader>
        <CardTitle className="text-white flex items-center gap-2">
          <TrendingDown className="w-5 h-5 text-green-400" />
          Rate Comparison
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Market Rates vs Your Rates */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {/* Market Average */}
          <div className="p-4 rounded-lg bg-white/5 border border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-400">Market Average</span>
              <Badge variant="outline" className="border-gray-500 text-gray-400 text-xs">
                <Building2 className="w-3 h-3 mr-1" />
                Other DeFi
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-500 mb-1">Collateral Required</div>
                <div className="text-2xl font-bold text-gray-300">{marketRates.average.collateral}%</div>
              </div>
              
              <div>
                <div className="text-xs text-gray-500 mb-1">Interest Rate (APY)</div>
                <div className="text-2xl font-bold text-gray-300">{marketRates.average.interest}%</div>
              </div>

              <div>
                <div className="text-xs text-gray-500 mb-1">On $100K Loan/Year</div>
                <div className="text-lg font-semibold text-gray-400">
                  ${(marketRates.average.interest * 1000).toFixed(0)}
                </div>
              </div>
            </div>
          </div>

          {/* Your Rates with UARS */}
          <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-2 border-green-500/50 relative overflow-hidden">
            <div className="absolute top-2 right-2">
              <div className="w-16 h-16 rounded-full bg-green-500/20 animate-pulse" />
            </div>
            
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-green-300 font-semibold">UARS Platform</span>
              <Badge className="bg-gradient-to-r from-yellow-500 to-orange-500 border-0 text-xs">
                {reputation?.tier.toUpperCase() || 'BRONZE'}
              </Badge>
            </div>
            
            <div className="space-y-3">
              <div>
                <div className="text-xs text-gray-400 mb-1">Collateral Required</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-400">
                    {userBenefits.collateral}%
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                    -{marketRates.average.collateral - userBenefits.collateral}%
                  </Badge>
                </div>
              </div>
              
              <div>
                <div className="text-xs text-gray-400 mb-1">Interest Rate (APY)</div>
                <div className="flex items-center gap-2">
                  <div className="text-2xl font-bold text-green-400">
                    {userBenefits.interest}%
                  </div>
                  <Badge variant="outline" className="border-green-500 text-green-400 text-xs">
                    -{userBenefits.discount}% OFF
                  </Badge>
                </div>
              </div>

              <div>
                <div className="text-xs text-gray-400 mb-1">On $100K Loan/Year</div>
                <div className="flex items-center gap-2">
                  <div className="text-lg font-semibold text-green-300">
                    ${(userBenefits.interest * 1000).toFixed(0)}
                  </div>
                  <TrendingDown className="w-4 h-4 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Platform Comparison Table */}
        <div className="mb-4 p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="text-sm font-semibold text-white mb-3">Compare with Leading Platforms:</div>
          <div className="space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{marketRates.aave.platform}</span>
              <span className="text-gray-400">{marketRates.aave.interest}% APY</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{marketRates.compound.platform}</span>
              <span className="text-gray-400">{marketRates.compound.interest}% APY</span>
            </div>
            <div className="flex items-center justify-between text-xs">
              <span className="text-gray-400">{marketRates.morpho.platform}</span>
              <span className="text-gray-400">{marketRates.morpho.interest}% APY</span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex items-center justify-between text-xs">
              <span className="text-green-400 font-semibold">UARS (You)</span>
              <span className="text-green-400 font-semibold">{userBenefits.interest}% APY</span>
            </div>
          </div>
        </div>

        {/* Savings Highlight */}
        <div className="p-4 rounded-lg bg-gradient-to-r from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <div className="flex items-start gap-3">
            <AlertCircle className="w-5 h-5 text-purple-400 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <div className="text-sm font-semibold text-white mb-1">
                💰 You Save: ${((marketRates.average.interest - userBenefits.interest) * 1000).toFixed(0)}/year on $100K
              </div>
              <div className="text-xs text-gray-400">
                {reputation?.tier === 'diamond' && "Diamond tier: Save up to $50K annually vs market rates!"}
                {reputation?.tier === 'platinum' && "Platinum tier: Save up to $35K annually vs market rates!"}
                {reputation?.tier === 'gold' && "Gold tier: Save $3,500 annually vs market average!"}
                {reputation?.tier === 'silver' && "Silver tier: Save $1,500 annually vs market average!"}
                {!reputation && "Build your reputation to unlock massive savings!"}
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
