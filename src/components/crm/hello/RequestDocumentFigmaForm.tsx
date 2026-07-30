import { useCallback, useEffect, useRef, useState } from "react"
import { Check, ChevronDown, X } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { cn } from "@/lib/utils"
import {
  DOCUMENT_TEMPLATES,
  type DocumentType,
  getDocumentTemplate,
} from "@/lib/documentRequestTemplates"
import type { Policy } from "@/types/crm"

export type RequestViaChannel = "whatsapp" | "email"

export type RequestDocumentFigmaFormProps = {
  defaultPhone?: string
  defaultEmail?: string
  policies?: Policy[]
  selectedPolicyId?: string
  onPolicyChange?: (policyId: string) => void
  submitLabel?: string
  disabled?: boolean
  onSubmit?: (data: {
    channels: RequestViaChannel[]
    phone: string
    email: string
    documentTypes: DocumentType[]
    message: string
    policyId?: string
  }) => void
}

function ChannelCheckbox({
  id,
  label,
  checked,
  onChange,
  disabled,
}: {
  id: string
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  disabled?: boolean
}) {
  return (
    <label
      htmlFor={id}
      className={cn(
        "inline-flex cursor-pointer items-center gap-2",
        disabled && "cursor-not-allowed opacity-60",
      )}
    >
      <button
        id={id}
        type="button"
        role="checkbox"
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={cn(
          "flex h-5 w-5 shrink-0 items-center justify-center rounded border-2 transition-colors",
          checked ? "border-[#7c47e1] bg-[#7c47e1]" : "border-[#5b5675] bg-white",
        )}
      >
        {checked ? <Check className="h-3 w-3 text-white" strokeWidth={2.5} /> : null}
      </button>
      <span className="font-euclid text-[14px] font-medium leading-5 text-[#5b5675]">{label}</span>
    </label>
  )
}

function docChipLabel(label: string): string {
  if (label.includes("Driving License")) return "License copy"
  if (label.includes("Registration")) return "RC copy"
  return label.split("(")[0].trim()
}

/**
 * Figma-aligned request document form (Request via → contact → documents → message → Send).
 */
