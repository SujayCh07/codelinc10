import { NextResponse } from "next/server"

import { getStore } from "../_store"
import { buildInsights } from "@/lib/insights"

export async function POST(request: Request) {
  try {
    const { userId } = (await request.json()) as { userId?: string }
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const store = getStore()
    const profile = store.profiles.get(userId)
    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    const insights = buildInsights(profile)
    store.insights.set(userId, insights)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Failed to generate plans", error)
    return NextResponse.json({ error: "Unable to generate plans" }, { status: 500 })
  }
}
