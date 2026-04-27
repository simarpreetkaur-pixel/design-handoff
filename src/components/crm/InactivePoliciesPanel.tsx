import { useEffect, useState } from "react"
import { ArrowLeft } from "lucide-react"

import type { InactivePolicy, InactiveTripKind } from "@/types/crm"
import { cn } from "@/lib/utils"

type InactivePoliciesPanelProps = {
  policies: InactivePolicy[]
  onPolicyActionClick?: (action: string) => void
}

function iconForTripKind(kind: InactiveTripKind): string {
  if (kind === "bike" || kind === "captain") {
    return "/icons/policy-bike-line.png"
  }
  return "/icons/policy-car-line.png"
}

function InactiveField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-1 flex-col gap-1 sm:max-w-[196px]">
      <p className="font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">{label}</p>
      <p className="font-euclid text-[16px] font-medium leading-6 text-[#36354c]">{value}</p>
    </div>
  )
}

const INACTIVE_ACTION_LINKS: { label: string; action: string }[] = [
  { label: "View policy document", action: "view_policy_document" },
  { label: "Claims", action: "rapido_claims" },
  { label: "Send communication", action: "send_communication" },
]

type InactiveDetailPanelProps = {
  policy: InactivePolicy
  onPolicyActionClick?: (action: string) => void
}

function InactiveDetailPanel({ policy, onPolicyActionClick }: InactiveDetailPanelProps) {
  return (
    <div className="flex w-full flex-col gap-6 rounded-[12px] border border-[#e7e7f0] bg-white px-5 py-6 font-euclid">
      <div className="flex w-full flex-col gap-3">
        <h3 className="text-[14px] font-medium leading-5 text-[#040222]">View Policy Details</h3>

        <div className="flex flex-col gap-[18px] rounded-2xl border border-[#e7e7f0] bg-white px-3 py-4">
          <div className="flex flex-wrap justify-between gap-x-4 gap-y-4 px-2 sm:px-5">
            <InactiveField label="Policy Holder" value={policy.policyHolder} />
            <InactiveField label="Policy Number" value={policy.policyNumber} />
            <InactiveField label="Product" value={policy.productTitle} />
          </div>
          <div className="flex flex-wrap gap-x-8 gap-y-4 px-2 sm:gap-x-[124px] sm:px-5">
            <InactiveField label="Product name" value={policy.productName} />
            <InactiveField label="Policy period" value={policy.periodLabel} />
          </div>
          <div className="px-2 sm:px-5">
            <InactiveField label="Plan reference" value={policy.planKey} />
          </div>
        </div>
      </div>

      <div className="flex w-full flex-col gap-3">
        <h4 className="text-[14px] font-medium leading-5 text-[#040222]">Policy Related Actions</h4>
        <div className="flex flex-wrap content-center gap-x-10 gap-y-2 rounded-xl border border-[#e7e7f0] bg-white p-4">
          {INACTIVE_ACTION_LINKS.map((item) => (
            <button
              key={item.action}
              type="button"
              onClick={() => onPolicyActionClick?.(item.action)}
              className="font-euclid text-[14px] font-medium leading-5 text-[#7c47e1] transition-colors hover:text-[#44277b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/20 rounded-sm"
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

type ExpiredPolicyCardProps = {
  policy: InactivePolicy
  onOpen: () => void
}

function ExpiredPolicyCard({ policy, onOpen }: ExpiredPolicyCardProps) {
  const iconSrc = iconForTripKind(policy.tripKind)

  return (
    <button
      type="button"
      onClick={onOpen}
      className={cn(
        "flex w-full flex-col gap-3 rounded-xl border border-[#e7e7f0] bg-white p-4 text-left",
        "shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)] transition-shadow hover:shadow-[0px_4px_8px_0px_rgba(0,0,0,0.1)]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="flex min-w-0 flex-1 items-start gap-2">
          <div className="relative mt-0.5 size-5 shrink-0 overflow-hidden">
            <img src={iconSrc} alt="" width={20} height={20} className="size-5 object-contain" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="line-clamp-2 font-euclid text-[14px] font-medium leading-5 text-[#040222]">
              {policy.productTitle}
            </p>
            <p className="mt-1 line-clamp-2 font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
              {policy.policyNumber}
              <span className="text-[#c4c2d4]"> · </span>
              {policy.periodLabel}
            </p>
          </div>
        </div>
        <span
          className="shrink-0 rounded-full bg-[#e53935] px-2 py-0.5 text-[10px] font-semibold uppercase leading-tight tracking-wide text-white"
          title="Expired"
        >
          Expired
        </span>
      </div>
      <p className="font-euclid text-[12px] font-medium text-[#7c47e1]">View details</p>
    </button>
  )
}

/**
 * Inactive / expired policies: compact grid first; one policy’s full details after choosing a card.
 * (Active policies tab keeps its own UI in {@link ActivePoliciesPanel}.)
 */
export function InactivePoliciesPanel({ policies, onPolicyActionClick }: InactivePoliciesPanelProps) {
  const [detailPolicyId, setDetailPolicyId] = useState<string | null>(null)

  useEffect(() => {
    if (detailPolicyId && !policies.some((p) => p.id === detailPolicyId)) {
      setDetailPolicyId(null)
    }
  }, [policies, detailPolicyId])

  const detailPolicy = detailPolicyId ? policies.find((p) => p.id === detailPolicyId) : undefined

  if (!policies.length) {
    return (
      <div className="rounded-[12px] border border-[#e2e2e2] bg-white p-8 text-center">
        <p className="font-euclid text-[14px] text-[#5b5675]">No inactive policies to display.</p>
      </div>
    )
  }

  if (detailPolicy) {
    return (
      <div className="flex w-full flex-col gap-4">
        <button
          type="button"
          onClick={() => setDetailPolicyId(null)}
          className="flex w-fit items-center gap-2 rounded-lg px-2 py-1.5 font-euclid text-[14px] font-medium text-[#7c47e1] transition-colors hover:bg-[#f8f7fc] hover:text-[#44277b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/25"
        >
          <ArrowLeft className="size-4 shrink-0" strokeWidth={2} aria-hidden />
          All expired policies
        </button>
        <InactiveDetailPanel policy={detailPolicy} onPolicyActionClick={onPolicyActionClick} />
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-3">
      <p className="font-euclid text-[13px] font-normal leading-5 text-[#5b5675]">
        {policies.length} expired {policies.length === 1 ? "policy" : "policies"} — select a card to view details.
      </p>
      <div className="grid w-full grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {policies.map((policy) => (
          <ExpiredPolicyCard key={policy.id} policy={policy} onOpen={() => setDetailPolicyId(policy.id)} />
        ))}
      </div>
    </div>
  )
}
