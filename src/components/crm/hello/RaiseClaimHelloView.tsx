import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { Send, X } from "lucide-react"

import {
  RAISE_CLAIM_CUSTOMER_STEPS,
  RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE,
  RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE,
  raiseClaimTalktrackParts,
} from "@/lib/raiseClaimGuidanceCopy"
import { formatPolicyChatRadioEcho, PolicyChatRadioContent } from "@/lib/policyChatRadioLabel"
import {
  endorsementEditRadioOptions,
  editKindToShortCopyHint,
  formatEndorsementPolicyRadioLabel,
} from "@/lib/endorsementChatWizard"
import { cn, customerFirstNameOrFull } from "@/lib/utils"
import type { Customer, EndorsementEditKind, InactivePolicy, Policy } from "@/types/crm"
import {
  HelloAiBubbleCard,
  HelloClaimRaisedSuccessBody,
  HelloCxBubbleCard,
  HelloPolicyDetailPanelSkeleton,
  HelloRenewalReminderCard,
  TypingIndicator,
  WorkflowPaneShimmerOverlay,
  createHelloChatIdentityStreak,
  helloWorkflowOfferPickShellClass,
  HelloChatColumnBackground,
} from "@/components/crm/hello/HelloChatPrimitives"
import { HelloCustomerProfileBar } from "@/components/crm/hello/HelloCustomerProfileBar"
import { RaiseClaimWorkflowPanel } from "@/components/crm/hello/RaiseClaimWorkflowPanel"
import { EditPolicyWorkflowPanel } from "@/components/crm/hello/EditPolicyWorkflowPanel"
import { PolicyDetailPanel } from "@/components/crm/ActivePoliciesPanel"
import { EndorsementAdvisorPanel } from "@/components/crm/EndorsementAdvisorPanel"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import { Button } from "@/components/ui/button"
import {
  HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS,
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_OPENING_OFFER_ID,
  HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  HELLO_WORKFLOW_PANE_SHIMMER_FADE_MS,
  HELLO_WORKFLOW_PANE_SHIMMER_HOLD_MS,
  HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS,
  helloComposerTriggersRaiseClaimOffer,
  helloFreeTextAckStub,
  helloRaiseClaimChoices,
  helloRaiseClaimVehicleLabel,
  helloClaimRaisedSuccessHeadline,
  helloClaimRaisedSuccessQuotedLine,
  helloDefaultRenewalNudgeAfterClaim,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS,
  HELLO_RENEWAL_NUDGE_AFTER_SUCCESS_MS,
  HELLO_SECOND_ACK_TYPING_INDICATOR_MS,
  HELLO_SELF_SERVE_READ_PAUSE_MS,
  helloSureCreatingWorkflowAck,
  helloSureCreatingWorkflowGaragePoints,
  helloSomethingElseAckComposerAlways,
  helloCxResponderName,
  type HelloRaiseClaimChoiceId,
} from "@/components/crm/hello/helloRaiseClaimCopy"
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
  helloComposerTriggersEditPolicyOffer,
  helloEditPolicyAdvisorScriptForKind,
  helloEditPolicyModeChoices,
  helloEditPolicyModePickMessage,
  helloEditPolicyPolicyholderNameRcTellCustomer,
  helloEditPolicyPolicyPickContextLabel,
  helloEditPolicyPolicyPickPrompt,
  helloEditPolicySureAck,
  helloEditPolicyWhatToUpdatePrompt,
  helloEditPolicyWorkflowSuccessHeadline,
  helloEditPolicyWorkflowSuccessQuotedLine,
  type HelloEditPolicyModeChoiceId,
} from "@/components/crm/hello/helloEditPolicyCopy"
import {
  helloPolicyHeadingNumber,
  helloPolicyHeadingProduct,
  useHelloPolicyDetailPane,
} from "@/components/crm/hello/useHelloPolicyDetailPane"

