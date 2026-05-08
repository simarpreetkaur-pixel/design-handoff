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

export type JTBDType = "claim" | "renewal" | "endorsement"

/** Field-level endorsement edits (AI Companion wizard → JTBD). */
export type EndorsementEditKind =
  | "policy_holder_name"
  | "policy_holder_email"
  | "phone_number"
  | "engine_number"
  | "chassis_number"

/** One row in the expanded AI Summary timeline (left rail). */
export interface AiSummaryTimelineStep {
  title: string
  detail: string
}

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
    /** Compact steps shown as a vertical timeline when expanded (preferred over long prose). */
    detailedSummaryTimeline?: AiSummaryTimelineStep[]
    /** Full agent-facing body shown inline when expanded (split paragraphs with `\n\n`). Used when no timeline is provided. */
    detailedSummary?: string
    /** Prefill for legacy header CTA → opens chat; ignored when `detailedSummary` is set. */
    viewDetailsChatPrefill?: string
    /** Header label next to icon (default in UI: “Tip:”). */
    sectionHeading?: string
    /** `ai_summary` uses the sparkle asset; default uses light bulb. */
    headerIconVariant?: "default" | "ai_summary"
    /** When true, section heading + icon sit above bullets; default is heading and bullets in one row. */
    stackHeaderWithBullets?: boolean
  }
  /**
   * Hello / incoming strip — one-line agent-facing summary shown next to call context
   * (reason + vehicle). Optional; Classic rail ignores it.
   */
  openingQuickSummary?: string
  /** Optional custom prefill for "Ask in chat" specific to this JTBD */
  askInChatPrefill?: string
  /** Optional “Related SOPs to this case” block (below quick related actions). */
  relatedSops?: RelatedSopRow[]
}

export type StatusState = "completed" | "current" | "pending"

/** Row inside the yellow survey / detail card on the claim timeline (Figma Claim Status). */
export type ClaimCalloutRow = {
  label: string
  value: string
  /** e.g. Status: Missed — red text + alert icon per design */
  variant?: "default" | "error"
}

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
  /** Detail rows under the current step (survey date/time/agent/status, etc.). */
  calloutRows?: ClaimCalloutRow[]
}

export interface AgentAction {
  id: string
  step: number
  description: string
  /** CTA label; use empty string when this step has no button. */
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
