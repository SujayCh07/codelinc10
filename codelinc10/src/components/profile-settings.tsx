"use client"

import type { ReactNode } from "react"
import { useEffect, useMemo, useState } from "react"
import { CheckCircle, ChevronDown, ChevronRight, FileDown, Sparkles, Trash2, User } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { Switch } from "@/components/ui/switch"
import { Textarea } from "@/components/ui/textarea"
import type { EnrollmentFormData, ProfileSnapshot } from "@/lib/types"
import {
  COVERAGE_OPTIONS,
  HEALTH_OPTIONS,
  INCOME_OPTIONS,
  MARITAL_OPTIONS,
  RESIDENCY_OPTIONS,
  ACCOUNT_PREFERENCE_OPTIONS,
  BENEFIT_USAGE_OPTIONS,
  DENTAL_VISION_OPTIONS,
  GUIDANCE_PREFERENCE_OPTIONS,
  PARTNER_COVERAGE_OPTIONS,
  PLAN_PREFERENCE_OPTIONS,
  PRIMARY_CARE_OPTIONS,
  PRESCRIPTION_OPTIONS,
} from "@/lib/quiz"

// ---------- Types ----------
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

// ---------- Utility ----------
function shallowEqual<T extends object>(a: T | null, b: T | null) {
  if (!a && !b) return true
  if (!a || !b) return false
  const aKeys = Object.keys(a) as (keyof T)[]
  const bKeys = Object.keys(b) as (keyof T)[]
  if (aKeys.length !== bKeys.length) return false
  for (const k of aKeys) {
    if (a[k] !== b[k]) return false
  }
  return true
}

// ---------- Collapsible Section ----------
function CollapsibleSection({
  title,
  subtitle,
  defaultOpen = false,
  children,
}: {
  title: string
  subtitle?: string
  defaultOpen?: boolean
  children: ReactNode
}) {
  const [open, setOpen] = useState(defaultOpen)
  return (
    <section className="rounded-2xl border border-[#E3D8D5] bg-white">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex w-full items-center justify-between px-4 py-3 text-left"
      >
        <div>
          <h3 className="text-sm font-semibold uppercase tracking-[0.3em] text-[#7F1527]">{title}</h3>
          {subtitle && <p className="text-xs text-[#7F1527]/70">{subtitle}</p>}
        </div>
        {open ? <ChevronDown className="h-5 w-5 text-[#7F1527]" /> : <ChevronRight className="h-5 w-5 text-[#7F1527]" />}
      </button>
      {open && <div className="border-t border-[#E3D8D5] p-4 sm:p-5">{children}</div>}
    </section>
  )
}

// ---------- Small Field helpers ----------
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
  disabled = false,
}: {
  label: string
  checked: boolean
  onChange: (value: boolean) => void
  disabled?: boolean
}) {
  return (
    <div className="flex items-center justify-between rounded-2xl border border-[#E3D8D5] bg-white px-4 py-3">
      <span className="text-sm font-semibold text-[#2A1A1A]">{label}</span>
      <Switch checked={checked} onCheckedChange={onChange} disabled={disabled} />
    </div>
  )
}

