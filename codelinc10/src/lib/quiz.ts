import type {
  ActivityLevel,
  EnrollmentFormData,
  HealthCoverageOption,
  HomeOwnershipStatus,
  IncomeRange,
  MaritalStatusOption,
  ResidencyStatus,
} from "./types"

export type QuizQuestionType =
  | "number"
  | "text"
  | "select"
  | "slider"
  | "boolean"
  | "boolean-choice"
  | "multi-select"
  | "textarea"

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
  section: string
  sectionDescription?: string
  minLabel?: string
  maxLabel?: string
  helperText?: string
  valueFormatter?: (value: number) => string
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

const MARITAL_LABELS: Record<MaritalStatusOption, string> = {
  single: "Single",
  married: "Married",
  partnered: "Domestic partner",
  divorced: "Divorced",
  widowed: "Widowed",
  other: "Other",
}

export const MARITAL_OPTIONS: QuizOption[] = (Object.keys(MARITAL_LABELS) as MaritalStatusOption[]).map((value) => ({
  value,
  label: MARITAL_LABELS[value],
}))

const RESIDENCY_LABELS: Record<ResidencyStatus, string> = {
  Citizen: "Citizen",
  "Permanent Resident": "Permanent resident",
  "Work Visa": "Work visa",
  "Student Visa": "Student visa",
  Other: "Other",
}

export const RESIDENCY_OPTIONS: QuizOption[] = (Object.keys(RESIDENCY_LABELS) as ResidencyStatus[]).map((value) => ({
  value,
  label: RESIDENCY_LABELS[value],
}))

export const CITIZENSHIP_OPTIONS: QuizOption[] = [
  { label: "U.S. Citizen", value: "U.S. Citizen" },
  { label: "Dual citizen", value: "Dual citizen" },
  { label: "Permanent resident", value: "Permanent resident" },
  { label: "Work visa", value: "Work visa" },
  { label: "Other", value: "Other" },
]

export const EDUCATION_OPTIONS: QuizOption[] = [
  { label: "High school", value: "high-school" },
  { label: "Associate", value: "associate" },
  { label: "Bachelor's", value: "bachelor" },
  { label: "Master's", value: "master" },
  { label: "Doctorate", value: "doctorate" },
  { label: "Other", value: "other" },
]

