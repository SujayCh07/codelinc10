"use client"

import { Card } from "@/components/ui/card"
import { Calendar, Sparkles } from "lucide-react"

interface TimelineViewProps {
  history: Array<{ profile: any; insights: any }>
}

export function TimelineView({ history }: TimelineViewProps) {
  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Your Journey</h1>
          <p className="text-muted-foreground">Track how your financial priorities have evolved over time</p>
        </div>

        {history.length === 0 ? (
          <Card className="glass p-12 text-center">
            <Calendar className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-xl font-semibold mb-2">No history yet</h3>
            <p className="text-muted-foreground">Complete your first assessment to start tracking your journey</p>
          </Card>
        ) : (
          <div className="space-y-6">
            {history.map((entry, index) => (
              <Card key={index} className="glass p-6">
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0">
                    <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
                      <Sparkles className="w-6 h-6 text-primary" />
                    </div>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-lg font-bold">{entry.profile.focusArea}</h3>
                        <p className="text-sm text-muted-foreground">
                          {new Date(entry.insights.timestamp).toLocaleDateString("en-US", {
                            month: "long",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground mb-3">
                      Life events: {entry.profile.lifeEvents.join(", ")}
                    </p>
                    <div className="text-sm">
                      <span className="font-medium">Top priority: </span>
                      {entry.insights.priorities[0]?.title}
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
