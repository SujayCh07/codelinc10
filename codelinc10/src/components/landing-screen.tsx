"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  ArrowRight,
  LogIn,
  UserPlus,
  ShieldCheck,
  Clock,
  Stars,
  Sparkles,
  Info,
  HelpCircle,
} from "lucide-react"
import { Card } from "@/components/ui/card"
import { AuthModal } from "@/components/auth-modal"

export default function LandingScreen({ onStart, onViewInsights, quizCompleted, onAuth }: {
  onStart: () => void
  onViewInsights?: () => void
  quizCompleted?: boolean
  onAuth?: (userId: string, email: string, fullName?: string, profileData?: Record<string, unknown>) => void
}) {
  const [showAuthModal, setShowAuthModal] = useState(false)

  const SPOTLIGHTS = [
    { stat: "92%", label: "feel more confident after onboarding", Icon: Stars },
    { stat: "<2 min", label: "to get your first AI-guided plan", Icon: Clock },
    { stat: "5k+", label: "employers rely on FinMate insights", Icon: ShieldCheck },
  ]

  const faqs = [
    {
      question: "How does FinMate work?",
      answer:
        "FinMate uses AI to analyze your life situation, financial goals, and priorities. It generates personalized recommendations, helping you understand which benefits and financial actions matter most right now.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. All data is encrypted and stored securely. We follow strict data protection standards and never share your personal information. You can delete your data at any time from your settings.",
    },
    {
      question: "What makes FinMate different?",
      answer:
        "Unlike generic tools, FinMate bridges your personal life context with actionable financial guidance, simplifying how people understand their benefits and financial path.",
    },
    {
      question: "Can I use FinMate as a guest?",
      answer:
        "Yes! You can try FinMate as a guest without an account. However, your data won't persist across sessions unless you sign up.",
    },
    {
      question: "When should I reassess?",
      answer:
        "We recommend reassessing whenever you have a major life change (new job, marriage, relocation, etc.) or at least once a year to stay aligned with your current situation.",
    },
  ]

  const handleAuthSuccess = (userId: string, email: string, fullName?: string) => {
    setShowAuthModal(false)
    if (onAuth) {
      onAuth(userId, email, fullName)
    }
    // Navigate to insights if they have existing data
    if (onViewInsights) {
      onViewInsights()
    }
  }

  return (
    <div className="relative min-h-screen overflow-hidden bg-white text-[#1E0D0E]">
      {/* Top Gradient */}
      <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[380px] bg-gradient-to-b from-[#FDF4EF] via-[#F8E3DC] to-transparent" />

      <div className="relative mx-auto flex min-h-screen w-full max-w-6xl flex-col px-5 pb-20 pt-6 sm:px-8">
        {/* HEADER */}
        <header className="flex items-center justify-between">
          <motion.span
            className="hidden text-s font-semibold uppercase tracking-[0.35em] text-[#7F1527]/80 md:block"
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
          >
            Lincoln Financial ·{" "}
            <span className="text-[#A41E34] font-extrabold drop-shadow-[0_0_8px_rgba(164,30,52,0.35)]">
              FinMate
            </span>
          </motion.span>

          <nav className="flex items-center gap-2 text-sm">
            <Button
              onClick={() => setShowAuthModal(true)}
              variant="ghost"
              className="rounded-full px-4 py-2 text-sm font-semibold text-[#7F1527] hover:bg-[#F9EDEA]"
            >
              <LogIn className="mr-2 h-4 w-4" /> Log in
            </Button>
            <Button
              onClick={onStart}
              className="rounded-full bg-[#A41E34] px-5 py-2 text-sm font-semibold text-white shadow-md shadow-[#A41E34]/25 hover:bg-[#7F1527]"
            >
              <UserPlus className="mr-2 h-4 w-4" /> Sign up
            </Button>
          </nav>
        </header>

        {/* HERO */}
        <main className="flex flex-col items-center gap-10 py-8 md:grid md:grid-cols-2 md:gap-12 md:py-14">
          <div className="w-full max-w-xl md:order-1 md:justify-self-start">
            <motion.p
              className="text-xs font-semibold uppercase tracking-[0.5em] text-[#A41E34]/80"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
            >
              AI-Powered Financial Guidance
            </motion.p>
            <h1 className="mt-2 text-4xl font-semibold leading-tight text-[#1E0D0E] sm:text-5xl">
              Your personalized financial roadmap starts here.
            </h1>
            <p className="mt-3 max-w-lg text-base text-[#4D3B3B] sm:text-lg">
              Get clear, actionable guidance on benefits, savings, and financial protection tailored to your life and
              goals.
            </p>

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <Button
                size="lg"
                className="w-full rounded-full bg-[#A41E34] py-6 text-base font-semibold text-white shadow-lg shadow-[#A41E34]/25 hover:bg-[#7F1527] sm:w-auto sm:px-10"
                onClick={quizCompleted ? onViewInsights ?? onStart : onStart}
              >
                {quizCompleted ? "Open insights" : "Start now"}
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
              <Button
                size="lg"
                variant="outline"
                onClick={onStart}
                className="w-full rounded-full border-[#E7DADA] bg-white py-6 text-base font-semibold text-[#7F1527] hover:bg-[#F9EDEA] sm:w-auto sm:px-8"
              >
                <Sparkles className="mr-2 h-5 w-5" /> Try 2-min demo
              </Button>
            </div>
          </div>

          {/* RIGHT: Preview */}
          <motion.div
            className="w-full md:order-2 md:justify-self-end mt-2 md:mt-0"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <div className="relative mx-auto w-full max-w-[540px] overflow-hidden rounded-[28px] border border-[#E7DADA] bg-white shadow-xl">
              <div className="flex items-center justify-between border-b border-[#F0E6E7] px-5 py-3">
                <p className="text-xs font-semibold uppercase tracking-[0.25em] text-[#7F1527]">Preview</p>
              </div>

              <div className="grid gap-4 p-5 sm:p-6">
                {[
                  {
                    title: "Compare health plans",
                    body: "See PPO, HMO, and HDHP options — premiums, deductibles, and OOP limits in one place.",
                  },
                  {
                    title: "Evaluate dental coverage",
                    body: "Understand preventive care, orthodontics, and cost differences across dental plans.",
                  },
                  {
                    title: "Understand vision benefits",
                    body: "Compare eyewear allowances, copays, and network coverage for you and your dependents.",
                  },
                ].map((f) => (
                  <div
                    key={f.title}
                    className="rounded-2xl border border-[#E7DADA] bg-white p-4 shadow-sm hover:shadow-md transition-shadow"
                  >
                    <p className="text-sm font-semibold text-[#1E0D0E]">{f.title}</p>
                    <p className="mt-1 text-xs text-[#4D3B3B]">{f.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        </main>

        {/* STATS */}
        <section className="mt-6 hidden md:block">
          <div className="grid grid-cols-3 gap-4">
            {SPOTLIGHTS.map(({ stat, label, Icon }) => (
              <div
                key={stat}
                className="rounded-3xl border border-[#E7DADA] bg-white p-5 shadow-md flex flex-col"
              >
                <div className="mb-1 flex items-center gap-2">
                  <Icon className="h-4 w-4 text-[#7F1527]" />
                  <p className="text-2xl font-semibold text-[#1E0D0E]">{stat}</p>
                </div>
                <p className="text-sm text-[#7F1527]">{label}</p>
              </div>
            ))}
          </div>
        </section>

        {/* === ABOUT + FAQ SECTION === */}
        <div className="mt-20 space-y-10">
          <Card className="p-6 border-[#E7DADA]">
            <div className="flex items-center gap-3 mb-4">
              <Info className="w-6 h-6 text-[#A41E34]" />
              <h2 className="text-2xl font-bold">About FinMate</h2>
            </div>
            <p className="text-sm text-[#4D3B3B] leading-relaxed">
              FinMate bridges personal context with real financial action, simplifying how people understand their
              benefits and financial path. Built to empower financial well-being, FinMate transforms how employees and
              individuals navigate major life changes by translating their unique situations into tailored advice and
              priorities.
            </p>
          </Card>

          <Card className="p-6 border-[#E7DADA]">
            <div className="flex items-center gap-3 mb-4">
              <HelpCircle className="w-6 h-6 text-[#A41E34]" />
              <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
            </div>
            <div className="space-y-4">
              {faqs.map((faq, i) => (
                <div key={i} className="border-b border-[#E7DADA] pb-4 last:border-b-0">
                  <h3 className="font-semibold text-[#1E0D0E] mb-2">{faq.question}</h3>
                  <p className="text-sm text-[#4D3B3B] leading-relaxed">{faq.answer}</p>
                </div>
              ))}
            </div>
          </Card>

          <div className="text-center text-xs text-[#7F1527] space-y-1">
            <p>Powered by AWS Bedrock · Built for Lincoln Financial</p>
            <p>© 2025 FinMate. Empowering financial well-being through AI.</p>
          </div>
        </div>
      </div>

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          onClose={() => setShowAuthModal(false)}
          onAuth={handleAuthSuccess}
          onGuestContinue={() => {
            setShowAuthModal(false)
            onStart()
          }}
        />
      )}
    </div>
  )
}
