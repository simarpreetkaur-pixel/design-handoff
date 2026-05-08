import { Fragment } from "react"
import { AlertCircle, Check, Info } from "lucide-react"

import type { ClaimCalloutRow, ClaimStatus, JTBDType } from "@/types/crm"
import { cn } from "@/lib/utils"

interface ClaimStatusTimelineProps {
  steps: ClaimStatus[]
  /** Key/value row under yellow callout is claim-only per design */
  jtbdType?: JTBDType
}

/** 24px dots — Figma Claim Status timeline */
const DOT = "size-6 shrink-0 rounded-full shadow-[0_0_0_2px_white]"

function StepIcon({ state }: { state: ClaimStatus["state"] }) {
  if (state === "completed") {
    return (
      <div className={`flex ${DOT} items-center justify-center bg-[#0fa457]`}>
        <Check className="h-3.5 w-3.5 text-white" strokeWidth={2.5} aria-hidden />
      </div>
    )
  }
  if (state === "current") {
    return (
      <div
        className={`box-border flex ${DOT} items-center justify-center border-4 border-[#fff7e5] bg-[#f58700]`}
        aria-hidden
      />
    )
  }
  return <div className={`${DOT} bg-[#e5e7eb]`} aria-hidden />
}

function resolveCalloutRows(step: ClaimStatus): ClaimCalloutRow[] {
  if (step.calloutRows?.length) return step.calloutRows
  if (step.calloutMeta?.label && step.calloutMeta?.value) {
    return [{ label: step.calloutMeta.label, value: step.calloutMeta.value, variant: "default" }]
  }
  return []
}

/** Yellow detail card — Figma OMNI Post-Sales Claim Status (survey rows + optional error status). */
function StatusCallout({
  leadText,
  rows,
  showRows,
}: {
  leadText?: string
  rows: ClaimCalloutRow[]
  showRows: boolean
}) {
  const lead = leadText?.trim()
  const visibleRows = showRows ? rows : []

  if (!lead && visibleRows.length === 0) return null

  return (
    <div className="mt-1 w-full min-w-0 pl-2.5 sm:pl-[10px]">
      <div className="w-full min-w-0 overflow-hidden rounded-xl border border-[#e7e7f0] bg-[#fff7e5]">
        <div className="flex flex-col gap-1 py-3">
          {lead ? (
            <div className="flex items-start gap-2 px-4 pb-1 pt-0">
              <Info className="mt-0.5 size-4 shrink-0 text-[#d16900]" aria-hidden />
              <p className="min-w-0 font-euclid text-[14px] font-medium leading-5 break-words text-[#d16900]">
                {lead}
              </p>
            </div>
          ) : null}
          {visibleRows.map((row, i) => (
            <Fragment key={`${row.label}-${i}`}>
              {lead || i > 0 ? <div className="h-px w-full bg-[#e7e7f0]" /> : null}
              <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1 px-4 py-1.5 font-euclid text-[14px] leading-5">
                <span className="min-w-0 max-w-[min(100%,12rem)] shrink font-normal break-words text-[#5b5675]">
                  {row.label}
                </span>
                {row.variant === "error" ? (
                  <span className="flex min-w-0 max-w-full flex-1 basis-[8rem] items-center justify-end gap-0.5 font-medium text-[#d83d37] sm:flex-none sm:basis-auto">
                    <AlertCircle className="size-6 shrink-0" strokeWidth={2} aria-hidden />
                    <span className="min-w-0 break-words text-right">{row.value}</span>
                  </span>
                ) : (
                  <span className="min-w-0 max-w-full flex-1 basis-[10rem] break-words text-right font-medium text-[#36354c] sm:flex-none sm:basis-auto">
                    {row.value}
                  </span>
                )}
              </div>
            </Fragment>
          ))}
        </div>
      </div>
    </div>
  )
}

export function ClaimStatusTimeline({ steps, jtbdType = "claim" }: ClaimStatusTimelineProps) {
  const showClaimCalloutRows = jtbdType === "claim"

  if (!steps.length) {
    return (
      <div className="w-full rounded-xl border border-[#e7e7f0] bg-white p-4">
        <p className="font-euclid text-[14px] text-[#5b5675]">No status steps to show.</p>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="relative w-full rounded-2xl bg-white p-4">
        <div className="relative min-w-0">
          <div
            className="pointer-events-none absolute left-0 top-6 bottom-6 z-0 w-6"
            aria-hidden
          >
            <div className="absolute inset-y-0 left-1/2 w-0 -translate-x-1/2 border-l-2 border-dashed border-[#e2e4e9]" />
          </div>

          <div className="relative z-[1] grid min-w-0 grid-cols-[24px_minmax(0,1fr)] gap-x-2 gap-y-0">
            {steps.map((step, i) => {
              const rows = resolveCalloutRows(step)
              const leadText = step.warning ?? step.info ?? ""
              const showCallout =
                step.state === "current" && (Boolean(leadText.trim()) || rows.length > 0)

              return (
                <Fragment key={`${step.step}-${i}`}>
                  <div className="relative z-10 flex flex-col items-center justify-start pt-0.5">
                    <StepIcon state={step.state} />
                  </div>
                  <div className="min-w-0 pb-3">
                    <div className="flex min-w-0 flex-wrap items-start justify-between gap-x-3 gap-y-1 py-1.5">
                      <p
                        className={cn(
                          "min-w-0 max-w-full font-euclid text-[14px] leading-5 break-words",
                          step.state === "current" && "font-medium text-[#36354c]",
                          step.state === "completed" && "font-normal text-[#36354c]",
                          step.state === "pending" && "font-normal text-[#5b5675]",
                        )}
                      >
                        {step.step}
                      </p>
                      {step.date ? (
                        <span className="max-w-full shrink-0 font-euclid text-[14px] font-normal leading-5 break-words text-[#5b5675]">
                          {step.date}
                        </span>
                      ) : null}
                    </div>

                    {showCallout ? (
                      <StatusCallout
                        leadText={leadText}
                        rows={rows}
                        showRows={showClaimCalloutRows}
                      />
                    ) : null}
                  </div>

                  {i < steps.length - 1 ? (
                    <div className="col-span-2 h-2 shrink-0" aria-hidden />
                  ) : null}
                </Fragment>
              )
            })}
          </div>
        </div>
      </div>
    </div>
  )
}
