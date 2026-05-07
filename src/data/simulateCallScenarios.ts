import type { Customer } from "@/types/crm"

/** Options shown when the agent taps "Simulate live call" on the homepage */
export const SIMULATE_LIVE_SCENARIOS = [
  {
    customerId: "rajesh-kumar",
    displayName: "Rajesh Kumar",
    subheader: "Claim Status",
  },
  {
    customerId: "anita-sharma",
    displayName: "Anita Sharma",
    subheader: "Edit Policy",
  },
  {
    customerId: "raj-kapoor",
    displayName: "Raj Kapoor",
    subheader: "Raise a claim · Tata Nexon + GMC",
  },
  {
    customerId: "priya-sharma",
    displayName: "Priya Sharma",
    subheader: "Claim Status",
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
  /** Language + tenure row under the name (hidden for unknown caller). */
  showLanguageAndTenure?: boolean
  /** Caller display name when there is no CRM profile (unknown number). */
  displayName?: string
}

const INCOMING_MODAL_LINES: Record<string, ModalExtra> = {
  "rajesh-kumar": {
    yearsWithAcko: "4 years with ACKO",
    ongoingIssue: "Claim Status",
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
    ongoingIssue: "Edit Policy",
    lastCallBadge: "Angry",
    lastCallVariant: "angry",
    summaryLines: [
      "KYC mismatch — married surname on policy vs maiden name on Aadhaar",
      "Issuance doc review ran longer than usual after multiple requests; 4 calls on the same issue",
    ],
  },
  "raj-kapoor": {
    yearsWithAcko: "2 years with ACKO",
    ongoingIssue: "Raise a Claim",
    lastCallBadge: "Calm caller",
    lastCallVariant: "default",
    summaryLines: [
      "Opening context: register claim on Tata Nexon (motor comprehensive).",
      "Customer also has 1 ACKO GMC policy on file.",
    ],
    showCallVehicle: true,
    showLastCall: false,
    showQuickSummary: true,
  },
  "priya-sharma": {
    yearsWithAcko: "3 years with ACKO",
    ongoingIssue: "Claim Status",
    lastCallBadge: "Returning caller",
    lastCallVariant: "default",
    summaryLines: [
      "Customer needs step-by-step clarity on TATs and garage options",
      "Share next actions and how to track in the app",
    ],
  },
  "unknown-caller": {
    yearsWithAcko: "",
    ongoingIssue: "Unknown",
    lastCallBadge: "",
    lastCallVariant: "default",
    summaryLines: ["", ""],
    showCallVehicle: false,
    showLastCall: false,
    showQuickSummary: false,
    showLanguageAndTenure: false,
    displayName: "Unknown caller",
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
  showLanguageAndTenure: boolean
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
  const name =
    lines.displayName ?? customer?.name ?? (id === "unknown-caller" ? "Unknown caller" : "Customer")
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
    showLanguageAndTenure: lines.showLanguageAndTenure ?? true,
  }
}
