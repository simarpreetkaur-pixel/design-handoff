import { useState, useRef, useEffect, useCallback, type KeyboardEvent } from "react"
import { Send, User, Sparkles } from "lucide-react"

import type { JTBDType } from "@/types/crm"
import type { FlowActionValue } from "@/components/crm/ActionDetailPage"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { cn } from "@/lib/utils"

/** One crisp line + optional short subline */
interface BotStepLine {
  title: string
  detail?: string
  /** In-CRM CTA (e.g. opens same flow as Agent’s Next Actions in the left panel) */
  crmCta?: { label: string; crmAction: FlowActionValue }
}

/** Shown in bot replies; ties copy to the selected ongoing JTBD + policy on file */
export type AIChatCaseContext = {
  jtbdLabel: string
  vehicle: string
  jtbdType: JTBDType
  policyNumber?: string
}

interface ChatInsightBlock {
  title: string
  body: string
}

interface ChatMessage {
  id: string
  role: "user" | "bot"
  text: string
  steps?: BotStepLine[]
  insightBlocks?: ChatInsightBlock[]
  /** Short label tying the reply to the ask (ACKO purple, above timeline) */
  contextLabel?: string
}

export type ChatMockCase = "default" | "kyc_issuance" | "raj_cold_nexon"

interface AIChatPanelProps {
  isActive?: boolean
  preWrittenMessage?: string
  askInChatNonce?: number
  onMessageUsed?: () => void
  activeJtbdType?: JTBDType
  chatMockCase?: ChatMockCase
  /** Selected ongoing JTBD + policy hint from the left panel */
  caseContext?: AIChatCaseContext | null
  /** Open an in-CRM action (left panel) — e.g. Send Alert from a timeline step */
  onCrmFlowAction?: (action: FlowActionValue) => void
}

const WELCOME_BOT_TEXT =
  "Ask in plain language. I’ll keep replies short—bullets or a tiny timeline when it helps."

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "bot",
    text: WELCOME_BOT_TEXT,
  },
]

type BotReplyPayload = Pick<ChatMessage, "text" | "steps" | "insightBlocks" | "contextLabel">

function formatContextCaption(ctx: AIChatCaseContext | null | undefined): string | null {
  if (!ctx) return null
  const typeLabel = ctx.jtbdType === "claim" ? "Claim" : "Renewal"
  const jtbdExtra =
    ctx.jtbdLabel.trim() && ctx.jtbdLabel.trim().toLowerCase() !== typeLabel.toLowerCase()
      ? ctx.jtbdLabel.trim()
      : null
  return [typeLabel, ctx.policyNumber, ctx.vehicle, jtbdExtra]
    .filter((s): s is string => Boolean(s && String(s).trim()))
    .join(" · ")
}