export const COVERAGE_OPTIONS: QuizOption[] = [
  { label: "Just me", value: "self", helper: "Solo coverage focused on you" },
  {
    label: "Me + spouse",
    value: "self-plus-spouse",
    helper: "Coordinate partner protections",
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
  { label: "$50k – $100k", value: "50-100k" },
  { label: "$100k – $200k", value: "100-200k" },
  { label: "$200k+", value: "200k-plus" },
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

export const PARTNER_COVERAGE_OPTIONS: QuizOption[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Not applicable", value: "not-applicable" },
]

export const PRIMARY_CARE_OPTIONS: QuizOption[] = [
  { label: "Rarely", value: "rarely" },
  { label: "Annually", value: "annually" },
  { label: "Several times a year", value: "several" },
]

export const PRESCRIPTION_OPTIONS: QuizOption[] = [
  { label: "Never", value: "never" },
  { label: "Occasionally", value: "occasionally" },
  { label: "Regularly", value: "regularly" },
]

export const PLAN_PREFERENCE_OPTIONS: QuizOption[] = [
  { label: "Lower monthly premiums", value: "lower-premiums" },
  { label: "Lower deductible", value: "lower-deductible" },
  { label: "Balanced plan", value: "balanced" },
]

export const ACCOUNT_PREFERENCE_OPTIONS: QuizOption[] = [
  { label: "HSA", value: "hsa" },
  { label: "FSA", value: "fsa" },
  { label: "Both", value: "both" },
  { label: "Neither", value: "neither" },
]

export const BENEFIT_USAGE_OPTIONS: QuizOption[] = [
  { label: "Rarely", value: "rarely" },
  { label: "Occasionally", value: "occasionally" },
  { label: "Frequently", value: "frequently" },
]

export const DENTAL_VISION_OPTIONS: QuizOption[] = [
  { label: "Yes", value: "yes" },
  { label: "No", value: "no" },
  { label: "Already covered", value: "covered" },
]

export const GUIDANCE_PREFERENCE_OPTIONS: QuizOption[] = [
  { label: "Brief summaries", value: "summary" },
  { label: "Step-by-step guidance", value: "step" },
  { label: "Chat assist only", value: "chat" },
]

export function initializeQuizState(template: EnrollmentFormData): EnrollmentFormData {
  const preferredName = template.preferredName || template.fullName.split(" ")[0] || template.fullName

  const hydrated: EnrollmentFormData = {
    ...template,
    preferredName,
    activityList: Array.from(new Set(template.activityList)),
    physicalActivities:
      template.activityLevel === "active"
        ? true
        : template.activityLevel === "relaxed"
          ? false
          : template.physicalActivities,
    partnerCoverageStatus: template.partnerCoverageStatus ?? "not-applicable",
    activityLevelScore: Math.min(5, Math.max(1, template.activityLevelScore || 3)),
    benefitsBudget: Math.min(20, Math.max(0, template.benefitsBudget ?? 8)),
    retirementContributionRate: Math.min(15, Math.max(0, template.retirementContributionRate ?? 0)),
    confidenceInsuranceTerms: Math.min(5, Math.max(1, template.confidenceInsuranceTerms ?? 3)),
  }

  if (!INCOME_OPTIONS.some((option) => option.value === hydrated.incomeRange)) {
    hydrated.incomeRange = "50-100k"
  }

  if (hydrated.coveragePreference !== "self-plus-family") {
    hydrated.dependents = 0
  }

  if (hydrated.coveragePreference === "self") {
    hydrated.tobaccoUse = null
  }

  if (!(["married", "partnered"] as EnrollmentFormData["maritalStatus"][]).includes(hydrated.maritalStatus)) {
    hydrated.spouseHasSeparateInsurance = null
    hydrated.partnerCoverageStatus = "not-applicable"
  } else if (hydrated.partnerCoverageStatus === "not-applicable" && hydrated.spouseHasSeparateInsurance !== null) {
    hydrated.partnerCoverageStatus = hydrated.spouseHasSeparateInsurance ? "yes" : "no"
  }

  if ((hydrated.savingsRate ?? 0) >= 10) {
    hydrated.wantsSavingsSupport = null
  }

  if ((hydrated.riskComfort ?? 0) < 4) {
    hydrated.investsInMarkets = null
  }

  if (hydrated.activityLevel !== "active") {
    hydrated.activityList = []
  }

  if (!hydrated.hasHealthConditions) {
    hydrated.healthConditionSummary = ""
  }

  if (!hydrated.contributesToRetirement) {
    hydrated.retirementContributionRate = 0
    hydrated.wantsRetirementGuidance = null
  }

  return hydrated
}

const SECTION_ORDER: { title: string; description: string; questions: Omit<QuizQuestion, "section" | "sectionDescription">[] }[] = [
  {
    title: "Account Information",
    description: "We need your email to save your profile and allow you to log in later.",
    questions: [
      {
        id: "email",
        title: "What's your email address?",
        prompt: "This will be your username for logging in and we'll save your profile.",
        type: "text" as QuizQuestionType,
        placeholder: "you@example.com",
      },
    ],
  },
  {
    title: "Coverage & Family",
    description: "Tell us who needs protection so we size the right benefits.",
    questions: [
      {
        id: "coveragePreference",
        title: "Who should this coverage include?",
        prompt: "LifeLens adjusts priorities based on the household you select.",
        type: "select",
        options: COVERAGE_OPTIONS,
      },
      {
        id: "partnerCoverageStatus",
        title: "Does your partner have separate insurance coverage?",
        prompt: "Helps us coordinate whether you’re sharing or leading coverage.",
        type: "select",
        options: PARTNER_COVERAGE_OPTIONS,
        condition: (answers) =>
          answers.coveragePreference !== "self" || ["married", "partnered"].includes(answers.maritalStatus),
      },
      {
        id: "dependents",
        title: "How many dependents do you plan to cover?",
        prompt: "Include children or anyone you support on your plan.",
        type: "slider",
        min: 0,
        max: 10,
        step: 1,
        helperText: "Slide to match the number of people you’ll include beyond yourself.",
        condition: (answers) => answers.coveragePreference === "self-plus-family",
      },
      {
        id: "healthCoverage",
        title: "Do you currently have any other active medical plans?",
        prompt: "We’ll note existing coverage to avoid duplicate costs.",
        type: "select",
        options: HEALTH_OPTIONS,
      },
      {
        id: "hasContinuousCoverage",
        title: "Have you had continuous coverage for the past 12 months?",
        prompt: "This helps us identify any waiting periods or eligibility checks.",
        type: "boolean-choice",
      },
    ],
  },
  {
    title: "Health & Wellness Profile",
    description: "Share health routines so we can tailor support and reminders.",
    questions: [
      {
        id: "hasHealthConditions",
        title: "Do you or anyone covered have ongoing health conditions?",
        prompt: "We use this to surface relevant care programs and benefits.",
        type: "boolean-choice",
      },
      {
        id: "healthConditionSummary",
        title: "Provide a quick summary",
        prompt: "List diagnoses or care needs LifeLens should keep in mind.",
        type: "textarea",
        placeholder: "e.g., Asthma for my child, hypertension for partner",
        condition: (answers) => answers.hasHealthConditions === true,
      },
      {
        id: "primaryCareFrequency",
        title: "How often do you visit a primary-care provider?",
        prompt: "Consistency helps us plan for routine vs. specialized care.",
        type: "select",
        options: PRIMARY_CARE_OPTIONS,
      },
      {
        id: "prescriptionFrequency",
        title: "How frequently do you take prescription medications?",
        prompt: "We’ll factor in pharmacy support and potential savings.",
        type: "select",
        options: PRESCRIPTION_OPTIONS,
      },
      {
        id: "activityLevelScore",
        title: "How would you describe your overall activity level?",
        prompt: "Slide from sedentary to very active to tune wellness guidance.",
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
        minLabel: "Sedentary",
        maxLabel: "Very active",
      },
      {
        id: "tobaccoUse",
        title: "Do you or anyone in your household use tobacco products?",
        prompt: "Impacts life insurance, disability, and wellness recommendations.",
        type: "boolean-choice",
      },
    ],
  },
  {
    title: "Financial & Plan Preference",
    description: "Help us balance costs, risk, and benefit priorities.",
    questions: [
      {
        id: "incomeRange",
        title: "What’s your approximate annual household income range?",
        prompt: "Ensures we size contributions within your comfort zone.",
        type: "select",
        options: INCOME_OPTIONS,
      },
      {
        id: "benefitsBudget",
        title: "What percentage of income can go toward benefits each month?",
        prompt: "Set a benefits budget so plans stay affordable.",
        type: "slider",
        min: 0,
        max: 20,
        step: 1,
        helperText: "Most households dedicate between 5% and 12% of income.",
        valueFormatter: (value) => `${value}%`,
      },
      {
        id: "riskComfort",
        title: "How much out-of-pocket risk are you comfortable with?",
        prompt: "Slide 1 (low) to 5 (high) to set your coverage cushion.",
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
        minLabel: "Low",
        maxLabel: "High",
      },
      {
        id: "planPreference",
        title: "Which matters more to you?",
        prompt: "We’ll emphasize plans that match this priority.",
        type: "select",
        options: PLAN_PREFERENCE_OPTIONS,
      },
      {
        id: "taxPreferredAccount",
        title: "Do you have an HSA or FSA?",
        prompt: "Knowing this helps us recommend contribution strategies.",
        type: "select",
        options: ACCOUNT_PREFERENCE_OPTIONS,
      },
    ],
  },
  {
    title: "Life Stage & Usage",
    description: "Prepare for upcoming moments and how often you’ll tap benefits.",
    questions: [
      {
        id: "anticipatesLifeChanges",
        title: "Do you anticipate major life changes this year?",
        prompt: "Think about marriage, childbirth, relocation, or similar events.",
        type: "boolean-choice",
      },
      {
        id: "expectedBenefitUsage",
        title: "How often do you expect to use your healthcare benefits?",
        prompt: "This calibrates coverage vs. cost trade-offs.",
        type: "select",
        options: BENEFIT_USAGE_OPTIONS,
      },
      {
        id: "travelsOutOfState",
        title: "Do you regularly travel outside your state?",
        prompt: "We’ll ensure networks follow you wherever you go.",
        type: "boolean-choice",
      },
      {
        id: "needsInternationalCoverage",
        title: "Do you need coverage for international or out-of-network care?",
        prompt: "We’ll surface plans with global reach when needed.",
        type: "boolean-choice",
      },
      {
        id: "dentalVisionPreference",
        title: "Would dental or vision coverage be valuable to you?",
        prompt: "Let us know if these should be prioritized in your plan.",
        type: "select",
        options: DENTAL_VISION_OPTIONS,
      },
    ],
  },
  {
    title: "Retirement & Long-Term Benefits",
    description: "Optional: align retirement savings with your goals.",
    questions: [
      {
        id: "contributesToRetirement",
        title: "Are you currently contributing to a retirement plan?",
        prompt: "Includes 401(k), 403(b), IRA, or similar accounts.",
        type: "boolean-choice",
      },
      {
        id: "retirementContributionRate",
        title: "What percentage of income do you contribute?",
        prompt: "This helps LifeLens size catch-up opportunities.",
        type: "slider",
        min: 0,
        max: 15,
        step: 1,
        valueFormatter: (value) => `${value}%`,
        condition: (answers) => answers.contributesToRetirement === true,
      },
      {
        id: "wantsRetirementGuidance",
        title: "Would you like LifeLens to suggest optimized targets?",
        prompt: "We’ll share nudges tailored to your retirement goals.",
        type: "boolean-choice",
        condition: (answers) => answers.contributesToRetirement !== null,
      },
    ],
  },
  {
    title: "Plan Experience & Consent",
    description: "Choose how LifeLens supports you through enrollment.",
    questions: [
      {
        id: "confidenceInsuranceTerms",
        title: "How confident are you with insurance terms?",
        prompt: "Slide 1 (just learning) to 5 (very confident).",
        type: "slider",
        min: 1,
        max: 5,
        step: 1,
        minLabel: "Just learning",
        maxLabel: "Very confident",
      },
      {
        id: "guidancePreference",
        title: "How would you like LifeLens to guide you?",
        prompt: "Pick the coaching style that works best on mobile and desktop.",
        type: "select",
        options: GUIDANCE_PREFERENCE_OPTIONS,
      },
    ],
  },
]

export function questionsFor(data: EnrollmentFormData): QuizQuestion[] {
  return SECTION_ORDER.flatMap((section) =>
    section.questions
      .filter((question) => (question.condition ? question.condition(data) : true))
      .map((question) => ({
        ...question,
        section: section.title,
        sectionDescription: section.description,
      })),
  )
}

export function updateFormValue(
  data: EnrollmentFormData,
  id: QuizQuestion["id"],
  value: string | number | boolean | string[] | null,
): EnrollmentFormData {
  const next: EnrollmentFormData = { ...data }

  switch (id) {
    case "email":
      next.email = typeof value === "string" ? value : ""
      break
    case "age":
      if (typeof value === "number") {
        next.age = Math.max(18, Math.min(75, value))
      } else {
        next.age = value ? Math.max(18, Math.min(75, Number(value))) : null
      }
      break
    case "coveragePreference":
      next.coveragePreference = value as EnrollmentFormData["coveragePreference"]
      if (next.coveragePreference !== "self-plus-family") {
        next.dependents = 0
      }
      if (next.coveragePreference === "self") {
        next.partnerCoverageStatus = "not-applicable"
        next.spouseHasSeparateInsurance = null
      }
      break
    case "maritalStatus":
      next.maritalStatus = value as EnrollmentFormData["maritalStatus"]
      if (!(["married", "partnered"] as EnrollmentFormData["maritalStatus"][]).includes(next.maritalStatus)) {
        next.spouseHasSeparateInsurance = null
        next.partnerCoverageStatus = "not-applicable"
      }
      break
    case "residencyStatus":
      next.residencyStatus = value as EnrollmentFormData["residencyStatus"]
      break
    case "citizenship":
      next.citizenship = typeof value === "string" ? value : next.citizenship
      break
    case "educationLevel":
      next.educationLevel = value as EnrollmentFormData["educationLevel"]
      break
    case "dependents":
      if (typeof value === "number") {
        next.dependents = Math.max(0, Math.min(10, value))
      } else {
        next.dependents = value ? Math.max(0, Math.min(10, Number(value))) : 0
      }
      break
    case "partnerCoverageStatus":
      next.partnerCoverageStatus = value as EnrollmentFormData["partnerCoverageStatus"]
      if (next.partnerCoverageStatus === "not-applicable") {
        next.spouseHasSeparateInsurance = null
      } else {
        next.spouseHasSeparateInsurance = next.partnerCoverageStatus === "yes"
      }
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
      if (next.spouseHasSeparateInsurance === null) {
        next.partnerCoverageStatus = "not-applicable"
      } else {
        next.partnerCoverageStatus = next.spouseHasSeparateInsurance ? "yes" : "no"
      }
      break
    case "hasContinuousCoverage":
      next.hasContinuousCoverage = typeof value === "boolean" ? value : null
      break
    case "hasHealthConditions":
      next.hasHealthConditions = typeof value === "boolean" ? value : null
      if (!next.hasHealthConditions) {
        next.healthConditionSummary = ""
      }
      break
    case "healthConditionSummary":
      next.healthConditionSummary = typeof value === "string" ? value : ""
      break
    case "primaryCareFrequency":
      next.primaryCareFrequency = value as EnrollmentFormData["primaryCareFrequency"]
      break
    case "prescriptionFrequency":
      next.prescriptionFrequency = value as EnrollmentFormData["prescriptionFrequency"]
      break
    case "activityLevelScore":
      if (typeof value === "number") {
        const score = Math.max(1, Math.min(5, Math.round(value)))
        next.activityLevelScore = score
        if (score >= 4) {
          next.activityLevel = "active"
          next.physicalActivities = true
        } else if (score <= 2) {
          next.activityLevel = "relaxed"
          next.physicalActivities = false
        } else {
          next.activityLevel = "balanced"
          next.physicalActivities = null
        }
      }
      break
    case "savingsRate":
      if (typeof value === "number") {
        next.savingsRate = Math.max(0, Math.min(50, value))
      } else if (value) {
        next.savingsRate = Math.max(0, Math.min(50, Number(value)))
      }
      if ((next.savingsRate ?? 0) >= 10) {
        next.wantsSavingsSupport = null
      }
      break
    case "benefitsBudget":
      if (typeof value === "number") {
        next.benefitsBudget = Math.max(0, Math.min(20, Math.round(value)))
      }
      next.savingsRate = next.benefitsBudget
      break
    case "wantsSavingsSupport":
      next.wantsSavingsSupport = typeof value === "boolean" ? value : null
      break
    case "riskComfort":
      if (typeof value === "number") {
        next.riskComfort = Math.max(1, Math.min(5, value))
      } else if (value) {
        next.riskComfort = Math.max(1, Math.min(5, Number(value)))
      }
      if ((next.riskComfort ?? 0) < 4) {
        next.investsInMarkets = null
      }
      break
    case "planPreference":
      next.planPreference = value as EnrollmentFormData["planPreference"]
      break
    case "taxPreferredAccount":
      next.taxPreferredAccount = value as EnrollmentFormData["taxPreferredAccount"]
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
      next.activityList = Array.isArray(value) ? Array.from(new Set(value)) : []
      break
    case "tobaccoUse":
      next.tobaccoUse = typeof value === "boolean" ? value : null
      break
    case "anticipatesLifeChanges":
      next.anticipatesLifeChanges = typeof value === "boolean" ? value : null
      break
    case "expectedBenefitUsage":
      next.expectedBenefitUsage = value as EnrollmentFormData["expectedBenefitUsage"]
      break
    case "travelsOutOfState":
      next.travelsOutOfState = typeof value === "boolean" ? value : null
      break
    case "needsInternationalCoverage":
      next.needsInternationalCoverage = typeof value === "boolean" ? value : null
      break
    case "dentalVisionPreference":
      next.dentalVisionPreference = value as EnrollmentFormData["dentalVisionPreference"]
      break
    case "contributesToRetirement":
      next.contributesToRetirement = typeof value === "boolean" ? value : null
      if (!next.contributesToRetirement) {
        next.retirementContributionRate = 0
        next.wantsRetirementGuidance = null
      }
      break
    case "retirementContributionRate":
      if (typeof value === "number") {
        next.retirementContributionRate = Math.max(0, Math.min(15, Math.round(value)))
      }
      break
    case "wantsRetirementGuidance":
      next.wantsRetirementGuidance = typeof value === "boolean" ? value : null
      break
    case "confidenceInsuranceTerms":
      if (typeof value === "number") {
        next.confidenceInsuranceTerms = Math.max(1, Math.min(5, Math.round(value)))
      }
      break
    case "guidancePreference":
      next.guidancePreference = value as EnrollmentFormData["guidancePreference"]
      break
    case "creditScore":
      next.creditScore = typeof value === "number" ? value : value ? Number(value) : next.creditScore
      break
    default:
      break
  }

  return next
}
