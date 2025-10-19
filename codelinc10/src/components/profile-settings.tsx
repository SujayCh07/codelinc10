"use client"

import { useState } from "react"
import { Calendar, Briefcase, FileDown, RotateCcw, Sparkles, Trash2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import type { ProfileSnapshot } from "@/lib/types"

interface ProfileSettingsProps {
  profile: ProfileSnapshot
  onClearData: () => void
  onReassess: () => void
}

export function ProfileSettings({ profile, onClearData, onReassess }: ProfileSettingsProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  const handleExportPDF = () => {
    alert("PDF export feature coming soon!")
  }

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <User className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile & Settings</h1>
              <p className="text-muted-foreground">Manage your account and preferences</p>
            </div>
          </div>
        </div>

        {/* Profile Summary */}
        <Card className="glass p-6">
          <h2 className="text-xl font-bold mb-4">Your Profile</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                {profile.name ? profile.name[0].toUpperCase() : "G"}
              </div>
              <div>
                <h3 className="font-bold text-lg">{profile.name || "Guest User"}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="w-4 h-4" />
                  <span>{profile.aiPersona}</span>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 pt-4 border-t">
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Calendar className="w-4 h-4" />
                  <span>Age Range</span>
                </div>
                <p className="font-medium">{profile.ageRange}</p>
              </div>
              <div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-1">
                  <Briefcase className="w-4 h-4" />
                  <span>Employment</span>
                </div>
                <p className="font-medium">{profile.employmentType}</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Household Size</div>
                <p className="font-medium">{profile.householdSize} people</p>
              </div>
              <div>
                <div className="text-sm text-muted-foreground mb-1">Dependents</div>
                <p className="font-medium">{profile.dependents}</p>
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">Life Events</div>
              <div className="flex flex-wrap gap-2">
                {profile.lifeEvents.map((event: string, index: number) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    {event}
                  </span>
                ))}
              </div>
            </div>

            <div className="pt-4 border-t">
              <div className="text-sm text-muted-foreground mb-2">Financial Goals</div>
              <div className="flex flex-wrap gap-2">
                {profile.goals.map((goal: string, index: number) => (
                  <span key={index} className="px-3 py-1 rounded-full bg-accent/10 text-accent text-sm font-medium">
                    {goal}
                  </span>
                ))}
              </div>
            </div>
          </div>
        </Card>

        {/* Actions */}
        <Card className="glass p-6">
          <h2 className="text-xl font-bold mb-4">Actions</h2>
          <div className="space-y-3">
            <Button
              onClick={onReassess}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 bg-transparent"
            >
              <RotateCcw className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Reset AI Recommendations</div>
                <div className="text-xs text-muted-foreground">Update your profile and get new insights</div>
              </div>
            </Button>

            <Button
              onClick={handleExportPDF}
              variant="outline"
              className="w-full justify-start gap-3 h-auto py-4 bg-transparent"
            >
              <FileDown className="w-5 h-5" />
              <div className="text-left">
                <div className="font-semibold">Export My Financial Plan (PDF)</div>
                <div className="text-xs text-muted-foreground">Download a summary of your priorities</div>
              </div>
            </Button>
          </div>
        </Card>

        {/* Privacy & Data */}
        <Card className="glass p-6">
          <h2 className="text-xl font-bold mb-4">Privacy & Data</h2>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="notifications" className="font-medium">
                  Notifications
                </Label>
                <p className="text-sm text-muted-foreground">Receive updates about your financial priorities</p>
              </div>
              <Switch id="notifications" />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="analytics" className="font-medium">
                  Usage Analytics
                </Label>
                <p className="text-sm text-muted-foreground">Help us improve LifeLens</p>
              </div>
              <Switch id="analytics" defaultChecked />
            </div>

            <div className="pt-4 border-t">
              {!showConfirm ? (
                <Button onClick={() => setShowConfirm(true)} variant="destructive" className="w-full gap-2">
                  <Trash2 className="w-4 h-4" />
                  Clear All Data
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-sm text-center text-muted-foreground">
                    Are you sure? This will delete all your data and cannot be undone.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowConfirm(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={onClearData} variant="destructive" className="flex-1">
                      Yes, Delete Everything
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        <div className="text-center text-sm text-muted-foreground">
          <p>Member since {new Date(profile.createdAt).toLocaleDateString()}</p>
        </div>
      </div>
    </div>
  )
}
