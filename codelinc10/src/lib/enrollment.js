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
  fullName: "Sujay Chava",
  preferredName: "Sujay",
  age: null,
  maritalStatus: "single",
  dependents: 0,
  employmentStartDate: "2023-08-01",
  educationLevel: "bachelor",
  educationMajor: "",
  workCountry: "USA",
  workState: "Georgia",
  workRegion: "Southeast",
  coveragePreference: "self",
  homeOwnership: "rent",
  incomeRange: "80-120k",
  healthCoverage: "employer",
  spouseHasSeparateInsurance: null,
  savingsRate: 12,
  wantsSavingsSupport: null,
  riskComfort: 3,
  investsInMarkets: null,
  activityLevel: "balanced",
  physicalActivities: null,
  activityList: [],
  tobaccoUse: null,
  disability: false,
  veteran: false,
  creditScore: 680,
  citizenship: "U.S. Citizen",
  residencyStatus: "Citizen",
  createdAt: nowISO(),
  isGuest: false,
  consentToFollowUp: false,
  derived: buildDerived(),
}

export const SAMPLE_COMPLETED_FORM: EnrollmentFormData = {
  ...DEFAULT_ENROLLMENT_FORM,
  userId: "sample-user",
  age: 32,
  maritalStatus: "partnered",
  dependents: 1,
  employmentStartDate: "2021-05-01",
  educationLevel: "master",
  educationMajor: "Finance",
  workCountry: "USA",
  workState: "Pennsylvania",
  workRegion: "Northeast",
  coveragePreference: "self-plus-family",
  homeOwnership: "own",
  incomeRange: "120-160k",
  healthCoverage: "partner",
  spouseHasSeparateInsurance: true,
  savingsRate: 18,
  wantsSavingsSupport: false,
  riskComfort: 4,
  investsInMarkets: true,
  activityLevel: "active",
  physicalActivities: true,
  activityList: ["hiking", "gym"],
  tobaccoUse: false,
  disability: false,
  veteran: false,
  creditScore: 720,
  consentToFollowUp: true,
  derived: buildDerived({ riskFactorScore: 52, activityRiskModifier: 4 }),
}

export const FORM_STORAGE_KEY = "lifelens-form-cache"
export const INSIGHTS_STORAGE_KEY = "lifelens-insights-cache"
export const MOMENTS_STORAGE_KEY = "lifelens-moments-cache"
export const CHAT_STORAGE_KEY = "lifelens-chat-cache"
export const PROFILE_CREATED_KEY = "lifelens-profile-created"
