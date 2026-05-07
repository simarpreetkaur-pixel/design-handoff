import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react"
import { Send, X } from "lucide-react"

import { formatPolicyChatRadioEcho, PolicyChatRadioContent } from "@/lib/policyChatRadioLabel"
import { cn } from "@/lib/utils"
import type { Customer, InactivePolicy, Policy } from "@/types/crm"
import {
  HelloAiBubbleCard,
  HelloCxBubbleCard,
  HelloPolicyDetailPanelSkeleton,
  TypingIndicator,
  WorkflowPaneShimmerOverlay,
} from "@/components/crm/hello/HelloChatPrimitives"
import { HelloCustomerProfileBar } from "@/components/crm/hello/HelloCustomerProfileBar"
import { EditPolicyWorkflowPanel } from "@/components/crm/hello/EditPolicyWorkflowPanel"
import { PolicyDetailPanel } from "@/components/crm/ActivePoliciesPanel"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import { Button } from "@/components/ui/button"
import {
  EDIT_POLICY_CUSTOMER_STEPS,
  EDIT_POLICY_CUSTOMER_TAT_LINE,
  EDIT_POLICY_HEALTH_NOTE_LINE,
  editPolicyTalktrackAdvisorEmphasis,
  editPolicyTalktrackLead,
  editPolicyTalktrackMid,
  editPolicyTalktrackRcEmphasis,
  editPolicyTalktrackTrail,
  HELLO_EDIT_POLICY_OPENING_OFFER_ID,
  HELLO_EDIT_POLICY_POLICY_PICK_OPENING_ID,
  helloComposerTriggersEditPolicyOffer,
  helloEditPolicyAdvisorPoints,
  helloEditPolicyChoices,
  helloEditPolicyOpeningMessage,
  helloEditPolicyPolicyPickContextLabel,
  helloEditPolicyPolicyPickPrompt,
  helloEditPolicySureAck,
  type HelloEditPolicyChoiceId,
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
  helloSomethingElseAckComposerAlways,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import {
  helloPolicyHeadingNumber,
  helloPolicyHeadingProduct,
  useHelloPolicyDetailPane,
} from "@/components/crm/hello/useHelloPolicyDetailPane"

export type HelloEditAssistantBody =
  | { kind: "text"; text: string }
  | { kind: "self_serve_tip" }
  | { kind: "self_serve_steps" }
  | { kind: "self_serve_followup" }
  | { kind: "policy_pick"; offerId: string }
  | { kind: "edit_policy_offer"; offerId: string }

export type HelloEditChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; body: HelloEditAssistantBody }

export type EditPolicyHelloViewProps = {
  customer: Customer
  /** Active policies shown in Classic-style policy pick when more than one (e.g. motor + health). */
  pickablePolicies: Policy[]
  inactivePolicies?: InactivePolicy[]
  displayPhone?: string
  className?: string
}

/**
 * Hello-only Edit Policy transcript — policy pick + support modes match Classic {@link AIChatPanel};
 * right pane hosts {@link EndorsementAdvisorPanel}.
 */
