import type { Policy } from "@/types/crm"

export interface AgenticIntent {
  documentType?: string
  policyFilter?: string
  channels?: string[]
  phoneNumber?: string
  emailAddress?: string
  urgency?: "high" | "medium" | "low"
  customerName?: string
  extractedFrom?: string
  confidence?: number
}

interface ParsedCommunicationIntent extends AgenticIntent {
  action: "send_communication"
  confidence: number
}

// Keywords mapping for document types
const DOCUMENT_KEYWORDS = {
  "policy-document": ["policy", "document", "policy document", "insurance document", "coverage document"],
  "claim-form": ["claim", "claim form", "insurance claim", "file claim", "claim document"],
  "payment-receipt": ["receipt", "payment", "payment receipt", "invoice", "billing"],
  "kyc-documents": ["kyc", "know your customer", "verification", "identity documents", "kyc docs"]
}

// Keywords for channels
const CHANNEL_KEYWORDS = {
  "email": ["email", "mail", "e-mail"],
  "text-message": ["sms", "text", "text message", "message"],
  "whatsapp": ["whatsapp", "whats app", "wa"],
  "acko-alert": ["app", "notification", "alert", "acko alert", "in-app"]
}

// Urgency keywords
const URGENCY_KEYWORDS = {
  "high": ["urgent", "asap", "immediately", "now", "emergency", "critical"],
  "medium": ["soon", "today", "this week", "moderate"],
  "low": ["when possible", "no rush", "later", "convenience"]
}

/**
 * Parse natural language input to extract communication intent
 */
export function parseAgenticCommunicationIntent(input: string): ParsedCommunicationIntent | null {
  const lowerInput = input.toLowerCase().trim()
  
  // Check if this is a send communication request
  const sendCommunicationTriggers = [
    "send", "share", "email", "text", "message", "communicate", "forward", "deliver"
  ]
  
  const hasSendTrigger = sendCommunicationTriggers.some(trigger => 
    lowerInput.includes(trigger)
  )
  
  if (!hasSendTrigger) {
    return null
  }

  let confidence = 0.3 // Base confidence for having send trigger
  
  // Extract document type
  let documentType: string | undefined
  let docConfidence = 0
  
  for (const [type, keywords] of Object.entries(DOCUMENT_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        documentType = type
        docConfidence = 0.4
        confidence += docConfidence
        break
      }
    }
    if (documentType) break
  }

  // Extract policy filter (vehicle names, policy numbers, etc.)
  let policyFilter: string | undefined
  
  // Common vehicle keywords
  const vehiclePatterns = [
    /(?:tata\s+)?nexon/i,
    /(?:honda\s+)?activa/i,
    /(?:maruti\s+)?swift/i,
    /(?:ford\s+)?ecosport/i,
    /(?:hyundai\s+)?creta/i,
    /(?:mahindra\s+)?xuv/i,
    /bike|motorcycle|scooter/i,
    /car|vehicle/i
  ]
  
  for (const pattern of vehiclePatterns) {
    const match = input.match(pattern)
    if (match) {
      policyFilter = match[0]
      confidence += 0.3
      break
    }
  }

  // Extract channels
  const channels: string[] = []
  for (const [channel, keywords] of Object.entries(CHANNEL_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        channels.push(channel)
        confidence += 0.2
        break
      }
    }
  }

  // Extract urgency
  let urgency: "high" | "medium" | "low" | undefined
  for (const [level, keywords] of Object.entries(URGENCY_KEYWORDS)) {
    for (const keyword of keywords) {
      if (lowerInput.includes(keyword)) {
        urgency = level as "high" | "medium" | "low"
        confidence += 0.1
        break
      }
    }
    if (urgency) break
  }

  // Extract recipient (customer, specific person, etc.)
  let customerName: string | undefined
  if (lowerInput.includes("customer") || lowerInput.includes("client")) {
    confidence += 0.2
  }

  // Only return if confidence is reasonable
  if (confidence < 0.5) {
    return null
  }

  return {
    action: "send_communication",
    documentType,
    policyFilter,
    channels: channels.length > 0 ? channels : undefined,
    urgency,
    customerName,
    extractedFrom: input,
    confidence: Math.min(confidence, 1.0)
  }
}

/**
 * Parse general agentic intents from chat
 */
export function parseAgenticIntent(input: string): AgenticIntent | null {
  // Try communication intent first
  const commIntent = parseAgenticCommunicationIntent(input)
  if (commIntent) {
    return commIntent
  }

  // Add other intent parsers here (claim filing, policy editing, etc.)
  
  return null
}

/**
 * Match policy based on agentic filter
 */
export function matchPolicyFromIntent(
  policyFilter: string | undefined, 
  policies: Policy[]
): Policy | null {
  if (!policyFilter || policies.length === 0) {
    return null
  }

  const filterLower = policyFilter.toLowerCase()
  
  // Try exact matches first
  const exactMatch = policies.find(policy => 
    policy.vehicle?.toLowerCase() === filterLower ||
    policy.name?.toLowerCase() === filterLower ||
    policy.policyNumber?.toLowerCase() === filterLower
  )
  
  if (exactMatch) {
    return exactMatch
  }

  // Try partial matches
  const partialMatch = policies.find(policy => 
    policy.vehicle?.toLowerCase().includes(filterLower) ||
    policy.name?.toLowerCase().includes(filterLower) ||
    policy.policyNumber?.toLowerCase().includes(filterLower)
  )

  return partialMatch || null
}

/**
 * Example usage patterns for testing
 */
export const EXAMPLE_PATTERNS = [
  "Send Tata Nexon policy document to customer",
  "Email the claim form for Honda Activa",
  "Text the payment receipt urgently", 
  "Share policy document via WhatsApp",
  "Send insurance document to client via email",
  "Message the KYC documents to customer",
  "Forward the policy document ASAP",
  "Communicate the claim form to customer"
]