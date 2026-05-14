import {
  useState,
  useRef,
  useEffect,
  useCallback,
  useId,
  useMemo,
  type KeyboardEvent,
  type ReactNode,
} from "react"
import { Send, User, Sparkles } from "lucide-react"

import type { EndorsementEditKind, JTBDType, Policy } from "@/types/crm"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { parseChatWorkflowCreationIntent } from "@/lib/chatWorkflowCreationIntent"
import {
  buildEndorsementWizardBootstrap,
  editKindToDisplayLabel,
  editKindToShortCopyHint,
  endorsementEditRadioOptions,
  formatEndorsementPolicyRadioLabel,
  listPoliciesForEndorsementPolicyPick,
} from "@/lib/endorsementChatWizard"
import { formatPolicyChatRadioEcho, PolicyChatRadioContent } from "@/lib/policyChatRadioLabel"
import { buildRaiseClaimWizardBootstrap, parseRaiseClaimChatIntent } from "@/lib/raiseClaimChatWizard"
import { RaiseClaimChatGuidanceSection } from "@/components/crm/RaiseClaimGuidanceUI"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import { cn } from "@/lib/utils"
import {
  SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK,
  SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK,
  SUNIL_UNKNOWN_REASON_DEMO_UNLOCK_LOOKUP_DIGITS,
} from "@/data/sunilEditPolicyUseCases"
import { helloEditPolicyWhatToUpdatePrompt } from "@/components/crm/hello/helloEditPolicyCopy"

const SUNIL_UNKNOWN_REASON_COMPOSER_SUGGESTIONS: { id: string; label: string; sendText: string }[] = [
  { id: "edit_policy", label: "Edit policy", sendText: "Edit policy" },
]

function customerFirstNameOrFull(full: string): string {
  const t = full.trim()
  if (!t) return "the customer"
  const parts = t.split(/\s+/).filter(Boolean)
  return parts[0] ?? t
}

/** One crisp line + optional short subline */
interface BotStepLine {
  title: string
  detail?: string
  /** In-CRM CTA (e.g. opens same flow as Agent’s Next Actions in the left panel) */
}

/** Shown in bot replies; ties copy to the selected ongoing JTBD + policy on file */
export type AIChatCaseContext = {
  jtbdLabel: string
  vehicle: string
  jtbdType: JTBDType
  policyNumber?: string
}

interface ChatInsightBlock {
  title: string
  body: string
}

export type EndorsementWizardState =
  | { phase: "policy_pick"; customerName: string; policies: Policy[] }
  | { phase: "edit_pick"; customerName: string; policy: Policy }
  | { phase: "mode_pick"; customerName: string; policy: Policy; editKind: EndorsementEditKind }

export type RaiseClaimWizardState =
  | { phase: "policy_pick"; customerName: string; policies: Policy[] }
  | { phase: "workflow_pick"; customerName: string; policy: Policy }

interface ChatMessage {
  id: string
  role: "user" | "bot"
  text: string
  steps?: BotStepLine[]
  insightBlocks?: ChatInsightBlock[]
  /** Short label tying the reply to the ask (ACKO purple, above timeline) */
  contextLabel?: string
  /** Sunil endorsement demo — pick motor vs health policy */
  policyChoices?: { key: string; label: string }[]
  /** Multi-step endorsement wizard (policy → edit → mode) */
  endorsementWizard?: EndorsementWizardState
  /** Raise claim wizard (policy → mode) */
  raiseClaimWizard?: RaiseClaimWizardState
  /** Garage-selection help: CTA opens claim handler appointment modal in CRMView */
  claimHandlerScheduler?: boolean
  /** After “on customer’s behalf” — CTA opens Active policies → raise claim for this policy */
  raiseClaimGoToPanel?: { policyId: string }
  /** Raise-claim guide / on-behalf follow-up: shared talktrack + steps layout (not nested insight cards). */
  raiseClaimGuidanceLayout?: boolean
  /** Unknown JTBD iteration demo — classify caller intent before showing JTBD rail */
  intentDiscoveryPick?: {
    options: { key: string; label: string }[]
  }
}

export type ChatMockCase =
  | "default"
  | "kyc_issuance"
  | "raj_cold_nexon"
  /** Raj Kapoor — raise claim for Tata Nexon + GMC policy context (nav “Raise a claim”) */
  | "raj_raise_claim_nexon_gmc"
  /** Raj Kapoor — live call transcript + AI suggested raise claim (drawer #6). */
  | "raj_live_listening_raise_claim"
  /** Raj Kapoor — Road Side Assistance (drawer #4); transfer-only agent path. */
  | "raj_road_side_assistance"
  | "sunil_endorsement_edit_name"
  /** Sunil — Unknown reason (drawer #5); fork of UC3 chat behavior (separate branches in {@link buildBotReply}). */
  | "sunil_endorsement_unknown_reason"
  /** Sunil — Escalation / refund past TAT (drawer #6); Hello scripted journey. */
  | "sunil_escalation_refund_payment"

interface AIChatPanelProps {
  isActive?: boolean
  preWrittenMessage?: string
  askInChatNonce?: number
  onMessageUsed?: () => void
  activeJtbdType?: JTBDType
  chatMockCase?: ChatMockCase
  /** Selected ongoing JTBD + policy hint from the left panel */
  caseContext?: AIChatCaseContext | null
  /** Sunil endorsement demo: user chose Swift vs GMC in chat — parent reveals JTBD */
  onEndorsementPolicySelected?: (policyKey: "swift" | "gmc") => void
  /**
   * Customer + JTBD-aware opener; falls back to generic helper when empty/undefined.
   * Parent should remount this panel (key) when customer or primary JTBD changes.
   */
  contextualWelcomeText?: string
  /** When set, chat can offer creating endorsement JTBDs from natural language */
  workflowChatContext?: {
    customerName: string
    activePolicies: Policy[]
    callContextVehicle?: string
    /** True when left rail already shows a Raise a Claim JTBD (demo or chat-injected). */
    ongoingRaiseClaimWorkflowPresent?: boolean
  }
  /** Fires when the agent picks “Yes, create new workflow” in the raise-claim chat wizard. */
  onChatRaiseClaimWorkflowCreated?: (payload: { policy: Policy }) => void
  /** Fires after the agent picks “create workflow” in chat (2s shimmer handled in CRMView). */
  onChatEndorsementWorkflowCreated?: (payload: { policy: Policy; editKind: EndorsementEditKind }) => void
  /** @deprecated No longer used; raise-claim chat injects a JTBD instead of opening the panel. */
  onGoToRaiseClaimForPolicy?: (payload: { policyId: string }) => void
  /** @deprecated */
  onRaiseClaimFlowLoadingChange?: (loading: boolean) => void
  /** Bumps to focus the chat input without prefilling (Agent “Ask in the chat”). */
  chatComposerFocusNonce?: number
  /** Opens claim handler scheduling from a bot CTA. */
  onOpenClaimHandlerAppointment?: () => void
  /** Extra classes on the composer footer (e.g. safe inset when a fixed FAB overlaps the input). */
  composerFooterClassName?: string
  /** Unknown JTBD state 0: render beside the composer (e.g. Ozontel) so the bar reads as one chat control strip. */
  fullBleedComposerAccessory?: ReactNode
  /** Hide the top “AI Companion” chrome — parent supplies a floating shell (e.g. Live listening FAB). */
  hideHeader?: boolean
  /** Delay before the bot reply appears after the user sends (demo pacing). Default 700ms. */
  botReplyDelayMs?: number
}

