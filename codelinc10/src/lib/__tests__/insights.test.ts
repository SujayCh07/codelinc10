import { describe, expect, it } from "vitest"

import { DEFAULT_ENROLLMENT_FORM } from "@/lib/enrollment"
import { buildChatReply, buildInsights, mergeChatHistory } from "@/lib/insights"
import type { ChatEntry } from "@/lib/types"

describe("insights generation", () => {
  it("derives persona, theme, and timeline from enrollment data", () => {
    const insights = buildInsights({
      ...DEFAULT_ENROLLMENT_FORM,
      householdCoverage: "You + partner",
      financialGoals: ["Buy a home"],
      milestoneFocus: "Secure a first home",
      monthlySavingsRate: 9,
    })

    expect(insights.persona).toBe("Collaborative Planner")
    expect(insights.goalTheme).toBe("Home stretch")
    expect(insights.timeline).toHaveLength(3)
    expect(insights.focusGoal).toBe("Secure a first home")
    expect(insights.resources[0]?.title).toContain("Home")
  })

  it("responds to timeline questions in chat replies", () => {
    const insights = buildInsights(DEFAULT_ENROLLMENT_FORM)
    const reply = buildChatReply("Can you review my timeline?", insights)
    expect(reply).toContain(insights.timeline[0].title)
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
