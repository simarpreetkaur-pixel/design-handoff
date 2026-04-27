export interface Customer {
  id: string
  name: string
  language: string
  phone: string
  email: string
  appStatus: "installed" | "not_installed"
  /** e.g. "4 years with ACKO" */
  tenureWithAcko?: string
  /** KYC verification status */
  kycStatus?: "pending" | "verified" | "not_applicable"
  callContext: {
    reason: string
    vehicle?: string
  }
  /** Optional last call sentiment for display in left rail and incoming modal */
  lastCall?: {
    label: string
    sentiment: "neutral" | "angry" | "frustrated" | "calm"
  }
}

export type JTBDType = "claim" | "renewal"

/** Related SOP row under Quick related actions (Figma: Related SOPs to this case). */
export interface RelatedSopRow {
  id: string
  /** Dotted-underline link label */
  label: string
  /** Must match a `FlowActionValue` key in `ActionDetailPage` for full-page detail + back. */
  detailActionKey: string
  /** Prefill when the agent taps “Ask in the chat” on this row. */
  askInChatPrefill: string
}

export interface JTBD {
  id: string
  type: JTBDType
  title: string
  vehicle: string
  status: ClaimStatus[]
  agentActions: AgentAction[]
  quickActions: string[]
  isActive: boolean
  /** Tip card (gradient + bullets; label “Tip:” in UI). May stay keyed as `aiSummary` in mocks. */
  aiSummary?: {
    bullets: string[]
    viewDetailsLabel?: string
    /** Prefill for “View detailed summary” → opens chat with this draft (agent can edit before send) */
    viewDetailsChatPrefill?: string
    /** Header label next to icon (default in UI: “Tip:”). */
    sectionHeading?: string
    /** `ai_summary` uses the sparkle asset; default uses light bulb. */
    headerIconVariant?: "default" | "ai_summary"
  }
  /** Optional custom prefill for "Ask in chat" specific to this JTBD */
  askInChatPrefill?: string
  /** Optional “Related SOPs to this case” block (below quick related actions). */
  relatedSops?: RelatedSopRow[]
}

export type StatusState = "completed" | "current" | "pending"

export interface ClaimStatus {
  step: string
  state: StatusState
  date?: string
  /** Yellow-style nudge (e.g. claim / garage) */
  warning?: string
  /** Yellow callout (e.g. NCB note) — same shell as warning */
  info?: string
  /**
   * Optional key/value under the message (Figma 8098:3752). Shown only when timeline is claim-type.
   * e.g. "Action required from:" / "Rajesh Kumar"
   */
  calloutMeta?: { label: string; value: string }
}

export interface AgentAction {
  id: string
  step: number
  description: string
  cta: string
  completed: boolean
}

export interface Policy {
  id: string
  name: string
  type: string
  policyNumber: string
  members?: number
  expiryDate: string
  vehicle?: string
  /** e.g. car_comprehensive — for agent copy in raise-claim / Tip card */
  productCode?: string
  policyHolder?: string
  planDisplayName?: string
  totalCoverage?: string
  policyPeriodLabel?: string
  tenureLabel?: string
  coveredMembers?: { name: string; relation: string }[]
}

/** Expired / inactive trip policies (e.g. Rapido) — used with same card shell as active policies */
export type InactiveTripKind = "cab" | "bike" | "auto" | "passenger" | "captain"

export interface InactivePolicy {
  id: string
  policyNumber: string
  /** e.g. rapido_cab_trip, rapido_bike_trip */
  planKey: string
  /** Short label for header (e.g. Rapido Trip) */
  productTitle: string
  /** Full product name in details (e.g. Rapido Trip Insurance) */
  productName: string
  policyHolder: string
  /** Displayed period, e.g. 21 Jan 2023 – 22 Jan 2023 */
  periodLabel: string
  tripKind: InactiveTripKind
}

export interface PolicyAction {
  id: string
  label: string
  action: string
}
