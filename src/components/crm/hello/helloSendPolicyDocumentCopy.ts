/** Chat copy — send policy document (policy pick → send communication workflow). */

export const HELLO_SEND_POLICY_DOCUMENT_POLICY_PICK_OFFER_ID =
  "send-policy-document-policy-pick"

export const helloSendPolicyDocumentPolicyPickContextLabel = "Policy"

export const helloSendPolicyDocumentPolicyPickPrompt =
  "Which policy do you want to send the policy document for?"

export function helloComposerTriggersSendPolicyDocument(text: string): boolean {
  const t = text.toLowerCase().trim()
  if (!t.includes("send") && !t.includes("share") && !t.includes("forward")) return false
  return (
    t.includes("policy document") ||
    (t.includes("policy") && t.includes("document")) ||
    t.includes("insurance document")
  )
}

export function helloSendPolicyDocumentWorkflowAck(policyLabel: string): string {
  return `Opening Send Communication for ${policyLabel} — policy document is pre-selected.`
}

export const helloSendCommunicationSuccessHeadline = "Communication sent successfully."

export const helloSendCommunicationSuccessQuotedLine =
  "The document has been sent to the customer on the selected channels."
