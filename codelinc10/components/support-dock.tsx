"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { MessageCircle, X } from "lucide-react"

import { Button } from "@/components/ui/button"

interface SupportDockProps {
  persona?: string
  focusGoal?: string
  screen: string
  onBackToLanding?: () => void
}

export function SupportDock({ persona, focusGoal, screen, onBackToLanding }: SupportDockProps) {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return
    const listener: EventListener = () => setOpen(true)
    window.addEventListener("lifelens-open-chat", listener)
    return () => {
      window.removeEventListener("lifelens-open-chat", listener)
    }
  }, [])

  if (screen === "landing") {
    return null
  }

  return (
    <div className="fixed bottom-20 right-4 z-50 flex w-[min(320px,90vw)] flex-col items-end gap-3 text-[#2A1A1A]">
      <AnimatePresence>
        {open && (
          <motion.div
            key="support-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full rounded-3xl border border-[#E2D5D7] bg-white p-4 shadow-2xl"
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Need clarity?</p>
                <p className="text-base font-semibold">LifeLens guide</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                aria-label="Close support"
                className="rounded-full p-1 text-[#7F1527] transition hover:bg-[#F0E6E7]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mt-3 space-y-2 text-sm text-[#4D3B3B]">
              <p>
                {persona ? `You're viewing the ${persona} plan.` : "LifeLens is listening."}
              </p>
              <p>
                {focusGoal
                  ? `We’re tracking your focus on ${focusGoal.toLowerCase()}. Ask anything or jump back to resources.`
                  : "Ask anything about your benefits, budget, or next milestone."}
              </p>
            </div>
            <div className="mt-4 flex flex-wrap gap-2 text-xs">
              <span className="rounded-full bg-[#F1E3E5] px-3 py-1 text-[#7F1527]">Benefits overview</span>
              <span className="rounded-full bg-[#F1E3E5] px-3 py-1 text-[#7F1527]">Link past chats</span>
              <span className="rounded-full bg-[#F1E3E5] px-3 py-1 text-[#7F1527]">Share with coach</span>
            </div>
            <div className="mt-4 flex items-center justify-between gap-3">
              {onBackToLanding && (
                <Button
                  variant="ghost"
                  className="text-xs font-semibold text-[#A41E34] hover:text-[#7F1527]"
                  onClick={onBackToLanding}
                >
                  Start over
                </Button>
              )}
              <Button className="flex-1 rounded-2xl bg-[#A41E34] text-sm font-semibold text-white hover:bg-[#7F1527]">
                Ask LifeLens
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <motion.button
        type="button"
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-[#E2D5D7] bg-white px-4 py-2 text-sm font-semibold text-[#7F1527] shadow-lg shadow-[#A41E34]/15"
        whileTap={{ scale: 0.96 }}
      >
        <MessageCircle className="h-5 w-5" />
        {open ? "Hide chat" : "LifeLens assistant"}
      </motion.button>
    </div>
  )
}
