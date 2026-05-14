import React, { useState } from "react"
import { ArrowLeft, Phone, Mail, Bot, Filter, User, FileText, ChevronDown, CheckCheck, Check, X, Clock, PhoneOff, MessageSquare } from "lucide-react"
import { cn } from "@/lib/utils"

interface Customer {
  id: string
  name: string
  phone: string
  email: string
}

interface Policy {
  id: string
  number: string
  type: string
  vehicleMake?: string
  vehicleModel?: string
  vehicleNumber?: string
}

interface CommunicationEntry {
  id: string
  timestamp: string
  date: string
  time: string
  channel: "call" | "email" | "whatsapp" | "bot"
  agentName?: string
  agentId?: string
  subject: string
  summary: string[]
  policyContext?: {
    policyNumber: string
    vehicle: string
  }
  status: string
  duration?: string
  deliveryStatus: "answered" | "not-answered" | "replied" | "delivered" | "failed" | "callback-requested"
  caseId?: string
  caseTitle?: string
  caseType?: "claim" | "renewal" | "policy-update" | "health-claim" | "general-support"
  tags?: string[]
}

interface ActiveCase {
  id: string
  title: string
  type: "claim" | "renewal" | "policy-update" | "health-claim" | "general-support"
  policyNumber?: string
  vehicle?: string
  status: "active" | "pending"
  lastActivity: string
}

interface CommunicationHistoryPanelProps {
  customer?: Customer
  customerPolicies?: Policy[]
  onBack: () => void
}

// WhatsApp icon component
const WhatsAppIcon = ({ className }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor">
    <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.51 3.516z"/>
  </svg>
)

// Active/ongoing cases for filtering
const mockActiveCases: ActiveCase[] = [
  {
    id: "case_nexon_claim_2026",
    title: "Tata Nexon Accident Claim",
    type: "claim",
    policyNumber: "DBCR10468610009/02",
    vehicle: "Tata Nexon",
    status: "active",
    lastActivity: "14 May 2026"
  },
  {
    id: "case_activa_renewal_2026", 
    title: "Honda Activa Renewal",
    type: "renewal",
    policyNumber: "ACCR10468614939/02",
    vehicle: "Honda Activa",
    status: "pending",
    lastActivity: "10 May 2026"
  }
]

