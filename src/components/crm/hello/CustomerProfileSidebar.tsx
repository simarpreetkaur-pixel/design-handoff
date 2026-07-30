import { ChevronDown, Copy } from "lucide-react"
import { useState } from "react"
import type { SidebarActiveClaim } from "@/data/sidebarActiveClaim"
import type { Customer, Policy, InactivePolicy } from "@/types/crm"
import { cn } from "@/lib/utils"

export interface ActiveCaseDetail {
  label: string
  value: string
  /** When true, value is rendered as a blue hyperlink */
  isLink?: boolean
}

export interface ActiveCaseData {
  /** e.g. "Ongoing inspection" */
  title: string
  /** e.g. "646507 - Tata Nexon" */
  subtitle: string
  details: ActiveCaseDetail[]
}
import {
  SupportHistoryModal,
  type SupportHistoryEntry,
} from "@/components/crm/hello/SupportHistoryModal"

// Asset constants - using local icons
const profileIcon = "/icons/profile-shield-icon.png"
const relationshipIcon = "/icons/relationship.png"
const customerServiceIcon = "/icons/customer-service.png"
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
  /** Sidebar preview row; defaults to generic demo copy. */
  supportHistoryPreview?: SupportHistoryEntry
  /** Full list when “View conversations” is opened. */
  supportHistoryEntries?: SupportHistoryEntry[]
  /** Claim-status flows — Active Claim card below ACKO Relationship (Figma 9367:22470 / 9367:22418). */
  activeClaim?: SidebarActiveClaim | null
  /** When there are no active policies, show this instead of the default empty copy (e.g. unknown-reason unlock). */
  emptyActivePoliciesMessage?: string
  /** When true, shows Customer details / Support history tabs at the top (Figma UC6/UC7). */
  showTabs?: boolean
  /** Called when the agent clicks "View" on a policy document row. */
  onViewPolicyDoc?: (policy: Policy) => void
  /** UC1 (Edit Policy) — active cases shown between ACKO Relationship and Active Policies. */
  activeCases?: ActiveCaseData[]
}

interface PolicyItemProps {
  policy: Policy
  onViewPolicyDoc?: (policy: Policy) => void
}

function ActiveClaimDetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex w-full items-start justify-between text-xs font-euclid leading-[18px]">
      <span className="shrink-0 text-[#5b5675]">{label}</span>
      <span className="min-w-0 max-w-[123px] text-right font-medium text-[#36354c]">{value}</span>
    </div>
  )
}

function ActiveClaimItem({ claim }: { claim: SidebarActiveClaim }) {
  const [isExpanded, setIsExpanded] = useState(false)
  const showCallbackJewel = Boolean(claim.chCallSchedule?.trim())

  const toggleExpanded = () => setIsExpanded((prev) => !prev)

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg bg-[#f8f7fc] p-2">
      <div
        className="flex w-full cursor-pointer items-start justify-between"
        onClick={toggleExpanded}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault()
            toggleExpanded()
          }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="flex min-w-0 flex-1 items-start gap-1">
          <div className="flex shrink-0 items-center py-0.5">
            <div className="relative h-5 w-5 shrink-0 overflow-hidden">
              <img alt="" className="block h-full w-full max-w-none object-contain" src={carIcon} />
            </div>
          </div>
          <div className="flex min-w-0 flex-col items-start justify-center gap-1">
            <div className="flex items-center gap-1">
              <span className="font-euclid text-sm font-medium leading-5 text-[#36354c]">
                {claim.vehicleName}
              </span>
              {showCallbackJewel ? (
                <span
                  className="h-3 w-3 shrink-0 rounded-[9px] border-[1.5px] border-white bg-[#e05752]"
                  aria-label="Claim handler callback scheduled"
                />
              ) : null}
            </div>
            <p className="whitespace-pre font-euclid text-xs leading-[18px] text-[#5b5675]">
              {`Claim ID:  ${claim.claimId}`}
            </p>
          </div>
        </div>
        <div className="flex shrink-0 items-center justify-center">
          {isExpanded ? (
            <div className="rotate-180">
              <ChevronDown className="h-4 w-4 text-[#5b5675]" aria-hidden />
            </div>
          ) : (
            <ChevronDown className="h-4 w-4 text-[#5b5675]" aria-hidden />
          )}
        </div>
      </div>

      {isExpanded ? (
        <>
          <div className="h-0 w-full border-t border-[#e7e7f0]" />
          <div className="flex w-full flex-col gap-3">
            {showCallbackJewel ? (
              <ActiveClaimDetailRow label="CH call schedule" value={claim.chCallSchedule!.trim()} />
            ) : null}
            <ActiveClaimDetailRow label="Claim type" value={claim.claimType} />
            <ActiveClaimDetailRow label="Claim date" value={claim.claimDate} />
            <ActiveClaimDetailRow label="Policy holder" value={claim.policyHolder} />
            <ActiveClaimDetailRow label="Policy" value={claim.policy} />
            <ActiveClaimDetailRow label="Claim amount" value={claim.claimAmount} />
          </div>
        </>
      ) : null}
    </div>
  )
}

