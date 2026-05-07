/**
 * Copy and timing — Raise claim Hello view ([Figma OMNI Post-Sales 8515:12353](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8515-12353)).
 */

/** Opening assistant line — exact string from Figma “Assistant Chat” (8515:12645). */
export const helloRaiseClaimOpeningMessage =
  "Customer is calling to Raise a claim, check with the customer if they want to raise a claim on their own or agent should assist?"

/** Subtitle under “AI Companion” — exact from Figma (8515:12652). */
export const helloRaiseClaimCompanionSubtitle =
  "Customer agent's companion to solve the customer's query"

/** Typing indicator before the first message appears. */
export const HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS = 720

/** Pause after opener finishes streaming, before choice block appears (feels like a second beat). */
export const HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS = 520

/** Character cadence for the opening line (natural reading pace). */
export const HELLO_RAISE_CLAIM_MS_PER_CHAR = 12

export type HelloRaiseClaimChoiceId = "self_serve" | "agent_behalf" | "something_else"

/** Choice labels — exact from Figma (8515:12957, 8515:12963, 8515:12970). */
export const helloRaiseClaimChoices: readonly {
  id: HelloRaiseClaimChoiceId
  label: string
}[] = [
  { id: "self_serve", label: "Customer will do it themselves" },
  { id: "agent_behalf", label: "Raise it on customer\u2019s behalf" },
  { id: "something_else", label: "Customer called for something else" },
]

/** Phase 1 stubs — short, conversational. */
export const helloRaiseClaimStubFollowUp: Record<
  Exclude<HelloRaiseClaimChoiceId, "something_else">,
  string
> = {
  self_serve:
    "Understood — we’ll walk them through self-serve next when that flow is wired up.",
  agent_behalf:
    "Understood — we’ll cover raising it on their behalf next when that flow is wired up.",
}

export const helloRaiseClaimSomethingElseAck =
  "Thanks — jot down what they actually need and we’ll take it from there."
