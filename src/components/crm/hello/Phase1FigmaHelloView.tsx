/**
 * UC7 — Phase-1 (Figma design: nodes 297:4490 & 297:5832)
 * Same opening context + center chat flow as Raise a Claim (UC2).
 * Right panel: only "Power tools" tab.
 */
import { useCallback, useEffect, useId, useRef, useState } from "react"
import {
  Check,
  Send,
  Wrench,
} from "lucide-react"
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
import {
  QuickCapabilityDrawer,
  type QuickDrawerItem,
} from "@/components/crm/hello/QuickCapabilityDrawer"

// ─── Types ────────────────────────────────────────────────────────────────────

type ChoiceId = "guide_customer" | "raise_on_behalf" | "something_else"

type MessageRole = "ai" | "cx"

interface ChatMessage {
  id: string
  role: MessageRole
  content:
    | "cx_choice"
    | "two_steps"
    | "guide_steps"
    | "something_else_ack"
    | "claim_success"
    | "raise_claim_cmd"      // cx typed "Raise a claim" via drawer
    | "policy_picker"        // ai asks which policy to raise claim for
    | "policy_selected"      // cx picked a policy
    | "policy_claim_options" // ai shows the 3 claim-flow options
  choiceLabel?: string
  claimId?: string
  policyId?: string
}

const QUICK_ITEMS: QuickDrawerItem[] = [
  {
    id: "raise_claim",
    label: "Raise a claim",
    description: "Raise a motor insurance claim on customer's behalf",
  },
]

// ─── Phase-1 right rail button ────────────────────────────────────────────────

