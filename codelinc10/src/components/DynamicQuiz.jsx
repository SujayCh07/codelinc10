"use client"

import { useEffect, useMemo, useState } from "react"
import { AnimatePresence, motion } from "framer-motion"
import { ArrowLeft, ArrowRight, Sparkles } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import {
  ACTIVITY_OPTIONS,
  initializeQuizState,
  questionsFor,
  updateFormValue,
  type QuizQuestion,
  type QuizQuestionType,
} from "@/lib/quiz"
import { withDerivedMetrics } from "@/lib/insights"
import type { EnrollmentFormData } from "@/lib/types"
import { cn } from "@/lib/utils"

interface DynamicQuizProps {
  initialData: EnrollmentFormData
  onComplete: (data: EnrollmentFormData) => Promise<void> | void
  onBack: () => void
  onUpdate?: (data: EnrollmentFormData) => void
}

const QUESTION_TYPE_LABEL: Record<QuizQuestionType, string> = {
  text: "Text",
  number: "Number",
  date: "Date",
  select: "Select",
  slider: "Slider",
  boolean: "Toggle",
  "multi-select": "Multi select",
}

export function DynamicQuiz({ initialData, onComplete, onBack, onUpdate }: DynamicQuizProps) {
  const [answers, setAnswers] = useState<EnrollmentFormData>(() => initializeQuizState(initialData))
  const [index, setIndex] = useState(0)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    setAnswers(initializeQuizState(initialData))
    setIndex(0)
  }, [initialData])

  const flow = useMemo(() => questionsFor(answers), [answers])
  const current = flow[index]

  useEffect(() => {
    onUpdate?.(answers)
  }, [answers, onUpdate])

  useEffect(() => {
    if (index > flow.length - 1) {
      setIndex(Math.max(0, flow.length - 1))
    }
  }, [flow.length, index])

  const progress = flow.length ? ((index + 1) / flow.length) * 100 : 0

  const handleValueChange = (value: string | number | boolean | string[] | null) => {
    if (!current) return
    const updated = withDerivedMetrics(updateFormValue(answers, current.id, value))
    if (current.id === "fullName" && !updated.preferredName) {
      const fallback = typeof value === "string" ? value.split(" ")[0] : ""
      updated.preferredName = fallback
    }
    setAnswers(updated)
  }

  const goNext = () => {
    if (index < flow.length - 1) {
      setIndex(index + 1)
    }
  }

  const goPrevious = () => {
    if (index > 0) {
      setIndex(index - 1)
    } else {
      onBack()
    }
  }

  const valueForQuestion = () => {
    if (!current) return null
    return (answers[current.id as keyof EnrollmentFormData] ?? null) as
      | string
      | number
      | boolean
      | string[]
      | null
  }

  const isCurrentValid = () => {
    if (!current) return false
    const value = valueForQuestion()
    if (current.type === "text") {
      return typeof value === "string" && value.trim().length > 0
    }
    if (current.type === "number" || current.type === "slider") {
      return typeof value === "number" && !Number.isNaN(value)
    }
    if (current.type === "date") {
      return typeof value === "string" && value.length > 0
    }
    if (current.type === "select") {
      return Boolean(value)
    }
    if (current.type === "boolean") {
      return value === true || value === false
    }
    if (current.type === "multi-select") {
      return Array.isArray(value) && value.length > 0
    }
    return false
  }

  const handleSubmit = async () => {
    const ready = withDerivedMetrics({ ...answers })
    setSubmitting(true)
    try {
      await onComplete(ready)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="relative min-h-screen bg-[#F7F4F2] text-[#2A1A1A]">
      <header className="sticky top-0 z-30 border-b border-[#E3D8D5] bg-[#F7F4F2]/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl items-center justify-between px-5 py-4">
          <button
            type="button"
            onClick={goPrevious}
            className="flex items-center gap-2 rounded-full border border-[#E3D8D5] bg-white px-4 py-2 text-sm font-semibold text-[#7F1527]"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
          <div className="text-right">
            <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#7F1527]">LifeLens quiz</p>
            <p className="text-xs text-[#7F1527]/70">
              {index + 1} of {flow.length} · {QUESTION_TYPE_LABEL[current?.type ?? "text"]}
            </p>
          </div>
        </div>
        <div className="h-1 w-full bg-[#EBDDD8]">
          <div className="h-full bg-gradient-to-r from-[#A41E34] to-[#D94E35]" style={{ width: `${progress}%` }} />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-6 px-5 py-10">
        <AnimatePresence mode="wait">
          {current && (
            <motion.section
              key={current.id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -16 }}
              transition={{ duration: 0.35 }}
              className="rounded-[32px] border border-[#E2D5D7] bg-white p-8 shadow-xl"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#A41E34]/80">
                    Question {index + 1}
                  </p>
                  <h1 className="mt-3 text-2xl font-semibold text-[#2A1A1A]">{current.title}</h1>
                  <p className="mt-3 text-sm text-[#4D3B3B]">{current.prompt}</p>
                </div>
                <Sparkles className="hidden h-8 w-8 text-[#A41E34] sm:block" />
              </div>

              <div className="mt-8">
                {renderField(current, valueForQuestion(), handleValueChange)}
                {current.id === "physicalActivities" && (
                  <p className="mt-3 text-xs text-[#7F1527]">
                    Select yes to surface activity-specific benefits in your plan.
                  </p>
                )}
              </div>
            </motion.section>
          )}
        </AnimatePresence>

        <div className="flex items-center justify-between gap-4">
          <Button
            variant="outline"
            onClick={goPrevious}
            className="rounded-full border-[#E3D8D5] text-sm font-semibold text-[#7F1527]"
          >
            Back
          </Button>

          {index < flow.length - 1 ? (
            <Button
              onClick={goNext}
              disabled={!isCurrentValid()}
              className="rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7F1527] disabled:opacity-40"
            >
              Next
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={!isCurrentValid() || submitting}
              className="rounded-full bg-[#A41E34] px-6 py-3 text-sm font-semibold text-white hover:bg-[#7F1527] disabled:opacity-40"
            >
              {submitting ? "Generating plans…" : "See my plans"}
            </Button>
          )}
        </div>
      </main>
    </div>
  )
}

