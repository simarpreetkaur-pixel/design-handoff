import type { ChangeEvent, KeyboardEvent, MouseEvent, ReactNode } from "react"
import { CalendarDays, Check, Send, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { helloAiResponderLabel, helloCxResponderName } from "@/components/crm/hello/helloRaiseClaimCopy"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

/** At least 400px when the column allows; never wider than the parent (avoids small-viewport overflow). */
export const helloChatBubbleMinWidthClass = "min-w-[min(100%,400px)]"

/** Claim Status / wide companion bubbles — ~40% wider than {@link helloChatBubbleMinWidthClass}. */
export const helloChatBubbleMinWidthClassWide = "min-w-[min(100%,560px)]"

/** Narrow rail for radio-style offer picks — hugs options width up to CX-aligned cap. */
export const helloWorkflowOfferPickShellClass = cn(
  "w-fit max-w-[min(100%,26rem)]",
  helloChatBubbleMinWidthClass,
)

/** Max width for assistant / renewal prose while bubbles stay content-sized. */
export const helloAiBubbleReadableMaxClass = "max-w-[min(100%,42rem)]"

/** Matches {@link helloChatBubbleMinWidthClassWide} scale (42rem × 1.4). */
export const helloAiBubbleReadableMaxClassWide = "max-w-[min(100%,58.8rem)]"

/** Default Hello split: chat ~46% / workflow pane ~54%. Drag workflow left edge to resize (Raise Claim pattern). */
export const HELLO_SPLIT_LEFT_DEFAULT_PCT = 46
export const HELLO_SPLIT_LEFT_MIN_PCT = 19
export const HELLO_SPLIT_LEFT_MAX_PCT = 74

/** Delay before hiding split grip after leaving companion — allows cursor to reach grip across the gap. */
export const HELLO_SPLIT_GRIP_HOVER_BRIDGE_MS = 220

/** Rounded shell for the right workflow pane — chat stays flush on page `#fafafa`. */
export const helloWorkflowPaneShellClass =
  "overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_2px_rgba(54,53,76,0.04)] motion-safe:transition-all motion-safe:duration-300 motion-safe:ease-out"

/** Desktop: animate column widths when the split opens (grid-template-columns). */
export const helloSplitShellTransitionClass =
  "motion-safe:lg:transition-all motion-safe:lg:duration-700 motion-safe:lg:ease-in-out"

export type HelloWorkflowSplitHandleProps = {
  onMouseDown: (e: MouseEvent<HTMLDivElement>) => void
  onMouseEnter: () => void
  onMouseLeave: () => void
  visible: boolean
}

/** Compact left-edge resize grip (document-level move/up handled by parent). */
export function HelloWorkflowSplitHandle({
  onMouseDown,
  onMouseEnter,
  onMouseLeave,
  visible,
}: HelloWorkflowSplitHandleProps) {
  if (!visible) return null

  return (
    <div
      role="separator"
      aria-orientation="vertical"
      aria-label="Resize AI companion and side panel"
      className="pointer-events-auto absolute top-1/2 left-0 z-30 hidden h-11 w-2 -translate-y-1/2 cursor-col-resize select-none bg-transparent hover:bg-[#7c47e1]/[0.06] active:bg-[#7c47e1]/10 lg:block"
      onMouseDown={onMouseDown}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    />
  )
}

/**
 * Tracks the last Hello chat “speaker” so {@link HelloAiBubbleCard} / {@link HelloCxBubbleCard} can hide the
 * identity row when several consecutive bubbles are from the same side. Re-create each render (do not store in state).
 */
export function createHelloChatIdentityStreak() {
  let prev: "assistant" | "user" | null = null
  return {
    nextAiBubbleShowIdentity(): boolean {
      const show = prev !== "assistant"
      prev = "assistant"
      return show
    },
    nextCxBubbleShowIdentity(): boolean {
      const show = prev !== "user"
      prev = "user"
      return show
    },
    /** After {@link HelloRenewalReminderCard} — same surface as AI bubbles for streak purposes. */
    markAssistantBubbleSurface() {
      prev = "assistant"
    },
    /** After rendering an AI typing shell; keeps the next AI bubble on the same streak. */
    afterAiTypingShell() {
      prev = "assistant"
    },
    typingIndicatorShowIdentity(): boolean {
      return prev !== "assistant"
    },
  }
}

/** AI assistant row — avatar sits outside the bubble (see Figma assistant chat). */
export function HelloAiBubbleCard({
  children,
  showIdentity = true,
  /** Span the companion column (e.g. policy summary card). */
  fullWidth = false,
  /** Wider min/max bubble column (e.g. Claim Status timeline). */
  bubbleWidth = "default",
}: {
  children: ReactNode
  /** When `false`, consecutive AI bubbles read as one thread (no repeated label or avatar). */
  showIdentity?: boolean
  fullWidth?: boolean
  bubbleWidth?: "default" | "wide"
}) {
  const readableMax =
    bubbleWidth === "wide" ? helloAiBubbleReadableMaxClassWide : helloAiBubbleReadableMaxClass
  const bubbleMin =
    bubbleWidth === "wide" ? helloChatBubbleMinWidthClassWide : helloChatBubbleMinWidthClass

  return (
    <div
      className={cn(
        "flex max-w-full min-w-0 items-start gap-3 align-top",
        fullWidth ? "w-full" : cn("inline-flex", readableMax),
      )}
    >
      <div className="flex w-5 shrink-0 justify-center pt-0.5" aria-hidden>
        {showIdentity ? (
          <div className="size-5 shrink-0 overflow-hidden rounded bg-[#f5f3fc] ring-1 ring-[#e7e7f0]">
            <img
              src="/icons/ai-companion-header.png"
              alt=""
              width={20}
              height={20}
              className="h-full w-full object-cover"
            />
          </div>
        ) : (
          <div className="size-5 shrink-0" />
        )}
      </div>
      <Card
        className={cn(
          "min-w-0 border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]",
          fullWidth ? "w-full" : cn("w-fit", bubbleMin),
          showIdentity
            ? "rounded-tl-[2px] rounded-tr-2xl rounded-b-2xl"
            : "rounded-2xl",
        )}
      >
        <CardContent className="p-3">
          {showIdentity ? (
            <div className="flex min-w-0 flex-col gap-2">
              <p className="font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                {helloAiResponderLabel}
              </p>
              <div className="min-w-0 break-words">{children}</div>
            </div>
          ) : (
            <div className="min-w-0 break-words">{children}</div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

/** Shared shell when the CX must relay scripted lines to the customer (claim success, self-serve follow-ups, etc.). */
export const helloTellCustomerCalloutClass =
  "min-w-0 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5"

/** Consistent label for all “tell the customer” callouts in Hello companion bubbles. */
export function HelloTellCustomerLabel() {
  return (
    <p className="font-euclid text-[13px] font-medium leading-5 text-[#5b5675]">Tell the customer:</p>
  )
}

/** FNOL success — compact check with headline; neutral quoted script for the customer line. */
export function HelloClaimRaisedSuccessBody({
  headline,
  quotedLine,
  onViewWorkflow,
}: {
  headline: string
  quotedLine: string
  onViewWorkflow?: () => void
}) {
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <div className="flex min-w-0 items-center gap-2.5">
        <div
          className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] ring-1 ring-[#d1fae5]"
          aria-hidden
        >
          <Check className="size-3.5 text-[#059669]" strokeWidth={2.5} />
        </div>
        <p className="min-w-0 flex-1 font-euclid text-[14px] font-normal leading-5 text-omni-n500">
          {headline}
        </p>
      </div>
      <div className={helloTellCustomerCalloutClass}>
        <HelloTellCustomerLabel />
        <p className="mt-1.5 font-euclid text-[14px] font-medium leading-6 text-[#36354c]">
          <span className="text-[#8b87a3]">&ldquo;</span>
          {quotedLine}
          <span className="text-[#8b87a3]">&rdquo;</span>
        </p>
      </div>
      {onViewWorkflow && (
        <div className="flex justify-start mt-2">
          <button
            onClick={onViewWorkflow}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-[#7c47e1] bg-[#f8f7fc] hover:bg-[#f0f0f6] rounded-lg transition-colors"
          >
            <svg
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            View
          </button>
        </div>
      )}
    </div>
  )
}

/**
 * Full-width warm nudge for cross-context prompts (e.g. renewal) — spans the companion column;
 * visually distinct from {@link HelloAiBubbleCard}.
 */
export function HelloRenewalReminderCard({
  vehicleLabel,
  daysLeft,
}: {
  vehicleLabel: string
  daysLeft: number
}) {
  return (
    <Card
      className={cn(
        "w-full min-w-0 max-w-full overflow-hidden rounded-xl border border-[#ebe3d6]",
        "bg-gradient-to-br from-[#fffbf6] via-[#fff9f2] to-[#fff4e8]",
        "shadow-[0px_1px_3px_rgba(120,72,24,0.07)]",
      )}
    >
      <CardContent className="px-4 py-4 sm:px-5 sm:py-[18px]">
        <div className="grid w-full max-w-[min(100%,42rem)] grid-cols-[auto_1fr] gap-x-4 gap-y-2 sm:gap-x-5">
          <div
            className="row-span-2 flex w-11 shrink-0 items-center justify-center justify-self-start rounded-xl bg-[#fff0dc] ring-1 ring-[#f0dcc4]/90 sm:w-12"
            aria-hidden
          >
            <CalendarDays className="size-[18px] text-[#c2410c] sm:size-5" strokeWidth={2} />
          </div>
          <span className="inline-flex w-fit items-center rounded-md bg-[#fff0dc]/95 px-2 py-0.5 font-euclid text-[10px] font-semibold uppercase tracking-[0.07em] text-[#9a3412] ring-1 ring-[#f0dcc4]/70">
            Renewal reminder
          </span>
          <p className="min-w-0 font-euclid text-[14px] font-normal leading-[1.45] text-[#431407]/92">
            The customer&apos;s{" "}
            <span className="font-semibold text-[#7c2d12]">{vehicleLabel}</span> policy expires in{" "}
            <span className="font-semibold text-[#7c2d12]">{daysLeft} days</span>. Before you end the
            call, remind them to renew so coverage stays continuous.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

/** CX advisor row — avatar outside the bubble (mirrors assistant layout). */
export function HelloCxBubbleCard({
  children,
  showIdentity = true,
  identityLabel,
}: {
  children: ReactNode
  showIdentity?: boolean
  /** Overrides {@link helloCxResponderName} for historical / alternate CX rows. */
  identityLabel?: string
}) {
  const cxLabel = identityLabel?.trim() || helloCxResponderName
  return (
    <div className="flex w-full min-w-0 max-w-full justify-end">
      <div
        className={cn(
          "inline-flex max-w-full min-w-0 flex-row-reverse items-start gap-3 align-top",
          "max-w-[min(100%,26rem)]",
        )}
      >
        <div className="flex w-5 shrink-0 justify-center pt-0.5" aria-hidden>
          {showIdentity ? (
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center overflow-hidden rounded",
                "bg-gradient-to-br from-[#7c47e1] to-[#5a32c9]",
                "shadow-[0px_2px_8px_rgba(92,50,201,0.25)] ring-1 ring-white/20",
              )}
            >
              <User className="size-3 text-white" strokeWidth={2} aria-hidden />
            </div>
          ) : (
            <div className="size-5 shrink-0" />
          )}
        </div>
        <Card
          className={cn(
            "min-w-0 w-fit border-0 bg-gradient-to-br from-[#7c47e1] to-[#5a32c9] text-white shadow-[0px_2px_8px_rgba(92,50,201,0.25)]",
            helloChatBubbleMinWidthClass,
            showIdentity
              ? "rounded-tr-[2px] rounded-tl-2xl rounded-b-2xl"
              : "rounded-2xl",
          )}
        >
          <CardContent className="p-3">
            {showIdentity ? (
              <div className="flex min-w-0 flex-col gap-2">
                <p className="font-euclid text-[12px] font-normal leading-[18px] text-white/80">
                  {cxLabel}
                </p>
                <div className="min-w-0">{children}</div>
              </div>
            ) : (
              <div className="min-w-0">{children}</div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

/** Served from `/public` — mesh gradient behind Hello main content (padded grid). */
export const helloChatColumnBackgroundSrc = "/hello-chat-background.png"

/**
 * Decorative full-bleed background for the Hello main content region (padded grid below the profile bar).
 * Parent must be `position: relative` with a defined height; grid/flex children should use `relative z-10`.
 */
export function HelloChatColumnBackground() {
  return (
    <div
      className="pointer-events-none absolute inset-0 z-0 min-h-0 overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[#fafafa]" />
      <img
        src={helloChatColumnBackgroundSrc}
        alt=""
        className="absolute inset-0 h-full w-full min-h-full min-w-full object-cover object-center"
        decoding="async"
        fetchPriority="low"
      />
    </div>
  )
}

/** Floating Hello chat composer — matches Raise Claim / Edit Policy Hello shell. */
export function HelloChatComposerBar({
  id,
  value,
  onChange,
  onSend,
  placeholder = "Type a message…",
}: {
  id: string
  value: string
  onChange: (next: string) => void
  onSend: () => void
  placeholder?: string
}) {
  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key !== "Enter" || e.shiftKey) return
    e.preventDefault()
    onSend()
  }

  return (
    <div className="relative z-20 shrink-0 px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      <div className="mx-auto flex w-full max-w-2xl min-w-0 justify-center">
        <div
          className={cn(
            "flex w-full min-w-0 items-end gap-2 rounded-3xl border border-[#e7e7f0] bg-white py-2 pl-4 pr-2 sm:pl-5 sm:pr-1.5",
            "shadow-[0px_12px_40px_rgba(54,53,76,0.14),0px_4px_12px_rgba(54,53,76,0.06)]",
            "ring-1 ring-[#36354c]/[0.05]",
          )}
        >
          <label htmlFor={id} className="sr-only">
            Message as CX — {helloCxResponderName}
          </label>
          <textarea
            id={id}
            rows={1}
            value={value}
            onChange={(e: ChangeEvent<HTMLTextAreaElement>) => onChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className={cn(
              "max-h-32 min-h-[44px] flex-1 resize-y rounded-2xl bg-[#fafafa]/80 py-2.5 pl-1 font-euclid text-[14px] leading-5 text-[#36354c]",
              "outline-none ring-0 placeholder:text-[#8b87a3]",
              "focus-visible:placeholder:text-[#a39eb8]",
            )}
          />
          <Button
            type="button"
            size="icon"
            onClick={onSend}
            disabled={!value.trim()}
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
}

export function TypingIndicator({
  labelId,
  showIdentity = true,
}: {
  labelId: string
  showIdentity?: boolean
}) {
  return (
    <div className="w-fit max-w-full" role="status" aria-live="polite" aria-labelledby={labelId}>
      <HelloAiBubbleCard showIdentity={showIdentity}>
        <span id={labelId} className="sr-only">
          AI is typing
        </span>
        <div className="flex min-h-[22px] items-center">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s]" />
            <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s] [animation-delay:150ms]" />
            <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s] [animation-delay:300ms]" />
          </span>
        </div>
      </HelloAiBubbleCard>
    </div>
  )
}

/** Brief shimmer over the right workflow pane while the grid splits — masks first paint for a smoother reveal. */
export function WorkflowPaneShimmerOverlay({
  exiting,
  fadeMs,
}: {
  exiting: boolean
  fadeMs: number
}) {
  return (
    <div
      className={cn(
        "pointer-events-none",
        "absolute inset-0 z-[5] overflow-hidden rounded-xl bg-[#f9f8fc]",
        "transition-opacity motion-safe:ease-in-out",
        exiting ? "opacity-0" : "opacity-100",
      )}
      style={{ transitionDuration: `${fadeMs}ms` }}
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-[#f5f3fc]/95 via-[#fafafa] to-[#f7f7fb]" />
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="absolute -top-[40%] bottom-[-40%] w-[52%] bg-gradient-to-r from-transparent via-white/85 to-transparent opacity-90 motion-safe:animate-workflow-pane-shimmer"
          style={{ left: "-30%", filter: "blur(0.5px)" }}
        />
      </div>
      <div className="relative mx-auto flex max-w-[520px] flex-col gap-4 px-5 pb-5 pt-6">
        <div className="h-5 w-[68%] rounded-md bg-gradient-to-r from-[#e4dff5]/70 via-[#ebe8f4]/90 to-[#e4dff5]/70" />
        <div className="h-[132px] rounded-xl border border-[#e7e7f0]/90 bg-white/40 shadow-[inset_0_1px_0_rgba(255,255,255,0.65)]" />
        <div className="space-y-2.5 rounded-xl border border-[#e7e7f0]/70 bg-white/35 p-4">
          <div className="h-3 w-[88%] rounded bg-[#e8e6f0]/85" />
          <div className="h-3 w-[72%] rounded bg-[#ebe9f2]/90" />
          <div className="h-3 w-[56%] rounded bg-[#ebe9f2]/75" />
        </div>
        <div className="h-11 w-full rounded-lg bg-[#eceaf4]/80" />
      </div>
    </div>
  )
}

/** Placeholder while policy detail loads — mirrors {@link PolicyDetailPanel} shell density. */
export function HelloPolicyDetailPanelSkeleton({ embedded = false }: { embedded?: boolean }) {
  const bar = "rounded-md bg-[#ecebf3] motion-safe:animate-pulse"
  return (
    <div
      className={cn(
        "flex w-full flex-col gap-6 font-euclid",
        !embedded && "rounded-[12px] border border-[#e7e7f0] bg-white px-5 py-6",
      )}
      aria-busy="true"
      aria-live="polite"
      aria-label="Loading policy details"
    >
      <div className={cn(bar, "h-5 w-[42%] max-w-[200px]")} />
      <div className="flex flex-col gap-4 rounded-2xl border border-[#e7e7f0] p-4 sm:p-5">
        <div className="grid gap-5 sm:grid-cols-3">
          {[0, 1, 2].map((i) => (
            <div key={i} className="flex min-w-0 flex-col gap-2">
              <div className={cn(bar, "h-4 w-24")} />
              <div className={cn(bar, "h-5 w-full max-w-[180px]")} />
            </div>
          ))}
        </div>
        <div className={cn(bar, "h-5 w-full max-w-[min(100%,320px)]")} />
      </div>
      <div className="flex flex-col gap-3">
        <div className={cn(bar, "h-5 w-44")} />
        <div className="flex flex-wrap gap-4 rounded-xl border border-[#e7e7f0] p-4">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className={cn(bar, "h-5 w-28")} />
          ))}
        </div>
      </div>
    </div>
  )
}
