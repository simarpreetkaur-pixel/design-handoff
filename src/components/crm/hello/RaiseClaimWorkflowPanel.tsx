import { type RefObject, useCallback, useEffect, useRef, useState } from "react"
import { Check, X } from "lucide-react"

import { cn, scrollElementWithinContainer } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import type { Customer, Policy } from "@/types/crm"
import { RaiseFnolPanel } from "@/components/crm/RaiseFnolPanel"
import {
  REQUEST_DOCUMENTS_STEP_ID,
  RequestDocumentsAccordionStep,
  useRequestDocumentsWorkflow,
} from "@/components/crm/hello/RequestDocumentsAccordionStep"
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
  /**
   * When false, omits the inner title + close row — use when a parent shell already shows
   * the workflow title and dismiss control (e.g. Live listening split header).
   */
  showPanelHeader?: boolean
  /** When true, shows completed workflow steps in read-only mode (no editing allowed) */
  isCompleted?: boolean
}

type WorkflowPhase = "step1_documents" | "step2_fnol"

const STEP_RAISE_CLAIM = "raise-claim"

/** Let accordion height settle before scrolling active step into view. */
const WORKFLOW_STEP_SCROLL_INTO_VIEW_MS = 220

function phaseToOpenStep(phase: WorkflowPhase): string {
  switch (phase) {
    case "step1_documents":
      return REQUEST_DOCUMENTS_STEP_ID
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
  showPanelHeader = true,
  isCompleted = false,
}: RaiseClaimWorkflowPanelProps) {
  const [phase, setPhase] = useState<WorkflowPhase>(isCompleted ? "step2_fnol" : "step1_documents")

  const [openStep, setOpenStep] = useState<string>(() => 
    isCompleted ? REQUEST_DOCUMENTS_STEP_ID : phaseToOpenStep("step1_documents")
  )

  const onDocumentsRequestDispatched = useCallback(() => {
    onRcEmailSent?.() // Still call this for backwards compatibility
  }, [onRcEmailSent])

  const onDocumentsApproved = useCallback(() => {
    setPhase("step2_fnol")
  }, [])

  const documents = useRequestDocumentsWorkflow({
    onRequestDispatched: onDocumentsRequestDispatched,
    onDocumentsApproved,
  })

  const itemRequestDocumentsRef = useRef<HTMLDivElement>(null)
  const itemRaiseClaimRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpenStep(phaseToOpenStep(phase))
  }, [phase])

  const step1Done = isCompleted || documents.followupPhase === "approved"
  /** Step 2 is always visible so CX sees what comes next; interaction waits until documents are approved. */
  const step2Done = isCompleted
  const step2Locked = !step1Done && !isCompleted
  /** Collapsed header for step 1 while Raise claim is active. */
  const compactPriorSteps = phase === "step2_fnol"

  /** Keep the open step’s header at the top of the workflow scroll container only (not the page). */
  useEffect(() => {
    const container = scrollContainerRef?.current
    const refs: Record<string, RefObject<HTMLDivElement | null>> = {
      [REQUEST_DOCUMENTS_STEP_ID]: itemRequestDocumentsRef,
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
      {showPanelHeader ? (
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
      ) : null}

      <Accordion
        type="single"
        value={openStep}
        onValueChange={(v) => {
          if (v) setOpenStep(v)
        }}
        className={cn(
          "flex min-h-0 flex-col",
          compactPriorSteps ? "gap-3" : "gap-2",
        )}
        aria-label="Raise claim workflow steps"
      >
        <RequestDocumentsAccordionStep
          itemRef={itemRequestDocumentsRef}
          openStep={openStep}
          activeWorkflowPhase="step1_documents"
          currentWorkflowPhase={phase}
          stepNumber={1}
          stepDone={step1Done}
          compactPriorSteps={compactPriorSteps}
          customer={customer}
          documents={documents}
        />

        {/* Step 2 — always visible; locked until step 1 completes */}
        <AccordionItem
          ref={itemRaiseClaimRef}
          value={STEP_RAISE_CLAIM}
          className="scroll-mt-3"
          disabled={step2Locked || step2Done}
        >
          <AccordionTrigger
            className={cn("py-3", step2Locked && "cursor-not-allowed opacity-90 hover:bg-transparent")}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-euclid text-[13px] font-semibold",
                step2Done
                  ? "bg-[#0fa457] text-white"
                  : step2Locked
                    ? "border border-[#e7e7f0] bg-[#fafafa] text-[#9c9aaf]"
                    : "bg-[#7c47e1] text-white",
              )}
              aria-hidden
            >
              {step2Done ? <Check className="size-4" strokeWidth={2.5} /> : "2"}
            </span>
            <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
              <span className="font-euclid text-[14px] font-semibold leading-6 text-[#040222]">
                {helloWorkflowStepRaiseClaim}
              </span>
              {step2Done ? (
                <span className="font-euclid text-[12px] font-normal leading-[18px] text-[#0fa457]">
                  Claim raised successfully
                </span>
              ) : step2Locked ? (
                <span className="font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                  Complete document requests first
                </span>
              ) : null}
            </span>
          </AccordionTrigger>
          <AccordionContent className="min-h-0 pt-1">
            {!step2Done && (
              <div className="min-h-0 w-full overflow-hidden rounded-lg bg-transparent">
                <RaiseFnolPanel
                  policy={policy}
                  variant="embedded"
                  onClaimSubmitted={onFnolComplete}
                />
              </div>
            )}
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
