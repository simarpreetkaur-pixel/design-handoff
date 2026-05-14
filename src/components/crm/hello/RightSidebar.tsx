import React, { useRef, useState, useCallback, useEffect } from "react"
import { Zap, Sparkles, ArrowLeft, Check, Mail, MessageSquare, Smartphone, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer, Policy, EndorsementEditKind, InactivePolicy } from "@/types/crm"
import { RaiseClaimWorkflowPanel } from "@/components/crm/hello/RaiseClaimWorkflowPanel"
import { EditPolicyWorkflowPanel } from "@/components/crm/hello/EditPolicyWorkflowPanel"
import { PolicyDetailPanel } from "@/components/crm/ActivePoliciesPanel"
import { Button } from "@/components/ui/button"
import { Select } from "@/components/ui/select"
import { useToasts, ToastContainer } from "@/components/ui/toast"
import { CommunicationHistoryPanel } from "@/components/crm/hello/CommunicationHistoryPanel"
import { PaymentHistoryPanel } from "@/components/crm/hello/PaymentHistoryPanel"
import { KycVerificationLogs } from "@/components/crm/hello/KycVerificationLogs"
import { AgenticSendCommunication } from "@/components/crm/hello/AgenticSendCommunication"
import type { AgenticIntent } from "@/lib/agenticIntentParser"

/**
 * AI Actions Tab System
 * 
 * The AI Actions section now uses a tabbed interface where each workflow
 * opens as a new tab that can be switched between and closed individually.
 * This prevents losing work and allows multiple AI workflows to be open simultaneously.
 * 
 * Supported tab types:
 * - agentic_send_communication: AI-assisted communication workflows
 * - raise_claim_workflow: Claim raising workflows  
 * - edit_policy_workflow: Policy editing workflows
 * - policy_detail: Policy detail views
 * - self_serve_steps: Customer self-service step guides
 */
interface AIActionTab {
  id: string
  title: string
  type: "agentic_send_communication" | "raise_claim_workflow" | "edit_policy_workflow" | "policy_detail" | "self_serve_steps"
  data?: any // Specific data for each tab type
  isActive: boolean
}

interface RightSidebarProps {
  isCollapsed: boolean
  isOpen: boolean
  onToggle: () => void
  activeSection?: "manual-actions" | "ai" | null
  onSectionChange?: (section: "manual-actions" | "ai" | null) => void
  className?: string
  // Width adjustment props
  width?: number
  onWidthChange?: (width: number) => void
  // Workflow-related props
  workflowActive?: boolean
  editPolicyWorkflow?: { policy: Policy; editKind: EndorsementEditKind } | null
  customer?: Customer
  displayPhone?: string
  claimWorkflowPolicy?: Policy | null
  isCompletedWorkflow?: boolean
  selfServeStepsActive?: boolean
  selfServeStepsType?: "raise_claim" | "edit_policy" | null
  policyDetailForPane?: Policy | null
  // Callbacks for workflow actions
  onWorkflowClose?: () => void
  onEditPolicyWorkflowClose?: () => void
  onSelfServeStepsClose?: () => void
  onPolicyDetailClose?: () => void
  onRcEmailSent?: () => void
  onFnolComplete?: () => void
  onEditPolicyWorkflowComplete?: () => void
  onCTAPressed?: (action: string, policy: Policy) => void
  onRCPageEmailSent?: () => void
  policyDetailSubview?: "detail" | "endorsements"
  onPolicyDetailViewChange?: (view: "detail" | "endorsements") => void
  // Customer policies for send communication
  customerPolicies?: Policy[]
  // Agentic workflow props
  agenticIntent?: AgenticIntent | null
  onAgenticIntentProcessed?: () => void
}

const manualActionsItems = [
  { id: "send-communication", label: "Send communication", description: "Send message to customer" },
  { id: "kyc-verification", label: "KYC verification logs", description: "View verification history" },
  { id: "communication-history", label: "Communication history", description: "View past interactions" },
  { id: "payment-history", label: "Payment history", description: "View payment records" },
  { id: "firefly", label: "Firefly", description: "AI-powered automation" },
  { id: "garage-locator", label: "Garage Locator", description: "Find nearby garages" },
]

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
    <svg
      className={className}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.435 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
    </svg>
  )
}

