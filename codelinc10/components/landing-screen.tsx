"use client"

import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"

interface LandingScreenProps {
  onStart: (isGuest: boolean) => void
}

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#2A1A1A]">
      <div className="absolute inset-0 pointer-events-none">
        <motion.div
          className="absolute -right-40 top-20 h-72 w-72 rounded-full bg-gradient-to-br from-[#A41E34]/40 via-[#FF4F00]/30 to-transparent blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.2 }}
        />
        <motion.div
          className="absolute -left-20 bottom-10 h-80 w-80 rounded-full bg-gradient-to-br from-[#FF4F00]/30 via-[#A41E34]/30 to-transparent blur-3xl"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 1.4, delay: 0.2 }}
        />
        <motion.div
          className="absolute left-1/2 top-1/3 h-96 w-96 -translate-x-1/2 rounded-[3rem] bg-white/50 shadow-[0_0_120px_rgba(164,30,52,0.15)] backdrop-blur"
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.4 }}
        />
      </div>

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-5xl flex-col justify-between px-6 pb-20 pt-12 sm:px-10">
        <header className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-[#A41E34] to-[#FF4F00] text-white shadow-lg">
              <Sparkles className="h-6 w-6" />
            </div>
            <div>
              <motion.p
                className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A41E34]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                LifeLens
              </motion.p>
              <motion.h1
                className="text-3xl font-bold text-[#2A1A1A] sm:text-4xl"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                Human-centered benefits guidance powered by AI
              </motion.h1>
            </div>
          </div>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-10 py-12">
          <div className="space-y-6">
            <motion.h2
              className="text-4xl font-semibold leading-tight text-[#2A1A1A] sm:text-5xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.35, duration: 0.7 }}
            >
              See your life and benefits through a smarter lens.
            </motion.h2>
            <motion.p
              className="max-w-2xl text-lg text-[#4D3B3B] sm:text-xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.45, duration: 0.7 }}
            >
              We pair Lincoln Financial expertise with conversational AI to help you uncover the protections, plans, and moments that matter most.
            </motion.p>
          </div>

          <motion.div
            className="flex flex-col gap-4 sm:flex-row"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.55, duration: 0.6 }}
          >
            <Button
              size="lg"
              className="group flex-1 rounded-2xl bg-gradient-to-r from-[#A41E34] to-[#FF4F00] text-lg font-semibold text-white shadow-xl shadow-[#A41E34]/20"
              onClick={() => onStart(false)}
            >
              Get Started
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="flex-1 rounded-2xl border-[#A41E34]/40 bg-white/70 text-lg font-semibold text-[#A41E34] transition hover:bg-[#A41E34]/10"
              onClick={() => onStart(true)}
            >
              Try as Guest
            </Button>
          </motion.div>

          <motion.div
            className="mt-6 w-full max-w-md rounded-3xl border border-[#A41E34]/10 bg-white/80 p-6 shadow-xl backdrop-blur"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.65, duration: 0.6 }}
          >
            <p className="text-sm font-semibold uppercase tracking-[0.3em] text-[#A41E34]">Insight Preview</p>
            <h3 className="mt-2 text-xl font-semibold text-[#2A1A1A]">
              "See your benefits, priorities, and timeline personalized just for you."
            </h3>
            <p className="mt-3 text-sm text-[#5B4444]">
              LifeLens surfaces the three actions that matter now, coaching tips to build momentum, and an easy timeline to stay on track.
            </p>
          </motion.div>
        </main>

        <footer className="text-xs uppercase tracking-[0.35em] text-[#A41E34]/70">
          Trusted by Lincoln Financial · Built for every life moment
        </footer>
      </div>
    </div>
  )
}
