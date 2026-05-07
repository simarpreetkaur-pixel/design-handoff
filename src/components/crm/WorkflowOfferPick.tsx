import { useId, type ReactNode } from "react"

import { cn } from "@/lib/utils"

/**
 * Radio-style options inside a bot message — shared by Classic `AIChatPanel` and Hello view
 * so visual language and interaction match.
 */
export function WorkflowOfferPick({
  options,
  disabled,
  onPick,
}: {
  options: { key: string; label: ReactNode; userEchoLabel?: string }[]
  disabled: boolean
  onPick: (key: string, label: string) => void
}) {
  const groupName = useId()
  return (
    <fieldset disabled={disabled} className="m-0 space-y-2.5 border-0 p-0 pt-1">
      <legend className="sr-only">Choose how to continue</legend>
      {options.map((opt) => (
        <label
          key={opt.key}
          className={cn(
            "flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#e7e7f0] bg-[#fbfbfd] px-3 py-2.5 font-euclid text-[13px] leading-5 text-[#36354c] transition-colors duration-[400ms] ease-out",
            disabled && "cursor-not-allowed opacity-60",
          )}
        >
          <input
            type="radio"
            name={groupName}
            value={opt.key}
            className="mt-0.5 size-4 shrink-0 accent-[#7c47e1] transition-[color,box-shadow] duration-[400ms] ease-out"
            onChange={() => {
              if (disabled) return
              const echo =
                typeof opt.label === "string"
                  ? opt.label
                  : (opt.userEchoLabel ?? opt.key)
              onPick(opt.key, echo)
            }}
          />
          <span className="min-w-0 flex-1 [&_p]:m-0">{opt.label}</span>
        </label>
      ))}
    </fieldset>
  )
}
