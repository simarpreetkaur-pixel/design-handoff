export type DocumentType = 
  | "rc_copy" 
  | "driving_license"
  | "aadhar_card" 
  | "pan_card"
  | "bank_statement" 
  | "policy_document"
  | "claim_documents"
  | "kyc_documents"
  | "payment_receipt"
  | "other"

export interface DocumentTemplate {
  id: DocumentType
  label: string
  description: string
  emailSubject: string
  emailBody: string
  whatsappMessage: string
}

export const DOCUMENT_TEMPLATES: DocumentTemplate[] = [
  {
    id: "rc_copy",
    label: "Registration Certificate (RC)",
    description: "Vehicle registration certificate",
    emailSubject: "Request for Registration Certificate Copy",
    emailBody: `Dear Customer,

We need clear copies of your vehicle Registration Certificate (RC) to process your request. Please reply to this email with photos or PDFs of the document.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need clear photos or PDFs of your vehicle RC to process your request. Please share it here when you can.

Thank you,
ACKO CX`
  },
  {
    id: "driving_license",
    label: "Driving License",
    description: "Valid driving license document",
    emailSubject: "Request for Driving License Copy",
    emailBody: `Dear Customer,

We need a clear copy of your driving license to process your request. Please reply to this email with photos or PDFs of both sides of your license.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need clear photos of both sides of your driving license to process your request. Please share them here when you can.

Thank you,
ACKO CX`
  },
  {
    id: "aadhar_card",
    label: "Aadhar Card",
    description: "Government issued Aadhar card",
    emailSubject: "Request for Aadhar Card Copy",
    emailBody: `Dear Customer,

We need a clear copy of your Aadhar card for verification purposes. Please reply to this email with photos or PDFs of both sides of your Aadhar card.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need clear photos of both sides of your Aadhar card for verification. Please share them here when you can.

Thank you,
ACKO CX`
  },
  {
    id: "pan_card",
    label: "PAN Card",
    description: "Permanent Account Number card",
    emailSubject: "Request for PAN Card Copy",
    emailBody: `Dear Customer,

We need a clear copy of your PAN card for verification purposes. Please reply to this email with a photo or PDF of your PAN card.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need a clear photo of your PAN card for verification. Please share it here when you can.

Thank you,
ACKO CX`
  },
  {
    id: "bank_statement",
    label: "Bank Statement",
    description: "Recent bank statement for verification",
    emailSubject: "Request for Bank Statement",
    emailBody: `Dear Customer,

We need your recent bank statement (last 3 months) for processing your request. Please reply to this email with PDFs of your bank statements.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need your recent bank statement (last 3 months) for processing. Please share the PDF here when you can.

Thank you,
ACKO CX`
  },
  {
    id: "policy_document",
    label: "Policy Document",
    description: "Insurance policy certificate",
    emailSubject: "Request for Policy Document",
    emailBody: `Dear Customer,

We need a copy of your insurance policy document for verification. Please reply to this email with a photo or PDF of your policy certificate.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need a copy of your insurance policy document for verification. Please share it here when you can.

Thank you,
ACKO CX`
  },
  {
    id: "claim_documents",
    label: "Claim Documents",
    description: "Claim related supporting documents",
    emailSubject: "Request for Claim Supporting Documents",
    emailBody: `Dear Customer,

We need additional documents to process your claim. Please reply to this email with the required supporting documents (photos, repair estimates, bills, etc.).

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need additional documents to process your claim. Please share the required supporting documents here (photos, repair estimates, bills, etc.).

Thank you,
ACKO CX`
  },
  {
    id: "kyc_documents",
    label: "KYC Documents",
    description: "Know Your Customer verification documents",
    emailSubject: "Request for KYC Documents",
    emailBody: `Dear Customer,

We need your KYC documents for verification purposes. Please reply to this email with clear copies of your identity proof (Aadhar/PAN) and address proof.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need your KYC documents for verification. Please share clear copies of your identity proof (Aadhar/PAN) and address proof here.

Thank you,
ACKO CX`
  },
  {
    id: "payment_receipt",
    label: "Payment Receipt",
    description: "Payment confirmation receipt",
    emailSubject: "Request for Payment Receipt",
    emailBody: `Dear Customer,

We need a copy of your payment receipt for our records. Please reply to this email with a photo or PDF of your payment confirmation.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need a copy of your payment receipt for our records. Please share the payment confirmation here.

Thank you,
ACKO CX`
  },
  {
    id: "other",
    label: "Other Document",
    description: "Custom document request",
    emailSubject: "Document Request",
    emailBody: `Dear Customer,

We need additional documents from you to process your request. Please reply to this email with the required documents.

Thank you,
CX agent
ACKO Insurance`,
    whatsappMessage: `Hi — we need additional documents from you to process your request. Please share the required documents here.

Thank you,
ACKO CX`
  }
]

export function getDocumentTemplate(documentType: DocumentType): DocumentTemplate {
  const template = DOCUMENT_TEMPLATES.find(t => t.id === documentType)
  if (!template) {
    return DOCUMENT_TEMPLATES.find(t => t.id === "other")!
  }
  return template
}