import { X } from "lucide-react"
import { useEffect, useId } from "react"

import { DEMO_USE_CASE_SECTIONS } from "@/data/demoUseCases"
import type { CrmDemoState } from "@/types/navigation"

export type UseCaseSelection = {
  customerId: string
  crmDemo: CrmDemoState
  /** When true, skip the incoming call modal and navigate directly to CRM. */
  directEntry?: boolean
}

type UseCasesDrawerProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectUseCase: (selection: UseCaseSelection) => void
}

export function UseCasesDrawer({ open, onOpenChange, onSelectUseCase }: UseCasesDrawerProps) {
  const titleId = useId()

  useEffect(() => {
    if (!open) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onOpenChange(false)
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open, onOpenChange])

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
          <div className="flex flex-col gap-4">
            {DEMO_USE_CASE_SECTIONS.map((section) => {
              const scenario = section.pills[0]
              return (
                <button
                  key={section.id}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSelectUseCase({
                      customerId: scenario.customerId,
                      crmDemo: scenario.crmDemo,
                      directEntry: scenario.directEntry,
                    })
                  }}
                  className="flex w-full rounded-sm px-1 py-1 text-left font-euclid text-sm font-semibold text-[#040222] transition-colors hover:bg-[#f8f7fc] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                >
                  {section.number}. {section.title}
                </button>
              )
            })}
          </div>
        </div>
      </div>
    </>
  )
}
