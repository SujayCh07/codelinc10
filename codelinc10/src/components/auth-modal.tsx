"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, Lock } from "lucide-react"

interface AuthModalProps {
  onClose: () => void
  onAuth: (userId: string, email: string, fullName?: string, profileData?: Record<string, unknown>) => void
  onGuestContinue: () => void
}

export function AuthModal({ onClose, onAuth, onGuestContinue }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [userId, setUserId] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, userId }),
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.error || "Login failed")
        setIsLoading(false)
        return
      }

      // Successful login - pass profile data for prefilling
      onAuth(data.user.userId, data.user.email, data.user.fullName, data.user.profileData)
    } catch (err) {
      setError("An error occurred during login")
      console.error("Login error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md animate-slide-up sm:animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">Sign In</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-muted rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              Email (Username)
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">
              User ID (Password)
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Enter your user ID"
                value={userId}
                onChange={(e) => setUserId(e.target.value)}
                className="glass pl-10"
                required
                disabled={isLoading}
              />
            </div>
          </div>

          {error && (
            <div className="text-sm text-red-600 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Signing in..." : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">Or</span>
          </div>
        </div>

        <Button variant="ghost" className="w-full" onClick={onGuestContinue}>
          Continue as Guest
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          Don't have an account? Complete the personalization quiz to create your profile.
        </p>
      </div>
    </div>
  )
}
