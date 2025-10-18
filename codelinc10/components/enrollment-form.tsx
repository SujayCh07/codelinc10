"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { CheckCircle, ChevronLeft, ChevronRight, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { cn } from "@/lib/utils"
import {
  DEFAULT_FORM_DATA,
  type LifeLensFormData,
  type BinaryChoice,
  type CoveragePreference,
  type EducationLevel,
  type EmploymentType,
  type HouseholdStructure,
  type IncomeRange,
  type MaritalStatus,
  type PlanType,
  type RiskAversion,
  type SavingsRate,
} from "@/types/form"
import { TopNav } from "@/components/top-nav"

interface EnrollmentFormProps {
  onComplete: (data: LifeLensFormData) => void
  onBackToHome: () => void
  initialData?: Partial<LifeLensFormData>
  onUpdate?: (data: LifeLensFormData) => void
}

interface StepDefinition {
  id:
    | "verification"
    | "personal"
    | "household"
    | "employment"
    | "financial"
    | "health"
    | "retirement"
    | "additional"
  title: string
  description: string
  validate: (data: LifeLensFormData) => string | null
  render: (args: { data: LifeLensFormData; update: (values: Partial<LifeLensFormData>) => void }) => React.ReactNode
}

const MARITAL_OPTIONS: MaritalStatus[] = ["Single", "Married", "Partnered", "Other"]
const CITIZENSHIP_OPTIONS = ["US Citizen", "Permanent Resident", "Other"]
const VETERAN_OPTIONS = ["None", "Active", "Veteran"]
const EDUCATION_OPTIONS: EducationLevel[] = ["HS Diploma", "Bachelor's", "Master's", "Doctorate", "Other"]
const HOUSEHOLD_OPTIONS: HouseholdStructure[] = ["Alone", "With Partner", "With Dependents"]
const COVERAGE_OPTIONS: CoveragePreference[] = ["Yes", "No", "Not Applicable"]
const HOUSING_OPTIONS = ["Rent", "Own", "Other"]
const BINARY_OPTIONS: BinaryChoice[] = ["Yes", "No", "Not Applicable"]
const EMPLOYMENT_OPTIONS: EmploymentType[] = ["Full-time", "Part-time", "Contractor"]
const INCOME_OPTIONS: IncomeRange[] = ["$0–50k", "$50–100k", "$100–150k", "$150k+"]
const RISK_OPTIONS: RiskAversion[] = ["Conservative", "Moderate", "Growth", "Aggressive"]
const SAVINGS_OPTIONS: SavingsRate[] = ["<5%", "5–10%", "10–20%", ">20%"]
const CREDIT_OPTIONS = ["<600", "600–699", "700–749", "750+"]
const HSA_OPTIONS = ["HSA", "FSA", "Neither"]
const PLAN_OPTIONS: PlanType[] = ["Roth", "Traditional", "Unknown"]
const COUNTRY_OPTIONS = ["United States", "Canada", "Mexico"]
const STATE_OPTIONS = [
  "Pennsylvania",
  "New York",
  "New Jersey",
  "Massachusetts",
  "California",
  "Texas",
  "Ontario",
]

