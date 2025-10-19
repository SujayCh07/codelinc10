import { NextResponse } from "next/server"

import { fetchUserProfile, fetchUserChats, isDatabaseConfigured } from "@/lib/database"
import { buildInsights, withDerivedMetrics } from "@/lib/insights"
import { getStore } from "../_store"
import type { EnrollmentFormData, LifeLensInsights, PlanPreferenceOption } from "@/lib/types"

export const runtime = "nodejs" as const

interface GenerateInsightsRequest {
  userId: string
  useDatabase?: boolean
}

interface GenerateInsightsResponse {
  insights: LifeLensInsights
  usingPlaceholder: boolean
  dataSource: 'database' | 'memory' | 'placeholder'
}

/**
 * Convert database profile to EnrollmentFormData
 */
function dbProfileToFormData(dbProfile: any): EnrollmentFormData {
  return {
    userId: dbProfile.user_id,
    fullName: dbProfile.full_name || 'Guest User',
    preferredName: dbProfile.full_name?.split(' ')[0] || 'Guest',
    age: dbProfile.age_years || null,
    maritalStatus: (dbProfile.marital_status?.toLowerCase().replace(/_/g, '-') || 'single') as EnrollmentFormData['maritalStatus'],
    dependents: dbProfile.dependents || 0,
    employmentStartDate: dbProfile.employment_start_date || new Date().toISOString().split('T')[0],
    educationLevel: (dbProfile.education_level?.toLowerCase().replace(/_/g, '-') || 'bachelor') as EnrollmentFormData['educationLevel'],
    educationMajor: '',
    workCountry: dbProfile.work_location_country || 'United States',
    workState: dbProfile.work_location_state || '',
    workRegion: dbProfile.work_location_region || '',
    coveragePreference: (dbProfile.coverage_preference || 'self') as EnrollmentFormData['coveragePreference'],
    homeOwnership: 'rent' as EnrollmentFormData['homeOwnership'],
    incomeRange: '50-100k' as EnrollmentFormData['incomeRange'],
    healthCoverage: (dbProfile.other_medical_plan || 'employer') as EnrollmentFormData['healthCoverage'],
    spouseHasSeparateInsurance: null,
    partnerCoverageStatus: (dbProfile.partner_coverage_status || 'not-applicable') as EnrollmentFormData['partnerCoverageStatus'],
    savingsRate: 10,
    wantsSavingsSupport: true,
    riskComfort: 3,
    investsInMarkets: null,
    activityLevel: 'balanced' as EnrollmentFormData['activityLevel'],
    physicalActivities: null,
    activityList: [],
    tobaccoUse: dbProfile.tobacco_user ?? null,
    disability: dbProfile.disability_status ?? null,
    veteran: null,
    creditScore: 700,
    citizenship: dbProfile.citizenship || 'United States',
    residencyStatus: 'Citizen' as EnrollmentFormData['residencyStatus'],
    hasContinuousCoverage: dbProfile.continuous_coverage ?? null,
    hasHealthConditions: dbProfile.chronic_conditions ?? null,
    healthConditionSummary: dbProfile.chronic_condition_summary || '',
    primaryCareFrequency: (dbProfile.primary_care_frequency || 'annually') as EnrollmentFormData['primaryCareFrequency'],
    prescriptionFrequency: (dbProfile.prescription_frequency || 'occasionally') as EnrollmentFormData['prescriptionFrequency'],
    activityLevelScore: dbProfile.activity_level_score || 5,
    benefitsBudget: dbProfile.benefits_budget_percent || 10,
    planPreference: (dbProfile.plan_priority || 'balanced') as PlanPreferenceOption,
    taxPreferredAccount: (dbProfile.tax_account_type || 'hsa') as EnrollmentFormData['taxPreferredAccount'],
    anticipatesLifeChanges: dbProfile.anticipates_life_changes ?? null,
    expectedBenefitUsage: (dbProfile.benefit_usage_frequency || 'occasionally') as EnrollmentFormData['expectedBenefitUsage'],
    travelsOutOfState: dbProfile.travels_out_of_state ?? null,
    needsInternationalCoverage: dbProfile.needs_international_coverage ?? null,
    dentalVisionPreference: (dbProfile.dental_vision_preference || 'yes') as EnrollmentFormData['dentalVisionPreference'],
    contributesToRetirement: dbProfile.contributes_to_retirement ?? null,
    retirementContributionRate: dbProfile.retirement_contribution_rate || 5,
    wantsRetirementGuidance: dbProfile.wants_retirement_guidance ?? null,
    confidenceInsuranceTerms: dbProfile.confidence_with_terms || 3,
    guidancePreference: (dbProfile.guidance_preference || 'summary') as EnrollmentFormData['guidancePreference'],
    createdAt: dbProfile.created_at || new Date().toISOString(),
    isGuest: false,
    consentToFollowUp: true,
    derived: {
      riskFactorScore: 0,
      activityRiskModifier: 0,
      coverageComplexity: 'medium' as const,
    },
  }
}

