import { cn } from "@/lib/utils"

/** Figma OMNI Post-Sales node `9158:23116` — floating pill above the Hello chat stream. */
export function HelloViewPreviousActivityButton({
  onClick,
  className,
}: {
  onClick: () => void
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-[28px] border-2 border-[#e7e7f0] bg-white px-[14px] py-2",
        "font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]",
        "shadow-[0px_6px_12px_-2px_rgba(54,53,76,0.08)]",
        "transition-colors hover:border-[#d8d8e8] hover:bg-[#fafafa]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30",
        className,
      )}
      data-figma-node-id="9158-23116"
    >
      View previous activity
    </button>
  )
}
