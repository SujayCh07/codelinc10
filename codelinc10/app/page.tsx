"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { LandingScreen } from "@/components/landing-screen"
import {
  DEFAULT_ENROLLMENT_FORM,
  DEMO_ENROLLMENT_FORM,
  EnrollmentForm,
  type EnrollmentFormData,
} from "@/components/enrollment-form"
import { InsightsDashboard, type LifeLensInsights } from "@/components/insights-dashboard"
import { SupportDock } from "@/components/support-dock"
import { BottomNav } from "@/components/bottom-nav"
import { TimelineScreen, type SavedMoment } from "@/components/timeline-screen"
import { LearningHub } from "@/components/learning-hub"
import { FaqScreen } from "@/components/faq-screen"
import { ProfileSettings } from "@/components/profile-settings"
import { ChatPanel, type ChatEntry } from "@/components/chat-panel"

const FORM_STORAGE_KEY = "lifelens-form-cache"
const INSIGHTS_STORAGE_KEY = "lifelens-insights-cache"
const MOMENTS_STORAGE_KEY = "lifelens-moments-cache"
const CHAT_STORAGE_KEY = "lifelens-chat-cache"
const PROFILE_CREATED_KEY = "lifelens-profile-created"

type Screen = "landing" | "enrollment" | "insights" | "timeline" | "learning" | "faq" | "profile"

