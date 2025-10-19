"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { BottomNav } from "@/components/bottom-nav"
import { DynamicQuiz } from "@/components/DynamicQuiz"
import { FaqScreen } from "@/components/faq-screen"
import { InsightsDashboard } from "@/components/insights-dashboard"
import { LandingScreen } from "@/components/landing-screen"
import { ChatScreen } from "@/components/chat-screen"
import { ProfileSettings } from "@/components/profile-settings"
import { TimelineScreen } from "@/components/timeline-screen"
import { requestPlans, sendChatMessage, sendLearningMessage, sendPlanReport, upsertUser } from "@/lib/api"
import {
  CHAT_STORAGE_KEY,
  DEFAULT_ENROLLMENT_FORM,
  FORM_STORAGE_KEY,
  INSIGHTS_STORAGE_KEY,
  LEARN_CHAT_STORAGE_KEY,
  MOMENTS_STORAGE_KEY,
  PROFILE_CREATED_KEY,
} from "@/lib/enrollment"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { buildInsights, buildPriorityBenefits, mergeChatHistory, withDerivedMetrics } from "@/lib/insights"
import {
  removeStorage,
  readStorage,
  readString,
  writeStorage,
  writeString,
} from "@/lib/storage"
import type {
  ChatEntry,
  EnrollmentFormData,
  LifeLensInsights,
  ProfileSnapshot,
  SavedMoment,
  ScreenKey,
} from "@/lib/types"
import { useUser } from "@/lib/user-context"
import { cn } from "@/lib/utils"

function createFreshForm(): EnrollmentFormData {
  return withDerivedMetrics({
    ...DEFAULT_ENROLLMENT_FORM,
    createdAt: new Date().toISOString(),
  })
}

function buildLearnWelcomeMessage(): ChatEntry {
  return {
    speaker: "LifeLens",
    message:
      "Welcome to LifeLens Learn! Ask about insurance basics, budgeting for benefits, or any financial literacy topic you want to explore.",
    timestamp: new Date().toISOString(),
    status: "final",
  }
}

