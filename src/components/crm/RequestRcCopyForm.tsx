import { useCallback, useLayoutEffect, useRef } from "react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { REQUEST_RC_COPY_EMAIL_BODY } from "@/lib/endorsementRcWorkflow"

export type RequestRcCopyFormProps = {
  /** Tighter padding, gaps, and textarea height — for inline chat embeds. */
  compact?: boolean
  defaultToEmail?: string
  initialBody?: string
  /** Controlled mode (modal). When omitted, fields are uncontrolled with defaults. */
  toEmail?: string
  body?: string
  onToEmailChange?: (value: string) => void
  onBodyChange?: (value: string) => void
  footerTone?: "muted" | "plain"
  submitLabel?: string
  onSubmit?: () => void
  onCancel?: () => void
  /** Disable inputs after send (demo). */
  disabled?: boolean
}

/** Presentational RC email request — shared by `RequestRcCopyModal` (Classic) and Hello inline widget. */
export function RequestRcCopyForm({
  defaultToEmail = "",
  initialBody = REQUEST_RC_COPY_EMAIL_BODY,
  toEmail,
  body,
  onToEmailChange,
  onBodyChange,
  footerTone = "muted",
  submitLabel = "Send",
  onSubmit,
  onCancel,
  compact = false,
  disabled = false,
}: RequestRcCopyFormProps) {
  const controlled = toEmail !== undefined && body !== undefined
  const bodyRef = useRef<HTMLTextAreaElement>(null)

  const minBodyPx = compact ? 96 : 160

  const syncBodyHeight = useCallback(() => {
    const el = bodyRef.current
    if (!el) return
    el.style.height = "0px"
    el.style.height = `${Math.max(el.scrollHeight, minBodyPx)}px`
  }, [minBodyPx])

  useLayoutEffect(() => {
    const el = bodyRef.current
    if (!el) return
    syncBodyHeight()
    const ro = new ResizeObserver(() => syncBodyHeight())
    ro.observe(el)
    return () => ro.disconnect()
  }, [syncBodyHeight, initialBody, body, compact, controlled])

  return (
    <fieldset
      disabled={disabled}
      className={cn(
        "m-0 flex min-w-0 flex-col border-0 px-5 pb-0",
        compact ? "gap-0 pt-4" : "gap-0 pt-5",
      )}
    >
      <div className="flex flex-col gap-1.5">
        <label htmlFor="request-rc-to" className="font-euclid text-[13px] font-medium text-[#36354c]">
          Customer email
        </label>
        <input
          id="request-rc-to"
          name="request-rc-to"
          type="email"
          autoComplete="email"
          value={controlled ? toEmail : undefined}
          defaultValue={controlled ? undefined : defaultToEmail}
          onChange={controlled ? (e) => onToEmailChange?.(e.target.value) : undefined}
          placeholder="name@example.com"
          className="h-10 w-full rounded-lg border border-[#e7e7f0] bg-white px-3 font-euclid text-[14px] text-[#36354c] outline-none ring-[#7c47e1]/25 placeholder:text-[#9c9aaf] focus:border-[#7c47e1] focus:ring-2"
        />
      </div>
      <div
        className={cn(
          "flex flex-col",
          compact ? "mt-4 gap-1.5" : "mt-5 gap-1.5",
        )}
      >
        <label htmlFor="request-rc-body" className="font-euclid text-[13px] font-medium text-[#36354c]">
          Email body
        </label>
        <textarea
          ref={bodyRef}
          id="request-rc-body"
          name="request-rc-body"
          rows={1}
          value={controlled ? body : undefined}
          defaultValue={controlled ? undefined : initialBody}
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
          onClick={onSubmit}
          disabled={disabled}
        >
          {submitLabel}
        </Button>
      </div>
    </fieldset>
  )
}
