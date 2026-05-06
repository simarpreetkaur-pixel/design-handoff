import type { Customer, InactivePolicy, JTBD, Policy, PolicyAction, RelatedSopRow } from "@/types/crm"

export const rajeshKumar: Customer = {
  id: "rajesh-kumar",
  name: "Rajesh Kumar",
  language: "Hindi",
  phone: "91 ******354",
  email: "ra******34.com",
  appStatus: "installed",
  tenureWithAcko: "4 years with ACKO",
  kycStatus: "verified",
  callContext: {
    reason: "Claim Status",
    vehicle: "Ford Ecosport Titanium",
  },
}

export const rajeshKumarJTBDs: JTBD[] = [
  {
    id: "jtbd-claim-1",
    type: "claim",
    title: "Claim",
    vehicle: "Ecosport Titanium 2025",
    isActive: true,
    status: [
      {
        step: "Claim Registered",
        state: "completed",
        date: "12 Feb'26",
      },
      {
        step: "Garage Drop-off",
        state: "current",
        date: "12 Feb'26",
        warning: "Customer has not selected preferred garage for drop-off",
        calloutMeta: { label: "Action required from:", value: "Rajesh Kumar" },
      },
      {
        step: "Repair Estimate",
        state: "pending",
      },
    ],
    agentActions: [
      {
        id: "action-1",
        step: 1,
        description: "Ask customer to select preferred garage on App",
        cta: "Send Alert",
        completed: false,
      },
      {
        id: "action-2",
        step: 2,
        description:
          "Once customer has selected, inform they will get a call from Claim Handler in 1-2 working days.",
        cta: "",
        completed: false,
      },
    ],
    quickActions: ["Send communication", "Raise an RSA"],
  },
  {
    id: "jtbd-renewal-1",
    type: "renewal",
    title: "Renewal Reminder",
    vehicle: "Honda Activa",
    isActive: false,
    status: [
      {
        step: "Renewal window open",
        state: "current",
        date: "12 Feb'26",
        info: "Customer is eligible for No claim bonus",
      },
      {
        step: "Customer decision",
        state: "pending",
      },
    ],
    agentActions: [
      {
        id: "renewal-action-1",
        step: 1,
        description: "Transfer the call to the Presales team for renewal quote and payment link.",
        cta: "Transfer",
        completed: false,
      },
    ],
    quickActions: [],
  },
]

export const rajeshKumarActivePolicies: Policy[] = [
  {
    id: "policy-health-1",
    name: "ACKO Health Plan",
    type: "Health Insurance",
    policyNumber: "ACK-HL-2024-88421",
    members: 4,
    expiryDate: "29 Nov'26",
    policyHolder: "Rajesh Kumar",
    planDisplayName: "Acko_Platinum",
    totalCoverage: "₹5,00,000",
    policyPeriodLabel: "25 Nov 2024 - 24 Nov 2025",
    tenureLabel: "1 Year",
    coveredMembers: [
      { name: "Rajesh Kumar", relation: "Self" },
      { name: "Satish Kumar", relation: "Father" },
      { name: "Meera Bai", relation: "Mother" },
      { name: "Raju Kumar", relation: "Son" },
    ],
  },
  {
    id: "policy-comprehensive-1",
    name: "Comprehensive Plan",
    type: "Motor Insurance",
    policyNumber: "DBCR10468610009/02",
    expiryDate: "22 Mar'27",
    vehicle: "Ford Ecosport Titanium 2025",
    policyHolder: "Rajesh Kumar",
    planDisplayName: "Comprehensive",
    policyPeriodLabel: "22 Mar 2026 - 21 Mar 2027",
    tenureLabel: "1 Year",
  },
  {
    id: "policy-tp-activa-1",
    name: "Third party plan",
    type: "Motor Insurance",
    policyNumber: "ACCR10468614939/02",
    expiryDate: "15 Aug'27",
    vehicle: "Honda Activa",
    policyHolder: "Rajesh Kumar",
    planDisplayName: "Third Party",
    policyPeriodLabel: "15 Aug 2026 - 14 Aug 2027",
    tenureLabel: "1 Year",
  },
]

