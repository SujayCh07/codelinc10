export type ChatPayload = { prompt: string; userId?: string; sessionId?: string; context?: Record<string, unknown> }
export type ChatResponse =
  | { message: string; provider: "bedrock" | "claude-fallback"; note?: string }
  | { error: string; [k: string]: any }

export async function askFinMate(input: ChatPayload): Promise<ChatResponse> {
  const res = await fetch("/api/chat", { method:"POST", headers:{ "Content-Type":"application/json" }, body: JSON.stringify(input) })
  const ct = res.headers.get("content-type") || ""
  if (ct.includes("application/json")) {
    const j = await res.json()
    return res.ok ? j : ({ error:"upstream_error", status: res.status, ...j } as any)
  }
  const t = await res.text()
  return res.ok ? ({ message: t, provider:"bedrock" } as any) : ({ error: t || "upstream_error", status: res.status } as any)
}