/**
 * Generate placeholder insights when no real data is available
 */
function generatePlaceholderInsights(userId: string): LifeLensInsights {
  const placeholderProfile: EnrollmentFormData = {
    userId,
    fullName: 'Sample User',
    preferredName: 'Sample',
    age: 30,
    maritalStatus: 'single',
    dependents: 0,
    employmentStartDate: new Date().toISOString().split('T')[0],
    educationLevel: 'bachelor',
    educationMajor: '',
    workCountry: 'United States',
    workState: 'CA',
    workRegion: 'West',
    coveragePreference: 'self',
    homeOwnership: 'rent',
    incomeRange: '50-100k',
    healthCoverage: 'employer',
    spouseHasSeparateInsurance: null,
    partnerCoverageStatus: 'not-applicable',
    savingsRate: 10,
    wantsSavingsSupport: true,
    riskComfort: 3,
    investsInMarkets: null,
    activityLevel: 'balanced',
    physicalActivities: null,
    activityList: [],
    tobaccoUse: false,
    disability: false,
    veteran: false,
    creditScore: 700,
    citizenship: 'United States',
    residencyStatus: 'Citizen',
    hasContinuousCoverage: true,
    hasHealthConditions: false,
    healthConditionSummary: '',
    primaryCareFrequency: 'annually',
    prescriptionFrequency: 'occasionally',
    activityLevelScore: 5,
    benefitsBudget: 10,
    planPreference: 'balanced',
    taxPreferredAccount: 'hsa',
    anticipatesLifeChanges: null,
    expectedBenefitUsage: 'occasionally',
    travelsOutOfState: false,
    needsInternationalCoverage: false,
    dentalVisionPreference: 'yes',
    contributesToRetirement: true,
    retirementContributionRate: 5,
    wantsRetirementGuidance: true,
    confidenceInsuranceTerms: 3,
    guidancePreference: 'summary',
    createdAt: new Date().toISOString(),
    isGuest: true,
    consentToFollowUp: false,
    derived: {
      riskFactorScore: 0,
      activityRiskModifier: 0,
      coverageComplexity: 'medium',
    },
  }

  return buildInsights(withDerivedMetrics(placeholderProfile))
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as GenerateInsightsRequest
    const { userId, useDatabase = true } = body

    if (!userId) {
      return NextResponse.json({ error: 'Missing userId' }, { status: 400 })
    }

    const store = getStore()
    let usingPlaceholder = false
    let dataSource: 'database' | 'memory' | 'placeholder' = 'memory'

    // Try to fetch from database if configured and requested
    if (useDatabase && isDatabaseConfigured()) {
      try {
        const profileResult = await fetchUserProfile(userId)
        const chatsResult = await fetchUserChats(userId)

        if (profileResult.data) {
          // Convert database profile to form data
          const formData = withDerivedMetrics(dbProfileToFormData(profileResult.data))
          
          // Store in memory for future reference
          store.profiles.set(userId, formData)

          // Generate insights from database data
          const insights = buildInsights(formData)
          store.insights.set(userId, insights)

          dataSource = 'database'
          return NextResponse.json({
            insights,
            usingPlaceholder: false,
            dataSource,
          } as GenerateInsightsResponse)
        }
      } catch (dbError) {
        console.warn('Database fetch failed, falling back to memory/placeholder:', dbError)
      }
    }

    // Try to use in-memory profile
    const memoryProfile = store.profiles.get(userId)
    if (memoryProfile) {
      const insights = buildInsights(memoryProfile)
      store.insights.set(userId, insights)
      
      dataSource = 'memory'
      return NextResponse.json({
        insights,
        usingPlaceholder: false,
        dataSource,
      } as GenerateInsightsResponse)
    }

    // If no data available, use placeholder
    const placeholderInsights = generatePlaceholderInsights(userId)
    usingPlaceholder = true
    dataSource = 'placeholder'

    return NextResponse.json({
      insights: placeholderInsights,
      usingPlaceholder,
      dataSource,
    } as GenerateInsightsResponse)
  } catch (error) {
    console.error('Failed to generate insights', error)
    return NextResponse.json(
      { error: 'Unable to generate insights', detail: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
