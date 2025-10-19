import type { ChatEntry, EnrollmentFormData, LifeLensInsights } from "./types"

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

export function buildChatReply(message: string, insights: LifeLensInsights | null): string {
  if (!insights) {
    return "I'm here whenever you want to revisit your LifeLens questionnaire or start a new plan."
  }

  const lower = message.toLowerCase()

  if (lower.includes("timeline") || lower.includes("when")) {
    const nextStep = insights.timeline[0]
    if (nextStep) {
      return `Start with "${nextStep.title}" this week and we’ll check in after you complete it.`
    }
  }

  if (lower.includes("401") || lower.includes("retire")) {
    return `Focus on your match: ${insights.priorities[0]?.description ?? "Increase contributions gradually."}`
  }

  if (lower.includes("resource") || lower.includes("link")) {
    const resource = insights.resources[0]
    if (resource) {
      return `Open "${resource.title}" to go deeper — it’s tailored to ${insights.focusGoal.toLowerCase()}.`
    }
  }

  if (lower.includes("goal") || lower.includes("focus")) {
    return `Your plan centers on ${insights.focusGoal.toLowerCase()}. Let’s tackle the first timeline step together.`
  }

  if (lower.includes("hi") || lower.includes("hello") || lower.includes("hey")) {
    return "Hi there! I’ve got your LifeLens plan ready. Ask about your timeline, resources, or anything else on your mind."
  }

  if (lower.includes("thank")) {
    return "You’re welcome! I’ll keep your plan updated as new milestones pop up."
  }

  const prompt = insights.prompts[0]
  if (prompt) {
    return `Try asking: “${prompt}” to see what we’ve lined up.`
  }

  return "I’m ready when you are—ask about your benefits, timeline, or how to stay on track."
}

