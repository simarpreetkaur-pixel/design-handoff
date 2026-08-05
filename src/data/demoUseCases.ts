import type { CrmDemoState } from "@/types/navigation"
import { rajKapoorClaimStatusNexonJtbd } from "@/data/mockCustomers"
import { SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK } from "@/data/sunilEditPolicyUseCases"

export type DemoPillConfig = {
  label: string
  customerId: string
  crmDemo: CrmDemoState
  /** Skip the incoming call modal and navigate directly to CRM (for non-call demo flows). */
  directEntry?: boolean
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
    id: "raise-claim-figma",
    number: 1,
    title: "Raise a claim",
    pills: [
      {
        label: "Rajesh Kumar",
        customerId: "rajesh-kumar-figma",
        crmDemo: {
          chatMockCase: "rajesh_raise_claim_figma",
          callContextOverride: {
            reason: "Raise a claim",
            vehicle: "Ecosport Titanium 2025",
          },
        },
      },
    ],
  },
  {
    id: "edit-policy-figma",
    number: 2,
    title: "Edit policy",
    pills: [
      {
        label: "Rajesh Kumar",
        customerId: "rajesh-kumar-figma",
        crmDemo: {
          chatMockCase: "rajesh_edit_policy_figma",
          callContextOverride: {
            reason: "Add Chassis Number in policy",
            vehicle: "Ecosport Titanium 2025",
          },
        },
      },
    ],
  },
  {
    id: "claim-status",
    number: 3,
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
    id: "sunil-unknown-reason",
    number: 4,
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
    number: 5,
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
    id: "capability-showcase",
    number: 6,
    title: "Capability showcase",
    pills: [
      {
        label: "Rajesh Kumar",
        customerId: "rajesh-kumar-figma",
        directEntry: true,
        crmDemo: {
          chatMockCase: "rajesh_capability_showcase",
        },
      },
    ],
  },
  {
    id: "phase-1",
    number: 7,
    title: "Phase-1",
    pills: [
      {
        label: "Rajesh Kumar",
        customerId: "rajesh-kumar-figma",
        crmDemo: {
          chatMockCase: "rajesh_phase1",
          callContextOverride: {
            reason: "Raise a claim",
            vehicle: "Ecosport Titanium 2025",
          },
        },
      },
    ],
  },
  {
    id: "voicebot-handover",
    number: 8,
    title: "Voicebot handover",
    pills: [
      {
        label: "Sumit Sharma",
        customerId: "sumit-sharma",
        crmDemo: {
          chatMockCase: "sumit_voicebot_handover",
          callContextOverride: {
            reason: "Edit name in policy",
            vehicle: "Ecosport Titanium 2025",
          },
        },
      },
    ],
  },
]
