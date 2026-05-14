import React, { useState, useEffect } from "react"
import { ArrowLeft, Check, Mail, MessageSquare, Smartphone, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer, Policy } from "@/types/crm"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"

interface AgenticIntent {
  documentType?: string
  policyFilter?: string // Policy name/vehicle to match
  channels?: string[] // Preferred channels
  phoneNumber?: string
  emailAddress?: string
  urgency?: "high" | "medium" | "low"
  customerName?: string
  extractedFrom?: string // The original natural language input
}

interface AgenticSendCommunicationProps {
  customer?: Customer
  customerPolicies?: Policy[]
  onBack: () => void
  onSent: (message: string) => void
  // Agentic pre-population from natural language
  agenticIntent?: AgenticIntent
}

const documentTypes = [
  { value: "policy-document", label: "Policy Document" },
  { value: "claim-form", label: "Claim Form" },
  { value: "payment-receipt", label: "Payment Receipt" },
  { value: "kyc-documents", label: "KYC Documents" },
]

const communicationChannels = [
  { id: "acko-alert", label: "ACKO Alert", description: "In-app notification", icon: Zap },
  { id: "text-message", label: "Text message", description: "SMS notification", icon: MessageSquare },
  { id: "whatsapp", label: "WhatsApp", description: "WhatsApp message", icon: MessageSquare },
  { id: "email", label: "Email", description: "Email notification", icon: Mail },
]

function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

// Natural language parsing helper
function parseAgenticIntent(intent: AgenticIntent, customerPolicies: Policy[]): {
  documentType: string
  policyId: string
  suggestedChannels: string[]
} {
  let documentType = ""
  let policyId = ""
  let suggestedChannels: string[] = []

  // Parse document type from natural language
  if (intent.documentType) {
    const docLower = intent.documentType.toLowerCase()
    if (docLower.includes("policy") || docLower.includes("document")) {
      documentType = "policy-document"
    } else if (docLower.includes("claim")) {
      documentType = "claim-form"
    } else if (docLower.includes("payment") || docLower.includes("receipt")) {
      documentType = "payment-receipt"
    } else if (docLower.includes("kyc")) {
      documentType = "kyc-documents"
    }
  }

  // Match policy based on vehicle/policy name
  if (intent.policyFilter && customerPolicies.length > 0) {
    const filterLower = intent.policyFilter.toLowerCase()
    const matchedPolicy = customerPolicies.find(policy => 
      policy.vehicle?.toLowerCase().includes(filterLower) ||
      policy.name?.toLowerCase().includes(filterLower) ||
      policy.policyNumber?.toLowerCase().includes(filterLower)
    )
    if (matchedPolicy) {
      policyId = matchedPolicy.id
    } else {
      // Default to first policy if no match
      policyId = customerPolicies[0].id
    }
  }

  // Suggest channels based on urgency and content
  if (intent.urgency === "high") {
    suggestedChannels = ["acko-alert", "text-message"]
  } else if (intent.urgency === "medium") {
    suggestedChannels = ["whatsapp", "email"]
  } else {
    suggestedChannels = ["email"]
  }

  // Override with explicitly requested channels
  if (intent.channels && intent.channels.length > 0) {
    suggestedChannels = intent.channels
  }

  return { documentType, policyId, suggestedChannels }
}

