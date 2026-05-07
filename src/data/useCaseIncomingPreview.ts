import type { IncomingCallModalViewModel } from "@/data/simulateCallScenarios"
import { ONGOING_CLAIM_STATUS, ONGOING_RAISE_CLAIM } from "@/lib/canonicalOngoingLabels"
import type { CrmDemoState } from "@/types/navigation"

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
  crmDemo?: CrmDemoState | null,
): IncomingCallModalViewModel {
  let vm: IncomingCallModalViewModel = { ...base }
  const patch = PREVIEW_PATCHES[customerId]
  if (patch) {
    vm = { ...vm, ...patch }
  }

  if (customerId === "raj-kapoor" && crmDemo?.chatMockCase === "raj_raise_claim_nexon_gmc") {
    return {
      ...vm,
      ongoingIssue: ONGOING_RAISE_CLAIM,
      vehicle: "Tata Nexon",
      summaryLines: [
        "Opening context: register a motor claim on Tata Nexon (comprehensive).",
        "Customer also holds 1 ACKO GMC policy — note if health / hospitalisation comes up.",
      ],
      showCallVehicle: true,
      showLastCall: false,
      showQuickSummary: true,
    }
  }

  if (customerId === "raj-kapoor" && crmDemo?.chatMockCase === "raj_cold_nexon") {
    return {
      ...vm,
      ongoingIssue: crmDemo.callContextOverride?.reason?.trim() || ONGOING_CLAIM_STATUS,
      vehicle: crmDemo.callContextOverride?.vehicle?.trim() || vm.vehicle,
      summaryLines: [
        "Follow-up on the Tata Nexon claim journey.",
        "Use Active policies to confirm cover, FNOL, and next steps.",
      ],
      showCallVehicle: true,
      showLastCall: false,
      showQuickSummary: true,
    }
  }

  return vm
}
