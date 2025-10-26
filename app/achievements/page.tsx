"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { useWallet } from "@/contexts/WalletContext"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft, Trophy, Coins, TrendingUp, Zap, Lock, CheckCircle, Sparkles, Loader2, ExternalLink } from "lucide-react"

interface Achievement {
  id: string
  category: string
  name: string
  description: string
  requirement: string
  points: number
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary'
  icon: any
  progress: number
  total: number
  unlocked: boolean
  claimed: boolean
  color: string
}

interface ClaimedNFT {
  tokenId: number
  achievementId: string
  name: string
  points: number
  rarity: string
  imageUrl: string
  timestamp: number
}

const ACHIEVEMENT_DEFINITIONS = [
  {
    id: 'early-adopter',
    category: 'Special',
    name: 'Early Adopter',
    description: 'Join UARS during beta phase',
    requirement: 'Connect wallet',
    points: 100,
    rarity: 'Legendary' as const,
    icon: Sparkles,
    color: 'from-yellow-400 to-orange-500',
    checkUnlocked: () => true,
    getProgress: () => ({ progress: 1, total: 1 }),
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=early-adopter&backgroundColor=f59e0b'
  },
  {
    id: 'defi-novice',
    category: 'DeFi',
    name: 'DeFi Novice',
    description: 'Complete your first DeFi transaction',
    requirement: '1 transaction',
    points: 50,
    rarity: 'Common' as const,
    icon: Coins,
    color: 'from-green-500 to-emerald-500',
    checkUnlocked: (count: number) => count >= 1,
    getProgress: (count: number) => ({ progress: Math.min(count, 1), total: 1 }),
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi-novice&backgroundColor=10b981'
  },
  {
    id: 'defi-expert',
    category: 'DeFi',
    name: 'DeFi Expert',
    description: 'Complete 3 DeFi transactions',
    requirement: '3 transactions',
    points: 200,
    rarity: 'Rare' as const,
    icon: Coins,
    color: 'from-blue-500 to-purple-500',
    checkUnlocked: (count: number) => count >= 3,
    getProgress: (count: number) => ({ progress: Math.min(count, 3), total: 3 }),
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi-expert&backgroundColor=3b82f6'
  },
  {
    id: 'defi-master',
    category: 'DeFi',
    name: 'DeFi Master',
    description: 'Complete 5 DeFi transactions',
    requirement: '5 transactions',
    points: 300,
    rarity: 'Epic' as const,
    icon: Coins,
    color: 'from-purple-500 to-pink-500',
    checkUnlocked: (count: number) => count >= 5,
    getProgress: (count: number) => ({ progress: Math.min(count, 5), total: 5 }),
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=defi-master&backgroundColor=a855f7'
  },
  {
    id: 'volume-starter',
    category: 'Volume',
    name: 'Volume Starter',
    description: 'Reach 0.1 PC total volume',
    requirement: '2 transactions',
    points: 75,
    rarity: 'Common' as const,
    icon: TrendingUp,
    color: 'from-cyan-500 to-blue-500',
    checkUnlocked: (count: number) => count >= 2,
    getProgress: (count: number) => ({ progress: count, total: 2 }),
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=volume-starter&backgroundColor=06b6d4'
  },
  {
    id: 'volume-trader',
    category: 'Volume',
    name: 'Volume Trader',
    description: 'Reach 1 PC total volume',
    requirement: '10 transactions',
    points: 150,
    rarity: 'Rare' as const,
    icon: TrendingUp,
    color: 'from-blue-500 to-indigo-500',
    checkUnlocked: (count: number) => count >= 10,
    getProgress: (count: number) => ({ progress: count, total: 10 }),
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=volume-trader&backgroundColor=6366f1'
  },
  {
    id: 'consistent-user',
    category: 'Consistency',
    name: 'Consistent User',
    description: 'Complete 3 borrow-repay cycles',
    requirement: '3 cycles',
    points: 100,
    rarity: 'Rare' as const,
    icon: Zap,
    color: 'from-yellow-500 to-orange-500',
    checkUnlocked: (count: number) => count >= 3,
    getProgress: (count: number) => ({ progress: count, total: 3 }),
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=consistent-user&backgroundColor=eab308'
  },
  {
    id: 'perfect-record',
    category: 'Consistency',
    name: 'Perfect Record',
    description: 'Repay 5 loans on time',
    requirement: '5 repayments',
    points: 250,
    rarity: 'Epic' as const,
    icon: CheckCircle,
    color: 'from-green-500 to-teal-500',
    checkUnlocked: (count: number) => count >= 5,
    getProgress: (count: number) => ({ progress: count, total: 5 }),
    imageUrl: 'https://api.dicebear.com/7.x/shapes/svg?seed=perfect-record&backgroundColor=22c55e'
  },
]

