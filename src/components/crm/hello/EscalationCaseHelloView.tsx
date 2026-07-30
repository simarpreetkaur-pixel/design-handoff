import { type ReactNode, useCallback, useEffect, useId, useMemo, useRef, useState } from "react"

import type { Customer, InactivePolicy, JTBD, Policy } from "@/types/crm"
import { resolveSidebarActiveClaim } from "@/data/sidebarActiveClaim"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import {
  HelloAiBubbleCard,
  HelloChatColumnBackground,
  HelloChatComposerBar,
  HelloClaimRaisedSuccessBody,
  HelloCxBubbleCard,
  TypingIndicator,
  createHelloChatIdentityStreak,
  helloSplitShellTransitionClass,
  helloWorkflowOfferPickShellClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import { CustomerProfileSidebar } from "@/components/crm/hello/CustomerProfileSidebar"
import { RightSidebar } from "@/components/crm/hello/RightSidebar"
import type { ClaimStatusWorkflowView } from "@/components/crm/hello/ClaimStatusWorkflowPanel"
import { useHelloRightSidebarState } from "@/components/crm/hello/useHelloRightSidebarState"
import { useHelloPolicyDetailPane } from "@/components/crm/hello/useHelloPolicyDetailPane"
import {
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  helloFopsEscalationSuccessHeadline,
  helloFopsEscalationSuccessQuotedLine,
  helloFreeTextAckStub,
  helloTechEscalationSuccessHeadline,
  helloTechEscalationSuccessQuotedLine,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import { cn } from "@/lib/utils"

const HELLO_ESCALATION_TECH_TOAST = "Escalated to tech team."

/** Prefer chat for first-line resolution; profile bar is for edge cases (tenured agents / bad AI reads). */
const HELLO_ESCALATION_CHAT_FIRST_RESOLUTION_HINT =
  "Type the customer's call reason in chat to get a resolution."

/** Demo: open refund timeline from free-text when the agent asks for it in chat (mirrors “View Refund timeline”). */
function wantsRefundTimelineFromComposer(text: string): boolean {
  const q = text.toLowerCase().trim()
  if (!q) return false
  if (/\b(refund\s+timeline|refund\s+status\s+timeline|view\s+refund\s+timeline|show\s+refund\s+timeline)\b/.test(q))
    return true
  if (/\b(open|show|view|see|pull\s+up)\s+(the\s+)?(refund\s+)?timeline\b/.test(q)) return true
  if (q.includes("timeline") && (q.includes("refund") || q.includes("payment") || q.includes("credit"))) return true
  if (q.includes("refund") && (q.includes("timeline") || q.includes("where") || q.includes("status"))) return true
  return false
}

/** Demo: detect raise a claim intent from free-text chat input. */
function wantsRaiseClaimFromComposer(text: string): boolean {
  const q = text.toLowerCase().trim()
  if (!q) return false
  if (/\b(raise\s+(a\s+)?claim|create\s+(a\s+)?claim|file\s+(a\s+)?claim|submit\s+(a\s+)?claim)\b/.test(q)) return true
  if (/\b(new\s+claim|start\s+claim|claim\s+process)\b/.test(q)) return true
  if (q === "claim" || q === "raise claim" || q === "file claim") return true
  return false
}

const HELLO_ESCALATION_CHOICE_PROMPT = "What would you like to do?"

const HELLO_ESCALATION_CHOICE_FOLLOW_UP_PROMPT = "What would you like to do next?"

export type EscalationCaseHelloViewProps = {
  customer: Customer
  jtbd: JTBD
  motorPolicy: Policy
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  displayPhone?: string
  /** Retained for CRM wiring. */
  onAppointmentScheduled: (value: { scheduledAt: string; note: string }) => void
  onHelloToast?: (message: string) => void
  className?: string
}

/**
 * Hello-only Escalation (refund / payment) — scripted companion + refund timeline in the split right pane.
 */
export function EscalationCaseHelloView({
  customer,
  jtbd,
  motorPolicy,
  activePolicies,
  inactivePolicies,
  displayPhone,
  onAppointmentScheduled: _onAppointmentScheduled,
  onHelloToast,
  className,
}: EscalationCaseHelloViewProps) {
  void _onAppointmentScheduled

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

  /** Track which actions have been performed at least once for prompt changes, but allow repeated use. */
  const [completedEscalationChoiceKeys, setCompletedEscalationChoiceKeys] = useState<Set<string>>(
    () => new Set(),
  )
  const [selectedFlowOfferKey, setSelectedFlowOfferKey] = useState<string | null>(null)

  const [composerText, setComposerText] = useState("")
  const [composerAppend, setComposerAppend] = useState<
    { id: string; role: "user" | "assistant"; text: string }[]
  >([])
  const [composerReplyTyping, setComposerReplyTyping] = useState(false)

  const sidebar = useHelloRightSidebarState()
  const policyDetailPane = useHelloPolicyDetailPane()
  const [policyDetailSubview, setPolicyDetailSubview] = useState<"detail" | "endorsements">("detail")
  const [claimStatusWorkflowView, setClaimStatusWorkflowView] =
    useState<ClaimStatusWorkflowView | null>(null)
  const [raiseClaimWorkflowActive, setRaiseClaimWorkflowActive] = useState(false)
  const activeClaimSidebar = useMemo(() => resolveSidebarActiveClaim(jtbd), [jtbd])

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
    policyDetailPane.pane,
    composerAppend,
    composerReplyTyping,
  ])

  const handleSendComposer = useCallback(() => {
    const trimmed = composerText.trim()
    if (!trimmed) return
    const base = `${Date.now()}`
    const openTimelineFromChat = wantsRefundTimelineFromComposer(trimmed)
    const raiseClaimFromChat = wantsRaiseClaimFromComposer(trimmed)
    setComposerAppend((prev) => [...prev, { id: `${base}-u`, role: "user", text: trimmed }])
    setComposerText("")
    window.setTimeout(() => {
      setComposerReplyTyping(true)
      window.setTimeout(() => {
        setComposerReplyTyping(false)
        if (openTimelineFromChat) {
          setClaimStatusWorkflowView("timeline")
          setRaiseClaimWorkflowActive(false)
          policyDetailPane.close()
          sidebar.openAiSidebar()
          setComposerAppend((prev) => [
            ...prev,
            {
              id: `${base}-a`,
              role: "assistant",
              text: "Opening the refund timeline on the right.",
            },
          ])
          return
        }
        if (raiseClaimFromChat) {
          setClaimStatusWorkflowView(null)
          setRaiseClaimWorkflowActive(true)
          policyDetailPane.close()
          sidebar.openAiSidebar()
          setComposerAppend((prev) => [
            ...prev,
            {
              id: `${base}-a`,
              role: "assistant",
              text: "Opening the raise claim workspace on the right.",
            },
          ])
          return
        }
        setComposerAppend((prev) => [
          ...prev,
          { id: `${base}-a`, role: "assistant", text: helloFreeTextAckStub },
        ])
      }, typingMs)
    }, pauseBeforeTypingMs)
  }, [composerText, pauseBeforeTypingMs, policyDetailPane, sidebar, typingMs])

  const handleEscalationFlowPick = useCallback(
    (key: string, userEchoLabel: string) => {
      // Track completion for prompt changes, but allow repeated selections
      setCompletedEscalationChoiceKeys((prev) => new Set(prev).add(key))
      setSelectedFlowOfferKey(key)
      setComposerAppend((prev) => [...prev, { id: `escalation-flow-u-${Date.now()}`, role: "user", text: userEchoLabel }])

      if (key === "escalate_tech_team") {
        setClaimStatusWorkflowView("escalate")
        setRaiseClaimWorkflowActive(false)
        policyDetailPane.close()
        sidebar.openAiSidebar()
        onHelloToast?.(HELLO_ESCALATION_TECH_TOAST)
      } else if (key === "view_refund_timeline") {
        setClaimStatusWorkflowView("timeline")
        setRaiseClaimWorkflowActive(false)
        policyDetailPane.close()
        sidebar.openAiSidebar()
      } else if (key === "something_else") {
        setClaimStatusWorkflowView(null)
        setRaiseClaimWorkflowActive(false)
        policyDetailPane.close()
      }

      window.setTimeout(() => {
        setComposerReplyTyping(true)
        window.setTimeout(() => {
          setComposerReplyTyping(false)
          if (key === "escalate_tech_team") {
            setComposerAppend((prev) => [
              ...prev,
              {
                id: `escalation-flow-a-${Date.now()}`,
                role: "assistant",
                text: "Opening the tech team escalation workspace on the right.",
              },
            ])
          } else if (key === "view_refund_timeline") {
            setComposerAppend((prev) => [
              ...prev,
              {
                id: `escalation-flow-a-${Date.now()}`,
                role: "assistant",
                text: "Opening the refund timeline on the right.",
              },
            ])
          } else if (key === "something_else") {
            setComposerAppend((prev) => [
              ...prev,
              {
                id: `escalation-flow-a-${Date.now()}`,
                role: "assistant",
                text: HELLO_ESCALATION_CHAT_FIRST_RESOLUTION_HINT,
              },
            ])
          } else {
            setComposerAppend((prev) => [
              ...prev,
              {
                id: `escalation-flow-a-${Date.now()}`,
                role: "assistant",
                text: HELLO_ESCALATION_CHAT_FIRST_RESOLUTION_HINT,
              },
            ])
          }
          // Clear selection after action is processed
          window.setTimeout(() => {
            setSelectedFlowOfferKey(null)
          }, 500)
        }, typingMs)
      }, pauseBeforeTypingMs)
    },
    [onHelloToast, pauseBeforeTypingMs, policyDetailPane, sidebar, typingMs],
  )

  const handleClaimStatusEscalationDone = useCallback(() => {
    window.setTimeout(() => {
      setComposerReplyTyping(true)
      window.setTimeout(() => {
        setComposerReplyTyping(false)
        setComposerAppend((prev) => [
          ...prev,
          {
            id: `escalation-success-${Date.now()}`,
            role: "assistant",
            text: helloTechEscalationSuccessHeadline,
          },
        ])
      }, typingMs)
    }, pauseBeforeTypingMs)
  }, [pauseBeforeTypingMs, typingMs])

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
            Customer is calling 3rd time to check{" "}
            <span className="font-semibold text-[#36354c]">Refund Status</span>.
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
            Customer purchased a policy and due to technical error the payment failed but money debited from their
            account.
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
            Last conversation with CX (10 May&apos;26): CX asked to wait for 2 working days and the amount will be
            credited.
          </p>
          <p className="mt-2 font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            Escalate this issue to the tech team.
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
              {completedEscalationChoiceKeys.size > 0
                ? HELLO_ESCALATION_CHOICE_FOLLOW_UP_PROMPT
                : HELLO_ESCALATION_CHOICE_PROMPT}
            </p>
            <div className="mt-3">
              <WorkflowOfferPick
                options={[
                  {
                    key: "escalate_tech_team",
                    label: "Escalate to tech team",
                    userEchoLabel: "Escalate to tech team",
                    disabled: false,
                  },
                  {
                    key: "view_refund_timeline",
                    label: "View Refund timeline",
                    userEchoLabel: "View Refund timeline",
                    disabled: false,
                  },
                  {
                    key: "something_else",
                    label: "Customer calling for something else.",
                    userEchoLabel: "Customer calling for something else.",
                    disabled: false,
                  },
                ]}
                disabled={false}
                selectedKey={selectedFlowOfferKey}
                onPick={handleEscalationFlowPick}
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
              <p className="text-left font-euclid text-[14px] font-medium leading-5 text-[#36354c]">
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
                headline={row.text.includes("tech team") ? helloTechEscalationSuccessHeadline : helloFopsEscalationSuccessHeadline}
                quotedLine={row.text.includes("tech team") ? helloTechEscalationSuccessQuotedLine : helloFopsEscalationSuccessQuotedLine}
              />
            ) : (
              <p className="font-euclid text-[14px] leading-5 text-[#36354c]">{row.text}</p>
            )}
          </HelloAiBubbleCard>,
        )
      }
    }

    if (composerReplyTyping) {
      const showIdentity = prev !== "assistant"
      nodes.push(
        <TypingIndicator
          key="escalation-case-append-typing"
          labelId={composerTypingLabelId}
          showIdentity={showIdentity}
        />,
      )
    }

    return nodes
  })()

  const aiCompanionColumn = (
    <div
      className={cn(
        "relative z-10 flex min-h-0 flex-1 flex-col",
        HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
      )}
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
        id="escalation-case-hello-composer"
        value={composerText}
        onChange={setComposerText}
        onSend={handleSendComposer}
      />
    </div>
  )

  const policyDetailForPane =
    policyDetailPane.pane.mode === "closed" ? null : policyDetailPane.pane.policy

  return (
    <div
      data-omni-ai-surface="hello-escalation-case"
      className={cn(
        "relative flex h-full min-h-0 w-full overflow-hidden bg-[#fafafa]",
        className,
      )}
      aria-label="Escalation case — Hello view"
    >
      <CustomerProfileSidebar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
        activeClaim={activeClaimSidebar}
      />

      {sidebar.showSkeletonLoader ? (
        <div className="flex flex-1 items-center justify-center bg-[#fafafa]">
          <div className="w-full max-w-2xl animate-pulse space-y-4 px-8">
            <div className="h-40 rounded-xl bg-white shadow-sm" />
          </div>
        </div>
      ) : (
        <>
          {!sidebar.isManualMode && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                className={cn(
                  "relative flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden px-[40px] pt-5 pb-5 lg:pb-6",
                  "lg:grid lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] lg:grid-rows-1 lg:items-stretch lg:gap-0",
                  helloSplitShellTransitionClass,
                )}
              >
                <HelloChatColumnBackground />
                {aiCompanionColumn}
                <div className="relative z-10 hidden min-h-0 min-w-0 overflow-hidden lg:block" aria-hidden />
              </div>
            </div>
          )}

          <RightSidebar
            isCollapsed={sidebar.rightSidebarCollapsed}
            isOpen={!sidebar.rightSidebarCollapsed}
            onToggle={sidebar.handleRightSidebarToggle}
            activeSection={sidebar.rightSidebarActiveSection}
            onSectionChange={sidebar.handleRightSidebarSectionChange}
            width={sidebar.rightSidebarWidth}
            onWidthChange={sidebar.setRightSidebarWidth}
            isManualMode={sidebar.isManualMode}
            onModeToggle={sidebar.handleModeToggle}
            customer={customer}
            displayPhone={displayPhone}
            workflowActive={raiseClaimWorkflowActive}
            claimWorkflowPolicy={raiseClaimWorkflowActive ? motorPolicy : null}
            claimStatusWorkflow={
              claimStatusWorkflowView
                ? {
                    jtbd,
                    policy: motorPolicy,
                    view: claimStatusWorkflowView,
                  }
                : null
            }
            onClaimStatusWorkflowClose={() => setClaimStatusWorkflowView(null)}
            onClaimStatusEscalationDone={handleClaimStatusEscalationDone}
            policyDetailForPane={policyDetailForPane}
            customerPolicies={activePolicies}
            onWorkflowClose={() => setRaiseClaimWorkflowActive(false)}
            onPolicyDetailClose={() => policyDetailPane.close()}
            onCTAPressed={(action, policy) => {
              if (action === "view_details" || action === "share_policy_document") {
                policyDetailPane.open(policy)
                sidebar.openAiSidebar()
              }
              if (action === "raise_claim") {
                setRaiseClaimWorkflowActive(true)
                setClaimStatusWorkflowView(null)
                sidebar.openAiSidebar()
              }
              if (action === "payment-history") {
                sidebar.triggerManualAction("payment-history")
              }
            }}
            policyDetailSubview={policyDetailSubview}
            onPolicyDetailViewChange={setPolicyDetailSubview}
            triggerManualAction={sidebar.manualActionTrigger}
          />
        </>
      )}
    </div>
  )
}
