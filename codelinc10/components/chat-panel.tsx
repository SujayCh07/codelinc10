"use client"

import { useEffect, useRef, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"

export interface ChatEntry {
  speaker: "LifeLens" | "You"
  message: string
  timestamp: string
}

interface ChatPanelProps {
  history: ChatEntry[]
  onSend: (message: string) => void
}

export function ChatPanel({ history, onSend }: ChatPanelProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail
      setOpen(true)
      if (detail?.prompt) {
        setDraft(detail.prompt)
        setPendingPrompt(detail.prompt)
      }
    }

    window.addEventListener("lifelens-open-chat", handler)
    return () => window.removeEventListener("lifelens-open-chat", handler)
  }, [])

  useEffect(() => {
    if (!open) return
    const timeout = window.setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight
      }
    }, 60)
    return () => window.clearTimeout(timeout)
  }, [history, open])

  useEffect(() => {
    if (!pendingPrompt) return
    const timeout = window.setTimeout(() => setPendingPrompt(null), 1500)
    return () => window.clearTimeout(timeout)
  }, [pendingPrompt])

  const handleSend = () => {
    const message = draft.trim()
    if (!message) return
    onSend(message)
    setDraft("")
    setPendingPrompt(null)
  }

  return (
    <div className="fixed bottom-20 right-6 z-[60] flex w-[min(380px,92vw)] flex-col items-end gap-3">
      <motion.button
        type="button"
        whileTap={{ scale: 0.95 }}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-2 rounded-full border border-[#E2D5D7] bg-white px-4 py-2 text-sm font-semibold text-[#7F1527] shadow-lg shadow-[#A41E34]/15"
      >
        <MessageCircle className="h-4 w-4" />
        {open ? "Hide chat" : "Open chat"}
      </motion.button>

      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-panel"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            transition={{ duration: 0.2 }}
            className="w-full overflow-hidden rounded-3xl border border-[#E2D5D7] bg-white shadow-2xl"
          >
            <header className="flex items-center justify-between border-b border-[#F0E6E7] px-5 py-4">
              <div>
                <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">LifeLens chat</p>
                <p className="text-sm font-semibold text-[#2A1A1A]">Ask anything about your benefits</p>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="rounded-full p-1 text-[#7F1527] transition hover:bg-[#F0E6E7]"
                aria-label="Close chat"
              >
                <X className="h-4 w-4" />
              </button>
            </header>

            <div ref={bodyRef} className="flex max-h-[320px] flex-col gap-3 overflow-y-auto px-5 py-4">
              {history.length === 0 && (
                <p className="text-sm text-[#6F4D51]">
                  LifeLens remembers your questionnaire and insight history. Ask a question to see it in action.
                </p>
              )}
              {history.map((entry, index) => (
                <div
                  key={`${entry.speaker}-${index}-${entry.timestamp}`}
                  className={`flex flex-col ${entry.speaker === "You" ? "items-end" : "items-start"}`}
                >
                  <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
                    {entry.speaker}
                  </span>
                  <div
                    className={`mt-1 max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                      entry.speaker === "You"
                        ? "bg-[#A41E34] text-white shadow-[#A41E34]/30"
                        : "bg-[#F9EDEA] text-[#2A1A1A] shadow-[#A41E34]/10"
                    }`}
                  >
                    {entry.message}
                  </div>
                  <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#9B8587]">
                    {new Date(entry.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                  </span>
                </div>
              ))}
              {pendingPrompt && (
                <p className="rounded-2xl bg-[#F1E3E5] px-4 py-2 text-xs text-[#7F1527]">
                  Prompt ready: <span className="font-semibold">{pendingPrompt}</span>
                </p>
              )}
            </div>

            <div className="space-y-3 border-t border-[#F0E6E7] px-5 py-4">
              <Textarea
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Ask LifeLens about benefits, timelines, or financial moves…"
                className="h-24 resize-none border-[#E2D5D7]"
              />
              <Button
                onClick={handleSend}
                disabled={!draft.trim()}
                className="w-full rounded-full bg-[#A41E34] text-sm font-semibold text-white hover:bg-[#7F1527]"
              >
                Send
                <Send className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
