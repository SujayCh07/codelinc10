"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { BottomNav } from "@/components/bottom-nav"
import { ChatPanel } from "@/components/chat-panel"
import { DynamicQuiz } from "@/components/DynamicQuiz"
import { FaqScreen } from "@/components/faq-screen"
import { InsightsDashboard } from "@/components/insights-dashboard"
import { LandingScreen } from "@/components/landing-screen"
import { ProfileSettings } from "@/components/profile-settings"
import { SupportDock } from "@/components/support-dock"
import { TimelineScreen } from "@/components/timeline-screen"
import { requestPlans, sendChatMessage, sendPlanReport, upsertUser } from "@/lib/api"
import {
  CHAT_STORAGE_KEY,
  DEFAULT_ENROLLMENT_FORM,
  FORM_STORAGE_KEY,
  INSIGHTS_STORAGE_KEY,
  MOMENTS_STORAGE_KEY,
  PROFILE_CREATED_KEY,
} from "@/lib/enrollment"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { buildInsights, mergeChatHistory, withDerivedMetrics } from "@/lib/insights"
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

export default function Home() {
  const { user, isLoading: userLoading, login, logout } = useUser()
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>("landing")
  const [formData, setFormData] = useState<EnrollmentFormData | null>(null)
  const [insights, setInsights] = useState<LifeLensInsights | null>(null)
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([])
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([])
  const [profileCreatedAt, setProfileCreatedAt] = useState<string>(() => new Date().toISOString())
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const isHydrated = useHydrated()

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
    }

    const storedInsights = readStorage<LifeLensInsights | null>(INSIGHTS_STORAGE_KEY, null)
    if (storedInsights) {
      setInsights(storedInsights)
      setHasCompletedQuiz(true)
    }

    const storedMoments = readStorage<SavedMoment[]>(MOMENTS_STORAGE_KEY, [])
    if (storedMoments.length) {
      setSavedMoments(storedMoments)
    }

    const storedChat = readStorage<ChatEntry[]>(CHAT_STORAGE_KEY, [])
    if (storedChat.length) {
      setChatHistory(storedChat)
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

  const ensureUserSession = (name: string) => {
    login({ name, createdAt: profileCreatedAt })
  }

  const assignUserId = () =>
    (typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : `user-${Date.now()}`)

  const handleStart = () => {
    if (hasCompletedQuiz && insights) {
      setCurrentScreen("insights")
      return
    }

    const template = {
      ...DEFAULT_ENROLLMENT_FORM,
      userId: assignUserId(),
      createdAt: new Date().toISOString(),
    }
    const prepared = withDerivedMetrics(template)
    ensureUserSession(prepared.preferredName || prepared.fullName || "Guest")
    setFormData(prepared)
    setCurrentScreen("quiz")
  }

  const handleQuizUpdate = (data: EnrollmentFormData) => {
    setFormData(data)
  }

  const appendMomentForInsights = (nextInsights: LifeLensInsights) => {
    const timestamp = new Date().toISOString()
    const momentId = `${nextInsights.themeKey ?? "plan"}-${Date.now()}`
    const newMoment: SavedMoment = {
      id: momentId,
      category: nextInsights.themeKey ?? "foundation",
      summary: nextInsights.focusGoal,
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
        setInsights(remoteInsights)
        appendMomentForInsights(remoteInsights)
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
        setInsights(updated)
        appendMomentForInsights(updated)
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
    setCurrentScreen(target)
  }

  const handleClearAllData = () => {
    setFormData(null)
    setInsights(null)
    setSavedMoments([])
    setChatHistory([])
    setHasCompletedQuiz(false)
    logout()
    removeStorage(FORM_STORAGE_KEY)
    removeStorage(INSIGHTS_STORAGE_KEY)
    removeStorage(MOMENTS_STORAGE_KEY)
    removeStorage(CHAT_STORAGE_KEY)
    removeStorage(PROFILE_CREATED_KEY)
    setProfileCreatedAt(new Date().toISOString())
    setCurrentScreen("landing")
  }

  const handleChatSend = async (message: string) => {
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

  const profileSnapshot: ProfileSnapshot = useMemo(() => {
    if (!formData) {
      return {
        name: user?.name ?? "Guest",
        aiPersona: insights?.persona ?? "Balanced Navigator",
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
      aiPersona: insights?.persona ?? "Balanced Navigator",
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
  }, [formData, insights?.persona, profileCreatedAt, user])

  const handleSelectPlan = (planId: string) => {
    setInsights((current) => (current ? { ...current, selectedPlanId: planId } : current))
  }

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

  const navVisibleScreens: ScreenKey[] = ["insights", "timeline", "faq", "profile"]

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
              onSelectPlan={handleSelectPlan}
              onSendReport={handleSendReport}
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
      </AnimatePresence>

      {navVisibleScreens.includes(currentScreen) && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}

      {insights && currentScreen !== "quiz" && (
        <SupportDock
          persona={insights.persona}
          focusGoal={insights.focusGoal}
          screen={currentScreen}
          prompts={insights.prompts}
          conversation={insights.conversation}
          onBackToLanding={currentScreen === "insights" ? () => setCurrentScreen("landing") : undefined}
        />
      )}

      {insights && <ChatPanel history={chatHistory} onSend={handleChatSend} />}
    </main>
  )
}
