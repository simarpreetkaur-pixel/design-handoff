import { ArrowRight, Lightbulb } from "lucide-react"
import type { CSSProperties } from "react"

const GRADIENT_FRAME_STYLE: CSSProperties = {
  padding: "2px",
  background:
    "linear-gradient(90deg, rgba(9, 48, 101, 0.6) 0%, rgba(19, 105, 235, 0.6) 27.5%, rgba(250, 197, 21, 0.6) 60%, rgba(134, 203, 60, 0.6) 100%)",
}

type AiGuideCardProps = {
  /** Bullet points shown below the header row (all inside the same bordered card) */
  bullets: string[]
  viewDetailsLabel?: string
  onViewDetails?: () => void
  /** Header label beside icon (default: “Tip:”). */
  sectionHeading?: string
  /** Default: light bulb; `ai_summary` uses bundled sparkle PNG. */
  headerIconVariant?: "default" | "ai_summary"
}

/**
 * Gradient card + bullets — same shell as “Confused about any step?” in `AgentActions`.
 * Default header is “Tip:” + light bulb; optional `sectionHeading` / `headerIconVariant` for AI Summary.
 */
export function AiGuideCard({
  bullets,
  viewDetailsLabel,
  onViewDetails,
  sectionHeading = "Tip:",
  headerIconVariant = "default",
}: AiGuideCardProps) {
  if (!bullets.length) {
    return null
  }

  return (
    <div
      className="relative w-full rounded-[8px]"
      style={GRADIENT_FRAME_STYLE}
    >
      <div className="overflow-hidden rounded-[6px] bg-white">
        <div className="flex w-full items-center justify-between gap-2 px-5 py-3.5">
          <div className="flex min-w-0 flex-1 items-center gap-1">
            {headerIconVariant === "ai_summary" ? (
              <img
                src="/icons/ai-summary-sparkle.png"
                alt=""
                className="h-5 w-5 shrink-0 object-contain"
                width={20}
                height={20}
                aria-hidden
              />
            ) : (
              <Lightbulb
                className="h-5 w-5 shrink-0 text-[#5b5675]"
                strokeWidth={1.75}
                aria-hidden
              />
            )}
            <p className="font-euclid text-[14px] font-normal leading-[20px] text-[#5b5675]">
              {sectionHeading}
            </p>
          </div>
          {viewDetailsLabel ? (
            <button
              type="button"
              onClick={onViewDetails}
              className="group ml-3 flex shrink-0 items-center gap-1 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30 rounded-sm"
            >
              <span className="font-euclid text-[12px] font-medium leading-[14px] tracking-[0.18px] text-[#7c47e1] uppercase">
                {viewDetailsLabel}
              </span>
              <ArrowRight
                className="h-4 w-4 text-[#7c47e1] transition-transform duration-300 group-hover:animate-arrow-bounce"
                aria-hidden
              />
            </button>
          ) : null}
        </div>

        <div className="border-t border-[#e7e7f0] px-5 pb-4 pt-3">
          <ul className="m-0 space-y-2 p-0">
            {bullets.map((bullet, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-[#5b5675]" />
                <p className="font-euclid text-[14px] font-normal leading-[20px] text-[#36354c]">
                  {bullet}
                </p>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  )
}
