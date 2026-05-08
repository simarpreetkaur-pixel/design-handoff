import { useCallback, useEffect, useRef, useState } from "react"

/** Demo: time until “customer” sends RC + licence back after the agent dispatches the request. */
export const REQUEST_RC_CUSTOMER_RESPONSE_DELAY_MS = 5000

export type RequestRcFollowupPhase = "awaiting_customer" | "documents_received"

type UseRequestRcWorkflowStepOptions = {
  onRequestDispatched?: () => void
  onDocumentsApproved?: () => void
}

/**
 * Request RC step state for Hello workflow panels (Raise claim / Edit policy).
 * After send → awaiting → (delay) documents received → agent approves → step complete.
 * Re-request sends the customer another ask; UI returns to awaiting, then a new upload arrives (demo).
 */
export function useRequestRcWorkflowStep(options: UseRequestRcWorkflowStepOptions = {}) {
  const { onRequestDispatched, onDocumentsApproved } = options

  const [subPhase, setSubPhase] = useState<"form" | RequestRcFollowupPhase>("form")
  const [documentsApproved, setDocumentsApproved] = useState(false)
  /** 0 = first delivery, 1+ = after one or more re-requests (drives filename / preview copy). */
  const [documentDeliveryIndex, setDocumentDeliveryIndex] = useState(0)
  const [receivedAtMs, setReceivedAtMs] = useState<number | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current != null) window.clearTimeout(timerRef.current)
    }
  }, [])

  const scheduleDocumentsReceived = useCallback(() => {
    if (timerRef.current != null) window.clearTimeout(timerRef.current)
    timerRef.current = window.setTimeout(() => {
      setSubPhase("documents_received")
      setReceivedAtMs(Date.now())
      timerRef.current = null
    }, REQUEST_RC_CUSTOMER_RESPONSE_DELAY_MS)
  }, [])

  const dispatchRequest = useCallback(() => {
    if (subPhase !== "form") return
    setSubPhase("awaiting_customer")
    setDocumentDeliveryIndex(0)
    onRequestDispatched?.()
    scheduleDocumentsReceived()
  }, [onRequestDispatched, subPhase, scheduleDocumentsReceived])

  const reRequestDocuments = useCallback(() => {
    if (subPhase !== "documents_received" || documentsApproved) return
    setDocumentDeliveryIndex((i) => i + 1)
    setReceivedAtMs(null)
    setSubPhase("awaiting_customer")
    scheduleDocumentsReceived()
  }, [documentsApproved, subPhase, scheduleDocumentsReceived])

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
    documentDeliveryIndex,
    receivedAtMs,
    dispatchRequest,
    reRequestDocuments,
    approveDocuments,
    documentsApproved,
  }
}