export function buildInsights(data: EnrollmentFormData): LifeLensInsights {
  const persona =
    data.householdCoverage === "You + family"
      ? "Family Guardian"
      : data.householdCoverage === "You + partner"
        ? "Collaborative Planner"
        : data.riskComfort >= 4
          ? "Momentum Builder"
          : "Balanced Navigator"

  const focusGoal = data.financialGoals[0] ?? "strengthen your financial foundation"
  const milestone = data.milestoneFocus?.trim() || focusGoal

  const householdLine =
    data.householdCoverage === "You only"
      ? "your individual coverage"
      : data.householdCoverage === "You + partner"
        ? "coverage that supports you and your partner"
        : `supporting ${data.dependentCount || "your"} dependents`

  const summary = `${data.preferredName || data.fullName}, we're centering your plan on ${milestone.toLowerCase()} while keeping ${householdLine} steady.`

  const priorities = [
    {
      title: data.financialGoals.includes("Buy a home") ? "Plan your home stretch" : "Reinforce your safety net",
      description: data.financialGoals.includes("Buy a home")
        ? "Line up closing costs and use Lincoln worksheets to compare loan paths."
        : "Automate a weekly reserve so surprises don’t slow your safety net.",
    },
    {
      title: data.wantsLifeDisabilityInsights ? "Right-size protection" : "Check your coverage essentials",
      description: data.wantsLifeDisabilityInsights
        ? "Right-size life and disability coverage against today’s income."
        : "Glance through health, dental, and supplemental coverage ahead of enrollment.",
    },
    {
      title: data.contributes401k ? "Optimize long-term growth" : "Kickstart retirement habits",
      description: data.contributes401k
        ? "Boost contributions to capture the full match and set a quarterly check-in."
        : "Schedule a match check and start a 1-2% bump to build momentum.",
    },
  ]

  const tips = [
    {
      title: "Auto reminders",
      description: "Set nudges for savings moves and enrollment dates.",
      icon: "⏱️",
    },
    {
      title: "Learning hub",
      description: "Skim short videos tied to today’s priorities.",
      icon: "🎓",
    },
    {
      title: "Track micro-wins",
      description: "Capture each payment or coverage tweak to stay motivated.",
      icon: "🎉",
    },
  ]

  const timeline = [
    {
      period: "This Week",
      title: "Refresh your benefits snapshot",
      description: `Confirm dependents, beneficiaries, and coverage details for ${householdLine}.`,
    },
    {
      period: "Next 30 Days",
      title: "Dial in your cash flow",
      description: `Align your ${data.monthlySavingsRate}% savings rhythm with ${focusGoal.toLowerCase()}.`,
    },
    {
      period: "This Year",
      title: "Schedule a LifeLens check-in",
      description: "Meet with LifeLens before open enrollment to update the plan.",
    },
  ]

  const goalThemeKey = data.financialGoals.includes("Plan for retirement")
    ? "retirement"
    : data.financialGoals.includes("Protect my family")
      ? "protection"
      : data.financialGoals.includes("Buy a home")
        ? "home"
        : data.financialGoals.includes("Increase savings")
          ? "savings"
          : "foundation"

  const goalThemeLabel: Record<string, string> = {
    retirement: "Retirement track",
    protection: "Family protection",
    home: "Home stretch",
    savings: "Savings momentum",
    foundation: "Financial foundation",
  }

  const resourceLibrary: Record<string, { title: string; description: string; url: string }[]> = {
    retirement: [
      {
        title: "Retirement income estimator",
        description: "Model how increasing your 401(k) contribution changes future income.",
        url: "https://www.lincolnfinancial.com/public/individuals/workplace-benefits/retirement-plans",
      },
      {
        title: "Quarterly market outlook",
        description: "Stay current on guidance from Lincoln’s retirement strategists.",
        url: "https://newsroom.lfg.com/",
      },
    ],
    protection: [
      {
        title: "Benefits protection checklist",
        description: "Review life, disability, and supplemental coverage options available through work.",
        url: "https://www.lincolnfinancial.com/public/individuals/protect-my-income",
      },
      {
        title: "Family security playbook",
        description: "Understand how to align dependents, beneficiaries, and emergency contacts.",
        url: "https://www.lincolnfinancial.com/public/individuals/workplace-benefits/resources",
      },
    ],
    home: [
      {
        title: "Home buying roadmap",
        description: "Plan down payments, insurance, and emergency reserves side-by-side.",
        url: "https://www.lincolnfinancial.com/public/individuals/plan-for-life-events",
      },
      {
        title: "Protection for new homeowners",
        description: "See how life, disability, and accident coverage can secure a mortgage.",
        url: "https://www.lincolnfinancial.com/public/individuals/protect-my-income",
      },
    ],
    savings: [
      {
        title: "Budget & savings hub",
        description: "Use calculators and articles to balance debt payoff with savings goals.",
        url: "https://www.lincolnfinancial.com/public/individuals/plan-for-life-events",
      },
      {
        title: "Emergency savings toolkit",
        description: "Step-by-step guidance to automate 3–6 months of essential expenses.",
        url: "https://www.lincolnfinancial.com/public/individuals/financial-wellness",
      },
    ],
    foundation: [
      {
        title: "LifeLens learning studio",
        description: "Short lessons on budgeting, benefits enrollment, and debt confidence.",
        url: "https://www.lincolnfinancial.com/public/individuals/financial-wellness",
      },
      {
        title: "Lincoln Financial resource center",
        description: "Find HR contacts, FAQs, and on-demand webinars tailored to your workplace.",
        url: "https://www.lincolnfinancial.com/public/individuals/workplace-benefits",
      },
    ],
  }

  const resources = resourceLibrary[goalThemeKey]

  const conversation = [
    data.milestoneFocus
      ? {
          speaker: "You" as const,
          message: `I'm gearing up for ${data.milestoneFocus.toLowerCase()}.`,
        }
      : null,
    {
      speaker: "LifeLens" as const,
      message: `We linked your benefits and savings moves so ${milestone.toLowerCase()} stays on track without losing protection.`,
    },
    data.accountTypes.length
      ? {
          speaker: "You" as const,
          message: `I’m currently using ${data.accountTypes.join(" and ")} for health spending.`,
        }
      : null,
    {
      speaker: "LifeLens" as const,
      message: `Expect reminders tuned to your ${data.monthlySavingsRate}% savings rhythm and ${
        data.contributes401k ? "401(k) contributions" : "upcoming retirement moves"
      }.`,
    },
  ].filter(Boolean) as { speaker: "LifeLens" | "You"; message: string }[]

  const prompts = [
    "How do I hit my next milestone?",
    data.contributes401k ? "Can you review my 401(k) match?" : "What’s the best way to start my 401(k)?",
    data.financialGoals.includes("Buy a home") ? "What should I save for closing costs?" : "Which benefits should I adjust next?",
  ]

  return {
    ownerName: data.preferredName || data.fullName,
    persona,
    statement: summary,
    priorities,
    tips,
    timeline,
    focusGoal: milestone,
    resources,
    conversation,
    prompts,
    goalTheme: goalThemeLabel[goalThemeKey],
    themeKey: goalThemeKey,
  }
}
