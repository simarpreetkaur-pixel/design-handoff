import React from "react"
import { ArrowLeft, Car, Shield, Heart } from "lucide-react"
import { Button } from "@/components/ui/button"
import type { Policy } from "@/types/crm"
import { cn } from "@/lib/utils"

export interface PolicySelectionPanelProps {
  title: string
  description: string
  policies: Policy[]
  onBack: () => void
  onPolicySelect: (policy: Policy) => void
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

export function PolicySelectionPanel({ 
  title, 
  description, 
  policies, 
  onBack, 
  onPolicySelect 
}: PolicySelectionPanelProps) {
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
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h4 className="font-euclid text-sm font-semibold text-[#040222]">
            {title}
          </h4>
          <p className="font-euclid text-xs text-[#5b5675] mt-1">
            {description}
          </p>
        </div>
      </div>

      {/* Policy Selection */}
      <div className="space-y-2">
        {policies.length > 0 ? (
          policies.map((policy) => (
            <button
              key={policy.id}
              onClick={() => onPolicySelect(policy)}
              className="w-full text-left p-3 bg-white border border-[#e7e7f0] hover:border-[#7c47e1] hover:bg-[#f8f7fc] rounded-lg transition-colors"
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                  getPolicyIconBg(policy)
                )}>
                  {getPolicyIcon(policy)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between">
                    <div className="font-euclid text-sm font-medium text-[#040222]">
                      {policy.name || policy.vehicle || policy.planDisplayName}
                    </div>
                    <div className="font-euclid text-xs text-[#5b5675]">
                      {policy.type}
                    </div>
                  </div>
                  <div className="font-euclid text-xs text-[#5b5675] mt-1">
                    {policy.policyNumber}
                  </div>
                  {policy.expiryDate && (
                    <div className="font-euclid text-xs text-[#5b5675] mt-0.5">
                      Expires: {policy.expiryDate}
                    </div>
                  )}
                </div>
              </div>
            </button>
          ))
        ) : (
          <div className="text-center py-8">
            <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
              <Shield className="w-6 h-6 text-[#5b5675]" />
            </div>
            <p className="font-euclid text-sm text-[#5b5675] mb-2">
              No policies found
            </p>
            <p className="font-euclid text-xs text-[#5b5675]">
              Customer doesn't have any active policies
            </p>
          </div>
        )}
      </div>
    </div>
  )
}