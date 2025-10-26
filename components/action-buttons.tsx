import { Button } from "@/components/ui/button"
import { Share2, Download, Zap } from "lucide-react"

export default function ActionButtons() {
  return (
    <section className="py-12 pb-20">
      <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
        <Button
          size="lg"
          className="gap-2 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white border-0"
        >
          <Zap className="w-5 h-5" />
          Sync Achievements
        </Button>

        <Button size="lg" variant="outline" className="gap-2 border-white/20 hover:bg-white/10 bg-transparent">
          <Download className="w-5 h-5" />
          Export Reputation
        </Button>

        <Button size="lg" variant="ghost" className="gap-2 hover:bg-white/10">
          <Share2 className="w-5 h-5" />
          Share Profile
        </Button>
      </div>
    </section>
  )
}
