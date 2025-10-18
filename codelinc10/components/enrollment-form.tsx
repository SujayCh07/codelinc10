"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react"

export interface EnrollmentFormData {
  name: string
  age: number
  maritalStatus: "single" | "married" | "divorced" | "widowed" | ""
  employmentType: "full-time" | "contract" | "retired" | ""
  hasDependents: "yes" | "no" | ""
  dependentCount: number
  homeOwnership: "own" | "rent" | "other" | ""
  householdIncome: number
  insuranceCoverage: string[]
  financialGoals: string[]
  financialGoalsOther: string
  retirementStatus: "planning" | "retired" | "not-started" | ""
  hasDebt: "yes" | "no" | ""
  debtType: string
  riskAppetite: "low" | "medium" | "high" | ""
  lifeSituation: string
  isGuest: boolean
}

export const ENROLLMENT_STORAGE_KEY = "lifelens-enrollment-v2"

interface EnrollmentFormProps {
  onComplete: (data: EnrollmentFormData) => void
  initialData?: Partial<EnrollmentFormData>
}

interface Question {
  id: keyof EnrollmentFormData | "summary"
  title: string
  subtitle?: string
  shouldShow?: (data: EnrollmentFormData) => boolean
  render: (
    data: EnrollmentFormData,
    update: (values: Partial<EnrollmentFormData>) => void
  ) => ReactNode
  isComplete?: (data: EnrollmentFormData) => boolean
}

const INSURANCE_OPTIONS = ["Health", "Dental", "Vision", "Life"]
const GOAL_OPTIONS = [
  "Lower monthly expenses",
  "Increase savings and investments",
  "Protect my family",
  "Plan for retirement",
  "Prepare for education costs",
]
const DEBT_TYPES = [
  "Credit cards",
  "Student loans",
  "Mortgage",
  "Medical bills",
  "Personal loans",
  "Other",
]

const DEFAULT_FORM: EnrollmentFormData = {
  name: "",
  age: 32,
  maritalStatus: "",
  employmentType: "",
  hasDependents: "",
  dependentCount: 0,
  homeOwnership: "",
  householdIncome: 85000,
  insuranceCoverage: [],
  financialGoals: [],
  financialGoalsOther: "",
  retirementStatus: "",
  hasDebt: "",
  debtType: "",
  riskAppetite: "",
  lifeSituation: "",
  isGuest: false,
}

