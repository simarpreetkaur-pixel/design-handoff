import { type RefObject, useCallback, useEffect, useRef, useState } from "react"
import { Check, X } from "lucide-react"

import { cn, scrollElementWithinContainer } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Customer, Policy } from "@/types/crm"
import { RaiseFnolPanel } from "@/components/crm/RaiseFnolPanel"
import { RequestRcCopyForm } from "@/components/crm/RequestRcCopyForm"
import { RequestRcWorkflowFollowup } from "@/components/crm/RequestRcWorkflowFollowup"
import { useRequestRcWorkflowStep } from "@/components/crm/useRequestRcWorkflowStep"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import {
  helloWorkflowPaneTitle,
  helloWorkflowStepRaiseClaim,
  helloWorkflowStepRaiseClaimLockedHint,
  helloWorkflowStepRequestRc,
  helloWorkflowStepRequestRcCollapsedSummary,
} from "@/components/crm/hello/helloRaiseClaimCopy"

export type RaiseClaimWorkflowPanelProps = {
  customer: Customer
  policy: Policy
  /** Scroll parent for step focus — avoids `scrollIntoView` scrolling the whole page. */
  scrollContainerRef?: RefObject<HTMLElement | null>
  /** After RC request is dispatched (demo). Fires on Send, not on document approval. */
  onRcEmailSent?: () => void
  /** Collapses the split workflow pane (Hello view). */
  onClose?: () => void
  /** FNOL submitted in Raise claim step — Hello view collapses split and posts chat success. */
  onFnolComplete?: () => void
}

type WorkflowPhase = "step1_rc" | "step2_fnol"

const STEP_REQUEST_RC = "request-rc"
const STEP_RAISE_CLAIM = "raise-claim"

/** Let accordion height settle before scrolling active step into view. */
const WORKFLOW_STEP_SCROLL_INTO_VIEW_MS = 220

function phaseToOpenStep(phase: WorkflowPhase): string {
  switch (phase) {
    case "step1_rc":
      return STEP_REQUEST_RC
    case "step2_fnol":
      return STEP_RAISE_CLAIM
  }
}

function vehicleLabel(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return v
  const n = policy.name?.trim()
  if (n) return n
  const p = policy.planDisplayName?.trim()
  if (p) return p
  return policy.type || "Vehicle"
}

