"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { CheckCircle2, Circle, Play, ArrowRight, Trophy, Wallet, Sparkles, Target, Gift } from "lucide-react"

interface DemoStep {
  id: number
  title: string
  description: string
  action: string
  icon: any
  points?: number
}

const DEMO_STEPS: DemoStep[] = [
  {
    id: 1,
    title: "Connect Your Wallet",
    description: "Connect your MetaMask wallet to Push Chain Donut Testnet. We'll scan your on-chain activity across multiple chains.",
    action: "Click 'Connect Wallet' button",
    icon: Wallet,
    points: 0
  },
  {
    id: 2,
    title: "Get Testnet Tokens",
    description: "Get free PC tokens from the Push Chain faucet. These are needed for transaction fees on the testnet.",
    action: "Visit faucet.push.org",
    icon: Gift,
    points: 0
  },
  {
    id: 3,
    title: "Achievement Scanning",
    description: "UARS automatically scans your wallet activity across Ethereum, Polygon, Arbitrum, Base, and Optimism to detect achievements.",
    action: "Automatic - Watch the magic!",
    icon: Sparkles,
    points: 0
  },
  {
    id: 4,
    title: "Earn DeFi Achievement",
    description: "If you have $10K+ in DeFi liquidity with 0 liquidations, you earn 'DeFi Master' achievement.",
    action: "Achievement detected!",
    icon: Trophy,
    points: 250
  },
  {
    id: 5,
    title: "Earn NFT Achievement",
    description: "50+ NFT trades with 70%+ profitability earns you 'NFT Royalty' achievement.",
    action: "Achievement detected!",
    icon: Trophy,
    points: 300
  },
  {
    id: 6,
    title: "Calculate Reputation",
    description: "Your achievements are combined with activity metrics to calculate your universal reputation score (0-1000).",
    action: "Score calculated!",
    icon: Target,
    points: 0
  },
  {
    id: 7,
    title: "Unlock Benefits",
    description: "Your Gold tier (800+) unlocks: 120% collateral (vs 150%), 5% interest (vs 8%), 3x voting power, and $2.5K guaranteed IDO allocation!",
    action: "Benefits unlocked!",
    icon: Gift,
    points: 0
  }
]

