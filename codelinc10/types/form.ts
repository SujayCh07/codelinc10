export type MaritalStatus = "Single" | "Married" | "Partnered" | "Other" | ""
export type CitizenshipStatus = "US Citizen" | "Permanent Resident" | "Other" | ""
export type VeteranStatus = "None" | "Active" | "Veteran" | ""
export type EducationLevel = "HS Diploma" | "Bachelor's" | "Master's" | "Doctorate" | "Other" | ""
export type HouseholdStructure = "Alone" | "With Partner" | "With Dependents" | ""
export type CoveragePreference = "Yes" | "No" | "Not Applicable" | ""
export type HousingStatus = "Rent" | "Own" | "Other" | ""
export type BinaryChoice = "Yes" | "No" | "Not Applicable" | ""
export type EmploymentType = "Full-time" | "Part-time" | "Contractor" | ""
export type IncomeRange = "$0–50k" | "$50–100k" | "$100–150k" | "$150k+" | ""
export type RiskAversion = "Conservative" | "Moderate" | "Growth" | "Aggressive" | ""
export type SavingsRate = "<5%" | "5–10%" | "10–20%" | ">20%" | ""
export type CreditScoreRange = "<600" | "600–699" | "700–749" | "750+" | ""
export type HsaOrFsa = "HSA" | "FSA" | "Neither" | ""
export type PlanType = "Roth" | "Traditional" | "Unknown" | ""

export interface LifeLensFormData {
  fullName: string
  userEmail: string
  phoneE164: string
  dateOfBirth: string
  employmentStartDate: string
  maritalStatus: MaritalStatus
  citizenshipStatus: CitizenshipStatus
  veteranStatus: VeteranStatus
  educationLevel: EducationLevel
  major: string
  householdStructure: HouseholdStructure
  dependentCount: number | null
  spouseHasCoverage: CoveragePreference
  housingStatus: HousingStatus
  tobaccoUser: BinaryChoice
  disabilityStatus: BinaryChoice
  workLocationCountry: string
  workLocationState: string
  employmentType: EmploymentType
  incomeRange: IncomeRange
  riskAversion: RiskAversion
  emergencySavingsMonths: number | null
  debtAmount: number | null
  monthlySavingsRate: SavingsRate
  creditScoreRange: CreditScoreRange
  currentMedicalCoverage: string
  disabilityInsurance: BinaryChoice
  hsaOrFsa: HsaOrFsa
  interestInLifeInsurance: BinaryChoice
  prescriptionUse: BinaryChoice
  contributesTo401k: BinaryChoice
  contributionPercent: number | null
  planType: PlanType
  beneficiariesNamed: BinaryChoice
  retirementState: string
  additionalNotes: string
  consent: boolean
  isGuest: boolean
}

export const DEFAULT_FORM_DATA: LifeLensFormData = {
  fullName: "Alex Morgan",
  userEmail: "alex.morgan@example.com",
  phoneE164: "",
  dateOfBirth: "1989-08-14",
  employmentStartDate: "2018-05-01",
  maritalStatus: "Married",
  citizenshipStatus: "US Citizen",
  veteranStatus: "None",
  educationLevel: "Bachelor's",
  major: "Finance",
  householdStructure: "With Partner",
  dependentCount: 1,
  spouseHasCoverage: "Yes",
  housingStatus: "Own",
  tobaccoUser: "No",
  disabilityStatus: "No",
  workLocationCountry: "United States",
  workLocationState: "Pennsylvania",
  employmentType: "Full-time",
  incomeRange: "$100–150k",
  riskAversion: "Moderate",
  emergencySavingsMonths: 3,
  debtAmount: 25000,
  monthlySavingsRate: "5–10%",
  creditScoreRange: "700–749",
  currentMedicalCoverage: "Lincoln PPO Gold",
  disabilityInsurance: "Yes",
  hsaOrFsa: "HSA",
  interestInLifeInsurance: "Yes",
  prescriptionUse: "No",
  contributesTo401k: "Yes",
  contributionPercent: 8,
  planType: "Roth",
  beneficiariesNamed: "Yes",
  retirementState: "Pennsylvania",
  additionalNotes: "",
  consent: false,
  isGuest: false,
}
