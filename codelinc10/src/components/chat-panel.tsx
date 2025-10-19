"use client"

import { useEffect, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Send, X, MessageCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ChatEntry } from "@/lib/types"

interface ChatPanelProps {
  history: ChatEntry[]
  onSend: (message: string) => void
}

export function ChatPanel({ history, onSend }: ChatPanelProps) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState("")
  const [pendingPrompt, setPendingPrompt] = useState<string | null>(null)
  const bodyRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const quickPrompts = [
    "Summarize my priorities",
    "What should I tackle next?",
    "Email my plan to HR",
  ]

  useEffect(() => {
    const handler = (event: Event) => {
      const detail = (event as CustomEvent<{ prompt?: string }>).detail
      setOpen(true)
      if (detail?.prompt) {
        setDraft(detail.prompt)
        setPendingPrompt(detail.prompt)
        requestAnimationFrame(() => textareaRef.current?.focus())
      }
    }

    window.addEventListener("lifelens-open-chat", handler)
    return () => window.removeEventListener("lifelens-open-chat", handler)
  }, [])

  useEffect(() => {
    if (!open) return
    const scrollTimeout = window.setTimeout(() => {
      if (bodyRef.current) {
        bodyRef.current.scrollTop = bodyRef.current.scrollHeight
      }
    }, 60)
    const focusTimeout = window.setTimeout(() => textareaRef.current?.focus(), 90)
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setOpen(false)
      }
    }
    window.addEventListener("keydown", handleKeyDown)
    return () => {
      window.clearTimeout(scrollTimeout)
      window.clearTimeout(focusTimeout)
      window.removeEventListener("keydown", handleKeyDown)
    }
  }, [history, open])

  useEffect(() => {
    if (!pendingPrompt) return
    const timeout = window.setTimeout(() => setPendingPrompt(null), 1500)
    if (textareaRef.current) {
      textareaRef.current.focus()
    }
    return () => window.clearTimeout(timeout)
  }, [pendingPrompt])

  const handleSend = () => {
    const message = draft.trim()
    if (!message) return
    onSend(message)
    setDraft("")
    setPendingPrompt(null)
  }

  const handlePromptClick = (prompt: string) => {
    setOpen(true)
    setDraft(prompt)
    setPendingPrompt(prompt)
    requestAnimationFrame(() => textareaRef.current?.focus())
  }

  const handleTextareaKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[60] flex justify-center pb-[calc(env(safe-area-inset-bottom,0px)+6.5rem)] sm:pb-[calc(env(safe-area-inset-bottom,0px)+5.5rem)]">
        <motion.button
          type="button"
          whileTap={{ scale: 0.95 }}
          onClick={() => setOpen((value) => !value)}
          aria-expanded={open}
          aria-controls="lifelens-chat-panel"
          className="pointer-events-auto flex items-center gap-2 rounded-full border border-[#E2D5D7] bg-white px-4 py-2 text-sm font-semibold text-[#7F1527] shadow-lg shadow-[#A41E34]/15 hover:border-[#A41E34]/30"
        >
          <MessageCircle className="h-4 w-4" />
          {open ? "Hide chat" : "Ask LifeLens"}
        </motion.button>
      </div>

      <AnimatePresence>
        {open && (
          <>
            <motion.button
              key="chat-overlay"
              type="button"
              className="fixed inset-0 z-[55] bg-black/25 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
            />
            <motion.div
              key="chat-drawer"
              initial={{ opacity: 0, y: 32 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 32 }}
              transition={{ duration: 0.25 }}
              className="fixed inset-x-0 bottom-0 z-[60]"
              role="dialog"
              aria-modal="true"
              aria-labelledby="lifelens-chat-heading"
            >
              <div
                id="lifelens-chat-panel"
                className="mx-auto w-full max-w-xl overflow-hidden rounded-t-[32px] border border-[#E2D5D7] bg-white shadow-2xl"
              >
                <header className="flex items-center justify-between border-b border-[#F0E6E7] px-5 py-4">
                  <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">LifeLens chat</p>
                    <h2 id="lifelens-chat-heading" className="text-sm font-semibold text-[#2A1A1A]">
                      Ask anything about your benefits
                    </h2>
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

                <div className="px-5 pt-3">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7F1527]">Quick prompts</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {quickPrompts.map((prompt) => (
                      <button
                        key={prompt}
                        type="button"
                        onClick={() => handlePromptClick(prompt)}
                        className="rounded-full border border-[#F0E6E7] bg-[#FBF7F6] px-3 py-1 text-xs font-semibold text-[#7F1527] transition hover:border-[#A41E34] hover:bg-white"
                      >
                        {prompt}
                      </button>
                    ))}
                  </div>
                </div>

                <div ref={bodyRef} className="flex max-h-[56vh] flex-col gap-3 overflow-y-auto px-5 pb-4 pt-3">
                  {history.length === 0 && (
                    <p className="text-sm text-[#6F4D51]">
                      LifeLens remembers your questionnaire and insight history. Ask a question to see it in action.
                    </p>
                  )}
                  {history.map((entry, index) => {
                    const isYou = entry.speaker === "You"
                    const isPending = entry.status === "pending"
                    return (
                      <div
                        key={`${entry.speaker}-${index}-${entry.timestamp}`}
                        className={`flex flex-col ${isYou ? "items-end" : "items-start"}`}
                      >
                        <span className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
                          {entry.speaker}
                        </span>
                        <div
                          className={`mt-1 max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed shadow ${
                            isYou
                              ? "bg-[#A41E34] text-white shadow-[#A41E34]/30"
                              : "bg-[#F9EDEA] text-[#2A1A1A] shadow-[#A41E34]/10"
                          }`}
                        >
                          {isPending ? (
                            <span className="flex items-center gap-1 text-xs font-medium tracking-[0.3em] text-[#7F1527]">
                              <span className="h-2 w-2 animate-bounce rounded-full bg-current" />
                              <span className="h-2 w-2 animate-bounce delay-150 rounded-full bg-current" />
                              <span className="h-2 w-2 animate-bounce delay-300 rounded-full bg-current" />
                            </span>
                          ) : (
                            entry.message
                          )}
                        </div>
                        <span className="mt-1 text-[10px] uppercase tracking-[0.25em] text-[#9B8587]">
                          {new Date(entry.timestamp).toLocaleTimeString([], { hour: "numeric", minute: "2-digit" })}
                        </span>
                      </div>
                    )
                  })}
                  {pendingPrompt && (
                    <p className="rounded-2xl bg-[#F1E3E5] px-4 py-2 text-xs text-[#7F1527]">
                      Prompt ready: <span className="font-semibold">{pendingPrompt}</span>
                    </p>
                  )}
                </div>

                <form
                  className="space-y-3 border-t border-[#F0E6E7] px-5 pb-5 pt-4 safe-area-bottom"
                  onSubmit={(event) => {
                    event.preventDefault()
                    handleSend()
                  }}
                >
                  <Textarea
                    ref={textareaRef}
                    value={draft}
                    onChange={(event) => setDraft(event.target.value)}
                    onKeyDown={handleTextareaKeyDown}
                    placeholder="Ask LifeLens about benefits, timelines, or financial moves…"
                    className="h-24 resize-none border-[#E2D5D7]"
                  />
                  <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <span className="text-[11px] text-[#7F1527]/70">Press Enter to send · Shift+Enter for a new line</span>
                    <Button
                      type="submit"
                      disabled={!draft.trim()}
                      className="inline-flex w-full items-center justify-center rounded-full bg-[#A41E34] px-5 py-3 text-sm font-semibold text-white hover:bg-[#7F1527] sm:w-auto"
                    >
                      Send
                      <Send className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </form>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  )
}
