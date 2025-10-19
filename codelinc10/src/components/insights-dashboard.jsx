"use client"

import { CheckCircle2, ExternalLink, MessageCircle, RefreshCw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LifeLensInsights } from "@/lib/types"
import { cn } from "@/lib/utils"

interface InsightsDashboardProps {
  insights: LifeLensInsights
  onBackToLanding: () => void
  onRegenerate: () => void
  onSelectPlan: (planId: string) => void
  onSendReport: () => void
  loading?: boolean
}

export function InsightsDashboard({
  insights,
  onBackToLanding,
  onRegenerate,
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

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6">
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
                    <p className="mt-3 text-xs uppercase tracking-[0.3em] text-[#7F1527]">Why it fits</p>
                    <p className="mt-1 text-sm text-[#4D3B3B] leading-relaxed">{plan.reasoning}</p>
                  </div>
                  <ul className="space-y-2 text-sm text-[#4D3B3B]">
                    {plan.highlights.map((highlight) => (
                      <li key={highlight} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-1 h-4 w-4 text-[#A41E34]" />
                        <span>{highlight}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="space-y-2">
                    <p className="text-xs uppercase tracking-[0.3em] text-[#7F1527]">Guided next steps</p>
                    <div className="space-y-2 text-sm text-[#4D3B3B]">
                      {plan.resources.map((resource) => (
                        <a
                          key={resource.title}
                          href={resource.url}
                          target="_blank"
                          rel="noreferrer"
                          className="group flex items-start gap-2 rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-3 transition hover:border-[#A41E34] hover:bg-white"
                        >
                          <ExternalLink className="mt-1 h-4 w-4 text-[#A41E34]" />
                          <span>
                            <span className="block font-semibold text-[#2A1A1A]">{resource.title}</span>
                            <span className="text-xs text-[#7F1527] leading-relaxed">{resource.description}</span>
                          </span>
                        </a>
                      ))}
                    </div>
                  </div>
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
          <Button
            onClick={onSendReport}
            className="w-full rounded-full bg-[#A41E34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7F1527]"
          >
            Send to HR
            <Send className="ml-2 h-4 w-4" />
          </Button>
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

        <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-md">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-[#2A1A1A]">Keep exploring with LifeLens</h2>
              <p className="text-sm text-[#4D3B3B]">Jump back into chat for follow-up questions or share your plan.</p>
            </div>
            <Button
              className="rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7F1527]"
              onClick={() => openChat()}
            >
              Chat with LifeLens
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
