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
  onApprove: () => void
}

/**
 * Post-send states: polling for customer reply, then document preview + Approve (Hello workflow RC step).
 */
export function RequestRcWorkflowFollowup({ phase, onApprove }: RequestRcWorkflowFollowupProps) {
  const [previewOpen, setPreviewOpen] = useState(false)
  const [hasOpenedPreview, setHasOpenedPreview] = useState(false)

  useEffect(() => {
    if (phase === null) {
      setPreviewOpen(false)
      setHasOpenedPreview(false)
    }
  }, [phase])

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
          setHasOpenedPreview(true)
        }}
        className="inline-flex w-full min-w-0 items-center justify-start gap-2 rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5 text-left font-euclid text-[13px] text-[#36354c] shadow-sm transition hover:border-[#7c47e1]/40"
      >
        <FileText className="size-4 shrink-0 text-[#7c47e1]" aria-hidden strokeWidth={2} />
        <span className="truncate">RC_copy_and_driving_licence.pdf</span>
        <span className="ml-auto shrink-0 font-euclid text-[11px] font-medium text-[#7c47e1]">
          Preview
        </span>
      </button>

      <Button
        type="button"
        disabled={!hasOpenedPreview}
        className="h-10 w-full bg-[#0fa457] font-euclid text-[14px] font-semibold text-white hover:bg-[#0d8f49] disabled:pointer-events-none disabled:opacity-45 sm:w-auto sm:self-start"
        onClick={onApprove}
      >
        Approve
      </Button>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-md gap-4">
          <DialogHeader>
            <DialogTitle className="font-euclid text-left text-[16px] font-semibold text-[#040222]">
              Document preview
            </DialogTitle>
          </DialogHeader>
          <div className="rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-6 py-10 text-center">
            <FileText className="mx-auto size-14 text-[#7c47e1]/45" strokeWidth={1.25} aria-hidden />
            <p className="mt-4 font-euclid text-[13px] leading-5 text-[#5b5675]">
              Combined preview of RC and driving licence (demo). In production this would render the
              customer upload.
            </p>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="outline" className="font-euclid" onClick={() => setPreviewOpen(false)}>
              Close
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
