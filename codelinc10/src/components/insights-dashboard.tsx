"use client"

import { ArrowRight, BookOpen, MessageCircle, RefreshCw, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LifeLensInsights } from "@/lib/types"

interface InsightsDashboardProps {
  insights: LifeLensInsights
  onBackToLanding: () => void
  onRegenerate: () => void
  onRestartQuiz: () => void
}

const PRIORITY_ICONS = ["🛡️", "💡", "📈"]

export function InsightsDashboard({ insights, onBackToLanding, onRegenerate, onRestartQuiz }: InsightsDashboardProps) {
  const openChat = (prompt?: string) => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent("lifelens-open-chat", { detail: { prompt } }))
  }

  return (
    <div className="relative min-h-screen bg-[#F7F4F2] pb-32 text-[#2A1A1A]">
      <header className="sticky top-0 z-40 border-b border-[#E2D5D7] bg-[#F7F4F2]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-5 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#A41E34]">Here’s what LifeLens found for you, {insights.ownerName}.</p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7F1527]">Based on your household, coverage, and financial goals.</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
              {insights.persona}
            </span>
            <Button
              variant="outline"
              className="rounded-full border-[#A41E34]/30 text-sm font-semibold text-[#A41E34] hover:bg-[#F9EDEA]"
              onClick={onRegenerate}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh plan
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-sm font-semibold text-[#A41E34] hover:text-[#7F1527]"
              onClick={onBackToLanding}
            >
              Start over
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-5 py-6">
        <Card className="overflow-hidden rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-2">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7F1527]">Your focus</p>
              <h1 className="text-2xl font-semibold text-[#2A1A1A]">{insights.focusGoal}</h1>
              <p className="text-sm text-[#4D3B3B]">{insights.statement}</p>
            </div>
            <div className="space-y-2 text-right sm:text-left">
              {insights.goalTheme && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
                  <Sparkles className="h-3 w-3" /> {insights.goalTheme}
                </span>
              )}
              <div className="rounded-2xl bg-[#F9EDEA] px-4 py-3 text-sm font-semibold text-[#A41E34]">
                <Sparkles className="mr-2 inline h-4 w-4" /> LifeLens spotlight
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Quick nudges</p>
            <div className="flex flex-wrap gap-2">
              {insights.tips.map((tip) => (
                <span
                  key={tip.title}
                  className="inline-flex items-center gap-2 rounded-full bg-[#FCEBE6] px-4 py-2 text-xs font-semibold text-[#7F1527]"
                  title={tip.description}
                >
                  <span className="text-base">{tip.icon}</span>
                  {tip.title}
                </span>
              ))}
            </div>
          </div>
        </Card>

        <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {insights.priorities.slice(0, 3).map((priority, index) => (
            <Card key={priority.title} className="rounded-3xl border border-[#E2D5D7] bg-white p-5 shadow-md">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCEBE6] text-lg">
                  {PRIORITY_ICONS[index] ?? "⭐"}
                </div>
                <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Priority {index + 1}</span>
              </div>
              <h3 className="mt-3 text-lg font-semibold text-[#2A1A1A]">{priority.title}</h3>
              <p className="mt-2 text-sm text-[#4D3B3B]">{priority.description}</p>
              <Button
                variant="ghost"
                className="mt-4 h-auto justify-start gap-2 px-0 text-sm font-semibold text-[#A41E34] hover:text-[#7F1527]"
                onClick={onRestartQuiz}
              >
                Adjust answers <ArrowRight className="h-4 w-4" />
              </Button>
            </Card>
          ))}
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2A1A1A]">Timeline to act with confidence</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#7F1527]">Swipe to explore</span>
          </div>
          <div className="flex gap-4 overflow-x-auto pb-2 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {insights.timeline.map((item) => (
              <Card key={item.title} className="min-w-[220px] flex-1 rounded-3xl border border-[#E2D5D7] bg-white p-5 shadow-md">
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">{item.period}</p>
                <h3 className="mt-3 text-base font-semibold text-[#2A1A1A]">{item.title}</h3>
                <p className="mt-2 text-sm text-[#4D3B3B]">{item.description}</p>
              </Card>
            ))}
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr),minmax(0,1fr)]">
          <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCEBE6] text-[#A41E34]">
                <BookOpen className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#2A1A1A]">Learning feed from Lincoln</h2>
                <p className="text-sm text-[#4D3B3B]">Tap into curated lessons for your priorities.</p>
              </div>
            </div>
            <div className="mt-5 space-y-4">
              {insights.resources.map((resource) => (
                <a
                  key={resource.title}
                  href={resource.url}
                  target="_blank"
                  rel="noreferrer"
                  className="group block rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4 transition hover:border-[#A41E34] hover:bg-white"
                >
                  <p className="text-sm font-semibold text-[#2A1A1A]">{resource.title}</p>
                  <p className="mt-1 text-sm text-[#4D3B3B]">{resource.description}</p>
                  <span className="mt-3 inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34] opacity-0 transition group-hover:opacity-100">
                    View resource <ArrowRight className="h-3 w-3" />
                  </span>
                </a>
              ))}
            </div>
          </Card>

          <Card className="flex flex-col gap-5 rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-md">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FCEBE6] text-[#A41E34]">
                <MessageCircle className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold text-[#2A1A1A]">Chat-ready recap</h2>
                <p className="text-sm text-[#4D3B3B]">Scroll the last exchange and jump back in.</p>
              </div>
            </div>
            <div className="space-y-3">
              {insights.conversation.map((entry, index) => (
                <div
                  key={`${entry.speaker}-${index}`}
                  className={`rounded-2xl border border-[#F0E6E7] p-4 text-sm shadow-sm ${
                    entry.speaker === "You"
                      ? "bg-[#FDF4EF] text-[#2A1A1A]"
                      : "bg-white text-[#3F2A2C]"
                  }`}
                >
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">
                    {entry.speaker === "You" ? "You" : "LifeLens"}
                  </span>
                  <p className="mt-2 leading-relaxed">{entry.message}</p>
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Suggested prompts</p>
              <div className="flex flex-wrap gap-2">
                {insights.prompts.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => openChat(prompt)}
                    className="rounded-full border border-[#F0E6E7] bg-[#FBF7F6] px-4 py-2 text-xs font-semibold text-[#7F1527] transition hover:border-[#A41E34] hover:bg-[#F9EDEA]"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
              <Button
                className="w-full rounded-full bg-[#A41E34] py-5 text-sm font-semibold text-white hover:bg-[#7F1527]"
                onClick={() => openChat()}
              >
                <MessageCircle className="mr-2 h-4 w-4" /> Chat with LifeLens
              </Button>
            </div>
          </Card>
        </section>
      </main>
    </div>
  )
}
