import { useRef, useState } from "react"

import { EditPolicyWorkflowPanel } from "@/components/crm/hello/EditPolicyWorkflowPanel"
import { PolicySelectionPanel } from "@/components/crm/hello/PolicySelectionPanel"
import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"
import { Select } from "@/components/ui/select"
import type { Customer, EndorsementEditKind, Policy } from "@/types/crm"

const EDIT_KIND_OPTIONS: { value: EndorsementEditKind; label: string }[] = [
  { value: "policy_holder_name", label: "Policy holder name" },
  { value: "policy_holder_email", label: "Policy holder email" },
  { value: "phone_number", label: "Phone number" },
  { value: "engine_number", label: "Engine number" },
  { value: "chassis_number", label: "Chassis number" },
]

export type EditPolicyManualPanelProps = {
  customer: Customer
  customerPolicies: Policy[]
  initialPolicy?: Policy
  onBack: () => void
  onComplete?: () => void
}

/** Manual edit policy: policy → edit field → request documents → endorsement. */
export function EditPolicyManualPanel({
  customer,
  customerPolicies,
  initialPolicy,
  onBack,
  onComplete,
}: EditPolicyManualPanelProps) {
  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(
    initialPolicy ?? null,
  )
  const [editKind, setEditKind] = useState<EndorsementEditKind | "">("")
  const scrollRef = useRef<HTMLDivElement>(null)
  const policy = initialPolicy ?? selectedPolicy

  if (!policy) {
    return (
      <PolicySelectionPanel
        title="Edit Policy"
        description="Select a policy to modify its details"
        policies={customerPolicies}
        onBack={onBack}
        onPolicySelect={setSelectedPolicy}
      />
    )
  }

  if (!editKind) {
    return (
      <div className="space-y-4">
        <ManualWorkflowHeader
          title="Edit policy"
          onBack={initialPolicy ? onBack : () => setSelectedPolicy(null)}
        />
        <div className="rounded-[12px] border border-[#e7e7f0] bg-white p-6">
          <p className="mb-2 font-euclid text-[14px] font-medium text-[#36354c]">
            What would you like to edit?
          </p>
          <Select
            options={EDIT_KIND_OPTIONS}
            value={editKind}
            onValueChange={(v) => setEditKind(v as EndorsementEditKind)}
            placeholder="Select field to edit"
          />
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ManualWorkflowHeader
        title="Edit policy"
        onBack={() => setEditKind("")}
      />
      <EditPolicyWorkflowPanel
        customer={customer}
        policy={policy}
        editKind={editKind}
        scrollContainerRef={scrollRef}
        showPanelHeader={false}
        onClose={onBack}
        onEditPolicyWorkflowComplete={onComplete}
      />
    </div>
  )
}
