"use client"

import { useState } from "react"
import Image from "next/image"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  LogIn,
  UserPlus,
  Play,
  ShieldCheck,
  Clock,
  Stars,
  Sparkles,
  CheckCircle2,
} from "lucide-react"

interface LandingScreenProps {
  onStart: () => void
  hasExistingInsights?: boolean
  onViewInsights?: () => void
  quizCompleted?: boolean
  onLogin?: () => void
  onSignup?: () => void
  onDemo?: () => void
}

const SPOTLIGHTS = [
  { stat: "92%", label: "feel more confident after onboarding", Icon: Stars },
  { stat: "<2 min", label: "to get your first AI-guided plan", Icon: Clock },
  { stat: "5k+", label: "employers rely on LifeLens insights", Icon: ShieldCheck },
]

export default function LandingScreen({
  onStart,
  hasExistingInsights,
  onViewInsights,
  quizCompleted,
  onLogin,
  onSignup,
  onDemo,
}: LandingScreenProps) {
  // keep state if you want to toggle mock tabs later
  const [activeTab] = useState<"plans" | "costs" | "checklist">("plans")

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1E0D0E]">
      {/* soft ambient gradient top */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-gradient-to-b from-[#FDF4EF] via-[#F8E3DC] to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-28 pt-6 sm:px-8">
        {/* Header */}
        <header className="flex items-center justify-between">
          <motion.div
            className="flex items-center gap-3"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Image src="/lifelens-logo.svg" alt="LifeLens logo" width={160} height={44} className="h-9 w-auto" />
            <span className="hidden text-xs font-semibold uppercase tracking-[0.35em] text-[#7F1527]/80 md:block">
              Lincoln Financial · LifeLens
            </span>
          </motion.div>

          <motion.nav
            className="flex items-center gap-2 text-sm"
            initial={{ opacity: 0, y: -12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1, duration: 0.5 }}
          >
            {hasExistingInsights && onViewInsights && (
              <Button
                onClick={onViewInsights}
                variant="outline"
                className="rounded-full border-[#E7DADA] bg-white px-4 py-2 text-sm font-semibold text-[#7F1527] hover:bg-[#F9EDEA]"
              >
                My Plan
              </Button>
            )}
            <Button
              onClick={onLogin}
              variant="ghost"
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#7F1527] hover:bg-[#F9EDEA]"
            >
              <LogIn className="mr-2 h-4 w-4" /> Log in
            </Button>
            <Button
              onClick={onSignup}
              className="rounded-full bg-[#A41E34] px-5 py-2 text-sm font-semibold text-white shadow-lg shadow-[#A41E34]/20 transition hover:bg-[#7F1527]"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Sign up
            </Button>
          </motion.nav>
        </header>

        {/* Hero */}
        <main className="grid flex-1 grid-cols-1 items-center gap-10 py-10 md:grid-cols-2">
          {/* Left copy */}
          <div className="order-2 max-w-xl md:order-1 md:justify-self-start">
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.5em] text-[#A41E34]/80"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
            >
              AI-Powered Financial Guidance
            </motion.p>
            <motion.h1
              className="mt-3 text-4xl font-semibold leading-tight text-[#1E0D0E] sm:text-5xl"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
            >
              Your personalized financial roadmap starts here.
            </motion.h1>
            <motion.p
              className="mt-4 max-w-lg text-base text-[#4D3B3B] sm:text-lg"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1, duration: 0.6 }}
            >
              Get clear, actionable guidance on benefits, savings, and financial protection tailored to your life and
              goals.
            </motion.p>

            <motion.div
              className="mt-6 flex flex-col gap-3 sm:flex-row"
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.6 }}
            >
              <Button
                size="lg"
                className="w-full rounded-full bg-[#A41E34] py-6 text-base font-semibold text-white shadow-lg shadow-[#A41E34]/25 transition hover:bg-[#7F1527] sm:w-auto sm:px-10"
                onClick={quizCompleted ? onViewInsights ?? onStart : onStart}
              >
                {quizCompleted ? "Open insights" : "Start now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onDemo ?? onStart}
                className="w-full rounded-full border-[#E7DADA] bg-white py-6 text-base font-semibold text-[#7F1527] hover:bg-[#F9EDEA] sm:w-auto sm:px-8"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Try 2-min demo
              </Button>
            </motion.div>

            {/* Social proof on mobile */}
            <div className="mt-6 grid grid-cols-3 gap-3 md:hidden">
              {SPOTLIGHTS.map(({ stat, label, Icon }) => (
                <div key={stat} className="rounded-2xl border border-[#E7DADA] bg-white p-3 text-left shadow-sm">
                  <div className="mb-1 flex items-center gap-2">
                    <Icon className="h-4 w-4 text-[#7F1527]" />
                    <p className="text-lg font-semibold text-[#1E0D0E]">{stat}</p>
                  </div>
                  <p className="text-[11px] leading-snug text-[#7F1527]">{label}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Right: Static, elegant preview panel (no carousel) */}
          <motion.div
            className="order-1 md:order-2 md:justify-self-end"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="relative mx-auto w-full max-w-[560px] overflow-hidden rounded-[28px] border border-[#E7DADA] bg-white shadow-2xl">
              {/* Top bar */}
              <div className="flex items-center justify-between border-b border-[#F0E6E7] px-5 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F56565]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#F6E05E]" />
                  <span className="h-2.5 w-2.5 rounded-full bg-[#48BB78]" />
                </div>
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7F1527]">Preview</p>
                <div className="h-4 w-8 rounded bg-[#F5EFEF]" />
              </div>

              {/* Content */}
              <div className="grid gap-4 p-5 sm:p-6">
                {/* Highlights row */}
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
                  {[
                    { title: "Smarter choices", body: "AI compares plans & costs" },
                    { title: "Understand spend", body: "Clear yearly projections" },
                    { title: "Enroll faster", body: "Actionable checklist" },
                  ].map((f) => (
                    <div
                      key={f.title}
                      className="rounded-2xl border border-[#E7DADA] bg-white p-4 shadow-sm"
                    >
                      <p className="text-sm font-semibold text-[#1E0D0E]">{f.title}</p>
                      <p className="mt-1 text-xs text-[#4D3B3B]">{f.body}</p>
                    </div>
                  ))}
                </div>

                {/* Mock “Plans vs Costs vs Checklist” panel */}
                <div className="rounded-2xl border border-[#E7DADA] bg-[#FBF7F6] p-4 sm:p-5">
                  <div className="mb-4 flex flex-wrap gap-2">
                    {[
                      { key: "plans", label: "Plans" },
                      { key: "costs", label: "Costs" },
                      { key: "checklist", label: "Checklist" },
                    ].map((t) => (
                      <span
                        key={t.key}
                        className={
                          "inline-flex items-center rounded-full border px-3 py-1.5 text-xs font-semibold " +
                          (activeTab === t.key
                            ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                            : "border-[#E3D8D5] bg-white text-[#7F1527]")
                        }
                      >
                        {t.label}
                      </span>
                    ))}
                  </div>

                  {/* Preview rows */}
                  <div className="space-y-3">
                    {[
                      {
                        title: "HSA-eligible PPO vs HDHP",
                        meta: "Side-by-side premiums, deductibles, OOP max",
                      },
                      {
                        title: "Projected annual spend",
                        meta: "Includes employer HSA match & tax savings",
                      },
                      {
                        title: "Your next steps",
                        meta: "Verify dependents • Tobacco attestation • Beneficiaries",
                      },
                    ].map((row) => (
                      <div
                        key={row.title}
                        className="flex items-start justify-between rounded-xl border border-[#F0E6E7] bg-white px-4 py-3"
                      >
                        <div>
                          <p className="text-sm font-semibold text-[#1E0D0E]">{row.title}</p>
                          <p className="text-xs text-[#7F1527]">{row.meta}</p>
                        </div>
                        <CheckCircle2 className="mt-1 h-4 w-4 flex-none text-[#A41E34]" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </main>

        {/* Trust / metrics (desktop) */}
        <section className="mt-4 hidden md:block">
          <div className="grid grid-cols-3 gap-4">
            {SPOTLIGHTS.map(({ stat, label, Icon }) => (
              <motion.div
                key={stat}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5 }}
                className="rounded-3xl border border-[#E7DADA] bg-white p-5 text-left shadow-md"
              >
                <div className="mb-1 flex items-center gap-2 text-[#1E0D0E]">
                  <Icon className="h-4 w-4 text-[#7F1527]" />
                  <p className="text-2xl font-semibold">{stat}</p>
                </div>
                <p className="text-sm text-[#7F1527]">{label}</p>
              </motion.div>
            ))}
          </div>
        </section>

        {/* Feature bullets */}
        <section className="mt-12">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[
              { title: "Smarter choices", body: "AI compares plans, costs & risk so you don't have to." },
              { title: "Built for privacy", body: "Your data stays encrypted. You choose what to share." },
              { title: "Mobile-first", body: "Fast, thumb-friendly UI with offline-safe states." },
            ].map((f) => (
              <div key={f.title} className="rounded-2xl border border-[#E7DADA] bg-white p-5 shadow-sm">
                <p className="text-base font-semibold text-[#1E0D0E]">{f.title}</p>
                <p className="mt-1 text-sm text-[#4D3B3B]">{f.body}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Sticky mobile CTA */}
        <div className="fixed inset-x-0 bottom-0 z-40 mx-auto block max-w-6xl p-4 md:hidden">
          <div className="rounded-2xl border border-[#E7DADA] bg-white/90 p-3 backdrop-blur">
            <div className="flex items-center gap-2">
              <Button
                onClick={quizCompleted ? onViewInsights ?? onStart : onStart}
                className="flex-1 rounded-full bg-[#A41E34] py-6 text-base font-semibold text-white shadow-lg shadow-[#A41E34]/25 hover:bg-[#7F1527]"
              >
                {quizCompleted ? "Open insights" : "Start now"}
              </Button>
              <Button
                onClick={onDemo ?? onStart}
                variant="outline"
                className="rounded-full border-[#E7DADA] bg-white px-4 py-6 text-[#7F1527] hover:bg-[#F9EDEA]"
              >
                <Play className="h-5 w-5" />
              </Button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-16 border-t border-[#E7DADA] pt-6 text-xs text-[#7F1527]">
          <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
            <p>© {new Date().getFullYear()} LifeLens • All rights reserved</p>
            <div className="flex items-center gap-4">
              <button className="hover:text-[#2A1A1A]">Privacy</button>
              <button className="hover:text-[#2A1A1A]">Security</button>
              <button className="hover:text-[#2A1A1A]">Terms</button>
            </div>
          </div>
        </footer>
      </div>
    </div>
  )
}
