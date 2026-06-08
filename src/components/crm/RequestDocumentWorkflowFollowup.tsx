import { Check, Clock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import type { DocumentRequestPhase } from "@/components/crm/useRequestDocumentWorkflowStep"
import { DocumentReviewModal, type DocumentFile } from "@/components/crm/DocumentReviewModal"
import { useState } from "react"

export type RequestDocumentWorkflowFollowupProps = {
  phase: DocumentRequestPhase
  documentDeliveryIndex: number
  receivedAtMs: number | null
  onApprove: () => void
  onReRequestDocuments: () => void
  documentLabel?: string
  customerName?: string
}

/**
 * Generic document request workflow followup component.
 * Shows status after document request is sent and handles approval flow.
 */
export function RequestDocumentWorkflowFollowup({
  phase,
  documentDeliveryIndex,
  receivedAtMs,
  onApprove,
  onReRequestDocuments,
  documentLabel = "documents",
  customerName = "Customer"
}: RequestDocumentWorkflowFollowupProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)

  // Mock documents for review
  const mockDocuments: DocumentFile[] = [
    {
      id: "1",
      name: "Registration_Certificate.jpg",
      type: "image",
      url: "/sample-rc-reference.png", // Using existing sample image
      uploadedAt: "2 min ago",
      size: "2.3 MB"
    },
    {
      id: "2", 
      name: "Driving_License_Front.jpg",
      type: "image",
      url: "/sample-rc-reference.png", // Using existing sample image  
      uploadedAt: "2 min ago",
      size: "1.8 MB"
    },
    {
      id: "3",
      name: "Insurance_Policy.pdf", 
      type: "pdf",
      url: "/sample-policy.pdf",
      uploadedAt: "1 min ago", 
      size: "850 KB"
    }
  ]

  if (phase === "waiting") {
    return null
  }

  const isDispatched = phase === "dispatched"
  const isReceived = phase === "received"
  const isApproved = phase === "approved"

  const formatReceivedTime = (ms: number) => {
    const date = new Date(ms)
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    })
  }

  return (
    <div className="space-y-3 border-t border-[#e7e7f0] bg-[#fafafa] px-5 pb-5 pt-4">
      {/* Status indicators */}
      <div className="space-y-2">
        {/* Request sent */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            isDispatched || isReceived || isApproved ? "bg-[#0fa457]" : "bg-[#e7e7f0]"
          )}>
            <Check className={cn(
              "h-3 w-3",
              isDispatched || isReceived || isApproved ? "text-white" : "text-[#9c9aaf]"
            )} strokeWidth={2.5} />
          </div>
          <span className={cn(
            "font-euclid text-[13px] leading-5",
            isDispatched || isReceived || isApproved ? "text-[#040222]" : "text-[#9c9aaf]"
          )}>
            {documentLabel} request sent
          </span>
        </div>

        {/* Documents received */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            isReceived || isApproved ? "bg-[#0fa457]" : 
            isDispatched ? "bg-[#f59e0b]" : "bg-[#e7e7f0]"
          )}>
            {isReceived || isApproved ? (
              <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
            ) : isDispatched ? (
              <Clock className="h-3 w-3 text-white" strokeWidth={2} />
            ) : (
              <Clock className="h-3 w-3 text-[#9c9aaf]" strokeWidth={2} />
            )}
          </div>
          <span className={cn(
            "font-euclid text-[13px] leading-5",
            isReceived || isApproved ? "text-[#040222]" :
            isDispatched ? "text-[#f59e0b]" : "text-[#9c9aaf]"
          )}>
            {isReceived || isApproved 
              ? `${documentLabel} received${receivedAtMs ? ` at ${formatReceivedTime(receivedAtMs)}` : ""}`
              : isDispatched
              ? `Waiting for ${documentLabel}...`
              : `${documentLabel} not yet received`
            }
          </span>
        </div>

        {/* Documents approved */}
        <div className="flex items-center gap-2">
          <div className={cn(
            "flex h-5 w-5 shrink-0 items-center justify-center rounded-full",
            isApproved ? "bg-[#0fa457]" : "bg-[#e7e7f0]"
          )}>
            <Check className={cn(
              "h-3 w-3",
              isApproved ? "text-white" : "text-[#9c9aaf]"
            )} strokeWidth={2.5} />
          </div>
          <span className={cn(
            "font-euclid text-[13px] leading-5",
            isApproved ? "text-[#040222]" : "text-[#9c9aaf]"
          )}>
            {documentLabel} approved
          </span>
        </div>
      </div>

      {/* Action buttons based on phase */}
      {isDispatched && (
        <div className="rounded-lg border border-[#e7e7f0] bg-white p-3">
          <div className="flex items-start gap-2">
            <Mail className="mt-0.5 h-4 w-4 shrink-0 text-[#5b5675]" />
            <div className="flex-1 space-y-2">
              <p className="font-euclid text-[13px] leading-5 text-[#040222]">
                Request sent to customer
              </p>
              <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
                Waiting for customer to share {documentLabel}. They'll receive the request via their chosen channel.
              </p>
            </div>
          </div>
        </div>
      )}

      {isReceived && (
        <Button
          type="button"
          onClick={() => setShowReviewModal(true)}
          className="w-full bg-[#7c47e1] font-euclid text-[13px] font-semibold text-white hover:bg-[#6b3ccd]"
        >
          Review {documentLabel}
        </Button>
      )}

      {isApproved && (
        <div className="rounded-lg border border-[#0fa457]/20 bg-[#f0fdf4] p-3">
          <div className="flex items-start gap-2">
            <Check className="mt-0.5 h-4 w-4 shrink-0 text-[#0fa457]" strokeWidth={2.5} />
            <div className="flex-1">
              <p className="font-euclid text-[13px] leading-5 text-[#040222]">
                {documentLabel} approved
              </p>
              <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
                The {documentLabel} have been reviewed and approved. You can now proceed with the next steps.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Document Review Modal */}
      <DocumentReviewModal
        isOpen={showReviewModal}
        onClose={() => setShowReviewModal(false)}
        onApprove={onApprove}
        onReject={onReRequestDocuments}
        documents={mockDocuments}
        documentLabel={documentLabel}
        customerName={customerName}
      />
    </div>
  )
}