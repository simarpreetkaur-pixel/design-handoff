import { ArrowLeft } from "lucide-react"

import { Button } from "@/components/ui/button"
import type { Customer, Policy } from "@/types/crm"
import { SendCommunicationForm } from "@/components/crm/hello/SendCommunicationForm"
import type { AgenticIntent } from "@/lib/agenticIntentParser"

export type { AgenticIntent }

interface AgenticSendCommunicationProps {
  customer?: Customer
  customerPolicies?: Policy[]
  onBack: () => void
  onSent: (message: string) => void
  agenticIntent?: AgenticIntent
}

function resolvePolicyFromIntent(
  intent: AgenticIntent | undefined,
  customerPolicies: Policy[],
): Policy | undefined {
  if (!intent) return undefined
  if (intent.policyId) {
    return customerPolicies.find((p) => p.id === intent.policyId)
  }
  if (intent.policyFilter) {
    const filterLower = intent.policyFilter.toLowerCase()
    return customerPolicies.find(
      (policy) =>
        policy.vehicle?.toLowerCase().includes(filterLower) ||
        policy.name?.toLowerCase().includes(filterLower) ||
        policy.policyNumber?.toLowerCase().includes(filterLower),
    )
  }
  return undefined
}

function parseDocumentType(intent: AgenticIntent | undefined): string {
  if (intent?.lockDocumentType === "policy-document") return "policy-document"
  if (!intent?.documentType) return ""
  const docLower = intent.documentType.toLowerCase()
  if (docLower.includes("policy") || docLower.includes("document")) return "policy-document"
  if (docLower.includes("claim")) return "claim-form"
  if (docLower.includes("payment") || docLower.includes("receipt")) return "payment-receipt"
  if (docLower.includes("kyc")) return "kyc-documents"
  return ""
}

function parseSuggestedChannels(intent: AgenticIntent | undefined): string[] {
  if (intent?.channels && intent.channels.length > 0) return intent.channels
  if (intent?.urgency === "high") return ["acko-alert", "text-message"]
  if (intent?.urgency === "medium") return ["whatsapp", "email"]
  return []
}

/** AI mode — policy from chat; form pre-fills document dropdown per Figma. */
export function AgenticSendCommunication({
  customer,
  customerPolicies = [],
  onBack,
  onSent,
  agenticIntent,
}: AgenticSendCommunicationProps) {
  const contextPolicy = resolvePolicyFromIntent(agenticIntent, customerPolicies)

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0"
          aria-label="Go back"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <h4 className="font-euclid text-[16px] font-semibold leading-[22px] text-[#36354c]">
          Send Communication
        </h4>
      </div>

      <SendCommunicationForm
        customer={customer}
        contextPolicy={contextPolicy}
        initialDocumentType={parseDocumentType(agenticIntent)}
        initialChannels={parseSuggestedChannels(agenticIntent)}
        onSent={onSent}
      />
    </div>
  )
}
