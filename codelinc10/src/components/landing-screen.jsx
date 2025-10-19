"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

interface LandingScreenProps {
  onStart: (isGuest: boolean) => void
  hasExistingInsights?: boolean
  onViewInsights?: () => void
}

const SPOTLIGHTS = [
  {
    stat: "92%",
    label: "feel more confident after onboarding",
  },
  {
    stat: "< 2 min",
    label: "to receive your first AI-guided plan",
  },
  {
    stat: "5k+",
    label: "employers rely on LifeLens insights",
  },
]

export function LandingScreen({ onStart, hasExistingInsights, onViewInsights }: LandingScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-[#F7F4F2] text-[#2A1A1A]">
      <div className="absolute inset-x-0 top-0 h-[360px] bg-gradient-to-br from-[#A41E34] via-[#B8342B] to-[#D94E35]" />
      <div className="absolute inset-x-0 top-[280px] h-[420px] rounded-[160px] bg-gradient-to-br from-[#F8E3DC] via-[#FDF4EF] to-transparent blur-3xl" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-16 pt-6 sm:px-10">
        <header className="flex items-center justify-between text-white">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image src="/lifelens-logo.svg" alt="LifeLens logo" width={140} height={40} className="h-10 w-auto" />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.35em] text-white/80 sm:block">
              Lincoln Financial · LifeLens
            </span>
          </motion.div>
          <motion.nav
            className="flex items-center gap-3 text-sm font-medium"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {hasExistingInsights && onViewInsights && (
              <Button
                onClick={onViewInsights}
                variant="outline"
                className="rounded-full border-white/30 bg-white/10 px-4 py-2 text-sm font-semibold text-white backdrop-blur transition hover:bg-white/20"
              >
                My Plan
              </Button>
            )}
            <Button
              onClick={() => onStart(false)}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#A41E34] shadow-lg shadow-[#A41E34]/20 transition hover:bg-[#F9EDEA]"
            >
              Get Started
            </Button>
          </motion.nav>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-12 py-12">
          <div className="flex items-center justify-center">
            <div className="max-w-2xl space-y-8 rounded-[36px] bg-white/95 p-8 text-[#2A1A1A] shadow-2xl shadow-[#A41E34]/10 backdrop-blur">
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.5em] text-[#A41E34]/70"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                AI-Powered Financial Guidance
              </motion.p>
              <motion.h1
                className="text-4xl font-semibold leading-tight text-[#1E0D0E] sm:text-5xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Your personalized financial roadmap starts here.
              </motion.h1>
              <motion.p
                className="max-w-xl text-base text-[#4D3B3B] sm:text-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                Get clear, actionable guidance on benefits, savings, and financial protection tailored to your life and goals.
              </motion.p>
              <motion.div
                className="flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Button
                  size="lg"
                  className="w-full rounded-full bg-[#A41E34] py-6 text-base font-semibold text-white shadow-lg shadow-[#A41E34]/25 transition hover:bg-[#7F1527] sm:w-auto sm:px-10"
                  onClick={() => onStart(false)}
                >
                  Start now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-[#A41E34]/20 bg-white/70 py-6 text-base font-semibold text-[#A41E34] backdrop-blur transition hover:bg-[#F9EDEA] sm:w-auto sm:px-10"
                  onClick={() => onStart(true)}
                >
                  <Play className="mr-2 h-5 w-5" /> Try a demo
                </Button>
              </motion.div>
            </div>


          </div>
        </main>

        <section className="mt-6">
          <div className="flex gap-4 overflow-x-auto pb-4 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            {SPOTLIGHTS.map((item) => (
              <motion.div
                key={item.stat}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="min-w-[220px] flex-1 rounded-3xl border border-[#E2D5D7] bg-white/90 p-5 text-left shadow-md"
              >
                <p className="text-3xl font-semibold text-[#A41E34]">{item.stat}</p>
                <p className="mt-2 text-sm text-[#4D3B3B]">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
