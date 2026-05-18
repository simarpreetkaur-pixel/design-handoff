import { useCallback, useLayoutEffect, useRef, useState } from "react"
import { Mail, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { 
  DOCUMENT_TEMPLATES, 
  type DocumentType, 
  type DocumentTemplate,
  getDocumentTemplate 
} from "@/lib/documentRequestTemplates"

export type RequestDocumentChannel = "email" | "whatsapp"

function WhatsAppGlyph({ className }: { className?: string }) {
  return (
    <svg
      className={className}
      viewBox="0 0 24 24"
      aria-hidden
      focusable="false"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

export type RequestDocumentFormProps = {
  /** Tighter padding, gaps, and textarea height — for inline chat embeds. */
  compact?: boolean
  defaultToEmail?: string
  defaultToPhone?: string
  defaultDocumentType?: DocumentType
  /** Controlled (modal). When values are set, all related fields must be supplied too. */
  documentType?: DocumentType
  onDocumentTypeChange?: (type: DocumentType) => void
  channel?: RequestDocumentChannel
  onChannelChange?: (channel: RequestDocumentChannel) => void
  toEmail?: string
  body?: string
  onToEmailChange?: (value: string) => void
  onBodyChange?: (value: string) => void
  toPhone?: string
  whatsappBody?: string
  onToPhoneChange?: (value: string) => void
  onWhatsappBodyChange?: (value: string) => void
  footerTone?: "muted" | "plain"
  submitLabel?: string
  onSubmit?: (data: {
    documentType: DocumentType
    channel: RequestDocumentChannel
    toEmail?: string
    toPhone?: string
    body: string
  }) => void
  onCancel?: () => void
  /** Disable inputs after send (demo). */
  disabled?: boolean
}

/** Generic document request form — Email or WhatsApp; can be used for any document type. */
export function RequestDocumentForm({
  defaultToEmail = "",
  defaultToPhone = "",
  defaultDocumentType = "rc_copy",
  documentType: documentTypeProp,
  onDocumentTypeChange,
  channel: channelProp,
  onChannelChange,
  toEmail,
  body,
  onToEmailChange,
  onBodyChange,
  toPhone,
  whatsappBody,
  onToPhoneChange,
  onWhatsappBodyChange,
  footerTone = "muted",
  submitLabel = "Send Request",
  onSubmit,
  onCancel,
  compact = false,
  disabled = false,
}: RequestDocumentFormProps) {
  const controlled = toEmail !== undefined && body !== undefined

  const [internalDocumentType, setInternalDocumentType] = useState<DocumentType>(defaultDocumentType)
  const [internalChannel, setInternalChannel] = useState<RequestDocumentChannel>("whatsapp")
  const [showDocumentDropdown, setShowDocumentDropdown] = useState(false)

  const documentType = controlled ? documentTypeProp! : internalDocumentType
  const setDocumentType = controlled ? onDocumentTypeChange! : setInternalDocumentType
  const channel = controlled ? channelProp! : internalChannel
  const setChannel = controlled ? onChannelChange! : setInternalChannel

  const selectedTemplate = getDocumentTemplate(documentType)

  const emailBodyRef = useRef<HTMLTextAreaElement>(null)
  const waBodyRef = useRef<HTMLTextAreaElement>(null)

  const minBodyPx = compact ? 96 : 160

  const syncBodyHeight = useCallback(() => {
    const el = channel === "email" ? emailBodyRef.current : waBodyRef.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${Math.max(el.scrollHeight, minBodyPx)}px`
  }, [channel, minBodyPx])

  useLayoutEffect(() => {
    syncBodyHeight()
    const el = channel === "email" ? emailBodyRef.current : waBodyRef.current
    if (!el) return
    const ro = new ResizeObserver(() => syncBodyHeight())
    ro.observe(el)
    return () => ro.disconnect()
  }, [
    syncBodyHeight,
    channel,
    body,
    whatsappBody,
    compact,
    controlled,
    selectedTemplate,
  ])

  // Update templates when document type changes
  useLayoutEffect(() => {
    if (!controlled) {
      syncBodyHeight()
    }
  }, [documentType, syncBodyHeight, controlled])

  const handleSubmit = () => {
    const currentBody = channel === "email" 
      ? (controlled ? body : selectedTemplate.emailBody)
      : (controlled ? whatsappBody : selectedTemplate.whatsappMessage)

    const currentEmail = controlled ? toEmail : defaultToEmail
    const currentPhone = controlled ? toPhone : defaultToPhone

    onSubmit?.({
      documentType,
      channel,
      toEmail: channel === "email" ? currentEmail : undefined,
      toPhone: channel === "whatsapp" ? currentPhone : undefined,
      body: currentBody || ""
    })
  }

  const channelGap = compact ? "mt-4" : "mt-5"
  const fieldGap = compact ? "mt-4" : "mt-5"

  return (
    <fieldset
      disabled={disabled}
      className={cn(
        "m-0 flex min-w-0 flex-col border-0 px-5 pb-0",
        compact ? "gap-0 pt-4" : "gap-0 pt-5",
      )}
    >
      {/* Document Type Selection */}
      <div className={cn("flex flex-col gap-1.5", "mb-4")}>
        <label className="font-euclid text-[13px] font-medium text-[#36354c]">
          Document to request
        </label>
        <div className="relative">
          <button
            type="button"
            onClick={() => setShowDocumentDropdown(!showDocumentDropdown)}
            className="w-full h-10 px-3 text-left rounded-lg border border-[#e7e7f0] bg-white font-euclid text-[14px] text-[#36354c] outline-none ring-[#7c47e1]/25 focus:border-[#7c47e1] focus:ring-2 flex items-center justify-between"
          >
            <span>{selectedTemplate.label}</span>
            <ChevronDown className={cn("w-4 h-4 text-[#5b5675] transition-transform", showDocumentDropdown && "rotate-180")} />
          </button>
          
          {showDocumentDropdown && (
            <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-[#e7e7f0] rounded-lg shadow-lg z-10 max-h-60 overflow-y-auto">
              {DOCUMENT_TEMPLATES.map((template) => (
                <button
                  key={template.id}
                  type="button"
                  onClick={() => {
                    setDocumentType(template.id)
                    setShowDocumentDropdown(false)
                  }}
                  className={cn(
                    "w-full px-3 py-2 text-left hover:bg-[#f8f7fc] focus:bg-[#f8f7fc] outline-none transition-colors",
                    documentType === template.id && "bg-[#f8f7fc]"
                  )}
                >
                  <div className="font-euclid text-[14px] font-medium text-[#36354c]">
                    {template.label}
                  </div>
                  <div className="font-euclid text-[12px] text-[#5b5675]">
                    {template.description}
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Channel Selection */}
      <div className="flex min-w-0 flex-wrap items-center gap-x-2 gap-y-1">
        <p
          id="request-document-channel-label"
          className="shrink-0 font-euclid text-[12px] font-medium leading-[18px] text-[#36354c]"
        >
          Send via
        </p>
        <div
          role="radiogroup"
          aria-labelledby="request-document-channel-label"
          className="inline-flex flex-wrap items-center gap-1.5"
        >
          <button
            type="button"
            role="radio"
            aria-checked={channel === "email"}
            onClick={() => setChannel("email")}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 font-euclid text-[12px] font-medium leading-none transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-[#7c47e1]/25",
              channel === "email"
                ? "border-[#7c47e1] bg-[#f5f3fc] text-[#36354c] ring-1 ring-[#7c47e1]/20"
                : "border-[#e7e7f0] bg-white text-[#5b5675] hover:border-[#d1d0dc]",
            )}
          >
            <Mail className="size-3 shrink-0" aria-hidden strokeWidth={2} />
            Email
          </button>
          <button
            type="button"
            role="radio"
            aria-checked={channel === "whatsapp"}
            onClick={() => setChannel("whatsapp")}
            className={cn(
              "inline-flex h-7 shrink-0 items-center gap-1 rounded-full border px-2.5 font-euclid text-[12px] font-medium leading-none transition-colors outline-none",
              "focus-visible:ring-2 focus-visible:ring-[#7c47e1]/25",
              channel === "whatsapp"
                ? "border-[#7c47e1] bg-[#f5f3fc] text-[#36354c] ring-1 ring-[#7c47e1]/20"
                : "border-[#e7e7f0] bg-white text-[#5b5675] hover:border-[#d1d0dc]",
            )}
          >
            <WhatsAppGlyph className="size-3.5 shrink-0 text-[#25D366]" />
            WhatsApp
          </button>
        </div>
      </div>

      {channel === "email" ? (
        <>
          <div className={cn("flex flex-col gap-1.5", channelGap)}>
            <label htmlFor="request-document-to" className="font-euclid text-[13px] font-medium text-[#36354c]">
              Customer email
            </label>
            <input
              id="request-document-to"
              name="request-document-to"
              type="email"
              autoComplete="email"
              value={controlled ? toEmail : undefined}
              defaultValue={controlled ? undefined : defaultToEmail}
              onChange={controlled ? (e) => onToEmailChange?.(e.target.value) : undefined}
              placeholder="name@example.com"
              className="h-10 w-full rounded-lg border border-[#e7e7f0] bg-white px-3 font-euclid text-[14px] text-[#36354c] outline-none ring-[#7c47e1]/25 placeholder:text-[#9c9aaf] focus:border-[#7c47e1] focus:ring-2"
            />
          </div>
          <div className={cn("flex flex-col gap-1.5", fieldGap)}>
            <label htmlFor="request-document-body" className="font-euclid text-[13px] font-medium text-[#36354c]">
              Email body
            </label>
            <textarea
              ref={emailBodyRef}
              id="request-document-body"
              name="request-document-body"
              rows={1}
              value={controlled ? body : undefined}
              defaultValue={controlled ? undefined : selectedTemplate.emailBody}
              onChange={(e) => {
                if (controlled) {
                  onBodyChange?.(e.target.value)
                } else {
                  queueMicrotask(syncBodyHeight)
                }
              }}
              className={cn(
                "w-full resize-none overflow-hidden rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5 font-euclid text-[13px] leading-5 text-[#36354c] outline-none ring-[#7c47e1]/25 focus:border-[#7c47e1] focus:ring-2",
                compact ? "min-h-[96px]" : "min-h-[160px]",
              )}
            />
          </div>
        </>
      ) : (
        <>
          <div className={cn("flex flex-col gap-1.5", channelGap)}>
            <label htmlFor="request-document-wa-phone" className="font-euclid text-[13px] font-medium text-[#36354c]">
              Customer WhatsApp number
            </label>
            <input
              id="request-document-wa-phone"
              name="request-document-wa-phone"
              type="tel"
              autoComplete="tel"
              value={controlled ? toPhone : undefined}
              defaultValue={controlled ? undefined : defaultToPhone}
              onChange={controlled ? (e) => onToPhoneChange?.(e.target.value) : undefined}
              placeholder="+91 98765 43210"
              className="h-10 w-full rounded-lg border border-[#e7e7f0] bg-white px-3 font-euclid text-[14px] text-[#36354c] outline-none ring-[#7c47e1]/25 placeholder:text-[#9c9aaf] focus:border-[#7c47e1] focus:ring-2"
            />
          </div>
          <div className={cn("flex flex-col gap-1.5", fieldGap)}>
            <label htmlFor="request-document-wa-body" className="font-euclid text-[13px] font-medium text-[#36354c]">
              WhatsApp message
            </label>
            <textarea
              ref={waBodyRef}
              id="request-document-wa-body"
              name="request-document-wa-body"
              rows={1}
              value={controlled ? whatsappBody : undefined}
              defaultValue={controlled ? undefined : selectedTemplate.whatsappMessage}
              onChange={(e) => {
                if (controlled) {
                  onWhatsappBodyChange?.(e.target.value)
                } else {
                  queueMicrotask(syncBodyHeight)
                }
              }}
              className={cn(
                "w-full resize-none overflow-hidden rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5 font-euclid text-[13px] leading-5 text-[#36354c] outline-none ring-[#7c47e1]/25 focus:border-[#7c47e1] focus:ring-2",
                compact ? "min-h-[96px]" : "min-h-[160px]",
              )}
            />
          </div>
        </>
      )}

      <div
        className={cn(
          "flex justify-end gap-2 border-t border-[#e7e7f0] px-5",
          footerTone === "muted" && "bg-[#fafafa]",
          compact ? "-mx-5 mt-4 py-3" : "-mx-5 mt-5 py-3",
        )}
      >
        {onCancel ? (
          <Button type="button" variant="outline" className="font-euclid" onClick={onCancel}>
            Cancel
          </Button>
        ) : null}
        <Button
          type="button"
          className="bg-[#7c47e1] font-euclid text-[14px] font-semibold text-white hover:bg-[#6b3ccd] disabled:opacity-60"
          onClick={handleSubmit}
          disabled={disabled}
        >
          {submitLabel}
        </Button>
      </div>
    </fieldset>
  )
}