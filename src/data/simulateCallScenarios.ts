import type { Customer } from "@/types/crm"

/** Options shown when the agent taps "Simulate live call" on the homepage */
export const SIMULATE_LIVE_SCENARIOS = [
  {
    customerId: "rajesh-kumar",
    displayName: "Rajesh Kumar",
    subheader: "Claim delay",
  },
  {
    customerId: "anita-sharma",
    displayName: "Anita Sharma",
    subheader: "Policy Issuance",
  },
  {
    customerId: "raj-kapoor",
    displayName: "Raj Kapoor",
    subheader: "Unknown / cold inbound",
  },
  {
    customerId: "priya-sharma",
    displayName: "Priya Sharma",
    subheader: "Process guidance",
  },
] as const

export type SimulateLiveScenarioId = (typeof SIMULATE_LIVE_SCENARIOS)[number]["customerId"]

type ModalExtra = {
  yearsWithAcko: string
  /** Shown next to "Ongoing issue" in the incoming call card */
  ongoingIssue: string
  lastCallBadge: string
  lastCallVariant: "default" | "angry" | "warning"
  summaryLines: [string, string]
  /** Raj Kapoor cold-inbound flags */
  showCallVehicle?: boolean
  showLastCall?: boolean
  showQuickSummary?: boolean
}

const INCOMING_MODAL_LINES: Record<string, ModalExtra> = {
  "rajesh-kumar": {
    yearsWithAcko: "4 years with ACKO",
    ongoingIssue: "Claim delay",
    lastCallBadge: "Frustrated caller",
    lastCallVariant: "warning",
    summaryLines: [
      "Claim filed 3 days ago, delayed due to spare parts",
      "Second follow up within 7 days",
    ],
    showLastCall: false,
    showQuickSummary: false,
  },
  "anita-sharma": {
    yearsWithAcko: "1 year with ACKO",
    ongoingIssue: "Policy issuance",
    lastCallBadge: "Angry",
    lastCallVariant: "angry",
    summaryLines: [
      "KYC failing: policy shows married surname; Aadhaar still shows maiden name",
      "Customer called 4 times for the same issue",
    ],
  },
  "raj-kapoor": {
    yearsWithAcko: "2 years with ACKO",
    ongoingIssue: "Unknown",
    lastCallBadge: "Calm caller",
    lastCallVariant: "default",
    summaryLines: [
      "Cold inbound call",
      "Reason for calling unknown",
    ],
    showCallVehicle: false,
    showLastCall: false,
    showQuickSummary: false,
  },
  "priya-sharma": {
    yearsWithAcko: "3 years with ACKO",
    ongoingIssue: "Process guidance — claim and repair journey",
    lastCallBadge: "Returning caller",
    lastCallVariant: "default",
    summaryLines: [
      "Customer needs step-by-step clarity on TATs and garage options",
      "Share next actions and how to track in the app",
    ],
  },
}

function initialsFromName(name: string): string {
  const parts = name.split(/\s+/).filter(Boolean)
  if (parts.length >= 2) {
    return `${parts[0][0] ?? ""}${parts[parts.length - 1][0] ?? ""}`.toUpperCase()
  }
  return name.slice(0, 2).toUpperCase() || "??"
}

export type IncomingCallModalViewModel = {
  name: string
  language: string
  yearsWithAcko: string
  ongoingIssue: string
  vehicle: string
  lastCallBadge: string
  lastCallVariant: "default" | "angry" | "warning"
  summaryLines: [string, string]
  avatarInitials: string
  /** Conditional UI display flags */
  showCallVehicle: boolean
  showLastCall: boolean
  showQuickSummary: boolean
}

/**
 * Copy for the incoming call modal — merges `Customer` with scenario-specific lines.
 */
export function getIncomingCallModalViewModel(
  customerId: string | undefined,
  customer: Customer | undefined,
): IncomingCallModalViewModel {
  const id = customerId ?? "rajesh-kumar"
  const lines = INCOMING_MODAL_LINES[id] ?? INCOMING_MODAL_LINES["rajesh-kumar"]
  const name = customer?.name ?? "Customer"
  return {
    name,
    language: customer?.language ?? "—",
    yearsWithAcko: lines.yearsWithAcko,
    ongoingIssue: lines.ongoingIssue,
    vehicle: customer?.callContext.vehicle ?? "—",
    lastCallBadge: lines.lastCallBadge,
    lastCallVariant: lines.lastCallVariant,
    summaryLines: lines.summaryLines,
    avatarInitials: initialsFromName(name),
    showCallVehicle: lines.showCallVehicle ?? true,
    showLastCall: lines.showLastCall ?? true,
    showQuickSummary: lines.showQuickSummary ?? true,
  }
}
