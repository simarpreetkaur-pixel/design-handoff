/**
 * Copy and timing — Raise claim Hello view ([Figma OMNI Post-Sales 8515:12353](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8515-12353)).
 */

import type { Policy } from "@/types/crm"

/** Vehicle line for the Hello raise-claim opener — aligns with workflow pane labelling. */
export function helloRaiseClaimVehicleLabel(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return v
  const n = policy.name?.trim()
  if (n) return n
  const p = policy.planDisplayName?.trim()
  if (p) return p
  return policy.type || "vehicle"
}

export const helloRaiseClaimCompanionSubtitle =
  "Customer agent's companion to solve the customer's query"

/** Label inside Hello **AI** assistant bubbles (system / AI replies). */
export const helloAiResponderLabel = "AI agent"

/** Name shown inside Hello **CX** advisor bubbles (human replies). */
export const helloCxResponderName = "CX Sneha"

/** Typing indicator before the first message appears. */
export const HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS = 720

/** Pause after opener appears, before choice block appears. */
export const HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS = 520

/** Delay before bot follow-up after user echoes a radio pick (matches Classic AIChatPanel cadence). */
export const HELLO_BOT_REPLY_AFTER_USER_MS = 420

/**
 * After each self-serve guidance bubble appears, wait this long before showing the next typing
 * indicator so CX can read (Hello view split-stream).
 */
export const HELLO_SELF_SERVE_READ_PAUSE_MS = 900

/** Stable id for the initial {@link WorkflowOfferPick} under the hero opener. */
export const HELLO_OPENING_OFFER_ID = "opening"

/** Chat composer: this phrase (case-insensitive, whitespace-normalized) replays the workflow choice radios. */
export function helloComposerTriggersRaiseClaimOffer(text: string): boolean {
  const normalized = text.trim().replace(/\s+/g, " ").toLowerCase()
  return normalized === "raise a claim"
}

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

/** Right workflow pane: shimmer stays visible through lg grid expansion (~700ms), then crossfades out. */
export const HELLO_WORKFLOW_PANE_SHIMMER_HOLD_MS = 760
/** Fade duration when revealing real workflow content. */
export const HELLO_WORKFLOW_PANE_SHIMMER_FADE_MS = 480

/** Pause after the garage-points bubble before the workflow pane splits open. */
export const HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS = 2000

/** Profile “Policies” drawer closes before the parent opens the policy-detail split (collapse-first). */
export const HELLO_POLICIES_PANEL_COLLAPSE_BEFORE_OPEN_MS = 280

/** First assistant turn after profile-bar policy pick — shown after typing, before the inline policy card. */
export const HELLO_POLICY_BAR_ACK_LINE =
  "As requested, let me open policy details here in the chat."

/** Assistant line after the inline policy summary when picking an active policy from the profile bar. */
export const HELLO_POLICY_BAR_ASSISTANCE_PROMPT =
  "Does the customer need any assistance here?"

/** Profile ribbon → split pane shortcuts (active policy expand menu). */
export type HelloProfilePolicyRibbonAction =
  | "view_details"
  | "raise_claim"
  | "edit_policy"
  | "share_policy_document"

/** Typing indicator before the ribbon acknowledgement line — same cadence as {@link HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS}. */
export const HELLO_PROFILE_RIBBON_ACK_TYPING_MS = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS

/** Pause after the ack bubble before opening the right pane (readable beat). */
export const HELLO_PROFILE_RIBBON_AFTER_ACK_MS = 450

/** Primary label for ribbon copy — vehicle / plan / product name. */
export function helloProfileRibbonPolicyDisplayName(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return v
  const n = policy.name?.trim()
  if (n) return n
  const p = policy.planDisplayName?.trim()
  if (p) return p
  return policy.type || "this policy"
}

export function helloProfileRibbonPolicyAckMessage(
  policy: Policy,
  action: HelloProfilePolicyRibbonAction,
): string {
  const label = helloProfileRibbonPolicyDisplayName(policy)
  switch (action) {
    case "view_details":
      return `As requested, opening policy details for ${label} for you.`
    case "raise_claim":
      return `As requested, opening raise a claim for ${label} for you.`
    case "edit_policy":
      return `As requested, opening the edit policy for ${label} for you.`
    case "share_policy_document":
      return `As requested, opening share policy document for ${label} for you.`
  }
}

export type HelloPolicyBarActionKey =
  | "raise_claim"
  | "edit_policy"
  | "view_policy_document"
  | "share_policy_document"

/** Radio rows under {@link HELLO_POLICY_BAR_ASSISTANCE_PROMPT} — doc actions disabled until wired. */
export function helloPolicyBarWorkflowOfferPickOptions(): {
  key: HelloPolicyBarActionKey
  label: string
  disabled?: boolean
}[] {
  return [
    { key: "raise_claim", label: "Raise a claim" },
    { key: "edit_policy", label: "Edit Policy" },
    { key: "view_policy_document", label: "View policy document", disabled: true },
    { key: "share_policy_document", label: "Share policy document", disabled: true },
  ]
}

