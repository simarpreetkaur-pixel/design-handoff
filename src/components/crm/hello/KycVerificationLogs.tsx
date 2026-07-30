import { ArrowLeft } from "lucide-react"
import { cn } from "@/lib/utils"

interface KycLogEntry {
  id: string
  name: string
  phoneNumber: string
  createdOn: string
  updatedOn: string
  status: "SUCCESS" | "FAILED" | "INITIATED"
  reason: string
}

interface KycVerificationLogsProps {
  customerName?: string
  onBack: () => void
}

const mockKycLogs: KycLogEntry[] = [
  {
    id: "kyc_001",
    name: "SIMARPREET KAUR",
    phoneNumber: "+91 ******9998",
    createdOn: "19 Feb '26, 02:45 PM",
    updatedOn: "20 Feb '26, 12:18 PM",
    status: "FAILED",
    reason: "Not Applicable",
  },
  {
    id: "kyc_002",
    name: "SIMARPREET KAUR",
    phoneNumber: "+91 ******9998",
    createdOn: "19 Feb '26, 02:40 PM",
    updatedOn: "19 Feb '26, 02:45 PM",
    status: "FAILED",
    reason: "Not Applicable",
  },
  {
    id: "kyc_003",
    name: "SIMARPREET KAUR",
    phoneNumber: "+91 ******9998",
    createdOn: "19 Feb '26, 02:36 PM",
    updatedOn: "19 Feb '26, 02:36 PM",
    status: "INITIATED",
    reason: "Not Applicable",
  },
  {
    id: "kyc_004",
    name: "SIMARPREET KAUR",
    phoneNumber: "+91 ******9998",
    createdOn: "16 Feb '26, 03:04 PM",
    updatedOn: "16 Feb '26, 03:06 PM",
    status: "FAILED",
    reason: "User dropped off",
  },
  {
    id: "kyc_005",
    name: "Simarpreet Kaur",
    phoneNumber: "+91 ******9998",
    createdOn: "25 Nov '25, 02:42 PM",
    updatedOn: "11 Jan '26, 10:34 AM",
    status: "SUCCESS",
    reason: "Not Applicable",
  },
  {
    id: "kyc_006",
    name: "Simarpreet Kaur",
    phoneNumber: "+91 ******9998",
    createdOn: "25 Nov '25, 02:42 PM",
    updatedOn: "11 Jan '26, 10:34 AM",
    status: "SUCCESS",
    reason: "Not Applicable",
  },
  {
    id: "kyc_007",
    name: "Simarpreet Kaur",
    phoneNumber: "+91 ******9998",
    createdOn: "17 Nov '25, 04:49 PM",
    updatedOn: "11 Jan '26, 10:34 AM",
    status: "SUCCESS",
    reason: "Not Applicable",
  },
  {
    id: "kyc_008",
    name: "Simarpreet Kaur",
    phoneNumber: "+91 ******9998",
    createdOn: "10 Jan '26, 06:52 PM",
    updatedOn: "11 Jan '26, 10:34 AM",
    status: "SUCCESS",
    reason: "Not Applicable",
  },
]

const STATUS_STYLES: Record<KycLogEntry["status"], string> = {
  SUCCESS: "text-[#0fa457] bg-[#e8f5e8]",
  FAILED: "text-[#dc2626] bg-[#fef2f2]",
  INITIATED: "text-[#d97706] bg-[#fef3c7]",
}

export function KycVerificationLogs({
  customerName = "SIMARPREET KAUR",
  onBack,
}: KycVerificationLogsProps) {
  return (
    <div className="flex h-full flex-col overflow-hidden">
      {/* Header */}
      <div className="shrink-0 border-b border-[#e7e7f0] px-4 py-3">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex size-8 items-center justify-center rounded-lg border border-[#e7e7f0] bg-white transition-colors hover:bg-[#fafafa]"
          >
            <ArrowLeft className="size-4 text-[#5b5675]" />
          </button>
          <div>
            <h3 className="font-euclid text-[15px] font-semibold text-[#040222]">KYC Verification Logs</h3>
            <p className="font-euclid text-[12px] text-[#5b5675]">{customerName}</p>
          </div>
        </div>
      </div>

      {/* Table — compact 4-column layout that fits any panel width */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        <table className="w-full border-collapse text-left">
          <thead>
            <tr className="border-b border-[#e7e7f0] bg-[#fafafa]">
              <th className="px-3 py-2.5 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#8b87a3]">
                Name
              </th>
              <th className="px-3 py-2.5 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#8b87a3]">
                Created
              </th>
              <th className="px-3 py-2.5 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#8b87a3]">
                Updated
              </th>
              <th className="px-3 py-2.5 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#8b87a3]">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {mockKycLogs.map((log) => (
              <tr
                key={log.id}
                className="border-b border-[#f0f0f6] transition-colors hover:bg-[#fafafa]"
              >
                {/* Name + phone stacked */}
                <td className="px-3 py-2.5 align-top">
                  <p className="font-euclid text-[12px] font-semibold leading-4 text-[#040222]">
                    {log.name}
                  </p>
                  <p className="mt-0.5 font-euclid text-[11px] leading-4 text-[#9c9aaf]">
                    {log.phoneNumber}
                  </p>
                </td>

                {/* Created date */}
                <td className="px-3 py-2.5 align-top">
                  <p className="font-euclid text-[11px] leading-4 text-[#5b5675]">{log.createdOn}</p>
                </td>

                {/* Updated date */}
                <td className="px-3 py-2.5 align-top">
                  <p className="font-euclid text-[11px] leading-4 text-[#5b5675]">{log.updatedOn}</p>
                </td>

                {/* Status badge + reason stacked */}
                <td className="px-3 py-2.5 align-top">
                  <span
                    className={cn(
                      "inline-flex items-center rounded-md px-1.5 py-0.5 font-euclid text-[10px] font-semibold",
                      STATUS_STYLES[log.status],
                    )}
                  >
                    {log.status}
                  </span>
                  <p
                    className={cn(
                      "mt-1 font-euclid text-[10px] leading-3",
                      log.reason === "User dropped off" ? "text-[#dc2626]" : "text-[#9c9aaf]",
                    )}
                  >
                    {log.reason}
                  </p>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {mockKycLogs.length === 0 && (
          <div className="flex flex-col items-center justify-center gap-3 py-16 text-center">
            <div className="flex size-12 items-center justify-center rounded-full bg-[#f8f7fc]">
              <div className="size-6 rounded border-2 border-[#5b5675]" />
            </div>
            <p className="font-euclid text-sm text-[#5b5675]">No KYC verification logs found</p>
            <p className="font-euclid text-xs text-[#9c9aaf]">KYC verification attempts will appear here</p>
          </div>
        )}
      </div>
    </div>
  )
}
