/**
 * CRM task registry — aligned with manual actions UI (3 sections).
 * Policy-related actions require selecting a policy in manual mode.
 */

export type CrmTaskCategory =
  | "policy-related"
  | "quick-actions"
  | "data-investigation"
  | "power-tools"

export type CrmTaskId =
  | "view-policy"
  | "raise-claim"
  | "edit-policy"
  | "cancel-policy"
  | "claim-handler-call-back"
  | "send-communication"
  | "road-side-assistance"
  | "re-assign-ticket"
  | "transfer-call"
  | "request-documents"
  | "communication-history"
  | "payment-history"
  | "kyc-logs"
  | "firefly"
  | "freshdesk"
  | "spectra"

export interface CrmTaskDefinition {
  id: CrmTaskId
  label: string
  description: string
  category: CrmTaskCategory
  /** Manual mode: CX must pick a policy before continuing. */
  requiresPolicy: boolean
  manualFlow: boolean
  aiCapable: boolean
}

export const CRM_TASKS: CrmTaskDefinition[] = [
  // POLICY RELATED ACTIONS — policy selection required in manual mode
  {
    id: "view-policy",
    label: "View policy",
    description: "View policy details and information",
    category: "policy-related",
    requiresPolicy: true,
    manualFlow: true,
    aiCapable: true,
  },
  {
    id: "raise-claim",
    label: "Raise a claim",
    description: "Start claim process for a policy",
    category: "policy-related",
    requiresPolicy: true,
    manualFlow: true,
    aiCapable: true,
  },
  {
    id: "edit-policy",
    label: "Edit policy",
    description: "Modify policy details",
    category: "policy-related",
    requiresPolicy: true,
    manualFlow: true,
    aiCapable: true,
  },
  {
    id: "cancel-policy",
    label: "Cancel policy",
    description: "Cancel or terminate policy",
    category: "policy-related",
    requiresPolicy: true,
    manualFlow: true,
    aiCapable: false,
  },
  {
    id: "claim-handler-call-back",
    label: "Claim handler call back",
    description: "Request callback from claim handler",
    category: "policy-related",
    requiresPolicy: true,
    manualFlow: true,
    aiCapable: false,
  },
  {
    id: "send-communication",
    label: "Send communication",
    description: "Send message to customer",
    category: "policy-related",
    requiresPolicy: true,
    manualFlow: true,
    aiCapable: true,
  },
  {
    id: "road-side-assistance",
    label: "Road side assistance",
    description: "Request roadside assistance",
    category: "policy-related",
    requiresPolicy: true,
    manualFlow: true,
    aiCapable: false,
  },
  // OTHER QUICK ACTIONS — no policy selection
  {
    id: "re-assign-ticket",
    label: "Re-assign ticket",
    description: "Reassign ticket to another agent",
    category: "quick-actions",
    requiresPolicy: false,
    manualFlow: true,
    aiCapable: false,
  },
  {
    id: "transfer-call",
    label: "Transfer call",
    description: "Transfer call to another agent",
    category: "quick-actions",
    requiresPolicy: false,
    manualFlow: true,
    aiCapable: false,
  },
  {
    id: "request-documents",
    label: "Request documents",
    description: "Request documents from customer",
    category: "quick-actions",
    requiresPolicy: false,
    manualFlow: true,
    aiCapable: true,
  },
  // DATA INVESTIGATION — no policy selection
  {
    id: "communication-history",
    label: "Communication history",
    description: "View past interactions",
    category: "data-investigation",
    requiresPolicy: false,
    manualFlow: true,
    aiCapable: true,
  },
  {
    id: "payment-history",
    label: "Payment history",
    description: "View payment records",
    category: "data-investigation",
    requiresPolicy: false,
    manualFlow: true,
    aiCapable: true,
  },
  {
    id: "kyc-logs",
    label: "KYC logs",
    description: "View KYC verification logs",
    category: "data-investigation",
    requiresPolicy: false,
    manualFlow: true,
    aiCapable: true,
  },
  {
    id: "firefly",
    label: "Firefly",
    description: "Tool for all auto claim queries",
    category: "power-tools",
    requiresPolicy: false,
    manualFlow: false,
    aiCapable: false,
  },
  {
    id: "freshdesk",
    label: "Freshdesk",
    description: "Tool for track the tickets",
    category: "power-tools",
    requiresPolicy: false,
    manualFlow: false,
    aiCapable: false,
  },
  {
    id: "spectra",
    label: "Spectra",
    description: "Tool for all health claim queries",
    category: "power-tools",
    requiresPolicy: false,
    manualFlow: false,
    aiCapable: false,
  },
]

export function getTasksByCategory(category: CrmTaskCategory): CrmTaskDefinition[] {
  return CRM_TASKS.filter((t) => t.category === category)
}

export function getTaskById(id: string): CrmTaskDefinition | undefined {
  return CRM_TASKS.find((t) => t.id === id)
}

export function taskRequiresPolicy(id: string): boolean {
  return getTaskById(id)?.requiresPolicy ?? false
}

export const POLICY_GATE_TITLES: Partial<Record<CrmTaskId, { title: string; description: string }>> = {
  "view-policy": {
    title: "View policy",
    description: "Select the policy you want to view",
  },
  "raise-claim": {
    title: "Raise a claim",
    description: "Select the policy to raise a claim for",
  },
  "edit-policy": {
    title: "Edit policy",
    description: "Select the policy you want to edit",
  },
  "cancel-policy": {
    title: "Cancel policy",
    description: "Select the policy to cancel",
  },
  "claim-handler-call-back": {
    title: "Claim handler call back",
    description: "Select the policy this callback relates to",
  },
  "send-communication": {
    title: "Send communication",
    description: "Select the policy you want to send communication for",
  },
  "road-side-assistance": {
    title: "Road side assistance",
    description: "Select the policy for this assistance request",
  },
}
