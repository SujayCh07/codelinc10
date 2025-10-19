import type {
  ChatEntry,
  EnrollmentFormData,
  LifeLensInsights,
  LifeLensPlan,
} from "./types"

export function mergeChatHistory(existing: ChatEntry[], additions: ChatEntry[]) {
  const seen = new Set(existing.map((entry) => `${entry.speaker}-${entry.message}`))
  const filtered = additions.filter((entry) => {
    const key = `${entry.speaker}-${entry.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return [...existing, ...filtered]
}

export function computeDerivedMetrics(
  data: EnrollmentFormData
): EnrollmentFormData["derived"] {
  const riskFactorScore = Math.round(
    (Number(data.age ?? 30) / 2 + data.creditScore / 20 + data.riskComfort * 7) /
      (data.tobaccoUse ? 1.15 : 1)
  )

  const activityRiskModifier = data.physicalActivities
    ? Math.min(10, data.activityList.length * 2 + (data.veteran ? 3 : 0))
    : data.veteran
      ? 2
      : 0

  const complexityScore =
    (data.dependents > 2 ? 2 : data.dependents > 0 ? 1 : 0) +
    (data.residencyStatus === "Citizen" ? 0 : 1) +
    (data.creditScore < 650 ? 1 : 0)

  const coverageComplexity = complexityScore >= 3 ? "high" : complexityScore === 2 ? "medium" : "low"

  return {
    riskFactorScore,
    activityRiskModifier,
    coverageComplexity,
  }
}

export function withDerivedMetrics(data: EnrollmentFormData): EnrollmentFormData {
  return {
    ...data,
    derived: computeDerivedMetrics(data),
  }
}

const planThemes: Record<string, { persona: string; focus: string; themeKey: string }> = {
  home: {
    persona: "Home Stretch Strategist",
    focus: "Build a down payment runway",
    themeKey: "home",
  },
  retirement: {
    persona: "Momentum Builder",
    focus: "Grow retirement confidence",
    themeKey: "retirement",
  },
  protection: {
    persona: "Family Guardian",
    focus: "Protect your household",
    themeKey: "protection",
  },
  savings: {
    persona: "Cashflow Navigator",
    focus: "Elevate savings discipline",
    themeKey: "savings",
  },
  resilience: {
    persona: "Resilience Architect",
    focus: "Build a safety-first plan",
    themeKey: "foundation",
  },
}

function pickTheme(data: EnrollmentFormData) {
  if (data.creditScore < 640) return planThemes.resilience
  if (data.riskComfort >= 4) return planThemes.retirement
  if (data.dependents > 0) return planThemes.protection
  if (data.educationLevel === "master" || data.educationLevel === "doctorate") return planThemes.savings
  return planThemes.home
}

function describePlanVariant(
  planId: string,
  baseName: string,
  data: EnrollmentFormData,
  variant: "conservative" | "balanced" | "bold"
): LifeLensPlan {
  const monthly = Math.max(80, 120 + (data.dependents || 0) * 45)
  const offset = variant === "bold" ? 60 : variant === "balanced" ? 35 : 0
  const riskScoreBase = data.riskComfort * 18 + data.derived.activityRiskModifier
  const riskMatchScore = Math.min(100, riskScoreBase + (variant === "conservative" ? -10 : variant === "bold" ? 8 : 0))

  const highlightBase = [
    "Employer benefit comparison",
    data.physicalActivities ? "Activity injury coverage review" : "Income protection tune-up",
    data.creditScore < 700 ? "Credit rebuild playbook" : "Savings automation template",
  ]

  const descriptions: Record<typeof variant, string> = {
    conservative: `Keep essentials steady with enhanced protection for your household and ${
      data.dependents > 0 ? "dependents" : "income"
    }.`,
    balanced: "Blend savings, protection, and growth to stay adaptable through upcoming life moments.",
    bold: "Accelerate long-term wealth with strategic investments and employer matches while minding safeguards.",
  }

  return {
    planId,
    planName: `${baseName} (${variant === "bold" ? "Accelerate" : variant === "conservative" ? "Shield" : "Balance"})`,
    shortDescription: descriptions[variant],
    reasoning:
      variant === "bold"
        ? "You’re comfortable with calculated risk, so LifeLens prioritizes investment growth while reinforcing safety nets."
        : variant === "balanced"
          ? "Grounded saving habits and coverage reviews keep you agile across milestones."
          : "This path minimizes surprises and keeps your loved ones covered first.",
    monthlyCostEstimate: `$${monthly + offset}/mo`,
    riskMatchScore,
    highlights: highlightBase,
  }
}

export function buildPlans(data: EnrollmentFormData): LifeLensPlan[] {
  const baseName = "LifeLens Guidance"
  return [
    describePlanVariant(`plan-${data.userId ?? "guest"}-1`, baseName, data, "conservative"),
    describePlanVariant(`plan-${data.userId ?? "guest"}-2`, baseName, data, "balanced"),
    describePlanVariant(`plan-${data.userId ?? "guest"}-3`, baseName, data, "bold"),
  ]
}

export function buildInsights(enrollment: EnrollmentFormData): LifeLensInsights {
  const data = withDerivedMetrics(enrollment)
  const theme = pickTheme(data)
  const plans = buildPlans(data)

  const timeline = [
    {
      period: "Today",
      title: "Finalize your LifeLens profile",
      description: "Confirm family, coverage, and residency details before enrolling in new plans.",
    },
    {
      period: "Next 30 days",
      title: "Meet your advisor",
      description: "Schedule a LifeLens micro-session to align benefits with your latest goals.",
    },
    {
      period: "This quarter",
      title: "Automate contributions",
      description: "Lock in savings transfers and enrollment reminders across your benefit lineup.",
    },
  ]

  const resources = [
    {
      title: "Benefits orientation playlist",
      description: "Short videos from Lincoln experts about making the most of open enrollment.",
      url: "https://www.lincolnfinancial.com/public/individuals/workplace-benefits/resources",
    },
    {
      title: "Claude-powered planning prompts",
      description: "Keep conversations focused on your household priorities with pre-built prompts.",
      url: "https://www.lincolnfinancial.com/public/individuals",
    },
    {
      title: "Budget + benefits worksheet",
      description: "Capture pay-period costs and the value of employer programs in one view.",
      url: "https://www.lincolnfinancial.com/public/individuals/plan-for-life-events",
    },
  ]

  const conversation: LifeLensInsights["conversation"] = [
    {
      speaker: "LifeLens",
      message: `Hi ${data.preferredName || data.fullName}, I’m ready to walk you through your three tailored benefit paths.`,
    },
    {
      speaker: "LifeLens",
      message: `We’ll focus on ${theme.focus.toLowerCase()} while maintaining safeguards for your family.`,
    },
  ]

  const prompts = [
    "How different are the three plans?",
    "What should I do in the next 30 days?",
    "Can you summarize the costs for my partner?",
  ]

  return {
    ownerName: data.preferredName || data.fullName,
    persona: theme.persona,
    focusGoal: theme.focus,
    statement: `LifeLens analyzed your profile and mapped benefits around your risk comfort of ${data.riskComfort}/5 and credit score of ${data.creditScore}.`,
    timeline,
    resources,
    conversation,
    prompts,
    plans,
    selectedPlanId: plans[1]?.planId ?? plans[0]?.planId ?? null,
    goalTheme: theme.focus,
    themeKey: theme.themeKey,
  }
}

export function buildChatReply(message: string, insights: LifeLensInsights | null): string {
  if (!insights) {
    return "I’m ready whenever you want to restart the LifeLens quiz."
  }

  const normalized = message.toLowerCase()

  if (normalized.includes("plan")) {
    const plan = insights.plans.find((entry) => entry.planId === insights.selectedPlanId) ?? insights.plans[0]
    if (plan) {
      return `Here’s the highlight reel for ${plan.planName}: ${plan.highlights.join(" · ")}.`
    }
  }

  if (normalized.includes("cost")) {
    const costs = insights.plans.map((plan) => `${plan.planName.split(" (")[0]} ~${plan.monthlyCostEstimate}`).join(", ")
    return `Your monthly outlook: ${costs}. Pick the mix that matches your comfort level.`
  }

  if (normalized.includes("timeline") || normalized.includes("when")) {
    const step = insights.timeline[0]
    return step
      ? `Kick things off with “${step.title}” — it only takes 10 minutes today.`
      : "We’ll add a new milestone once you refresh your plan."
  }

  if (normalized.includes("resource")) {
    const resource = insights.resources[0]
    return resource
      ? `Open “${resource.title}” for a quick walkthrough. I’ll stay here while you explore.`
      : "I’ll add more resources after your next quiz refresh."
  }

  if (normalized.includes("thanks")) {
    return "You’re welcome! Ping me anytime you want to compare plans or send the report to HR."
  }

  const prompt = insights.prompts[0]
  if (prompt) {
    return `Try asking “${prompt}” next — it unlocks a deeper breakdown of your three plans.`
  }

  return "Ask about the plan lineup, costs, or what to tackle this week and I’ll guide you."
}
