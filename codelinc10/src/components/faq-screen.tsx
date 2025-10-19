"use client"

import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { HelpCircle, Github, ExternalLink, Users, Zap, Shield, Cpu } from "lucide-react"

interface FaqScreenProps {
  onBack: () => void
}

export function FaqScreen({ onBack }: FaqScreenProps) {
  const faqs = [
    {
      question: "How does FinMate work?",
      answer:
        "FinMate uses advanced AI (Claude 4 via AWS Bedrock) to analyze your life situation and generate personalized financial guidance. Simply describe what's happening in your life, and we'll provide tailored benefit recommendations and action steps.",
    },
    {
      question: "Is my data secure?",
      answer:
        "Yes! We use AWS Cognito for authentication and store data securely in AWS S3. Guest sessions are stored locally on your device. We never share your personal information with third parties.",
    },
    {
      question: "What makes FinMate different?",
      answer:
        "Unlike generic financial tools, FinMate understands context. We translate everyday language into actionable financial advice, making benefits accessible to everyone regardless of financial literacy.",
    },
    {
      question: "Can I use FinMate without signing up?",
      answer:
        "You can use FinMate as a guest. Your insights will be saved locally on your device. Sign up to sync across devices and access additional features.",
    },
  ]

  const features = [
    {
      icon: Zap,
      title: "AI-Powered",
      description: "Claude 4 via AWS Bedrock for intelligent insights",
    },
    {
      icon: Shield,
      title: "Secure",
      description: "AWS Cognito authentication & S3 storage",
    },
    {
      icon: Cpu,
      title: "Scalable",
      description: "Built on AWS serverless architecture",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 pb-4">
      <div className="container max-w-4xl mx-auto px-4 py-6">
        <div className="mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="glass rounded-full p-3">
              <HelpCircle className="w-6 h-6 text-primary" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold">About FinMate</h1>
              <p className="text-sm text-muted-foreground">Built at CodeLinc 10 Hackathon</p>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <Card className="glass-strong p-6 border border-border/50">
            <h2 className="text-xl font-bold mb-3">Our Mission</h2>
            <p className="text-muted-foreground leading-relaxed mb-4">
              FinMate was created to make financial benefits accessible and understandable for everyone. We believe
              that navigating life's biggest moments shouldn't require a finance degree. Our AI-powered platform
              translates complex benefits into clear, actionable guidance tailored to your unique situation.
            </p>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="w-4 h-4" />
              <span>Built with AWS Bedrock, Expo, and RDS</span>
            </div>
          </Card>

          <div>
  <h2 className="text-xl font-bold mb-6 text-center">Key Features</h2>
  <div className="grid md:grid-cols-3 gap-6">
    {features.map((feature, index) => {
      const Icon = feature.icon
      return (
        <Card
          key={index}
          className="glass-strong flex flex-col items-center justify-start p-6 border border-border/50 text-center transition hover:shadow-md hover:-translate-y-1"
        >
          <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-primary/10 text-primary ">
            <Icon className="w-7 h-7" />
          </div>
          <h3 className="font-semibold text-lg">{feature.title}</h3>
          <p className="text-sm text-muted-foreground leading-relaxed">{feature.description}</p>
        </Card>
      )
    })}
  </div>
</div>


          <div>
            <h2 className="text-xl font-bold mb-4">Frequently Asked Questions</h2>
            <div className="space-y-3">
              {faqs.map((faq, index) => (
                <Card key={index} className="glass-strong p-5 border border-border/50">
                  <h3 className="font-bold text-base">{faq.question}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">{faq.answer}</p>
                </Card>
              ))}
            </div>
          </div>

          <Card className="glass-strong p-6 border border-border/50">
            <h2 className="text-xl font-bold ">How It Works</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  1
                </div>
                <div>
                  <h3 className="font-bold ">Share Your Situation</h3>
                  <p className="text-sm text-muted-foreground">
                    Tell us what's happening in your life in plain English
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  2
                </div>
                <div>
                  <h3 className="font-bold mb-1">AI Analysis</h3>
                  <p className="text-sm text-muted-foreground">
                    Claude 4 interprets your situation and generates personalized recommendations
                  </p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center font-bold text-sm">
                  3
                </div>
                <div>
                  <h3 className="font-bold mb-1">Get Your Action Plan</h3>
                  <p className="text-sm text-muted-foreground">
                    Receive tailored insights, benefits, and a timeline to optimize your financial wellness
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <div className="flex flex-col sm:flex-row gap-3">
            <Button variant="outline" className="glass flex-1 touch-manipulation bg-transparent" asChild>
              <a href="https://github.com/SujayCh07/codelinc10" target="_blank" rel="noopener noreferrer">
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
                <ExternalLink className="w-3 h-3 ml-2" />
              </a>
            </Button>
            <Button variant="outline" className="glass flex-1 touch-manipulation bg-transparent" asChild>
              <a href="https://devpost.com/software/1088807" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="w-4 h-4 mr-2" />
                DevPost Submission
              </a>
            </Button>
          </div>

          <div className="text-center text-sm text-muted-foreground">
            <p>Built with ❤️ at CodeLinc 10 Hackathon</p>
            <p className="mt-1">Powered by AWS Bedrock, Lincoln Financial, and innovative thinking</p>
          </div>
        </div>
      </div>
    </div>
  )
}
