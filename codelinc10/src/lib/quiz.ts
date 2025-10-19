import type {
  ActivityLevel,
  EnrollmentFormData,
  HealthCoverageOption,
  HomeOwnershipStatus,
  IncomeRange,
  MaritalStatusOption,
  ResidencyStatus,
} from "./types"

export type QuizQuestionType =
  | "number"
  | "select"
  | "slider"
  | "boolean"
  | "boolean-choice"
  | "multi-select"

export interface QuizOption {
  label: string
  value: string
  helper?: string
}

export interface QuizQuestion {
  id:
    | keyof EnrollmentFormData
    | "activityLevel"
  title: string
  prompt: string
  type: QuizQuestionType
  placeholder?: string
  options?: QuizOption[]
  min?: number
  max?: number
  step?: number
  condition?: (data: EnrollmentFormData) => boolean
}

export const ACTIVITY_OPTIONS: QuizOption[] = [
  { label: "Running", value: "running" },
  { label: "Hiking", value: "hiking" },
  { label: "Gym", value: "gym" },
  { label: "Team sports", value: "sports" },
  { label: "Cycling", value: "cycling" },
  { label: "Yoga", value: "yoga" },
]

const MARITAL_LABELS: Record<MaritalStatusOption, string> = {
  single: "Single",
  married: "Married",
  partnered: "Domestic partner",
  divorced: "Divorced",
  widowed: "Widowed",
  other: "Other",
}

export const MARITAL_OPTIONS: QuizOption[] = (Object.keys(MARITAL_LABELS) as MaritalStatusOption[]).map((value) => ({
  value,
  label: MARITAL_LABELS[value],
}))

const RESIDENCY_LABELS: Record<ResidencyStatus, string> = {
  Citizen: "Citizen",
  "Permanent Resident": "Permanent resident",
  "Work Visa": "Work visa",
  "Student Visa": "Student visa",
  Other: "Other",
}

export const RESIDENCY_OPTIONS: QuizOption[] = (Object.keys(RESIDENCY_LABELS) as ResidencyStatus[]).map((value) => ({
  value,
  label: RESIDENCY_LABELS[value],
}))

export const CITIZENSHIP_OPTIONS: QuizOption[] = [
  { label: "U.S. Citizen", value: "U.S. Citizen" },
  { label: "Dual citizen", value: "Dual citizen" },
  { label: "Permanent resident", value: "Permanent resident" },
  { label: "Work visa", value: "Work visa" },
  { label: "Other", value: "Other" },
]

export const EDUCATION_OPTIONS: QuizOption[] = [
  { label: "High school", value: "high-school" },
  { label: "Associate", value: "associate" },
  { label: "Bachelor's", value: "bachelor" },
  { label: "Master's", value: "master" },
  { label: "Doctorate", value: "doctorate" },
  { label: "Other", value: "other" },
]

export const COVERAGE_OPTIONS: QuizOption[] = [
  { label: "Just me", value: "self", helper: "Solo coverage focused on you" },
  {
    label: "Me + partner",
    value: "self-plus-partner",
    helper: "Pair coverage with shared benefits",
  },
  {
    label: "Me + dependents",
    value: "self-plus-family",
    helper: "Family-first protections",
  },
]

export const HOME_OPTIONS: QuizOption[] = [
  { label: "Rent", value: "rent" },
  { label: "Own", value: "own" },
  { label: "Live with family", value: "with-family" },
  { label: "Other", value: "other" },
]

export const INCOME_OPTIONS: QuizOption[] = [
  { label: "Under $50k", value: "under-50k" },
  { label: "$50k – $80k", value: "50-80k" },
  { label: "$80k – $120k", value: "80-120k" },
  { label: "$120k – $160k", value: "120-160k" },
  { label: "$160k+", value: "160k-plus" },
]

export const HEALTH_OPTIONS: QuizOption[] = [
  { label: "Employer plan", value: "employer" },
  { label: "Partner's plan", value: "partner" },
  { label: "Marketplace plan", value: "marketplace" },
  { label: "No current coverage", value: "none" },
]

export const ACTIVITY_LEVEL_OPTIONS: QuizOption[] = [
  { label: "Relaxed", value: "relaxed", helper: "Light activity" },
  { label: "Balanced", value: "balanced", helper: "Mix of movement and rest" },
  { label: "Active lifestyle", value: "active", helper: "Frequent workouts or sports" },
]

