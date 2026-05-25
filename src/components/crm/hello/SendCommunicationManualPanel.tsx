import type { Customer, Policy } from "@/types/crm"
import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"
import { SendCommunicationForm } from "@/components/crm/hello/SendCommunicationForm"

export type SendCommunicationManualPanelProps = {
  customer?: Customer
  /** Policy from manual policy-gate step (not shown again in the form). */
  initialPolicy: Policy
  initialDocumentType?: string
  onBack: () => void
  onSent: (message: string) => void
}

/** Manual mode — Figma Send Communication (node 8990:14860). */
export function SendCommunicationManualPanel({
  customer,
  initialPolicy,
  initialDocumentType,
  onBack,
  onSent,
}: SendCommunicationManualPanelProps) {
  return (
    <div className="space-y-4">
      <ManualWorkflowHeader title="Send Communication" onBack={onBack} />
      <SendCommunicationForm
        customer={customer}
        contextPolicy={initialPolicy}
        initialDocumentType={initialDocumentType}
        onSent={onSent}
      />
    </div>
  )
}
