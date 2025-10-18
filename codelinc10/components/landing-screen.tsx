"use client"

import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import { ArrowRight } from "lucide-react"

interface LandingScreenProps {
  onStart: (isGuest: boolean) => void
}

interface Slide {
  eyebrow: string
  title: string
  description: string
}

const SLIDES: Slide[] = [
  {
    eyebrow: "Smart onboarding",
    title: "Confident benefits decisions in minutes",
    description:
      "LifeLens blends human warmth with AI guidance so you can choose the right coverage, savings, and protections for every life moment.",
  },
  {
    eyebrow: "Built for real life",
    title: "See how each milestone shapes your financial wellness",
    description:
      "From new jobs to growing families, LifeLens connects Lincoln Financial benefits with actionable next steps personalized just for you.",
  },
  {
    eyebrow: "AI with heart",
    title: "Your story powers a personalized insight stream",
    description:
      "Answer a conversational questionnaire and watch LifeLens craft a plan that balances protection, growth, and peace of mind.",
  },
]

export function LandingScreen({ onStart }: LandingScreenProps) {
  return (
    <div className="min-h-screen bg-[#F7F4F2] text-[#2A1A1A]">
      <div className="mx-auto flex min-h-screen w-full max-w-5xl flex-col px-5 pb-16 pt-8 sm:px-10">
        <header className="flex items-center justify-between">
          <motion.div className="flex items-center gap-3" initial={{ opacity: 0, y: -12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
            <Image src="/lifelens-logo.svg" alt="LifeLens logo" width={140} height={40} className="h-10 w-auto" />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527] sm:block">
              Lincoln Financial + LifeLens
            </span>
          </motion.div>
          <motion.span
            className="rounded-full border border-[#E2D5D7] bg-white px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.35em] text-[#7F1527]"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            Mobile-first journey
          </motion.span>
        </header>

        <main className="flex flex-1 flex-col justify-center gap-10 py-12">
          <div className="grid items-start gap-10 lg:grid-cols-[minmax(0,1fr),360px]">
            <div className="space-y-6">
              <motion.h1
                className="text-4xl font-semibold leading-tight text-[#2A1A1A] sm:text-5xl"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Confident financial decisions, tailored to your milestones.
              </motion.h1>
              <motion.p
                className="text-base text-[#4D3B3B] sm:text-lg"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.6 }}
              >
                LifeLens combines Lincoln Financial’s expertise with conversational coaching so you can navigate benefits, protection, and savings with ease—from any device.
              </motion.p>
              <motion.div
                className="flex flex-col gap-3 sm:flex-row"
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2, duration: 0.6 }}
              >
                <Button
                  size="lg"
                  className="w-full rounded-2xl bg-[#A41E34] py-6 text-base font-semibold text-white shadow-lg shadow-[#A41E34]/20 hover:bg-[#7F1527] sm:w-auto sm:px-8"
                  onClick={() => onStart(false)}
                >
                  Start my plan
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="w-full rounded-2xl border-[#A41E34]/40 bg-white py-6 text-base font-semibold text-[#A41E34] hover:bg-[#F0E6E7] sm:w-auto sm:px-8"
                  onClick={() => onStart(true)}
                >
                  Explore as guest
                </Button>
              </motion.div>
              <motion.ul
                className="space-y-4 text-sm text-[#4D3B3B]"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                {SLIDES.map((slide) => (
                  <li key={slide.title} className="flex items-start gap-3 rounded-2xl border border-[#E2D5D7] bg-white p-4">
                    <div className="mt-1 h-2 w-2 rounded-full bg-[#A41E34]" />
                    <div>
                      <p className="text-[11px] font-semibold uppercase tracking-[0.3em] text-[#7F1527]">{slide.eyebrow}</p>
                      <p className="mt-1 text-base font-semibold">{slide.title}</p>
                      <p className="text-sm text-[#5B4444]">{slide.description}</p>
                    </div>
                  </li>
                ))}
              </motion.ul>
            </div>

            <motion.aside
              className="rounded-3xl border border-[#E2D5D7] bg-white p-6 shadow-xl"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.35, duration: 0.6 }}
            >
              <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#7F1527]">On your phone</p>
              <h3 className="mt-2 text-xl font-semibold text-[#2A1A1A]">Designed for quick, personal check-ins</h3>
              <p className="mt-3 text-sm text-[#5B4444]">
                Answer a friendly survey, receive your top three priorities, and chat with LifeLens for context from past sessions.
              </p>
              <div className="mt-6 space-y-4">
                <div className="rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4 text-sm text-[#4D3B3B]">
                  <p className="font-semibold text-[#2A1A1A]">Personalized guidance</p>
                  <p>Lincoln Financial resources, tailored recommendations, and a visible dock to revisit anytime.</p>
                </div>
                <div className="rounded-2xl border border-[#F0E6E7] bg-[#FBF7F6] p-4 text-sm text-[#4D3B3B]">
                  <p className="font-semibold text-[#2A1A1A]">Keep your coach close</p>
                  <p>LifeLens remembers your last milestones and surfaces chat history to explain next steps.</p>
                </div>
              </div>
            </motion.aside>
          </div>
        </main>

        <footer className="flex flex-col gap-4 border-t border-[#E2D5D7] pt-6 text-xs uppercase tracking-[0.3em] text-[#7F1527] sm:flex-row sm:items-center sm:justify-between">
          <span>Trusted by Lincoln Financial</span>
          <span>Life moments evolve · your guidance keeps up</span>
        </footer>
      </div>
    </div>
  )
}
