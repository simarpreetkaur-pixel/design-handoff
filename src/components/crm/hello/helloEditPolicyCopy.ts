/**
 * Copy — Edit Policy Hello view (aligned with Classic {@link AIChatPanel} endorsement wizard).
 */

import type { EndorsementEditKind } from "@/types/crm"

/** Classic AI chat policy wizard — matches {@link AIChatPanel} endorsement bootstrap copy. */
export const helloEditPolicyPolicyPickContextLabel = "Policy"

export const helloEditPolicyPolicyPickPrompt =
  "Sure—which policy should we make edits on?"

/** Before field radios — confirm the call is still about editing this policy. */
export const helloEditPolicySameIssuePrompt =
  "First, check whether the customer is still calling about the same issue — editing this policy — or something else."

export const helloEditPolicySameIssueYesLabel = "Yes, same issue"

/** Classic `edit_pick` line — {@link AIChatPanel} endorsement wizard. */
export const helloEditPolicyWhatToUpdatePrompt = "Ask customer what do they want to edit?"

/** @deprecated Prefer {@link helloEditPolicyWhatToUpdatePrompt} + mode pick; kept for migration. */
export const helloEditPolicyOpeningMessage =
  "Customer wants to Edit Policy — pick how you\u2019ll support them next."

/** Mode pick only (Classic endorsement wizard — no “something else”). */
export type HelloEditPolicyModeChoiceId = "self_serve" | "agent_behalf"

export function helloEditPolicyModeChoices(customerFirstName: string): readonly {
  id: HelloEditPolicyModeChoiceId
  label: string
}[] {
  const who = customerFirstName.trim() || "the customer"
  return [
    { id: "agent_behalf", label: "Yes, create new workflow" },
    { id: "self_serve", label: `No, just list steps to guide ${who}` },
  ] as const
}

/** @deprecated Use {@link HelloEditPolicyModeChoiceId} + {@link helloEditPolicyModeChoices}. */
export type HelloEditPolicyChoiceId = "self_serve" | "agent_behalf" | "something_else"

/** @deprecated “Something else” belongs only on the Raise Claim first prompt, not in Edit Policy wizard. */
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

/** Opening “same issue vs something else” — spend once before field radios. */
export const HELLO_EDIT_POLICY_SAME_ISSUE_PICK_OPENING_ID = "opening-edit-policy-same-issue-pick"

/** Opening “what to edit” radios — spend once a field is chosen. */
export const HELLO_EDIT_POLICY_EDIT_PICK_OPENING_ID = "opening-edit-policy-edit-pick"

/** Opening mode pick (workflow vs steps) — spend once. */
export const HELLO_EDIT_POLICY_MODE_PICK_OPENING_ID = "opening-edit-policy-mode-pick"

/** @deprecated Use {@link HELLO_EDIT_POLICY_MODE_PICK_OPENING_ID}. */
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

/** Classic `mode_pick` copy — matches {@link buildEndorsementModePickBotReply}. */
export function helloEditPolicyModePickMessage(args: {
  policyHead: string
  editPhrase: string
  customerFirstName: string
}): string {
  const who = args.customerFirstName.trim() || "the customer"
  return `I can help update ${args.editPhrase} on ${args.policyHead}.\n\nDo you want to create a new workflow, or should I only list steps to guide ${who}?`
}

/** First bubble after “on customer’s behalf”. */
export const helloEditPolicySureAck = "Sure — I\u2019m opening Edit Policy with the policy fields you need."

/** Tell the customer (policyholder name + agent path). */
export const helloEditPolicyPolicyholderNameRcTellCustomer =
  "Ask them to keep their RC ready — it’s required for a name update."

/** Second bubble — Advisor UI talking points (motor + health). */
export const helloEditPolicyAdvisorPoints = [
  "Walk through what will change and confirm spellings on the call.",
  "Motor edits tied to registration details need a clear RC upload before you submit in Advisor UI.",
  "Health-only updates (for example email ID) follow health SOP — RC isn\u2019t required.",
].join("\n")

/** Shorter advisor script when the edit is policyholder name — deprecated in Hello flow (third bubble removed). */
export const helloEditPolicyAdvisorPointsPolicyholderName = [
  "Walk through the exact spelling they want on the policy and match it to RC before you submit in Advisor UI.",
  "Collect a readable RC copy in Advisor UI — it\u2019s required for this name change.",
].join("\n")

/** Self-serve numbered steps (generic). */
export const EDIT_POLICY_CUSTOMER_STEPS = [
  "Confirm the exact field to change and capture spellings the customer wants on file.",
  "If the change depends on vehicle registration, ask them to share a readable RC copy before you submit.",
  "They can track progress in the ACKO app; you complete verification and uploads in Advisor UI when assisting.",
]

/** Self-serve steps when the edit is policyholder name — RC only (no licence), like Raise Claim doc emphasis but RC-only. */
export const EDIT_POLICY_POLICYHOLDER_NAME_CUSTOMER_STEPS = [
  "Confirm the exact policyholder name spelling they want on file — read it back once.",
  "Ask them to keep a clear RC copy ready and share it when you request it; a policyholder name update requires RC proof (no driving licence needed for this change).",
  "They can track progress in the ACKO app; you attach RC and complete the update in Advisor UI when assisting.",
]

export const editPolicyPolicyholderNameSelfServeTip =
  "For a policyholder name change on motor, collect a readable RC copy before you submit — it\u2019s required to fulfil the request. No driving licence needed for this specific update."

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

export const EDIT_POLICY_POLICYHOLDER_NAME_TAT_LINE =
  "Remind them RC must be uploaded for a policyholder name change — turnaround is typically within about 48 hours once RC and details are received."

export const EDIT_POLICY_HEALTH_NOTE_LINE =
  "For GMC name updates, remind them they may get an in-app alert if action is needed from their side."

export function helloEditWorkflowPaneTitle(policyLabel: string): string {
  return `Edit Policy — ${policyLabel}`
}

/** Hello workflow accordion — step 2 title (after Request RC copy). */
export const helloWorkflowStepEditPolicy = "Edit Policy"

/** Shown on locked step 2 trigger until RC + licence request is approved. */
export const helloWorkflowStepEditPolicyLockedHint =
  "Next step — opens after you approve the received RC and driving licence."

/** One-line summary when Edit Policy workflow step 1 (Request RC) is collapsed after approval. */
export const helloEditPolicyRequestRcCollapsedSummary =
  "Request sent on WhatsApp — documents approved. Continue with Edit Policy below."

export const helloEditPolicyWorkflowSuccessHeadline =
  "The policy update has been submitted successfully."

export const helloEditPolicyWorkflowSuccessQuotedLine =
  "I have completed the edit from my end. It will take up to 48 hours to reflect on your app."

export function helloEditPolicyAdvisorScriptForKind(kind: EndorsementEditKind): string {
  return kind === "policy_holder_name" ? helloEditPolicyAdvisorPointsPolicyholderName : helloEditPolicyAdvisorPoints
}
