import { NextResponse } from "next/server"

export const runtime = "nodejs" as const

type ChatRequest = { prompt: string; userId?: string; sessionId?: string; context?: Record<string, unknown> }
type ChatOK = { message: string; provider: "bedrock" | "claude-fallback"; note?: string }
type ChatERR = { error: string; detail?: any; status?: number }

const CLAUDE_MODEL = process.env.CLAUDE_MODEL || "claude-3-haiku-20240307"

function timeoutSignal(ms: number) {
  const c = new AbortController(); const t = setTimeout(() => c.abort(), ms)
  return { signal: c.signal, cancel: () => clearTimeout(t) }
}
const clean = (s?: string | null) => s?.replace(/\s+/g, " ")?.trim() || ""

function extractAssistantText(anyData: any): string | null {
  const data = typeof anyData === "string" ? (()=>{try{return JSON.parse(anyData)}catch{return anyData}})() : anyData
  if (typeof data === "string") return data
  if (!data || typeof data !== "object") return null
  if (typeof (data as any).statusCode === "number" && "body" in (data as any)) {
    try { const inner = typeof (data as any).body === "string" ? JSON.parse((data as any).body) : (data as any).body
      const innerText = extractAssistantText(inner); if (innerText) return innerText
    } catch { if (typeof (data as any).body === "string") return (data as any).body }
  }
  if (typeof (data as any).message === "string") return (data as any).message
  if (typeof (data as any).output === "string") return (data as any).output
  if (Array.isArray((data as any).content) && (data as any).content[0]?.text) return String((data as any).content[0].text)
  if (typeof (data as any).text === "string") return (data as any).text
  return null
}

async function callBedrock(prompt: string, payload: Omit<ChatRequest,"prompt">): Promise<ChatOK> {
  const base = clean(process.env.AI_API_URL)
  const headers: Record<string,string> = { "Content-Type":"application/json" }
  const apiKey = clean(process.env.AI_API_KEY); if (apiKey) headers["x-api-key"] = apiKey
  const { signal, cancel } = timeoutSignal(20000)
  try {
    const res = await fetch(base, { method:"POST", headers, body: JSON.stringify({ prompt, ...payload }), signal })
    const raw = await res.text()
    if (!res.ok) {
      let detail: any = raw; try { const j = JSON.parse(raw); detail = (j as any)?.error ?? j } catch {}
      throw <ChatERR>{ error:"Bedrock upstream error", status: res.status, detail }
    }
    try { const j = JSON.parse(raw); const text = extractAssistantText(j); if (text) return { message: text, provider:"bedrock" } }
    catch { if (raw.trim()) return { message: raw.trim(), provider:"bedrock" } }
    throw <ChatERR>{ error:"Bedrock response had no content" }
  } catch (e: any) {
    if (e?.name === "AbortError") throw <ChatERR>{ error:"Bedrock timeout", status:504, detail:"API Gateway timed out" }
    if (e?.error) throw e as ChatERR
    throw <ChatERR>{ error:"Bedrock network error", detail: String(e?.message ?? e) }
  } finally { cancel() }
}

async function callClaude(prompt: string): Promise<ChatOK> {
  const key = clean(process.env.CLAUDE_API_KEY); if (!key) throw <ChatERR>{ error:"CLAUDE_API_KEY not set" }
  const { signal, cancel } = timeoutSignal(20000)
  try {
    const r = await fetch("https://api.anthropic.com/v1/messages", {
      method:"POST",
      headers:{ "content-type":"application/json","x-api-key":key,"anthropic-version":"2023-06-01" },
      body: JSON.stringify({ model: CLAUDE_MODEL, max_tokens: 512, messages:[{ role:"user", content: prompt }] }), signal
    })
    const raw = await r.text()
    if (!r.ok) { let d:any = raw; try{const j=JSON.parse(raw); d=(j as any)?.error?.message ?? j}catch{}; throw <ChatERR>{ error:"Claude upstream error", status:r.status, detail:d } }
    let data:any={}; try{ data = JSON.parse(raw) } catch { throw <ChatERR>{ error:"Claude invalid JSON", detail: raw } }
    const text = Array.isArray(data?.content) && data.content[0]?.text ? String(data.content[0].text) : ""
    if (!text) throw <ChatERR>{ error:"Claude response had no content", detail: data }
    return { message: text, provider:"claude-fallback" }
  } finally { cancel() }
}

export async function POST(req: Request) {
  try {
    const body = (await req.json()) as ChatRequest
    if (!body?.prompt || typeof body.prompt !== "string") return NextResponse.json({ error:"Missing 'prompt' (string)" }, { status:400 })

    try {
      const ok = await callBedrock(body.prompt, { userId: body.userId, sessionId: body.sessionId, context: body.context })
      return NextResponse.json(ok, { status:200 })
    } catch (bErr: any) {
      try {
        const fallback = await callClaude(body.prompt)
        return NextResponse.json({ ...fallback, note:"Bedrock unavailable; answered with Claude fallback.", bedrockError: bErr }, { status:200 })
      } catch (cErr: any) {
        return NextResponse.json({ error:"Both Bedrock and Claude failed", bedrockError: bErr, claudeError: cErr }, { status:502 })
      }
    }
  } catch (err: any) {
    return NextResponse.json({ error:"Chat proxy failed", detail: String(err?.message ?? err) }, { status:500 })
  }
}
