import type { Policy } from "@/types/crm"

export type RaiseClaimWizardBootstrap =
  | { entry: "no_policies" }
  | { entry: "policy_pick"; policies: Policy[]; customerName: string }
  /** Single active policy — next step is create-workflow vs steps-only (like endorsement chat flow). */
  | { entry: "workflow_pick"; policy: Policy; customerName: string }

/**
 * Detect raise-claim / FNOL style intent. Avoid false positives (e.g. "no claim bonus").
 */
export function parseRaiseClaimChatIntent(userText: string): boolean {
  const t = userText.trim()
  if (!t) return false

  if (/\bno\s+claim\s+bonus\b/i.test(t)) return false

  return (
    /\braise\s+(a\s+)?claim\b/i.test(t) ||
    /\bfile\s+(a\s+)?claim\b/i.test(t) ||
    /\bopen\s+(a\s+)?claim\b/i.test(t) ||
    /\bstart\s+(a\s+)?claim\b/i.test(t) ||
    /\bnew\s+claim\b/i.test(t) ||
    /\bclaim\s+intimation\b/i.test(t) ||
    /\bfnol\b/i.test(t) ||
    /\bfirst\s+notice\s+of\s+loss\b/i.test(t)
  )
}

export function buildRaiseClaimWizardBootstrap(
  activePolicies: Policy[],
  customerName: string,
): RaiseClaimWizardBootstrap {
  const policies = activePolicies.filter((p) => Boolean(p.id?.trim() && p.policyNumber?.trim()))
  const cname = customerName.trim() || "the customer"

  if (policies.length === 0) {
    return { entry: "no_policies" }
  }
  if (policies.length === 1) {
    return { entry: "workflow_pick", policy: policies[0], customerName: cname }
  }
  return { entry: "policy_pick", policies, customerName: cname }
}
