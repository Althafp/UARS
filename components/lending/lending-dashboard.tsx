"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { TrendingUp, Wallet, Shield, RefreshCw } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"

export default function LendingDashboard() {
  const { address, reputation } = useWallet()
  const [totalBorrowed, setTotalBorrowed] = useState("0.000")
  const [totalCollateral, setTotalCollateral] = useState("0.000")
  const [activeLoans, setActiveLoans] = useState(0)
  const [healthFactor, setHealthFactor] = useState("--")
  const [isLoading, setIsLoading] = useState(false)

  const fetchLoanData = async () => {
    if (!address) return
    
    setIsLoading(true)
    console.log("Fetching position for:", address)
    console.log("Contract:", process.env.NEXT_PUBLIC_LENDING_ADDRESS)
    
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) return

      // Get user loan indices
      const getUserLoansSelector = '0x02bf321f'
      const paddedAddress = address.slice(2).padStart(64, '0')
      
      const loanIndicesData = await ethereum.request({
        method: 'eth_call',
        params: [{
          to: process.env.NEXT_PUBLIC_LENDING_ADDRESS,
          data: getUserLoansSelector + paddedAddress
        }, 'latest']
      })

      console.log("Position - Loan indices data:", loanIndicesData)

      if (loanIndicesData && loanIndicesData !== '0x' && loanIndicesData.length > 66) {
        const arrayLength = parseInt(loanIndicesData.slice(66, 130), 16)
        
        console.log("Position - Total loans:", arrayLength)

        if (arrayLength > 0) {
          let borrowed = 0
          let collateral = 0
          let active = 0

          for (let i = 0; i < Math.min(arrayLength, 20); i++) {
            const loanIndexHex = loanIndicesData.slice(130 + (i * 64), 130 + ((i + 1) * 64))
            const loanIndexNum = parseInt(loanIndexHex, 16)
            
            const getLoanSelector = '0x504006ca'
            const paddedLoanIndex = loanIndexNum.toString(16).padStart(64, '0')
            
            const loanData = await ethereum.request({
              method: 'eth_call',
              params: [{
                to: process.env.NEXT_PUBLIC_LENDING_ADDRESS,
                data: getLoanSelector + paddedLoanIndex
              }, 'latest']
            })

            if (loanData && loanData !== '0x' && loanData.length > 66) {
              const amount = parseInt(loanData.slice(66, 130), 16) / 1e18
              const coll = parseInt(loanData.slice(130, 194), 16) / 1e18
              const repaid = parseInt(loanData.slice(322, 386), 16) === 1

              console.log(`Position - Loan ${loanIndexNum}:`, { amount, coll, repaid })

              if (!repaid) {
                borrowed += amount
                collateral += coll
                active++
              }
            }
          }

          console.log("Position summary:", { borrowed, collateral, active })

          setTotalBorrowed(borrowed.toFixed(3))
          setTotalCollateral(collateral.toFixed(3))
          setActiveLoans(active)
          
          if (borrowed > 0) {
            const hf = (collateral / borrowed).toFixed(2)
            setHealthFactor(hf)
          } else {
            setHealthFactor("--")
          }
        } else {
          // Reset to zero
          setTotalBorrowed("0.000")
          setTotalCollateral("0.000")
          setActiveLoans(0)
          setHealthFactor("--")
        }
      } else {
        // Reset to zero
        setTotalBorrowed("0.000")
        setTotalCollateral("0.000")
        setActiveLoans(0)
        setHealthFactor("--")
      }
    } catch (error) {
      console.error("Error fetching position:", error)
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (address) {
      console.log("Address connected, fetching position...")
      fetchLoanData()
      const interval = setInterval(fetchLoanData, 10000) // Refresh every 10s
      return () => clearInterval(interval)
    }
  }, [address])

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-white text-lg">Your Position</CardTitle>
          <button
            onClick={fetchLoanData}
            disabled={isLoading}
            className="p-2 rounded-lg hover:bg-white/10 transition-colors"
            title="Refresh position"
          >
            <RefreshCw className={`w-4 h-4 text-gray-400 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Total Borrowed */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Wallet className="w-4 h-4 text-purple-400" />
            <span className="text-xs text-gray-400">Total Borrowed</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalBorrowed} PC</div>
          <div className="text-xs text-gray-500 mt-1">
            {parseFloat(totalBorrowed) > 0 ? `From ${activeLoans} active loan${activeLoans !== 1 ? 's' : ''}` : 'No active loans'}
          </div>
        </div>

        {/* Collateral */}
        <div className="p-4 rounded-lg bg-gradient-to-br from-green-500/10 to-emerald-500/10 border border-green-500/30">
          <div className="flex items-center gap-2 mb-2">
            <Shield className="w-4 h-4 text-green-400" />
            <span className="text-xs text-gray-400">Total Collateral</span>
          </div>
          <div className="text-2xl font-bold text-white">{totalCollateral} PC</div>
          <div className="text-xs text-gray-500 mt-1">
            {parseFloat(totalCollateral) > 0 ? 'Locked as collateral' : 'No collateral locked'}
          </div>
        </div>

        {/* Health Factor */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10">
          <div className="flex items-center gap-2 mb-2">
            <TrendingUp className="w-4 h-4 text-blue-400" />
            <span className="text-xs text-gray-400">Health Factor</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-2xl font-bold text-white">{healthFactor}</div>
            {parseFloat(healthFactor) >= 1.2 && (
              <Badge className="bg-green-500/20 text-green-300 border-green-500/30 text-xs">
                Safe
              </Badge>
            )}
            {parseFloat(healthFactor) < 1.2 && parseFloat(healthFactor) >= 1.0 && (
              <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30 text-xs">
                Warning
              </Badge>
            )}
            {parseFloat(healthFactor) < 1.0 && parseFloat(healthFactor) > 0 && (
              <Badge className="bg-red-500/20 text-red-300 border-red-500/30 text-xs">
                Risk
              </Badge>
            )}
          </div>
          <div className="text-xs text-gray-500 mt-1">
            {parseFloat(totalBorrowed) > 0 ? 'Collateral / Borrowed ratio' : 'No active loans'}
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 gap-3">
          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-xs text-gray-400 mb-1">Active Loans</div>
            <div className="text-lg font-bold text-white">{activeLoans}</div>
          </div>
          <div className="p-3 rounded-lg bg-white/5">
            <div className="text-xs text-gray-400 mb-1">Your Tier</div>
            <div className="text-lg font-bold text-purple-400">
              {reputation?.tier.toUpperCase() || 'BRONZE'}
            </div>
          </div>
        </div>

        {/* Tip */}
        {parseFloat(totalBorrowed) > 0 && (
          <div className="p-3 rounded-lg bg-gradient-to-r from-green-500/5 to-blue-500/5 border border-green-500/20">
            <div className="text-xs text-gray-400 mb-1">💡 Active Position</div>
            <div className="text-xs text-gray-300">
              You have {activeLoans} active loan{activeLoans !== 1 ? 's' : ''}. Scroll down to repay and earn +100 points per loan!
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

