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

      const parsedForm = storedFormRaw ? (JSON.parse(storedFormRaw) as EnrollmentFormData) : null
      const parsedInsights = storedInsightsRaw ? (JSON.parse(storedInsightsRaw) as Partial<LifeLensInsights>) : null

      if (parsedForm) {
        setFormData(parsedForm)
      }

      if (parsedInsights) {
        const hydratedInsights = parsedInsights.focusGoal ? parsedInsights : parsedForm ? buildInsights(parsedForm) : null
        if (hydratedInsights) {
          setInsights(hydratedInsights as LifeLensInsights)
          setScreen("insights")
        }
      }
    } catch (error) {
      console.error("LifeLens cache could not be restored", error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  // ✅ Start flow
  const handleStart = (asGuest: boolean) => {
    const nextForm = {
      ...(formData ?? DEFAULT_ENROLLMENT_FORM),
      isGuest: asGuest,
    }
    setFormData(nextForm)
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
  const persona = data.hasDependents
    ? "Family Guardian"
    : data.riskTolerance === "Growth-focused"
    ? "Momentum Builder"
    : "Balanced Navigator"

  const focusGoal = data.financialGoals?.[0] ?? "strengthen your financial foundation"
  const milestone = data.milestoneFocus?.trim() || focusGoal

  const summary = `${data.preferredName || data.fullName}, you're building a ${
    data.householdStructure?.toLowerCase() || "resilient"
  } home base with ${data.employmentType || "your current role"} work and ${
    data.hasDependents ? `${data.dependentCount} dependents` : "personal goals"
  }. Your next focus: ${milestone.toLowerCase()}.`

  const priorities = [
    {
      title: "Elevate your safety net",
      description:
        data.emergencySavingsMonths && data.emergencySavingsMonths < 3
          ? "Grow your emergency savings toward 3–6 months using automatic transfers into a high-yield account."
          : "You’re on track—consider directing extra funds toward long-term goals and protection.",
    },
    {
      title: data.hasDependents ? "Protect your household income" : "Optimize your core coverage",
      description: data.hasDependents
        ? "Review life and disability options to shield your family’s future."
        : "Refine your health, disability, and supplemental plans to fit your goals.",
    },
    {
      title:
        data.riskTolerance === "Growth-focused"
          ? "Accelerate long-term growth"
          : "Build confident retirement habits",
      description:
        data.riskTolerance === "Growth-focused"
          ? "Boost retirement contributions and align investments with your growth strategy."
          : "Review employer match and set recurring check-ins.",
    },
  ]

  const tips = [
    {
      title: "Automate your momentum",
      description: "Set reminders for savings, payments, and checkups to stay consistent.",
      icon: "⏱️",
    },
    {
      title: "Leverage Lincoln guidance",
      description: "Access tailored learning based on your preferred style.",
      icon: "🎓",
    },
    {
      title: "Celebrate micro wins",
      description: "Recognize small financial victories to sustain motivation.",
      icon: "🎉",
    },
  ]

  const timeline = [
    {
      period: "This Week",
      title: "Review your benefits snapshot",
      description: "Ensure your coverage reflects your current household and needs.",
    },
    {
      period: "Next 30 Days",
      title: "Dial in spending and savings",
      description: data.hasBudget
        ? `Refine your budget to fund ${focusGoal.toLowerCase()}.`
        : `Create a simple 50/30/20 budget to support ${focusGoal.toLowerCase()}.`,
    },
    {
      period: "90 Days",
      title: "Revisit your milestones",
      description: "Meet with a LifeLens coach to adjust plans as life evolves.",
    },
  ]

  const goalTheme = data.financialGoals.includes("Plan for retirement")
    ? "retirement"
    : data.financialGoals.includes("Protect my family")
      ? "protection"
      : data.financialGoals.includes("Increase savings")
        ? "savings"
        : "foundation"

  const resourceLibrary: Record<
    string,
    { title: string; description: string; url: string }[]
  > = {
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
      message: `Great—we'll align your benefits and savings moves so ${milestone.toLowerCase()} feels achievable without losing protection.`,
    },
    data.preferredLearningStyle
      ? {
          speaker: "You" as const,
          message: `I absorb guidance best through ${data.preferredLearningStyle.toLowerCase()}.`,
        }
      : null,
    {
      speaker: "LifeLens" as const,
      message: `We'll send resources in that format and highlight when to check in with a coach${
        data.wantsCoaching ? " so a person is ready when you are." : "."
      }`,
    },
  ].filter(Boolean) as { speaker: "LifeLens" | "You"; message: string }[]

  return { persona, statement: summary, priorities, tips, timeline, focusGoal: milestone, resources, conversation }
}
