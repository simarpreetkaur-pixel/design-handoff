import { parseAgenticIntent } from "./agenticIntentParser"
import type { AgenticIntent } from "./agenticIntentParser"

export interface AgenticWorkflowTrigger {
  intent: AgenticIntent
  originalMessage: string
  timestamp: Date
  confidence: number
}

/**
 * Process chat message and extract agentic workflow triggers
 */
export function processChatMessageForAgenticWorkflows(
  message: string
): AgenticWorkflowTrigger | null {
  const intent = parseAgenticIntent(message)
  
  if (!intent || intent.confidence < 0.5) {
    return null
  }

  return {
    intent,
    originalMessage: message,
    timestamp: new Date(),
    confidence: intent.confidence
  }
}

/**
 * Generate agentic response for chat
 */
export function generateAgenticChatResponse(trigger: AgenticWorkflowTrigger): {
  shouldTriggerWorkflow: boolean
  chatResponse: string
  workflowType: string
} {
  const { intent, confidence } = trigger

  if (intent.action === "send_communication") {
    const documentType = intent.documentType ? intent.documentType.replace("-", " ") : "document"
    const policyHint = intent.policyFilter ? ` for your ${intent.policyFilter}` : ""
    const channelHint = intent.channels && intent.channels.length > 0 
      ? ` via ${intent.channels.join(" and ")}`
      : ""

    return {
      shouldTriggerWorkflow: true,
      chatResponse: `I'll help you send the ${documentType}${policyHint}${channelHint}. Let me open the communication workflow and pre-populate the details for you.`,
      workflowType: "agentic_send_communication"
    }
  }

  return {
    shouldTriggerWorkflow: false,
    chatResponse: "I'm not sure how to help with that. Could you please be more specific?",
    workflowType: "unknown"
  }
}

/**
 * Example integration function for chat components
 * This shows how to integrate with your existing chat system
 */
export function handleChatMessageWithAgentic(
  message: string,
  onAgenticWorkflowTrigger: (intent: AgenticIntent, response: string) => void
): boolean {
  const trigger = processChatMessageForAgenticWorkflows(message)
  
  if (trigger) {
    const response = generateAgenticChatResponse(trigger)
    
    if (response.shouldTriggerWorkflow) {
      onAgenticWorkflowTrigger(trigger.intent, response.chatResponse)
      return true // Message was handled by agentic system
    }
  }
  
  return false // Message should be handled by normal chat flow
}

/**
 * Chat message examples that should trigger agentic workflows
 */
export const AGENTIC_EXAMPLES = [
  {
    input: "Send Tata Nexon policy document to customer",
    expected: {
      documentType: "policy-document",
      policyFilter: "Tata Nexon",
      confidence: 0.9
    }
  },
  {
    input: "Email the claim form urgently",
    expected: {
      documentType: "claim-form", 
      channels: ["email"],
      urgency: "high",
      confidence: 0.8
    }
  },
  {
    input: "Text payment receipt to customer via WhatsApp",
    expected: {
      documentType: "payment-receipt",
      channels: ["whatsapp"],
      confidence: 0.9
    }
  }
]