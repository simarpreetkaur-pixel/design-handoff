import { useCallback, useEffect, useRef, useState } from "react"

/** Demo: time until “customer” sends RC + licence back after the agent dispatches the request. */
export const REQUEST_RC_CUSTOMER_RESPONSE_DELAY_MS = 2000

export type RequestRcFollowupPhase = "awaiting_customer" | "documents_received"

type UseRequestRcWorkflowStepOptions = {
  onRequestDispatched?: () => void
  onDocumentsApproved?: () => void
}

/**
 * Request RC step state for Hello workflow panels (Raise claim / Edit policy).
 * After send → awaiting → (delay) documents received → agent approves → step complete.
 */
export function useRequestRcWorkflowStep(options: UseRequestRcWorkflowStepOptions = {}) {
  const { onRequestDispatched, onDocumentsApproved } = options

  const [subPhase, setSubPhase] = useState<"form" | RequestRcFollowupPhase>("form")
  const [documentsApproved, setDocumentsApproved] = useState(false)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const dispatchRequest = useCallback(() => {
    if (subPhase !== "form") return
    setSubPhase("awaiting_customer")
    onRequestDispatched?.()
    if (timerRef.current != null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setSubPhase("documents_received")
      timerRef.current = null
    }, REQUEST_RC_CUSTOMER_RESPONSE_DELAY_MS)
  }, [onRequestDispatched, subPhase])

  const approveDocuments = useCallback(() => {
    if (!documentsApproved) {
      setDocumentsApproved(true)
      onDocumentsApproved?.()
    }
  }, [documentsApproved, onDocumentsApproved])

  const followupPhase: RequestRcFollowupPhase | null =
    documentsApproved
      ? null
      : subPhase === "awaiting_customer" || subPhase === "documents_received"
        ? subPhase
        : null

  return {
    formDisabled: subPhase !== "form",
    followupPhase,
    dispatchRequest,
    approveDocuments,
    documentsApproved,
  }
}
