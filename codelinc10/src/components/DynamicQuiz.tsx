"use client"

import { useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import {
  COVERAGE_OPTIONS,
  EDUCATION_OPTIONS,
  HEALTH_OPTIONS,
  INCOME_OPTIONS,
  ACCOUNT_PREFERENCE_OPTIONS,
  BENEFIT_USAGE_OPTIONS,
  DENTAL_VISION_OPTIONS,
  GUIDANCE_PREFERENCE_OPTIONS,
  MARITAL_OPTIONS,
  PARTNER_COVERAGE_OPTIONS,
  PLAN_PREFERENCE_OPTIONS,
  PRIMARY_CARE_OPTIONS,
  PRESCRIPTION_OPTIONS,
  initializeQuizState,
  questionsFor,
  RESIDENCY_OPTIONS,
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
  text: "Text",
  select: "Select",
  slider: "Slider",
  boolean: "Toggle",
  "boolean-choice": "Yes/No",
  "multi-select": "Multi select",
  textarea: "Details",
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, [])


  useEffect(() => {
    onUpdate?.(answers)
  }, [answers, onUpdate])

  const flow = useMemo(() => questionsFor(answers), [answers])
  const current = phase === "steps" ? flow[index] : null
  const previousSection = phase === "steps" && index > 0 ? flow[index - 1]?.section ?? null : null
  const showSectionIntro = Boolean(
    phase === "steps" && current && current.section && current.section !== previousSection,
  )

  useEffect(() => {
    if (phase === "steps" && index > flow.length - 1 && flow.length > 0) {
      setIndex(flow.length - 1)
    }
  }, [flow.length, index, phase])

  const valueForQuestion = (question: QuizQuestion): string | number | boolean | string[] | null => {
    const value = answers[question.id as keyof EnrollmentFormData]
    if (question.id === "activityLevel") {
      return answers.activityLevel
    }
    // Handle the derived object which shouldn't be a question field
    if (typeof value === "object" && value !== null && !Array.isArray(value)) {
      return null
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
      case "textarea":
        return typeof value === "string" && value.trim().length > 0
      case "number":
      case "slider":
        return typeof value === "number" && !Number.isNaN(value)
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
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-3 py-4 sm:px-6">
          <button
            type="button"
            onClick={goBack}
            disabled={submitting}
            className="flex items-center gap-2 rounded-full border border-[#E3D8D5] bg-white px-3 py-2 text-xs font-semibold text-[#7F1527] shadow-sm transition sm:px-4 sm:text-sm disabled:opacity-50"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-right">
            <p className="text-[10px] font-semibold uppercase tracking-[0.35em] text-[#7F1527] sm:text-xs">
              {phase === "steps" && current ? current.section : "FinMate quiz"}
            </p>
            <p className="text-[10px] text-[#7F1527]/70 sm:text-xs">
              {phase === "steps" && current
                ? `Question ${index + 1} of ${flow.length} · ${QUESTION_TYPE_LABEL[current.type]}`
                : phase === "hr"
                  ? "HR confirmation"
                  : "Review"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-3 px-3 pb-2 sm:px-6">
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

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col overflow-y-auto px-3 pb-24 pt-6 sm:px-6">
        <AnimatePresence mode="wait">
          {phase === "hr" && (
            <motion.section
              key="hr-phase"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
className="scroll-mt-[84px] rounded-[24px] border border-[#E2D5D7] bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-8 sm:py-10 sm:px-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]/80">Synced from HR</p>
                  <h1 className="mt-3 text-xl font-semibold text-[#2A1A1A] sm:text-2xl">Welcome back, {answers.preferredName || answers.fullName}</h1>
                  <p className="mt-3 text-sm leading-relaxed text-[#4D3B3B]">
                    We pulled your basics from the HR system. Review and continue to personalize your FinMate guidance.
                  </p>
                </div>
                <div className="hidden h-8 w-8 rounded-full border border-[#E3D8D5] sm:block" aria-hidden="true" />
              </div>

              <div className="mt-8 space-y-4">
                <div className="rounded-3xl border border-[#E2D5D7] bg-white p-5 shadow-sm text-sm leading-relaxed text-[#4D3B3B]">
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
className="scroll-mt-[84px] rounded-[24px] border border-[#E2D5D7] bg-white p-5 shadow-sm sm:rounded-[28px] sm:p-8 sm:py-10 sm:px-8"
            >
              <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-3">
                  {showSectionIntro && (
                    <div className="space-y-2">
                      <span className="inline-flex items-center rounded-full bg-[#F3E8E6] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.25em] text-[#A41E34]">
                        {current.section}
                      </span>
                      {current.sectionDescription && (
                        <p className="text-xs leading-relaxed text-[#7F1527]/80 sm:max-w-sm">
                          {current.sectionDescription}
                        </p>
                      )}
                    </div>
                  )}
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]/80">
                    Question {index + 1}
                  </p>
                  <h1 className="text-xl font-semibold text-[#2A1A1A] sm:text-2xl">{current.title}</h1>
                  <p className="text-sm leading-relaxed text-[#4D3B3B]">{current.prompt}</p>
                </div>
                <div className="hidden h-9 w-9 rounded-full border border-[#E3D8D5] sm:block" aria-hidden="true" />
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
              className="min-h-[calc(100vh-120px)] scroll-mt-[84px] rounded-[24px] border border-[#E2D5D7] bg-white p-5 shadow-sm sm:min-h-[calc(100vh-100px)] sm:rounded-[28px] sm:p-8"
            >
              <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]/80">Summary</p>
                  <h1 className="mt-3 text-xl font-semibold text-[#2A1A1A] sm:text-2xl">Here’s your FinMate profile</h1>
                  <p className="mt-3 text-sm leading-relaxed text-[#4D3B3B]">
                    Confirm your answers and share consent so FinMate can generate your personalized benefits plans.
                  </p>
                </div>
                <div className="hidden h-8 w-8 rounded-full border border-[#E3D8D5] sm:block" aria-hidden="true" />
              </div>

              <div className="mt-8 space-y-6 text-sm text-[#4D3B3B]">
                <SummarySection title="Coverage & Family">
                  <SummaryRow
                    label="Coverage focus"
                    value={getLabelForOption(COVERAGE_OPTIONS, answers.coveragePreference)}
                  />
                  <SummaryRow
                    label="Partner coverage"
                    value={getLabelForOption(PARTNER_COVERAGE_OPTIONS, answers.partnerCoverageStatus)}
                  />
                  {answers.coveragePreference === "self-plus-family" && (
                    <SummaryRow label="Dependents" value={String(answers.dependents)} />
                  )}
                  <SummaryRow
                    label="Existing plans"
                    value={getLabelForOption(HEALTH_OPTIONS, answers.healthCoverage)}
                  />
                  <SummaryRow
                    label="Continuous coverage"
                    value={formatYesNo(answers.hasContinuousCoverage)}
                  />
                </SummarySection>

                <SummarySection title="Health & Wellness">
                  <SummaryRow
                    label="Ongoing conditions"
                    value={formatYesNo(answers.hasHealthConditions)}
                  />
                  {answers.hasHealthConditions && (
                    <SummaryRow
                      label="Condition summary"
                      value={answers.healthConditionSummary || "Provided verbally"}
                    />
                  )}
                  <SummaryRow
                    label="Primary care visits"
                    value={getLabelForOption(PRIMARY_CARE_OPTIONS, answers.primaryCareFrequency)}
                  />
                  <SummaryRow
                    label="Prescription use"
                    value={getLabelForOption(PRESCRIPTION_OPTIONS, answers.prescriptionFrequency)}
                  />
                  <SummaryRow
                    label="Activity level"
                    value={`${answers.activityLevelScore}/5 (${formatActivityLevel(answers.activityLevelScore)})`}
                  />
                  <SummaryRow
                    label="Household tobacco use"
                    value={formatYesNo(answers.tobaccoUse)}
                  />
                </SummarySection>

                <SummarySection title="Financial & Plan Preference">
                  <SummaryRow
                    label="Household income"
                    value={getLabelForOption(INCOME_OPTIONS, answers.incomeRange)}
                  />
                  <SummaryRow
                    label="Benefits budget"
                    value={`${answers.benefitsBudget}% of income`}
                  />
                  <SummaryRow label="Risk comfort" value={formatRiskComfort(answers.riskComfort)} />
                  <SummaryRow
                    label="Plan priority"
                    value={getLabelForOption(PLAN_PREFERENCE_OPTIONS, answers.planPreference)}
                  />
                  <SummaryRow
                    label="HSA / FSA access"
                    value={getLabelForOption(ACCOUNT_PREFERENCE_OPTIONS, answers.taxPreferredAccount)}
                  />
                </SummarySection>

                <SummarySection title="Life Stage & Usage">
                  <SummaryRow
                    label="Life changes expected"
                    value={formatYesNo(answers.anticipatesLifeChanges)}
                  />
                  <SummaryRow
                    label="Benefit usage"
                    value={getLabelForOption(BENEFIT_USAGE_OPTIONS, answers.expectedBenefitUsage)}
                  />
                  <SummaryRow
                    label="Out-of-state travel"
                    value={formatYesNo(answers.travelsOutOfState)}
                  />
                  <SummaryRow
                    label="International coverage"
                    value={formatYesNo(answers.needsInternationalCoverage)}
                  />
                  <SummaryRow
                    label="Dental / vision"
                    value={getLabelForOption(DENTAL_VISION_OPTIONS, answers.dentalVisionPreference)}
                  />
                </SummarySection>

                <SummarySection title="Retirement & Long-Term">
                  <SummaryRow
                    label="Contributing now"
                    value={formatYesNo(answers.contributesToRetirement)}
                  />
                  {answers.contributesToRetirement && (
                    <SummaryRow
                      label="Contribution rate"
                      value={`${answers.retirementContributionRate}% of income`}
                    />
                  )}
                  {answers.contributesToRetirement !== null && (
                    <SummaryRow
                      label="Guidance requests"
                      value={formatYesNo(answers.wantsRetirementGuidance)}
                    />
                  )}
                </SummarySection>

                <SummarySection title="Plan Experience">
                  <SummaryRow
                    label="Confidence with insurance terms"
                    value={`${answers.confidenceInsuranceTerms}/5`}
                  />
                  <SummaryRow
                    label="Guidance preference"
                    value={getLabelForOption(GUIDANCE_PREFERENCE_OPTIONS, answers.guidancePreference)}
                  />
                </SummarySection>
              </div>

              <div className="mt-6 flex flex-col gap-3 rounded-2xl border border-[#E2D5D7] bg-[#FBF7F6] p-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2A1A1A]">I agree to share this profile for plan generation</p>
                  <p className="text-xs text-[#7F1527]">Required so FinMate can generate recommendations and chat summaries.</p>
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
                  Analyzing your FinMate profile…
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
            className="rounded-full border-[#E3D8D5] px-5 py-3 text-sm font-semibold text-[#7F1527] shadow-sm transition disabled:opacity-50"
          >
            Back
          </Button>

          {phase === "summary" ? (
            <Button
              onClick={handleSubmit}
              disabled={!consentChecked || submitting}
              className="inline-flex items-center justify-center rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7F1527] disabled:opacity-40"
            >
              {submitting ? "Analyzing…" : "Generate my insights"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={goNext}
              disabled={submitting || (phase === "steps" && !currentIsValid)}
              className="inline-flex items-center justify-center rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white shadow-sm transition hover:bg-[#7F1527] disabled:opacity-40"
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
    case "text":
      return (
        <div className="space-y-2">
          <Label className="text-sm text-[#7F1527]">Your answer</Label>
          <Input
            type="text"
            placeholder={question.placeholder}
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            className="h-12 rounded-2xl border-[#E3D8D5] bg-[#FBF7F6] px-4 text-base"
          />
          {question.helperText && (
            <p className="text-xs text-[#7F1527]/80">{question.helperText}</p>
          )}
        </div>
      )
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
          {question.helperText && (
            <p className="text-xs text-[#7F1527]/80">{question.helperText}</p>
          )}
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
                "flex w-full items-center justify-between rounded-2xl border px-4 py-4 text-left text-sm transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A41E34]/30",
                value === option.value
                  ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                  : "border-[#E3D8D5] bg-[#FBF7F6] text-[#2A1A1A] hover:border-[#A41E34]/40",
              )}
              aria-pressed={value === option.value}
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
          {question.helperText && (
            <p className="text-xs text-[#7F1527]/80">{question.helperText}</p>
          )}
        </div>
      )
    case "slider": {
      const numericValue = typeof value === "number" ? value : question.min ?? 0
      const minLabel = question.minLabel ?? (question.min !== undefined ? `${question.min}` : "")
      const maxLabel = question.maxLabel ?? (question.max !== undefined ? `${question.max}` : "")
      return (
        <div className="space-y-4">
          <div className="space-y-3">
            <Slider
              min={question.min ?? 0}
              max={question.max ?? 10}
              step={question.step ?? 1}
              value={[numericValue]}
              onValueChange={(numbers) => onChange(numbers[0])}
              aria-label={question.title}
            />
            {(minLabel || maxLabel) && (
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.2em] text-[#7F1527]/70">
                <span>{minLabel}</span>
                <span>{maxLabel}</span>
              </div>
            )}
          </div>
          <p className="text-sm font-semibold text-[#7F1527]">
            {question.valueFormatter
              ? question.valueFormatter(numericValue)
              : question.id === "riskComfort"
                ? `${numericValue}/5`
                : `${numericValue}`}
          </p>
          {question.helperText && (
            <p className="text-xs text-[#7F1527]/80">{question.helperText}</p>
          )}
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
                "w-full rounded-full border px-5 py-3 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A41E34]/30 sm:w-auto",
                value === choice.value
                  ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                  : "border-[#E3D8D5] bg-[#FBF7F6] text-[#7F1527] hover:border-[#A41E34]/40",
              )}
              aria-pressed={value === choice.value}
            >
              {choice.label}
            </button>
          ))}
          {question.helperText && (
            <p className="w-full text-xs text-[#7F1527]/80">{question.helperText}</p>
          )}
        </div>
      )
    case "multi-select":
      return (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? []).map((option) => {
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
                  "rounded-full border px-4 py-2 text-sm font-semibold transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A41E34]/30",
                  active
                    ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                    : "border-[#E3D8D5] bg-[#FBF7F6] text-[#7F1527] hover:border-[#A41E34]/40",
                )}
                aria-pressed={active}
              >
                {option.label}
              </button>
            )
          })}
          {question.helperText && (
            <p className="w-full text-xs text-[#7F1527]/80">{question.helperText}</p>
          )}
        </div>
      )
    case "textarea":
      return (
        <div className="space-y-2">
          <Label className="text-sm text-[#7F1527]">Share details</Label>
          <Textarea
            value={typeof value === "string" ? value : ""}
            rows={4}
            placeholder={question.placeholder}
            onChange={(event) => onChange(event.target.value)}
            className="rounded-2xl border-[#E3D8D5] bg-[#FBF7F6] px-4 py-3 text-sm"
          />
          {question.helperText && (
            <p className="text-xs text-[#7F1527]/80">{question.helperText}</p>
          )}
        </div>
      )
    default:
      return null
  }
}

function SummarySection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="space-y-3">
      <h2 className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">{title}</h2>
      <div className="space-y-3">{children}</div>
    </section>
  )
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
  return getLabelForOption(MARITAL_OPTIONS, value)
}

function formatEducationLevel(value: EnrollmentFormData["educationLevel"]) {
  return getLabelForOption(EDUCATION_OPTIONS, value)
}

function getLabelForOption(options: QuizOption[], value: string) {
  const match = options.find((option) => option.value === value)
  return match ? match.label : value || "—"
}

function formatYesNo(value: boolean | null) {
  if (value === null) return "—"
  return value ? "Yes" : "No"
}

function formatRiskComfort(score: number) {
  const labels = ["Very low", "Low", "Moderate", "High", "Very high"]
  const index = Math.max(1, Math.min(5, score)) - 1
  return `${score}/5 · ${labels[index] ?? "Balanced"}`
}

function formatActivityLevel(score: number) {
  if (score >= 4) return "Very active"
  if (score <= 2) return "Sedentary"
  return "Balanced"
}
