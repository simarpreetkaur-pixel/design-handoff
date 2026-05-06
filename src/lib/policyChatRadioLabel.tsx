import type { ReactNode } from "react"

import type { Policy } from "@/types/crm"

import { shortenVehicleLine } from "@/lib/endorsementChatWizard"

/** Plain multiline echo for the user bubble when the radio label is JSX. */
export function formatPolicyChatRadioEcho(policy: Policy): string {
  const hasVehicle = Boolean(policy.vehicle?.trim())
  const mid = hasVehicle ? shortenVehicleLine(policy.vehicle!) : policy.type
  return `${policy.name} — ${mid}\nPolicy number: ${policy.policyNumber}`
}

/** Stacked policy row for chat wizards (motor + health). */
export function PolicyChatRadioContent({ policy }: { policy: Policy }): ReactNode {
  const hasVehicle = Boolean(policy.vehicle?.trim())
  const line2 = hasVehicle ? shortenVehicleLine(policy.vehicle!) : policy.type
  return (
    <span className="flex min-w-0 flex-col gap-1.5">
      <span className="font-euclid text-[13px] font-semibold leading-snug text-[#2c2067]">{policy.name}</span>
      <span className="font-euclid text-[12px] font-medium leading-snug text-[#5b5675]">{line2}</span>
      <span className="font-euclid text-[11px] leading-snug tabular-nums text-[#6c6c80]">
        <span className="font-normal text-[#8c8aa4]">Policy no.</span> {policy.policyNumber}
      </span>
    </span>
  )
}
