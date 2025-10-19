"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Settings, Bell, Moon, Trash2, LogOut, Shield } from "lucide-react"

interface SettingsScreenProps {
  profile: {
    name: string
    age: number
    isGuest: boolean
    preferences: {
      notifications: boolean
      darkMode: boolean
    }
  }
  onUpdatePreferences: (preferences: any) => void
  onClearHistory: () => void
  onBack: () => void
}

export function SettingsScreen({ profile, onUpdatePreferences, onClearHistory, onBack }: SettingsScreenProps) {
  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-4">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="glass rounded-full p-3">
              <Settings className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">Settings</h1>
              <p className="text-sm text-muted-foreground">Manage your preferences</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-strong p-6 border border-border/50">
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-primary to-accent flex items-center justify-center text-white text-2xl font-bold">
                {profile.name.charAt(0).toUpperCase()}
              </div>
              <div>
                <h2 className="text-xl font-bold">{profile.name}</h2>
                <p className="text-sm text-muted-foreground">{profile.isGuest ? "Guest Account" : "Registered User"}</p>
              </div>
            </div>
            {profile.isGuest && (
              <div className="glass rounded-xl p-4 border border-primary/30 bg-primary/5">
                <p className="text-sm text-muted-foreground mb-3">
                  Sign up to sync your data across devices and unlock additional features
                </p>
                <Button size="sm" className="w-full sm:w-auto">
                  Create Account
                </Button>
              </div>
            )}
          </Card>

          <div>
            <h2 className="text-lg font-bold mb-3">Preferences</h2>
            <Card className="glass-strong border border-border/50 divide-y divide-border/50">
              <div className="p-5 flex items-center justify-between touch-manipulation">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Bell className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Notifications</h3>
                    <p className="text-sm text-muted-foreground">Receive benefit reminders</p>
                  </div>
                </div>
                <Switch
                  checked={profile.preferences.notifications}
                  onCheckedChange={(checked) => onUpdatePreferences({ notifications: checked })}
                />
              </div>

              <div className="p-5 flex items-center justify-between touch-manipulation">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Moon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-medium">Dark Mode</h3>
                    <p className="text-sm text-muted-foreground">Toggle dark theme</p>
                  </div>
                </div>
                <Switch
                  checked={profile.preferences.darkMode}
                  onCheckedChange={(checked) => onUpdatePreferences({ darkMode: checked })}
                />
              </div>
            </Card>
          </div>

          <div>
            <h2 className="text-lg font-bold mb-3">Data & Privacy</h2>
            <Card className="glass-strong border border-border/50 divide-y divide-border/50">
              <div className="p-5">
                <div className="flex items-center gap-3 mb-2">
                  <Shield className="w-5 h-5 text-primary" />
                  <h3 className="font-medium">Your Data is Secure</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  We use industry-standard encryption and never share your personal information with third parties.
                </p>
              </div>

              <button
                onClick={() => {
                  if (confirm("Are you sure you want to clear all your history? This cannot be undone.")) {
                    onClearHistory()
                  }
                }}
                className="p-5 flex items-center gap-3 w-full text-left hover:bg-destructive/5 transition-colors touch-manipulation"
              >
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <Trash2 className="w-5 h-5 text-destructive" />
                </div>
                <div>
                  <h3 className="font-medium text-destructive">Clear History</h3>
                  <p className="text-sm text-muted-foreground">Delete all saved insights</p>
                </div>
              </button>
            </Card>
          </div>

          {!profile.isGuest && (
            <Button
              variant="outline"
              className="w-full glass text-destructive hover:bg-destructive/10 touch-manipulation bg-transparent"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Sign Out
            </Button>
          )}

          <div className="text-center text-xs text-muted-foreground">
            <p>FinMate v1.0.0</p>
            <p className="mt-1">Built at CodeLinc 10 Hackathon</p>
          </div>
        </div>
      </div>
    </div>
  )
}
