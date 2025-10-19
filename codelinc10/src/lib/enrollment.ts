import type { EnrollmentFormData } from "./types"

const nowISO = () => new Date().toISOString()

const buildDerived = (overrides?: Partial<EnrollmentFormData["derived"]>) => ({
  riskFactorScore: 36,
  activityRiskModifier: 0,
  coverageComplexity: "medium" as const,
  ...overrides,
})

export const DEFAULT_ENROLLMENT_FORM: EnrollmentFormData = {
  userId: null,
  fullName: "",
  preferredName: "",
  age: null,
  maritalStatus: "single",
  dependents: 0,
  employmentStartDate: "",
  educationLevel: "high-school",
  educationMajor: "",
  workCountry: "United States",
  workState: "",
  riskComfort: 3,
  physicalActivities: null,
  activityList: [],
  tobaccoUse: null,
  disability: null,
  veteran: null,
  creditScore: 650,
  citizenship: "",
  residencyStatus: "Citizen",
  createdAt: nowISO(),
  isGuest: false,
  consentToFollowUp: false,
  derived: buildDerived(),
}

export const SAMPLE_COMPLETED_FORM: EnrollmentFormData = {
  ...DEFAULT_ENROLLMENT_FORM,
  userId: "sample-user",
  fullName: "Sujay Chava",
  preferredName: "Sujay",
  age: 32,
  maritalStatus: "married",
  dependents: 1,
  employmentStartDate: "2021-05-01",
  educationLevel: "master",
  educationMajor: "Finance",
  workState: "PA",
  riskComfort: 4,
  physicalActivities: true,
  activityList: ["hiking", "gym"],
  tobaccoUse: false,
  disability: false,
  veteran: false,
  creditScore: 720,
  citizenship: "United States",
  residencyStatus: "Citizen",
  consentToFollowUp: true,
  derived: buildDerived({ riskFactorScore: 52, activityRiskModifier: 4 }),
}

export const FORM_STORAGE_KEY = "lifelens-form-cache"
export const INSIGHTS_STORAGE_KEY = "lifelens-insights-cache"
export const MOMENTS_STORAGE_KEY = "lifelens-moments-cache"
export const CHAT_STORAGE_KEY = "lifelens-chat-cache"
export const PROFILE_CREATED_KEY = "lifelens-profile-created"
