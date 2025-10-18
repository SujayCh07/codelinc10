"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { LandingScreen } from "@/components/landing-screen"
import {
  ENROLLMENT_STORAGE_KEY,
  EnrollmentForm,
  type EnrollmentFormData,
} from "@/components/enrollment-form"
import { InsightsDashboard } from "@/components/insights-dashboard"

type Screen = "landing" | "enroll" | "insights"

type Priority = "high" | "medium" | "low"

type Benefit = {
  title: string
  description: string
  priority: Priority
  action: string
  category: string
}

type FinancialTip = {
  title: string
  description: string
  icon: string
}

type TimelineItem = {
  period: string
  title: string
  description: string
}

interface InsightPayload {
  category: "career" | "family" | "home" | "health" | "education"
  headline: string
  summary: string
  aiPrompt: string
  benefits: Benefit[]
  financialTips: FinancialTip[]
  timeline: TimelineItem[]
}

const PROFILE_STORAGE_KEY = "lifelens-profile-v2"
const INSIGHTS_STORAGE_KEY = "lifelens-insights-v2"

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing")
  const [profile, setProfile] = useState<EnrollmentFormData | null>(null)
  const [insights, setInsights] = useState<InsightPayload | null>(null)
  const [startMode, setStartMode] = useState<"member" | "guest">("member")
  const [isHydrated, setIsHydrated] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const storedProfile = window.localStorage.getItem(PROFILE_STORAGE_KEY)
      const storedInsights = window.localStorage.getItem(INSIGHTS_STORAGE_KEY)

      if (storedProfile && storedInsights) {
        const parsedProfile = JSON.parse(storedProfile) as EnrollmentFormData
        const parsedInsights = JSON.parse(storedInsights) as InsightPayload
        setProfile(parsedProfile)
        setInsights(parsedInsights)
        setCurrentScreen("insights")
      }
    } catch (error) {
      console.error("Unable to restore saved LifeLens session", error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  const initialEnrollmentData = useMemo(() => {
    if (profile) {
      return profile
    }

    return {
      isGuest: startMode === "guest",
    } satisfies Partial<EnrollmentFormData>
  }, [profile, startMode])

  const handleStart = (asGuest: boolean) => {
    setStartMode(asGuest ? "guest" : "member")
    setCurrentScreen("enroll")
  }

  const handleEnrollmentComplete = (data: EnrollmentFormData) => {
    const completedProfile: EnrollmentFormData = {
      ...data,
      isGuest: data.isGuest ?? startMode === "guest",
    }

    const generatedInsights = buildInsights(completedProfile)

    setProfile(completedProfile)
    setInsights(generatedInsights)
    setCurrentScreen("insights")

    if (typeof window !== "undefined") {
      window.localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(completedProfile))
      window.localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(generatedInsights))
    }
  }

  const handleRestart = () => {
    setProfile(null)
    setInsights(null)
    setCurrentScreen("landing")
    setStartMode("member")
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(PROFILE_STORAGE_KEY)
      window.localStorage.removeItem(INSIGHTS_STORAGE_KEY)
      window.localStorage.removeItem(ENROLLMENT_STORAGE_KEY)
    }
  }

  const handleViewTimeline = () => {
    setShowTimeline(true)
  }

  const closeTimeline = () => {
    setShowTimeline(false)
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B0508] via-[#27070E] to-[#3A0A13] text-white">
        <p className="text-sm text-white/70">Preparing LifeLens…</p>
      </div>
    )
  }

  if (currentScreen === "landing") {
    return <LandingScreen onStart={handleStart} />
  }

  if (currentScreen === "enroll") {
    return <EnrollmentForm onComplete={handleEnrollmentComplete} initialData={initialEnrollmentData} />
  }

  if (currentScreen === "insights" && insights) {
    return (
      <>
        <InsightsDashboard
          insights={insights}
          onViewTimeline={handleViewTimeline}
          onBack={handleRestart}
        />

        <AnimatePresence>
          {showTimeline && (
            <motion.div
              className="fixed inset-0 z-50 flex items-end justify-center bg-black/60 px-4 py-10 sm:items-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-full max-w-3xl rounded-3xl border border-white/15 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl"
                initial={{ opacity: 0, y: 32 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: 32 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <div className="mb-6 flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-semibold">Your LifeLens Action Timeline</h2>
                    <p className="text-sm text-white/70">Tailored milestones to keep momentum strong.</p>
                  </div>
                  <button
                    type="button"
                    onClick={closeTimeline}
                    className="rounded-full border border-white/30 bg-white/10 px-4 py-2 text-sm text-white/80 transition hover:bg-white/20"
                  >
                    Close
                  </button>
                </div>

                <ol className="space-y-4">
                  {insights.timeline.map((item) => (
                    <li
                      key={`${item.period}-${item.title}`}
                      className="rounded-2xl border border-white/10 bg-white/5 p-5"
                    >
                      <div className="text-xs uppercase tracking-[0.3em] text-[#FFB18D]">{item.period}</div>
                      <h3 className="mt-2 text-lg font-semibold">{item.title}</h3>
                      <p className="mt-1 text-sm text-white/75">{item.description}</p>
                    </li>
                  ))}
                </ol>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </>
    )
  }

  return null
}

function buildInsights(profile: EnrollmentFormData): InsightPayload {
  const benefits = generateBenefits(profile)
  const financialTips = generateFinancialTips(profile)
  const timeline = generateTimeline(profile)
  const aiPrompt = composePrompt(profile)
  const category = determineCategory(profile)

  const primaryGoal = [...profile.financialGoals, profile.financialGoalsOther]
    .filter(Boolean)
    .map((goal) => goal.trim())[0]

  const headline = primaryGoal
    ? `Designing a plan around ${primaryGoal.toLowerCase()}`
    : "Crafting a balanced benefits roadmap"

  const summary = profile.lifeSituation || "LifeLens will recommend benefits and savings moves personalized to you."

  return {
    category,
    headline,
    summary,
    aiPrompt,
    benefits,
    financialTips,
    timeline,
  }
}

function determineCategory(profile: EnrollmentFormData): InsightPayload["category"] {
  const goals = profile.financialGoals.map((goal) => goal.toLowerCase())
  const customGoals = profile.financialGoalsOther.toLowerCase()

  if (goals.some((goal) => goal.includes("education")) || customGoals.includes("college")) {
    return "education"
  }

  if (profile.hasDependents === "yes" || goals.some((goal) => goal.includes("family"))) {
    return "family"
  }

  if (profile.homeOwnership === "own" || profile.homeOwnership === "rent") {
    return "home"
  }

  if (profile.riskAppetite === "low" || goals.some((goal) => goal.includes("health"))) {
    return "health"
  }

  return "career"
}

function generateBenefits(profile: EnrollmentFormData): Benefit[] {
  const suggestions: Benefit[] = []
  const combinedGoals = [...profile.financialGoals]
  if (profile.financialGoalsOther.trim()) {
    combinedGoals.push(profile.financialGoalsOther.trim())
  }

  if (profile.employmentType === "full-time") {
    suggestions.push({
      title: "Maximize employer retirement match",
      description:
        "Increase your 401(k) contribution to capture the full employer match—an immediate return that compounds toward retirement.",
      priority: "high",
      action: "Adjust contributions",
      category: "career",
    })
  }

  if (profile.hasDependents === "yes") {
    suggestions.push({
      title: "Evaluate life and disability coverage",
      description:
        "Protect your household income by reviewing life and disability policies. Aim for 10x income coverage and ensure beneficiaries are current.",
      priority: "high",
      action: "Update coverage",
      category: "family",
    })
  }

  if (profile.householdIncome > 90000 && combinedGoals.some((goal) => goal.toLowerCase().includes("savings"))) {
    suggestions.push({
      title: "Automate high-yield savings transfers",
      description:
        "Redirect a percentage of each paycheck into a high-yield emergency fund until you reach 6 months of essential expenses.",
      priority: "medium",
      action: "Automate transfers",
      category: "home",
    })
  }

  if (profile.hasDebt === "yes") {
    suggestions.push({
      title: `Launch a focused ${profile.debtType || "debt"} payoff strategy`,
      description:
        "Use the avalanche method by targeting the highest-interest balance first while maintaining minimum payments on others.",
      priority: "medium",
      action: "View payoff plan",
      category: "career",
    })
  }

  if (!profile.insuranceCoverage.includes("Health")) {
    suggestions.push({
      title: "Enroll in core health benefits",
      description:
        "Review Lincoln Financial's health plans to lock in preventive care, mental health resources, and out-of-pocket protections.",
      priority: "high",
      action: "Compare plans",
      category: "health",
    })
  }

  if (suggestions.length < 3) {
    suggestions.push({
      title: "Schedule a financial wellness check-in",
      description:
        "Meet with a LifeLens coach to align benefits, emergency planning, and long-term savings goals in one action plan.",
      priority: "medium",
      action: "Book session",
      category: "career",
    })
  }

  return suggestions.slice(0, 5)
}

function generateFinancialTips(profile: EnrollmentFormData): FinancialTip[] {
  const tips: FinancialTip[] = [
    {
      title: "Create a benefits calendar",
      description:
        "Map open enrollment, FSA deadlines, and employer match checkpoints so you never miss an opportunity to boost coverage.",
      icon: "🗓️",
    },
    {
      title: "Build a 3-tier safety net",
      description:
        "Split your savings between an emergency fund, insurance coverage, and long-term investments to manage risk at every life stage.",
      icon: "🛡️",
    },
  ]

  if (profile.hasDebt === "yes") {
    tips.push({
      title: "Automate extra debt payments",
      description:
        "Round up payments or schedule biweekly transfers to chip away at principal faster without major budget changes.",
      icon: "📉",
    })
  }

  if (profile.financialGoals.some((goal) => goal.includes("education")) || profile.financialGoalsOther.toLowerCase().includes("college")) {
    tips.push({
      title: "Leverage education savings perks",
      description:
        "Explore 529 plans or employer tuition benefits to stretch every dollar you’re setting aside for education goals.",
      icon: "🎓",
    })
  }

  if (profile.riskAppetite === "high") {
    tips.push({
      title: "Balance growth with protection",
      description:
        "Pair higher-risk investments with adequate insurance and emergency savings so bold moves stay aligned with your comfort level.",
      icon: "⚖️",
    })
  }

  return tips.slice(0, 4)
}

function generateTimeline(profile: EnrollmentFormData): TimelineItem[] {
  const steps: TimelineItem[] = [
    {
      period: "Week 1",
      title: "Complete your benefits checklist",
      description: "Review medical, dental, vision, and life options to confirm coverage aligns with your household.",
    },
    {
      period: "Week 2",
      title: "Update beneficiaries & emergency contacts",
      description: "Ensure your dependents and loved ones are listed across insurance and retirement accounts.",
    },
    {
      period: "Week 3",
      title: "Automate savings contributions",
      description: "Adjust paycheck deductions to fund retirement and emergency savings goals consistently.",
    },
    {
      period: "Next 60 days",
      title: "Schedule a LifeLens coaching session",
      description: "Review progress, explore voluntary benefits, and plan for upcoming life events.",
    },
  ]

  if (profile.hasDebt === "yes") {
    steps.push({
      period: "Quarter 1",
      title: "Reassess your debt payoff milestones",
      description: "Track interest saved and reallocate freed-up cash toward investments or family goals.",
    })
  }

  if (profile.financialGoals.some((goal) => goal.includes("education"))) {
    steps.push({
      period: "Next semester",
      title: "Fund education savings",
      description: "Set calendar reminders for contribution deadlines and tap into employer matching where available.",
    })
  }

  return steps.slice(0, 6)
}

function composePrompt(profile: EnrollmentFormData): string {
  const goals = [...profile.financialGoals]
  if (profile.financialGoalsOther.trim()) {
    goals.push(profile.financialGoalsOther.trim())
  }

  return [
    `User name: ${profile.name || "Guest"}`,
    `Age: ${profile.age}`,
    `Marital status: ${profile.maritalStatus || "unspecified"}`,
    `Employment type: ${profile.employmentType || "unspecified"}`,
    `Dependents: ${profile.hasDependents === "yes" ? profile.dependentCount : "none"}`,
    `Home ownership: ${profile.homeOwnership || "unspecified"}`,
    `Household income: $${profile.householdIncome.toLocaleString()}`,
    `Insurance coverage: ${profile.insuranceCoverage.join(", ") || "none"}`,
    `Retirement status: ${profile.retirementStatus || "unspecified"}`,
    `Debt: ${profile.hasDebt === "yes" ? profile.debtType : "no debt"}`,
    `Risk appetite: ${profile.riskAppetite || "unspecified"}`,
    `Financial goals: ${goals.join(", ") || "not provided"}`,
    `Life situation: ${profile.lifeSituation}`,
  ].join("\n")
}
