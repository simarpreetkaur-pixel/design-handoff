import { PhoneOff } from "lucide-react"

import { cn } from "@/lib/utils"

export type CallSessionToastVariant = "timeout" | "dispose"

/** Passed with `navigate("/", { state })` from CRM when the agent ends a call. */
export type OmniHomeLocationState = {
  omniCallToast?: "dispose"
}

interface CallSessionToastProps {
  variant: CallSessionToastVariant
  onDismiss: () => void
}

/**
 * Shared bottom-right toast for call session events (timeout transfer, post–end-call dispose).
 * Placed above the homepage “Simulate Live Call” FAB (`bottom-24`).
 */
export function CallSessionToast({ variant, onDismiss }: CallSessionToastProps) {
  const isTimeout = variant === "timeout"

  return (
    <div
      role="status"
      className="fixed bottom-24 right-6 z-[70] max-w-sm rounded-lg border border-omni-n200 bg-white p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div
          className={cn(
            "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
            isTimeout ? "bg-yellow-100" : "bg-[#efe9fb]",
          )}
        >
          {isTimeout ? (
            <span className="text-lg" aria-hidden>
              ⚠️
            </span>
          ) : (
            <PhoneOff className="h-4 w-4 text-[#5920c5]" aria-hidden />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-omni-n600">
            {isTimeout ? "Call Timeout" : "Call ended"}
          </h4>
          <p className="mt-1 text-sm text-omni-n400">
            {isTimeout
              ? "Call has been transferred to another agent due to inactivity."
              : "The call will be disposed automatically."}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-omni-n400 hover:bg-omni-n100"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}
