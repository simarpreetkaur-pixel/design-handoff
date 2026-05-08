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

import type { Customer, InactivePolicy, JTBD, Policy } from "@/types/crm"
import { ClaimStatusTimeline } from "@/components/crm/ClaimStatusTimeline"
import {
  HelloAiBubbleCard,
  HelloChatColumnBackground,
  HelloChatComposerBar,
  HelloCxBubbleCard,
  HelloWorkflowSplitHandle,
  HELLO_SPLIT_GRIP_HOVER_BRIDGE_MS,
  HELLO_SPLIT_LEFT_DEFAULT_PCT,
  HELLO_SPLIT_LEFT_MAX_PCT,
  HELLO_SPLIT_LEFT_MIN_PCT,
  TypingIndicator,
  createHelloChatIdentityStreak,
  helloSplitShellTransitionClass,
  helloWorkflowPaneShellClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import { HelloCustomerProfileBar } from "@/components/crm/hello/HelloCustomerProfileBar"
import {
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  helloFreeTextAckStub,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

/** Figma Claim Status — Missed survey → escalate to Ops. */
const HELLO_CLAIM_STATUS_ESCALATE_GUIDANCE =
  "The next best action for you is to escalate this to Ops — the survey was missed and repair estimate cannot advance until this is resolved."

const HELLO_CLAIM_STATUS_ESCALATE_TOAST = "Escalated to Ops."

const HELLO_CLAIM_STATUS_ESCALATE_ACK = "Escalation logged for Ops."

function EscalateToOpsWireframePanel() {
  return (
    <div
      className="flex min-h-0 flex-col gap-4"
      role="region"
      aria-label="Escalate to Ops wireframe"
    >
      <div>
        <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#8b87a3]">
          Wireframe
        </p>
        <h2 className="mt-1 font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
          Escalate to Ops
        </h2>
        <p className="mt-1 font-euclid text-[13px] leading-5 text-[#5b5675]">
          Ops workspace preview — fields and actions will render here.
        </p>
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-3 rounded-xl border border-dashed border-[#e2e4e9] bg-[#fbfbfc] p-4">
        <div className="space-y-2">
          <div className="h-2 w-24 rounded bg-[#e7e7f0]" aria-hidden />
          <div className="h-10 w-full rounded-md bg-[#f4f4f8]" aria-hidden />
        </div>
        <div className="space-y-2">
          <div className="h-2 w-32 rounded bg-[#e7e7f0]" aria-hidden />
          <div className="h-24 w-full rounded-md bg-[#f4f4f8]" aria-hidden />
        </div>
        <div className="mt-auto flex flex-wrap gap-2 pt-2">
          <div className="h-9 min-w-[88px] flex-1 rounded-md bg-[#edeafd]" aria-hidden />
          <div className="h-9 min-w-[88px] flex-1 rounded-md bg-[#f4f4f8]" aria-hidden />
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
 * Hello-only UC2 — claim status in-chat: staggered summary → timeline → Ops escalation (survey-pending path).
 */
export function ClaimStatusHelloView({
  customer,
  jtbd,
  motorPolicy: _motorPolicy,
  activePolicies,
  inactivePolicies,
  displayPhone,
  onAppointmentScheduled: _onAppointmentScheduled,
  onHelloToast,
  className,
}: ClaimStatusHelloViewProps) {
  void _motorPolicy
  void _onAppointmentScheduled

  const claimChatListRef = useRef<HTMLDivElement>(null)
  const introTypingLabelId = useId()
  const midTyping1LabelId = useId()
  const midTyping2LabelId = useId()
  const composerTypingLabelId = useId()

  const [showIntroTyping, setShowIntroTyping] = useState(true)
  const [showSummary, setShowSummary] = useState(false)
  const [showMidTyping1, setShowMidTyping1] = useState(false)
  const [showTimeline, setShowTimeline] = useState(false)
  const [showMidTyping2, setShowMidTyping2] = useState(false)
  const [showEscalate, setShowEscalate] = useState(false)

  const [escalateToOpsDone, setEscalateToOpsDone] = useState(false)
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

  const rightPaneSplit = opsEscalatePanelOpen

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

    // typing → summary
    schedule(() => setShowIntroTyping(false), typingMs)
    schedule(() => setShowSummary(true), typingMs)
    // pause → typing → timeline
    schedule(() => setShowMidTyping1(true), typingMs + pauseBeforeTypingMs)
    schedule(() => {
      setShowMidTyping1(false)
      setShowTimeline(true)
    }, typingMs + pauseBeforeTypingMs + typingMs)
    // pause → typing → escalate recommendation
    schedule(
      () => setShowMidTyping2(true),
      typingMs + pauseBeforeTypingMs + typingMs + pauseBeforeTypingMs,
    )
    schedule(
      () => {
        setShowMidTyping2(false)
        setShowEscalate(true)
      },
      typingMs + pauseBeforeTypingMs + typingMs + pauseBeforeTypingMs + typingMs,
    )

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
    showSummary,
    showMidTyping1,
    showTimeline,
    showMidTyping2,
    showEscalate,
    escalateToOpsDone,
    opsEscalatePanelOpen,
    composerAppend,
    composerReplyTyping,
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

  const aiSummary = jtbd.aiSummary
  const timeline = aiSummary?.detailedSummaryTimeline ?? []
  const detailedLabel = aiSummary?.viewDetailsLabel ?? "Detailed summary"

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

      {showSummary ? (
        <HelloAiBubbleCard
          bubbleWidth="wide"
          showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}
        >
          <div className="flex min-w-0 flex-col gap-3">
            <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
              Here&apos;s what we have on file from earlier touchpoints with this customer.
            </p>

            {aiSummary ? (
              <div className="min-w-0 rounded-xl border border-[#ececf2] bg-[#fbfbfd] px-3 py-3 sm:px-4">
                <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                  {aiSummary.sectionHeading ?? "Previous summary"}
                </p>
                <ul className="mt-2 list-disc space-y-1.5 pl-5 font-euclid text-[13px] leading-5 text-[#36354c] marker:text-[#7c47e1]">
                  {aiSummary.bullets.map((b, i) => (
                    <li key={i}>{b}</li>
                  ))}
                </ul>

                {timeline.length > 0 ? (
                  <Accordion type="single" collapsible className="mt-3 w-full">
                    <AccordionItem
                      value="detailed-summary"
                      className="overflow-hidden rounded-lg border border-[#e2e4e9] bg-white"
                    >
                      <AccordionTrigger className="px-3 py-2.5 font-euclid text-[13px] font-semibold leading-5 text-[#36354c] hover:no-underline">
                        {detailedLabel}
                      </AccordionTrigger>
                      <AccordionContent className="border-t border-[#f0f0f6] px-3 pb-3 pt-0">
                        <p className="pt-3 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                          Conversations with other CX
                        </p>
                        <ul className="mt-2 space-y-3 border-l-2 border-dashed border-[#e2e4e9] pl-4">
                          {timeline.map((row, i) => (
                            <li key={i} className="min-w-0">
                              <p className="font-euclid text-[12px] font-semibold leading-[18px] text-[#36354c]">
                                {row.title}
                              </p>
                              <p className="mt-1 font-euclid text-[13px] font-normal leading-5 text-[#5b5675]">
                                {row.detail}
                              </p>
                            </li>
                          ))}
                        </ul>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                ) : null}
              </div>
            ) : null}
          </div>
        </HelloAiBubbleCard>
      ) : null}

      {showMidTyping1
        ? (() => {
            const showIdentity = helloIdentityStreak.typingIndicatorShowIdentity()
            helloIdentityStreak.afterAiTypingShell()
            return <TypingIndicator labelId={midTyping1LabelId} showIdentity={showIdentity} />
          })()
        : null}

      {showTimeline ? (
        <HelloAiBubbleCard
          bubbleWidth="wide"
          showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}
        >
          <div className="flex min-w-0 flex-col gap-2">
            <p className="font-euclid text-[14px] font-medium leading-6 text-[#36354c]">
              Claim Status
            </p>
            <div className="min-w-0 w-full max-w-full">
              <ClaimStatusTimeline steps={jtbd.status} jtbdType={jtbd.type} />
            </div>
          </div>
        </HelloAiBubbleCard>
      ) : null}

      {showMidTyping2
        ? (() => {
            const showIdentity = helloIdentityStreak.typingIndicatorShowIdentity()
            helloIdentityStreak.afterAiTypingShell()
            return <TypingIndicator labelId={midTyping2LabelId} showIdentity={showIdentity} />
          })()
        : null}

      {showEscalate ? (
        <HelloAiBubbleCard
          bubbleWidth="wide"
          showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}
        >
          <div className="flex min-w-0 flex-col gap-3">
            <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500 break-words">
              {HELLO_CLAIM_STATUS_ESCALATE_GUIDANCE}
            </p>
            {escalateToOpsDone ? (
              <p className="font-euclid text-[14px] font-medium leading-5 text-[#047857]">
                {HELLO_CLAIM_STATUS_ESCALATE_ACK}
              </p>
            ) : (
              <Button
                type="button"
                variant="default"
                className="h-9 w-fit self-start whitespace-normal text-left font-euclid text-[14px] font-medium"
                onClick={() => {
                  setOpsEscalatePanelOpen(true)
                  setEscalateToOpsDone(true)
                  onHelloToast?.(HELLO_CLAIM_STATUS_ESCALATE_TOAST)
                }}
              >
                Escalate to Ops
              </Button>
            )}
          </div>
        </HelloAiBubbleCard>
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
          <div key={row.id} className="flex w-full min-w-0 justify-end">
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
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">{row.text}</p>
          </HelloAiBubbleCard>,
        )
      }
    }

    if (composerReplyTyping) {
      const showIdentity = prev !== "assistant"
      nodes.push(
        <TypingIndicator
          key="claim-status-composer-typing"
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
        className="min-h-0 flex flex-1 flex-col items-start gap-3 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0 py-3 [scrollbar-gutter:stable] sm:gap-4 sm:py-4"
        aria-live="polite"
      >
        {displayPhone ? (
          <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
        ) : null}
        <div className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
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
          {opsEscalatePanelOpen ? (
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
                  <EscalateToOpsWireframePanel />
                </div>
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
