import { NextResponse } from "next/server"

import { getStore } from "../_store"
import { withDerivedMetrics } from "@/lib/insights"
import type { EnrollmentFormData } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { profile } = (await request.json()) as { profile?: EnrollmentFormData }
    if (!profile) {
      return NextResponse.json({ error: "Missing profile" }, { status: 400 })
    }

    const store = getStore()
    const userId = profile.userId ?? crypto.randomUUID()
    const prepared: EnrollmentFormData = withDerivedMetrics({ ...profile, userId })
    store.profiles.set(userId, prepared)

    return NextResponse.json({ userId })
  } catch (error) {
    console.error("Failed to persist LifeLens user", error)
    return NextResponse.json({ error: "Unable to save user" }, { status: 500 })
  }
}