// Mock communication history - chronological
const mockCommunicationHistory: CommunicationEntry[] = [
  {
    id: "comm_001",
    timestamp: "2026-05-14T15:30:00Z",
    date: "14 May 2026",
    time: "3:30 PM",
    channel: "call",
    agentName: "Priya Sharma",
    agentId: "AG001",
    subject: "Tata Nexon Claim Status Follow-up",
    summary: [
      "Rajesh inquired about pending Tata Nexon claim status and garage selection",
      "Explained current claim stage - awaiting garage drop-off selection from customer",
      "Guided customer through ACKO app to view preferred garage options", 
      "Discussed repair timeline and expected completion dates",
      "Customer confirmed he will select garage by tomorrow via app",
      "Scheduled follow-up call for Thursday if garage not selected"
    ],
    policyContext: {
      policyNumber: "DBCR10468610009/02",
      vehicle: "Tata Nexon"
    },
    status: "callback-requested",
    duration: "12 min 15 sec",
    deliveryStatus: "answered",
    caseId: "case_nexon_claim_2026",
    caseTitle: "Tata Nexon Accident Claim",
    caseType: "claim",
    tags: ["claim-status", "garage-selection", "follow-up", "app-guidance"]
  },
  {
    id: "comm_002", 
    timestamp: "2026-05-12T11:45:00Z",
    date: "12 May 2026",
    time: "11:45 AM",
    channel: "whatsapp",
    agentName: "Rohit Kumar",
    agentId: "AG002",
    subject: "Health Insurance Claim Documents Submitted",
    summary: [
      "Rajesh submitted health claim documents for spouse Neha Kapoor treatment",
      "Customer sent hospital discharge summary at 11:50 AM - document received",
      "Customer sent medical bills and prescriptions at 11:55 AM - all documents verified",
      "Customer sent diagnostic reports at 12:02 PM - quality approved",
      "All required documents collected for health insurance claim processing",
      "Informed customer about 7-day claim processing timeline"
    ],
    policyContext: {
      policyNumber: "ACK-HL-2024-88421", 
      vehicle: "ACKO Health Plan"
    },
    status: "completed",
    deliveryStatus: "replied",
    caseId: "case_health_claim_2026",
    caseTitle: "Health Insurance Claim - Neha Kapoor Treatment",
    caseType: "health-claim",
    tags: ["health-claim", "document-submission", "spouse-treatment", "completed"]
  },
  {
    id: "comm_003",
    timestamp: "2026-05-10T14:22:00Z", 
    date: "10 May 2026",
    time: "2:22 PM",
    channel: "email",
    agentName: "Sneha Patel",
    agentId: "AG003",
    subject: "Honda Activa Policy Renewal Reminder",
    summary: [
      "Sent Honda Activa third-party policy renewal reminder - expiring 28 May 2026",
      "Highlighted option to upgrade to comprehensive coverage with add-ons",
      "Provided renewal quote comparison and premium calculator link",
      "Customer responded showing interest in comprehensive upgrade",
      "Scheduled presales callback to discuss coverage options and pricing"
    ],
    policyContext: {
      policyNumber: "ACCR10468614939/02",
      vehicle: "Honda Activa" 
    },
    status: "completed",
    deliveryStatus: "replied",
    caseId: "case_activa_renewal_2026",
    caseTitle: "Honda Activa Renewal",
    caseType: "renewal",
    tags: ["renewal-reminder", "activa", "upgrade-interest", "presales"]
  },
  {
    id: "comm_004a",
    timestamp: "2026-05-08T16:30:00Z",
    date: "8 May 2026",
    time: "4:30 PM", 
    channel: "whatsapp",
    agentName: "Kavya Reddy",
    agentId: "AG005",
    subject: "Tata Nexon Accident Photos & FIR Submission",
    summary: [
      "Rajesh submitted accident-related documents for Tata Nexon claim",
      "Customer sent vehicle damage photos at 4:35 PM - 6 clear images received",
      "Customer sent police FIR copy at 4:42 PM - document quality verified",
      "Customer sent driving license copy at 4:45 PM - validity confirmed",
      "All claim registration documents successfully collected",
      "Claim registered in system - provided claim number for future reference"
    ],
    policyContext: {
      policyNumber: "DBCR10468610009/02",
      vehicle: "Tata Nexon"
    },
    status: "completed",
    deliveryStatus: "replied",
    caseId: "case_nexon_claim_2026",
    caseTitle: "Tata Nexon Accident Claim",
    caseType: "claim",
    tags: ["accident-claim", "photos-received", "fir-submitted", "claim-registered"]
  },
  {
    id: "comm_005",
    timestamp: "2026-05-07T10:10:00Z",
    date: "7 May 2026",
    time: "10:10 AM", 
    channel: "bot",
    subject: "Health Premium Payment Confirmation",
    summary: [
      "ACKO Bot confirmed successful premium payment for Health Plan renewal",
      "Payment of ₹8,500 processed successfully for policy ACK-HL-2024-88421",
      "Updated policy period: 25 Nov 2026 - 24 Nov 2027",
      "Digital policy certificate generated and sent to registered email",
      "Reminder set for next year's renewal 60 days before expiry"
    ],
    policyContext: {
      policyNumber: "ACK-HL-2024-88421",
      vehicle: "ACKO Health Plan"
    },
    status: "completed",
    deliveryStatus: "delivered",
    caseId: "case_health_claim_2026",
    caseTitle: "Health Insurance Claim - Neha Kapoor Treatment", 
    caseType: "health-claim",
    tags: ["payment-confirmation", "health-renewal", "policy-updated", "automated"]
  },
  {
    id: "comm_006",
    timestamp: "2026-05-05T14:15:00Z",
    date: "5 May 2026",
    time: "2:15 PM",
    channel: "whatsapp",
    agentName: "Arjun Singh",
    agentId: "AG004",
    subject: "Address Update Request for All Policies",
    summary: [
      "Rajesh requested address update across all three active policies",
      "Customer sent new address proof at 2:22 PM - utility bill received and verified", 
      "Customer sent updated Aadhaar card at 2:28 PM - address matched successfully",
      "Address updated for Tata Nexon, Honda Activa, and Health Plan policies",
      "All policy documents regenerated with new address details",
      "Confirmed updated address reflects in ACKO app and online account"
    ],
    policyContext: {
      policyNumber: "All Policies",
      vehicle: "Multiple Vehicles"
    },
    status: "completed",
    deliveryStatus: "replied",
    caseId: "case_address_update_2026",
    caseTitle: "Multi-Policy Address Update Request",
    caseType: "policy-update",
    tags: ["address-update", "multiple-policies", "documents-verified", "account-updated"]
  },
  {
    id: "comm_007",
    timestamp: "2026-04-28T11:30:00Z",
    date: "28 Apr 2026",
    time: "11:30 AM",
    channel: "call",
    agentName: "Neha Kapoor", 
    agentId: "AG006",
    subject: "Welcome Call - Long-term Customer Appreciation",
    summary: [
      "Annual appreciation call for Rajesh - 4 years with ACKO milestone",
      "Reviewed current policy portfolio and coverage adequacy",
      "Discussed upcoming renewals and potential coverage enhancements",
      "Explained new digital features and claim management improvements",
      "Customer appreciated proactive service and expressed loyalty to ACKO",
      "Provided priority support contact for any future assistance"
    ],
    policyContext: {
      policyNumber: "All Policies",
      vehicle: "Portfolio Review"
    },
    status: "completed",
    duration: "18 min 45 sec",
    deliveryStatus: "answered",
    caseId: "case_appreciation_2026",
    caseTitle: "Customer Loyalty & Portfolio Review",
    caseType: "general-support",
    tags: ["customer-appreciation", "4-year-milestone", "portfolio-review", "loyalty"]
  },
  {
    id: "comm_008",
    timestamp: "2026-04-25T16:45:00Z",
    date: "25 Apr 2026",
    time: "4:45 PM",
    channel: "call",
    agentName: "Amit Singh",
    agentId: "AG007",
    subject: "Follow-up Call - Missed Appointment",
    summary: [
      "Attempted follow-up call regarding missed garage appointment",
      "Customer did not answer the call - tried 3 times",
      "Left voicemail with callback instructions and garage contact details",
      "Scheduled automatic retry for next business day"
    ],
    policyContext: {
      policyNumber: "DBCR10468610009/02",
      vehicle: "Tata Nexon"
    },
    status: "callback-requested",
    duration: "0 min (not answered)",
    deliveryStatus: "not-answered",
    caseId: "case_nexon_claim_2026",
    caseTitle: "Tata Nexon Accident Claim",
    caseType: "claim",
    tags: ["missed-call", "garage-appointment", "voicemail", "follow-up"]
  },
  {
    id: "comm_009",
    timestamp: "2026-04-22T10:20:00Z",
    date: "22 Apr 2026",
    time: "10:20 AM",
    channel: "email",
    agentName: "Kavya Reddy",
    agentId: "AG005",
    subject: "Policy Document Delivery Confirmation",
    summary: [
      "Sent digital policy certificate via email for Tata Nexon renewal",
      "Email delivered successfully to registered email address",
      "Customer has not yet opened the email - tracking shows unread status",
      "Follow-up communication scheduled if not read within 48 hours"
    ],
    policyContext: {
      policyNumber: "DBCR10468610009/02",
      vehicle: "Tata Nexon"
    },
    status: "in-progress",
    deliveryStatus: "delivered",
    caseId: "case_nexon_claim_2026",
    caseTitle: "Tata Nexon Accident Claim",
    caseType: "claim",
    tags: ["policy-document", "email-delivery", "unread", "tracking"]
  },
  {
    id: "comm_010",
    timestamp: "2026-04-20T14:30:00Z",
    date: "20 Apr 2026",
    time: "2:30 PM",
    channel: "whatsapp",
    agentName: "Rohit Kumar",
    agentId: "AG002",
    subject: "Premium Due Reminder - Delivery Failed",
    summary: [
      "Attempted to send premium due reminder via WhatsApp",
      "Message failed to deliver - customer number appears to be inactive",
      "Error: 'Phone number not reachable' from WhatsApp Business API",
      "Switched to email delivery method as backup communication channel"
    ],
    policyContext: {
      policyNumber: "ACCR10468614939/02",
      vehicle: "Honda Activa"
    },
    status: "escalated",
    deliveryStatus: "failed",
    caseId: "case_activa_renewal_2026",
    caseTitle: "Honda Activa Renewal",
    caseType: "renewal",
    tags: ["premium-reminder", "delivery-failed", "backup-channel", "phone-issue"]
  }
]

