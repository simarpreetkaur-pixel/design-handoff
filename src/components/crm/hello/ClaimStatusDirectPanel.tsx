/**
 * ClaimStatusDirectPanel
 *
 * Shown in the right panel when "Claim Status" is triggered from UC6's quick drawer.
 * The policy was already selected in chat — this panel goes straight to displaying status.
 * No policy-picker step.
 */
import { AlertTriangle, Car, CheckCircle, Clock, FileText, Heart, Shield, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Policy } from "@/types/crm"

// ─── Mock claim data ──────────────────────────────────────────────────────────

type ClaimStatusValue = "approved" | "pending" | "under_review" | "rejected" | "no_claim"

interface MockClaim {
  claimId: string
  status: ClaimStatusValue
  incidentType: string
  amount: string
  submittedDate: string
  lastUpdated: string
  timeline: { label: string; date: string; done: boolean }[]
}

function getMockClaim(policyId: string): MockClaim {
  const claims: Record<string, MockClaim> = {
    POL001: {
      claimId: "CLM1046231",
      status: "under_review",
      incidentType: "Accident — Vehicle damage",
      amount: "₹45,000",
      submittedDate: "15 Jun 2026",
      lastUpdated: "22 Jun 2026",
      timeline: [
        { label: "Claim submitted", date: "15 Jun", done: true },
        { label: "Documents collected", date: "17 Jun", done: true },
        { label: "Survey scheduled", date: "19 Jun", done: true },
        { label: "Under review", date: "22 Jun", done: true },
        { label: "Approval pending", date: "—", done: false },
        { label: "Settlement", date: "—", done: false },
      ],
    },
    POL002: {
      claimId: "CLM1046198",
      status: "approved",
      incidentType: "Third-party damage",
      amount: "₹18,500",
      submittedDate: "10 May 2026",
      lastUpdated: "25 May 2026",
      timeline: [
        { label: "Claim submitted", date: "10 May", done: true },
        { label: "Documents collected", date: "12 May", done: true },
        { label: "Survey scheduled", date: "14 May", done: true },
        { label: "Under review", date: "18 May", done: true },
        { label: "Approval pending", date: "22 May", done: true },
        { label: "Settlement", date: "25 May", done: true },
      ],
    },
  }
  // fallback for any unmapped policy
  return claims[policyId] ?? {
    claimId: "CLM" + policyId.slice(-7),
    status: "pending",
    incidentType: "Parking damage",
    amount: "₹12,000",
    submittedDate: "28 Jun 2026",
    lastUpdated: "28 Jun 2026",
    timeline: [
      { label: "Claim submitted", date: "28 Jun", done: true },
      { label: "Documents collected", date: "—", done: false },
      { label: "Survey scheduled", date: "—", done: false },
      { label: "Under review", date: "—", done: false },
      { label: "Approval pending", date: "—", done: false },
      { label: "Settlement", date: "—", done: false },
    ],
  }
}

// ─── Style helpers ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<ClaimStatusValue, { label: string; bg: string; text: string; icon: React.ReactNode }> = {
  approved: {
    label: "Approved",
    bg: "bg-[#e8f5e8]",
    text: "text-[#0fa457]",
    icon: <CheckCircle className="size-3.5" />,
  },
  pending: {
    label: "Pending",
    bg: "bg-[#fff8e6]",
    text: "text-[#f58700]",
    icon: <Clock className="size-3.5" />,
  },
  under_review: {
    label: "Under Review",
    bg: "bg-[#fff3e0]",
    text: "text-[#e07800]",
    icon: <AlertTriangle className="size-3.5" />,
  },
  rejected: {
    label: "Rejected",
    bg: "bg-[#fdecea]",
    text: "text-[#e05752]",
    icon: <XCircle className="size-3.5" />,
  },
  no_claim: {
    label: "No Active Claim",
    bg: "bg-[#f0f0f6]",
    text: "text-[#5b5675]",
    icon: <Shield className="size-3.5" />,
  },
}

