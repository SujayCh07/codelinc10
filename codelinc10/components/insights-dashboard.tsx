"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, BookOpen, HelpCircle, Home, RefreshCw, Settings, Sparkles } from "lucide-react"

export interface LifeLensInsights {
  persona: string
  statement: string
  priorities: { title: string; description: string }[]
  tips: { title: string; description: string; icon: string }[]
  timeline: { period: string; title: string; description: string }[]
  aiPrompt: string
}

interface InsightsDashboardProps {
  insights: LifeLensInsights
  onBackToLanding: () => void
  onRegenerate: () => void
  onRestartQuiz: () => void
}

export function InsightsDashboard({ insights, onBackToLanding, onRegenerate, onRestartQuiz }: InsightsDashboardProps) {
  return (
    <div className="relative min-h-screen bg-white text-[#2A1A1A]">
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute left-10 top-10 h-48 w-48 rounded-full bg-gradient-to-br from-[#A41E34]/20 to-[#FF4F00]/20 blur-3xl" />
        <div className="absolute right-0 top-1/2 h-56 w-56 -translate-y-1/2 rounded-full bg-gradient-to-br from-[#FF4F00]/15 to-[#A41E34]/20 blur-3xl" />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col gap-8 px-6 pb-20 pt-10 sm:px-10">
        <header className="flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-2">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34]">Welcome back</p>
            <h1 className="text-3xl font-semibold sm:text-4xl">{insights.persona}</h1>
            <p className="text-sm text-[#5B4444]">{insights.statement}</p>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button variant="outline" className="rounded-full border-[#A41E34]/30 text-[#A41E34] hover:bg-[#A41E34]/10" onClick={onRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" /> Regenerate with AI
            </Button>
            <Button variant="ghost" className="rounded-full text-sm text-[#A41E34] hover:text-[#FF4F00]" onClick={onBackToLanding}>
              Back to landing page
            </Button>
          </div>
        </header>

        <motion.section
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="grid gap-6"
        >
          <Card className="overflow-hidden rounded-3xl border-none bg-gradient-to-br from-white via-white to-[#FFF5F2] p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-semibold text-[#A41E34]">Your Top 3 Benefits Priorities</h2>
                <p className="text-sm text-[#5B4444]">Handpicked actions to protect what matters most.</p>
              </div>
              <Sparkles className="h-10 w-10 text-[#FF4F00]/70" />
            </div>
            <div className="mt-6 space-y-4">
              {insights.priorities.slice(0, 3).map((priority, index) => (
                <motion.div
                  key={priority.title}
                  initial={{ opacity: 0, x: -12 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 * index }}
                  className="rounded-2xl border border-[#A41E34]/10 bg-white/80 p-5 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <span className="flex h-10 w-10 items-center justify-center rounded-full bg-gradient-to-br from-[#A41E34]/15 to-[#FF4F00]/25 text-sm font-semibold text-[#A41E34]">
                      {index + 1}
                    </span>
                    <div>
                      <h3 className="text-lg font-semibold">{priority.title}</h3>
                      <p className="text-sm text-[#5B4444]">{priority.description}</p>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          <div className="grid gap-6 lg:grid-cols-2">
            <Card className="rounded-3xl border-none bg-white/90 p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-[#A41E34]">Financial Health Tips</h2>
              <p className="text-sm text-[#5B4444]">Quick coaching cues tailored to your answers.</p>
              <div className="mt-6 space-y-4">
                {insights.tips.map((tip) => (
                  <motion.div
                    key={tip.title}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-start gap-3 rounded-2xl border border-[#A41E34]/10 bg-white/70 p-4"
                  >
                    <div className="text-2xl">{tip.icon}</div>
                    <div>
                      <h3 className="font-semibold text-[#2A1A1A]">{tip.title}</h3>
                      <p className="text-sm text-[#5B4444]">{tip.description}</p>
                    </div>
                  </motion.div>
                ))}
              </div>
            </Card>

            <Card className="rounded-3xl border-none bg-white/90 p-6 shadow-xl">
              <h2 className="text-2xl font-semibold text-[#A41E34]">Action Timeline</h2>
              <p className="text-sm text-[#5B4444]">Three steps to keep momentum going.</p>
              <ol className="mt-6 space-y-4">
                {insights.timeline.slice(0, 3).map((item) => (
                  <motion.li
                    key={item.title}
                    initial={{ opacity: 0, x: 12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="rounded-2xl border border-[#FF4F00]/15 bg-gradient-to-br from-[#FFF6F3] to-white p-4"
                  >
                    <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#FF4F00]">{item.period}</div>
                    <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                    <p className="text-sm text-[#5B4444]">{item.description}</p>
                  </motion.li>
                ))}
              </ol>
              <Button
                onClick={onRestartQuiz}
                variant="outline"
                className="mt-6 w-full rounded-full border-[#A41E34]/30 text-[#A41E34] hover:bg-[#A41E34]/10"
              >
                Restart onboarding journey
              </Button>
            </Card>
          </div>
        </motion.section>

        <footer className="mt-auto">
          <div className="flex flex-col items-center gap-4 rounded-3xl border border-[#A41E34]/15 bg-white/80 p-4 shadow-lg sm:flex-row sm:justify-between">
            <div className="flex items-center gap-3 text-sm text-[#5B4444]">
              <Sparkles className="h-5 w-5 text-[#A41E34]" />
              <span>AI prompt used: {insights.aiPrompt}</span>
            </div>
            <Button className="rounded-full bg-gradient-to-r from-[#A41E34] to-[#FF4F00] px-5 text-white" onClick={onRegenerate}>
              Regenerate with AI
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          <nav className="mt-6 grid grid-cols-4 gap-3 text-sm text-[#5B4444]">
            <button className="flex flex-col items-center rounded-2xl border border-transparent bg-white/70 py-3 font-medium text-[#A41E34] shadow-sm">
              <Home className="mb-1 h-5 w-5" /> Timeline
            </button>
            <button className="flex flex-col items-center rounded-2xl border border-transparent bg-white/70 py-3 font-medium hover:text-[#A41E34]">
              <BookOpen className="mb-1 h-5 w-5" /> Learning
            </button>
            <button className="flex flex-col items-center rounded-2xl border border-transparent bg-white/70 py-3 font-medium hover:text-[#A41E34]">
              <HelpCircle className="mb-1 h-5 w-5" /> FAQ
            </button>
            <button className="flex flex-col items-center rounded-2xl border border-transparent bg-white/70 py-3 font-medium hover:text-[#A41E34]">
              <Settings className="mb-1 h-5 w-5" /> Settings
            </button>
          </nav>
        </footer>
      </div>
    </div>
  )
}