interface SendCommunicationProps {
  customer?: Customer
  customerPolicies?: Policy[]
  onBack: () => void
  onSent: (message: string) => void
}

function SendCommunication({ customer, customerPolicies = [], onBack, onSent }: SendCommunicationProps) {
  const [selectedDocument, setSelectedDocument] = useState("")
  const [selectedPolicy, setSelectedPolicy] = useState("")
  const [selectedChannels, setSelectedChannels] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(false)
  
  // Editable contact details - initialize with customer data
  const [phoneNumber, setPhoneNumber] = useState(customer?.phone || "")
  const [emailAddress, setEmailAddress] = useState(customer?.email || "")
  
  // Update contact details when customer changes
  useEffect(() => {
    setPhoneNumber(customer?.phone || "")
    setEmailAddress(customer?.email || "")
  }, [customer])

  const policyOptions = customerPolicies.map(policy => ({
    value: policy.id,
    label: `${policy.vehicle || policy.name || 'Policy'} - ${policy.number}`
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
    
    onSent(`Communication sent successfully via ${channelDetails}`)
  }

  // Validate form - check if all required fields are filled
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
      return true // ACKO Alert doesn't need additional contact info
    })

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
        <h4 className="font-euclid text-sm font-semibold text-[#040222]">
          Send Communication
        </h4>
      </div>

      {/* Section 1: Document Selection - Always expanded */}
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
              1
            </div>
            <h5 className="font-euclid text-sm font-semibold text-[#040222]">
              Select document to send
            </h5>
          </div>
          <Select
            options={documentTypes}
            value={selectedDocument}
            onValueChange={setSelectedDocument}
            placeholder="Choose document type"
          />
        </div>
      </div>

      {/* Section 2: Policy Selection - Expands when document is selected */}
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
              2
            </div>
            <h5 className={cn(
              "font-euclid text-sm font-semibold",
              !selectedDocument ? "text-[#9c9aaf]" : "text-[#040222]"
            )}>
              Select policy
            </h5>
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

      {/* Section 3: Channel Selection - Expands when policy is selected */}
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
              3
            </div>
            <h5 className={cn(
              "font-euclid text-sm font-semibold",
              !selectedPolicy ? "text-[#9c9aaf]" : "text-[#040222]"
            )}>
              Choose communication channels
            </h5>
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
          {isLoading ? "Sending..." : "Send"}
        </Button>
      )}
    </div>
  )
}

