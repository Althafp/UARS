import Header from "@/components/header"
import HeroSection from "@/components/hero-section"
import ReputationCard from "@/components/reputation-card"
import AchievementGallery from "@/components/achievement-gallery"
import CrossChainActivity from "@/components/cross-chain-activity"
import ProtocolIntegration from "@/components/protocol-integration"
import BenefitsShowcase from "@/components/benefits-showcase"
import ActionButtons from "@/components/action-buttons"
import DemoWalkthrough from "@/components/demo-walkthrough"
import OnChainActions from "@/components/on-chain-actions"

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      <Header />
      <HeroSection />
      <DemoWalkthrough />

      <div className="container mx-auto px-4 py-16 space-y-20">
        <ReputationCard />
        <OnChainActions />
        <AchievementGallery />
        <CrossChainActivity />
        <ProtocolIntegration />
        <BenefitsShowcase />
        <ActionButtons />
      </div>
    </main>
  )
}