/** Expired Rapido trip policies for Rajesh Kumar (inactive tab) */
export const rajeshKumarInactivePolicies: InactivePolicy[] = [
  {
    id: "inactive-rapido-1",
    policyNumber: "RAPP00767336003",
    planKey: "rapido_passenger",
    productTitle: "Rapido Trip",
    productName: "Rapido Trip Insurance",
    policyHolder: "Rajesh Kumar",
    periodLabel: "21 Jan 2023 – 22 Jan 2023",
    tripKind: "passenger",
  },
  {
    id: "inactive-rapido-2",
    policyNumber: "RAPP00892144102",
    planKey: "rapido_cab_trip",
    productTitle: "Rapido Trip",
    productName: "Rapido Trip Insurance",
    policyHolder: "Rajesh Kumar",
    periodLabel: "14 Mar 2024 – 15 Mar 2024",
    tripKind: "cab",
  },
  {
    id: "inactive-rapido-3",
    policyNumber: "RAPP00611488291",
    planKey: "rapido_bike_trip",
    productTitle: "Rapido Trip",
    productName: "Rapido Trip Insurance",
    policyHolder: "Rajesh Kumar",
    periodLabel: "2 Aug 2023 – 3 Aug 2023",
    tripKind: "bike",
  },
  {
    id: "inactive-rapido-4",
    policyNumber: "RAPP00933001567",
    planKey: "rapido_captain",
    productTitle: "Rapido Trip",
    productName: "Rapido Trip Insurance",
    policyHolder: "Rajesh Kumar",
    periodLabel: "19 Nov 2023 – 20 Nov 2023",
    tripKind: "captain",
  },
  {
    id: "inactive-rapido-5",
    policyNumber: "RAPP00550877443",
    planKey: "rapido_auto_trip",
    productTitle: "Rapido Trip",
    productName: "Rapido Trip Insurance",
    policyHolder: "Rajesh Kumar",
    periodLabel: "5 Jun 2024 – 6 Jun 2024",
    tripKind: "auto",
  },
]

export const anitaSharmaJTBDs: JTBD[] = [
  {
    id: "jtbd-issuance-1",
    type: "claim",
    title: "Claim",
    vehicle: "Honda Activa 2026",
    isActive: true,
    aiSummary: {
      bullets: [
        "KYC: married name on policy vs maiden name on Aadhaar",
        "4 repeat calls on the same issue",
      ],
      sectionHeading: "AI Summary",
      headerIconVariant: "ai_summary",
      viewDetailsLabel: "VIEW DETAILED SUMMARY",
      detailedSummaryTimeline: [
        {
          title: "Payment",
          detail:
            "Cleared 11 Feb’26 · ref ACK-PYMNT-882114. Issuance unblocked on premium — case sits on KYC only.",
        },
        {
          title: "KYC mismatch",
          detail:
            "Policy shows married name; Aadhaar shows maiden · fuzzy match failed twice. ID not updated offline yet.",
        },
        {
          title: "Repeat-call risk",
          detail:
            "4 inbound attempts since 9 Feb (~6 min avg). Last: Angry — acknowledge before repeating steps.",
        },
        {
          title: "Pre-inspection",
          detail:
            "Gate ISS-MOT-014: no PI slot until KYC = Verified. Don’t promise dates verbally.",
        },
        {
          title: "Do next",
          detail:
            "Send Communication (re-upload pack). Escalate KYC Ops only after one failed clean upload — attach quote ID + audit screenshots.",
        },
      ],
    },
    askInChatPrefill:
      "For this Honda Activa 2026 policy issuance, what’s the right next step to fix the KYC name mismatch (Aadhaar vs policy) before pre-inspection?",
    status: [
      {
        step: "Payment",
        state: "completed",
        date: "12 Feb'26",
      },
      {
        step: "KYC",
        state: "current",
        date: "12 Feb'26",
        warning: "Name on Aadhaar doesn't match policy application",
        calloutMeta: { label: "Action required from:", value: "Anita Sharma" },
      },
      {
        step: "Pre-inspection",
        state: "pending",
      },
    ],
    agentActions: [
      {
        id: "action-kyc-1",
        step: 1,
        description: "Send KYC re-upload link",
        cta: "Send Communication",
        completed: false,
      },
      {
        id: "action-kyc-2",
        step: 2,
        description: "Escalate this issue to KYC Ops team",
        cta: "Send email",
        completed: false,
      },
    ],
    quickActions: ["Send communication", "Send an email", "Transfer to another team"],
    relatedSops: [
      {
        id: "sop-anita-kyc-name",
        label: "KYC name mismatch — Aadhaar vs policy application (motor issuance)",
        detailActionKey: "related_sop_kyc_name",
        askInChatPrefill:
          "Summarize the KYC name-mismatch SOP for this Honda Activa 2026 issuance: what to verify on Aadhaar vs application, when to send re-upload vs escalate to KYC Ops.",
      },
      {
        id: "sop-anita-pre-insp",
        label: "Pre-inspection timing when KYC is still pending",
        detailActionKey: "related_sop_pre_inspection",
        askInChatPrefill:
          "Per SOP, what can we tell the customer about pre-inspection while KYC is still pending on this issuance?",
      },
    ] satisfies RelatedSopRow[],
  },
]

