"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { Home } from "@/components/home"
import { EnrollmentForm } from "@/components/enrollment-form"
import { InsightsDashboard, type LifeLensInsights } from "@/components/insights-dashboard"
import { DEFAULT_FORM_DATA, type LifeLensFormData } from "@/types/form"

const FORM_STORAGE_KEY = "lifelens-rds-form"
const INSIGHTS_STORAGE_KEY = "lifelens-rds-insights"

type Screen = "home" | "quiz" | "insights"

export default function HomePage() {
  const [screen, setScreen] = useState<Screen>("home")
  const [formData, setFormData] = useState<LifeLensFormData | null>(null)
  const [insights, setInsights] = useState<LifeLensInsights | null>(null)
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const storedForm = window.localStorage.getItem(FORM_STORAGE_KEY)
      const storedInsights = window.localStorage.getItem(INSIGHTS_STORAGE_KEY)

      if (storedForm) {
        const parsed = JSON.parse(storedForm) as LifeLensFormData
        setFormData(parsed)
      }

      if (storedInsights) {
        const parsedInsights = JSON.parse(storedInsights) as LifeLensInsights
        setInsights(parsedInsights)
        setScreen("insights")
      }
    } catch (error) {
      console.error("Unable to restore LifeLens data", error)
    } finally {
      setHydrated(true)
    }
  }, [])

  const handleStart = (asGuest: boolean) => {
    const base = formData ? { ...formData, isGuest: asGuest } : { ...DEFAULT_FORM_DATA, isGuest: asGuest }
    setFormData(base)
    setScreen("quiz")
  }

  const handleUpdate = (data: LifeLensFormData) => {
    setFormData(data)
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(data))
    }
  }

  const handleBackToHome = () => {
    setScreen("home")
  }

  const handleRestartQuiz = () => {
    const guest = formData?.isGuest ?? false
    const reset = { ...DEFAULT_FORM_DATA, isGuest: guest }
    setFormData(reset)
    setScreen("quiz")
    if (typeof window !== "undefined") {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(reset))
    }
  }

  const handleComplete = (data: LifeLensFormData) => {
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

  const initialFormData = useMemo(() => formData ?? undefined, [formData])

  if (!hydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#A41E34]">
        Preparing LifeLens…
      </div>
    )
  }

  return (
    <AnimatePresence mode="wait" initial={false}>
      {screen === "home" && (
        <motion.div
          key="home"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.35 }}
        >
          <Home onStart={handleStart} />
        </motion.div>
      )}

      {screen === "quiz" && (
        <motion.div
          key="quiz"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
          <EnrollmentForm
            onComplete={handleComplete}
            onBackToHome={handleBackToHome}
            initialData={initialFormData}
            onUpdate={handleUpdate}
          />
        </motion.div>
      )}

      {screen === "insights" && insights && (
        <motion.div
          key="insights"
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
        >
          <InsightsDashboard
            insights={insights}
            onBackToHome={handleBackToHome}
            onRegenerate={handleRegenerate}
            onRestartQuiz={handleRestartQuiz}
          />
        </motion.div>
      )}
    </AnimatePresence>
  )
}

function buildInsights(data: LifeLensFormData): LifeLensInsights {
  const persona = buildPersona(data)
  const statement = `LifeLens aligned your benefits for a ${data.householdStructure.toLowerCase()} household in ${data.workLocationState}, ` +
    `keeping pace with your ${data.riskAversion.toLowerCase()} risk preferences and ${data.incomeRange} income.`

  const priorities = [
    {
      title: "Stabilize your safety net",
      description:
        data.emergencySavingsMonths !== null && data.emergencySavingsMonths < 3
          ? "Increase automatic transfers toward an emergency fund until you reach three months of expenses."
          : "Maintain contributions to your reserve fund and consider directing surplus toward targeted benefits upgrades.",
    },
    {
      title: data.householdStructure === "With Dependents" ? "Strengthen family protection" : "Optimize core coverage",
      description:
        data.householdStructure === "With Dependents"
          ? "Review life and disability benefits to cover household income and long-term education goals."
          : "Fine-tune health and supplemental plans so they match your usage and budget expectations.",
    },
    {
      title: data.contributesTo401k === "Yes" ? "Maximize retirement momentum" : "Jump-start retirement savings",
      description:
        data.contributesTo401k === "Yes"
          ? "Confirm that contribution percentages capture the full employer match and revisit beneficiaries annually."
          : "Enroll in the company plan with an initial contribution and schedule a mid-year review to reassess increases.",
    },
  ]

  const tips = [
    {
      title: "Automate contribution checkpoints",
      description: "Set quarterly reminders to review savings and debt paydown alongside benefit enrollment windows.",
      icon: "calendar" as const,
    },
    {
      title: "Document coverage confirmations",
      description: "Store plan summaries, beneficiary confirmations, and policy contacts in a single secure workspace.",
      icon: "shield" as const,
    },
    {
      title: "Grow financial literacy moments",
      description: "Bookmark learning modules on income protection, retirement investing, and care planning for seasonal refreshers.",
      icon: "book" as const,
    },
  ]

  const timeline = [
    {
      period: "Next 30 days",
      title: "Confirm core coverage",
      description: "Validate medical and disability elections, and update dependents in your HR portal if anything has changed.",
    },
    {
      period: "60–90 days",
      title: "Align savings goals",
      description: "Review emergency fund progress, pay down high-interest debt, and adjust contributions to stay on target.",
    },
    {
      period: "Quarterly",
      title: "Review retirement posture",
      description: "Revisit allocation mix, beneficiary designations, and Roth vs. Traditional strategy before open enrollment.",
    },
  ]

  const aiPrompt = `Create a Lincoln Financial benefits summary for ${data.fullName}, highlighting priorities, tips, and timeline based on ` +
    `${data.householdStructure} household status, ${data.employmentType} employment, risk tolerance ${data.riskAversion}, and ${data.retirementState} retirement plans.`

  return { persona, statement, priorities, tips, timeline, aiPrompt }
}

function buildPersona(data: LifeLensFormData): string {
  if (data.householdStructure === "With Dependents") {
    return data.riskAversion === "Aggressive" || data.riskAversion === "Growth"
      ? "Family Growth Architect"
      : "Household Guardian"
  }

  if (data.householdStructure === "With Partner") {
    return data.riskAversion === "Conservative" ? "Stability Strategist" : "Career Momentum Planner"
  }

  return data.riskAversion === "Aggressive" ? "Solo Builder" : "Financial Foundations Navigator"
}
