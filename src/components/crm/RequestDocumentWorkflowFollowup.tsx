import { Check, Loader2 } from "lucide-react"
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

const mockDocuments: DocumentFile[] = [
  {
    id: "1",
    name: "Registration_Certificate.jpg",
    type: "image",
    url: "/sample-rc-reference.png",
    uploadedAt: "2 min ago",
    size: "2.3 MB",
  },
  {
    id: "2",
    name: "Driving_License_Front.jpg",
    type: "image",
    url: "/sample-rc-reference.png",
    uploadedAt: "2 min ago",
    size: "1.8 MB",
  },
  {
    id: "3",
    name: "Insurance_Policy.pdf",
    type: "pdf",
    url: "/sample-policy.pdf",
    uploadedAt: "1 min ago",
    size: "850 KB",
  },
]

function formatTime(ms: number) {
  return new Date(ms).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  })
}

/**
 * Compact single-line status strip shown below the request form.
 * State: dispatched → waiting for docs (spinner) | received → Review button | approved → approved badge | re-requested → re-requested badge.
 */
export function RequestDocumentWorkflowFollowup({
  phase,
  documentDeliveryIndex,
  receivedAtMs,
  onApprove,
  onReRequestDocuments,
  documentLabel = "documents",
  customerName = "Customer",
}: RequestDocumentWorkflowFollowupProps) {
  const [showReviewModal, setShowReviewModal] = useState(false)

  if (phase === "waiting") return null

  const isDispatched = phase === "dispatched"
  const isReceived = phase === "received"
  const isApproved = phase === "approved"
  const isReRequested = documentDeliveryIndex > 1 && isDispatched

  return (
    <div className="flex items-center justify-between gap-3 border-t border-[#e7e7f0] bg-[#fafafa] px-5 py-3">
      {/* Left: icon + single status line */}
      <div className="flex min-w-0 flex-1 items-center gap-2">
        {isApproved ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0fa457]">
            <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
          </span>
        ) : isDispatched ? (
          <Loader2 className="h-4 w-4 shrink-0 animate-spin text-[#7c47e1]" />
        ) : isReceived ? (
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#0fa457]">
            <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
          </span>
        ) : null}

        <span className={cn(
          "truncate font-euclid text-[13px] leading-5",
          isApproved ? "text-[#0fa457] font-medium" : "text-[#36354c]",
        )}>
          {isApproved
            ? `${documentLabel} approved`
            : isReceived
            ? `${documentLabel} received${receivedAtMs ? ` at ${formatTime(receivedAtMs)}` : ""}`
            : isReRequested
            ? `Re-requested ${documentLabel} — waiting…`
            : `Request sent — waiting for ${documentLabel}…`}
        </span>
      </div>

      {/* Right: action button */}
      {isReceived && (
        <Button
          type="button"
          size="sm"
          onClick={() => setShowReviewModal(true)}
          className="shrink-0 bg-[#7c47e1] font-euclid text-[12px] font-semibold text-white hover:bg-[#6b3ccd]"
        >
          Review {documentLabel}
        </Button>
      )}

      {isApproved && (
        <button
          type="button"
          onClick={onReRequestDocuments}
          className="shrink-0 font-euclid text-[12px] text-[#5b5675] underline-offset-2 hover:underline"
        >
          Re-request
        </button>
      )}

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