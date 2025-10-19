import { BedrockRuntimeClient, InvokeModelCommand } from "@aws-sdk/client-bedrock-runtime"
import type { EnrollmentFormData, LifeLensInsights } from "./types"

const client = new BedrockRuntimeClient({
  region: process.env.BEDROCK_REGION || "us-east-1",
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY || "",
  },
})

const MODEL_ID = process.env.BEDROCK_MODEL_ID || "anthropic.claude-3-sonnet-20240229-v1:0"

interface ClaudeMessage {
  role: "user" | "assistant"
  content: string
}

interface ClaudeRequest {
  anthropic_version: string
  max_tokens: number
  messages: ClaudeMessage[]
  temperature?: number
}

interface ClaudeResponse {
  content: Array<{ type: string; text: string }>
  stop_reason: string
}

/**
 * Generate personalized insights using Amazon Bedrock Claude AI
 */
export async function generateInsightsWithClaude(
  profile: EnrollmentFormData
): Promise<Partial<LifeLensInsights>> {
  try {
    const prompt = buildInsightsPrompt(profile)

    const request: ClaudeRequest = {
      anthropic_version: "bedrock-2023-05-31",
      max_tokens: 4000,
      temperature: 0.7,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    }

    const command = new InvokeModelCommand({
      modelId: MODEL_ID,
      contentType: "application/json",
      accept: "application/json",
      body: JSON.stringify(request),
    })

    const response = await client.send(command)
    const responseBody = JSON.parse(new TextDecoder().decode(response.body)) as ClaudeResponse

    if (responseBody.content && responseBody.content.length > 0) {
      const insightsText = responseBody.content[0].text
      return parseInsightsFromClaude(insightsText, profile)
    }

    throw new Error("No response from Claude")
  } catch (error) {
    console.error("Error generating insights with Claude:", error)
    // Return a fallback empty insights object
    return {}
  }
}

/**
 * Build the prompt for Claude to generate insights
 */
function buildInsightsPrompt(profile: EnrollmentFormData): string {
  return `You are a financial benefits advisor. Based on the following user profile, generate personalized financial and benefits insights.

User Profile:
- Name: ${profile.fullName}
- Age: ${profile.age || "Not specified"}
- Marital Status: ${profile.maritalStatus}
- Dependents: ${profile.dependents}
- Employment Start Date: ${profile.employmentStartDate}
- Education Level: ${profile.educationLevel}
- Work Location: ${profile.workState}, ${profile.workCountry}
- Coverage Preference: ${profile.coveragePreference}
- Income Range: ${profile.incomeRange}
- Health Coverage: ${profile.healthCoverage}
- Risk Comfort Level: ${profile.riskComfort}/5
- Has Health Conditions: ${profile.hasHealthConditions ? "Yes" : "No"}
${profile.healthConditionSummary ? `- Health Conditions: ${profile.healthConditionSummary}` : ""}
- Primary Care Frequency: ${profile.primaryCareFrequency}
- Prescription Frequency: ${profile.prescriptionFrequency}
- Plan Preference: ${profile.planPreference}
- Tax Account Preference: ${profile.taxPreferredAccount}
- Contributes to Retirement: ${profile.contributesToRetirement ? "Yes" : "No"}
- Retirement Contribution Rate: ${profile.retirementContributionRate}%

Please provide:
1. A personalized focus goal (one sentence)
2. A brief statement about their financial situation (2-3 sentences)
3. A goal theme that describes their life stage or priority (e.g., "New Professional", "Growing Family", "Mid-Career", "Pre-Retirement")
4. Three priority benefits they should focus on, each with:
   - Title
   - Category (coverage, savings, health, wellness, or planning)
   - Description
   - Why it matters for them
   - Urgency level (Now, Next 30 days, or This quarter)

Format your response as JSON with this structure:
{
  "focusGoal": "string",
  "statement": "string",
  "goalTheme": "string",
  "priorityBenefits": [
    {
      "title": "string",
      "category": "coverage|savings|health|wellness|planning",
      "description": "string",
      "whyItMatters": "string",
      "urgency": "Now|Next 30 days|This quarter"
    }
  ]
}`
}

/**
 * Parse insights from Claude's response
 */
function parseInsightsFromClaude(
  responseText: string,
  profile: EnrollmentFormData
): Partial<LifeLensInsights> {
  try {
    // Try to extract JSON from the response
    const jsonMatch = responseText.match(/\{[\s\S]*\}/)
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0])
      
      // Transform to our insights format
      const insights: Partial<LifeLensInsights> = {
        ownerName: profile.preferredName || profile.fullName,
        focusGoal: parsed.focusGoal || "Building a secure financial future",
        statement: parsed.statement || "Let's work together to optimize your benefits.",
        goalTheme: parsed.goalTheme || "Financial Planning",
        priorityBenefits: (parsed.priorityBenefits || []).map((benefit: unknown, index: number) => ({
          id: `benefit-${index + 1}`,
          title: (benefit as { title?: string }).title || "Priority Benefit",
          category: (benefit as { category?: string }).category || "planning",
          description: (benefit as { description?: string }).description || "",
          whyItMatters: (benefit as { whyItMatters?: string }).whyItMatters || "",
          urgency: (benefit as { urgency?: string }).urgency || "Now",
          actions: [],
        })),
      }
      
      return insights
    }
  } catch (error) {
    console.error("Error parsing Claude response:", error)
  }

  // Return minimal insights if parsing fails
  return {
    ownerName: profile.preferredName || profile.fullName,
    focusGoal: "Building a secure financial future",
    statement: "Let's work together to optimize your benefits and plan for the future.",
    goalTheme: "Financial Planning",
  }
}
