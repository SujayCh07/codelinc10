"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  HelpCircle,
  Home,
  MessageCircle,
  RefreshCw,
  Settings,
  Sparkles,
} from "lucide-react"

export interface LifeLensInsights {
  persona: string
  statement: string
  priorities: { title: string; description: string }[]
  tips: { title: string; description: string; icon: string }[]
  timeline: { period: string; title: string; description: string }[]
  focusGoal: string
  resources: { title: string; description: string; url: string }[]
  conversation: { speaker: "LifeLens" | "You"; message: string }[]
}

interface InsightsDashboardProps {
  insights: LifeLensInsights
  onBackToLanding: () => void
  onRegenerate: () => void
  onRestartQuiz: () => void
}

export function InsightsDashboard({ insights, onBackToLanding, onRegenerate, onRestartQuiz }: InsightsDashboardProps) {
  return (
    <div className="relative min-h-screen bg-[#F7F4F2] pb-28 text-[#2A1A1A]">
      <header className="sticky top-0 z-40 border-b border-[#E2D5D7] bg-[#F7F4F2]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-4">
          <div className="flex items-center gap-3">
            <img src="/lifelens-logo.svg" alt="LifeLens" className="h-10 w-auto" />
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Personal plan ready</p>
              <h1 className="text-xl font-semibold text-[#2A1A1A] sm:text-2xl">{insights.persona}</h1>
            </div>
          </div>
          <div className="hidden gap-2 sm:flex">
            <Button variant="outline" className="rounded-full border-[#A41E34]/30 text-[#A41E34] hover:bg-[#F0E6E7]" onClick={onRegenerate}>
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh plan
            </Button>
            <Button variant="ghost" className="rounded-full text-sm text-[#A41E34] hover:text-[#7F1527]" onClick={onBackToLanding}>
              Start over
            </Button>
          </div>
        </div>
      </header>

      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6 px-5 py-6">
        <Card className="rounded-3xl border border-[#DEC9CB] bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-2">
              <p className="text-sm text-[#7F1527]">Here’s what to focus on next for <span className="font-semibold">{insights.focusGoal.toLowerCase()}</span>.</p>
              <p className="text-sm text-[#5B4444]">{insights.statement}</p>
            </div>
            <div className="flex items-center gap-2 rounded-2xl bg-[#F1E3E5] px-4 py-2 text-sm font-semibold text-[#7F1527]">
              <Sparkles className="h-4 w-4" /> LifeLens snapshot
            </div>
          </div>
          <div className="mt-6 grid gap-4 sm:grid-cols-3">
            {insights.priorities.slice(0, 3).map((priority, index) => (
              <motion.div
                key={priority.title}
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 * index }}
                className="rounded-2xl border border-[#E6D7D9] bg-[#FBF7F6] p-4"
              >
                <span className="text-xs font-semibold uppercase tracking-[0.2em] text-[#A41E34]">Priority {index + 1}</span>
                <h3 className="mt-2 text-lg font-semibold">{priority.title}</h3>
                <p className="mt-2 text-sm text-[#4D3B3B]">{priority.description}</p>
              </motion.div>
            ))}
          </div>
        </Card>

        <motion.section initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2A1A1A]">
              <Sparkles className="h-5 w-5 text-[#A41E34]" /> Coaching tips from LifeLens
            </h2>
            <p className="mt-1 text-sm text-[#5B4444]">Three quick wins to keep momentum.</p>
            <div className="mt-5 space-y-4">
              {insights.tips.map((tip) => (
                <div key={tip.title} className="flex items-start gap-3 rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4">
                  <div className="text-xl">{tip.icon}</div>
                  <div>
                    <h3 className="text-base font-semibold">{tip.title}</h3>
                    <p className="text-sm text-[#5B4444]">{tip.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2A1A1A]">
              <Home className="h-5 w-5 text-[#A41E34]" /> Timeline to stay on track
            </h2>
            <p className="mt-1 text-sm text-[#5B4444]">Follow this cadence to build confidence.</p>
            <ol className="mt-5 space-y-4">
              {insights.timeline.slice(0, 3).map((item) => (
                <li key={item.title} className="rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4">
                  <div className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7F1527]">{item.period}</div>
                  <h3 className="mt-2 text-base font-semibold">{item.title}</h3>
                  <p className="text-sm text-[#5B4444]">{item.description}</p>
                </li>
              ))}
            </ol>
            <Button
              onClick={onRestartQuiz}
              variant="outline"
              className="mt-6 w-full rounded-xl border-[#A41E34]/40 text-[#A41E34] hover:bg-[#F0E6E7]"
            >
              Update my answers
            </Button>
          </Card>
        </motion.section>

        <div className="grid gap-6 lg:grid-cols-2">
          <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2A1A1A]">
              <BookOpen className="h-5 w-5 text-[#A41E34]" /> Lincoln Financial resources picked for you
            </h2>
            <div className="mt-4 space-y-4">
              {insights.resources.map((resource) => (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4 transition hover:border-[#A41E34] hover:bg-white"
                >
                  <div className="flex items-center justify-between gap-3">
                    <h3 className="text-base font-semibold text-[#2A1A1A]">{resource.title}</h3>
                    <ExternalLink className="h-4 w-4 text-[#A41E34] opacity-80 group-hover:opacity-100" />
                  </div>
                  <p className="mt-2 text-sm text-[#5B4444]">{resource.description}</p>
                </a>
              ))}
            </div>
          </Card>

          <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
            <h2 className="flex items-center gap-2 text-lg font-semibold text-[#2A1A1A]">
              <MessageCircle className="h-5 w-5 text-[#A41E34]" /> Conversation recap
            </h2>
            <p className="mt-1 text-sm text-[#5B4444]">Scroll through what you told LifeLens and how we responded.</p>
            <div className="mt-4 space-y-3">
              {insights.conversation.map((entry, index) => (
                <div
                  key={`${entry.speaker}-${index}`}
                  className="rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4"
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7F1527]">
                    {entry.speaker === "You" ? "You shared" : "LifeLens replied"}
                  </span>
                  <p className="mt-2 text-sm text-[#3F2A2C]">{entry.message}</p>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      <footer className="sticky bottom-4 z-40 mx-auto w-full max-w-xs rounded-3xl border border-[#E2D5D7] bg-white/95 px-4 py-3 shadow-xl shadow-[#A41E34]/15">
        <div className="grid grid-cols-4 items-center text-xs font-medium text-[#5B4444]">
          <button className="flex flex-col items-center gap-1 text-[#A41E34]">
            <Home className="h-5 w-5" /> Home
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-[#A41E34]">
            <BookOpen className="h-5 w-5" /> Learn
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-[#A41E34]">
            <HelpCircle className="h-5 w-5" /> FAQ
          </button>
          <button className="flex flex-col items-center gap-1 hover:text-[#A41E34]">
            <Settings className="h-5 w-5" /> Profile
          </button>
        </div>
      </footer>
    </div>
  )
}
