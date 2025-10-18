"use client"

import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"

import { Button } from "@/components/ui/button"
import { TopNav } from "@/components/top-nav"

interface HomeProps {
  onStart: (asGuest: boolean) => void
}

const slides = [
  {
    heading: "Smart Benefits Decisions",
    subheading: "Confident choices in minutes.",
    copy:
      "LifeLens synthesizes your HR profile with Lincoln Financial expertise so every election is grounded in data and context.",
  },
  {
    heading: "Tailored for Your Life",
    subheading: "Guidance for family, career, and retirement.",
    copy:
      "See the protections, planning moves, and learning moments that fit the exact stage of your household and goals.",
  },
  {
    heading: "Powered by Lincoln",
    subheading: "Secure, data-driven insights for employees.",
    copy:
      "Your information stays protected while our AI surfaces the highest-impact steps with clear timelines and next actions.",
  },
]

export function Home({ onStart }: HomeProps) {
  const [activeIndex, setActiveIndex] = useState(0)

  useEffect(() => {
    const timer = window.setInterval(() => {
      setActiveIndex((prev) => (prev + 1) % slides.length)
    }, 6000)

    return () => window.clearInterval(timer)
  }, [])

  return (
    <div className="min-h-screen bg-white text-[#1E1E1E]">
      <TopNav />

      <div className="relative overflow-hidden">
        <div className="absolute inset-x-0 top-0 h-64 bg-gradient-to-br from-[#A41E34]/80 via-[#A41E34]/60 to-[#FF4F00]/40 blur-3xl opacity-60" />
        <div className="relative mx-auto flex min-h-[calc(100vh-80px)] w-full max-w-5xl flex-col items-center px-6 pb-16 pt-14">
          <div className="mx-auto max-w-3xl text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]">Welcome to LifeLens</p>
            <h1 className="mt-4 text-4xl font-semibold leading-tight text-[#1E1E1E] sm:text-5xl">
              Human-centered benefits guidance powered by AI
            </h1>
            <p className="mt-4 text-base text-[#3D3D3D] sm:text-lg">
              Discover a confident path through benefits decisions with streamlined data capture and instant insight summaries.
            </p>
          </div>

          <div className="mt-10 w-full max-w-2xl">
            <div className="rounded-3xl border border-[#A41E34]/15 bg-white/90 p-6 shadow-xl">
              <div className="flex justify-between text-left sm:text-center">
                <span className="text-sm font-medium text-[#A41E34]">Why employees choose LifeLens</span>
                <span className="hidden text-sm text-[#1E1E1E]/60 sm:inline">Auto-progressing every 6 seconds</span>
              </div>
              <div className="mt-5 overflow-hidden">
                <AnimatePresence mode="wait" initial={false}>
                  <motion.div
                    key={slides[activeIndex].heading}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -16 }}
                    transition={{ duration: 0.4 }}
                    className="rounded-2xl bg-gradient-to-br from-[#FFF7F5] via-white to-[#FFF0EA] p-6 shadow-inner"
                  >
                    <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A41E34]/80">
                      {slides[activeIndex].heading}
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold text-[#1E1E1E]">
                      {slides[activeIndex].subheading}
                    </h2>
                    <p className="mt-3 text-base text-[#3D3D3D]">{slides[activeIndex].copy}</p>
                  </motion.div>
                </AnimatePresence>
              </div>
              <div className="mt-6 flex justify-center gap-2">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    type="button"
                    aria-label={`Go to slide ${index + 1}`}
                    className={`h-2.5 rounded-full transition-all ${
                      index === activeIndex
                        ? "w-10 bg-[#A41E34]"
                        : "w-6 bg-[#A41E34]/30 hover:bg-[#A41E34]/50"
                    }`}
                    onClick={() => setActiveIndex(index)}
                  />
                ))}
              </div>
            </div>
          </div>

          <div className="mt-10 flex w-full flex-col gap-4 sm:flex-row sm:justify-center">
            <Button
              className="w-full rounded-xl border border-[#A41E34] bg-white px-6 py-3 text-base font-semibold text-[#A41E34] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#A41E34]/10 sm:w-auto"
              onClick={() => onStart(false)}
            >
              Start Questionnaire
            </Button>
            <Button
              variant="outline"
              className="w-full rounded-xl border border-[#A41E34]/40 bg-white px-6 py-3 text-base font-semibold text-[#1E1E1E] shadow-sm transition hover:-translate-y-0.5 hover:bg-[#A41E34]/5 sm:w-auto"
              onClick={() => onStart(true)}
            >
              Try as Guest
            </Button>
          </div>

          <div className="mt-10 w-full max-w-2xl rounded-3xl border border-[#A41E34]/10 bg-white/90 p-6 text-left shadow-lg">
            <h3 className="text-sm font-semibold uppercase tracking-[0.25em] text-[#A41E34]">Insight preview</h3>
            <p className="mt-3 text-lg font-semibold text-[#1E1E1E]">
              See your benefits, priorities, and timeline personalized just for you.
            </p>
            <p className="mt-3 text-sm text-[#3D3D3D]">
              The LifeLens dashboard distills your answers into a three-part summary: top priorities, a time-boxed action plan, and
              quick learning tips to keep momentum strong.
            </p>
          </div>

          <div className="mt-auto w-full pt-16 text-center text-xs font-medium uppercase tracking-[0.35em] text-[#1E1E1E]/60">
            © {new Date().getFullYear()} LifeLens • Built with Lincoln Financial
          </div>
        </div>
      </div>
    </div>
  )
}
