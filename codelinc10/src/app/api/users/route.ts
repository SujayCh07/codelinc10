import { NextResponse } from "next/server"

import { getStore } from "../_store"
import { upsertUserProfile } from "@/lib/dynamodb"
import { withDerivedMetrics } from "@/lib/insights"
import type { EnrollmentFormData } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { profile } = (await request.json()) as {
      profile?: EnrollmentFormData
      record?: Record<string, unknown>
    }
    if (!profile) {
      return NextResponse.json({ error: "Missing profile" }, { status: 400 })
    }

    const store = getStore()
    const userId = profile.userId ?? crypto.randomUUID()
    const prepared: EnrollmentFormData = withDerivedMetrics({ ...profile, userId })
    
    // Store in memory for backward compatibility
    store.profiles.set(userId, prepared)

    // Also save to DynamoDB if AWS credentials are configured
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        await upsertUserProfile(userId, {
          user_id: userId,
          user_email: prepared.email || undefined,
          full_name: prepared.fullName,
          profile_data: prepared as unknown as Record<string, unknown>,
          is_active: "true",
        })
      } catch (dbError) {
        console.error("DynamoDB save failed (continuing with in-memory):", dbError)
      }
    }

    return NextResponse.json({ userId })
  } catch (error) {
    console.error("Failed to persist LifeLens user", error)
    return NextResponse.json({ error: "Unable to save user" }, { status: 500 })
  }
}
