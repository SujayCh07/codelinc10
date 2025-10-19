"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { X, Mail, Lock, Chrome, Linkedin } from "lucide-react"

interface AuthModalProps {
  onClose: () => void
  onAuth: (name: string, email: string) => void
  onGuestContinue: () => void
}

export function AuthModal({ onClose, onAuth, onGuestContinue }: AuthModalProps) {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [isSignUp, setIsSignUp] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onAuth(name || email.split("@")[0], email)
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
      <div className="glass-strong rounded-t-3xl sm:rounded-3xl p-6 w-full max-w-md animate-slide-up sm:animate-scale-in shadow-2xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-foreground">{isSignUp ? "Create Account" : "Welcome Back"}</h2>
          <button onClick={onClose} className="p-2 hover:bg-muted rounded-full transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {isSignUp && (
            <div>
              <label className="text-sm font-medium text-muted-foreground mb-2 block">Full Name</label>
              <Input
                type="text"
                placeholder="John Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="glass"
                required
              />
            </div>
          )}

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="glass pl-10"
                required
              />
            </div>
          </div>

          <div>
            <label className="text-sm font-medium text-muted-foreground mb-2 block">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="glass pl-10"
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full" size="lg">
            {isSignUp ? "Sign Up" : "Sign In"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs">
            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3 mb-4">
          <Button
            variant="outline"
            className="glass bg-transparent"
            onClick={() => onAuth("Google User", "google@example.com")}
          >
            <Chrome className="w-5 h-5 mr-2" />
            Google
          </Button>
          <Button
            variant="outline"
            className="glass bg-transparent"
            onClick={() => onAuth("LinkedIn User", "linkedin@example.com")}
          >
            <Linkedin className="w-5 h-5 mr-2" />
            LinkedIn
          </Button>
        </div>

        <Button variant="ghost" className="w-full" onClick={onGuestContinue}>
          Continue as Guest
        </Button>

        <p className="text-center text-sm text-muted-foreground mt-4">
          {isSignUp ? "Already have an account?" : "Don't have an account?"}{" "}
          <button
            type="button"
            onClick={() => setIsSignUp(!isSignUp)}
            className="text-primary font-medium hover:underline"
          >
            {isSignUp ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </div>
    </div>
  )
}