export function initializeQuizState(template: EnrollmentFormData): EnrollmentFormData {
  const preferredName = template.preferredName || template.fullName.split(" ")[0] || template.fullName

  const hydrated: EnrollmentFormData = {
    ...template,
    preferredName,
    activityList: Array.from(new Set(template.activityList)),
    physicalActivities:
      template.activityLevel === "active"
        ? true
        : template.activityLevel === "relaxed"
          ? false
          : template.physicalActivities,
  }

  if (hydrated.coveragePreference !== "self-plus-family") {
    hydrated.dependents = 0
  }

  if (hydrated.coveragePreference === "self") {
    hydrated.tobaccoUse = null
  }

  if (!(["married", "partnered"] as EnrollmentFormData["maritalStatus"][]).includes(hydrated.maritalStatus)) {
    hydrated.spouseHasSeparateInsurance = null
  }

  if ((hydrated.savingsRate ?? 0) >= 10) {
    hydrated.wantsSavingsSupport = null
  }

  if ((hydrated.riskComfort ?? 0) < 4) {
    hydrated.investsInMarkets = null
  }

  if (hydrated.activityLevel !== "active") {
    hydrated.activityList = []
  }

  return hydrated
}

export function questionsFor(data: EnrollmentFormData): QuizQuestion[] {
  const steps: QuizQuestion[] = [
    {
      id: "age",
      title: "How old are you?",
      prompt: "Age lines up eligibility windows for your benefits.",
      type: "number",
      min: 18,
      max: 75,
      placeholder: "Enter your age",
    },
    {
      id: "maritalStatus",
      title: "What is your marital status?",
      prompt: "We coordinate partner questions based on your answer.",
      type: "select",
      options: MARITAL_OPTIONS,
    },
    {
      id: "residencyStatus",
      title: "What's your residency status?",
      prompt: "Ensures compliance and enrollment reminders are accurate.",
      type: "select",
      options: RESIDENCY_OPTIONS,
    },
    {
      id: "citizenship",
      title: "What best describes your citizenship?",
      prompt: "We only use this to tailor plan paperwork guidance.",
      type: "select",
      options: CITIZENSHIP_OPTIONS,
    },
    {
      id: "educationLevel",
      title: "What's your highest education level?",
      prompt: "Education can unlock student loan and learning benefits.",
      type: "select",
      options: EDUCATION_OPTIONS,
    },
    {
      id: "coveragePreference",
      title: "Who do you want coverage for?",
      prompt: "Choose the household you want LifeLens to support.",
      type: "select",
      options: COVERAGE_OPTIONS,
    },
    {
      id: "dependents",
      title: "How many dependents rely on you?",
      prompt: "Include children or other people you plan to cover.",
      type: "number",
      min: 0,
      max: 6,
      condition: (answers) => answers.coveragePreference === "self-plus-family",
    },
    {
      id: "spouseHasSeparateInsurance",
      title: "Does your partner have their own insurance?",
      prompt: "Helps coordinate if you share coverage.",
      type: "boolean-choice",
      condition: (answers) => ["married", "partnered"].includes(answers.maritalStatus),
    },
    {
      id: "homeOwnership",
      title: "What's your housing situation?",
      prompt: "We'll tailor protections around where you live.",
      type: "select",
      options: HOME_OPTIONS,
    },
    {
      id: "incomeRange",
      title: "What's your household income?",
      prompt: "This keeps savings and protections realistic.",
      type: "select",
      options: INCOME_OPTIONS,
    },
    {
      id: "healthCoverage",
      title: "Where does your health coverage come from?",
      prompt: "We'll flag any gaps based on your answer.",
      type: "select",
      options: HEALTH_OPTIONS,
    },
    {
      id: "tobaccoUse",
      title: "Does anyone you cover use tobacco?",
      prompt: "Helps us surface the right life and disability coverage reminders.",
      type: "boolean-choice",
      condition: (answers) => answers.coveragePreference !== "self",
    },
    {
      id: "savingsRate",
      title: "How much do you save each month?",
      prompt: "Estimate the percent of income you set aside.",
      type: "slider",
      min: 0,
      max: 30,
      step: 1,
    },
    {
      id: "wantsSavingsSupport",
      title: "Want help improving savings?",
      prompt: "We'll send automation tips if you'd like reminders.",
      type: "boolean-choice",
      condition: (answers) => (answers.savingsRate ?? 0) < 10,
    },
    {
      id: "riskComfort",
      title: "How comfortable are you with risk?",
      prompt: "Slide from very low (1) to very high (5).",
      type: "slider",
      min: 1,
      max: 5,
      step: 1,
    },
    {
      id: "investsInMarkets",
      title: "Do you invest in crypto or stocks?",
      prompt: "We tailor education and guardrails based on this.",
      type: "boolean-choice",
      condition: (answers) => (answers.riskComfort ?? 1) >= 4,
    },
    {
      id: "activityLevel",
      title: "How active is your lifestyle?",
      prompt: "Pick the option that feels most like you.",
      type: "select",
      options: ACTIVITY_LEVEL_OPTIONS,
    },
    {
      id: "activityList",
      title: "What keeps you moving?",
      prompt: "Choose all the activities you enjoy.",
      type: "multi-select",
      options: ACTIVITY_OPTIONS,
      condition: (answers) => answers.activityLevel === "active",
    },
  ]

  return steps.filter((question) => (question.condition ? question.condition(data) : true))
}

