import { useCallback, useState } from "react"

export type DocumentRequestPhase = 
  | "waiting" 
  | "requesting" 
  | "dispatched" 
  | "received" 
  | "approved"

export type UseRequestDocumentWorkflowStepProps = {
  onRequestDispatched?: () => void
  onDocumentsApproved?: () => void
}

/**
 * Reusable hook for generic document request workflows.
 * Similar to useRequestRcWorkflowStep but for any document type.
 */
export function useRequestDocumentWorkflowStep({
  onRequestDispatched,
  onDocumentsApproved,
}: UseRequestDocumentWorkflowStepProps) {
  const [followupPhase, setFollowupPhase] = useState<DocumentRequestPhase>("waiting")
  const [documentDeliveryIndex, setDocumentDeliveryIndex] = useState(0)
  const [receivedAtMs, setReceivedAtMs] = useState<number | null>(null)
  const [formDisabled, setFormDisabled] = useState(false)

  const dispatchRequest = useCallback(() => {
    setFormDisabled(true)
    setFollowupPhase("requesting")
    
    // Simulate API call
    setTimeout(() => {
      setFollowupPhase("dispatched")
      onRequestDispatched?.()
      
      // Simulate document delivery after 3 seconds
      setTimeout(() => {
        setFollowupPhase("received")
        setReceivedAtMs(Date.now())
      }, 3000)
    }, 1500)
  }, [onRequestDispatched])

  const approveDocuments = useCallback(() => {
    setFollowupPhase("approved")
    onDocumentsApproved?.()
  }, [onDocumentsApproved])

  const reRequestDocuments = useCallback(() => {
    setFollowupPhase("waiting")
    setFormDisabled(false)
    setReceivedAtMs(null)
    setDocumentDeliveryIndex(prev => prev + 1)
  }, [])

  return {
    followupPhase,
    documentDeliveryIndex,
    receivedAtMs,
    formDisabled,
    dispatchRequest,
    approveDocuments,
    reRequestDocuments,
  }
}