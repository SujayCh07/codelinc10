"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  ACTIVITY_OPTIONS,
  ACTIVITY_LEVEL_OPTIONS,
  COVERAGE_OPTIONS,
  HEALTH_OPTIONS,
  HOME_OPTIONS,
  INCOME_OPTIONS,
  initializeQuizState,
  questionsFor,
  updateFormValue,
  type QuizOption,
  type QuizQuestion,
  type QuizQuestionType,
} from "@/lib/quiz"
import { withDerivedMetrics } from "@/lib/insights"
import type { EnrollmentFormData } from "@/lib/types"
import { cn } from "@/lib/utils"

type Phase = "hr" | "steps" | "summary"

interface DynamicQuizProps {
  initialData: EnrollmentFormData
  onComplete: (data: EnrollmentFormData) => Promise<void> | void
  onBack: () => void
  onUpdate?: (data: EnrollmentFormData) => void
}

const QUESTION_TYPE_LABEL: Record<QuizQuestionType, string> = {
  number: "Number",
  select: "Select",
  slider: "Slider",
  boolean: "Toggle",
  "boolean-choice": "Yes/No",
  "multi-select": "Multi select",
}

const HR_CARD_COPY = [
  { label: "Marital status", accessor: (data: EnrollmentFormData) => formatMaritalStatus(data.maritalStatus) },
  { label: "Education", accessor: (data: EnrollmentFormData) => formatEducationLevel(data.educationLevel) },
  { label: "Employment start", accessor: (data: EnrollmentFormData) => data.employmentStartDate },
  { label: "Citizenship", accessor: (data: EnrollmentFormData) => data.citizenship },
  { label: "Location", accessor: (data: EnrollmentFormData) => `${data.workState}, ${data.workCountry}` },
  { label: "Region", accessor: (data: EnrollmentFormData) => data.workRegion },
]

