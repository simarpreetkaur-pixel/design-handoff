import { type KeyboardEvent, useEffect, useId, useLayoutEffect, useRef, useState } from "react"
import { Send, User } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Customer } from "@/types/crm"
import { CustomerProfileCard } from "@/components/crm/CustomerProfileCard"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  helloRaiseClaimChoices,
  helloRaiseClaimCompanionSubtitle,
  helloRaiseClaimOpeningMessage,
  helloRaiseClaimSomethingElseAck,
  helloRaiseClaimStubFollowUp,
  type HelloRaiseClaimChoiceId,
} from "@/components/crm/hello/helloRaiseClaimCopy"

export type HelloChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
}

/** Visual gap between AI Companion panel and the fixed composer bar (px). */
const HELLO_COMPOSER_GAP_ABOVE_BAR_PX = 16

export type RaiseClaimHelloViewProps = {
  customer: Customer
  /** Shown for screen-reader context only (profile uses structured phone). */
  displayPhone?: string
  className?: string
}

function TypingIndicator({ labelId }: { labelId: string }) {
  return (
    <div
      className="flex w-full items-start gap-2.5"
      role="status"
      aria-live="polite"
      aria-labelledby={labelId}
    >
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
        <CardContent className="flex min-h-[44px] items-center p-3 pt-3">
          <span id={labelId} className="sr-only">
            AI is typing
          </span>
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s]" />
            <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s] [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s] [animation-delay:300ms]" />
          </span>
        </CardContent>
      </Card>
    </div>
  )
}

/**
 * Hello-view–only shell: full-width column + separate transcript model from Classic `AIChatPanel`.
 * Chat bubble chrome matches Classic (Card, WorkflowOfferPick, user gradient bubble) for consistent UX.
 */
