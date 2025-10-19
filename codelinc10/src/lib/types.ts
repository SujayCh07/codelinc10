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

export type CoveragePreference = "self" | "self-plus-partner" | "self-plus-family"

export type HomeOwnershipStatus = "rent" | "own" | "with-family" | "other"

export type IncomeRange =
  | "under-50k"
  | "50-80k"
  | "80-120k"
  | "120-160k"
  | "160k-plus"

export type HealthCoverageOption = "employer" | "partner" | "marketplace" | "none"

export type ActivityLevel = "relaxed" | "balanced" | "active"

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
  workRegion: string
  coveragePreference: CoveragePreference
  homeOwnership: HomeOwnershipStatus
  incomeRange: IncomeRange
  healthCoverage: HealthCoverageOption
  spouseHasSeparateInsurance: boolean | null
  savingsRate: number
  wantsSavingsSupport: boolean | null
  riskComfort: number
  investsInMarkets: boolean | null
  activityLevel: ActivityLevel
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

export interface PriorityBenefit {
  id: string
  title: string
  category: "coverage" | "savings" | "health" | "wellness" | "planning"
  description: string
  whyItMatters: string
  urgency: "Now" | "Next 30 days" | "This quarter"
  actions: PlanResource[]
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
  focusGoal: string
  statement: string
  timeline: { period: string; title: string; description: string }[]
  conversation: { speaker: "LifeLens" | "You"; message: string }[]
  prompts: string[]
  plans: LifeLensPlan[]
  recommendedPlans?: { id: string; name: string; reason: string; resources?: PlanResource[] }[]
  selectedPlanId: string | null
  goalTheme?: string
  themeKey?: string
  priorityBenefits: PriorityBenefit[]
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
  focusArea: string
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
