import type { RelatedSopRow } from "@/types/crm"

type RelatedSopsSectionProps = {
  rows: RelatedSopRow[]
  onOpenSop: (detailActionKey: string) => void
}

/**
 * “Related SOPs to this case” — UI aligned with Figma OMNI Post-Sales (node 8397:42211).
 * @see https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8397-42211
 */
export function RelatedSopsSection({ rows, onOpenSop }: RelatedSopsSectionProps) {
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
            className="flex w-full items-center gap-3"
            data-node-id="8397:42239"
          >
            <button
              type="button"
              onClick={() => onOpenSop(row.detailActionKey)}
              className="min-w-0 w-full text-left font-euclid text-sm font-medium leading-5 text-[#5b5675] underline decoration-dotted underline-offset-2 transition-colors hover:text-[#040222]"
            >
              {row.label}
            </button>
          </div>
        ))}
      </div>
    </div>
  )
}
