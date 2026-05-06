import { useCallback, useEffect, useRef, useState } from "react"

import type { QuickActionKey } from "@/components/crm/QuickActionDetailPage"

const MENU_ITEMS: { id: QuickActionKey; label: string }[] = [
  { id: "quick-action-1", label: "Send communication" },
  { id: "quick-action-2", label: "Request document" },
  { id: "quick-action-3", label: "Arrange CH Appointment" },
]

type QuickActionsButtonProps = {
  onSelectAction: (key: QuickActionKey) => void
}

/**
 * Floating Quick Actions control — Figma node 8391:26575 (P200 #b191ed, M shadow, bolt + label).
 * @see https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8391-26575
 */
export function QuickActionsButton({ onSelectAction }: QuickActionsButtonProps) {
  const [open, setOpen] = useState(false)
  const rootRef = useRef<HTMLDivElement>(null)

  const close = useCallback(() => setOpen(false), [])

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") close()
    }
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current?.contains(e.target as Node)) close()
    }
    document.addEventListener("keydown", onKey)
    document.addEventListener("mousedown", onDown)
    return () => {
      document.removeEventListener("keydown", onKey)
      document.removeEventListener("mousedown", onDown)
    }
  }, [open, close])

  return (
    <div ref={rootRef} className="relative z-[60]">
      {open ? (
        <div
          className="pointer-events-auto absolute bottom-full right-0 z-[60] mb-2 min-w-[200px] overflow-hidden rounded-xl border border-[#e7e7f0] bg-white py-1 shadow-[0px_8px_24px_0px_rgba(28,11,62,0.12)]"
          role="menu"
          aria-label="Quick actions menu"
        >
          {MENU_ITEMS.map((item) => (
            <button
              key={item.id}
              type="button"
              role="menuitem"
              className="flex w-full px-4 py-3 text-left font-euclid text-[14px] font-medium leading-5 text-[#36354c] transition-colors hover:bg-[#f8f7fc] focus:bg-[#f8f7fc] focus:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7c47e1]/30"
              onClick={() => {
                onSelectAction(item.id)
                setOpen(false)
              }}
            >
              {item.label}
            </button>
          ))}
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        className="flex cursor-pointer items-center gap-2 rounded-[8px] bg-[#b191ed] p-3 font-euclid shadow-[0px_4px_8px_0px_rgba(54,53,76,0.06)] transition-colors hover:bg-[#a789eb] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#fafafa]"
      >
        <span className="relative size-5 shrink-0 overflow-hidden" aria-hidden>
          <img
            src="/icons/quick-actions-bolt.svg"
            alt=""
            width={20}
            height={20}
            className="block size-5 max-w-none"
          />
        </span>
        <span className="whitespace-nowrap text-[14px] font-medium leading-5 text-white">Quick Actions</span>
      </button>
    </div>
  )
}