const WELCOME_BOT_TEXT =
  "Ask in plain language. I’ll keep replies short—bullets or a tiny timeline when it helps."

function buildUnknownJtbdIterationOpen(): ChatMessage {
  return {
    id: "unknown-jtbd-intent-open",
    role: "bot",
    contextLabel: "Intent",
    text: "What is the customer calling about? Pick one so we can open the right workspace—or choose Something else if it doesn’t fit a standard journey.",
    intentDiscoveryPick: {
      options: [
        { key: "raise_claim", label: "Raise a Claim" },
        { key: "kyc_status", label: "KYC / verification issue" },
        { key: "edit_policy", label: "Edit Policy" },
        { key: "something_else", label: "Something else" },
      ],
    },
  }
}

function buildInitialMessages(welcomeText: string): ChatMessage[] {
  return [{ id: "welcome", role: "bot", text: welcomeText }]
}

type BotReplyPayload = Pick<
  ChatMessage,
  | "text"
  | "steps"
  | "insightBlocks"
  | "contextLabel"
  | "policyChoices"
  | "endorsementWizard"
  | "raiseClaimWizard"
  | "claimHandlerScheduler"
  | "raiseClaimGoToPanel"
  | "raiseClaimGuidanceLayout"
>

function buildSunilFollowUpBotReply(policyKey: "swift" | "gmc"): BotReplyPayload {
  if (policyKey === "swift") {
    return {
      contextLabel: "Swift Dzire · edit name",
      text: "Name correction — quick path:",
      steps: [
        {
          title: "Documents",
          detail: "Ask for RC and driving licence — customer can email copies or you upload in Advisor UI.",
        },
        {
          title: "Verify",
          detail: "Match documents to the insured name before submitting the policy edit.",
        },
        {
          title: "Left rail",
          detail: "Use Send RC & licence email and Advisor UI in Agent next actions when ready.",
        },
      ],
    }
  }
  return {
    contextLabel: "GMC policy · edit name",
    text: "Name correction — quick path:",
    steps: [
      {
        title: "Scope",
        detail: "Confirm which insured member(s) need the name update on the GMC plan.",
      },
      {
        title: "Documents",
        detail: "Collect proof per health SOP — email to customer or upload via Advisor UI.",
      },
      {
        title: "Left rail",
        detail: "Follow the Edit name JTBD actions — same email and Advisor UI steps as motor when applicable.",
      },
    ],
  }
}

function PolicyEndorsementPick({
  options,
  disabled,
  onCreateWorkflow,
}: {
  options: { key: string; label: string }[]
  disabled: boolean
  onCreateWorkflow: (policyKey: "swift" | "gmc") => void
}) {
  const [selected, setSelected] = useState<string | null>(null)
  const groupName = useId()

  return (
    <div className="space-y-3 pt-1">
      <fieldset disabled={disabled} className="m-0 space-y-2.5 border-0 p-0">
        <legend className="sr-only">Which policy</legend>
        {options.map((opt) => (
          <label
            key={opt.key}
            className={cn(
              "flex cursor-pointer items-start gap-2.5 rounded-lg border border-[#e7e7f0] bg-[#fbfbfd] px-3 py-2.5 font-euclid text-[13px] leading-5 text-[#36354c] transition-colors duration-[400ms] ease-out",
              disabled && "cursor-not-allowed opacity-60",
              selected === opt.key && "border-[#7c47e1] bg-[#f5f3fc]",
            )}
          >
            <input
              type="radio"
              name={groupName}
              value={opt.key}
              checked={selected === opt.key}
              onChange={() => setSelected(opt.key)}
              className="mt-0.5 size-4 shrink-0 accent-[#7c47e1]"
            />
            <span>{opt.label}</span>
          </label>
        ))}
      </fieldset>
      <Button
        type="button"
        disabled={disabled || !selected}
        className="h-10 w-full rounded-lg bg-[#7c47e1] font-euclid text-[13px] font-semibold text-white hover:bg-[#7c47e1]/90 disabled:bg-[#e7e7f0] disabled:text-[#9c9aaf]"
        onClick={() => onCreateWorkflow(selected === "gmc" ? "gmc" : "swift")}
      >
        Create workflow
      </Button>
    </div>
  )
}

function buildEndorsementModePickBotReply(
  policy: Policy,
  editKind: EndorsementEditKind,
  customerName: string,
): BotReplyPayload {
  const policyHead = formatEndorsementPolicyRadioLabel(policy).split("\n")[0]
  const editLabel = editKindToDisplayLabel(editKind)
  const editPhrase = editKindToShortCopyHint(editKind)
  return {
    contextLabel: editLabel,
    text: `I can help update ${editPhrase} on ${policyHead}.\n\nDo you want to create a new workflow, or should I only list steps to guide ${customerName}?`,
    endorsementWizard: { phase: "mode_pick", policy, editKind, customerName },
  }
}

function formatContextCaption(ctx: AIChatCaseContext | null | undefined): string | null {
  if (!ctx) return null
  const typeLabel =
    ctx.jtbdType === "claim" ? "Claim" : ctx.jtbdType === "renewal" ? "Renewal" : "Edit Policy"
  const jtbdExtra =
    ctx.jtbdLabel.trim() && ctx.jtbdLabel.trim().toLowerCase() !== typeLabel.toLowerCase()
      ? ctx.jtbdLabel.trim()
      : null
  return [typeLabel, ctx.policyNumber, ctx.vehicle, jtbdExtra]
    .filter((s): s is string => Boolean(s && String(s).trim()))
    .join(" · ")
}

function buildWorkflowCreatedFollowup(
  _policy: Policy,
  _editKind: EndorsementEditKind,
): BotReplyPayload {
  return {
    text: "Your workflow is ready in the left panel.",
  }
}

function buildRaiseClaimWorkflowPickBotReply(policy: Policy, customerName: string): BotReplyPayload {
  const policyHead = formatPolicyChatRadioEcho(policy).split("\n")[0]
  const first = customerFirstNameOrFull(customerName)
  return {
    contextLabel: "Raise claim",
    text: `I can help with a claim on ${policyHead}.\n\nDo you want to create a new workflow, or should I only list steps to guide ${first}?`,
    raiseClaimWizard: { phase: "workflow_pick", policy, customerName },
  }
}

function buildRaiseClaimWorkflowCreatedFollowup(): BotReplyPayload {
  return {
    contextLabel: "Raise claim",
    text: "Your workflow is ready in the left panel.",
  }
}

function buildRaiseClaimStepsOnlyClaimFollowup(
  policy: Policy,
  customerName: string,
): BotReplyPayload {
  const policyHead = formatPolicyChatRadioEcho(policy).split("\n")[0]
  return {
    contextLabel: "Steps (no new workflow)",
    text: `Guidance for ${customerName} on ${policyHead}:`,
    steps: [
      {
        title: "Documents",
        detail: "Ask for RC and driving licence — customer can email copies or you proceed once received.",
      },
      {
        title: "FNOL",
        detail: "Raise FNOL on customer's behalf in-app or via Advisor UI when RC proof is available.",
      },
      {
        title: "Expectations",
        detail: "Tell them a claim handler may call within 1–2 working days for next steps.",
      },
    ],
  }
}