function ActiveCaseItem({ item }: { item: ActiveCaseData }) {
  const [isExpanded, setIsExpanded] = useState(false)

  return (
    <div className="flex w-full flex-col gap-2 rounded-lg bg-[#f8f7fc] p-2">
      <div
        className="flex w-full cursor-pointer items-start justify-between"
        onClick={() => setIsExpanded((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") { e.preventDefault(); setIsExpanded((prev) => !prev) }
        }}
        role="button"
        tabIndex={0}
        aria-expanded={isExpanded}
      >
        <div className="flex min-w-0 flex-col gap-1">
          <span className="font-euclid text-sm font-medium leading-5 text-[#36354c]">{item.title}</span>
          <span className="font-euclid text-xs leading-[18px] text-[#5b5675]">{item.subtitle}</span>
        </div>
        <div className={cn("flex shrink-0 items-center justify-center transition-transform", isExpanded && "rotate-180")}>
          <ChevronDown className="h-4 w-4 text-[#5b5675]" aria-hidden />
        </div>
      </div>

      {isExpanded && (
        <>
          <div className="h-0 w-full border-t border-[#e7e7f0]" />
          <div className="flex flex-col gap-3">
            {item.details.map((detail) => (
              <div key={detail.label} className="flex w-full items-center justify-between text-xs font-euclid leading-[18px]">
                <span className="shrink-0 text-[#5b5675]">{detail.label}</span>
                {detail.isLink ? (
                  <span className="font-medium text-[#1b73e8]">{detail.value}</span>
                ) : (
                  <span className="text-right font-medium text-[#36354c]">{detail.value}</span>
                )}
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}

function PolicyItem({ policy, onViewPolicyDoc }: PolicyItemProps) {
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

            {/* Policy document row — always shown in expanded state */}
            <div className="flex items-center justify-between">
              <span className="text-[#5b5675] text-xs font-euclid leading-[18px]">Policy document</span>
              {onViewPolicyDoc ? (
                <button
                  type="button"
                  onClick={(e) => { e.stopPropagation(); onViewPolicyDoc(policy) }}
                  className="text-[#7c47e1] text-xs font-medium font-euclid leading-[18px] hover:underline"
                >
                  View
                </button>
              ) : (
                <span className="text-[#36354c] text-xs font-medium font-euclid leading-[18px]">View</span>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  )
}

const DEFAULT_SUPPORT_HISTORY_PREVIEW: SupportHistoryEntry = {
  agent: "CX Anita",
  timestamp: "45 days ago",
  description:
    "Customer called to check the claim status for their GMC Policy, for their mother's cataract operation",
}

export function CustomerProfileSidebar({
  customer,
  activePolicies,
  inactivePolicies,
  className,
  supportHistoryPreview = DEFAULT_SUPPORT_HISTORY_PREVIEW,
  supportHistoryEntries,
  activeClaim,
  emptyActivePoliciesMessage,
  showTabs = false,
  onViewPolicyDoc,
  activeCases,
}: CustomerProfileSidebarProps) {
  const [supportHistoryModalOpen, setSupportHistoryModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<"customer_details" | "support_history">("customer_details")

  const handleViewConversations = () => {
    setSupportHistoryModalOpen(true)
  }

  const handleCloseSupportHistory = () => {
    setSupportHistoryModalOpen(false)
  }

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
        "bg-white border-r border-[#e7e7f0] border-solid flex flex-col w-[298px] h-full",
        "shadow-[2px_0px_4px_rgba(0,0,0,0.09)]",
        className
      )}
    >
      {/* Tabs — Customer details / Support history (Figma UC6/UC7) */}
      {showTabs && (
        <div className="shrink-0 px-3 pt-4">
          <div className="flex h-[44px] items-center rounded-[10px] bg-[#fafafa] p-[3px]">
            <button
              type="button"
              onClick={() => setActiveTab("customer_details")}
              className={cn(
                "flex h-full flex-1 items-center justify-center rounded-[8px] font-euclid text-[12px] font-medium transition-colors",
                activeTab === "customer_details"
                  ? "bg-[#f3e8ff] text-[#8b5cf6]"
                  : "text-[#5b5675] hover:bg-[#f0f0f6]",
              )}
            >
              Customer details
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("support_history")}
              className={cn(
                "flex h-full flex-1 items-center justify-center rounded-[8px] font-euclid text-[12px] font-medium transition-colors",
                activeTab === "support_history"
                  ? "bg-[#f3e8ff] text-[#8b5cf6]"
                  : "text-[#5b5675] hover:bg-[#f0f0f6]",
              )}
            >
              Support history
            </button>
          </div>
        </div>
      )}

      {/* Support history tab content */}
      {showTabs && activeTab === "support_history" && (
        <div className="flex min-h-0 flex-1 flex-col gap-3 overflow-y-auto px-3 py-4">
          {/* Entry 1 — GMC mother cataract */}
          <div className="flex flex-col gap-2 rounded-xl border border-[#e7e7f0] bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-euclid text-[11px] text-[#9c9aaf]">CX Anita</span>
              <span className="font-euclid text-[11px] text-[#9c9aaf]">45 days ago</span>
            </div>
            <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
              Customer called to check claim status for their <span className="font-medium text-[#36354c]">GMC Policy</span> — mother's cataract operation reimbursement.
            </p>
            <div className="rounded-lg bg-[#f8f7fc] px-2.5 py-2">
              <p className="font-euclid text-[11px] font-semibold text-[#7c47e1]">💡 Conversation tip</p>
              <p className="mt-0.5 font-euclid text-[11px] leading-[16px] text-[#5b5675]">Ask the customer how their mother is doing.</p>
            </div>
          </div>
          {/* Entry 2 — Policy renewal */}
          <div className="flex flex-col gap-2 rounded-xl border border-[#e7e7f0] bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-euclid text-[11px] text-[#9c9aaf]">CX Rahul</span>
              <span className="font-euclid text-[11px] text-[#9c9aaf]">3 months ago</span>
            </div>
            <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
              Customer renewed their <span className="font-medium text-[#36354c]">Ecosport Titanium</span> motor policy. Asked about zero dep add-on.
            </p>
          </div>
          {/* Entry 3 */}
          <div className="flex flex-col gap-2 rounded-xl border border-[#e7e7f0] bg-white p-3">
            <div className="flex items-center justify-between gap-2">
              <span className="font-euclid text-[11px] text-[#9c9aaf]">CX Sneha</span>
              <span className="font-euclid text-[11px] text-[#9c9aaf]">6 months ago</span>
            </div>
            <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
              Customer requested bank account update on their <span className="font-medium text-[#36354c]">Corporate Health Plan</span> policy.
            </p>
          </div>
        </div>
      )}

      {/* Conditional Content - Show Modal or Sidebar (only when not on support history tab) */}
      {(!showTabs || activeTab === "customer_details") && supportHistoryModalOpen ? (
        <SupportHistoryModal
          isOpen={supportHistoryModalOpen}
          onClose={handleCloseSupportHistory}
          entries={supportHistoryEntries}
        />
      ) : (!showTabs || activeTab === "customer_details") ? (
        <div className="flex flex-col gap-4 items-start pb-14 pt-4 px-3 h-full overflow-y-auto">
          {/* Customer Details Section */}
          <div className="flex w-full shrink-0 flex-col gap-[12px] rounded-[12px] border border-[#e7e7f0] bg-white p-[16px]">
            {/* Section Header */}
            <div className="flex items-center gap-[8px] w-full">
              <div className="relative h-5 w-5 shrink-0 overflow-hidden">
                <img alt="" className="block h-full w-full max-w-none object-contain" src={profileIcon} />
              </div>
              <div className="font-euclid text-[12px] font-medium text-[#36354c]">CUSTOMER DETAILS</div>
            </div>
            {/* Content rows */}
            <div className="flex flex-col gap-[12px] w-full">
              <div className="flex items-center justify-between w-full">
                <div className="font-euclid text-[14px] text-[#5b5675] leading-[24px]">Name</div>
                <div className="font-euclid text-[14px] font-medium text-[#36354c] leading-[24px] text-right">{customer.name}</div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="font-euclid text-[14px] text-[#5b5675] leading-[24px]">Date of birth</div>
                <div className="font-euclid text-[14px] font-medium text-[#36354c] leading-[24px] text-right">{formatDateOfBirth(customer)}</div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="font-euclid text-[14px] text-[#5b5675] leading-[24px]">Preferred language</div>
                <div className="font-euclid text-[14px] font-medium text-[#36354c] leading-[24px] text-right">{customer.language}</div>
              </div>
              <div className="flex items-center justify-between w-full">
                <div className="font-euclid text-[14px] text-[#5b5675] leading-[24px]">Location</div>
                <div className="font-euclid text-[14px] font-medium text-[#36354c] leading-[24px] text-right">{formatLocation(customer)}</div>
              </div>
            </div>
          </div>

      {/* ACKO Relationship Section */}
      <div className="flex w-full flex-col gap-[12px] rounded-[12px] border border-[#e7e7f0] bg-white p-[16px]">
        {/* Section Header */}
        <div className="flex items-center gap-[8px] w-full">
          <div className="relative h-5 w-5 shrink-0 overflow-hidden">
            <img alt="" className="block h-full w-full max-w-none object-contain" src={relationshipIcon} />
          </div>
          <div className="font-euclid text-[12px] font-medium text-[#36354c]">ACKO RELATIONSHIP</div>
        </div>
        {/* Content rows */}
        <div className="flex flex-col gap-[12px] w-full">
          <div className="flex items-center justify-between w-full">
            <div className="font-euclid text-[14px] text-[#5b5675] leading-[24px]">Customer since</div>
            <div className="font-euclid text-[14px] font-medium text-[#36354c] leading-[24px] text-right">{formatTenure(customer)}</div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="font-euclid text-[14px] text-[#5b5675] leading-[24px]">KYC status</div>
            <div className="flex gap-[4px] items-center">
              <div className="relative h-4 w-4 shrink-0 overflow-hidden">
                <img alt="" className="block h-full w-full max-w-none object-contain" src={customer.kycStatus === "verified" ? checkIcon : pendingIcon} />
              </div>
              <div className={cn("font-euclid text-[14px] font-medium", kycStatusColor)}>{kycStatusText}</div>
            </div>
          </div>
          <div className="flex items-center justify-between w-full">
            <div className="font-euclid text-[14px] text-[#5b5675] leading-[24px]">App installed</div>
            <div className="flex gap-[4px] items-center">
              {customer.appStatus === "installed" && (
                <div className="relative h-4 w-4 shrink-0 overflow-hidden">
                  <img alt="" className="block h-full w-full max-w-none object-contain" src={checkIcon} />
                </div>
              )}
              <div className={cn("font-euclid text-[14px] font-medium", appStatusColor)}>{appStatusText}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Active Claim — claim-status flows (Figma 9367:22470 / 9367:22418) */}
      {activeClaim ? (
        <div
          className="flex w-full flex-col gap-[12px] rounded-[12px] border border-[#e7e7f0] bg-white p-[16px]"
          data-figma-ref="9367:22470"
        >
          <div className="flex items-center gap-[8px] w-full">
            <div className="relative h-5 w-5 shrink-0 overflow-hidden">
              <img alt="" className="block h-full w-full max-w-none object-contain" src={customerServiceIcon} />
            </div>
            <div className="font-euclid text-[12px] font-medium text-[#36354c]">ACTIVE CLAIM</div>
          </div>
          <div className="flex w-full flex-col gap-[12px]">
            <ActiveClaimItem claim={activeClaim} />
          </div>
        </div>
      ) : null}

      {/* Active Cases — UC1 Edit Policy (Figma 2:3061 / 2:3250) */}
      {activeCases && activeCases.length > 0 ? (
        <div className="flex w-full flex-col gap-[12px] rounded-[12px] border border-[#e7e7f0] bg-white p-[16px]">
          <div className="flex items-center gap-[8px] w-full">
            <div className="relative h-5 w-5 shrink-0 overflow-hidden">
              <img alt="" className="block h-full w-full max-w-none object-contain" src={customerServiceIcon} />
            </div>
            <span className="font-euclid text-[12px] font-medium text-[#36354c]">ACTIVE CASES</span>
            <span className="flex size-[18px] items-center justify-center rounded-full bg-[#7c47e1] font-euclid text-[12px] font-semibold leading-5 text-white">
              {activeCases.length}
            </span>
          </div>
          <div className="flex w-full flex-col gap-[12px]">
            {activeCases.map((item) => (
              <ActiveCaseItem key={item.subtitle} item={item} />
            ))}
          </div>
        </div>
      ) : null}

      {/* Support History Section — Figma node 9207:24144; hidden when showTabs is on (it moves to its own tab) */}
      {!showTabs && (
        <div className="flex w-full flex-col gap-[12px] rounded-[12px] border border-[#e7e7f0] bg-white p-[16px]">
          <div className="flex items-center gap-[8px] w-full">
            <div className="relative h-5 w-5 shrink-0 overflow-hidden">
              <img alt="" className="block h-full w-full max-w-none object-contain" src={customerServiceIcon} />
            </div>
            <div className="font-euclid text-[12px] font-medium text-[#36354c]">SUPPORT HISTORY</div>
          </div>
          <div className="flex flex-col gap-[12px] w-full">
            <div className="flex flex-col gap-1 w-full">
              <div className="font-euclid text-[12px] font-medium text-[#36354c] leading-5">
                {supportHistoryPreview.agent} • {supportHistoryPreview.timestamp}
              </div>
              <div className="font-euclid text-[14px] text-[#5b5675] leading-5">
                {supportHistoryPreview.description}
              </div>
            </div>
            <button
              onClick={handleViewConversations}
              className="font-euclid text-[12px] font-medium text-[#7c47e1] leading-5 hover:underline text-left"
            >
              View conversations
            </button>
          </div>
        </div>
      )}

      {/* Active Policies Section */}
      <div className="flex w-full flex-col gap-[12px] rounded-[12px] border border-[#e7e7f0] bg-white p-[16px]">
        {/* Section Header */}
        <div className="flex items-center gap-[8px] w-full">
          <div className="relative h-5 w-5 shrink-0 overflow-hidden">
            <img alt="" className="block h-full w-full max-w-none object-contain" src={profileIcon} />
          </div>
          <div className="font-euclid text-[12px] font-medium text-[#36354c]">ACTIVE POLICIES</div>
        </div>
        {/* Policy Items */}
        <div className="flex flex-col gap-[12px] w-full">
          {activePolicies.length > 0 ? (
            activePolicies.map((policy) => (
              <PolicyItem key={policy.id} policy={policy} onViewPolicyDoc={onViewPolicyDoc} />
            ))
          ) : (
            <div className="rounded-[8px] bg-[#f8f7fc] p-2 w-full">
              <div className="font-euclid text-[14px] text-[#5b5675] leading-5">
                {emptyActivePoliciesMessage ?? "No active policies"}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Inactive Policies Section */}
      {inactivePolicies.length > 0 && (
        <div className="flex w-full flex-col gap-[12px] rounded-[12px] border border-[#e7e7f0] bg-white p-[16px]">
          {/* Section Header */}
          <div className="flex items-center gap-[8px] w-full">
            <div className="relative h-5 w-5 shrink-0 overflow-hidden">
              <img alt="" className="block h-full w-full max-w-none object-contain" src={profileIcon} />
            </div>
            <div className="font-euclid text-[12px] font-medium text-[#36354c]">INACTIVE POLICIES</div>
          </div>
          {/* Inactive Policy Items */}
          <div className="flex flex-col gap-[12px] w-full">
            {inactivePolicies.map((inactivePolicy) => (
              <div key={inactivePolicy.id} className="flex items-start justify-between rounded-[8px] bg-[#f8f7fc] p-[8px] w-full cursor-pointer">
                <div className="flex gap-[4px] items-start">
                  <div className="flex items-center py-px">
                    <div className="relative h-5 w-5 shrink-0 overflow-hidden">
                      <img alt="" className="block h-full w-full max-w-none object-contain" src={carIcon} />
                    </div>
                  </div>
                  <div className="flex flex-col gap-[4px] items-start justify-center">
                    <div className="font-euclid text-[14px] font-medium text-[#36354c] leading-[20px]">
                      {inactivePolicy.productTitle}
                    </div>
                    <div className="font-euclid text-[12px] text-[#5b5675] leading-[18px]">
                      {inactivePolicy.policyNumber}
                    </div>
                  </div>
                </div>
                <div className="relative h-5 w-5 shrink-0 overflow-hidden flex items-center justify-center">
                  <ChevronDown className="h-4 w-4 text-[#5b5675]" />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      </div>
      ) : null}
    </div>
  )
}