import type { EnrollmentFormData, MaritalStatusOption, ResidencyStatus } from "./types"

export type QuizQuestionType =
  | "text"
  | "number"
  | "date"
  | "select"
  | "slider"
  | "boolean"
  | "multi-select"

export interface QuizOption {
  label: string
  value: string
}

export interface QuizQuestion {
  id: keyof EnrollmentFormData | "educationMajor" | "activityList"
  title: string
  prompt: string
  type: QuizQuestionType
  placeholder?: string
  options?: QuizOption[]
  min?: number
  max?: number
  step?: number
  followUpId?: QuizQuestion["id"]
  condition?: (data: Partial<EnrollmentFormData>) => boolean
}

export const RESIDENCY_OPTIONS: ResidencyStatus[] = [
  "Citizen",
  "Permanent Resident",
  "Work Visa",
  "Student Visa",
  "Other",
]

export const MARITAL_OPTIONS: MaritalStatusOption[] = [
  "single",
  "married",
  "partnered",
  "divorced",
  "widowed",
  "other",
]

export const ACTIVITY_OPTIONS: QuizOption[] = [
  { label: "Running", value: "running" },
  { label: "Hiking", value: "hiking" },
  { label: "Gym/strength", value: "gym" },
  { label: "Team sports", value: "sports" },
  { label: "Cycling", value: "cycling" },
  { label: "Other", value: "other" },
]

export const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    id: "fullName",
    title: "Who’s getting guidance?",
    prompt: "Enter your full legal name so LifeLens can personalize the plan and future report.",
    type: "text",
    placeholder: "Your full name",
  },
  {
    id: "preferredName",
    title: "What should LifeLens call you?",
    prompt: "We’ll use this in chats and your personalized plan.",
    type: "text",
    placeholder: "Preferred name",
  },
  {
    id: "age",
    title: "How old are you?",
    prompt: "We only use this to tune the benefits guidance.",
    type: "number",
    min: 18,
    max: 75,
  },
  {
    id: "maritalStatus",
    title: "What’s your relationship status?",
    prompt: "This helps us recommend the right dependents and benefits mix.",
    type: "select",
    options: MARITAL_OPTIONS.map((value) => ({
      value,
      label: value.charAt(0).toUpperCase() + value.slice(1),
    })),
  },
  {
    id: "dependents",
    title: "How many dependents rely on you?",
    prompt: "Include children, partners, or others you cover.",
    type: "number",
    min: 0,
    max: 6,
  },
  {
    id: "employmentStartDate",
    title: "When did you start at Lincoln?",
    prompt: "We’ll spotlight milestones around your tenure.",
    type: "date",
  },
  {
    id: "educationLevel",
    title: "Highest education completed?",
    prompt: "Advanced education unlocks tailored upskilling resources.",
    type: "select",
    options: [
      { label: "High school", value: "high-school" },
      { label: "Associate", value: "associate" },
      { label: "Bachelor’s", value: "bachelor" },
      { label: "Master’s", value: "master" },
      { label: "Doctorate", value: "doctorate" },
      { label: "Other", value: "other" },
    ],
    followUpId: "educationMajor",
  },
  {
    id: "educationMajor",
    title: "What did you study?",
    prompt: "We’ll reference this when sharing learning pathways.",
    type: "text",
    placeholder: "Marketing, Finance, etc.",
    condition: (data) =>
      ["associate", "bachelor", "master", "doctorate"].includes(data.educationLevel ?? ""),
  },
  {
    id: "workCountry",
    title: "Where do you work?",
    prompt: "Country first, state next.",
    type: "text",
    placeholder: "United States",
  },
  {
    id: "workState",
    title: "Which state are you based in?",
    prompt: "We’ll align benefits and compliance by region.",
    type: "text",
    placeholder: "PA",
  },
  {
    id: "riskComfort",
    title: "How comfortable are you with financial risk?",
    prompt: "Slide from very low (1) to very high (5).",
    type: "slider",
    min: 1,
    max: 5,
    step: 1,
  },
  {
    id: "physicalActivities",
    title: "Do you stay active through sports or exercise?",
    prompt: "We tailor injury and wellness benefits based on this.",
    type: "boolean",
    followUpId: "activityList",
  },
  {
    id: "activityList",
    title: "Which activities are part of your routine?",
    prompt: "Pick all that apply.",
    type: "multi-select",
    options: ACTIVITY_OPTIONS,
    condition: (data) => data.physicalActivities === true,
  },
  {
    id: "tobaccoUse",
    title: "Do you use tobacco products?",
    prompt: "We keep this private — it only adjusts certain coverages.",
    type: "boolean",
  },
  {
    id: "disability",
    title: "Do you identify as having a disability?",
    prompt: "This ensures we highlight the right support programs.",
    type: "boolean",
  },
  {
    id: "veteran",
    title: "Are you a veteran?",
    prompt: "We’ll surface veteran-specific benefits and resources.",
    type: "boolean",
  },
  {
    id: "creditScore",
    title: "What’s your current credit score?",
    prompt: "Approximate is fine — LifeLens uses a slider from 300 to 850.",
    type: "slider",
    min: 300,
    max: 850,
    step: 10,
  },
  {
    id: "citizenship",
    title: "What’s your citizenship?",
    prompt: "List the country or status in your own words.",
    type: "text",
    placeholder: "United States",
  },
  {
    id: "residencyStatus",
    title: "And your residency status?",
    prompt: "This is only used to ensure the right coverage guidance.",
    type: "select",
    options: RESIDENCY_OPTIONS.map((status) => ({ label: status, value: status })),
  },
]

export function questionsFor(data: Partial<EnrollmentFormData>) {
  return QUIZ_QUESTIONS.filter((question) => question.condition ? question.condition(data) : true)
}

export function applyQuizBranching() {
  return QUIZ_QUESTIONS
}

export function updateFormValue(
  data: EnrollmentFormData,
  id: QuizQuestion["id"],
  value: string | number | boolean | string[] | null
): EnrollmentFormData {
  const next: EnrollmentFormData = { ...data }
  switch (id) {
    case "fullName":
    case "preferredName":
    case "employmentStartDate":
    case "educationLevel":
    case "educationMajor":
    case "workCountry":
    case "workState":
    case "citizenship":
      next[id as keyof EnrollmentFormData] = value as never
      break
    case "age":
    case "dependents":
    case "creditScore":
      next[id as keyof EnrollmentFormData] = Number(value ?? 0) as never
      break
    case "riskComfort":
      next.riskComfort = Number(value ?? 1)
      break
    case "physicalActivities":
    case "tobaccoUse":
    case "disability":
    case "veteran":
      next[id as keyof EnrollmentFormData] = (value as boolean | null) ?? null as never
      if (id === "physicalActivities" && value !== true) {
        next.activityList = []
      }
      break
    case "activityList":
      next.activityList = Array.isArray(value) ? value : []
      break
    case "maritalStatus":
      next.maritalStatus = value as MaritalStatusOption
      break
    case "residencyStatus":
      next.residencyStatus = value as ResidencyStatus
      break
    default:
      break
  }
  return next
}

export function initializeQuizState(template: EnrollmentFormData) {
  return {
    ...template,
    activityList: Array.from(new Set(template.activityList)),
    preferredName: template.preferredName || template.fullName.split(" ")[0] || template.fullName,
  }
}
