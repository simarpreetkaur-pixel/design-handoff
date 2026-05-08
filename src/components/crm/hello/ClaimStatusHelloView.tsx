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
import { Check, X } from "lucide-react"

import type { Customer, InactivePolicy, JTBD, Policy } from "@/types/crm"
import { ClaimStatusTimeline } from "@/components/crm/ClaimStatusTimeline"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import {
  ClaimHandlerSchedulerForm,
  formatClaimHandlerAppointmentDisplay,
} from "@/components/crm/ClaimHandlerAppointmentModal"
import {
  HelloAiBubbleCard,
  HelloChatColumnBackground,
  HelloChatComposerBar,
  HelloCxBubbleCard,
  TypingIndicator,
  createHelloChatIdentityStreak,
  helloWorkflowOfferPickShellClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import { HelloCustomerProfileBar } from "@/components/crm/hello/HelloCustomerProfileBar"
import {
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  helloFreeTextAckStub,
  helloRaiseClaimChoices,
  helloSomethingElseAckComposerAlways,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"
import { cn } from "@/lib/utils"

const SCHEDULE_OFFER_ID = "hello-claim-status-schedule-ch"

const HELLO_CLAIM_STATUS_SCHEDULER_OPENED_ACK =
  "Opening the scheduler on the right — add the callback window when the customer confirms."

const HELLO_SPLIT_LEFT_DEFAULT_PCT = 46
const HELLO_SPLIT_LEFT_MIN_PCT = 19
const HELLO_SPLIT_LEFT_MAX_PCT = 74

const HELLO_SPLIT_GRIP_HOVER_BRIDGE_MS = 220

const workflowPaneShellClass =
  "overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_2px_rgba(54,53,76,0.04)] motion-safe:transition-[box-shadow,transform] motion-safe:duration-300 motion-safe:ease-out"

const splitShellTransitionClass =
  "motion-safe:lg:transition-[grid-template-columns,gap] motion-safe:lg:duration-[700ms] motion-safe:lg:ease-[cubic-bezier(0.22,1,0.36,1)]"

type ScheduleTailItem =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; variant: "declined" | "something_else" | "scheduler_hint" }

type HelloWorkflowSplitHandleProps = {
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  visible: boolean
}

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

export type ClaimStatusHelloViewProps = {
  customer: Customer
  jtbd: JTBD
  motorPolicy: Policy
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  displayPhone?: string
  onAppointmentScheduled: (value: { scheduledAt: string; note: string }) => void
  onHelloToast?: (message: string) => void
  className?: string
}

/**
 * Hello-only UC2 — claim status context in-chat; optional split with embedded claim handler scheduler.
 */
export function ClaimStatusHelloView({
  customer,
  jtbd,
  motorPolicy,
  activePolicies,
  inactivePolicies,
  displayPhone,
  onAppointmentScheduled,
  onHelloToast,
  className,
}: ClaimStatusHelloViewProps) {
  const splitGridRef = useRef<HTMLDivElement>(null)
  const claimChatListRef = useRef<HTMLDivElement>(null)
  const scheduleTypingLabelId = useId()
  const composerTypingLabelId = useId()

  const [helloSplitLeftPct, setHelloSplitLeftPct] = useState(HELLO_SPLIT_LEFT_DEFAULT_PCT)
  const [splitResizeActive, setSplitResizeActive] = useState(false)
  const [splitGripHovered, setSplitGripHovered] = useState(false)
  const [leftCompanionHovered, setLeftCompanionHovered] = useState(false)
  const [leftCompanionFocusWithin, setLeftCompanionFocusWithin] = useState(false)
  const splitGripHoverBridgeRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const [spentOfferIds, setSpentOfferIds] = useState<Set<string>>(() => new Set())
  const [splitOpen, setSplitOpen] = useState(false)
  const [scheduleTail, setScheduleTail] = useState<ScheduleTailItem[]>([])
  const [scheduleReplyTyping, setScheduleReplyTyping] = useState(false)
  const [scheduledDisplay, setScheduledDisplay] = useState<string | null>(null)
  const [schedulerKey, setSchedulerKey] = useState(0)
  const [chSuccessInChat, setChSuccessInChat] = useState(false)
  const [composerText, setComposerText] = useState("")
  const [composerAppend, setComposerAppend] = useState<
    { id: string; role: "user" | "assistant"; text: string }[]
  >([])
  const [composerReplyTyping, setComposerReplyTyping] = useState(false)

  const rightPaneSplit = splitOpen

  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const pauseBeforeTypingMs = HELLO_BOT_REPLY_AFTER_USER_MS

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
    const el = claimChatListRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [scheduleTail, scheduleReplyTyping, composerAppend, composerReplyTyping, chSuccessInChat, splitOpen])

  const somethingElseScheduleLabel =
    helloRaiseClaimChoices.find((c) => c.id === "something_else")?.label ??
    "Customer called for something else"

  const handleSchedulePick = useCallback((key: string, userEchoLabel: string) => {
    if (spentOfferIds.has(SCHEDULE_OFFER_ID)) return
    setSpentOfferIds((prev) => new Set(prev).add(SCHEDULE_OFFER_ID))

    setScheduleTail((prev) => [...prev, { id: `cs-u-${Date.now()}`, role: "user", text: userEchoLabel }])

    window.setTimeout(() => {
      setScheduleReplyTyping(true)
      window.setTimeout(() => {
        setScheduleReplyTyping(false)
        if (key === "yes") {
          setScheduledDisplay(null)
          setChSuccessInChat(false)
          setSchedulerKey((k) => k + 1)
          setSplitOpen(true)
          setScheduleTail((prev) => [
            ...prev,
            { id: `cs-a-${Date.now()}`, role: "assistant", variant: "scheduler_hint" },
          ])
        } else if (key === "something_else") {
          setScheduleTail((prev) => [
            ...prev,
            { id: `cs-a-${Date.now()}`, role: "assistant", variant: "something_else" },
          ])
        } else {
          setScheduleTail((prev) => [
            ...prev,
            { id: `cs-a-${Date.now()}`, role: "assistant", variant: "declined" },
          ])
        }
      }, typingMs)
    }, pauseBeforeTypingMs)
  }, [pauseBeforeTypingMs, spentOfferIds, typingMs])

  const handleCloseSchedulerPane = useCallback(() => {
    setSplitOpen(false)
  }, [])

  const handleSchedulerSubmit = useCallback(
    (value: { scheduledAt: string; note: string }) => {
      onAppointmentScheduled(value)
      onHelloToast?.("Claim handler appointment scheduled.")
      const display = formatClaimHandlerAppointmentDisplay(value.scheduledAt)
      setScheduledDisplay(display)
      setSplitOpen(false)
      setChSuccessInChat(true)
    },
    [onAppointmentScheduled, onHelloToast],
  )

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

  const successContextSubtitle = (() => {
    const v = motorPolicy.vehicle?.trim()
    const pn = motorPolicy.policyNumber?.trim()
    if (v && pn) return `${v} · ${pn}`
    return v ?? pn ?? ""
  })()

  const showSplitGrip =
    rightPaneSplit &&
    (splitResizeActive ||
      splitGripHovered ||
      leftCompanionHovered ||
      leftCompanionFocusWithin)

  const aiSummary = jtbd.aiSummary
  const timeline = aiSummary?.detailedSummaryTimeline ?? []
  const detailedLabel = aiSummary?.viewDetailsLabel ?? "Detailed summary"

  const helloIdentityStreak = createHelloChatIdentityStreak()

  const companionMessages = (
    <>
      {/* Bubble 1 — context + previous summary; CX thread detail behind chevron */}
      <HelloAiBubbleCard showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}>
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

      {/* Bubble 2 — claim status */}
      <HelloAiBubbleCard showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}>
        <div className="flex min-w-0 flex-col gap-2">
          <p className="font-euclid text-[14px] font-semibold leading-5 text-[#36354c]">
            Current claim status
          </p>
          <div className="min-w-0">
            <ClaimStatusTimeline steps={jtbd.status} jtbdType={jtbd.type} />
          </div>
        </div>
      </HelloAiBubbleCard>

      {/* Bubble 3 — schedule CH (prose separate from choices) */}
      <HelloAiBubbleCard showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}>
        <p className="font-euclid text-[14px] font-medium leading-5 text-[#36354c]">
          Do you want to schedule a claim handler appointment?
        </p>
      </HelloAiBubbleCard>
      <div className={helloWorkflowOfferPickShellClass}>
        <HelloAiBubbleCard showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}>
          <WorkflowOfferPick
            options={[
              {
                key: "yes",
                label: "Yes, open the scheduler",
                userEchoLabel: "Yes, schedule claim handler appointment",
              },
              { key: "no", label: "No, not now" },
              { key: "something_else", label: somethingElseScheduleLabel },
            ]}
            disabled={spentOfferIds.has(SCHEDULE_OFFER_ID)}
            onPick={(key, label) => handleSchedulePick(key, label)}
          />
        </HelloAiBubbleCard>
      </div>

      {scheduleTail.map((row) => {
        if (row.role === "user") {
          return (
            <div key={row.id} className="flex w-full min-w-0 justify-end">
              <HelloCxBubbleCard showIdentity={helloIdentityStreak.nextCxBubbleShowIdentity()}>
                <p className="text-left font-euclid text-[14px] font-medium leading-5 text-white">
                  {row.text}
                </p>
              </HelloCxBubbleCard>
            </div>
          )
        }
        if (row.variant === "declined") {
          return (
            <HelloAiBubbleCard key={row.id} showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}>
              <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                Understood. You can schedule a claim handler appointment anytime from{" "}
                <span className="font-semibold text-[#36354c]">Agent actions</span> when the customer is
                ready.
              </p>
            </HelloAiBubbleCard>
          )
        }
        if (row.variant === "something_else") {
          return (
            <HelloAiBubbleCard key={row.id} showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}>
              <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
                {helloSomethingElseAckComposerAlways}
              </p>
            </HelloAiBubbleCard>
          )
        }
        return (
          <HelloAiBubbleCard key={row.id} showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}>
            <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
              {HELLO_CLAIM_STATUS_SCHEDULER_OPENED_ACK}
            </p>
          </HelloAiBubbleCard>
        )
      })}

      {scheduleReplyTyping
        ? (() => {
            const showIdentity = helloIdentityStreak.typingIndicatorShowIdentity()
            helloIdentityStreak.afterAiTypingShell()
            return (
              <TypingIndicator labelId={scheduleTypingLabelId} showIdentity={showIdentity} />
            )
          })()
        : null}

      {chSuccessInChat && scheduledDisplay ? (
        <HelloAiBubbleCard showIdentity={helloIdentityStreak.nextAiBubbleShowIdentity()}>
          <div className="flex min-w-0 gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#d1fae5] ring-1 ring-[#a7f3d0]">
              <Check className="size-4 text-[#059669]" strokeWidth={2.5} aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-euclid text-[15px] font-semibold leading-5 text-[#065f46]">
                Claim handler appointment scheduled
              </p>
              <p className="mt-1 font-euclid text-[14px] leading-5 text-[#047857]">
                Callback window:{" "}
                <span className="font-semibold text-[#064e3b]">{scheduledDisplay}</span>
              </p>
              {successContextSubtitle ? (
                <p className="mt-1 font-euclid text-[13px] leading-5 text-[#059669]/90">
                  {successContextSubtitle}
                </p>
              ) : null}
            </div>
          </div>
        </HelloAiBubbleCard>
      ) : null}
    </>
  )

  const appendedComposerBlock = (() => {
    const lastSchedule =
      scheduleTail.length === 0 ? null : scheduleTail[scheduleTail.length - 1]!
    const initialPrev: "assistant" | "user" | null =
      lastSchedule === null ? "assistant" : lastSchedule.role === "user" ? "user" : "assistant"

    let prev: "assistant" | "user" | null = initialPrev
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
          <HelloAiBubbleCard key={row.id} showIdentity={showIdentity}>
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
        <div
          className={cn(
            "relative z-10 flex min-h-0 flex-col overflow-hidden",
            HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
            rightPaneSplit ? "min-h-0 w-full min-w-0" : "min-h-[min(52vh,440px)] w-full min-w-0 lg:min-h-0",
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

        <div
          className={cn(
            "relative z-10 min-h-0 min-w-0 overflow-hidden",
            rightPaneSplit ? "flex min-h-0 flex-1 flex-col lg:h-full" : "contents lg:block",
          )}
        >
          {rightPaneSplit ? (
            <div
              className={cn(
                "relative z-10 flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                workflowPaneShellClass,
              )}
            >
              <HelloWorkflowSplitHandle
                visible={showSplitGrip}
                onMouseDown={handleSplitMouseDown}
                onMouseEnter={onSplitGripEnter}
                onMouseLeave={onSplitGripLeave}
              />
              <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e7e7f0] bg-white px-4 py-3 lg:px-5">
                <div className="min-w-0 flex-1 pr-2">
                  <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                    Claim handler appointment
                  </p>
                  <p className="mt-0.5 truncate font-euclid text-[14px] font-semibold leading-5 text-[#040222]">
                    {motorPolicy.vehicle ?? jtbd.vehicle}
                    {motorPolicy.policyNumber ? (
                      <span className="font-normal text-[#5b5675]"> · {motorPolicy.policyNumber}</span>
                    ) : null}
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCloseSchedulerPane}
                  className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                  aria-label="Close scheduler"
                >
                  <X className="size-5" aria-hidden />
                </button>
              </div>
              <div className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5">
                <ClaimHandlerSchedulerForm
                  key={schedulerKey}
                  active
                  mode="create"
                  onSubmit={handleSchedulerSubmit}
                />
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  )
}
