import {
  type FocusEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { X } from "lucide-react"

import type { Customer, InactivePolicy, JTBD, Policy } from "@/types/crm"
import { ClaimStatusTimeline } from "@/components/crm/ClaimStatusTimeline"
import { PolicyDetailPanel } from "@/components/crm/ActivePoliciesPanel"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import {
  HelloAiBubbleCard,
  HelloChatColumnBackground,
  HelloChatComposerBar,
  HelloClaimRaisedSuccessBody,
  HelloCxBubbleCard,
  HelloPolicyDetailPanelSkeleton,
  HelloWorkflowSplitHandle,
  HELLO_SPLIT_GRIP_HOVER_BRIDGE_MS,
  HELLO_SPLIT_LEFT_DEFAULT_PCT,
  HELLO_SPLIT_LEFT_MAX_PCT,
  HELLO_SPLIT_LEFT_MIN_PCT,
  TypingIndicator,
  createHelloChatIdentityStreak,
  helloSplitShellTransitionClass,
  helloWorkflowOfferPickShellClass,
  helloWorkflowPaneShellClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import { HelloCustomerProfileBar, helloProfileNonPolicyRibbonAckMessage, helloProfileNonPolicyRibbonActionLabel, type HelloProfileNonPolicyRibbonActionId } from "@/components/crm/hello/HelloCustomerProfileBar"
import {
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  helloFopsEscalationSuccessHeadline,
  helloFopsEscalationSuccessQuotedLine,
  helloFreeTextAckStub,
  helloProfileRibbonPolicyAckMessage,
  helloProfileRibbonPolicyDisplayName,
  helloRaiseClaimVehicleLabel,
  type HelloProfilePolicyRibbonAction,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import { scheduleHelloProfileRibbonAckSequence } from "@/components/crm/hello/helloProfileRibbonAckSchedule"
import { HelloRibbonBlankSplitPane } from "@/components/crm/hello/HelloRibbonBlankSplitPane"
import {
  helloPolicyHeadingNumber,
  helloPolicyHeadingProduct,
  useHelloPolicyDetailPane,
} from "@/components/crm/hello/useHelloPolicyDetailPane"
import { cn } from "@/lib/utils"

const HELLO_CLAIM_STATUS_FLOW_OFFER_ID = "claim-status-hello-main-offer"

const HELLO_CLAIM_STATUS_ESCALATE_TOAST = "Escalated to F-ops."

function claimStatusPreviousCxSummaryCopy(jtbd: JTBD): string {
  const raw =
    jtbd.openingQuickSummary?.trim() ||
    jtbd.aiSummary?.bullets?.[0]?.trim() ||
    "Survey follow-up; claim active on file."
  const oneLine = raw.replace(/\s+/g, " ").trim()
  const max = 110
  const body = oneLine.length > max ? `${oneLine.slice(0, max - 1)}…` : oneLine
  return `Brief Summary: ${body}`
}

const HELLO_CLAIM_STATUS_CHOICE_PROMPT = "What would you like to do?"

function EscalateToOpsWireframePanel({ onCancel, onDone }: { onCancel?: () => void; onDone?: () => void }) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      {/* Header with Cancel button */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#8b87a3]">
            Wireframe
          </p>
          <h2 className="mt-1 font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
            Escalate to F-ops
          </h2>
          <p className="mt-1 font-euclid text-[13px] leading-5 text-[#5b5675]">
            Ops workspace preview — fields and actions will render here.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          aria-label="Cancel escalation"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {/* Wireframe content */}
      <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-dashed border-[#e2e4e9] bg-[#fbfbfc] p-4">
        <div className="space-y-2">
          <div className="h-2 w-24 rounded bg-[#e7e7f0]" aria-hidden />
          <div className="h-10 w-full rounded-md bg-[#f4f4f8]" aria-hidden />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-32 rounded bg-[#e7e7f0]" aria-hidden />
          <div className="h-24 w-full rounded-md bg-[#f4f4f8]" aria-hidden />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-28 rounded bg-[#e7e7f0]" aria-hidden />
          <div className="h-16 w-full rounded-md bg-[#f4f4f8]" aria-hidden />
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-[#e2e4e9]">
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

export type ClaimStatusHelloViewProps = {
  customer: Customer
  jtbd: JTBD
  motorPolicy: Policy
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  displayPhone?: string
  /** Retained for CRM wiring; CH scheduler was removed from this Hello journey in favour of Ops escalation. */
  onAppointmentScheduled: (value: { scheduledAt: string; note: string }) => void
  onHelloToast?: (message: string) => void
  className?: string
}

/**
 * Hello-only Claim Status — chat stays conversational; claim timeline and other widgets live in the split right pane.
 */
export function ClaimStatusHelloView({
  customer,
  jtbd,
  motorPolicy,
  activePolicies,
  inactivePolicies,
  displayPhone,
  onAppointmentScheduled: _onAppointmentScheduled,
  onHelloToast,
  className,
}: ClaimStatusHelloViewProps) {
  void _onAppointmentScheduled

  const vehicleLabel = helloRaiseClaimVehicleLabel(motorPolicy)

  const claimChatListRef = useRef<HTMLDivElement>(null)
  const introTypingLabelId = useId()
  const typingB12LabelId = useId()
  const typingB23LabelId = useId()
  const typingChoicesLabelId = useId()
  const composerTypingLabelId = useId()

  const [showIntroTyping, setShowIntroTyping] = useState(true)
  const [showBubble1, setShowBubble1] = useState(false)
  const [showTypingB12, setShowTypingB12] = useState(false)
  const [showBubble2, setShowBubble2] = useState(false)
  const [showTypingB23, setShowTypingB23] = useState(false)
  const [showBubble3, setShowBubble3] = useState(false)
  const [showTypingBeforeChoices, setShowTypingBeforeChoices] = useState(false)
  const [showChoices, setShowChoices] = useState(false)

  const [spentFlowOfferIds, setSpentFlowOfferIds] = useState<Set<string>>(() => new Set())
  const [selectedFlowOfferKey, setSelectedFlowOfferKey] = useState<string | null>(null)

  const [opsEscalatePanelOpen, setOpsEscalatePanelOpen] = useState(false)
  const [composerText, setComposerText] = useState("")
  const [composerAppend, setComposerAppend] = useState<
    { id: string; role: "user" | "assistant"; text: string }[]
  >([])
  const [composerReplyTyping, setComposerReplyTyping] = useState(false)

  const splitGridRef = useRef<HTMLDivElement>(null)
  const [splitResizeActive, setSplitResizeActive] = useState(false)
  const splitGripHoverBridgeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [leftCompanionHovered, setLeftCompanionHovered] = useState(false)
  const [leftCompanionFocusWithin, setLeftCompanionFocusWithin] = useState(false)
  const [splitGripHovered, setSplitGripHovered] = useState(false)
  const [helloSplitLeftPct, setHelloSplitLeftPct] = useState(HELLO_SPLIT_LEFT_DEFAULT_PCT)

  const policyDetailPane = useHelloPolicyDetailPane()

  const ribbonAckCleanupRef = useRef<(() => void) | null>(null)
  const [profileRibbonTyping, setProfileRibbonTyping] = useState(false)
  const [ribbonExtraPane, setRibbonExtraPane] = useState<
    | null
    | { kind: "non_policy"; action: HelloProfileNonPolicyRibbonActionId }
    | { kind: "policy_stub"; title: string; subtitle?: string }
  >(null)

  /** Split starts closed; opens when the agent picks an action that needs the workspace (e.g. claim timeline). */
  const [rightPaneSplit, setRightPaneSplit] = useState(false)

  useEffect(() => () => {
    ribbonAckCleanupRef.current?.()
    ribbonAckCleanupRef.current = null
  }, [])

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

  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const pauseBeforeTypingMs = HELLO_BOT_REPLY_AFTER_USER_MS

  useEffect(() => {
    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) fn()
        }, ms),
      )
    }

    const t0 = typingMs
    schedule(() => setShowIntroTyping(false), t0)
    schedule(() => setShowBubble1(true), t0)

    const t1 = t0 + pauseBeforeTypingMs
    schedule(() => setShowTypingB12(true), t1)
    schedule(() => {
      setShowTypingB12(false)
      setShowBubble2(true)
    }, t1 + typingMs)

    const t2 = t1 + typingMs + pauseBeforeTypingMs
    schedule(() => setShowTypingB23(true), t2)
    schedule(() => {
      setShowTypingB23(false)
      setShowBubble3(true)
    }, t2 + typingMs)

    const t3 = t2 + typingMs + pauseBeforeTypingMs
    schedule(() => setShowTypingBeforeChoices(true), t3)
    schedule(() => {
      setShowTypingBeforeChoices(false)
      setShowChoices(true)
    }, t3 + typingMs)

    return () => {
      cancelled = true
      timeouts.forEach((t) => clearTimeout(t))
    }
  }, [pauseBeforeTypingMs, typingMs])

  useEffect(() => {
    const el = claimChatListRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [
    showIntroTyping,
    showBubble1,
    showTypingB12,
    showBubble2,
    showTypingB23,
    showBubble3,
    showTypingBeforeChoices,
    showChoices,
    opsEscalatePanelOpen,
    policyDetailPane.pane,
    composerAppend,
    composerReplyTyping,
    profileRibbonTyping,
    ribbonExtraPane,
    rightPaneSplit,
  ])

  const handleSendComposer = useCallback(() => {
    const trimmed = composerText.trim()
    if (!trimmed) return
    const base = `${Date.now()}`
    setComposerAppend((prev) => [...prev, { id: `${base}-u`, role: "user", text: trimmed }])
    setComposerText("")
    window.setTimeout(() => {
      setComposerReplyTyping(true)
      window.setTimeout(() => {
        setComposerReplyTyping(false)
        setComposerAppend((prev) => [
          ...prev,
          { id: `${base}-a`, role: "assistant", text: helloFreeTextAckStub },
        ])
      }, typingMs)
    }, pauseBeforeTypingMs)
  }, [composerText, pauseBeforeTypingMs, typingMs])

  const handleClaimStatusFlowPick = useCallback(
    (key: string, userEchoLabel: string) => {
      if (spentFlowOfferIds.has(HELLO_CLAIM_STATUS_FLOW_OFFER_ID)) return
      setSpentFlowOfferIds((prev) => new Set(prev).add(HELLO_CLAIM_STATUS_FLOW_OFFER_ID))
      setSelectedFlowOfferKey(key)
      setComposerAppend((prev) => [...prev, { id: `claim-flow-u-${Date.now()}`, role: "user", text: userEchoLabel }])

      // Open the correct right-pane surface immediately. If we only update after typing delays, a split that
      // already shows the default timeline (e.g. after "something else") stays on claim status until then.
      if (key === "escalate_f_ops") {
        setRightPaneSplit(true)
        setRibbonExtraPane(null)
        policyDetailPane.close()
        setOpsEscalatePanelOpen(true)
        onHelloToast?.(HELLO_CLAIM_STATUS_ESCALATE_TOAST)
      } else if (key === "view_communication_history") {
        setRightPaneSplit(true)
        setOpsEscalatePanelOpen(false)
        policyDetailPane.close()
        setRibbonExtraPane({ kind: "non_policy", action: "communication_history" })
      } else if (key === "something_else" || key === "view_claim_status_timeline") {
        setRightPaneSplit(true)
        setOpsEscalatePanelOpen(false)
        policyDetailPane.close()
        setRibbonExtraPane(null)
      }

      window.setTimeout(() => {
        setComposerReplyTyping(true)
        window.setTimeout(() => {
          setComposerReplyTyping(false)
          if (key === "escalate_f_ops") {
            setComposerAppend((prev) => [
              ...prev,
              {
                id: `claim-flow-a-${Date.now()}`,
                role: "assistant",
                text: "Opening the F-ops escalation workspace on the right.",
              },
            ])
            return
          }
          if (key === "view_communication_history") {
            setComposerAppend((prev) => [
              ...prev,
              {
                id: `claim-flow-a-${Date.now()}`,
                role: "assistant",
                text: "Opening communication history on the right.",
              },
            ])
            return
          }
          if (key === "something_else") {
            setComposerAppend((prev) => [
              ...prev,
              {
                id: `claim-flow-a-${Date.now()}`,
                role: "assistant",
                text: "Opening the claim status workspace on the right — you can review the timeline there.",
              },
            ])
            return
          }
          if (key === "view_claim_status_timeline") {
            setComposerAppend((prev) => [
              ...prev,
              {
                id: `claim-flow-a-${Date.now()}`,
                role: "assistant",
                text: "Opening the claim status timeline on the right.",
              },
            ])
            return
          }
          setComposerAppend((prev) => [
            ...prev,
            {
              id: `claim-flow-a-${Date.now()}`,
              role: "assistant",
              text: "Type the customer's call reason in chat to get a resolution.",
            },
          ])
        }, typingMs)
      }, pauseBeforeTypingMs)
    },
    [
      onHelloToast,
      pauseBeforeTypingMs,
      policyDetailPane,
      spentFlowOfferIds,
      typingMs,
    ],
  )

  const helloIdentityStreak = createHelloChatIdentityStreak()

  const companionMessages = (
    <>
      {showIntroTyping
        ? (() => {
            const showIdentity = helloIdentityStreak.typingIndicatorShowIdentity()
            helloIdentityStreak.afterAiTypingShell()
            return <TypingIndicator labelId={introTypingLabelId} showIdentity={showIdentity} />
          })()
        : null}

      {showBubble1 ? (
        <HelloAiBubbleCard
          bubbleWidth="wide"
          showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}
        >
          <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            Customer is calling to ask the Claim Status of their{" "}
            <span className="font-semibold text-[#36354c]">{vehicleLabel}</span>.
          </p>
        </HelloAiBubbleCard>
      ) : null}

      {showTypingB12
        ? (() => {
            const showIdentity = helloIdentityStreak.typingIndicatorShowIdentity()
            helloIdentityStreak.afterAiTypingShell()
            return <TypingIndicator labelId={typingB12LabelId} showIdentity={showIdentity} />
          })()
        : null}

      {showBubble2 ? (
        <HelloAiBubbleCard
          bubbleWidth="wide"
          showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}
        >
          <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            {claimStatusPreviousCxSummaryCopy(jtbd)}
          </p>
        </HelloAiBubbleCard>
      ) : null}

      {showTypingB23
        ? (() => {
            const showIdentity = helloIdentityStreak.typingIndicatorShowIdentity()
            helloIdentityStreak.afterAiTypingShell()
            return <TypingIndicator labelId={typingB23LabelId} showIdentity={showIdentity} />
          })()
        : null}

      {showBubble3 ? (
        <HelloAiBubbleCard
          bubbleWidth="wide"
          showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}
        >
          <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            Best possible action is to escalate this issue to F-ops team.
          </p>
        </HelloAiBubbleCard>
      ) : null}

      {showTypingBeforeChoices
        ? (() => {
            const showIdentity = helloIdentityStreak.typingIndicatorShowIdentity()
            helloIdentityStreak.afterAiTypingShell()
            return <TypingIndicator labelId={typingChoicesLabelId} showIdentity={showIdentity} />
          })()
        : null}

      {showChoices ? (
        <div className={helloWorkflowOfferPickShellClass}>
          <HelloAiBubbleCard
            bubbleWidth="wide"
            showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}
          >
            <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
              {HELLO_CLAIM_STATUS_CHOICE_PROMPT}
            </p>
            <div className="mt-3">
              <WorkflowOfferPick
                options={[
                  { key: "escalate_f_ops", label: "Escalate to F-ops" },
                  { key: "view_communication_history", label: "View Communication history" },
                  { key: "view_claim_status_timeline", label: "View claim status" },
                  { key: "something_else", label: "Customer calling for something else." },
                ]}
                disabled={spentFlowOfferIds.has(HELLO_CLAIM_STATUS_FLOW_OFFER_ID)}
                selectedKey={selectedFlowOfferKey}
                onPick={handleClaimStatusFlowPick}
              />
            </div>
          </HelloAiBubbleCard>
        </div>
      ) : null}
    </>
  )

  const appendedComposerBlock = (() => {
    let prev: "assistant" | "user" | null = "assistant"
    const nodes: ReactNode[] = []

    for (const row of composerAppend) {
      if (row.role === "user") {
        const showIdentity = prev !== "user"
        prev = "user"
        nodes.push(
          <div key={row.id} className="w-full min-w-0">
            <HelloCxBubbleCard showIdentity={showIdentity}>
              <p className="text-left font-euclid text-[14px] font-medium leading-5 text-white">
                {row.text}
              </p>
            </HelloCxBubbleCard>
          </div>,
        )
      } else {
        const showIdentity = prev !== "assistant"
        prev = "assistant"
        nodes.push(
          <HelloAiBubbleCard key={row.id} bubbleWidth="wide" showIdentity={showIdentity}>
            {row.id.includes("escalation-success") ? (
              <HelloClaimRaisedSuccessBody
                headline={helloFopsEscalationSuccessHeadline}
                quotedLine={helloFopsEscalationSuccessQuotedLine}
              />
            ) : (
              <p className="font-euclid text-[14px] leading-5 text-[#36354c]">{row.text}</p>
            )}
          </HelloAiBubbleCard>,
        )
      }
    }

    if (composerReplyTyping || profileRibbonTyping) {
      const showIdentity = prev !== "assistant"
      nodes.push(
        <TypingIndicator
          key="claim-status-append-typing"
          labelId={composerTypingLabelId}
          showIdentity={showIdentity}
        />,
      )
    }

    return nodes
  })()

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
      <div
        ref={claimChatListRef}
        className="min-h-0 flex w-full min-w-0 flex-1 flex-col items-start gap-3 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0 py-3 [scrollbar-gutter:stable] sm:gap-4 sm:py-4"
        aria-live="polite"
      >
        {displayPhone ? (
          <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
        ) : null}
        <div className="flex w-full min-w-0 max-w-full flex-col gap-3 self-stretch sm:gap-4">
          {companionMessages}
          {appendedComposerBlock}
        </div>
      </div>
      <HelloChatComposerBar
        id="claim-status-hello-composer"
        value={composerText}
        onChange={setComposerText}
        onSend={handleSendComposer}
      />
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

  const appendComposerAssistant = useCallback((text: string) => {
    const id = `claim-status-ribbon-a-${Date.now()}`
    setComposerAppend((prev) => [...prev, { id, role: "assistant", text }])
  }, [])

  const handleProfileRibbonPolicy = useCallback(
    (policy: Policy, action: HelloProfilePolicyRibbonAction) => {
      ribbonAckCleanupRef.current?.()
      ribbonAckCleanupRef.current = scheduleHelloProfileRibbonAckSequence({
        setTyping: setProfileRibbonTyping,
        appendAck: () => {
          appendComposerAssistant(helloProfileRibbonPolicyAckMessage(policy, action))
        },
        thenOpen: () => {
          setRibbonExtraPane(null)
          if (action === "view_details" || action === "share_policy_document") {
            setRightPaneSplit(true)
            setOpsEscalatePanelOpen(false)
            policyDetailPane.open(policy)
            return
          }
          setRightPaneSplit(true)
          setOpsEscalatePanelOpen(false)
          policyDetailPane.close()
          if (action === "raise_claim") {
            setRibbonExtraPane({
              kind: "policy_stub",
              title: "Raise a claim",
              subtitle: helloProfileRibbonPolicyDisplayName(policy),
            })
            return
          }
          setRibbonExtraPane({
            kind: "policy_stub",
            title: "Edit Policy",
            subtitle: helloProfileRibbonPolicyDisplayName(policy),
          })
        },
      })
    },
    [appendComposerAssistant, policyDetailPane],
  )

  const handleNonPolicyRibbonAction = useCallback(
    (action: HelloProfileNonPolicyRibbonActionId) => {
      ribbonAckCleanupRef.current?.()
      ribbonAckCleanupRef.current = scheduleHelloProfileRibbonAckSequence({
        setTyping: setProfileRibbonTyping,
        appendAck: () => {
          appendComposerAssistant(helloProfileNonPolicyRibbonAckMessage(action))
        },
        thenOpen: () => {
          setRightPaneSplit(true)
          setOpsEscalatePanelOpen(false)
          policyDetailPane.close()
          setRibbonExtraPane({ kind: "non_policy", action })
        },
      })
    },
    [appendComposerAssistant, policyDetailPane],
  )

  return (
    <div
      data-omni-ai-surface="hello-claim-status"
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#fafafa]",
        className,
      )}
      aria-label="Claim status — Hello view"
    >
      <HelloCustomerProfileBar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
        onActivePolicyRibbonAction={handleProfileRibbonPolicy}
        onNonPolicyRibbonAction={handleNonPolicyRibbonAction}
      />

      <div
        ref={splitGridRef}
        className={cn(
          "relative flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden px-[40px] pt-5 pb-5 lg:pb-6",
          "lg:grid lg:grid-rows-1 lg:items-stretch",
          rightPaneSplit ? "lg:gap-5" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] lg:gap-0",
          !splitResizeActive && helloSplitShellTransitionClass,
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
          {ribbonExtraPane ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                helloWorkflowPaneShellClass,
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
              <HelloRibbonBlankSplitPane
                title={
                  ribbonExtraPane.kind === "non_policy"
                    ? helloProfileNonPolicyRibbonActionLabel(ribbonExtraPane.action)
                    : ribbonExtraPane.title
                }
                subtitle={ribbonExtraPane.kind === "policy_stub" ? ribbonExtraPane.subtitle : null}
                onCancel={() => {
                  ribbonAckCleanupRef.current?.()
                  ribbonAckCleanupRef.current = null
                  setRibbonExtraPane(null)
                }}
              />
            </div>
          ) : opsEscalatePanelOpen ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                helloWorkflowPaneShellClass,
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
                <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5">
                  <EscalateToOpsWireframePanel
                    onCancel={() => {
                      setRightPaneSplit(false)
                      setOpsEscalatePanelOpen(false)
                    }}
                    onDone={() => {
                      setRightPaneSplit(false)
                      setOpsEscalatePanelOpen(false)
                      // Add success message to chat
                      window.setTimeout(() => {
                        setComposerReplyTyping(true)
                        window.setTimeout(() => {
                          setComposerReplyTyping(false)
                          setComposerAppend((prev) => [
                            ...prev,
                            {
                              id: `escalation-success-${Date.now()}`,
                              role: "assistant",
                              text: helloFopsEscalationSuccessHeadline,
                            },
                          ])
                        }, 800) // Typing delay
                      }, 300) // Brief pause before typing starts
                    }}
                  />
                </div>
              </div>
            </div>
          ) : policyDetailForPane ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                helloWorkflowPaneShellClass,
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
                  onClick={() => {
                    policyDetailPane.close()
                    setRibbonExtraPane(null)
                  }}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                  aria-label={`Close policy details for ${policyDetailTitleForAria ?? "policy"}`}
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5">
                {policyDetailLoading ? (
                  <HelloPolicyDetailPanelSkeleton embedded />
                ) : (
                  <PolicyDetailPanel
                    variant="embedded"
                    policy={policyDetailForPane}
                    onPolicyActionClick={(action, pol) => {
                      onHelloToast?.(`${action}: ${pol.policyNumber}`)
                    }}
                  />
                )}
              </div>
            </div>
          ) : (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                helloWorkflowPaneShellClass,
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
              <div className="flex shrink-0 items-start justify-between gap-3 border-b border-[#e7e7f0] bg-white px-4 py-3 lg:px-5">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                    Claim status
                  </p>
                  <p className="truncate font-euclid text-[14px] font-semibold leading-5 text-[#040222]">
                    {vehicleLabel}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setRightPaneSplit(false)
                    setOpsEscalatePanelOpen(false)
                    policyDetailPane.close()
                    setRibbonExtraPane(null)
                  }}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                  aria-label="Close claim status workspace"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5">
                <ClaimStatusTimeline steps={jtbd.status} jtbdType={jtbd.type} />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
