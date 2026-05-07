/** Timing for staged AI messages (Hello view — Raise a claim). */
export const HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS = 900
export const HELLO_RAISE_CLAIM_GAP_AFTER_MESSAGE_MS = 420
export const HELLO_RAISE_CLAIM_GAP_BEFORE_TYPING_MS = 380

/**
 * Sequential assistant bubbles — AI speaking to the CX (agent).
 * Delivered one at a time with typing indicator between turns.
 */
export const helloRaiseClaimOpeningScript: readonly string[] = [
  "Opening context from IVR: this customer is calling to raise a claim for their Tata Nexon.",
  "Check whether they want to raise the claim on their own or whether you should assist as the agent.",
  "If they chose the wrong IVR option and called about something else, use the third option below.",
]

export type HelloRaiseClaimChoiceId = "self_serve" | "agent_behalf" | "something_else"

/** Labels aligned with Figma OMNI Post-Sales (8515:12353). */
export const helloRaiseClaimChoices: readonly {
  id: HelloRaiseClaimChoiceId
  label: string
}[] = [
  { id: "self_serve", label: "Customer will do it themselves" },
  { id: "agent_behalf", label: "Raise it on customer’s behalf" },
  { id: "something_else", label: "Customer called for something else" },
]

/** Phase 1 stub after choosing self-serve or agent-behalf (journeys TBD). */
export const helloRaiseClaimStubFollowUp: Record<
  Exclude<HelloRaiseClaimChoiceId, "something_else">,
  string
> = {
  self_serve:
    "Noted self-serve path — guided next steps for this journey will appear here in a future release.",
  agent_behalf:
    "Noted agent-assisted path — guided next steps for this journey will appear here in a future release.",
}

export const helloRaiseClaimSomethingElseAck =
  "Got it — briefly describe what you think the customer actually needs so we can steer the call."
