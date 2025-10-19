import type { EnrollmentFormData } from "./types"

const nowISO = () => new Date().toISOString()

const buildDerived = (overrides?: Partial<EnrollmentFormData["derived"]>) => ({
  riskFactorScore: 42,
  activityRiskModifier: 0,
  coverageComplexity: "medium" as const,
  ...overrides,
})

export const DEFAULT_ENROLLMENT_FORM: EnrollmentFormData = {
  userId: null,
  fullName: "Sujay Chava",
  preferredName: "Sujay",
  age: 32,
  maritalStatus: "single",
  dependents: 0,
  employmentStartDate: "2022-04-01",
  educationLevel: "bachelor",
  educationMajor: "Finance",
  workCountry: "United States",
  workState: "PA",
  riskComfort: 3,
  physicalActivities: true,
  activityList: ["hiking", "gym"],
  tobaccoUse: false,
  disability: false,
  veteran: false,
  creditScore: 710,
  citizenship: "United States",
  residencyStatus: "Citizen",
  createdAt: nowISO(),
  isGuest: false,
  consentToFollowUp: true,
  derived: buildDerived({ riskFactorScore: 48, activityRiskModifier: 4 }),
}

export const DEMO_ENROLLMENT_FORM: EnrollmentFormData = {
  ...DEFAULT_ENROLLMENT_FORM,
  userId: typeof crypto !== "undefined" && "randomUUID" in crypto ? crypto.randomUUID() : "demo-user",
  fullName: "Jordan Demo",
  preferredName: "Jordan",
  age: 29,
  maritalStatus: "married",
  dependents: 1,
  employmentStartDate: "2021-01-01",
  educationLevel: "master",
  educationMajor: "Marketing",
  workCountry: "United States",
  workState: "NC",
  riskComfort: 4,
  physicalActivities: true,
  activityList: ["running"],
  tobaccoUse: false,
  disability: false,
  veteran: false,
  creditScore: 735,
  citizenship: "United States",
  residencyStatus: "Citizen",
  createdAt: nowISO(),
  isGuest: true,
  consentToFollowUp: true,
  derived: buildDerived({ riskFactorScore: 54, activityRiskModifier: 2, coverageComplexity: "high" }),
}

export const FORM_STORAGE_KEY = "lifelens-form-cache"
export const INSIGHTS_STORAGE_KEY = "lifelens-insights-cache"
export const MOMENTS_STORAGE_KEY = "lifelens-moments-cache"
export const CHAT_STORAGE_KEY = "lifelens-chat-cache"
export const PROFILE_CREATED_KEY = "lifelens-profile-created"
