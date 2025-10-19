import type { ChatEntry, EnrollmentFormData, LifeLensInsights } from "./types"

interface ApiResult<T> {
  data?: T
  error?: string
}

export async function upsertUser(profile: EnrollmentFormData): Promise<ApiResult<{ userId: string }>> {
  try {
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      return { error: errorBody.error ?? "Failed to save user" }
    }

    const body = (await response.json()) as { userId: string }
    return { data: body }
  } catch (error) {
    console.error("Failed to upsert LifeLens user", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function requestPlans(
  userId: string
): Promise<ApiResult<{ insights: LifeLensInsights }>> {
  try {
    const response = await fetch("/api/generatePlans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      return { error: errorBody.error ?? "Unable to generate plans" }
    }

    const body = (await response.json()) as { insights: LifeLensInsights }
    return { data: body }
  } catch (error) {
    console.error("Failed to generate plans", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendChatMessage(
  userId: string,
  message: string
): Promise<ApiResult<{ reply: ChatEntry }>> {
  try {
    const response = await fetch("/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, message }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      return { error: errorBody.error ?? "Chat failed" }
    }

    const body = (await response.json()) as { reply: ChatEntry }
    return { data: body }
  } catch (error) {
    console.error("Chat API error", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

export async function sendPlanReport(
  userId: string,
  planId: string
): Promise<ApiResult<{ reportUrl: string }>> {
  try {
    const response = await fetch("/api/generateReport", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ userId, planId }),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      return { error: errorBody.error ?? "Unable to generate report" }
    }

    const body = (await response.json()) as { reportUrl: string }
    return { data: body }
  } catch (error) {
    console.error("Report API error", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}