export function RequestDocumentFigmaForm({
  defaultPhone = "",
  defaultEmail = "",
  policies,
  selectedPolicyId,
  onPolicyChange,
  submitLabel = "Send",
  disabled = false,
  onSubmit,
}: RequestDocumentFigmaFormProps) {
  const [whatsapp, setWhatsapp] = useState(true)
  const [email, setEmail] = useState(false)
  const [phone, setPhone] = useState(defaultPhone)
  const [emailAddress, setEmailAddress] = useState(defaultEmail)
  const [selectedDocs, setSelectedDocs] = useState<DocumentType[]>(["rc_copy", "driving_license"])
  const [showDocPicker, setShowDocPicker] = useState(false)
  const [message, setMessage] = useState(() => getDocumentTemplate("rc_copy").whatsappMessage)
  
  const docPickerRef = useRef<HTMLDivElement>(null)

  // Update phone and email when defaults change
  useEffect(() => {
    setPhone(defaultPhone || "")
    setEmailAddress(defaultEmail || "")
  }, [defaultPhone, defaultEmail])

  // Close dropdown when clicking outside or pressing Escape
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (docPickerRef.current && !docPickerRef.current.contains(event.target as Node)) {
        setShowDocPicker(false)
      }
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setShowDocPicker(false)
      }
    }

    if (showDocPicker) {
      document.addEventListener('mousedown', handleClickOutside)
      document.addEventListener('keydown', handleKeyDown)
      return () => {
        document.removeEventListener('mousedown', handleClickOutside)
        document.removeEventListener('keydown', handleKeyDown)
      }
    }
  }, [showDocPicker])

  const policyOptions =
    policies?.map((p) => ({
      value: p.id,
      label: `${p.vehicle || p.name} — ${p.policyNumber}`,
    })) ?? []

  const toggleDoc = (docId: DocumentType) => {
    setSelectedDocs((prev) => {
      const next = prev.includes(docId) ? prev.filter((d) => d !== docId) : [...prev, docId]
      if (next.length > 0) {
        const primary = getDocumentTemplate(next[0])
        setMessage(whatsapp ? primary.whatsappMessage : primary.emailBody)
      }
      return next
    })
    // Auto-close dropdown after selection for better UX
    setTimeout(() => setShowDocPicker(false), 150)
  }

  const removeDoc = (docId: DocumentType) => {
    setSelectedDocs((prev) => {
      const next = prev.filter((d) => d !== docId)
      return next.length > 0 ? next : prev
    })
  }

  const handleSubmit = useCallback(() => {
    const channels: RequestViaChannel[] = []
    if (whatsapp) channels.push("whatsapp")
    if (email) channels.push("email")
    if (channels.length === 0 || selectedDocs.length === 0) return

    onSubmit?.({
      channels,
      phone,
      email: emailAddress,
      documentTypes: selectedDocs,
      message,
      policyId: selectedPolicyId,
    })
  }, [whatsapp, email, phone, emailAddress, selectedDocs, message, selectedPolicyId, onSubmit])

  const isValid =
    selectedDocs.length > 0 &&
    (whatsapp || email) &&
    (!whatsapp || phone.trim() !== "") &&
    (!email || emailAddress.trim() !== "") &&
    (!policies?.length || Boolean(selectedPolicyId))

  return (
    <div className="rounded-[12px] bg-white p-6">
      <div className="flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <p className="font-euclid text-[14px] font-medium leading-5 text-[#36354c]">Request via</p>
          <div className="flex flex-wrap items-center gap-6">
            <ChannelCheckbox
              id="req-via-wa"
              label="WhatsApp"
              checked={whatsapp}
              onChange={setWhatsapp}
              disabled={disabled}
            />
            <ChannelCheckbox
              id="req-via-email"
              label="Email"
              checked={email}
              onChange={setEmail}
              disabled={disabled}
            />
          </div>
        </div>

        {whatsapp ? (
          <div className="rounded-md border border-[#e5e5e5] bg-white p-3">
            <label
              htmlFor="req-doc-phone"
              className="mb-2 block font-euclid text-[12px] font-medium leading-[18px] text-[#36354c]"
            >
              Mobile number
            </label>
            <input
              id="req-doc-phone"
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              disabled={disabled}
              className="h-12 w-full rounded-md border border-[#e5e5e5] px-3 font-euclid text-[14px] text-[#36354c] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
            />
          </div>
        ) : null}

        {email ? (
          <div className="rounded-md border border-[#e5e5e5] bg-white p-3">
            <label
              htmlFor="req-doc-email"
              className="mb-2 block font-euclid text-[12px] font-medium leading-[18px] text-[#36354c]"
            >
              Email address
            </label>
            <input
              id="req-doc-email"
              type="email"
              value={emailAddress}
              onChange={(e) => setEmailAddress(e.target.value)}
              disabled={disabled}
              className="h-12 w-full rounded-md border border-[#e5e5e5] px-3 font-euclid text-[14px] text-[#36354c] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
            />
          </div>
        ) : null}

        {policies && policies.length > 0 ? (
          <div className="flex flex-col gap-2">
            <p className="font-euclid text-[14px] font-medium leading-5 text-[#36354c]">
              Select policy
            </p>
            <Select
              options={policyOptions}
              value={selectedPolicyId ?? ""}
              onValueChange={(v) => onPolicyChange?.(v)}
              placeholder="Select policy"
              disabled={disabled}
            />
          </div>
        ) : null}

        <div className="flex flex-col gap-2">
          <p className="font-euclid text-[14px] font-medium leading-5 text-[#36354c]">
            Select policy documents to request
          </p>
          <div className="relative" ref={docPickerRef}>
            <button
              type="button"
              disabled={disabled}
              onClick={() => setShowDocPicker(!showDocPicker)}
              className={cn(
                "flex min-h-12 w-full items-center justify-between rounded-md border px-3 py-2 text-left transition-colors",
                showDocPicker 
                  ? "border-[#7c47e1] ring-1 ring-[#7c47e1]" 
                  : "border-[#e5e5e5] hover:border-[#d1d1d1]"
              )}
            >
              <div className="flex flex-wrap gap-2">
                {selectedDocs.length === 0 ? (
                  <span className="font-euclid text-[14px] text-[#5b5675]">Select documents</span>
                ) : (
                  selectedDocs.map((docId) => {
                    const tmpl = getDocumentTemplate(docId)
                    return (
                      <span
                        key={docId}
                        className="inline-flex items-center gap-1 rounded-md bg-[#f8f7fc] px-2 py-1 font-euclid text-[14px] text-[#36354c]"
                      >
                        {docChipLabel(tmpl.label)}
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation()
                            removeDoc(docId)
                          }}
                          className="text-[#5b5675] hover:text-[#36354c]"
                          aria-label={`Remove ${tmpl.label}`}
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </span>
                    )
                  })
                )}
              </div>
              <ChevronDown
                className={cn("h-5 w-5 shrink-0 text-[#5b5675]", showDocPicker && "rotate-180")}
              />
            </button>
            {showDocPicker ? (
              <div className="absolute left-0 right-0 top-full z-20 mt-1 max-h-48 overflow-y-auto rounded-lg border border-[#e7e7f0] bg-white shadow-lg">
                {DOCUMENT_TEMPLATES.map((tmpl) => (
                  <button
                    key={tmpl.id}
                    type="button"
                    onClick={() => toggleDoc(tmpl.id)}
                    className={cn(
                      "flex w-full items-center gap-2 px-3 py-2 text-left hover:bg-[#f8f7fc]",
                      selectedDocs.includes(tmpl.id) && "bg-[#f8f7fc]",
                    )}
                  >
                    <span
                      className={cn(
                        "flex h-5 w-5 items-center justify-center rounded border-2",
                        selectedDocs.includes(tmpl.id)
                          ? "border-[#7c47e1] bg-[#7c47e1]"
                          : "border-[#5b5675]",
                      )}
                    >
                      {selectedDocs.includes(tmpl.id) ? (
                        <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                      ) : null}
                    </span>
                    <span className="font-euclid text-[14px] text-[#36354c]">{tmpl.label}</span>
                  </button>
                ))}
              </div>
            ) : null}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-euclid text-[14px] font-medium leading-5 text-[#36354c]">Message to send</p>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            disabled={disabled}
            rows={4}
            className="min-h-[100px] w-full resize-y rounded-md border border-[#e5e5e5] px-3 py-2.5 font-euclid text-[14px] leading-5 text-[#36354c] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
          />
        </div>

        <div className="flex justify-end">
          <Button
            type="button"
            disabled={disabled || !isValid}
            onClick={handleSubmit}
            className="h-12 min-w-[98px] bg-[#0fa457] font-euclid text-[14px] font-semibold text-white hover:bg-[#0d8a4a] disabled:opacity-50"
          >
            {submitLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
