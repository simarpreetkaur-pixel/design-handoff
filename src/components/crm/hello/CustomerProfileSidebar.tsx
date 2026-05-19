import { ChevronDown, Copy } from "lucide-react"
import { useState } from "react"
import type { Customer, Policy, InactivePolicy } from "@/types/crm"
import { cn } from "@/lib/utils"

// Asset constants - using local icons
const profileIcon = "https://www.figma.com/api/mcp/asset/c19639ff-1d1a-479f-922d-07df8c54c2a3" // Keep original for now
const relationshipIcon = "/icons/relationship.png"
const messagesIcon = "/icons/messages.svg"
const pendingIcon = "/icons/pending.png"
const checkIcon = "/icons/verified.png"
const carIcon = "/icons/car.png"
const bikeIcon = "/icons/bike.png"
const healthIcon = "/icons/health.png"
const policyIcon = "/icons/health.png" // Default to health icon

interface CustomerProfileSidebarProps {
  customer: Customer
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  className?: string
}

interface PolicyItemProps {
  policy: Policy
}

function PolicyItem({ policy }: PolicyItemProps) {
  const [isExpanded, setIsExpanded] = useState(false)
  const [expandedFamilyMember, setExpandedFamilyMember] = useState<string | null>(null)
  const [coveredMembersExpanded, setCoveredMembersExpanded] = useState(false)
  
  // Determine which icon to use based on policy type
  let icon = policyIcon
  
  const policyTypeStr = policy.type?.toLowerCase() || ''
  const vehicleStr = policy.vehicle?.toLowerCase() || ''
  
  if (policyTypeStr.includes('car') || policyTypeStr.includes('motor') || vehicleStr.includes('car') || vehicleStr.includes('nexon') || vehicleStr.includes('swift') || vehicleStr.includes('ecosport') || vehicleStr.includes('ford')) {
    icon = carIcon
  } else if (policyTypeStr.includes('bike') || policyTypeStr.includes('motorcycle') || vehicleStr.includes('bike')) {
    icon = bikeIcon
  } else if (policyTypeStr.includes('health') || policyTypeStr.includes('medical')) {
    icon = healthIcon
  }

  const toggleExpanded = () => {
    setIsExpanded(!isExpanded)
    if (!isExpanded) {
      setExpandedFamilyMember(null)
      setCoveredMembersExpanded(false)
    }
  }

  const toggleFamilyMember = (memberName: string) => {
    setExpandedFamilyMember(expandedFamilyMember === memberName ? null : memberName)
  }

  const toggleCoveredMembers = (e: React.MouseEvent) => {
    e.stopPropagation()
    setCoveredMembersExpanded(!coveredMembersExpanded)
    if (!coveredMembersExpanded) {
      setExpandedFamilyMember(null)
    }
  }

  // Check if this is a health insurance policy with covered members
  const isHealthPolicyWithMembers = policyTypeStr.includes('health') && policy.coveredMembers && policy.coveredMembers.length > 0

  return (
    <div className="bg-[#f8f7fc] flex flex-col gap-2 p-2 rounded-lg w-full">
      {/* Main Policy Item Header */}
      <div 
        className="flex items-start justify-between cursor-pointer"
        onClick={toggleExpanded}
      >
        <div className="flex gap-1 items-start">
          <div className="flex items-center py-0.5">
            <div className="overflow-hidden relative shrink-0 w-5 h-5">
              <img alt="" className="block max-w-none w-full h-full object-contain" src={icon} />
            </div>
          </div>
          <div className="flex flex-col gap-1 items-start justify-center">
            <div className="text-[#36354c] text-sm font-medium font-euclid leading-5">
              {policy.name}
            </div>
            <div className="text-[#5b5675] text-xs font-euclid leading-[18px]">
              {policy.policyNumber}
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center">
          {isExpanded ? (
            <div className="rotate-180">
              <ChevronDown className="w-4 h-4 text-[#5b5675]" />
            </div>
          ) : (
            <ChevronDown className="w-4 h-4 text-[#5b5675]" />
          )}
        </div>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <>
          {/* Divider */}
          <div className="h-0 w-full border-t border-[#e7e7f0]"></div>
          
          {/* Policy Details */}
          <div className="flex flex-col gap-3">
            {/* Basic Policy Details */}
            <div className="flex justify-between items-center">
              <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Policy holder</span>
              <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">{policy.policyHolder}</span>
            </div>
            
            {(policyTypeStr.includes('car') || policyTypeStr.includes('motor')) && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Policy type</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">car_od</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Purchase date</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">28 Jun 2025</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Policy period</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">28 Jun 2025 - 27 June 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Partner name</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">Acko General Insurance</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Policy Tenure</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">1 year</span>
                </div>
              </>
            )}

            {isHealthPolicyWithMembers && (
              <>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Policy type</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">ACKO health plan</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Employer name</span>
                  <span 
                    className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right cursor-default"
                    title="Acko Technology & Services Pvt. Ltd."
                  >
                    Acko Technology & Se..
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Insured name</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">{policy.policyHolder}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Policy period</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">28 Jun 2025 - 27 June 2026</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Employee code</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">AT382</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Sum insured</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">₹5L</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Construct</span>
                  <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">Family floater</span>
                </div>
                
                {/* Covered Members Row */}
                <div className="flex justify-between items-center">
                  <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Covered members</span>
                  <div 
                    className="flex gap-1 items-center cursor-pointer"
                    onClick={toggleCoveredMembers}
                  >
                    <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">2 members</span>
                    <div className="flex items-center justify-center">
                      {coveredMembersExpanded ? (
                        <div className="rotate-180">
                          <ChevronDown className="w-3 h-3 text-[#5b5675]" />
                        </div>
                      ) : (
                        <ChevronDown className="w-3 h-3 text-[#5b5675]" />
                      )}
                    </div>
                  </div>
                </div>
              </>
            )}

            {/* Family Members Expanded Section */}
            {isHealthPolicyWithMembers && coveredMembersExpanded && (
              <div className="flex flex-col gap-0">
                {policy.coveredMembers?.map((member, index) => (
                  <div key={member.name}>
                    {/* Divider before each member (except first) */}
                    {index > 0 && (
                      <div className="h-0 w-full border-t border-[#e7e7f0] my-2"></div>
                    )}
                    
                    {/* Member Item */}
                    <div 
                      className="flex items-start justify-between pl-0 py-1 cursor-pointer hover:bg-[#fafafa] transition-colors rounded"
                      onClick={() => toggleFamilyMember(member.name)}
                    >
                      <div className="flex gap-2 items-start">
                        <div className="h-[11px] w-[6px] flex items-center">
                          <div className="w-1.5 h-1.5 bg-[#7c47e1] rounded-full"></div>
                        </div>
                        <div className="flex gap-1 items-start text-[#5b5675] text-xs font-euclid leading-[18px]">
                          <span className="font-medium text-[#36354c]">{member.name}</span>
                          <span className="text-[#5b5675]">({member.relation})</span>
                        </div>
                      </div>
                      <div className="flex items-center justify-center">
                        {expandedFamilyMember === member.name ? (
                          <div className="rotate-180">
                            <ChevronDown className="w-3 h-3 text-[#5b5675]" />
                          </div>
                        ) : (
                          <ChevronDown className="w-3 h-3 text-[#5b5675]" />
                        )}
                      </div>
                    </div>

                    {/* Expanded Member Details */}
                    {expandedFamilyMember === member.name && (
                      <div className="bg-[#fafafa] border border-[#f0f0f0] rounded-lg p-3 mt-2 mb-1">
                        <div className="flex flex-col gap-2.5">
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Date of birth</span>
                            <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">1st Sep 1977</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Age</span>
                            <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">49</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Gender</span>
                            <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right">Male</span>
                          </div>
                          <div className="flex justify-between items-center">
                            <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">UHID</span>
                            <div className="flex gap-0.5 items-center min-w-0">
                              <span 
                                className="text-[#36354c] text-xs font-medium font-euclid leading-[18px] text-right truncate max-w-[140px]"
                                title="ACK.AH020120260000004620.1"
                              >
                                ACK.AH020120260000004620.1
                              </span>
                              <Copy className="w-4 h-4 text-[#7c47e1] shrink-0" />
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}

export function CustomerProfileSidebar({
  customer,
  activePolicies,
  inactivePolicies,
  className,
}: CustomerProfileSidebarProps) {

  // Format date of birth from customer data or use placeholder
  const formatDateOfBirth = (customer: Customer) => {
    // For now using placeholder to match Figma design
    // TODO: Add dateOfBirth field to Customer type if needed
    return "1st Aug 1978"
  }

  const formatLocation = (customer: Customer) => {
    // For now using placeholder to match Figma design  
    // TODO: Add location field to Customer type if needed
    return "Bangalore"
  }

  // Format tenure with ACKO
  const formatTenure = (customer: Customer) => {
    return customer.tenureWithAcko?.replace(' with ACKO', '') || "4 years"
  }

  const kycStatusColor = customer.kycStatus === "verified" 
    ? "text-[#0fa457]" 
    : customer.kycStatus === "pending" 
    ? "text-[#f58700]" 
    : "text-[#5b5675]"

  const kycStatusText = customer.kycStatus === "verified" 
    ? "Verified" 
    : customer.kycStatus === "pending" 
    ? "Pending" 
    : "Not Available"

  const appStatusText = customer.appStatus === "installed" ? "Yes" : "No"
  const appStatusColor = customer.appStatus === "installed" ? "text-[#0fa457]" : "text-[#5b5675]"

  return (
    <div 
      className={cn(
        "bg-white border-r border-[#e7e7f0] border-solid flex flex-col gap-4 items-start pb-14 pt-4 px-3 w-[298px] h-full overflow-y-auto",
        "shadow-[2px_0px_4px_rgba(0,0,0,0.09)]",
        className
      )}
    >
      {/* Customer Details Section */}
      <div className="bg-white border border-[#e7e7f0] border-solid flex flex-col gap-2.5 items-start pb-4 rounded-xl w-full shrink-0">
        {/* Section Header */}
        <div className="bg-[#f8f7fc] h-12 w-full rounded-t-xl">
          <div className="flex gap-1.5 items-center px-4 py-3.5">
            <div className="overflow-hidden relative shrink-0 w-5 h-5">
              <img alt="" className="block max-w-none w-full h-full object-contain" src={profileIcon} />
            </div>
            <div className="flex flex-col justify-center text-[#5b5675] text-xs font-medium font-euclid leading-5">
              CUSTOMER DETAILS
            </div>
          </div>
        </div>

        {/* Customer Details Content */}
        <div className="flex flex-col gap-3 items-start px-3 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center text-[#5b5675] text-sm font-euclid leading-6">
              Name
            </div>
            <div className="flex flex-col justify-center text-[#36354c] text-sm font-medium font-euclid leading-6 text-right">
              {customer.name}
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center text-[#5b5675] text-sm font-euclid leading-6">
              Date of birth
            </div>
            <div className="flex flex-col justify-center text-[#36354c] text-sm font-medium font-euclid leading-6 text-right">
              {formatDateOfBirth(customer)}
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center text-[#5b5675] text-sm font-euclid leading-6">
              Preferred language
            </div>
            <div className="flex flex-col justify-center text-[#36354c] text-sm font-medium font-euclid leading-6 text-right">
              {customer.language}
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center text-[#5b5675] text-sm font-euclid leading-6">
              Location
            </div>
            <div className="flex flex-col justify-center text-[#36354c] text-sm font-medium font-euclid leading-6 text-right">
              {formatLocation(customer)}
            </div>
          </div>
        </div>
      </div>

      {/* ACKO Relationship Section */}
      <div className="bg-white border border-[#e7e7f0] border-solid flex flex-col gap-2.5 items-start pb-4 rounded-xl w-full">
        {/* Section Header */}
        <div className="bg-[#f8f7fc] h-12 w-full rounded-t-xl">
          <div className="flex gap-1.5 items-center px-4 py-3.5">
            <div className="overflow-hidden relative shrink-0 w-5 h-5">
              <img alt="" className="block max-w-none w-full h-full object-contain" src={relationshipIcon} />
            </div>
            <div className="flex flex-col justify-center text-[#5b5675] text-xs font-medium font-euclid leading-5">
              ACKO RELATIONSHIP
            </div>
          </div>
        </div>

        {/* ACKO Relationship Content */}
        <div className="flex flex-col gap-3 items-start px-3 w-full">
          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center text-[#5b5675] text-sm font-euclid leading-6">
              Customer since
            </div>
            <div className="flex flex-col justify-center text-[#36354c] text-sm font-medium font-euclid leading-6 text-right">
              {formatTenure(customer)}
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center text-[#5b5675] text-sm font-euclid leading-6">
              KYC status
            </div>
            <div className="flex gap-1 items-center">
              <div className="overflow-hidden relative shrink-0 w-4 h-4">
                <img 
                  alt="" 
                  className="block max-w-none w-full h-full object-contain" 
                  src={customer.kycStatus === "verified" ? checkIcon : pendingIcon} 
                />
              </div>
              <div className={cn("flex flex-col justify-center text-sm font-medium font-euclid", kycStatusColor)}>
                {kycStatusText}
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between w-full">
            <div className="flex flex-col justify-center text-[#5b5675] text-sm font-euclid leading-6">
              App installed
            </div>
            <div className="flex gap-1 items-center">
              {customer.appStatus === "installed" && (
                <div className="overflow-hidden relative shrink-0 w-4 h-4">
                  <img alt="" className="block max-w-none w-full h-full object-contain" src={checkIcon} />
                </div>
              )}
              <div className={cn("flex flex-col justify-center text-sm font-medium font-euclid", appStatusColor)}>
                {appStatusText}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Last support interaction — Figma node 9101:22138 */}
      <div className="w-full rounded-[12px] border border-solid border-[#e7e7f0] bg-white p-4">
        <div className="flex w-full flex-col items-start gap-[7px]">
          <div className="flex items-start gap-1">
            <div className="relative size-5 shrink-0 overflow-clip">
              <img
                alt=""
                className="block size-full max-w-none object-contain"
                src={messagesIcon}
              />
            </div>
            <p className="shrink-0 whitespace-nowrap font-euclid text-sm font-medium leading-5 text-[#5b5675]">
              Support bot • 2 hours ago
            </p>
          </div>
          <p className="w-full font-euclid text-sm font-normal leading-5 text-[#5b5675]">
            Rajesh enquired about how to raise a claim on support.
          </p>
        </div>
      </div>

      {/* Active Policies Section */}
      <div className="bg-white border border-[#e7e7f0] border-solid flex flex-col gap-2.5 items-start pb-4 rounded-xl w-full">
        {/* Section Header */}
        <div className="bg-[#f8f7fc] h-12 w-full rounded-t-xl">
          <div className="flex gap-1.5 items-center px-4 py-3.5">
            <div className="overflow-hidden relative shrink-0 w-5 h-5">
              <img alt="" className="block max-w-none w-full h-full object-contain" src={profileIcon} />
            </div>
            <div className="flex flex-col justify-center text-[#5b5675] text-xs font-medium font-euclid leading-5">
              ACTIVE POLICIES
            </div>
          </div>
        </div>

        {/* Policy Items */}
        <div className="flex flex-col gap-3 items-start px-3 w-full">
          {activePolicies.length > 0 ? (
            activePolicies.map((policy) => (
              <PolicyItem key={policy.id} policy={policy} />
            ))
          ) : (
            <div className="bg-[#f8f7fc] p-2 rounded-lg w-full">
              <div className="text-[#5b5675] text-sm font-euclid">
                No active policies
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inactive Policies Section */}
      {inactivePolicies.length > 0 && (
        <div className="bg-white border border-[#e7e7f0] border-solid flex flex-col gap-2.5 items-start pb-4 rounded-xl w-full">
          {/* Section Header */}
          <div className="bg-[#f8f7fc] h-12 w-full rounded-t-xl">
            <div className="flex gap-1.5 items-center px-4 py-3.5">
              <div className="overflow-hidden relative shrink-0 w-5 h-5">
                <img alt="" className="block max-w-none w-full h-full object-contain" src={profileIcon} />
              </div>
              <div className="flex flex-col justify-center text-[#5b5675] text-xs font-medium font-euclid leading-5">
                INACTIVE POLICIES
              </div>
            </div>
          </div>

          {/* Inactive Policy Items */}
          <div className="flex flex-col gap-3 items-start px-3 w-full">
            {inactivePolicies.map((inactivePolicy) => (
              <div key={inactivePolicy.id} className="bg-[#f8f7fc] flex flex-col gap-2 p-2 rounded-lg w-full">
                <div className="flex items-start justify-between cursor-pointer">
                  <div className="flex gap-1 items-start">
                    <div className="flex items-center py-0.5">
                      <div className="overflow-hidden relative shrink-0 w-5 h-5">
                        <img alt="" className="block max-w-none w-full h-full object-contain" src={carIcon} />
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 items-start justify-center">
                      <div className="text-[#36354c] text-sm font-medium font-euclid leading-5">
                        {inactivePolicy.productTitle}
                      </div>
                      <div className="text-[#5b5675] text-xs font-euclid leading-[18px]">
                        {inactivePolicy.policyNumber}
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center justify-center">
                    <ChevronDown className="w-4 h-4 text-[#5b5675]" />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}