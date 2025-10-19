import { NextResponse } from "next/server"

import { getStore } from "../_store"

export async function POST(request: Request) {
  try {
    const { userId, planId } = (await request.json()) as { userId?: string; planId?: string }
    if (!userId || !planId) {
      return NextResponse.json({ error: "Missing user or plan" }, { status: 400 })
    }

    const store = getStore()
    const profile = store.profiles.get(userId)
    const insights = store.insights.get(userId)

    if (!profile || !insights) {
      return NextResponse.json({ error: "Profile not ready" }, { status: 404 })
    }

    const plan = insights.plans.find((entry) => entry.planId === planId) ?? insights.plans[0]
    const topPriority = insights.priorityBenefits[0]?.title ?? "Review guidance"
    const reportContent = `FinMate Report\nUser: ${profile.fullName}\nFocus area: ${insights.focusGoal}\nTop priority: ${topPriority}\nPlan: ${plan.planName}\nReasoning: ${plan.reasoning}\nTimeline: ${insights.timeline
      .map((item) => `- ${item.period}: ${item.title}`)
      .join("\n")}\n`

    const base64 = Buffer.from(reportContent, "utf-8").toString("base64")
    const reportUrl = `data:application/pdf;base64,${base64}`

    return NextResponse.json({ reportUrl })
  } catch (error) {
    console.error("Report generation failed", error)
    return NextResponse.json({ error: "Unable to generate report" }, { status: 500 })
  }
}