function getPolicyIcon(policy: Policy) {
  const type = policy.type?.toLowerCase() ?? ""
  if (type.includes("health")) return <Heart className="size-5 text-[#e05752]" />
  if (type.includes("motor") || type.includes("car") || type.includes("bike")) return <Car className="size-5 text-[#3b82f6]" />
  return <Shield className="size-5 text-[#7c47e1]" />
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface ClaimStatusDirectPanelProps {
  policy: Policy
}

export function ClaimStatusDirectPanel({ policy }: ClaimStatusDirectPanelProps) {
  const claim = getMockClaim(policy.id)
  const cfg = STATUS_CONFIG[claim.status]

  return (
    <div className="flex h-full flex-col overflow-y-auto px-4 py-4">
      {/* Policy header */}
      <div className="mb-4 flex items-center gap-3 rounded-xl border border-[#e7e7f0] bg-[#f8f7fc] px-3 py-3">
        <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-white shadow-sm">
          {getPolicyIcon(policy)}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-euclid text-[13px] font-semibold leading-5 text-[#040222]">
            {policy.vehicle ?? policy.type}
          </p>
          <p className="font-euclid text-[11px] text-[#5b5675]">{policy.policyNumber}</p>
        </div>
        {/* Status badge */}
        <span className={cn("flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 font-euclid text-[11px] font-medium", cfg.bg, cfg.text)}>
          {cfg.icon}
          {cfg.label}
        </span>
      </div>

      {/* Claim card */}
      <div className="mb-4 flex flex-col gap-3 rounded-xl border border-[#e7e7f0] bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <FileText className="size-4 text-[#7c47e1]" />
            <p className="font-euclid text-[13px] font-semibold text-[#040222]">{claim.claimId}</p>
          </div>
          <span className={cn("flex items-center gap-1 rounded-full px-2.5 py-1 font-euclid text-[11px] font-medium", cfg.bg, cfg.text)}>
            {cfg.icon}
            {cfg.label}
          </span>
        </div>

        <div className="h-px bg-[#f0f0f6]" />

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="font-euclid text-[10px] font-medium uppercase tracking-wide text-[#9c9aaf]">Incident</p>
            <p className="mt-0.5 font-euclid text-[12px] font-medium text-[#36354c]">{claim.incidentType}</p>
          </div>
          <div>
            <p className="font-euclid text-[10px] font-medium uppercase tracking-wide text-[#9c9aaf]">Claim amount</p>
            <p className="mt-0.5 font-euclid text-[12px] font-medium text-[#36354c]">{claim.amount}</p>
          </div>
          <div>
            <p className="font-euclid text-[10px] font-medium uppercase tracking-wide text-[#9c9aaf]">Submitted</p>
            <p className="mt-0.5 font-euclid text-[12px] font-medium text-[#36354c]">{claim.submittedDate}</p>
          </div>
          <div>
            <p className="font-euclid text-[10px] font-medium uppercase tracking-wide text-[#9c9aaf]">Last updated</p>
            <p className="mt-0.5 font-euclid text-[12px] font-medium text-[#36354c]">{claim.lastUpdated}</p>
          </div>
        </div>
      </div>

      {/* Claim timeline */}
      <div className="rounded-xl border border-[#e7e7f0] bg-white p-4">
        <p className="mb-3 font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#9c9aaf]">Claim Timeline</p>
        <div className="flex flex-col gap-0">
          {claim.timeline.map((step, idx) => {
            const isLast = idx === claim.timeline.length - 1
            const isActive = step.done && (isLast || !claim.timeline[idx + 1].done)
            return (
              <div key={step.label} className="flex items-start gap-3">
                {/* Left rail */}
                <div className="flex flex-col items-center">
                  <div
                    className={cn(
                      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                      step.done
                        ? isActive
                          ? "border-[#7c47e1] bg-[#7c47e1]"
                          : "border-[#0fa457] bg-[#0fa457]"
                        : "border-[#d4d2e3] bg-white",
                    )}
                  >
                    {step.done && (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <polyline points="2 5 4 7 8 3" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )}
                  </div>
                  {!isLast && (
                    <div className={cn("w-0.5 flex-1", step.done ? "bg-[#0fa457]" : "bg-[#e7e7f0]")} style={{ minHeight: 20 }} />
                  )}
                </div>
                {/* Step info */}
                <div className="mb-3 min-w-0 flex-1">
                  <p
                    className={cn(
                      "font-euclid text-[12px] font-medium leading-5",
                      step.done ? (isActive ? "text-[#7c47e1]" : "text-[#36354c]") : "text-[#9c9aaf]",
                    )}
                  >
                    {step.label}
                    {isActive && <span className="ml-1.5 inline-flex items-center rounded-full bg-[#efe9fb] px-1.5 py-0.5 text-[10px] text-[#7c47e1]">Current</span>}
                  </p>
                  {step.date !== "—" && (
                    <p className="font-euclid text-[11px] text-[#9c9aaf]">{step.date}</p>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
