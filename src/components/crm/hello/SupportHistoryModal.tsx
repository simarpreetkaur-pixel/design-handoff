import { cn } from "@/lib/utils"
import type { RekhaSupportHistoryEntry } from "@/data/rekhaGuptaClaimStatusEscalated"

const customerServiceIcon = "/icons/customer-service.png"
const imgGroup = "https://www.figma.com/api/mcp/asset/8463fbe6-ab83-4203-a177-08e24c4dcb73"

export type SupportHistoryEntry = RekhaSupportHistoryEntry

interface SupportHistoryModalProps {
  isOpen: boolean
  onClose: () => void
  className?: string
  entries?: SupportHistoryEntry[]
}

const defaultSupportHistoryData: SupportHistoryEntry[] = [
  {
    agent: "CX Anita",
    timestamp: "45 days ago",
    description:
      "Customer called to check the claim status for their GMC Policy, for their mother's cataract operation",
  },
  {
    agent: "CX Supriya",
    timestamp: "4 days ago",
    description:
      "Customer called to check if cataract was covered in their medical health insurance",
  },
]

export function SupportHistoryModal({
  isOpen,
  onClose,
  className,
  entries = defaultSupportHistoryData,
}: SupportHistoryModalProps) {
  if (!isOpen) return null

  return (
    <div
      className={cn(
        "bg-white border-[#e7e7f0] border-r border-solid flex flex-col gap-4 items-start pb-14 pt-4 px-3 h-full w-full",
        className,
      )}
    >
      <button
        type="button"
        onClick={onClose}
        className="flex gap-1.5 items-center shrink-0 text-[#2d2d2d] text-sm font-medium font-euclid leading-5 hover:text-[#1f1f1f] transition-colors cursor-pointer bg-transparent border-none p-0"
      >
        <span className="text-lg leading-none" aria-hidden>
          ←
        </span>
        <span>Go back</span>
      </button>

      <div className="relative flex w-full shrink-0 flex-col items-start gap-2.5 rounded-xl border border-solid border-[#e7e7f0] bg-white pb-4">
        <div className="h-12 w-full shrink-0 rounded-t-xl bg-[#f8f7fc]">
          <div className="flex items-center gap-1.5 px-4 py-3.5">
            <div className="relative h-5 w-5 shrink-0 overflow-hidden">
              <img
                alt=""
                className="block h-full w-full max-w-none object-contain"
                src={customerServiceIcon}
              />
            </div>
            <div className="flex flex-col justify-center font-euclid text-xs font-medium leading-5 text-[#5b5675]">
              SUPPORT HISTORY
            </div>
          </div>
        </div>

        <div className="flex w-full flex-col items-start gap-3 px-3">
          {entries.map((entry, index) => (
            <div key={`${entry.agent}-${entry.timestamp}-${index}`} className="flex w-full flex-col items-start">
              <div className="flex w-full gap-1 items-start">
                <div className="relative mt-0.5 h-5 w-5 shrink-0 overflow-hidden">
                  <img alt="" className="block h-full w-full object-contain" src={imgGroup} />
                </div>
                <div className="min-w-0 flex-1 flex flex-col gap-1">
                  <div className="font-euclid text-xs font-medium leading-5 text-[#36354c]">
                    {entry.agent} • {entry.timestamp}
                  </div>
                  <div className="font-euclid text-sm leading-5 text-[#5b5675]">{entry.description}</div>
                </div>
              </div>
              {index < entries.length - 1 ? (
                <div className="ml-2.5 mt-2 h-3 w-px bg-[#e7e7f0]" aria-hidden />
              ) : null}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
