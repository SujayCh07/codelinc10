import type {
  ActivityLevel,
  EnrollmentFormData,
  HealthCoverageOption,
  HomeOwnershipStatus,
  IncomeRange,
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

  return {
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
}

export function questionsFor(data: EnrollmentFormData): QuizQuestion[] {
  const steps: QuizQuestion[] = [
    {
      id: "age",
      title: "How old are you?",
      prompt: "Your age helps LifeLens tune plan milestones.",
      type: "number",
      min: 18,
      max: 75,
    },
    {
      id: "coveragePreference",
      title: "Who do you want coverage for?",
      prompt: "We'll customize guidance around the people you support.",
      type: "select",
      options: COVERAGE_OPTIONS,
    },
    {
      id: "dependents",
      title: "How many dependents count on you?",
      prompt: "Include children or others you plan to cover.",
      type: "number",
      min: 0,
      max: 6,
      condition: (answers) => answers.coveragePreference === "self-plus-family",
    },
    {
      id: "homeOwnership",
      title: "What's your home setup?",
      prompt: "We'll align protections for your living situation.",
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
      id: "spouseHasSeparateInsurance",
      title: "Does your partner carry separate insurance?",
      prompt: "Helps us coordinate coverages if you share benefits.",
      type: "boolean-choice",
      condition: (answers) => ["married", "partnered"].includes(answers.maritalStatus),
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
      title: "Want a savings boost?",
      prompt: "We'll surface automation tips if you'd like help.",
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
      prompt: "Choose the best match so we can pair the right wellness perks.",
      type: "select",
      options: ACTIVITY_LEVEL_OPTIONS,
    },
    {
      id: "activityList",
      title: "What keeps you moving?",
      prompt: "Pick all activities you enjoy.",
      type: "multi-select",
      options: ACTIVITY_OPTIONS,
      condition: (answers) => answers.activityLevel === "active",
    },
    {
      id: "tobaccoUse",
      title: "Do you use tobacco products?",
      prompt: "Only used to tailor certain protections.",
      type: "boolean-choice",
    },
    {
      id: "creditScore",
      title: "What's your credit score range?",
      prompt: "Approximate is fine — LifeLens uses a slider from 300 to 850.",
      type: "slider",
      min: 300,
      max: 850,
      step: 10,
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
      next.age = typeof value === "number" ? value : value ? Number(value) : null
      break
    case "coveragePreference":
      next.coveragePreference = value as EnrollmentFormData["coveragePreference"]
      if (next.coveragePreference !== "self-plus-family") {
        next.dependents = 0
      }
      break
    case "dependents":
      next.dependents = typeof value === "number" ? value : value ? Number(value) : 0
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
      next.savingsRate = typeof value === "number" ? value : value ? Number(value) : next.savingsRate
      break
    case "wantsSavingsSupport":
      next.wantsSavingsSupport = typeof value === "boolean" ? value : null
      break
    case "riskComfort":
      next.riskComfort = typeof value === "number" ? value : value ? Number(value) : next.riskComfort
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
      next.activityList = Array.isArray(value) ? value : []
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