function buildWorkflowStepsOnlyFollowup(
  policy: Policy,
  customerName: string,
  editKind: EndorsementEditKind,
): BotReplyPayload {
  const vLine = formatEndorsementPolicyRadioLabel(policy).split("\n")[0]
  const changeHint = editKindToShortCopyHint(editKind)
  return {
    contextLabel: "Steps (no new workflow)",
    text: `Guidance for ${customerName} on ${vLine}:`,
    steps: [
      {
        title: "ACKO Alert",
        detail: `Send an ACKO Alert so the customer can update ${changeHint} from their side.`,
      },
      {
        title: "Advisor UI",
        detail: "Alternatively, make the correction on their behalf in Advisor UI.",
      },
      {
        title: "Set expectations",
        detail: "Inform them the update TAT is typically up to 48 hours once inputs are complete.",
      },
    ],
  }
}

function isGarageUnableToSelectIntent(
  userText: string,
  jtbdType: JTBDType,
  caseContext: AIChatCaseContext | null | undefined,
): boolean {
  const claimContext = jtbdType === "claim" || caseContext?.jtbdType === "claim"
  if (!claimContext) return false
  const t = userText.trim()
  if (!t) return false
  const inability =
    /\b(unable|can'?t|cannot|can not|cant|not able|unable to|couldn'?t|could not)\b/i.test(t)
  const garage = /\b(garage|preferred garage|cashless garage|network garage|garage list|garage selection)\b/i.test(
    t,
  )
  return inability && garage
}

