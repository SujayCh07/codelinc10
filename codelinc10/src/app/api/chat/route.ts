import { NextResponse } from "next/server"

import { getStore } from "../_store"
import { buildChatReply } from "@/lib/insights"

export async function POST(request: Request) {
  try {
    const { userId, message } = (await request.json()) as { userId?: string; message?: string }
    if (!userId || !message) {
      return NextResponse.json({ error: "Missing user or message" }, { status: 400 })
    }

    const store = getStore()
    const insights = store.insights.get(userId)
    const replyText = buildChatReply(message, insights ?? null)

    const history = store.chats.get(userId) ?? []
    const reply = {
      speaker: "FinMate" as const,
      message: replyText,
      timestamp: new Date().toISOString(),
      status: "final" as const,
    }
    store.chats.set(userId, [...history, reply])

    return NextResponse.json({ reply })
  } catch (error) {
    console.error("Chat route error", error)
    return NextResponse.json({ error: "Unable to generate reply" }, { status: 500 })
  }
}
