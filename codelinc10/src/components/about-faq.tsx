"use client"

import { Card } from "@/components/ui/card"
import { Info, HelpCircle, Shield, Cpu, Database, Zap } from "lucide-react"

export function AboutFaq() {
  const faqs = [
    {
      question: "How does LifeLens work?",
      answer:
        "LifeLens uses AI to analyze your life situation, financial goals, and priorities. It then generates personalized recommendations based on your unique circumstances, helping you understand which benefits and financial actions matter most right now.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes. All data is encrypted and stored securely. We follow industry best practices for data protection and never share your personal information with third parties. You can delete your data at any time from the Profile & Settings page.",
    },
    {
      question: "What makes LifeLens different?",
      answer:
        "Unlike generic financial advice, LifeLens understands your life context. It bridges personal circumstances with actionable financial guidance, simplifying how people understand their benefits and financial path.",
    },
    {
      question: "Can I use LifeLens as a guest?",
      answer:
        "Yes! You can try LifeLens as a guest without creating an account. However, your data won't be saved between sessions. Create an account to save your profile and track your journey over time.",
    },
    {
      question: "How often should I reassess?",
      answer:
        "We recommend reassessing whenever you experience a major life change (new job, marriage, baby, relocation, etc.) or at least once a year to ensure your financial priorities stay aligned with your current situation.",
    },
  ]

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* About Section */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center">
              <Info className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">About LifeLens</h1>
              <p className="text-muted-foreground">Our mission and technology</p>
            </div>
          </div>
        </div>

        {/* Mission */}
        <Card className="glass p-6">
          <h2 className="text-2xl font-bold mb-4">Our Mission</h2>
          <p className="text-muted-foreground leading-relaxed mb-4">
            LifeLens bridges personal context with real financial action, simplifying how people understand their
            benefits and financial path. We believe that every life event deserves clear financial guidance, and that AI
            can help make complex financial decisions more accessible and personalized.
          </p>
          <p className="text-muted-foreground leading-relaxed">
            Built for Lincoln Financial's mission to empower financial well-being, LifeLens transforms how employees and
            individuals navigate major life changes by translating their unique situations into tailored advice,
            priorities, and actionable next steps.
          </p>
        </Card>

        {/* How It Works */}
        <Card className="glass p-6">
          <h2 className="text-2xl font-bold mb-4">How It Works</h2>
          <div className="space-y-4">
            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">1</span>
              </div>
              <div>
                <h3 className="font-bold mb-1">You Share Your Story</h3>
                <p className="text-sm text-muted-foreground">
                  Tell us about your life situation, financial confidence, and goals through our simple 3-step
                  enrollment.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">2</span>
              </div>
              <div>
                <h3 className="font-bold mb-1">AI Analyzes Your Needs</h3>
                <p className="text-sm text-muted-foreground">
                  Our AI (powered by AWS Bedrock) processes your information to understand your unique financial persona
                  and priorities.
                </p>
              </div>
            </div>

            <div className="flex gap-4">
              <div className="flex-shrink-0 w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <span className="font-bold text-primary">3</span>
              </div>
              <div>
                <h3 className="font-bold mb-1">Get Personalized Guidance</h3>
                <p className="text-sm text-muted-foreground">
                  Receive ranked priorities, actionable recommendations, and curated learning resources tailored to your
                  situation.
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* Architecture */}
        <Card className="glass p-6">
          <h2 className="text-2xl font-bold mb-4">Technology & Architecture</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-blue-500/10 flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-blue-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">AI-Powered Analysis</h3>
                <p className="text-sm text-muted-foreground">
                  AWS Bedrock (Claude 4) for intelligent persona classification and priority ranking
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-green-500/10 flex items-center justify-center">
                  <Database className="w-5 h-5 text-green-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Secure Storage</h3>
                <p className="text-sm text-muted-foreground">
                  Encrypted local storage with optional cloud sync for profile and insights
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-purple-500/10 flex items-center justify-center">
                  <Zap className="w-5 h-5 text-purple-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Real-Time Processing</h3>
                <p className="text-sm text-muted-foreground">
                  Instant analysis and recommendations with sub-3-second response times
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <div className="flex-shrink-0">
                <div className="w-10 h-10 rounded-full bg-amber-500/10 flex items-center justify-center">
                  <Shield className="w-5 h-5 text-amber-500" />
                </div>
              </div>
              <div>
                <h3 className="font-semibold mb-1">Privacy First</h3>
                <p className="text-sm text-muted-foreground">
                  End-to-end encryption, no third-party data sharing, user-controlled deletion
                </p>
              </div>
            </div>
          </div>
        </Card>

        {/* FAQ */}
        <Card className="glass p-6">
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className="w-6 h-6 text-primary" />
            <h2 className="text-2xl font-bold">Frequently Asked Questions</h2>
          </div>
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className="pb-4 border-b last:border-b-0">
                <h3 className="font-bold mb-2">{faq.question}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </Card>

        {/* Footer */}
        <div className="text-center text-sm text-muted-foreground space-y-2">
          <p>Powered by AWS Bedrock · Built for Lincoln Financial</p>
          <p>© 2025 LifeLens. Empowering financial well-being through AI.</p>
        </div>
      </div>
    </div>
  )
}
