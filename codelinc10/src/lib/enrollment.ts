import type { EnrollmentFormData } from "./types"

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

export const FORM_STORAGE_KEY = "lifelens-form-cache"
export const INSIGHTS_STORAGE_KEY = "lifelens-insights-cache"
export const MOMENTS_STORAGE_KEY = "lifelens-moments-cache"
export const CHAT_STORAGE_KEY = "lifelens-chat-cache"
export const PROFILE_CREATED_KEY = "lifelens-profile-created"
