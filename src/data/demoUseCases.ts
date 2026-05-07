import type { CrmDemoState } from "@/types/navigation"

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
        crmDemo: { chatMockCase: "sunil_endorsement_edit_name" },
      },
    ],
  },
]