export function EnrollmentForm({ onComplete, initialData }: EnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>(DEFAULT_FORM)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [mode, setMode] = useState<"questions" | "review" | "analyzing">("questions")
  const [isHydrated, setIsHydrated] = useState(false)

  useEffect(() => {
    if (typeof window === "undefined") return

    const stored = window.localStorage.getItem(ENROLLMENT_STORAGE_KEY)
    let nextState = { ...DEFAULT_FORM }

    if (stored) {
      try {
        const parsed = JSON.parse(stored)
        nextState = { ...nextState, ...parsed }
      } catch (error) {
        console.error("Failed to parse enrollment cache", error)
      }
    }

    if (initialData) {
      nextState = { ...nextState, ...initialData }
    }

    setFormData(nextState)
    setCurrentIndex(0)
    setMode("questions")
    setIsHydrated(true)
  }, [initialData])

  useEffect(() => {
    if (!isHydrated || typeof window === "undefined") return
    window.localStorage.setItem(ENROLLMENT_STORAGE_KEY, JSON.stringify(formData))
  }, [formData, isHydrated])

  const updateForm = (values: Partial<EnrollmentFormData>) => {
    setFormData((prev) => {
      const merged = { ...prev, ...values }

      if (values.hasDependents === "no") {
        merged.dependentCount = 0
      }
      if (values.hasDebt === "no") {
        merged.debtType = ""
      }

      return merged
    })
  }

  const questions: Question[] = useMemo(
    () => [
      {
        id: "name",
        title: "Let’s personalize your journey",
        subtitle: "Tell us your name (optional).",
        render: (data, update) => (
          <div className="space-y-3">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              placeholder="Alex Johnson"
              value={data.name}
              onChange={(event) => update({ name: event.target.value })}
            />
            <p className="text-sm text-white/60">
              Prefer to stay anonymous? Leave it blank and we’ll keep things in guest mode.
            </p>
          </div>
        ),
      },
      {
        id: "age",
        title: "How old are you?",
        subtitle: "Your stage of life shapes the benefits we prioritize.",
        render: (data, update) => (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-white/80">
              <Label htmlFor="age">Age</Label>
              <span>{data.age} years</span>
            </div>
            <Slider
              value={[data.age]}
              onValueChange={([value]) => update({ age: value })}
              min={18}
              max={80}
              step={1}
            />
            <Input
              id="age"
              type="number"
              min={18}
              max={80}
              value={data.age}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10)
                if (!Number.isNaN(value)) {
                  update({ age: Math.min(80, Math.max(18, value)) })
                }
              }}
            />
          </div>
        ),
        isComplete: (data) => data.age >= 18,
      },
      {
        id: "maritalStatus",
        title: "What’s your marital status?",
        subtitle: "This helps us understand household needs.",
        render: (data, update) => (
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {["single", "married", "divorced", "widowed"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ maritalStatus: value as EnrollmentFormData["maritalStatus"] })}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  data.maritalStatus === value
                    ? "border-white/70 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        ),
        isComplete: (data) => data.maritalStatus !== "",
      },
      {
        id: "employmentType",
        title: "How would you describe your employment?",
        subtitle: "We tailor benefits to your work style.",
        render: (data, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {["full-time", "contract", "retired"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ employmentType: value as EnrollmentFormData["employmentType"] })}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  data.employmentType === value
                    ? "border-white/70 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {value === "full-time"
                  ? "Full-time"
                  : value === "contract"
                  ? "Contract"
                  : "Retired"}
              </button>
            ))}
          </div>
        ),
        isComplete: (data) => data.employmentType !== "",
      },
      {
        id: "hasDependents",
        title: "Do you currently support any dependents?",
        subtitle: "Dependents could include children, partners, or relatives.",
        render: (data, update) => (
          <div className="flex gap-3">
            {["yes", "no"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => update({
                  hasDependents: value as EnrollmentFormData["hasDependents"],
                  dependentCount:
                    value === "yes"
                      ? data.dependentCount > 0
                        ? data.dependentCount
                        : 1
                      : 0,
                })}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                  data.hasDependents === value
                    ? "border-white/70 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {value === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        ),
        isComplete: (data) => data.hasDependents !== "",
      },
      {
        id: "dependentCount",
        title: "How many people count on you?",
        subtitle: "We’ll ensure everyone is covered.",
        shouldShow: (data) => data.hasDependents === "yes",
        render: (data, update) => (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-white/80">
              <Label htmlFor="dependents">Dependents</Label>
              <span>{data.dependentCount}</span>
            </div>
            <Slider
              value={[data.dependentCount]}
              onValueChange={([value]) => update({ dependentCount: value })}
              min={1}
              max={6}
              step={1}
            />
            <Input
              id="dependents"
              type="number"
              min={1}
              max={10}
              value={data.dependentCount}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10)
                if (!Number.isNaN(value)) {
                  update({ dependentCount: Math.max(1, value) })
                }
              }}
            />
          </div>
        ),
        isComplete: (data) => data.dependentCount > 0,
      },
      {
        id: "homeOwnership",
        title: "What best describes your housing?",
        subtitle: "We’ll map protection and savings ideas that fit.",
        render: (data, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {["own", "rent", "other"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ homeOwnership: value as EnrollmentFormData["homeOwnership"] })}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  data.homeOwnership === value
                    ? "border-white/70 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {value === "own" ? "Own" : value === "rent" ? "Rent" : "Other"}
              </button>
            ))}
          </div>
        ),
        isComplete: (data) => data.homeOwnership !== "",
      },
      {
        id: "householdIncome",
        title: "What’s your approximate household income?",
        subtitle: "We use this to calibrate contribution and savings ideas.",
        render: (data, update) => (
          <div className="space-y-6">
            <div className="flex items-center justify-between text-sm text-white/80">
              <Label htmlFor="householdIncome">Annual income</Label>
              <span>${data.householdIncome.toLocaleString()}</span>
            </div>
            <Slider
              value={[data.householdIncome]}
              onValueChange={([value]) => update({ householdIncome: value })}
              min={20000}
              max={250000}
              step={5000}
            />
            <Input
              id="householdIncome"
              type="number"
              min={20000}
              max={300000}
              step={1000}
              value={data.householdIncome}
              onChange={(event) => {
                const value = Number.parseInt(event.target.value, 10)
                if (!Number.isNaN(value)) {
                  update({ householdIncome: Math.min(300000, Math.max(20000, value)) })
                }
              }}
            />
          </div>
        ),
        isComplete: (data) => data.householdIncome >= 20000,
      },
      {
        id: "insuranceCoverage",
        title: "Which insurance benefits do you currently have?",
        subtitle: "We’ll suggest ways to close any protection gaps.",
        render: (data, update) => (
          <div className="grid gap-3 sm:grid-cols-2">
            {INSURANCE_OPTIONS.map((option) => {
              const isSelected = data.insuranceCoverage.includes(option)
              return (
                <button
                  key={option}
                  type="button"
                  onClick={() => {
                    const next = isSelected
                      ? data.insuranceCoverage.filter((item) => item !== option)
                      : [...data.insuranceCoverage, option]
                    update({ insuranceCoverage: next })
                  }}
                  className={`rounded-xl border px-4 py-3 text-left text-sm font-medium transition ${
                    isSelected
                      ? "border-white/70 bg-white/20 text-white"
                      : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                  }`}
                >
                  {option}
                </button>
              )
            })}
          </div>
        ),
        isComplete: () => true,
      },
      {
        id: "financialGoals",
        title: "What financial goals matter most right now?",
        subtitle: "Pick as many as you’d like and add your own.",
        render: (data, update) => (
          <div className="space-y-6">
            <div className="flex flex-wrap gap-2">
              {GOAL_OPTIONS.map((option) => {
                const isSelected = data.financialGoals.includes(option)
                return (
                  <button
                    key={option}
                    type="button"
                    onClick={() => {
                      const next = isSelected
                        ? data.financialGoals.filter((item) => item !== option)
                        : [...data.financialGoals, option]
                      update({ financialGoals: next })
                    }}
                    className={`rounded-full border px-4 py-2 text-sm transition ${
                      isSelected
                        ? "border-white/80 bg-white/20 text-white"
                        : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                    }`}
                  >
                    {option}
                  </button>
                )
              })}
            </div>
            <div className="space-y-2">
              <Label htmlFor="financialGoalsOther">Add your own goal</Label>
              <Textarea
                id="financialGoalsOther"
                placeholder="e.g. Save for adoption, cover a parent’s medical care"
                value={data.financialGoalsOther}
                onChange={(event) => update({ financialGoalsOther: event.target.value })}
              />
            </div>
          </div>
        ),
        isComplete: (data) =>
          data.financialGoals.length > 0 || data.financialGoalsOther.trim().length > 2,
      },
      {
        id: "retirementStatus",
        title: "Where are you in your retirement planning?",
        subtitle: "We’ll match resources to your timeline.",
        render: (data, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {[
              { label: "Actively planning", value: "planning" },
              { label: "Already retired", value: "retired" },
              { label: "Not started", value: "not-started" },
            ].map((item) => (
              <button
                key={item.value}
                type="button"
                onClick={() => update({ retirementStatus: item.value as EnrollmentFormData["retirementStatus"] })}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  data.retirementStatus === item.value
                    ? "border-white/70 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        ),
        isComplete: (data) => data.retirementStatus !== "",
      },
      {
        id: "hasDebt",
        title: "Do you currently carry any debt?",
        subtitle: "We’ll provide payoff and stress-reduction tips.",
        render: (data, update) => (
          <div className="flex gap-3">
            {["yes", "no"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ hasDebt: value as EnrollmentFormData["hasDebt"] })}
                className={`flex-1 rounded-xl border px-4 py-3 text-sm font-semibold uppercase tracking-wide transition ${
                  data.hasDebt === value
                    ? "border-white/70 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {value === "yes" ? "Yes" : "No"}
              </button>
            ))}
          </div>
        ),
        isComplete: (data) => data.hasDebt !== "",
      },
      {
        id: "debtType",
        title: "What type of debt is top of mind?",
        subtitle: "We’ll craft a realistic payoff timeline.",
        shouldShow: (data) => data.hasDebt === "yes",
        render: (data, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {DEBT_TYPES.map((option) => (
              <button
                key={option}
                type="button"
                onClick={() => update({ debtType: option })}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  data.debtType === option
                    ? "border-white/70 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {option}
              </button>
            ))}
          </div>
        ),
        isComplete: (data) => (data.hasDebt === "yes" ? data.debtType.length > 0 : true),
      },
      {
        id: "riskAppetite",
        title: "How would you describe your financial risk appetite?",
        subtitle: "This guides how bold or conservative our plan should be.",
        render: (data, update) => (
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {["low", "medium", "high"].map((value) => (
              <button
                key={value}
                type="button"
                onClick={() => update({ riskAppetite: value as EnrollmentFormData["riskAppetite"] })}
                className={`rounded-xl border px-4 py-3 text-sm font-medium transition ${
                  data.riskAppetite === value
                    ? "border-white/70 bg-white/20 text-white"
                    : "border-white/20 bg-white/5 text-white/70 hover:border-white/40"
                }`}
              >
                {value.charAt(0).toUpperCase() + value.slice(1)}
              </button>
            ))}
          </div>
        ),
        isComplete: (data) => data.riskAppetite !== "",
      },
      {
        id: "lifeSituation",
        title: "Describe your life in one sentence",
        subtitle: "This fuels the LifeLens AI prompt.",
        render: (data, update) => (
          <div className="space-y-3">
            <Label htmlFor="lifeSituation">Your story</Label>
            <Textarea
              id="lifeSituation"
              rows={4}
              placeholder="e.g. Recently promoted, planning for a second child, want to balance retirement savings and childcare."
              value={data.lifeSituation}
              onChange={(event) => update({ lifeSituation: event.target.value })}
            />
          </div>
        ),
        isComplete: (data) => data.lifeSituation.trim().length > 10,
      },
    ],
    []
  )

  const visibleQuestions = useMemo(
    () => questions.filter((question) => !question.shouldShow || question.shouldShow(formData)),
    [questions, formData]
  )

  useEffect(() => {
    if (mode !== "questions") return
    if (currentIndex > visibleQuestions.length - 1) {
      setCurrentIndex(Math.max(visibleQuestions.length - 1, 0))
    }
  }, [currentIndex, visibleQuestions.length, mode])

  const promptPreview = useMemo(() => {
    const goals = [...formData.financialGoals]
    if (formData.financialGoalsOther.trim()) {
      goals.push(formData.financialGoalsOther.trim())
    }

    const coverage = formData.insuranceCoverage.length
      ? formData.insuranceCoverage.join(", ")
      : "No current coverage listed"

    return `Name: ${formData.name || "Guest"}\nAge: ${formData.age}\nMarital status: ${
      formData.maritalStatus || "unspecified"
    }\nEmployment: ${formData.employmentType || "unspecified"}\nDependents: ${
      formData.hasDependents === "yes" ? `${formData.dependentCount}` : "None"
    }\nHome: ${formData.homeOwnership || "unspecified"}\nHousehold income: $${formData.householdIncome.toLocaleString()}\nInsurance: ${coverage}\nRetirement: ${
      formData.retirementStatus || "unspecified"
    }\nDebt: ${formData.hasDebt === "yes" ? formData.debtType : "No"}\nRisk appetite: ${
      formData.riskAppetite || "unspecified"
    }\nGoals: ${goals.join(", ")}\nLife snapshot: ${formData.lifeSituation.trim()}`
  }, [formData])

  const totalQuestions = visibleQuestions.length
  const progressValue = mode === "questions" && totalQuestions > 0 ? Math.min(100, ((currentIndex + 1) / totalQuestions) * 100) : 100

  const currentQuestion = visibleQuestions[currentIndex]
  const canContinue =
    mode === "questions"
      ? Boolean(currentQuestion && (currentQuestion.isComplete ? currentQuestion.isComplete(formData) : true))
      : true

  const handleNext = () => {
    if (mode === "questions") {
      if (currentIndex < visibleQuestions.length - 1) {
        setCurrentIndex((value) => value + 1)
      } else {
        setMode("review")
      }
    }
  }

  const handleBack = () => {
    if (mode === "review") {
      setMode("questions")
      setCurrentIndex(Math.max(visibleQuestions.length - 1, 0))
      return
    }

    if (currentIndex > 0) {
      setCurrentIndex((value) => value - 1)
    }
  }

  const handleSubmit = () => {
    setMode("analyzing")
    setTimeout(() => {
      onComplete(formData)
    }, 2000)
  }

  if (!isHydrated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-[#1B0508] via-[#27070E] to-[#3A0A13] text-white">
        <div className="space-y-3 text-center">
          <Loader2 className="mx-auto h-8 w-8 animate-spin text-[#FF4F00]" />
          <p className="text-sm text-white/70">Loading LifeLens enrollment…</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1B0508] via-[#27070E] to-[#3A0A13] px-4 py-10 text-white">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8">
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-4 py-1 text-xs uppercase tracking-[0.3em] text-white/70">
              <Sparkles className="h-4 w-4" />
              <span>LifeLens Enrollment</span>
            </div>
            {formData.isGuest && (
              <span className="rounded-full border border-white/30 bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/70">
                Guest Mode
              </span>
            )}
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[#A41E34] via-[#C83144] to-[#FF4F00] transition-all"
              style={{ width: `${progressValue}%` }}
            />
          </div>
          <div className="flex items-center justify-between text-xs uppercase tracking-wide text-white/60">
            <span>Step {mode === "questions" ? currentIndex + 1 : totalQuestions} of {totalQuestions}</span>
            <span>Modern financial wellness intake</span>
          </div>
        </div>

        <div className="relative min-h-[420px] overflow-hidden rounded-3xl border border-white/15 bg-white/10 p-8 shadow-2xl shadow-black/20 backdrop-blur-xl">
          <AnimatePresence mode="wait">
            {mode === "questions" && currentQuestion && (
              <motion.div
                key={currentQuestion.id as string}
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex h-full flex-col justify-between gap-8"
              >
                <div className="space-y-3">
                  <h2 className="text-2xl font-semibold sm:text-3xl">{currentQuestion.title}</h2>
                  {currentQuestion.subtitle && (
                    <p className="text-sm text-white/70 sm:text-base">{currentQuestion.subtitle}</p>
                  )}
                  <div className="mt-6 space-y-4 text-sm text-white/90">
                    {currentQuestion.render(formData, updateForm)}
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    disabled={currentIndex === 0}
                    className="rounded-2xl border-white/30 bg-white/5 text-white transition hover:bg-white/15 disabled:opacity-40"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleNext}
                    disabled={!canContinue}
                    className="rounded-2xl bg-gradient-to-r from-[#A41E34] to-[#FF4F00] text-white shadow-lg shadow-[#A41E34]/30 transition hover:brightness-110 disabled:opacity-40"
                  >
                    Next <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {mode === "review" && (
              <motion.div
                key="review"
                initial={{ opacity: 0, y: 40 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -40 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="flex h-full flex-col justify-between gap-8"
              >
                <div className="space-y-6">
                  <div className="space-y-2">
                    <h2 className="text-3xl font-semibold">Ready for your LifeLens insights?</h2>
                    <p className="text-white/70">
                      We’ll send this snapshot to LifeLens AI to craft benefit recommendations, financial tips, and a personalized timeline.
                    </p>
                  </div>

                  <div className="grid gap-4 rounded-2xl border border-white/15 bg-white/5 p-5 text-sm text-white/80">
                    <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                      <span><strong>Name:</strong> {formData.name || "Guest"}</span>
                      <span><strong>Age:</strong> {formData.age}</span>
                      <span><strong>Marital status:</strong> {formData.maritalStatus || "—"}</span>
                      <span><strong>Employment:</strong> {formData.employmentType || "—"}</span>
                      <span><strong>Dependents:</strong> {formData.hasDependents === "yes" ? formData.dependentCount : "None"}</span>
                      <span><strong>Home:</strong> {formData.homeOwnership || "—"}</span>
                      <span><strong>Income:</strong> ${formData.householdIncome.toLocaleString()}</span>
                      <span><strong>Risk:</strong> {formData.riskAppetite || "—"}</span>
                    </div>
                    <div>
                      <strong>Coverage:</strong> {formData.insuranceCoverage.join(", ") || "None yet"}
                    </div>
                    <div>
                      <strong>Goals:</strong> {(
                        [...formData.financialGoals, formData.financialGoalsOther.trim()].filter(Boolean)
                      ).join(", ") || "Focus on a goal to unlock tailored insights"}
                    </div>
                    <div>
                      <strong>Debt:</strong> {formData.hasDebt === "yes" ? formData.debtType : "No debt shared"}
                    </div>
                    <div>
                      <strong>Life snapshot:</strong>
                      <p className="mt-1 text-white/70">{formData.lifeSituation}</p>
                    </div>
                  </div>

                  <div className="rounded-2xl border border-[#FF4F00]/40 bg-[#FF4F00]/10 p-5 text-sm text-[#FFE0D2]">
                    <p className="mb-2 text-xs uppercase tracking-[0.4em] text-[#FFB18D]">Preview AI prompt</p>
                    <pre className="max-h-40 overflow-y-auto whitespace-pre-wrap text-[13px] leading-relaxed text-[#FFE0D2]">
                      {promptPreview}
                    </pre>
                  </div>
                </div>

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
                  <Button
                    variant="outline"
                    onClick={handleBack}
                    className="rounded-2xl border-white/30 bg-white/5 text-white transition hover:bg-white/15"
                  >
                    <ChevronLeft className="mr-2 h-4 w-4" /> Back
                  </Button>
                  <Button
                    onClick={handleSubmit}
                    className="rounded-2xl bg-gradient-to-r from-[#A41E34] to-[#FF4F00] text-white shadow-lg shadow-[#A41E34]/30 transition hover:brightness-110"
                  >
                    Generate my insights <Sparkles className="ml-2 h-4 w-4" />
                  </Button>
                </div>
              </motion.div>
            )}

            {mode === "analyzing" && (
              <motion.div
                key="analyzing"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                className="flex h-full flex-col items-center justify-center gap-6 text-center"
              >
                <Loader2 className="h-10 w-10 animate-spin text-[#FFB18D]" />
                <div className="space-y-3">
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1, duration: 0.4 }}
                    className="text-lg font-semibold"
                  >
                    Analyzing your profile with LifeLens AI…
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.3, duration: 0.4 }}
                    className="text-sm text-white/70"
                  >
                    Generating personalized benefit insights and a step-by-step timeline.
                  </motion.p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  )
}
