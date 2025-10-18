"use client"

import Image from "next/image"
import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Sparkles } from "lucide-react"

interface LandingScreenProps {
  onStart: (isGuest: boolean) => void
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  const [currentSlide, setCurrentSlide] = useState(0)

  // 🌅 Carousel slides — full-width, thematic
  const slides = [
    {
      title: "Starting a new chapter?",
      description:
        "LifeLens uses AI to guide your benefits, savings, and coverage—so every decision feels confident from day one.",
      image: "/images/start-job.jpg",
      gradient: "from-[#A41E34] to-[#C42E44]",
    },
    {
      title: "Supporting your family?",
      description:
        "Discover smarter ways to protect what matters most with personalized insurance and financial wellness advice.",
      image: "/images/family-growth.jpg",
      gradient: "from-[#C42E44] to-[#FF4F00]",
    },
    {
      title: "Navigating change?",
      description:
        "From career transitions to unexpected events, get clear, real-time guidance to secure your financial future.",
      image: "/images/life-change.jpg",
      gradient: "from-[#FF4F00] to-[#A41E34]",
    },
  ]

  useEffect(() => {
    const interval = setInterval(
      () => setCurrentSlide((prev) => (prev + 1) % slides.length),
      5000
    )
    return () => clearInterval(interval)
  }, [slides.length])

  const current = slides[currentSlide]

  return (
    <div className="relative flex flex-col items-center justify-center min-h-screen text-center overflow-hidden bg-black">
      {/* 🖼 Background carousel */}
      <div className="absolute inset-0 transition-all duration-700">
        <Image
          src={current.image}
          alt={current.title}
          fill
          className="object-cover opacity-70 animate-fadeIn"
          priority
        />
        <div
          className={`absolute inset-0 bg-gradient-to-br ${current.gradient} opacity-60`}
        />
      </div>

      {/* 💎 Glass overlay with blur */}
      <div className="relative z-10 flex flex-col justify-center items-center px-6 sm:px-8 w-full max-w-3xl">
        {/* App branding */}
        <div className="flex items-center gap-2 mb-8 bg-white/10 px-5 py-2 rounded-full backdrop-blur-md border border-white/20">
          <Sparkles className="w-5 h-5 text-white" />
          <span className="font-semibold text-white text-lg tracking-wide">
            LifeLens
          </span>
        </div>

        {/* Hero text */}
        <h1 className="text-4xl sm:text-6xl font-bold text-white leading-tight mb-4 drop-shadow-lg">
          Personalized Financial Clarity for Every Life Event
        </h1>

        <p className="text-lg sm:text-xl text-white/85 mb-10 max-w-2xl">
          AI-powered insights built with Lincoln Financial’s mission—to help you
          make confident benefit and savings choices through every stage of
          life.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row gap-4 mb-12">
          <Button
            size="lg"
            onClick={() => onStart(false)}
            className="bg-white text-[#A41E34] hover:bg-white/90 px-10 py-6 rounded-xl text-lg font-semibold shadow-lg"
          >
            Continue as Employee
          </Button>
          <Button
            size="lg"
            variant="outline"
            onClick={() => onStart(true)}
            className="border-white/30 text-white hover:bg-white/10 px-10 py-6 rounded-xl text-lg font-semibold backdrop-blur-md"
          >
            Try as Guest
          </Button>
        </div>

        {/* 📊 Carousel copy area */}
        <div className="relative w-full max-w-lg bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20">
          <div className="relative h-[160px]">
            {slides.map((slide, i) => (
              <div
                key={i}
                className={`absolute inset-0 transition-all duration-700 transform ${
                  i === currentSlide
                    ? "opacity-100 translate-y-0"
                    : "opacity-0 translate-y-8"
                }`}
              >
                <h3 className="text-2xl font-semibold text-white mb-2">
                  {slide.title}
                </h3>
                <p className="text-white/80 text-sm sm:text-base">
                  {slide.description}
                </p>
              </div>
            ))}
          </div>

          {/* Dots */}
          <div className="flex justify-center gap-2 mt-5">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setCurrentSlide(i)}
                className={`w-3 h-3 rounded-full transition-all ${
                  i === currentSlide
                    ? "bg-white w-6"
                    : "bg-white/30 hover:bg-white/50"
                }`}
              />
            ))}
          </div>
        </div>

        {/* 🧩 Footer tagline */}
        <p className="text-white/60 text-xs sm:text-sm mt-10">
          © {new Date().getFullYear()} LifeLens • Powered by AWS Bedrock & Claude
          • Built for Lincoln Financial’s CodeLinc 10 Challenge
        </p>
      </div>
    </div>
  )
}
