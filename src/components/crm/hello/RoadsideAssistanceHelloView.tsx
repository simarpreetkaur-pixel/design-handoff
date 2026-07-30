import {
  type KeyboardEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"

import type { Customer, InactivePolicy, Policy } from "@/types/crm"
import { cn } from "@/lib/utils"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import {
  HelloAiBubbleCard,
  HelloChatColumnBackground,
  HelloCxBubbleCard,
  TypingIndicator,
  createHelloChatIdentityStreak,
  helloSplitShellTransitionClass,
  helloWorkflowOfferPickShellClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import { CustomerProfileSidebar } from "@/components/crm/hello/CustomerProfileSidebar"
import { RightSidebar } from "@/components/crm/hello/RightSidebar"
import { useHelloRightSidebarState } from "@/components/crm/hello/useHelloRightSidebarState"
import { useHelloPolicyDetailPane } from "@/components/crm/hello/useHelloPolicyDetailPane"
import {
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  helloFreeTextAckStub,
  helloSomethingElseAckComposerAlways,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import { helloRsaOpeningLead, helloRsaTransferFollowupAi } from "@/components/crm/hello/helloRsaCopy"
import { Button } from "@/components/ui/button"
import { Send } from "lucide-react"

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
 * Hello RSA — same CRM shell as Raise Claim (profile sidebar + AI companion + right sidebar).
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

  const policyDetailPane = useHelloPolicyDetailPane()
  const [policyDetailSubview, setPolicyDetailSubview] = useState<"detail" | "endorsements">("detail")
  const sidebar = useHelloRightSidebarState()

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

  const appendAssistantAfterTyping = useCallback(
    (append: (prev: RsaChatLine[]) => RsaChatLine[]) => {
      window.setTimeout(() => {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          setLines((prev) => append(prev))
        }, typingMs)
      }, pauseBeforeTypingMs)
    },
    [pauseBeforeTypingMs, typingMs],
  )

  const handleInitialPick = useCallback(
    (key: string, label: string) => {
      if (spentOfferIds.has(OFFER_INITIAL)) return
      spendOffer(OFFER_INITIAL)
      setLines((prev) => [...prev, { id: newId("u"), kind: "user", text: label }])

      if (key === "rsa_transfer") {
        onTransferClick()
        sidebar.triggerManualAction("transfer-call")
        appendAssistantAfterTyping((prev) => [
          ...prev,
          { id: newId("a"), kind: "assistant_transfer_note" },
        ])
        return
      }
      if (key === "rsa_other") {
        appendAssistantAfterTyping((prev) => [
          ...prev,
          { id: newId("a"), kind: "assistant_something_else_composer" },
        ])
      }
    },
    [appendAssistantAfterTyping, onTransferClick, sidebar, spendOffer, spentOfferIds],
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

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendComposer()
    }
  }

  const renderThread = () => {
    const streak = createHelloChatIdentityStreak()
    const nodes: ReactNode[] = []
    for (const line of lines) {
      if (line.kind === "user") {
        nodes.push(
          <div key={line.id} className="flex w-full min-w-0 justify-end">
            <HelloCxBubbleCard showIdentity={streak.nextCxBubbleShowIdentity()}>
              <p className="text-left font-euclid text-[14px] font-medium leading-5 text-[#36354c]">
                {line.text}
              </p>
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

  const policyDetailForPane =
    policyDetailPane.pane.mode === "closed" ? null : policyDetailPane.pane.policy

  const companionColumn = (
    <div
      className={cn(
        "relative z-10 flex min-h-0 flex-1 flex-col",
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
      <div className="relative z-20 shrink-0 px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
        <div className="mx-auto flex w-full max-w-2xl min-w-0 justify-center">
          <div
            className={cn(
              "flex w-full min-w-0 items-end gap-2 rounded-3xl border border-[#e7e7f0] bg-white py-2 pl-4 pr-2 sm:pl-5 sm:pr-1.5",
              "shadow-[0px_12px_40px_rgba(54,53,76,0.14),0px_4px_12px_rgba(54,53,76,0.06)]",
              "ring-1 ring-[#36354c]/[0.05]",
            )}
          >
            <textarea
              rows={1}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Type a message…"
              className={cn(
                "max-h-32 min-h-[44px] flex-1 resize-y rounded-2xl bg-white/80 py-2.5 pl-1 font-euclid text-[14px] leading-5 text-[#36354c]",
                "outline-none ring-0 placeholder:text-[#8b87a3]",
              )}
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSendComposer}
              disabled={!composerText.trim()}
              aria-label="Send message"
              className="mb-0.5 size-11 shrink-0 rounded-full bg-[#7c47e1] text-white shadow-md hover:bg-[#6b3ccd] disabled:opacity-40"
            >
              <Send className="size-5" aria-hidden strokeWidth={2} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div
      data-omni-ai-surface="hello-rsa"
      className={cn(
        "relative flex h-full min-h-0 w-full overflow-hidden bg-[#fafafa]",
        className,
      )}
      aria-label="Road Side Assistance — Hello view"
    >
      <CustomerProfileSidebar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
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
                {companionColumn}
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
            policyDetailForPane={policyDetailForPane}
            customerPolicies={activePolicies}
            onPolicyDetailClose={() => policyDetailPane.close()}
            onCTAPressed={(action, policy) => {
              if (action === "view_details" || action === "share_policy_document") {
                policyDetailPane.open(policy)
                sidebar.openAiSidebar()
              }
              if (action === "road-side-assistance") {
                sidebar.triggerManualAction("road-side-assistance")
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
