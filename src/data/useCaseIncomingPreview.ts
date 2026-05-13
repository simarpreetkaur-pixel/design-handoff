import type { IncomingCallModalViewModel } from "@/data/simulateCallScenarios"
import { rajKapoorClaimStatusNexonJtbd } from "@/data/mockCustomers"
import { ONGOING_CLAIM_STATUS, ONGOING_RAISE_CLAIM } from "@/lib/canonicalOngoingLabels"
import type { CrmDemoState } from "@/types/navigation"
import { SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK, SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK } from "@/data/sunilEditPolicyUseCases"

/**
 * Drawer-only overrides for incoming-call modal copy (does not affect Simulate Live).
 * Keys are customer ids used from the Use cases drawer.
 */
const PREVIEW_PATCHES: Partial<Record<string, Partial<IncomingCallModalViewModel>>> = {
  "ayush-singhal": {
    ongoingIssue: "Policy Renewal",
    showCallVehicle: true,
    showLastCall: false,
  },
  "anita-sharma-claim-payment-kyc": {
    yearsWithAcko: "1 year with ACKO",
    ongoingIssue: "Claim Status",
    lastCallBadge: "Angry",
    lastCallVariant: "angry",
    showCallVehicle: true,
    showLastCall: true,
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
      showCallVehicle: true,
      showLastCall: false,
    }
  }

  if (customerId === "raj-kapoor" && crmDemo?.chatMockCase === "raj_live_listening_raise_claim") {
    return {
      ...vm,
      ongoingIssue: ONGOING_RAISE_CLAIM,
      vehicle: crmDemo.callContextOverride?.vehicle?.trim() || "Tata Nexon",
      showCallVehicle: true,
      showLastCall: false,
    }
  }

  if (customerId === "raj-kapoor" && crmDemo?.chatMockCase === "raj_cold_nexon") {
    return {
      ...vm,
      ongoingIssue: crmDemo.callContextOverride?.reason?.trim() || ONGOING_CLAIM_STATUS,
      vehicle: crmDemo.callContextOverride?.vehicle?.trim() || vm.vehicle,
      showCallVehicle: true,
      showLastCall: false,
      callContextQuickSummary: rajKapoorClaimStatusNexonJtbd.openingQuickSummary,
    }
  }

  if (customerId === "raj-kapoor" && crmDemo?.chatMockCase === "raj_road_side_assistance") {
    return {
      ...vm,
      ongoingIssue: crmDemo.callContextOverride?.reason?.trim() || "Road Side Assistance",
      vehicle: crmDemo.callContextOverride?.vehicle?.trim() || vm.vehicle,
      showCallVehicle: true,
      showLastCall: false,
    }
  }

  if (customerId === "sunil-gupta" && crmDemo?.chatMockCase === SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK) {
    const vehicle =
      crmDemo.callContextOverride?.vehicle?.trim() || "Maruti Suzuki Swift Dzire 2024"
    return {
      ...vm,
      ongoingIssue: crmDemo.callContextOverride?.reason?.trim() || "Edit Policy",
      vehicle,
      showCallVehicle: true,
      showLastCall: false,
    }
  }

  if (customerId === "sunil-gupta" && crmDemo?.chatMockCase === SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK) {
    return {
      ...vm,
      ongoingIssue: crmDemo.callContextOverride?.reason?.trim() || "Unknown",
      showCallVehicle: false,
      showLastCall: false,
    }
  }

  if (customerId === "sunil-gupta" && crmDemo?.chatMockCase === "sunil_escalation_refund_payment") {
    return {
      ...vm,
      ongoingIssue: crmDemo.callContextOverride?.reason?.trim() || "Refund Status",
      vehicle: crmDemo.callContextOverride?.vehicle?.trim() || "Honda City",
      showCallVehicle: true,
      showLastCall: false,
    }
  }

  return vm
}
