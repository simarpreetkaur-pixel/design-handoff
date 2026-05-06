import type { IncomingCallModalViewModel } from "@/data/simulateCallScenarios"

/**
 * Drawer-only overrides for incoming-call modal copy (does not affect Simulate Live).
 * Keys are customer ids used from the Use cases drawer.
 */
const PREVIEW_PATCHES: Partial<Record<string, Partial<IncomingCallModalViewModel>>> = {
  "ayush-singhal": {
    ongoingIssue: "Policy Renewal",
    showCallVehicle: true,
    showLastCall: false,
    showQuickSummary: false,
  },
  "sunil-gupta": {
    ongoingIssue: "Unknown",
    summaryLines: ["", ""],
    showCallVehicle: false,
    showLastCall: false,
    showQuickSummary: false,
  },
  "anita-sharma-claim-payment-kyc": {
    yearsWithAcko: "1 year with ACKO",
    ongoingIssue: "Claim Status",
    lastCallBadge: "Angry",
    lastCallVariant: "angry",
    summaryLines: [
      "Doc review overran usual TAT — extra document rounds",
      "Claim approved; payout held on KYC name mismatch",
    ],
    showCallVehicle: true,
    showLastCall: true,
    showQuickSummary: true,
  },
}

export function mergeUseCaseIncomingPreview(
  customerId: string,
  base: IncomingCallModalViewModel,
): IncomingCallModalViewModel {
  const patch = PREVIEW_PATCHES[customerId]
  if (!patch) {
    return base
  }
  return { ...base, ...patch }
}