// ---------- Main ----------
export function ProfileSettings({
  profile,
  onClearData,
  onSendReport,
  formData,
  onUpdateProfile,
}: ProfileSettingsProps) {
  const [showConfirm, setShowConfirm] = useState(false)

  // local editable copy (draft)
  const [draft, setDraft] = useState<EnrollmentFormData | null>(formData)
  const [saving, setSaving] = useState(false)
  const [saved, setSaved] = useState(false)
  const [dirty, setDirty] = useState(false)

  // sync when formData changes externally
  useEffect(() => {
    setDraft(formData)
    setDirty(false)
  }, [formData])

  // When user edits any value, mark as dirty
  const updateDraft = (updater: (current: EnrollmentFormData) => EnrollmentFormData) => {
    setDraft((current) => {
      if (!current) return current
      const next = updater(current)
      setDirty(true)
      return next
    })
  }

  const handleSave = async () => {
    if (!draft) return
    setSaving(true)
    try {
      // simulate/allow async save
      await Promise.resolve()
      onUpdateProfile?.(draft)
      setSaved(true)
      setDirty(false)
      setTimeout(() => setSaved(false), 1500)
    } finally {
      setSaving(false)
    }
  }

  const riskComfortLabel = useMemo(() => {
    if (!draft) return "—"
    const scale = ["Very low", "Low", "Moderate", "High", "Very high"]
    return scale[draft.riskComfort - 1] ?? `${draft.riskComfort}/5`
  }, [draft])

  return (
    <div className="min-h-screen px-4 py-8 pb-24">
      <div className="mx-auto flex w-full max-w-4xl flex-col gap-6">
        {/* Header */}
        <div className="glass-strong rounded-2xl p-6">
          <div className="mb-2 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
              <User className="h-6 w-6 text-primary" />
            </div>
            <div className="flex-1">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <h1 className="text-3xl font-bold">Profile & Settings</h1>
                  <p className="text-muted-foreground">Manage your answers and keep your plan in sync</p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    onClick={handleSave}
                    disabled={saving || !dirty || !draft}
                    className="rounded-full bg-[#A41E34] px-5 text-white hover:bg-[#7F1527] disabled:opacity-40"
                  >
                    {saving ? "Saving…" : "Save Changes"}
                  </Button>
                  {saved && (
                    <span className="inline-flex items-center gap-1 text-green-600 text-sm font-semibold">
                      <CheckCircle className="h-4 w-4" />
                      Saved
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Snapshot */}
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
                  <span>{profile.focusArea || "Priority guidance"}</span>
                </div>
              </div>
            </div>
            <div className="grid text-sm text-muted-foreground sm:text-right">
              <div>
                <p className="font-semibold text-foreground">Member since</p>
                <p>{new Date(profile.createdAt).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
        </Card>

        {/* Editor */}
        <Card className="glass p-6">
          <h2 className="text-xl font-bold">Personal Information: </h2>
          {!draft ? (
            <p className="text-sm text-muted-foreground">
              Complete the FinMate quiz to unlock your editable profile.
            </p>
          ) : (
            <div className="space-y-4">
              <CollapsibleSection title="Personal details" defaultOpen>
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
                      value={draft.age ?? 19}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          age: event.target.value ? Number(event.target.value) : null,
                        }))
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
                        updateDraft((current) => {
                          const nextStatus = event.target.value as EnrollmentFormData["maritalStatus"]
                          const supportsPartner = (["married", "partnered"] as EnrollmentFormData["maritalStatus"][]).includes(
                            nextStatus,
                          )
                          return {
                            ...current,
                            maritalStatus: nextStatus,
                            spouseHasSeparateInsurance: supportsPartner ? current.spouseHasSeparateInsurance : null,
                            partnerCoverageStatus: supportsPartner ? current.partnerCoverageStatus : "not-applicable",
                          }
                        })
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {MARITAL_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Education & work">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Highest education">
                    <select
                      value={draft.educationLevel}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          educationLevel: event.target.value as EnrollmentFormData["educationLevel"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {EDUCATION_OPTIONS.map((option) => (
                        <option key={option} value={option} className="text-sm">
                          {option === "high-school" ? "High school" : option.charAt(0).toUpperCase() + option.slice(1)}
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
                        updateDraft((current) => ({
                          ...current,
                          residencyStatus: event.target.value as EnrollmentFormData["residencyStatus"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {RESIDENCY_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Coverage & household">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Coverage focus">
                    <select
                      value={draft.coveragePreference}
                      onChange={(event) =>
                        updateDraft((current) => {
                          const nextPreference = event.target.value as EnrollmentFormData["coveragePreference"]
                          const updates: Partial<EnrollmentFormData> = {
                            coveragePreference: nextPreference,
                            dependents: nextPreference === "self-plus-family" ? current.dependents : 0,
                          }
                          if (nextPreference === "self") {
                            updates.partnerCoverageStatus = "not-applicable"
                            updates.spouseHasSeparateInsurance = null
                          }
                          return { ...current, ...updates }
                        })
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

                  {(draft.coveragePreference !== "self" ||
                    (["married", "partnered"] as EnrollmentFormData["maritalStatus"][]).includes(draft.maritalStatus)) && (
                    <Field label="Partner coverage status">
                      <select
                        value={draft.partnerCoverageStatus}
                        onChange={(event) =>
                          updateDraft((current) => {
                            const nextStatus = event.target.value as EnrollmentFormData["partnerCoverageStatus"]
                            return {
                              ...current,
                              partnerCoverageStatus: nextStatus,
                              spouseHasSeparateInsurance:
                                nextStatus === "not-applicable" ? null : nextStatus === "yes",
                            }
                          })
                        }
                        className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                      >
                        {PARTNER_COVERAGE_OPTIONS.map((option) => (
                          <option key={option.value} value={option.value} className="text-sm">
                            {option.label}
                          </option>
                        ))}
                      </select>
                    </Field>
                  )}

                  <Field label="Current coverage source">
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

                  <ToggleField
                    label="Continuous coverage (12 months)"
                    checked={draft.hasContinuousCoverage === true}
                    onChange={(checked) => updateDraft((current) => ({ ...current, hasContinuousCoverage: checked }))}
                  />
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Health & wellness profile">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ToggleField
                    label="Ongoing health conditions"
                    checked={draft.hasHealthConditions === true}
                    onChange={(checked) =>
                      updateDraft((current) => ({
                        ...current,
                        hasHealthConditions: checked,
                        healthConditionSummary: checked ? current.healthConditionSummary : "",
                      }))
                    }
                  />
                  {draft.hasHealthConditions && (
                    <Field label="Condition summary">
                      <Textarea
                        value={draft.healthConditionSummary}
                        onChange={(event) =>
                          updateDraft((current) => ({ ...current, healthConditionSummary: event.target.value }))
                        }
                        rows={3}
                        className="min-h-[96px] rounded-xl border border-[#E3D8D5] bg-white px-3 py-2 text-sm text-[#2A1A1A]"
                      />
                    </Field>
                  )}

                  <Field label="Primary-care visits">
                    <select
                      value={draft.primaryCareFrequency}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          primaryCareFrequency: event.target.value as EnrollmentFormData["primaryCareFrequency"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {PRIMARY_CARE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="Prescription frequency">
                    <select
                      value={draft.prescriptionFrequency}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          prescriptionFrequency: event.target.value as EnrollmentFormData["prescriptionFrequency"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {PRESCRIPTION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label={`Activity level score · ${draft.activityLevelScore}/5`}>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[draft.activityLevelScore]}
                      onValueChange={([value]) =>
                        updateDraft((current) => {
                          const nextValue = Math.max(1, Math.min(5, Math.round(value)))
                          const nextLevel: EnrollmentFormData["activityLevel"] =
                            nextValue >= 4 ? "active" : nextValue <= 2 ? "relaxed" : "balanced"
                          return {
                            ...current,
                            activityLevelScore: nextValue,
                            activityLevel: nextLevel,
                            physicalActivities: nextLevel === "active" ? true : nextLevel === "relaxed" ? false : null,
                          }
                        })
                      }
                    />
                  </Field>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Financial & plan preference">
                <div className="grid gap-4 sm:grid-cols-2">
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

                  <Field label={`Benefits budget · ${draft.benefitsBudget}%`}>
                    <Slider
                      min={0}
                      max={20}
                      step={1}
                      value={[draft.benefitsBudget]}
                      onValueChange={([value]) =>
                        updateDraft((current) => ({
                          ...current,
                          benefitsBudget: value,
                          savingsRate: value,
                        }))
                      }
                    />
                  </Field>

                  <Field label={`Risk comfort · ${riskComfortLabel}`}>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[draft.riskComfort]}
                      onValueChange={([value]) =>
                        updateDraft((current) => ({
                          ...current,
                          riskComfort: value,
                        }))
                      }
                    />
                  </Field>

                  <Field label="Plan priority">
                    <select
                      value={draft.planPreference}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          planPreference: event.target.value as EnrollmentFormData["planPreference"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {PLAN_PREFERENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label="HSA / FSA access">
                    <select
                      value={draft.taxPreferredAccount}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          taxPreferredAccount: event.target.value as EnrollmentFormData["taxPreferredAccount"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {ACCOUNT_PREFERENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <Field label={`Credit score · ${draft.creditScore}`}>
                    <Slider
                      min={300}
                      max={850}
                      step={10}
                      value={[draft.creditScore]}
                      onValueChange={([value]) =>
                        updateDraft((current) => ({ ...current, creditScore: value }))
                      }
                    />
                  </Field>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Life stage & usage">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ToggleField
                    label="Expecting major life changes"
                    checked={draft.anticipatesLifeChanges === true}
                    onChange={(checked) => updateDraft((current) => ({ ...current, anticipatesLifeChanges: checked }))}
                  />
                  <Field label="Benefit usage frequency">
                    <select
                      value={draft.expectedBenefitUsage}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          expectedBenefitUsage: event.target.value as EnrollmentFormData["expectedBenefitUsage"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {BENEFIT_USAGE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>

                  <ToggleField
                    label="Regular out-of-state travel"
                    checked={draft.travelsOutOfState === true}
                    onChange={(checked) => updateDraft((current) => ({ ...current, travelsOutOfState: checked }))}
                  />
                  <ToggleField
                    label="Needs international coverage"
                    checked={draft.needsInternationalCoverage === true}
                    onChange={(checked) => updateDraft((current) => ({ ...current, needsInternationalCoverage: checked }))}
                  />
                  <Field label="Dental / vision preference">
                    <select
                      value={draft.dentalVisionPreference}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          dentalVisionPreference: event.target.value as EnrollmentFormData["dentalVisionPreference"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {DENTAL_VISION_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Retirement & guidance">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ToggleField
                    label="Contribute to retirement"
                    checked={draft.contributesToRetirement === true}
                    onChange={(checked) =>
                      updateDraft((current) => ({
                        ...current,
                        contributesToRetirement: checked,
                        retirementContributionRate: checked ? current.retirementContributionRate : 0,
                        wantsRetirementGuidance: checked ? current.wantsRetirementGuidance : null,
                      }))
                    }
                  />
                  <Field label={`Contribution rate · ${draft.retirementContributionRate}%`}>
                    <Slider
                      min={0}
                      max={15}
                      step={1}
                      value={[draft.retirementContributionRate]}
                      onValueChange={([value]) =>
                        updateDraft((current) => ({
                          ...current,
                          retirementContributionRate: value,
                        }))
                      }
                      disabled={!draft.contributesToRetirement}
                    />
                  </Field>
                  <ToggleField
                    label="Want optimized targets"
                    checked={draft.wantsRetirementGuidance === true}
                    onChange={(checked) => updateDraft((current) => ({ ...current, wantsRetirementGuidance: checked }))}
                    disabled={draft.contributesToRetirement === null}
                  />
                  <Field label={`Confidence with insurance terms · ${draft.confidenceInsuranceTerms}/5`}>
                    <Slider
                      min={1}
                      max={5}
                      step={1}
                      value={[draft.confidenceInsuranceTerms]}
                      onValueChange={([value]) =>
                        updateDraft((current) => ({
                          ...current,
                          confidenceInsuranceTerms: value,
                        }))
                      }
                    />
                  </Field>
                  <Field label="Guidance preference">
                    <select
                      value={draft.guidancePreference}
                      onChange={(event) =>
                        updateDraft((current) => ({
                          ...current,
                          guidancePreference: event.target.value as EnrollmentFormData["guidancePreference"],
                        }))
                      }
                      className="h-11 w-full rounded-xl border border-[#E3D8D5] bg-white px-3 text-sm font-medium text-[#2A1A1A]"
                    >
                      {GUIDANCE_PREFERENCE_OPTIONS.map((option) => (
                        <option key={option.value} value={option.value} className="text-sm">
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                </div>
              </CollapsibleSection>

              <CollapsibleSection title="Additional details">
                <div className="grid gap-4 sm:grid-cols-2">
                  <ToggleField
                    label="Disability"
                    checked={draft.disability === true}
                    onChange={(checked) => updateDraft((current) => ({ ...current, disability: checked }))}
                  />
                  <ToggleField
                    label="Veteran status"
                    checked={draft.veteran === true}
                    onChange={(checked) => updateDraft((current) => ({ ...current, veteran: checked }))}
                  />
                </div>
              </CollapsibleSection>

              {/* Bottom Save */}
              <div className="flex items-center justify-end gap-3 pt-1">
                <Button
                  onClick={handleSave}
                  disabled={saving || !dirty || !draft}
                  className="rounded-full bg-[#A41E34] px-5 text-white hover:bg-[#7F1527] disabled:opacity-40"
                >
                  {saving ? "Saving…" : "Save Changes"}
                </Button>
                {saved && (
                  <span className="inline-flex items-center gap-1 text-green-600 text-sm font-semibold">
                    <CheckCircle className="h-4 w-4" />
                    Saved
                  </span>
                )}
              </div>
            </div>
          )}
        </Card>

        {/* Actions */}
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
