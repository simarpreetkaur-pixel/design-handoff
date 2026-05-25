import { useMemo, useState } from "react"
import { AlertCircle, Check, ChevronDown, X } from "lucide-react"

import type { ClaimCalloutRow, ClaimStatus, JTBDType } from "@/types/crm"
import { cn } from "@/lib/utils"

interface ClaimStatusTimelineProps {
  steps: ClaimStatus[]
  /** Key/value rows under expanded step — claim-only per design */
  jtbdType?: JTBDType
}

type StepBadgeVariant = "completed" | "cancelled" | "current" | "none"

type DisplayStep = {
  step: ClaimStatus
  stepNumber: number
  originalIndex: number
  badge: { label: string; variant: StepBadgeVariant }
}

function resolveCalloutRows(step: ClaimStatus): ClaimCalloutRow[] {
  if (step.calloutRows?.length) return step.calloutRows
  if (step.calloutMeta?.label && step.calloutMeta?.value) {
    return [{ label: step.calloutMeta.label, value: step.calloutMeta.value, variant: "default" }]
  }
  return []
}

function resolveStepBadge(step: ClaimStatus): { label: string; variant: StepBadgeVariant } {
  if (step.state === "completed") {
    return { label: "Completed", variant: "completed" }
  }
  if (step.state === "pending") {
    return { label: "", variant: "none" }
  }
  const statusRow = step.calloutRows?.find((r) => r.label.trim().toLowerCase() === "status")
  if (statusRow?.variant === "error") {
    return { label: statusRow.value, variant: "cancelled" }
  }
  return { label: "In progress", variant: "current" }
}

function StepStatusBadge({ label, variant }: { label: string; variant: StepBadgeVariant }) {
  if (variant === "none" || !label) return null

  if (variant === "completed") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="flex size-4 items-center justify-center rounded-full bg-[#0fa457]/10">
          <Check className="size-3 text-[#0fa457]" strokeWidth={2.5} aria-hidden />
        </span>
        <span className="font-euclid text-sm font-medium leading-none text-[#0fa457]">{label}</span>
      </span>
    )
  }

  if (variant === "cancelled") {
    return (
      <span className="inline-flex items-center gap-1">
        <span className="flex size-4 items-center justify-center">
          <X className="size-4 text-[#e05752]" strokeWidth={2.5} aria-hidden />
        </span>
        <span className="font-euclid text-sm font-medium leading-none text-[#e05752]">{label}</span>
      </span>
    )
  }

  return (
    <span className="inline-flex items-center gap-1">
      <span className="size-2 rounded-full bg-[#f58700]" aria-hidden />
      <span className="font-euclid text-sm font-medium leading-none text-[#d16900]">{label}</span>
    </span>
  )
}

function ExpandedStepDetails({
  step,
  rows,
  showClaimCalloutRows,
}: {
  step: ClaimStatus
  rows: ClaimCalloutRow[]
  showClaimCalloutRows: boolean
}) {
  const lead = (step.warning ?? step.info ?? "").trim()
  const visibleRows = showClaimCalloutRows ? rows : []

  if (!lead && visibleRows.length === 0) {
    return (
      <div className="mt-6 rounded-xl bg-[#f8f7fc] p-5">
        {step.date ? (
          <div className="flex flex-col gap-1">
            <span className="font-euclid text-sm leading-5 text-[#5b5675]">Date</span>
            <span className="font-euclid text-sm font-medium leading-5 text-[#36354c]">{step.date}</span>
          </div>
        ) : (
          <p className="font-euclid text-sm leading-5 text-[#5b5675]">No additional details.</p>
        )}
      </div>
    )
  }

  return (
    <div className="mt-6 flex flex-col gap-5 rounded-xl bg-[#f8f7fc] p-5">
      {visibleRows.length > 0 ? (
        <div className="flex flex-wrap items-start gap-x-12 gap-y-5">
          {visibleRows.map((row, i) => (
            <div key={`${row.label}-${i}`} className="flex min-w-[120px] max-w-full flex-col gap-1 sm:min-w-[160px]">
              <span className="font-euclid text-sm leading-5 text-[#5b5675]">{row.label}</span>
              {row.variant === "error" ? (
                <span className="inline-flex items-center gap-1 font-euclid text-sm font-medium leading-5 text-[#e05752]">
                  <AlertCircle className="size-4 shrink-0" strokeWidth={2} aria-hidden />
                  {row.value}
                </span>
              ) : (
                <span className="font-euclid text-sm font-medium leading-5 text-[#36354c]">{row.value}</span>
              )}
            </div>
          ))}
        </div>
      ) : null}
      {lead ? (
        <div className="flex w-full flex-col gap-1">
          <span className="font-euclid text-sm leading-5 text-[#5b5675]">Note</span>
          <div className="rounded-md border border-[#e5e5e5] bg-white p-3">
            <p className="font-euclid text-sm leading-5 text-[#36354c]">{lead}</p>
          </div>
        </div>
      ) : null}
    </div>
  )
}

