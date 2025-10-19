"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { AlertCircle, TrendingUp, Shield, Heart, GraduationCap, Home, Sparkles } from "lucide-react"

interface PersonalizedDashboardProps {
  profile: any
  insights: any
  onReassess: () => void
}

export function PersonalizedDashboard({ profile, insights, onReassess }: PersonalizedDashboardProps) {
  const priorityIcons: Record<string, any> = {
    health: Heart,
    retirement: TrendingUp,
    insurance: Shield,
    education: GraduationCap,
    savings: Home,
    benefits: Sparkles,
    planning: AlertCircle,
  }

  const priorityColors: Record<string, string> = {
    high: "border-l-4 border-l-destructive bg-destructive/5",
    medium: "border-l-4 border-l-accent bg-accent/5",
    low: "border-l-4 border-l-muted-foreground bg-muted/5",
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Welcome banner */}
        <div className="glass-strong rounded-2xl p-6 shadow-lg">
          <h1 className="text-3xl font-bold mb-2">Welcome{profile.name && `, ${profile.name}`}</h1>
          <p className="text-muted-foreground">Here's what matters most for you right now.</p>
          <div className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium">
            <Sparkles className="w-4 h-4" />
            {profile.focusArea}
          </div>
        </div>

        {/* AI Insight */}
        <Card className="glass p-6 border-primary/20">
          <div className="flex gap-3">
            <div className="flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <Sparkles className="w-5 h-5 text-primary" />
              </div>
            </div>
            <div>
              <h3 className="font-semibold mb-1">AI Insight</h3>
              <p className="text-sm text-muted-foreground">{insights.aiInsight}</p>
            </div>
          </div>
        </Card>

        {/* Priority Cards */}
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Your Priorities</h2>

          {insights.priorities.map((priority: any, index: number) => {
            const Icon = priorityIcons[priority.category] || AlertCircle

            return (
              <Card key={index} className={`glass p-6 ${priorityColors[priority.priority]}`}>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Icon className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h3 className="text-xl font-bold">{priority.title}</h3>
                      <span
                        className={`text-xs font-semibold px-2 py-1 rounded-full ${
                          priority.priority === "high"
                            ? "bg-destructive/20 text-destructive"
                            : priority.priority === "medium"
                              ? "bg-accent/20 text-accent"
                              : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {priority.priority.toUpperCase()}
                      </span>
                    </div>
                    <p className="text-muted-foreground mb-4">{priority.description}</p>
                    <Button size="sm" variant="outline">
                      {priority.action}
                    </Button>
                  </div>
                </div>
              </Card>
            )
          })}
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button onClick={onReassess} variant="outline" className="flex-1 bg-transparent">
            Reassess My Situation
          </Button>
          <Button className="flex-1 bg-primary">Chat with FinMate AI</Button>
        </div>
      </div>
    </div>
  )
}
