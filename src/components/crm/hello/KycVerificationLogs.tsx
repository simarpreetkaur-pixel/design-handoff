import React from "react"
import { ArrowLeft } from "lucide-react"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
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

// Mock KYC verification logs data
const mockKycLogs: KycLogEntry[] = [
  {
    id: "kyc_001",
    name: "SIMARPREET KAUR",
    phoneNumber: "+91******9998",
    createdOn: "19 Feb, 2026\n02:45 PM",
    updatedOn: "20 Feb, 2026\n12:18 PM",
    status: "FAILED",
    reason: "Not Applicable"
  },
  {
    id: "kyc_002", 
    name: "SIMARPREET KAUR",
    phoneNumber: "+91******9998",
    createdOn: "19 Feb, 2026\n02:40 PM",
    updatedOn: "19 Feb, 2026\n02:45 PM",
    status: "FAILED",
    reason: "Not Applicable"
  },
  {
    id: "kyc_003",
    name: "SIMARPREET KAUR",
    phoneNumber: "+91******9998", 
    createdOn: "19 Feb, 2026\n02:36 PM",
    updatedOn: "19 Feb, 2026\n02:36 PM",
    status: "INITIATED",
    reason: "Not Applicable"
  },
  {
    id: "kyc_004",
    name: "SIMARPREET KAUR",
    phoneNumber: "+91******9998",
    createdOn: "16 Feb, 2026\n03:04 PM", 
    updatedOn: "16 Feb, 2026\n03:06 PM",
    status: "FAILED",
    reason: "User dropped off"
  },
  {
    id: "kyc_005",
    name: "Simarpreet Kaur",
    phoneNumber: "+91******9998",
    createdOn: "25 Nov, 2025\n02:42 PM",
    updatedOn: "11 Jan, 2026\n10:34 AM", 
    status: "SUCCESS",
    reason: "Not Applicable"
  },
  {
    id: "kyc_006",
    name: "Simarpreet Kaur", 
    phoneNumber: "+91******9998",
    createdOn: "25 Nov, 2025\n02:42 PM",
    updatedOn: "11 Jan, 2026\n10:34 AM",
    status: "SUCCESS", 
    reason: "Not Applicable"
  },
  {
    id: "kyc_007",
    name: "Simarpreet Kaur",
    phoneNumber: "+91******9998",
    createdOn: "17 Nov, 2025\n04:49 PM",
    updatedOn: "11 Jan, 2026\n10:34 AM",
    status: "SUCCESS",
    reason: "Not Applicable"
  },
  {
    id: "kyc_008",
    name: "Simarpreet Kaur",
    phoneNumber: "+91******9998", 
    createdOn: "10 Jan, 2026\n06:52 PM",
    updatedOn: "11 Jan, 2026\n10:34 AM",
    status: "SUCCESS",
    reason: "Not Applicable"
  }
]

const getStatusColor = (status: KycLogEntry['status']) => {
  switch (status) {
    case "SUCCESS":
      return "text-[#0fa457] bg-[#e8f5e8]"
    case "FAILED":
      return "text-[#dc2626] bg-[#fef2f2]"
    case "INITIATED":
      return "text-[#f59e0b] bg-[#fef3c7]"
    default:
      return "text-[#5b5675] bg-[#f8f7fc]"
  }
}

const getReasonColor = (reason: string) => {
  if (reason === "User dropped off") {
    return "text-[#dc2626]"
  }
  return "text-[#0fa457]"
}

export function KycVerificationLogs({ customerName = "SIMARPREET KAUR", onBack }: KycVerificationLogsProps) {
  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#e7e7f0] bg-white hover:bg-[#fafafa] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#5b5675]" />
          </button>
          <div>
            <h3 className="font-euclid text-lg font-semibold text-[#040222]">KYC Verification Logs</h3>
            <p className="text-sm text-[#5b5675]">{customerName}</p>
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <div className="border border-[#e7e7f0] rounded-lg bg-white">
          <Table>
            <TableHeader>
              <TableRow className="border-b border-[#e7e7f0] bg-[#fafafa]">
                <TableHead className="font-euclid font-medium text-[#5b5675] text-sm">
                  Name
                </TableHead>
                <TableHead className="font-euclid font-medium text-[#5b5675] text-sm">
                  Phone Number
                </TableHead>
                <TableHead className="font-euclid font-medium text-[#5b5675] text-sm">
                  Created On
                </TableHead>
                <TableHead className="font-euclid font-medium text-[#5b5675] text-sm">
                  Updated On
                </TableHead>
                <TableHead className="font-euclid font-medium text-[#5b5675] text-sm">
                  Status
                </TableHead>
                <TableHead className="font-euclid font-medium text-[#5b5675] text-sm">
                  Reason
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {mockKycLogs.map((log) => (
                <TableRow key={log.id} className="border-b border-[#e7e7f0] hover:bg-[#fafafa]">
                  <TableCell className="font-euclid text-sm text-[#040222] font-medium">
                    {log.name}
                  </TableCell>
                  <TableCell className="font-euclid text-sm text-[#5b5675]">
                    {log.phoneNumber}
                  </TableCell>
                  <TableCell className="font-euclid text-sm text-[#5b5675] whitespace-pre-line">
                    {log.createdOn}
                  </TableCell>
                  <TableCell className="font-euclid text-sm text-[#5b5675] whitespace-pre-line">
                    {log.updatedOn}
                  </TableCell>
                  <TableCell>
                    <span className={cn(
                      "inline-flex items-center px-2 py-1 rounded-md text-xs font-medium",
                      getStatusColor(log.status)
                    )}>
                      {log.status}
                    </span>
                  </TableCell>
                  <TableCell className={cn(
                    "font-euclid text-sm font-medium",
                    getReasonColor(log.reason)
                  )}>
                    {log.reason}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Empty State - if no logs */}
      {mockKycLogs.length === 0 && (
        <div className="flex-1 flex items-center justify-center">
          <div className="text-center py-12">
            <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-4">
              <div className="w-6 h-6 border-2 border-[#5b5675] rounded"></div>
            </div>
            <p className="font-euclid text-sm text-[#5b5675] mb-1">
              No KYC verification logs found
            </p>
            <p className="font-euclid text-xs text-[#5b5675]">
              KYC verification attempts will appear here
            </p>
          </div>
        </div>
      )}
    </div>
  )
}