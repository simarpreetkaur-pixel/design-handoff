import { useEffect, useState } from "react"

import {
  RequestRcCopyForm,
  type RequestRcChannel,
} from "@/components/crm/RequestRcCopyForm"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import {
  REQUEST_RC_COPY_EMAIL_BODY,
  REQUEST_RC_COPY_WHATSAPP_MESSAGE,
} from "@/lib/endorsementRcWorkflow"

type RequestRcCopyModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Optional default for the “To” field (agent can change). */
  defaultToEmail?: string
  /** Optional default WhatsApp number (agent can change). */
  defaultToPhone?: string
  /** Fires when the agent confirms Send (before the modal closes). */
  onSendSuccess?: (detail: { channel: RequestRcChannel }) => void
}

export function RequestRcCopyModal({
  open,
  onOpenChange,
  defaultToEmail = "",
  defaultToPhone = "",
  onSendSuccess,
}: RequestRcCopyModalProps) {
  const [channel, setChannel] = useState<RequestRcChannel>("whatsapp")
  const [toEmail, setToEmail] = useState(defaultToEmail)
  const [body, setBody] = useState(REQUEST_RC_COPY_EMAIL_BODY)
  const [toPhone, setToPhone] = useState(defaultToPhone)
  const [whatsappBody, setWhatsappBody] = useState(REQUEST_RC_COPY_WHATSAPP_MESSAGE)

  useEffect(() => {
    if (open) {
      setChannel("whatsapp")
      setToEmail(defaultToEmail)
      setBody(REQUEST_RC_COPY_EMAIL_BODY)
      setToPhone(defaultToPhone)
      setWhatsappBody(REQUEST_RC_COPY_WHATSAPP_MESSAGE)
    }
  }, [open, defaultToEmail, defaultToPhone])

  const handleSend = () => {
    onSendSuccess?.({ channel })
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
          channel={channel}
          onChannelChange={setChannel}
          toEmail={toEmail}
          body={body}
          onToEmailChange={setToEmail}
          onBodyChange={setBody}
          toPhone={toPhone}
          whatsappBody={whatsappBody}
          onToPhoneChange={setToPhone}
          onWhatsappBodyChange={setWhatsappBody}
          footerTone="muted"
          onSubmit={handleSend}
          onCancel={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