function buildBotReply(
  userText: string,
  jtbdType: JTBDType = "claim",
  chatMockCase: ChatMockCase = "default",
  caseContext: AIChatCaseContext | null | undefined = null,
): BotReplyPayload {
  const q = userText.toLowerCase()

  if (chatMockCase === "kyc_issuance") {
    const asksDetailed =
      q.includes("full") ||
      (q.includes("detailed") && (q.includes("summary") || q.includes("breakdown"))) ||
      q.includes("agent-facing") ||
      q.includes("as the agent") ||
      (q.includes("payment") && q.includes("kyc") && (q.includes("pre-inspection") || q.includes("pre inspection"))) ||
      (q.includes("send communication") && q.includes("kyc ops")) ||
      q.includes("repeat-call") ||
      q.includes("repeat call") ||
      q.includes("entire case")

    if (asksDetailed) {
      return {
        contextLabel: "Issuance · Honda Activa",
        text: "What matters on this call:",
        steps: [
          { title: "Payment", detail: "Done 12 Feb — not the blocker." },
          { title: "KYC", detail: "Aadhaar maiden vs app married name — auto match fails." },
          { title: "Tone", detail: "4 calls, last Angry — acknowledge before next step." },
          { title: "Pre-inspection", detail: "Hold until KYC clears." },
          { title: "Do next", detail: "Send Communication (re-upload) → email KYC Ops if still stuck." },
        ],
      }
    }

    if (
      q.includes("kyc") ||
      q.includes("aadhaar") ||
      q.includes("name") ||
      q.includes("mismatch") ||
      q.includes("maiden") ||
      q.includes("married") ||
      q.includes("re-upload") ||
      q.includes("activa") ||
      q.includes("pre-inspection") ||
      q.includes("escalat") ||
      q.includes("next step") ||
      q.includes("fix")
    ) {
      return {
        contextLabel: "KYC name mismatch",
        text: "Fast path:",
        steps: [
          { title: "Root cause", detail: "ID name ≠ application name." },
          { title: "Fix", detail: "Send Communication → re-upload / proof." },
          { title: "If heated", detail: "One apology, one action." },
          { title: "Escalate", detail: "After clean retry fails — email KYC Ops + ticket." },
        ],
      }
    }

    return {
      contextLabel: "Issuance queue",
      text: "Open gates:",
      steps: [
        { title: "KYC", detail: "Blocking forward movement." },
        { title: "Pre-inspection", detail: "Waits on KYC." },
        { title: "Act", detail: "Re-upload flow first." },
      ],
    }
  }

  if (chatMockCase === "raj_cold_nexon") {
    const isCoverageQuickAsk =
      (q.includes("cover") && (q.includes("nexon") || q.includes("comprehens") || q.includes("comprehensive") || q.includes("car_") || q.includes("policy"))) ||
      (q.includes("what") && q.includes("cover")) ||
      q.includes("whats covered") ||
      q.includes("what's covered")
    if (isCoverageQuickAsk) {
      return {
        contextLabel: "Tata Nexon · comprehensive",
        text: "Schedule beats memory:",
        insightBlocks: [
          { title: "OD", body: "Own car damage per wordings; check excess & add-ons on schedule." },
          { title: "TP", body: "Third-party liability within limits." },
          { title: "On call", body: "Open live policy before you quote amounts." },
        ],
      }
    }
    if (
      q.includes("cover") ||
      q.includes("comprehens") ||
      q.includes("own damage") ||
      q.includes("od ") ||
      q.includes("tp ") ||
      q.includes("third party") ||
      q.includes("liability") ||
      q.includes("add-on") ||
      q.includes("zero dep") ||
      q.includes("nexon") ||
      q.includes("car_comprehensive") ||
      q.includes("confirm before")
    ) {
      return {
        contextLabel: "Nexon · comprehensive",
        text: "Don’t over-promise:",
        steps: [
          { title: "Baseline", detail: "OD + TP per terms; add-ons only if on schedule." },
          { title: "Check", detail: "Deductible, NCB, repair mode, intimation windows." },
          { title: "If unsure", detail: "Say you’ll confirm from full policy / Claims." },
        ],
      }
    }
    if (
      q.includes("incident") ||
      q.includes("fnol") ||
      q.includes("intimat") ||
      q.includes("accident") ||
      q.includes("theft") ||
      q.includes("first step")
    ) {
      return {
        contextLabel: "New claim intake",
        text: "No JTBD yet — start tight:",
        steps: [
          { title: "30s", detail: "When, where, injuries, FIR if needed." },
          { title: "Expect", detail: "Claim ID after FNOL; docs in-app." },
          { title: "Then", detail: "Raise claim + use Active policy for cover." },
        ],
      }
    }
    return {
      contextLabel: "Cold call · Nexon on file",
      text: "Stay scoped:",
      steps: [
        { title: "Ask", detail: "Claim vs service vs policy?" },
        { title: "Anchor", detail: "Car_Comprehensive on Nexon." },
        { title: "Guard", detail: "No payable guarantees without endorsements." },
      ],
    }
  }

  if (jtbdType === "renewal") {
    if (q.includes("status") && (q.includes("where") || q.includes("stage") || q.includes("at") || q.includes("glance"))) {
      return {
        contextLabel: "Renewal window",
        text: "At a glance:",
        steps: [
          { title: "Window", detail: "Open — in-window." },
          { title: "NCB", detail: "Eligible — include in quote." },
          { title: "Push", detail: "Decision + pay link before close." },
        ],
      }
    }
    if (
      q.includes("renewal") ||
      q.includes("ncb") ||
      q.includes("no claim") ||
      q.includes("quote") ||
      q.includes("link") ||
      q.includes("whatsapp") ||
      q.includes("sms") ||
      q.includes("reminder") ||
      q.includes("window") ||
      q.includes("decision") ||
      q.includes("confused") ||
      q.includes("order") ||
      q.includes("next") ||
      q.includes("eligib")
    ) {
      return {
        contextLabel: "Renewal + NCB",
        text: "Simple order:",
        steps: [
          { title: "Quote", detail: "Send Alert so NCB is in the price." },
          { title: "Share", detail: "One pay link (WhatsApp/SMS)." },
          { title: "Stuck?", detail: "Brief compare to last year → ask for decision." },
        ],
      }
    }
    return {
      contextLabel: "Renewal",
      text: "Defaults:",
      steps: [
        { title: "Alert first", detail: "Numbers match Status." },
        { title: "One CTA", detail: "Avoid mixed messages." },
        { title: "Note outcome", detail: "For next agent." },
      ],
    }
  }

  if (q.includes("garage") || q.includes("drop-off") || q.includes("confused") || q.includes("preferred garage")) {
    const cap = formatContextCaption(caseContext)
    return {
      contextLabel: cap ? `${cap} · Garage drop-off` : "Garage drop-off",
      text: "Three moves:",
      steps: [
        { title: "App", detail: "Customer opens ACKO app." },
        { title: "Garage", detail: "They pick preferred in claim flow." },
        {
          title: "Stuck",
          detail: "After the in-app nudge, share garage details on WhatsApp if still needed.",
          crmCta: { label: "Send Alert", crmAction: "send_alert" },
        },
      ],
    }
  }

  if (q.includes("status") || q.includes("where") || q.includes("stage")) {
    const cap = formatContextCaption(caseContext)
    return {
      contextLabel: cap ? `${cap} · Status` : "JTBD status",
      text: "From your panel:",
      steps: [
        { title: "Step", detail: "Garage drop-off." },
        { title: "Blocker", detail: "Garage not chosen — yellow nudge." },
        { title: "Align", detail: "Use Send Alert / Send Communication in Agent’s next actions." },
      ],
    }
  }

  return {
    contextLabel: "General",
    text: "Try this:",
    steps: [
      { title: "Status", detail: "Confirm active step + nudges." },
      { title: "CTAs", detail: "Match need to Alert or comms." },
      { title: "Handoff", detail: "Log what you did." },
    ],
  }
}