export default function AchievementsPage() {
  const router = useRouter()
  const { address, isConnected, connect } = useWallet()
  const { toast } = useToast()
  const [achievements, setAchievements] = useState<Achievement[]>([])
  const [claimedNFTs, setClaimedNFTs] = useState<ClaimedNFT[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [claimingId, setClaimingId] = useState<string | null>(null)
  const [selectedCategory, setSelectedCategory] = useState('All')

  useEffect(() => {
    if (address) {
      fetchAchievements()
    }
  }, [address])

  const fetchAchievements = async () => {
    if (!address) return

    setIsLoading(true)
    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) return

      // Get loan count
      const paddedAddress = address.slice(2).padStart(64, '0')
      
      // Get REAL activity count from lending contract
      let activityCount = 0
      
      try {
        // Get user's loan count from lending contract
        const getUserLoansSelector = '0x02bf321f'
        
        const loansData = await ethereum.request({
          method: 'eth_call',
          params: [{
            to: process.env.NEXT_PUBLIC_LENDING_ADDRESS,
            data: getUserLoansSelector + paddedAddress
          }, 'latest']
        })

        if (loansData && loansData.length > 66) {
          const loanCount = parseInt(loansData.slice(66, 130), 16)
          activityCount = loanCount // Each loan = 1 transaction
          console.log("User has", loanCount, "loans (transactions)")
        }
      } catch (err) {
        console.log("Could not fetch activity count from lending:", err)
        activityCount = 0
      }

      console.log("User activity count:", activityCount)

      // Check claimed status - Use localStorage (most reliable)
      const claimedSet = new Set<string>()
      const nfts: ClaimedNFT[] = []

      // Load from localStorage
      const savedClaimed = localStorage.getItem('claimed_achievements_' + address)
      if (savedClaimed) {
        try {
          const claimed = JSON.parse(savedClaimed)
          claimed.forEach((id: string) => {
            claimedSet.add(id)
            const def = ACHIEVEMENT_DEFINITIONS.find(d => d.id === id)
            if (def) {
              nfts.push({
                tokenId: nfts.length + 1,
                achievementId: def.id,
                name: def.name,
                points: def.points,
                rarity: def.rarity,
                imageUrl: def.imageUrl,
                timestamp: Date.now()
              })
            }
          })
        } catch (error) {
          console.error("Error parsing claimed achievements:", error)
        }
      }

      setClaimedNFTs(nfts)
      console.log("Claimed NFTs:", nfts)
      console.log("Claimed set:", Array.from(claimedSet))

      // Build achievements list
      const allAchievements: Achievement[] = ACHIEVEMENT_DEFINITIONS.map(def => {
        const { progress, total } = def.getProgress(activityCount)
        return {
          ...def,
          progress,
          total,
          unlocked: def.checkUnlocked(activityCount),
          claimed: claimedSet.has(def.id)
        }
      })

      setAchievements(allAchievements)
    } catch (error) {
      console.error("Error fetching achievements:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClaimAchievement = async (achievement: Achievement) => {
    if (!address || !achievement.unlocked || achievement.claimed) {
      toast({
        title: "Cannot Claim",
        description: achievement.claimed ? "Already claimed this achievement" : "Not unlocked yet",
        variant: "destructive"
      })
      return
    }

    setClaimingId(achievement.id)

    try {
      const ethereum = (window as any).ethereum
      if (!ethereum) throw new Error("MetaMask not found")

      // Encode claimAchievement(string) - Browser-compatible version
      const selector = '0x6c19e783'
      const offset = '0000000000000000000000000000000000000000000000000000000000000020'
      
      // Convert string to hex (browser-compatible)
      const encoder = new TextEncoder()
      const idBytes = encoder.encode(achievement.id)
      const idHex = Array.from(idBytes).map(b => b.toString(16).padStart(2, '0')).join('')
      const idLength = idBytes.length.toString(16).padStart(64, '0')
      
      // Pad to 32-byte chunks
      const paddedLength = Math.ceil(idBytes.length / 32) * 32
      const idData = idHex.padEnd(paddedLength * 2, '0')
      
      const data = '0x' + selector.slice(2) + offset + idLength + idData
      
      console.log('Claiming achievement:', {
        id: achievement.id,
        idHex,
        idLength,
        data,
        to: process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS
      })

      toast({
        title: "Minting Achievement NFT...",
        description: `Claiming "${achievement.name}"`,
      })

      const txHash = await ethereum.request({
        method: 'eth_sendTransaction',
        params: [{
          from: address,
          to: process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS,
          data: data,
          value: '0x0',
          gas: '0xF4240' // 1000000 (1M gas for contract execution)
        }],
      })
      
      console.log('Transaction sent:', txHash)

      // Wait for confirmation
      let attempts = 0
      while (attempts < 40) {
        const receipt = await ethereum.request({
          method: 'eth_getTransactionReceipt',
          params: [txHash],
        })
        
        if (receipt) {
          console.log("Transaction receipt:", receipt)
          
          if (receipt.status === '0x1') {
            toast({
              title: "Achievement Claimed! 🎉",
              description: `"${achievement.name}" NFT minted! +${achievement.points} reputation points!`,
            })
            // Immediately mark as claimed in UI
            setAchievements(prev => prev.map(a => 
              a.id === achievement.id ? { ...a, claimed: true } : a
            ))
            // Add to claimed NFTs list
            setClaimedNFTs(prev => [...prev, {
              tokenId: prev.length + 1,
              achievementId: achievement.id,
              name: achievement.name,
              points: achievement.points,
              rarity: achievement.rarity,
              imageUrl: achievement.imageUrl,
              timestamp: Date.now()
            }])
            // Save to localStorage
            const savedClaimed = localStorage.getItem('claimed_achievements_' + address)
            const claimed = savedClaimed ? JSON.parse(savedClaimed) : []
            if (!claimed.includes(achievement.id)) {
              claimed.push(achievement.id)
              localStorage.setItem('claimed_achievements_' + address, JSON.stringify(claimed))
            }
            // Refresh from blockchain after 2s
            setTimeout(fetchAchievements, 2000)
            return
          } else {
            // Transaction failed - show actual error
            toast({
              title: "Transaction Failed",
              description: "You may not be eligible yet. Complete more transactions in the lending platform first.",
              variant: "destructive"
            })
            setTimeout(fetchAchievements, 1000)
            return
          }
        }
        
        await new Promise(resolve => setTimeout(resolve, 2000))
        attempts++
      }

      throw new Error("Transaction timeout")

    } catch (error: any) {
      console.error("Claim error:", error)
      
      let errorMessage = "Please try again"
      
      // Parse error message
      if (error.message) {
        if (error.message.includes("Already claimed")) {
          errorMessage = "You've already claimed this achievement"
        } else if (error.message.includes("Complete")) {
          errorMessage = error.message
        } else if (error.message.includes("NEED")) {
          errorMessage = "Complete more transactions to unlock this achievement"
        } else if (error.message.includes("user rejected")) {
          errorMessage = "Transaction cancelled"
          setClaimingId(null)
          return
        }
      }
      
      toast({
        title: "Claim Failed",
        description: errorMessage,
        variant: "destructive",
      })
      setTimeout(fetchAchievements, 1000)
    } finally {
      setClaimingId(null)
    }
  }

  const getRarityColor = (rarity: string) => {
    switch (rarity) {
      case 'Common': return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
      case 'Rare': return 'bg-blue-500/20 text-blue-300 border-blue-500/30'
      case 'Epic': return 'bg-purple-500/20 text-purple-300 border-purple-500/30'
      case 'Legendary': return 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30'
      default: return 'bg-gray-500/20 text-gray-300 border-gray-500/30'
    }
  }

  if (!isConnected) {
    return (
      <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="container mx-auto px-4 py-16">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="mb-8 text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          <div className="max-w-2xl mx-auto text-center py-20">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center mx-auto mb-8">
              <Trophy className="w-12 h-12 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-white mb-4">
              Claim Your Achievements
            </h1>
            <p className="text-xl text-gray-400 mb-8">
              Connect your wallet to view and mint achievement NFTs
            </p>
            <Button
              size="lg"
              onClick={connect}
              className="gap-2 bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
            >
              <Trophy className="w-5 h-5" />
              Connect Wallet
            </Button>
          </div>
        </div>
      </main>
    )
  }

  const categories = ['All', 'DeFi', 'Volume', 'Consistency', 'Special']
  const filteredAchievements = selectedCategory === 'All' 
    ? achievements 
    : achievements.filter(a => a.category === selectedCategory)

  const unlockedCount = achievements.filter(a => a.unlocked).length
  const claimedCount = claimedNFTs.length
  const totalPoints = claimedNFTs.reduce((sum, nft) => sum + nft.points, 0)

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <Button
            onClick={() => router.push('/')}
            variant="ghost"
            className="text-gray-400 hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Dashboard
          </Button>

          {process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS && (
            <a
              href={`https://donut.push.network/address/${process.env.NEXT_PUBLIC_ACHIEVEMENT_NFT_ADDRESS}`}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 text-sm text-purple-400 hover:text-purple-300"
            >
              View NFT Contract <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>

        {/* Title Section */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-purple-500 to-pink-500 flex items-center justify-center">
              <Trophy className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white">
              Achievement NFTs
            </h1>
          </div>
          <p className="text-xl text-gray-400 mb-6">
            Mint real NFTs based on your on-chain activity
          </p>
          
          {/* Stats */}
          <div className="flex items-center justify-center gap-8">
            <div className="text-center">
              <div className="text-3xl font-bold text-purple-400">{unlockedCount}/{achievements.length}</div>
              <div className="text-sm text-gray-500">Unlocked</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-green-400">{claimedCount}</div>
              <div className="text-sm text-gray-500">NFTs Minted</div>
            </div>
            <div className="text-center">
              <div className="text-3xl font-bold text-yellow-400">{totalPoints}</div>
              <div className="text-sm text-gray-500">Points Earned</div>
            </div>
          </div>
        </div>

        {/* CLAIMED NFTs SECTION */}
        {claimedNFTs.length > 0 && (
          <div className="mb-12">
            <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-2">
              <Trophy className="w-6 h-6 text-yellow-400" />
              🏆 Your Claimed Achievement NFTs ({claimedNFTs.length})
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {claimedNFTs.map((nft) => (
                <Card 
                  key={nft.tokenId}
                  className="bg-gradient-to-br from-green-500/20 to-emerald-500/20 border-green-500/50 hover:scale-105 transition-all shadow-lg shadow-green-500/20"
                >
                  <CardContent className="p-6">
                    {/* NFT Image */}
                    <div className="w-full aspect-square rounded-xl bg-gradient-to-br from-purple-500 to-pink-500 mb-4 flex items-center justify-center overflow-hidden border-2 border-green-400/50">
                      <img 
                        src={nft.imageUrl} 
                        alt={nft.name}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    
                    {/* NFT Info */}
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <Badge className={getRarityColor(nft.rarity)}>
                          {nft.rarity}
                        </Badge>
                        <span className="text-xs text-gray-400">#{nft.tokenId}</span>
                      </div>
                      
                      <h3 className="text-white font-bold text-lg">{nft.name}</h3>
                      
                      <div className="flex items-center justify-between text-sm p-2 rounded-lg bg-white/5">
                        <span className="text-gray-400">Reward</span>
                        <span className="text-purple-400 font-semibold">+{nft.points} pts</span>
                      </div>

                      <Badge className="w-full justify-center bg-green-500/20 text-green-300 border-green-500/30 py-2">
                        <CheckCircle className="w-4 h-4 mr-1" />
                        NFT Minted ✓
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Category Filters */}
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-white mb-4">
            All Achievements
          </h2>
          <div className="flex flex-wrap items-center gap-2">
            {categories.map((category) => (
              <Button
                key={category}
                onClick={() => setSelectedCategory(category)}
                variant={selectedCategory === category ? "default" : "outline"}
                size="sm"
                className={selectedCategory === category 
                  ? "bg-purple-500 hover:bg-purple-600" 
                  : "border-white/20 hover:bg-white/10"}
              >
                {category}
              </Button>
            ))}
            <Button
              onClick={fetchAchievements}
              disabled={isLoading}
              variant="outline"
              size="sm"
              className="border-white/20 hover:bg-white/10 gap-2 ml-auto"
            >
              <Loader2 className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
          </div>
        </div>

        {/* Achievements Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {filteredAchievements.map((achievement) => {
            const Icon = achievement.icon
            const progressPercent = Math.min((achievement.progress / achievement.total) * 100, 100)

            return (
              <Card 
                key={achievement.id}
                className={`bg-white/5 backdrop-blur-md transition-all hover:scale-105 ${
                  achievement.claimed 
                    ? 'border-green-500/50 shadow-lg shadow-green-500/20 opacity-75'
                    : achievement.unlocked 
                      ? 'border-purple-500/50 shadow-lg shadow-purple-500/20' 
                      : 'border-white/10'
                }`}
              >
                <CardHeader>
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${achievement.color} flex items-center justify-center relative ${
                      !achievement.unlocked ? 'grayscale opacity-50' : ''
                    }`}>
                      <Icon className="w-7 h-7 text-white" />
                      {achievement.claimed && (
                        <div className="absolute -top-2 -right-2 w-7 h-7 bg-green-500 rounded-full flex items-center justify-center border-2 border-slate-900">
                          <CheckCircle className="w-5 h-5 text-white" />
                        </div>
                      )}
                    </div>
                    <Badge className={getRarityColor(achievement.rarity)}>
                      {achievement.rarity}
                    </Badge>
                  </div>

                  <CardTitle className={`text-white text-lg ${!achievement.unlocked ? 'opacity-50' : ''}`}>
                    {achievement.name}
                  </CardTitle>
                  <CardDescription className="text-gray-400 text-sm">
                    {achievement.description}
                  </CardDescription>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Progress */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-400">{achievement.requirement}</span>
                      <span className={achievement.unlocked ? "text-green-400 font-semibold" : "text-gray-500"}>
                        {achievement.total >= 1 
                          ? `${Math.floor(achievement.progress)}/${achievement.total}`
                          : `${(achievement.progress).toFixed(2)}/${achievement.total}`}
                      </span>
                    </div>
                    <Progress value={progressPercent} className="h-2" />
                  </div>

                  {/* Points */}
                  <div className="flex items-center justify-between p-3 rounded-lg bg-white/5">
                    <span className="text-sm text-gray-400">Reward</span>
                    <span className="text-lg font-bold text-purple-400">+{achievement.points} pts</span>
                  </div>

                  {/* Action Button */}
                  {achievement.claimed ? (
                    <div className="space-y-1">
                      <Button
                        disabled
                        className="w-full gap-2 bg-green-500/20 text-green-300 cursor-not-allowed border border-green-500/30 h-11"
                      >
                        <CheckCircle className="w-4 h-4" />
                        NFT Claimed ✓
                      </Button>
                      <p className="text-xs text-center text-green-400">
                        See your NFT above!
                      </p>
                    </div>
                  ) : achievement.unlocked ? (
                    <Button
                      onClick={() => handleClaimAchievement(achievement)}
                      disabled={claimingId === achievement.id}
                      className={`w-full gap-2 bg-gradient-to-r ${achievement.color} hover:opacity-90 h-11`}
                    >
                      {claimingId === achievement.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          Minting...
                        </>
                      ) : (
                        <>
                          <Trophy className="w-4 h-4" />
                          Claim & Mint NFT
                        </>
                      )}
                    </Button>
                  ) : (
                    <Button
                      disabled
                      className="w-full gap-2 bg-white/5 text-gray-500 cursor-not-allowed h-11"
                    >
                      <Lock className="w-4 h-4" />
                      {achievement.total >= 1 
                        ? `Need ${achievement.total - Math.floor(achievement.progress)} more`
                        : `Locked`}
                    </Button>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Info Banner */}
        <Card className="bg-gradient-to-r from-purple-500/10 to-pink-500/10 border-purple-500/30">
          <CardContent className="p-6">
            <div className="flex items-start gap-4">
              <Sparkles className="w-6 h-6 text-purple-400 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-white mb-2">
                  How Achievement NFTs Work
                </h3>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Real Activity:</strong> Achievements unlock from your actual lending transactions</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Real NFTs:</strong> Mints actual ERC721 tokens on Push Chain</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>One-Time Only:</strong> Each achievement can only be claimed once per wallet</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <CheckCircle className="w-4 h-4 text-green-400 flex-shrink-0 mt-0.5" />
                    <span><strong>Points Earned:</strong> Get 50-300 reputation points per NFT claimed</span>
                  </li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  )
}
