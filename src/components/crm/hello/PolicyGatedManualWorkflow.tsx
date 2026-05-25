import { PolicyDetailPanel } from "@/components/crm/ActivePoliciesPanel"
import { EditPolicyManualPanel } from "@/components/crm/hello/EditPolicyManualPanel"
import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"
import { PolicySelectionPanel } from "@/components/crm/hello/PolicySelectionPanel"
import { RaiseClaimManualPanel } from "@/components/crm/hello/RaiseClaimManualPanel"
import { SendCommunicationManualPanel } from "@/components/crm/hello/SendCommunicationManualPanel"
import { SimpleManualTaskPanel } from "@/components/crm/hello/SimpleManualTaskPanel"
import type { CrmTaskId } from "@/lib/crmTasks"
import { POLICY_GATE_TITLES } from "@/lib/crmTasks"
import type { Customer, Policy } from "@/types/crm"

export type PolicyGatedManualWorkflowProps = {
  actionId: CrmTaskId
  policy: Policy | null
  customer: Customer
  customerPolicies: Policy[]
  displayPhone?: string
  onPolicySelect: (policy: Policy) => void
  onBackFromPolicySelect: () => void
  onBackFromWorkflow: () => void
  onToast: (message: string) => void
}

function policiesForAction(actionId: CrmTaskId, all: Policy[]): Policy[] {
  if (actionId === "raise-claim") {
    return all.filter((p) => p.type === "Motor Insurance")
  }
  return all
}

function policyLabel(policy: Policy): string {
  return policy.vehicle || policy.name || policy.policyNumber || "Policy"
}

export function PolicyGatedManualWorkflow({
  actionId,
  policy,
  customer,
  customerPolicies,
  displayPhone,
  onPolicySelect,
  onBackFromPolicySelect,
  onBackFromWorkflow,
  onToast,
}: PolicyGatedManualWorkflowProps) {
  if (!policy) {
    const copy = POLICY_GATE_TITLES[actionId] ?? {
      title: "Select policy",
      description: "Select the policy for this action",
    }
    return (
      <PolicySelectionPanel
        title={copy.title}
        description={copy.description}
        policies={policiesForAction(actionId, customerPolicies)}
        onBack={onBackFromPolicySelect}
        onPolicySelect={onPolicySelect}
      />
    )
  }

  switch (actionId) {
    case "view-policy":
      return (
        <div className="space-y-4">
          <ManualWorkflowHeader title="Policy details" onBack={onBackFromWorkflow} />
          <PolicyDetailPanel
            policy={policy}
            variant="embedded"
            showRelatedActions={false}
          />
        </div>
      )

    case "raise-claim":
      return (
        <RaiseClaimManualPanel
          customer={customer}
          customerPolicies={customerPolicies}
          displayPhone={displayPhone}
          initialPolicy={policy}
          onBack={onBackFromWorkflow}
          onComplete={() => {
            onToast("Claim raised successfully.")
            onBackFromWorkflow()
          }}
        />
      )

    case "edit-policy":
      return (
        <EditPolicyManualPanel
          customer={customer}
          customerPolicies={customerPolicies}
          initialPolicy={policy}
          onBack={onBackFromWorkflow}
          onComplete={() => {
            onToast("Policy updated successfully.")
            onBackFromWorkflow()
          }}
        />
      )

    case "send-communication":
      return (
        <SendCommunicationManualPanel
          customer={customer}
          initialPolicy={policy}
          onBack={onBackFromWorkflow}
          onSent={(msg) => {
            onToast(msg)
            onBackFromWorkflow()
          }}
        />
      )

    case "cancel-policy":
      return (
        <SimpleManualTaskPanel
          title="Cancel policy"
          description={`Start cancellation for ${policyLabel(policy)} (${policy.policyNumber}).`}
          fields={[
            {
              label: "Reason for cancellation",
              placeholder: "Select or describe reason",
              type: "textarea",
            },
          ]}
          submitLabel="Continue"
          onBack={onBackFromWorkflow}
          onSubmit={() => {
            onToast("Cancellation flow started.")
            onBackFromWorkflow()
          }}
        />
      )

    case "claim-handler-call-back":
      return (
        <SimpleManualTaskPanel
          title="Claim handler call back"
          description={`Schedule a claim handler callback for ${policyLabel(policy)}.`}
          fields={[
            { label: "Preferred callback time", placeholder: "e.g. Today 4–6 PM" },
            { label: "Notes for claim handler", placeholder: "Add context", type: "textarea" },
          ]}
          submitLabel="Request callback"
          onBack={onBackFromWorkflow}
          onSubmit={() => {
            onToast("Callback request submitted.")
            onBackFromWorkflow()
          }}
        />
      )

    case "road-side-assistance":
      return (
        <SimpleManualTaskPanel
          title="Road side assistance"
          description={`Request roadside assistance for ${policyLabel(policy)}.`}
          fields={[
            { label: "Location", placeholder: "Customer's current location" },
            { label: "Issue", placeholder: "Flat tyre, breakdown, etc." },
          ]}
          submitLabel="Request RSA"
          onBack={onBackFromWorkflow}
          onSubmit={() => {
            onToast("Roadside assistance requested.")
            onBackFromWorkflow()
          }}
        />
      )

    default:
      return null
  }
}
