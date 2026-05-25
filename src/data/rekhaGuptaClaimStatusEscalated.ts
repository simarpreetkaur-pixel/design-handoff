import type { Customer, JTBD, Policy } from "@/types/crm"

/** Support history — Figma OMNI Post-Sales § Vish feedback (node 9203:24002). */
export type RekhaSupportHistoryEntry = {
  agent: string
  timestamp: string
  description: string
}

export const rekhaGuptaSupportHistoryPreview: RekhaSupportHistoryEntry = {
  agent: "CX Anita",
  timestamp: "3 days ago",
  description:
    "Customer called about delayed reimbursement for their Tata Nexon motor claim; agent shared TAT and noted prior escalation.",
}

export const rekhaGuptaSupportHistoryEntries: RekhaSupportHistoryEntry[] = [
  rekhaGuptaSupportHistoryPreview,
  {
    agent: "CX Supriya",
    timestamp: "8 days ago",
    description:
      "Follow-up on reimbursement status — customer frustrated about a three-week delay on the Nexon claim payout.",
  },
  {
    agent: "CX Vinod",
    timestamp: "12 days ago",
    description:
      "Customer asked for claim settlement timeline; agent documented commitment on reimbursement and shared Ops SLA.",
  },
  {
    agent: "CX Priya",
    timestamp: "16 days ago",
    description:
      "First escalation on delayed reimbursement; case tagged for Ops review and customer promised a callback within 48 hours.",
  },
]

export { rekhaGuptaActiveClaimSidebar } from "@/data/sidebarActiveClaim"

/** Drawer #9 — Rekha Gupta · escalated claim status (5th call in 2 weeks). */
export const rekhaGupta: Customer = {
  id: "rekha-gupta",
  name: "Rekha Gupta",
  language: "Hindi",
  phone: "+91 98765 42354",
  email: "rekha.gupta@gmail.com",
  appStatus: "installed",
  tenureWithAcko: "4 years with ACKO",
  kycStatus: "pending",
  callContext: {
    reason: "Claim Status",
    vehicle: "Tata Nexon",
  },
  lastCall: {
    label: "Frustrated caller",
    sentiment: "frustrated",
  },
}

export const rekhaGuptaActivePolicies: Policy[] = [
  {
    id: "policy-rekha-ecosport-1",
    name: "Ecosport Titanium 2025",
    type: "Motor Insurance",
    policyNumber: "DCCR10462314881/00",
    expiryDate: "15 Aug'26",
    vehicle: "Ford Ecosport Titanium 2025",
    productCode: "car_comprehensive",
    policyHolder: "Rekha Gupta",
    planDisplayName: "Comprehensive",
    policyPeriodLabel: "16 Aug'25 – 15 Aug'26",
    tenureLabel: "1 Year",
  },
  {
    id: "policy-rekha-nexon-motor",
    name: "Tata Nexon",
    type: "Motor Insurance",
    policyNumber: "DCCR10462314902/00",
    expiryDate: "22 Jun'26",
    vehicle: "Tata Nexon",
    productCode: "car_comprehensive",
    policyHolder: "Rekha Gupta",
    planDisplayName: "Comprehensive",
    policyPeriodLabel: "23 Jun'25 – 22 Jun'26",
  },
  {
    id: "policy-rekha-activa-1",
    name: "Honda Activa 2026",
    type: "Motor Insurance",
    policyNumber: "ACCR10468614955/02",
    expiryDate: "10 May'26",
    vehicle: "Honda Activa 2026",
    policyHolder: "Rekha Gupta",
    planDisplayName: "Third Party",
    policyPeriodLabel: "11 May 2025 – 10 May 2026",
    tenureLabel: "1 Year",
  },
  {
    id: "policy-rekha-corporate-health",
    name: "Corporate Health Insurance",
    type: "Health Insurance",
    policyNumber: "GMC-ACK-REKHA-88201",
    members: 3,
    expiryDate: "31 Mar'27",
    policyHolder: "Rekha Gupta",
    planDisplayName: "ACKO Corporate Health",
    totalCoverage: "₹10,00,000",
    policyPeriodLabel: "1 Apr 2026 – 31 Mar 2027",
    tenureLabel: "1 Year",
    coveredMembers: [
      { name: "Rekha Gupta", relation: "Self" },
      { name: "Amit Gupta", relation: "Spouse" },
      { name: "Riya Gupta", relation: "Child" },
    ],
  },
]

/** UC9 — Claim status escalated: reimbursement delay, repeat caller. */
export const rekhaGuptaClaimStatusEscalatedJtbd: JTBD = {
  id: "jtbd-rekha-nexon-claim-status-escalated",
  type: "claim",
  title: "Claim status",
  vehicle: "Tata Nexon",
  isActive: true,
  openingQuickSummary:
    "Reimbursement delayed 22+ days; customer has called five times in two weeks — prior Ops escalation open.",
  aiSummary: {
    bullets: [
      "Cashless claim closed at garage on 28 Apr; reimbursement still pending in finance queue.",
      "Customer escalated twice — last Ops callback promised payout within 5 business days (not met).",
    ],
    sectionHeading: "Previous summary",
    headerIconVariant: "ai_summary",
    stackHeaderWithBullets: true,
    detailedSummaryTimeline: [
      {
        title: "3 May'26, 11:20 — Anita (CX)",
        detail:
          "Rekha asked for reimbursement status on Tata Nexon claim CLM-REK-2026-4412; agent shared finance TAT and noted open Ops ticket.",
      },
      {
        title: "28 Apr'26, 16:05 — Priya (CX)",
        detail:
          "First escalation logged — reimbursement delayed past committed date; Ops tagged case priority high.",
      },
    ],
  },
  status: [
    {
      step: "Claim registered",
      state: "completed",
      date: "18 Apr'26",
    },
    {
      step: "Garage repair completed",
      state: "completed",
      date: "28 Apr'26",
    },
    {
      step: "Reimbursement processing",
      state: "current",
      date: "5 May'26",
      calloutRows: [
        { label: "Amount", value: "₹42,180" },
        { label: "Finance queue", value: "Delayed", variant: "error" },
        { label: "Prior escalation", value: "Open", variant: "error" },
      ],
    },
    {
      step: "Payout to customer",
      state: "pending",
    },
  ],
  agentActions: [
    {
      id: "rekha-cs-escalate",
      step: 1,
      description:
        "Reimbursement is past SLA and the customer has called five times — escalate to F-ops with claim ID and prior ticket reference.",
      cta: "Escalate the issue",
      completed: false,
    },
    {
      id: "rekha-cs-1",
      step: 2,
      description:
        "Walk through prior communication history so the customer knows their callbacks were documented.",
      cta: "View communication history",
      completed: false,
    },
    {
      id: "rekha-cs-2",
      step: 3,
      description: "Send an ACKO Alert with claim status deep link and expected payout window.",
      cta: "Send ACKO Alert",
      completed: false,
    },
  ],
  quickActions: ["Escalate the issue", "View communication history", "Send ACKO Alert"],
  askInChatPrefill:
    "Rekha's Tata Nexon claim — reimbursement delayed 22+ days, fifth call in two weeks. How do we escalate to F-ops and unblock payout?",
}
