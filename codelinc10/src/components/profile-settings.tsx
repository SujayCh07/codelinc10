"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { FileDown, Sparkles, Trash2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import type { EnrollmentFormData, ProfileSnapshot } from "@/lib/types"
import {
  ACTIVITY_LEVEL_OPTIONS,
  ACTIVITY_OPTIONS,
  COVERAGE_OPTIONS,
  HEALTH_OPTIONS,
  HOME_OPTIONS,
  INCOME_OPTIONS,
  MARITAL_OPTIONS,
  RESIDENCY_OPTIONS,
} from "@/lib/quiz"

interface ProfileSettingsProps {
  profile: ProfileSnapshot
  onClearData: () => void
  onSendReport: () => void
  formData: EnrollmentFormData | null
  onUpdateProfile?: (next: EnrollmentFormData) => void
}

const EDUCATION_OPTIONS: EnrollmentFormData["educationLevel"][] = [
  "high-school",
  "associate",
  "bachelor",
  "master",
  "doctorate",
  "other",
]

export function ProfileSettings({
  profile,
  onClearData,
  onSendReport,
  formData,
  onUpdateProfile,
}: ProfileSettingsProps) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [draft, setDraft] = useState<EnrollmentFormData | null>(formData)

  useEffect(() => {
    setDraft(formData)
  }, [formData])

  const updateDraft = (updater: (current: EnrollmentFormData) => EnrollmentFormData) => {
    setDraft((current) => {
      if (!current) return current
      const next = updater(current)
      onUpdateProfile?.(next)
      return next
    })
  }

  const riskComfortLabel = useMemo(() => {
    if (!draft) return "—"
    const scale = ["Very low", "Low", "Moderate", "High", "Very high"]
    return scale[draft.riskComfort - 1] ?? `${draft.riskComfort}/5`
  }, [draft])

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        <div className="glass-strong rounded-2xl p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-bold">Profile & Settings</h1>
              <p className="text-muted-foreground">Manage your answers and keep your plan in sync</p>
            </div>
          </div>
        </div>

        <Card className="glass p-6">
          <h2 className="mb-4 text-xl font-bold">Snapshot</h2>
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-primary to-accent text-2xl font-bold text-white">
                {profile.name ? profile.name[0].toUpperCase() : "G"}
              </div>
              <div>
                <h3 className="text-lg font-bold">{profile.name || "Guest"}</h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Sparkles className="h-4 w-4" />
                  <span>{profile.aiPersona}</span>
                </div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3 text-sm text-muted-foreground sm:text-right">
              <div>
                <p className="font-semibold text-foreground">Risk score</p>
                <p>{profile.riskFactorScore}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Activity</p>
                <p>{profile.activitySummary || "Low impact"}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Coverage</p>
                <p>{profile.coverageComplexity}</p>
              </div>
              <div>
                <p className="font-semibold text-foreground">Member since</p>
                <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Card>

        <Card className="glass p-6">
          <h2 className="mb-4 text-xl font-bold">Edit your responses</h2>
          {!draft ? (
            <p className="text-sm text-muted-foreground">
              Complete the LifeLens quiz to unlock your editable profile.
            </p>
          ) : (
            <div className="space-y-6">
              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Personal details</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Full name">
                    <Input
                      value={draft.fullName}
                      onChange={(event) => updateDraft((current) => ({ ...current, fullName: event.target.value }))}
                    />
                  </Field>
                  <Field label="Preferred name">
                    <Input
                      value={draft.preferredName}
                      onChange={(event) => updateDraft((current) => ({ ...current, preferredName: event.target.value }))}
                    />
                  </Field>
                  <Field label="Age">
                    <Input
                      type="number"
                      min={18}
                      max={90}
                      value={draft.age ?? ""}
                      onChange={(event) =>
                        updateDraft((current) => ({ ...current, age: event.target.value ? Number(event.target.value) : null }))
                      }
                    />
                  </Field>
                  <Field label="Employment start date">
                    <Input
                      type="date"
                      value={draft.employmentStartDate}
                      onChange={(event) =>
                        updateDraft((current) => ({ ...current, employmentStartDate: event.target.value }))
                      }
                    />
                  </Field>
                  <Field label="Marital status">
                    <select
                      value={draft.maritalStatus}
                      onChange={(event) =>
                        updateDraft((current) => ({ ...current, maritalStatus: event.target.value as EnrollmentFormData["maritalStatus"] }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {MARITAL_OPTIONS.map((option) => (
                        <option key={option} value={option} className="text-sm">
                          {option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Education & work</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Highest education">
                    <select
                      value={draft.educationLevel}
                      onChange={(event) =>
                        updateDraft((current) => ({ ...current, educationLevel: event.target.value as EnrollmentFormData["educationLevel"] }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {EDUCATION_OPTIONS.map((option) => (
                        <option key={option} value={option} className="text-sm">
                          {option === "high-school"
                            ? "High school"
                            : option.charAt(0).toUpperCase() + option.slice(1)}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Major or focus">
                    <Input
                      value={draft.educationMajor}
                      onChange={(event) => updateDraft((current) => ({ ...current, educationMajor: event.target.value }))}
                    />
                  </Field>
                  <Field label="Work country">
                    <Input
                      value={draft.workCountry}
                      onChange={(event) => updateDraft((current) => ({ ...current, workCountry: event.target.value }))}
                    />
                  </Field>
                  <Field label="Work state">
                    <Input
                      value={draft.workState}
                      onChange={(event) => updateDraft((current) => ({ ...current, workState: event.target.value }))}
                    />
                  </Field>
                  <Field label="Work region">
                    <Input
                      value={draft.workRegion}
                      onChange={(event) => updateDraft((current) => ({ ...current, workRegion: event.target.value }))}
                    />
                  </Field>
                  <Field label="Citizenship">
                    <Input
                      value={draft.citizenship}
                      onChange={(event) => updateDraft((current) => ({ ...current, citizenship: event.target.value }))}
                    />
                  </Field>
                  <Field label="Residency status">
                    <select
                      value={draft.residencyStatus}
                      onChange={(event) =>
                        updateDraft((current) => ({ ...current, residencyStatus: event.target.value as EnrollmentFormData["residencyStatus"] }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {RESIDENCY_OPTIONS.map((option) => (
                        <option key={option} value={option} className="text-sm">
                          {option}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Coverage & household</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Coverage focus">
                    <select
                      value={draft.coveragePreference}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          coveragePreference: event.target.value as EnrollmentFormData["coveragePreference"],
                          dependents:
                            event.target.value === "self-plus-family" ? current.dependents : 0,
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {COVERAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {draft.coveragePreference === "self-plus-family" && (
                    <Field label="Dependents">
                      <Input
                        type="number"
                        min={0}
                        max={10}
                        value={draft.dependents}
                        onChange={(event) =>
                          updateDraft((current) => ({
                            ...current,
                            dependents: Number(event.target.value || 0),
                          }))
                        }
                      />
                    </Field>
                  )}
                  <Field label="Home setup">
                    <select
                      value={draft.homeOwnership}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          homeOwnership: event.target.value as EnrollmentFormData["homeOwnership"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {HOME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Household income">
                    <select
                      value={draft.incomeRange}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          incomeRange: event.target.value as EnrollmentFormData["incomeRange"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {INCOME_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <Field label="Health coverage source">
                    <select
                      value={draft.healthCoverage}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          healthCoverage: event.target.value as EnrollmentFormData["healthCoverage"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {HEALTH_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  {(["married", "partnered"] as EnrollmentFormData["maritalStatus"][]).includes(draft.maritalStatus) && (
                    <ToggleField
                      label="Partner has separate insurance"
                      checked={draft.spouseHasSeparateInsurance === true}
                      onChange={(checked) =>
                        updateDraft((current) => ({ ...current, spouseHasSeparateInsurance: checked }))
                      }
                    />
                  )}
                </div>
              </section>

              <section className="space-y-4">
                <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-primary/80">Preferences</h3>
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label={`Savings rate · ${draft.savingsRate}%`}>
                    <Slider
                      min={0}
                      max={30}
                      step={1}
                      value={[draft.savingsRate]}
                      onValueChange={([value]) => updateDraft((current) => ({ ...current, savingsRate: value }))}
                    />
                  </Field>
                  <Field label={`Risk comfort · ${riskComfortLabel}`}>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[draft.riskComfort]}
                      onValueChange={([value]) => updateDraft((current) => ({ ...current, riskComfort: value }))}
                    />
                  </Field>
                  <ToggleField
                    label="Savings coaching reminders"
                    checked={draft.wantsSavingsSupport === true}
                    onChange={(checked) =>
                      updateDraft((current) => ({ ...current, wantsSavingsSupport: checked }))
                    }
                  />
                  <ToggleField
                    label="Invests in markets"
                    checked={draft.investsInMarkets === true}
                    onChange={(checked) =>
                      updateDraft((current) => ({ ...current, investsInMarkets: checked }))
                    }
                  />
                  <Field label={`Credit score · ${draft.creditScore}`}>
                    <Slider
                      min={300}
                      max={850}
                      step={10}
                      value={[draft.creditScore]}
                      onValueChange={([value]) => updateDraft((current) => ({ ...current, creditScore: value }))}
                    />
                  </Field>
                  <Field label="Activity level">
                    <select
                      value={draft.activityLevel}
                      onChange={(event) =>
                        updateDraft((current) => {
                          const nextLevel = event.target.value as EnrollmentFormData["activityLevel"]
                          return {
                            ...current,
                            activityLevel: nextLevel,
                            physicalActivities: nextLevel === "active" ? true : nextLevel === "balanced" ? null : false,
                            activityList: nextLevel === "active" ? current.activityList : [],
                          }
                        })
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {ACTIVITY_LEVEL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                  <ToggleField
                    label="Tobacco use"
                    checked={draft.tobaccoUse === true}
                    onChange={(checked) =>
                      updateDraft((current) => ({ ...current, tobaccoUse: checked }))
                    }
                  />
                  <ToggleField
                    label="Disability"
                    checked={draft.disability === true}
                    onChange={(checked) =>
                      updateDraft((current) => ({ ...current, disability: checked }))
                    }
                  />
                  <ToggleField
                    label="Veteran status"
                    checked={draft.veteran === true}
                    onChange={(checked) =>
                      updateDraft((current) => ({ ...current, veteran: checked }))
                    }
                  />
                </div>

                {draft.activityLevel === "active" && (
                  <div>
                    <p className="mb-2 text-sm font-semibold text-[#7F1527]">Activities you enjoy</p>
                    <div className="flex flex-wrap gap-2">
                      {ACTIVITY_OPTIONS.map((option) => {
                        const active = draft.activityList.includes(option.value)
                        return (
                          <button
                            key={option.value}
                            type="button"
                            onClick={() =>
                              updateDraft((current) => ({
                                ...current,
                                activityList: active
                                  ? current.activityList.filter((item) => item !== option.value)
                                  : [...current.activityList, option.value],
                              }))
                            }
                            className={`rounded-full border px-4 py-2 text-sm font-semibold transition ${
                              active
                                ? "border-transparent bg-gradient-to-r from-[#A41E34] to-[#D94E35] text-white"
                                : "border-[#E3D8D5] bg-[#FBF7F6] text-[#7F1527] hover:border-[#A41E34]/40"
                            }`}
                          >
                            {option.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                )}
              </section>
            </div>
          )}
        </Card>

        <Card className="glass p-6">
          <h2 className="mb-4 text-xl font-bold">Actions</h2>
          <div className="space-y-3">
            <Button
              onClick={onSendReport}
              variant="outline"
              className="flex w-full items-center justify-start gap-3 rounded-2xl border-[#E3D8D5] bg-white py-4 text-sm font-semibold text-[#A41E34] hover:bg-[#F9EDEA]"
            >
              <FileDown className="h-5 w-5" />
              Send report to HR
            </Button>
            <div className="border-t pt-4">
              {!showConfirm ? (
                <Button onClick={() => setShowConfirm(true)} variant="destructive" className="w-full gap-2">
                  <Trash2 className="h-4 w-4" />
                  Clear all data
                </Button>
              ) : (
                <div className="space-y-3">
                  <p className="text-center text-sm text-muted-foreground">
                    Are you sure? This will delete all of your saved answers and insights.
                  </p>
                  <div className="flex gap-2">
                    <Button onClick={() => setShowConfirm(false)} variant="outline" className="flex-1">
                      Cancel
                    </Button>
                    <Button onClick={onClearData} variant="destructive" className="flex-1">
                      Delete everything
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="flex flex-col gap-2 text-sm font-medium text-[#7F1527]">
      {label}
      {children}
    </label>
  )
}

function ToggleField({
  label,
  checked,
  onChange,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E3D8D5] bg-white px-4 py-3">
      <span className="text-sm font-semibold text-[#2A1A1A]">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  )
}
