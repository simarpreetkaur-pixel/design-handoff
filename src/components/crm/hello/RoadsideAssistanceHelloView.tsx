import { type ReactNode, useCallback, useEffect, useId, useRef, useState } from "react"

import type { Customer, InactivePolicy, Policy } from "@/types/crm"
import { cn } from "@/lib/utils"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import {
  HelloAiBubbleCard,
  HelloChatColumnBackground,
  HelloChatComposerBar,
  HelloCxBubbleCard,
  TypingIndicator,
  createHelloChatIdentityStreak,
  helloWorkflowOfferPickShellClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import { HelloCustomerProfileBar, helloProfileNonPolicyRibbonActionLabel } from "@/components/crm/hello/HelloCustomerProfileBar"
import {
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  helloFreeTextAckStub,
  helloSomethingElseAckComposerAlways,
  type HelloProfilePolicyRibbonAction,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import { helloRsaOpeningLead, helloRsaTransferFollowupAi } from "@/components/crm/hello/helloRsaCopy"

const OFFER_INITIAL = "rsa-offer-initial"

type RsaChatLine =
  | { id: string; kind: "user"; text: string }
  | { id: string; kind: "assistant_opening_lead" }
  | { id: string; kind: "assistant_opening_offers" }
  | { id: string; kind: "assistant_transfer_note" }
  | { id: string; kind: "assistant_something_else_composer" }
  | { id: string; kind: "assistant_composer_stub"; text: string }

function newId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}

export type RoadsideAssistanceHelloViewProps = {
  customer: Customer
  activePolicies: Policy[]
  inactivePolicies?: InactivePolicy[]
  displayPhone?: string
  vehicleLabel: string
  onTransferClick: () => void
  className?: string
}

/**
 * Hello RSA — transfer vs “something else”; latter uses the same composer prompt as Raise Claim Hello.
 */
export function RoadsideAssistanceHelloView({
  customer,
  activePolicies,
  inactivePolicies = [],
  displayPhone,
  vehicleLabel,
  onTransferClick,
  className,
}: RoadsideAssistanceHelloViewProps) {
  const replyTypingLabelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const [spentOfferIds, setSpentOfferIds] = useState<Set<string>>(() => new Set())
  const [lines, setLines] = useState<RsaChatLine[]>(() => [
    { id: newId("a"), kind: "assistant_opening_lead" },
    { id: newId("a"), kind: "assistant_opening_offers" },
  ])
  const [composerText, setComposerText] = useState("")
  const [replyTyping, setReplyTyping] = useState(false)

  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const pauseBeforeTypingMs = HELLO_BOT_REPLY_AFTER_USER_MS

  const spendOffer = useCallback((id: string) => {
    setSpentOfferIds((prev) => new Set(prev).add(id))
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [lines, replyTyping])

  const appendAssistantAfterTyping = useCallback((append: (prev: RsaChatLine[]) => RsaChatLine[]) => {
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        setLines((prev) => append(prev))
      }, typingMs)
    }, pauseBeforeTypingMs)
  }, [pauseBeforeTypingMs, typingMs])

  const handleInitialPick = useCallback(
    (key: string, label: string) => {
      if (spentOfferIds.has(OFFER_INITIAL)) return
      spendOffer(OFFER_INITIAL)
      setLines((prev) => [...prev, { id: newId("u"), kind: "user", text: label }])

      if (key === "rsa_transfer") {
        onTransferClick()
        appendAssistantAfterTyping((prev) => [...prev, { id: newId("a"), kind: "assistant_transfer_note" }])
        return
      }
      if (key === "rsa_other") {
        appendAssistantAfterTyping((prev) => [
          ...prev,
          { id: newId("a"), kind: "assistant_something_else_composer" },
        ])
      }
    },
    [appendAssistantAfterTyping, onTransferClick, spendOffer, spentOfferIds],
  )

  const handleSendComposer = useCallback(() => {
    const trimmed = composerText.trim()
    if (!trimmed) return
    setComposerText("")
    setLines((prev) => [...prev, { id: newId("u"), kind: "user", text: trimmed }])
    appendAssistantAfterTyping((prev) => [
      ...prev,
      { id: newId("a"), kind: "assistant_composer_stub", text: helloFreeTextAckStub },
    ])
  }, [appendAssistantAfterTyping, composerText])

  const handlePolicyRibbonAction = useCallback(
    (policy: Policy, action: HelloProfilePolicyRibbonAction) => {
      const labels: Record<HelloProfilePolicyRibbonAction, string> = {
        view_details: "View policy details",
        raise_claim: "Raise a claim",
        edit_policy: "Edit Policy",
        share_policy_document: "Share policy document",
      }
      const policyLine = policy.name?.trim() || policy.planDisplayName?.trim() || policy.type
      setLines((prev) => [
        ...prev,
        { id: newId("u"), kind: "user", text: `${labels[action]} · ${policyLine}` },
      ])
      appendAssistantAfterTyping((prev) => [
        ...prev,
        {
          id: newId("a"),
          kind: "assistant_composer_stub",
          text: "Open Raise Claim or Edit Policy from the CRM workspace for the full split-pane workflow. This RSA view keeps policy shortcuts in the profile ribbon only.",
        },
      ])
    },
    [appendAssistantAfterTyping],
  )

  const renderThread = () => {
    const streak = createHelloChatIdentityStreak()
    const nodes: ReactNode[] = []
    for (const line of lines) {
      if (line.kind === "user") {
        nodes.push(
          <div key={line.id} className="flex w-full min-w-0 justify-end">
            <HelloCxBubbleCard showIdentity={streak.nextCxBubbleShowIdentity()}>
              <p className="text-left font-euclid text-[14px] font-medium leading-5 text-white">{line.text}</p>
            </HelloCxBubbleCard>
          </div>,
        )
        continue
      }

      if (line.kind === "assistant_opening_lead") {
        nodes.push(
          <HelloAiBubbleCard key={line.id} showIdentity={streak.nextAiBubbleShowIdentity()}>
            <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
              {helloRsaOpeningLead(vehicleLabel)}
            </p>
          </HelloAiBubbleCard>,
        )
        continue
      }

      if (line.kind === "assistant_opening_offers") {
        nodes.push(
          <div key={line.id} className={helloWorkflowOfferPickShellClass}>
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={[
                  { key: "rsa_transfer", label: "Transfer call" },
                  { key: "rsa_other", label: "Customer calling for something else" },
                ]}
                disabled={spentOfferIds.has(OFFER_INITIAL)}
                onPick={handleInitialPick}
              />
            </HelloAiBubbleCard>
          </div>,
        )
        continue
      }

      if (line.kind === "assistant_transfer_note") {
        nodes.push(
          <HelloAiBubbleCard key={line.id} showIdentity={streak.nextAiBubbleShowIdentity()}>
            <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
              {helloRsaTransferFollowupAi}
            </p>
          </HelloAiBubbleCard>,
        )
        continue
      }

      if (line.kind === "assistant_something_else_composer") {
        nodes.push(
          <HelloAiBubbleCard key={line.id} showIdentity={streak.nextAiBubbleShowIdentity()}>
            <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
              {helloSomethingElseAckComposerAlways}
            </p>
          </HelloAiBubbleCard>,
        )
        continue
      }

      if (line.kind === "assistant_composer_stub") {
        nodes.push(
          <HelloAiBubbleCard key={line.id} showIdentity={streak.nextAiBubbleShowIdentity()}>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">{line.text}</p>
          </HelloAiBubbleCard>,
        )
      }
    }

    if (replyTyping) {
      const showIdentity = streak.typingIndicatorShowIdentity()
      streak.afterAiTypingShell()
      nodes.push(
        <TypingIndicator key="rsa-reply-typing" labelId={replyTypingLabelId} showIdentity={showIdentity} />,
      )
    }

    return nodes
  }

  return (
    <div
      data-omni-ai-surface="hello-rsa"
      className={cn(
        "relative flex h-full min-h-0 w-full flex-col overflow-hidden bg-[#fafafa]",
        className,
      )}
      aria-label="Road Side Assistance — Hello view"
    >
      <HelloCustomerProfileBar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
        onActivePolicyRibbonAction={handlePolicyRibbonAction}
        onNonPolicyRibbonAction={(action) => {
          const label = helloProfileNonPolicyRibbonActionLabel(action)
          setLines((prev) => [
            ...prev,
            {
              id: newId("a"),
              kind: "assistant_composer_stub",
              text: `${label} — wire this shortcut to CRM history when available.`,
            },
          ])
        }}
      />

      <div className="relative flex min-h-0 w-full flex-1 flex-col overflow-hidden px-[40px] pt-5 pb-5 lg:pb-6">
        <HelloChatColumnBackground />
        <div
          className={cn(
            "relative z-10 flex min-h-0 flex-1 flex-col overflow-hidden",
            HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
          )}
        >
          <div
            ref={listRef}
            className="min-h-0 flex flex-1 flex-col items-start gap-3 overflow-y-auto overflow-x-hidden overscroll-y-contain px-0 py-3 [scrollbar-gutter:stable] sm:gap-4 sm:py-4"
            aria-live="polite"
          >
            {displayPhone ? (
              <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
            ) : null}
            {renderThread()}
          </div>
          <HelloChatComposerBar
            id="rsa-hello-composer"
            value={composerText}
            onChange={setComposerText}
            onSend={handleSendComposer}
          />
        </div>
      </div>
    </div>
  )
}
