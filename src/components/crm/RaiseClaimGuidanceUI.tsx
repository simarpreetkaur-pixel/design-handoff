import { Headphones } from "lucide-react"
import type { CSSProperties } from "react"

import { Button } from "@/components/ui/button"
import {
  RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE,
  RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE,
  raiseClaimStepsAsBody,
  raiseClaimTalktrackParts,
} from "@/lib/raiseClaimGuidanceCopy"
import { cn } from "@/lib/utils"

/** Gradient “stroke” shell for raise-claim talktrack callouts (matches JTBD AI-summary styling). */
export const AI_GUIDE_CARD_GRADIENT_FRAME_STYLE: CSSProperties = {
  padding: "2px",
  background:
    "linear-gradient(90deg, rgba(9, 48, 101, 0.6) 0%, rgba(19, 105, 235, 0.6) 27.5%, rgba(250, 197, 21, 0.6) 60%, rgba(134, 203, 60, 0.6) 100%)",
}

/** Same gradient stroke + inner shell as ongoing JTBD AI summary cards. */
export function RaiseClaimTalktrackCallout({ className }: { className?: string }) {
  const { lead, rc, mid, license, trail } = raiseClaimTalktrackParts
  return (
    <div className={cn("relative w-full rounded-[8px]", className)} style={AI_GUIDE_CARD_GRADIENT_FRAME_STYLE}>
      <div className="overflow-hidden rounded-[6px] bg-white shadow-[0px_2px_5px_rgba(0,0,0,0.06)]">
        <div className="flex w-full items-start gap-2 px-5 py-3.5">
          <Headphones className="mt-0.5 size-5 shrink-0 text-[#5b5675]" strokeWidth={1.75} aria-hidden />
          <p className="shrink-0 font-euclid text-[14px] font-normal leading-[20px] text-[#5b5675]">Tip</p>
          <p className="min-w-0 flex-1 font-euclid text-[14px] font-normal leading-[20px] text-[#36354c]">
            {lead}
            <span className="font-medium">{rc}</span>
            {mid}
            <span className="font-medium">{license}</span>
            {trail}
          </p>
        </div>
      </div>
    </div>
  )
}

/** Chat-only: talktrack + steps card (+ optional “Go to raise a claim”). */
export function RaiseClaimChatGuidanceSection({
  showGoCta,
  onGoCta,
}: {
  showGoCta: boolean
  onGoCta?: () => void
}) {
  return (
    <div className="space-y-3">
      <RaiseClaimTalktrackCallout />
      <div className="rounded-xl border border-[#ececf2] bg-[#fbfbfd] px-4 py-3 shadow-[0px_1px_3px_rgba(54,53,76,0.06)]">
        <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#5b5675]">
          Steps to raise claim
        </p>
        <p className="mt-2 whitespace-pre-line font-euclid text-[13px] leading-5 text-[#36354c]">
          {raiseClaimStepsAsBody()}
        </p>
        <div className="mt-3 space-y-2 border-t border-[#e7e7f0] pt-3">
          <p className="font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
            {RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE}
          </p>
          <p className="font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
            {RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE}
          </p>
        </div>
      </div>
      {showGoCta ? (
        <Button
          type="button"
          className="h-9 w-full bg-[#7c47e1] font-euclid text-[13px] font-medium text-white hover:bg-[#7c47e1]/90 sm:w-auto"
          onClick={onGoCta}
        >
          Go to raise a claim
        </Button>
      ) : null}
    </div>
  )
}
