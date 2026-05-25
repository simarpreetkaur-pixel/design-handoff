import type { Customer } from "@/types/crm"
import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"
import {
  RequestDocumentsWorkflowContent,
  useRequestDocumentsWorkflow,
} from "@/components/crm/hello/RequestDocumentsAccordionStep"

export type RequestDocumentsManualPanelProps = {
  customer?: Customer
  onBack: () => void
  onSent?: (message: string) => void
}

/** Standalone manual request-documents — same form/follow-up as workflow step 1. */
export function RequestDocumentsManualPanel({
  customer,
  onBack,
  onSent,
}: RequestDocumentsManualPanelProps) {
  const documents = useRequestDocumentsWorkflow({
    onRequestDispatched: () => {
      onSent?.("Document request sent successfully.")
    },
  })

  if (!customer) {
    return (
      <div className="space-y-4">
        <ManualWorkflowHeader title="Request documents" onBack={onBack} />
        <p className="font-euclid text-sm text-[#5b5675]">Customer context is required.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <ManualWorkflowHeader title="Request documents" onBack={onBack} />
      <RequestDocumentsWorkflowContent customer={customer} documents={documents} />
    </div>
  )
}
