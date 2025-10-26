import { TrendingUp, Lock, Globe } from "lucide-react"

const BENEFITS = [
  {
    icon: TrendingUp,
    title: "Better Rates",
    description: "Unlock up to 25% better rates across DeFi protocols",
    stat: "+25%",
  },
  {
    icon: Lock,
    title: "Exclusive Access",
    description: "Early access to new features and exclusive drops",
    stat: "∞",
  },
  {
    icon: Globe,
    title: "Universal Recognition",
    description: "Your reputation recognized across all chains",
    stat: "4+",
  },
]

export default function BenefitsShowcase() {
  return (
    <section className="py-12">
      <div className="mb-12 text-center">
        <h2 className="text-3xl font-bold text-white mb-2">Why UARS?</h2>
        <p className="text-gray-400">Maximize your Web3 potential</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {BENEFITS.map((benefit, index) => {
          const Icon = benefit.icon
          return (
            <div
              key={index}
              className="bg-white/5 backdrop-blur-md rounded-xl p-8 border border-white/10 hover:border-white/30 transition-all duration-300 group"
            >
              <div className="mb-6">
                <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center group-hover:shadow-lg group-hover:shadow-purple-500/50 transition-all">
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>

              <h3 className="text-xl font-semibold text-white mb-2">{benefit.title}</h3>
              <p className="text-gray-400 text-sm mb-4">{benefit.description}</p>

              <div className="text-3xl font-bold text-transparent bg-gradient-to-r from-purple-400 to-blue-400 bg-clip-text">
                {benefit.stat}
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
