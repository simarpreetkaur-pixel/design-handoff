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
    reason: "Claim delay",
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
        description: "Agent to share garage details with customer on WhatsApp",
        cta: "Send Communication",
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
        description: "Generate renewal quote with NCB",
        cta: "Send Alert",
        completed: false,
      },
      {
        id: "renewal-action-2",
        step: 2,
        description: "Send renewal link via WhatsApp/SMS",
        cta: "Send Communication",
        completed: false,
      },
    ],
    quickActions: ["Send communication", "Acko Alerts", "Raise a Claim"],
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
    policyNumber: "KL 01 BB 0275",
    expiryDate: "22 Mar'27",
    vehicle: "Ford Ecosport Titanium 2025 1.2Sportz Kappa VTVT CNG",
    policyHolder: "Rajesh Kumar",
    planDisplayName: "Comprehensive",
    policyPeriodLabel: "22 Mar 2026 - 21 Mar 2027",
    tenureLabel: "1 Year",
  },
  {
    id: "policy-damage-1",
    name: "Own Damage Plan",
    type: "Motor Insurance",
    policyNumber: "KL 03 NW 0248",
    expiryDate: "22 Mar'27",
    vehicle: "Ford Ecosport Titanium",
    policyHolder: "Rajesh Kumar",
    planDisplayName: "Own Damage",
    policyPeriodLabel: "22 Mar 2026 - 21 Mar 2027",
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
      viewDetailsChatPrefill:
        "Give me a full agent-facing summary: payment vs KYC vs pre-inspection for this Honda Activa 2026 policy issuance, the Aadhaar vs policy name mismatch, repeat-call context, and the exact next actions I should take (Send Communication vs KYC Ops email).",
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
    name: "Two Wheeler Policy",
    type: "Motor Insurance",
    policyNumber: "KA 12 AB 5678",
    expiryDate: "15 Aug'27",
    vehicle: "Honda Activa 2026",
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
  },
  {
    id: "policy-raj-motor-1",
    name: "Comprehensive Plan",
    type: "Motor Insurance",
    policyNumber: "DL 05 XY 9012",
    expiryDate: "28 Sep'27",
    vehicle: "Tata Nexon 2025",
    productCode: "car_comprehensive",
  },
]

export const policyActions: PolicyAction[] = [
  { id: "view-policy-doc", label: "View Policy Document", action: "view_policy_document" },
  { id: "share-document", label: "Share policy document", action: "share_document" },
  { id: "raise-claim", label: "Raise a Claim", action: "raise_claim" },
  { id: "endorsements", label: "Endorsement", action: "endorsements" },
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
    reason: "Policy renewal",
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
    reason: "Premium payment issue",
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
  callContext: {
    reason: "Add-on coverage inquiry",
    vehicle: "Hyundai i20",
  },
}

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
    reason: "Policy Issuance",
    vehicle: "Honda Activa 2026",
  },
  lastCall: {
    label: "Angry",
    sentiment: "angry",
  },
}

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

/** Simulate live call — use case to be built out (Process guidance) */
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
    reason: "Process guidance",
    vehicle: "Tata Nexon",
  },
}

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

// Sample JTBDs for other customers (simplified)
const sampleJTBDs: JTBD[] = [
  {
    id: "jtbd-renewal-general",
    type: "renewal",
    title: "Policy Renewal",
    vehicle: "Various",
    isActive: true,
    status: [
      {
        step: "Renewal Notice Sent",
        state: "completed",
        date: "15 Mar'26",
      },
      {
        step: "Premium Calculation",
        state: "current",
        date: "20 Mar'26",
      },
      {
        step: "Payment Processing",
        state: "pending",
      },
    ],
    agentActions: [
      {
        id: "renewal-action-1",
        step: 1,
        description: "Send renewal quote to customer",
        cta: "Send Quote",
        completed: false,
      },
    ],
    quickActions: ["Send renewal link", "Schedule callback"],
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
    jtbds: sampleJTBDs,
    activePolicies: samplePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "amit-patel": {
    customer: amitPatel,
    jtbds: sampleJTBDs,
    activePolicies: samplePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "sunil-gupta": {
    customer: sunilGupta,
    jtbds: sampleJTBDs,
    activePolicies: samplePolicies,
    inactivePolicies: emptyInactivePolicies,
  },
  "anita-sharma": {
    customer: anitaSharma,
    jtbds: anitaSharmaJTBDs,
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
    jtbds: sampleJTBDs,
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
