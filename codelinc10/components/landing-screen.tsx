"use client"

import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"
import { useState, useEffect } from "react"

interface LandingScreenProps {
  onStart: (isGuest: boolean) => void
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Starting a new job?",
      description: "Get personalized guidance on benefits enrollment and retirement planning",
      gradient: "from-[#A41E34] to-[#C42E44]",
    },
    {
      title: "Growing your family?",
      description: "Understand insurance, savings, and financial protection for your loved ones",
      gradient: "from-[#C42E44] to-[#FF4F00]",
    },
    {
      title: "Facing unexpected change?",
      description: "Navigate life transitions with clear, actionable financial advice",
      gradient: "from-[#FF4F00] to-[#A41E34]",
    },
  ]

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 4000)
    return () => clearInterval(timer)
  }, [slides.length])

  return (
    <div className="relative min-h-screen overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-[#A41E34] via-[#C42E44] to-[#FF4F00] animate-gradient" />

      <div className="absolute inset-0 opacity-20">
        <div className="absolute top-20 left-20 w-64 h-64 bg-white rounded-full blur-3xl" />
        <div className="absolute bottom-20 right-20 w-96 h-96 bg-white rounded-full blur-3xl" />
      </div>

      <div className="relative z-10 flex flex-col items-center justify-center min-h-screen px-6 text-center">
        <div className="mb-8">
          <div className="inline-flex items-center gap-2 px-6 py-3 glass-strong rounded-full text-white">
            <Sparkles className="w-5 h-5" />
            <span className="font-semibold text-lg">LifeLens</span>
          </div>
        </div>

        <h1 className="text-5xl md:text-7xl font-bold text-white mb-6 text-balance leading-tight">
          Every life event deserves
          <br />
          clear financial guidance.
        </h1>

        <p className="text-xl md:text-2xl text-white/90 mb-12 max-w-2xl text-pretty">
          AI-driven support to help you understand benefits, savings, and next steps.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 mb-16">
          <Button
            size="lg"
            onClick={() => onStart(false)}
            className="bg-white text-[#A41E34] hover:bg-white/90 text-lg px-8 py-6 rounded-xl shadow-2xl font-semibold"
          >
            Get Started
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onStart(true)}
            className="glass-strong text-white border-white/30 hover:bg-white/10 text-lg px-8 py-6 rounded-xl font-semibold"
          >
            Try as Guest
          </Button>
        </div>

        <div className="glass-strong rounded-2xl p-8 max-w-md w-full overflow-hidden">
          <div className="relative min-h-[160px]">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute inset-0 flex flex-col items-center justify-center gap-3 transition-all duration-500 ${
                  index === currentSlide ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"
                }`}
              >
                <div className={`w-full h-2 rounded-full bg-gradient-to-r ${slide.gradient} mb-2`} />
                <h3 className="text-2xl font-bold text-white text-balance">{slide.title}</h3>
                <p className="text-white/70 text-pretty">{slide.description}</p>
              </div>
            ))}
          </div>

          <div className="flex justify-center gap-2 mt-6">
            {slides.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentSlide(index)}
                className={`w-2 h-2 rounded-full transition-all ${
                  index === currentSlide ? "bg-white w-8" : "bg-white/30"
                }`}
              />
            ))}
          </div>
        </div>

        <p className="text-white/60 text-sm mt-8">
          Powered by AWS Bedrock · Built for Lincoln Financial's mission to empower financial well-being.
        </p>
      </div>
    </div>
  )
}
