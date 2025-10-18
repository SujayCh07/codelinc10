"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { LandingScreen } from "@/components/landing-screen"
import {
  DEFAULT_ENROLLMENT_FORM,
  EnrollmentForm,
  type EnrollmentFormData,
} from "@/components/enrollment-form"
import { InsightsDashboard, type LifeLensInsights } from "@/components/insights-dashboard"
import { SupportDock } from "@/components/support-dock"

const FORM_STORAGE_KEY = "lifelens-form-cache"
const INSIGHTS_STORAGE_KEY = "lifelens-insights-cache"

type Screen = "landing" | "quiz" | "insights"

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing")
  const [formData, setFormData] = useState<EnrollmentFormData | null>(null)
  const [insights, setInsights] = useState<LifeLensInsights | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  // ✅ Load cache safely
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const storedFormRaw = window.localStorage.getItem(FORM_STORAGE_KEY)
      const storedInsightsRaw = window.localStorage.getItem(INSIGHTS_STORAGE_KEY)

      const parsedForm = storedFormRaw ? (JSON.parse(storedFormRaw) as Partial<EnrollmentFormData>) : null
      const hydratedForm = parsedForm ? { ...DEFAULT_ENROLLMENT_FORM, ...parsedForm } : null
      const parsedInsights = storedInsightsRaw ? (JSON.parse(storedInsightsRaw) as Partial<LifeLensInsights>) : null

      if (hydratedForm) {
        setFormData(hydratedForm)
      }

      if (parsedInsights && hydratedForm) {
        const rebuilt = buildInsights(hydratedForm)
        const merged: LifeLensInsights = {
          ...rebuilt,
          ...parsedInsights,
          ownerName:
            parsedInsights.ownerName ?? rebuilt.ownerName ?? hydratedForm.preferredName ?? hydratedForm.fullName,
          priorities: parsedInsights.priorities ?? rebuilt.priorities,
          tips: parsedInsights.tips ?? rebuilt.tips,
          timeline: parsedInsights.timeline ?? rebuilt.timeline,
          resources: parsedInsights.resources ?? rebuilt.resources,
          conversation: parsedInsights.conversation ?? rebuilt.conversation,
          focusGoal: parsedInsights.focusGoal ?? rebuilt.focusGoal,
          persona: parsedInsights.persona ?? rebuilt.persona,
          statement: parsedInsights.statement ?? rebuilt.statement,
        }
        setInsights(merged)
        setScreen("insights")
      }
    } catch (error) {
      console.error("LifeLens cache could not be restored", error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // ✅ Start flow
  const handleStart = (asGuest: boolean) => {
    const base = formData ? { ...DEFAULT_ENROLLMENT_FORM, ...formData } : DEFAULT_ENROLLMENT_FORM
    setFormData({ ...base, isGuest: asGuest })
    setScreen("quiz")
  }

  // ✅ Update local form progress
  const handleEnrollmentUpdate = (data: EnrollmentFormData) => {
    setFormData(data)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
    }
  }

  // ✅ Navigation handlers
  const handleBackToLanding = () => {
    setScreen("landing")
  }

  const handleRestartQuiz = () => {
    const reset = { ...DEFAULT_ENROLLMENT_FORM, isGuest: formData?.isGuest ?? true }
    setFormData(reset)
    setScreen("quiz")
  }

  const handleEnrollmentComplete = (data: EnrollmentFormData) => {
    const generated = buildInsights(data)
    setFormData(data)
    setInsights(generated)
    setScreen("insights")

    if (typeof window !== "undefined") {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
      window.localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(generated))
    }
  }

  const handleRegenerate = () => {
    if (!formData) return
    const regenerated = buildInsights(formData)
    setInsights(regenerated)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(regenerated))
    }
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#A41E34]">
        Preparing LifeLens…
      </div>
    )
  }

  return (
    <>
      <AnimatePresence mode="wait" initial={false}>
        {screen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <LandingScreen onStart={handleStart} />
          </motion.div>
        )}

        {screen === "quiz" && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <EnrollmentForm
              onComplete={handleEnrollmentComplete}
              onBackToLanding={handleBackToLanding}
              onUpdate={handleEnrollmentUpdate}
              initialData={formData ?? DEFAULT_ENROLLMENT_FORM}
            />
          </motion.div>
        )}

        {screen === "insights" && insights && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <InsightsDashboard
              insights={insights}
              onBackToLanding={handleBackToLanding}
              onRegenerate={handleRegenerate}
              onRestartQuiz={handleRestartQuiz}
            />
          </motion.div>
        )}
      </AnimatePresence>

      <SupportDock
        persona={insights?.persona}
        focusGoal={insights?.focusGoal}
        screen={screen}
        onBackToLanding={screen === "insights" ? handleBackToLanding : undefined}
      />
    </>
  )
}