export default function DemoWalkthrough() {
  const [isOpen, setIsOpen] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [completedSteps, setCompletedSteps] = useState<number[]>([])
  const [totalPoints, setTotalPoints] = useState(0)
  const [isAutoPlaying, setIsAutoPlaying] = useState(false)

  useEffect(() => {
    // Auto-open on first visit
    const hasSeenDemo = localStorage.getItem('uars_demo_seen')
    if (!hasSeenDemo) {
      setIsOpen(true)
      localStorage.setItem('uars_demo_seen', 'true')
    }
  }, [])

  useEffect(() => {
    if (isAutoPlaying && currentStep < DEMO_STEPS.length) {
      const timer = setTimeout(() => {
        handleComplete()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [isAutoPlaying, currentStep])

  const handleComplete = () => {
    const step = DEMO_STEPS[currentStep]
    if (!completedSteps.includes(step.id)) {
      setCompletedSteps([...completedSteps, step.id])
      setTotalPoints(totalPoints + (step.points || 0))
    }
    if (currentStep < DEMO_STEPS.length - 1) {
      setCurrentStep(currentStep + 1)
    } else {
      setIsAutoPlaying(false)
    }
  }

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1)
    }
  }

  const handleAutoPlay = () => {
    setCurrentStep(0)
    setCompletedSteps([])
    setTotalPoints(0)
    setIsAutoPlaying(true)
  }

  const step = DEMO_STEPS[currentStep]
  const StepIcon = step.icon
  const progress = ((currentStep + 1) / DEMO_STEPS.length) * 100

  return (
    <>
      {/* Floating Demo Button */}
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white shadow-lg shadow-purple-500/50"
        size="lg"
      >
        <Play className="w-4 h-4" />
        View Demo
      </Button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-3xl bg-slate-900 border-white/10">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-white flex items-center gap-2">
              <Sparkles className="w-6 h-6 text-purple-400" />
              UARS Interactive Walkthrough
            </DialogTitle>
            <DialogDescription className="text-gray-400">
              See how you earn reputation and unlock benefits across Web3
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-400">Step {currentStep + 1} of {DEMO_STEPS.length}</span>
                <span className="text-purple-400 font-semibold">{totalPoints} points earned</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            {/* Current Step */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10">
              <div className="flex items-start gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
                  <StepIcon className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-xl font-semibold text-white">{step.title}</h3>
                    {step.points && step.points > 0 && (
                      <Badge className="bg-yellow-500/20 text-yellow-300 border-yellow-500/30">
                        +{step.points} pts
                      </Badge>
                    )}
                  </div>
                  <p className="text-gray-300 mb-3">{step.description}</p>
                  <div className="flex items-center gap-2 text-sm text-purple-400">
                    <ArrowRight className="w-4 h-4" />
                    <span className="font-semibold">{step.action}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Step List */}
            <div className="bg-white/5 backdrop-blur-md rounded-xl p-4 border border-white/10 max-h-48 overflow-y-auto">
              <div className="space-y-2">
                {DEMO_STEPS.map((s, index) => {
                  const Icon = s.icon
                  const isCompleted = completedSteps.includes(s.id)
                  const isCurrent = index === currentStep
                  
                  return (
                    <div
                      key={s.id}
                      className={`flex items-center gap-3 p-2 rounded-lg transition-all ${
                        isCurrent ? 'bg-purple-500/20 border border-purple-500/30' : ''
                      }`}
                    >
                      {isCompleted ? (
                        <CheckCircle2 className="w-5 h-5 text-green-400 flex-shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-gray-500 flex-shrink-0" />
                      )}
                      <Icon className="w-4 h-4 text-gray-400 flex-shrink-0" />
                      <span className={`text-sm flex-1 ${
                        isCompleted ? 'text-green-400' : 
                        isCurrent ? 'text-white font-semibold' : 
                        'text-gray-500'
                      }`}>
                        {s.title}
                      </span>
                      {s.points && s.points > 0 && (
                        <span className="text-xs text-yellow-400">+{s.points}</span>
                      )}
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center justify-between gap-4">
              <Button
                onClick={handleAutoPlay}
                variant="outline"
                className="gap-2 border-purple-500/50 hover:bg-purple-500/10"
                disabled={isAutoPlaying}
              >
                <Play className="w-4 h-4" />
                Auto Play Demo
              </Button>

              <div className="flex gap-2">
                <Button
                  onClick={handlePrevious}
                  variant="outline"
                  disabled={currentStep === 0}
                  className="border-white/20 hover:bg-white/10"
                >
                  Previous
                </Button>
                
                {currentStep < DEMO_STEPS.length - 1 ? (
                  <Button
                    onClick={handleComplete}
                    className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                  >
                    Next Step
                    <ArrowRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button
                    onClick={() => {
                      setIsOpen(false)
                      window.location.reload()
                    }}
                    className="gap-2 bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                  >
                    Start Exploring!
                    <Trophy className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </div>

            {/* Final Summary */}
            {currentStep === DEMO_STEPS.length - 1 && (
              <div className="bg-gradient-to-r from-purple-500/20 to-blue-500/20 rounded-xl p-6 border border-purple-500/30">
                <h4 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-yellow-400" />
                  Congratulations! Demo Complete
                </h4>
                <div className="grid grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="text-2xl font-bold text-white">{totalPoints}</div>
                    <div className="text-xs text-gray-400">Total Points</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-purple-400">Gold</div>
                    <div className="text-xs text-gray-400">Your Tier</div>
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-green-400">$50K</div>
                    <div className="text-xs text-gray-400">Annual Savings</div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}

