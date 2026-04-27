import { Fragment } from "react"
import { Check, Info } from "lucide-react"

import type { ClaimStatus, JTBDType } from "@/types/crm"

interface ClaimStatusTimelineProps {
  steps: ClaimStatus[]
  /** Key/value row under yellow callout is claim-only per design */
  jtbdType?: JTBDType
}

/** 20px dots (2px smaller each side than 24px); rail passes behind. */
const DOT = "size-5 shrink-0 rounded-full shadow-[0_0_0_2px_white]"

function StepIcon({ state }: { state: ClaimStatus["state"] }) {
  if (state === "completed") {
    return (
      <div className={`flex ${DOT} items-center justify-center bg-[#489f63]`}>
        <Check className="h-3 w-3 text-white" strokeWidth={2.5} aria-hidden />
      </div>
    )
  }
  if (state === "current") {
    return (
      <div
        className={`box-border flex ${DOT} items-center justify-center border-4 border-[#fef7e6] bg-[#e68a2e]`}
        aria-hidden
      />
    )
  }
  return <div className={`${DOT} bg-[#e5e7eb]`} aria-hidden />
}

/** Yellow callout — Figma 8098:3752; width follows text column (indented from dots). */
function StatusCallout({
  text,
  meta,
  showKeyValueRow,
}: {
  text: string
  meta?: ClaimStatus["calloutMeta"]
  showKeyValueRow: boolean
}) {
  const kv = showKeyValueRow && meta?.label && meta?.value ? meta : null

  return (
    <div className="mt-1 w-full min-w-0">
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[#e7e7f0] bg-[#fff7e5]">
        <div className="flex flex-col gap-1">
          <div className="flex items-start gap-2 px-4 py-3">
            <Info className="mt-0.5 size-4 shrink-0 text-[#d16900]" aria-hidden />
            <p className="min-w-0 font-euclid text-[14px] font-medium leading-5 break-words text-[#d16900]">{text}</p>
          </div>
          {kv ? (
            <>
              <div className="h-px w-full bg-[#e7e7f0]" />
              <div className="flex items-center justify-between gap-3 px-4 py-2">
                <span className="font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">{kv.label}</span>
                <span className="min-w-0 text-right font-euclid text-[14px] font-medium leading-5 text-[#36354c]">
                  {kv.value}
                </span>
              </div>
            </>
          ) : null}
        </div>
      </div>
    </div>
  )
}

export function ClaimStatusTimeline({ steps, jtbdType = "claim" }: ClaimStatusTimelineProps) {
  const showClaimCalloutMeta = jtbdType === "claim"

  if (!steps.length) {
    return (
      <div className="w-full rounded-xl border border-[#e7e7f0] bg-white p-4">
        <p className="font-euclid text-[14px] text-[#5b5675]">No status steps to show.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="relative w-full rounded-xl border border-[#e7e7f0] bg-white p-4">
        {/*
          Grid col1 = 20px track: rail centered (left-1/2 -translate-x-1/2) through dot centers.
          Col2 = titles + callout (same left edge).
        */}
        <div className="relative min-w-0">
          <div
            className="pointer-events-none absolute left-0 top-5 bottom-5 z-0 w-5"
            aria-hidden
          >
            <div className="absolute inset-y-0 left-1/2 w-0 -translate-x-1/2 border-l-2 border-dashed border-[#e2e4e9]" />
          </div>

          <div className="relative z-[1] grid min-w-0 grid-cols-[20px_minmax(0,1fr)] gap-x-2 gap-y-0">
            {steps.map((step, i) => (
              <Fragment key={`${step.step}-${i}`}>
                <div className="relative z-10 flex flex-col items-center justify-start pt-1">
                  <StepIcon state={step.state} />
                </div>
                <div className="min-w-0 pb-2">
                  <div className="flex w-full items-start justify-between gap-3 py-1.5">
                    <p
                      className={`min-w-0 font-euclid text-[14px] leading-5 ${
                        step.state === "current" ? "font-medium text-[#36354c]" : "font-normal text-[#36354c]"
                      }`}
                    >
                      {step.step}
                    </p>
                    {step.date ? (
                      <span className="shrink-0 font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">
                        {step.date}
                      </span>
                    ) : null}
                  </div>

                  {step.state === "current" && step.warning ? (
                    <StatusCallout
                      text={step.warning}
                      meta={step.calloutMeta}
                      showKeyValueRow={showClaimCalloutMeta}
                    />
                  ) : null}

                  {step.state === "current" && step.info ? (
                    <StatusCallout text={step.info} meta={step.calloutMeta} showKeyValueRow={showClaimCalloutMeta} />
                  ) : null}
                </div>

                {i < steps.length - 1 ? (
                  <div className="col-span-2 h-2 shrink-0" aria-hidden />
                ) : null}
              </Fragment>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
