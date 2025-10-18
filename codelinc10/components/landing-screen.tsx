"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight, Play } from "lucide-react"

interface LandingScreenProps {
  onStart: (isGuest: boolean) => void
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

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="relative min-h-screen overflow-hidden bg-gradient-to-br from-[#A41E34] via-[#C43227] to-[#FF4F00] text-white">
      <div className="absolute inset-0 opacity-25">
        <motion.div
          className="absolute -right-20 top-10 h-72 w-72 rounded-full bg-white/20 blur-3xl"
          animate={{ scale: [1, 1.05, 1], opacity: [0.2, 0.35, 0.2] }}
          transition={{ duration: 6, repeat: Infinity }}
        />
        <motion.div
          className="absolute left-0 top-1/3 h-64 w-64 rounded-full bg-white/10 blur-3xl"
          animate={{ scale: [1, 1.1, 1], opacity: [0.15, 0.3, 0.15] }}
          transition={{ duration: 7, repeat: Infinity, delay: 0.6 }}
        />
      </div>

      <div className="relative mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
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
            <button
              type="button"
              className="rounded-full px-4 py-2 text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              About
            </button>
            <Button
              onClick={() => onStart(false)}
              className="rounded-full bg-white px-5 py-2 text-sm font-semibold text-[#A41E34] shadow-lg shadow-[#A41E34]/20 transition hover:bg-[#F9EDEA]"
            >
              Get Started
            </Button>
          </motion.nav>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-12 py-12">
          <div className="grid items-center gap-12 lg:grid-cols-[minmax(0,1fr),340px]">
            <div className="space-y-8">
              <motion.p
                className="text-xs font-semibold uppercase tracking-[0.5em] text-white/70"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
              >
                Built around learn · personalize · act
              </motion.p>
              <motion.h1
                className="text-4xl font-semibold leading-tight sm:text-5xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Understand your benefits, in plain English.
              </motion.h1>
              <motion.p
                className="max-w-xl text-base text-white/80 sm:text-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                LifeLens is your Lincoln Financial guide that translates healthcare, savings, and protection decisions into steps you can act on with confidence.
              </motion.p>
              <motion.div
                className="flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Button
                  size="lg"
                  className="w-full rounded-full bg-white py-6 text-base font-semibold text-[#A41E34] shadow-lg shadow-black/10 transition hover:bg-[#F9EDEA] sm:w-auto sm:px-10"
                  onClick={() => onStart(false)}
                >
                  Start now
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-full border-white/40 bg-transparent py-6 text-base font-semibold text-white backdrop-blur transition hover:bg-white/10 sm:w-auto sm:px-10"
                  onClick={() => onStart(true)}
                >
                  <Play className="mr-2 h-5 w-5" /> Try a demo
                </Button>
              </motion.div>
            </div>

            <motion.aside
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.25, duration: 0.6 }}
              className="relative overflow-hidden rounded-3xl border border-white/20 bg-white/10 p-6 backdrop-blur-lg"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-white/30 to-transparent" />
              <div className="relative space-y-4 text-sm text-white/85">
                <p className="text-xs font-semibold uppercase tracking-[0.4em] text-white/70">Live preview</p>
                <h3 className="text-xl font-semibold text-white">Your guided LifeLens journey</h3>
                <p>
                  A dashboard of health, savings, and protection insights morphs into quick action cards so you can act the moment inspiration strikes.
                </p>
                <motion.div
                  className="grid gap-3 rounded-2xl bg-white/10 p-4 shadow-inner"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 6, repeat: Infinity }}
                >
                  <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-[0.3em] text-white/70">
                    <span>Health</span>
                    <span>Protection</span>
                    <span>Growth</span>
                  </div>
                  <div className="grid gap-2 text-left text-white">
                    <div className="rounded-xl bg-white/20 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.35em] text-white/70">This week</p>
                      <p className="text-sm font-semibold">Review your benefits snapshot</p>
                    </div>
                    <div className="rounded-xl bg-white/10 px-3 py-2">
                      <p className="text-[11px] uppercase tracking-[0.35em] text-white/70">Next 30 days</p>
                      <p className="text-sm font-semibold">Boost your savings autopilot</p>
                    </div>
                  </div>
                </motion.div>
              </div>
            </motion.aside>
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
                className="min-w-[220px] flex-1 rounded-3xl border border-white/20 bg-white/10 p-5 text-left backdrop-blur-lg"
              >
                <p className="text-3xl font-semibold">{item.stat}</p>
                <p className="mt-2 text-sm text-white/80">{item.label}</p>
              </motion.div>
            ))}
          </div>
        </section>
      </div>
    </div>
  )
}
