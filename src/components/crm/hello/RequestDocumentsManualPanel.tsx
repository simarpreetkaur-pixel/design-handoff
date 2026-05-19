import { RequestDocumentWorkflowFollowup } from "@/components/crm/RequestDocumentWorkflowFollowup"
import { useRequestDocumentWorkflowStep } from "@/components/crm/useRequestDocumentWorkflowStep"
import type { Customer } from "@/types/crm"
import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"
import { RequestDocumentFigmaForm } from "@/components/crm/hello/RequestDocumentFigmaForm"

export type RequestDocumentsManualPanelProps = {
  customer?: Customer
  onBack: () => void
  onSent?: (message: string) => void
}

/** Standalone manual request-documents flow — no policy selection required. */
export function RequestDocumentsManualPanel({
  customer,
  onBack,
  onSent,
}: RequestDocumentsManualPanelProps) {
  const documents = useRequestDocumentWorkflowStep({
    onRequestDispatched: () => {
      onSent?.("Document request sent successfully.")
    },
  })

  return (
    <div className="space-y-4">
      <ManualWorkflowHeader title="Request documents" onBack={onBack} />

      <RequestDocumentFigmaForm
        defaultPhone={customer?.phone}
        defaultEmail={customer?.email}
        disabled={documents.formDisabled}
        onSubmit={() => documents.dispatchRequest()}
      />

      {documents.followupPhase !== "waiting" ? (
        <RequestDocumentWorkflowFollowup
          phase={documents.followupPhase}
          documentDeliveryIndex={documents.documentDeliveryIndex}
          receivedAtMs={documents.receivedAtMs}
          onApprove={documents.approveDocuments}
          onReRequestDocuments={documents.reRequestDocuments}
          documentLabel="documents"
          customerName={customer?.name}
        />
      ) : null}
    </div>
  )
}
