"use client"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { ArrowRight, Calendar, TrendingUp, AlertCircle, CheckCircle2, Share2, Save } from "lucide-react"

interface InsightsDashboardProps {
  insights: any
  onViewTimeline: () => void
  onBack: () => void
}

export function InsightsDashboard({ insights, onViewTimeline, onBack }: InsightsDashboardProps) {
  const categoryIcons: Record<string, string> = {
    career: "💼",
    family: "👨‍👩‍👧",
    home: "🏠",
    health: "🏥",
    education: "🎓",
  }

  const categoryColors: Record<string, string> = {
    career: "from-blue-500/20 to-blue-600/20 border-blue-500/30",
    family: "from-green-500/20 to-green-600/20 border-green-500/30",
    home: "from-amber-500/20 to-amber-600/20 border-amber-500/30",
    health: "from-rose-500/20 to-rose-600/20 border-rose-500/30",
    education: "from-purple-500/20 to-purple-600/20 border-purple-500/30",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
      <div className="container max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <Button variant="ghost" onClick={onBack} className="mb-4">
              ← Back
            </Button>
            <div className="flex items-center gap-3 mb-2">
              <span className="text-4xl">{categoryIcons[insights.category]}</span>
              <h1 className="text-3xl md:text-4xl font-bold">Your Personalized Insights</h1>
            </div>
            <p className="text-muted-foreground">Based on your {insights.category} milestone</p>
          </div>

          <div className="flex gap-2">
            <Button variant="outline" size="sm" className="glass bg-transparent">
              <Save className="w-4 h-4 mr-2" />
              Save
            </Button>
            <Button variant="outline" size="sm" className="glass bg-transparent">
              <Share2 className="w-4 h-4 mr-2" />
              Share
            </Button>
          </div>
        </div>

        {/* Main content grid */}
        <div className="grid gap-6 mb-8">
          {/* Benefits Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <CheckCircle2 className="w-6 h-6 text-primary" />
              Recommended Benefits
            </h2>

            <div className="grid md:grid-cols-3 gap-4">
              {insights.benefits.map((benefit: any, index: number) => (
                <Card
                  key={index}
                  className={`glass-strong p-6 border-2 ${
                    benefit.priority === "high"
                      ? "border-primary/50 bg-gradient-to-br from-primary/5 to-primary/10"
                      : "border-border/50"
                  }`}
                >
                  {benefit.priority === "high" && (
                    <div className="inline-flex items-center gap-1 px-2 py-1 bg-primary/20 text-primary text-xs font-semibold rounded-full mb-3">
                      <AlertCircle className="w-3 h-3" />
                      High Priority
                    </div>
                  )}

                  <h3 className="text-lg font-bold mb-2">{benefit.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{benefit.description}</p>

                  <Button size="sm" variant={benefit.priority === "high" ? "default" : "outline"} className="w-full">
                    {benefit.action}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </Card>
              ))}
            </div>
          </section>

          {/* Financial Tips Section */}
          <section>
            <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-accent" />
              Financial Tips
            </h2>

            <div className="grid md:grid-cols-2 gap-4">
              {insights.financialTips.map((tip: any, index: number) => (
                <Card key={index} className="glass-strong p-6 border border-border/50">
                  <div className="flex items-start gap-4">
                    <div className="text-3xl">{tip.icon}</div>
                    <div className="flex-1">
                      <h3 className="font-bold mb-1">{tip.title}</h3>
                      <p className="text-sm text-muted-foreground leading-relaxed">{tip.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>
          </section>

          {/* Timeline Preview */}
          <section>
            <div className="glass-strong rounded-2xl p-8 border border-border/50">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-2xl font-bold flex items-center gap-2 mb-2">
                    <Calendar className="w-6 h-6 text-primary" />
                    Your Action Timeline
                  </h2>
                  <p className="text-muted-foreground">{insights.timeline.length} steps to optimize your benefits</p>
                </div>

                <Button onClick={onViewTimeline} size="lg" className="bg-primary hover:bg-primary/90">
                  View Full Timeline
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>

              <div className="grid md:grid-cols-4 gap-4">
                {insights.timeline.slice(0, 4).map((item: any, index: number) => (
                  <div key={index} className="text-center">
                    <div className="glass rounded-xl p-4 mb-2">
                      <div className="text-xs font-semibold text-primary mb-2">{item.period}</div>
                      <div className="text-sm font-medium mb-1">{item.title}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={onViewTimeline}
            size="lg"
            className="bg-gradient-to-r from-primary to-accent hover:opacity-90 text-white px-8 py-6 text-lg rounded-xl shadow-lg"
          >
            Create Your Action Plan
            <ArrowRight className="w-5 h-5 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  )
}
