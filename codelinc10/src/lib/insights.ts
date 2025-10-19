import type {
  ChatEntry,
  EnrollmentFormData,
  FinMateInsights,
  FinMatePlan,
  PlanResource,
  PriorityBenefit,
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
  data: EnrollmentFormData,
): EnrollmentFormData["derived"] {
  const budgetLift = data.benefitsBudget >= 15 ? 8 : data.benefitsBudget >= 10 ? 4 : -4
  const contributionLift =
    data.retirementContributionRate >= 12
      ? 6
      : data.retirementContributionRate >= 6
        ? 3
        : data.contributesToRetirement
          ? 1
          : 0
  const riskFactorScore = Math.round(
    (Number(data.age ?? 30) / 2 + data.creditScore / 18 + data.riskComfort * 8 + budgetLift + contributionLift) /
      (data.tobaccoUse ? 1.12 : 1),
  )

  const activityRiskModifier =
    data.activityLevel === "active"
      ? Math.min(10, data.activityLevelScore * 2)
      : data.activityLevel === "balanced"
        ? 2
        : 0

  const complexityScore =
    (data.dependents > 2 ? 2 : data.dependents > 0 ? 1 : 0) +
    (data.coveragePreference !== "self" ? 1 : 0) +
    (data.expectedBenefitUsage === "frequently" ? 1 : 0) +
    (data.needsInternationalCoverage ? 1 : 0)

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

const planThemes: Record<string, { focus: string; themeKey: string }> = {
  home: {
    focus: "Build a down payment runway",
    themeKey: "home",
  },
  retirement: {
    focus: "Grow retirement confidence",
    themeKey: "retirement",
  },
  protection: {
    focus: "Protect your household",
    themeKey: "protection",
  },
  savings: {
    focus: "Elevate savings discipline",
    themeKey: "savings",
  },
  resilience: {
    focus: "Build a safety-first plan",
    themeKey: "foundation",
  },
}

function pickTheme(data: EnrollmentFormData) {
  if (data.coveragePreference === "self-plus-family" || data.dependents > 0) return planThemes.protection
  if (data.planPreference === "lower-premiums" || data.benefitsBudget <= 8) return planThemes.savings
  if (data.needsInternationalCoverage || data.travelsOutOfState) return planThemes.resilience
  if (data.contributesToRetirement || data.retirementContributionRate >= 8) return planThemes.retirement
  if (data.anticipatesLifeChanges) return planThemes.home
  return planThemes.retirement
}

function describePlanVariant(
  planId: string,
  baseName: string,
  data: EnrollmentFormData,
  variant: "conservative" | "balanced" | "bold"
): FinMatePlan {
  const monthlyBase = Math.max(80, 110 + (data.dependents || 0) * 45)
  const coverageLift = data.coveragePreference !== "self" ? 25 : 0
  const offset = variant === "bold" ? 60 : variant === "balanced" ? 30 : 0
  const monthly = monthlyBase + coverageLift + offset
  const riskScoreBase =
    data.riskComfort * 18 +
    data.derived.activityRiskModifier +
    (data.planPreference === "lower-premiums" || data.benefitsBudget <= 8 ? -6 : 0)
  const riskMatchScore = Math.min(100, riskScoreBase + (variant === "conservative" ? -12 : variant === "bold" ? 10 : 0))

  const highlightBase = [
    data.coveragePreference === "self-plus-family"
      ? "Household protection audit"
      : data.coveragePreference === "self-plus-spouse"
        ? "Partner coverage coordination"
        : "Solo coverage refresh",
    data.activityLevelScore >= 4
      ? "Wellness perks matched to your routine"
      : "Lifestyle-friendly wellness tips",
    data.planPreference === "lower-premiums"
      ? "Strategies to trim monthly premiums"
      : data.planPreference === "lower-deductible"
        ? "Reduce surprise bills with lower deductibles"
        : "Balanced recommendations for cost and care",
  ]

  const resources: PlanResource[] = [
    {
      title: "FinMate benefits hub",
      description: "Review health, wealth, and protection benefits tailored to your profile.",
      url: "https://www.lincolnfinancial.com/public/individuals/workplace-benefits/resources",
    },
    {
      title: "Personalized plan canvas",
      description:
        variant === "conservative"
          ? "Lock in foundational protections and emergency support."
          : variant === "bold"
            ? "Channel extra savings into growth pathways with guardrails."
            : "Balance savings automation with flexible coverage upgrades.",
      url: "https://www.lincolnfinancial.com/public/individuals/plan-for-life-events",
    },
    {
      title: "Quick actions",
      description:
        data.healthCoverage === "none"
          ? "Enroll in core medical and disability options this week."
          : data.healthCoverage === "partner"
            ? "Coordinate with your partner to avoid duplicate coverage."
            : "Verify beneficiaries and adjust contributions before open enrollment.",
      url: "https://www.lincolnfinancial.com/public/individuals/emergency-preparedness",
    },
  ]

  const descriptions: Record<typeof variant, string> = {
    conservative: `Keep essentials steady with enhanced protection for your ${
      data.coveragePreference === "self" ? "income" : "household"
    }.`,
    balanced: "Blend savings, protection, and growth to stay adaptable through upcoming milestones.",
    bold: "Accelerate long-term wealth while reinforcing the guardrails you rely on.",
  }

  return {
    planId,
    planName: `${baseName} (${variant === "bold" ? "Accelerate" : variant === "conservative" ? "Shield" : "Balance"})`,
    shortDescription: descriptions[variant],
    reasoning:
      variant === "bold"
        ? "You’re comfortable with calculated risk, so FinMate prioritizes investment growth while reinforcing safety nets."
        : variant === "balanced"
          ? "Grounded saving habits and coverage reviews keep you agile across milestones."
          : "This path minimizes surprises and keeps your loved ones covered first.",
    monthlyCostEstimate: `$${monthly}/mo`,
    riskMatchScore,
    highlights: highlightBase,
    resources,
  }
}

export function buildPlans(data: EnrollmentFormData): FinMatePlan[] {
  const baseName = "FinMate Guidance"
  return [
    describePlanVariant(`plan-${data.userId ?? "guest"}-1`, baseName, data, "conservative"),
    describePlanVariant(`plan-${data.userId ?? "guest"}-2`, baseName, data, "balanced"),
    describePlanVariant(`plan-${data.userId ?? "guest"}-3`, baseName, data, "bold"),
  ]
}

const createResource = (title: string, description: string, url: string): PlanResource => ({
  title,
  description,
  url,
})

export function buildPriorityBenefits(data: EnrollmentFormData): PriorityBenefit[] {
  const resources = {
    enrollmentCenter: createResource(
      "Benefits enrollment center",
      "Review Lincoln Financial benefits and submit elections in one place.",
      "https://www.lincolnfinancial.com/public/individuals/workplace-benefits/resources",
    ),
    coverageChecklist: createResource(
      "Life & disability checklist",
      "Walk through the steps to size coverage and verify beneficiaries.",
      "https://www.lincolnfinancial.com/public/individuals/emergency-preparedness",
    ),
    savingsAutomation: createResource(
      "Savings automation setup",
      "Turn on payroll deductions and direct deposits for your savings goals.",
      "https://www.lincolnfinancial.com/public/individuals/plan-for-life-events",
    ),
    retirementPlaybook: createResource(
      "Retirement contribution playbook",
      "Compare contribution scenarios that fit your risk comfort.",
      "https://www.lincolnfinancial.com/public/individuals/plan-for-life-events",
    ),
    wellnessHub: createResource(
      "Wellness & activity perks",
      "Unlock reimbursements and perks tied to your favorite activities.",
      "https://www.lincolnfinancial.com/public/individuals/workplace-benefits/resources",
    ),
    planningSession: createResource(
      "Schedule a FinMate coach session",
      "Book a 20-minute check-in to keep your benefits on track.",
      "https://www.lincolnfinancial.com/public/individuals/workplace-benefits/resources",
    ),
  }

  const items: PriorityBenefit[] = []

  const dependentsNote =
    data.coveragePreference === "self-plus-family"
      ? `${data.dependents} dependent${data.dependents === 1 ? "" : "s"} rely on your benefits`
      : data.coveragePreference === "self-plus-partner"
        ? "Your partner looks to your coverage for stability"
        : "Your paycheck keeps your lifestyle protected"

  const partnerNote =
    data.spouseHasSeparateInsurance === false
      ? " Coordinate your elections together so nothing falls through the cracks."
      : ""

  const tobaccoNote = data.tobaccoUse ? " Complete the tobacco attestation so rates stay accurate." : ""

  const coverageTitle =
    data.coveragePreference === "self-plus-family"
      ? "Protect your household income"
      : data.coveragePreference === "self-plus-partner"
        ? "Coordinate coverage with your partner"
        : "Lock in your income protection"

  const coverageDescription =
    data.coveragePreference === "self"
      ? "Review disability coverage and update beneficiaries so your income is protected if the unexpected happens."
      : "Elect or increase life and disability coverage sized for the people who count on you."

  items.push({
    id: "priority-coverage",
    title: coverageTitle,
    category: "coverage",
    description: coverageDescription,
    whyItMatters: `${dependentsNote}.${partnerNote}${tobaccoNote}`.trim(),
    urgency: "Now",
    actions: [resources.enrollmentCenter, resources.coverageChecklist],
  })

  const healthBenefit: PriorityBenefit = (() => {
    if (data.healthCoverage === "none") {
      return {
        id: "priority-health",
        title: "Enroll in medical coverage",
        category: "health",
        description: "Choose a Lincoln medical plan so day-one care and preventive visits are covered.",
        whyItMatters: "You reported no current coverage, so enrolling now avoids gaps and late enrollment penalties.",
        urgency: "Now",
        actions: [resources.enrollmentCenter],
      }
    }

    if (data.healthCoverage === "partner") {
      return {
        id: "priority-health",
        title: "Coordinate medical plans with your partner",
        category: "health",
        description: "Compare your employer options with your partner's plan to minimize duplicate costs.",
        whyItMatters:
          "Sharing coverage requires a quick check to confirm networks, premiums, and who pays for dependents.",
        urgency: "Next 30 days",
        actions: [resources.enrollmentCenter],
      }
    }

    return {
      id: "priority-health",
      title: "Complete your annual coverage check",
      category: "health",
      description: "Verify beneficiaries, dependents, and open enrollment reminders so you're ready to renew.",
      whyItMatters: "Staying current keeps claims smooth and ensures your household is always listed correctly.",
      urgency: "Next 30 days",
      actions: [resources.enrollmentCenter],
    }
  })()

  items.push(healthBenefit)

  const savingsBenefit: PriorityBenefit = (() => {
    if (data.benefitsBudget <= 8 || data.planPreference === "lower-premiums") {
      return {
        id: "priority-budget",
        title: "Dial in your benefits budget",
        category: "savings",
        description: "Align health, protection, and supplemental benefits with the monthly spend you’re comfortable with.",
        whyItMatters: `You set a ${data.benefitsBudget}% benefits budget, so calibrating plan choices now keeps costs predictable.`,
        urgency: "Next 30 days",
        actions: [resources.savingsAutomation],
      }
    }

    const hasContributions = data.contributesToRetirement
    const urgency = hasContributions ? "This quarter" : "Next 30 days"
    const title = hasContributions ? "Boost retirement contributions" : "Kickstart retirement contributions"
    const contributionDetail = hasContributions
      ? `You're contributing ${data.retirementContributionRate}% today—FinMate will show how to capture full employer match.`
      : "Starting contributions unlocks employer match dollars and long-term tax advantages."

    return {
      id: "priority-retirement",
      title,
      category: "savings",
      description: "Use Lincoln Financial tools to set automatic retirement contributions and track progress toward your goal.",
      whyItMatters: contributionDetail,
      urgency,
      actions: [resources.retirementPlaybook],
    }
  })()

  items.push(savingsBenefit)

  if (data.activityLevelScore >= 4) {
    items.push({
      id: "priority-wellness",
      title: "Use wellness reimbursements",
      category: "wellness",
      description: "Log your favorite activities to unlock reimbursement dollars and health incentives.",
      whyItMatters: "Active lifestyles qualify for wellness perks—submitting receipts keeps money in your pocket.",
      urgency: "This quarter",
      actions: [resources.wellnessHub],
    })
  } else {
    items.push({
      id: "priority-planning",
      title: "Schedule a FinMate benefits check-in",
      category: "planning",
      description: "Reserve a quick session to make sure savings, coverage, and paperwork stay aligned with your goals.",
      whyItMatters: "A guided review keeps your information fresh and captures any changes before open enrollment.",
      urgency: "This quarter",
      actions: [resources.planningSession],
    })
  }

  return items
}

export function buildInsights(enrollment: EnrollmentFormData): FinMateInsights {
  const data = withDerivedMetrics(enrollment)
  const theme = pickTheme(data)
  const plans = buildPlans(data)
  const priorityBenefits = buildPriorityBenefits(data)

  const timeline = priorityBenefits.slice(0, 3).map((benefit) => ({
    period: benefit.urgency,
    title: benefit.title,
    description: benefit.description,
  }))

  if (timeline.length < 3) {
    timeline.push(
      { period: "Now", title: "Finalize your FinMate profile", description: "Confirm your answers so guidance stays accurate." },
      { period: "Next 30 days", title: "Meet with a benefits coach", description: "Schedule a FinMate session to keep your plan aligned." },
      { period: "This quarter", title: "Automate contributions", description: "Lock in savings transfers and enrollment reminders." },
    )
  }

  const trimmedTimeline = timeline.slice(0, 3)

  const topPriority = priorityBenefits[0]
  const secondaryPriority = priorityBenefits[1]

  const conversation: FinMateInsights["conversation"] = [
    {
      speaker: "FinMate",
      message: `Hi ${data.preferredName || data.fullName}, let’s prioritize ${topPriority ? topPriority.title.toLowerCase() : "your benefits"} together.`,
    },
    {
      speaker: "FinMate",
      message:
        secondaryPriority
          ? `After that, we’ll line up ${secondaryPriority.title.toLowerCase()} so nothing slips through the cracks.`
          : `We’ll keep building around ${theme.focus.toLowerCase()} every step of the way.`,
    },
  ]

  const prompts = [
    topPriority ? `How do I get started with ${topPriority.title.toLowerCase()}?` : "What should I do first?",
    secondaryPriority
      ? `What paperwork do I need for ${secondaryPriority.title.toLowerCase()}?`
      : "Can you remind me about upcoming deadlines?",
    "Can you summarize my next enrollment dates?",
  ]

  const recommendedPlans = priorityBenefits.map((benefit) => ({
    id: benefit.id,
    name: benefit.title,
    reason: benefit.whyItMatters,
    resources: benefit.actions,
  }))

  return {
    ownerName: data.preferredName || data.fullName,
    focusGoal: theme.focus,
    statement: topPriority
      ? `FinMate mapped your answers to highlight ${topPriority.title.toLowerCase()} first, based on a risk comfort of ${data.riskComfort}/5 and credit score of ${data.creditScore}.`
      : `FinMate analyzed your profile and mapped benefits around your risk comfort of ${data.riskComfort}/5 and credit score of ${data.creditScore}.`,
    timeline: trimmedTimeline,
    conversation,
    prompts,
    plans,
    recommendedPlans,
    selectedPlanId: plans[1]?.planId ?? plans[0]?.planId ?? null,
    goalTheme: theme.focus,
    themeKey: theme.themeKey,
    priorityBenefits,
  }
}

export function buildChatReply(message: string, insights: FinMateInsights | null): string {
  if (!insights) {
    return "I’m ready whenever you want to restart the FinMate quiz."
  }

  const normalized = message.toLowerCase()

  if (normalized.includes("plan") || normalized.includes("priority")) {
    const titles = insights.priorityBenefits.map((benefit) => benefit.title)
    if (titles.length > 0) {
      return `Your priority path is ${titles.join(" → ")}. Start with ${titles[0]} and I’ll cue up the next step when you’re ready.`
    }
  }

  if (normalized.includes("cost")) {
    const plan = insights.plans.find((entry) => entry.planId === insights.selectedPlanId) ?? insights.plans[0]
    if (plan) {
      return `The current estimate for ${plan.planName.split(" (")[0]} is ${plan.monthlyCostEstimate}. Adjusting coverage within your priorities will update that number.`
    }
  }

  if (normalized.includes("timeline") || normalized.includes("when")) {
    const step = insights.timeline[0]
    return step
      ? `Kick things off with “${step.title}” — it only takes 10 minutes today.`
      : "We’ll add a new milestone once you refresh your plan."
  }

  if (normalized.includes("resource") || normalized.includes("link")) {
    const resource = insights.priorityBenefits[0]?.actions[0]
    return resource
      ? `Open “${resource.title}” for a quick walkthrough. I’ll stay here while you explore.`
      : "I’ll add more resources after your next plan refresh."
  }

  if (normalized.includes("thanks")) {
    return "You’re welcome! Ping me anytime you want to check off the next benefit priority or send the report to HR."
  }

  const prompt = insights.prompts[0]
  if (prompt) {
    return `Try asking “${prompt}” next — it unlocks a deeper breakdown of your priority checklist.`
  }

  return "Ask about your priority list, any paperwork you need, or what to tackle this week and I’ll guide you."
}
