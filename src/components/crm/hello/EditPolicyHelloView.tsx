import { type KeyboardEvent, type ReactNode, useEffect, useId, useMemo, useRef, useState } from "react"
import { Send, X } from "lucide-react"

import { formatPolicyChatRadioEcho, PolicyChatRadioContent } from "@/lib/policyChatRadioLabel"
import { cn, customerFirstNameOrFull } from "@/lib/utils"
import {
  editKindToShortCopyHint,
  endorsementEditRadioOptions,
  formatEndorsementPolicyRadioLabel,
} from "@/lib/endorsementChatWizard"
import type { Customer, EndorsementEditKind, InactivePolicy, Policy } from "@/types/crm"
import {
  HelloAiBubbleCard,
  HelloChatColumnBackground,
  HelloClaimRaisedSuccessBody,
  HelloCxBubbleCard,
  HelloPolicyDetailPanelSkeleton,
  HelloTellCustomerLabel,
  TypingIndicator,
  WorkflowPaneShimmerOverlay,
  createHelloChatIdentityStreak,
  helloTellCustomerCalloutClass,
  helloWorkflowOfferPickShellClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import {
  HelloCustomerProfileBar,
  helloProfileNonPolicyRibbonAckMessage,
  helloProfileNonPolicyRibbonActionLabel,
  type HelloProfileNonPolicyRibbonActionId,
} from "@/components/crm/hello/HelloCustomerProfileBar"
import { EditPolicyWorkflowPanel } from "@/components/crm/hello/EditPolicyWorkflowPanel"
import { PolicyDetailPanel, HelloPolicyChatDetailCard } from "@/components/crm/ActivePoliciesPanel"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import { Button } from "@/components/ui/button"
import {
  EDIT_POLICY_CUSTOMER_STEPS,
  EDIT_POLICY_CUSTOMER_TAT_LINE,
  EDIT_POLICY_HEALTH_NOTE_LINE,
  EDIT_POLICY_POLICYHOLDER_NAME_CUSTOMER_STEPS,
  EDIT_POLICY_POLICYHOLDER_NAME_TAT_LINE,
  editPolicyPolicyholderNameSelfServeTip,
  editPolicyTalktrackAdvisorEmphasis,
  editPolicyTalktrackLead,
  editPolicyTalktrackMid,
  editPolicyTalktrackRcEmphasis,
  editPolicyTalktrackTrail,
  HELLO_EDIT_POLICY_EDIT_PICK_OPENING_ID,
  HELLO_EDIT_POLICY_MODE_PICK_OPENING_ID,
  HELLO_EDIT_POLICY_POLICY_PICK_OPENING_ID,
  HELLO_PROFILE_RIBBON_DEFAULT_EDIT_KIND,
  helloComposerTriggersEditPolicyOffer,
  helloEditPolicyAdvisorScriptForKind,
  helloEditPolicyModeChoices,
  helloEditPolicyModePickMessage,
  helloEditPolicyPolicyholderNameRcTellCustomer,
  helloEditPolicyPolicyPickContextLabel,
  helloEditPolicyPolicyPickPrompt,
  helloEditPolicySameIssuePrompt,
  helloEditPolicySameIssueYesLabel,
  helloEditPolicySureAck,
  helloEditPolicyWhatToUpdatePrompt,
  helloEditPolicyWorkflowSuccessHeadline,
  helloEditPolicyWorkflowSuccessQuotedLine,
  type HelloEditPolicyModeChoiceId,
} from "@/components/crm/hello/helloEditPolicyCopy"
import {
  HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS,
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  HELLO_SECOND_ACK_TYPING_INDICATOR_MS,
  HELLO_SELF_SERVE_READ_PAUSE_MS,
  HELLO_WORKFLOW_PANE_SHIMMER_FADE_MS,
  HELLO_WORKFLOW_PANE_SHIMMER_HOLD_MS,
  HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS,
  helloFreeTextAckStub,
  helloPolicyBarWorkflowOfferPickOptions,
  helloProfileRibbonPolicyAckMessage,
  helloProfileRibbonPolicyDisplayName,
  helloRaiseClaimChoices,
  helloSomethingElseAckComposerAlways,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS,
  HELLO_POLICY_BAR_ASSISTANCE_PROMPT,
  type HelloPolicyBarActionKey,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import { scheduleHelloProfileRibbonAckSequence } from "@/components/crm/hello/helloProfileRibbonAckSchedule"
import { HelloRibbonBlankSplitPane } from "@/components/crm/hello/HelloRibbonBlankSplitPane"
import {
  helloPolicyHeadingNumber,
  helloPolicyHeadingProduct,
  useHelloPolicyDetailPane,
} from "@/components/crm/hello/useHelloPolicyDetailPane"
import {
  SUNIL_UNKNOWN_REASON_COMPANION_OPENER,
  SUNIL_UNKNOWN_REASON_DEMO_UNLOCK_LOOKUP_DIGITS,
} from "@/data/sunilEditPolicyUseCases"

const SUNIL_UNKNOWN_REASON_HELLO_COMPOSER_SUGGESTIONS: { id: string; label: string; sendText: string }[] = [
  { id: "edit_policy", label: "Edit policy", sendText: "Edit policy" },
]

function SelfServeStepsPanel({ 
  editKind, 
  onCancel, 
  onDone 
}: { 
  editKind: EndorsementEditKind; 
  onCancel?: () => void; 
  onDone?: () => void 
}) {
  const steps = editKind === "policy_holder_name"
    ? EDIT_POLICY_POLICYHOLDER_NAME_CUSTOMER_STEPS
    : EDIT_POLICY_CUSTOMER_STEPS
  
  const tatLine = editKind === "policy_holder_name"
    ? EDIT_POLICY_POLICYHOLDER_NAME_TAT_LINE
    : EDIT_POLICY_CUSTOMER_TAT_LINE

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {/* Header with Cancel button */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
            Customer Steps
          </p>
          <h2 className="mt-1 font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
            Steps for the customer
          </h2>
          <p className="mt-1 font-euclid text-[13px] leading-5 text-[#5b5675]">
            Guide the customer through these steps to complete their edit policy request.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          aria-label="Cancel steps guide"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {/* Steps content */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-xl border border-[#e7e7f0] bg-white p-4">
        <div>
          <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#5b5675]">
            Steps for the customer
          </p>
          <ol className="mt-2.5 list-decimal space-y-2 pl-5 font-euclid text-[14px] leading-6 text-[#36354c] marker:font-medium marker:text-[#5b5675]">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border-l-2 border-[#7c47e1]/35 bg-[#f8f7fc] p-3">
          <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#7c47e1]">
            Tell the customer
          </p>
          <div className="mt-2 space-y-2.5">
            <p className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
              {tatLine}
            </p>
            <p className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
              {EDIT_POLICY_HEALTH_NOTE_LINE}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-[#e7e7f0]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#e7e7f0] bg-white px-4 py-2 font-euclid text-[14px] font-medium text-[#5b5675] transition-colors hover:bg-[#f4f4f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg bg-[#7c47e1] px-4 py-2 font-euclid text-[14px] font-medium text-white transition-colors hover:bg-[#6b3ccd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export type HelloEditAssistantBody =
  | { kind: "text"; text: string }
  | { kind: "policy_pick"; offerId: string }
  | { kind: "edit_policy_same_issue_pick"; offerId: string }
  | { kind: "edit_policy_something_else_composer_ack" }
  | { kind: "edit_policy_edit_pick"; offerId: string }
  | { kind: "edit_policy_mode_offer"; offerId: string; introText: string }
  | { kind: "edit_policy_self_serve_tip"; editField: EndorsementEditKind }
  | { kind: "edit_policy_workflow_success" }
  | { kind: "policy_bar_detail_card"; policyId: string }
  | { kind: "policy_bar_assistance_offer"; policyId: string; offerId: string }

export type HelloEditChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; body: HelloEditAssistantBody }

export type EditPolicyHelloInboundContext = {
  vehicleLabel: string
  impliedMotorPolicyId: string
}

function EditPolicyInboundOpeningParagraph({ vehicleLabel }: { vehicleLabel: string }) {
  return (
    <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
      <span>Customer is calling for </span>
      <span className="font-bold">Edit Policy</span>
      <span> on their </span>
      <span className="font-bold">{vehicleLabel}</span>
      <span>. Select what they want to update on this policy.</span>
    </p>
  )
}

export type EditPolicyHelloViewProps = {
  customer: Customer
  /** Active policies shown in Classic-style policy pick when more than one (e.g. motor + health). */
  pickablePolicies: Policy[]
  inactivePolicies?: InactivePolicy[]
  displayPhone?: string
  /**
   * Sunil UC3 — inbound already scoped to a motor line; skips policy pick and mirrors Raise Claim Hello opening.
   */
  inboundEditPolicyContext?: EditPolicyHelloInboundContext
  /** Sunil UC4 — "Unknown reason" use case where customer calls from different number */
  isUnknownReasonCase?: boolean
  className?: string
}

/**
 * Hello-only Edit Policy transcript — policy pick + support modes match Classic {@link AIChatPanel};
 * right pane hosts {@link EditPolicyWorkflowPanel} or policy details when opened from the bar.
 */
export function EditPolicyHelloView({
  customer,
  pickablePolicies,
  inactivePolicies = [],
  displayPhone,
  inboundEditPolicyContext,
  isUnknownReasonCase = false,
  className,
}: EditPolicyHelloViewProps) {
  const typingLabelId = useId()
  const replyTypingLabelId = useId()
  const choicesRevealTypingLabelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const workflowPaneScrollRef = useRef<HTMLDivElement>(null)

  const needsPolicyPick = pickablePolicies.length >= 2 && !inboundEditPolicyContext

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(() => {
    if (inboundEditPolicyContext) {
      return (
        pickablePolicies.find((p) => p.id === inboundEditPolicyContext.impliedMotorPolicyId) ??
        (pickablePolicies.length === 1 ? pickablePolicies[0]! : null)
      )
    }
    return pickablePolicies.length === 1 ? pickablePolicies[0]! : null
  })

  const workflowPolicy = selectedPolicy ?? pickablePolicies[0]!

  const [openingTyping, setOpeningTyping] = useState(true)
  /** Inbound UC3 — context card after first typing (Raise Claim–style). */
  const [openingInboundIntroVisible, setOpeningInboundIntroVisible] = useState(false)
  /** Classic-style policy wizard — first beat when multiple policies. */
  const [policyPickVisible, setPolicyPickVisible] = useState(false)
  const [choicesRevealTyping, setChoicesRevealTyping] = useState(false)
  /** Opening transcript — “what to edit” radios once policy context is known (skips redundant same-issue gate). */
  const [openingEditPickVisible, setOpeningEditPickVisible] = useState(false)
  /** Opening transcript — workflow vs self-serve after field pick. */
  const [openingModePickVisible, setOpeningModePickVisible] = useState(false)
  const [openingFlowEditKind, setOpeningFlowEditKind] = useState<EndorsementEditKind | null>(null)
  /** Composer thread — selected edit field after {@link edit_policy_edit_pick}. */
  const [composerEditFlowKind, setComposerEditFlowKind] = useState<EndorsementEditKind | null>(null)
  const [spentOfferIds, setSpentOfferIds] = useState<Set<string>>(() => new Set())
  const [messages, setMessages] = useState<HelloEditChatMessage[]>([])
  const [composerText, setComposerText] = useState("")
  const [workflowActive, setWorkflowActive] = useState(false)
  const [activeWorkflowEditKind, setActiveWorkflowEditKind] = useState<EndorsementEditKind | null>(null)
  const [selfServeStepsActive, setSelfServeStepsActive] = useState(false)
  const [selfServeStepsEditKind, setSelfServeStepsEditKind] = useState<EndorsementEditKind | null>(null)
  const policyDetailPane = useHelloPolicyDetailPane()
  const [workflowShimmerPhase, setWorkflowShimmerPhase] = useState<"hidden" | "show" | "hide">(
    "hidden",
  )
  const [replyTyping, setReplyTyping] = useState(false)

  // Unknown reason case - dynamic suggestions
  const sunilUnknownComposerSuggestionMatches = useMemo(() => {
    if (!isUnknownReasonCase) return []
    const q = composerText.trim().toLowerCase()
    if (q.length < 2) return []
    return SUNIL_UNKNOWN_REASON_HELLO_COMPOSER_SUGGESTIONS.filter((s) => s.sendText.toLowerCase().includes(q))
  }, [isUnknownReasonCase, composerText])

  const editPolicySuccessPushedRef = useRef(false)
  const ribbonAckCleanupRef = useRef<(() => void) | null>(null)

  const [extraRibbonPane, setExtraRibbonPane] = useState<
    | null
    | { kind: "non_policy"; action: HelloProfileNonPolicyRibbonActionId }
    | { kind: "raise_claim_stub"; policyLabel: string }
  >(null)

  const rightPaneSplit = workflowActive || policyDetailPane.isOpen || extraRibbonPane !== null || selfServeStepsActive

  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const readMs = HELLO_SELF_SERVE_READ_PAUSE_MS

  const somethingElseChoiceLabel =
    helloRaiseClaimChoices.find((c) => c.id === "something_else")?.label ??
    "Customer called for something else"

  const pushAssistant = (body: HelloEditAssistantBody) => {
    const id = `hello-edit-a-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setMessages((prev) => [...prev, { id, role: "assistant", body }])
  }

  /** After policy is chosen (multi-policy opening): typing → “what to edit” radios. */
  const scheduleEditPickAfterPolicy = () => {
    window.setTimeout(() => {
      setChoicesRevealTyping(true)
      window.setTimeout(() => {
        setChoicesRevealTyping(false)
        setOpeningEditPickVisible(true)
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  useEffect(() => {
    const timeouts: number[] = []
    let cancelled = false
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(window.setTimeout(fn, ms))
    }

    if (inboundEditPolicyContext) {
      schedule(() => {
        if (cancelled) return
        setOpeningTyping(false)
        setOpeningInboundIntroVisible(true)
        schedule(() => {
          if (cancelled) return
          setChoicesRevealTyping(true)
          schedule(() => {
            if (cancelled) return
            setChoicesRevealTyping(false)
            setOpeningEditPickVisible(true)
          }, typingMs)
        }, HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS)
      }, typingMs)
    } else if (isUnknownReasonCase) {
      // Unknown reason case - just show initial message, wait for user input
      schedule(() => {
        if (cancelled) return
        setOpeningTyping(false)
      }, typingMs)
    } else {
      schedule(() => {
        if (cancelled) return
        setOpeningTyping(false)
        if (needsPolicyPick) {
          setPolicyPickVisible(true)
          return
        }
        schedule(() => {
          if (cancelled) return
          setChoicesRevealTyping(true)
          schedule(() => {
            if (cancelled) return
            setChoicesRevealTyping(false)
            setOpeningEditPickVisible(true)
          }, typingMs)
        }, 0)
      }, typingMs)
    }

    return () => {
      cancelled = true
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [needsPolicyPick, typingMs, inboundEditPolicyContext, isUnknownReasonCase])

  useEffect(() => () => {
    ribbonAckCleanupRef.current?.()
    ribbonAckCleanupRef.current = null
  }, [])

  const prevWorkflowActiveRef = useRef(false)
  useEffect(() => {
    if (workflowActive && !prevWorkflowActiveRef.current) {
      editPolicySuccessPushedRef.current = false
    }
    prevWorkflowActiveRef.current = workflowActive
  }, [workflowActive])

  useEffect(() => {
    if (!workflowActive) {
      setWorkflowShimmerPhase("hidden")
      return
    }
    setWorkflowShimmerPhase("show")
    const toHide = window.setTimeout(() => {
      setWorkflowShimmerPhase("hide")
    }, HELLO_WORKFLOW_PANE_SHIMMER_HOLD_MS)
    const toRemove = window.setTimeout(() => {
      setWorkflowShimmerPhase("hidden")
    }, HELLO_WORKFLOW_PANE_SHIMMER_HOLD_MS + HELLO_WORKFLOW_PANE_SHIMMER_FADE_MS)
    return () => {
      window.clearTimeout(toHide)
      window.clearTimeout(toRemove)
    }
  }, [workflowActive])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [
    openingTyping,
    openingInboundIntroVisible,
    policyPickVisible,
    choicesRevealTyping,
    openingEditPickVisible,
    openingModePickVisible,
    messages,
    spentOfferIds,
    workflowActive,
    policyDetailPane.pane,
    replyTyping,
    workflowShimmerPhase,
    extraRibbonPane,
    selfServeStepsActive,
  ])

  const spend = (offerId: string) => {
    setSpentOfferIds((prev) => new Set(prev).add(offerId))
  }

  const handleHelloPolicyBarAction = (
    actionKey: HelloPolicyBarActionKey,
    policy: Policy,
    offerId: string,
    userEchoLabel: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    spend(offerId)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-policy-bar-${Date.now()}`, role: "user", text: userEchoLabel },
    ])

    if (actionKey === "raise_claim") {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({
          kind: "text",
          text: "To raise a claim, open the Raise Claim workflow from the CRM workspace. This journey is for Edit Policy.",
        })
      }, typingMs)
      return
    }

    if (actionKey === "edit_policy") {
      setSelectedPolicy(policy)
      setComposerEditFlowKind(null)
      setWorkflowActive(false)
      setActiveWorkflowEditKind(null)
      policyDetailPane.close()
      window.setTimeout(() => {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({
            kind: "edit_policy_edit_pick",
            offerId: `policy-bar-edit-field-${Date.now()}`,
          })
        }, typingMs)
      }, HELLO_BOT_REPLY_AFTER_USER_MS)
    }
  }

  const handleOpeningPolicyPick = (policyId: string, userEchoLabel: string) => {
    if (spentOfferIds.has(HELLO_EDIT_POLICY_POLICY_PICK_OPENING_ID)) return
    const policy = pickablePolicies.find((p) => p.id === policyId)
    if (!policy) return
    spend(HELLO_EDIT_POLICY_POLICY_PICK_OPENING_ID)
    setSelectedPolicy(policy)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-policy-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    scheduleEditPickAfterPolicy()
  }

  const handleComposerSameIssuePick = (key: string, userEchoLabel: string, offerId: string) => {
    if (spentOfferIds.has(offerId)) return
    spend(offerId)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-same-issue-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        if (key === "same_issue") {
          pushAssistant({
            kind: "edit_policy_edit_pick",
            offerId: `composer-edit-field-${Date.now()}`,
          })
        } else {
          pushAssistant({ kind: "edit_policy_something_else_composer_ack" })
        }
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerPolicyPick = (policyId: string, userEchoLabel: string, offerId: string) => {
    if (spentOfferIds.has(offerId)) return
    const policy = pickablePolicies.find((p) => p.id === policyId)
    if (!policy) return
    spend(offerId)
    setSelectedPolicy(policy)
    setComposerEditFlowKind(null)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-policy-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({
          kind: "edit_policy_edit_pick",
          offerId: `composer-edit-field-${Date.now()}`,
        })
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const runAfterEditPolicyModeResolved = (
    kind: EndorsementEditKind,
    choiceId: HelloEditPolicyModeChoiceId,
  ) => {
    const advisorScript = helloEditPolicyAdvisorScriptForKind(kind)

    if (choiceId === "self_serve") {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "edit_policy_self_serve_tip", editField: kind })
        window.setTimeout(() => {
          setReplyTyping(true)
          window.setTimeout(() => {
            setReplyTyping(false)
            pushAssistant({ kind: "text", text: "Opening the customer steps guide on the right." })
            window.setTimeout(() => {
              policyDetailPane.close()
              setWorkflowActive(false)
              setActiveWorkflowEditKind(null)
              setSelfServeStepsEditKind(kind)
              setSelfServeStepsActive(true)
            }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
          }, typingMs)
        }, readMs)
      }, typingMs)
      return
    }

    if (kind === "policy_holder_name") {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "text", text: helloEditPolicySureAck })
        window.setTimeout(() => {
          setReplyTyping(true)
          window.setTimeout(() => {
            setReplyTyping(false)
            pushAssistant({ kind: "text", text: helloEditPolicyPolicyholderNameRcTellCustomer })
            window.setTimeout(() => {
              policyDetailPane.close()
              setActiveWorkflowEditKind(kind)
              setWorkflowActive(true)
            }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
          }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
        }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
      }, typingMs)
      return
    }

    setReplyTyping(true)
    window.setTimeout(() => {
      setReplyTyping(false)
      pushAssistant({ kind: "text", text: helloEditPolicySureAck })
      window.setTimeout(() => {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "text", text: advisorScript })
            window.setTimeout(() => {
              policyDetailPane.close()
              setActiveWorkflowEditKind(kind)
              setWorkflowActive(true)
            }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
        }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
      }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
    }, typingMs)
  }

  const handleOpeningEditFieldPick = (kind: EndorsementEditKind, userEchoLabel: string) => {
    if (spentOfferIds.has(HELLO_EDIT_POLICY_EDIT_PICK_OPENING_ID)) return
    spend(HELLO_EDIT_POLICY_EDIT_PICK_OPENING_ID)
    setOpeningFlowEditKind(kind)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-field-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        setOpeningModePickVisible(true)
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleOpeningModePick = (choiceId: HelloEditPolicyModeChoiceId, userEchoLabel: string) => {
    if (spentOfferIds.has(HELLO_EDIT_POLICY_MODE_PICK_OPENING_ID)) return
    const kind = openingFlowEditKind
    if (!kind) return
    spend(HELLO_EDIT_POLICY_MODE_PICK_OPENING_ID)
    setOpeningModePickVisible(false)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-mode-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    window.setTimeout(() => {
      runAfterEditPolicyModeResolved(kind, choiceId)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerEditPolicyEditKindPick = (
    editKind: EndorsementEditKind,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    const policy = selectedPolicy ?? pickablePolicies[0]
    if (!policy) return
    spend(offerId)
    setComposerEditFlowKind(editKind)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-field-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    const policyHead = formatEndorsementPolicyRadioLabel(policy).split("\n")[0]
    const introText = helloEditPolicyModePickMessage({
      policyHead,
      editPhrase: editKindToShortCopyHint(editKind),
      customerFirstName: customerFirstNameOrFull(customer.name),
    })
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({
          kind: "edit_policy_mode_offer",
          offerId: `composer-edit-mode-${Date.now()}`,
          introText,
        })
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerEditPolicyModePick = (
    choiceId: HelloEditPolicyModeChoiceId,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    const kind = composerEditFlowKind
    if (!kind) return
    spend(offerId)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-mode-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    window.setTimeout(() => {
      runAfterEditPolicyModeResolved(kind, choiceId)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const sendUserText = (text: string) => {
    setComposerText("")
    setMessages((prev) => [...prev, { id: `hello-edit-user-${Date.now()}`, role: "user", text }])

    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        
        // Handle "Unknown reason" case with no policies
        if (isUnknownReasonCase && pickablePolicies.length === 0 && helloComposerTriggersEditPolicyOffer(text)) {
          pushAssistant({
            kind: "text",
            text: "Customer has no active policies from this number so can't perform edit, confirm the customer's contact number associated with the policy and update it."
          })
          return
        }

        // For unknown reason case with policies available, be more lenient with edit policy detection
        const isEditPolicyIntent = helloComposerTriggersEditPolicyOffer(text) || 
          (isUnknownReasonCase && pickablePolicies.length > 0 && /\b(edit|policy|change|update|modify)\b/i.test(text))

        if (!isEditPolicyIntent) {
          const fallbackText = isUnknownReasonCase
            ? "Ask what the customer needs in plain language and type it here to get the next best step."
            : helloFreeTextAckStub
          pushAssistant({ kind: "text", text: fallbackText })
          return
        }
        setComposerEditFlowKind(null)
        if (needsPolicyPick && !selectedPolicy) {
          pushAssistant({ kind: "policy_pick", offerId: `composer-edit-pick-${Date.now()}` })
          return
        }
        pushAssistant({
          kind: "edit_policy_edit_pick",
          offerId: `composer-edit-field-${Date.now()}`,
        })
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleSendComposer = () => {
    const trimmed = composerText.trim()
    if (!trimmed) return
    sendUserText(trimmed)
  }

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendComposer()
    }
  }

  const handleEditPolicyWorkflowComplete = () => {
    if (editPolicySuccessPushedRef.current) return
    editPolicySuccessPushedRef.current = true
    window.setTimeout(() => {
      setWorkflowActive(false)
      setActiveWorkflowEditKind(null)
      policyDetailPane.close()
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "edit_policy_workflow_success" })
      }, typingMs)
    }, HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS)
  }

  const renderAssistantBody = (body: HelloEditAssistantBody) => {
    switch (body.kind) {
      case "text":
        return (
          <p className="whitespace-pre-line font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            {body.text}
          </p>
        )
      case "policy_pick":
        return null
      case "edit_policy_same_issue_pick":
        return null
      case "edit_policy_something_else_composer_ack":
        return (
          <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
            {helloSomethingElseAckComposerAlways}
          </p>
        )
      case "edit_policy_edit_pick":
        return null
      case "edit_policy_mode_offer":
        return null
      case "edit_policy_self_serve_tip":
        if (body.editField === "policy_holder_name") {
          return (
            <p className="min-w-0 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
              <span className="font-semibold text-[#5b5675]">Tip </span>
              {editPolicyPolicyholderNameSelfServeTip}
            </p>
          )
        }
        return (
          <p className="min-w-0 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
            <span className="font-semibold text-[#5b5675]">Tip </span>
            {editPolicyTalktrackLead}
            <span className="font-semibold">{editPolicyTalktrackRcEmphasis}</span>
            {editPolicyTalktrackMid}
            <span className="font-semibold">{editPolicyTalktrackAdvisorEmphasis}</span>
            {editPolicyTalktrackTrail}
          </p>
        )
      case "edit_policy_workflow_success":
        return (
          <HelloClaimRaisedSuccessBody
            headline={helloEditPolicyWorkflowSuccessHeadline}
            quotedLine={helloEditPolicyWorkflowSuccessQuotedLine}
          />
        )
      case "policy_bar_detail_card":
        return null
      case "policy_bar_assistance_offer":
        return null
    }
  }

  const renderAssistantMessageGroup = (
    message: HelloEditChatMessage & { role: "assistant" },
    streak: ReturnType<typeof createHelloChatIdentityStreak>,
  ): ReactNode => {
    const body = message.body
    if (body.kind === "policy_bar_detail_card") {
      const policy = pickablePolicies.find((p) => p.id === body.policyId)
      if (!policy) return null
      return (
        <div key={message.id} className="w-full min-w-0 max-w-full">
          <HelloAiBubbleCard fullWidth showIdentity={streak.nextAiBubbleShowIdentity()}>
            <HelloPolicyChatDetailCard policy={policy} />
          </HelloAiBubbleCard>
        </div>
      )
    }
    if (body.kind === "policy_bar_assistance_offer") {
      const policy = pickablePolicies.find((p) => p.id === body.policyId)
      if (!policy) return null
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                {HELLO_POLICY_BAR_ASSISTANCE_PROMPT}
              </p>
            </HelloAiBubbleCard>
          </div>
          <div className={helloWorkflowOfferPickShellClass}>
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={helloPolicyBarWorkflowOfferPickOptions()}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleHelloPolicyBarAction(key as HelloPolicyBarActionKey, policy, body.offerId, label)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "policy_pick") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <>
                <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                  {helloEditPolicyPolicyPickContextLabel}
                </p>
                <p className="mt-2 font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                  {helloEditPolicyPolicyPickPrompt}
                </p>
              </>
            </HelloAiBubbleCard>
          </div>
          <div className={helloWorkflowOfferPickShellClass}>
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={pickablePolicies.map((p) => ({
                  key: p.id,
                  label: <PolicyChatRadioContent policy={p} />,
                  userEchoLabel: formatPolicyChatRadioEcho(p),
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) => handleComposerPolicyPick(key, label, body.offerId)}
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "edit_policy_same_issue_pick") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <p className="font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                {helloEditPolicySameIssuePrompt}
              </p>
            </HelloAiBubbleCard>
          </div>
          <div className={helloWorkflowOfferPickShellClass}>
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={[
                  { key: "same_issue", label: helloEditPolicySameIssueYesLabel },
                  { key: "something_else", label: somethingElseChoiceLabel },
                ]}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) => handleComposerSameIssuePick(key, label, body.offerId)}
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "edit_policy_edit_pick") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <p className="font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                {helloEditPolicyWhatToUpdatePrompt}
              </p>
            </HelloAiBubbleCard>
          </div>
          <div className={helloWorkflowOfferPickShellClass}>
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={endorsementEditRadioOptions().map((o) => ({
                  key: o.kind,
                  label: o.label,
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleComposerEditPolicyEditKindPick(key as EndorsementEditKind, label, body.offerId)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "edit_policy_mode_offer") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <p className="whitespace-pre-line font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                {body.introText}
              </p>
            </HelloAiBubbleCard>
          </div>
          <div className={helloWorkflowOfferPickShellClass}>
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={helloEditPolicyModeChoices(customerFirstNameOrFull(customer.name)).map((c) => ({
                  key: c.id,
                  label: c.label,
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleComposerEditPolicyModePick(key as HelloEditPolicyModeChoiceId, label, body.offerId)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    return (
      <div key={message.id} className="min-w-0 max-w-full">
        <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
          {renderAssistantBody(body)}
        </HelloAiBubbleCard>
      </div>
    )
  }

  const workflowPaneShellClass =
    "overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_2px_rgba(54,53,76,0.04)] motion-safe:transition-[box-shadow,transform] motion-safe:duration-300 motion-safe:ease-out"

  const splitShellTransitionClass =
    "motion-safe:lg:transition-[grid-template-columns,gap] motion-safe:lg:duration-[700ms] motion-safe:lg:ease-[cubic-bezier(0.22,1,0.36,1)]"

  const policyPickOptions = pickablePolicies.map((p) => ({
    key: p.id,
    label: <PolicyChatRadioContent policy={p} />,
    userEchoLabel: formatPolicyChatRadioEcho(p),
  }))

  const companionHeaderAndMessages = (
    <>
      <div
        ref={listRef}
        className="min-h-0 flex flex-1 flex-col items-start gap-3 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0 py-3 [scrollbar-gutter:stable] sm:py-4"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {displayPhone ? (
          <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
        ) : null}

        {(() => {
          const streak = createHelloChatIdentityStreak()
          return (
            <>
              {openingTyping
                ? (() => {
                    const showIdentity = streak.typingIndicatorShowIdentity()
                    streak.afterAiTypingShell()
                    return <TypingIndicator labelId={typingLabelId} showIdentity={showIdentity} />
                  })()
                : null}

              {inboundEditPolicyContext && openingInboundIntroVisible ? (
                <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                  <EditPolicyInboundOpeningParagraph
                    vehicleLabel={inboundEditPolicyContext.vehicleLabel}
                  />
                </HelloAiBubbleCard>
              ) : null}

              {isUnknownReasonCase && !openingTyping && !openingInboundIntroVisible ? (
                <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                  <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                    {SUNIL_UNKNOWN_REASON_COMPANION_OPENER}
                  </p>
                </HelloAiBubbleCard>
              ) : null}

              {needsPolicyPick && policyPickVisible ? (
                <>
                  <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                    <>
                      <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                        {helloEditPolicyPolicyPickContextLabel}
                      </p>
                      <p className="mt-2 font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                        {helloEditPolicyPolicyPickPrompt}
                      </p>
                    </>
                  </HelloAiBubbleCard>
                  <div className={helloWorkflowOfferPickShellClass}>
                    <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                      <WorkflowOfferPick
                        options={policyPickOptions}
                        disabled={spentOfferIds.has(HELLO_EDIT_POLICY_POLICY_PICK_OPENING_ID)}
                        onPick={(key, label) => handleOpeningPolicyPick(key, label)}
                      />
                    </HelloAiBubbleCard>
                  </div>
                </>
              ) : null}

              {choicesRevealTyping
                ? (() => {
                    const showIdentity = streak.typingIndicatorShowIdentity()
                    streak.afterAiTypingShell()
                    return (
                      <TypingIndicator
                        labelId={choicesRevealTypingLabelId}
                        showIdentity={showIdentity}
                      />
                    )
                  })()
                : null}

              {openingEditPickVisible ? (
                <>
                  <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                    <p className="font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                      {helloEditPolicyWhatToUpdatePrompt}
                    </p>
                  </HelloAiBubbleCard>
                  <div className={helloWorkflowOfferPickShellClass}>
                    <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                      <WorkflowOfferPick
                        options={endorsementEditRadioOptions().map((o) => ({
                          key: o.kind,
                          label: o.label,
                        }))}
                        disabled={spentOfferIds.has(HELLO_EDIT_POLICY_EDIT_PICK_OPENING_ID)}
                        onPick={(key, label) =>
                          handleOpeningEditFieldPick(key as EndorsementEditKind, label)
                        }
                      />
                    </HelloAiBubbleCard>
                  </div>
                </>
              ) : null}

              {messages.map((message) => {
                if (message.role === "assistant") {
                  return renderAssistantMessageGroup(message, streak)
                }

                return (
                  <div key={message.id} className="flex w-full min-w-0 justify-end">
                    <HelloCxBubbleCard showIdentity={streak.nextCxBubbleShowIdentity()}>
                      <p className="text-left font-euclid text-[14px] font-medium leading-5 text-white">
                        {message.text}
                      </p>
                    </HelloCxBubbleCard>
                  </div>
                )
              })}

              {openingModePickVisible && openingFlowEditKind ? (
                <>
                  <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                    <p className="whitespace-pre-line font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                      {helloEditPolicyModePickMessage({
                        policyHead: formatEndorsementPolicyRadioLabel(workflowPolicy).split("\n")[0],
                        editPhrase: editKindToShortCopyHint(openingFlowEditKind),
                        customerFirstName: customerFirstNameOrFull(customer.name),
                      })}
                    </p>
                  </HelloAiBubbleCard>
                  <div className={helloWorkflowOfferPickShellClass}>
                    <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                      <WorkflowOfferPick
                        options={helloEditPolicyModeChoices(customerFirstNameOrFull(customer.name)).map((c) => ({
                          key: c.id,
                          label: c.label,
                        }))}
                        disabled={spentOfferIds.has(HELLO_EDIT_POLICY_MODE_PICK_OPENING_ID)}
                        onPick={(key, label) =>
                          handleOpeningModePick(key as HelloEditPolicyModeChoiceId, label)
                        }
                      />
                    </HelloAiBubbleCard>
                  </div>
                </>
              ) : null}

              {replyTyping
                ? (() => {
                    const showIdentity = streak.typingIndicatorShowIdentity()
                    streak.afterAiTypingShell()
                    return <TypingIndicator labelId={replyTypingLabelId} showIdentity={showIdentity} />
                  })()
                : null}
            </>
          )
        })()}
      </div>
    </>
  )

  const companionComposer = (
    <div className="relative z-20 shrink-0 px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <div className="mx-auto flex w-full max-w-2xl min-w-0 justify-center">
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
              "flex w-full min-w-0 items-end gap-2 rounded-3xl border border-[#e7e7f0] bg-white py-2 pl-4 pr-2 sm:pl-5 sm:pr-1.5",
              "shadow-[0px_12px_40px_rgba(54,53,76,0.14),0px_4px_12px_rgba(54,53,76,0.06)]",
              "ring-1 ring-[#36354c]/[0.05]",
            )}
          >
            <label htmlFor="edit-policy-hello-composer" className="sr-only">
              Message as CX
            </label>
            <textarea
              id="edit-policy-hello-composer"
              rows={1}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Type a message…"
              className={cn(
                "max-h-32 min-h-[44px] flex-1 resize-y rounded-2xl bg-[#fafafa]/80 py-2.5 pl-1 font-euclid text-[14px] leading-5 text-[#36354c]",
                "outline-none ring-0 placeholder:text-[#8b87a3]",
                "focus-visible:placeholder:text-[#a39eb8]",
              )}
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSendComposer}
              disabled={!composerText.trim()}
              aria-label="Send message"
              className={cn(
                "mb-0.5 size-11 shrink-0 rounded-full bg-[#7c47e1] text-white shadow-md transition-[box-shadow,transform]",
                "hover:bg-[#6b3ccd] hover:shadow-lg active:scale-[0.98]",
                "disabled:pointer-events-none disabled:opacity-40",
              )}
            >
              <Send className="size-5" aria-hidden strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  const aiCompanionColumn = (
    <div
      className={cn(
        "relative z-10 flex min-h-0 flex-col overflow-hidden",
        HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
        rightPaneSplit
          ? "min-h-0 w-full min-w-0"
          : "min-h-[min(52vh,440px)] w-full min-w-0 lg:min-h-0",
        !rightPaneSplit && "flex-1",
      )}
    >
      {companionHeaderAndMessages}
      {companionComposer}
    </div>
  )

  if (pickablePolicies.length === 0 && !isUnknownReasonCase) {
    return (
      <div
        className={cn("flex min-h-0 flex-1 items-center justify-center bg-[#fafafa] p-6", className)}
        role="alert"
      >
        <p className="font-euclid text-[14px] text-[#5b5675]">No active policies to edit.</p>
      </div>
    )
  }

  const policyDetailForPane =
    policyDetailPane.pane.mode === "closed" ? null : policyDetailPane.pane.policy
  const policyDetailLoading = policyDetailPane.pane.mode === "loading"
  const policyDetailHead =
    policyDetailForPane &&
    ({
      product: helloPolicyHeadingProduct(policyDetailForPane),
      number: helloPolicyHeadingNumber(policyDetailForPane),
    } as const)
  const policyDetailTitleForAria =
    policyDetailHead &&
    [policyDetailHead.product, policyDetailHead.number].filter(Boolean).join(" · ")

  return (
    <div
      data-omni-ai-surface="hello-edit-policy"
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#fafafa]",
        className,
      )}
      aria-label="Edit Policy — Hello view"
    >
      <HelloCustomerProfileBar
        customer={customer}
        activePolicies={pickablePolicies}
        inactivePolicies={inactivePolicies}
        onActivePolicyRibbonAction={(policy, action) => {
          ribbonAckCleanupRef.current?.()
          setSelectedPolicy(policy)
          ribbonAckCleanupRef.current = scheduleHelloProfileRibbonAckSequence({
            setTyping: setReplyTyping,
            appendAck: () => {
              pushAssistant({ kind: "text", text: helloProfileRibbonPolicyAckMessage(policy, action) })
            },
            thenOpen: () => {
              setExtraRibbonPane(null)
              if (action === "view_details" || action === "share_policy_document") {
                setWorkflowActive(false)
                setActiveWorkflowEditKind(null)
                policyDetailPane.open(policy)
                return
              }
              if (action === "edit_policy") {
                policyDetailPane.close()
                setActiveWorkflowEditKind(HELLO_PROFILE_RIBBON_DEFAULT_EDIT_KIND)
                setWorkflowActive(true)
                return
              }
              if (action === "raise_claim") {
                policyDetailPane.close()
                setWorkflowActive(false)
                setActiveWorkflowEditKind(null)
                setExtraRibbonPane({
                  kind: "raise_claim_stub",
                  policyLabel: helloProfileRibbonPolicyDisplayName(policy),
                })
              }
            },
          })
        }}
        onNonPolicyRibbonAction={(action) => {
          ribbonAckCleanupRef.current?.()
          ribbonAckCleanupRef.current = scheduleHelloProfileRibbonAckSequence({
            setTyping: setReplyTyping,
            appendAck: () => {
              pushAssistant({ kind: "text", text: helloProfileNonPolicyRibbonAckMessage(action) })
            },
            thenOpen: () => {
              setWorkflowActive(false)
              setActiveWorkflowEditKind(null)
              policyDetailPane.close()
              setExtraRibbonPane({ kind: "non_policy", action })
            },
          })
        }}
      />

      <div
        className={cn(
          "relative flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden px-[40px] pt-5 pb-5 lg:pb-6",
          "lg:grid lg:grid-rows-1 lg:items-stretch",
          rightPaneSplit
            ? "lg:grid-cols-[minmax(0,46%)_minmax(0,54%)] lg:gap-5"
            : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] lg:gap-0",
          splitShellTransitionClass,
        )}
      >
        <HelloChatColumnBackground />
        {aiCompanionColumn}
        <div
          className={cn(
            "relative z-10 min-h-0 min-w-0 overflow-hidden",
            rightPaneSplit ? "flex min-h-0 flex-1 flex-col lg:h-full" : "contents lg:block",
          )}
        >
          {policyDetailForPane ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                workflowPaneShellClass,
              )}
            >
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e7e7f0] bg-white px-4 py-3 lg:px-5">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                    Policy details
                  </p>
                  <p
                    className="mt-0.5 truncate font-euclid text-[14px] font-semibold leading-5 text-[#040222]"
                    title={policyDetailTitleForAria ?? undefined}
                  >
                    {policyDetailHead?.product}
                    {policyDetailHead?.number ? (
                      <span className="font-normal text-[#5b5675]"> · {policyDetailHead.number}</span>
                    ) : null}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => policyDetailPane.close()}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                  aria-label={`Close policy details for ${policyDetailTitleForAria ?? "policy"}`}
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <div
                ref={workflowPaneScrollRef}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5"
              >
                {policyDetailLoading ? (
                  <HelloPolicyDetailPanelSkeleton embedded />
                ) : (
                  <PolicyDetailPanel variant="embedded" policy={policyDetailForPane} />
                )}
              </div>
            </div>
          ) : workflowActive && activeWorkflowEditKind ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                workflowPaneShellClass,
              )}
            >
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                <div
                  ref={workflowPaneScrollRef}
                  className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5"
                >
                  <EditPolicyWorkflowPanel
                    key={`hello-edit-policy-${workflowPolicy.id}-${activeWorkflowEditKind}`}
                    customer={customer}
                    policy={workflowPolicy}
                    editKind={activeWorkflowEditKind}
                    scrollContainerRef={workflowPaneScrollRef}
                    onClose={() => {
                      setWorkflowActive(false)
                      setActiveWorkflowEditKind(null)
                    }}
                    onEditPolicyWorkflowComplete={handleEditPolicyWorkflowComplete}
                  />
                </div>
                {workflowShimmerPhase !== "hidden" ? (
                  <WorkflowPaneShimmerOverlay
                    exiting={workflowShimmerPhase === "hide"}
                    fadeMs={HELLO_WORKFLOW_PANE_SHIMMER_FADE_MS}
                  />
                ) : null}
              </div>
            </div>
          ) : selfServeStepsActive && selfServeStepsEditKind ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                workflowPaneShellClass,
              )}
            >
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5">
                <SelfServeStepsPanel
                  editKind={selfServeStepsEditKind}
                  onCancel={() => {
                    setSelfServeStepsActive(false)
                    setSelfServeStepsEditKind(null)
                  }}
                  onDone={() => {
                    setSelfServeStepsActive(false)
                    setSelfServeStepsEditKind(null)
                    // Add success message to chat
                    window.setTimeout(() => {
                      setReplyTyping(true)
                      window.setTimeout(() => {
                        setReplyTyping(false)
                        pushAssistant({ 
                          kind: "text", 
                          text: "Steps shared with customer successfully. They can now proceed with the edit policy process using the guidance provided." 
                        })
                      }, 800) // Typing delay
                    }, 300) // Brief pause before typing starts
                  }}
                />
              </div>
            </div>
          ) : extraRibbonPane ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                workflowPaneShellClass,
              )}
            >
              <HelloRibbonBlankSplitPane
                title={
                  extraRibbonPane.kind === "raise_claim_stub"
                    ? "Raise a claim"
                    : helloProfileNonPolicyRibbonActionLabel(extraRibbonPane.action)
                }
                subtitle={
                  extraRibbonPane.kind === "raise_claim_stub" ? extraRibbonPane.policyLabel : null
                }
                onCancel={() => {
                  ribbonAckCleanupRef.current?.()
                  ribbonAckCleanupRef.current = null
                  setExtraRibbonPane(null)
                }}
              />
            </div>
          ) : (
            <div className="relative z-10 hidden min-h-0 min-w-0 lg:block" aria-hidden />
          )}
        </div>
      </div>
    </div>
  )
}
