/**
 * EscalateIssuePanel
 *
 * Figma reference: node 165:4019 — "Claim Status Widget" (Escalate Issue right panel)
 * Fields: Create Child Ticket toggle, LOB, Auto Dependency, Status, Group, Child Group
 */
import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock dropdown options ────────────────────────────────────────────────────

const LOB_OPTIONS = ["Motor", "Health", "Travel", "Home", "Life"]
const AUTO_DEPENDENCY_OPTIONS = ["Yes", "No", "Not Applicable"]
const STATUS_OPTIONS = ["Open", "In Progress", "Resolved", "Closed", "Pending Customer Action"]
const GROUP_OPTIONS = ["Customer Support", "Claims Team", "Underwriting", "Technical Support", "Finance"]
const CHILD_GROUP_OPTIONS = ["Motor Claims", "Health Claims", "Policy Services", "Renewals", "Fraud Investigation"]

// ─── Sub-components ───────────────────────────────────────────────────────────

interface SelectFieldProps {
  label: string
  options: string[]
  value: string
  onChange: (v: string) => void
}

function SelectField({ label, options, value, onChange }: SelectFieldProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="flex flex-col gap-2">
      <p className="font-euclid text-[14px] font-medium leading-5 text-[#5b5675]">{label}</p>
      <div className="relative">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className={cn(
            "flex w-full items-center justify-between rounded-md border px-3 py-3 text-left transition-colors",
            value ? "border-[#e7e7f0] text-[#36354c]" : "border-[#e7e7f0] text-[#5b5675]",
            open && "border-[#7c47e1] ring-1 ring-[#7c47e1]/20",
          )}
        >
          <span className="font-euclid text-[14px] leading-5">
            {value || "Select from options"}
          </span>
          <ChevronDown
            className={cn(
              "size-4 shrink-0 text-[#5b5675] transition-transform duration-150",
              open && "rotate-180",
            )}
          />
        </button>

        {open && (
          <div className="absolute left-0 right-0 top-full z-20 mt-1 overflow-hidden rounded-md border border-[#e7e7f0] bg-white shadow-[0px_4px_12px_rgba(54,53,76,0.10)]">
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={() => { onChange(opt); setOpen(false) }}
                className={cn(
                  "flex w-full items-center px-3 py-2.5 text-left font-euclid text-[14px] leading-5 transition-colors hover:bg-[#f8f7fc]",
                  value === opt ? "bg-[#f5f3fc] font-medium text-[#7c47e1]" : "text-[#36354c]",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

// ─── Toggle ───────────────────────────────────────────────────────────────────

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex h-6 w-10 shrink-0 cursor-pointer items-center rounded-full border-2 border-transparent transition-colors duration-200",
        checked ? "bg-[#0fa457]" : "bg-[#d1d5db]",
      )}
    >
      <span
        className={cn(
          "inline-block size-4 rounded-full bg-white shadow-sm transition-transform duration-200",
          checked ? "translate-x-4" : "translate-x-0",
        )}
      />
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

export interface EscalateIssuePanelProps {
  onSubmit?: (data: EscalateFormData) => void
}

export interface EscalateFormData {
  createChildTicket: boolean
  lob: string
  autoDependency: string
  status: string
  group: string
  childGroup: string
}

export function EscalateIssuePanel({ onSubmit }: EscalateIssuePanelProps) {
  const [formData, setFormData] = useState<EscalateFormData>({
    createChildTicket: true,
    lob: "",
    autoDependency: "",
    status: "",
    group: "",
    childGroup: "",
  })
  const [submitted, setSubmitted] = useState(false)

  const update = <K extends keyof EscalateFormData>(key: K, val: EscalateFormData[K]) =>
    setFormData((prev) => ({ ...prev, [key]: val }))

  const handleSubmit = () => {
    setSubmitted(true)
    // Show success state briefly, then let the parent close the panel
    window.setTimeout(() => {
      onSubmit?.(formData)
    }, 1800)
  }

  if (submitted) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3 px-6 py-10 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#e8f5e8]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0fa457" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <p className="font-euclid text-[15px] font-semibold text-[#040222]">Escalation raised</p>
        <p className="font-euclid text-[13px] text-[#5b5675]">
          The issue has been escalated successfully. The team will review and respond shortly.
        </p>
        <button
          type="button"
          onClick={() => setSubmitted(false)}
          className="mt-2 font-euclid text-[13px] font-medium text-[#7c47e1] hover:underline"
        >
          Raise another
        </button>
      </div>
    )
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-4">
      {/* Card wrapper — matches Figma border + rounded-[12px] */}
      <div className="flex flex-col gap-4 rounded-[12px] border border-[#e7e7f0] bg-white p-4">
        {/* Create Child Ticket toggle row */}
        <div className="flex items-center justify-between">
          <p className="font-euclid text-[14px] font-medium leading-5 text-[#5b5675]">
            Create Child Ticket
          </p>
          <Toggle
            checked={formData.createChildTicket}
            onChange={(v) => update("createChildTicket", v)}
          />
        </div>

        {/* Divider */}
        <div className="h-px bg-[#f0f0f6]" />

        {/* Dropdown fields */}
        <SelectField
          label="LOB:"
          options={LOB_OPTIONS}
          value={formData.lob}
          onChange={(v) => update("lob", v)}
        />
        <SelectField
          label="Auto Dependency:"
          options={AUTO_DEPENDENCY_OPTIONS}
          value={formData.autoDependency}
          onChange={(v) => update("autoDependency", v)}
        />
        <SelectField
          label="Status:"
          options={STATUS_OPTIONS}
          value={formData.status}
          onChange={(v) => update("status", v)}
        />
        <SelectField
          label="Group:"
          options={GROUP_OPTIONS}
          value={formData.group}
          onChange={(v) => update("group", v)}
        />
        <SelectField
          label="Child Group"
          options={CHILD_GROUP_OPTIONS}
          value={formData.childGroup}
          onChange={(v) => update("childGroup", v)}
        />

        {/* Update / Submit button */}
        <button
          type="button"
          onClick={handleSubmit}
          className="flex h-12 w-full items-center justify-center rounded-lg bg-[#7c47e1] font-euclid text-[14px] font-semibold tracking-[0.1px] text-white transition-colors hover:bg-[#6b3ccd] active:scale-[0.99] disabled:opacity-50"
        >
          Update
        </button>
      </div>
    </div>
  )
}
