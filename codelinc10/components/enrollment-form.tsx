"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Slider } from "@/components/ui/slider"
import { ChevronRight, ChevronLeft, Loader2 } from "lucide-react"

interface EnrollmentFormProps {
  onComplete: (profile: any) => void
  existingProfile: any
}

export function EnrollmentForm({ onComplete, existingProfile }: EnrollmentFormProps) {
  const [step, setStep] = useState(1)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  const [formData, setFormData] = useState({
    name: existingProfile?.name || "",
    ageRange: existingProfile?.ageRange || "25-34",
    employmentType: existingProfile?.employmentType || "Employee",
    householdSize: existingProfile?.householdSize || 1,
    dependents: existingProfile?.dependents || 0,
    financialConfidence: existingProfile?.financialConfidence || 50,
    stressLevel: existingProfile?.stressLevel || 50,
    lifeEvents: existingProfile?.lifeEvents || [],
    lifeDescription: existingProfile?.lifeDescription || "",
    goals: existingProfile?.goals || [],
  })

  const lifeEventOptions = ["New job", "Marriage", "Baby", "Relocation", "Retirement", "Illness"]

  const goalOptions = [
    "Lower monthly expenses",
    "Save for family / retirement",
    "Maximize employer benefits",
    "Understand insurance options",
    "Reduce debt or financial anxiety",
  ]

  const handleSubmit = async () => {
    setIsAnalyzing(true)

    const aiPersona = determinePersona(formData)

    const profile = {
      ...formData,
      aiPersona,
      isGuest: !formData.name,
      createdAt: new Date().toISOString(),
    }

    await onComplete(profile)
  }

  const determinePersona = (data: typeof formData) => {
    if (data.lifeEvents.includes("New job") && data.ageRange === "25-34") {
      return "New Professional"
    }
    if (data.lifeEvents.includes("Baby") || data.lifeEvents.includes("Marriage")) {
      return "Family Builder"
    }
    if (data.lifeEvents.includes("Retirement")) {
      return "Transitioning Retiree"
    }
    if (data.stressLevel > 70) {
      return "Financial Stabilizer"
    }
    return "Career Advancer"
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-2xl">
        {/* Progress indicator */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            {[1, 2, 3].map((s) => (
              <div key={s} className="flex items-center flex-1">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition-all ${
                    s <= step ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                  }`}
                >
                  {s}
                </div>
                {s < 3 && (
                  <div className={`flex-1 h-1 mx-2 rounded transition-all ${s < step ? "bg-primary" : "bg-muted"}`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground">
            <span>Basic Info</span>
            <span>Life Situation</span>
            <span>Goals</span>
          </div>
        </div>

        {/* Form card */}
        <div className="glass-strong rounded-2xl p-8 shadow-2xl">
          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-16 gap-4">
              <Loader2 className="w-12 h-12 animate-spin text-primary" />
              <h3 className="text-2xl font-bold text-center">Analyzing your situation...</h3>
              <p className="text-muted-foreground text-center">Creating your personalized plan</p>
            </div>
          ) : (
            <>
              {/* Step 1: Basic Info */}
              {step === 1 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">Tell us about yourself</h2>
                    <p className="text-muted-foreground">Help us personalize your experience</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name">Name (optional)</Label>
                      <Input
                        id="name"
                        placeholder="Your name"
                        value={formData.name}
                        onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                        className="mt-1"
                      />
                    </div>

                    <div>
                      <Label htmlFor="ageRange">Age Range</Label>
                      <select
                        id="ageRange"
                        value={formData.ageRange}
                        onChange={(e) => setFormData({ ...formData, ageRange: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
                      >
                        <option value="18-24">18-24</option>
                        <option value="25-34">25-34</option>
                        <option value="35-44">35-44</option>
                        <option value="45-54">45-54</option>
                        <option value="55-64">55-64</option>
                        <option value="65+">65+</option>
                      </select>
                    </div>

                    <div>
                      <Label htmlFor="employmentType">Employment Type</Label>
                      <select
                        id="employmentType"
                        value={formData.employmentType}
                        onChange={(e) => setFormData({ ...formData, employmentType: e.target.value })}
                        className="w-full mt-1 px-3 py-2 rounded-lg border border-input bg-background"
                      >
                        <option value="Employee">Employee</option>
                        <option value="Freelancer">Freelancer</option>
                        <option value="Retired">Retired</option>
                      </select>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="householdSize">Household Size</Label>
                        <Input
                          id="householdSize"
                          type="number"
                          min="1"
                          value={formData.householdSize}
                          onChange={(e) => setFormData({ ...formData, householdSize: Number.parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                      <div>
                        <Label htmlFor="dependents">Dependents</Label>
                        <Input
                          id="dependents"
                          type="number"
                          min="0"
                          value={formData.dependents}
                          onChange={(e) => setFormData({ ...formData, dependents: Number.parseInt(e.target.value) })}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div>
                      <Label>Financial Confidence: {formData.financialConfidence}%</Label>
                      <Slider
                        value={[formData.financialConfidence]}
                        onValueChange={([value]) => setFormData({ ...formData, financialConfidence: value })}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Not confident</span>
                        <span>Very confident</span>
                      </div>
                    </div>

                    <div>
                      <Label>Stress Level: {formData.stressLevel}%</Label>
                      <Slider
                        value={[formData.stressLevel]}
                        onValueChange={([value]) => setFormData({ ...formData, stressLevel: value })}
                        max={100}
                        step={1}
                        className="mt-2"
                      />
                      <div className="flex justify-between text-xs text-muted-foreground mt-1">
                        <span>Low stress</span>
                        <span>High stress</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Step 2: Life Situation */}
              {step === 2 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">What's happening in your life?</h2>
                    <p className="text-muted-foreground">Select all that apply</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Recent Life Events</Label>
                      <div className="grid grid-cols-2 gap-3 mt-2">
                        {lifeEventOptions.map((event) => (
                          <button
                            key={event}
                            onClick={() => {
                              const updated = formData.lifeEvents.includes(event)
                                ? formData.lifeEvents.filter((e) => e !== event)
                                : [...formData.lifeEvents, event]
                              setFormData({ ...formData, lifeEvents: updated })
                            }}
                            className={`p-4 rounded-lg border-2 transition-all text-left ${
                              formData.lifeEvents.includes(event)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="font-medium">{event}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="lifeDescription">Tell us more (optional)</Label>
                      <Textarea
                        id="lifeDescription"
                        placeholder="Describe what's going on in your life..."
                        value={formData.lifeDescription}
                        onChange={(e) => setFormData({ ...formData, lifeDescription: e.target.value })}
                        className="mt-1 min-h-[120px]"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Step 3: Goals & Priorities */}
              {step === 3 && (
                <div className="space-y-6 animate-fade-in">
                  <div>
                    <h2 className="text-3xl font-bold mb-2">What are your priorities?</h2>
                    <p className="text-muted-foreground">Select all that matter to you</p>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <Label>Financial Goals</Label>
                      <div className="space-y-3 mt-2">
                        {goalOptions.map((goal) => (
                          <button
                            key={goal}
                            onClick={() => {
                              const updated = formData.goals.includes(goal)
                                ? formData.goals.filter((g) => g !== goal)
                                : [...formData.goals, goal]
                              setFormData({ ...formData, goals: updated })
                            }}
                            className={`w-full p-4 rounded-lg border-2 transition-all text-left ${
                              formData.goals.includes(goal)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-primary/50"
                            }`}
                          >
                            <span className="font-medium">{goal}</span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation buttons */}
              <div className="flex justify-between mt-8 pt-6 border-t">
                {step > 1 && (
                  <Button variant="outline" onClick={() => setStep(step - 1)} className="gap-2">
                    <ChevronLeft className="w-4 h-4" />
                    Back
                  </Button>
                )}
                {step < 3 ? (
                  <Button onClick={() => setStep(step + 1)} className="ml-auto gap-2">
                    Next
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                ) : (
                  <Button onClick={handleSubmit} className="ml-auto gap-2 bg-primary">
                    Analyze My Situation
                    <ChevronRight className="w-4 h-4" />
                  </Button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
