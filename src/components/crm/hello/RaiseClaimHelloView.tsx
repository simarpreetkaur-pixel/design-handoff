import { type KeyboardEvent, useEffect, useId, useRef, useState } from "react"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Customer } from "@/types/crm"
import { CustomerProfileCard } from "@/components/crm/CustomerProfileCard"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  HELLO_RAISE_CLAIM_GAP_AFTER_MESSAGE_MS,
  HELLO_RAISE_CLAIM_GAP_BEFORE_TYPING_MS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  helloRaiseClaimChoices,
  helloRaiseClaimOpeningScript,
  helloRaiseClaimSomethingElseAck,
  helloRaiseClaimStubFollowUp,
  type HelloRaiseClaimChoiceId,
} from "@/components/crm/hello/helloRaiseClaimCopy"

export type HelloChatMessage = {
  id: string
  role: "assistant" | "user"
  text: string
}

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
      <div className="flex min-w-0 flex-1 items-center gap-1 rounded-2xl rounded-tl-sm border border-[#e7e7f0] bg-white px-3 py-2 shadow-[0px_1px_3px_rgba(54,53,76,0.06)]">
        <span id={labelId} className="sr-only">
          AI is typing
        </span>
        <span className="flex gap-1" aria-hidden>
          <span className="inline-block size-1.5 animate-bounce rounded-full bg-[#7c47e1] [animation-delay:-0.2s]" />
          <span className="inline-block size-1.5 animate-bounce rounded-full bg-[#7c47e1] [animation-delay:-0.1s]" />
          <span className="inline-block size-1.5 animate-bounce rounded-full bg-[#7c47e1]" />
        </span>
      </div>
    </div>
  )
}

export function RaiseClaimHelloView({ customer, displayPhone, className }: RaiseClaimHelloViewProps) {
  const typingLabelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  const [messages, setMessages] = useState<HelloChatMessage[]>([])
  const [isTyping, setIsTyping] = useState(false)
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [composerEnabled, setComposerEnabled] = useState(false)
  const [composerText, setComposerText] = useState("")
  const [selectedChoice, setSelectedChoice] = useState<HelloRaiseClaimChoiceId | null>(null)

  useEffect(() => {
    const timeouts: number[] = []
    let stepIndex = 0
    let cancelled = false

    const schedule = (fn: () => void, ms: number) => {
      const id = window.setTimeout(fn, ms)
      timeouts.push(id)
    }

    const drainScript = () => {
      if (cancelled) return
      if (stepIndex >= helloRaiseClaimOpeningScript.length) {
        setChoicesVisible(true)
        return
      }
      setIsTyping(true)
      schedule(() => {
        if (cancelled) return
        setIsTyping(false)
        const text = helloRaiseClaimOpeningScript[stepIndex]
        const id = `hello-assistant-${stepIndex}`
        stepIndex += 1
        setMessages((prev) => [...prev, { id, role: "assistant", text }])
        if (stepIndex >= helloRaiseClaimOpeningScript.length) {
          setChoicesVisible(true)
        } else {
          schedule(
            drainScript,
            HELLO_RAISE_CLAIM_GAP_AFTER_MESSAGE_MS + HELLO_RAISE_CLAIM_GAP_BEFORE_TYPING_MS,
          )
        }
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }

    drainScript()

    return () => {
      cancelled = true
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [messages, isTyping, choicesVisible])

  const pushAssistant = (text: string) => {
    setMessages((prev) => [
      ...prev,
      { id: `hello-assistant-${Date.now()}`, role: "assistant", text },
    ])
  }

  const handleChoice = (choiceId: HelloRaiseClaimChoiceId) => {
    setSelectedChoice(choiceId)
    if (choiceId === "something_else") {
      setComposerEnabled(true)
      pushAssistant(helloRaiseClaimSomethingElseAck)
      window.requestAnimationFrame(() => {
        composerRef.current?.focus()
      })
      return
    }
    pushAssistant(helloRaiseClaimStubFollowUp[choiceId])
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
      className={cn(
        "relative flex min-h-[calc(100vh-72px)] w-full flex-col bg-[#fafafa]",
        className,
      )}
      aria-label="Raise a claim — Hello view"
    >
      <div className="mx-auto w-full max-w-[1280px] shrink-0 px-8 pb-4 pt-6">
        <CustomerProfileCard customer={customer} />
      </div>

      <div
        className={cn(
          "mx-auto flex min-h-0 w-full max-w-[1280px] flex-1 flex-col px-8 pb-6",
          composerEnabled ? "pb-[max(7rem,env(safe-area-inset-bottom))]" : "pb-24",
        )}
      >
        <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_2px_rgba(54,53,76,0.04)]">
          <div className="flex shrink-0 items-center gap-3 border-b border-[#e7e7f0] bg-white px-6 py-4">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full bg-[#f5f3fc] ring-1 ring-[#e7e7f0]">
              <img
                src="/icons/ai-companion-header.png"
                alt=""
                width={40}
                height={40}
                className="h-10 w-10 object-cover"
              />
            </div>
            <div className="min-w-0 flex-1">
              <h2 className="font-euclid text-[16px] font-medium leading-6 text-[#040222]">
                AI Companion
              </h2>
              <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
                Customer agent’s companion to solve the customer’s query
              </p>
            </div>
          </div>

          <div
            ref={listRef}
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-6 py-6 [scrollbar-gutter:stable]"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {displayPhone ? (
              <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
            ) : null}

            {messages.map((message) =>
              message.role === "assistant" ? (
                <div key={message.id} className="flex w-full items-start gap-3">
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
                  <Card
                    className={cn(
                      "min-w-0 flex-1 border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]",
                      "rounded-br-[16px] rounded-tl-[2px] rounded-tr-[16px] rounded-bl-[16px]",
                    )}
                  >
                    <CardContent className="p-3">
                      <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
                        {message.text}
                      </p>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <div key={message.id} className="flex w-full justify-end pl-8">
                  <div className="max-w-[min(100%,520px)] rounded-2xl rounded-tr-sm bg-[#f0ecfc] px-3 py-2">
                    <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
                      {message.text}
                    </p>
                  </div>
                </div>
              ),
            )}

            {isTyping ? <TypingIndicator labelId={typingLabelId} /> : null}

            {choicesVisible ? (
              <div
                className="flex w-full flex-col gap-3 pt-1"
                role="group"
                aria-label="How should the customer proceed?"
              >
                <div className="flex w-full items-start gap-3">
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
                  <div className="min-w-0 flex-1 space-y-2">
                    {helloRaiseClaimChoices.map((c) => {
                      const selected = selectedChoice === c.id
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleChoice(c.id)}
                          disabled={selectedChoice !== null}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-lg bg-[#f8f7fc] p-2 text-left transition",
                            "border border-transparent hover:border-[#e7e7f0]",
                            selected && "ring-2 ring-[#7c47e1]/40",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 inline-flex size-5 shrink-0 rounded-full border-2 border-[#d8d6ea]",
                              selected && "border-[#7c47e1] bg-[#7c47e1]",
                            )}
                            aria-hidden
                          >
                            {selected ? (
                              <span className="m-auto block size-2 rounded-full bg-white" />
                            ) : null}
                          </span>
                          <span className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
                            {c.label}
                          </span>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      </div>

      {composerEnabled ? (
        <div className="fixed bottom-0 left-0 right-0 z-[58] border-t border-[#e7e7f0] bg-white px-4 py-3 shadow-[0_-4px_16px_rgba(28,11,62,0.06)] [padding-bottom:max(12px,env(safe-area-inset-bottom))]">
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
