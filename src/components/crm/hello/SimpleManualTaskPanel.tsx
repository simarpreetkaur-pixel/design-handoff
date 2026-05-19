import { ManualWorkflowHeader } from "@/components/crm/hello/ManualWorkflowHeader"
import { Button } from "@/components/ui/button"

export type SimpleManualTaskPanelProps = {
  title: string
  description: string
  fields?: { label: string; placeholder: string; type?: "text" | "textarea" }[]
  submitLabel?: string
  onBack: () => void
  onSubmit?: () => void
}

/** Placeholder manual flows for tasks without full Figma step screens yet. */
export function SimpleManualTaskPanel({
  title,
  description,
  fields = [],
  submitLabel = "Submit",
  onBack,
  onSubmit,
}: SimpleManualTaskPanelProps) {
  return (
    <div className="space-y-4">
      <ManualWorkflowHeader title={title} onBack={onBack} />
      <div className="rounded-[12px] border border-[#e7e7f0] bg-white p-6">
        <p className="mb-4 font-euclid text-[14px] text-[#5b5675]">{description}</p>
        <div className="flex flex-col gap-4">
          {fields.map((field) => (
            <div key={field.label} className="flex flex-col gap-2">
              <label className="font-euclid text-[14px] font-medium text-[#36354c]">
                {field.label}
              </label>
              {field.type === "textarea" ? (
                <textarea
                  placeholder={field.placeholder}
                  rows={3}
                  className="w-full rounded-md border border-[#e5e5e5] px-3 py-2 font-euclid text-[14px] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
                />
              ) : (
                <input
                  type="text"
                  placeholder={field.placeholder}
                  className="h-12 w-full rounded-md border border-[#e5e5e5] px-3 font-euclid text-[14px] outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]"
                />
              )}
            </div>
          ))}
        </div>
        <Button
          type="button"
          className="mt-6 w-full bg-[#0fa457] font-euclid font-semibold text-white hover:bg-[#0d8a4a]"
          onClick={onSubmit}
        >
          {submitLabel}
        </Button>
      </div>
    </div>
  )
}
