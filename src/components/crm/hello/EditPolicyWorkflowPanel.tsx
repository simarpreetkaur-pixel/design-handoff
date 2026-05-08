import { type RefObject, useCallback, useEffect, useRef, useState } from "react"
import { Check, X } from "lucide-react"

import { EndorsementAdvisorPanel } from "@/components/crm/EndorsementAdvisorPanel"
import {
  helloEditPolicyRequestRcCollapsedSummary,
  helloEditWorkflowPaneTitle,
  helloWorkflowStepEditPolicy,
  helloWorkflowStepEditPolicyLockedHint,
} from "@/components/crm/hello/helloEditPolicyCopy"
import {
  helloWorkflowStepRequestRc,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import { RequestRcCopyForm } from "@/components/crm/RequestRcCopyForm"
import { RequestRcWorkflowFollowup } from "@/components/crm/RequestRcWorkflowFollowup"
import { useRequestRcWorkflowStep } from "@/components/crm/useRequestRcWorkflowStep"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import type { Customer, EndorsementEditKind, Policy } from "@/types/crm"
import { cn, scrollElementWithinContainer } from "@/lib/utils"

export type EditPolicyWorkflowPanelProps = {
  customer: Customer
  policy: Policy
  editKind: EndorsementEditKind
  scrollContainerRef?: RefObject<HTMLElement | null>
  onRcEmailSent?: () => void
  onClose?: () => void
  onEditPolicyWorkflowComplete?: () => void
}

type WorkflowPhase = "step1_rc" | "step2_edit"

const STEP_REQUEST_RC = "request-rc"
const STEP_EDIT_POLICY = "edit-policy"

const WORKFLOW_STEP_SCROLL_INTO_VIEW_MS = 220

function vehicleLabel(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return v
  const n = policy.name?.trim()
  if (n) return n
  const p = policy.planDisplayName?.trim()
  if (p) return p
  return policy.type || "Policy"
}

function phaseToOpenStep(phase: WorkflowPhase): string {
  switch (phase) {
    case "step1_rc":
      return STEP_REQUEST_RC
    case "step2_edit":
      return STEP_EDIT_POLICY
  }
}

export function EditPolicyWorkflowPanel({
  customer,
  policy,
  editKind,
  scrollContainerRef,
  onRcEmailSent,
  onClose,
  onEditPolicyWorkflowComplete,
}: EditPolicyWorkflowPanelProps) {
  const [phase, setPhase] = useState<WorkflowPhase>("step1_rc")
  const [openStep, setOpenStep] = useState<string>(() => phaseToOpenStep("step1_rc"))
  const [advisorDraftDirty, setAdvisorDraftDirty] = useState(false)
  /** Prevents double Submits (and duplicate success bubbles) before React re-renders. */
  const workflowCompleteLockRef = useRef(false)
  const [workflowCompleteDispatched, setWorkflowCompleteDispatched] = useState(false)

  const onRequestDispatched = useCallback(() => {
    onRcEmailSent?.()
  }, [onRcEmailSent])

  const onDocumentsApproved = useCallback(() => {
    setPhase("step2_edit")
  }, [])

  const rc = useRequestRcWorkflowStep({
    onRequestDispatched,
    onDocumentsApproved,
  })

  const itemRequestRcRef = useRef<HTMLDivElement>(null)
  const itemEditPolicyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    setOpenStep(phaseToOpenStep(phase))
  }, [phase])

  useEffect(() => {
    setAdvisorDraftDirty(false)
    workflowCompleteLockRef.current = false
    setWorkflowCompleteDispatched(false)
  }, [phase, editKind, policy.id])

  const handleSubmitUpdateClick = () => {
    if (workflowCompleteLockRef.current) return
    workflowCompleteLockRef.current = true
    setWorkflowCompleteDispatched(true)
    onEditPolicyWorkflowComplete?.()
  }

  const step1Done = rc.documentsApproved
  const step2Locked = !step1Done
  const compactPriorSteps = phase === "step2_edit"

  useEffect(() => {
    const container = scrollContainerRef?.current
    const refs: Record<string, RefObject<HTMLDivElement | null>> = {
      [STEP_REQUEST_RC]: itemRequestRcRef,
      [STEP_EDIT_POLICY]: itemEditPolicyRef,
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
          {helloEditWorkflowPaneTitle(vehicleLabel(policy))}
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
        aria-label="Edit policy workflow steps"
      >
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
                  {helloEditPolicyRequestRcCollapsedSummary}
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
            <RequestRcWorkflowFollowup
              phase={rc.followupPhase}
              documentDeliveryIndex={rc.documentDeliveryIndex}
              receivedAtMs={rc.receivedAtMs}
              onApprove={rc.approveDocuments}
              onReRequestDocuments={rc.reRequestDocuments}
            />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem
          ref={itemEditPolicyRef}
          value={STEP_EDIT_POLICY}
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
                {helloWorkflowStepEditPolicy}
              </span>
              {step2Locked ? (
                <span className="font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                  {helloWorkflowStepEditPolicyLockedHint}
                </span>
              ) : null}
            </span>
          </AccordionTrigger>
          <AccordionContent className="space-y-0 pt-1">
            <div className="flex min-h-0 flex-col gap-4">
              <div className="min-h-0 overflow-hidden rounded-xl border border-[#e7e7f0]">
                <EndorsementAdvisorPanel
                  key={`hello-edit-advisor-${policy.id}-${editKind}`}
                  policy={policy}
                  onBack={onClose ?? (() => {})}
                  onDraftDirtyChange={setAdvisorDraftDirty}
                  embedded
                  variant="helloPane"
                />
              </div>
              <Button
                type="button"
                disabled={step2Locked || !advisorDraftDirty || workflowCompleteDispatched}
                className="h-10 w-full rounded-lg bg-[#7c47e1] font-euclid text-[14px] font-medium text-white hover:bg-[#7c47e1]/90 sm:ml-auto sm:w-auto sm:self-end"
                onClick={handleSubmitUpdateClick}
              >
                Submit update
              </Button>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
