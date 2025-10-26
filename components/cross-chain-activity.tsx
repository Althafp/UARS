"use client"

import { useEffect, useRef, useState } from "react"
import { useWallet } from "@/contexts/WalletContext"
import { ChainActivity } from "@/lib/types"
import { Activity, ArrowRight } from "lucide-react"

const CHAINS = [
  { name: "Ethereum", x: 150, y: 100, color: "#627EEA", icon: "⟠" },
  { name: "Polygon", x: 350, y: 100, color: "#8247E5", icon: "◇" },
  { name: "Base", x: 250, y: 250, color: "#0052FF", icon: "◆" },
  { name: "Arbitrum", x: 100, y: 250, color: "#28A0F0", icon: "◈" },
]

export default function CrossChainActivity() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [chainActivities, setChainActivities] = useState<ChainActivity[]>([])
  const { address, isConnected } = useWallet()

  useEffect(() => {
    if (isConnected && address) {
      fetch(`/api/chain-activity?address=${address}`)
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setChainActivities(data.data.chainActivities)
          }
        })
        .catch(err => console.error('Failed to fetch chain activity:', err))
    }
  }, [address, isConnected])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let time = 0

    const animate = () => {
      time += 0.01

      // Clear canvas
      ctx.fillStyle = "rgba(15, 23, 42, 0.1)"
      ctx.fillRect(0, 0, canvas.width, canvas.height)

      // Draw connections with animation
      for (let i = 0; i < CHAINS.length; i++) {
        for (let j = i + 1; j < CHAINS.length; j++) {
          const chain1 = CHAINS[i]
          const chain2 = CHAINS[j]

          const opacity = 0.3 + Math.sin(time + i + j) * 0.2
          ctx.strokeStyle = `rgba(100, 200, 255, ${opacity})`
          ctx.lineWidth = 2
          ctx.beginPath()
          ctx.moveTo(chain1.x, chain1.y)
          ctx.lineTo(chain2.x, chain2.y)
          ctx.stroke()
        }
      }

      // Draw chain nodes
      CHAINS.forEach((chain, index) => {
        const pulse = Math.sin(time + index) * 5 + 15

        // Glow
        ctx.fillStyle = `rgba(${Number.parseInt(chain.color.slice(1, 3), 16)}, ${Number.parseInt(chain.color.slice(3, 5), 16)}, ${Number.parseInt(chain.color.slice(5, 7), 16)}, 0.2)`
        ctx.beginPath()
        ctx.arc(chain.x, chain.y, pulse + 10, 0, Math.PI * 2)
        ctx.fill()

        // Node
        ctx.fillStyle = chain.color
        ctx.beginPath()
        ctx.arc(chain.x, chain.y, pulse, 0, Math.PI * 2)
        ctx.fill()

        // Inner circle
        ctx.fillStyle = "#0f1729"
        ctx.beginPath()
        ctx.arc(chain.x, chain.y, pulse - 4, 0, Math.PI * 2)
        ctx.fill()
      })

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [])

  if (!isConnected) {
    return (
      <section className="py-12">
        <div className="mb-8 text-center">
          <h2 className="text-3xl font-bold text-white mb-2">Cross-Chain Activity</h2>
          <p className="text-gray-400">Connect your wallet to view your cross-chain activity</p>
        </div>
      </section>
    )
  }

  return (
    <section className="py-12">
      <div className="mb-8">
        <h2 className="text-3xl font-bold text-white mb-2">Cross-Chain Activity</h2>
        <p className="text-gray-400">Your activity across multiple blockchain networks</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Visual Canvas */}
        <div className="bg-white/5 backdrop-blur-md rounded-2xl p-8 border border-white/10 shadow-lg shadow-primary/20">
          <canvas ref={canvasRef} width={500} height={350} className="w-full h-auto rounded-lg" />

          <div className="grid grid-cols-2 gap-3 mt-6">
            {CHAINS.map((chain) => (
              <div key={chain.name} className="flex items-center gap-2 p-3 rounded-lg bg-white/5 border border-white/10">
                <div className="text-xl">{chain.icon}</div>
                <span className="text-sm text-gray-300">{chain.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Activity Stats */}
        <div className="space-y-4">
          {chainActivities.slice(0, 5).map((activity) => (
            <div
              key={activity.chain}
              className="bg-white/5 backdrop-blur-md rounded-xl p-6 border border-white/10 hover:border-purple-500/50 transition-all"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center text-xl">
                    {CHAINS.find(c => c.name === activity.chain)?.icon || "◆"}
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-white">{activity.chain}</h3>
                    <p className="text-xs text-gray-400">{activity.transactions} transactions</p>
                  </div>
                </div>
                <Activity className="w-5 h-5 text-purple-400" />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="text-xs text-gray-400 mb-1">Total Volume</div>
                  <div className="text-lg font-semibold text-white">
                    ${parseFloat(activity.volume).toLocaleString()}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-400 mb-1">Protocols</div>
                  <div className="text-lg font-semibold text-white">
                    {activity.protocols?.length || 0}
                  </div>
                </div>
              </div>

              {activity.protocols && activity.protocols.length > 0 && (
                <div className="mt-4 pt-4 border-t border-white/10">
                  <div className="flex flex-wrap gap-2">
                    {activity.protocols.slice(0, 3).map((protocol) => (
                      <span
                        key={protocol}
                        className="text-xs px-2 py-1 rounded-full bg-purple-500/20 text-purple-300 border border-purple-500/30"
                      >
                        {protocol}
                      </span>
                    ))}
                    {activity.protocols.length > 3 && (
                      <span className="text-xs px-2 py-1 text-gray-400">
                        +{activity.protocols.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
