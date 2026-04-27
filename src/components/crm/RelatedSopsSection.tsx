import { ArrowRight } from "lucide-react"

import type { JTBDType, RelatedSopRow } from "@/types/crm"

type RelatedSopsSectionProps = {
  rows: RelatedSopRow[]
  jtbdType: JTBDType
  onOpenSop: (detailActionKey: string) => void
  onAskInChat?: (message: string, jtbdType: JTBDType) => void
}

/**
 * “Related SOPs to this case” — UI aligned with Figma OMNI Post-Sales (node 8397:42211).
 * @see https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8397-42211
 */
export function RelatedSopsSection({ rows, jtbdType, onOpenSop, onAskInChat }: RelatedSopsSectionProps) {
  if (!rows.length) {
    return null
  }

  return (
    <div className="flex w-full flex-col gap-2" data-node-id="8397:42211">
      <div className="w-full font-euclid text-sm font-medium leading-5 text-[#040222]">
        <p>Related SOPs to this case</p>
      </div>

      <div className="flex w-full flex-col gap-3 rounded-xl border border-solid border-[#e7e7f0] bg-white px-4 py-3 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
        {rows.map((row) => (
          <div
            key={row.id}
            className="flex w-full items-center justify-between gap-3"
            data-node-id="8397:42239"
          >
            <button
              type="button"
              onClick={() => onOpenSop(row.detailActionKey)}
              className="min-w-0 flex-1 text-left font-euclid text-sm font-medium leading-5 text-[#5b5675] underline decoration-dotted underline-offset-2 transition-colors hover:text-[#040222]"
            >
              {row.label}
            </button>
            <button
              type="button"
              onClick={() => onAskInChat?.(row.askInChatPrefill, jtbdType)}
              className="group flex shrink-0 items-center gap-1 font-euclid text-xs font-medium leading-[14px] tracking-[0.18px] text-[#7c47e1] transition-colors hover:text-[#5920c5]"
            >
              Ask in the chat
              <ArrowRight
                className="h-4 w-4 text-[#7c47e1] transition-transform duration-300 group-hover:animate-arrow-bounce"
                aria-hidden
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