export const anitaSharmaActivePolicies: Policy[] = [
  {
    id: "policy-anita-motor-1",
    name: "Third party plan",
    type: "Motor Insurance",
    policyNumber: "KA 12 AB 5678",
    expiryDate: "15 Aug'27",
    vehicle: "Honda Activa 2026",
    policyHolder: "Anita Sharma",
    policyPeriodLabel: "16 Aug'26 – 15 Aug'27",
    tenureLabel: "1 Year",
  },
]

export const rajKapoorActivePolicies: Policy[] = [
  {
    id: "policy-raj-health-1",
    name: "ACKO Health Plus",
    type: "Health Insurance",
    policyNumber: "Till 10 Jan'28",
    members: 2,
    expiryDate: "10 Jan'28",
    policyHolder: "Raj Kapoor",
    planDisplayName: "Family Floater",
    totalCoverage: "1 Cr",
    policyPeriodLabel: "10 Jan'25 – 10 Jan'28",
    tenureLabel: "1 Year",
  },
  {
    id: "policy-raj-motor-1",
    name: "Comprehensive Plan",
    type: "Motor Insurance",
    policyNumber: "DL 05 XY 9012",
    expiryDate: "28 Sep'27",
    vehicle: "Tata Nexon 2025",
    productCode: "car_comprehensive",
    policyHolder: "Raj Kapoor",
    policyPeriodLabel: "29 Sep'24 – 28 Sep'27",
  },
]

export const policyActions: PolicyAction[] = [
  { id: "view-policy-doc", label: "View Policy Document", action: "view_policy_document" },
  { id: "share-document", label: "Share policy document", action: "share_document" },
  { id: "raise-claim", label: "Raise a Claim", action: "raise_claim" },
  { id: "endorsements", label: "Edit Policy", action: "endorsements" },
  { id: "coverages", label: "Coverages", action: "coverages" },
]

// Additional customers for search functionality
export const priyankaShah: Customer = {
  id: "priyanka-shah",
  name: "Priyanka Shah",
  language: "English",
  phone: "+91 98765 43210",
  email: "priyanka.shah@gmail.com",
  appStatus: "installed",
  callContext: {
    reason: "Edit Policy",
    vehicle: "Honda City",
  },
}

export const amitPatel: Customer = {
  id: "amit-patel",
  name: "Amit Patel",
  language: "Gujarati",
  phone: "+91 87654 32109", 
  email: "amit.patel@yahoo.com",
  appStatus: "not_installed",
  callContext: {
    reason: "Payment related query",
    vehicle: "Maruti Swift",
  },
}

