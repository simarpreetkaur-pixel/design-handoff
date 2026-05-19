import type { ReactNode } from "react"

import {
  HelloAiBubbleCard,
  HelloCxBubbleCard,
  createHelloChatIdentityStreak,
} from "@/components/crm/hello/HelloChatPrimitives"
import {
  buildClaimStatusPreviousActivityRows,
  type HelloPreviousActivityRow,
} from "@/components/crm/hello/claimStatusPreviousActivityData"

function HelloPreviousActivitySessionDivider({ label }: { label: string }) {
  return (
    <div
      className="flex w-full min-w-0 items-center gap-3 py-1"
      role="separator"
      aria-label={label}
    >
      <div className="h-px min-w-0 flex-1 bg-[#e7e7f0]" aria-hidden />
      <span className="shrink-0 font-euclid text-[11px] font-medium uppercase tracking-wide text-[#8b87a3]">
        {label}
      </span>
      <div className="h-px min-w-0 flex-1 bg-[#e7e7f0]" aria-hidden />
    </div>
  )
}

function renderPreviousActivityRow(
  row: HelloPreviousActivityRow,
  streak: ReturnType<typeof createHelloChatIdentityStreak>,
): ReactNode {
  if (row.kind === "session_divider") {
    return <HelloPreviousActivitySessionDivider key={row.id} label={row.label} />
  }
  if (row.kind === "ai") {
    return (
      <HelloAiBubbleCard key={row.id} showIdentity={streak.nextAiBubbleShowIdentity()}>
        <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">{row.text}</p>
      </HelloAiBubbleCard>
    )
  }
  return (
    <div key={row.id} className="flex w-full min-w-0 justify-end">
      <HelloCxBubbleCard
        showIdentity={streak.nextCxBubbleShowIdentity()}
        identityLabel={row.identityLabel}
      >
        <p className="text-left font-euclid text-[14px] font-medium leading-5 text-white">{row.text}</p>
      </HelloCxBubbleCard>
    </div>
  )
}

export function HelloClaimStatusPreviousActivity({ vehicleLabel }: { vehicleLabel: string }) {
  const rows = buildClaimStatusPreviousActivityRows(vehicleLabel)
  const streak = createHelloChatIdentityStreak()

  return (
    <div className="flex w-full min-w-0 flex-col gap-3 sm:gap-4">
      {rows.map((row) => renderPreviousActivityRow(row, streak))}
      <HelloPreviousActivitySessionDivider label="Current call" />
    </div>
  )
}
