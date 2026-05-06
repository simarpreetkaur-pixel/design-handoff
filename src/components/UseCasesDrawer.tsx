import { ChevronDown, X } from "lucide-react"
import { useEffect, useId, useState } from "react"

import { DEMO_USE_CASE_SECTIONS } from "@/data/demoUseCases"
import type { CrmDemoState } from "@/types/navigation"

export type UseCaseSelection = {
  customerId: string
  crmDemo: CrmDemoState
}

type UseCasesDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectUseCase: (selection: UseCaseSelection) => void
}

const pillClass =
  "rounded-full border border-[#e7e7f0] bg-white px-3 py-1.5 font-euclid text-sm font-normal text-[#36354c] transition-colors hover:bg-[#f8f7fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"

function initialExpandedState(): Record<string, boolean> {
  return Object.fromEntries(DEMO_USE_CASE_SECTIONS.map((s) => [s.id, false]))
}

export function UseCasesDrawer({ open, onOpenChange, onSelectUseCase }: UseCasesDrawerProps) {
  const titleId = useId()
  const [expandedBySection, setExpandedBySection] = useState<Record<string, boolean>>(initialExpandedState)

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

  useEffect(() => {
    if (!open) {
      setExpandedBySection(initialExpandedState())
    }
  }, [open])

  if (!open) {
    return null
  }

  return (
    <>
      <button
        type="button"
        className="fixed inset-0 z-[80] bg-black/30"
        aria-label="Close use cases"
        onClick={() => onOpenChange(false)}
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        className="fixed inset-y-0 right-0 z-[90] flex w-full max-w-[360px] flex-col border-l border-[#e7e7f0] bg-white shadow-[ -4px_0_24px_rgba(54,53,76,0.08) ]"
      >
        <div className="flex items-center justify-between border-b border-[#e7e7f0] px-4 py-3">
          <p id={titleId} className="font-euclid text-base font-semibold text-[#040222]">
            Use cases:
          </p>
          <button
            type="button"
            onClick={() => onOpenChange(false)}
            className="flex size-9 items-center justify-center rounded-lg text-[#5b5675] transition-colors hover:bg-[#f8f7fc] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
            aria-label="Close use cases"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="flex flex-col gap-6">
            {DEMO_USE_CASE_SECTIONS.map((section) => {
              const expanded = expandedBySection[section.id] ?? false
              return (
                <div key={section.id} className="flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      setExpandedBySection((prev) => ({
                        ...prev,
                        [section.id]: !prev[section.id],
                      }))
                    }
                    className="flex w-full items-center justify-between gap-2 rounded-sm text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                    aria-expanded={expanded}
                  >
                    <span className="font-euclid text-sm font-semibold text-[#040222]">
                      {section.number}. {section.title}
                    </span>
                    <ChevronDown
                      className={`size-4 shrink-0 text-[#5b5675] transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
                      aria-hidden
                    />
                  </button>
                  {expanded ? (
                    <div className="flex flex-wrap gap-2 pt-1">
                      {section.pills.map((pill) => (
                        <button
                          key={`${section.id}-${pill.customerId}-${pill.label}`}
                          type="button"
                          className={pillClass}
                          onClick={() =>
                            onSelectUseCase({
                              customerId: pill.customerId,
                              crmDemo: pill.crmDemo,
                            })
                          }
                        >
                          {pill.label}
                        </button>
                      ))}
                    </div>
                  ) : null}
                </div>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
