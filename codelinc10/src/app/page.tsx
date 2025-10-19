"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { BottomNav } from "@/components/bottom-nav"
import { ChatPanel } from "@/components/chat-panel"
import { EnrollmentForm } from "@/components/enrollment-form"
import { FaqScreen } from "@/components/faq-screen"
import { InsightsDashboard } from "@/components/insights-dashboard"
import { LandingScreen } from "@/components/landing-screen"
import { LearningHub } from "@/components/learning-hub"
import { ProfileSettings } from "@/components/profile-settings"
import { SupportDock } from "@/components/support-dock"
import { TimelineScreen } from "@/components/timeline-screen"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { buildChatReply, buildInsights, mergeChatHistory } from "@/lib/insights"
import {
  CHAT_STORAGE_KEY,
  DEFAULT_ENROLLMENT_FORM,
  DEMO_ENROLLMENT_FORM,
  FORM_STORAGE_KEY,
  INSIGHTS_STORAGE_KEY,
  MOMENTS_STORAGE_KEY,
  PROFILE_CREATED_KEY,
} from "@/lib/enrollment"
import { removeStorage, readStorage, readString, writeStorage, writeString } from "@/lib/storage"
import type {
  ChatEntry,
  EnrollmentFormData,
  LifeLensInsights,
  ProfileSnapshot,
  SavedMoment,
  ScreenKey,
} from "@/lib/types"
import { useUser } from "@/lib/user-context"

export default function Home() {
  const { user, isLoading: userLoading, login, logout } = useUser()
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>("landing")
  const [formData, setFormData] = useState<EnrollmentFormData | null>(null)
  const [insights, setInsights] = useState<LifeLensInsights | null>(null)
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([])
  const [chatHistory, setChatHistory] = useState<ChatEntry[]>([])
  const [profileCreatedAt, setProfileCreatedAt] = useState<string>(() => new Date().toISOString())
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
      setFormData({ ...DEFAULT_ENROLLMENT_FORM, ...storedForm })
    }

    const storedInsights = readStorage<LifeLensInsights | null>(INSIGHTS_STORAGE_KEY, null)
    if (storedInsights) {
      setInsights(storedInsights)
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

  const handleStart = (asGuest: boolean) => {
    // Create user session when starting
    if (!user) {
      login({
        name: asGuest ? "Guest User" : "New User",
        isGuest: asGuest,
      })
    }
    
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
        status: "final" as const,
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

  const handleNavigate = (target: ScreenKey) => {
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
    logout()
    removeStorage(FORM_STORAGE_KEY)
    removeStorage(INSIGHTS_STORAGE_KEY)
    removeStorage(MOMENTS_STORAGE_KEY)
    removeStorage(CHAT_STORAGE_KEY)
    removeStorage(PROFILE_CREATED_KEY)
    setProfileCreatedAt(new Date().toISOString())
    setCurrentScreen("landing")
  }

  const handleChatSend = (message: string) => {
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

    const replyMessage = buildChatReply(trimmed, insights)

    setChatHistory((previous) => [...previous, userEntry, pendingEntry])

    const finalizeReply = () => {
      setChatHistory((previous) => {
        const next = [...previous]
        const pendingIndex = next.findIndex((entry) => entry.status === "pending" && entry.speaker === "LifeLens")
        const finalEntry: ChatEntry = {
          speaker: "LifeLens",
          message: replyMessage,
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

    if (typeof window === "undefined") {
      finalizeReply()
      return
    }

    window.setTimeout(finalizeReply, 450)
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

  const profileSnapshot: ProfileSnapshot = useMemo(() => {
    if (!formData) {
      return {
        name: user?.name ?? "Guest",
        aiPersona: insights?.persona ?? "Balanced Navigator",
        ageRange: "—",
        employmentType: "—",
        householdSize: 1,
        dependents: 0,
        lifeEvents: [],
        goals: [],
        createdAt: user?.createdAt ?? profileCreatedAt,
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
      createdAt: user?.createdAt ?? profileCreatedAt,
    }
  }, [formData, insights?.persona, profileCreatedAt, user])

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
            <LandingScreen 
              onStart={handleStart} 
              hasExistingInsights={!!insights}
              onViewInsights={() => setCurrentScreen("insights")}
            />
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
