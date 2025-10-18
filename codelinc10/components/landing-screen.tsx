"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Sparkles, ArrowRight } from "lucide-react"

interface LandingScreenProps {
  onStart: (isGuest: boolean) => void
}

interface Slide {
  eyebrow: string
  title: string
  description: string
  stat: string
  accent: string
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Smart onboarding",
    title: "Confident benefits decisions in minutes",
    description:
      "LifeLens blends human warmth with AI guidance so you can choose the right coverage, savings, and protections for every life moment.",
    stat: "92% feel more prepared after one session",
    accent: "from-[#A41E34] via-[#C32F42] to-[#FF4F00]",
  },
  {
    eyebrow: "Built for real life",
    title: "See how each milestone shapes your financial wellness",
    description:
      "From new jobs to growing families, LifeLens connects Lincoln Financial benefits with actionable next steps personalized just for you.",
    stat: "12+ curated playbooks for work, family, and retirement",
    accent: "from-[#FF4F00] via-[#FF7231] to-[#A41E34]",
  },
  {
    eyebrow: "AI with heart",
    title: "Your story powers a personalized insight stream",
    description:
      "Answer a conversational questionnaire and watch LifeLens craft a plan that balances protection, growth, and peace of mind.",
    stat: "Powered by secure AWS Bedrock + Claude",
    accent: "from-[#311016] via-[#A41E34] to-[#FF4F00]",
  },
]

export function LandingScreen({ onStart }: LandingScreenProps) {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setIndex((current) => (current + 1) % SLIDES.length)
    }, 6000)

    return () => clearInterval(timer)
  }, [])

  const activeSlide = useMemo(() => SLIDES[index], [index])

  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#1F0609] via-[#2D0B11] to-[#120203] text-white">
      <div className="absolute inset-0">
        <motion.div
          key={activeSlide.title}
          className="absolute inset-0"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: "easeInOut" }}
        >
          <div className={`absolute inset-0 bg-gradient-to-br ${activeSlide.accent} opacity-40`} />
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.12),_transparent_55%)]" />
        </motion.div>
      </div>

      <div className="relative z-10 flex min-h-screen flex-col items-center justify-between px-6 py-10 sm:px-10">
        <div className="flex w-full max-w-6xl items-center justify-between">
          <div className="inline-flex items-center gap-3 rounded-full border border-white/20 bg-white/10 px-4 py-2 backdrop-blur">
            <Sparkles className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide uppercase">LifeLens by Lincoln Financial</span>
          </div>
          <div className="hidden text-sm font-medium text-white/60 md:block">
            Human-centered benefits guidance powered by AI
          </div>
        </div>

        <div className="flex w-full max-w-6xl flex-1 flex-col justify-center gap-10 py-12">
          <div className="grid gap-12 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="space-y-8">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.title}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -24 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <span className="inline-flex items-center rounded-full bg-white/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                    {activeSlide.eyebrow}
                  </span>
                  <h1 className="text-4xl font-bold leading-tight sm:text-5xl md:text-6xl">
                    {activeSlide.title}
                  </h1>
                  <p className="max-w-xl text-base text-white/80 sm:text-lg">
                    {activeSlide.description}
                  </p>
                </motion.div>
              </AnimatePresence>

              <div className="flex flex-col gap-4 sm:flex-row">
                <Button
                  size="lg"
                  onClick={() => onStart(false)}
                  className="group flex-1 rounded-2xl bg-white text-[#A41E34] shadow-lg shadow-black/10 transition hover:-translate-y-0.5 hover:bg-white"
                >
                  Get Started
                  <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  onClick={() => onStart(true)}
                  className="flex-1 rounded-2xl border-white/40 bg-white/10 text-white shadow-inner shadow-white/10 backdrop-blur transition hover:bg-white/20"
                >
                  Try as Guest
                </Button>
              </div>

              <div className="flex items-center gap-4 text-sm text-white/70">
                {SLIDES.map((slide, slideIndex) => (
                  <button
                    key={slide.title}
                    aria-label={`Go to slide ${slideIndex + 1}`}
                    onClick={() => setIndex(slideIndex)}
                    className={`h-1.5 flex-1 rounded-full transition ${
                      slideIndex === index ? "bg-white" : "bg-white/30 hover:bg-white/50"
                    }`}
                  />
                ))}
              </div>
            </div>

            <div className="glassmorphic relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-8 backdrop-blur-lg">
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeSlide.stat}
                  initial={{ opacity: 0, y: 32 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -32 }}
                  transition={{ duration: 0.6, ease: "easeOut" }}
                  className="space-y-6"
                >
                  <p className="text-sm uppercase tracking-[0.2em] text-white/60">
                    Why teams choose LifeLens
                  </p>
                  <p className="text-2xl font-semibold text-white sm:text-3xl">
                    {activeSlide.stat}
                  </p>
                  <div className="grid gap-3 text-sm text-white/70">
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#FF4F00]" /> Guided onboarding
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-white/70" /> Personalized action timeline
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full bg-[#A41E34]" /> Shareable insights for leaders
                    </span>
                  </div>
                </motion.div>
              </AnimatePresence>

              <div className="pointer-events-none absolute -right-12 -top-12 h-40 w-40 rounded-full bg-[#FF4F00]/20 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-16 -left-16 h-48 w-48 rounded-full bg-[#A41E34]/30 blur-3xl" />
            </div>
          </div>
        </div>

        <div className="flex w-full max-w-6xl flex-col gap-3 text-xs text-white/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} LifeLens • Lincoln Financial CodeLinc 10</p>
          <p>Designed with accessibility in mind • Optimized for mobile and desktop</p>
        </div>
      </div>
    </div>
  )
}