interface ProfileSnapshot {
  name: string
  aiPersona: string
  ageRange: string
  employmentType: string
  householdSize: number
  dependents: number
  lifeEvents: string[]
  goals: string[]
  createdAt: string
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing")
  const [formData, setFormData] = useState<EnrollmentFormData | null>(null)
  const [insights, setInsights] = useState<LifeLensInsights | null>(null)
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([])
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([])
  const [profileCreatedAt, setProfileCreatedAt] = useState<string>(() => new Date().toISOString())
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    try {
      const storedForm = window.localStorage.getItem(FORM_STORAGE_KEY)
      const storedInsights = window.localStorage.getItem(INSIGHTS_STORAGE_KEY)
      const storedMoments = window.localStorage.getItem(MOMENTS_STORAGE_KEY)
      const storedChat = window.localStorage.getItem(CHAT_STORAGE_KEY)
      const storedProfileCreated = window.localStorage.getItem(PROFILE_CREATED_KEY)

      if (storedProfileCreated) {
        setProfileCreatedAt(storedProfileCreated)
      } else {
        const created = new Date().toISOString()
        setProfileCreatedAt(created)
        window.localStorage.setItem(PROFILE_CREATED_KEY, created)
      }

      if (storedForm) {
        const parsedForm = JSON.parse(storedForm) as EnrollmentFormData
        setFormData({ ...DEFAULT_ENROLLMENT_FORM, ...parsedForm })
      }

      if (storedInsights) {
        const parsedInsights = JSON.parse(storedInsights) as LifeLensInsights
        setInsights(parsedInsights)
        setCurrentScreen("insights")
      }

      if (storedMoments) {
        const parsedMoments = JSON.parse(storedMoments) as SavedMoment[]
        setSavedMoments(parsedMoments)
      }

      if (storedChat) {
        const parsedChat = JSON.parse(storedChat) as ChatEntry[]
        setChatHistory(parsedChat)
      }
    } catch (error) {
      console.error("LifeLens cache could not be restored", error)
    } finally {
      setIsHydrated(true)
    }
  }, [])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    if (formData) {
      window.localStorage.setItem(FORM_STORAGE_KEY, JSON.stringify(formData))
    }
  }, [formData, isHydrated])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    if (insights) {
      window.localStorage.setItem(INSIGHTS_STORAGE_KEY, JSON.stringify(insights))
    }
  }, [insights, isHydrated])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    window.localStorage.setItem(MOMENTS_STORAGE_KEY, JSON.stringify(savedMoments))
  }, [savedMoments, isHydrated])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    window.localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(chatHistory))
  }, [chatHistory, isHydrated])

  const handleStart = (asGuest: boolean) => {
    const template = asGuest ? DEMO_ENROLLMENT_FORM : DEFAULT_ENROLLMENT_FORM
    setFormData({ ...template, isGuest: asGuest })
    setCurrentScreen("enrollment")
  }

  const handleEnrollmentUpdate = (data: EnrollmentFormData) => {
    setFormData(data)
  }

  const handleEnrollmentComplete = (data: EnrollmentFormData) => {
    const generated = buildInsights(data)
    const timestamp = new Date().toISOString()

    setFormData(data)
    setInsights(generated)
    setCurrentScreen("insights")

    const momentId = `${generated.themeKey ?? "plan"}-${Date.now()}`
    const newMoment: SavedMoment = {
      id: momentId,
      category: generated.themeKey ?? "foundation",
      summary: generated.focusGoal,
      timeline: generated.timeline,
      timestamp,
      insight: generated,
    }

    setSavedMoments((previous) => {
      const filtered = previous.filter((entry) => entry.summary !== newMoment.summary)
      const updated = [...filtered, newMoment].slice(-8)
      return updated
    })

    if (generated.conversation.length > 0) {
      const additions: ChatEntry[] = generated.conversation.map((entry, index) => ({
        speaker: entry.speaker,
        message: entry.message,
        timestamp: new Date(Date.now() + index).toISOString(),
      }))
      setChatHistory((previous) => mergeChatHistory(previous, additions))
    }
  }

  const handleRegenerate = () => {
    if (!formData) return
    const regenerated = buildInsights(formData)
    setInsights(regenerated)
    setSavedMoments((previous) => {
      if (!previous.length) return previous
      const latest = previous[previous.length - 1]
      const updatedLatest: SavedMoment = { ...latest, timeline: regenerated.timeline, insight: regenerated }
      return [...previous.slice(0, -1), updatedLatest]
    })
  }

  const handleRestartQuiz = () => {
    const isGuest = formData?.isGuest ?? true
    const template = isGuest ? DEMO_ENROLLMENT_FORM : DEFAULT_ENROLLMENT_FORM
    setFormData({ ...template, isGuest })
    setCurrentScreen("enrollment")
  }

  const handleSelectMoment = (selectedInsight: LifeLensInsights) => {
    setInsights(selectedInsight)
    setCurrentScreen("insights")
  }

  const handleNavigate = (target: Screen) => {
    if (target === "insights" && !insights) {
      setCurrentScreen(formData ? "enrollment" : "landing")
      return
    }
    setCurrentScreen(target)
  }

  const handleClearAllData = () => {
    setFormData(null)
    setInsights(null)
    setSavedMoments([])
    setChatHistory([])
    if (typeof window !== "undefined") {
      window.localStorage.removeItem(FORM_STORAGE_KEY)
      window.localStorage.removeItem(INSIGHTS_STORAGE_KEY)
      window.localStorage.removeItem(MOMENTS_STORAGE_KEY)
      window.localStorage.removeItem(CHAT_STORAGE_KEY)
    }
    setCurrentScreen("landing")
  }

  const handleChatSend = (message: string) => {
    const userEntry: ChatEntry = { speaker: "You", message, timestamp: new Date().toISOString() }
    const replyMessage = buildChatReply(message, insights)
    const replyEntry: ChatEntry = {
      speaker: "LifeLens",
      message: replyMessage,
      timestamp: new Date(Date.now() + 500).toISOString(),
    }

    setChatHistory((previous) => [...previous, userEntry, replyEntry])
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-white text-[#A41E34]">
        Preparing LifeLens…
      </div>
    )
  }

  const profileSnapshot: ProfileSnapshot = useMemo(() => {
    if (!formData) {
      return {
        name: "Guest",
        aiPersona: insights?.persona ?? "Balanced Navigator",
        ageRange: "—",
        employmentType: "—",
        householdSize: 1,
        dependents: 0,
        lifeEvents: [],
        goals: [],
        createdAt: profileCreatedAt,
      }
    }

    const householdSize =
      formData.householdCoverage === "You only"
        ? 1
        : formData.householdCoverage === "You + partner"
          ? 2
          : Math.max(2, 1 + formData.dependentCount)

    return {
      name: formData.preferredName || formData.fullName,
      aiPersona: insights?.persona ?? "Balanced Navigator",
      ageRange: `${formData.age}`,
      employmentType: `Since ${formData.employmentStart}`,
      householdSize,
      dependents: formData.dependentCount,
      lifeEvents: formData.milestoneFocus ? [formData.milestoneFocus] : [],
      goals: formData.financialGoals,
      createdAt: profileCreatedAt,
    }
  }, [formData, insights?.persona, profileCreatedAt])

  return (
    <main className="min-h-screen bg-[#F7F4F2] pb-24">
      <AnimatePresence mode="wait" initial={false}>
        {currentScreen === "landing" && (
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

        {currentScreen === "enrollment" && (
          <motion.div
            key="enrollment"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <EnrollmentForm
              onComplete={handleEnrollmentComplete}
              onBackToLanding={() => setCurrentScreen("landing")}
              onUpdate={handleEnrollmentUpdate}
              initialData={formData ?? DEFAULT_ENROLLMENT_FORM}
            />
          </motion.div>
        )}

        {currentScreen === "insights" && insights && (
          <motion.div
            key="insights"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <InsightsDashboard
              insights={insights}
              onBackToLanding={() => setCurrentScreen("landing")}
              onRegenerate={handleRegenerate}
              onRestartQuiz={handleRestartQuiz}
            />
          </motion.div>
        )}

        {currentScreen === "timeline" && (
          <motion.div
            key="timeline"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <TimelineScreen
              savedInsights={savedMoments}
              onBack={() => setCurrentScreen(insights ? "insights" : "enrollment")}
              onSelectInsight={handleSelectMoment}
            />
          </motion.div>
        )}

        {currentScreen === "learning" && (
          <motion.div
            key="learning"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <LearningHub persona={insights?.persona ?? "Balanced Navigator"} />
          </motion.div>
        )}

        {currentScreen === "faq" && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <FaqScreen onBack={() => setCurrentScreen(insights ? "insights" : "landing")} />
          </motion.div>
        )}

        {currentScreen === "profile" && (
          <motion.div
            key="profile"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <ProfileSettings
              profile={profileSnapshot}
              onClearData={handleClearAllData}
              onReassess={() => setCurrentScreen("enrollment")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {currentScreen !== "landing" && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}

      <SupportDock
        persona={insights?.persona}
        focusGoal={insights?.focusGoal}
        screen={currentScreen}
        prompts={insights?.prompts}
        conversation={insights?.conversation}
        onBackToLanding={currentScreen === "insights" ? () => setCurrentScreen("landing") : undefined}
      />

      <ChatPanel history={chatHistory} onSend={handleChatSend} />
    </main>
  )
}

function mergeChatHistory(existing: ChatEntry[], additions: ChatEntry[]) {
  const seen = new Set(existing.map((entry) => `${entry.speaker}-${entry.message}`))
  const filtered = additions.filter((entry) => {
    const key = `${entry.speaker}-${entry.message}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
  return [...existing, ...filtered]
}

function buildChatReply(message: string, insights: LifeLensInsights | null): string {
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

  return `Let's keep ${insights.focusGoal.toLowerCase()} moving. ${insights.priorities[0]?.description ?? "We’ll highlight the next nudge soon."}`
}

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
