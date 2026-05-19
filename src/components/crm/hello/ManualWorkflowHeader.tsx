import { ArrowLeft } from "lucide-react"
import { Button } from "@/components/ui/button"

export type ManualWorkflowHeaderProps = {
  title: string
  onBack: () => void
}

/** Figma: back arrow + workflow title row. */
export function ManualWorkflowHeader({ title, onBack }: ManualWorkflowHeaderProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        onClick={onBack}
        className="h-8 w-8 shrink-0"
        aria-label="Go back"
      >
        <ArrowLeft className="h-4 w-4" />
      </Button>
      <h4 className="font-euclid text-[16px] font-semibold leading-[22px] text-[#36354c]">
        {title}
      </h4>
    </div>
  )
}
