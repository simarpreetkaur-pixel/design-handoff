import { type KeyboardEvent, type ReactNode, useEffect, useId, useRef, useState } from "react"
import { Send } from "lucide-react"

import { cn } from "@/lib/utils"
import type { Customer } from "@/types/crm"
import { CustomerProfileCard } from "@/components/crm/CustomerProfileCard"
import { Button } from "@/components/ui/button"
import {
  HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS,
  HELLO_RAISE_CLAIM_MS_PER_CHAR,
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

export type RaiseClaimHelloViewProps = {
  customer: Customer
  /** Shown for screen-reader context only (profile uses structured phone). */
  displayPhone?: string
  className?: string
}

function TypingIndicator({ labelId }: { labelId: string }) {
  return (
    <div
      className="flex w-full items-start gap-3"
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
      <div className="flex min-h-[44px] min-w-0 flex-1 items-center rounded-bl-[16px] rounded-br-[16px] rounded-tl-[2px] rounded-tr-[16px] border border-[#e7e7f0] bg-white px-3 py-2.5">
        <span id={labelId} className="sr-only">
          AI is typing
        </span>
        <span className="flex gap-1.5" aria-hidden>
          <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s]" />
          <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s] [animation-delay:150ms]" />
          <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s] [animation-delay:300ms]" />
        </span>
      </div>
    </div>
  )
}

/** Figma Assistant Chat bubble shell — border only, no heavy elevation (8515:12644). */
function AssistantBubbleShell({
  className,
  children,
}: {
  className?: string
  children: ReactNode
}) {
  return (
    <div
      className={cn(
        "min-w-0 flex-1 overflow-hidden rounded-bl-[16px] rounded-br-[16px] rounded-tl-[2px] rounded-tr-[16px] border border-[#e7e7f0] bg-white p-3",
        className,
      )}
    >
      {children}
    </div>
  )
}

export function RaiseClaimHelloView({ customer, displayPhone, className }: RaiseClaimHelloViewProps) {
  const typingLabelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLTextAreaElement>(null)

  const [openingVisibleLength, setOpeningVisibleLength] = useState(0)
  const [phase, setPhase] = useState<"typing" | "streaming" | "ready">("typing")
  const [choicesVisible, setChoicesVisible] = useState(false)
  const [messages, setMessages] = useState<HelloChatMessage[]>([])
  const [composerEnabled, setComposerEnabled] = useState(false)
  const [composerText, setComposerText] = useState("")
  const [selectedChoice, setSelectedChoice] = useState<HelloRaiseClaimChoiceId | null>(null)

  const openingFull = helloRaiseClaimOpeningMessage
  const openingShown = openingFull.slice(0, openingVisibleLength)

  useEffect(() => {
    const timeouts: number[] = []
    let cancelled = false
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(window.setTimeout(fn, ms))
    }

    schedule(() => {
      if (cancelled) return
      setPhase("streaming")
      let i = 0
      const streamNext = () => {
        if (cancelled) return
        i += 1
        setOpeningVisibleLength(i)
        if (i < openingFull.length) {
          schedule(streamNext, HELLO_RAISE_CLAIM_MS_PER_CHAR)
        } else {
          schedule(() => {
            if (cancelled) return
            setPhase("ready")
            schedule(() => {
              if (!cancelled) setChoicesVisible(true)
            }, HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS)
          }, 0)
        }
      }
      streamNext()
    }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)

    return () => {
      cancelled = true
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [openingFull.length])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    el.scrollTop = el.scrollHeight
  }, [openingShown, phase, messages, choicesVisible])

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

  const showOpeningRow = phase !== "typing" || openingVisibleLength > 0

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
            className="min-h-0 flex-1 space-y-3 overflow-y-auto overflow-x-hidden px-6 py-6 [scrollbar-gutter:stable]"
            aria-live="polite"
            aria-relevant="additions text"
          >
            {displayPhone ? (
              <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
            ) : null}

            {phase === "typing" && openingVisibleLength === 0 ? (
              <TypingIndicator labelId={typingLabelId} />
            ) : null}

            {showOpeningRow ? (
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
                <AssistantBubbleShell>
                  <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
                    {openingShown}
                    {phase === "streaming" && openingVisibleLength < openingFull.length ? (
                      <span className="ml-0.5 inline-block h-4 w-px animate-pulse bg-[#7c47e1]" aria-hidden />
                    ) : null}
                  </p>
                </AssistantBubbleShell>
              </div>
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
                  <AssistantBubbleShell>
                    <p className="font-euclid text-[14px] font-normal leading-5 text-[#36354c]">
                      {message.text}
                    </p>
                  </AssistantBubbleShell>
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

            {choicesVisible ? (
              <div
                className="flex w-full flex-col gap-3 pt-1 opacity-100 transition-opacity duration-300"
                role="group"
                aria-label="How should the customer proceed?"
                aria-expanded={choicesVisible}
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
                  <AssistantBubbleShell className="flex flex-col gap-3">
                    {helloRaiseClaimChoices.map((c) => {
                      const selected = selectedChoice === c.id
                      return (
                        <button
                          key={c.id}
                          type="button"
                          onClick={() => handleChoice(c.id)}
                          disabled={selectedChoice !== null}
                          className={cn(
                            "flex w-full items-start gap-2 rounded-lg bg-[#f8f7fc] p-2 text-left transition-colors",
                            "border border-transparent hover:border-[#e7e7f0]",
                            selected && "border-[#e7e7f0] ring-1 ring-[#d8d6ea]",
                          )}
                        >
                          <span
                            className={cn(
                              "mt-0.5 inline-flex size-5 shrink-0 rounded-full border border-[#d8d6ea] bg-white",
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
                  </AssistantBubbleShell>
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