function WorkflowStepCard({
  display,
  isExpanded,
  onToggle,
  showClaimCalloutRows,
}: {
  display: DisplayStep
  isExpanded: boolean
  onToggle: () => void
  showClaimCalloutRows: boolean
}) {
  const { step, stepNumber, badge } = display
  const rows = resolveCalloutRows(step)
  const hasExpandableContent =
    Boolean((step.warning ?? step.info ?? "").trim()) ||
    rows.length > 0 ||
    step.state !== "pending"

  return (
    <div
      className="w-full rounded-xl border border-solid border-[#e7e7f0] px-4 py-4"
      data-figma-ref="9367:23013"
    >
      <div className="flex w-full items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <div className="flex size-8 shrink-0 items-center justify-center overflow-hidden rounded bg-[#5b5675]">
            <span className="font-euclid text-base font-medium leading-6 text-white">{stepNumber}</span>
          </div>
          <div className="flex min-w-0 flex-col gap-1.5">
            <div className="flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1">
              <p className="font-euclid text-sm font-medium leading-6 text-[#36354c]">{step.step}</p>
              <StepStatusBadge label={badge.label} variant={badge.variant} />
            </div>
            {step.date ? (
              <p className="font-euclid text-xs leading-[18px] text-[#5b5675]">{step.date}</p>
            ) : null}
          </div>
        </div>
        {hasExpandableContent ? (
          <button
            type="button"
            onClick={onToggle}
            className="flex size-6 shrink-0 items-center justify-center rounded-md text-[#5b5675] transition-colors hover:bg-[#f0f0f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? `Collapse ${step.step}` : `Expand ${step.step}`}
          >
            <ChevronDown
              className={cn("size-6 transition-transform", isExpanded && "rotate-180")}
              aria-hidden
            />
          </button>
        ) : (
          <span className="size-6 shrink-0" aria-hidden />
        )}
      </div>
      {isExpanded && hasExpandableContent ? (
        <ExpandedStepDetails step={step} rows={rows} showClaimCalloutRows={showClaimCalloutRows} />
      ) : null}
    </div>
  )
}

/** Figma OMNI Post-Sales — Claim status workflow cards (node 9367:22845). */
export function ClaimStatusTimeline({ steps, jtbdType = "claim" }: ClaimStatusTimelineProps) {
  const showClaimCalloutRows = jtbdType === "claim"

  const displaySteps = useMemo((): DisplayStep[] => {
    const total = steps.length
    return [...steps].reverse().map((step, displayIndex) => ({
      step,
      originalIndex: total - 1 - displayIndex,
      stepNumber: total - displayIndex,
      badge: resolveStepBadge(step),
    }))
  }, [steps])

  const defaultExpandedKey = useMemo(() => {
    const current = steps.findIndex((s) => s.state === "current")
    if (current >= 0) return current
    const lastCompleted = [...steps].reverse().findIndex((s) => s.state === "completed")
    if (lastCompleted >= 0) return steps.length - 1 - lastCompleted
    return steps.length > 0 ? steps.length - 1 : -1
  }, [steps])

  const [expandedKeys, setExpandedKeys] = useState<Set<number>>(() => {
    const initial = new Set<number>()
    if (defaultExpandedKey >= 0) initial.add(defaultExpandedKey)
    return initial
  })

  if (!steps.length) {
    return (
      <div className="w-full rounded-xl border border-[#e7e7f0] bg-white p-4">
        <p className="font-euclid text-sm text-[#5b5675]">No status steps to show.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6" data-figma-file="OMNI---Post-Sales" data-figma-node-id="9367:22845">
      {displaySteps.map((display) => {
        const { originalIndex } = display
        const isExpanded = expandedKeys.has(originalIndex)
        return (
          <WorkflowStepCard
            key={`${display.step.step}-${originalIndex}`}
            display={display}
            isExpanded={isExpanded}
            showClaimCalloutRows={showClaimCalloutRows}
            onToggle={() => {
              setExpandedKeys((prev) => {
                const next = new Set(prev)
                if (next.has(originalIndex)) next.delete(originalIndex)
                else next.add(originalIndex)
                return next
              })
            }}
          />
        )
      })}
    </div>
  )
}
