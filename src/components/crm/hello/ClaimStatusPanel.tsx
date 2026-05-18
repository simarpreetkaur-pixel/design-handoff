import React from "react"
import { ArrowLeft, Car, Shield, Heart, CheckCircle, Clock, AlertTriangle, XCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Policy } from "@/types/crm"
import { cn } from "@/lib/utils"

export interface ClaimStatusPanelProps {
  policies: Policy[]
  onBack: () => void
  onPolicySelect: (policy: Policy) => void
}

// Mock claim status data
interface ClaimStatus {
  id: string
  status: "approved" | "pending" | "under_review" | "rejected"
  amount: string
  submittedDate: string
  lastUpdated: string
}

function getClaimStatus(policyId: string): ClaimStatus | null {
  // Mock data - in real app this would come from an API
  const claimStatuses: Record<string, ClaimStatus> = {
    "POL001": {
      id: "CLM001",
      status: "approved",
      amount: "₹45,000",
      submittedDate: "15 Oct 2024",
      lastUpdated: "20 Oct 2024"
    },
    "POL002": {
      id: "CLM002", 
      status: "pending",
      amount: "₹25,000",
      submittedDate: "18 Oct 2024",
      lastUpdated: "18 Oct 2024"
    },
    "POL003": {
      id: "CLM003",
      status: "under_review",
      amount: "₹15,000", 
      submittedDate: "12 Oct 2024",
      lastUpdated: "19 Oct 2024"
    }
  }
  return claimStatuses[policyId] || null
}

function getStatusIcon(status: ClaimStatus["status"]) {
  switch (status) {
    case "approved":
      return <CheckCircle className="w-4 h-4 text-green-600" />
    case "pending":
      return <Clock className="w-4 h-4 text-yellow-600" />
    case "under_review":
      return <AlertTriangle className="w-4 h-4 text-orange-600" />
    case "rejected":
      return <XCircle className="w-4 h-4 text-red-600" />
  }
}

function getStatusBadge(status: ClaimStatus["status"]) {
  switch (status) {
    case "approved":
      return "bg-green-50 text-green-700 border-green-200"
    case "pending":
      return "bg-yellow-50 text-yellow-700 border-yellow-200"
    case "under_review":
      return "bg-orange-50 text-orange-700 border-orange-200"
    case "rejected":
      return "bg-red-50 text-red-700 border-red-200"
  }
}

function getStatusText(status: ClaimStatus["status"]) {
  switch (status) {
    case "approved":
      return "Approved"
    case "pending":
      return "Pending"
    case "under_review":
      return "Under Review"
    case "rejected":
      return "Rejected"
  }
}

function getPolicyIcon(policy: Policy) {
  if (policy.type === "Motor Insurance") {
    return <Car className="w-5 h-5" />
  } else if (policy.type === "Health Insurance") {
    return <Heart className="w-5 h-5" />
  } else {
    return <Shield className="w-5 h-5" />
  }
}

function getPolicyIconBg(policy: Policy) {
  if (policy.type === "Motor Insurance") {
    return "bg-blue-50 text-blue-600"
  } else if (policy.type === "Health Insurance") {
    return "bg-red-50 text-red-600"
  } else {
    return "bg-gray-50 text-gray-600"
  }
}

export function ClaimStatusPanel({ 
  policies, 
  onBack, 
  onPolicySelect 
}: ClaimStatusPanelProps) {
  return (
    <div className="space-y-4">
      {/* Header with back button */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0"
        >
          <ArrowLeft className="w-4 h-4" />
        </Button>
        <div>
          <h3 className="font-euclid text-lg font-semibold text-gray-900">
            Check Claim Status
          </h3>
          <p className="font-euclid text-sm text-gray-600">
            Select a policy to check its claim status
          </p>
        </div>
      </div>

      {/* Policy list */}
      <div className="space-y-3">
        {policies.map((policy) => {
          const claimStatus = getClaimStatus(policy.id)
          
          return (
            <button
              key={policy.id}
              onClick={() => onPolicySelect(policy)}
              className="w-full text-left p-4 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-3 min-w-0 flex-1">
                  {/* Policy icon */}
                  <div className={cn(
                    "flex items-center justify-center w-10 h-10 rounded-lg shrink-0",
                    getPolicyIconBg(policy)
                  )}>
                    {getPolicyIcon(policy)}
                  </div>
                  
                  {/* Policy details */}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="font-euclid font-medium text-gray-900 truncate">
                        {policy.type}
                      </h4>
                      {claimStatus && (
                        <div className={cn(
                          "inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border",
                          getStatusBadge(claimStatus.status)
                        )}>
                          {getStatusIcon(claimStatus.status)}
                          {getStatusText(claimStatus.status)}
                        </div>
                      )}
                    </div>
                    <p className="font-euclid text-sm text-gray-600 mb-1">
                      {policy.policyNumber}
                    </p>
                    {policy.vehicle && (
                      <p className="font-euclid text-sm text-gray-500">
                        {policy.vehicle.make} {policy.vehicle.model} • {policy.vehicle.year}
                      </p>
                    )}
                    {claimStatus && (
                      <div className="mt-2 text-xs text-gray-500">
                        <p>Claim Amount: {claimStatus.amount}</p>
                        <p>Last Updated: {claimStatus.lastUpdated}</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {policies.length === 0 && (
        <div className="text-center py-8 text-gray-500">
          <Shield className="w-12 h-12 mx-auto mb-3 text-gray-300" />
          <p className="font-euclid text-sm">No policies found</p>
        </div>
      )}
    </div>
  )
}