export function RightSidebar({
  isCollapsed,
  isOpen,
  onToggle,
  activeSection,
  onSectionChange,
  className,
  width: propWidth,
  onWidthChange,
  workflowActive = false,
  editPolicyWorkflow = null,
  customer,
  displayPhone,
  claimWorkflowPolicy,
  isCompletedWorkflow = false,
  selfServeStepsActive = false,
  selfServeStepsType = null,
  policyDetailForPane = null,
  onWorkflowClose,
  onEditPolicyWorkflowClose,
  onSelfServeStepsClose,
  onPolicyDetailClose,
  onRcEmailSent,
  onFnolComplete,
  onEditPolicyWorkflowComplete,
  onCTAPressed,
  onRCPageEmailSent,
  policyDetailSubview = "detail",
  onPolicyDetailViewChange,
  customerPolicies = [],
  agenticIntent = null,
  onAgenticIntentProcessed,
}: RightSidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartWidth, setDragStartWidth] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )
  const [showTabText, setShowTabText] = useState(true)
  const [showSendCommunication, setShowSendCommunication] = useState(false)
  const [showCommunicationHistory, setShowCommunicationHistory] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [showKycVerificationLogs, setShowKycVerificationLogs] = useState(false)
  const [showAgenticSendCommunication, setShowAgenticSendCommunication] = useState(false)
  const [currentAgenticIntent, setCurrentAgenticIntent] = useState<AgenticIntent | null>(null)
  
  // AI Actions tab management
  const [aiActionTabs, setAiActionTabs] = useState<AIActionTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const { toasts, addToast, removeToast } = useToasts()
  
  const collapsedWidth = 52
  
  // Calculate viewport-based widths dynamically
  const defaultExpandedWidth = Math.round(viewportWidth * 0.3)
  const minWidth = Math.round(viewportWidth * 0.2)
  const maxWidth = Math.round(viewportWidth * 0.5)
  
  const currentWidth = isCollapsed ? collapsedWidth : (propWidth || defaultExpandedWidth)
  const width = `${currentWidth}px`
  
  // Dynamic text breakpoint calculation
  // When gap between buttons would be 8px (gap-2), switch to icon-only mode
  // Calculate minimum width needed for comfortable text display:
  // - 3 buttons with text: ~120px each = 360px
  // - Comfortable gaps between buttons (gap-3 = 12px): 24px  
  // - Container padding: 32px
  // - Collapse button: 28px
  // Total minimum: ~440px
  const textBreakpoint = 440
  
  // Update text visibility based on current width and spacing
  React.useEffect(() => {
    if (!isCollapsed) {
      // Switch to icon-only when width is too small for comfortable text spacing
      setShowTabText(currentWidth >= textBreakpoint)
    } else {
      setShowTabText(false)
    }
  }, [currentWidth, isCollapsed, textBreakpoint])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return
    e.preventDefault()
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragStartWidth(currentWidth)
  }, [isCollapsed, currentWidth])

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isDragging || !dragStartX) return
    e.preventDefault()
    
    // Calculate width change based on mouse movement from start position
    const deltaX = dragStartX - e.clientX // Negative when dragging left (expanding)
    const newWidth = dragStartWidth + deltaX
    const clampedWidth = Math.max(minWidth, Math.min(maxWidth, newWidth))
    
    // Update text visibility immediately during drag for responsive feedback
    setShowTabText(clampedWidth >= textBreakpoint)
    
    // Direct update for smooth following
    onWidthChange?.(clampedWidth)
  }, [isDragging, dragStartX, dragStartWidth, minWidth, maxWidth, onWidthChange, textBreakpoint])

  const handleMouseUp = useCallback(() => {
    setIsDragging(false)
    setDragStartX(0)
    setDragStartWidth(0)
  }, [])

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove, { passive: false })
      document.addEventListener('mouseup', handleMouseUp)
      document.body.style.cursor = 'ew-resize'
      document.body.style.userSelect = 'none'
      
      return () => {
        document.removeEventListener('mousemove', handleMouseMove)
        document.removeEventListener('mouseup', handleMouseUp)
        document.body.style.cursor = ''
        document.body.style.userSelect = ''
      }
    }
  }, [isDragging, handleMouseMove, handleMouseUp])

  // Handle window resize to maintain percentage-based constraints
  React.useEffect(() => {
    let resizeTimeout: NodeJS.Timeout
    
    const handleResize = () => {
      // Throttle resize updates for better performance
      clearTimeout(resizeTimeout)
      resizeTimeout = setTimeout(() => {
        const newViewportWidth = window.innerWidth
        setViewportWidth(newViewportWidth)
        
        if (!isCollapsed && propWidth) {
          const newMinWidth = Math.round(newViewportWidth * 0.2)
          const newMaxWidth = Math.round(newViewportWidth * 0.5)
          
          // Ensure current width stays within new constraints
          if (propWidth < newMinWidth) {
            onWidthChange?.(newMinWidth)
          } else if (propWidth > newMaxWidth) {
            onWidthChange?.(newMaxWidth)
          }
        }
      }, 100) // 100ms throttle
    }

    window.addEventListener('resize', handleResize)
    return () => {
      window.removeEventListener('resize', handleResize)
      clearTimeout(resizeTimeout)
    }
  }, [isCollapsed, propWidth, onWidthChange])

  // AI Actions tab management functions
  const createAIActionTab = (type: AIActionTab['type'], title: string, data?: any): string => {
    // Check if a similar tab already exists for certain types
    if (type === 'agentic_send_communication') {
      const existingTab = aiActionTabs.find(tab => 
        tab.type === 'agentic_send_communication' &&
        JSON.stringify(tab.data?.extractedFrom) === JSON.stringify(data?.extractedFrom)
      )
      
      if (existingTab) {
        // Switch to existing tab instead of creating duplicate
        switchToTab(existingTab.id)
        return existingTab.id
      }
    }
    
    const tabId = `ai-tab-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newTab: AIActionTab = {
      id: tabId,
      title,
      type,
      data,
      isActive: true
    }
    
    setAiActionTabs(prev => [
      ...prev.map(tab => ({ ...tab, isActive: false })), // Deactivate all existing tabs
      newTab
    ])
    setActiveTabId(tabId)
    return tabId
  }

  const switchToTab = (tabId: string) => {
    setActiveTabId(tabId)
    setAiActionTabs(prev => prev.map(tab => ({
      ...tab,
      isActive: tab.id === tabId
    })))
  }

  const closeTab = (tabId: string) => {
    setAiActionTabs(prev => {
      const filteredTabs = prev.filter(tab => tab.id !== tabId)
      
      // If we're closing the active tab, switch to the last remaining tab
      if (activeTabId === tabId && filteredTabs.length > 0) {
        const newActiveTab = filteredTabs[filteredTabs.length - 1]
        setActiveTabId(newActiveTab.id)
        return filteredTabs.map(tab => ({
          ...tab,
          isActive: tab.id === newActiveTab.id
        }))
      }
      
      // If no tabs left, clear active tab
      if (filteredTabs.length === 0) {
        setActiveTabId(null)
      }
      
      return filteredTabs
    })
  }

  const getActiveTab = (): AIActionTab | null => {
    return aiActionTabs.find(tab => tab.isActive) || null
  }

  // Handle agentic intent processing
  useEffect(() => {
    if (agenticIntent) {
      // Create a new tab for the agentic workflow
      const tabTitle = agenticIntent.documentType 
        ? `Send ${agenticIntent.documentType.replace('-', ' ')}`
        : "Send Communication"
      
      createAIActionTab('agentic_send_communication', tabTitle, agenticIntent)
      
      // Auto-switch to AI Actions tab
      onSectionChange?.("ai")
      
      // Auto-expand sidebar if collapsed
      if (isCollapsed) {
        onToggle()
      }
      
      // Auto-expand width for better agentic workflow viewing
      if (onWidthChange) {
        const expandedWidthForAgentic = Math.round(viewportWidth * 0.45)
        onWidthChange(expandedWidthForAgentic)
      }
      
      // Mark as processed
      onAgenticIntentProcessed?.()
    }
  }, [agenticIntent, isCollapsed, onToggle, onSectionChange, onWidthChange, onAgenticIntentProcessed, viewportWidth])

  // Create tabs for other workflows when they become active
  useEffect(() => {
    if (workflowActive && claimWorkflowPolicy) {
      const existingTab = aiActionTabs.find(tab => 
        tab.type === 'raise_claim_workflow' && 
        tab.data?.policyId === claimWorkflowPolicy.id
      )
      
      if (!existingTab) {
        const tabTitle = isCompletedWorkflow 
          ? `Completed: ${claimWorkflowPolicy.vehicle || 'Claim'}`
          : `Raise Claim: ${claimWorkflowPolicy.vehicle || 'Policy'}`
        createAIActionTab('raise_claim_workflow', tabTitle, { 
          policyId: claimWorkflowPolicy.id,
          isCompleted: isCompletedWorkflow 
        })
      }
    }
  }, [workflowActive, claimWorkflowPolicy, isCompletedWorkflow])

  useEffect(() => {
    if (editPolicyWorkflow) {
      const existingTab = aiActionTabs.find(tab => 
        tab.type === 'edit_policy_workflow' && 
        tab.data?.policyId === editPolicyWorkflow.policy.id
      )
      
      if (!existingTab) {
        const tabTitle = `Edit: ${editPolicyWorkflow.policy.vehicle || editPolicyWorkflow.policy.name || 'Policy'}`
        createAIActionTab('edit_policy_workflow', tabTitle, { 
          policyId: editPolicyWorkflow.policy.id,
          editKind: editPolicyWorkflow.editKind 
        })
      }
    }
  }, [editPolicyWorkflow])

  useEffect(() => {
    if (policyDetailForPane) {
      const existingTab = aiActionTabs.find(tab => 
        tab.type === 'policy_detail' && 
        tab.data?.policyId === policyDetailForPane.id
      )
      
      if (!existingTab) {
        const tabTitle = `Details: ${policyDetailForPane.vehicle || policyDetailForPane.name || 'Policy'}`
        createAIActionTab('policy_detail', tabTitle, { 
          policyId: policyDetailForPane.id 
        })
      }
    }
  }, [policyDetailForPane])

  useEffect(() => {
    if (selfServeStepsActive) {
      const existingTab = aiActionTabs.find(tab => tab.type === 'self_serve_steps')
      
      if (!existingTab) {
        const tabTitle = selfServeStepsType === "raise_claim" ? "Customer Steps: Claim" : "Customer Steps: Edit"
        createAIActionTab('self_serve_steps', tabTitle, { stepType: selfServeStepsType })
      }
    }
  }, [selfServeStepsActive, selfServeStepsType])

  const handleManualActionClick = (actionId: string) => {
    if (actionId === "send-communication") {
      setShowSendCommunication(true)
    } else if (actionId === "communication-history") {
      setShowCommunicationHistory(true)
      // Automatically expand width for better readability of communication history
      if (onWidthChange) {
        const expandedWidthForHistory = Math.round(viewportWidth * 0.42) // 42% of viewport
        onWidthChange(expandedWidthForHistory)
      }
    } else if (actionId === "payment-history") {
      setShowPaymentHistory(true)
      // Automatically expand width for better readability of payment history
      if (onWidthChange) {
        const expandedWidthForHistory = Math.round(viewportWidth * 0.40) // 40% of viewport
        onWidthChange(expandedWidthForHistory)
      }
    } else if (actionId === "kyc-verification") {
      setShowKycVerificationLogs(true)
      // Automatically expand width for better readability of KYC verification logs
      if (onWidthChange) {
        const expandedWidthForLogs = Math.round(viewportWidth * 0.45) // 45% of viewport
        onWidthChange(expandedWidthForLogs)
      }
    } else if (actionId === "firefly") {
      // Handle Firefly action
      console.log("Firefly tool activated")
    } else if (actionId === "garage-locator") {
      // Handle Garage Locator action
      console.log("Garage Locator tool activated")
    }
    // Handle other manual actions here
  }

  // Legacy handler - now handled by tab system
  const handleAgenticSendCommunicationBack = () => {
    // This is now handled by closing the tab
  }

  const handleSendCommunicationBack = () => {
    setShowSendCommunication(false)
  }

  const handleCommunicationSent = (message: string) => {
    addToast(message, "success")
    setShowSendCommunication(false)
  }

  const handleAgenticCommunicationSent = (message: string) => {
    addToast(message, "success")
    setShowAgenticSendCommunication(false)
    setCurrentAgenticIntent(null)
    // Reset width back to default
    if (onWidthChange) {
      onWidthChange(defaultExpandedWidth)
    }
  }

  const handleCommunicationHistoryBack = () => {
    setShowCommunicationHistory(false)
    // Reset width back to default when closing communication history
    if (onWidthChange) {
      onWidthChange(defaultExpandedWidth)
    }
  }

  const handlePaymentHistoryBack = () => {
    setShowPaymentHistory(false)
    // Reset width back to default when closing payment history
    if (onWidthChange) {
      onWidthChange(defaultExpandedWidth)
    }
  }

  const handleKycVerificationLogsBack = () => {
    setShowKycVerificationLogs(false)
    // Reset width back to default when closing KYC verification logs
    if (onWidthChange) {
      onWidthChange(defaultExpandedWidth)
    }
  }

  return (
    <div
      className={cn(
        "h-full bg-white border-l border-[#e7e7f0] shrink-0 relative group",
        !isDragging && "transition-all duration-300 ease-in-out",
        className,
      )}
      style={{ width }}
    >
      {/* Enhanced resize handle with better visual feedback */}
      {!isCollapsed && (
        <>
          {/* Visual indicator line */}
          <div
            className={cn(
              "absolute left-0 top-0 w-1 h-full bg-[#7c47e1] z-10",
              !isDragging && "transition-all duration-200",
              isDragging ? "bg-opacity-60 w-1" : "bg-opacity-0 hover:bg-opacity-40"
            )}
          />
          {/* Enhanced hit area for easier grabbing */}
          <div
            onMouseDown={handleMouseDown}
            className={cn(
              "absolute -left-2 top-0 w-6 h-full cursor-ew-resize z-20",
              !isDragging && "transition-all duration-200",
              "hover:bg-[#7c47e1] hover:bg-opacity-10",
              isDragging && "bg-[#7c47e1] bg-opacity-15"
            )}
            title="Drag to resize sidebar"
          />
          {/* Drag indicator dots (visible on hover) */}
          <div
            className={cn(
              "absolute left-1 top-1/2 transform -translate-y-1/2 -translate-x-1/2 pointer-events-none z-30",
              !isDragging && "transition-opacity duration-200",
              isDragging ? "opacity-100" : "opacity-0 group-hover:opacity-60"
            )}
          >
            <div className="flex flex-col gap-0.5">
              <div className="w-0.5 h-0.5 bg-[#7c47e1] rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-[#7c47e1] rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-[#7c47e1] rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-[#7c47e1] rounded-full"></div>
              <div className="w-0.5 h-0.5 bg-[#7c47e1] rounded-full"></div>
            </div>
          </div>
        </>
      )}
      {isCollapsed ? (
        // Collapsed State - Just the toggle button
        <div className="flex flex-col gap-6 items-center pt-4 px-3">
          <button
            type="button"
            onClick={onToggle}
            className="flex items-center justify-center w-7 h-7 hover:bg-[#f0f0f6] rounded transition-colors"
            aria-label="Expand sidebar"
          >
            <img 
              src="/icons/sidebar-toggle.png" 
              alt="Toggle sidebar" 
              className="w-6 h-6"
            />
          </button>
        </div>
      ) : (
        // Expanded State - Full sidebar content
        <div className="flex flex-col h-full">
          {/* Adaptive Navigation Tabs - Text+Icon or Icon-only based on width */}
          <div className="flex items-center justify-between p-4 border-b border-[#e7e7f0]">
            <div className={cn("flex", showTabText ? "gap-3" : "gap-2")}>
              <button
                type="button"
                onClick={() => onSectionChange?.("manual-actions")}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200",
                  showTabText 
                    ? "gap-2 px-2 py-1.5" 
                    : "justify-center w-10 h-10",
                  activeSection === "manual-actions"
                    ? "bg-[#7c47e1] text-white"
                    : "bg-[#f8f7fc] text-[#5b5675] hover:bg-[#f0f0f6]"
                )}
                aria-label="Manual Actions"
              >
                <Zap className={cn(showTabText ? "w-[22.5px] h-[22.5px]" : "w-5 h-5", "shrink-0")} />
                {showTabText && (
                  <span className="font-euclid text-xs font-medium leading-5 whitespace-nowrap">
                    Manual actions
                  </span>
                )}
              </button>
              
              <button
                type="button"
                onClick={() => onSectionChange?.("ai")}
                className={cn(
                  "flex items-center rounded-lg transition-all duration-200",
                  showTabText 
                    ? "gap-2 px-2 py-1.5" 
                    : "justify-center w-10 h-10",
                  activeSection === "ai"
                    ? "bg-[#7c47e1] text-white"
                    : "bg-[#f8f7fc] text-[#5b5675] hover:bg-[#f0f0f6]"
                )}
                aria-label="AI Tools"
              >
                <Sparkles className={cn(showTabText ? "w-[23.75px] h-[23.75px]" : "w-5 h-5", "shrink-0")} />
                {showTabText && (
                  <span className="font-euclid text-xs font-medium leading-5 whitespace-nowrap">
                    AI actions
                  </span>
                )}
              </button>
            </div>
            
            <button
              type="button"
              onClick={onToggle}
              className="flex items-center justify-center w-7 h-7 hover:bg-[#f0f0f6] rounded transition-colors"
              aria-label="Collapse sidebar"
            >
              <img 
                src="/icons/sidebar-toggle.png" 
                alt="Toggle sidebar" 
                className="w-6 h-6 rotate-180"
              />
            </button>
          </div>

          {/* Content Area */}
          <div className="flex-1 overflow-y-auto p-4">
            {activeSection === "manual-actions" && (
              <div className="space-y-3">
                {showSendCommunication ? (
                  <SendCommunication
                    customer={customer}
                    customerPolicies={customerPolicies}
                    onBack={handleSendCommunicationBack}
                    onSent={handleCommunicationSent}
                  />
                ) : showCommunicationHistory ? (
                  <CommunicationHistoryPanel
                    customer={customer}
                    customerPolicies={customerPolicies}
                    onBack={handleCommunicationHistoryBack}
                  />
                ) : showPaymentHistory ? (
                  <PaymentHistoryPanel
                    customer={customer}
                    customerPolicies={customerPolicies}
                    onBack={handlePaymentHistoryBack}
                  />
                ) : showKycVerificationLogs ? (
                  <KycVerificationLogs
                    customerName={customer?.name}
                    onBack={handleKycVerificationLogsBack}
                  />
                ) : (
                  <>
                    <h4 className="font-euclid text-xs font-semibold uppercase tracking-wide text-[#5b5675]">
                      MANUAL ACTIONS
                    </h4>
                    <div className="space-y-2">
                      {manualActionsItems.map((item) => (
                        <button
                          key={item.id}
                          onClick={() => handleManualActionClick(item.id)}
                          className="w-full text-left p-3 bg-[#f8f7fc] hover:bg-[#f0f0f6] rounded-lg transition-colors"
                        >
                          <div className="font-euclid text-sm font-medium text-[#36354c]">
                            {item.label}
                          </div>
                          <div className="font-euclid text-xs text-[#5b5675] mt-1">
                            {item.description}
                          </div>
                        </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}

            {activeSection === "ai" && (
              <div className="h-full flex flex-col">
                {/* Tabs Navigation */}
                {aiActionTabs.length > 0 && (
                  <div className="mb-3">
                    <div className="flex flex-wrap gap-1 p-2 bg-[#fafafa] rounded-lg">
                      {aiActionTabs.map((tab) => (
                        <div
                          key={tab.id}
                          className={cn(
                            "flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition-colors cursor-pointer",
                            tab.isActive 
                              ? "bg-[#7c47e1] text-white" 
                              : "bg-white text-[#5b5675] hover:bg-[#f0f0f6]"
                          )}
                        >
                          <span 
                            onClick={() => switchToTab(tab.id)}
                            className="truncate max-w-[100px]"
                            title={tab.title} // Show full title on hover
                          >
                            {tab.title}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              closeTab(tab.id)
                            }}
                            className={cn(
                              "flex items-center justify-center w-4 h-4 rounded-full hover:bg-opacity-20 transition-colors",
                              tab.isActive ? "hover:bg-white" : "hover:bg-[#5b5675]"
                            )}
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Tab Content Area */}
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto"
                >
                  {(() => {
                    const activeTab = getActiveTab()
                    
                    if (!activeTab) {
                      return (
                        <div className="flex items-center justify-center h-full">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                              <Sparkles className="w-6 h-6 text-[#5b5675]" />
                            </div>
                            <p className="font-euclid text-sm text-[#5b5675] mb-2">
                              AI workflows will appear here
                            </p>
                            <p className="font-euclid text-xs text-[#5b5675]">
                              Try typing: "Send policy document to customer"
                            </p>
                          </div>
                        </div>
                      )
                    }

                    // Render content based on active tab type
                    switch (activeTab.type) {
                      case 'agentic_send_communication':
                        return (
                          <AgenticSendCommunication
                            customer={customer}
                            customerPolicies={customerPolicies}
                            onBack={() => closeTab(activeTab.id)}
                            onSent={(message) => {
                              addToast(message, "success")
                              closeTab(activeTab.id)
                              // Reset width back to default
                              if (onWidthChange) {
                                onWidthChange(defaultExpandedWidth)
                              }
                            }}
                            agenticIntent={activeTab.data}
                          />
                        )
                        
                      case 'raise_claim_workflow':
                        if (workflowActive && claimWorkflowPolicy && customer) {
                          return (
                            <RaiseClaimWorkflowPanel
                              key={`sidebar-raise-claim-${claimWorkflowPolicy.id}`}
                              customer={customer}
                              policy={claimWorkflowPolicy}
                              displayPhone={displayPhone}
                              scrollContainerRef={scrollContainerRef}
                              onRcEmailSent={onRcEmailSent}
                              onClose={() => closeTab(activeTab.id)}
                              onFnolComplete={onFnolComplete}
                              showPanelHeader={false}
                              isCompleted={isCompletedWorkflow}
                            />
                          )
                        }
                        break
                        
                      case 'edit_policy_workflow':
                        if (editPolicyWorkflow && customer) {
                          return (
                            <EditPolicyWorkflowPanel
                              key={`sidebar-edit-policy-${editPolicyWorkflow.policy.id}-${editPolicyWorkflow.editKind}`}
                              customer={customer}
                              policy={editPolicyWorkflow.policy}
                              editKind={editPolicyWorkflow.editKind}
                              scrollContainerRef={scrollContainerRef}
                              onRcEmailSent={onRcEmailSent}
                              onClose={() => closeTab(activeTab.id)}
                              onEditPolicyWorkflowComplete={onEditPolicyWorkflowComplete}
                              showPanelHeader={false}
                            />
                          )
                        }
                        break
                        
                      case 'policy_detail':
                        if (policyDetailForPane) {
                          return (
                            <PolicyDetailPanel
                              policy={policyDetailForPane}
                              variant="embedded"
                              showRelatedActions={false}
                              onPolicyActionClick={onCTAPressed}
                            />
                          )
                        }
                        break
                        
                      case 'self_serve_steps':
                        if (selfServeStepsActive) {
                          return (
                            <div className="p-4">
                              <div className="bg-[#f8f7fc] rounded-lg p-4">
                                <h5 className="font-euclid text-sm font-semibold text-[#36354c] mb-3">
                                  Customer Steps — {selfServeStepsType === "raise_claim" ? "Raise Claim" : "Edit Policy"}
                                </h5>
                                <div className="space-y-2">
                                  <div className="text-xs text-[#5b5675]">Guide the customer through these steps</div>
                                </div>
                              </div>
                            </div>
                          )
                        }
                        break
                    }
                    
                    return (
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Sparkles className="w-6 h-6 text-[#5b5675]" />
                          </div>
                          <p className="font-euclid text-sm text-[#5b5675]">
                            Tab content not available
                          </p>
                        </div>
                      </div>
                    )
                  })()}
                </div>
              </div>
            )}

            {!activeSection && (
              <div className="flex items-center justify-center h-full">
                <div className="text-center">
                  <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                    <Sparkles className="w-6 h-6 text-[#5b5675]" />
                  </div>
                  <p className="font-euclid text-sm text-[#5b5675]">
                    Select a tool to get started
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}