function BotStepTimeline({
  steps,
  messageId,
  onCrmFlowAction,
}: {
  steps: BotStepLine[]
  messageId: string
  onCrmFlowAction?: (action: FlowActionValue) => void
}) {
  return (
    <ol className="m-0 list-none p-0" aria-label="Steps">
      {steps.map((step, i) => {
        const isLast = i === steps.length - 1
        return (
          <li key={`${messageId}-step-${i}`} className="flex gap-3">
            <div className="flex w-4 shrink-0 flex-col items-center pt-1">
              <span className="size-2 shrink-0 rounded-full bg-[#7c47e1] ring-2 ring-[#f5f3fc]" aria-hidden />
              {!isLast ? <span className="mt-1 block h-5 w-px shrink-0 bg-[#e7e7f0]" aria-hidden /> : null}
            </div>
            <div className={cn("min-w-0 flex-1", !isLast && "pb-1")}>
              <p className="font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">{step.title}</p>
              {step.detail ? (
                <p className="mt-0.5 font-euclid text-[12px] leading-[18px] text-[#5b5675]">{step.detail}</p>
              ) : null}
              {step.crmCta && onCrmFlowAction ? (
                <div className="mt-1.5">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => onCrmFlowAction(step.crmCta!.crmAction)}
                    className="h-auto min-h-0 rounded-lg px-2.5 py-1 font-euclid text-[12px] font-semibold text-[#7c47e1] hover:bg-[#f5f3fc] hover:text-[#44277b]"
                  >
                    {step.crmCta.label}
                  </Button>
                </div>
              ) : null}
            </div>
          </li>
        )
      })}
    </ol>
  )
}