export function CommunicationHistoryPanel({ customer, customerPolicies = [], onBack }: CommunicationHistoryPanelProps) {
  const [selectedFilter, setSelectedFilter] = useState<"all" | "call" | "email" | "whatsapp" | "bot" | string>("all")
  const [expandedSummaries, setExpandedSummaries] = useState<Set<string>>(new Set())
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)

  // Channel filter options
  const channelFilterOptions = [
    { id: "all", label: "All Communications", icon: Filter },
    { id: "call", label: "Calls", icon: Phone },
    { id: "email", label: "Email", icon: Mail },
    { id: "whatsapp", label: "WhatsApp", icon: MessageSquare }
  ]

  // Case filter options (only active/pending cases) - for Advanced Filters
  const caseFilterOptions = mockActiveCases.map(activeCase => ({
    id: activeCase.id,
    label: activeCase.title,
    icon: FileText,
    type: "case"
  }))

  const filteredHistory = mockCommunicationHistory
    .filter(entry => {
      // If filtering by case
      if (caseFilterOptions.some(option => option.id === selectedFilter)) {
        return entry.caseId === selectedFilter
      }
      // If filtering by channel
      if (selectedFilter === "all") return true
      return entry.channel === selectedFilter
    })
    .sort((a, b) => {
      const dateA = new Date(a.timestamp).getTime()
      const dateB = new Date(b.timestamp).getTime()
      return dateB - dateA // Always newest first
    })

  const toggleExpandedSummary = (entryId: string) => {
    const newExpanded = new Set(expandedSummaries)
    if (newExpanded.has(entryId)) {
      newExpanded.delete(entryId)
    } else {
      newExpanded.add(entryId)
    }
    setExpandedSummaries(newExpanded)
  }

  // Channel configuration
  const channelConfig = {
    call: {
      icon: Phone,
      label: "Call",
      bgColor: "bg-blue-50",
      color: "text-blue-600"
    },
    email: {
      icon: Mail,
      label: "Email",
      bgColor: "bg-green-50", 
      color: "text-green-600"
    },
    whatsapp: {
      icon: WhatsAppIcon,
      label: "WhatsApp",
      bgColor: "bg-green-50",
      color: "text-green-600"
    },
    bot: {
      icon: Bot,
      label: "ACKO Bot",
      bgColor: "bg-purple-50",
      color: "text-purple-600"
    }
  }

  // Delivery status configuration
  const deliveryStatusConfig = {
    answered: { icon: Phone, label: "Answered", color: "text-green-600" },
    "not-answered": { icon: PhoneOff, label: "Not answered", color: "text-red-500" },
    replied: { icon: Check, label: "Replied", color: "text-green-600" },
    delivered: { icon: CheckCheck, label: "Delivered", color: "text-green-600" },
    failed: { icon: X, label: "Failed", color: "text-red-500" },
    "callback-requested": { icon: Clock, label: "Callback requested", color: "text-orange-500" }
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <button
            onClick={onBack}
            className="flex items-center justify-center w-8 h-8 rounded-lg border border-[#e7e7f0] bg-white hover:bg-[#fafafa] transition-colors"
          >
            <ArrowLeft className="w-4 h-4 text-[#5b5675]" />
          </button>
          <div>
            <h3 className="font-euclid text-lg font-semibold text-[#040222]">Communication History</h3>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-3 mb-4">
        {/* Main Channel Filters with Advanced Filters Toggle */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex gap-1 overflow-x-auto">
            {channelFilterOptions.map((option) => {
              const isActive = selectedFilter === option.id
              const IconComponent = option.id === "whatsapp" ? WhatsAppIcon : option.icon
              
              return (
                <button
                  key={option.id}
                  onClick={() => setSelectedFilter(option.id)}
                  className={cn(
                    "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                    isActive 
                      ? "bg-[#7c47e1] text-white" 
                      : "bg-[#f8f7fc] text-[#5b5675] hover:bg-[#f0f0f6]"
                  )}
                >
                  <IconComponent className="h-3 w-3" />
                  <span>{option.label}</span>
                </button>
              )
            })}
          </div>

          {/* Advanced Filters Toggle */}
          <button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className="flex items-center gap-2 text-xs font-medium text-[#5b5675] hover:text-[#040222] transition-colors shrink-0"
          >
            <span>Advanced filters</span>
            <ChevronDown className={cn(
              "h-3 w-3 transition-transform duration-200",
              showAdvancedFilters && "rotate-180"
            )} />
          </button>
        </div>

        {/* Advanced Filters Content */}
        {showAdvancedFilters && (
          <div className="border-t border-[#e7e7f0] pt-3 space-y-2">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs font-medium text-[#040222]">Active JTBDs:</span>
            </div>
            <div className="flex gap-1 overflow-x-auto">
              {caseFilterOptions.map((option) => {
                const isActive = selectedFilter === option.id
                
                return (
                  <button
                    key={option.id}
                    onClick={() => setSelectedFilter(option.id)}
                    className={cn(
                      "flex items-center gap-1.5 px-2 py-1.5 rounded-md text-xs font-medium transition-colors whitespace-nowrap",
                      isActive 
                        ? "bg-[#7c47e1] text-white" 
                        : "bg-[#f8f7fc] text-[#5b5675] hover:bg-[#f0f0f6]"
                    )}
                  >
                    <FileText className="h-3 w-3" />
                    <span>{option.label}</span>
                  </button>
                )
              })}
            </div>
          </div>
        )}
      </div>

      {/* Communications Timeline */}
      <div className="space-y-3">
        {filteredHistory.map((entry, index) => {
          const channelInfo = channelConfig[entry.channel]
          const isFullSummaryExpanded = expandedSummaries.has(entry.id)
          const IconComponent = entry.channel === "whatsapp" ? WhatsAppIcon : channelInfo.icon
          const summaryToShow = isFullSummaryExpanded ? entry.summary : entry.summary.slice(0, 2)

          return (
            <div
              key={entry.id}
              className="border border-[#e7e7f0] rounded-lg bg-white"
            >
              {/* Main Entry */}
              <div className="p-3">
                <div className="flex items-start gap-3">
                  {/* Timeline dot */}
                  <div className="relative">
                    <div className={cn(
                      "flex h-8 w-8 shrink-0 items-center justify-center rounded-full",
                      channelInfo.bgColor
                    )}>
                      <IconComponent className={cn("h-4 w-4", channelInfo.color)} />
                    </div>
                    {index < filteredHistory.length - 1 && (
                      <div className="absolute left-4 top-8 w-0.5 h-6 bg-[#e7e7f0]" />
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    {/* Header with Date and Agent */}
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div className="flex-1 min-w-0">
                        {/* Date & Time */}
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-euclid text-xs font-medium text-[#040222]">
                            {entry.date}
                          </span>
                          <span className="font-euclid text-xs text-[#5b5675]">
                            At {entry.time}
                          </span>
                          
                          {/* Delivery Status - Only for calls */}
                          {entry.deliveryStatus && entry.channel === "call" && (
                            <>
                              <span className="text-[#e7e7f0]">•</span>
                              {(() => {
                                const statusInfo = deliveryStatusConfig[entry.deliveryStatus]
                                const StatusIcon = statusInfo.icon
                                return (
                                  <div className="flex items-center gap-1">
                                    <StatusIcon className={cn("h-3 w-3", statusInfo.color)} />
                                    <span className={cn("font-euclid text-xs font-medium", statusInfo.color)}>
                                      {statusInfo.label}
                                    </span>
                                  </div>
                                )
                              })()}
                            </>
                          )}
                        </div>

                        {/* Subject */}
                        <h5 className="font-euclid text-sm font-semibold text-[#040222]">
                          {entry.subject || `${channelInfo.label} Communication`}
                        </h5>

                        {/* Duration */}
                        {entry.duration && (
                          <div className="mt-1">
                            <span className="font-euclid text-xs text-[#5b5675]">
                              Duration: {entry.duration}
                            </span>
                          </div>
                        )}
                      </div>

                      {/* Agent Name (replacing chevron) */}
                      {entry.agentName && (
                        <div className="flex items-center gap-1 shrink-0">
                          <User className="h-3 w-3 text-[#5b5675]" />
                          <span className="font-euclid text-xs text-[#5b5675]">
                            {entry.agentName}
                          </span>
                        </div>
                      )}
                    </div>


                    {/* Conversation Summary */}
                    <div className="space-y-2 mt-2">
                      <ul className="space-y-1">
                        {summaryToShow.map((point, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <div className="w-1 h-1 bg-[#5b5675] rounded-full mt-2 shrink-0" />
                            <p className="font-euclid text-xs text-[#5b5675] leading-relaxed">
                              {point}
                            </p>
                          </li>
                        ))}
                      </ul>

                      {/* Expand Summary Button */}
                      {entry.summary.length > 2 && (
                        <button
                          onClick={() => toggleExpandedSummary(entry.id)}
                          className="flex items-center gap-1 text-xs text-[#7c47e1] hover:text-[#6a3cc7] font-medium transition-colors mt-2"
                        >
                          {isFullSummaryExpanded ? "Show less" : `View ${entry.summary.length - 2} more details`}
                          <ChevronDown className={cn(
                            "h-3 w-3 transition-transform duration-200",
                            isFullSummaryExpanded && "rotate-180"
                          )} />
                        </button>
                      )}
                    </div>

                    {/* Tags */}
                    {entry.tags && entry.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap mt-3">
                        <span className="font-euclid text-xs font-medium text-[#5b5675]">Tags:</span>
                        {entry.tags.map((tag, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 bg-[#e7e7f0] text-[#5b5675] rounded-md text-xs font-medium"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {/* Empty State */}
      {filteredHistory.length === 0 && (
        <div className="text-center py-8">
          <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
            <MessageSquare className="w-6 h-6 text-[#5b5675]" />
          </div>
          <p className="font-euclid text-sm text-[#5b5675]">
            No communications found for the selected filter
          </p>
        </div>
      )}
    </div>
  )
}