/** Right pane: skeleton duration before {@link PolicyDetailPanel} mounts (demo pacing). */
export const HELLO_POLICY_DETAIL_SKELETON_MS = 520

/**
 * After the first agent-behalf ack (“Sure…”) is shown, wait this long before the typing indicator
 * for the garage talking-points bubble — keeps the two assistant turns visibly sequential.
 */
export const HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS = 850

/** Typing-indicator duration before the second agent-behalf bubble (garage bullet points). */
export const HELLO_SECOND_ACK_TYPING_INDICATOR_MS = 400

/** First assistant bubble after agent-behalf pick (shown before garage guidance). */
export const helloSureCreatingWorkflowAck = "Sure — I'm creating the workflow for you."

/**
 * Bullet lines — network garage talking points (shown below the intro line in the Hello agent-behalf bubble).
 */
export const HELLO_AGENT_BEHALF_NETWORK_GARAGE_BULLETS = [
  "• Cashless repairs at authorised garages — covered work is settled directly with us, so the customer avoids large upfront payments.",
  "• Quality-checked repairs and quicker turnaround — jobs stay on insurer-approved channels with clearer estimates and faster closure.",
] as const

export function helloAgentBehalfNetworkGarageBulletsJoined(): string {
  return HELLO_AGENT_BEHALF_NETWORK_GARAGE_BULLETS.join("\n")
}

/** After FNOL submit — success line (shown with green check in Hello companion). */
export const helloClaimRaisedSuccessHeadline = "The claim has been raised successfully."

/**
 * Verbatim line for the CX to say to the customer — rendered in quotes in the Hello success card.
 */
export const helloClaimRaisedSuccessQuotedLine =
  "They\u2019ll receive a call from their claim handler in 1\u20132 working days."

/** Legacy plain-text join (prefer structured {@link helloClaimRaisedSuccessHeadline} + quoted line in UI). */
export const helloClaimRaisedChatSuccess = [
  helloClaimRaisedSuccessHeadline,
  "",
  `Tell the customer: \u201c${helloClaimRaisedSuccessQuotedLine}\u201d`,
].join("\n")

/** Brief pause so the FNOL success state is visible in the workflow before the split closes. */
export const HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS = 900

// Escalation Success Messages

/** Tech team escalation success headline (shown with green check in Hello companion). */
export const helloTechEscalationSuccessHeadline = "The escalation has been submitted successfully."

/**
 * Verbatim line for the CX to say to the customer for tech team escalation — rendered in quotes in the Hello success card.
 */
export const helloTechEscalationSuccessQuotedLine =
  "The tech team will review your case and contact you within 24-48 hours."

/** F-ops escalation success headline (shown with green check in Hello companion). */
export const helloFopsEscalationSuccessHeadline = "The escalation has been submitted successfully."

/**
 * Verbatim line for the CX to say to the customer for F-ops escalation — rendered in quotes in the Hello success card.
 */
export const helloFopsEscalationSuccessQuotedLine =
  "The operations team will review your case and contact you within 24-48 hours."

/** Pause after the claim-raised bubble before the renewal nudge typing indicator (readable beat). */
export const HELLO_RENEWAL_NUDGE_AFTER_SUCCESS_MS = 640

/**
 * Default “other policy” renewal prompt after FNOL success — shown in a distinct Hello card.
 * Pass `renewalNudgeAfterClaim={null}` on {@link RaiseClaimHelloView} to hide.
 */
export const helloDefaultRenewalNudgeAfterClaim = {
  vehicleLabel: "Honda Activa",
  daysLeft: 15,
} as const

export function helloWorkflowPaneTitle(vehicleLabel: string): string {
  return `Raise a claim — ${vehicleLabel}`
}

export const helloWorkflowStepRequestRc = "Request RC copy"
/** One-line summary when step 1 is collapsed (email send done). */
export const helloWorkflowStepRequestRcCollapsedSummary =
  "Request sent on WhatsApp — documents approved. Continue with Raise claim below."

export const helloWorkflowStepRaiseClaim = "Raise claim"

/** Shown under step 2 while step 1 is incomplete — sets expectation for what comes next. */
export const helloWorkflowStepRaiseClaimLockedHint =
  "Next step — opens after you approve the received RC and driving licence."

export const helloSomethingElseAckComposerAlways =
  "Got it — describe what they need in the message bar below and I\u2019ll align the next steps."

export const helloFreeTextAckStub =
  "Noted. Use the workflow panel on the right when it\u2019s open; I\u2019ll flag anything unusual for your supervisor playbook in a future release."

/**
 * Tailwind padding class for the bottom of the Hello companion column. The column keeps
 * `overflow-hidden` for flex scroll containment; the composer’s large `box-shadow` extends outside
 * its layout box — this clearance prevents the shadow from being clipped (especially in split view).
 */
export const HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS = "pb-8"
