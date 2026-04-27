import { useState, useEffect, useMemo } from "react"
import { INCOMING_CALL_FIGMA_URL } from "@/design/figma-incoming-call"
import { useCall } from "@/context/CallContext"
import { mockCustomers } from "@/data/mockCustomers"
import { getIncomingCallModalViewModel } from "@/data/simulateCallScenarios"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * "Opening call context" — visual match and content from Figma:
 * {@link INCOMING_CALL_FIGMA_URL}
 * Node `8278:63809` (Iteration 12) in OMNI — Post-Sales.
 */
const ICONS = {
  phone: "/icons/call-indicator.png",
  timer: "/icons/timer-indicator.png", 
  avatar: "/icons/user-avatar.png",
  translate: "/icons/translate-icon.png",
  award: "/icons/award-icon.png",
  sparkle: "/icons/sparkle-icon.png",
} as const

type IncomingCallModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onAnswerCall?: () => void
  onTimeout?: () => void
}

function CallingDots() {
  return (
    <div
      className="flex shrink-0 items-center text-center text-2xl font-semibold leading-8 tracking-[-0.1px] text-omni-n600"
      aria-hidden
    >
      <span 
        className="inline-block"
        style={{
          animation: 'pulse-dot 1.5s infinite ease-in-out',
          animationDelay: '0s'
        }}
      >
        .
      </span>
      <span 
        className="inline-block"
        style={{
          animation: 'pulse-dot 1.5s infinite ease-in-out',
          animationDelay: '0.2s'
        }}
      >
        .
      </span>
      <span 
        className="inline-block"
        style={{
          animation: 'pulse-dot 1.5s infinite ease-in-out',
          animationDelay: '0.4s'
        }}
      >
        .
      </span>
    </div>
  )
}

function CircularTimer({ seconds, totalSeconds }: { seconds: number; totalSeconds: number }) {
  const progress = seconds / totalSeconds
  const circumference = 2 * Math.PI * 14 // radius = 14
  const strokeDashoffset = circumference * (1 - progress)

  return (
    <div className="flex h-[37px] w-[37px] shrink-0 items-center justify-center">
      <svg 
        width="37" 
        height="37" 
        viewBox="0 0 37 37"
        className="rotate-[-90deg]"
      >
        {/* Background circle */}
        <circle
          cx="18.5"
          cy="18.5"
          r="14"
          fill="transparent"
          stroke="#E7E7F0"
          strokeWidth="3"
        />
        {/* Progress circle */}
        <circle
          cx="18.5"
          cy="18.5"
          r="14"
          fill="transparent"
          stroke="#7c47e1"
          strokeWidth="3"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          style={{
            transition: 'stroke-dashoffset 1s linear'
          }}
        />
      </svg>
    </div>
  )
}

/** Map lastCall sentiment to badge variant */
function getLastCallBadgeVariant(variant: "default" | "angry" | "warning") {
  switch (variant) {
    case "angry":
      return "ackoAngry"
    case "warning":
      return "ackoWarning"
    default:
      return "secondary"
  }
}

