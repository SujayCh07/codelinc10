"use client"

import { useState, useEffect } from "react"
import { LandingScreen } from "@/components/landing-screen"
import { EnrollmentForm } from "@/components/enrollment-form"
import { PersonalizedDashboard } from "@/components/personalized-dashboard"
import { TimelineView } from "@/components/timeline-view"
import { LearningHub } from "@/components/learning-hub"
import { ProfileSettings } from "@/components/profile-settings"
import { AboutFaq } from "@/components/about-faq"
import { BottomNav } from "@/components/bottom-nav"

type Screen = "landing" | "enrollment" | "dashboard" | "timeline" | "learning" | "profile" | "about"

interface UserProfile {
  name: string
  ageRange: string
  employmentType: string
  householdSize: number
  dependents: number
  financialConfidence: number
  stressLevel: number
  lifeEvents: string[]
  lifeDescription: string
  aiPersona: string
  goals: string[]
  isGuest: boolean
  createdAt: string
}

interface InsightData {
  priorities: Array<{
    title: string
    description: string
    priority: "high" | "medium" | "low"
    action: string
    category: string
  }>
  aiInsight: string
  timestamp: string
}

export default function Home() {
  const [currentScreen, setCurrentScreen] = useState<Screen>("landing")
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [insights, setInsights] = useState<InsightData | null>(null)
  const [history, setHistory] = useState<Array<{ profile: UserProfile; insights: InsightData }>>([])

  useEffect(() => {
    const savedProfile = localStorage.getItem("lifelens-profile")
    const savedInsights = localStorage.getItem("lifelens-insights")
    const savedHistory = localStorage.getItem("lifelens-history")

    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile))
      setCurrentScreen("dashboard")
    }
    if (savedInsights) {
      setInsights(JSON.parse(savedInsights))
    }
    if (savedHistory) {
      setHistory(JSON.parse(savedHistory))
    }
  }, [])

  const handleStart = (asGuest: boolean) => {
    setCurrentScreen("enrollment")
  }

  const handleEnrollmentComplete = async (profile: UserProfile) => {
    await new Promise((resolve) => setTimeout(resolve, 2500))

    const generatedInsights = generateInsights(profile)

    setUserProfile(profile)
    setInsights(generatedInsights)

    localStorage.setItem("lifelens-profile", JSON.stringify(profile))
    localStorage.setItem("lifelens-insights", JSON.stringify(generatedInsights))

    const newHistory = [...history, { profile, insights: generatedInsights }]
    setHistory(newHistory)
    localStorage.setItem("lifelens-history", JSON.stringify(newHistory))

    setCurrentScreen("dashboard")
  }

  const handleReassess = () => {
    setCurrentScreen("enrollment")
  }

  const handleClearData = () => {
    localStorage.removeItem("lifelens-profile")
    localStorage.removeItem("lifelens-insights")
    localStorage.removeItem("lifelens-history")
    setUserProfile(null)
    setInsights(null)
    setHistory([])
    setCurrentScreen("landing")
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-[#A41E34]/5 via-background to-[#FF4F00]/5">
      {currentScreen === "landing" && <LandingScreen onStart={handleStart} />}

      {currentScreen === "enrollment" && (
        <EnrollmentForm onComplete={handleEnrollmentComplete} existingProfile={userProfile} />
      )}

      {currentScreen === "dashboard" && userProfile && insights && (
        <PersonalizedDashboard profile={userProfile} insights={insights} onReassess={handleReassess} />
      )}

      {currentScreen === "timeline" && <TimelineView history={history} />}

      {currentScreen === "learning" && userProfile && <LearningHub persona={userProfile.aiPersona} />}

      {currentScreen === "profile" && userProfile && (
        <ProfileSettings profile={userProfile} onClearData={handleClearData} onReassess={handleReassess} />
      )}

      {currentScreen === "about" && <AboutFaq />}

      {currentScreen !== "landing" && currentScreen !== "enrollment" && (
        <BottomNav currentScreen={currentScreen} onNavigate={setCurrentScreen} />
      )}
    </main>
  )
}

