/**
 * Copy and choices — Claim status Hello view (aligned with Raise claim Hello patterns).
 */

import type { JTBD } from "@/types/crm"

export const HELLO_CLAIM_STATUS_FLOW_OFFER_ID = "claim-status-hello-main-offer"

export const HELLO_CLAIM_STATUS_ESCALATE_TOAST = "Escalated to F-ops."

export const HELLO_CLAIM_STATUS_CHOICE_PROMPT = "What would you like to do?"

export type HelloClaimStatusChoiceId =
  | "escalate_f_ops"
  | "view_communication_history"
  | "view_claim_status_timeline"
  | "schedule_ch_appointment"
  | "something_else"

export const helloClaimStatusChoices: readonly {
  id: HelloClaimStatusChoiceId
  label: string
}[] = [
  { id: "schedule_ch_appointment", label: "Schedule CH Appointment" },
  { id: "view_claim_status_timeline", label: "View claim status" },
  { id: "view_communication_history", label: "View Communication history" },
  { id: "something_else", label: "Customer calling for something else." },
]

/** UC9 — escalated repeat caller: two choices only (Figma 9203:23755). */
export const helloClaimStatusEscalatedChoices: readonly {
  id: HelloClaimStatusChoiceId
  label: string
}[] = [
  { id: "view_claim_status_timeline", label: "View claim status" },
  { id: "view_communication_history", label: "View communication history" },
]

export const helloFopsEscalationEscalatedSuccessQuotedLine =
  "F-ops will chase finance for the delayed reimbursement and call the customer back with a payout date."

export function claimStatusPreviousCxSummaryCopy(_jtbd: JTBD): string {
  return "The claim is in Pickup & Survey scheduled stage, scheduled for 20 May 2026, 2–4 PM — not completed yet."
}

export const helloFopsEscalationSuccessHeadline =
  "Issue escalated to F-ops successfully."

export const helloFopsEscalationSuccessQuotedLine =
  "The Ops team will follow up and unblock the pickup &amp; survey step."

export const helloScheduleCHSuccessHeadline = "Claim handler appointment scheduled."

export const helloScheduleCHSuccessQuotedLine =
  "The customer will receive a callback from the claim handler regarding the pickup &amp; survey."
