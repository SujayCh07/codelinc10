"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Switch } from "@/components/ui/switch"
import { Check, ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export interface EnrollmentFormData {
  fullName: string
  preferredName: string
  employmentStart: string
  age: number
  maritalStatus: string
  educationLevel: string
  citizenship: string
  householdCoverage: string
  dependentCount: number
  spouseHasSeparateInsurance: boolean | null
  homeStatus: string
  hasTobaccoUsers: boolean | null
  incomeRange: string
  financialGoals: string[]
  monthlySavingsRate: number
  milestoneFocus: string
  healthCoverage: boolean | null
  accountTypes: string[]
  wantsLifeDisabilityInsights: boolean | null
  contributes401k: boolean | null
  wantsEmployerMatchHelp: boolean | null
  riskComfort: number
  additionalNotes: string
  consentToFollowUp: boolean
  isGuest: boolean
}

export const DEFAULT_ENROLLMENT_FORM: EnrollmentFormData = {
  fullName: "Sujay Chava",
  preferredName: "Sujay",
  employmentStart: "2023",
  age: 32,
  maritalStatus: "Single",
  educationLevel: "Bachelor's",
  citizenship: "U.S. citizen",
  householdCoverage: "You only",
  dependentCount: 0,
  spouseHasSeparateInsurance: null,
  homeStatus: "Rent",
  hasTobaccoUsers: null,
  incomeRange: "$80k-$100k",
  financialGoals: ["Increase savings"],
  monthlySavingsRate: 8,
  milestoneFocus: "Plan for a home purchase",
  healthCoverage: true,
  accountTypes: ["HSA"],
  wantsLifeDisabilityInsights: true,
  contributes401k: true,
  wantsEmployerMatchHelp: true,
  riskComfort: 3,
  additionalNotes: "",
  consentToFollowUp: false,
  isGuest: false,
}

export const DEMO_ENROLLMENT_FORM: EnrollmentFormData = {
  ...DEFAULT_ENROLLMENT_FORM,
  fullName: "Jordan Demo",
  preferredName: "Jordan",
  employmentStart: "2021",
  age: 29,
  maritalStatus: "Married",
  householdCoverage: "You + partner",
  dependentCount: 1,
  spouseHasSeparateInsurance: false,
  homeStatus: "Rent",
  hasTobaccoUsers: false,
  incomeRange: "$100k-$150k",
  financialGoals: ["Buy a home", "Plan for retirement"],
  monthlySavingsRate: 12,
  milestoneFocus: "Build a down payment fund",
  healthCoverage: true,
  accountTypes: ["HSA", "FSA"],
  wantsLifeDisabilityInsights: true,
  contributes401k: true,
  wantsEmployerMatchHelp: true,
  riskComfort: 4,
  additionalNotes: "",
  consentToFollowUp: true,
  isGuest: true,
}

interface EnrollmentFormProps {
  onComplete: (data: EnrollmentFormData) => void
  onBackToLanding: () => void
  initialData?: Partial<EnrollmentFormData>
  onUpdate?: (data: EnrollmentFormData) => void
}

interface StepDefinition {
  id: string
  title: string
  description: string
  render: (
    data: EnrollmentFormData,
    update: (values: Partial<EnrollmentFormData>) => void,
    helpers: StepHelpers
  ) => ReactNode
  validate?: (data: EnrollmentFormData) => string | null
}

interface StepHelpers {
  toggleOption: (field: keyof EnrollmentFormData, value: string) => void
  toggleBoolean: (field: keyof EnrollmentFormData, value: boolean) => void
}

const MARITAL_OPTIONS = ["Single", "Married", "Domestic partner", "Divorced", "Widowed"]
const EDUCATION_OPTIONS = ["High school", "Associate", "Bachelor's", "Master's", "Doctorate"]
const CITIZENSHIP_OPTIONS = ["U.S. citizen", "Permanent resident", "Work visa", "Other"]
const COVERAGE_OPTIONS = ["You only", "You + partner", "You + family"]
const HOME_STATUS_OPTIONS = ["Own", "Rent", "Living with family", "Other"]
const INCOME_OPTIONS = ["<$60k", "$60k-$80k", "$80k-$100k", "$100k-$150k", "$150k+"]
const GOAL_OPTIONS = [
  { label: "💰 Save more", value: "Increase savings" },
  { label: "🏠 Buy a home", value: "Buy a home" },
  { label: "🧠 Pay down debt", value: "Pay down debt" },
  { label: "❤️ Protect my family", value: "Protect my family" },
  { label: "📈 Grow investments", value: "Plan for retirement" },
  { label: "🎓 College planning", value: "Prepare for education costs" },
]
const ACCOUNT_OPTIONS = ["HSA", "FSA"]

function OptionPill({
  active,
  children,
  onClick,
  tone = "light",
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
  tone?: "light" | "solid"
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#FF4F00] text-white shadow-lg shadow-[#A41E34]/25"
          : tone === "solid"
            ? "border-[#A41E34]/25 bg-[#FCEBE6] text-[#A41E34] hover:border-[#A41E34]/40 hover:bg-[#FAD9CE]"
            : "border-[#A41E34]/25 bg-white text-[#A41E34] hover:border-[#A41E34]/40 hover:bg-[#F9EDEA]"
      )}
    >
      {children}
    </button>
  )
}

