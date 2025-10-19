"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { BottomNav } from "@/components/bottom-nav"
import { ChatModal } from "@/components/chat-modal"
import { DynamicQuiz } from "@/components/DynamicQuiz"
import { FaqScreen } from "@/components/faq-screen"
import { InsightsDashboard } from "@/components/insights-dashboard"
import LandingScreen from "@/components/landing-screen"
import { LearningHub } from "@/components/learning-hub"
import { ProfileSettings } from "@/components/profile-settings"
import { TimelineScreen } from "@/components/timeline-screen"
import { requestPlans, sendPlanReport, upsertUser, fetchInsights } from "@/lib/api"
import {
  DEFAULT_ENROLLMENT_FORM,
  FORM_STORAGE_KEY,
  INSIGHTS_STORAGE_KEY,
  MOMENTS_STORAGE_KEY,
  PROFILE_CREATED_KEY,
} from "@/lib/enrollment"
import { useHydrated } from "@/lib/hooks/useHydrated"
import { buildInsights, buildPriorityBenefits, withDerivedMetrics } from "@/lib/insights"
import {
  removeStorage,
  readStorage,
  readString,
  writeStorage,
  writeString,
} from "@/lib/storage"
import type {
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

export default function Home() {
  const { user, isLoading: userLoading, login, logout } = useUser()
  const [currentScreen, setCurrentScreen] = useState<ScreenKey>(() => "quiz")
  const [formData, setFormData] = useState<EnrollmentFormData | null>(() => createFreshForm())
  const [insights, setInsights] = useState<LifeLensInsights | null>(null)
  const [savedMoments, setSavedMoments] = useState<SavedMoment[]>([])
  const [profileCreatedAt, setProfileCreatedAt] = useState<string>(() => new Date().toISOString())
  const [isGenerating, setIsGenerating] = useState(false)
  const [hasCompletedQuiz, setHasCompletedQuiz] = useState(false)
  const [usingPlaceholder, setUsingPlaceholder] = useState(false)
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
    ensureUserSession(prepared.preferredName || prepared.fullName || "Guest")
    setFormData(prepared)
    setIsGenerating(true)
    setHasCompletedQuiz(true)

    const localInsights = buildInsights(prepared)
    setInsights(localInsights)
    appendMomentForInsights(localInsights)

    try {
      const saveResult = await upsertUser(prepared)
      const userId = saveResult.data?.userId ?? prepared.userId ?? assignUserId()
      if (userId !== prepared.userId) {
        setFormData((existing) => (existing ? { ...existing, userId } : existing))
      }
      
      // Try to fetch insights from database first
      const insightsResult = await fetchInsights(userId)
      if (insightsResult.data?.insights) {
        const remoteInsights = insightsResult.data.insights
        const normalized = remoteInsights.priorityBenefits?.length
          ? remoteInsights
          : { ...remoteInsights, priorityBenefits: buildPriorityBenefits(prepared) }
        setInsights(normalized)
        setUsingPlaceholder(insightsResult.data.usingPlaceholder)
        appendMomentForInsights(normalized)
      } else {
        // Fallback to generating plans
        const planResult = await requestPlans(userId)
        if (planResult.data?.insights) {
          const remoteInsights = planResult.data.insights
          const normalized = remoteInsights.priorityBenefits?.length
            ? remoteInsights
            : { ...remoteInsights, priorityBenefits: buildPriorityBenefits(prepared) }
          setInsights(normalized)
          setUsingPlaceholder(false)
          appendMomentForInsights(normalized)
        }
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
      
      // Try to fetch insights from database first
      const insightsResult = await fetchInsights(userId)
      if (insightsResult.data?.insights) {
        const updated = insightsResult.data.insights
        const normalized = updated.priorityBenefits?.length
          ? updated
          : { ...updated, priorityBenefits: buildPriorityBenefits(formData) }
        setInsights(normalized)
        setUsingPlaceholder(insightsResult.data.usingPlaceholder)
        appendMomentForInsights(normalized)
      } else {
        // Fallback to generating plans
        const planResult = await requestPlans(userId)
        if (planResult.data?.insights) {
          const updated = planResult.data.insights
          const normalized = updated.priorityBenefits?.length
            ? updated
            : { ...updated, priorityBenefits: buildPriorityBenefits(formData) }
          setInsights(normalized)
          setUsingPlaceholder(false)
          appendMomentForInsights(normalized)
        } else {
          const fallback = buildInsights(formData)
          setInsights(fallback)
          setUsingPlaceholder(true)
          appendMomentForInsights(fallback)
        }
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
    setFormData(createFreshForm())
    setInsights(null)
    setSavedMoments([])
    setHasCompletedQuiz(false)
    logout()
    removeStorage(FORM_STORAGE_KEY)
    removeStorage(INSIGHTS_STORAGE_KEY)
    removeStorage(MOMENTS_STORAGE_KEY)
    removeStorage(PROFILE_CREATED_KEY)
    const refreshedCreatedAt = new Date().toISOString()
    setProfileCreatedAt(refreshedCreatedAt)
    setCurrentScreen("quiz")
  }

  const profileSnapshot: ProfileSnapshot = useMemo(() => {
    if (!formData) {
      return {
        name: user?.name ?? "Guest",
        focusArea: insights?.focusGoal ?? "Priority guidance",
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
      focusArea: insights?.focusGoal ?? "Priority guidance",
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
  }, [formData, insights?.focusGoal, profileCreatedAt, user])

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

  const navVisibleScreens: ScreenKey[] = ["insights", "timeline", "learn", "faq", "profile"]

  return (
    <>
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
              loading={isGenerating}
              usingPlaceholder={usingPlaceholder}
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
            <LearningHub persona={insights?.goalTheme ?? "New Professional"} />
          </motion.div>
        )}
      </AnimatePresence>

      {navVisibleScreens.includes(currentScreen) && (
        <BottomNav currentScreen={currentScreen} onNavigate={handleNavigate} />
      )}

      </main>
      <ChatModal
        baseContext={{ app: "LifeLens" }}
        focusGoal={insights?.focusGoal}
        persona={insights?.goalTheme}
        userId={formData?.userId ?? undefined}
      />
    </>
  )
}
