import { NextResponse } from "next/server"

import { getStore } from "../_store"
import { buildInsights, withDerivedMetrics } from "@/lib/insights"
import type { EnrollmentFormData } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { userId, profile } = (await request.json()) as { userId?: string; profile?: EnrollmentFormData }
    if (!userId) {
      return NextResponse.json({ error: "Missing userId" }, { status: 400 })
    }

    const store = getStore()
    const preparedProfile = profile
      ? withDerivedMetrics({ ...profile, userId })
      : store.profiles.get(userId)
    if (!preparedProfile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    store.profiles.set(userId, preparedProfile)

    const insights = buildInsights(preparedProfile)
    store.insights.set(userId, insights)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Failed to generate plans", error)
    return NextResponse.json({ error: "Unable to generate plans" }, { status: 500 })
  }
}
