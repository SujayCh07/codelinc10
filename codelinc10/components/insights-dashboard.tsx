"use client"

import type { ComponentType } from "react"

import { motion } from "framer-motion"
import {
  ArrowLeft,
  BookOpen,
  CalendarCheck,
  Clock,
  HelpCircle,
  History,
  RefreshCw,
  Settings,
  ShieldCheck,
  Sparkles,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { TopNav } from "@/components/top-nav"

export interface LifeLensInsights {
  persona: string
  statement: string
  priorities: { title: string; description: string }[]
  tips: { title: string; description: string; icon: TipIcon }[]
  timeline: { period: string; title: string; description: string }[]
  aiPrompt: string
}

type TipIcon = "calendar" | "shield" | "book"

interface InsightsDashboardProps {
  insights: LifeLensInsights
  onBackToHome: () => void
  onRegenerate: () => void
  onRestartQuiz: () => void
}

const tipIconMap: Record<TipIcon, ComponentType<{ className?: string }>> = {
  calendar: CalendarCheck,
  shield: ShieldCheck,
  book: BookOpen,
}

export function InsightsDashboard({ insights, onBackToHome, onRegenerate, onRestartQuiz }: InsightsDashboardProps) {
  return (
    <div className="min-h-screen bg-white text-[#1E1E1E]">
      <TopNav />

      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-[#A41E34]/70 via-[#A41E34]/60 to-[#FF4F00]/40 blur-3xl opacity-70" />
        <div className="relative mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 pb-20 pt-10">
          <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-center">
            <Button
              variant="ghost"
              className="rounded-xl text-sm font-semibold text-[#A41E34] hover:bg-[#A41E34]/10"
              onClick={onBackToHome}
            >
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to Home
            </Button>
            <div className="flex flex-wrap gap-3">
              <Button
                variant="outline"
                className="rounded-xl border-[#A41E34]/30 bg-white px-4 py-2 text-sm font-semibold text-[#A41E34] hover:bg-[#A41E34]/10"
                onClick={onRestartQuiz}
              >
                Restart Questionnaire
              </Button>
              <Button
                className="rounded-xl border border-[#A41E34] bg-white px-4 py-2 text-sm font-semibold text-[#A41E34] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#A41E34]/10"
                onClick={onRegenerate}
              >
                <RefreshCw className="mr-2 h-4 w-4" /> Regenerate Insights
              </Button>
            </div>
          </div>

          <section className="rounded-3xl border border-[#A41E34]/15 bg-white/90 p-8 shadow-xl">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]">Your Personalized Snapshot</p>
                <h1 className="mt-3 text-3xl font-semibold text-[#1E1E1E]">{insights.persona}</h1>
                <p className="mt-2 max-w-3xl text-sm text-[#3D3D3D]">{insights.statement}</p>
              </div>
              <div className="rounded-2xl border border-[#A41E34]/20 bg-white p-4 text-sm text-[#3D3D3D] shadow-sm">
                <p className="font-semibold text-[#A41E34]">AI Prompt Summary</p>
                <p className="mt-2 leading-relaxed">{insights.aiPrompt}</p>
              </div>
            </div>
          </section>

          <motion.section
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="grid gap-6 lg:grid-cols-2"
          >
            <div className="rounded-3xl border border-[#A41E34]/15 bg-gradient-to-br from-white via-white to-[#FFF4EF] p-6 shadow-lg">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-semibold text-[#A41E34]">Top 3 Benefit Priorities</h2>
                <Sparkles className="h-8 w-8 text-[#FF4F00]/70" />
              </div>
              <div className="mt-6 space-y-4">
                {insights.priorities.slice(0, 3).map((priority, index) => (
                  <motion.div
                    key={priority.title}
                    initial={{ opacity: 0, x: -12 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="rounded-2xl border border-[#A41E34]/10 bg-white/90 p-4 shadow-sm"
                  >
                    <div className="flex gap-4">
                      <span className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A41E34]/10 text-sm font-semibold text-[#A41E34]">
                        {index + 1}
                      </span>
                      <div>
                        <h3 className="text-lg font-semibold text-[#1E1E1E]">{priority.title}</h3>
                        <p className="text-sm text-[#3D3D3D]">{priority.description}</p>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>

            <div className="flex flex-col gap-6">
              <div className="rounded-3xl border border-[#A41E34]/15 bg-white/95 p-6 shadow-lg">
                <h2 className="text-2xl font-semibold text-[#A41E34]">Quick Tips</h2>
                <p className="mt-2 text-sm text-[#3D3D3D]">Actionable coaching moments to reinforce your plan.</p>
                <div className="mt-6 space-y-4">
                  {insights.tips.map((tip) => {
                    const Icon = tipIconMap[tip.icon]
                    return (
                      <motion.div
                        key={tip.title}
                        initial={{ opacity: 0, y: 12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.3 }}
                        className="flex items-start gap-3 rounded-2xl border border-[#A41E34]/10 bg-white/90 p-4"
                      >
                        <div className="rounded-xl bg-[#A41E34]/10 p-2 text-[#A41E34]">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h3 className="font-semibold text-[#1E1E1E]">{tip.title}</h3>
                          <p className="text-sm text-[#3D3D3D]">{tip.description}</p>
                        </div>
                      </motion.div>
                    )
                  })}
                </div>
              </div>

              <div className="rounded-3xl border border-[#A41E34]/15 bg-gradient-to-br from-[#FFF7F3] to-white p-6 shadow-lg">
                <h2 className="text-2xl font-semibold text-[#A41E34]">Suggested Next Steps</h2>
                <p className="mt-2 text-sm text-[#3D3D3D]">A focused timeline to keep progress moving.</p>
                <ol className="mt-5 space-y-4">
                  {insights.timeline.slice(0, 3).map((item) => (
                    <motion.li
                      key={item.title}
                      initial={{ opacity: 0, x: 12 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ duration: 0.3 }}
                      className="rounded-2xl border border-[#FF4F00]/20 bg-white/90 p-4"
                    >
                      <div className="text-xs font-semibold uppercase tracking-[0.35em] text-[#FF4F00]">{item.period}</div>
                      <h3 className="mt-2 text-lg font-semibold text-[#1E1E1E]">{item.title}</h3>
                      <p className="text-sm text-[#3D3D3D]">{item.description}</p>
                    </motion.li>
                  ))}
                </ol>
              </div>
            </div>
          </motion.section>

          <section className="rounded-3xl border border-[#A41E34]/15 bg-white/95 p-6 shadow-lg">
            <h2 className="text-xl font-semibold text-[#1E1E1E]">Learning & Support Dock</h2>
            <p className="mt-2 text-sm text-[#3D3D3D]">Jump into deeper guidance whenever you are ready.</p>
            <div className="mt-5 flex flex-wrap justify-between gap-3 rounded-2xl border border-[#A41E34]/10 bg-white/90 p-4 shadow-inner sm:flex-nowrap">
              {[
                { id: "timeline", label: "Timeline", icon: Clock },
                { id: "learning", label: "Learning", icon: BookOpen },
                { id: "history", label: "History", icon: History },
                { id: "faq", label: "FAQ", icon: HelpCircle },
                { id: "settings", label: "Settings", icon: Settings },
              ].map((item) => {
                const Icon = item.icon
                return (
                  <button
                    key={item.id}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl border border-transparent bg-[#F9F5F5] px-4 py-3 text-sm font-semibold text-[#1E1E1E] transition hover:border-[#A41E34]/30 hover:bg-[#A41E34]/10"
                    type="button"
                  >
                    <Icon className="h-4 w-4" />
                    {item.label}
                  </button>
                )
              })}
            </div>
          </section>
        </div>
      </div>
    </div>
  )
}