export type HelloAssistantBody =
  | { kind: "text"; text: string }
  | { kind: "self_serve_tip" }
  | { kind: "self_serve_steps" }
  | { kind: "self_serve_followup" }
  | { kind: "raise_claim_offer"; offerId: string }
  | { kind: "edit_policy_policy_pick"; offerId: string }
  | { kind: "edit_policy_edit_pick"; offerId: string }
  | { kind: "edit_policy_mode_offer"; offerId: string; introText: string }
  | { kind: "edit_policy_self_serve_tip"; editField: EndorsementEditKind }
  | { kind: "edit_policy_self_serve_steps"; editField: EndorsementEditKind }
  | { kind: "edit_policy_self_serve_followup"; editField: EndorsementEditKind }
  | { kind: "edit_policy_workflow_success" }
  | { kind: "claim_raised_success" }
  | { kind: "renewal_reminder"; vehicleLabel: string; daysLeft: number }

export type HelloChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; body: HelloAssistantBody }

export type RaiseClaimHelloViewProps = {
  customer: Customer
  raiseClaimPolicy: Policy
  /** Hello profile bar — policy accordion (Figma 8540:1799). */
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  /** Shown for screen-reader context only (profile uses structured phone). */
  displayPhone?: string
  /** Demo toast when RC email is “sent” — excludes modal; aligns with Classic acknowledgment. */
  onHelloToast?: (message: string) => void
  /**
   * After FNOL success, show a renewal nudge card for another policy. `undefined` uses
   * {@link helloDefaultRenewalNudgeAfterClaim}; pass `null` to hide.
   */
  renewalNudgeAfterClaim?: { vehicleLabel: string; daysLeft: number } | null
  className?: string
}

/** Default Hello split: chat ~46% / workflow pane ~54%. Drag the left edge of the workflow panel to resize (up to ~81% / 150% of default pane width). */
const HELLO_SPLIT_LEFT_DEFAULT_PCT = 46
const HELLO_SPLIT_LEFT_MIN_PCT = 19
const HELLO_SPLIT_LEFT_MAX_PCT = 74

function RaiseClaimOpeningParagraph({ vehicleLabel }: { vehicleLabel: string }) {
  return (
    <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
      <span>Customer is calling for </span>
      <span className="font-bold">Raise a Claim</span>
      <span> on their </span>
      <span className="font-bold">{vehicleLabel}</span>
      <span>, select the appropriate option.</span>
    </p>
  )
}

/** Delay before hiding split grip after leaving companion — allows cursor to reach grip across the gap. */
const HELLO_SPLIT_GRIP_HOVER_BRIDGE_MS = 220

type HelloWorkflowSplitHandleProps = {
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  visible: boolean
}

