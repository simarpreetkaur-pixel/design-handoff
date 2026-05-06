import type { JTBD } from "@/types/crm"

/** Canonical “Ongoing issue / JTBD” labels — keep UI and incoming-call modal aligned. */
export const ONGOING_CLAIM_STATUS = "Claim Status"
export const ONGOING_RAISE_CLAIM = "Raise a Claim"
export const ONGOING_POLICY_RENEWAL = "Policy Renewal"
export const ONGOING_POLICY_ENDORSEMENT = "Edit Policy"
export const ONGOING_PAYMENT_RELATED_QUERY = "Payment related query"

/**
 * Headline for JTBD tab cards (Ongoing JTBD rail).
 * Maps mock / chat-injected rows to one of the five canonical journeys.
 */
export function canonicalOngoingJtbdTitle(jtbd: JTBD): string {
  if (jtbd.type === "renewal") return ONGOING_POLICY_RENEWAL
  if (jtbd.type === "endorsement") return ONGOING_POLICY_ENDORSEMENT

  const id = jtbd.id.toLowerCase()
  const title = jtbd.title.trim().toLowerCase()

  if (id.startsWith("jtbd-chat-raise-claim") || /^raise\s*a?\s*claim$/.test(title)) {
    return ONGOING_RAISE_CLAIM
  }
  if (
    id.includes("edit-name") ||
    id.startsWith("jtbd-chat-endorsement") ||
    title === "edit name" ||
    title === "endorsement" ||
    title === "edit policy"
  ) {
    return ONGOING_POLICY_ENDORSEMENT
  }
  if (id === "jtbd-issuance-1") {
    return ONGOING_POLICY_ENDORSEMENT
  }
  if (id === "jtbd-amit-payment-query" || title.includes("payment") || title.includes("premium")) {
    return ONGOING_PAYMENT_RELATED_QUERY
  }

  return ONGOING_CLAIM_STATUS
}

/**
 * Normalizes copy shown as “Ongoing issue” on the incoming call card.
 */
export function canonicalIncomingOngoingIssue(raw: string): string {
  const s = raw.trim()
  const k = s.toLowerCase()
  if (!k) return s

  if (k === "claim status" || k.includes("claim settlement")) return ONGOING_CLAIM_STATUS
  if (k === "policy issuance" || k === "policy endorsement" || k === "edit policy") return ONGOING_POLICY_ENDORSEMENT
  if (k.includes("process guidance")) return ONGOING_CLAIM_STATUS
  if (k.includes("policy renewal")) return ONGOING_POLICY_RENEWAL
  if (k.includes("premium payment") || k.includes("payment related")) return ONGOING_PAYMENT_RELATED_QUERY
  if (k === "unknown") return "Unknown"

  return s
}
