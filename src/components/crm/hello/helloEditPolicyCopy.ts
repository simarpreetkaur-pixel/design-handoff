/**
 * Copy — Edit Policy Hello view (aligned with Classic {@link EndorsementAdvisorPanel} / JTBD endorsements).
 */

/** Classic AI chat policy wizard — matches {@link AIChatPanel} endorsement bootstrap copy. */
export const helloEditPolicyPolicyPickContextLabel = "Policy"

export const helloEditPolicyPolicyPickPrompt =
  "Sure—which policy should we make edits on?"

export const helloEditPolicyOpeningMessage =
  "Customer wants to Edit Policy — pick how you\u2019ll support them next."

export type HelloEditPolicyChoiceId = "self_serve" | "agent_behalf" | "something_else"

export const helloEditPolicyChoices: readonly {
  id: HelloEditPolicyChoiceId
  label: string
}[] = [
  { id: "self_serve", label: "Guide customer to self-serve (app / steps)" },
  { id: "agent_behalf", label: "Complete update on customer\u2019s behalf" },
  { id: "something_else", label: "Customer called for something else" },
]

/** Opening multi-policy radio group — spend once a policy is chosen. */
export const HELLO_EDIT_POLICY_POLICY_PICK_OPENING_ID = "opening-edit-policy-policy-pick"

/** Opening workflow-offer block (support mode radios) — same id namespace as raise-claim Hello view but separate route. */
export const HELLO_EDIT_POLICY_OPENING_OFFER_ID = "opening-edit-policy"

/** Chat composer: replay Edit Policy workflow (Hello only — matches Classic chat intent probes). */
export function helloComposerTriggersEditPolicyOffer(text: string): boolean {
  const normalized = text.trim().replace(/\s+/g, " ").toLowerCase()
  return (
    normalized === "edit policy" ||
    normalized === "edit" ||
    normalized === "edit my policy"
  )
}

/** First bubble after “on customer’s behalf”. */
export const helloEditPolicySureAck = "Sure — I\u2019m opening Edit Policy with the policy fields you need."

/** Second bubble — Advisor UI talking points (motor + health). */
export const helloEditPolicyAdvisorPoints = [
  "Walk through what will change and confirm spellings on the call.",
  "Motor edits tied to registration details need a clear RC upload before you submit in Advisor UI.",
  "Health-only updates (for example email ID) follow health SOP — RC isn\u2019t required.",
].join("\n")

/** Self-serve numbered steps (Classic JTBD-style). */
export const EDIT_POLICY_CUSTOMER_STEPS = [
  "Confirm the exact field to change and capture spellings the customer wants on file.",
  "If the change depends on vehicle registration, ask them to share a readable RC copy before you submit.",
  "They can track progress in the ACKO app; you complete verification and uploads in Advisor UI when assisting.",
]

/** Tip lead — inline emphasis segments match raise-claim pattern. */
export const editPolicyTalktrackLead =
  "Confirm the change on the call. When registration-linked fields move on a motor policy, collect "

export const editPolicyTalktrackRcEmphasis = "RC proof"

export const editPolicyTalktrackMid =
  " first; for health-only edits (like email), follow health SOP and use "

export const editPolicyTalktrackAdvisorEmphasis = "Advisor UI"

export const editPolicyTalktrackTrail = " with the right proof attached."

export const EDIT_POLICY_CUSTOMER_TAT_LINE =
  "Tell them endorsement turnaround is typically within about 48 hours once all inputs are received."

export const EDIT_POLICY_HEALTH_NOTE_LINE =
  "For GMC name updates, remind them they may get an in-app alert if action is needed from their side."

export function helloEditWorkflowPaneTitle(policyLabel: string): string {
  return `Edit Policy — ${policyLabel}`
}