export function AgenticSendCommunication({ 
  customer, 
  customerPolicies = [], 
  onBack, 
  onSent,
  agenticIntent 
}: AgenticSendCommunicationProps) {
  const [selectedDocument, setSelectedDocument] = useState("")
  const [selectedPolicy, setSelectedPolicy] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isAgenticPrePopulated, setIsAgenticPrePopulated] = useState(false)
  
  // Editable contact details - initialize with customer data or agentic intent
  const [phoneNumber, setPhoneNumber] = useState("")
  const [emailAddress, setEmailAddress] = useState("")

  // Apply agentic pre-population when intent is provided
  useEffect(() => {
    if (agenticIntent && customerPolicies.length > 0) {
      const parsed = parseAgenticIntent(agenticIntent, customerPolicies)
      
      if (parsed.documentType) {
        setSelectedDocument(parsed.documentType)
      }
      if (parsed.policyId) {
        setSelectedPolicy(parsed.policyId)
      }
      if (parsed.suggestedChannels.length > 0) {
        setSelectedChannels(parsed.suggestedChannels)
      }
      
      // Use agentic contact details or fall back to customer
      setPhoneNumber(agenticIntent.phoneNumber || customer?.phone || "")
      setEmailAddress(agenticIntent.emailAddress || customer?.email || "")
      
      setIsAgenticPrePopulated(true)
    } else {
      // Standard customer data population
      setPhoneNumber(customer?.phone || "")
      setEmailAddress(customer?.email || "")
    }
  }, [agenticIntent, customer, customerPolicies])

  const policyOptions = customerPolicies.map(policy => ({
    value: policy.id,
    label: `${policy.vehicle || policy.name || 'Policy'} - ${policy.policyNumber}`
  }))

  const handleChannelToggle = (channelId: string) => {
    setSelectedChannels(prev => 
      prev.includes(channelId) 
        ? prev.filter(id => id !== channelId)
        : [...prev, channelId]
    )
  }

  const handleSend = async () => {
    if (!isFormValid) {
      return
    }

    setIsLoading(true)
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    setIsLoading(false)
    
    const channelDetails = selectedChannels.map(id => {
      const channel = communicationChannels.find(c => c.id === id)
      if (id === "text-message" || id === "whatsapp") {
        return `${channel?.label} (${phoneNumber})`
      }
      if (id === "email") {
        return `${channel?.label} (${emailAddress})`
      }
      return channel?.label || id
    }).join(", ")
    
    const agenticSuffix = isAgenticPrePopulated ? " (AI-assisted)" : ""
    onSent(`Communication sent successfully via ${channelDetails}${agenticSuffix}`)
  }

  // Validate form
  const isFormValid = selectedDocument && 
    selectedPolicy && 
    selectedChannels.length > 0 &&
    selectedChannels.every(channelId => {
      if (channelId === "text-message" || channelId === "whatsapp") {
        return phoneNumber.trim() !== ""
      }
      if (channelId === "email") {
        return emailAddress.trim() !== ""
      }
      return true
    })

  return (
    <div className="space-y-4">
      {/* Header with back button and AI indicator */}
      <div className="flex items-center gap-3">
        <Button
          variant="ghost"
          size="icon"
          onClick={onBack}
          className="h-8 w-8 shrink-0"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div className="flex-1">
          <h4 className="font-euclid text-sm font-semibold text-[#040222]">
            Send Communication
          </h4>
          {isAgenticPrePopulated && (
            <div className="flex items-center gap-1.5 mt-1">
              <div className="w-2 h-2 bg-[#0fa457] rounded-full animate-pulse"></div>
              <span className="text-xs text-[#0fa457] font-medium">
                AI pre-populated from: "{agenticIntent?.extractedFrom}"
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Section 1: Document Selection */}
      <div className={cn(
        "rounded-lg border transition-all duration-200",
        selectedDocument ? "border-[#7c47e1] bg-[#f8f7fc]" : "border-[#e7e7f0] bg-white"
      )}>
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              selectedDocument ? "bg-[#7c47e1] text-white" : "bg-[#e7e7f0] text-[#5b5675]"
            )}>
              {isAgenticPrePopulated && selectedDocument ? <Check className="w-3 h-3" /> : "1"}
            </div>
            <h5 className="font-euclid text-sm font-semibold text-[#040222]">
              Select document to send
            </h5>
            {isAgenticPrePopulated && selectedDocument && (
              <div className="text-xs text-[#0fa457] font-medium">✨ AI selected</div>
            )}
          </div>
          <Select
            options={documentTypes}
            value={selectedDocument}
            onValueChange={setSelectedDocument}
            placeholder="Choose document type"
          />
        </div>
      </div>

      {/* Section 2: Policy Selection */}
      <div className={cn(
        "rounded-lg border transition-all duration-200",
        !selectedDocument ? "border-[#e7e7f0] bg-[#fafafa] opacity-60" :
        selectedPolicy ? "border-[#7c47e1] bg-[#f8f7fc]" : "border-[#e7e7f0] bg-white"
      )}>
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              !selectedDocument ? "bg-[#e7e7f0] text-[#9c9aaf]" :
              selectedPolicy ? "bg-[#7c47e1] text-white" : "bg-[#e7e7f0] text-[#5b5675]"
            )}>
              {isAgenticPrePopulated && selectedPolicy ? <Check className="w-3 h-3" /> : "2"}
            </div>
            <h5 className={cn(
              "font-euclid text-sm font-semibold",
              !selectedDocument ? "text-[#9c9aaf]" : "text-[#040222]"
            )}>
              Select policy
            </h5>
            {isAgenticPrePopulated && selectedPolicy && (
              <div className="text-xs text-[#0fa457] font-medium">✨ AI matched</div>
            )}
          </div>
          {selectedDocument && (
            <Select
              options={policyOptions}
              value={selectedPolicy}
              onValueChange={setSelectedPolicy}
              placeholder="Select policy"
            />
          )}
        </div>
      </div>

      {/* Section 3: Channel Selection */}
      <div className={cn(
        "rounded-lg border transition-all duration-200",
        !selectedPolicy ? "border-[#e7e7f0] bg-[#fafafa] opacity-60" :
        selectedChannels.length > 0 ? "border-[#7c47e1] bg-[#f8f7fc]" : "border-[#e7e7f0] bg-white"
      )}>
        <div className="p-3 space-y-3">
          <div className="flex items-center gap-2">
            <div className={cn(
              "flex h-6 w-6 shrink-0 items-center justify-center rounded-full text-xs font-semibold",
              !selectedPolicy ? "bg-[#e7e7f0] text-[#9c9aaf]" :
              selectedChannels.length > 0 ? "bg-[#7c47e1] text-white" : "bg-[#e7e7f0] text-[#5b5675]"
            )}>
              {isAgenticPrePopulated && selectedChannels.length > 0 ? <Check className="w-3 h-3" /> : "3"}
            </div>
            <h5 className={cn(
              "font-euclid text-sm font-semibold",
              !selectedPolicy ? "text-[#9c9aaf]" : "text-[#040222]"
            )}>
              Choose communication channels
            </h5>
            {isAgenticPrePopulated && selectedChannels.length > 0 && (
              <div className="text-xs text-[#0fa457] font-medium">✨ AI suggested</div>
            )}
          </div>
          
          {selectedPolicy && (
            <div className="space-y-2">
              {communicationChannels.map((channel) => {
                const IconComponent = channel.id === "whatsapp" ? WhatsAppIcon : channel.icon
                const isSelected = selectedChannels.includes(channel.id)
                const requiresPhone = channel.id === "text-message" || channel.id === "whatsapp"
                const requiresEmail = channel.id === "email"
                
                return (
                  <div key={channel.id} className="space-y-2">
                    <button
                      type="button"
                      onClick={() => handleChannelToggle(channel.id)}
                      className={cn(
                        "flex items-center gap-3 w-full p-3 rounded-lg border transition-all duration-200",
                        isSelected
                          ? "border-[#7c47e1] bg-[#f8f7fc]"
                          : "border-[#e7e7f0] bg-white hover:bg-[#fafafa]"
                      )}
                    >
                      <div className={cn(
                        "flex h-5 w-5 shrink-0 items-center justify-center rounded-sm border-2 transition-colors",
                        isSelected
                          ? "border-[#7c47e1] bg-[#7c47e1]"
                          : "border-[#e7e7f0]"
                      )}>
                        {isSelected && (
                          <Check className="h-3 w-3 text-white" strokeWidth={2.5} />
                        )}
                      </div>
                      <IconComponent className="h-4 w-4 text-[#5b5675]" />
                      <div className="flex-1 text-left">
                        <div className="font-euclid text-sm font-medium text-[#040222]">
                          {channel.label}
                        </div>
                        <div className="font-euclid text-xs text-[#5b5675]">
                          {channel.description}
                        </div>
                      </div>
                    </button>
                    
                    {/* Contact detail input when channel is selected */}
                    {isSelected && (
                      <div className="ml-8 p-3 bg-white rounded-lg border border-[#e7e7f0]">
                        {requiresPhone && (
                          <div className="space-y-2">
                            <label className="block font-euclid text-xs font-medium text-[#5b5675]">
                              Phone number:
                            </label>
                            <input
                              type="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="w-full px-3 py-2 border border-[#e7e7f0] rounded-md font-euclid text-sm focus:outline-none focus:ring-1 focus:ring-[#7c47e1] focus:border-[#7c47e1]"
                              placeholder="Enter phone number"
                            />
                          </div>
                        )}
                        {requiresEmail && (
                          <div className="space-y-2">
                            <label className="block font-euclid text-xs font-medium text-[#5b5675]">
                              Email address:
                            </label>
                            <input
                              type="email"
                              value={emailAddress}
                              onChange={(e) => setEmailAddress(e.target.value)}
                              className="w-full px-3 py-2 border border-[#e7e7f0] rounded-md font-euclid text-sm focus:outline-none focus:ring-1 focus:ring-[#7c47e1] focus:border-[#7c47e1]"
                              placeholder="Enter email address"
                            />
                          </div>
                        )}
                        {channel.id === "acko-alert" && (
                          <div className="flex items-center gap-2 text-xs text-[#5b5675]">
                            <Zap className="h-3 w-3" />
                            <span className="font-euclid">Will be sent via in-app notification</span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Send Button */}
      {isFormValid && (
        <Button
          onClick={handleSend}
          disabled={isLoading}
          className={cn(
            "w-full bg-[#0fa457] hover:bg-[#0d8a4a] text-white font-euclid text-sm font-semibold",
            isLoading && "opacity-50 cursor-not-allowed"
          )}
        >
          {isLoading ? "Sending..." : isAgenticPrePopulated ? "Send (AI-assisted)" : "Send"}
        </Button>
      )}
    </div>
  )
}