export function RaiseClaimWorkflowPanel({
  customer,
  policy,
  scrollContainerRef,
  onRcEmailSent,
  onClose,
  onFnolComplete,
}: RaiseClaimWorkflowPanelProps) {
  const [phase, setPhase] = useState<WorkflowPhase>("step1_rc")

  const [openStep, setOpenStep] = useState<string>(() => phaseToOpenStep("step1_rc"))

  const onRequestDispatched = useCallback(() => {
    onRcEmailSent?.()
  }, [onRcEmailSent])

  const onDocumentsApproved = useCallback(() => {
    setPhase("step2_fnol")
  }, [])

  const rc = useRequestRcWorkflowStep({
    onRequestDispatched,
    onDocumentsApproved,
  })

  const itemRequestRcRef = useRef<HTMLDivElement>(null)
  const itemRaiseClaimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpenStep(phaseToOpenStep(phase))
  }, [phase])

  const step1Done = rc.documentsApproved
  /** Step 2 is always visible so CX sees what comes next; interaction waits until documents are approved. */
  const step2Locked = !step1Done
  /** Collapsed header for step 1 while Raise claim is active. */
  const compactPriorSteps = phase === "step2_fnol"

  /** Keep the open step’s header at the top of the workflow scroll container only (not the page). */
  useEffect(() => {
    const container = scrollContainerRef?.current
    const refs: Record<string, RefObject<HTMLDivElement | null>> = {
      [STEP_REQUEST_RC]: itemRequestRcRef,
      [STEP_RAISE_CLAIM]: itemRaiseClaimRef,
    }
    const target = refs[openStep]?.current
    if (!container || !target) return
    const id = window.setTimeout(() => {
      scrollElementWithinContainer(container, target, {
        behavior: "smooth",
        topPadding: 6,
      })
    }, WORKFLOW_STEP_SCROLL_INTO_VIEW_MS)
    return () => window.clearTimeout(id)
  }, [openStep, phase, scrollContainerRef])

  return (
    <div className="flex min-h-0 w-full flex-col gap-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
          {helloWorkflowPaneTitle(vehicleLabel(policy))}
        </h2>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-[#5b5675] hover:bg-[#f5f3fc] hover:text-[#36354c]"
            onClick={onClose}
            aria-label="Close workflow panel"
          >
            <X className="size-4" strokeWidth={2} />
          </Button>
        ) : null}
      </div>

      <Accordion
        type="single"
        value={openStep}
        onValueChange={(v) => {
          if (v) setOpenStep(v)
        }}
        className={cn(
          "flex min-h-0 flex-col",
          compactPriorSteps ? "gap-1" : "gap-2",
        )}
        aria-label="Raise claim workflow steps"
      >
        {/* Step 1 — bordered card (default AccordionItem chrome) */}
        <AccordionItem ref={itemRequestRcRef} value={STEP_REQUEST_RC} className="scroll-mt-3">
          <AccordionTrigger
            className={cn(
              openStep === STEP_REQUEST_RC ? "py-3" : "py-2 min-h-0",
              compactPriorSteps && openStep !== STEP_REQUEST_RC && "py-1.5",
            )}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-euclid text-[13px] font-semibold",
                step1Done
                  ? "bg-[#0fa457] text-white"
                  : phase === "step1_rc"
                    ? "bg-[#7c47e1] text-white"
                    : "border border-[#e7e7f0] bg-white text-[#5b5675]",
              )}
              aria-hidden
            >
              {step1Done ? <Check className="size-4" strokeWidth={2.5} /> : "1"}
            </span>
            <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
              <span className="font-euclid text-[14px] font-semibold leading-6 text-[#040222]">
                {helloWorkflowStepRequestRc}
              </span>
              {step1Done && openStep === STEP_REQUEST_RC ? (
                <span className="font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                  {helloWorkflowStepRequestRcCollapsedSummary}
                </span>
              ) : null}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-0">
            <RequestRcCopyForm
              compact
              defaultToEmail={customer.email}
              defaultToPhone={customer.phone}
              footerTone="muted"
              disabled={rc.formDisabled}
              onSubmit={rc.dispatchRequest}
            />
            <RequestRcWorkflowFollowup phase={rc.followupPhase} onApprove={rc.approveDocuments} />
          </AccordionContent>
        </AccordionItem>

        {/* Step 2 — always visible; locked until step 1 completes */}
        <AccordionItem
          ref={itemRaiseClaimRef}
          value={STEP_RAISE_CLAIM}
          className="scroll-mt-3"
          disabled={step2Locked}
        >
          <AccordionTrigger
            className={cn("py-3", step2Locked && "cursor-not-allowed opacity-90 hover:bg-transparent")}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-euclid text-[13px] font-semibold",
                step2Locked
                  ? "border border-[#e7e7f0] bg-[#fafafa] text-[#9c9aaf]"
                  : "bg-[#7c47e1] text-white",
              )}
              aria-hidden
            >
              2
            </span>
            <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
              <span className="font-euclid text-[14px] font-semibold leading-6 text-[#040222]">
                {helloWorkflowStepRaiseClaim}
              </span>
              {step2Locked ? (
                <span className="font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                  {helloWorkflowStepRaiseClaimLockedHint}
                </span>
              ) : null}
            </span>
          </AccordionTrigger>
          <AccordionContent className="min-h-0 pt-1">
            <div className="min-h-0 w-full overflow-hidden rounded-lg bg-transparent">
              <RaiseFnolPanel
                policy={policy}
                variant="embedded"
                onClaimSubmitted={onFnolComplete}
              />
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