export const sunilGupta: Customer = {
  id: "sunil-gupta",
  name: "Sunil Gupta",
  language: "Hindi",
  phone: "+91 76543 21098",
  email: "sunil.gupta@hotmail.com",
  appStatus: "installed",
  tenureWithAcko: "2 years with ACKO",
  kycStatus: "verified",
  callContext: {
    reason: "Unknown",
    vehicle: "Maruti Suzuki Swift Dzire",
  },
}

export const sunilGuptaActivePolicies: Policy[] = [
  {
    id: "policy-sunil-swift",
    name: "Comprehensive Plan",
    type: "Motor Insurance",
    policyNumber: "DL 08 SG 4412",
    expiryDate: "30 Nov'27",
    vehicle: "Maruti Suzuki Swift Dzire 2024",
    productCode: "car_comprehensive",
    policyHolder: "Sunil Gupta",
    planDisplayName: "Car_Comprehensive",
    policyPeriodLabel: "30 Nov 2025 - 29 Nov 2026",
    tenureLabel: "1 Year",
  },
  {
    id: "policy-sunil-gmc",
    name: "ACKO GMC",
    type: "Health Insurance",
    policyNumber: "ACK-GMC-2026-88102",
    members: 3,
    expiryDate: "10 Feb'28",
    policyHolder: "Sunil Gupta",
    planDisplayName: "ACKO Group Medical Cover",
    totalCoverage: "₹5,00,000",
    policyPeriodLabel: "10 Feb 2025 - 9 Feb 2028",
    tenureLabel: "1 Year (renewing)",
    coveredMembers: [
      { name: "Sunil Gupta", relation: "Self" },
      { name: "Neha Gupta", relation: "Spouse" },
      { name: "Aarav Gupta", relation: "Son" },
    ],
  },
]

/** Revealed after AI chat: Create workflow — edit name on Swift Dzire motor policy */
export const sunilGuptaSwiftDzireEditNameJtbd: JTBD = {
  id: "jtbd-sunil-swift-edit-name",
  type: "claim",
  title: "Edit name",
  vehicle: "Swift Dzire",
  isActive: true,
  status: [],
  askInChatPrefill: "What are the steps to complete name edit on Swift Dzire after RC and licence are received?",
  agentActions: [
    {
      id: "sunil-swift-edit-1",
      step: 1,
      description:
        "Request RC copy from the customer over email.",
      cta: "Request RC",
      completed: false,
    },
    {
      id: "sunil-swift-edit-2",
      step: 2,
      description: "Once the customer responds with the RC copy, download it from email.",
      cta: "",
      completed: false,
    },
    {
      id: "sunil-swift-edit-3",
      step: 3,
      description:
        "Open Edit Policy, update the policy holder name, and upload the RC copy.",
      cta: "Edit Policy",
      completed: false,
    },
    {
      id: "sunil-swift-edit-4",
      step: 4,
      description:
        "Inform the customer that the update TAT is typically up to 48 hours once inputs are complete.",
      cta: "",
      completed: false,
    },
  ],
  quickActions: [],
}

/** Revealed after AI chat: Create workflow — edit name on GMC health policy */
export const sunilGuptaGmcEditNameJtbd: JTBD = {
  id: "jtbd-sunil-gmc-edit-name",
  type: "claim",
  title: "Edit name",
  vehicle: "GMC policy",
  isActive: true,
  status: [],
  askInChatPrefill: "What should I check before updating name on the GMC health policy?",
  agentActions: [
    {
      id: "sunil-gmc-edit-1",
      step: 1,
      description:
        "Send an ACKO Alert to the customer so they can update the insured name on the GMC health plan.",
      cta: "Send ACKO Alert",
      completed: false,
    },
    {
      id: "sunil-gmc-edit-2",
      step: 2,
      description:
        "Open Edit Policy and update the insured name per health SOP. RC copy is not required for this change.",
      cta: "Edit Policy",
      completed: false,
    },
    {
      id: "sunil-gmc-edit-3",
      step: 3,
      description:
        "Inform the customer that the update TAT is typically up to 48 hours once inputs are complete.",
      cta: "",
      completed: false,
    },
  ],
  quickActions: [],
}