function buildBotReply(
  userText: string,
  jtbdType: JTBDType = "claim",
  chatMockCase: ChatMockCase = "default",
  caseContext: AIChatCaseContext | null | undefined = null,
  workflowChatContext?: {
    customerName: string
    activePolicies: Policy[]
    callContextVehicle?: string
    ongoingRaiseClaimWorkflowPresent?: boolean
  },
): BotReplyPayload {
  const q = userText.toLowerCase()

  if (chatMockCase === "raj_road_side_assistance") {
    return {
      contextLabel: "Road Side Assistance",
      text: "Use Agent’s next actions on the left and tap **Transfer call to RSA team** to hand off to the RSA queue. That’s the only step needed for this journey in OMNI (demo).",
    }
  }

  if (chatMockCase === "sunil_escalation_refund_payment") {
    return {
      contextLabel: "Refund / payments",
      text: "Anchor on TAT breach and account non-credit. Suggested steps:",
      steps: [
        {
          title: "Verify",
          detail: "Confirm UTR / PG reference and last debit timestamp before promising a new date.",
        },
        {
          title: "Tech / payments",
          detail: "If past committed TAT, escalate to **tech team** with ticket id and call count (3rd attempt).",
        },
        { title: "Customer comms", detail: "One clear apology + one concrete next action — avoid open-ended waits." },
      ],
    }
  }

  if (chatMockCase === "raj_live_listening_raise_claim") {
    const kycTiming =
      (q.includes("kyc") &&
        (q.includes("how long") ||
          q.includes("how much time") ||
          q.includes("take") ||
          q.includes("duration") ||
          q.includes("time") ||
          q.includes("happen"))) ||
      (q.includes("verification") && (q.includes("long") || q.includes("time")))

    if (kycTiming) {
      return {
        contextLabel: "KYC timing",
        text: "Share this with the customer:",
        steps: [
          {
            title: "Typical turnaround",
            detail:
              "KYC review is usually **1–2 working days** from ACKO’s side once documents are clear, complete, and match the application.",
          },
          {
            title: "If it’s stuck longer",
            detail:
              "Confirm upload status in the app, then use **Send Communication** or KYC Ops escalation with ticket / reference details.",
          },
        ],
      }
    }

    if (parseRaiseClaimChatIntent(userText)) {
      return {
        contextLabel: "Raise claim",
        text: "Open the **Raise claim** workspace in the **center** to continue intake (RC + FNOL) for this live call.",
        steps: [
          {
            title: "Next step",
            detail: "Use the center accordion—same steps as the standard Raise claim journey.",
            crmCta: { label: "Open Raise claim", crmAction: "raise_claim" },
          },
        ],
      }
    }

    const editPolicyLiveIntent =
      /\b(dob|date of birth|birth date)\b/i.test(userText) ||
      (q.includes("edit") && q.includes("policy")) ||
      (q.includes("health") && (q.includes("wrong") || q.includes("correct") || q.includes("change"))) ||
      (q.includes("name") && q.includes("policy"))

    if (editPolicyLiveIntent) {
      return {
        contextLabel: "Edit policy",
        text: "Open **Edit policy** in the **center** for health endorsements (for example DOB or insured details per SOP).",
        steps: [
          {
            title: "Next step",
            detail: "Request RC + licence where required, then complete the edit workflow from the center panel.",
            crmCta: { label: "Open Edit policy", crmAction: "advisor_ui" },
          },
        ],
      }
    }
  }

  if (chatMockCase === SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK) {
    const editNameIntent =
      /\b(edit name|name edit|endorsement name|name correction|correct spelling|change name on policy|change name|update name|name on policy|spelling)\b/i.test(
        userText,
      ) ||
      (q.includes("name") && (q.includes("policy") || q.includes("endorsement")))
    if (editNameIntent) {
      return {
        contextLabel: "Which policy?",
        text: "Which policy are you referring to?",
        policyChoices: [
          { key: "swift", label: "Swift Dzire" },
          { key: "gmc", label: "GMC policy" },
        ],
      }
    }
  }

  if (chatMockCase === SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK) {
    const wc = workflowChatContext
    const policyCount = wc?.activePolicies.length ?? 0
    if (wc && policyCount === 0) {
      const intent = parseChatWorkflowCreationIntent(userText, {
        policies: wc.activePolicies,
        callContextVehicle: wc.callContextVehicle,
        caseVehicle: caseContext?.vehicle,
      })
      if (intent) {
        return {
          contextLabel: "No policies on this lookup",
          text: "Customer has no active policies from this number so can't perform edit, confirm the customer's contact number associated with the policy and update it.",
          steps: [
            {
              title: "Confirm the policy number on file",
              detail:
                "Validate the customer’s contact number registered on the policy (not only the inbound caller ID).",
            },
            {
              title: "Update lookup (demo)",
              detail: `Save **${SUNIL_UNKNOWN_REASON_DEMO_UNLOCK_LOOKUP_DIGITS}** as the lookup number, and this view reloads with two active policies so you can continue.`,
            },
          ],
        }
      }
    }
    if (policyCount > 0) {
      const editNameIntent =
        /\b(edit name|name edit|endorsement name|name correction|correct spelling|change name on policy|change name|update name|name on policy|spelling)\b/i.test(
          userText,
        ) ||
        (q.includes("name") && (q.includes("policy") || q.includes("endorsement")))
      if (editNameIntent) {
        return {
          contextLabel: "Which policy?",
          text: "Which policy are you referring to?",
          policyChoices: [
            { key: "swift", label: "Swift Dzire" },
            { key: "gmc", label: "GMC policy" },
          ],
        }
      }
    }
  }

  if (isGarageUnableToSelectIntent(userText, jtbdType, caseContext)) {
    return {
      contextLabel: "Garage selection",
      text: "In that case, schedule a claim handler appointment, they will do it on customer's behalf.",
      claimHandlerScheduler: true,
    }
  }

  if (workflowChatContext) {
    if (parseRaiseClaimChatIntent(userText)) {
      const rb = buildRaiseClaimWizardBootstrap(
        workflowChatContext.activePolicies,
        workflowChatContext.customerName.trim() || "the customer",
      )
      if (
        workflowChatContext.ongoingRaiseClaimWorkflowPresent &&
        (rb.entry === "policy_pick" || rb.entry === "workflow_pick")
      ) {
        return {
          contextLabel: "Raise claim",
          text: "A Raise a Claim workflow is already open on the left. Open the Ongoing JTBD tab and follow the Agent next actions there—you don’t need to start another from chat unless this is for a different policy.",
        }
      }
      if (rb.entry === "no_policies") {
        return {
          contextLabel: "Raise claim",
          text: "There are no active policies on file — add or select a policy under Active policies first, or say which risk this claim is for.",
        }
      }
      if (rb.entry === "policy_pick") {
        return {
          contextLabel: "Raise claim",
          text: "Which active policy should we raise a claim against?",
          raiseClaimWizard: {
            phase: "policy_pick",
            policies: rb.policies,
            customerName: rb.customerName,
          },
        }
      }
      if (rb.entry === "workflow_pick") {
        return buildRaiseClaimWorkflowPickBotReply(rb.policy, rb.customerName)
      }
    }

    const intent = parseChatWorkflowCreationIntent(userText, {
      policies: workflowChatContext.activePolicies,
      callContextVehicle: workflowChatContext.callContextVehicle,
      caseVehicle: caseContext?.vehicle,
    })
    if (intent) {
      const cname = workflowChatContext.customerName.trim() || "the customer"
      const bootstrap = buildEndorsementWizardBootstrap(
        userText,
        intent,
        cname,
        workflowChatContext.activePolicies,
      )
      if (bootstrap.entry === "no_motor") {
        return {
          contextLabel: "Edit Policy",
          text: "There’s no motor policy on file for this customer, so I can’t start a motor policy edit from chat.",
        }
      }
      if (bootstrap.entry === "policy_pick") {
        return {
          contextLabel: "Policy",
          text: "Sure—which policy should we make edits on?",
          endorsementWizard: {
            phase: "policy_pick",
            policies: bootstrap.policies,
            customerName: bootstrap.customerName,
          },
        }
      }
      if (bootstrap.entry === "edit_pick") {
        return {
          contextLabel: "Edit Policy",
          text: helloEditPolicyWhatToUpdatePrompt,
          endorsementWizard: {
            phase: "edit_pick",
            policy: bootstrap.policy,
            customerName: bootstrap.customerName,
          },
        }
      }
      if (bootstrap.entry === "mode_pick") {
        return buildEndorsementModePickBotReply(bootstrap.policy, bootstrap.editKind, bootstrap.customerName)
      }
    }
  }


  if (chatMockCase === "kyc_issuance") {
    const asksDetailed =
      q.includes("full") ||
      (q.includes("detailed") && (q.includes("summary") || q.includes("breakdown"))) ||
      q.includes("agent-facing") ||
      q.includes("as the agent") ||
      (q.includes("payment") && q.includes("kyc") && (q.includes("pre-inspection") || q.includes("pre inspection"))) ||
      (q.includes("send communication") && q.includes("kyc ops")) ||
      q.includes("repeat-call") ||
      q.includes("repeat call") ||
      q.includes("entire case")

    if (asksDetailed) {
      return {
        contextLabel: "Issuance · Honda Activa",
        text: "What matters on this call:",
        steps: [
          { title: "Payment", detail: "Done 12 Feb — not the blocker." },
          { title: "KYC", detail: "Aadhaar maiden vs app married name — auto match fails." },
          { title: "Tone", detail: "4 calls, last Angry — acknowledge before next step." },
          { title: "Pre-inspection", detail: "Hold until KYC clears." },
          { title: "Do next", detail: "Send Communication (re-upload) → email KYC Ops if still stuck." },
        ],
      }
    }

    if (
      q.includes("kyc") ||
      q.includes("aadhaar") ||
      q.includes("name") ||
      q.includes("mismatch") ||
      q.includes("maiden") ||
      q.includes("married") ||
      q.includes("re-upload") ||
      q.includes("activa") ||
      q.includes("pre-inspection") ||
      q.includes("escalat") ||
      q.includes("next step") ||
      q.includes("fix")
    ) {
      return {
        contextLabel: "KYC name mismatch",
        text: "Fast path:",
        steps: [
          { title: "Root cause", detail: "ID name ≠ application name." },
          { title: "Fix", detail: "Send Communication → re-upload / proof." },
          { title: "If heated", detail: "One apology, one action." },
          { title: "Escalate", detail: "After clean retry fails — email KYC Ops + ticket." },
        ],
      }
    }

    return {
      contextLabel: "Issuance queue",
      text: "Open gates:",
      steps: [
        { title: "KYC", detail: "Blocking forward movement." },
        { title: "Pre-inspection", detail: "Waits on KYC." },
        { title: "Act", detail: "Re-upload flow first." },
      ],
    }
  }

  if (
    chatMockCase === "raj_cold_nexon" ||
    chatMockCase === "raj_raise_claim_nexon_gmc" ||
    chatMockCase === "raj_live_listening_raise_claim"
  ) {
    const isCoverageQuickAsk =
      (q.includes("cover") && (q.includes("nexon") || q.includes("comprehens") || q.includes("comprehensive") || q.includes("car_") || q.includes("policy"))) ||
      (q.includes("what") && q.includes("cover")) ||
      q.includes("whats covered") ||
      q.includes("what's covered")
    if (isCoverageQuickAsk) {
      return {
        contextLabel: "Tata Nexon · comprehensive",
        text: "Schedule beats memory:",
        insightBlocks: [
          { title: "OD", body: "Own car damage per wordings; check excess & add-ons on schedule." },
          { title: "TP", body: "Third-party liability within limits." },
          { title: "On call", body: "Open live policy before you quote amounts." },
        ],
      }
    }
    if (
      q.includes("cover") ||
      q.includes("comprehens") ||
      q.includes("own damage") ||
      q.includes("od ") ||
      q.includes("tp ") ||
      q.includes("third party") ||
      q.includes("liability") ||
      q.includes("add-on") ||
      q.includes("zero dep") ||
      q.includes("nexon") ||
      q.includes("car_comprehensive") ||
      q.includes("confirm before")
    ) {
      return {
        contextLabel: "Nexon · comprehensive",
        text: "Don’t over-promise:",
        steps: [
          { title: "Baseline", detail: "OD + TP per terms; add-ons only if on schedule." },
          { title: "Check", detail: "Deductible, NCB, repair mode, intimation windows." },
          { title: "If unsure", detail: "Say you’ll confirm from full policy / Claims." },
        ],
      }
    }
    if (
      q.includes("incident") ||
      q.includes("fnol") ||
      q.includes("intimat") ||
      q.includes("accident") ||
      q.includes("theft") ||
      q.includes("first step")
    ) {
      return {
        contextLabel: "New claim intake",
        text: "No JTBD yet — start tight:",
        steps: [
          { title: "30s", detail: "When, where, injuries, FIR if needed." },
          { title: "Expect", detail: "Claim ID after FNOL; docs in-app." },
          { title: "Then", detail: "Raise claim + use Active policy for cover." },
        ],
      }
    }
  }

  if (chatMockCase === SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK) {
    return {
      contextLabel: "Edit name",
      text: "Start here:",
      steps: [
        {
          title: "Clarify",
          detail: "Confirm they need a name correction or spelling update on documents.",
        },
        {
          title: "Narrow policy",
          detail: "Customer holds Swift Dzire motor + ACKO GMC — pick the right policy before creating the workflow.",
        },
      ],
    }
  }

  if (chatMockCase === SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK) {
    const policyCount = workflowChatContext?.activePolicies.length ?? 0
    if (policyCount > 0) {
      return {
        contextLabel: "Edit name",
        text: "Start here:",
        steps: [
          {
            title: "Clarify",
            detail: "Confirm they need a name correction or spelling update on documents.",
          },
          {
            title: "Narrow policy",
            detail: "Customer holds Swift Dzire motor + ACKO GMC — pick the right policy before creating the workflow.",
          },
        ],
      }
    }
    return {
      contextLabel: "Tip",
      text: "Ask what the customer needs in plain language and type it here to get the next best step.",
    }
  }

  if (jtbdType === "renewal") {
    if (q.includes("status") && (q.includes("where") || q.includes("stage") || q.includes("at") || q.includes("glance"))) {
      return {
        contextLabel: "Renewal window",
        text: "At a glance:",
        steps: [
          { title: "Window", detail: "Open — in-window." },
          { title: "NCB", detail: "Eligible — include in quote." },
          { title: "Push", detail: "Decision + pay link before close." },
        ],
      }
    }
    if (
      q.includes("renewal") ||
      q.includes("ncb") ||
      q.includes("no claim") ||
      q.includes("quote") ||
      q.includes("link") ||
      q.includes("whatsapp") ||
      q.includes("sms") ||
      q.includes("reminder") ||
      q.includes("window") ||
      q.includes("decision") ||
      q.includes("confused") ||
      q.includes("order") ||
      q.includes("next") ||
      q.includes("eligib")
    ) {
      return {
        contextLabel: "Renewal + NCB",
        text: "Simple order:",
        steps: [
          { title: "Quote", detail: "Send Alert so NCB is in the price." },
          { title: "Share", detail: "One pay link (WhatsApp/SMS)." },
          { title: "Stuck?", detail: "Brief compare to last year → ask for decision." },
        ],
      }
    }
    return {
      contextLabel: "Renewal",
      text: "Defaults:",
      steps: [
        { title: "Alert first", detail: "Numbers match Status." },
        { title: "One CTA", detail: "Avoid mixed messages." },
        { title: "Note outcome", detail: "For next agent." },
      ],
    }
  }

  if (q.includes("garage") || q.includes("drop-off") || q.includes("confused") || q.includes("preferred garage")) {
    const cap = formatContextCaption(caseContext)
    return {
      contextLabel: cap ? `${cap} · Garage drop-off` : "Garage drop-off",
      text: "Three moves:",
      steps: [
        { title: "App", detail: "Customer opens ACKO app." },
        { title: "Garage", detail: "They pick preferred in claim flow." },
        {
          title: "Stuck",
          detail: "After the in-app nudge, share garage details on WhatsApp if still needed.",
          crmCta: { label: "Send Alert", crmAction: "send_alert" },
        },
      ],
    }
  }

  if (q.includes("status") || q.includes("where") || q.includes("stage")) {
    const cap = formatContextCaption(caseContext)
    return {
      contextLabel: cap ? `${cap} · Status` : "JTBD status",
      text: "From your panel:",
      steps: [
        { title: "Step", detail: "Garage drop-off." },
        { title: "Blocker", detail: "Garage not chosen — yellow nudge." },
        { title: "Align", detail: "Use Send Alert / Send Communication in Agent’s next actions." },
      ],
    }
  }

  return {
    contextLabel: "General",
    text: "Try this:",
    steps: [
      { title: "Status", detail: "Confirm active step + nudges." },
      { title: "CTAs", detail: "Match need to Alert or comms." },
      { title: "Handoff", detail: "Log what you did." },
    ],
  }
}

