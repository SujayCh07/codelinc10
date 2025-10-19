import { NextResponse } from "next/server"

import { getStore } from "../_store"
import { generateInsightsWithClaude } from "@/lib/bedrock"
import { buildInsights, withDerivedMetrics } from "@/lib/insights"
import type { EnrollmentFormData } from "@/lib/types"

export async function POST(request: Request) {
  try {
    const { userId, profile } = (await request.json()) as {
      userId?: string
      profile?: EnrollmentFormData
    }
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

    // Build local insights first
    let insights = buildInsights(preparedProfile)

    // Try to enhance with Claude AI insights if AWS is configured
    if (process.env.AWS_ACCESS_KEY_ID && process.env.AWS_SECRET_ACCESS_KEY) {
      try {
        const claudeInsights = await generateInsightsWithClaude(preparedProfile)
        // Merge Claude insights with local insights
        insights = {
          ...insights,
          ...claudeInsights,
          // Keep the plans and timeline from local insights
          plans: insights.plans,
          timeline: insights.timeline,
          conversation: insights.conversation,
          prompts: insights.prompts,
          selectedPlanId: insights.selectedPlanId,
        }
      } catch (bedrockError) {
        console.error("Bedrock generation failed (using local insights):", bedrockError)
      }
    }

    store.insights.set(userId, insights)

    return NextResponse.json({ insights })
  } catch (error) {
    console.error("Failed to generate plans", error)
    return NextResponse.json({ error: "Unable to generate plans" }, { status: 500 })
  }
}