export const ayushSinghal: Customer = {
  id: "ayush-singhal",
  name: "Ayush Singhal",
  language: "English",
  phone: "+91 98100 11223",
  email: "ayush.singhal@gmail.com",
  appStatus: "installed",
  tenureWithAcko: "3 years with ACKO",
  kycStatus: "verified",
  callContext: {
    reason: "Policy renewal",
    vehicle: "Maruti Suzuki Swift",
  },
}

export const ayushSinghalActivePolicies: Policy[] = [
  {
    id: "policy-ayush-swift",
    name: "Comprehensive Plan",
    type: "Motor Insurance",
    policyNumber: "HR 26 AS 7788",
    expiryDate: "20 Dec'26",
    vehicle: "Maruti Suzuki Swift 2023",
    productCode: "car_comprehensive",
    policyHolder: "Ayush Singhal",
    planDisplayName: "Car_Comprehensive",
    policyPeriodLabel: "20 Dec 2025 - 19 Dec 2026",
    tenureLabel: "1 Year",
  },
]

export const ayushSinghalJTBDs: JTBD[] = [
  {
    id: "jtbd-ayush-renewal-1",
    type: "renewal",
    title: "Renewal",
    vehicle: "Maruti Suzuki Swift",
    isActive: true,
    status: [],
    agentActions: [
      {
        id: "ayush-action-1",
        step: 1,
        description: "Transfer this call to the Presales team for further assistance.",
        cta: "Transfer to Presales",
        completed: false,
      },
    ],
    quickActions: [],
  },
]

/** Simulate live call — Policy Issuance (KYC name mismatch) */
export const anitaSharma: Customer = {
  id: "anita-sharma",
  name: "Anita Sharma",
  language: "English",
  phone: "+91 91234 55678",
  email: "anita.sharma@gmail.com",
  appStatus: "installed",
  tenureWithAcko: "1 year with ACKO",
  kycStatus: "pending",
  callContext: {
    reason: "Edit Policy",
    vehicle: "Honda Activa 2026",
  },
  lastCall: {
    label: "Angry",
    sentiment: "angry",
  },
}

/**
 * Use-case drawer only: same person as Anita, but claim approved and payment
 * held until KYC clears (not issuance / pre-inspection).
 */
export const anitaSharmaClaimPaymentKyc: Customer = {
  id: "anita-sharma-claim-payment-kyc",
  name: "Anita Sharma",
  language: "English",
  phone: "+91 91234 55678",
  email: "anita.sharma@gmail.com",
  appStatus: "installed",
  tenureWithAcko: "1 year with ACKO",
  kycStatus: "pending",
  callContext: {
    reason: "Claim Status",
    vehicle: "Honda Activa 2026",
  },
  lastCall: {
    label: "Angry",
    sentiment: "angry",
  },
}

