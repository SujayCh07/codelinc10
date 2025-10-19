"use client"

import { useMemo, useState } from "react"
import { ExternalLink, MessageCircle, RefreshCw, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { FinMateInsights } from "@/lib/types"

interface InsightsDashboardProps {
  insights: FinMateInsights
  onBackToLanding: () => void
  onRegenerate: () => void
  onSendReport: () => void
  onOpenChat?: (prompt?: string) => void
  loading?: boolean
}

export function InsightsDashboard({
  insights,
  onBackToLanding,
  onRegenerate,
  onSendReport,
  onOpenChat,
  loading,
}: InsightsDashboardProps) {
  const benefits = useMemo(() => insights.priorityBenefits.slice(0, 3), [insights.priorityBenefits])
  const [activeBenefitId, setActiveBenefitId] = useState<string>(benefits[0]?.id ?? "")
  const activeBenefit = benefits.find((benefit) => benefit.id === activeBenefitId) ?? benefits[0] ?? null

  const highlightSummary = benefits.map((benefit) => benefit.title).join(" · ")

  const handleOpenChat = (prompt?: string) => {
    if (!onOpenChat) return
    onOpenChat(prompt)
  }

  return (
    <div className="relative min-h-screen bg-[#F7F4F2] pb-24 text-[#2A1A1A]">
      <header className="sticky top-0 z-40 border-b border-[#E2D5D7] bg-[#F7F4F2]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between">
          <div className="space-y-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7F1527]">Your benefit picks</p>
            <h1 className="text-xl font-semibold text-[#2A1A1A] sm:text-2xl">Benefit guidance ready</h1>
            {activeBenefit && (
              <p className="text-sm text-[#4D3B3B]">Start with {activeBenefit.title.toLowerCase()} today.</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              className="rounded-full border-[#A41E34]/30 text-sm font-semibold text-[#A41E34] hover:bg-[#F9EDEA]"
              onClick={onRegenerate}
              disabled={loading}
            >
              <RefreshCw className="mr-2 h-4 w-4" /> Refresh list
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
        <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
          <div className="space-y-4">
            <h2 className="text-lg font-semibold text-[#2A1A1A]">You’re set with clear next steps</h2>
            <p className="text-sm leading-relaxed text-[#4D3B3B]">{insights.statement}</p>
            <div className="rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4 text-sm text-[#4D3B3B]">
              <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Highlights</span>
              <p className="mt-2 leading-relaxed">{highlightSummary || "Refresh your answers to see recommended benefits."}</p>
            </div>
            {onOpenChat && (
              <Button
                className="w-full rounded-full bg-[#A41E34] py-3 text-sm font-semibold text-white hover:bg-[#7F1527] sm:w-auto sm:px-8"
                onClick={() => handleOpenChat(activeBenefit ? `How do I get started with ${activeBenefit.title.toLowerCase()}?` : undefined)}
              >
                Ask FinMate about these picks
                <MessageCircle className="ml-2 h-4 w-4" />
              </Button>
            )}
          </div>
        </Card>

        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-[#2A1A1A]">Top three benefits</h2>
            <span className="text-xs uppercase tracking-[0.3em] text-[#7F1527]">Tap to explore</span>
          </div>
          <div className="grid gap-3 sm:grid-cols-3">
            {benefits.map((benefit) => {
              const isActive = activeBenefit?.id === benefit.id
              return (
                <button
                  key={benefit.id}
                  type="button"
                  onClick={() => setActiveBenefitId(benefit.id)}
                  className={`flex h-full flex-col rounded-3xl border px-4 py-5 text-left transition ${
                    isActive
                      ? "border-[#A41E34] bg-white shadow-lg shadow-[#A41E34]/15"
                      : "border-[#E2D5D7] bg-white/70 hover:border-[#A41E34]/40"
                  }`}
                >
                  <span className="inline-flex items-center gap-2 rounded-full bg-[#F9EDEA] px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
                    {benefit.urgency}
                  </span>
                  <h3 className="mt-3 text-base font-semibold text-[#2A1A1A]">{benefit.title}</h3>
                  <p className="mt-2 text-sm text-[#6F4D51] leading-relaxed line-clamp-3">{benefit.description}</p>
                </button>
              )
            })}
          </div>

          {activeBenefit && (
            <Card className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-md">
              <div className="space-y-4">
                <div>
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Why it matters</span>
                  <h3 className="mt-3 text-lg font-semibold text-[#2A1A1A]">{activeBenefit.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-[#4D3B3B]">{activeBenefit.whyItMatters}</p>
                </div>
                <div className="rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4 text-sm text-[#4D3B3B]">
                  <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">What to do</span>
                  <p className="mt-2 leading-relaxed">{activeBenefit.description}</p>
                </div>
                <div className="space-y-2 text-sm text-[#4D3B3B]">
                  {activeBenefit.actions.map((resource) => (
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
            </Card>
          )}
        </section>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            onClick={onSendReport}
            className="w-full rounded-full bg-[#A41E34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7F1527] sm:w-auto"
          >
            Email my benefit picks
            <Send className="ml-2 h-4 w-4" />
          </Button>
          {onOpenChat && (
            <Button
              variant="outline"
              onClick={() => handleOpenChat()}
              className="w-full rounded-full border-[#A41E34]/40 text-sm font-semibold text-[#A41E34] hover:border-[#A41E34] hover:bg-[#F9EDEA] sm:w-auto"
            >
              Chat with FinMate
              <MessageCircle className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}
