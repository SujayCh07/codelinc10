export type UpsertUserProfileInput = {
  user_id: string
  payload: Record<string, unknown>
}

async function postDb(body: Record<string, unknown>) {
  const res = await fetch("/api/db", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  })
  const ct = res.headers.get("content-type") || ""
  const responseBody = ct.includes("application/json") ? await res.json() : await res.text()
  if (!res.ok) {
    const message = typeof responseBody === "string" ? responseBody : responseBody?.error || "db_request_failed"
    throw new Error(message)
  }
  return responseBody
}

export async function upsertUserProfile(input: UpsertUserProfileInput) {
  return postDb({ action: "upsert_user_profile", ...input })
}

export type SaveChatSessionInput = {
  user_id: string
  payload: {
    session_id?: string
    timestamp?: string
    session_history: Array<{ role: string; content: string; ts?: number }>
  }
}

export async function saveChatSession(input: SaveChatSessionInput) {
  return postDb({ action: "save_chat_session", ...input })
}
