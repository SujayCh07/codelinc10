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

const FORM_STORAGE_KEY = "lifelens-form-cache"
const INSIGHTS_STORAGE_KEY = "lifelens-insights-cache"

type Screen = "landing" | "quiz" | "insights"

export default function Home() {
  const [screen, setScreen] = useState<Screen>("landing")
  const [formData, setFormData] = useState<EnrollmentFormData | null>(null)
  const [insights, setInsights] = useState<LifeLensInsights | null>(null)
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const storedForm = window.localStorage.getItem(FORM_STORAGE_KEY)
      const storedInsights = window.localStorage.getItem(INSIGHTS_STORAGE_KEY)

      if (storedForm) {
        setFormData(JSON.parse(storedForm) as EnrollmentFormData)
      }

      if (storedInsights) {
        setInsights(JSON.parse(storedInsights) as LifeLensInsights)
        setScreen("insights")
      }
    } catch (error) {
      console.error("LifeLens cache could not be restored", error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  const handleStart = (asGuest: boolean) => {
    const nextForm = {
      ...(formData ?? DEFAULT_ENROLLMENT_FORM),
      isGuest: asGuest,
    }

    setFormData(nextForm)
    setScreen("quiz")
  }

  const handleEnrollmentUpdate = (data: EnrollmentFormData) => {
    setFormData(data)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
    }
  }

  const handleBackToLanding = () => {
    setScreen("landing")
  }

  const handleRestartQuiz = () => {
    const base = formData ?? DEFAULT_ENROLLMENT_FORM
    const reset = { ...DEFAULT_ENROLLMENT_FORM, isGuest: base.isGuest }
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

  const initialFormData = useMemo(() => {
    if (!formData) return undefined
    return formData
  }, [formData])

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#A41E34]">
        Preparing LifeLens…
      </div>
    )
  }

  return (
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
            initialData={initialFormData}
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
  )
}

function buildInsights(data: EnrollmentFormData): LifeLensInsights {
  const persona = data.hasDependents
    ? "Family Guardian"
    : data.riskTolerance === "Growth-focused"
      ? "Momentum Builder"
      : "Balanced Navigator"

  const focusGoal = data.financialGoals[0] ?? "strengthen your financial foundation"
  const summaryPieces = [
    `${data.preferredName || data.fullName}, you're building a ${data.householdStructure.toLowerCase() || "resilient"} home base`,
    `with ${data.employmentType || "your role"} work and ${data.hasDependents ? `${data.dependentCount} dependents` : "personal goals"}.`,
  ]

  const priorities = [
    {
      title: "Elevate your safety net",
      description: data.emergencySavingsMonths < 3
        ? "Grow your emergency savings toward 3-6 months using automatic transfers into a high-yield account."
        : "You’re on track with savings—consider directing extra dollars toward targeted goals and protection.",
    },
    {
      title: data.hasDependents ? "Protect your household income" : "Optimize core coverage",
      description: data.hasDependents
        ? "Review life and disability options to shield your family’s lifestyle and future milestones."
        : "Fine-tune health, disability, and supplemental coverage so your benefits work as hard as you do.",
    },
    {
      title: data.riskTolerance === "Growth-focused" ? "Accelerate long-term growth" : "Build confident retirement habits",
      description:
        data.riskTolerance === "Growth-focused"
          ? "Increase contributions toward retirement accounts and align investments with your ambitious growth focus."
          : "Confirm your retirement contributions, explore employer match opportunities, and set annual check-ins.",
    },
  ]

  const tips = [
    {
      title: "Automate your momentum",
      description: "Schedule calendar nudges for contributions, debt payments, and wellness appointments to stay consistent.",
      icon: "⏱️",
    },
    {
      title: "Leverage Lincoln guidance",
      description: "Tap into coaching sessions and on-demand learning tailored to your preferred " + (data.preferredLearningStyle || "style"),
      icon: "🎓",
    },
    {
      title: "Celebrate micro wins",
      description: "Highlight each milestone—from budgeting check-ins to debt payoff—to keep energy high across the year.",
      icon: "🎉",
    },
  ]

  const timeline = [
    {
      period: "This week",
      title: "Confirm your benefits snapshot",
      description: "Review medical, life, and supplemental coverage to make sure every household need is addressed.",
    },
    {
      period: "Next 30 days",
      title: "Dial in spending and savings",
      description: data.hasBudget
        ? "Refine your spending plan to route extra dollars toward " + focusGoal.toLowerCase() + "."
        : "Sketch a light-touch budget with 50/30/20 guardrails so you can fund " + focusGoal.toLowerCase() + ".",
    },
    {
      period: "90 days",
      title: "Plan your next milestone review",
      description: "Meet with a LifeLens coach to refresh coverage, investments, and wellness goals as life evolves.",
    },
  ]

  const aiPrompt = `${data.aiPrompt || "I want support"} | Goals: ${data.financialGoals.join(", ")} | Household: ${data.householdStructure || "n/a"}`

  return {
    persona,
    statement: `${summaryPieces.join(" ")} Your next focus: ${focusGoal.toLowerCase()}.`,
    priorities,
    tips,
    timeline,
    aiPrompt,
  }
}