// ✅ Basic insight generator (replace with Bedrock later)
function buildInsights(data: EnrollmentFormData): LifeLensInsights {
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

  const summary = `${data.preferredName || data.fullName}, you're ${householdLine} while setting sights on ${milestone.toLowerCase()}. We'll pace your next actions so they feel manageable.`

  const priorities = [
    {
      title: data.financialGoals.includes("Buy a home") ? "Plan your home stretch" : "Reinforce your safety net",
      description: data.financialGoals.includes("Buy a home")
        ? "Tuck away closing costs and compare mortgage options alongside Lincoln’s home-planning worksheets."
        : "Channel a portion of pay into an automated reserve so unexpected costs don’t derail your momentum.",
    },
    {
      title: data.wantsLifeDisabilityInsights ? "Right-size protection" : "Check your coverage essentials",
      description: data.wantsLifeDisabilityInsights
        ? "Review life and disability coverage to align with your household and income goals."
        : "Spot-check health, dental, and supplemental benefits before enrollment season arrives.",
    },
    {
      title: data.contributes401k ? "Optimize long-term growth" : "Kickstart retirement habits",
      description: data.contributes401k
        ? "Nudge contributions toward the full employer match and revisit investments quarterly."
        : "Schedule a match check-in and start small—1-2% increases make a big impact over time.",
    },
  ]

  const tips = [
    {
      title: "Automate your momentum",
      description: "Set recurring reminders for savings transfers and enrollment deadlines.",
      icon: "⏱️",
    },
    {
      title: "Use Lincoln learning hubs",
      description: "Pick videos or articles aligned to your preferred pace and priorities.",
      icon: "🎓",
    },
    {
      title: "Track micro-wins",
      description: "Celebrate contributions, debt payments, or coverage updates to stay motivated.",
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
      description: "Revisit priorities with a coach before open enrollment to adjust your plan.",
    },
  ]

  const goalTheme = data.financialGoals.includes("Plan for retirement")
    ? "retirement"
    : data.financialGoals.includes("Protect my family")
      ? "protection"
      : data.financialGoals.includes("Buy a home")
        ? "home"
        : data.financialGoals.includes("Increase savings")
          ? "savings"
          : "foundation"

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

  const resources = resourceLibrary[goalTheme]

  const conversation = [
    data.milestoneFocus
      ? {
          speaker: "You" as const,
          message: `I'm gearing up for ${data.milestoneFocus.toLowerCase()}.`,
        }
      : null,
    {
      speaker: "LifeLens" as const,
      message: `We’ll connect your benefits and savings moves so ${milestone.toLowerCase()} stays on track without losing protection.`,
    },
    data.accountTypes.length
      ? {
          speaker: "You" as const,
          message: `I’m currently using ${data.accountTypes.join(" and ")} for health spending.`,
        }
      : null,
    {
      speaker: "LifeLens" as const,
      message: `Great—expect reminders tailored to your ${data.monthlySavingsRate}% savings rhythm and ${
        data.contributes401k ? "401(k) contributions" : "next retirement steps"
      }.`,
    },
  ].filter(Boolean) as { speaker: "LifeLens" | "You"; message: string }[]

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
  }
}
