import { type RefObject, useCallback, useEffect, useRef, useState } from "react"
import { Check, X } from "lucide-react"

import { EndorsementAdvisorPanel } from "@/components/crm/EndorsementAdvisorPanel"
import {
  helloEditWorkflowPaneTitle,
  helloWorkflowStepEditPolicy,
  helloWorkflowStepEditPolicyLockedHint,
} from "@/components/crm/hello/helloEditPolicyCopy"
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
  /**
   * When false, omits the inner title + close row — use when a parent shell already shows
   * the workflow title and dismiss control (e.g. Live listening split header).
   */
  showPanelHeader?: boolean
}

type WorkflowPhase = "step1_documents" | "step2_edit"

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
    case "step1_documents":
      return REQUEST_DOCUMENTS_STEP_ID
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
  showPanelHeader = true,
}: EditPolicyWorkflowPanelProps) {
  const [phase, setPhase] = useState<WorkflowPhase>("step1_documents")
  const [openStep, setOpenStep] = useState<string>(() => phaseToOpenStep("step1_documents"))
  const [advisorDraftDirty, setAdvisorDraftDirty] = useState(false)
  const workflowCompleteLockRef = useRef(false)
  const [workflowCompleteDispatched, setWorkflowCompleteDispatched] = useState(false)

  const onDocumentsApproved = useCallback(() => {
    setPhase("step2_edit")
  }, [])

  const documents = useRequestDocumentsWorkflow({
    onRequestDispatched: onRcEmailSent,
    onDocumentsApproved,
  })

  const itemRequestDocumentsRef = useRef<HTMLDivElement>(null)
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

  const documentsStepDone = documents.followupPhase === "approved"
  const editStepLocked = !documentsStepDone
  const compactPriorSteps = phase === "step2_edit"

  useEffect(() => {
    const container = scrollContainerRef?.current
    const refs: Record<string, RefObject<HTMLDivElement | null>> = {
      [REQUEST_DOCUMENTS_STEP_ID]: itemRequestDocumentsRef,
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
      {showPanelHeader ? (
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
      ) : null}

      <Accordion
        type="single"
        value={openStep}
        onValueChange={(v) => {
          if (v) setOpenStep(v)
        }}
        className={cn("flex min-h-0 flex-col", compactPriorSteps ? "gap-1" : "gap-2")}
        aria-label="Edit policy workflow steps"
      >
        <RequestDocumentsAccordionStep
          itemRef={itemRequestDocumentsRef}
          openStep={openStep}
          activeWorkflowPhase="step1_documents"
          currentWorkflowPhase={phase}
          stepNumber={1}
          stepDone={documentsStepDone}
          compactPriorSteps={compactPriorSteps}
          customer={customer}
          documents={documents}
        />

        <AccordionItem
          ref={itemEditPolicyRef}
          value={STEP_EDIT_POLICY}
          className="scroll-mt-3"
          disabled={editStepLocked}
        >
          <AccordionTrigger
            className={cn("py-3", editStepLocked && "cursor-not-allowed opacity-90 hover:bg-transparent")}
          >
            <span
              className={cn(
                "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-euclid text-[13px] font-semibold",
                editStepLocked
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
              {editStepLocked ? (
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
                disabled={editStepLocked || !advisorDraftDirty || workflowCompleteDispatched}
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
