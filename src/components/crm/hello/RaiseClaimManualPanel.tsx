import { useRef, useState } from "react"

import { RaiseClaimWorkflowPanel } from "@/components/crm/hello/RaiseClaimWorkflowPanel"
import { PolicySelectionPanel } from "@/components/crm/hello/PolicySelectionPanel"
import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"
import type { Customer, Policy } from "@/types/crm"

export type RaiseClaimManualPanelProps = {
  customer: Customer
  customerPolicies: Policy[]
  displayPhone?: string
  initialPolicy?: Policy
  onBack: () => void
  onComplete?: () => void
}

/** Manual raise claim: policy pick → request documents → raise FNOL (stays in manual mode). */
export function RaiseClaimManualPanel({
  customer,
  customerPolicies,
  displayPhone,
  initialPolicy,
  onBack,
  onComplete,
}: RaiseClaimManualPanelProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(
    initialPolicy ?? null,
  )
  const scrollRef = useRef<HTMLDivElement>(null)
  const policy = initialPolicy ?? selectedPolicy

  if (!policy) {
    return (
      <PolicySelectionPanel
        title="Raise a Claim"
        description="Select a policy to start the claim process"
        policies={customerPolicies.filter((p) => p.type === "Motor Insurance")}
        onBack={onBack}
        onPolicySelect={setSelectedPolicy}
      />
    )
  }

  return (
    <div className="space-y-4">
      <ManualWorkflowHeader
        title="Raise a claim"
        onBack={initialPolicy ? onBack : () => setSelectedPolicy(null)}
      />
      <RaiseClaimWorkflowPanel
        customer={customer}
        policy={policy}
        displayPhone={displayPhone}
        scrollContainerRef={scrollRef}
        showPanelHeader={false}
        onClose={onBack}
        onFnolComplete={onComplete}
      />
    </div>
  )
}
