"use client"
import { useEffect, useMemo, useRef, useState } from "react"
import { askLifeLens } from "@/lib/chat"
import { Loader2, X } from "lucide-react"

type Role = "user" | "assistant" | "error" | "system"
type Msg = { id: string; role: Role; content: string; ts: number; provider?: "bedrock" | "claude-fallback" }

export function ChatModal({
  initialOpen = false, onClose, persona, focusGoal, userId, sessionId, baseContext
}: { initialOpen?: boolean; onClose?: () => void; persona?: string; focusGoal?: string; userId?: string; sessionId?: string; baseContext?: Record<string, unknown> }) {
  const [open, setOpen] = useState(initialOpen)
  const [input, setInput] = useState("")
  const [sending, setSending] = useState(false)
  const [messages, setMessages] = useState<Msg[]>([])
  const scrollRef = useRef<HTMLDivElement>(null)

  const sid = useMemo(() => {
    if (sessionId) return sessionId
    if (typeof window !== "undefined") {
      const key = "__lifelens_session"; const ex = (window as any)[key]
      if (ex) return ex as string; const v = crypto.randomUUID(); (window as any)[key] = v; return v
    } return "server-session"
  }, [sessionId])

  useEffect(() => {
    function onOpen(evt: Event) {
      const d = (evt as CustomEvent).detail as { prompt?: string; context?: Record<string, unknown> } | undefined
      setOpen(true)
      if (d?.prompt?.trim()) {
        const text = d.prompt.trim()
        setMessages(m => [...m, { id: crypto.randomUUID(), role: "user", ts: Date.now(), content: text }])
        void send(text, d.context)
      }
    }
    window.addEventListener("lifelens:chat:open", onOpen as any)
    return () => window.removeEventListener("lifelens:chat:open", onOpen as any)
  }, [])

  useEffect(() => {
    if (!open || messages.length) return
    const intro = persona && focusGoal
      ? `Hi! Let's prioritize "${focusGoal}" in your ${persona} plan. Ask anything—benefits, budget, or next steps.`
      : "Hi! Ask anything about your benefits, budget, or next steps."
    setMessages([{ id: crypto.randomUUID(), role: "assistant", ts: Date.now(), content: intro }])
  }, [open, persona, focusGoal, messages.length])

  useEffect(() => { scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" }) }, [messages, sending])

  function close() { setOpen(false); onClose?.() }

  async function send(textParam?: string, extraContext?: Record<string, unknown>) {
    const text = (textParam ?? input).trim(); if (!text || sending) return
    if (!textParam) { setMessages(m => [...m, { id: crypto.randomUUID(), role:"user", ts: Date.now(), content: text }]); setInput("") }
    setSending(true)
    try {
      const payload = await askLifeLens({ prompt: text, userId, sessionId: sid, context: { ...(baseContext||{}), ...(extraContext||{}) } })
      if ("error" in payload) setMessages(m => [...m, { id: crypto.randomUUID(), role:"error", ts: Date.now(), content: `Error: ${payload.error}` }])
      else setMessages(m => [...m, { id: crypto.randomUUID(), role:"assistant", ts: Date.now(), content: payload.message || "(no content)", provider: payload.provider }])
    } catch (e:any) {
      setMessages(m => [...m, { id: crypto.randomUUID(), role:"error", ts: Date.now(), content: `Network error: ${String(e)}` }])
    } finally { setSending(false) }
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); void send() }
  }

  if (!open) return null

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/40 p-4 sm:items-center">
      <div className="w-full max-w-2xl overflow-hidden rounded-2xl bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b px-5 py-4">
          <div>
            <div className="text-[12px] font-semibold tracking-[0.18em] text-[#7F1527]">LIFELENS CHAT</div>
            <div className="text-sm text-[#7F1527]/70">Ask anything about your benefits</div>
          </div>
          <button onClick={close} aria-label="Close" className="rounded-full p-1 text-[#7F1527] hover:bg-[#F0E6E7]"><X className="h-4 w-4" /></button>
        </div>

        <div className="flex flex-wrap gap-2 border-b px-5 py-3 text-xs">
          <button className="rounded-full bg-[#F1E3E5] px-3 py-1 text-[#7F1527]" onClick={() => setInput("Summarize my priorities")}>Summarize my priorities</button>
          <button className="rounded-full bg-[#F1E3E5] px-3 py-1 text-[#7F1527]" onClick={() => setInput("What should I tackle next?")}>What should I tackle next?</button>
          <button className="rounded-full bg-[#F1E3E5] px-3 py-1 text-[#7F1527]" onClick={() => setInput("Email my plan to HR")}>Email my plan to HR</button>
        </div>

        <div ref={scrollRef} className="max-h-[52vh] space-y-3 overflow-y-auto px-5 py-4">
          {messages.map(m => (
            <div key={m.id} className={`flex ${m.role === "user" ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[85%] rounded-2xl px-3 py-2 text-sm ${
                m.role === "user" ? "rounded-br-sm bg-[#A41E34] text-white" :
                m.role === "error" ? "border border-red-200 bg-red-50 text-red-800" :
                "rounded-bl-sm bg-[#F7F2F3] text-[#3B2D2D]"}`}>
                {m.content}
                {m.role === "assistant" && m.provider &&
                  <div className="mt-1 text-[10px] text-[#7F1527]/70">{m.provider === "bedrock" ? "Bedrock" : "Claude fallback"}</div>}
              </div>
            </div>
          ))}
          {sending && <div className="flex justify-start"><div className="flex items-center gap-2 rounded-2xl bg-[#F7F2F3] px-3 py-2 text-sm text-[#3B2D2D]"><Loader2 className="h-4 w-4 animate-spin" /> Thinking…</div></div>}
        </div>

        <div className="flex items-end gap-2 border-t px-5 py-4">
          <textarea value={input} onChange={(e)=>setInput(e.target.value)} onKeyDown={onKeyDown} placeholder="Press Enter to send • Shift+Enter for a new line" className="min-h-[52px] max-h-[140px] w-full resize-y rounded-2xl border border-[#E6D7D9] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#A41E34]/20" />
          <button onClick={()=>void send()} disabled={sending || !input.trim()} className="flex items-center gap-2 rounded-2xl bg-[#A41E34] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">Send</button>
        </div>
      </div>
    </div>
  )
}