function generateInsights(profile: UserProfile): InsightData {
  const priorities: InsightData["priorities"] = []

  if (profile.lifeEvents.includes("New job")) {
    priorities.push({
      title: "Enroll in employer health benefits",
      description:
        "You mentioned starting a new job. Choosing benefits early avoids coverage gaps and maximizes your employer contributions.",
      priority: "high",
      action: "Review Benefits",
      category: "health",
    })
    priorities.push({
      title: "Maximize 401(k) employer match",
      description: "Don't leave free money on the table. Contribute at least enough to get the full employer match.",
      priority: "high",
      action: "Set Up 401(k)",
      category: "retirement",
    })
  }

  if (profile.lifeEvents.includes("Marriage") || profile.lifeEvents.includes("Baby")) {
    priorities.push({
      title: "Update life insurance coverage",
      description:
        "Your growing family needs adequate protection. Consider increasing your coverage to 10x your annual income.",
      priority: "high",
      action: "Get Quote",
      category: "insurance",
    })
    priorities.push({
      title: "Update beneficiaries on all accounts",
      description:
        "Ensure your retirement accounts, insurance policies, and bank accounts reflect your current family structure.",
      priority: "high",
      action: "Update Now",
      category: "planning",
    })
  }

  if (profile.lifeEvents.includes("Baby")) {
    priorities.push({
      title: "Open a Dependent Care FSA",
      description: "Save on childcare costs with pre-tax dollars. You can contribute up to $5,000 per year.",
      priority: "high",
      action: "Enroll Now",
      category: "savings",
    })
    priorities.push({
      title: "Start a 529 college savings plan",
      description: "The earlier you start, the more time your money has to grow tax-free for education expenses.",
      priority: "medium",
      action: "Open Account",
      category: "education",
    })
  }

  if (profile.lifeEvents.includes("Relocation")) {
    priorities.push({
      title: "Review homeowners/renters insurance",
      description:
        "Moving to a new area? Your insurance needs may have changed based on local risks and property values.",
      priority: "high",
      action: "Get Quote",
      category: "insurance",
    })
  }

  if (profile.lifeEvents.includes("Retirement")) {
    priorities.push({
      title: "Review Medicare enrollment timeline",
      description: "Missing your enrollment window can result in penalties. Plan ahead for Parts A, B, and D.",
      priority: "high",
      action: "Learn More",
      category: "health",
    })
    priorities.push({
      title: "Create a retirement income strategy",
      description: "Determine the optimal order to withdraw from different accounts to minimize taxes.",
      priority: "high",
      action: "Get Help",
      category: "retirement",
    })
  }

  if (profile.lifeEvents.includes("Illness")) {
    priorities.push({
      title: "Review disability insurance coverage",
      description: "Protect your income if you're unable to work. Most people need 60-70% income replacement.",
      priority: "high",
      action: "Check Coverage",
      category: "insurance",
    })
    priorities.push({
      title: "Maximize HSA contributions",
      description: "Health Savings Accounts offer triple tax advantages and can help cover medical expenses.",
      priority: "medium",
      action: "Contribute More",
      category: "health",
    })
  }

  if (profile.goals.includes("Lower monthly expenses")) {
    priorities.push({
      title: "Build an emergency fund",
      description: "Start with $1,000, then work toward 3-6 months of expenses to avoid high-interest debt.",
      priority: "medium",
      action: "Start Saving",
      category: "savings",
    })
  }

  if (profile.goals.includes("Maximize employer benefits")) {
    priorities.push({
      title: "Review all available benefits",
      description:
        "Many employees miss out on valuable perks like tuition reimbursement, wellness programs, and commuter benefits.",
      priority: "medium",
      action: "Explore Benefits",
      category: "benefits",
    })
  }

  if (priorities.length < 3) {
    priorities.push({
      title: "Create a comprehensive financial plan",
      description: "A holistic view of your finances helps you make better decisions and reach your goals faster.",
      priority: "medium",
      action: "Get Started",
      category: "planning",
    })
  }

  const aiInsight = generateAIInsight(profile)

  return {
    priorities: priorities.slice(0, 5),
    aiInsight,
    timestamp: new Date().toISOString(),
  }
}

function generateAIInsight(profile: UserProfile): string {
  const insights = {
    "New Professional":
      "You're in a growth phase. Most people in your profile prioritize building emergency savings and maximizing employer benefits. Focus on establishing strong financial habits now.",
    "Family Builder":
      "Your family is growing, and so are your financial responsibilities. Prioritize protection (insurance) and tax-advantaged savings (FSA, 529) to secure your family's future.",
    "Transitioning Retiree":
      "You're entering a new chapter. Focus on healthcare planning, income strategies, and ensuring your assets are protected and properly allocated.",
    "Career Advancer":
      "You're making progress in your career. Now is the time to increase retirement contributions and consider additional insurance coverage as your income grows.",
    "Financial Stabilizer":
      "You're working to build stability. Focus on reducing high-interest debt, building emergency savings, and taking full advantage of employer benefits.",
  }

  return insights[profile.aiPersona as keyof typeof insights] || insights["New Professional"]
}
