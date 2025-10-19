"use client"

import { motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import type { ScreenKey } from "@/lib/types"

interface SupportDockProps {
  focusGoal?: string
  topPriority?: string
  screen: ScreenKey
  onBackToLanding?: () => void
  prompts?: string[]
  conversation?: { speaker: "LifeLens" | "You"; message: string }[]
}

export function SupportDock({ focusGoal, topPriority, screen, onBackToLanding, prompts, conversation }: SupportDockProps) {
  if (!focusGoal || screen === "quiz" || screen === "landing") {
    return null
  }

  const latestReply = conversation?.slice().reverse().find((entry) => entry.speaker === "LifeLens")
  const promptList = prompts && prompts.length > 0 ? prompts : [
    "What should I tackle first?",
    "How do these plans differ?",
    "Can you summarize costs?",
  ]

  return (
    <motion.aside
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="hidden md:block fixed bottom-24 left-4 z-40 w-[min(320px,90vw)] rounded-3xl border border-[#E2D5D7] bg-white/95 p-5 text-[#2A1A1A] shadow-xl shadow-[#A41E34]/15"
    >
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Focus area</p>
          <p className="text-base font-semibold">{focusGoal}</p>
          {topPriority && <p className="text-sm text-[#4D3B3B]">Next action: {topPriority}</p>}
        </div>
        {onBackToLanding && (
          <Button
            variant="ghost"
            className="rounded-full px-3 py-1 text-xs font-semibold text-[#A41E34] hover:text-[#7F1527]"
            onClick={onBackToLanding}
          >
            Start over
          </Button>
        )}
      </div>

      {latestReply && (
        <div className="mt-4 rounded-2xl bg-[#FDF4EF] p-3 text-xs text-[#7F1527]">
          <span className="font-semibold">Recent insight:</span> {latestReply.message}
        </div>
      )}

      <div className="mt-4 space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Suggested prompts</p>
        <div className="flex flex-wrap gap-2 text-xs">
          {promptList.map((prompt) => (
            <button
              key={prompt}
              type="button"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.dispatchEvent(new CustomEvent("lifelens-open-chat", { detail: { prompt } }))
                }
              }}
              className="rounded-full border border-[#F0E6E7] bg-[#FBF7F6] px-3 py-1 font-semibold text-[#7F1527] transition hover:border-[#A41E34] hover:bg-[#F9EDEA]"
            >
              {prompt}
            </button>
          ))}
        </div>
        <p className="text-[11px] text-[#7F1527]/70">Use the chat bubble to ask LifeLens anything about your plan.</p>
      </div>
    </motion.aside>
  )
}
