import { useState } from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Data ─────────────────────────────────────────────────────────────────────

export interface SimilarCase {
  caseId: string
  date: string
  title: string
  insight: string
  resolution: string
}

export const GARAGE_SIMILAR_CASES: SimilarCase[] = [
  {
    caseId: "CASE-48291",
    date: "12 May 2026",
    title: "Customer unable to select network garage",
    insight:
      "Most customers miss the \u201cI want a different garage\u201d link below the Proceed button on the garage selection screen.",
    resolution:
      "On the garage screen, scroll down below the Proceed button \u2014 there\u2019s a link that says \u201cI want a different garage\u201d. Tap that to see all available garages.",
  },
  {
    caseId: "CASE-51034",
    date: "18 May 2026",
    title: "No garages showing near customer\u2019s area",
    insight:
      "This usually happens when the PIN code entered is incorrect or the radius is set too narrow. Increasing the radius or correcting the PIN typically shows more options.",
    resolution:
      "Check the PIN code entered on the garage screen and try increasing the search radius. If that doesn\u2019t help, share a list of nearby garages.",
  },
  {
    caseId: "CASE-49877",
    date: "20 May 2026",
    title: "Page stuck on garage selection screen",
    insight:
      "This is usually caused by a slow connection or a one-time app glitch. A force-close and reopen almost always fixes it.",
    resolution:
      "Ask the customer to close the ACKO app completely, reopen it, and go back to the claim \u2014 the garage selection screen should load normally.",
  },
]

// ─── Card ─────────────────────────────────────────────────────────────────────

function SimilarCaseCard({ c, index }: { c: SimilarCase; index: number }) {
  const [expanded, setExpanded] = useState(false)

  return (
    <div className="flex flex-col rounded-xl border border-[#e7e7f0] bg-white overflow-hidden">
      {/* Header row – always visible, click to toggle */}
      <button
        type="button"
        onClick={() => setExpanded((v) => !v)}
        className="flex items-center justify-between gap-2 p-4 text-left"
      >
        <div className="flex min-w-0 flex-col gap-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="rounded-md bg-[#f0f0f6] px-2 py-0.5 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
              Case {index + 1}
            </span>
          </div>
          <p className="font-euclid text-[13px] font-semibold leading-5 text-[#040222]">
            {c.title}
          </p>
        </div>
        <ChevronDown
          className={cn(
            "shrink-0 text-[#9c9aaf] transition-transform duration-200",
            expanded && "rotate-180"
          )}
          size={16}
        />
      </button>

      {/* Collapsible body */}
      {expanded && (
        <div className="flex flex-col gap-3 border-t border-[#e7e7f0] px-4 pb-4 pt-3">
          {/* Insight */}
          <div className="flex flex-col gap-1">
            <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#9c9aaf]">
              Summary
            </p>
            <p className="font-euclid text-[13px] leading-[20px] text-[#5b5675]">
              {c.insight}
            </p>
          </div>

          {/* Resolution */}
          <div className="flex flex-col gap-1">
            <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#9c9aaf]">
              Resolution
            </p>
            <p className="font-euclid text-[13px] leading-[20px] text-[#36354c]">
              {c.resolution}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export interface SimilarCasesPanelProps {
  cases?: SimilarCase[]
  className?: string
}

export function SimilarCasesPanel({
  cases = GARAGE_SIMILAR_CASES,
  className,
}: SimilarCasesPanelProps) {
  return (
    <div className={cn("flex flex-col gap-4 font-euclid", className)}>
      {/* Header */}
      <div className="flex flex-col gap-1">
        <h3 className="font-euclid text-[14px] font-semibold leading-5 text-[#040222]">
          Similar Cases
        </h3>
        <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
          Past resolutions that may help with this call.
        </p>
      </div>

      {/* Cards */}
      {cases.map((c, i) => (
        <SimilarCaseCard key={c.caseId} c={c} index={i} />
      ))}
    </div>
  )
}
