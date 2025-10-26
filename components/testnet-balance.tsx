"use client"

import { useState, useEffect } from "react"
import { Coins, ExternalLink, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/WalletContext"

export default function TestnetBalance() {
  const [balance, setBalance] = useState<string>("0")
  const [isLoading, setIsLoading] = useState(false)
  const { address, isConnected } = useWallet()

  const fetchBalance = async () => {
    if (!address) return
    
    setIsLoading(true)
    try {
      // Check if window.ethereum exists
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        })
        
        // Convert hex to decimal and format
        const balanceWei = parseInt(balanceHex, 16)
        const balanceEth = (balanceWei / 1e18).toFixed(4)
        setBalance(balanceEth)
      } else {
        // Demo fallback
        setBalance("1.2500")
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
      setBalance("0.0000")
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance()
      // Refresh every 10 seconds
      const interval = setInterval(fetchBalance, 10000)
      return () => clearInterval(interval)
    }
  }, [address, isConnected])

  if (!isConnected) return null

  return (
    <div className="fixed top-20 right-6 z-40 bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 shadow-lg min-w-[250px]">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Coins className="w-5 h-5 text-purple-400" />
          <span className="text-sm font-semibold text-white">Testnet Balance</span>
        </div>
        <Button
          size="sm"
          variant="ghost"
          onClick={fetchBalance}
          disabled={isLoading}
          className="h-6 w-6 p-0 hover:bg-white/10"
        >
          <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      <div className="mb-3">
        <div className="text-2xl font-bold text-white font-mono">
          {balance} <span className="text-lg text-gray-400">PC</span>
        </div>
        <div className="text-xs text-gray-400">Push Chain Donut Testnet</div>
      </div>

      <div className="space-y-2">
        <a
          href="https://faucet.push.org/"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 hover:border-purple-500/50 transition-all text-sm text-white"
        >
          <Coins className="w-4 h-4" />
          Get Testnet Tokens
          <ExternalLink className="w-3 h-3" />
        </a>

        <a
          href={`https://donut.push.network/address/${address}`}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center justify-center gap-2 w-full px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-white/20 transition-all text-xs text-gray-400 hover:text-white"
        >
          View on Explorer
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>

      {parseFloat(balance) < 0.01 && (
        <div className="mt-3 p-2 rounded-lg bg-yellow-500/20 border border-yellow-500/30">
          <p className="text-xs text-yellow-300">
            ⚠️ Low balance! Get free tokens from the faucet above.
          </p>
        </div>
      )}
    </div>
  )
}

