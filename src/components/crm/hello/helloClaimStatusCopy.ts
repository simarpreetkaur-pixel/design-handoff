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
  | "something_else"

export const helloClaimStatusChoices: readonly {
  id: HelloClaimStatusChoiceId
  label: string
}[] = [
  { id: "escalate_f_ops", label: "Escalate to F-ops" },
  { id: "view_communication_history", label: "View Communication history" },
  { id: "view_claim_status_timeline", label: "View claim status" },
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

export function claimStatusPreviousCxSummaryCopy(jtbd: JTBD): string {
  const raw =
    jtbd.openingQuickSummary?.trim() ||
    jtbd.aiSummary?.bullets?.[0]?.trim() ||
    "Survey follow-up; claim active on file."
  const oneLine = raw.replace(/\s+/g, " ").trim()
  const max = 110
  const body = oneLine.length > max ? `${oneLine.slice(0, max - 1)}…` : oneLine
  return `Brief Summary: ${body}`
}

export const helloFopsEscalationSuccessHeadline =
  "Issue escalated to F-ops successfully."

export const helloFopsEscalationSuccessQuotedLine =
  "The Ops team will follow up on the missed survey and unblock the repair estimate."
