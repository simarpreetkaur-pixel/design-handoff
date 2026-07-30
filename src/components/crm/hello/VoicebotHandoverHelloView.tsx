/**
 * UC8 — Voicebot Handover
 * Same layout as Phase-1: left sidebar, center chat, right rail (Power Tools only).
 * Chat covers an edit-name-in-policy voicebot-transferred call for Sumit Sharma.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { Check, Send, Wrench } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Customer, InactivePolicy, Policy } from "@/types/crm"
import { CustomerProfileSidebar } from "@/components/crm/hello/CustomerProfileSidebar"
import {
  HelloAiBubbleCard,
  HelloCxBubbleCard,
  TypingIndicator,
} from "@/components/crm/hello/HelloChatPrimitives"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import { HelloPowerToolsPanel } from "@/components/crm/hello/HelloRightPanelRail"
import {
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
} from "@/components/crm/hello/helloRaiseClaimCopy"

// ─── Types ────────────────────────────────────────────────────────────────────

type ChoiceId = "do_on_behalf" | "guide_customer"

type MessageRole = "ai" | "cx"

interface ChatMessage {
  id: string
  role: MessageRole
  content: "cx_choice" | "do_on_behalf_response" | "guide_steps"
  choiceLabel?: string
}

// ─── Right rail button ────────────────────────────────────────────────────────

function RailButton({
  label,
  isActive,
  onClick,
  children,
}: {
  label: string
  isActive: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-pressed={isActive}
      className="flex flex-col items-center gap-1.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/40"
    >
      <div
        className={cn(
          "flex size-[28px] items-center justify-center rounded-[6px] transition-colors",
          isActive ? "bg-[#efe9fb] text-[#7c47e1]" : "text-[#5b5675] hover:bg-[#f8f7fc]",
        )}
      >
        {children}
      </div>
      <span
        className={cn(
          "w-9 break-words text-center font-euclid text-[10px] font-medium leading-[1.3]",
          isActive ? "text-[#7c47e1]" : "text-[#5b5675]",
        )}
      >
        {label}
      </span>
    </button>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

interface VoicebotHandoverHelloViewProps {
  customer: Customer
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  className?: string
}

export function VoicebotHandoverHelloView({
  customer,
  activePolicies,
  inactivePolicies,
  className,
}: VoicebotHandoverHelloViewProps) {
  const vehicleLabel =
    activePolicies[0]?.vehicle ?? activePolicies[0]?.name ?? "Ecosport Titanium 2025"

  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const handleTabClick = useCallback(() => setRightPanelOpen((open) => !open), [])

  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const pauseMs = HELLO_BOT_REPLY_AFTER_USER_MS
  const introTypingLabelId = useId()
  const optionsTypingLabelId = useId()
  const replyTypingLabelId = useId()

  const [showIntroTyping, setShowIntroTyping] = useState(true)
  const [showBubble1, setShowBubble1] = useState(false)
  const [showTypingBeforeOptions, setShowTypingBeforeOptions] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [choiceMade, setChoiceMade] = useState<ChoiceId | null>(null)
  const [composerValue, setComposerValue] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showBubble1, showOptions, aiTyping])

  useEffect(() => {
    let cancelled = false
    const schedule = (fn: () => void, ms: number) =>
      setTimeout(() => { if (!cancelled) fn() }, ms)
    const t0 = typingMs
    schedule(() => { setShowIntroTyping(false); setShowBubble1(true) }, t0)
    schedule(() => setShowTypingBeforeOptions(true), t0 + pauseMs)
    schedule(() => { setShowTypingBeforeOptions(false); setShowOptions(true) }, t0 + pauseMs + typingMs)
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePick = useCallback(
    (key: string, label: string) => {
      const choiceId = key as ChoiceId
      setChoiceMade(choiceId)

      const cxMsg: ChatMessage = {
        id: `cx-${Date.now()}`,
        role: "cx",
        content: "cx_choice",
        choiceLabel: label,
      }

      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            {
              id: `ai-${Date.now()}`,
              role: "ai",
              content: choiceId === "do_on_behalf" ? "do_on_behalf_response" : "guide_steps",
            },
          ])
        }, typingMs)
      }, pauseMs)
    },
    [pauseMs, typingMs],
  )

  const handleSendMessage = useCallback(() => {
    const val = composerValue.trim()
    if (!val) return
    setComposerValue("")
  }, [composerValue])

  // ── Message rendering ─────────────────────────────────────────────────────

  const renderMessage = useCallback(
    (msg: ChatMessage) => {
      if (msg.content === "cx_choice") {
        return (
          <div key={msg.id} className="flex w-full justify-end">
            <HelloCxBubbleCard>{msg.choiceLabel ?? ""}</HelloCxBubbleCard>
          </div>
        )
      }

      if (msg.content === "do_on_behalf_response") {
        return (
          <div key={msg.id} className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity>
              <div className="flex flex-col gap-3">
                <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                  To edit the name on the customer's behalf, we'll need:
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    "Ensure the customer has their RC Copy and Driving License handy",
                    "Then proceed to edit the name in the policy",
                  ].map((step, i) => (
                    <div key={step} className="flex items-start gap-2">
                      <span className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#f0ecfa] font-euclid text-[11px] font-semibold text-[#7c47e1]">
                        {i + 1}
                      </span>
                      <p className="font-euclid text-[13px] leading-5 text-[#36354c]">{step}</p>
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={() => window.open("", "_blank", "noopener,noreferrer")}
                  className="self-start rounded-lg border border-[#5920c5] bg-white px-3 py-2 font-euclid text-[14px] font-medium text-[#5920c5] transition-colors hover:bg-[#f0ecfa]"
                >
                  Edit Policy
                </button>
              </div>
            </HelloAiBubbleCard>
          </div>
        )
      }

      if (msg.content === "guide_steps") {
        const steps = [
          'Open the ACKO app and go to "My Policies".',
          `Select the ${vehicleLabel} policy.`,
          'Tap "Edit Policy" and select "Name change".',
          "Enter the correct name and submit the required documents.",
          "The update will be reflected within 2–3 working days.",
        ]
        return (
          <div key={msg.id} className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity>
              <div className="flex flex-col gap-3">
                <p className="font-euclid text-[14px] font-semibold text-[#040222]">
                  Guide the customer through these steps:
                </p>
                <ol className="flex flex-col gap-2 pl-4">
                  {steps.map((step) => (
                    <li
                      key={step}
                      className="font-euclid text-[13px] leading-5 text-[#36354c]"
                      style={{ listStyleType: "decimal" }}
                    >
                      {step}
                    </li>
                  ))}
                </ol>
                <div className="rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5">
                  <p className="font-euclid text-[12px] font-semibold text-[#5b5675]">
                    Tell the customer:
                  </p>
                  <p className="mt-1 font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
                    <span className="text-[#8b87a3]">&ldquo;</span>
                    Please follow these steps on your ACKO app. Once you submit the request, the
                    name change will be reflected within 2–3 working days.
                    <span className="text-[#8b87a3]">&rdquo;</span>
                  </p>
                </div>
              </div>
            </HelloAiBubbleCard>
          </div>
        )
      }

      return null
    },
    [vehicleLabel],
  )

  // ── Intro bubble ──────────────────────────────────────────────────────────

  const renderIntro = () => (
    <div key="intro" className="min-w-0 max-w-full">
      <HelloAiBubbleCard showIdentity>
        <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
          This call was handed over through{" "}
          <span className="font-semibold text-[#040222]">voicebot</span>. The customer mentioned
          they are getting an error in changing their name in the policy document for{" "}
          <span className="font-semibold text-[#040222]">{vehicleLabel}</span>. The best possible
          action is to do the edit on the customer's behalf.
        </p>
      </HelloAiBubbleCard>
    </div>
  )

  const renderOptions = () => (
    <div key="options" className="min-w-0 max-w-full">
      <HelloAiBubbleCard showIdentity={false}>
        <WorkflowOfferPick
          options={[
            { key: "do_on_behalf", label: "Do it on customer's behalf" },
            { key: "guide_customer", label: "Guide customer to edit" },
          ]}
          onPick={handlePick}
          selectedKey={choiceMade ?? undefined}
        />
      </HelloAiBubbleCard>
    </div>
  )

  // ── Layout ────────────────────────────────────────────────────────────────

  return (
    <div className={cn("relative flex w-full bg-[#fafafa]", className)}>
      {/* Left sidebar */}
      <CustomerProfileSidebar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
        showTabs
        className="shrink-0"
      />

      {/* Center panel — chat */}
      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col",
          rightPanelOpen ? "border-r border-[#e7e7f0]" : "",
        )}
      >
        {/* Chat scroll area */}
        <div className="min-h-0 flex flex-1 flex-col items-start gap-3 overflow-y-auto overscroll-y-contain px-10 py-5">
          {showIntroTyping && <TypingIndicator labelId={introTypingLabelId} showIdentity />}
          {showBubble1 && renderIntro()}
          {showTypingBeforeOptions && (
            <TypingIndicator labelId={optionsTypingLabelId} showIdentity={false} />
          )}
          {showOptions && renderOptions()}
          {messages.map(renderMessage)}
          {aiTyping && <TypingIndicator labelId={replyTypingLabelId} showIdentity={false} />}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="relative shrink-0 border-t border-[#e7e7f0] px-10 py-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e7e7f0] bg-white px-4 py-3 shadow-sm">
            <input
              type="text"
              value={composerValue}
              onChange={(e) => setComposerValue(e.target.value)}
              placeholder="Ask anything here..."
              className="min-w-0 flex-1 font-euclid text-[14px] text-[#36354c] outline-none placeholder:text-[#8b87a3]"
            />
            <button
              type="button"
              onClick={handleSendMessage}
              className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5c30c9]"
            >
              <Send className="size-4 text-white" />
            </button>
          </div>
        </div>
      </div>

      {/* Right content panel — only shown when Power Tools tab is active */}
      {rightPanelOpen && (
        <div className="flex h-full w-[232px] shrink-0 flex-col border-l border-[#e7e7f0] bg-white">
          <HelloPowerToolsPanel onToolClick={() => {}} />
        </div>
      )}

      {/* Right icon rail — Power Tools only */}
      <div className="flex h-full shrink-0 flex-col items-center gap-6 border-l border-[#e7e7f0] bg-white px-3.5 py-4">
        <RailButton label="Power tools" isActive={rightPanelOpen} onClick={handleTabClick}>
          <Wrench className="size-5" strokeWidth={1.75} aria-hidden />
        </RailButton>
      </div>
    </div>
  )
}