const anitaSharmaClaimPaymentKycJTBDs: JTBD[] = [
  {
    id: "jtbd-claim-payment-kyc-1",
    type: "claim",
    title: "Claim",
    vehicle: "Honda Activa 2026",
    isActive: true,
    aiSummary: {
      bullets: [
        "Last call, Anita asked about her claim — document review ran longer than usual after several doc requests",
        "Documents are now approved and the claim is approved; settlement is on hold until KYC is complete",
      ],
      sectionHeading: "AI Summary",
      headerIconVariant: "ai_summary",
      viewDetailsLabel: "VIEW DETAILED SUMMARY",
      stackHeaderWithBullets: true,
      detailedSummaryTimeline: [
        {
          title: "12 Feb'26, 18:05 — Neha Kapoor (CX)",
          detail:
            "Anita called again after her 6 Feb check; document review had stretched past usual TAT after multiple document rounds. She asked why payment had not credited though the claim shows approved. Agent confirmed documents are cleared and the OD claim is approved with liability on file; payout is on hold until KYC is complete — policy name vs Aadhaar mismatch — and walked through re-upload / verification.",
        },
      ],
    },
    askInChatPrefill:
      "Claim is approved for this Honda Activa but payment is blocked on KYC — what can I say about payout timing and next steps?",
    status: [
      {
        step: "Claim assessment",
        state: "completed",
        date: "8 Feb'26",
      },
      {
        step: "Claim approval",
        state: "completed",
        date: "10 Feb'26",
      },
      {
        step: "KYC verification",
        state: "current",
        date: "12 Feb'26",
        warning: "KYC pending due to name mismatch — payment release is blocked",
        calloutMeta: { label: "Action pending on:", value: "Anita Sharma" },
      },
      {
        step: "Payment to customer",
        state: "pending",
      },
    ],
    agentActions: [
      {
        id: "action-claim-pay-kyc-1",
        step: 1,
        description:
          "Ask customer to change their name on ACKO app as per their official government document PAN/Aadhaar.",
        cta: "",
        completed: false,
      },
      {
        id: "action-claim-pay-kyc-2",
        step: 2,
        description: "Ask customer to complete the KYC process again",
        cta: "Send Communication",
        completed: false,
      },
      {
        id: "action-claim-pay-kyc-3",
        step: 3,
        description: "Escalate to KYC Ops with claim ID if upload fails again.",
        cta: "Escalate",
        completed: false,
      },
    ],
    quickActions: ["Send communication", "Send an email", "Transfer to another team"],
    relatedSops: [
      {
        id: "sop-claim-payment-kyc",
        label: "Post-approval payment hold when KYC is still pending",
        detailActionKey: "related_sop_kyc_name",
        askInChatPrefill:
          "What is the SOP for claim payment release when KYC name mismatch exists after claim is already approved?",
      },
    ] satisfies RelatedSopRow[],
  },
]

/** Simulate live call — cold/unknown intent caller */
export const rajKapoor: Customer = {
  id: "raj-kapoor",
  name: "Raj Kapoor",
  language: "Hindi",
  phone: "+91 99887 77665",
  email: "raj.kapoor@outlook.com",
  appStatus: "installed",
  tenureWithAcko: "2 years with ACKO",
  kycStatus: "verified",
  callContext: {
    reason: "Unknown",
  },
}

/** Simulate live call — claim / repair journey guidance */
export const priyaSharma: Customer = {
  id: "priya-sharma",
  name: "Priya Sharma",
  language: "English",
  phone: "+91 98123 44556",
  email: "priya.sharma@yahoo.com",
  appStatus: "installed",
  tenureWithAcko: "3 years with ACKO",
  kycStatus: "verified",
  callContext: {
    reason: "Claim Status",
    vehicle: "Tata Nexon",
  },
}

const priyaSharmaJTBDs: JTBD[] = [
  {
    id: "jtbd-priya-claim-1",
    type: "claim",
    title: "Repair guidance",
    vehicle: "Tata Nexon 2025",
    isActive: true,
    status: [
      {
        step: "Claim intimated",
        state: "completed",
        date: "1 Feb'26",
      },
      {
        step: "Garage shortlist",
        state: "current",
        date: "4 Feb'26",
      },
    ],
    agentActions: [
      {
        id: "priya-a1",
        step: 1,
        description: "Walk through garage options and TATs with the customer in the app",
        cta: "Send Alert",
        completed: false,
      },
    ],
    quickActions: ["Send communication", "Send ACKO Alert"],
  },
]

/** Home search demo: email / 9555539998 / policy containing 1234 */
export const simarpreetKaur: Customer = {
  id: "simarpreet-kaur",
  name: "Simarpreet Kaur",
  language: "English",
  phone: "+91 95555 39998",
  email: "simarpreet.kaur@acko.tech",
  appStatus: "installed",
  tenureWithAcko: "2 years with ACKO",
  kycStatus: "verified",
  callContext: {
    reason: "General inquiry",
    vehicle: "Hyundai i10",
  },
}