function renderField(
  question: QuizQuestion,
  value: string | number | boolean | string[] | null,
  onChange: (value: string | number | boolean | string[] | null) => void
) {
  switch (question.type) {
    case "text":
      return (
        <div className="space-y-2">
          <Label className="text-sm text-[#7F1527]">Your answer</Label>
          <Input
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            placeholder={question.placeholder}
            className="rounded-2xl border-[#E3D8D5] bg-[#FBF7F6]"
          />
        </div>
      )
    case "number":
      return (
        <div className="space-y-2">
          <Label className="text-sm text-[#7F1527]">Your answer</Label>
          <Input
            type="number"
            min={question.min}
            max={question.max}
            value={typeof value === "number" ? value : value ? Number(value) : ""}
            onChange={(event) => onChange(event.target.value ? Number(event.target.value) : null)}
            className="rounded-2xl border-[#E3D8D5] bg-[#FBF7F6]"
          />
        </div>
      )
    case "date":
      return (
        <div className="space-y-2">
          <Label className="text-sm text-[#7F1527]">Employment start</Label>
          <Input
            type="date"
            value={typeof value === "string" ? value : ""}
            onChange={(event) => onChange(event.target.value)}
            className="rounded-2xl border-[#E3D8D5] bg-[#FBF7F6]"
          />
        </div>
      )
    case "select":
      return (
        <div className="flex flex-wrap gap-2">
          {question.options?.map((option) => (
            <button
              key={option.value}
              type="button"
              onClick={() => onChange(option.value)}
              className={cn(
                "rounded-full border px-4 py-2 text-sm font-semibold transition",
                value === option.value
                  ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                  : "border-[#E3D8D5] bg-[#FBF7F6] text-[#7F1527] hover:border-[#A41E34]/40"
              )}
            >
              {option.label}
            </button>
          ))}
        </div>
      )
    case "slider":
      return (
        <div className="space-y-3">
          <Slider
            min={question.min ?? 0}
            max={question.max ?? 10}
            step={question.step ?? 1}
            value={[typeof value === "number" ? value : (question.min ?? 0)]}
            onValueChange={(numbers) => onChange(numbers[0])}
          />
          <p className="text-sm font-semibold text-[#7F1527]">
            {typeof value === "number" ? value : value ? Number(value) : 0}
          </p>
        </div>
      )
    case "boolean":
      return (
        <div className="flex items-center gap-4">
          <Label className="text-sm text-[#7F1527]">No</Label>
          <Switch checked={value === true} onCheckedChange={(checked) => onChange(checked)} />
          <Label className="text-sm text-[#7F1527]">Yes</Label>
        </div>
      )
    case "multi-select":
      return (
        <div className="flex flex-wrap gap-2">
          {(question.options ?? ACTIVITY_OPTIONS).map((option) => {
            const active = Array.isArray(value) && value.includes(option.value)
            return (
              <button
                key={option.value}
                type="button"
                onClick={() => {
                  if (!Array.isArray(value)) {
                    onChange([option.value])
                    return
                  }
                  const exists = value.includes(option.value)
                  const next = exists ? value.filter((item) => item !== option.value) : [...value, option.value]
                  onChange(next)
                }}
                className={cn(
                  "rounded-full border px-4 py-2 text-sm font-semibold transition",
                  active
                    ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                    : "border-[#E3D8D5] bg-[#FBF7F6] text-[#7F1527] hover:border-[#A41E34]/40"
                )}
              >
                {option.label}
              </button>
            )
          })}
        </div>
      )
    default:
      return null
  }
}
