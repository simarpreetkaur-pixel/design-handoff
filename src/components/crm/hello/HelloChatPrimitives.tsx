import type { ReactNode } from "react"
import { CalendarDays, Check, User } from "lucide-react"

import { cn } from "@/lib/utils"
import { helloAiResponderLabel, helloCxResponderName } from "@/components/crm/hello/helloRaiseClaimCopy"
import { Card, CardContent } from "@/components/ui/card"

/** AI assistant bubble — identity is {@link helloAiResponderLabel} only. */
export function HelloAiBubbleCard({ children }: { children: ReactNode }) {
  return (
    <Card className="min-w-0 w-full max-w-[min(90%,26rem)] rounded-2xl border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div
            className="h-6 w-6 shrink-0 overflow-hidden rounded-md bg-[#f5f3fc] ring-1 ring-[#e7e7f0]"
            aria-hidden
          >
            <img
              src="/icons/ai-companion-header.png"
              alt=""
              width={24}
              height={24}
              className="h-full w-full object-cover"
            />
          </div>
          <div className="min-w-0">
            <p className="font-euclid text-[12px] font-normal leading-[18px] text-[#8b87a3]">
              {helloAiResponderLabel}
            </p>
          </div>
        </div>
        <div className="mt-3">{children}</div>
      </CardContent>
    </Card>
  )
}

/** FNOL success — compact check with headline; neutral quoted script for the customer line. */
export function HelloClaimRaisedSuccessBody({
  headline,
  quotedLine,
}: {
  headline: string
  quotedLine: string
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
      <div className="min-w-0 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5">
        <p className="font-euclid text-[13px] font-medium leading-5 text-[#5b5675]">Tell the customer:</p>
        <p className="mt-1.5 font-euclid text-[14px] font-medium leading-6 text-[#36354c]">
          <span className="text-[#8b87a3]">&ldquo;</span>
          {quotedLine}
          <span className="text-[#8b87a3]">&rdquo;</span>
        </p>
      </div>
    </div>
  )
}

/**
 * Softer, warm-tinted card for cross-context prompts (e.g. renewal) — visually distinct from
 * {@link HelloAiBubbleCard} while staying in the agent companion column.
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
        "min-w-0 w-full rounded-2xl border-[#ebe3d6] bg-gradient-to-b from-[#fffbf6] to-[#fff4e8]",
        "shadow-[0px_1px_3px_rgba(120,72,24,0.07)]",
      )}
    >
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#fff0dc] ring-1 ring-[#f0dcc4]"
            aria-hidden
          >
            <CalendarDays className="size-4 text-[#b45309]" strokeWidth={2} />
          </div>
          <div className="min-w-0 flex-1">
            <p className="font-euclid text-[11px] font-semibold uppercase tracking-[0.06em] text-[#9a3412]/85">
              Renewal reminder
            </p>
            <p className="mt-2 font-euclid text-[14px] font-normal leading-6 text-[#431407]/90">
              The customer&apos;s{" "}
              <span className="font-semibold text-[#7c2d12]">{vehicleLabel}</span> policy expires in{" "}
              <span className="font-semibold text-[#7c2d12]">{daysLeft} days</span>. Before you end the
              call, remind them to renew so coverage stays continuous.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}

/** CX (human) advisor bubble — identity is {@link helloCxResponderName}. */
export function HelloCxBubbleCard({ children }: { children: ReactNode }) {
  return (
    <Card className="min-w-0 w-full rounded-2xl border-0 bg-gradient-to-br from-[#7c47e1] to-[#5a32c9] text-white shadow-[0px_2px_8px_rgba(92,50,201,0.25)]">
      <CardContent className="p-4">
        <div className="flex items-center gap-2">
          <div
            className="flex h-6 w-6 shrink-0 items-center justify-center rounded-md bg-white/15 ring-1 ring-white/20"
            aria-hidden
          >
            <User className="size-3 text-white/90" strokeWidth={2} />
          </div>
          <div className="min-w-0">
            <p className="font-euclid text-[12px] font-normal leading-[18px] text-white/80">{helloCxResponderName}</p>
          </div>
        </div>
        <div className="mt-3">{children}</div>
      </CardContent>
    </Card>
  )
}

export function TypingIndicator({ labelId }: { labelId: string }) {
  return (
    <div className="w-full" role="status" aria-live="polite" aria-labelledby={labelId}>
      <HelloAiBubbleCard>
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
        exiting ? "pointer-events-none" : "pointer-events-auto",
        "absolute inset-0 z-[5] overflow-hidden rounded-xl bg-[#f9f8fc]",
        "transition-opacity motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
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
