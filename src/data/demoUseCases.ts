import type { CrmDemoState } from "@/types/navigation"
import {
  rajKapoorClaimStatusNexonJtbd,
  sunilGuptaRefundEscalationJtbd,
  sunilGuptaSwiftDzireEditNameJtbd,
} from "@/data/mockCustomers"
import {
  SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK,
  SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK,
} from "@/data/sunilEditPolicyUseCases"

export type DemoPillConfig = {
  label: string
  customerId: string
  crmDemo: CrmDemoState
}

export type DemoUseCaseSection = {
  id: string
  number: number
  title: string
  /** Single scenario triggered when the row is clicked (no sub-pills). */
  pills: [DemoPillConfig]
}

export const DEMO_USE_CASE_SECTIONS: DemoUseCaseSection[] = [
  {
    id: "raise-claim",
    number: 1,
    title: "Raise a claim",
    pills: [
      {
        label: "Raj Kapoor",
        customerId: "raj-kapoor",
        crmDemo: { chatMockCase: "raj_raise_claim_nexon_gmc" },
      },
    ],
  },
  {
    id: "claim-status",
    number: 2,
    title: "Claim Status",
    pills: [
      {
        label: "Raj Kapoor",
        customerId: "raj-kapoor",
        crmDemo: {
          chatMockCase: "raj_cold_nexon",
          initialSelectedJtbdId: rajKapoorClaimStatusNexonJtbd.id,
          callContextOverride: {
            reason: "Claim Status",
            vehicle: "Tata Nexon",
          },
        },
      },
    ],
  },
  {
    id: "policy-endorsement",
    number: 3,
    title: "Edit Policy",
    pills: [
      {
        label: "Sunil Gupta",
        customerId: "sunil-gupta",
        crmDemo: {
          chatMockCase: SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK,
          initialSelectedJtbdId: sunilGuptaSwiftDzireEditNameJtbd.id,
          callContextOverride: {
            reason: "Edit Policy",
            vehicle: "Maruti Suzuki Swift Dzire 2024",
          },
        },
      },
    ],
  },
  {
    id: "road-side-assistance",
    number: 4,
    title: "Road Side assistance",
    pills: [
      {
        label: "Raj Kapoor",
        customerId: "raj-kapoor",
        crmDemo: {
          chatMockCase: "raj_road_side_assistance",
          callContextOverride: {
            reason: "Road Side Assistance",
            vehicle: "Tata Nexon",
          },
        },
      },
    ],
  },
  {
    id: "escalation-case-refund",
    number: 5,
    title: "Escalation case",
    pills: [
      {
        label: "Sunil Gupta",
        customerId: "sunil-gupta",
        crmDemo: {
          chatMockCase: "sunil_escalation_refund_payment",
          initialSelectedJtbdId: sunilGuptaRefundEscalationJtbd.id,
          callContextOverride: {
            reason: "Refund Status",
            vehicle: "Honda City",
          },
        },
      },
    ],
  },
  {
    id: "sunil-unknown-reason",
    number: 6,
    title: "Unknown reason",
    pills: [
      {
        label: "Sunil Gupta",
        customerId: "sunil-gupta",
        crmDemo: {
          chatMockCase: SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK,
          callContextOverride: {
            reason: "Unknown",
          },
        },
      },
    ],
  },
  {
    id: "unknown-caller",
    number: 7,
    title: "Unknown caller",
    pills: [
      {
        label: "Unknown caller",
        customerId: "unknown-caller",
        crmDemo: {
          chatMockCase: "unknown_caller_resolution",
        },
      },
    ],
  },
  {
    id: "live-listening-raise-claim",
    number: 8,
    title: "Live listening",
    pills: [
      {
        label: "Raj Kapoor",
        customerId: "raj-kapoor",
        crmDemo: {
          chatMockCase: "raj_live_listening_raise_claim",
          callContextOverride: {
            reason: "Raise a claim",
            vehicle: "Tata Nexon",
          },
        },
      },
    ],
  },
]