function Phase1RailButton({
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

interface Phase1FigmaHelloViewProps {
  customer: Customer
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  className?: string
}

export function Phase1FigmaHelloView({
  customer,
  activePolicies,
  inactivePolicies,
  className,
}: Phase1FigmaHelloViewProps) {
  const vehicleLabel = activePolicies[0]?.vehicle ?? activePolicies[0]?.name ?? "Ecosport Titanium 2025"

  // Right panel — closed by default; clicking the Power Tools tab toggles it
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  const handleTabClick = useCallback(() => {
    setRightPanelOpen((open) => !open)
  }, [])

  // Chat timing
  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const pauseMs = HELLO_BOT_REPLY_AFTER_USER_MS
  const introTypingLabelId = useId()
  const optionsTypingLabelId = useId()
  const replyTypingLabelId = useId()

  // Staggered initial load
  const [showIntroTyping, setShowIntroTyping] = useState(true)
  const [showBubble1, setShowBubble1] = useState(false)
  const [showTypingBeforeOptions, setShowTypingBeforeOptions] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [aiTyping, setAiTyping] = useState(false)

  // Chat messages
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [choiceMade, setChoiceMade] = useState<ChoiceId | null>(null)

  // Input bar
  const [composerValue, setComposerValue] = useState("")
  const chatEndRef = useRef<HTMLDivElement>(null)

  // Quick drawer
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false)
  const [quickHighlight, setQuickHighlight] = useState(0)
  const quickDrawerRef = useRef<HTMLDivElement>(null)

  // Policy picker flow — separate choice state so it doesn't conflict with initial flow
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null)
  const [drawerChoiceMade, setDrawerChoiceMade] = useState<ChoiceId | null>(null)

  const drawerItems = composerValue.trim().length > 0
    ? QUICK_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(composerValue.toLowerCase().trim()),
      )
    : QUICK_ITEMS

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showBubble1, showOptions, aiTyping])

  // Close quick drawer on outside click
  useEffect(() => {
    if (!quickDrawerOpen) return
    const handleClick = (e: MouseEvent) => {
      if (quickDrawerRef.current && !quickDrawerRef.current.contains(e.target as Node)) {
        setQuickDrawerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [quickDrawerOpen])

  // Stagger initial AI messages
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

      if (choiceId === "raise_on_behalf") {
        setMessages((prev) => [...prev, cxMsg])
        setTimeout(() => {
          setAiTyping(true)
          setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: "two-steps", role: "ai", content: "two_steps" },
            ])
          }, typingMs)
        }, pauseMs)
        return
      }

      if (choiceId === "guide_customer") {
        setMessages((prev) => [...prev, cxMsg])
        setTimeout(() => {
          setAiTyping(true)
          setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: "guide-steps", role: "ai", content: "guide_steps" },
            ])
          }, typingMs)
        }, pauseMs)
        return
      }

      // something_else
      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: "else-ack", role: "ai", content: "something_else_ack" },
          ])
        }, typingMs)
      }, pauseMs)
    },
    [pauseMs, typingMs],
  )

  const handleSendMessage = useCallback(() => {
    const val = composerValue.trim()
    if (!val) return
    setQuickDrawerOpen(false)
    setComposerValue("")
  }, [composerValue])

  const handleComposerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setComposerValue(val)
    if (val.trim().length > 0) {
      setQuickDrawerOpen(true)
      setQuickHighlight(0)
    } else {
      setQuickDrawerOpen(false)
    }
  }, [])

  const handleComposerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!quickDrawerOpen || drawerItems.length === 0) {
        if (e.key === "Enter") handleSendMessage()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setQuickHighlight((i) => (i + 1) % drawerItems.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setQuickHighlight((i) => (i - 1 + drawerItems.length) % drawerItems.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        handleQuickSelect(drawerItems[quickHighlight])
      } else if (e.key === "Escape") {
        setQuickDrawerOpen(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quickDrawerOpen, drawerItems, quickHighlight, handleSendMessage],
  )

  const handleQuickSelect = useCallback(
    (item: QuickDrawerItem) => {
      setComposerValue("")
      setQuickDrawerOpen(false)

      if (item.id === "raise_claim") {
        const cxMsg: ChatMessage = {
          id: `cx-${Date.now()}`,
          role: "cx",
          content: "raise_claim_cmd",
          choiceLabel: "Raise a claim",
        }
        setMessages((prev) => [...prev, cxMsg])
        setTimeout(() => {
          setAiTyping(true)
          setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: `policy-picker-${Date.now()}`, role: "ai", content: "policy_picker" },
            ])
          }, typingMs)
        }, pauseMs)
      }
    },
    [pauseMs, typingMs],
  )

  const handlePolicyPick = useCallback(
    (policy: Policy) => {
      if (selectedPolicyId !== null) return
      setSelectedPolicyId(policy.id)
      const cxMsg: ChatMessage = {
        id: `cx-${Date.now()}`,
        role: "cx",
        content: "policy_selected",
        choiceLabel: policy.name,
        policyId: policy.id,
      }
      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: `claim-opts-${Date.now()}`, role: "ai", content: "policy_claim_options" },
          ])
        }, typingMs)
      }, pauseMs)
    },
    [selectedPolicyId, pauseMs, typingMs],
  )

  const handleDrawerPick = useCallback(
    (key: string, label: string) => {
      const choiceId = key as ChoiceId
      setDrawerChoiceMade(choiceId)

      const cxMsg: ChatMessage = {
        id: `cx-${Date.now()}`,
        role: "cx",
        content: "cx_choice",
        choiceLabel: label,
      }

      if (choiceId === "raise_on_behalf") {
        setMessages((prev) => [...prev, cxMsg])
        setTimeout(() => {
          setAiTyping(true)
          setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: `two-steps-d-${Date.now()}`, role: "ai", content: "two_steps" },
            ])
          }, typingMs)
        }, pauseMs)
        return
      }

      if (choiceId === "guide_customer") {
        setMessages((prev) => [...prev, cxMsg])
        setTimeout(() => {
          setAiTyping(true)
          setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: `guide-d-${Date.now()}`, role: "ai", content: "guide_steps" },
            ])
          }, typingMs)
        }, pauseMs)
        return
      }

      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: `else-d-${Date.now()}`, role: "ai", content: "something_else_ack" },
          ])
        }, typingMs)
      }, pauseMs)
    },
    [pauseMs, typingMs],
  )

  // ── Message rendering ────────────────────────────────────────────────────────

  const renderMessage = (msg: ChatMessage) => {
      if (msg.content === "cx_choice" || msg.content === "raise_claim_cmd" || msg.content === "policy_selected") {
        return (
          <div key={msg.id} className="flex w-full justify-end">
            <HelloCxBubbleCard>{msg.choiceLabel ?? ""}</HelloCxBubbleCard>
          </div>
        )
      }

      if (msg.content === "policy_picker") {
        return (
          <div key={msg.id} className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity>
              <div className="flex flex-col gap-3">
                <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                  Which policy would you like to raise a claim for?
                </p>
                <div className="flex flex-col gap-2">
                  {activePolicies.map((policy) => (
                    <button
                      key={policy.id}
                      type="button"
                      onClick={() => handlePolicyPick(policy)}
                      className={cn(
                        "flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                        selectedPolicyId === policy.id
                          ? "border-[#7c47e1] bg-[#f0ecfa]"
                          : selectedPolicyId !== null
                            ? "cursor-default border-[#e7e7f0] bg-[#fafafa] opacity-50"
                            : "border-[#e7e7f0] bg-white hover:border-[#b9a0f0] hover:bg-[#f9f7fe]",
                      )}
                    >
                      <p className="font-euclid text-[13px] font-semibold text-[#040222]">
                        {policy.vehicle ?? policy.name}
                      </p>
                      <p className="font-euclid text-[11px] text-[#8b87a3]">
                        {policy.policyNumber} · Expires {policy.expiryDate}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            </HelloAiBubbleCard>
          </div>
        )
      }

      if (msg.content === "policy_claim_options") {
        return (
          <div key={msg.id} className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={false}>
              <WorkflowOfferPick
                options={[
                  { key: "guide_customer", label: "Customer will do it themselves" },
                  { key: "raise_on_behalf", label: "Raise it on customer's behalf" },
                  { key: "something_else", label: "Customer called for something else" },
                ]}
                onPick={handleDrawerPick}
                selectedKey={drawerChoiceMade ?? undefined}
              />
            </HelloAiBubbleCard>
          </div>
        )
      }

      if (msg.content === "two_steps") {
        return (
          <div key={msg.id} className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity>
              <div className="flex flex-col gap-3">
                <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                  To raise a claim on the customer's behalf, we'll need:
                </p>
                <div className="flex flex-col gap-2">
                  {[
                    "Verify the customer's documents (RC Copy & Driving License)",
                    "Then proceed to raise the claim in the system",
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
                  Raise a Claim
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
          'Tap "File a Claim" and follow the steps on screen.',
          "Upload the RC Copy and Driving License when prompted.",
          "Your claim handler will call within 1–2 working days.",
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
                  <p className="font-euclid text-[12px] font-semibold text-[#5b5675]">Tell the customer:</p>
                  <p className="mt-1 font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
                    <span className="text-[#8b87a3]">&ldquo;</span>
                    Please follow these steps on your ACKO app. Your claim handler will contact
                    you within 1–2 working days once your claim is submitted.
                    <span className="text-[#8b87a3]">&rdquo;</span>
                  </p>
                </div>
              </div>
            </HelloAiBubbleCard>
          </div>
        )
      }

      if (msg.content === "something_else_ack") {
        return (
          <div key={msg.id} className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity>
              <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                Understood. Please continue assisting the customer with their actual concern.
              </p>
            </HelloAiBubbleCard>
          </div>
        )
      }

      if (msg.content === "claim_success") {
        return (
          <div key={msg.id} className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity>
              <div className="flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] ring-1 ring-[#d1fae5]">
                  <Check className="size-3 text-[#059669]" strokeWidth={2.5} />
                </div>
                <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                  Claim successfully raised for{" "}
                  <span className="font-semibold text-[#040222]">{vehicleLabel}</span>.
                </p>
              </div>
            </HelloAiBubbleCard>
          </div>
        )
      }

      return null
  }

  // ── Intro bubble ─────────────────────────────────────────────────────────────

  const renderIntro = () => (
    <div key="intro" className="min-w-0 max-w-full">
      <HelloAiBubbleCard showIdentity>
        <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
          Customer is calling to{" "}
          <span className="font-semibold text-[#040222]">Raise a claim</span> for their{" "}
          <span className="font-semibold text-[#040222]">{vehicleLabel}</span>, check with the
          customer if they want to raise a claim on their own or agent should assist?
        </p>
      </HelloAiBubbleCard>
    </div>
  )

  const renderOptions = () => (
    <div key="options" className="min-w-0 max-w-full">
      <HelloAiBubbleCard showIdentity={false}>
        <WorkflowOfferPick
          options={[
            { key: "guide_customer",  label: "Customer will do it themselves" },
            { key: "raise_on_behalf", label: "Raise it on customer's behalf" },
            { key: "something_else",  label: "Customer called for something else" },
          ]}
          onPick={handlePick}
          selectedKey={choiceMade ?? undefined}
        />
      </HelloAiBubbleCard>
    </div>
  )

  // ── Layout ───────────────────────────────────────────────────────────────────

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
          {/* Quick drawer — floats above the input */}
          {quickDrawerOpen && drawerItems.length > 0 && (
            <QuickCapabilityDrawer
              containerRef={quickDrawerRef}
              items={drawerItems}
              highlightIndex={quickHighlight}
              onHighlightChange={setQuickHighlight}
              onSelect={handleQuickSelect}
            />
          )}
          <div className="flex items-center gap-3 rounded-2xl border border-[#e7e7f0] bg-white px-4 py-3 shadow-sm">
            <input
              type="text"
              value={composerValue}
              onChange={handleComposerChange}
              onKeyDown={handleComposerKeyDown}
              onFocus={() => setQuickDrawerOpen(true)}
              placeholder="Ask anything here..."
              className="min-w-0 flex-1 font-euclid text-[14px] text-[#36354c] outline-none placeholder:text-[#8b87a3]"
            />
            <button type="button" onClick={handleSendMessage} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5c30c9]">
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
        <Phase1RailButton
          label="Power tools"
          isActive={rightPanelOpen}
          onClick={handleTabClick}
        >
          <Wrench className="size-5" strokeWidth={1.75} aria-hidden />
        </Phase1RailButton>
      </div>
    </div>
  )
}
