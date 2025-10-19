import type { ChatEntry, EnrollmentFormData, LifeLensInsights, PlanResource } from "./types"

interface ApiResult<T> {
  data?: T
  error?: string
}

let lastSubmittedProfile: EnrollmentFormData | null = null

function mapMaritalStatus(value: EnrollmentFormData["maritalStatus"]) {
  return value.toUpperCase().replace(/-/g, "_")
}

function mapEducation(value: EnrollmentFormData["educationLevel"]) {
  switch (value) {
    case "high-school":
      return "HIGH_SCHOOL"
    case "associate":
      return "ASSOCIATE"
    case "bachelor":
      return "BACHELOR"
    case "master":
      return "MASTER"
    case "doctorate":
      return "DOCTORATE"
    default:
      return "OTHER"
  }
}

function mapRiskComfort(score: number) {
  if (score >= 5) return "VERY_HIGH"
  if (score === 4) return "HIGH"
  if (score === 3) return "MEDIUM"
  if (score === 2) return "LOW"
  return "VERY_LOW"
}

function normalizeCitizenship(value: string) {
  if (!value) return "US"
  const lower = value.toLowerCase()
  if (lower.includes("us") || lower.includes("united")) return "US"
  return value.toUpperCase().replace(/\s+/g, "_")
}

function profileToRecord(profile: EnrollmentFormData) {
  return {
    full_name: profile.fullName,
    age_years: profile.age,
    marital_status: mapMaritalStatus(profile.maritalStatus),
    education_level: mapEducation(profile.educationLevel),
    citizenship: normalizeCitizenship(profile.citizenship),
    work_location_country: profile.workCountry,
    work_location_state: profile.workState,
    work_location_region: profile.workRegion,
    dependents: profile.dependents,
    risk_aversion: mapRiskComfort(profile.riskComfort ?? 3),
    tobacco_user: profile.tobaccoUse,
    disability_status: Boolean(profile.disability),
    employment_start_date: profile.employmentStartDate,
    coverage_preference: profile.coveragePreference,
    partner_coverage_status: profile.partnerCoverageStatus,
    other_medical_plan: profile.healthCoverage,
    continuous_coverage: profile.hasContinuousCoverage,
    chronic_conditions: profile.hasHealthConditions,
    chronic_condition_summary: profile.healthConditionSummary,
    primary_care_frequency: profile.primaryCareFrequency,
    prescription_frequency: profile.prescriptionFrequency,
    activity_level_score: profile.activityLevelScore,
    benefits_budget_percent: profile.benefitsBudget,
    plan_priority: profile.planPreference,
    tax_account_type: profile.taxPreferredAccount,
    anticipates_life_changes: profile.anticipatesLifeChanges,
    benefit_usage_frequency: profile.expectedBenefitUsage,
    travels_out_of_state: profile.travelsOutOfState,
    needs_international_coverage: profile.needsInternationalCoverage,
    dental_vision_preference: profile.dentalVisionPreference,
    contributes_to_retirement: profile.contributesToRetirement,
    retirement_contribution_rate: profile.retirementContributionRate,
    wants_retirement_guidance: profile.wantsRetirementGuidance,
    guidance_preference: profile.guidancePreference,
    confidence_with_terms: profile.confidenceInsuranceTerms,
  }
}

function coerceRemotePlans(raw: LifeLensInsights | (LifeLensInsights & { recommendedPlans?: unknown })) {
  const insights = raw as LifeLensInsights & { recommendedPlans?: { id?: string; name?: string; reason?: string; resources?: PlanResource[]; monthly_cost_estimate?: string }[] }
  if (!insights.plans && Array.isArray(insights.recommendedPlans)) {
    insights.plans = insights.recommendedPlans.map((plan, index) => ({
      planId: plan.id ?? `remote-plan-${index + 1}`,
      planName: plan.name ?? `Plan ${index + 1}`,
      shortDescription: plan.reason ?? "Personalized option",
      reasoning: plan.reason ?? "LifeLens tailored this path for your profile.",
      monthlyCostEstimate: plan.monthly_cost_estimate ?? "—",
      riskMatchScore: 80,
      highlights: [plan.reason ?? "Tailored guidance"],
      resources: plan.resources ?? [],
    }))
    insights.selectedPlanId = insights.plans[0]?.planId ?? null
  }
  return insights
}

export async function upsertUser(profile: EnrollmentFormData): Promise<ApiResult<{ userId: string }>> {
  try {
    lastSubmittedProfile = profile
    const response = await fetch("/api/users", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ profile, record: profileToRecord(profile) }),
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
    const payload: Record<string, unknown> = { userId }
    if (lastSubmittedProfile) {
      payload.profile = lastSubmittedProfile
    }
    const response = await fetch("/api/generatePlans", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    })

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({}))
      return { error: errorBody.error ?? "Unable to generate plans" }
    }

    const body = (await response.json()) as { insights: LifeLensInsights }
    return { data: { insights: coerceRemotePlans(body.insights) } }
  } catch (error) {
    console.error("Failed to generate plans", error)
    return { error: error instanceof Error ? error.message : "Unknown error" }
  }
}

async function postChatMessage(
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

export async function sendChatMessage(
  userId: string,
  message: string
): Promise<ApiResult<{ reply: ChatEntry }>> {
  return postChatMessage(userId, message)
}

export async function sendLearningMessage(
  userId: string,
  message: string
): Promise<ApiResult<{ reply: ChatEntry }>> {
  return postChatMessage(`${userId}::learn`, message)
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
