"use client"

import { type ReactNode, useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Textarea } from "@/components/ui/textarea"
import { ChevronLeft, ChevronRight, Loader2, Sparkles } from "lucide-react"

import { cn } from "@/lib/utils"

export interface EnrollmentFormData {
  fullName: string
  preferredName: string
  employeeId: string
  workLocation: string
  email: string
  age: number
  maritalStatus: string
  educationLevel: string
  employmentType: string
  careerStage: string
  hasDependents: boolean | null
  dependentCount: number
  dependentNotes: string
  householdStructure: string
  annualIncome: number
  homeStatus: string
  emergencySavingsMonths: number
  hasBudget: boolean | null
  creditScoreRange: string
  hasDebt: boolean | null
  debtTypes: string[]
  riskTolerance: string
  protectionConfidence: string
  insuranceCoverage: string[]
  healthFocus: string
  wellnessInterest: string
  retirementStatus: string
  retirementConfidence: number
  hasRetirementPlan: boolean | null
  legacyInterest: string
  financialGoals: string[]
  preferredLearningStyle: string
  wantsCoaching: boolean | null
  aiPrompt: string
  additionalNotes: string
  isGuest: boolean
}

export const DEFAULT_ENROLLMENT_FORM: EnrollmentFormData = {
  fullName: "Alex Morgan",
  preferredName: "Alex",
  employeeId: "LM-45218",
  workLocation: "Philadelphia, PA",
  email: "alex.morgan@example.com",
  age: 34,
  maritalStatus: "",
  educationLevel: "",
  employmentType: "",
  careerStage: "Mid-career",
  hasDependents: null,
  dependentCount: 0,
  dependentNotes: "",
  householdStructure: "",
  annualIncome: 90000,
  homeStatus: "",
  emergencySavingsMonths: 3,
  hasBudget: null,
  creditScoreRange: "",
  hasDebt: null,
  debtTypes: [],
  riskTolerance: "",
  protectionConfidence: "",
  insuranceCoverage: [],
  healthFocus: "",
  wellnessInterest: "",
  retirementStatus: "",
  retirementConfidence: 2,
  hasRetirementPlan: null,
  legacyInterest: "",
  financialGoals: [],
  preferredLearningStyle: "",
  wantsCoaching: null,
  aiPrompt: "",
  additionalNotes: "",
  isGuest: false,
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

const MARITAL_OPTIONS = ["Single", "Married", "Divorced", "Widowed"]
const EDUCATION_OPTIONS = ["High school", "Associate", "Bachelor's", "Master's", "Doctorate"]
const EMPLOYMENT_OPTIONS = ["Full-time", "Part-time", "Contract", "Retired", "On leave"]
const HOUSEHOLD_OPTIONS = ["Living alone", "Partner", "Partner + kids", "Multi-generational", "Roommates"]
const HOME_STATUS_OPTIONS = ["Own", "Rent", "Living with family", "Other"]
const CREDIT_OPTIONS = ["<620", "620-699", "700-749", "750+"]
const DEBT_OPTIONS = ["Student loans", "Credit cards", "Mortgage", "Auto loan", "Medical", "Other"]
const RISK_OPTIONS = ["Low", "Moderate", "Growth-focused"]
const COVERAGE_OPTIONS = ["Health", "Dental", "Vision", "Life", "Disability", "Accident"]
const WELLNESS_OPTIONS = ["Wellness perks", "Mental health", "Family care", "Fitness", "Nutrition"]
const RETIREMENT_OPTIONS = ["Planning", "On track", "Behind", "Retired"]
const LEARNING_OPTIONS = ["Interactive lessons", "Short videos", "Articles", "One-on-one coaching"]
const GOAL_OPTIONS = [
  "Increase savings",
  "Protect my family",
  "Pay down debt",
  "Plan for retirement",
  "Build generational wealth",
  "Prepare for education costs",
]

function OptionPill({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: ReactNode
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-2 text-sm font-medium transition",
        active
          ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#FF4F00] text-white shadow-lg"
          : "border-[#A41E34]/20 bg-white/70 text-[#A41E34] hover:border-[#A41E34]/40 hover:bg-[#A41E34]/10"
      )}
    >
      {children}
    </button>
  )
}

