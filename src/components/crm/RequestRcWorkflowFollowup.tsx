import { useEffect, useState } from "react"
import { FileText, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import type { RequestRcFollowupPhase } from "@/components/crm/useRequestRcWorkflowStep"

type RequestRcWorkflowFollowupProps = {
  phase: RequestRcFollowupPhase | null
  /** 0 = first customer upload; higher = after re-request cycle(s). */
  documentDeliveryIndex: number
  /** Wall-clock ms when current batch arrived; “Received … ago” on file row, refreshes every minute. */
  receivedAtMs: number | null
  onApprove: () => void
  /** Close preview + return to waiting-for-customer; new upload arrives after demo delay. */
  onReRequestDocuments: () => void
}

type PreviewDoc = {
  title: string
  fileLabel: string
}

function previewForDelivery(documentDeliveryIndex: number): PreviewDoc {
  if (documentDeliveryIndex <= 0) {
    return {
      title: "Document preview",
      fileLabel: "RC_copy_and_driving_licence.pdf",
    }
  }
  return {
    title: "Updated documents",
    fileLabel: "RC_resend_after_request.pdf",
  }
}

/** Minute-granularity copy; recomputed on an interval (no per-second ticking). */
function formatReceivedAgoMinuteTick(receivedAtMs: number): string {
  const elapsedMs = Date.now() - receivedAtMs
  if (elapsedMs < 0) return "Received just now"
  const secs = Math.floor(elapsedMs / 1000)
  if (secs < 60) return "Received less than a minute ago"
  const mins = Math.floor(secs / 60)
  if (mins < 60) return `Received ${mins} min ago`
  const hrs = Math.floor(mins / 60)
  return `Received ${hrs} hr ago`
}

const RECEIVED_AGO_REFRESH_MS = 60_000

function useReceivedAgoLabel(receivedAtMs: number | null): string | null {
  const [label, setLabel] = useState<string | null>(null)

  useEffect(() => {
    if (receivedAtMs == null) {
      setLabel(null)
      return
    }
    const tick = () => setLabel(formatReceivedAgoMinuteTick(receivedAtMs))
    tick()
    const id = window.setInterval(tick, RECEIVED_AGO_REFRESH_MS)
    return () => window.clearInterval(id)
  }, [receivedAtMs])

  return label
}

/** Demo asset — Indian RC reference (customer upload preview). */
const SAMPLE_RC_IMAGE_SRC = "/sample-rc-reference.png"

function RcDocumentPreview() {
  return (
    <div className="overflow-hidden rounded-lg border border-[#e7e7f0] bg-[#e8f4fc] shadow-sm">
      <img
        src={SAMPLE_RC_IMAGE_SRC}
        alt="Vehicle registration certificate sample (demo)"
        className="mx-auto max-h-[min(52vh,360px)] w-full object-contain object-top"
        loading="lazy"
        decoding="async"
      />
    </div>
  )
}

/**
 * Post-send states: polling for customer reply, then document preview + Approve (Hello workflow RC step).
 */
export function RequestRcWorkflowFollowup({
  phase,
  documentDeliveryIndex,
  receivedAtMs,
  onApprove,
  onReRequestDocuments,
}: RequestRcWorkflowFollowupProps) {
  const [previewOpen, setPreviewOpen] = useState(false)

  const previewDoc = previewForDelivery(documentDeliveryIndex)
  const receivedLabel = useReceivedAgoLabel(receivedAtMs)

  useEffect(() => {
    if (phase === null) {
      setPreviewOpen(false)
      return
    }
    if (phase === "awaiting_customer") {
      setPreviewOpen(false)
      return
    }
    // documents_received: close preview whenever a new batch arrives (incl. after re-request).
    setPreviewOpen(false)
  }, [phase, documentDeliveryIndex])

  if (!phase) return null

  if (phase === "awaiting_customer") {
    return (
      <div className="mx-5 mb-4 rounded-xl border border-[#e7e7f0] bg-[#fafbff] px-4 py-3.5">
        <div className="flex gap-3">
          <Loader2
            className="size-5 shrink-0 animate-spin text-[#7c47e1]"
            aria-hidden
            strokeWidth={2}
          />
          <div className="min-w-0">
            <p className="font-euclid text-[13px] font-semibold text-[#36354c]">
              Waiting for customer
            </p>
            <p className="mt-1 font-euclid text-[12px] leading-[18px] text-[#5b5675]">
              The request is sent — our system is checking whether the customer has shared their RC copy
              and driving licence on WhatsApp.
            </p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="mx-5 mb-4 flex flex-col gap-3">
      <div className="rounded-xl border border-[#a7f3d0] bg-[#ecfdf5] px-4 py-3">
        <p className="font-euclid text-[13px] font-semibold text-[#065f46]">Documents received</p>
        <p className="mt-0.5 font-euclid text-[12px] leading-[18px] text-[#047857]">
          RC copy and driving licence are on file. Open the preview to verify, then approve to continue.
        </p>
      </div>

      <button
        type="button"
        onClick={() => {
          setPreviewOpen(true)
        }}
        className="inline-flex w-full min-w-0 items-start justify-start gap-2 rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5 text-left shadow-sm transition hover:border-[#7c47e1]/40"
      >
        <FileText className="mt-0.5 size-4 shrink-0 text-[#7c47e1]" aria-hidden strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <span className="block truncate font-euclid text-[13px] text-[#36354c]">{previewDoc.fileLabel}</span>
          {receivedLabel ? (
            <span className="mt-0.5 block font-euclid text-[11px] font-medium leading-4 text-[#8b87a3]">
              {receivedLabel}
            </span>
          ) : null}
        </div>
        <span className="ml-auto shrink-0 self-center font-euclid text-[11px] font-medium text-[#7c47e1]">
          Preview
        </span>
      </button>

      <Dialog
        open={previewOpen}
        onOpenChange={(open) => {
          setPreviewOpen(open)
        }}
      >
        <DialogContent className="max-w-lg gap-4">
          <DialogHeader>
            <DialogTitle className="font-euclid text-left text-[16px] font-semibold text-[#040222]">
              {previewDoc.title}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[min(75vh,560px)] overflow-y-auto rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-4 py-4 sm:px-5 sm:py-5">
            <RcDocumentPreview />
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              className="font-euclid"
              onClick={() => {
                setPreviewOpen(false)
                onReRequestDocuments()
              }}
            >
              Re-request documents
            </Button>
            <Button
              type="button"
              className="bg-[#0fa457] font-euclid font-semibold text-white hover:bg-[#0d8f49]"
              onClick={() => {
                onApprove()
                setPreviewOpen(false)
              }}
            >
              Approve
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
