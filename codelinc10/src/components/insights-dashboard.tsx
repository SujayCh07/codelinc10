"use client"

import { ArrowRight, CheckCircle2, MessageCircle, RefreshCw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LifeLensInsights } from "@/lib/types"
import { cn } from "@/lib/utils"

interface InsightsDashboardProps {
  insights: LifeLensInsights
  onBackToLanding: () => void
  onRegenerate: () => void
  onRestartQuiz: () => void
  onSelectPlan: (planId: string) => void
  onSendReport: () => void
  loading?: boolean
}

export function InsightsDashboard({
  insights,
  onBackToLanding,
  onRegenerate,
  onRestartQuiz,
  onSelectPlan,
  onSendReport,
  loading,
}: InsightsDashboardProps) {
  const openChat = (prompt?: string) => {
    if (typeof window === "undefined") return
    window.dispatchEvent(new CustomEvent("lifelens-open-chat", { detail: { prompt } }))
  }

  return (
    <div className="relative min-h-screen bg-[#F7F4F2] pb-32 text-[#2A1A1A]">
      <header className="sticky top-0 z-40 border-b border-[#E2D5D7] bg-[#F7F4F2]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-semibold text-[#A41E34]">{insights.persona}</p>
            <p className="text-xs uppercase tracking-[0.3em] text-[#7F1527]">Your LifeLens plan is ready</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-[#A41E34]/30 text-sm font-semibold text-[#A41E34] hover:bg-[#F9EDEA]"
              onClick={onRegenerate}
              disabled={loading}
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

      <main className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-6 py-6">
        <Card className="overflow-hidden rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-3">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7F1527]">Your focus</p>
              <h1 className="text-2xl font-semibold text-[#2A1A1A]">{insights.focusGoal}</h1>
              <p className="text-sm leading-relaxed text-[#4D3B3B]">{insights.statement}</p>
            </div>
            <div className="space-y-2 text-right sm:text-left">
              {insights.goalTheme && (
                <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
                  {insights.goalTheme}
                </span>
              )}
              <Button
                className="w-full rounded-full bg-[#A41E34] py-3 text-sm font-semibold text-white hover:bg-[#7F1527]"
                onClick={() => openChat("What should I do first?")}
              >
                Ask LifeLens
                <MessageCircle className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2A1A1A]">Choose your plan lane</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#7F1527]">Three tailored options</span>
          </div>
          <div className="grid gap-4 lg:grid-cols-3">
            {insights.plans.map((plan) => {
              const isSelected = plan.planId === insights.selectedPlanId
              return (
                <Card
                  key={plan.planId}
                  className={cn(
                    "flex h-full flex-col gap-4 rounded-3xl border bg-white p-5 shadow-md transition",
                    isSelected ? "border-[#A41E34] shadow-[#A41E34]/20" : "border-[#E2D5D7] hover:border-[#A41E34]/40"
                  )}
                >
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">{plan.monthlyCostEstimate}</p>
                    <h3 className="mt-2 text-lg font-semibold text-[#2A1A1A]">{plan.planName}</h3>
                    <p className="mt-2 text-sm text-[#4D3B3B]">{plan.shortDescription}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-[#4D3B3B]">
                    {plan.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-1 h-4 w-4 text-[#A41E34]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="mt-auto flex items-center justify-between text-sm text-[#7F1527]">
                    <span>Risk match: {plan.riskMatchScore}</span>
                    <Button
                      size="sm"
                      variant={isSelected ? "default" : "outline"}
                      className={cn(
                        "rounded-full text-xs font-semibold",
                        isSelected
                          ? "bg-[#A41E34] text-white hover:bg-[#7F1527]"
                          : "border-[#A41E34]/40 text-[#A41E34] hover:border-[#A41E34]"
                      )}
                      onClick={() => onSelectPlan(plan.planId)}
                    >
                      {isSelected ? "Selected" : "Select"}
                    </Button>
                  </div>
                </Card>
              )
            })}
          </div>
          <div className="flex flex-wrap items-center justify-between gap-3">
            <Button
              onClick={onRestartQuiz}
              variant="ghost"
              className="rounded-full text-sm font-semibold text-[#A41E34] hover:text-[#7F1527]"
            >
              Re-take quiz
            </Button>
            <Button
              onClick={onSendReport}
              className="rounded-full bg-[#A41E34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7F1527]"
            >
              Send to HR
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2A1A1A]">Timeline to act</h2>
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
            <div className="mb-4 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-[#2A1A1A]">Resources to dive deeper</h2>
                <p className="text-sm text-[#4D3B3B]">Tailored links based on your focus.</p>
              </div>
            </div>
            <div className="space-y-4">
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

          <Card className="flex flex-col gap-4 rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-md">
            <div>
              <h2 className="text-lg font-semibold text-[#2A1A1A]">Chat-ready recap</h2>
              <p className="text-sm text-[#4D3B3B]">See the latest voice of LifeLens and jump back into chat.</p>
            </div>
            <div className="space-y-3">
              {insights.conversation.map((entry, index) => (
                <div
                  key={`${entry.speaker}-${index}`}
                  className={cn(
                    "rounded-2xl border border-[#F0E6E7] p-4 text-sm shadow-sm",
                    entry.speaker === "You" ? "bg-[#FDF4EF] text-[#2A1A1A]" : "bg-white text-[#3F2A2C]"
                  )}
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