export function IncomingCallModal({
  open,
  onOpenChange,
  onAnswerCall,
  onTimeout,
}: IncomingCallModalProps) {
  const { data: callData } = useCall()
  const [secondsLeft, setSecondsLeft] = useState(60)

  const viewModel = useMemo(() => {
    const id = callData.customerId
    const customer = id ? mockCustomers[id]?.customer : undefined
    return getIncomingCallModalViewModel(id, customer)
  }, [callData.customerId])

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null
    
    if (open) {
      setSecondsLeft(60) // Reset timer when modal opens
      
      interval = setInterval(() => {
        setSecondsLeft((prev) => {
          if (prev <= 1) {
            // Time's up - close modal and show toast
            setTimeout(() => {
              onTimeout?.()
            }, 0)
            return 0
          }
          return prev - 1
        })
      }, 1000)
    } else {
      setSecondsLeft(60) // Reset when modal closes
    }

    return () => {
      if (interval) {
        clearInterval(interval)
      }
    }
  }, [open, onTimeout])
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        showCloseButton={false}
        className="!m-0 !max-h-[min(90dvh,56rem)] w-[min(100%-1.5rem,506px)] !max-w-[506px] !translate-x-[-50%] !translate-y-[-50%] !gap-0 !border-0 !bg-transparent !p-0 !shadow-none"
        aria-describedby={undefined}
      >
        <div
          className="flex max-h-[min(90dvh,56rem)] w-full flex-col overflow-y-auto overscroll-contain rounded-[24px] bg-white shadow-modal"
          data-figma-file={INCOMING_CALL_FIGMA_URL}
          data-figma-node-id="8278-63809"
        >
          <header className="flex w-full shrink-0 items-center justify-between border-b border-[#F0F0F6] px-5 py-3">
            <div className="flex min-w-0 items-center gap-2">
              <div className="h-6 w-6 shrink-0">
                <img
                  src={ICONS.phone}
                  alt=""
                  className="h-full w-full object-contain"
                  width={24}
                  height={24}
                />
              </div>
              <DialogTitle className="m-0 whitespace-nowrap p-0 text-left text-[18px] font-semibold leading-6 text-omni-n500">
                Incoming call
              </DialogTitle>
              <CallingDots />
            </div>
            <CircularTimer seconds={secondsLeft} totalSeconds={60} />
          </header>

          <div className="flex w-full shrink-0 flex-col items-center justify-center overflow-hidden bg-omni-profile px-8 py-4">
            <div className="flex flex-col items-center gap-3">
              <Avatar className="h-14 w-14 rounded-[12.44px] bg-white p-0">
                <AvatarImage
                  src={ICONS.avatar}
                  alt=""
                  className="h-full w-full object-contain"
                />
                <AvatarFallback className="rounded-[12.44px] text-xs font-medium">
                  {viewModel.avatarInitials}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col items-center gap-1">
                <p className="w-[min(100%,187px)] text-center text-[28px] font-semibold leading-9 tracking-[-0.1px] text-omni-n500">
                  {viewModel.name}
                </p>
                <div className="flex flex-wrap items-center justify-center gap-x-[18px] gap-y-2 opacity-80">
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 shrink-0">
                      <img
                        src={ICONS.translate}
                        alt=""
                        className="h-full w-full object-contain"
                        width={16}
                        height={16}
                      />
                    </div>
                    <span className="text-sm font-normal leading-5 text-omni-n400">
                      {viewModel.language}
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <div className="h-4 w-4 shrink-0">
                      <img
                        src={ICONS.award}
                        alt=""
                        className="h-full w-full object-contain"
                        width={16}
                        height={16}
                      />
                    </div>
                    <span className="text-sm font-normal leading-5 text-omni-n400">
                      {viewModel.yearsWithAcko}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex w-full max-w-[506px] flex-col items-start gap-1.5 px-4 py-4 sm:px-8">
            <div className="mb-1">
              <h3 className="text-sm font-medium leading-5 text-omni-n500">Call Context</h3>
            </div>

            <Card className="w-full border-omni-n200 shadow-none">
              <CardContent className="space-y-3 p-0 px-5 py-4 sm:px-5">
                <div className="grid w-full grid-cols-1 items-start gap-x-8 text-sm font-medium leading-5 min-[400px]:grid-cols-[132px_1fr] min-[400px]:items-center">
                  <p className="w-full text-omni-n400 opacity-80 sm:w-[132px]">
                    Ongoing issue
                  </p>
                  <p className="min-w-0 text-omni-n600">
                    {viewModel.ongoingIssue}
                  </p>
                </div>
                {viewModel.showCallVehicle && (
                  <div className="grid w-full grid-cols-1 items-start gap-x-8 text-sm font-medium leading-5 min-[400px]:grid-cols-[132px_1fr] min-[400px]:items-center">
                    <p className="w-full text-omni-n400 opacity-80 sm:w-[132px]">
                      Vehicle
                    </p>
                    <p className="min-w-0 text-omni-n600">{viewModel.vehicle}</p>
                  </div>
                )}
                {viewModel.showLastCall && (
                  <div className="grid w-full grid-cols-1 items-start gap-x-8 text-sm font-medium leading-5 min-[400px]:grid-cols-[132px_1fr] min-[400px]:items-center">
                    <p className="w-full text-omni-n400 opacity-80 sm:w-[132px]">
                      Last call
                    </p>
                    <div className="min-w-0">
                      <Badge
                        variant={getLastCallBadgeVariant(viewModel.lastCallVariant)}
                        className="rounded-md px-2 py-0.5 text-sm font-medium"
                      >
                        {viewModel.lastCallBadge}
                      </Badge>
                    </div>
                  </div>
                )}

                {viewModel.showQuickSummary && (
                  <div className="w-full rounded-xl bg-omni-summary p-3">
                    <div className="flex w-full flex-col gap-3">
                      <div className="flex w-full items-center gap-2">
                        <div className="h-4 w-4 shrink-0">
                          <img
                            src={ICONS.sparkle}
                            alt=""
                            className="h-full w-full object-contain"
                            width={16}
                            height={16}
                          />
                        </div>
                        <p className="text-sm font-medium leading-5 text-omni-n500">
                          Quick Summary:
                        </p>
                      </div>
                      <ul className="ml-6 space-y-2">
                        <li className="flex items-start gap-2">
                          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-omni-n400"></div>
                          <p className="text-sm font-normal leading-5 text-omni-n500">
                            {viewModel.summaryLines[0]}
                          </p>
                        </li>
                        <li className="flex items-start gap-2">
                          <div className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-omni-n400"></div>
                          <p className="text-sm font-normal leading-5 text-omni-n500">
                            {viewModel.summaryLines[1]}
                          </p>
                        </li>
                      </ul>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <div className="w-full shrink-0 border-t-0 bg-white px-6 pb-3 pt-1">
            <Button
              type="button"
              className="h-[57px] w-full rounded-2xl bg-[#7c47e1] text-base font-medium text-white shadow-sm hover:bg-[#7c47e1]/90 focus:ring-2 focus:ring-[#7c47e1]/20"
              onClick={() => {
                onAnswerCall?.()
              }}
            >
              Answer Call
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}