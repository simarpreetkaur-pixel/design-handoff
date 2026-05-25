import { type RefObject } from "react"
import { Check } from "lucide-react"

import { RequestDocumentWorkflowFollowup } from "@/components/crm/RequestDocumentWorkflowFollowup"
import {
  useRequestDocumentWorkflowStep,
  type UseRequestDocumentWorkflowStepProps,
} from "@/components/crm/useRequestDocumentWorkflowStep"
import { RequestDocumentFigmaForm } from "@/components/crm/hello/RequestDocumentFigmaForm"
import {
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"
import type { Customer } from "@/types/crm"

/** Accordion value shared by Raise Claim, Edit Policy, and other Hello workflows. */
export const REQUEST_DOCUMENTS_STEP_ID = "request-documents"

export const REQUEST_DOCUMENTS_STEP_TITLE = "Request Documents"

export const REQUEST_DOCUMENTS_STEP_DONE_SUMMARY = "Documents approved"

export type RequestDocumentsWorkflowState = ReturnType<typeof useRequestDocumentWorkflowStep>

export function useRequestDocumentsWorkflow(options: UseRequestDocumentWorkflowStepProps = {}) {
  return useRequestDocumentWorkflowStep(options)
}

export type RequestDocumentsWorkflowContentProps = {
  customer: Pick<Customer, "email" | "phone" | "name">
  documents: RequestDocumentsWorkflowState
}

/** Form + follow-up — single source of truth for all Request Documents flows. */
export function RequestDocumentsWorkflowContent({
  customer,
  documents,
}: RequestDocumentsWorkflowContentProps) {
  return (
    <>
      <RequestDocumentFigmaForm
        defaultEmail={customer.email}
        defaultPhone={customer.phone}
        disabled={documents.formDisabled}
        onSubmit={() => documents.dispatchRequest()}
      />
      <RequestDocumentWorkflowFollowup
        phase={documents.followupPhase}
        documentDeliveryIndex={documents.documentDeliveryIndex}
        receivedAtMs={documents.receivedAtMs}
        onApprove={documents.approveDocuments}
        onReRequestDocuments={documents.reRequestDocuments}
        documentLabel="documents"
        customerName={customer.name}
      />
    </>
  )
}

export type RequestDocumentsAccordionStepProps = {
  itemRef?: RefObject<HTMLDivElement | null>
  openStep: string
  /** Workflow phase when this step is the active step (for badge styling). */
  activeWorkflowPhase: string
  currentWorkflowPhase: string
  stepNumber: number
  stepDone: boolean
  locked?: boolean
  compactPriorSteps?: boolean
  customer: Pick<Customer, "email" | "phone" | "name">
  documents: RequestDocumentsWorkflowState
}

/**
 * Raise Claim step 1 accordion — reused anywhere Request Documents appears in a workflow.
 */
export function RequestDocumentsAccordionStep({
  itemRef,
  openStep,
  activeWorkflowPhase,
  currentWorkflowPhase,
  stepNumber,
  stepDone,
  locked = false,
  compactPriorSteps = false,
  customer,
  documents,
}: RequestDocumentsAccordionStepProps) {
  const isOpen = openStep === REQUEST_DOCUMENTS_STEP_ID
  const isActivePhase = currentWorkflowPhase === activeWorkflowPhase

  return (
    <AccordionItem
      ref={itemRef}
      value={REQUEST_DOCUMENTS_STEP_ID}
      className="scroll-mt-3"
      disabled={locked}
    >
      <AccordionTrigger
        className={cn(
          isOpen ? "py-3" : "py-2 min-h-0",
          compactPriorSteps && !isOpen && "py-1.5",
          locked && "cursor-not-allowed opacity-90 hover:bg-transparent",
        )}
      >
        <span
          className={cn(
            "flex h-7 w-7 shrink-0 items-center justify-center rounded-full font-euclid text-[13px] font-semibold",
            stepDone
              ? "bg-[#0fa457] text-white"
              : isActivePhase
                ? "bg-[#7c47e1] text-white"
                : locked
                  ? "border border-[#e7e7f0] bg-[#fafafa] text-[#9c9aaf]"
                  : "border border-[#e7e7f0] bg-white text-[#5b5675]",
          )}
          aria-hidden
        >
          {stepDone ? <Check className="size-4" strokeWidth={2.5} /> : stepNumber}
        </span>
        <span className="flex min-w-0 flex-1 flex-col items-start gap-0.5 text-left">
          <span className="font-euclid text-[14px] font-semibold leading-6 text-[#040222]">
            {REQUEST_DOCUMENTS_STEP_TITLE}
          </span>
          {stepDone && isOpen ? (
            <span className="font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
              {REQUEST_DOCUMENTS_STEP_DONE_SUMMARY}
            </span>
          ) : null}
        </span>
      </AccordionTrigger>
      <AccordionContent className="space-y-0 px-1">
        <RequestDocumentsWorkflowContent customer={customer} documents={documents} />
      </AccordionContent>
    </AccordionItem>
  )
}
