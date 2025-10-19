export type ScreenKey =
  | "landing"
  | "enrollment"
  | "insights"
  | "timeline"
  | "learning"
  | "faq"
  | "profile"

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

export interface LifeLensInsights {
  ownerName: string
  persona: string
  statement: string
  priorities: { title: string; description: string }[]
  tips: { title: string; description: string; icon: string }[]
  timeline: { period: string; title: string; description: string }[]
  focusGoal: string
  resources: { title: string; description: string; url: string }[]
  conversation: { speaker: "LifeLens" | "You"; message: string }[]
  prompts: string[]
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
  ageRange: string
  employmentType: string
  householdSize: number
  dependents: number
  lifeEvents: string[]
  goals: string[]
  createdAt: string
}
