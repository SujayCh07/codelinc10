export type ScreenKey =
  | "landing"
  | "quiz"
  | "insights"
  | "timeline"
  | "faq"
  | "profile"

export type ResidencyStatus =
  | "Citizen"
  | "Permanent Resident"
  | "Work Visa"
  | "Student Visa"
  | "Other"

export type MaritalStatusOption =
  | "single"
  | "married"
  | "partnered"
  | "divorced"
  | "widowed"
  | "other"

export interface EnrollmentFormData {
  userId: string | null
  fullName: string
  preferredName: string
  age: number | null
  maritalStatus: MaritalStatusOption
  dependents: number
  employmentStartDate: string
  educationLevel: "high-school" | "associate" | "bachelor" | "master" | "doctorate" | "other"
  educationMajor: string
  workCountry: string
  workState: string
  riskComfort: number
  physicalActivities: boolean | null
  activityList: string[]
  tobaccoUse: boolean | null
  disability: boolean | null
  veteran: boolean | null
  creditScore: number
  citizenship: string
  residencyStatus: ResidencyStatus
  createdAt: string
  isGuest: boolean
  consentToFollowUp: boolean
  derived: {
    riskFactorScore: number
    activityRiskModifier: number
    coverageComplexity: "low" | "medium" | "high"
  }
}

export interface PlanResource {
  title: string
  description: string
  url: string
}

export interface LifeLensPlan {
  planId: string
  planName: string
  shortDescription: string
  reasoning: string
  monthlyCostEstimate: string
  riskMatchScore: number
  highlights: string[]
  resources: PlanResource[]
}

export interface LifeLensInsights {
  ownerName: string
  persona: string
  focusGoal: string
  statement: string
  timeline: { period: string; title: string; description: string }[]
  conversation: { speaker: "LifeLens" | "You"; message: string }[]
  prompts: string[]
  plans: LifeLensPlan[]
  selectedPlanId: string | null
  goalTheme?: string
  themeKey?: string
}

export interface SavedMoment {
  id: string
  category: string
  summary: string
  timeline: LifeLensInsights["timeline"]
  timestamp: string
  insight: LifeLensInsights
}

export interface ChatEntry {
  speaker: "LifeLens" | "You"
  message: string
  timestamp: string
  status?: "pending" | "final"
}

export interface ProfileSnapshot {
  name: string
  aiPersona: string
  age: string
  employmentStartDate: string
  dependents: number
  residencyStatus: ResidencyStatus
  citizenship: string
  riskFactorScore: number
  activitySummary: string
  coverageComplexity: EnrollmentFormData["derived"]["coverageComplexity"]
  createdAt: string
}