export function EnrollmentForm({ onComplete, onBackToHome, initialData, onUpdate }: EnrollmentFormProps) {
  const [formData, setFormData] = useState<LifeLensFormData>(DEFAULT_FORM_DATA)
  const [currentStep, setCurrentStep] = useState(0)
  const [mode, setMode] = useState<"form" | "analyzing">("form")
  const [error, setError] = useState<string | null>(null)
  const [feedback, setFeedback] = useState<string | null>(null)

  useEffect(() => {
    if (!initialData) return
    setFormData((prev) => ({
      ...prev,
      ...initialData,
      consent: initialData.consent ?? prev.consent,
      isGuest: initialData.isGuest ?? prev.isGuest,
    }))
  }, [initialData])

  useEffect(() => {
    onUpdate?.(formData)
  }, [formData, onUpdate])

  const updateForm = (values: Partial<LifeLensFormData>) => {
    setFormData((prev) => ({ ...prev, ...values }))
  }

  const steps: StepDefinition[] = useMemo(
    () => [
      {
        id: "verification",
        title: "Verification",
        description: "We’ve synced your HR record. Please confirm.",
        validate: (data) => {
          if (!data.fullName.trim() || !data.userEmail.trim() || !data.dateOfBirth || !data.employmentStartDate) {
            return "Please confirm your core profile before continuing."
          }
          return null
        },
        render: ({ data, update }) => (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Full name" required>
              <Input
                value={data.fullName}
                onChange={(event) => update({ fullName: event.target.value })}
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <Field label="Work email" required>
              <Input
                type="email"
                value={data.userEmail}
                onChange={(event) => update({ userEmail: event.target.value })}
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <Field label="Phone (optional)">
              <Input
                value={data.phoneE164}
                onChange={(event) => update({ phoneE164: event.target.value })}
                placeholder="+1 555 000 0000"
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <Field label="Date of birth" required>
              <Input
                type="date"
                value={data.dateOfBirth}
                onChange={(event) => update({ dateOfBirth: event.target.value })}
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <Field label="Employment start date" required>
              <Input
                type="date"
                value={data.employmentStartDate}
                onChange={(event) => update({ employmentStartDate: event.target.value })}
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
          </div>
        ),
      },
      {
        id: "personal",
        title: "Personal & Demographics",
        description: "Help us understand your household context.",
        validate: (data) => {
          if (!data.maritalStatus || !data.citizenshipStatus || !data.veteranStatus || !data.educationLevel) {
            return "Please select options for each demographic field."
          }
          return null
        },
        render: ({ data, update }) => (
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Marital status"
              required
              value={data.maritalStatus}
              options={MARITAL_OPTIONS}
              onChange={(value) => update({ maritalStatus: value as MaritalStatus })}
            />
            <SelectField
              label="Citizenship status"
              required
              value={data.citizenshipStatus}
              options={CITIZENSHIP_OPTIONS}
              onChange={(value) => update({ citizenshipStatus: value as typeof CITIZENSHIP_OPTIONS[number] })}
            />
            <SelectField
              label="Veteran status"
              required
              value={data.veteranStatus}
              options={VETERAN_OPTIONS}
              onChange={(value) => update({ veteranStatus: value as typeof VETERAN_OPTIONS[number] })}
            />
            <SelectField
              label="Education level"
              required
              value={data.educationLevel}
              options={EDUCATION_OPTIONS}
              onChange={(value) => update({ educationLevel: value as EducationLevel })}
            />
            <Field label="Field of study (optional)">
              <Input
                value={data.major}
                onChange={(event) => update({ major: event.target.value })}
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
          </div>
        ),
      },
      {
        id: "household",
        title: "Household Snapshot",
        description: "Outline who you’re planning for.",
        validate: (data) => {
          if (!data.householdStructure || !data.spouseHasCoverage || !data.housingStatus || !data.tobaccoUser || !data.disabilityStatus) {
            return "Please complete the household snapshot."
          }
          if (data.householdStructure === "With Dependents" && (data.dependentCount === null || Number.isNaN(data.dependentCount))) {
            return "Tell us how many dependents you support."
          }
          return null
        },
        render: ({ data, update }) => (
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Household structure"
              required
              value={data.householdStructure}
              options={HOUSEHOLD_OPTIONS}
              onChange={(value) => update({ householdStructure: value as HouseholdStructure })}
            />
            {data.householdStructure === "With Dependents" && (
              <Field label="Dependent count" required>
                <Input
                  type="number"
                  min={0}
                  value={data.dependentCount ?? ""}
                  onChange={(event) =>
                    update({ dependentCount: event.target.value ? Number(event.target.value) : null })
                  }
                  className="rounded-xl border-[#A41E34]/20"
                />
              </Field>
            )}
            <SelectField
              label="Spouse has coverage"
              required
              value={data.spouseHasCoverage}
              options={COVERAGE_OPTIONS}
              onChange={(value) => update({ spouseHasCoverage: value as CoveragePreference })}
            />
            <SelectField
              label="Housing status"
              required
              value={data.housingStatus}
              options={HOUSING_OPTIONS}
              onChange={(value) => update({ housingStatus: value as typeof HOUSING_OPTIONS[number] })}
            />
            <SelectField
              label="Tobacco use"
              required
              value={data.tobaccoUser}
              options={BINARY_OPTIONS}
              onChange={(value) => update({ tobaccoUser: value as BinaryChoice })}
            />
            <SelectField
              label="Disability status"
              required
              value={data.disabilityStatus}
              options={BINARY_OPTIONS}
              onChange={(value) => update({ disabilityStatus: value as BinaryChoice })}
            />
          </div>
        ),
      },
      {
        id: "employment",
        title: "Employment & Location",
        description: "Where and how you work influences eligibility.",
        validate: (data) => {
          if (!data.workLocationCountry || !data.workLocationState || !data.employmentType || !data.incomeRange) {
            return "Please confirm your work location and employment details."
          }
          return null
        },
        render: ({ data, update }) => (
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Country"
              required
              value={data.workLocationCountry}
              options={COUNTRY_OPTIONS}
              onChange={(value) => update({ workLocationCountry: value })}
            />
            <SelectField
              label="State / Province"
              required
              value={data.workLocationState}
              options={STATE_OPTIONS}
              onChange={(value) => update({ workLocationState: value })}
            />
            <SelectField
              label="Employment type"
              required
              value={data.employmentType}
              options={EMPLOYMENT_OPTIONS}
              onChange={(value) => update({ employmentType: value as EmploymentType })}
            />
            <SelectField
              label="Household income range"
              required
              value={data.incomeRange}
              options={INCOME_OPTIONS}
              onChange={(value) => update({ incomeRange: value as IncomeRange })}
            />
          </div>
        ),
      },
      {
        id: "financial",
        title: "Financial Profile",
        description: "This helps tailor savings and protection guidance.",
        validate: (data) => {
          if (
            !data.riskAversion ||
            !data.monthlySavingsRate ||
            !data.creditScoreRange ||
            data.emergencySavingsMonths === null ||
            data.debtAmount === null
          ) {
            return "Please complete each financial profile field."
          }
          return null
        },
        render: ({ data, update }) => (
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="Risk profile"
              required
              value={data.riskAversion}
              options={RISK_OPTIONS}
              onChange={(value) => update({ riskAversion: value as RiskAversion })}
            />
            <Field label="Months of expenses saved" required>
              <Input
                type="number"
                min={0}
                value={data.emergencySavingsMonths ?? ""}
                onChange={(event) =>
                  update({ emergencySavingsMonths: event.target.value ? Number(event.target.value) : null })
                }
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <Field label="Approximate total debt" required>
              <Input
                type="number"
                min={0}
                value={data.debtAmount ?? ""}
                onChange={(event) => update({ debtAmount: event.target.value ? Number(event.target.value) : null })}
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <SelectField
              label="Monthly savings rate"
              required
              value={data.monthlySavingsRate}
              options={SAVINGS_OPTIONS}
              onChange={(value) => update({ monthlySavingsRate: value as SavingsRate })}
            />
            <SelectField
              label="Credit score range"
              required
              value={data.creditScoreRange}
              options={CREDIT_OPTIONS}
              onChange={(value) => update({ creditScoreRange: value })}
            />
          </div>
        ),
      },
      {
        id: "health",
        title: "Health & Insurance",
        description: "Confirm your current coverage choices.",
        validate: (data) => {
          if (
            !data.currentMedicalCoverage ||
            !data.disabilityInsurance ||
            !data.hsaOrFsa ||
            !data.interestInLifeInsurance ||
            !data.prescriptionUse
          ) {
            return "Please confirm each insurance selection."
          }
          return null
        },
        render: ({ data, update }) => (
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="Medical plan" required>
              <Input
                value={data.currentMedicalCoverage}
                onChange={(event) => update({ currentMedicalCoverage: event.target.value })}
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <SelectField
              label="Disability insurance"
              required
              value={data.disabilityInsurance}
              options={BINARY_OPTIONS}
              onChange={(value) => update({ disabilityInsurance: value as BinaryChoice })}
            />
            <SelectField
              label="HSA or FSA"
              required
              value={data.hsaOrFsa}
              options={HSA_OPTIONS}
              onChange={(value) => update({ hsaOrFsa: value as typeof HSA_OPTIONS[number] })}
            />
            <SelectField
              label="Interest in life insurance"
              required
              value={data.interestInLifeInsurance}
              options={BINARY_OPTIONS}
              onChange={(value) => update({ interestInLifeInsurance: value as BinaryChoice })}
            />
            <SelectField
              label="Regular prescription use"
              required
              value={data.prescriptionUse}
              options={BINARY_OPTIONS}
              onChange={(value) => update({ prescriptionUse: value as BinaryChoice })}
            />
          </div>
        ),
      },
      {
        id: "retirement",
        title: "Retirement & Planning",
        description: "Capture your long-term outlook.",
        validate: (data) => {
          if (
            !data.contributesTo401k ||
            !data.planType ||
            !data.beneficiariesNamed ||
            !data.retirementState
          ) {
            return "Please confirm retirement inputs."
          }
          return null
        },
        render: ({ data, update }) => (
          <div className="grid gap-5 sm:grid-cols-2">
            <SelectField
              label="401(k) contributions"
              required
              value={data.contributesTo401k}
              options={BINARY_OPTIONS}
              onChange={(value) => update({ contributesTo401k: value as BinaryChoice })}
            />
            <Field label="Contribution percent" subtitle="Optional">
              <Input
                type="number"
                min={0}
                value={data.contributionPercent ?? ""}
                onChange={(event) =>
                  update({ contributionPercent: event.target.value ? Number(event.target.value) : null })
                }
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <SelectField
              label="Plan type"
              required
              value={data.planType}
              options={PLAN_OPTIONS}
              onChange={(value) => update({ planType: value as PlanType })}
            />
            <SelectField
              label="Beneficiaries named"
              required
              value={data.beneficiariesNamed}
              options={BINARY_OPTIONS}
              onChange={(value) => update({ beneficiariesNamed: value as BinaryChoice })}
            />
            <Field label="Retirement state" required>
              <Input
                value={data.retirementState}
                onChange={(event) => update({ retirementState: event.target.value })}
                placeholder="e.g. Pennsylvania"
                className="rounded-xl border-[#A41E34]/20"
              />
            </Field>
          </div>
        ),
      },
      {
        id: "additional",
        title: "Additional Information",
        description: "Share any context we should know.",
        validate: (data) => {
          if (!data.consent) {
            return "Please provide consent to continue."
          }
          return null
        },
        render: ({ data, update }) => (
          <div className="space-y-6">
            <Field label="Additional notes (optional)">
              <Textarea
                value={data.additionalNotes}
                onChange={(event) => update({ additionalNotes: event.target.value })}
                className="min-h-[140px] rounded-xl border-[#A41E34]/20"
              />
            </Field>
            <label className="flex items-start gap-3 rounded-2xl border border-[#A41E34]/20 bg-white p-4 text-sm text-[#1E1E1E] shadow-sm">
              <input
                type="checkbox"
                checked={data.consent}
                onChange={(event) => update({ consent: event.target.checked })}
                className="mt-1 h-4 w-4 rounded border-[#A41E34]/50 text-[#A41E34] focus:ring-[#A41E34]"
              />
              <span className="leading-relaxed">
                I consent to securely share this information with LifeLens for benefit guidance.
              </span>
            </label>
          </div>
        ),
      },
    ],
    []
  )

  const totalSteps = steps.length
  const progress = ((currentStep + 1) / totalSteps) * 100

  const goToPrevious = () => {
    setError(null)
    setFeedback(null)
    setCurrentStep((prev) => Math.max(prev - 1, 0))
  }

  const handleNext = () => {
    const activeStep = steps[currentStep]
    const validationMessage = activeStep.validate(formData)

    if (validationMessage) {
      setError(validationMessage)
      setFeedback(null)
      return
    }

    setError(null)

    if (currentStep < totalSteps - 1) {
      setFeedback("Answers saved")
      window.setTimeout(() => setFeedback(null), 2400)
      setCurrentStep((prev) => prev + 1)
    } else {
      setMode("analyzing")
      window.setTimeout(() => {
        onComplete({ ...formData })
        setMode("form")
        setFeedback(null)
      }, 1600)
    }
  }

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E]">
      <TopNav />
      <div className="mx-auto flex w-full max-w-5xl flex-col px-6 pb-20 pt-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <Button
            variant="ghost"
            className="w-fit rounded-xl text-sm font-semibold text-[#A41E34] hover:bg-[#A41E34]/10"
            onClick={onBackToHome}
          >
            Back to Home
          </Button>
          <div className="space-y-2 text-right">
            <p className="text-sm font-semibold text-[#A41E34]">Step {currentStep + 1} of {totalSteps}</p>
            <div className="h-1.5 w-48 overflow-hidden rounded-full bg-[#A41E34]/10">
              <div className="h-full rounded-full bg-[#A41E34] transition-all" style={{ width: `${progress}%` }} />
            </div>
          </div>
        </div>

        <div className="relative flex-1">
          <AnimatePresence mode="wait" initial={false}>
            <motion.div
              key={steps[currentStep].id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="rounded-3xl border border-[#A41E34]/15 bg-white/90 p-6 shadow-xl sm:p-8"
            >
              <div className="mb-6">
                <h2 className="text-2xl font-semibold text-[#1E1E1E]">{steps[currentStep].title}</h2>
                <p className="mt-2 text-sm text-[#3D3D3D]">{steps[currentStep].description}</p>
              </div>
              <div className="space-y-6">{steps[currentStep].render({ data: formData, update: updateForm })}</div>
            </motion.div>
          </AnimatePresence>

          <AnimatePresence>
            {feedback && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#4CAF50]/20 bg-[#4CAF50]/10 px-4 py-2 text-sm font-medium text-[#2E7D32]"
              >
                <CheckCircle className="h-4 w-4" />
                {feedback}
              </motion.div>
            )}
          </AnimatePresence>

          {error && (
            <div className="mt-4 rounded-2xl border border-[#A41E34]/30 bg-[#FFF1F1] px-4 py-3 text-sm text-[#A41E34]">
              {error}
            </div>
          )}
        </div>

        <div className="sticky bottom-0 mt-8 border-t border-[#A41E34]/10 bg-white/95 py-6 backdrop-blur">
          <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
            <Button
              variant="outline"
              className="rounded-xl border-[#A41E34]/30 bg-white px-6 py-3 text-sm font-semibold text-[#1E1E1E] hover:bg-[#A41E34]/10"
              onClick={goToPrevious}
              disabled={currentStep === 0 || mode === "analyzing"}
            >
              <ChevronLeft className="mr-2 h-4 w-4" /> Previous
            </Button>
            <Button
              className="rounded-xl border border-[#A41E34] bg-white px-6 py-3 text-sm font-semibold text-[#A41E34] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#A41E34]/10"
              onClick={handleNext}
              disabled={mode === "analyzing"}
            >
              {mode === "analyzing" ? (
                <span className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Analyzing with LifeLens AI
                </span>
              ) : currentStep === totalSteps - 1 ? (
                <span className="flex items-center gap-2">
                  Submit & View Insights <ChevronRight className="h-4 w-4" />
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  Save & Continue <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}

function Field({
  label,
  subtitle,
  required,
  children,
}: {
  label: string
  subtitle?: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div className="flex flex-col gap-2">
      <Label className="text-sm font-medium text-[#1E1E1E]">
        {label}
        {required ? <span className="ml-1 text-[#A41E34]">*</span> : null}
        {subtitle ? <span className="ml-2 text-xs font-normal text-[#6B6B6B]">{subtitle}</span> : null}
      </Label>
      {children}
    </div>
  )
}

function SelectField({
  label,
  subtitle,
  required,
  value,
  options,
  onChange,
}: {
  label: string
  subtitle?: string
  required?: boolean
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <Field label={label} subtitle={subtitle} required={required}>
      <select
        className={cn(
          "rounded-xl border border-[#A41E34]/20 bg-white px-4 py-2 text-sm text-[#1E1E1E] focus:border-[#A41E34] focus:outline-none focus:ring-2 focus:ring-[#A41E34]/20",
          !value && "text-[#A41E34]/50"
        )}
        value={value}
        onChange={(event) => onChange(event.target.value)}
      >
        <option value="">Select an option</option>
        {options
          .filter((option) => option)
          .map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
      </select>
    </Field>
  )
}
