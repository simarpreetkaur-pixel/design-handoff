import { useEffect, useState } from "react"
import { Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import type { Customer, Policy } from "@/types/crm"
import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"

const documentTypes = [
  { value: "policy-document", label: "Policy Document" },
  { value: "claim-form", label: "Claim Form" },
  { value: "payment-receipt", label: "Payment Receipt" },
  { value: "kyc-documents", label: "KYC Documents" },
]

const communicationChannels = [
  { id: "acko-alert", label: "ACKO Alerts" },
  { id: "text-message", label: "SMS" },
  { id: "whatsapp", label: "WhatsApp" },
  { id: "email", label: "Email" },
]

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
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2",
          checked ? "border-[#7c47e1] bg-[#7c47e1]" : "border-[#5b5675] bg-white",
        )}
      >
        {checked ? <Check className="h-3 w-3 text-white" strokeWidth={2.5} /> : null}
      </button>
      <span className="font-euclid text-[14px] font-medium text-[#5b5675]">{label}</span>
    </label>
  )
}

export type SendCommunicationManualPanelProps = {
  customer?: Customer
  customerPolicies?: Policy[]
  initialPolicy?: Policy
  onBack: () => void
  onSent: (message: string) => void
}

/** Figma: channels → policy → document to send. */
export function SendCommunicationManualPanel({
  customer,
  customerPolicies = [],
  initialPolicy,
  onBack,
  onSent,
}: SendCommunicationManualPanelProps) {
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [selectedPolicy, setSelectedPolicy] = useState(initialPolicy?.id ?? "")
  const [selectedDocument, setSelectedDocument] = useState("")
  const [phoneNumber, setPhoneNumber] = useState(customer?.phone ?? "")
  const [emailAddress, setEmailAddress] = useState(customer?.email ?? "")
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    setPhoneNumber(customer?.phone ?? "")
    setEmailAddress(customer?.email ?? "")
  }, [customer])

  useEffect(() => {
    if (initialPolicy) {
      setSelectedPolicy(initialPolicy.id)
    }
  }, [initialPolicy])

  const policyOptions = customerPolicies.map((policy) => ({
    value: policy.id,
    label: `${policy.vehicle || policy.name} — ${policy.policyNumber}`,
  }))

  const toggleChannel = (channelId: string) => {
    setSelectedChannels((prev) =>
      prev.includes(channelId) ? prev.filter((id) => id !== channelId) : [...prev, channelId],
    )
  }

  const needsPhone =
    selectedChannels.includes("text-message") || selectedChannels.includes("whatsapp")
  const needsEmail = selectedChannels.includes("email")

  const isValid =
    selectedChannels.length > 0 &&
    selectedPolicy &&
    selectedDocument &&
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
    <div className="space-y-4">
      <ManualWorkflowHeader title="Send Communication" onBack={onBack} />

      <div className="rounded-[12px] border border-[#e7e7f0] bg-white p-6">
        <div className="flex flex-col gap-6">
          <div>
            <p className="mb-3 font-euclid text-[14px] font-medium text-[#36354c]">
              Select communication channel
            </p>
            <div className="flex flex-wrap gap-6">
              {communicationChannels.map((ch) => (
                <ChannelCheckbox
                  key={ch.id}
                  id={`comm-${ch.id}`}
                  label={ch.label}
                  checked={selectedChannels.includes(ch.id)}
                  onChange={() => toggleChannel(ch.id)}
                />
              ))}
            </div>
          </div>

          {needsPhone ? (
            <div className="rounded-md border border-[#e5e5e5] p-3">
              <label className="mb-2 block font-euclid text-[12px] font-medium text-[#36354c]">
                Mobile number
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="h-12 w-full rounded-md border border-[#e5e5e5] px-3 font-euclid text-[14px] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
              />
            </div>
          ) : null}

          {needsEmail ? (
            <div className="rounded-md border border-[#e5e5e5] p-3">
              <label className="mb-2 block font-euclid text-[12px] font-medium text-[#36354c]">
                Email address
              </label>
              <input
                type="email"
                value={emailAddress}
                onChange={(e) => setEmailAddress(e.target.value)}
                className="h-12 w-full rounded-md border border-[#e5e5e5] px-3 font-euclid text-[14px] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
              />
            </div>
          ) : null}

          {initialPolicy ? (
            <div className="rounded-md border border-[#e5e5e5] bg-[#f8f7fc] p-3">
              <p className="mb-1 font-euclid text-[12px] font-medium text-[#5b5675]">Policy</p>
              <p className="font-euclid text-[14px] font-medium text-[#36354c]">
                {initialPolicy.vehicle || initialPolicy.name} — {initialPolicy.policyNumber}
              </p>
            </div>
          ) : (
            <div>
              <p className="mb-2 font-euclid text-[14px] font-medium text-[#36354c]">Select Policy</p>
              <Select
                options={policyOptions}
                value={selectedPolicy}
                onValueChange={setSelectedPolicy}
                placeholder="Select policy"
              />
            </div>
          )}

          <div>
            <p className="mb-2 font-euclid text-[14px] font-medium text-[#36354c]">
              Select what to send to customer
            </p>
            <Select
              options={documentTypes}
              value={selectedDocument}
              onValueChange={setSelectedDocument}
              placeholder="Select what to send to customer"
            />
          </div>

          {isValid ? (
            <Button
              onClick={handleSend}
              disabled={isLoading}
              className="w-full bg-[#0fa457] font-euclid font-semibold text-white hover:bg-[#0d8a4a]"
            >
              {isLoading ? "Sending…" : "Send"}
            </Button>
          ) : null}
        </div>
      </div>
    </div>
  )
}
