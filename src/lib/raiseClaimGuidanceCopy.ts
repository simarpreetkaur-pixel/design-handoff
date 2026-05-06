/** Shared copy for chat + left-panel raise-claim guidance (customer self-serve + agent on-behalf). */

/** Figma 8480:11629 — structured so UI can emphasize RC + Driver's License. */
export const raiseClaimTalktrackParts = {
  lead: "Please ensure you have your ",
  rc: "RC",
  mid: " and ",
  license: "Driver's License",
  trail: " ready before filing the claim.",
} as const

/** Plain full sentence (e.g. logs, non-React surfaces). */
export const RAISE_CLAIM_TALKTRACK =
  `${raiseClaimTalktrackParts.lead}${raiseClaimTalktrackParts.rc}${raiseClaimTalktrackParts.mid}${raiseClaimTalktrackParts.license}${raiseClaimTalktrackParts.trail}`

export const RAISE_CLAIM_CUSTOMER_STEPS: readonly string[] = [
  "Open the ACKO App.",
  'Select the "Register & Track your claims" or "Claim" option.',
  "Pick your insured vehicle from the Active Policies list.",
  "Follow the prompts to provide the First Notice of Loss (FNOL) details.",
  "Submit the claim to complete registration.",
]

/** Shown after FNOL / in guided chat — what happens next for the customer. */
export const RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE =
  "You will receive a call from your claim handler in 1-2 working days."

export const RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE = "Claim settlement TAT is 1 week."

/** @deprecated Prefer RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE + RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE in UI. */
export const RAISE_CLAIM_72H_MESSAGE = RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE

export function raiseClaimStepsAsBody(): string {
  return RAISE_CLAIM_CUSTOMER_STEPS.map((s, i) => `${i + 1}. ${s}`).join("\n")
}
