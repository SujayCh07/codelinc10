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

  // ✅ Load cache safely
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

  const summary = `${data.preferredName || data.fullName}, you're building a ${
    data.householdStructure?.toLowerCase() || "resilient"
  } home base with ${data.employmentType || "your current role"} work and ${
    data.hasDependents ? `${data.dependentCount} dependents` : "personal goals"
  }. Your next focus: ${focusGoal.toLowerCase()}.`

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

  return { persona, statement: summary, priorities, tips, timeline, aiPrompt: focusGoal }
}
