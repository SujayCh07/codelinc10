"use client"

import { useState } from "react"
import { formatDistanceToNow } from "date-fns"
import { Calendar, CheckCircle2, Circle, Clock } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import type { LifeLensInsights, SavedMoment } from "@/lib/types"

interface TimelineScreenProps {
  savedInsights: SavedMoment[]
  onBack: () => void
  onSelectInsight: (insight: LifeLensInsights) => void
}

export function TimelineScreen({ savedInsights, onBack, onSelectInsight }: TimelineScreenProps) {
  const [selectedInsightIndex, setSelectedInsightIndex] = useState<number | null>(
    savedInsights.length > 0 ? savedInsights.length - 1 : null,
  )
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set())

  const currentInsight = selectedInsightIndex !== null ? savedInsights[selectedInsightIndex] : null
  const timeline = currentInsight?.timeline || []

  const toggleStep = (index: number) => {
    const newCompleted = new Set(completedSteps)
    if (newCompleted.has(index)) {
      newCompleted.delete(index)
    } else {
      newCompleted.add(index)
    }
    setCompletedSteps(newCompleted)
  }

  const progress = timeline.length > 0 ? (completedSteps.size / timeline.length) * 100 : 0

  const categoryIcons: Record<string, string> = {
    career: "💼",
    family: "👨‍👩‍👧",
    home: "🏠",
    health: "🏥",
    education: "🎓",
    savings: "💰",
    protection: "🛡️",
    retirement: "📈",
    foundation: "🧭",
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-4">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="glass rounded-full p-3">
              <Calendar className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Your History</h1>
              <p className="text-sm text-muted-foreground">{savedInsights.length} life moments analyzed</p>
            </div>
          </div>
        </div>

        {savedInsights.length === 0 ? (
          <div className="glass-strong rounded-3xl p-12 text-center border border-border/50">
            <div className="text-6xl mb-4">📋</div>
            <h3 className="text-xl font-bold mb-2">No History Yet</h3>
            <p className="text-muted-foreground mb-6">Start by sharing a life moment to get personalized insights</p>
            <Button onClick={onBack} className="bg-primary">
              Get Started
            </Button>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <p className="text-sm font-medium mb-3 text-muted-foreground">Your Life Moments</p>
              <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
                {savedInsights.map((moment, index) => (
                  <button
                    key={index}
                    onClick={() => {
                      setSelectedInsightIndex(index)
                      setCompletedSteps(new Set())
                    }}
                    className={`flex-shrink-0 w-72 glass-strong rounded-2xl p-4 text-left transition-all touch-manipulation border-2 ${
                      selectedInsightIndex === index
                        ? "border-primary/50 bg-primary/5 scale-105"
                        : "border-border/50 hover:border-primary/30"
                    }`}
                  >
                    <div className="flex items-start gap-3 mb-3">
                      <span className="text-2xl">{categoryIcons[moment.category] ?? "🧭"}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {formatDistanceToNow(new Date(moment.timestamp), { addSuffix: true })}
                        </div>
                        <p className="text-sm font-medium line-clamp-2 leading-snug">{moment.summary}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div className="h-full bg-primary" style={{ width: "0%" }} />
                      </div>
                      <span className="text-xs text-muted-foreground">{moment.timeline.length} steps</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {currentInsight && (
              <>
                <div className="glass-strong rounded-2xl p-6 border border-border/50 mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Your Progress</span>
                    <span className="text-sm font-bold text-primary">
                      {completedSteps.size} of {timeline.length}
                    </span>
                  </div>
                  <div className="h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-accent transition-all duration-500 ease-out"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                  <div className="mt-4 flex flex-wrap items-center justify-between gap-3 text-sm text-muted-foreground">
                    <span>Viewing: {currentInsight.summary}</span>
                    <Button
                      size="sm"
                      variant="outline"
                      className="touch-manipulation"
                      onClick={() => onSelectInsight(currentInsight.insight)}
                    >
                      View full plan
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  {timeline.map((item, index) => {
                    const isCompleted = completedSteps.has(index)

                    return (
                      <Card
                        key={index}
                        className={`glass-strong p-5 border-2 transition-all touch-manipulation ${
                          isCompleted
                            ? "border-primary/50 bg-primary/5"
                            : "border-border/50 hover:border-primary/30 active:scale-98"
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <button
                            onClick={() => toggleStep(index)}
                            className="flex-shrink-0 w-10 h-10 rounded-full glass-strong border-2 border-primary flex items-center justify-center touch-manipulation active:scale-95 transition-transform"
                          >
                            {isCompleted ? (
                              <CheckCircle2 className="w-5 h-5 text-primary" />
                            ) : (
                              <Circle className="w-5 h-5 text-muted-foreground" />
                            )}
                          </button>

                          <div className="flex-1 min-w-0">
                            <div className="inline-block px-2.5 py-1 bg-primary/10 text-primary text-xs font-semibold rounded-full mb-2">
                              {item.period}
                            </div>

                            <h3
                              className={`text-base font-bold mb-1 ${
                                isCompleted ? "line-through text-muted-foreground" : ""
                              }`}
                            >
                              {item.title}
                            </h3>

                            <p className="text-sm text-muted-foreground leading-relaxed">{item.description}</p>
                          </div>

                          <Button
                            onClick={() => toggleStep(index)}
                            variant={isCompleted ? "outline" : "default"}
                            size="sm"
                            className="flex-shrink-0 touch-manipulation"
                          >
                            {isCompleted ? "Undo" : "Done"}
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>

                {completedSteps.size === timeline.length && timeline.length > 0 && (
                  <Card className="glass-strong mt-6 p-8 border-2 border-primary/50 bg-gradient-to-br from-primary/10 to-accent/10 text-center animate-scale-in">
                    <div className="text-5xl mb-3">🎉</div>
                    <h3 className="text-xl font-bold mb-2">Amazing Progress!</h3>
                    <p className="text-sm text-muted-foreground">
                      You've completed all steps for this life moment. Keep building your financial future!
                    </p>
                  </Card>
                )}
              </>
            )}
          </>
        )}
      </div>
    </div>
  )
}
