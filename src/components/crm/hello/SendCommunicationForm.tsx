import { useEffect, useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Customer, Policy } from "@/types/crm"

const DOCUMENT_TYPES = [
  { value: "policy-document", label: "Policy Document" },
  { value: "claim-form", label: "Claim Form" },
  { value: "payment-receipt", label: "Payment Receipt" },
  { value: "kyc-documents", label: "KYC Documents" },
] as const

const COMMUNICATION_CHANNELS = [
  { id: "acko-alert", label: "ACKO Alerts" },
  { id: "text-message", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
] as const

function ChannelCheckbox({
  id,
  label,
  checked,
  onChange,
}: {
  id: string
  label: string
  checked: boolean
  onChange: () => void
}) {
  return (
    <label htmlFor={id} className="inline-flex cursor-pointer items-center gap-2">
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        onClick={onChange}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded-[4px] border-2",
          checked ? "border-[#0fa457] bg-[#0fa457]" : "border-[#5b5675] bg-white",
        )}
      >
        {checked ? <Check className="h-3 w-3 text-white" strokeWidth={2.5} /> : null}
      </button>
      <span className="font-euclid text-[14px] font-medium leading-5 text-[#5b5675]">
        {label}
      </span>
    </label>
  )
}

export type SendCommunicationFormProps = {
  customer?: Customer
  /**
   * Policy already chosen (chat pick or manual policy gate).
   * Not shown in this form — Figma 8990:14860 only has channels, contact, document.
   */
  contextPolicy?: Policy
  /** Pre-fill document dropdown (e.g. policy-document from send policy document flow). */
  initialDocumentType?: string
  initialChannels?: string[]
  onSent: (message: string) => void
  className?: string
}

/**
 * Figma OMNI Post-Sales § Send Communication (node 8990:14860 / 9032:10178).
 * Order: channels → contact fields → document dropdown → Send.
 */
export function SendCommunicationForm({
  customer,
  contextPolicy,
  initialDocumentType = "",
  initialChannels = [],
  onSent,
  className,
}: SendCommunicationFormProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>(initialChannels)
  const [selectedDocument, setSelectedDocument] = useState(initialDocumentType)
  const [phoneNumber, setPhoneNumber] = useState(customer?.phone ?? "")
  const [emailAddress, setEmailAddress] = useState(customer?.email ?? "")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setPhoneNumber(customer?.phone ?? "")
    setEmailAddress(customer?.email ?? "")
  }, [customer])

  useEffect(() => {
    if (initialDocumentType) {
      setSelectedDocument(initialDocumentType)
    }
  }, [initialDocumentType])

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId],
    )
  }

  const needsPhone =
    selectedChannels.includes("text-message") || selectedChannels.includes("whatsapp")
  const needsEmail = selectedChannels.includes("email")

  const isValid =
    Boolean(contextPolicy) &&
    selectedChannels.length > 0 &&
    Boolean(selectedDocument) &&
    (!needsPhone || phoneNumber.trim() !== "") &&
    (!needsEmail || emailAddress.trim() !== "")

  const handleSend = async () => {
    if (!isValid) return
    setIsLoading(true)
    await new Promise((resolve) => setTimeout(resolve, 1200))
    setIsLoading(false)
    onSent("Communication sent successfully.")
  }

  return (
    <div
      className={cn(
        "flex flex-col gap-6 rounded-[12px] border border-[#e7e7f0] bg-white p-6",
        className,
      )}
    >
      <div className="flex flex-col gap-4">
        <p className="font-euclid text-[14px] font-medium leading-5 text-[#36354c]">
          Select communication channel
        </p>
        <div className="flex flex-wrap gap-x-[124px] gap-y-3">
          {COMMUNICATION_CHANNELS.map((ch) => (
            <ChannelCheckbox
              key={ch.id}
              id={`send-comm-${ch.id}`}
              label={ch.label}
              checked={selectedChannels.includes(ch.id)}
              onChange={() => toggleChannel(ch.id)}
            />
          ))}
        </div>
      </div>

      {needsPhone ? (
        <div className="flex flex-col gap-1 rounded-[12px] bg-[#f8f7fc] p-3">
          <label className="font-euclid text-[12px] font-medium leading-[18px] text-[#5b5675]">
            Mobile number
          </label>
          <input
            type="tel"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            className="h-12 w-full rounded-[6px] border border-[#e5e5e5] bg-white px-3 font-euclid text-[14px] leading-5 text-[#5b5675] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
          />
        </div>
      ) : null}

      {needsEmail ? (
        <div className="flex flex-col gap-1 rounded-[12px] bg-[#f8f7fc] p-3">
          <label className="font-euclid text-[12px] font-medium leading-[18px] text-[#5b5675]">
            Email address
          </label>
          <input
            type="email"
            value={emailAddress}
            onChange={(e) => setEmailAddress(e.target.value)}
            className="h-12 w-full rounded-[6px] border border-[#e5e5e5] bg-white px-3 font-euclid text-[14px] leading-5 text-[#5b5675] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
          />
        </div>
      ) : null}

      <div className="flex flex-col gap-2">
        <p className="font-euclid text-[14px] font-medium leading-5 text-[#36354c]">
          Select what to send to customer:
        </p>
        <Select
          options={[...DOCUMENT_TYPES]}
          value={selectedDocument}
          onValueChange={setSelectedDocument}
          placeholder="Select what to send to customer"
          className="h-12 rounded-[6px] border-[#e5e5e5] [&>button]:h-12 [&>button]:rounded-[6px] [&>button]:border-[#e5e5e5] [&>button]:px-3 [&>button]:text-[14px]"
        />
      </div>

      <div className="flex justify-end">
        <Button
          type="button"
          onClick={handleSend}
          disabled={!isValid || isLoading}
          className={cn(
            "min-w-[98px] rounded-[12px] px-[30px] py-3 font-euclid text-[16px] font-medium leading-6 text-white",
            isValid
              ? "bg-[#7c47e1] hover:bg-[#6b3ccd]"
              : "bg-[#7c47e1] opacity-60 cursor-not-allowed",
          )}
        >
          {isLoading ? "Sending…" : "Send"}
        </Button>
      </div>
    </div>
  )
}