const simarpreetJTBDs: JTBD[] = [
  {
    id: "jtbd-simar-renewal-1",
    type: "renewal",
    title: "Policy Renewal",
    vehicle: "Hyundai i10",
    isActive: true,
    status: [
      {
        step: "Renewal Notice Sent",
        state: "completed",
        date: "1 Apr'26",
      },
      {
        step: "Premium review",
        state: "current",
        date: "4 Apr'26",
      },
      {
        step: "Payment",
        state: "pending",
      },
    ],
    agentActions: [
      {
        id: "action-simar-1",
        step: 1,
        description: "Send renewal link on WhatsApp for Hyundai i10",
        cta: "Send Communication",
        completed: false,
      },
    ],
    quickActions: ["Send communication", "Raise a Claim"],
  },
  {
    id: "jtbd-simar-claim-1",
    type: "claim",
    title: "Service",
    vehicle: "TVS Jupiter",
    isActive: false,
    status: [
      {
        step: "Intimation closed",
        state: "completed",
        date: "20 Mar'26",
      },
    ],
    agentActions: [
      {
        id: "action-simar-claim-archived",
        step: 1,
        description: "No further action — case closed",
        cta: "View policy",
        completed: true,
      },
    ],
    quickActions: ["Send communication"],
  },
]

const simarpreetActivePolicies: Policy[] = [
  {
    id: "policy-simar-i10",
    name: "Comprehensive Plan",
    type: "Motor Insurance",
    policyNumber: "DL 12 AB 1234",
    expiryDate: "30 May'27",
    vehicle: "Hyundai i10 2018 Magna 1.2 Kappa",
    policyHolder: "Simarpreet Kaur",
    planDisplayName: "Comprehensive",
    policyPeriodLabel: "30 May 2025 - 29 May 2026",
    tenureLabel: "1 Year",
  },
  {
    id: "policy-simar-jupiter",
    name: "Two Wheeler — Comprehensive",
    type: "Motor Insurance",
    policyNumber: "DL 10 XY 8801",
    expiryDate: "12 Aug'27",
    vehicle: "TVS Jupiter 110",
    policyHolder: "Simarpreet Kaur",
    planDisplayName: "Comprehensive",
    policyPeriodLabel: "12 Aug 2025 - 11 Aug 2026",
    tenureLabel: "1 Year",
  },
  {
    id: "policy-simar-gmc",
    name: "ACKO GMC",
    type: "Health Insurance",
    policyNumber: "GMC-ACK-2025-55001",
    members: 2,
    expiryDate: "1 Jan'27",
    policyHolder: "Simarpreet Kaur",
    planDisplayName: "ACKO Group Medical Cover",
    totalCoverage: "₹3,00,000",
    policyPeriodLabel: "1 Jan 2024 - 31 Dec 2026",
    tenureLabel: "1 Year (renewing)",
    coveredMembers: [
      { name: "Simarpreet Kaur", relation: "Self" },
      { name: "Gurpreet Kaur", relation: "Spouse" },
    ],
  },
]

const amitPatelJTBDs: JTBD[] = [
  {
    id: "jtbd-amit-payment-query",
    type: "claim",
    title: "Premium payment follow-up",
    vehicle: "Maruti Swift",
    isActive: true,
    status: [
      {
        step: "Invoice verification",
        state: "current",
        date: "12 Feb'26",
      },
      {
        step: "Ledger reconciliation",
        state: "pending",
      },
    ],
    agentActions: [
      {
        id: "amit-pay-1",
        step: 1,
        description: "Validate premium received vs schedule and share a ledger snapshot with the customer",
        cta: "Send Communication",
        completed: false,
      },
    ],
    quickActions: ["Send communication"],
  },
]

const priyankaShahJTBDs: JTBD[] = [
  {
    id: "jtbd-priyanka-endorse-1",
    type: "endorsement",
    title: "Nominee update",
    vehicle: "Honda City",
    isActive: true,
    status: [
      {
        step: "Request received",
        state: "completed",
        date: "1 Feb'26",
      },
      {
        step: "Advisor review",
        state: "current",
        date: "10 Feb'26",
      },
    ],
    agentActions: [
      {
        id: "priyanka-e1",
        step: 1,
        description: "Confirm nominee proof and update details in Edit Policy",
        cta: "Edit Policy",
        completed: false,
      },
    ],
    quickActions: ["Send communication", "Edit Policy"],
  },
]

