import { X } from "lucide-react"

import { ClaimStatusTimeline } from "@/components/crm/ClaimStatusTimeline"
import { CommunicationHistoryPanel } from "@/components/crm/hello/CommunicationHistoryPanel"
import { Button } from "@/components/ui/button"
import type { Customer, JTBD, Policy } from "@/types/crm"

export type ClaimStatusWorkflowView =
  | "timeline"
  | "escalate"
  | "communication_history"

export type ClaimStatusWorkflowPanelProps = {
  jtbd: JTBD
  policy: Policy
  customer: Customer
  customerPolicies?: Policy[]
  view: ClaimStatusWorkflowView
  onClose?: () => void
  onEscalationDone?: () => void
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

  return (
    <div className="flex min-h-0 flex-col gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
            Claim status
          </p>
          <p className="font-euclid text-[14px] font-semibold leading-5 text-[#040222]">
            {vehicleLabel(policy)}
          </p>
        </div>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-[#5b5675] hover:bg-[#f5f3fc] hover:text-[#36354c]"
            onClick={onClose}
            aria-label="Close claim status workspace"
          >
            <X className="size-4" strokeWidth={2} />
          </Button>
        ) : null}
      </div>
      <ClaimStatusTimeline steps={jtbd.status} jtbdType={jtbd.type} />
    </div>
  )
}
