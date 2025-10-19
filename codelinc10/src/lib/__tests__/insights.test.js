import { describe, expect, it } from "vitest"

import { DEFAULT_ENROLLMENT_FORM } from "@/lib/enrollment"
import { buildChatReply, buildInsights, mergeChatHistory } from "@/lib/insights"
import type { ChatEntry } from "@/lib/types"

describe("insights generation", () => {
  it("creates three tailored plans and selects a default", () => {
    const insights = buildInsights({
      ...DEFAULT_ENROLLMENT_FORM,
      riskComfort: 4,
      dependents: 1,
    })

    expect(insights.plans).toHaveLength(3)
    expect(insights.selectedPlanId).toEqual(insights.plans[1]?.planId)
    expect(insights.timeline).toHaveLength(3)
  })

  it("responds to cost and plan prompts in chat replies", () => {
    const insights = buildInsights(DEFAULT_ENROLLMENT_FORM)
    const costReply = buildChatReply("What will this cost?", insights)
    expect(costReply).toContain("monthly")
    const planReply = buildChatReply("Tell me about the plan", insights)
    expect(planReply).toContain("highlight")
  })

  it("avoids duplicate chat history entries", () => {
    const existing: ChatEntry[] = [
      { speaker: "LifeLens", message: "Hello", timestamp: "2024-01-01T00:00:00.000Z", status: "final" },
    ]
    const additions: ChatEntry[] = [
      { speaker: "LifeLens", message: "Hello", timestamp: "2024-01-02T00:00:00.000Z", status: "final" },
      { speaker: "You", message: "Thanks", timestamp: "2024-01-02T00:00:01.000Z", status: "final" },
    ]

    const merged = mergeChatHistory(existing, additions)
    expect(merged).toHaveLength(2)
    expect(merged[1]).toMatchObject({ speaker: "You", message: "Thanks" })
  })
})
