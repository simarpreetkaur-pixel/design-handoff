/**
 * Sunil Gupta — Edit Policy demo use cases (Use cases drawer #3 vs #5 Unknown reason).
 *
 * - Use **distinct** `chatMockCase` values so changing {@link DEMO_USE_CASE_SECTIONS} entry for #3
 *   does not change Unknown reason’s `crmDemo`.
 * - {@link AIChatPanel} and similar use **separate** `if` branches per mock so future product edits
 *   to use case 3 behavior do not automatically change Unknown reason (update both only when you intend to).
 */
export const SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK = "sunil_endorsement_edit_name" as const

/** Drawer #5 — “Unknown reason”; forked journey (wrong lookup → **1234** unlocks policies in CRM demo). */
export const SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK =
  "sunil_endorsement_unknown_reason" as const

/** AI Companion first bubble after answer — Unknown reason use case. */
export const SUNIL_UNKNOWN_REASON_COMPANION_OPENER =
  "Check reason of call from customer and type it in the chat for resolution."

/** Demo: save this lookup (digits only) in Edit phone to load policies on file. */
export const SUNIL_UNKNOWN_REASON_DEMO_UNLOCK_LOOKUP_DIGITS = "1234" as const

export type SunilEditPolicyDrawerChatMock =
  | typeof SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK
  | typeof SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK
