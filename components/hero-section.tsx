"use client"

import { Button } from "@/components/ui/button"
import { Play, Wallet } from "lucide-react"
import { useWallet } from "@/contexts/WalletContext"
import { startXOAuth } from "@/lib/x-oauth"

export default function HeroSection() {
  const { isConnected, connect, isLoading, isTwitterConnected } = useWallet()

  return (
    <section className="relative py-20 px-4 overflow-hidden">
      {/* Background gradient orbs */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-purple-500/20 rounded-full blur-3xl -z-10"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-blue-500/20 rounded-full blur-3xl -z-10"></div>

      <div className="container mx-auto text-center max-w-3xl">
        {/* Logo */}
        <div className="flex justify-center mb-8">
          <img 
            src="/logo.png" 
            alt="UARS Logo" 
            className="w-24 h-24 object-contain"
          />
        </div>

        <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 text-balance">
          Your Web3 Reputation,{" "}
          <span className="bg-gradient-to-r from-purple-400 via-pink-400 to-blue-400 bg-clip-text text-transparent">
            Everywhere
          </span>
        </h1>

        <p className="text-xl text-gray-400 mb-8 text-balance">
          Build credibility across all chains with Universal Achievement System powered by Push Chain
        </p>

        <div className="flex flex-col items-center gap-4">
          <div className="flex flex-col sm:flex-row gap-4 justify-center w-full max-w-md">
            {!isConnected ? (
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0 flex-1"
                onClick={connect}
                disabled={isLoading}
              >
                <Wallet className="w-4 h-4" />
                {isLoading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            ) : (
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 text-white border-0 flex-1"
                disabled
              >
                ✓ Wallet Connected
              </Button>
            )}
            
            {!isTwitterConnected ? (
              <Button 
                size="lg" 
                variant="outline" 
                className="gap-2 border-blue-400/30 hover:bg-blue-500/10 bg-transparent text-blue-400 flex-1"
                onClick={() => startXOAuth()}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                Connect X
              </Button>
            ) : (
              <Button
                size="lg"
                className="gap-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-white border-0 flex-1"
                disabled
              >
                ✓ X Connected
              </Button>
            )}
          </div>
          
          <Button size="lg" variant="outline" className="gap-2 border-white/20 hover:bg-white/10 bg-transparent">
            <Play className="w-4 h-4" />
            View Demo
          </Button>
        </div>
      </div>
    </section>
  )
}