export function AIChatPanel({
  isActive = false,
  preWrittenMessage = "",
  askInChatNonce = 0,
  onMessageUsed,
  activeJtbdType = "claim",
  chatMockCase = "default",
  caseContext = null,
  onCrmFlowAction,
}: AIChatPanelProps = {}) {
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages)
  const [input, setInput] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const lastPrefillNonceRef = useRef(0)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  useEffect(() => {
    if (isActive && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isActive])

  const sendUserText = useCallback(
    (raw: string) => {
      const trimmed = raw.trim()
      if (!trimmed) return

      const userMessage: ChatMessage = {
        id: `u-${Date.now()}`,
        role: "user",
        text: trimmed,
      }

      setMessages((prev) => [...prev, userMessage])
      setInput("")

      window.setTimeout(() => {
        const reply = buildBotReply(trimmed, activeJtbdType, chatMockCase, caseContext)
        const botMessage: ChatMessage = {
          id: `b-${Date.now()}`,
          role: "bot",
          text: reply.text,
          steps: reply.steps,
          insightBlocks: reply.insightBlocks,
          contextLabel: reply.contextLabel,
        }
        setMessages((prev) => [...prev, botMessage])
      }, 700)
    },
    [activeJtbdType, chatMockCase, caseContext],
  )

  useEffect(() => {
    if (!preWrittenMessage?.trim() || !askInChatNonce) return
    if (lastPrefillNonceRef.current === askInChatNonce) return
    lastPrefillNonceRef.current = askInChatNonce
    const text = preWrittenMessage.trim()
    setInput(text)
    onMessageUsed?.()
    requestAnimationFrame(() => {
      inputRef.current?.focus()
      const el = inputRef.current
      if (el) {
        const len = el.value.length
        el.setSelectionRange(len, len)
      }
    })
  }, [askInChatNonce, preWrittenMessage, onMessageUsed])

  const handleSendMessage = () => {
    sendUserText(input)
  }

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendMessage()
    }
  }

  return (
    <div className="flex h-full w-full flex-col">
      <div className="flex items-center gap-3 border-b border-[#ececf2] bg-white px-4 py-4">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f3fc] ring-1 ring-[#e7e7f0]">
          <img
            src="/icons/ai-companion-header.png"
            alt="AI Companion"
            width={40}
            height={40}
            className="h-10 w-10 object-cover"
          />
        </div>
        <div>
          <h3 className="font-euclid text-[14px] font-semibold text-[#2c2067]">AI Companion</h3>
          <p className="font-euclid text-[12px] text-[#6c6c80]">Crisp answers for this case</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto bg-[#fafafa] px-4 py-4">
        {messages.length === 0 ? (
          <div className="flex h-full flex-1 flex-col items-center justify-center text-center">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br from-[#f1edfc] to-[#e7f7ee]">
              <Sparkles className="h-6 w-6 text-[#7c47e1]" aria-hidden />
            </div>
            <p className="max-w-[260px] font-euclid text-[14px] font-medium leading-5 text-[#2c2067]">
              Ask anything about this case — short replies, timelines when useful.
            </p>
            <p className="mt-2 font-euclid text-[12px] text-[#6c6c80]">OMNI AI</p>
          </div>
        ) : (
          <div className="space-y-3">
            {messages.map((message) =>
              message.role === "bot" ? (
                <div key={message.id} className="flex w-full items-start gap-2.5">
                  <div
                    className="flex h-5 w-5 shrink-0 overflow-hidden rounded-full bg-[#f5f3fc] shadow-sm ring-1 ring-[#e7e7f0]"
                    aria-hidden
                  >
                    <img
                      src="/icons/ai-companion-message.png"
                      alt=""
                      width={20}
                      height={20}
                      className="h-5 w-5 object-cover"
                    />
                  </div>
                  <Card className="min-w-0 flex-1 border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]">
                    <CardContent className="space-y-3 p-3 pt-3">
                      {message.insightBlocks && message.insightBlocks.length > 0 ? (
                        <>
                          <p className="font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">{message.text}</p>
                          <div className="space-y-2">
                            {message.insightBlocks.map((block, i) => (
                              <Card
                                key={`${message.id}-insight-${i}`}
                                className="border-[#ececf2] bg-[#fbfbfd] shadow-none"
                              >
                                <CardContent className="space-y-1 p-3 pt-3">
                                  <p className="font-euclid text-[12px] font-semibold leading-4 text-[#36354c]">
                                    {block.title}
                                  </p>
                                  <p className="font-euclid text-[12px] leading-[17px] text-[#5b5675]">{block.body}</p>
                                </CardContent>
                              </Card>
                            ))}
                          </div>
                        </>
                      ) : message.steps && message.steps.length > 0 ? (
                        <>
                          {message.contextLabel ? (
                            <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                              {message.contextLabel}
                            </p>
                          ) : null}
                          <p className="font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">{message.text}</p>
                          <BotStepTimeline
                            steps={message.steps}
                            messageId={message.id}
                            onCrmFlowAction={onCrmFlowAction}
                          />
                        </>
                      ) : (
                        <p className="font-euclid text-[13px] leading-5 text-[#36354c]">{message.text}</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div key={message.id} className="flex w-full justify-end">
                  <div className="flex w-full max-w-[90%] items-start justify-end gap-2.5">
                    <Card className="min-w-0 border-0 bg-gradient-to-br from-[#7c47e1] to-[#5a32c9] text-white shadow-[0px_2px_8px_rgba(92,50,201,0.25)]">
                      <CardContent className="p-3 pt-3">
                        <p className="text-left font-euclid text-[13px] font-medium leading-5 text-white">
                          {message.text}
                        </p>
                      </CardContent>
                    </Card>
                    <div
                      className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-[#e7e7f0] bg-[#7c47e1]"
                      aria-hidden
                    >
                      <User className="h-2.5 w-2.5 text-white" strokeWidth={2.5} />
                    </div>
                  </div>
                </div>
              ),
            )}
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      <div className="border-t border-[#ececf2] bg-white p-4">
        <div className="flex items-center gap-2 rounded-full border border-[#e7e7f0] bg-gradient-to-t from-white to-[#f8f7fc] px-3 py-2 shadow-[0px_4px_12px_rgba(28,11,62,0.08)]">
          <input
            ref={inputRef}
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ask anything"
            className="min-h-0 flex-1 bg-transparent px-1 font-euclid text-[13px] text-[#2c2067] outline-none placeholder:text-[#757575]"
          />
          <Button
            type="button"
            variant="ghost"
            size="icon"
            onClick={handleSendMessage}
            disabled={!input.trim()}
            className="size-9 shrink-0 text-[#7c47e1] hover:bg-[#efe9fb] hover:text-[#44277b] disabled:text-[#c4c2d4]"
            aria-label="Send message"
          >
            <Send className="h-4 w-4" strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  )
}