function BotStepTimeline({
  steps,
  messageId,
}: {
  steps: BotStepLine[]
  messageId: string
}) {
  return (
    <ol className="m-0 list-none p-0" aria-label="Steps">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <li key={`${messageId}-step-${i}`} className="flex gap-3">
            <div className="flex w-4 shrink-0 flex-col items-center pt-1">
              <span className="size-2 shrink-0 rounded-full bg-[#7c47e1] ring-2 ring-[#f5f3fc]" aria-hidden />
              {!isLast ? <span className="mt-1 block h-5 w-px shrink-0 bg-[#e7e7f0]" aria-hidden /> : null}
            </div>
            <div className={cn("min-w-0 flex-1", !isLast && "pb-1")}>
              <p className="font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">{step.title}</p>
              {step.detail ? (
                <p className="mt-0.5 font-euclid text-[12px] leading-[18px] text-[#5b5675]">{step.detail}</p>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function AIChatPanel({
  isActive = false,
  preWrittenMessage = "",
  askInChatNonce = 0,
  onMessageUsed,
  activeJtbdType = "claim",
  chatMockCase = "default",
  caseContext = null,
  onEndorsementPolicySelected,
  contextualWelcomeText,
  workflowChatContext,
  onChatEndorsementWorkflowCreated,
  onChatRaiseClaimWorkflowCreated,
  onGoToRaiseClaimForPolicy,
  onRaiseClaimFlowLoadingChange: _onRaiseClaimFlowLoadingChange,
  chatComposerFocusNonce = 0,
  onOpenClaimHandlerAppointment,
  composerFooterClassName,
  fullBleedComposerAccessory,
  hideHeader = false,
  botReplyDelayMs = 700,
}: AIChatPanelProps = {}) {
  const welcomeText =
    contextualWelcomeText !== undefined && contextualWelcomeText.trim().length > 0
      ? contextualWelcomeText.trim()
      : WELCOME_BOT_TEXT

  const [messages, setMessages] = useState<ChatMessage[]>(() =>
    buildInitialMessages(welcomeText),
  )
  const [input, setInput] = useState("")
  const [spentSunilWorkflowMessageIds, setSpentSunilWorkflowMessageIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [spentEndorsementWizardMessageIds, setSpentEndorsementWizardMessageIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [spentRaiseClaimWizardMessageIds, setSpentRaiseClaimWizardMessageIds] = useState<Set<string>>(
    () => new Set(),
  )
  const [spentIntentDiscoveryIds, setSpentIntentDiscoveryIds] = useState<Set<string>>(() => new Set())
  const [composerChromeFocused, setComposerChromeFocused] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesScrollRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastPrefillNonceRef = useRef(0)
  const lastComposerFocusNonceRef = useRef(0)

  const sunilUnknownComposerSuggestionMatches = useMemo(() => {
    if (chatMockCase !== SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK) return []
    const q = input.trim().toLowerCase()
    if (q.length < 2) return []
    return SUNIL_UNKNOWN_REASON_COMPOSER_SUGGESTIONS.filter((s) => s.sendText.toLowerCase().includes(q))
  }, [chatMockCase, input])

  const scrollToBottom = () => {
    const el = messagesScrollRef.current
    if (el) {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
      return
    }
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
      return
    }
    if (!isActive && inputRef.current) {
      inputRef.current.blur()
    }
  }, [isActive])

  const sendUserText = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")

      window.setTimeout(() => {
        const reply = buildBotReply(
          trimmed,
          activeJtbdType,
          chatMockCase,
          caseContext,
          workflowChatContext,
        )
        const botMessage: ChatMessage = {
          id: `b-${Date.now()}`,
          role: "bot",
          text: reply.text,
          steps: reply.steps,
          insightBlocks: reply.insightBlocks,
          contextLabel: reply.contextLabel,
          policyChoices: reply.policyChoices,
          endorsementWizard: reply.endorsementWizard,
          raiseClaimWizard: reply.raiseClaimWizard,
          claimHandlerScheduler: reply.claimHandlerScheduler,
          raiseClaimGoToPanel: reply.raiseClaimGoToPanel,
          raiseClaimGuidanceLayout: reply.raiseClaimGuidanceLayout,
        }
        setMessages((prev) => [...prev, botMessage])
      }, botReplyDelayMs)
    },
    [
      activeJtbdType,
      botReplyDelayMs,
      chatMockCase,
      caseContext,
      workflowChatContext,
    ],
  )

  useEffect(() => {
    if (!preWrittenMessage?.trim() || !askInChatNonce) return
    if (lastPrefillNonceRef.current === askInChatNonce) return
    lastPrefillNonceRef.current = askInChatNonce
    const text = preWrittenMessage.trim()
    setInput(text)
    onMessageUsed?.()
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      const el = inputRef.current
      if (el) {
        const len = el.value.length
        el.setSelectionRange(len, len)
      }
    })
  }, [askInChatNonce, preWrittenMessage, onMessageUsed])

  useEffect(() => {
    const n = chatComposerFocusNonce ?? 0
    if (n === 0 || lastComposerFocusNonceRef.current === n) return
    lastComposerFocusNonceRef.current = n
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      const el = inputRef.current
      if (el) {
        const len = el.value.length
        el.setSelectionRange(len, len)
      }
    })
  }, [chatComposerFocusNonce, isActive])

  const handleSendMessage = () => {
    sendUserText(input)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  const chatFooterPadding = fullBleedComposerAccessory
    ? "px-4 pb-[max(16px,env(safe-area-inset-bottom))] pt-3 sm:px-5"
    : "p-4"

  return (
    <div
      className={cn(
        "flex h-full min-h-0 w-full flex-col",
        fullBleedComposerAccessory ? "bg-[#f8f7fc]" : "bg-white",
      )}
    >
      {!hideHeader ? (
        <div
          className={cn(
            "flex items-center gap-3 border-b border-[#ececf2] bg-white px-4 shadow-[0_1px_0_rgba(28,11,62,0.04)]",
            fullBleedComposerAccessory ? "py-2.5" : "py-4",
          )}
        >
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f3fc] ring-1 ring-[#e7e7f0]">
            <img
              src="/icons/ai-companion-header.png"
              alt="AI Companion"
              width={40}
              height={40}
              className="h-10 w-10 object-cover"
            />
          </div>
          <div className="min-w-0 flex-1">
            <h3 className="font-euclid text-[14px] font-semibold text-[#2c2067]">AI Companion</h3>
            <p className="font-euclid text-[12px] leading-snug text-[#6c6c80]">
              {fullBleedComposerAccessory
                ? "Pick a path with the chips, or type in the message bar."
                : "Crisp answers for this case"}
            </p>
          </div>
        </div>
      ) : null}

      <div
        ref={messagesScrollRef}
        className={cn(
          "min-h-0 flex-1 overflow-y-auto overflow-x-hidden px-4 py-4",
          fullBleedComposerAccessory ? "bg-[#f8f7fc]" : "bg-white",
        )}
      >
        {messages.length === 0 ? (
          <div className="flex h-full flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f1edfc] to-[#e7f7ee]">
              <Sparkles className="h-6 w-6 text-[#7c47e1]" aria-hidden />
            </div>
            <p className="max-w-[260px] font-euclid text-[14px] font-medium leading-5 text-[#2c2067]">
              Ask anything about this case — short replies, timelines when useful.
            </p>
            <p className="mt-2 font-euclid text-[12px] text-[#6c6c80]">OMNI AI</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) =>
              message.role === "bot" ? (
                <div key={message.id} className="flex w-full items-start gap-2.5">
                  <div
                    className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full bg-[#f5f3fc] shadow-sm ring-1 ring-[#e7e7f0]"
                    aria-hidden
                  >
                    <img
                      src="/icons/ai-companion-message.png"
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 object-cover"
                    />
                  </div>
                  <Card className="min-w-0 flex-1 border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]">
                    <CardContent className="space-y-3 p-3 pt-3">
                      {message.intentDiscoveryPick?.options?.length ? (
                        <>
                          {message.contextLabel ? (
                            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                              {message.contextLabel}
                            </p>
                          ) : null}
                          <p className="font-euclid text-[13px] font-normal leading-5 text-[#36354c]">{message.text}</p>
                          <WorkflowOfferPick
                            options={message.intentDiscoveryPick.options.map((o) => ({
                              key: o.key,
                              label: o.label,
                            }))}
                            disabled={spentIntentDiscoveryIds.has(message.id)}
                            onPick={(key, label) => {
                              if (spentIntentDiscoveryIds.has(message.id)) return
                              setSpentIntentDiscoveryIds((prev) => new Set(prev).add(message.id))
                              const userPick: ChatMessage = {
                                id: `u-intent-${Date.now()}`,
                                role: "user",
                                text: label,
                              }
                              setMessages((prev) => [...prev, userPick])
                              window.setTimeout(() => {
                                if (!workflowChatContext) {
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `b-intent-${Date.now()}`,
                                      role: "bot",
                                      contextLabel: "Tip",
                                      text: "Customer context isn’t loaded—refresh the CRM session.",
                                    },
                                  ])
                                  return
                                }
                                const cn = workflowChatContext.customerName.trim() || "the customer"
                                const policies = workflowChatContext.activePolicies

                                if (key === "something_else") {
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `b-intent-${Date.now()}`,
                                      role: "bot",
                                      contextLabel: "Cold query",
                                      text: "Got it—there’s no pre-built workflow for this journey. Keep helping on the call like a fresh inbound; the ongoing JTBD rail stays empty until work is logged elsewhere.",
                                    },
                                  ])
                                  return
                                }

                                if (key === "kyc_status") {
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `b-intent-${Date.now()}`,
                                      role: "bot",
                                      contextLabel: "KYC / verification",
                                      text: "Quick alignment:",
                                      steps: [
                                        {
                                          title: "Confirm mismatch",
                                          detail:
                                            "Compare policy vs ID name, doc clarity, and last upload — note timestamps.",
                                        },
                                        {
                                          title: "First fix",
                                          detail: "Prefer Send Communication / in-app re-upload before any escalation.",
                                        },
                                        {
                                          title: "Escalate",
                                          detail: "KYC Ops only after a clean retry fails — attach quote ID + audit screenshots.",
                                        },
                                      ],
                                    },
                                  ])
                                  return
                                }

                                if (key === "raise_claim") {
                                  const rb = buildRaiseClaimWizardBootstrap(policies, cn)
                                  if (rb.entry === "no_policies") {
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: `b-intent-${Date.now()}`,
                                        role: "bot",
                                        contextLabel: "Raise claim",
                                        text: "There are no active policies on file — ask the customer to confirm the policy on record.",
                                      },
                                    ])
                                    return
                                  }
                                  if (rb.entry === "policy_pick") {
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: `b-intent-${Date.now()}`,
                                        role: "bot",
                                        contextLabel: "Raise claim",
                                        text: "Which active policy should we raise a claim against?",
                                        raiseClaimWizard: {
                                          phase: "policy_pick",
                                          policies: rb.policies,
                                          customerName: rb.customerName,
                                        },
                                      },
                                    ])
                                    return
                                  }
                                  const reply = buildRaiseClaimWorkflowPickBotReply(rb.policy, rb.customerName)
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `b-intent-${Date.now()}`,
                                      role: "bot",
                                      ...reply,
                                    },
                                  ])
                                  return
                                }

                                if (key === "edit_policy") {
                                  const pickable = listPoliciesForEndorsementPolicyPick(policies)
                                  if (pickable.length === 0) {
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: `b-intent-${Date.now()}`,
                                        role: "bot",
                                        contextLabel: "Edit Policy",
                                        text: "No editable policies found on file—check Active policies first.",
                                      },
                                    ])
                                    return
                                  }
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `b-intent-${Date.now()}`,
                                      role: "bot",
                                      contextLabel: "Policy",
                                      text: "Sure—which policy should we make edits on?",
                                      endorsementWizard: {
                                        phase: "policy_pick",
                                        policies: pickable,
                                        customerName: cn,
                                      },
                                    },
                                  ])
                                }
                              }, 420)
                            }}
                          />
                        </>
                      ) : message.raiseClaimGuidanceLayout ? (
                        <>
                          {message.contextLabel ? (
                            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                              {message.contextLabel}
                            </p>
                          ) : null}
                          {message.text ? (
                            <p className="whitespace-pre-line font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">
                              {message.text}
                            </p>
                          ) : null}
                          <RaiseClaimChatGuidanceSection
                            showGoCta={Boolean(message.raiseClaimGoToPanel)}
                            onGoCta={
                              message.raiseClaimGoToPanel
                                ? () =>
                                    onGoToRaiseClaimForPolicy?.({
                                      policyId: message.raiseClaimGoToPanel!.policyId,
                                    })
                                : undefined
                            }
                          />
                        </>
                      ) : message.insightBlocks && message.insightBlocks.length > 0 ? (
                        <>
                          <p className="font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">{message.text}</p>
                          <div className="space-y-2">
                            {message.insightBlocks.map((block, i) => (
                              <Card
                                key={`${message.id}-insight-${i}`}
                                className="border-[#ececf2] bg-[#fbfbfd] shadow-none"
                              >
                                <CardContent className="space-y-1 p-3 pt-3">
                                  <p className="font-euclid text-[12px] font-semibold leading-4 text-[#36354c]">
                                    {block.title}
                                  </p>
                                  <p className="font-euclid text-[12px] leading-[17px] text-[#5b5675]">{block.body}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </>
                      ) : message.claimHandlerScheduler ? (
                        <>
                          {message.contextLabel ? (
                            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                              {message.contextLabel}
                            </p>
                          ) : null}
                          <p className="whitespace-pre-line font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                            {message.text}
                          </p>
                          <Button
                            type="button"
                            className="h-9 w-full bg-[#7c47e1] font-euclid text-[13px] font-medium text-white hover:bg-[#7c47e1]/90 sm:w-auto"
                            onClick={() => onOpenClaimHandlerAppointment?.()}
                          >
                            Schedule claim handler
                          </Button>
                        </>
                      ) : message.raiseClaimWizard ? (
                        <>
                          {message.contextLabel ? (
                            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                              {message.contextLabel}
                            </p>
                          ) : null}
                          <p className="whitespace-pre-line font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">
                            {message.text}
                          </p>
                          <WorkflowOfferPick
                            options={
                              message.raiseClaimWizard.phase === "policy_pick"
                                ? message.raiseClaimWizard.policies.map((p) => ({
                                    key: p.id,
                                    label: <PolicyChatRadioContent policy={p} />,
                                    userEchoLabel: formatPolicyChatRadioEcho(p),
                                  }))
                                : (() => {
                                    const first = customerFirstNameOrFull(message.raiseClaimWizard.customerName)
                                    return [
                                      { key: "create_workflow", label: "Yes, create new workflow" },
                                      {
                                        key: "steps_only",
                                        label: `No, just list steps to guide ${first}`,
                                      },
                                    ]
                                  })()
                            }
                            disabled={spentRaiseClaimWizardMessageIds.has(message.id)}
                            onPick={(key, label) => {
                              if (spentRaiseClaimWizardMessageIds.has(message.id)) return
                              setSpentRaiseClaimWizardMessageIds((prev) => new Set(prev).add(message.id))
                              const rw = message.raiseClaimWizard!
                              const userPick: ChatMessage = {
                                id: `u-rc-${Date.now()}`,
                                role: "user",
                                text: label,
                              }
                              setMessages((prev) => [...prev, userPick])
                              const raiseClaimWizardDelay = 400
                              window.setTimeout(() => {
                                if (rw.phase === "policy_pick") {
                                  const policy = rw.policies.find((p) => p.id === key)
                                  if (!policy) return
                                  const next = buildRaiseClaimWorkflowPickBotReply(policy, rw.customerName)
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `b-rc-${Date.now()}`,
                                      role: "bot",
                                      text: next.text,
                                      contextLabel: next.contextLabel,
                                      raiseClaimWizard: next.raiseClaimWizard,
                                    },
                                  ])
                                  return
                                }
                                if (rw.phase === "workflow_pick") {
                                  if (key === "create_workflow") {
                                    onChatRaiseClaimWorkflowCreated?.({ policy: rw.policy })
                                    const follow = buildRaiseClaimWorkflowCreatedFollowup()
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: `b-rc-${Date.now()}`,
                                        role: "bot",
                                        text: follow.text,
                                        contextLabel: follow.contextLabel,
                                      },
                                    ])
                                  } else {
                                    const follow = buildRaiseClaimStepsOnlyClaimFollowup(
                                      rw.policy,
                                      rw.customerName,
                                    )
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: `b-rc-${Date.now()}`,
                                        role: "bot",
                                        text: follow.text,
                                        steps: follow.steps,
                                        contextLabel: follow.contextLabel,
                                      },
                                    ])
                                  }
                                }
                              }, raiseClaimWizardDelay)
                            }}
                          />
                        </>
                      ) : message.endorsementWizard ? (
                        <>
                          {message.contextLabel ? (
                            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                              {message.contextLabel}
                            </p>
                          ) : null}
                          <p className="whitespace-pre-line font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                            {message.text}
                          </p>
                          <WorkflowOfferPick
                            options={
                              message.endorsementWizard.phase === "policy_pick"
                                ? message.endorsementWizard.policies.map((p) => ({
                                    key: p.id,
                                    label: <PolicyChatRadioContent policy={p} />,
                                    userEchoLabel: formatPolicyChatRadioEcho(p),
                                  }))
                                : message.endorsementWizard.phase === "edit_pick"
                                  ? endorsementEditRadioOptions().map((o) => ({
                                      key: o.kind,
                                      label: o.label,
                                    }))
                                  : (() => {
                                      const first = customerFirstNameOrFull(
                                        message.endorsementWizard.customerName,
                                      )
                                      return [
                                        { key: "create_workflow", label: "Yes, create new workflow" },
                                        {
                                          key: "steps_only",
                                          label: `No, just list steps to guide ${first}`,
                                        },
                                      ]
                                    })()
                            }
                            disabled={spentEndorsementWizardMessageIds.has(message.id)}
                            onPick={(key, label) => {
                              if (spentEndorsementWizardMessageIds.has(message.id)) return
                              setSpentEndorsementWizardMessageIds((prev) => new Set(prev).add(message.id))
                              const ew = message.endorsementWizard!
                              const userPick: ChatMessage = {
                                id: `u-ew-${Date.now()}`,
                                role: "user",
                                text: label,
                              }
                              setMessages((prev) => [...prev, userPick])
                              const endorsementWizardDelay = 400
                              window.setTimeout(() => {
                                if (ew.phase === "policy_pick") {
                                  const policy = ew.policies.find((p) => p.id === key)
                                  if (!policy) return
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `b-ew-${Date.now()}`,
                                      role: "bot",
                                      contextLabel: "Edit Policy",
                                      text: helloEditPolicyWhatToUpdatePrompt,
                                      endorsementWizard: {
                                        phase: "edit_pick",
                                        policy,
                                        customerName: ew.customerName,
                                      },
                                    },
                                  ])
                                  return
                                }
                                if (ew.phase === "edit_pick") {
                                  const editKind = key as EndorsementEditKind
                                  const next = buildEndorsementModePickBotReply(
                                    ew.policy,
                                    editKind,
                                    ew.customerName,
                                  )
                                  setMessages((prev) => [
                                    ...prev,
                                    {
                                      id: `b-ew-${Date.now()}`,
                                      role: "bot",
                                      text: next.text,
                                      contextLabel: next.contextLabel,
                                      endorsementWizard: next.endorsementWizard,
                                    },
                                  ])
                                  return
                                }
                                if (ew.phase === "mode_pick") {
                                  if (key === "create_workflow") {
                                    onChatEndorsementWorkflowCreated?.({
                                      policy: ew.policy,
                                      editKind: ew.editKind,
                                    })
                                    const follow = buildWorkflowCreatedFollowup(ew.policy, ew.editKind)
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: `b-ew-${Date.now()}`,
                                        role: "bot",
                                        text: follow.text,
                                        steps: follow.steps,
                                        contextLabel: follow.contextLabel,
                                      },
                                    ])
                                  } else {
                                    const follow = buildWorkflowStepsOnlyFollowup(
                                      ew.policy,
                                      ew.customerName,
                                      ew.editKind,
                                    )
                                    setMessages((prev) => [
                                      ...prev,
                                      {
                                        id: `b-ew-${Date.now()}`,
                                        role: "bot",
                                        text: follow.text,
                                        steps: follow.steps,
                                        contextLabel: follow.contextLabel,
                                      },
                                    ])
                                  }
                                }
                              }, endorsementWizardDelay)
                            }}
                          />
                        </>
                      ) : message.policyChoices && message.policyChoices.length > 0 ? (
                        <>
                          {message.contextLabel ? (
                            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                              {message.contextLabel}
                            </p>
                          ) : null}
                          <p className="font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">{message.text}</p>
                          <PolicyEndorsementPick
                            options={message.policyChoices}
                            disabled={spentSunilWorkflowMessageIds.has(message.id)}
                            onCreateWorkflow={(pk) => {
                              if (spentSunilWorkflowMessageIds.has(message.id)) return
                              setSpentSunilWorkflowMessageIds((prev) => new Set(prev).add(message.id))
                              onEndorsementPolicySelected?.(pk)
                              const follow = buildSunilFollowUpBotReply(pk)
                              setMessages((prev) => [
                                ...prev,
                                {
                                  id: `b-follow-${Date.now()}-${pk}`,
                                  role: "bot",
                                  text: follow.text,
                                  steps: follow.steps,
                                  contextLabel: follow.contextLabel,
                                },
                              ])
                            }}
                          />
                        </>
                      ) : message.steps && message.steps.length > 0 ? (
                        <>
                          {message.contextLabel ? (
                            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                              {message.contextLabel}
                            </p>
                          ) : null}
                          <p className="font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">{message.text}</p>
                          <BotStepTimeline
                            steps={message.steps}
                            messageId={message.id}
                          />
                        </>
                      ) : (
                        <p className="font-euclid text-[13px] leading-5 text-[#36354c]">{message.text}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div key={message.id} className="flex w-full justify-end">
                  <div className="flex w-full max-w-[90%] items-start justify-end gap-2.5">
                    <Card className="min-w-0 border-0 bg-gradient-to-br from-[#7c47e1] to-[#5a32c9] text-white shadow-[0px_2px_8px_rgba(92,50,201,0.25)]">
                      <CardContent className="p-3 pt-3">
                        <p className="text-left font-euclid text-[13px] font-medium leading-5 text-white">
                          {message.text}
                        </p>
                      </CardContent>
                    </Card>
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#e7e7f0] bg-[#7c47e1]"
                      aria-hidden
                    >
                      <User className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              ),
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div
        className={cn(
          fullBleedComposerAccessory
            ? "border-t border-[#e8e6f0] bg-[#f8f7fc]"
            : "border-t border-[#ececf2] bg-white",
          chatFooterPadding,
          composerFooterClassName,
        )}
      >
        {fullBleedComposerAccessory ? (
          <div className="rounded-[14px] border border-[#e4e1ec] bg-white p-2 shadow-[0_8px_28px_rgba(28,11,62,0.09)]">
            <div className="flex items-center gap-2 sm:gap-3">
              <div className="flex shrink-0 items-center justify-center">{fullBleedComposerAccessory}</div>
              <div className="min-w-0 flex-1">
                <div
                  className={cn(
                    "flex min-h-[44px] items-center gap-2 rounded-full border bg-gradient-to-b from-white to-[#f6f4fb] px-3 py-1.5 shadow-inner shadow-[#ebe8f2]/80 transition-[box-shadow,border-color,ring] duration-200",
                    isActive || composerChromeFocused
                      ? "border-2 border-[#7c47e1] ring-2 ring-[#7c47e1]/20"
                      : "border border-[#dcd8e8]",
                  )}
                >
                  <input
                    ref={inputRef}
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onFocus={() => setComposerChromeFocused(true)}
                    onBlur={() => setComposerChromeFocused(false)}
                    placeholder="Type a message…"
                    aria-label="Message AI Companion"
                    className="min-h-0 flex-1 bg-transparent py-1.5 font-euclid text-[14px] text-[#2c2067] outline-none placeholder:text-[#8c899e]"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={handleSendMessage}
                    disabled={!input.trim()}
                    className="size-9 shrink-0 rounded-full text-[#7c47e1] hover:bg-[#efe9fb] hover:text-[#44277b] disabled:text-[#c4c2d4]"
                    aria-label="Send message"
                  >
                    <Send className="h-4 w-4" strokeWidth={2} />
                  </Button>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className={cn("flex w-full items-end gap-3")}>
            <div className="w-full">
              {sunilUnknownComposerSuggestionMatches.length > 0 ? (
                <div
                  className="mb-2 flex max-h-[min(40vh,220px)] flex-col gap-1 overflow-y-auto rounded-xl border border-[#ececf2] bg-[#fafafa] p-1.5 shadow-sm"
                  role="listbox"
                  aria-label="Suggested messages"
                >
                  {sunilUnknownComposerSuggestionMatches.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      role="option"
                      className="rounded-lg px-3 py-2 text-left font-euclid text-[13px] font-medium text-[#36354c] transition-colors hover:bg-[#f0eef9]"
                      onMouseDown={(e) => {
                        e.preventDefault()
                        sendUserText(s.sendText)
                      }}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              ) : null}
              <div
                className={cn(
                  "flex items-center gap-2 rounded-full border bg-gradient-to-t from-white to-[#f8f7fc] px-3 py-2 shadow-[0px_4px_12px_rgba(28,11,62,0.08)] transition-[box-shadow,border-color,ring] duration-200",
                  isActive || composerChromeFocused
                    ? "border-2 border-[#7c47e1] ring-2 ring-[#7c47e1]/25 shadow-[0_0_0_3px_rgba(124,71,225,0.12),0px_4px_12px_rgba(28,11,62,0.08)]"
                    : "border border-[#e7e7f0]",
                )}
              >
                <input
                  ref={inputRef}
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  onFocus={() => setComposerChromeFocused(true)}
                  onBlur={() => setComposerChromeFocused(false)}
                  placeholder="Ask anything"
                  className="min-h-0 flex-1 bg-transparent px-1 font-euclid text-[13px] text-[#2c2067] outline-none placeholder:text-[#757575]"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={handleSendMessage}
                  disabled={!input.trim()}
                  className="size-9 shrink-0 text-[#7c47e1] hover:bg-[#efe9fb] hover:text-[#44277b] disabled:text-[#c4c2d4]"
                  aria-label="Send message"
                >
                  <Send className="h-4 w-4" strokeWidth={2} />
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
