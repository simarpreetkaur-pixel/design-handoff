import { useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { ClaimStatusTimeline } from "@/components/crm/ClaimStatusTimeline"
import { CommunicationHistoryPanel } from "@/components/crm/hello/CommunicationHistoryPanel"
import type { Customer, JTBD, Policy } from "@/types/crm"
import { cn } from "@/lib/utils"

export type ClaimStatusWorkflowView =
  | "timeline"
  | "escalate"
  | "communication_history"
  | "schedule_ch_callback"

export type ScheduleCHSelection = { date: "today" | "tomorrow"; slot: string }

export type ClaimStatusWorkflowPanelProps = {
  jtbd: JTBD
  policy: Policy
  customer: Customer
  customerPolicies?: Policy[]
  view: ClaimStatusWorkflowView
  onClose?: () => void
  onEscalationDone?: () => void
  onScheduleCHDone?: (selection: ScheduleCHSelection) => void
}

const TIME_SLOTS = [
  "9:00 AM – 11:00 AM",
  "11:00 AM – 1:00 PM",
  "1:00 PM – 3:00 PM",
  "3:00 PM – 5:00 PM",
] as const

function policyDisplayLabel(p: Policy): string {
  const vehicle = p.vehicle?.trim()
  const name = p.name?.trim()
  const num = p.policyNumber?.trim()
  if (vehicle) return `${vehicle}${num ? ` — ${num}` : ""}`
  if (name) return `${name}${num ? ` — ${num}` : ""}`
  return num || "Policy"
}

function ScheduleCHCallbackPanel({
  onCancel,
  onDone,
}: {
  customerPolicies: Policy[]
  preselectedPolicy?: Policy
  onCancel?: () => void
  onDone?: (selection: ScheduleCHSelection) => void
}) {
  const [selectedDate, setSelectedDate] = useState<"today" | "tomorrow" | null>(null)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  const isValid = Boolean(selectedDate && selectedSlot)

  return (
    <div className="flex min-h-0 flex-col gap-5">
      <div className="flex flex-col gap-4 rounded-xl border border-[#e7e7f0] p-6">

        {/* Date selection */}
        <div className="flex flex-col gap-3">
          <p className="font-euclid text-sm font-medium leading-5 text-[#36354c]">Select date</p>
          <div className="grid grid-cols-2 gap-3">
            {(["today", "tomorrow"] as const).map((d) => (
              <button
                key={d}
                type="button"
                onClick={() => setSelectedDate(d)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-[6px] border font-euclid text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30",
                  selectedDate === d
                    ? "border-[#7c47e1] bg-[#7c47e1]/5 font-medium text-[#7c47e1]"
                    : "border-[#e7e7f0] bg-white text-[#36354c] hover:border-[#c9c5e0]",
                )}
              >
                {d === "today" ? "Today" : "Tomorrow"}
              </button>
            ))}
          </div>
        </div>

        {/* Time slot selection */}
        <div className="flex flex-col gap-3">
          <p className="font-euclid text-sm font-medium leading-5 text-[#36354c]">Select time slot</p>
          <div className="grid grid-cols-2 gap-3">
            {TIME_SLOTS.map((slot) => (
              <button
                key={slot}
                type="button"
                onClick={() => setSelectedSlot(slot)}
                className={cn(
                  "flex h-12 items-center justify-center rounded-[6px] border px-2 font-euclid text-sm leading-5 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30",
                  selectedSlot === slot
                    ? "border-[#7c47e1] bg-[#7c47e1]/5 font-medium text-[#7c47e1]"
                    : "border-[#e5e5e5] bg-white text-[#36354c] hover:border-[#c9c5e0]",
                )}
              >
                {slot}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end">
        <button
          type="button"
          disabled={!isValid}
          onClick={() => { if (isValid && selectedDate && selectedSlot) { onDone?.({ date: selectedDate, slot: selectedSlot }); onCancel?.() } }}
          className={cn(
            "h-[42px] rounded-[6px] px-4 font-euclid text-sm font-medium text-white transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30",
            isValid
              ? "bg-[#7c47e1] hover:bg-[#6b3ccd]"
              : "cursor-not-allowed bg-[#7c47e1]/40",
          )}
        >
          Schedule Callback
        </button>
      </div>
    </div>
  )
}

function EscalateToOpsPanel({
  onCancel,
  onDone,
}: {
  onCancel?: () => void
  onDone?: () => void
}) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#8b87a3]">
            Wireframe
          </p>
          <h2 className="mt-1 font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
            Escalate to F-ops
          </h2>
          <p className="mt-1 font-euclid text-[13px] leading-5 text-[#5b5675]">
            Ops workspace preview — fields and actions will render here.
          </p>
        </div>
        {onCancel ? (
          <button
            type="button"
            onClick={onCancel}
            className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
            aria-label="Cancel escalation"
          >
            <X className="size-5" aria-hidden />
          </button>
        ) : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-dashed border-[#e2e4e9] bg-[#fbfbfc] p-4">
        <div className="space-y-2">
          <div className="h-2 w-24 rounded bg-[#e7e7f0]" aria-hidden />
          <div className="h-10 w-full rounded-md bg-[#f4f4f8]" aria-hidden />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-32 rounded bg-[#e7e7f0]" aria-hidden />
          <div className="h-24 w-full rounded-md bg-[#f4f4f8]" aria-hidden />
        </div>
        <div className="mt-auto flex justify-end gap-3 border-t border-[#e2e4e9] pt-4">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#e7e7f0] bg-white px-4 py-2 font-euclid text-[14px] font-medium text-[#5b5675] transition-colors hover:bg-[#f4f4f6]"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg bg-[#7c47e1] px-4 py-2 font-euclid text-[14px] font-medium text-white transition-colors hover:bg-[#6b3ccd]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function vehicleLabel(policy: Policy): string {
  return policy.vehicle?.trim() || policy.name?.trim() || policy.policyNumber || "Policy"
}

export function ClaimStatusWorkflowPanel({
  jtbd,
  policy,
  customer,
  customerPolicies = [],
  view,
  onClose,
  onEscalationDone,
  onScheduleCHDone,
}: ClaimStatusWorkflowPanelProps) {
  if (view === "communication_history") {
    return (
      <CommunicationHistoryPanel
        customer={customer}
        customerPolicies={customerPolicies}
        onBack={onClose ?? (() => {})}
      />
    )
  }

  if (view === "escalate") {
    return (
      <EscalateToOpsPanel
        onCancel={onClose}
        onDone={() => {
          onEscalationDone?.()
          onClose?.()
        }}
      />
    )
  }

  if (view === "schedule_ch_callback") {
    return (
      <ScheduleCHCallbackPanel
        customerPolicies={customerPolicies.length ? customerPolicies : [policy]}
        preselectedPolicy={policy}
        onCancel={onClose}
        onDone={(selection) => {
          onScheduleCHDone?.(selection)
        }}
      />
    )
  }

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <p className="sr-only">
        Claim status workflow for {vehicleLabel(policy)}
      </p>
      <ClaimStatusTimeline steps={jtbd.status} jtbdType={jtbd.type} />
    </div>
  )
}
