"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Mic, Sparkles, ArrowRight, User } from "lucide-react"

interface LifeInputScreenProps {
  onAnalyze: (input: string, category?: string) => void
  userName: string
  isGuest: boolean
}

export function LifeInputScreen({ onAnalyze, userName, isGuest }: LifeInputScreenProps) {
  const [input, setInput] = useState("")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [isListening, setIsListening] = useState(false)
  const [selectedCategory, setSelectedCategory] = useState<string | undefined>()

  const handleAnalyze = async () => {
    if (!input.trim()) return
    setIsAnalyzing(true)
    await onAnalyze(input, selectedCategory)
    setIsAnalyzing(false)
    setInput("")
    setSelectedCategory(undefined)
  }

  const handleVoiceInput = () => {
    setIsListening(!isListening)
    // Voice input would be implemented here
  }

  const categories = [
    { id: "career", label: "Career", icon: "💼", color: "bg-blue-500/10 text-blue-600 border-blue-500/30" },
    { id: "family", label: "Family", icon: "👨‍👩‍👧", color: "bg-green-500/10 text-green-600 border-green-500/30" },
    { id: "home", label: "Home", icon: "🏠", color: "bg-amber-500/10 text-amber-600 border-amber-500/30" },
    { id: "health", label: "Health", icon: "🏥", color: "bg-rose-500/10 text-rose-600 border-rose-500/30" },
    { id: "education", label: "Education", icon: "🎓", color: "bg-purple-500/10 text-purple-600 border-purple-500/30" },
  ]

  const examples = [
    { text: "I'm starting my first full-time job", icon: "💼", category: "career" },
    { text: "We're expecting our first baby", icon: "👶", category: "family" },
    { text: "Just bought our first home", icon: "🏠", category: "home" },
    { text: "Planning to go back to school", icon: "🎓", category: "education" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-4">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-2xl font-bold">
              Hello, {userName}
              {isGuest && " 👋"}
            </h2>
            <p className="text-sm text-muted-foreground">What's happening in your life?</p>
          </div>
          <div className="glass rounded-full p-3">
            <User className="w-6 h-6 text-primary" />
          </div>
        </div>

        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 glass rounded-full text-primary mb-4">
            <Sparkles className="w-4 h-4" />
            <span className="text-sm font-medium">AI-Powered Insights</span>
          </div>

          <h1 className="text-3xl md:text-4xl font-bold mb-3 text-balance">Share Your Life Moment</h1>

          <p className="text-base text-muted-foreground text-pretty">Get personalized benefits guidance in seconds</p>
        </div>

        <div className="mb-6">
          <p className="text-sm font-medium mb-3 text-muted-foreground">Select a category (optional)</p>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {categories.map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id === selectedCategory ? undefined : cat.id)}
                className={`flex-shrink-0 flex items-center gap-2 px-4 py-2.5 rounded-xl border-2 transition-all touch-manipulation ${
                  selectedCategory === cat.id
                    ? cat.color + " scale-105"
                    : "glass border-border/50 hover:border-primary/30"
                }`}
              >
                <span className="text-lg">{cat.icon}</span>
                <span className="text-sm font-medium whitespace-nowrap">{cat.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className="glass-strong rounded-3xl p-6 mb-6 shadow-lg">
          <div className="relative">
            <Textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="I'm starting my first full-time job and want to understand my benefits..."
              className="min-h-[160px] text-base resize-none border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 touch-manipulation"
            />

            <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/50 gap-3">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleVoiceInput}
                className={`touch-manipulation ${isListening ? "text-primary animate-pulse" : ""}`}
              >
                <Mic className="w-4 h-4 mr-2" />
                {isListening ? "Listening..." : "Voice"}
              </Button>

              <Button
                onClick={handleAnalyze}
                disabled={!input.trim() || isAnalyzing}
                size="lg"
                className="bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl px-6 touch-manipulation"
              >
                {isAnalyzing ? (
                  <>
                    <Sparkles className="w-4 h-4 mr-2 animate-spin" />
                    Analyzing...
                  </>
                ) : (
                  <>
                    Analyze
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </>
                )}
              </Button>
            </div>
          </div>
        </div>

        <div>
          <p className="text-sm text-muted-foreground mb-3">Or try one of these examples:</p>

          <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 scrollbar-hide">
            {examples.map((example, index) => (
              <button
                key={index}
                onClick={() => {
                  setInput(example.text)
                  setSelectedCategory(example.category)
                }}
                className="flex-shrink-0 w-64 glass rounded-2xl p-4 text-left hover:bg-accent/10 transition-all group touch-manipulation border border-border/50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{example.icon}</span>
                  <span className="text-sm font-medium group-hover:text-primary transition-colors leading-snug">
                    {example.text}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="glass rounded-xl p-4 inline-block">
            <p className="text-sm text-muted-foreground">
              💡 <span className="font-medium">Tip:</span> More details = better recommendations
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
