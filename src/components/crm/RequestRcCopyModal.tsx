import { useEffect, useState } from "react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { REQUEST_RC_COPY_EMAIL_BODY } from "@/lib/endorsementRcWorkflow"

type RequestRcCopyModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional default for the “To” field (agent can change). */
  defaultToEmail?: string
  /** Fires when the agent confirms Send (before the modal closes). */
  onSendSuccess?: () => void
}

export function RequestRcCopyModal({
  open,
  onOpenChange,
  defaultToEmail = "",
  onSendSuccess,
}: RequestRcCopyModalProps) {
  const [toEmail, setToEmail] = useState(defaultToEmail)
  const [body, setBody] = useState(REQUEST_RC_COPY_EMAIL_BODY)

  useEffect(() => {
    if (open) {
      setToEmail(defaultToEmail)
      setBody(REQUEST_RC_COPY_EMAIL_BODY)
    }
  }, [open, defaultToEmail])

  const handleSend = () => {
    onSendSuccess?.()
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg gap-0 overflow-hidden p-0 sm:max-w-lg">
        <DialogHeader className="border-b border-[#e7e7f0] px-5 py-4">
          <DialogTitle className="font-euclid text-left text-[16px] font-semibold leading-6 text-[#040222]">
            Request RC copy
          </DialogTitle>
        </DialogHeader>
        <div className="flex flex-col gap-4 px-5 py-4">
          <div className="flex flex-col gap-1.5">
            <label htmlFor="request-rc-to" className="font-euclid text-[13px] font-medium text-[#36354c]">
              Customer email
            </label>
            <input
              id="request-rc-to"
              type="email"
              autoComplete="email"
              value={toEmail}
              onChange={(e) => setToEmail(e.target.value)}
              placeholder="name@example.com"
              className="h-10 w-full rounded-lg border border-[#e7e7f0] bg-white px-3 font-euclid text-[14px] text-[#36354c] outline-none ring-[#7c47e1]/25 placeholder:text-[#9c9aaf] focus:border-[#7c47e1] focus:ring-2"
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label htmlFor="request-rc-body" className="font-euclid text-[13px] font-medium text-[#36354c]">
              Email body
            </label>
            <textarea
              id="request-rc-body"
              rows={10}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="min-h-[200px] w-full resize-y rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5 font-euclid text-[13px] leading-5 text-[#36354c] outline-none ring-[#7c47e1]/25 focus:border-[#7c47e1] focus:ring-2"
            />
          </div>
        </div>
        <DialogFooter className="border-t border-[#e7e7f0] bg-[#fafafa] px-5 py-3">
          <Button
            type="button"
            variant="outline"
            className="font-euclid"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            className="bg-[#7c47e1] font-euclid text-[14px] font-semibold text-white hover:bg-[#6b3ccd]"
            onClick={handleSend}
          >
            Send
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