/** Compact left-edge resize grip (document-level move/up handled by parent). */
function HelloWorkflowSplitHandle({
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  visible,
}: HelloWorkflowSplitHandleProps) {
  if (!visible) return null

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize AI companion and side panel"
      className="pointer-events-auto absolute top-1/2 left-0 z-30 hidden h-11 w-2 -translate-y-1/2 cursor-col-resize select-none bg-transparent hover:bg-[#7c47e1]/[0.06] active:bg-[#7c47e1]/10 lg:block"
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

/**
 * Hello-only transcript — workflow tasks live in {@link RaiseClaimWorkflowPanel}; chat stays conversational.
 */
export function RaiseClaimHelloView({
  customer,
  raiseClaimPolicy,
  activePolicies,
  inactivePolicies,
  displayPhone,
  onHelloToast,
  renewalNudgeAfterClaim,
  className,
}: RaiseClaimHelloViewProps) {
  const typingLabelId = useId()
  const replyTypingLabelId = useId()
  const choicesRevealTypingLabelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const workflowPaneScrollRef = useRef<HTMLDivElement>(null)
  const splitGridRef = useRef<HTMLDivElement>(null)
  /** After `open()`, loading state resets subview — apply endorsements when pane is `ready`. */
  const pendingPolicyDetailSubviewRef = useRef<"detail" | "endorsements" | null>(null)
  const [splitResizeActive, setSplitResizeActive] = useState(false)
  const splitGripHoverBridgeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [leftCompanionHovered, setLeftCompanionHovered] = useState(false)
  const [leftCompanionFocusWithin, setLeftCompanionFocusWithin] = useState(false)
  const [splitGripHovered, setSplitGripHovered] = useState(false)

  const [helloSplitLeftPct, setHelloSplitLeftPct] = useState(HELLO_SPLIT_LEFT_DEFAULT_PCT)
  const [policyDetailSubview, setPolicyDetailSubview] = useState<"detail" | "endorsements">("detail")

  const openerVehicleLabel = helloRaiseClaimVehicleLabel(raiseClaimPolicy)

  const [openingTyping, setOpeningTyping] = useState(true)
  const [openingVisible, setOpeningVisible] = useState(false)
  const [choicesRevealTyping, setChoicesRevealTyping] = useState(false)
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [spentOfferIds, setSpentOfferIds] = useState<Set<string>>(() => new Set())
  const [messages, setMessages] = useState<HelloChatMessage[]>([])
  const [composerText, setComposerText] = useState("")
  const [workflowActive, setWorkflowActive] = useState(false)
  const policyDetailPane = useHelloPolicyDetailPane()
  /** Shimmer mask phases on the right pane when the split opens */
  const [workflowShimmerPhase, setWorkflowShimmerPhase] = useState<"hidden" | "show" | "hide">(
    "hidden",
  )
  /** Typing dots before delayed assistant lines (composer, picks, workflow bridge, RC ack). */
  const [replyTyping, setReplyTyping] = useState(false)
  /** Policy targeted by composer “Edit Policy” flow (set before offer bubble or after multi-policy pick). */
  const [editFlowPolicy, setEditFlowPolicy] = useState<Policy | null>(null)
  /** Field to update — Classic `edit_pick` → `mode_pick` (after policy is known). */
  const [editFlowKind, setEditFlowKind] = useState<EndorsementEditKind | null>(null)
  const [editPolicyWorkflow, setEditPolicyWorkflow] = useState<{
    policy: Policy
    editKind: EndorsementEditKind
  } | null>(null)

  const rightPaneSplit = workflowActive || editPolicyWorkflow !== null || policyDetailPane.isOpen

  const clampSplitLeftPct = useCallback((pct: number) => {
    return Math.min(HELLO_SPLIT_LEFT_MAX_PCT, Math.max(HELLO_SPLIT_LEFT_MIN_PCT, pct))
  }, [])

  const clearSplitGripHoverBridge = useCallback(() => {
    if (splitGripHoverBridgeRef.current) {
      clearTimeout(splitGripHoverBridgeRef.current)
      splitGripHoverBridgeRef.current = null
    }
  }, [])

  const onCompanionMouseEnter = useCallback(() => {
    clearSplitGripHoverBridge()
    setLeftCompanionHovered(true)
  }, [clearSplitGripHoverBridge])

  const onCompanionMouseLeave = useCallback(() => {
    clearSplitGripHoverBridge()
    splitGripHoverBridgeRef.current = window.setTimeout(() => {
      setLeftCompanionHovered(false)
    }, HELLO_SPLIT_GRIP_HOVER_BRIDGE_MS)
  }, [clearSplitGripHoverBridge])

  const onCompanionFocusCapture = useCallback(() => {
    setLeftCompanionFocusWithin(true)
  }, [])

  const onCompanionBlurCapture = useCallback((e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget
    if (next instanceof Node && e.currentTarget.contains(next)) return
    setLeftCompanionFocusWithin(false)
  }, [])

  const onSplitGripEnter = useCallback(() => {
    clearSplitGripHoverBridge()
    setSplitGripHovered(true)
  }, [clearSplitGripHoverBridge])

  const onSplitGripLeave = useCallback(() => {
    setSplitGripHovered(false)
  }, [])

  const handleSplitMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setSplitResizeActive(true)
  }, [])

  useEffect(() => {
    if (!splitResizeActive) return

    const onMove = (e: globalThis.MouseEvent) => {
      const grid = splitGridRef.current
      if (!grid) return
      const r = grid.getBoundingClientRect()
      const w = Math.max(1, r.width)
      setHelloSplitLeftPct(clampSplitLeftPct(((e.clientX - r.left) / w) * 100))
    }
    const onUp = () => setSplitResizeActive(false)

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [splitResizeActive, clampSplitLeftPct])

  useEffect(() => {
    return () => clearSplitGripHoverBridge()
  }, [clearSplitGripHoverBridge])

  useEffect(() => {
    if (!rightPaneSplit) {
      setSplitResizeActive(false)
      setHelloSplitLeftPct(HELLO_SPLIT_LEFT_DEFAULT_PCT)
      setSplitGripHovered(false)
      setLeftCompanionHovered(false)
      setLeftCompanionFocusWithin(false)
      clearSplitGripHoverBridge()
    }
  }, [rightPaneSplit, clearSplitGripHoverBridge])

  useEffect(() => {
    const mode = policyDetailPane.pane.mode
    if (mode === "closed") {
      pendingPolicyDetailSubviewRef.current = null
      setPolicyDetailSubview("detail")
      return
    }
    if (mode === "ready" && pendingPolicyDetailSubviewRef.current) {
      setPolicyDetailSubview(pendingPolicyDetailSubviewRef.current)
      pendingPolicyDetailSubviewRef.current = null
      return
    }
    if (mode === "loading" && !pendingPolicyDetailSubviewRef.current) {
      setPolicyDetailSubview("detail")
    }
  }, [policyDetailPane.pane.mode])

  const pushAssistant = (body: HelloAssistantBody) => {
    const id = `hello-a-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setMessages((prev) => [...prev, { id, role: "assistant", body }])
  }

  useEffect(() => {
    const timeouts: number[] = []
    let cancelled = false
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(window.setTimeout(fn, ms))
    }

    schedule(() => {
      if (cancelled) return
      setOpeningTyping(false)
      setOpeningVisible(true)
      schedule(() => {
        if (cancelled) return
        setChoicesRevealTyping(true)
        schedule(() => {
          if (cancelled) return
          setChoicesRevealTyping(false)
          setChoicesVisible(true)
        }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
      }, HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS)
    }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)

    return () => {
      cancelled = true
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  useEffect(() => {
    if (!workflowActive && !editPolicyWorkflow) {
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
  }, [workflowActive, editPolicyWorkflow])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [
    openingTyping,
    openingVisible,
    choicesRevealTyping,
    messages,
    choicesVisible,
    spentOfferIds,
    workflowActive,
    editPolicyWorkflow,
    policyDetailPane.pane,
    replyTyping,
    workflowShimmerPhase,
  ])

  const handleOpeningPick = (
    choiceId: HelloRaiseClaimChoiceId,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))

    setMessages((prev) => [
      ...prev,
      { id: `hello-user-pick-${Date.now()}`, role: "user", text: userEchoLabel },
    ])

    window.setTimeout(() => {
      if (choiceId === "self_serve") {
        const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
        const readMs = HELLO_SELF_SERVE_READ_PAUSE_MS
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "self_serve_tip" })
          window.setTimeout(() => {
            setReplyTyping(true)
            window.setTimeout(() => {
              setReplyTyping(false)
              pushAssistant({ kind: "self_serve_steps" })
              window.setTimeout(() => {
                setReplyTyping(true)
                window.setTimeout(() => {
                  setReplyTyping(false)
                  pushAssistant({ kind: "self_serve_followup" })
                }, typingMs)
              }, readMs)
            }, typingMs)
          }, readMs)
        }, typingMs)
        return
      }

      if (choiceId === "something_else") {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "text", text: helloSomethingElseAckComposerAlways })
        }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
        return
      }

      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "text", text: helloSureCreatingWorkflowAck })
        window.setTimeout(() => {
          setReplyTyping(true)
          window.setTimeout(() => {
            setReplyTyping(false)
            pushAssistant({ kind: "text", text: helloSureCreatingWorkflowGaragePoints })
            window.setTimeout(() => {
              policyDetailPane.close()
              setEditPolicyWorkflow(null)
              setWorkflowActive(true)
            }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
          }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
        }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerEditPolicyPolicyPick = (
    policyId: string,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    const policy = activePolicies.find((p) => p.id === policyId)
    if (!policy) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))
    setEditFlowPolicy(policy)
    setEditFlowKind(null)
    setMessages((prev) => [
      ...prev,
      { id: `hello-user-edit-policy-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({
          kind: "edit_policy_edit_pick",
          offerId: `composer-edit-field-${Date.now()}`,
        })
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerEditPolicyEditKindPick = (
    editKind: EndorsementEditKind,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    const policy = editFlowPolicy
    if (!policy) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))
    setEditFlowKind(editKind)
    setMessages((prev) => [
      ...prev,
      { id: `hello-user-edit-field-${Date.now()}`, role: "user", text: userEchoLabel },
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
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerEditPolicyModePick = (
    choiceId: HelloEditPolicyModeChoiceId,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    const policy = editFlowPolicy
    const kind = editFlowKind
    if (!policy || !kind) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))
    setMessages((prev) => [
      ...prev,
      { id: `hello-user-edit-pick-${Date.now()}`, role: "user", text: userEchoLabel },
    ])

    const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
    const readMs = HELLO_SELF_SERVE_READ_PAUSE_MS

    window.setTimeout(() => {
      if (choiceId === "self_serve") {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "edit_policy_self_serve_tip", editField: kind })
          window.setTimeout(() => {
            setReplyTyping(true)
            window.setTimeout(() => {
              setReplyTyping(false)
              pushAssistant({ kind: "edit_policy_self_serve_steps", editField: kind })
              window.setTimeout(() => {
                setReplyTyping(true)
                window.setTimeout(() => {
                  setReplyTyping(false)
                  pushAssistant({ kind: "edit_policy_self_serve_followup", editField: kind })
                }, typingMs)
              }, readMs)
            }, typingMs)
          }, readMs)
        }, typingMs)
        return
      }

      const advisorScript = helloEditPolicyAdvisorScriptForKind(kind)

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
                setReplyTyping(true)
                window.setTimeout(() => {
                  setReplyTyping(false)
                  pushAssistant({ kind: "text", text: advisorScript })
                  window.setTimeout(() => {
                    policyDetailPane.close()
                    setWorkflowActive(false)
                    setEditPolicyWorkflow({ policy, editKind: kind })
                  }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
                }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
              }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
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
              setWorkflowActive(false)
              setEditPolicyWorkflow({ policy, editKind: kind })
            }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
          }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
        }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleRcEmailSentFromWorkflow = () => {
    onHelloToast?.("Your email has been queued for delivery.")
  }

  const handleEditPolicyWorkflowComplete = () => {
    window.setTimeout(() => {
      setEditPolicyWorkflow(null)
      setWorkflowActive(false)
      policyDetailPane.close()
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "edit_policy_workflow_success" })
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS)
  }

  const handleFnolCompleteFromWorkflow = () => {
    const renewalNudge =
      renewalNudgeAfterClaim === undefined ? helloDefaultRenewalNudgeAfterClaim : renewalNudgeAfterClaim

    window.setTimeout(() => {
      setWorkflowActive(false)
      policyDetailPane.close()
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "claim_raised_success" })

        if (!renewalNudge) return

        window.setTimeout(() => {
          setReplyTyping(true)
          window.setTimeout(() => {
            setReplyTyping(false)
            pushAssistant({
              kind: "renewal_reminder",
              vehicleLabel: renewalNudge.vehicleLabel,
              daysLeft: renewalNudge.daysLeft,
            })
          }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
        }, HELLO_RENEWAL_NUDGE_AFTER_SUCCESS_MS)
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS)
  }

  const handleSendComposer = () => {
    const trimmed = composerText.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { id: `hello-user-${Date.now()}`, role: "user", text: trimmed }])
    setComposerText("")

    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        if (helloComposerTriggersEditPolicyOffer(trimmed)) {
          if (activePolicies.length === 0) {
            pushAssistant({
              kind: "text",
              text: "No active policy is available to edit right now.",
            })
            return
          }
          if (activePolicies.length >= 2) {
            setEditFlowPolicy(null)
            setEditFlowKind(null)
            pushAssistant({
              kind: "edit_policy_policy_pick",
              offerId: `composer-edit-pick-${Date.now()}`,
            })
          } else {
            setEditFlowPolicy(activePolicies[0]!)
            setEditFlowKind(null)
            pushAssistant({
              kind: "edit_policy_edit_pick",
              offerId: `composer-edit-field-${Date.now()}`,
            })
          }
          return
        }
        if (helloComposerTriggersRaiseClaimOffer(trimmed)) {
          const offerId = `composer-offer-${Date.now()}`
          pushAssistant({ kind: "raise_claim_offer", offerId })
          return
        }
        pushAssistant({ kind: "text", text: helloFreeTextAckStub })
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendComposer()
    }
  }

  const renderAssistantBody = (body: HelloAssistantBody) => {
    switch (body.kind) {
      case "text":
        return (
          <p className="whitespace-pre-line font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            {body.text}
          </p>
        )
      case "claim_raised_success":
        return (
          <HelloClaimRaisedSuccessBody
            headline={helloClaimRaisedSuccessHeadline}
            quotedLine={helloClaimRaisedSuccessQuotedLine}
          />
        )
      case "edit_policy_workflow_success":
        return (
          <HelloClaimRaisedSuccessBody
            headline={helloEditPolicyWorkflowSuccessHeadline}
            quotedLine={helloEditPolicyWorkflowSuccessQuotedLine}
          />
        )
      case "self_serve_tip": {
        const { lead, rc, mid, license, trail } = raiseClaimTalktrackParts
        return (
          <p className="min-w-0 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
            <span className="font-semibold text-[#5b5675]">Tip </span>
            {lead}
            <span className="font-semibold">{rc}</span>
            {mid}
            <span className="font-semibold">{license}</span>
            {trail}
          </p>
        )
      }
      case "self_serve_steps":
        return (
          <div>
            <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#5b5675]">
              Steps to raise claim
            </p>
            <ol className="mt-2.5 list-decimal space-y-2 pl-5 font-euclid text-[14px] leading-6 text-[#36354c] marker:font-medium marker:text-[#5b5675]">
              {RAISE_CLAIM_CUSTOMER_STEPS.map((step, index) => (
                <li key={index}>{step}</li>
              ))}
            </ol>
          </div>
        )
      case "self_serve_followup":
        return (
          <div className="rounded-xl border border-[#e7e7f0] bg-gradient-to-b from-[#fafafa] to-white px-3.5 py-3">
            <p className="mb-2.5 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
              What to tell the customer
            </p>
            <ul className="space-y-2.5">
              <li className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
                {RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE}
              </li>
              <li className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
                {RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE}
              </li>
            </ul>
          </div>
        )
      case "raise_claim_offer":
        return null
      case "edit_policy_policy_pick":
        return null
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
      case "edit_policy_self_serve_steps": {
        const steps =
          body.editField === "policy_holder_name"
            ? EDIT_POLICY_POLICYHOLDER_NAME_CUSTOMER_STEPS
            : EDIT_POLICY_CUSTOMER_STEPS
        return (
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
        )
      }
      case "edit_policy_self_serve_followup": {
        const tatLine =
          body.editField === "policy_holder_name"
            ? EDIT_POLICY_POLICYHOLDER_NAME_TAT_LINE
            : EDIT_POLICY_CUSTOMER_TAT_LINE
        return (
          <div className="rounded-xl border border-[#e7e7f0] bg-gradient-to-b from-[#fafafa] to-white px-3.5 py-3">
            <p className="mb-2.5 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
              What to tell the customer
            </p>
            <ul className="space-y-2.5">
              <li className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
                {tatLine}
              </li>
              <li className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
                {EDIT_POLICY_HEALTH_NOTE_LINE}
              </li>
            </ul>
          </div>
        )
      }
      case "renewal_reminder":
        return null
    }
  }

  const renderRaiseClaimAssistantMessageGroup = (
    message: HelloChatMessage & { role: "assistant" },
    streak: ReturnType<typeof createHelloChatIdentityStreak>,
  ): ReactNode => {
    const body = message.body
    if (body.kind === "raise_claim_offer") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <RaiseClaimOpeningParagraph vehicleLabel={openerVehicleLabel} />
            </HelloAiBubbleCard>
          </div>
          <div className={helloWorkflowOfferPickShellClass}>
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={helloRaiseClaimChoices.map((c) => ({
                  key: c.id,
                  label: c.label,
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleOpeningPick(key as HelloRaiseClaimChoiceId, label, body.offerId)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "edit_policy_policy_pick") {
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
                options={activePolicies.map((p) => ({
                  key: p.id,
                  label: <PolicyChatRadioContent policy={p} />,
                  userEchoLabel: formatPolicyChatRadioEcho(p),
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleComposerEditPolicyPolicyPick(key, label, body.offerId)
                }
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

  /** Rounded shell only for the workflow pane — chat sits flush on page `#fafafa`. */
  const workflowPaneShellClass =
    "overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_2px_rgba(54,53,76,0.04)] motion-safe:transition-[box-shadow,transform] motion-safe:duration-300 motion-safe:ease-out"

  /** Desktop: animate column widths so the chat pane squeezes while workflow emerges (grid-template-columns). */
  const splitShellTransitionClass =
    "motion-safe:lg:transition-[grid-template-columns,gap] motion-safe:lg:duration-[700ms] motion-safe:lg:ease-[cubic-bezier(0.22,1,0.36,1)]"

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

              {openingVisible ? (
                <>
                  <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                    <RaiseClaimOpeningParagraph vehicleLabel={openerVehicleLabel} />
                  </HelloAiBubbleCard>
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
                  {choicesVisible ? (
                    <div className={helloWorkflowOfferPickShellClass}>
                      <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                        <WorkflowOfferPick
                          options={helloRaiseClaimChoices.map((c) => ({
                            key: c.id,
                            label: c.label,
                          }))}
                          disabled={spentOfferIds.has(HELLO_OPENING_OFFER_ID)}
                          onPick={(key, label) =>
                            handleOpeningPick(key as HelloRaiseClaimChoiceId, label, HELLO_OPENING_OFFER_ID)
                          }
                        />
                      </HelloAiBubbleCard>
                    </div>
                  ) : null}
                </>
              ) : null}

              {messages.map((message) => {
                if (message.role === "assistant") {
                  if (message.body.kind === "renewal_reminder") {
                    streak.markAssistantBubbleSurface()
                    return (
                      <div key={message.id} className="min-w-0 max-w-full">
                        <HelloRenewalReminderCard
                          vehicleLabel={message.body.vehicleLabel}
                          daysLeft={message.body.daysLeft}
                        />
                      </div>
                    )
                  }
                  return renderRaiseClaimAssistantMessageGroup(message, streak)
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
      {/* Single floating bar: elevated pill with inline input + send — not a separate tiny FAB */}
      <div className="mx-auto flex w-full max-w-2xl min-w-0 justify-center">
        <div
          className={cn(
            "flex w-full min-w-0 items-end gap-2 rounded-3xl border border-[#e7e7f0] bg-white py-2 pl-4 pr-2 sm:pl-5 sm:pr-1.5",
            "shadow-[0px_12px_40px_rgba(54,53,76,0.14),0px_4px_12px_rgba(54,53,76,0.06)]",
            "ring-1 ring-[#36354c]/[0.05]",
          )}
        >
          <label htmlFor="raise-claim-hello-composer" className="sr-only">
            Message as CX — {helloCxResponderName}
          </label>
          <textarea
            id="raise-claim-hello-composer"
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
  )

  const showSplitGrip =
    rightPaneSplit &&
    (splitResizeActive ||
      splitGripHovered ||
      leftCompanionHovered ||
      leftCompanionFocusWithin)

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
      onMouseEnter={onCompanionMouseEnter}
      onMouseLeave={onCompanionMouseLeave}
      onFocusCapture={onCompanionFocusCapture}
      onBlurCapture={onCompanionBlurCapture}
    >
      {companionHeaderAndMessages}
      {companionComposer}
    </div>
  )

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
      data-omni-ai-surface="hello-raise-claim"
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#fafafa]",
        className,
      )}
      aria-label="Raise a claim — Hello view"
    >
      <HelloCustomerProfileBar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
        onActivePolicyViewDetails={(p) => {
          pendingPolicyDetailSubviewRef.current = null
          policyDetailPane.open(p)
          setWorkflowActive(false)
          setEditPolicyWorkflow(null)
        }}
      />

      <div
        ref={splitGridRef}
        className={cn(
          "relative flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden px-[40px] pt-5 pb-5 lg:pb-6",
          "lg:grid lg:grid-rows-1 lg:items-stretch",
          rightPaneSplit ? "lg:gap-5" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] lg:gap-0",
          !splitResizeActive && splitShellTransitionClass,
        )}
        style={
          rightPaneSplit
            ? {
                gridTemplateColumns: `minmax(0,${helloSplitLeftPct}%) minmax(0,${100 - helloSplitLeftPct}%)`,
              }
            : undefined
        }
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
              {rightPaneSplit ? (
                <HelloWorkflowSplitHandle
                  visible={showSplitGrip}
                  onMouseDown={handleSplitMouseDown}
                  onMouseEnter={onSplitGripEnter}
                  onMouseLeave={onSplitGripLeave}
                />
              ) : null}
              {policyDetailSubview !== "endorsements" ? (
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
              ) : null}
              <div
                ref={workflowPaneScrollRef}
                className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5"
              >
                {policyDetailLoading ? (
                  <HelloPolicyDetailPanelSkeleton embedded />
                ) : policyDetailSubview === "endorsements" ? (
                  <EndorsementAdvisorPanel
                    key={`hello-raise-claim-endorse-${policyDetailForPane.id}`}
                    variant="helloPane"
                    policy={policyDetailForPane}
                    onBack={() => setPolicyDetailSubview("detail")}
                    headerTrailing={
                      <button
                        type="button"
                        onClick={() => policyDetailPane.close()}
                        className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                        aria-label="Close Edit Policy"
                      >
                        <X className="size-5" aria-hidden />
                      </button>
                    }
                  />
                ) : (
                  <PolicyDetailPanel
                    variant="embedded"
                    policy={policyDetailForPane}
                    onPolicyActionClick={(action, pol) => {
                      if (action === "endorsements") {
                        setPolicyDetailSubview("endorsements")
                        return
                      }
                      onHelloToast?.(`${action}: ${pol.policyNumber}`)
                    }}
                  />
                )}
              </div>
            </div>
          ) : editPolicyWorkflow ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                workflowPaneShellClass,
              )}
            >
              {rightPaneSplit ? (
                <HelloWorkflowSplitHandle
                  visible={showSplitGrip}
                  onMouseDown={handleSplitMouseDown}
                  onMouseEnter={onSplitGripEnter}
                  onMouseLeave={onSplitGripLeave}
                />
              ) : null}
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                <div
                  ref={workflowPaneScrollRef}
                  className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5"
                >
                  <EditPolicyWorkflowPanel
                    key={`hello-edit-policy-${editPolicyWorkflow.policy.id}-${editPolicyWorkflow.editKind}`}
                    customer={customer}
                    policy={editPolicyWorkflow.policy}
                    editKind={editPolicyWorkflow.editKind}
                    scrollContainerRef={workflowPaneScrollRef}
                    onRcEmailSent={handleRcEmailSentFromWorkflow}
                    onClose={() => setEditPolicyWorkflow(null)}
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
          ) : workflowActive ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                workflowPaneShellClass,
              )}
            >
              {rightPaneSplit ? (
                <HelloWorkflowSplitHandle
                  visible={showSplitGrip}
                  onMouseDown={handleSplitMouseDown}
                  onMouseEnter={onSplitGripEnter}
                  onMouseLeave={onSplitGripLeave}
                />
              ) : null}
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                <div
                  ref={workflowPaneScrollRef}
                  className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5"
                >
                  <RaiseClaimWorkflowPanel
                    key="hello-workflow"
                    customer={customer}
                    policy={raiseClaimPolicy}
                    scrollContainerRef={workflowPaneScrollRef}
                    onRcEmailSent={handleRcEmailSentFromWorkflow}
                    onFnolComplete={handleFnolCompleteFromWorkflow}
                    onClose={() => setWorkflowActive(false)}
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
          ) : (
            <div className="relative z-10 hidden min-h-0 min-w-0 lg:block" aria-hidden />
          )}
        </div>
      </div>
    </div>
  )
}