export function RaiseClaimHelloView({ customer, displayPhone, className }: RaiseClaimHelloViewProps) {
  const typingLabelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  const composerBarRef = useRef<HTMLDivElement>(null)

  const [composerBottomReservePx, setComposerBottomReservePx] = useState<number | null>(null)

  const [openingTyping, setOpeningTyping] = useState(true)
  const [openingVisible, setOpeningVisible] = useState(false)
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [choicesSpent, setChoicesSpent] = useState(false)
  const [messages, setMessages] = useState<HelloChatMessage[]>([])
  const [composerEnabled, setComposerEnabled] = useState(false)
  const [composerText, setComposerText] = useState("")

  useEffect(() => {
    const timeouts: number[] = []
    let cancelled = false
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(window.setTimeout(fn, ms))
    }

    schedule(() => {
      if (cancelled) return
      setOpeningTyping(false)
      setOpeningVisible(true)
      schedule(() => {
        if (!cancelled) setChoicesVisible(true)
      }, HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS)
    }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)

    return () => {
      cancelled = true
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  useLayoutEffect(() => {
    if (!composerEnabled) {
      setComposerBottomReservePx(null)
      return
    }

    const el = composerBarRef.current
    if (!el) return

    const updateReserve = () => {
      setComposerBottomReservePx(el.offsetHeight + HELLO_COMPOSER_GAP_ABOVE_BAR_PX)
    }

    updateReserve()

    const ro = new ResizeObserver(updateReserve)
    ro.observe(el)
    window.addEventListener("resize", updateReserve)

    const raf = window.requestAnimationFrame(() => updateReserve())

    return () => {
      window.cancelAnimationFrame(raf)
      ro.disconnect()
      window.removeEventListener("resize", updateReserve)
    }
  }, [composerEnabled])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [openingTyping, openingVisible, messages, choicesVisible, choicesSpent, composerBottomReservePx])

  const pushAssistant = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `hello-assistant-${Date.now()}`, role: "assistant", text },
    ])
  }

  const handleOfferPick = (choiceId: HelloRaiseClaimChoiceId, userEchoLabel: string) => {
    if (choicesSpent) return
    setChoicesSpent(true)

    setMessages((prev) => [
      ...prev,
      { id: `hello-user-pick-${Date.now()}`, role: "user", text: userEchoLabel },
    ])

    window.setTimeout(() => {
      if (choiceId === "something_else") {
        setComposerEnabled(true)
        pushAssistant(helloRaiseClaimSomethingElseAck)
        window.requestAnimationFrame(() => {
          composerRef.current?.focus()
        })
        return
      }
      pushAssistant(helloRaiseClaimStubFollowUp[choiceId])
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleSendComposer = () => {
    const trimmed = composerText.trim()
    if (!trimmed) return
    setMessages((prev) => [...prev, { id: `hello-user-${Date.now()}`, role: "user", text: trimmed }])
    setComposerText("")
  }

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      handleSendComposer()
    }
  }

  return (
    <div
      data-omni-ai-surface="hello-raise-claim"
      className={cn(
        "relative flex h-[calc(100vh-72px)] w-full min-h-0 flex-col bg-[#fafafa]",
        className,
      )}
      aria-label="Raise a claim — Hello view"
    >
      <div className="mx-auto w-full max-w-[1280px] shrink-0 px-8 pb-4 pt-6">
        <CustomerProfileCard customer={customer} />
      </div>

      <div
        className={cn(
          "mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col px-8",
          !composerEnabled && "pb-[40px]",
        )}
        style={
          composerEnabled
            ? {
                paddingBottom:
                  composerBottomReservePx ??
                  /* Fallback until measured — bar ≈ py-3 + h-11 row + safe padding + gap */
                  104,
              }
            : undefined
        }
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_2px_rgba(54,53,76,0.04)]">
          <div className="flex shrink-0 items-center gap-4 border-b border-[#e7e7f0] bg-white px-6 py-4">
            <div className="min-w-0 flex-1">
              <h2 className="font-euclid text-[16px] font-medium leading-6 text-[#040222]">
                AI Companion
              </h2>
              <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
                {helloRaiseClaimCompanionSubtitle}
              </p>
            </div>
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f3fc] ring-1 ring-[#e7e7f0]">
              <img
                src="/icons/ai-companion-header.png"
                alt=""
                width={32}
                height={32}
                className="h-8 w-8 object-cover"
              />
            </div>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-4 py-4 [scrollbar-gutter:stable]"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {displayPhone ? (
              <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
            ) : null}

            {openingTyping ? <TypingIndicator labelId={typingLabelId} /> : null}

            {openingVisible ? (
              <div className="flex w-full items-start gap-2.5">
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
                    <p className="font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                      {helloRaiseClaimOpeningMessage}
                    </p>
                    {choicesVisible ? (
                      <WorkflowOfferPick
                        options={helloRaiseClaimChoices.map((c) => ({
                          key: c.id,
                          label: c.label,
                        }))}
                        disabled={choicesSpent}
                        onPick={(key, label) => handleOfferPick(key as HelloRaiseClaimChoiceId, label)}
                      />
                    ) : null}
                  </CardContent>
                </Card>
              </div>
            ) : null}

            {messages.map((message) =>
              message.role === "assistant" ? (
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
                    <CardContent className="p-3 pt-3">
                      <p className="font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                        {message.text}
                      </p>
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
          </div>
        </div>
      </div>

      {composerEnabled ? (
        <div
          ref={composerBarRef}
          className="fixed bottom-0 left-0 right-0 z-[58] border-t border-[#e7e7f0] bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(28,11,62,0.06)] [padding-bottom:max(12px,env(safe-area-inset-bottom))]"
        >
          <div className="mx-auto flex max-w-[1280px] gap-3 px-4">
            <label htmlFor="raise-claim-hello-composer" className="sr-only">
              Describe what the customer may need
            </label>
            <textarea
              ref={composerRef}
              id="raise-claim-hello-composer"
              rows={1}
              value={composerText}
              onChange={(e) => setComposerText(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              placeholder="Type why the customer may be calling…"
              className={cn(
                "max-h-32 min-h-11 flex-1 resize-y rounded-xl border border-[#e7e7f0] bg-[#fafafa] px-3 py-2",
                "font-euclid text-[14px] leading-5 text-[#36354c] placeholder:text-[#8b87a3]",
                "outline-none ring-0 focus-visible:border-[#7c47e1] focus-visible:ring-2 focus-visible:ring-[#7c47e1]/25",
              )}
            />
            <Button
              type="button"
              onClick={handleSendComposer}
              disabled={!composerText.trim()}
              className="h-11 shrink-0 gap-2 bg-[#7c47e1] px-4 font-euclid text-sm font-semibold text-white hover:bg-[#7c47e1]/90"
              aria-label="Send message"
            >
              <Send className="size-4" aria-hidden />
              Send
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