export function DynamicQuiz({ initialData, onComplete, onBack, onUpdate }: DynamicQuizProps) {
  const [answers, setAnswers] = useState<EnrollmentFormData>(() => initializeQuizState(initialData))
  const [phase, setPhase] = useState<Phase>("hr")
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    const prepared = initializeQuizState(initialData)
    setAnswers(prepared)
    setPhase("hr")
    setIndex(0)
  }, [initialData])

  useEffect(() => {
    onUpdate?.(answers)
  }, [answers, onUpdate])

  const flow = useMemo(() => questionsFor(answers), [answers])
  const current = phase === "steps" ? flow[index] : null

  useEffect(() => {
    if (phase === "steps" && index > flow.length - 1 && flow.length > 0) {
      setIndex(flow.length - 1)
    }
  }, [flow.length, index, phase])

  const valueForQuestion = (question: QuizQuestion) => {
    const value = answers[question.id as keyof EnrollmentFormData]
    if (question.id === "activityLevel") {
      return answers.activityLevel
    }
    return value ?? null
  }

  const handleValueChange = (question: QuizQuestion, value: string | number | boolean | string[] | null) => {
    const updated = withDerivedMetrics(updateFormValue(answers, question.id, value))
    setAnswers(updated)
  }

  const goBack = () => {
    if (phase === "hr") {
      onBack()
      return
    }
    if (phase === "summary") {
      if (flow.length) {
        setPhase("steps")
        setIndex(Math.max(flow.length - 1, 0))
      } else {
        setPhase("hr")
      }
      return
    }
    if (index === 0) {
      setPhase("hr")
    } else {
      setIndex((previous) => Math.max(previous - 1, 0))
    }
  }

  const goNext = () => {
    if (phase === "hr") {
      setPhase("steps")
      setIndex(0)
      return
    }
    if (phase === "steps") {
      if (index < flow.length - 1) {
        setIndex((previous) => previous + 1)
      } else {
        setPhase("summary")
      }
    }
  }

  const isCurrentValid = (question: QuizQuestion | null) => {
    if (!question) return false
    const value = valueForQuestion(question)
    switch (question.type) {
      case "text":
        return typeof value === "string" && value.trim().length > 0
      case "number":
      case "slider":
        return typeof value === "number" && !Number.isNaN(value)
      case "date":
      case "select":
        return Boolean(value)
      case "boolean":
      case "boolean-choice":
        return value === true || value === false
      case "multi-select":
        return Array.isArray(value) && value.length > 0
      default:
        return false
    }
  }

  const handleSubmit = async () => {
    const ready = withDerivedMetrics({ ...answers })
    setSubmitting(true)
    try {
      await onComplete(ready)
    } finally {
      setSubmitting(false)
    }
  }

  const consentChecked = answers.consentToFollowUp
  const currentIsValid = isCurrentValid(current)
  const progress = useMemo(() => {
    if (phase === "hr") return 0
    if (phase === "summary") return 100
    if (!flow.length) return 0
    const completed = index + (currentIsValid ? 1 : 0)
    return Math.min(100, Math.round((completed / flow.length) * 100))
  }, [currentIsValid, flow.length, index, phase])
  const progressLabel = `${Math.round(progress)}%`

  return (
    <div
      className={cn(
        "relative flex min-h-screen flex-col bg-[#F7F4F2] text-[#2A1A1A]",
        submitting && "pointer-events-none"
      )}
      aria-busy={submitting}
    >
      <header className="sticky top-0 z-30 border-b border-[#E3D8D5] bg-[#F7F4F2]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-4xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="flex items-center gap-2 rounded-full border border-[#E3D8D5] bg-white px-4 py-2 text-sm font-semibold text-[#7F1527] disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7F1527]">LifeLens quiz</p>
            {phase === "steps" && current ? (
              <p className="text-xs text-[#7F1527]/70">
                {index + 1} of {flow.length} · {QUESTION_TYPE_LABEL[current.type]}
              </p>
            ) : (
              <p className="text-xs text-[#7F1527]/70">
                {phase === "hr" ? "HR confirmation" : "Review"}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 px-5 pb-2">
          <div
            className="h-1 flex-1 bg-[#EBDDD8]"
            role="progressbar"
            aria-valuemin={0}
            aria-valuemax={100}
            aria-valuenow={Math.round(progress)}
          >
            <div
              className="h-full bg-gradient-to-r from-[#A41E34] to-[#D94E35] transition-all"
              style={{ width: `${progress}%` }}
            />
          </div>
          <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">{progressLabel}</span>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-4xl flex-1 flex-col overflow-y-auto px-4 pb-20 pt-6">
        <AnimatePresence mode="wait">
          {phase === "hr" && (
            <motion.section
              key="hr-phase"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="min-h-[calc(100vh-100px)] scroll-mt-[84px] rounded-[32px] border border-[#E2D5D7] bg-white p-8 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]/80">Synced from HR</p>
                  <h1 className="mt-3 text-2xl font-semibold text-[#2A1A1A]">Welcome back, {answers.preferredName || answers.fullName}</h1>
                  <p className="mt-3 text-sm text-[#4D3B3B]">
                    We pulled your basics from the HR system. Review and continue to personalize your LifeLens guidance.
                  </p>
                </div>
                <Sparkles className="hidden h-8 w-8 text-[#A41E34] sm:block" />
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-3xl border border-[#E2D5D7] bg-white p-5 shadow-sm text-sm text-[#4D3B3B]">
                  <p>
                    <strong>Employee:</strong> {answers.fullName}
                  </p>
                  <p>
                    <strong>Work location:</strong> {answers.workState}, {answers.workCountry}
                  </p>
                  <p>
                    <strong>Status:</strong> Active – verified via HR system
                  </p>
                </div>

                <div className="grid gap-3 text-sm text-[#4D3B3B] sm:grid-cols-2">
                  {HR_CARD_COPY.map((item) => (
                    <Card key={item.label} className="rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4 shadow-none">
                      <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7F1527]">{item.label}</p>
                      <p className="mt-1 text-sm font-semibold text-[#2A1A1A]">{item.accessor(answers) || "—"}</p>
                    </Card>
                  ))}
                </div>
              </div>
            </motion.section>
          )}

          {phase === "steps" && current && (
            <motion.section
              key={current.id as string}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="min-h-[calc(100vh-100px)] scroll-mt-[84px] rounded-[32px] border border-[#E2D5D7] bg-white p-8 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]/80">Question {index + 1}</p>
                  <h1 className="mt-3 text-2xl font-semibold text-[#2A1A1A]">{current.title}</h1>
                  <p className="mt-3 text-sm text-[#4D3B3B]">{current.prompt}</p>
                </div>
                <Sparkles className="hidden h-8 w-8 text-[#A41E34] sm:block" />
              </div>

              <div className="mt-8 space-y-6">
                {renderField(current, valueForQuestion(current), (value) => handleValueChange(current, value))}
              </div>
            </motion.section>
          )}

          {phase === "summary" && (
            <motion.section
              key="summary-phase"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="min-h-[calc(100vh-100px)] scroll-mt-[84px] rounded-[32px] border border-[#E2D5D7] bg-white p-8 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]/80">Summary</p>
                  <h1 className="mt-3 text-2xl font-semibold text-[#2A1A1A]">Here’s your LifeLens profile</h1>
                  <p className="mt-3 text-sm text-[#4D3B3B]">
                    Confirm your answers and share consent so LifeLens can generate your personalized benefits plans.
                  </p>
                </div>
                <Sparkles className="hidden h-8 w-8 text-[#A41E34] sm:block" />
              </div>

              <div className="mt-8 space-y-4 text-sm text-[#4D3B3B]">
                <SummaryRow label="Age" value={answers.age ? `${answers.age}` : "—"} />
                <SummaryRow label="Marital status" value={formatMaritalStatus(answers.maritalStatus)} />
                <SummaryRow label="Education" value={formatEducationLevel(answers.educationLevel)} />
                <SummaryRow label="Residency" value={answers.residencyStatus} />
                <SummaryRow label="Citizenship" value={answers.citizenship} />
                <SummaryRow label="Work location" value={`${answers.workState}, ${answers.workCountry}`} />
                <SummaryRow
                  label="Coverage focus"
                  value={getLabelForOption(COVERAGE_OPTIONS, answers.coveragePreference)}
                />
                {answers.coveragePreference === "self-plus-family" && (
                  <SummaryRow label="Dependents" value={String(answers.dependents)} />
                )}
                {answers.spouseHasSeparateInsurance !== null && (
                  <SummaryRow
                    label="Partner coverage"
                    value={answers.spouseHasSeparateInsurance ? "Has their own plan" : "Relies on your plan"}
                  />
                )}
                <SummaryRow label="Home" value={getLabelForOption(HOME_OPTIONS, answers.homeOwnership)} />
                <SummaryRow label="Household income" value={getLabelForOption(INCOME_OPTIONS, answers.incomeRange)} />
                <SummaryRow label="Health coverage" value={getLabelForOption(HEALTH_OPTIONS, answers.healthCoverage)} />
                <SummaryRow label="Savings rate" value={`${answers.savingsRate}% of income`} />
                {answers.wantsSavingsSupport !== null && (
                  <SummaryRow
                    label="Savings coaching"
                    value={answers.wantsSavingsSupport ? "Send me reminders" : "I'm all set"}
                  />
                )}
                <SummaryRow label="Risk tolerance" value={`${answers.riskComfort}/5`} />
                {answers.investsInMarkets !== null && (
                  <SummaryRow
                    label="Investing"
                    value={answers.investsInMarkets ? "Active investor" : "Keeping it simple"}
                  />
                )}
                <SummaryRow
                  label="Activity level"
                  value={getLabelForOption(ACTIVITY_LEVEL_OPTIONS, answers.activityLevel)}
                />
                {answers.activityList.length > 0 && (
                  <SummaryRow label="Activities" value={answers.activityList.map(capitalize).join(", ")} />
                )}
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E2D5D7] bg-[#FBF7F6] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2A1A1A]">I agree to share this profile for plan generation</p>
                  <p className="text-xs text-[#7F1527]">Required so LifeLens can generate recommendations and chat summaries.</p>
                </div>
                <Switch
                  checked={consentChecked}
                  disabled={submitting}
                  onCheckedChange={(checked) =>
                    setAnswers((current) => withDerivedMetrics({ ...current, consentToFollowUp: checked }))
                  }
                />
              </div>
              {submitting && (
                <motion.p
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-4 text-sm font-semibold text-[#7F1527]"
                >
                  Analyzing your LifeLens profile…
                </motion.p>
              )}
            </motion.section>
          )}
        </AnimatePresence>

        <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="outline"
            onClick={goBack}
            disabled={submitting}
            className="rounded-full border-[#E3D8D5] px-6 py-3 text-sm font-semibold text-[#7F1527] disabled:opacity-50"
          >
            Back
          </Button>

          {phase === "summary" ? (
            <Button
              onClick={handleSubmit}
              disabled={!consentChecked || submitting}
              className="rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7F1527] disabled:opacity-40"
            >
              {submitting ? "Analyzing…" : "Generate my insights"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={submitting || (phase === "steps" && !currentIsValid)}
              className="rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7F1527] disabled:opacity-40"
            >
              {phase === "hr" ? "Start personalizing" : "Continue"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

function renderField(
  question: QuizQuestion,
  value: string | number | boolean | string[] | null,
  onChange: (value: string | number | boolean | string[] | null) => void,
) {
  switch (question.type) {
    case "number":
      return (
        <div className="space-y-2">
          <Label className="text-sm text-[#7F1527]">Your answer</Label>
          <Input
            type="number"
            min={question.min}
            max={question.max}
            value={typeof value === "number" ? value : value ? Number(value) : ""}
            onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
            className="h-12 rounded-2xl border-[#E3D8D5] bg-[#FBF7F6] px-4 text-base"
          />
        </div>
      )
    case "select":
      return (
        <div className="grid gap-3">
          {question.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "flex items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm transition",
                value === option.value
                  ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                  : "border-[#E3D8D5] bg-[#FBF7F6] text-[#2A1A1A] hover:border-[#A41E34]/40",
              )}
            >
              <span>
                <span className="block font-semibold">{option.label}</span>
                {option.helper && (
                  <span className={cn("text-xs", value === option.value ? "text-white/80" : "text-[#7F1527]")}>{option.helper}</span>
                )}
              </span>
              <ArrowRight className="h-4 w-4" />
            </button>
          ))}
        </div>
      )
    case "slider": {
      const numericValue = typeof value === "number" ? value : question.min ?? 0
      return (
        <div className="space-y-4">
          <Slider
            min={question.min ?? 0}
            max={question.max ?? 10}
            step={question.step ?? 1}
            value={[numericValue]}
            onValueChange={(numbers) => onChange(numbers[0])}
          />
          <p className="text-sm font-semibold text-[#7F1527]">
            {question.id === "riskComfort"
              ? `${numericValue}/5`
              : question.id === "savingsRate"
                ? `${numericValue}%`
                : `${numericValue}`}
          </p>
        </div>
      )
    }
    case "boolean-choice":
      return (
        <div className="flex flex-wrap gap-3">
          {[{ label: "No", value: false }, { label: "Yes", value: true }].map((choice) => (
            <button
              key={choice.label}
              type="button"
              onClick={() => onChange(choice.value)}
              className={cn(
                "rounded-full border px-5 py-3 text-sm font-semibold transition",
                value === choice.value
                  ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                  : "border-[#E3D8D5] bg-[#FBF7F6] text-[#7F1527] hover:border-[#A41E34]/40",
              )}
            >
              {choice.label}
            </button>
          ))}
        </div>
      )
    case "multi-select":
      return (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? ACTIVITY_OPTIONS).map((option) => {
            const active = Array.isArray(value) && value.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!Array.isArray(value) || value === null) {
                    onChange([option.value])
                    return
                  }
                  const exists = value.includes(option.value)
                  const next = exists ? value.filter((item) => item !== option.value) : [...value, option.value]
                  onChange(next)
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                    : "border-[#E3D8D5] bg-[#FBF7F6] text-[#7F1527] hover:border-[#A41E34]/40",
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )
    default:
      return null
  }
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-1 rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
      <span className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">{label}</span>
      <span className="text-sm font-semibold text-[#2A1A1A]">{value}</span>
    </div>
  )
}

function formatMaritalStatus(value: EnrollmentFormData["maritalStatus"]) {
  return toTitleCase(value.replace(/-/g, " "))
}

function formatEducationLevel(value: EnrollmentFormData["educationLevel"]) {
  switch (value) {
    case "high-school":
      return "High school"
    case "associate":
      return "Associate"
    case "bachelor":
      return "Bachelor"
    case "master":
      return "Master"
    case "doctorate":
      return "Doctorate"
    default:
      return toTitleCase(value.replace(/-/g, " "))
  }
}

function getLabelForOption(options: QuizOption[], value: string) {
  const match = options.find((option) => option.value === value)
  return match ? match.label : value || "—"
}

function capitalize(value: string) {
  if (!value) return value
  return value.charAt(0).toUpperCase() + value.slice(1)
}

function toTitleCase(value: string) {
  if (!value) return value
  return value
    .split(/\s+/)
    .filter(Boolean)
    .map((segment) => capitalize(segment))
    .join(" ")
}
