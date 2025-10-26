"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useWallet } from "@/contexts/WalletContext"
import { useToast } from "@/hooks/use-toast"
import { Coins, Loader2, ArrowDown, ExternalLink } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default function BorrowForm() {
  const { address, reputation } = useWallet()
  const { toast } = useToast()
  const [borrowAmount, setBorrowAmount] = useState("0.05")
  const [isLoading, setIsLoading] = useState(false)
  const [txHash, setTxHash] = useState("")
  const [contractBalance, setContractBalance] = useState("0")

  // Fetch contract liquidity
  const fetchLiquidity = async () => {
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) return

      const balance = await ethereum.request({
        method: 'eth_getBalance',
        params: [process.env.NEXT_PUBLIC_LENDING_ADDRESS, 'latest']
      })

      const balanceInPC = (parseInt(balance, 16) / 1e18).toFixed(3)
      setContractBalance(balanceInPC)
    } catch (error) {
      console.error("Error fetching liquidity:", error)
    }
  }

  useEffect(() => {
    fetchLiquidity()
    const interval = setInterval(fetchLiquidity, 10000)
    return () => clearInterval(interval)
  }, [])

  // Calculate required collateral based on tier
  const getCollateralRatio = (tier: string) => {
    switch (tier) {
      case 'diamond': return 1.10
      case 'platinum': return 1.20
      case 'gold': return 1.20
      case 'silver': return 1.40
      default: return 1.50
    }
  }

  // Calculate interest rate based on tier
  const getInterestRate = (tier: string) => {
    switch (tier) {
      case 'diamond': return 2.5
      case 'platinum': return 4.5
      case 'gold': return 5.0
      case 'silver': return 7.0
      default: return 8.0
    }
  }

  const collateralRatio = reputation ? getCollateralRatio(reputation.tier) : 1.50
  const interestRate = reputation ? getInterestRate(reputation.tier) : 8.0
  const requiredCollateral = (parseFloat(borrowAmount || "0") * collateralRatio).toFixed(4)
  const maxBorrow = (parseFloat(contractBalance) * 0.8).toFixed(3) // 80% of available liquidity

  const handleBorrow = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) throw new Error("MetaMask not found")

      // Prepare transaction
      const borrowWei = Math.floor(parseFloat(borrowAmount) * 1e18).toString(16)
      const collateralWei = Math.floor(parseFloat(requiredCollateral) * 1e18).toString(16)

      // Function selector for borrow(uint256)
      const functionSelector = "0xc5ebeaec"
      const paddedAmount = borrowWei.padStart(64, "0")
      const data = functionSelector + paddedAmount

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: process.env.NEXT_PUBLIC_LENDING_ADDRESS,
          value: `0x${collateralWei}`,
          data: data,
        }],
      })

      setTxHash(txHash)
      
      toast({
        title: "Borrow Request Sent!",
        description: "Transaction is being processed...",
      })

      // Wait for confirmation
      await waitForTransaction(ethereum, txHash)
      
      toast({
        title: "Loan Approved! 🎉",
        description: `Borrowed ${borrowAmount} PC with ${requiredCollateral} PC collateral. +50 reputation points earned!`,
      })

      // Refresh liquidity
      setTimeout(fetchLiquidity, 2000)

    } catch (error: any) {
      console.error("Borrow error:", error)
      toast({
        title: "Transaction Failed",
        description: error.message || "Please try again",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const waitForTransaction = async (ethereum: any, txHash: string) => {
    let attempts = 0
    while (attempts < 30) {
      try {
        const receipt = await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        })
        if (receipt) return receipt
      } catch (e) {}
      await new Promise(resolve => setTimeout(resolve, 2000))
      attempts++
    }
  }

  return (
    <Card className="bg-white/5 backdrop-blur-md border-white/10">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-green-400" />
              Borrow Funds
            </CardTitle>
            <CardDescription className="text-gray-400">
              Borrow with your reputation-based rates
            </CardDescription>
          </div>
          <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
            +50 Points
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Borrow Amount Input */}
        <div className="space-y-2">
          <Label className="text-gray-300">Borrow Amount</Label>
          <div className="relative">
            <Input
              type="number"
              step="0.01"
              value={borrowAmount}
              onChange={(e) => setBorrowAmount(e.target.value)}
              className="bg-white/10 border-white/20 text-white text-lg h-14 pr-16"
              placeholder="0.00"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
              PC
            </div>
          </div>
          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Available Liquidity: {contractBalance} PC</span>
            <button 
              onClick={() => setBorrowAmount(maxBorrow)}
              className="text-purple-400 hover:text-purple-300"
            >
              Max: {maxBorrow} PC
            </button>
          </div>
        </div>

        {/* Arrow Down */}
        <div className="flex justify-center">
          <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
            <ArrowDown className="w-5 h-5 text-gray-400" />
          </div>
        </div>

        {/* Required Collateral */}
        <div className="space-y-2">
          <Label className="text-gray-300">Required Collateral</Label>
          <div className="relative">
            <Input
              type="text"
              value={requiredCollateral}
              readOnly
              className="bg-purple-500/10 border-purple-500/30 text-white text-lg h-14 pr-16 cursor-not-allowed"
            />
            <div className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 font-semibold">
              PC
            </div>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">
              Collateral Ratio: {(collateralRatio * 100).toFixed(0)}%
            </span>
            <span className="text-green-400">
              ✅ {reputation?.tier.toUpperCase() || 'BASIC'} Tier Rate
            </span>
          </div>
        </div>

        {/* Loan Terms Summary */}
        <div className="p-4 rounded-lg bg-white/5 border border-white/10 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Interest Rate (APY)</span>
            <span className="text-white font-semibold">{interestRate}%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Market Average</span>
            <span className="text-gray-500 line-through">8.5%</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">You Save</span>
            <span className="text-green-400 font-semibold">
              {((8.5 - interestRate) / 8.5 * 100).toFixed(0)}% vs market
            </span>
          </div>
          <div className="h-px bg-white/10 my-2" />
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Health Factor</span>
            <span className="text-green-400 font-semibold">
              {(collateralRatio).toFixed(2)} (Safe ✅)
            </span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-400">Reputation Bonus</span>
            <span className="text-purple-400 font-semibold">+50 Points</span>
          </div>
        </div>

        {/* Borrow Button */}
        <Button
          onClick={handleBorrow}
          disabled={isLoading || !borrowAmount || parseFloat(borrowAmount) <= 0 || parseFloat(borrowAmount) > parseFloat(maxBorrow)}
          className="w-full h-12 text-lg gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
        >
          {isLoading ? (
            <>
              <Loader2 className="w-5 h-5 animate-spin" />
              Processing...
            </>
          ) : (
            <>
              <Coins className="w-5 h-5" />
              Borrow {borrowAmount} PC
            </>
          )}
        </Button>

        {/* Transaction Link */}
        {txHash && (
          <a
            href={`https://donut.push.network/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 text-sm text-purple-400 hover:text-purple-300"
          >
            View Transaction <ExternalLink className="w-4 h-4" />
          </a>
        )}

        {/* Help Text */}
        <p className="text-xs text-center text-gray-500">
          Your collateral will be returned when you repay the loan
        </p>
      </CardContent>
    </Card>
  )
}