export function EnrollmentForm({ onComplete, onBackToLanding, initialData, onUpdate }: EnrollmentFormProps) {
  const [formData, setFormData] = useState<EnrollmentFormData>(DEFAULT_ENROLLMENT_FORM)
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<"form" | "analyzing">("form")
  const [error, setError] = useState<string | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    if (initialized) return

    setFormData((prev) => ({
      ...DEFAULT_ENROLLMENT_FORM,
      ...prev,
      ...initialData,
      isGuest: initialData?.isGuest ?? prev.isGuest ?? false,
    }))
    setInitialized(true)
  }, [initialData, initialized])

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
        id: "hr",
        title: "HR snapshot",
        description: "We synced what HR already knows. Confirm or edit anything that changed recently.",
        render: (data, update) => (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="fullName">Legal name</Label>
              <Input
                id="fullName"
                value={data.fullName}
                onChange={(event) => update({ fullName: event.target.value })}
                placeholder="Alex Morgan"
              />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="preferredName">Preferred name</Label>
                <Input
                  id="preferredName"
                  value={data.preferredName}
                  onChange={(event) => update({ preferredName: event.target.value })}
                  placeholder="Alex"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID</Label>
                <Input
                  id="employeeId"
                  value={data.employeeId}
                  onChange={(event) => update({ employeeId: event.target.value })}
                  placeholder="LM-45218"
                />
              </div>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="workLocation">Primary location</Label>
                <Input
                  id="workLocation"
                  value={data.workLocation}
                  onChange={(event) => update({ workLocation: event.target.value })}
                  placeholder="City, State"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Work email</Label>
                <Input
                  id="email"
                  type="email"
                  value={data.email}
                  onChange={(event) => update({ email: event.target.value })}
                  placeholder="you@lincolnfinancial.com"
                />
              </div>
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.fullName.trim()) return "Let us know your legal name so we can personalize recommendations."
          if (!data.employeeId.trim()) return "Please confirm your employee ID."
          if (!data.email.trim()) return "We use your work email to save progress."
          return null
        },
      },
      {
        id: "profile",
        title: "Core profile",
        description: "Tell us a bit about where you are today so LifeLens can match the right playbooks.",
        render: (data, update) => (
          <div className="space-y-5">
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="age">Age</Label>
                <Input
                  id="age"
                  type="number"
                  value={data.age}
                  onChange={(event) => update({ age: Number(event.target.value) })}
                  min={18}
                  max={80}
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
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label>Highest education</Label>
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
                <Label>Employment type</Label>
                <div className="flex flex-wrap gap-2">
                  {EMPLOYMENT_OPTIONS.map((option) => (
                    <OptionPill
                      key={option}
                      active={data.employmentType === option}
                      onClick={() => update({ employmentType: option })}
                    >
                      {option}
                    </OptionPill>
                  ))}
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="careerStage">Career story</Label>
              <Textarea
                id="careerStage"
                value={data.careerStage}
                onChange={(event) => update({ careerStage: event.target.value })}
                placeholder="Where are you in your career journey?"
              />
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.age || data.age < 18) return "Enter your age so we can apply the right guidance."
          if (!data.maritalStatus) return "Select your marital status."
          if (!data.employmentType) return "Tell us how you work with Lincoln."
          return null
        },
      },
      {
        id: "household",
        title: "Household & dependents",
        description: "We want to understand who depends on you so benefits support every person you care about.",
        render: (data, update, helpers) => (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Do you currently support dependents?</Label>
              <div className="flex flex-wrap gap-2">
                <OptionPill
                  active={data.hasDependents === true}
                  onClick={() => helpers.toggleBoolean("hasDependents", true)}
                >
                  Yes
                </OptionPill>
                <OptionPill
                  active={data.hasDependents === false}
                  onClick={() => helpers.toggleBoolean("hasDependents", false)}
                >
                  Not right now
                </OptionPill>
              </div>
            </div>
            {data.hasDependents && (
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="dependentCount">How many people count on you?</Label>
                  <Input
                    id="dependentCount"
                    type="number"
                    min={1}
                    value={data.dependentCount}
                    onChange={(event) => update({ dependentCount: Number(event.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dependentNotes">What support do they need?</Label>
                  <Input
                    id="dependentNotes"
                    value={data.dependentNotes}
                    onChange={(event) => update({ dependentNotes: event.target.value })}
                    placeholder="Childcare, college planning, elder care…"
                  />
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>Household snapshot</Label>
              <div className="flex flex-wrap gap-2">
                {HOUSEHOLD_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.householdStructure === option}
                    onClick={() => update({ householdStructure: option })}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
          </div>
        ),
        validate: (data) => {
          if (data.hasDependents === null) return "Let us know if anyone relies on you."
          if (data.hasDependents && data.dependentCount < 1) return "Share how many people you support."
          if (!data.householdStructure) return "Choose the household description that fits best."
          return null
        },
      },
      {
        id: "foundation",
        title: "Employment & foundation",
        description: "A quick check on your financial base helps us prioritize protections and savings.",
        render: (data, update, helpers) => (
          <div className="space-y-6">
            <div className="space-y-3">
              <Label>Household income</Label>
              <Slider
                min={30000}
                max={200000}
                step={5000}
                value={[data.annualIncome]}
                onValueChange={([value]) => update({ annualIncome: value })}
              />
              <p className="text-sm font-medium text-[#A41E34]">
                ${data.annualIncome.toLocaleString()} per year
              </p>
            </div>
            <div className="space-y-2">
              <Label>Living situation</Label>
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
            <div className="space-y-3">
              <Label>Emergency savings cushion (months of expenses)</Label>
              <Slider
                min={0}
                max={12}
                step={1}
                value={[data.emergencySavingsMonths]}
                onValueChange={([value]) => update({ emergencySavingsMonths: value })}
              />
              <p className="text-sm text-[#5B4444]">{data.emergencySavingsMonths} months saved</p>
            </div>
            <div className="space-y-2">
              <Label>Do you follow a monthly spending plan?</Label>
              <div className="flex gap-2">
                <OptionPill
                  active={data.hasBudget === true}
                  onClick={() => helpers.toggleBoolean("hasBudget", true)}
                >
                  Yes, mostly
                </OptionPill>
                <OptionPill
                  active={data.hasBudget === false}
                  onClick={() => helpers.toggleBoolean("hasBudget", false)}
                >
                  Not yet
                </OptionPill>
              </div>
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.homeStatus) return "Share how you describe your current home situation."
          if (data.hasBudget === null) return "Tell us if you track your monthly spending."
          return null
        },
      },
      {
        id: "credit",
        title: "Credit & risk",
        description: "This helps us balance protection, growth, and debt payoff in your plan.",
        render: (data, update, helpers) => (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Approximate credit score range</Label>
              <div className="flex flex-wrap gap-2">
                {CREDIT_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.creditScoreRange === option}
                    onClick={() => update({ creditScoreRange: option })}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Are you currently paying off debt?</Label>
              <div className="flex gap-2">
                <OptionPill
                  active={data.hasDebt === true}
                  onClick={() => helpers.toggleBoolean("hasDebt", true)}
                >
                  Yes
                </OptionPill>
                <OptionPill
                  active={data.hasDebt === false}
                  onClick={() => helpers.toggleBoolean("hasDebt", false)}
                >
                  No
                </OptionPill>
              </div>
            </div>
            {data.hasDebt && (
              <div className="space-y-2">
                <Label>Select the types of debt you're focusing on</Label>
                <div className="flex flex-wrap gap-2">
                  {DEBT_OPTIONS.map((option) => (
                    <OptionPill
                      key={option}
                      active={data.debtTypes.includes(option)}
                      onClick={() => helpers.toggleOption("debtTypes", option)}
                    >
                      {option}
                    </OptionPill>
                  ))}
                </div>
              </div>
            )}
            <div className="space-y-2">
              <Label>How bold do you feel with investment risk?</Label>
              <div className="flex flex-wrap gap-2">
                {RISK_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.riskTolerance === option}
                    onClick={() => update({ riskTolerance: option })}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="protectionConfidence">Any confidence gaps around protection?</Label>
              <Textarea
                id="protectionConfidence"
                value={data.protectionConfidence}
                onChange={(event) => update({ protectionConfidence: event.target.value })}
                placeholder="Tell us about anything keeping you up at night."
              />
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.creditScoreRange) return "Choose the credit range that fits best."
          if (data.hasDebt === null) return "Let us know if you're currently managing debt."
          if (data.hasDebt && data.debtTypes.length === 0) return "Select at least one debt focus area."
          if (!data.riskTolerance) return "Pick the investment style that matches your comfort."
          return null
        },
      },
      {
        id: "health",
        title: "Health & insurance",
        description: "We'll highlight coverage options and wellness resources based on your answers.",
        render: (data, update, helpers) => (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Which coverages are in place right now?</Label>
              <div className="flex flex-wrap gap-2">
                {COVERAGE_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.insuranceCoverage.includes(option)}
                    onClick={() => helpers.toggleOption("insuranceCoverage", option)}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="healthFocus">Any gaps or health goals we should know?</Label>
              <Textarea
                id="healthFocus"
                value={data.healthFocus}
                onChange={(event) => update({ healthFocus: event.target.value })}
                placeholder="Share wellness goals, ongoing care, or dependents with special needs."
              />
            </div>
            <div className="space-y-2">
              <Label>Wellness resources that would energize you</Label>
              <div className="flex flex-wrap gap-2">
                {WELLNESS_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.wellnessInterest === option}
                    onClick={() => update({ wellnessInterest: option })}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
          </div>
        ),
        validate: (data) => {
          if (data.insuranceCoverage.length === 0) return "Select the coverages you have today."
          return null
        },
      },
      {
        id: "retirement",
        title: "Retirement & legacy",
        description: "Let’s align long-term planning with the life you’re building.",
        render: (data, update, helpers) => (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>Where are you with retirement planning?</Label>
              <div className="flex flex-wrap gap-2">
                {RETIREMENT_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.retirementStatus === option}
                    onClick={() => update({ retirementStatus: option })}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="space-y-3">
              <Label>Confidence in your retirement path</Label>
              <Slider
                min={1}
                max={5}
                step={1}
                value={[data.retirementConfidence]}
                onValueChange={([value]) => update({ retirementConfidence: value })}
              />
              <p className="text-sm text-[#5B4444]">{data.retirementConfidence}/5 confident</p>
            </div>
            <div className="space-y-2">
              <Label>Do you have a retirement account through Lincoln?</Label>
              <div className="flex gap-2">
                <OptionPill
                  active={data.hasRetirementPlan === true}
                  onClick={() => helpers.toggleBoolean("hasRetirementPlan", true)}
                >
                  Yes
                </OptionPill>
                <OptionPill
                  active={data.hasRetirementPlan === false}
                  onClick={() => helpers.toggleBoolean("hasRetirementPlan", false)}
                >
                  Not yet
                </OptionPill>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="legacyInterest">Any legacy or big future goals?</Label>
              <Textarea
                id="legacyInterest"
                value={data.legacyInterest}
                onChange={(event) => update({ legacyInterest: event.target.value })}
                placeholder="Think about college dreams, business ownership, or family support."
              />
            </div>
          </div>
        ),
        validate: (data) => {
          if (!data.retirementStatus) return "Share how retirement planning feels today."
          if (data.hasRetirementPlan === null) return "Let us know if you’re enrolled in a plan."
          return null
        },
      },
      {
        id: "wellness",
        title: "Financial wellness",
        description: "Last step! Shape how LifeLens and AI can show up for you.",
        render: (data, update, helpers) => (
          <div className="space-y-5">
            <div className="space-y-2">
              <Label>What are you hoping to accomplish next?</Label>
              <div className="flex flex-wrap gap-2">
                {GOAL_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.financialGoals.includes(option)}
                    onClick={() => helpers.toggleOption("financialGoals", option)}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Preferred learning style</Label>
              <div className="flex flex-wrap gap-2">
                {LEARNING_OPTIONS.map((option) => (
                  <OptionPill
                    key={option}
                    active={data.preferredLearningStyle === option}
                    onClick={() => update({ preferredLearningStyle: option })}
                  >
                    {option}
                  </OptionPill>
                ))}
              </div>
            </div>
            <div className="space-y-2">
              <Label>Would personal coaching help?</Label>
              <div className="flex gap-2">
                <OptionPill
                  active={data.wantsCoaching === true}
                  onClick={() => helpers.toggleBoolean("wantsCoaching", true)}
                >
                  I'd love that
                </OptionPill>
                <OptionPill
                  active={data.wantsCoaching === false}
                  onClick={() => helpers.toggleBoolean("wantsCoaching", false)}
                >
                  Maybe later
                </OptionPill>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="aiPrompt">Describe your life in one sentence</Label>
              <Textarea
                id="aiPrompt"
                value={data.aiPrompt}
                onChange={(event) => update({ aiPrompt: event.target.value })}
                placeholder="LifeLens will use this to craft your AI guidance."
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="additionalNotes">Anything else on your mind?</Label>
              <Textarea
                id="additionalNotes"
                value={data.additionalNotes}
                onChange={(event) => update({ additionalNotes: event.target.value })}
                placeholder="Share wins, worries, or goals we didn’t cover."
              />
            </div>
          </div>
        ),
        validate: (data) => {
          if (data.financialGoals.length === 0) return "Pick at least one focus so we can prioritize recommendations."
          if (!data.aiPrompt.trim()) return "Tell LifeLens about your current life in a sentence."
          return null
        },
      },
    ],
    [helpers]
  )

  const totalSteps = steps.length
  const progress = Math.round(((currentStep + 1) / totalSteps) * 100)

  const goToPrevious = () => {
    if (currentStep === 0) return
    setCurrentStep((index) => Math.max(index - 1, 0))
    setError(null)
  }

  const handleNext = () => {
    const step = steps[currentStep]
    const validationMessage = step.validate?.(formData)

    if (validationMessage) {
      setError(validationMessage)
      setSuccessMessage(null)
      return
    }

    setError(null)
    setSuccessMessage("Answers saved")
    setTimeout(() => setSuccessMessage(null), 2200)

    if (currentStep === totalSteps - 1) {
      setMode("analyzing")
      setTimeout(() => {
        onComplete(formData)
      }, 1800)
    } else {
      setCurrentStep((index) => Math.min(index + 1, totalSteps - 1))
    }
  }

  if (mode === "analyzing") {
    return (
      <div className="relative min-h-screen bg-white px-6 py-16">
        <button
          type="button"
          onClick={onBackToLanding}
          className="absolute left-6 top-8 text-sm font-semibold text-[#A41E34] hover:text-[#FF4F00]"
        >
          ← Back to landing
        </button>
        <div className="mx-auto flex max-w-md flex-col items-center gap-4 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[#A41E34]/10 to-[#FF4F00]/20">
            <Loader2 className="h-8 w-8 animate-spin text-[#A41E34]" />
          </div>
          <h2 className="text-2xl font-semibold text-[#2A1A1A]">Analyzing your profile with LifeLens AI…</h2>
          <p className="text-sm text-[#5B4444]">Generating personalized benefit insights and a guided timeline.</p>
        </div>
      </div>
    )
  }

  const activeStep = steps[currentStep]

  return (
    <div className="relative min-h-screen bg-white pb-16">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-6 pt-10">
        <div className="flex items-center justify-between">
          <button
            type="button"
            onClick={onBackToLanding}
            className="text-sm font-semibold text-[#A41E34] transition hover:text-[#FF4F00]"
          >
            ← Back to landing
          </button>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#A41E34]/20 bg-white/70 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-[#A41E34]">
            <Sparkles className="h-4 w-4" />
            Lifesync questionnaire
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center justify-between text-sm font-semibold text-[#A41E34]">
            <span>
              Step {currentStep + 1} of {totalSteps}
            </span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-2 w-full rounded-full bg-[#F5E9EA]">
            <motion.div
              className="h-2 rounded-full bg-gradient-to-r from-[#A41E34] to-[#FF4F00]"
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.4 }}
            />
          </div>
        </div>

        <div className="space-y-2">
          <h2 className="text-2xl font-semibold text-[#2A1A1A]">{activeStep.title}</h2>
          <p className="text-sm text-[#5B4444]">{activeStep.description}</p>
          {successMessage && (
            <motion.p
              className="text-sm font-semibold text-[#2E7D32]"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {successMessage}
            </motion.p>
          )}
          {error && (
            <motion.p
              className="text-sm font-semibold text-[#A41E34]"
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
            >
              {error}
            </motion.p>
          )}
        </div>

        <div className="rounded-3xl border border-[#A41E34]/10 bg-white/80 p-6 shadow-xl shadow-[#A41E34]/5 backdrop-blur">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeStep.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.3 }}
              className="space-y-6"
            >
              {activeStep.render(formData, updateForm, helpers)}
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            {currentStep > 0 ? (
              <Button
                variant="ghost"
                className="text-[#A41E34] hover:text-[#FF4F00]"
                onClick={goToPrevious}
              >
                <ChevronLeft className="mr-2 h-4 w-4" /> Back
              </Button>
            ) : (
              <span className="text-sm text-[#5B4444]">You can return to the landing page anytime.</span>
            )}
          </div>
          <Button
            onClick={handleNext}
            className="group rounded-2xl bg-gradient-to-r from-[#A41E34] to-[#FF4F00] px-6 py-6 text-base font-semibold text-white shadow-lg"
          >
            {currentStep === totalSteps - 1 ? (
              <span className="flex items-center">
                Finish and generate insights
                <Sparkles className="ml-2 h-4 w-4" />
              </span>
            ) : (
              <span className="flex items-center">
                Continue
                <ChevronRight className="ml-2 h-4 w-4" />
              </span>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
