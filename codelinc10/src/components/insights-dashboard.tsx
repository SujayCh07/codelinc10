"use client"

import { AlertCircle, ExternalLink, MessageCircle, RefreshCw, Send } from "lucide-react"

import { openFinMateChat } from "@/components/chat-bus"
import { InsightsVisualization } from "@/components/insights-visualization"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { FinMateInsights } from "@/lib/types"

interface InsightsDashboardProps {
  insights: FinMateInsights
  onBackToLanding: () => void
  onRegenerate: () => void
  onSendReport: () => void
  loading?: boolean
  usingPlaceholder?: boolean
}

export function InsightsDashboard({
  insights,
  onBackToLanding,
  onRegenerate,
  onSendReport,
  loading,
  usingPlaceholder = false,
}: InsightsDashboardProps) {
  const topPriority = insights.priorityBenefits[0]

  return (
    <div className="relative min-h-screen bg-[#F7F4F2] pb-32 text-[#2A1A1A]">
      {usingPlaceholder && (
        <div className="sticky top-0 z-50 border-b border-[#E2D5D7] bg-[#FFF9E6] px-6 py-3">
          <div className="mx-auto flex w-full max-w-5xl items-center gap-2 text-sm">
            <AlertCircle className="h-4 w-4 text-[#A41E34]" />
            <span className="font-medium text-[#4D3B3B]">
              * Using placeholder data. Add your profile information to see personalized insights.
            </span>
          </div>
        </div>
      )}
      <header className="sticky top-0 z-40 border-b border-[#E2D5D7] bg-[#F7F4F2]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-6 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Priority guidance</p>
            <h1 className="text-lg font-semibold text-[#2A1A1A] sm:text-xl">{insights.focusGoal}</h1>
            {topPriority && (
              <p className="text-sm text-[#4D3B3B]">Next up: {topPriority.title}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-[#A41E34]/30 text-sm font-semibold text-[#A41E34] hover:bg-[#F9EDEA]"
              onClick={onRegenerate}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh priorities
            </Button>
            <Button
              variant="ghost"
              className="rounded-full text-sm font-semibold text-[#A41E34] hover:text-[#7F1527]"
              onClick={onBackToLanding}
            >
              Home
            </Button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-col gap-8 px-4 py-6">
        <Card className="overflow-hidden rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
          <div className="space-y-4">
  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7F1527]">
    Your focus
  </p>
  <h2 className="text-2xl font-semibold text-[#2A1A1A]">
    {insights.focusGoal}
  </h2>
  <p className="text-sm leading-relaxed text-[#4D3B3B]">
    {insights.statement}
  </p>

  {topPriority && (
    <div className="flex flex-wrap items-center gap-3">
      <div className="inline-flex items-center gap-2 rounded-full bg-[#F9EDEA] px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
        Top priority: {topPriority.title}
      </div>

      <Button
        className="ml-2 rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7F1527]"
        onClick={() =>
          openFinMateChat({
            prompt: topPriority
              ? `How do I start ${topPriority.title.toLowerCase()}?`
              : "What should I do first?",
          })
        }
      >
        Chat about my priorities
        <MessageCircle className="ml-2 h-4 w-4" />
      </Button>
    </div>
  )}
</div>

        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2A1A1A]">Priority benefits to tackle</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#7F1527]">Stay mobile-friendly</span>
          </div>
          <div className="space-y-4">
            {insights.priorityBenefits.map((benefit) => (
              <Card key={benefit.id} className="rounded-3xl border border-[#E2D5D7] bg-white p-5 shadow-md">
                <div className="flex flex-col gap-4">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-2 rounded-full bg-[#F9EDEA] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
                      {benefit.urgency}
                    </span>
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">
                      {benefit.category}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-[#2A1A1A]">{benefit.title}</h3>
                    <p className="mt-2 text-sm text-[#4D3B3B] leading-relaxed">{benefit.description}</p>
                  </div>
                  <div className="rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4 text-sm text-[#4D3B3B]">
                    <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Why it matters</span>
                    <p className="mt-2 leading-relaxed">{benefit.whyItMatters}</p>
                  </div>
                  <div className="space-y-2 text-sm text-[#4D3B3B]">
                    {benefit.actions.map((resource) => (
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
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-xs font-medium uppercase tracking-[0.25em] text-[#7F1527]">Need a hand?</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="rounded-full border-[#A41E34]/30 text-xs font-semibold text-[#A41E34] hover:border-[#A41E34]"
                      onClick={() => openFinMateChat({ prompt: `Help me with ${benefit.title.toLowerCase()}` })}
                    >
                      Ask FinMate about this
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
          <Button
            onClick={onSendReport}
            className="w-full rounded-full bg-[#A41E34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7F1527]"
          >
            Email my priority list to HR
            <Send className="ml-2 h-4 w-4" />
          </Button>
        </section>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2A1A1A]">Financial Overview</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#7F1527]">Visual insights</span>
          </div>
          <InsightsVisualization data={{}} />
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
              <h2 className="text-lg font-semibold text-[#2A1A1A]">Keep exploring with FinMate</h2>
              <p className="text-sm text-[#4D3B3B]">Jump back into chat for follow-up questions or share your plan.</p>
            </div>
            <Button
              className="rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7F1527]"
              onClick={() => openFinMateChat({ prompt: "What should I tackle next based on my plan?" })}
            >
              Chat with FinMate
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </Card>
      </main>
    </div>
  )
}
