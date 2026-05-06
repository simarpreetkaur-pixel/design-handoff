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
  pills: DemoPillConfig[]
}

export const DEMO_USE_CASE_SECTIONS: DemoUseCaseSection[] = [
  {
    id: "claim-status",
    number: 1,
    title: "Claim Status",
    pills: [
      {
        label: "Known JTBD",
        customerId: "rajesh-kumar",
        crmDemo: { chatMockCase: "default" },
      },
      {
        label: "Previous AI summary",
        customerId: "anita-sharma-claim-payment-kyc",
        crmDemo: {
          chatMockCase: "default",
          initialSelectedJtbdId: "jtbd-claim-payment-kyc-1",
        },
      },
    ],
  },
  {
    id: "raise-claim",
    number: 2,
    title: "Raise a Claim",
    pills: [
      {
        label: "New caller",
        customerId: "raj-kapoor",
        crmDemo: { chatMockCase: "raj_cold_nexon" },
      },
    ],
  },
  {
    id: "policy-renewal",
    number: 3,
    title: "Policy Renewal",
    pills: [
      {
        label: "Known JTBD",
        customerId: "ayush-singhal",
        crmDemo: {
          chatMockCase: "default",
          initialSelectedJtbdId: "jtbd-ayush-renewal-1",
        },
      },
    ],
  },
  {
    id: "policy-endorsement",
    number: 4,
    title: "Edit Policy",
    pills: [
      {
        label: "New caller",
        customerId: "sunil-gupta",
        crmDemo: { chatMockCase: "sunil_endorsement_edit_name" },
      },
      {
        label: "Known JTBD",
        customerId: "priyanka-shah",
        crmDemo: { chatMockCase: "default" },
      },
    ],
  },
  {
    id: "payment-query",
    number: 5,
    title: "Payment related query",
    pills: [
      {
        label: "Known JTBD",
        customerId: "amit-patel",
        crmDemo: { chatMockCase: "default" },
      },
    ],
  },
  {
    id: "unknown-caller",
    number: 6,
    title: "Unknown caller",
    pills: [
      {
        label: "Different number inbound",
        customerId: "unknown-caller",
        crmDemo: { chatMockCase: "default" },
      },
    ],
  },
]