// Sample policies for other customers
const samplePolicies: Policy[] = [
  {
    id: "policy-motor-basic",
    name: "Third Party Plan",
    type: "Motor Insurance",
    policyNumber: "MH 12 CD 3456",
    expiryDate: "15 Jun'26",
    vehicle: "Honda City 2023",
  },
]

const emptyInactivePolicies: InactivePolicy[] = []

export const mockCustomers: Record<
  string,
  { customer: Customer; jtbds: JTBD[]; activePolicies: Policy[]; inactivePolicies: InactivePolicy[] }
> = {
  "rajesh-kumar": {
    customer: rajeshKumar,
    jtbds: rajeshKumarJTBDs,
    activePolicies: rajeshKumarActivePolicies,
    inactivePolicies: rajeshKumarInactivePolicies,
  },
  "priyanka-shah": {
    customer: priyankaShah,
    jtbds: priyankaShahJTBDs,
    activePolicies: samplePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "amit-patel": {
    customer: amitPatel,
    jtbds: amitPatelJTBDs,
    activePolicies: samplePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "sunil-gupta": {
    customer: sunilGupta,
    jtbds: [],
    activePolicies: sunilGuptaActivePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "ayush-singhal": {
    customer: ayushSinghal,
    jtbds: ayushSinghalJTBDs,
    activePolicies: ayushSinghalActivePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "anita-sharma": {
    customer: anitaSharma,
    jtbds: anitaSharmaJTBDs,
    activePolicies: anitaSharmaActivePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "anita-sharma-claim-payment-kyc": {
    customer: anitaSharmaClaimPaymentKyc,
    jtbds: anitaSharmaClaimPaymentKycJTBDs,
    activePolicies: anitaSharmaActivePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "raj-kapoor": {
    customer: rajKapoor,
    jtbds: [],
    activePolicies: rajKapoorActivePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "priya-sharma": {
    customer: priyaSharma,
    jtbds: priyaSharmaJTBDs,
    activePolicies: samplePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "simarpreet-kaur": {
    customer: simarpreetKaur,
    jtbds: simarpreetJTBDs,
    activePolicies: simarpreetActivePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
}

function customerMatchesPolicyNumber(
  data: (typeof mockCustomers)[string],
  cleanQuery: string,
): boolean {
  if (cleanQuery.length < 2) return false
  const compactQ = cleanQuery.replace(/\s/g, "")
  const check = (policyNumber: string) => {
    const n = policyNumber.toLowerCase().replace(/\s/g, "")
    return n.includes(compactQ) || policyNumber.toLowerCase().includes(cleanQuery)
  }
  for (const p of data.activePolicies) {
    if (check(p.policyNumber)) return true
  }
  for (const p of data.inactivePolicies) {
    if (check(p.policyNumber)) return true
  }
  return false
}

// Search utility function — name, email, phone, or policy number
export function searchCustomer(
  query: string,
): { customer: Customer; jtbds: JTBD[]; activePolicies: Policy[]; inactivePolicies: InactivePolicy[] } | null {
  if (!query.trim()) return null
  
  const cleanQuery = query.trim().toLowerCase()

  /** Demo shortcut from “Unknown caller” resolution screen (policy id fragment). */
  if (cleanQuery === "1234") {
    return mockCustomers["rajesh-kumar"]
  }

  // Search through all customers
  for (const customerData of Object.values(mockCustomers)) {
    const { customer } = customerData
    
    // Search by phone number (remove all non-digits for comparison)
    const phoneDigits = customer.phone.replace(/\D/g, '')
    const queryDigits = cleanQuery.replace(/\D/g, '')
    
    if (queryDigits && phoneDigits.includes(queryDigits)) {
      return customerData
    }
    
    // Search by email (case insensitive)
    if (customer.email.toLowerCase().includes(cleanQuery)) {
      return customerData
    }
    
    // Search by name (case insensitive)
    if (customer.name.toLowerCase().includes(cleanQuery)) {
      return customerData
    }

    if (customerMatchesPolicyNumber(customerData, cleanQuery)) {
      return customerData
    }
  }
  
  return null
}