export default function Home() {
  const { user, isLoading: userLoading, login, logout } = useUser()
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>(() => "quiz")
  const [formData, setFormData] = useState<EnrollmentFormData | null>(() => createFreshForm())
  const [insights, setInsights] = useState<LifeLensInsights | null>(null)
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([])
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([])
  const [learnChatHistory, setLearnChatHistory] = useState<ChatEntry[]>([])
  const [pendingChatPrompt, setPendingChatPrompt] = useState<string | null>(null)
  const [profileCreatedAt, setProfileCreatedAt] = useState<string>(() => new Date().toISOString())
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const isHydrated = useHydrated()
  const learnQuickPrompts = useMemo(
    () => [
      "What's the difference between an HSA and FSA?",
      "How do deductibles and out-of-pocket maximums work?",
      "How can I budget for my benefits each month?",
    ],
    []
  )

  useEffect(() => {
    if (!isHydrated) return

    const storedProfileCreated = readString(PROFILE_CREATED_KEY, "")
    if (storedProfileCreated) {
      setProfileCreatedAt(storedProfileCreated)
    } else {
      const created = new Date().toISOString()
      setProfileCreatedAt(created)
      writeString(PROFILE_CREATED_KEY, created)
    }

    const storedForm = readStorage<EnrollmentFormData | null>(FORM_STORAGE_KEY, null)
    if (storedForm) {
      setFormData(withDerivedMetrics(storedForm))
    } else {
      setFormData(createFreshForm())
    }

    const storedInsights = readStorage<LifeLensInsights | null>(INSIGHTS_STORAGE_KEY, null)
    if (storedInsights) {
      setInsights(storedInsights)
      setHasCompletedQuiz(true)
      setCurrentScreen("insights")
    } else {
      setHasCompletedQuiz(false)
      setCurrentScreen("quiz")
    }

    const storedMoments = readStorage<SavedMoment[]>(MOMENTS_STORAGE_KEY, [])
    if (storedMoments.length) {
      setSavedMoments(storedMoments)
    }

    const storedChat = readStorage<ChatEntry[]>(CHAT_STORAGE_KEY, [])
    if (storedChat.length) {
      setChatHistory(storedChat)
    }

    const storedLearnChat = readStorage<ChatEntry[]>(LEARN_CHAT_STORAGE_KEY, [])
    if (storedLearnChat.length) {
      setLearnChatHistory(storedLearnChat)
    } else {
      setLearnChatHistory([buildLearnWelcomeMessage()])
    }
  }, [isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    if (formData) {
      writeStorage(FORM_STORAGE_KEY, formData)
    } else {
      removeStorage(FORM_STORAGE_KEY)
    }
  }, [formData, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    if (insights) {
      writeStorage(INSIGHTS_STORAGE_KEY, insights)
    } else {
      removeStorage(INSIGHTS_STORAGE_KEY)
    }
  }, [insights, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    writeStorage(MOMENTS_STORAGE_KEY, savedMoments)
  }, [savedMoments, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    writeStorage(CHAT_STORAGE_KEY, chatHistory)
  }, [chatHistory, isHydrated])

  useEffect(() => {
    if (!isHydrated) return
    writeStorage(LEARN_CHAT_STORAGE_KEY, learnChatHistory)
  }, [learnChatHistory, isHydrated])

  const ensureUserSession = (name: string) => {
    login({ name, createdAt: profileCreatedAt })
  }

  const assignUserId = () =>
    (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `user-${Date.now()}`)

  const handleStart = () => {
    const base = formData
      ? {
          ...formData,
          userId: formData.userId ?? assignUserId(),
          createdAt: new Date().toISOString(),
        }
      : {
          ...createFreshForm(),
          userId: assignUserId(),
        }
    const prepared = withDerivedMetrics(base)
    ensureUserSession(prepared.preferredName || prepared.fullName || "Guest")
    setFormData(prepared)
    setHasCompletedQuiz(false)
    setCurrentScreen("quiz")
  }

  const handleQuizUpdate = (data: EnrollmentFormData) => {
    setFormData(data)
  }

  const appendMomentForInsights = (nextInsights: LifeLensInsights) => {
    const timestamp = new Date().toISOString()
    const momentId = `${nextInsights.themeKey ?? "plan"}-${Date.now()}`
    const summaryTitle = nextInsights.priorityBenefits[0]?.title ?? "Benefit update"
    const newMoment: SavedMoment = {
      id: momentId,
      category: nextInsights.themeKey ?? "foundation",
      summary: summaryTitle,
      timeline: nextInsights.timeline,
      timestamp,
      insight: nextInsights,
    }

    setSavedMoments((previous) => {
      const filtered = previous.filter((entry) => entry.summary !== newMoment.summary)
      return [...filtered, newMoment].slice(-8)
    })
  }

  const handleQuizComplete = async (data: EnrollmentFormData) => {
    const prepared = withDerivedMetrics({ ...data, userId: data.userId ?? assignUserId() })
    ensureUserSession(prepared.preferredName || prepared.fullName || "Guest")
    setFormData(prepared)
    setIsGenerating(true)
    setHasCompletedQuiz(true)

    const localInsights = buildInsights(prepared)
    setInsights(localInsights)
    appendMomentForInsights(localInsights)

    if (localInsights.conversation.length > 0) {
      const additions: ChatEntry[] = localInsights.conversation.map((entry, index) => ({
        speaker: entry.speaker,
        message: entry.message,
        timestamp: new Date(Date.now() + index).toISOString(),
        status: "final" as const,
      }))
      setChatHistory((previous) => mergeChatHistory(previous, additions))
    }

    try {
      const saveResult = await upsertUser(prepared)
      const userId = saveResult.data?.userId ?? prepared.userId ?? assignUserId()
      if (userId !== prepared.userId) {
        setFormData((existing) => (existing ? { ...existing, userId } : existing))
      }
      const planResult = await requestPlans(userId)
      if (planResult.data?.insights) {
        const remoteInsights = planResult.data.insights
        const normalized = remoteInsights.priorityBenefits?.length
          ? remoteInsights
          : { ...remoteInsights, priorityBenefits: buildPriorityBenefits(prepared) }
        setInsights(normalized)
        appendMomentForInsights(normalized)
      }
    } finally {
      setIsGenerating(false)
      setCurrentScreen("insights")
    }
  }

  const handleRegenerate = async () => {
    if (!formData) return
    setIsGenerating(true)
    try {
      const userId = formData.userId ?? assignUserId()
      const planResult = await requestPlans(userId)
      if (planResult.data?.insights) {
        const updated = planResult.data.insights
        const normalized = updated.priorityBenefits?.length
          ? updated
          : { ...updated, priorityBenefits: buildPriorityBenefits(formData) }
        setInsights(normalized)
        appendMomentForInsights(normalized)
      } else {
        const fallback = buildInsights(formData)
        setInsights(fallback)
        appendMomentForInsights(fallback)
      }
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSelectMoment = (selectedInsight: LifeLensInsights) => {
    setInsights(selectedInsight)
    setCurrentScreen("insights")
  }

  const handleNavigate = (target: ScreenKey) => {
    if (target === "insights" && !insights) {
      setCurrentScreen(formData ? "quiz" : "landing")
      return
    }
    if (target !== "chat") {
      setPendingChatPrompt(null)
    }
    setCurrentScreen(target)
  }

  const handleClearAllData = () => {
    setFormData(createFreshForm())
    setInsights(null)
    setSavedMoments([])
    setChatHistory([])
    setLearnChatHistory([buildLearnWelcomeMessage()])
    setPendingChatPrompt(null)
    setHasCompletedQuiz(false)
    logout()
    removeStorage(FORM_STORAGE_KEY)
    removeStorage(INSIGHTS_STORAGE_KEY)
    removeStorage(MOMENTS_STORAGE_KEY)
    removeStorage(CHAT_STORAGE_KEY)
    removeStorage(LEARN_CHAT_STORAGE_KEY)
    removeStorage(PROFILE_CREATED_KEY)
    const refreshedCreatedAt = new Date().toISOString()
    setProfileCreatedAt(refreshedCreatedAt)
    setCurrentScreen("quiz")
  }

  const handleChatSend = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed) return

    setPendingChatPrompt(null)

    const userEntry: ChatEntry = {
      speaker: "You",
      message: trimmed,
      timestamp: new Date().toISOString(),
      status: "final",
    }

    const pendingEntry: ChatEntry = {
      speaker: "LifeLens",
      message: "Thinking…",
      timestamp: new Date(Date.now() + 200).toISOString(),
      status: "pending",
    }

    setChatHistory((previous) => [...previous, userEntry, pendingEntry])

    const finalizeReply = (reply: string) => {
      setChatHistory((previous) => {
        const next = [...previous]
        const pendingIndex = next.findIndex((entry) => entry.status === "pending" && entry.speaker === "LifeLens")
        const finalEntry: ChatEntry = {
          speaker: "LifeLens",
          message: reply,
          timestamp: new Date().toISOString(),
          status: "final",
        }
        if (pendingIndex === -1) {
          next.push(finalEntry)
          return next
        }
        next[pendingIndex] = finalEntry
        return next
      })
    }

    try {
      if (!formData?.userId) {
        finalizeReply("I’ll save your answers once you complete the quiz.")
        return
      }
      const response = await sendChatMessage(formData.userId, trimmed)
      finalizeReply(response.data?.reply.message ?? "Here’s what I recommend: keep following your plan timeline.")
    } catch (error) {
      console.error("Chat message failed", error)
      finalizeReply("I ran into an issue reaching Claude. Let’s try again in a moment.")
    }
  }

  const handleLearnChatSend = async (message: string) => {
    const trimmed = message.trim()
    if (!trimmed) return

    const userEntry: ChatEntry = {
      speaker: "You",
      message: trimmed,
      timestamp: new Date().toISOString(),
      status: "final",
    }

    const pendingEntry: ChatEntry = {
      speaker: "LifeLens",
      message: "Thinking…",
      timestamp: new Date(Date.now() + 200).toISOString(),
      status: "pending",
    }

    setLearnChatHistory((previous) => [...previous, userEntry, pendingEntry])

    const finalizeReply = (reply: string) => {
      setLearnChatHistory((previous) => {
        const next = [...previous]
        const pendingIndex = next.findIndex((entry) => entry.status === "pending" && entry.speaker === "LifeLens")
        const finalEntry: ChatEntry = {
          speaker: "LifeLens",
          message: reply,
          timestamp: new Date().toISOString(),
          status: "final",
        }
        if (pendingIndex === -1) {
          next.push(finalEntry)
          return next
        }
        next[pendingIndex] = finalEntry
        return next
      })
    }

    try {
      if (!formData?.userId) {
        finalizeReply("Finish the LifeLens questionnaire to personalize these lessons, and we’ll keep your study notes here.")
        return
      }
      const response = await sendLearningMessage(formData.userId, trimmed)
      finalizeReply(
        response.data?.reply.message ??
          "Here’s a financial literacy tip: review how premiums, deductibles, and out-of-pocket maximums work together to plan your budget."
      )
    } catch (error) {
      console.error("Learning chat message failed", error)
      finalizeReply("I couldn’t load new learning material right now. Let’s try again shortly.")
    }
  }

  const profileSnapshot: ProfileSnapshot = useMemo(() => {
    if (!formData) {
      return {
        name: user?.name ?? "Guest",
        age: "—",
        employmentStartDate: "—",
        dependents: 0,
        residencyStatus: "Citizen",
        citizenship: "United States",
        riskFactorScore: 0,
        activitySummary: "",
        coverageComplexity: "medium",
        createdAt: user?.createdAt ?? profileCreatedAt,
      }
    }

    const activitySummary = formData.physicalActivities
      ? formData.activityList.length
        ? formData.activityList.join(", ")
        : "Active lifestyle"
      : "Low impact"

    return {
      name: formData.preferredName || formData.fullName,
      age: formData.age ? String(formData.age) : "—",
      employmentStartDate: formData.employmentStartDate,
      dependents: formData.dependents,
      residencyStatus: formData.residencyStatus,
      citizenship: formData.citizenship,
      riskFactorScore: formData.derived.riskFactorScore,
      activitySummary,
      coverageComplexity: formData.derived.coverageComplexity,
      createdAt: user?.createdAt ?? profileCreatedAt,
    }
  }, [formData, profileCreatedAt, user])

  const handleProfileUpdate = async (next: EnrollmentFormData) => {
    const prepared = withDerivedMetrics(next)
    setFormData(prepared)
    setInsights((current) => {
      if (current || hasCompletedQuiz) {
        return buildInsights(prepared)
      }
      return current
    })
    if (prepared.userId) {
      void upsertUser(prepared)
    }
  }

  const handleSendReport = async () => {
    if (!formData?.userId || !insights?.selectedPlanId) return
    const result = await sendPlanReport(formData.userId, insights.selectedPlanId)
    if (result.data?.reportUrl) {
      if (typeof window !== "undefined") {
        window.open(result.data.reportUrl, "_blank")
      }
    } else if (typeof window !== "undefined") {
      window.alert(result.error ?? "We couldn’t prepare the report just yet.")
    }
  }

  if (!isHydrated || userLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#F7F4F2] text-[#A41E34]">
        <div className="text-center">
          <div className="mb-4 text-2xl font-semibold">LifeLens</div>
          <div className="text-sm">Preparing your financial guidance...</div>
        </div>
      </div>
    )
  }

  const navVisibleScreens: ScreenKey[] = ["insights", "timeline", "learn", "faq", "profile", "chat"]

  return (
    <main className={cn("min-h-screen bg-[#F7F4F2] pb-24", isGenerating && "pointer-events-none opacity-95")}> 
      <AnimatePresence mode="wait" initial={false}>
        {currentScreen === "landing" && (
          <motion.div
            key="landing"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35 }}
          >
            <LandingScreen
              onStart={handleStart}
              hasExistingInsights={!!insights}
              onViewInsights={() => setCurrentScreen("insights")}
              quizCompleted={hasCompletedQuiz}
            />
          </motion.div>
        )}

        {currentScreen === "quiz" && formData && (
          <motion.div
            key="quiz"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <DynamicQuiz
              initialData={formData}
              onBack={() => setCurrentScreen("landing")}
              onUpdate={handleQuizUpdate}
              onComplete={handleQuizComplete}
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
              onSendReport={handleSendReport}
              onOpenChat={(prompt) => {
                setPendingChatPrompt(prompt ?? null)
                setCurrentScreen("chat")
              }}
              loading={isGenerating}
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
              onBack={() => setCurrentScreen(insights ? "insights" : "quiz")}
              onSelectInsight={handleSelectMoment}
            />
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
              onSendReport={handleSendReport}
              formData={formData}
              onUpdateProfile={handleProfileUpdate}
            />
          </motion.div>
        )}

        {currentScreen === "learn" && (
          <motion.div
            key="learn"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <ChatScreen
              history={learnChatHistory}
              onSend={handleLearnChatSend}
              onBack={() => setCurrentScreen(insights ? "insights" : "landing")}
              eyebrow="LifeLens Learn"
              title="Build your benefits knowledge"
              subtitle="Explore financial literacy topics tailored to your enrollment goals."
              quickPrompts={learnQuickPrompts}
              quickPromptHeading="Learning prompts"
              emptyStateMessage="Ask LifeLens Learn about benefits basics, employer accounts, or how coverage terms work and we'll explain in plain language."
              headerBadge="Learning mode"
              placeholder="Ask about HSAs, budgeting, or how insurance terms work…"
            />
          </motion.div>
        )}

        {currentScreen === "chat" && (
          <motion.div
            key="chat"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -12 }}
            transition={{ duration: 0.3 }}
          >
            <ChatScreen
              history={chatHistory}
              pendingPrompt={pendingChatPrompt}
              onPromptConsumed={() => setPendingChatPrompt(null)}
              onSend={handleChatSend}
              onBack={() => setCurrentScreen(insights ? "insights" : "landing")}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {navVisibleScreens.includes(currentScreen) && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}
    </main>
  )
}