export function EditPolicyHelloView({
  customer,
  pickablePolicies,
  inactivePolicies = [],
  displayPhone,
  className,
}: EditPolicyHelloViewProps) {
  const typingLabelId = useId()
  const replyTypingLabelId = useId()
  const choicesRevealTypingLabelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const workflowPaneScrollRef = useRef<HTMLDivElement>(null)

  const needsPolicyPick = pickablePolicies.length >= 2

  const [selectedPolicy, setSelectedPolicy] = useState<Policy | null>(() =>
    pickablePolicies.length === 1 ? pickablePolicies[0]! : null,
  )

  const workflowPolicy = selectedPolicy ?? pickablePolicies[0]!

  const [openingTyping, setOpeningTyping] = useState(true)
  /** First line — opener text (single policy from mount; multi policy after policy pick). */
  const [openerTextVisible, setOpenerTextVisible] = useState(false)
  /** Classic-style policy wizard — first beat when multiple policies. */
  const [policyPickVisible, setPolicyPickVisible] = useState(false)
  const [choicesRevealTyping, setChoicesRevealTyping] = useState(false)
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [spentOfferIds, setSpentOfferIds] = useState<Set<string>>(() => new Set())
  const [messages, setMessages] = useState<HelloEditChatMessage[]>([])
  const [composerText, setComposerText] = useState("")
  const [workflowActive, setWorkflowActive] = useState(false)
  const policyDetailPane = useHelloPolicyDetailPane()
  const [workflowShimmerPhase, setWorkflowShimmerPhase] = useState<"hidden" | "show" | "hide">(
    "hidden",
  )
  const [replyTyping, setReplyTyping] = useState(false)

  const rightPaneSplit = workflowActive || policyDetailPane.isOpen

  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const readMs = HELLO_SELF_SERVE_READ_PAUSE_MS

  const pushAssistant = (body: HelloEditAssistantBody) => {
    const id = `hello-edit-a-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setMessages((prev) => [...prev, { id, role: "assistant", body }])
  }

  /** After multi-policy selection (or composer): opener text → gap → support WorkflowOfferPick. */
  const scheduleSupportChoicesOpeningSequence = () => {
    window.setTimeout(() => {
      setChoicesRevealTyping(true)
      window.setTimeout(() => {
        setChoicesRevealTyping(false)
        setOpenerTextVisible(true)
        window.setTimeout(() => {
          setChoicesRevealTyping(true)
          window.setTimeout(() => {
            setChoicesRevealTyping(false)
            setChoicesVisible(true)
          }, typingMs)
        }, HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS)
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
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
      if (needsPolicyPick) {
        setPolicyPickVisible(true)
        return
      }
      schedule(() => {
        if (cancelled) return
        setOpenerTextVisible(true)
        schedule(() => {
          if (cancelled) return
          setChoicesRevealTyping(true)
          schedule(() => {
            if (cancelled) return
            setChoicesRevealTyping(false)
            setChoicesVisible(true)
          }, typingMs)
        }, HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS)
      }, 0)
    }, typingMs)

    return () => {
      cancelled = true
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [needsPolicyPick, typingMs])

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
    openerTextVisible,
    policyPickVisible,
    choicesRevealTyping,
    messages,
    choicesVisible,
    spentOfferIds,
    workflowActive,
    policyDetailPane.pane,
    replyTyping,
    workflowShimmerPhase,
  ])

  const spend = (offerId: string) => {
    setSpentOfferIds((prev) => new Set(prev).add(offerId))
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
    scheduleSupportChoicesOpeningSequence()
  }

  const handleComposerPolicyPick = (policyId: string, userEchoLabel: string, offerId: string) => {
    if (spentOfferIds.has(offerId)) return
    const policy = pickablePolicies.find((p) => p.id === policyId)
    if (!policy) return
    spend(offerId)
    setSelectedPolicy(policy)
    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-policy-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    scheduleSupportChoicesOpeningSequence()
  }

  const handleOpeningPick = (
    choiceId: HelloEditPolicyChoiceId,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    spend(offerId)

    setMessages((prev) => [
      ...prev,
      { id: `hello-edit-user-pick-${Date.now()}`, role: "user", text: userEchoLabel },
    ])

    window.setTimeout(() => {
      if (choiceId === "self_serve") {
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
            pushAssistant({ kind: "text", text: helloEditPolicyAdvisorPoints })
            window.setTimeout(() => {
              policyDetailPane.close()
              setWorkflowActive(true)
            }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
          }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
        }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleSendComposer = () => {
    const trimmed = composerText.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { id: `hello-edit-user-${Date.now()}`, role: "user", text: trimmed }])
    setComposerText("")

    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        if (!helloComposerTriggersEditPolicyOffer(trimmed)) {
          pushAssistant({ kind: "text", text: helloFreeTextAckStub })
          return
        }
        const offerId = `composer-edit-offer-${Date.now()}`
        if (needsPolicyPick && !selectedPolicy) {
          pushAssistant({ kind: "policy_pick", offerId })
          return
        }
        pushAssistant({ kind: "edit_policy_offer", offerId })
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendComposer()
    }
  }

  const renderAssistantBody = (body: HelloEditAssistantBody) => {
    switch (body.kind) {
      case "text":
        return (
          <p className="whitespace-pre-line font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            {body.text}
          </p>
        )
      case "self_serve_tip":
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
      case "self_serve_steps":
        return (
          <div>
            <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#5b5675]">
              Steps for the customer
            </p>
            <ol className="mt-2.5 list-decimal space-y-2 pl-5 font-euclid text-[14px] leading-6 text-[#36354c] marker:font-medium marker:text-[#5b5675]">
              {EDIT_POLICY_CUSTOMER_STEPS.map((step, index) => (
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
                {EDIT_POLICY_CUSTOMER_TAT_LINE}
              </li>
              <li className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
                {EDIT_POLICY_HEALTH_NOTE_LINE}
              </li>
            </ul>
          </div>
        )
      case "policy_pick":
        return (
          <>
            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
              {helloEditPolicyPolicyPickContextLabel}
            </p>
            <p className="mt-2 font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
              {helloEditPolicyPolicyPickPrompt}
            </p>
            <div className="mt-3">
              <WorkflowOfferPick
                options={pickablePolicies.map((p) => ({
                  key: p.id,
                  label: <PolicyChatRadioContent policy={p} />,
                  userEchoLabel: formatPolicyChatRadioEcho(p),
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) => handleComposerPolicyPick(key, label, body.offerId)}
              />
            </div>
          </>
        )
      case "edit_policy_offer":
        return (
          <>
            <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
              {helloEditPolicyOpeningMessage}
            </p>
            <div className="pt-3">
              <WorkflowOfferPick
                options={helloEditPolicyChoices.map((c) => ({
                  key: c.id,
                  label: c.label,
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleOpeningPick(key as HelloEditPolicyChoiceId, label, body.offerId)
                }
              />
            </div>
          </>
        )
    }
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
        className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0 py-3 [scrollbar-gutter:stable] sm:py-4"
        aria-live="polite"
        aria-relevant="additions text"
      >
        {displayPhone ? (
          <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
        ) : null}

        {openingTyping ? <TypingIndicator labelId={typingLabelId} /> : null}

        {needsPolicyPick && policyPickVisible ? (
          <HelloAiBubbleCard>
            <>
              <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                {helloEditPolicyPolicyPickContextLabel}
              </p>
              <p className="mt-2 font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                {helloEditPolicyPolicyPickPrompt}
              </p>
              <div className="mt-3">
                <WorkflowOfferPick
                  options={policyPickOptions}
                  disabled={spentOfferIds.has(HELLO_EDIT_POLICY_POLICY_PICK_OPENING_ID)}
                  onPick={(key, label) => handleOpeningPolicyPick(key, label)}
                />
              </div>
            </>
          </HelloAiBubbleCard>
        ) : null}

        {openerTextVisible ? (
          <HelloAiBubbleCard>
            <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
              {helloEditPolicyOpeningMessage}
            </p>
          </HelloAiBubbleCard>
        ) : null}

        {choicesRevealTyping ? <TypingIndicator labelId={choicesRevealTypingLabelId} /> : null}

        {choicesVisible ? (
          <HelloAiBubbleCard>
            <WorkflowOfferPick
              options={helloEditPolicyChoices.map((c) => ({
                key: c.id,
                label: c.label,
              }))}
              disabled={spentOfferIds.has(HELLO_EDIT_POLICY_OPENING_OFFER_ID)}
              onPick={(key, label) =>
                handleOpeningPick(key as HelloEditPolicyChoiceId, label, HELLO_EDIT_POLICY_OPENING_OFFER_ID)
              }
            />
          </HelloAiBubbleCard>
        ) : null}

        {messages.map((message) => {
          if (message.role === "assistant") {
            return (
              <div key={message.id} className="w-full">
                <HelloAiBubbleCard>{renderAssistantBody(message.body)}</HelloAiBubbleCard>
              </div>
            )
          }

          return (
            <div key={message.id} className="flex w-full justify-end">
              <div className="w-full max-w-[min(90%,26rem)]">
                <HelloCxBubbleCard>
                  <p className="text-left font-euclid text-[14px] font-medium leading-5 text-white">
                    {message.text}
                  </p>
                </HelloCxBubbleCard>
              </div>
            </div>
          )
        })}
        {replyTyping ? <TypingIndicator labelId={replyTypingLabelId} /> : null}
      </div>
    </>
  )

  const companionComposer = (
    <div className="relative z-20 shrink-0 px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <div className="mx-auto flex w-full max-w-2xl min-w-0 justify-center">
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
  )

  const aiCompanionColumn = (
    <div
      className={cn(
        "flex min-h-0 flex-col bg-transparent",
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

  if (pickablePolicies.length === 0) {
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
        onActivePolicyViewDetails={(p) => {
          policyDetailPane.open(p)
          setWorkflowActive(false)
        }}
      />

      <div
        className={cn(
          "flex min-h-0 w-full flex-1 flex-col gap-4 overflow-hidden px-[40px] pt-5 pb-5 lg:pb-6",
          "lg:grid lg:grid-rows-1 lg:items-stretch",
          rightPaneSplit
            ? "lg:grid-cols-[minmax(0,46%)_minmax(0,54%)] lg:gap-5"
            : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] lg:gap-0",
          splitShellTransitionClass,
        )}
      >
        {aiCompanionColumn}
        <div
          className={cn(
            "min-h-0 min-w-0 overflow-hidden",
            rightPaneSplit ? "flex min-h-0 flex-1 flex-col lg:h-full" : "contents lg:block",
          )}
        >
          {policyDetailForPane ? (
            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
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
          ) : workflowActive ? (
            <div
              className={cn(
                "flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden",
                workflowPaneShellClass,
              )}
            >
              <div className="relative flex min-h-0 flex-1 flex-col overflow-hidden">
                <div
                  ref={workflowPaneScrollRef}
                  className="min-h-0 flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain p-4 [scrollbar-gutter:stable] lg:p-5"
                >
                  <EditPolicyWorkflowPanel
                    key={`hello-edit-policy-${workflowPolicy.id}`}
                    policy={workflowPolicy}
                    scrollContainerRef={workflowPaneScrollRef}
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
            <div className="hidden min-h-0 min-w-0 lg:block" aria-hidden />
          )}
        </div>
      </div>
    </div>
  )
}
