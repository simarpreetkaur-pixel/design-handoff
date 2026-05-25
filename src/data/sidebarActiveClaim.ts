import type { JTBD } from "@/types/crm"

/** Left sidebar Active Claim card — Figma nodes 9367:22470 (collapsed), 9367:22418 (expanded). */
export type SidebarActiveClaim = {
  vehicleName: string
  claimId: string
  /** When set, shows red jewel + “CH call schedule” row in expanded view. */
  chCallSchedule?: string
  claimType: string
  claimDate: string
  policyHolder: string
  policy: string
  claimAmount: string
}

/** UC2 — Raj Kapoor · Claim Status (Tata Nexon, survey missed). */
export const rajKapoorActiveClaimSidebar: SidebarActiveClaim = {
  vehicleName: "Tata Nexon",
  claimId: "MTNDCR812456",
  claimType: "Own damage",
  claimDate: "12 Feb'26",
  policyHolder: "Raj Kapoor",
  policy: "Car_comprehensive",
  claimAmount: "₹18,500",
}

/** UC9 — Rekha Gupta · Claim status escalated (reimbursement; CH callback scheduled). */
export const rekhaGuptaActiveClaimSidebar: SidebarActiveClaim = {
  vehicleName: "Tata Nexon",
  claimId: "MTNDCR824725",
  chCallSchedule: "2 PM -4 PM today",
  claimType: "Reimbursement",
  claimDate: "30th May 2026",
  policyHolder: "Rekha Gupta",
  policy: "Car_comprehensive",
  claimAmount: "₹24,000",
}

/** UC5 — Sunil Gupta · Refund escalation (Honda City). */
export const sunilGuptaRefundActiveClaimSidebar: SidebarActiveClaim = {
  vehicleName: "Honda City",
  claimId: "REF-UCPI-88421",
  claimType: "Refund — failed purchase",
  claimDate: "8 May'26",
  policyHolder: "Sunil Gupta",
  policy: "Car_Comprehensive",
  claimAmount: "₹42,180",
}

const ACTIVE_CLAIM_BY_JTBD_ID: Record<string, SidebarActiveClaim> = {
  "jtbd-raj-nexon-claim-status": rajKapoorActiveClaimSidebar,
  "jtbd-rekha-nexon-claim-status-escalated": rekhaGuptaActiveClaimSidebar,
  "jtbd-sunil-refund-escalation": sunilGuptaRefundActiveClaimSidebar,
}

/**
 * Resolves sidebar Active Claim for Hello claim-status flows.
 * Content varies by JTBD / use case; section is always shown when a JTBD is present.
 */
export function resolveSidebarActiveClaim(claimStatusJtbd: JTBD | undefined): SidebarActiveClaim | null {
  if (!claimStatusJtbd) return null
  const preset = ACTIVE_CLAIM_BY_JTBD_ID[claimStatusJtbd.id]
  if (preset) return preset

  const vehicle = claimStatusJtbd.vehicle?.trim() || "Vehicle"
  return {
    vehicleName: vehicle,
    claimId: "—",
    claimType: "—",
    claimDate: "—",
    policyHolder: "—",
    policy: "—",
    claimAmount: "—",
  }
}
