"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Wallet, Link2, Trophy, Coins, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useWallet } from "@/contexts/WalletContext"
import { startXOAuth } from "@/lib/x-oauth"

export default function Header() {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [balance, setBalance] = useState<string>("0")
  const { 
    address, 
    isConnected, 
    reputation, 
    twitterProfile,
    isTwitterConnected,
    connect, 
    disconnect,
    connectTwitter,
    disconnectTwitter,
    isLoading 
  } = useWallet()

  const formatAddress = (addr: string) => {
    return `${addr.slice(0, 6)}...${addr.slice(-4)}`
  }

  // Client-side PKCE generation (following the docs approach)
  const generatePKCEChallenge = async () => {
    // Generate code_verifier (43-128 characters)
    const codeVerifier = generateRandomString(128)
    
    // Generate code_challenge from code_verifier using SHA-256
    const encoder = new TextEncoder()
    const data = encoder.encode(codeVerifier)
    const digest = await crypto.subtle.digest('SHA-256', data)
    const codeChallenge = base64URLEncode(digest)
    
    return { codeVerifier, codeChallenge }
  }

  const generateRandomString = (length: number): string => {
    const array = new Uint8Array(length)
    crypto.getRandomValues(array)
    // Use base64url encoding like the working example
    return btoa(String.fromCharCode(...array))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
      .substring(0, length)
  }

  const base64URLEncode = (buffer: ArrayBuffer): string => {
    const bytes = new Uint8Array(buffer)
    let binary = ''
    bytes.forEach(byte => binary += String.fromCharCode(byte))
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=/g, '')
  }

  const handleConnectWithX = async () => {
    try {
      console.log('🚀 Starting X OAuth...')
      await startXOAuth()
      
    } catch (error) {
      console.error('❌ Error initiating X OAuth:', error)
      alert('Failed to connect with X. Please try again.')
    }
  }

  const fetchBalance = async () => {
    if (!address) return
    
    try {
      if (typeof window !== 'undefined' && (window as any).ethereum) {
        const provider = (window as any).ethereum
        const balanceHex = await provider.request({
          method: 'eth_getBalance',
          params: [address, 'latest']
        })
        const balanceWei = parseInt(balanceHex, 16)
        const balanceEth = (balanceWei / 1e18).toFixed(4)
        setBalance(balanceEth)
      }
    } catch (error) {
      console.error('Failed to fetch balance:', error)
    }
  }

  useEffect(() => {
    if (isConnected && address) {
      fetchBalance()
      const interval = setInterval(fetchBalance, 10000)
      return () => clearInterval(interval)
    }
  }, [address, isConnected])

  return (
    <header className="sticky top-0 z-50 bg-white/5 backdrop-blur-md border-b border-white/10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-3">
          <img 
            src="/logo.png" 
            alt="UARS Logo" 
            className="w-12 h-12 object-contain"
          />
          <div>
            <span className="text-xl font-bold text-white">UARS</span>
            <div className="text-xs text-gray-400">Universal Achievement System</div>
          </div>
        </div>

        {/* Network Indicator */}
        <div className="hidden md:flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 border border-white/10">
          <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
          <span className="text-sm text-gray-300">Push Chain Donut Testnet</span>
        </div>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          {!isConnected ? (
            <>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-white/20 hover:bg-white/10 bg-transparent"
                onClick={connect}
                disabled={isLoading}
              >
                <Wallet className="w-4 h-4" />
                <span className="hidden sm:inline">{isLoading ? 'Connecting...' : 'Connect Wallet'}</span>
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                className="gap-2 border-blue-400/30 hover:bg-blue-500/10 bg-transparent text-blue-400 hover:text-blue-300"
                onClick={handleConnectWithX}
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                </svg>
                <span className="hidden sm:inline">Connect with X</span>
              </Button>
            </>
          ) : (
            <>
              {/* Twitter Profile Badge */}
              {isTwitterConnected && twitterProfile ? (
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-500/20 border border-blue-400/30">
                  {twitterProfile.profileImage && (
                    <img 
                      src={twitterProfile.profileImage} 
                      alt={twitterProfile.displayName}
                      className="w-5 h-5 rounded-full"
                    />
                  )}
                  <span className="text-sm text-blue-400">@{twitterProfile.username}</span>
                </div>
              ) : (
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="hidden lg:flex gap-2 text-blue-400 hover:text-blue-300 hover:bg-blue-500/10"
                  onClick={handleConnectWithX}
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                  <span className="text-xs">Connect X</span>
                </Button>
              )}

              {/* Reputation Score Badge */}
              {reputation && (
                <div className="hidden lg:flex items-center gap-2 px-3 py-2 rounded-lg bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30">
                  <Trophy className="w-4 h-4 text-yellow-400" />
                  <span className="text-sm font-semibold text-white">{reputation.totalScore}</span>
                  <span className="text-xs text-gray-300">{reputation.tier.toUpperCase()}</span>
                </div>
              )}

              {/* Testnet Balance */}
              <a
                href="https://faucet.push.org/"
                target="_blank"
                rel="noopener noreferrer"
                className="hidden md:flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10 hover:border-purple-500/30 transition-all group"
                title="Get testnet tokens"
              >
                <Coins className="w-4 h-4 text-purple-400" />
                <span className="text-sm font-mono text-white">{balance}</span>
                <span className="text-xs text-gray-400">PC</span>
                <ExternalLink className="w-3 h-3 text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </a>
              
              {/* Address Display */}
              <div className="flex items-center gap-2 px-3 py-2 rounded-lg bg-white/5 border border-white/10">
                <div className="w-2 h-2 rounded-full bg-green-400"></div>
                <span className="text-sm text-gray-300">{formatAddress(address!)}</span>
              </div>

              {/* Profile Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center hover:shadow-lg hover:shadow-purple-500/50 transition-all"
                >
                  <ChevronDown className="w-5 h-5 text-white" />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-56 bg-white/5 backdrop-blur-md rounded-lg border border-white/10 shadow-xl">
                    <div className="p-4 space-y-2">
                      <div className="px-3 py-2 text-xs text-gray-400 border-b border-white/10">
                        {address && formatAddress(address)}
                        {isTwitterConnected && twitterProfile && (
                          <div className="mt-1 text-blue-400">@{twitterProfile.username}</div>
                        )}
                      </div>
                      <button className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm text-gray-300">
                        View Profile
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm text-gray-300">
                        My Achievements
                      </button>
                      <button className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm text-gray-300">
                        Settings
                      </button>
                      {isTwitterConnected && (
                        <button 
                          onClick={disconnectTwitter}
                          className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm text-blue-400 border-t border-white/10 mt-2 pt-2"
                        >
                          Disconnect Twitter
                        </button>
                      )}
                      <button 
                        onClick={disconnect}
                        className="w-full text-left px-3 py-2 rounded hover:bg-white/10 text-sm text-red-400"
                      >
                        Disconnect Wallet
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
