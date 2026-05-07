import { useState } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  CarFront,
  Check,
  ChevronRight,
  CloudRain,
  Package,
  ShieldAlert,
} from "lucide-react"

import type { Policy } from "@/types/crm"
import { Button } from "@/components/ui/button"
import {
  RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE,
  RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE,
} from "@/lib/raiseClaimGuidanceCopy"
import { cn } from "@/lib/utils"

const RAISE_CLAIM_SCENARIO_OPTIONS: {
  id: string
  title: string
  description?: string
  Icon: LucideIcon
}[] = [
  {
    id: "accident",
    title: "My car was damaged in an accident",
    description: "I hit another vehicle, a person, or an object.",
    Icon: CarFront,
  },
  {
    id: "no_accident",
    title: "My car is damaged, but there was no accident",
    description: "My car is damaged from parking mishaps, falling objects, etc.",
    Icon: CloudRain,
  },
  {
    id: "theft_vehicle",
    title: "My car has been stolen",
    description: "My car is missing and I want to report it.",
    Icon: ShieldAlert,
  },
  {
    id: "parts",
    title: "My car parts or accessories were stolen/damaged/lost",
    Icon: Package,
  },
]

export type RaiseFnolPanelVariant = "page" | "embedded"

export function RaiseFnolPanel({
  policy,
  onBack,
  variant = "page",
  onClaimSubmitted,
}: {
  policy: Policy
  onBack?: () => void
  variant?: RaiseFnolPanelVariant
  /** Hello workflow: fired once when the user submits FNOL (“Raise a claim”). */
  onClaimSubmitted?: () => void
}) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [mobileClaimSubmitted, setMobileClaimSubmitted] = useState(false)

  const planLine = [policy.name, policy.vehicle].filter(Boolean).join(" · ")
  const embedded = variant === "embedded"

  const successBlock = (
    <div
      className="flex flex-col items-center gap-4 px-1 pb-2 pt-6 text-center"
      role="status"
      aria-live="polite"
    >
      <div
        className="flex size-[52px] shrink-0 animate-raise-claim-tick-pop items-center justify-center rounded-full bg-[#dcfce7] ring-[6px] ring-[#bbf7d0]"
        aria-hidden
      >
        <Check className="size-7 text-[#15803d]" strokeWidth={2.75} />
      </div>
      <div className="animate-raise-claim-msg-fade space-y-2.5">
        <p className="font-euclid text-[13px] font-semibold leading-5 text-[#166534]">
          {RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE}
        </p>
        <p className="font-euclid text-[12px] font-medium leading-5 text-[#36354c]">
          {RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE}
        </p>
      </div>
    </div>
  )

  const scenarioBlock = (
    <>
      <h3 className="font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
        Tell us what happened
      </h3>

      <div className="flex flex-col gap-2.5">
        {RAISE_CLAIM_SCENARIO_OPTIONS.map((opt) => {
          const Icon = opt.Icon
          const selected = selectedScenarioId === opt.id
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => setSelectedScenarioId(opt.id)}
              className={cn(
                "flex w-full items-stretch gap-2.5 rounded-xl border bg-white p-3 text-left shadow-[0px_1px_3px_rgba(54,53,76,0.06)] transition-colors",
                selected
                  ? "border-[#7c47e1] ring-1 ring-[#7c47e1]/25"
                  : "border-[#e7e7f0] hover:border-[#d1d5db]",
              )}
            >
              <div className="flex size-10 shrink-0 items-center justify-center self-center rounded-lg bg-[#f4f4f6]">
                <Icon className="size-5 text-[#5b5675]" aria-hidden />
              </div>
              <div className="min-w-0 flex-1 self-center">
                <p className="font-euclid text-[13px] font-semibold leading-[18px] text-[#040222]">
                  {opt.title}
                </p>
                {opt.description ? (
                  <p className="mt-0.5 font-euclid text-[11px] font-normal leading-4 text-[#6c6c80]">
                    {opt.description}
                  </p>
                ) : null}
              </div>
              <ChevronRight
                className="size-4 shrink-0 self-center text-[#36354c] opacity-80"
                aria-hidden
              />
            </button>
          )
        })}
      </div>

      <Button
        type="button"
        disabled={!selectedScenarioId}
        onClick={() => {
          setMobileClaimSubmitted(true)
          onClaimSubmitted?.()
        }}
        className="h-11 w-full rounded-xl bg-[#7c47e1] font-euclid text-[14px] font-semibold text-white shadow-[0px_2px_8px_rgba(92,50,201,0.2)] hover:bg-[#6b3ccd] disabled:bg-[#e7e7f0] disabled:text-[#9c9aaf] disabled:shadow-none"
      >
        Raise a claim
      </Button>
    </>
  )

  if (embedded) {
    return (
      <div className="flex min-h-0 w-full flex-col">
        <div className="flex w-full justify-center">
          <div className="box-content w-full max-w-[907px] rounded-[15px] border-[0.5px] border-[#e0e0e8] bg-[#f8f7fd] px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto flex w-full max-w-[300px] flex-col items-center">
              <div className="relative w-full overflow-hidden rounded-[28px] border-2 border-[#e7e7f0] bg-[#f4f4f6] p-2 shadow-[0px_12px_40px_rgba(28,11,62,0.12)]">
                <div className="max-h-[min(70vh,640px)] overflow-y-auto rounded-[22px] bg-white lg:max-h-[min(72vh,680px)]">
                  <div className="flex flex-col gap-4 p-4 pb-6">
                    <div className="flex shrink-0 flex-col gap-0.5 border-b border-[#e7e7f0] pb-3">
                      <h2 className="min-w-0 font-euclid text-[15px] font-semibold leading-6 text-[#040222]">
                        Raise a claim
                      </h2>
                      {planLine ? (
                        <p className="font-euclid text-[13px] font-medium leading-5 text-[#5b5675]">
                          {planLine}
                        </p>
                      ) : null}
                    </div>
                    {mobileClaimSubmitted ? successBlock : scenarioBlock}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col bg-white">
      <div className="flex shrink-0 flex-col gap-1 border-b border-[#e7e7f0] px-5 py-4">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
          ) : null}
          <h2
            className={cn(
              "min-w-0 font-euclid text-[16px] font-medium leading-6 text-[#040222]",
              onBack ? "" : "",
            )}
          >
            Raise a claim
          </h2>
        </div>
        {planLine ? (
          <p
            className={cn(
              "font-euclid text-[14px] font-medium leading-5 text-[#5b5675]",
              onBack ? "pl-12" : "",
            )}
          >
            {planLine}
          </p>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        <div className="flex w-full justify-center">
          <div className="w-full max-w-[907px] rounded-[15px] border-[0.5px] border-[#e0e0e8] bg-[#f8f7fd] px-6 py-8 sm:px-9 sm:py-8">
            <div className="mx-auto flex w-full max-w-[300px] flex-col items-center">
              <div className="relative w-full overflow-hidden rounded-[28px] border-2 border-[#e7e7f0] bg-[#f4f4f6] p-2 shadow-[0px_12px_40px_rgba(28,11,62,0.12)]">
                <div className="max-h-[min(72vh,640px)] overflow-y-auto rounded-[22px] bg-white">
                  <div className="flex flex-col gap-4 p-4 pb-6">
                    {mobileClaimSubmitted ? successBlock : scenarioBlock}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
