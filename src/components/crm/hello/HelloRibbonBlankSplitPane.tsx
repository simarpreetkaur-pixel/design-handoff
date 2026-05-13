import { X } from "lucide-react"

import { helloWorkflowPaneShellClass } from "@/components/crm/hello/HelloChatPrimitives"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

export type HelloRibbonBlankSplitPaneProps = {
  title: string
  subtitle?: string | null
  onCancel: () => void
  className?: string
}

/**
 * Placeholder right pane for Hello profile ribbon shortcuts (non-policy CRM records, or stub flows).
 */
export function HelloRibbonBlankSplitPane({ title, subtitle, onCancel, className }: HelloRibbonBlankSplitPaneProps) {
  return (
    <div
      className={cn(
        "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
        helloWorkflowPaneShellClass,
        className,
      )}
      role="region"
      aria-label={title}
    >
      <div className="flex shrink-0 items-center justify-end gap-2 border-b border-[#e7e7f0] bg-white px-4 py-3 lg:px-5">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-9 shrink-0 gap-1.5 font-euclid text-[13px] text-[#5b5675] hover:bg-[#f4f4f6] hover:text-[#040222]"
          onClick={onCancel}
        >
          <X className="size-4" aria-hidden />
          Cancel
        </Button>
      </div>
      <div className="flex min-h-0 flex-1 flex-col items-center justify-center gap-2 bg-[#fafafa] p-8">
        <p className="text-center font-euclid text-[15px] font-semibold leading-6 text-[#040222]">{title}</p>
        {subtitle ? (
          <p className="max-w-md text-center font-euclid text-[13px] leading-5 text-[#5b5675]">{subtitle}</p>
        ) : (
          <p className="max-w-md text-center font-euclid text-[13px] leading-5 text-[#5b5675]">
            Workspace preview — full content will load here.
          </p>
        )}
      </div>
    </div>
  )
}
