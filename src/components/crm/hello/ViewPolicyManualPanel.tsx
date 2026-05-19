import { useState } from "react"

import { PolicyDetailPanel } from "@/components/crm/ActivePoliciesPanel"
import { PolicySelectionPanel } from "@/components/crm/hello/PolicySelectionPanel"
import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"
import type { Policy } from "@/types/crm"

export type ViewPolicyManualPanelProps = {
  customerPolicies: Policy[]
  onBack: () => void
}

export function ViewPolicyManualPanel({ customerPolicies, onBack }: ViewPolicyManualPanelProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(null)

  if (!selectedPolicy) {
    return (
      <PolicySelectionPanel
        title="View policy"
        description="Select a policy to view details"
        policies={customerPolicies}
        onBack={onBack}
        onPolicySelect={setSelectedPolicy}
      />
    )
  }

  return (
    <div className="space-y-4">
      <ManualWorkflowHeader
        title="Policy details"
        onBack={() => setSelectedPolicy(null)}
      />
      <PolicyDetailPanel policy={selectedPolicy} variant="embedded" showRelatedActions={false} />
    </div>
  )
}
