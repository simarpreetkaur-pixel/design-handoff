import { Pencil, User, FileText, Check } from "lucide-react"

import type { Customer } from "@/types/crm"
import { canonicalIncomingOngoingIssue } from "@/lib/canonicalOngoingLabels"
import { Badge } from "@/components/ui/badge"

interface CustomerDetailsPanelProps {
  customer: Customer
}

/** Map customer lastCall sentiment to badge variant */
function getLastCallBadgeVariant(sentiment: "neutral" | "angry" | "frustrated" | "calm") {
  switch (sentiment) {
    case "angry":
      return "destructive"
    case "frustrated":
      return "ackoWarning"
    default:
      return "secondary"
  }
}

export function CustomerDetailsPanel({ customer }: CustomerDetailsPanelProps) {
  return (
    <>
      {/* Customer Details Card - exact Figma specs */}
      <section className="flex w-full flex-col items-start border border-[#e7e7f0] bg-white p-[16px] rounded-[12px]">
        {/* Header */}
        <div className="mb-[12px] flex w-full items-center justify-between">
          <div className="flex items-center gap-[8px]">
            <div className="size-[20px] overflow-hidden">
              <User className="h-[20px] w-[20px] text-[#5b5675]" />
            </div>
            <h3 className="font-euclid text-[14px] font-medium leading-[20px] text-[#5b5675]">
              Customer Details
            </h3>
          </div>
          <button
            className="size-[20px] overflow-hidden"
            title="Edit customer details"
          >
            <Pencil className="h-[20px] w-[20px] text-[#5b5675]" />
          </button>
        </div>

        {/* Divider */}
        <div className="mb-[12px] h-0 w-full border-b border-[#e7e7f0]" />

        {/* Details */}
        <div className="flex w-full flex-col gap-[12px]">
          <DetailRow label="Name" value={customer.name} />
          <DetailRow label="Language" value={customer.language} />
          <DetailRow label="Phone number" value={customer.phone} />
          <DetailRow label="Email ID" value={customer.email} />
          <div className="flex w-full items-center justify-between text-[14px] leading-[0]">
            <div className="font-euclid font-normal text-[#5b5675]">
              <p className="leading-[24px]">App status</p>
            </div>
            <div className="flex items-center gap-[4px]">
              <div className="size-[16px] overflow-hidden">
                <Check className="h-[16px] w-[16px] text-[#0fa457]" strokeWidth={2.5} />
              </div>
              <div className="font-euclid text-[14px] font-medium text-[#0fa457]">
                <p className="leading-[normal]">Installed</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Call Context Card - exact Figma specs */}
      <section className="flex w-full flex-col items-start border border-[#e7e7f0] bg-white p-[16px] rounded-[12px]">
        {/* Header */}
        <div className="mb-[12px] flex w-full items-center gap-[8px]">
          <div className="size-[20px] overflow-hidden">
            <FileText className="h-[20px] w-[20px] text-[#5b5675]" />
          </div>
          <h3 className="font-euclid text-[14px] font-medium leading-[20px] text-[#5b5675]">
            CALL CONTEXT
          </h3>
        </div>

        {/* Divider */}
        <div className="mb-[12px] h-0 w-full border-b border-[#e7e7f0]" />

        {/* Context Details */}
        <div className="flex w-full flex-col">
          <DetailRow
            label="Calling for"
            value={canonicalIncomingOngoingIssue(customer.callContext.reason?.trim() ?? "")}
          />
          {customer.callContext.vehicle && (
            <div className="mt-[12px]">
              <DetailRow label="Vehicle" value={customer.callContext.vehicle} />
            </div>
          )}
          {customer.lastCall && (
            <div className="mt-[12px]">
              <div className="flex w-full items-center justify-between text-[14px] leading-[0] whitespace-nowrap">
                <div className="font-euclid font-normal text-[#5b5675]">
                  <p className="leading-[24px]">Last call sentiment</p>
                </div>
                <div className="text-right">
                  <Badge
                    variant={getLastCallBadgeVariant(customer.lastCall.sentiment)}
                    className="rounded-md px-2 py-0.5 text-xs font-medium"
                  >
                    {customer.lastCall.label}
                  </Badge>
                </div>
              </div>
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function DetailRow({
  label,
  value,
}: {
  label: string
  value: React.ReactNode
}) {
  return (
    <div className="flex w-full items-center justify-between text-[14px] leading-[0] whitespace-nowrap">
      <div className="font-euclid font-normal text-[#5b5675]">
        <p className="leading-[24px]">{label}</p>
      </div>
      <div className="font-euclid font-medium text-[#36354c] text-right">
        <p className="leading-[24px]">{value}</p>
      </div>
    </div>
  )
}