export function EnrollmentForm({ onComplete, onBackToLanding, initialData, onUpdate }: EnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>(DEFAULT_ENROLLMENT_FORM)
  const [phase, setPhase] = useState<"hr" | "steps" | "analyzing">("hr")
  const [hrStage, setHrStage] = useState<"loading" | "confirm">("loading")
  const [currentStep, setCurrentStep] = useState(0)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
  if (initialData && Object.keys(initialData).length > 0) {
    setFormData(prev => ({
      ...prev,
      ...initialData,
      isGuest: initialData.isGuest ?? prev.isGuest,
    }))
  }
  // eslint-disable-next-line react-hooks/exhaustive-deps
}, []) // 👈 run once, ignore re-renders



  useEffect(() => {
    if (phase === "hr" && hrStage === "loading") {
      const timer = setTimeout(() => setHrStage("confirm"), 1200)
      return () => clearTimeout(timer)
    }
    return undefined
  }, [phase, hrStage])

  useEffect(() => {
    onUpdate?.(formData)
  }, [formData, onUpdate])

  const updateForm = (values: Partial<EnrollmentFormData>) => {
    setFormData((prev) => ({ ...prev, ...values }))
  }

  const helpers: StepHelpers = useMemo(
    () => ({
      toggleOption: (field, value) => {
        setFormData((prev) => {
          const current = prev[field]
          if (!Array.isArray(current)) return prev
          const exists = current.includes(value)
          const next = exists ? current.filter((item) => item !== value) : [...current, value]
          return { ...prev, [field]: next }
        })
      },
      toggleBoolean: (field, value) => {
        setFormData((prev) => ({ ...prev, [field]: value }))
      },
    }),
    []
  )

  const steps: StepDefinition[] = useMemo(
    () => [
      {
        id: "about",
        title: "About you",
        description: "We’ll personalize wording and plan recommendations based on who you are today.",
        render: (data, update) => (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#F0E6E7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]">Prefilled from HR</p>
              <div className="mt-4 grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Legal name</Label>
                  <Input
                    id="fullName"
                    value={data.fullName}
                    onChange={(event) => update({ fullName: event.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="preferredName">Preferred name</Label>
                  <Input
                    id="preferredName"
                    value={data.preferredName}
                    onChange={(event) => update({ preferredName: event.target.value })}
                  />
                </div>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  min={18}
                  max={80}
                  value={data.age}
                  onChange={(event) => update({ age: Number(event.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Marital status</Label>
                <div className="flex flex-wrap gap-2">
                  {MARITAL_OPTIONS.map((option) => (
                    <OptionPill
                      key={option}
                      active={data.maritalStatus === option}
                      onClick={() => update({ maritalStatus: option })}
                    >
                      {option}
                    </OptionPill>
                  ))}
                </div>
              </div>
            </div>
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Education level</Label>
                <div className="flex flex-wrap gap-2">
                  {EDUCATION_OPTIONS.map((option) => (
                    <OptionPill
                      key={option}
                      active={data.educationLevel === option}
                      onClick={() => update({ educationLevel: option })}
                    >
                      {option}
                    </OptionPill>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Citizenship</Label>
                <div className="flex flex-wrap gap-2">
                  {CITIZENSHIP_OPTIONS.map((option) => (
                    <OptionPill
                      key={option}
                      active={data.citizenship === option}
                      onClick={() => update({ citizenship: option })}
                    >
                      {option}
                    </OptionPill>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.fullName.trim()) return "Please confirm your legal name."
          if (!data.age || data.age < 18) return "Let us know your age to tailor guidance."
          if (!data.maritalStatus) return "Choose your current marital status."
          if (!data.educationLevel) return "Select your education level."
          if (!data.citizenship) return "Let us know your citizenship status."
          return null
        },
      },
      {
        id: "household",
        title: "Your household",
        description: "Understanding who’s alongside you helps LifeLens surface the right coverage and savings moves.",
        render: (data, update, helpers) => (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label>Who’s covered under your plan?</Label>
              <div className="flex flex-wrap gap-2">
                {COVERAGE_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.householdCoverage === option}
                    onClick={() => update({ householdCoverage: option, dependentCount: option === "You only" ? 0 : data.dependentCount })}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            {data.householdCoverage !== "You only" && (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.householdCoverage === "You + family" && (
                  <div className="space-y-2">
                    <Label htmlFor="dependentCount">Number of dependents</Label>
                    <Input
                      id="dependentCount"
                      type="number"
                      min={0}
                      value={data.dependentCount}
                      onChange={(event) => update({ dependentCount: Number(event.target.value) })}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Does your spouse have separate insurance?</Label>
                  <div className="flex items-center gap-3 rounded-full border border-[#F0E6E7] bg-white px-4 py-2">
                    <span className="text-sm text-[#4D3B3B]">
                      {data.spouseHasSeparateInsurance ? "Yes" : data.spouseHasSeparateInsurance === false ? "No" : "Select"}
                    </span>
                    <Switch
                      checked={data.spouseHasSeparateInsurance === true}
                      onCheckedChange={(value) => helpers.toggleBoolean("spouseHasSeparateInsurance", value)}
                    />
                  </div>
                </div>
              </div>
            )}
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Do you rent or own?</Label>
                <div className="flex flex-wrap gap-2">
                  {HOME_STATUS_OPTIONS.map((option) => (
                    <OptionPill
                      key={option}
                      active={data.homeStatus === option}
                      onClick={() => update({ homeStatus: option })}
                    >
                      {option}
                    </OptionPill>
                  ))}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Any tobacco users in your household?</Label>
                <div className="flex items-center gap-3 rounded-full border border-[#F0E6E7] bg-white px-4 py-2">
                  <span className="text-sm text-[#4D3B3B]">{data.hasTobaccoUsers ? "Yes" : data.hasTobaccoUsers === false ? "No" : "Select"}</span>
                  <Switch
                    checked={data.hasTobaccoUsers === true}
                    onCheckedChange={(value) => helpers.toggleBoolean("hasTobaccoUsers", value)}
                  />
                </div>
              </div>
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.householdCoverage) return "Choose who’s covered on your plan."
          if (data.householdCoverage === "You + family" && data.dependentCount <= 0)
            return "Share how many loved ones you support."
          if (!data.homeStatus) return "Let us know your housing status."
          if (data.hasTobaccoUsers === null) return "Tell us if anyone in the household uses tobacco."
          return null
        },
      },
      {
        id: "work",
        title: "Work & finances",
        description: "These quick details help us personalize financial priorities and timelines.",
        render: (data, update, helpers) => (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#F0E6E7] bg-white p-4 shadow-sm">
              <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]">Connected to HR</p>
              <div className="mt-3 flex flex-col gap-2 text-sm text-[#4D3B3B] sm:flex-row sm:items-center sm:justify-between">
                <span>Employment start year</span>
                <strong className="text-base text-[#2A1A1A]">{data.employmentStart}</strong>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Approximate income range</Label>
              <div className="flex flex-wrap gap-2">
                {INCOME_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.incomeRange === option}
                    onClick={() => update({ incomeRange: option })}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Top financial priorities</Label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((goal) => (
                  <OptionPill
                    key={goal.value}
                    active={data.financialGoals.includes(goal.value)}
                    onClick={() => helpers.toggleOption("financialGoals", goal.value)}
                    tone="solid"
                  >
                    {goal.label}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="milestoneFocus">Any milestone we should plan around?</Label>
              <Input
                id="milestoneFocus"
                value={data.milestoneFocus}
                onChange={(event) => update({ milestoneFocus: event.target.value })}
                placeholder="New baby, home purchase, career change…"
              />
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-[#4D3B3B]">
                <span>Monthly savings rate</span>
                <span className="font-semibold text-[#A41E34]">{data.monthlySavingsRate}%</span>
              </div>
              <Slider
                value={[data.monthlySavingsRate]}
                min={0}
                max={25}
                step={1}
                onValueChange={(value) => update({ monthlySavingsRate: value[0] ?? 0 })}
              />
              <p className="text-xs text-[#7F1527]">We’ll benchmark you against the ideal 15% savings target.</p>
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.incomeRange) return "Select the income range that fits best."
          if (!data.financialGoals.length) return "Choose at least one priority so we can personalize insights."
          return null
        },
      },
      {
        id: "health",
        title: "Health & protection",
        description: "Set the stage for smarter coverage recommendations and reminders.",
        render: (data, _update, helpers) => (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#F0E6E7] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2A1A1A]">Are you enrolled in health coverage?</p>
                  <p className="text-xs text-[#4D3B3B]">Toggle on if your benefits are active.</p>
                </div>
                <Switch
                  checked={data.healthCoverage === true}
                  onCheckedChange={(value) => helpers.toggleBoolean("healthCoverage", value)}
                />
              </div>
            </div>
            <div className="space-y-3">
              <Label>Do you use any of these accounts?</Label>
              <div className="flex flex-wrap gap-2">
                {ACCOUNT_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.accountTypes.includes(option)}
                    onClick={() => helpers.toggleOption("accountTypes", option)}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="rounded-3xl border border-[#F0E6E7] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2A1A1A]">Would you like insights on life & disability coverage?</p>
                  <p className="text-xs text-[#4D3B3B]">We’ll highlight when protection gaps appear.</p>
                </div>
                <Switch
                  checked={data.wantsLifeDisabilityInsights === true}
                  onCheckedChange={(value) => helpers.toggleBoolean("wantsLifeDisabilityInsights", value)}
                />
              </div>
            </div>
          </div>
        ),
        validate: (data) => {
          if (data.healthCoverage === null) return "Let us know if you’re currently enrolled."
          if (data.wantsLifeDisabilityInsights === null)
            return "Tell us if you want coverage recommendations."
          return null
        },
      },
      {
        id: "growth",
        title: "Long-term & growth",
        description: "We’ll shape retirement and investment nudges around your comfort level.",
        render: (data, update, helpers) => (
          <div className="space-y-6">
            <div className="rounded-3xl border border-[#F0E6E7] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2A1A1A]">Do you contribute to your 401(k)?</p>
                  <p className="text-xs text-[#4D3B3B]">Turn on if contributions are active today.</p>
                </div>
                <Switch
                  checked={data.contributes401k === true}
                  onCheckedChange={(value) => helpers.toggleBoolean("contributes401k", value)}
                />
              </div>
            </div>
            <div className="rounded-3xl border border-[#F0E6E7] bg-white p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-semibold text-[#2A1A1A]">Would you like help optimizing your employer match?</p>
                  <p className="text-xs text-[#4D3B3B]">We’ll send timely nudges during open enrollment.</p>
                </div>
                <Switch
                  checked={data.wantsEmployerMatchHelp === true}
                  onCheckedChange={(value) => helpers.toggleBoolean("wantsEmployerMatchHelp", value)}
                />
              </div>
            </div>
            <div className="space-y-4">
              <div className="flex items-center justify-between text-sm text-[#4D3B3B]">
                <span>Comfort with investment risk</span>
                <span className="font-semibold text-[#A41E34]">
                  {riskComfortLabel(data.riskComfort)}
                </span>
              </div>
              <Slider
                value={[data.riskComfort]}
                min={1}
                max={5}
                step={1}
                onValueChange={(value) => update({ riskComfort: value[0] ?? data.riskComfort })}
              />
              <div className="flex justify-between text-xs text-[#7F1527]">
                <span>More cautious</span>
                <span>Ready to grow</span>
              </div>
            </div>
          </div>
        ),
        validate: (data) => {
          if (data.contributes401k === null) return "Let us know if you’re contributing to the 401(k)."
          if (data.wantsEmployerMatchHelp === null) return "Tell us if reminders would help."
          return null
        },
      },
      {
        id: "final",
        title: "Final touch",
        description: "Preview your LifeLens profile and consent so we can save your insights.",
        render: (data, update) => (
          <div className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Anything else we should know?</Label>
              <Textarea
                id="additionalNotes"
                value={data.additionalNotes}
                onChange={(event) => update({ additionalNotes: event.target.value })}
                placeholder="Share context about upcoming life changes or benefits questions."
              />
            </div>
            <motion.div
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 rounded-3xl border border-[#F0E6E7] bg-white p-5 shadow-sm"
            >
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#A41E34]/10 text-[#A41E34]">
                  <Sparkles className="h-5 w-5" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-[#2A1A1A]">Profile preview</p>
                  <p className="text-xs text-[#4D3B3B]">Here’s how LifeLens will describe your situation.</p>
                </div>
              </div>
              <div className="grid gap-3 text-sm text-[#4D3B3B]">
                <p>
                  <strong>{data.preferredName || data.fullName}</strong> is planning for <strong>{data.milestoneFocus || "their next milestone"}</strong> with a
                  household focused on <strong>{data.householdCoverage.toLowerCase()}</strong> coverage and saving roughly <strong>{data.monthlySavingsRate}%</strong> each month.
                </p>
                <p>
                  Top priorities: {data.financialGoals.length ? data.financialGoals.join(", ") : "not yet selected"}. We’ll weave in {data.accountTypes.length ? data.accountTypes.join(" & ") : "core"} accounts and
                  surface protection tips {data.wantsLifeDisabilityInsights ? "as requested" : "if you change your mind"}.
                </p>
              </div>
            </motion.div>
            <div className="flex items-start gap-3 rounded-3xl border border-[#F0E6E7] bg-white p-4 text-sm text-[#4D3B3B]">
              <Checkbox
                id="consent"
                checked={data.consentToFollowUp}
                onCheckedChange={(value) => update({ consentToFollowUp: Boolean(value) })}
              />
              <Label htmlFor="consent" className="cursor-pointer">
                I consent to LifeLens saving these answers so I can revisit insights and connect with a Lincoln coach.
              </Label>
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.consentToFollowUp) return "Please provide consent so we can save your plan."
          return null
        },
      },
    ],
    []
  )

  const progress = ((currentStep + 1) / steps.length) * 100

  const handleNext = () => {
    const step = steps[currentStep]
    const validation = step.validate?.(formData) ?? null
    if (validation) {
      setError(validation)
      return
    }
    setError(null)
    if (currentStep === steps.length - 1) {
      setPhase("analyzing")
      setTimeout(() => {
        onComplete({ ...formData })
      }, 1300)
      return
    }
    setCurrentStep((value) => Math.min(value + 1, steps.length - 1))
  }

  const handleBack = () => {
    if (currentStep === 0) {
      setPhase("hr")
      setHrStage("confirm")
      return
    }
    setError(null)
    setCurrentStep((value) => Math.max(value - 1, 0))
  }

  if (phase === "hr") {
    return (
      <div className="min-h-screen bg-[#F7F4F2] text-[#2A1A1A]">
        <div className="mx-auto flex w-full max-w-xl flex-col gap-8 px-5 py-12">
          <button
            type="button"
            onClick={onBackToLanding}
            className="flex items-center gap-2 text-sm font-semibold text-[#A41E34] hover:text-[#7F1527]"
          >
            <ChevronLeft className="h-4 w-4" /> Back to hero
          </button>
          <AnimatePresence mode="wait">
            {hrStage === "loading" ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="space-y-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]">
                    Welcome back, {formData.preferredName}
                  </p>
                  <h2 className="text-2xl font-semibold">Retrieving your benefits profile securely…</h2>
                </div>
                <div className="space-y-3 rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg">
                  <div className="h-4 w-1/2 animate-pulse rounded-full bg-[#F7F4F2]" />
                  <div className="h-3 w-3/4 animate-pulse rounded-full bg-[#F7F4F2]" />
                  <div className="h-3 w-2/3 animate-pulse rounded-full bg-[#F7F4F2]" />
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="confirm"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                className="space-y-6"
              >
                <div className="space-y-3 text-center">
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]">
                    Welcome back, {formData.preferredName}
                  </p>
                  <h2 className="text-2xl font-semibold">We found your HR record. Is this up to date?</h2>
                </div>
                <motion.div
                  layout
                  className="space-y-4 rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-lg"
                >
                  <div className="flex items-center gap-3 rounded-2xl bg-[#F9EDEA] px-4 py-3 text-sm font-semibold text-[#A41E34]">
                    <Check className="h-4 w-4" /> Synced from HR systems
                  </div>
                  <div className="grid gap-3 text-sm text-[#4D3B3B]">
                    <p>
                      <strong>Name:</strong> {formData.fullName}
                    </p>
                    <p>
                      <strong>Marital status:</strong> {formData.maritalStatus || "—"}
                    </p>
                    <p>
                      <strong>Employment start:</strong> {formData.employmentStart}
                    </p>
                  </div>
                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      className="flex-1 rounded-full bg-[#A41E34] text-sm font-semibold text-white hover:bg-[#7F1527]"
                      onClick={() => {
                        setPhase("steps")
                        setCurrentStep(0)
                      }}
                    >
                      Confirm & continue
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1 rounded-full border-[#A41E34]/40 text-sm font-semibold text-[#A41E34] hover:bg-[#F9EDEA]"
                      onClick={() => {
                        setPhase("steps")
                        setCurrentStep(0)
                      }}
                    >
                      Update info
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#F7F4F2] pb-24 text-[#2A1A1A]">
      <div className="mx-auto w-full max-w-3xl px-5 py-10">
        <header className="flex items-center justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]">
              Step {currentStep + 1} of {steps.length}
            </p>
            <h2 className="mt-1 text-2xl font-semibold text-[#2A1A1A]">{steps[currentStep].title}</h2>
            <p className="mt-2 text-sm text-[#4D3B3B]">{steps[currentStep].description}</p>
          </div>
          <Button
            variant="ghost"
            className="text-sm font-semibold text-[#A41E34] hover:text-[#7F1527]"
            onClick={onBackToLanding}
          >
            Save & exit
          </Button>
        </header>

        <div className="mt-6 h-2 w-full rounded-full bg-[#E8DADC]">
          <motion.div
            className="h-full rounded-full bg-gradient-to-r from-[#A41E34] to-[#FF4F00]"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ type: "spring", stiffness: 120, damping: 20 }}
          />
        </div>

        <motion.section
          key={steps[currentStep].id}
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.3 }}
          className="mt-8 space-y-6"
        >
          {steps[currentStep].render(formData, updateForm, helpers)}
        </motion.section>

        {error && (
          <div className="mt-6 rounded-3xl border border-[#FFB4A2] bg-[#FFF1ED] p-4 text-sm text-[#7F1527]">
            {error}
          </div>
        )}

        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-between">
          <Button
            variant="outline"
            className="rounded-full border-[#A41E34]/40 text-sm font-semibold text-[#A41E34] hover:bg-[#F9EDEA]"
            onClick={handleBack}
            disabled={phase === "analyzing"}
          >
            <ChevronLeft className="mr-2 h-4 w-4" /> Back
          </Button>
          <Button
            className="rounded-full bg-[#A41E34] px-8 text-sm font-semibold text-white hover:bg-[#7F1527]"
            onClick={handleNext}
            disabled={phase === "analyzing"}
          >
            {currentStep === steps.length - 1 ? "Generate my insights" : (
              <span className="flex items-center">
                Continue <ChevronRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>

      <AnimatePresence>
        {phase === "analyzing" && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col items-center justify-center bg-white/90 backdrop-blur"
          >
            <Loader2 className="h-10 w-10 animate-spin text-[#A41E34]" />
            <p className="mt-4 text-lg font-semibold text-[#2A1A1A]">Analyzing your LifeLens profile…</p>
            <p className="text-sm text-[#4D3B3B]">We’re matching Lincoln Financial resources to your story.</p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function riskComfortLabel(level: number) {
  switch (level) {
    case 1:
      return "Very cautious"
    case 2:
      return "Cautious"
    case 3:
      return "Balanced"
    case 4:
      return "Growth-minded"
    case 5:
      return "Bold"
    default:
      return "Balanced"
  }
}