export function updateFormValue(
  data: EnrollmentFormData,
  id: QuizQuestion["id"],
  value: string | number | boolean | string[] | null,
): EnrollmentFormData {
  const next: EnrollmentFormData = { ...data }

  switch (id) {
    case "age":
      if (typeof value === "number") {
        next.age = Math.max(18, Math.min(75, value))
      } else {
        next.age = value ? Math.max(18, Math.min(75, Number(value))) : null
      }
      break
    case "coveragePreference":
      next.coveragePreference = value as EnrollmentFormData["coveragePreference"]
      if (next.coveragePreference !== "self-plus-family") {
        next.dependents = 0
      }
      if (next.coveragePreference === "self") {
        next.tobaccoUse = null
      }
      break
    case "maritalStatus":
      next.maritalStatus = value as EnrollmentFormData["maritalStatus"]
      if (!(["married", "partnered"] as EnrollmentFormData["maritalStatus"][]).includes(next.maritalStatus)) {
        next.spouseHasSeparateInsurance = null
      }
      break
    case "residencyStatus":
      next.residencyStatus = value as EnrollmentFormData["residencyStatus"]
      break
    case "citizenship":
      next.citizenship = typeof value === "string" ? value : next.citizenship
      break
    case "educationLevel":
      next.educationLevel = value as EnrollmentFormData["educationLevel"]
      break
    case "dependents":
      if (typeof value === "number") {
        next.dependents = Math.max(0, Math.min(10, value))
      } else {
        next.dependents = value ? Math.max(0, Math.min(10, Number(value))) : 0
      }
      break
    case "homeOwnership":
      next.homeOwnership = value as HomeOwnershipStatus
      break
    case "incomeRange":
      next.incomeRange = value as IncomeRange
      break
    case "healthCoverage":
      next.healthCoverage = value as HealthCoverageOption
      break
    case "spouseHasSeparateInsurance":
      next.spouseHasSeparateInsurance = typeof value === "boolean" ? value : null
      break
    case "savingsRate":
      if (typeof value === "number") {
        next.savingsRate = Math.max(0, Math.min(50, value))
      } else if (value) {
        next.savingsRate = Math.max(0, Math.min(50, Number(value)))
      }
      if ((next.savingsRate ?? 0) >= 10) {
        next.wantsSavingsSupport = null
      }
      break
    case "wantsSavingsSupport":
      next.wantsSavingsSupport = typeof value === "boolean" ? value : null
      break
    case "riskComfort":
      if (typeof value === "number") {
        next.riskComfort = Math.max(1, Math.min(5, value))
      } else if (value) {
        next.riskComfort = Math.max(1, Math.min(5, Number(value)))
      }
      if ((next.riskComfort ?? 0) < 4) {
        next.investsInMarkets = null
      }
      break
    case "investsInMarkets":
      next.investsInMarkets = typeof value === "boolean" ? value : null
      break
    case "activityLevel":
      next.activityLevel = value as ActivityLevel
      next.physicalActivities = next.activityLevel === "active"
      if (next.activityLevel !== "active") {
        next.activityList = []
      }
      break
    case "activityList":
      next.activityList = Array.isArray(value) ? Array.from(new Set(value)) : []
      break
    case "tobaccoUse":
      next.tobaccoUse = typeof value === "boolean" ? value : null
      break
    case "creditScore":
      next.creditScore = typeof value === "number" ? value : value ? Number(value) : next.creditScore
      break
    default:
      break
  }

  return next
}
