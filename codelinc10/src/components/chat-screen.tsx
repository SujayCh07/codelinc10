"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import type { KeyboardEvent as ReactKeyboardEvent } from "react"
import { ArrowLeft, MessageCircle, Send } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import type { ChatEntry } from "@/lib/types"

interface ChatScreenProps {
  history: ChatEntry[]
  onSend: (message: string) => void
  onBack: () => void
  pendingPrompt: string | null
  onPromptConsumed: () => void
}

const QUICK_PROMPTS = [
  "Summarize my top benefits",
  "What should I do this week?",
  "Share a resource link",
]

export function ChatScreen({
  history,
  onSend,
  onBack,
  pendingPrompt,
  onPromptConsumed,
}: ChatScreenProps) {
  const [draft, setDraft] = useState("")
  const bodyRef = useRef<HTMLDivElement>(null)
  const textareaRef = useRef<HTMLTextAreaElement>(null)

  useEffect(() => {
    if (!pendingPrompt) return
    setDraft(pendingPrompt)
    onPromptConsumed()
    requestAnimationFrame(() => textareaRef.current?.focus())
  }, [pendingPrompt, onPromptConsumed])

  useEffect(() => {
    if (!bodyRef.current) return
    const container = bodyRef.current
    container.scrollTop = container.scrollHeight
  }, [history, draft])

  const handleSend = () => {
    const message = draft.trim()
    if (!message) return
    onSend(message)
    setDraft("")
  }

  const handleTextareaKeyDown = (event: ReactKeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter" && !event.shiftKey) {
      event.preventDefault()
      handleSend()
    }
  }

  const pendingMessage = useMemo(() => history.find((entry) => entry.status === "pending"), [history])

  return (
    <div className="flex min-h-screen flex-col bg-[#F7F4F2] text-[#2A1A1A]">
      <header className="sticky top-0 z-30 border-b border-[#E2D5D7] bg-[#F7F4F2]/95 backdrop-blur">
        <div className="mx-auto flex w-full max-w-2xl items-center gap-3 px-4 py-4">
          <Button
            type="button"
            variant="ghost"
            onClick={onBack}
            className="h-10 w-10 shrink-0 rounded-full text-[#7F1527] hover:bg-[#F9EDEA]"
            aria-label="Back to insights"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex-1">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7F1527]">LifeLens assistant</p>
            <h1 className="text-lg font-semibold">Ask about your benefits</h1>
            {pendingMessage && (
              <p className="text-xs text-[#7F1527]">Working on a reply…</p>
            )}
          </div>
          <div className="hidden sm:flex items-center justify-center rounded-full border border-[#E2D5D7] bg-white px-3 py-2 text-xs font-semibold text-[#7F1527]">
            <MessageCircle className="mr-2 h-4 w-4" />
            Saved answers loaded
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-hidden">
        <div className="mx-auto flex h-full w-full max-w-2xl flex-col">
          <section className="px-4 pt-4">
            <div className="rounded-3xl border border-[#F0E6E7] bg-white p-4 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7F1527]">Quick prompts</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {QUICK_PROMPTS.map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => {
                      setDraft(prompt)
                      requestAnimationFrame(() => textareaRef.current?.focus())
                    }}
                    className="rounded-full border border-[#E2D5D7] bg-[#FBF7F6] px-3 py-1 text-xs font-semibold text-[#7F1527] transition hover:border-[#A41E34] hover:bg-white"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            </div>
          </section>

          <div ref={bodyRef} className="mt-4 flex-1 overflow-y-auto px-4 pb-24">
            <div className="flex flex-col gap-3">
              {history.length === 0 && (
                <div className="rounded-3xl border border-dashed border-[#E2D5D7] bg-white/60 p-6 text-sm text-[#6F4D51]">
                  LifeLens remembers your questionnaire. Ask anything about coverage, savings, or timelines and we’ll guide you.
                </div>
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
                        isYou ? "bg-[#A41E34] text-white shadow-[#A41E34]/25" : "bg-white text-[#2A1A1A] shadow-[#A41E34]/10"
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
            </div>
          </div>
        </div>
      </main>

      <form
        className="border-t border-[#E2D5D7] bg-white px-4 py-4 pb-[calc(env(safe-area-inset-bottom,0px)+1rem)]"
        onSubmit={(event) => {
          event.preventDefault()
          handleSend()
        }}
      >
        <div className="mx-auto flex w-full max-w-2xl flex-col gap-3">
          <Textarea
            ref={textareaRef}
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={handleTextareaKeyDown}
            placeholder="Ask LifeLens about your benefits, monthly budget, or next steps…"
            className="h-28 resize-none border-[#E2D5D7] bg-[#FBF7F6] text-sm"
          />
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <span className="text-[11px] text-[#7F1527]/70">Press Enter to send · Shift+Enter for a new line</span>
            <Button
              type="submit"
              disabled={!draft.trim()}
              className="inline-flex w-full items-center justify-center rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7F1527] sm:w-auto"
            >
              Send
              <Send className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </form>
    </div>
  )
}
