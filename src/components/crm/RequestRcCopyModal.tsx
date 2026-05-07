import { useEffect, useState } from "react"

import { RequestRcCopyForm } from "@/components/crm/RequestRcCopyForm"
import {
  Dialog,
  DialogContent,
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
        <RequestRcCopyForm
          toEmail={toEmail}
          body={body}
          onToEmailChange={setToEmail}
          onBodyChange={setBody}
          footerTone="muted"
          onSubmit={handleSend}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
