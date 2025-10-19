"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { BookOpen, Search, ExternalLink, TrendingUp, Shield, Heart, Home, Award, MessageCircle } from "lucide-react"

interface LearningHubProps {
  persona: string
}

export function LearningHub({ persona }: LearningHubProps) {
  const [searchQuery, setSearchQuery] = useState("")

  const personaRecommendations: Record<string, string[]> = {
    "New Professional": ["401(k) Maximization", "Understanding Life Insurance", "The 50/30/20 Budget Rule"],
    "Family Builder": ["Dependent Care Benefits", "529 College Savings", "Life Insurance for Families"],
    "Transitioning Retiree": ["Medicare Enrollment Guide", "Retirement Income Strategy", "Social Security Timing"],
    "Career Advancer": ["Advanced Retirement Planning", "Tax-Advantaged Investing", "Estate Planning Basics"],
    "Financial Stabilizer": ["Emergency Fund Essentials", "Debt Reduction Strategies", "Budget Optimization"],
  }

  const handleOpenChat = () => {
    const educationPrompt = "I'd like to learn more about my benefits and financial planning options. Can you help me understand what resources are available to me?"
    window.dispatchEvent(
      new CustomEvent("FinMate:chat:open", {
        detail: { 
          prompt: educationPrompt,
          context: { screen: "learning-hub", persona }
        }
      })
    )
  }

  const categories = [
    {
      id: "new-job",
      title: "New Job Benefits",
      icon: TrendingUp,
      color: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
      articles: [
        {
          title: "New job: benefits you might be missing",
          description: "Don't overlook these valuable perks when starting a new position",
          readTime: "6 min",
          recommended: true,
        },
        {
          title: "Understanding 401(k) match",
          description: "How to maximize free money from your employer",
          readTime: "5 min",
          recommended: true,
        },
        {
          title: "Health insurance selection guide",
          description: "Choose the right plan for your needs and budget",
          readTime: "8 min",
          recommended: false,
        },
      ],
    },
    {
      id: "family",
      title: "Family Planning",
      icon: Heart,
      color: "from-rose-500/20 to-rose-600/20 border-rose-500/30",
      articles: [
        {
          title: "Planning for maternity leave",
          description: "Financial preparation for welcoming a new baby",
          readTime: "7 min",
          recommended: true,
        },
        {
          title: "Dependent Care FSA explained",
          description: "Save thousands on childcare with pre-tax dollars",
          readTime: "5 min",
          recommended: true,
        },
        {
          title: "Life insurance for growing families",
          description: "How much coverage you really need",
          readTime: "6 min",
          recommended: false,
        },
      ],
    },
    {
      id: "retirement",
      title: "Retirement Planning",
      icon: Shield,
      color: "from-green-500/20 to-green-600/20 border-green-500/30",
      articles: [
        {
          title: "401(k) contribution strategies",
          description: "Maximize your retirement savings at every income level",
          readTime: "8 min",
          recommended: false,
        },
        {
          title: "Roth vs Traditional IRA",
          description: "Which account type is right for your situation",
          readTime: "6 min",
          recommended: false,
        },
        {
          title: "Catch-up contributions after 50",
          description: "Accelerate your retirement savings in your final working years",
          readTime: "5 min",
          recommended: false,
        },
      ],
    },
    {
      id: "savings",
      title: "Savings & Protection",
      icon: Home,
      color: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
      articles: [
        {
          title: "Emergency fund essentials",
          description: "How much to save and where to keep it",
          readTime: "5 min",
          recommended: false,
        },
        {
          title: "HSA triple tax advantage",
          description: "The most tax-efficient account you're not using",
          readTime: "7 min",
          recommended: false,
        },
        {
          title: "Disability insurance guide",
          description: "Protect your income if you can't work",
          readTime: "6 min",
          recommended: false,
        },
      ],
    },
  ]

  const filteredCategories = categories.map((cat) => ({
    ...cat,
    articles: cat.articles.filter(
      (article) =>
        searchQuery === "" ||
        article.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        article.description.toLowerCase().includes(searchQuery.toLowerCase()),
    ),
  }))

  const recommendedArticles = categories.flatMap((cat) => cat.articles.filter((article) => article.recommended))

  // Lincoln Financial Resources
  const lincolnResources = [
    {
      title: "Life Insurance Guide",
      url: "https://www.lincolnfinancial.com/public/individuals/support/customerservice/lifeinsuranceresources#startaclaim",
      description: "Comprehensive guide to life insurance options"
    },
    {
      title: "Retirement Planning Tools",
      url: "https://www.lincolnfinancial.com/public/individuals/support/customerservice/retirementplanresources#findmyplan",
      description: "Plan your retirement with expert guidance"
    },
    {
      title: "Financial Wellness Center",
      url: "https://www.lincolnfinancial.com/public/individuals/products/workplaceplan/financialwellness",
      description: "Resources to improve your financial well-being"
    },
    {
      title: "Education Planning",
      url: "https://www.lincolnfinancial.com/public/individuals/products/workplaceplan/lifeevents/understandingyouroptionsforeducationalfunding",
      description: "Save for education with 529 plans and more"
    }
  ]

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Learning Hub</h1>
              <p className="text-muted-foreground">Curated resources for your journey</p>
            </div>
          </div>

          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12"
            />
          </div>
        </div>

        {/* AI Chat Assistant Section */}
        <Card className="glass-strong p-6 border-[#A41E34]/20">
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <MessageCircle className="w-5 h-5 text-[#A41E34]" />
                <h2 className="text-xl font-bold">Ask FinMate</h2>
              </div>
              <p className="text-sm text-muted-foreground mb-4">
                Get personalized guidance about your benefits, financial planning, and more. Our AI assistant is ready to help answer your questions.
              </p>
              <Button 
                onClick={handleOpenChat}
                className="bg-[#A41E34] hover:bg-[#7F1527] text-white"
              >
                <MessageCircle className="w-4 h-4 mr-2" />
                Start Learning with AI
              </Button>
            </div>
          </div>
        </Card>

        {/* Lincoln Financial Resources */}
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Shield className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Lincoln Financial Resources</h2>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            {lincolnResources.map((resource, index) => (
              <Card key={index} className="glass p-4 hover:border-primary/30 transition-all">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <h3 className="font-bold mb-1">{resource.title}</h3>
                    <p className="text-sm text-muted-foreground mb-2">{resource.description}</p>
                    <Button 
                      variant="link" 
                      size="sm" 
                      className="h-auto p-0 text-primary"
                      onClick={() => window.open(resource.url, "_blank")}
                    >
                      Visit Resource
                      <ExternalLink className="w-3 h-3 ml-1" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Recommended for you section */}
        {searchQuery === "" && recommendedArticles.length > 0 && (
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Award className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Recommended for your situation</h2>
            </div>
            <div className="space-y-3">
              {recommendedArticles.map((article, index) => (
                <Card key={index} className="glass p-5 border-primary/20">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="font-bold">{article.title}</h3>
                        <span className="text-xs bg-primary/20 text-primary px-2 py-0.5 rounded-full font-medium">
                          For You
                        </span>
                      </div>
                      <p className="text-sm text-muted-foreground mb-3">{article.description}</p>
                      <div className="flex items-center gap-3">
                        <span className="text-xs text-muted-foreground">{article.readTime} read</span>
                        <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                          Read Article
                          <ExternalLink className="w-3 h-3 ml-1" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* All categories */}
        <div className="space-y-6">
          {filteredCategories.map((category) => {
            if (category.articles.length === 0) return null
            const Icon = category.icon

            return (
              <div key={category.id}>
                <div className="flex items-center gap-3 mb-4">
                  <div className={`rounded-xl p-2.5 bg-gradient-to-br ${category.color} border`}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <h2 className="text-xl font-bold">{category.title}</h2>
                </div>

                <div className="space-y-3">
                  {category.articles.map((article, index) => (
                    <Card key={index} className="glass p-5 hover:border-primary/30 transition-all">
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex-1">
                          <h3 className="font-bold mb-1">{article.title}</h3>
                          <p className="text-sm text-muted-foreground mb-3">{article.description}</p>
                          <div className="flex items-center gap-3">
                            <span className="text-xs text-muted-foreground">{article.readTime} read</span>
                            <Button variant="link" size="sm" className="h-auto p-0 text-primary">
                              Read Article
                              <ExternalLink className="w-3 h-3 ml-1" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    </Card>
                  ))}
                </div>
              </div>
            )
          })}
        </div>

        {filteredCategories.every((cat) => cat.articles.length === 0) && (
          <Card className="glass p-12 text-center">
            <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No articles found</h3>
            <p className="text-muted-foreground">Try a different search term</p>
          </Card>
        )}
      </div>
    </div>
  )
}
