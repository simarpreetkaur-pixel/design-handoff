import React, { useRef, useState, useCallback, useEffect } from "react"
import { Zap, Sparkles, ArrowLeft, Check, Mail, MessageSquare, Smartphone, X, MoreVertical } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer, Policy, EndorsementEditKind, InactivePolicy, JTBD } from "@/types/crm"
import {
  ClaimStatusWorkflowPanel,
  type ClaimStatusWorkflowView,
} from "@/components/crm/hello/ClaimStatusWorkflowPanel"
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
import { NearbyGaragesPanel } from "@/components/crm/hello/NearbyGaragesPanel"
import { SimilarCasesPanel } from "@/components/crm/hello/SimilarCasesPanel"
import { RequestDocumentsManualPanel } from "@/components/crm/hello/RequestDocumentsManualPanel"
import { PolicyGatedManualWorkflow } from "@/components/crm/hello/PolicyGatedManualWorkflow"
import { SimpleManualTaskPanel } from "@/components/crm/hello/SimpleManualTaskPanel"
import {
  HelloPowerToolsPanel,
  HelloRightPanelIconRail,
  HELLO_RIGHT_PANEL_RAIL_WIDTH,
  type HelloRightRailTab,
} from "@/components/crm/hello/HelloRightPanelRail"
import { getTaskById, getTasksByCategory, type CrmTaskId } from "@/lib/crmTasks"
import type { AgenticIntent } from "@/lib/agenticIntentParser"

const policyRelatedActionsItems = getTasksByCategory("policy-related").map((t) => ({
  id: t.id,
  label: t.label,
  description: t.description,
}))
const quickActionsItems = getTasksByCategory("quick-actions").map((t) => ({
  id: t.id,
  label: t.label,
  description: t.description,
}))
const dataInvestigationItems = getTasksByCategory("data-investigation").map((t) => ({
  id: t.id,
  label: t.label,
  description: t.description,
}))
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
  type: "agentic_send_communication" | "raise_claim_workflow" | "edit_policy_workflow" | "claim_status_workflow" | "policy_detail" | "self_serve_steps" | "communication_history" | "payment_history" | "task_history" | "nearby_garages" | "similar_cases"
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
  // Mode switching props
  isManualMode?: boolean
  onModeToggle?: () => void
  // Width adjustment props
  width?: number
  onWidthChange?: (width: number) => void
  // Workflow-related props
  workflowActive?: boolean
  editPolicyWorkflow?: { policy: Policy; editKind: EndorsementEditKind } | null
  customer?: Customer
  displayPhone?: string
  claimWorkflowPolicy?: Policy | null
  claimStatusWorkflow?: {
    jtbd: JTBD
    policy: Policy
    view: ClaimStatusWorkflowView
  } | null
  onClaimStatusWorkflowClose?: () => void
  onClaimStatusEscalationDone?: () => void
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
  /** AI send communication tab — collapse sidebar + chat success (Raise Claim parity). */
  onSendCommunicationComplete?: () => void
  onCTAPressed?: (action: string, policy: Policy) => void
  onRCPageEmailSent?: () => void
  policyDetailSubview?: "detail" | "endorsements"
  onPolicyDetailViewChange?: (view: "detail" | "endorsements") => void
  // Customer policies for send communication
  customerPolicies?: Policy[]
  // Agentic workflow props
  agenticIntent?: AgenticIntent | null
  onAgenticIntentProcessed?: () => void
  // Manual action trigger from parent (for autocomplete suggestions)
  triggerManualAction?: { actionId: string; nonce: number } | null
  // Trigger creating self-serve steps tab from parent (similar to triggerManualAction)
  triggerSelfServeTab?: { stepType: string; title: string; nonce: number } | null
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
  // Mode switching props
  isManualMode = false,
  onModeToggle,
  width: propWidth,
  onWidthChange,
  workflowActive = false,
  editPolicyWorkflow = null,
  customer,
  displayPhone,
  claimWorkflowPolicy,
  claimStatusWorkflow = null,
  onClaimStatusWorkflowClose,
  onClaimStatusEscalationDone,
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
  onSendCommunicationComplete,
  onCTAPressed,
  onRCPageEmailSent,
  policyDetailSubview = "detail",
  onPolicyDetailViewChange,
  customerPolicies = [],
  agenticIntent = null,
  onAgenticIntentProcessed,
  triggerManualAction = null,
  triggerSelfServeTab = null,
}: RightSidebarProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)
  const [dragStartX, setDragStartX] = useState(0)
  const [dragStartWidth, setDragStartWidth] = useState(0)
  const [viewportWidth, setViewportWidth] = useState(() => 
    typeof window !== 'undefined' ? window.innerWidth : 1280
  )
  const [showTabText, setShowTabText] = useState(true)
  const [policyGateAction, setPolicyGateAction] = useState<CrmTaskId | null>(null)
  const [gatedPolicy, setGatedPolicy] = useState<Policy | null>(null)
  const [showRequestDocumentsManual, setShowRequestDocumentsManual] = useState(false)
  const [simpleManualTask, setSimpleManualTask] = useState<string | null>(null)
  const [showCommunicationHistory, setShowCommunicationHistory] = useState(false)
  const [showPaymentHistory, setShowPaymentHistory] = useState(false)
  const [showKycVerificationLogs, setShowKycVerificationLogs] = useState(false)
  const [showAgenticSendCommunication, setShowAgenticSendCommunication] = useState(false)
  const [currentAgenticIntent, setCurrentAgenticIntent] = useState<AgenticIntent | null>(null)
  
  // AI Actions tab management
  const [aiActionTabs, setAiActionTabs] = useState<AIActionTab[]>([])
  const [activeTabId, setActiveTabId] = useState<string | null>(null)
  const { toasts, addToast, removeToast } = useToasts()
  
  const [activeRailTab, setActiveRailTab] = useState<HelloRightRailTab>("workflows")

  // Tabs 3-dot menu dropdown state
  const [showTabsDropdown, setShowTabsDropdown] = useState(false)
  
  // Handle manual action trigger from parent (for autocomplete suggestions)
  useEffect(() => {
    if (triggerManualAction) {
      setActiveRailTab("workflows")
      onSectionChange?.("ai")
      handleManualActionClick(triggerManualAction.actionId)
    }
  }, [triggerManualAction])
  
  const collapsedWidth = HELLO_RIGHT_PANEL_RAIL_WIDTH

  // Calculate viewport-based widths dynamically (content pane only; rail adds fixed width)
  const defaultExpandedWidth = Math.round(viewportWidth * 0.3)
  const minWidth = Math.round(viewportWidth * 0.2)
  const maxWidth = Math.round(viewportWidth * 0.5)

  /** Rail + flyout only — no empty content pane (manual-mode tab or collapsed). */
  const isRailOnlyView =
    !isManualMode && (isCollapsed || activeRailTab === "manual-mode")

  const contentPaneWidth = isRailOnlyView ? 0 : propWidth || defaultExpandedWidth
  const currentWidth = isRailOnlyView
    ? collapsedWidth
    : contentPaneWidth + HELLO_RIGHT_PANEL_RAIL_WIDTH
  // In manual mode the sidebar always fills all available space (no chat pane)
  const width =
    isManualMode && !isCollapsed ? `calc(100vw - 298px)` : `${currentWidth}px`

  const manualModeRailProps = {
    isManualMode,
    onToggle: () => {
      onModeToggle?.()
      // Dismiss the flyout after confirming the switch
      setActiveRailTab("workflows")
    },
  }

  const handleRailTabChange = useCallback(
    (tab: HelloRightRailTab) => {
      if (tab === "manual-mode") {
        // Toggle the confirmation flyout — second click dismisses it
        if (activeRailTab === "manual-mode") {
          // Flyout already open — close it
          setActiveRailTab(isManualMode ? "workflows" : "workflows")
          if (!isManualMode && !isCollapsed) onToggle?.()
          return
        }
        // Open the flyout (works the same in both AI and manual mode)
        if (!isManualMode && !isCollapsed) onToggle?.()
        setActiveRailTab("manual-mode")
        return
      }

      if (tab === "power-tools") {
        if (activeRailTab === "power-tools") {
          // Clicking power-tools again closes it — in manual mode go back to actions grid,
          // in AI mode collapse the sidebar
          if (isManualMode) {
            setActiveRailTab("workflows")
          } else {
            onToggle?.()
          }
          return
        }
        if (isCollapsed) onToggle?.()
        setActiveRailTab("power-tools")
        return
      }

      // Workflows tab
      if (isManualMode) {
        setActiveRailTab("workflows")
        onSectionChange?.("ai")
        return
      }

      if (!isCollapsed && activeRailTab === tab) {
        onToggle?.()
        return
      }
      if (isCollapsed) onToggle?.()
      setActiveRailTab(tab)
      if (tab === "workflows") onSectionChange?.("ai")
    },
    [activeRailTab, isCollapsed, isManualMode, onModeToggle, onSectionChange, onToggle],
  )

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
      setShowTabText(contentPaneWidth >= textBreakpoint)
    } else {
      setShowTabText(false)
    }
  }, [contentPaneWidth, isCollapsed, textBreakpoint])

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (isCollapsed) return
    e.preventDefault()
    setIsDragging(true)
    setDragStartX(e.clientX)
    setDragStartWidth(contentPaneWidth)
  }, [isCollapsed, contentPaneWidth])

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

  useEffect(() => {
    if (!isCollapsed && activeSection === "ai") {
      setActiveRailTab("workflows")
    }
  }, [isCollapsed, activeSection])

  // Handle self-serve tab trigger from parent
  useEffect(() => {
    if (triggerSelfServeTab) {
      setActiveRailTab("workflows")
      if (onSectionChange) {
        onSectionChange("ai")
      }
      
      // Create the tab
      const tabId = createAIActionTab('self_serve_steps', triggerSelfServeTab.title, { 
        stepType: triggerSelfServeTab.stepType 
      })
      setActiveTabId(tabId)
    }
  }, [triggerSelfServeTab, onSectionChange, createAIActionTab, setActiveTabId])

  // Handle agentic intent processing
  useEffect(() => {
    if (agenticIntent) {
      setActiveRailTab("workflows")
      const tabTitle = agenticIntent.documentType 
        ? `Send ${agenticIntent.documentType.replace('-', ' ')}`
        : "Send Communication"
      
      createAIActionTab('agentic_send_communication', tabTitle, agenticIntent)
      
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
          ? "Claim Raised Successfully"
          : "Raise a claim"
        createAIActionTab('raise_claim_workflow', tabTitle, { 
          policyId: claimWorkflowPolicy.id,
          isCompleted: isCompletedWorkflow 
        })
      } else {
        // Update existing tab if completion status changed, but don't override if tab is already completed
        if (existingTab.data?.isCompleted !== isCompletedWorkflow && !existingTab.data?.isCompleted) {
          setAiActionTabs(prev => prev.map(tab => 
            tab.id === existingTab.id 
              ? { 
                  ...tab, 
                  title: isCompletedWorkflow ? "Claim Raised Successfully" : "Raise a claim",
                  data: { ...tab.data, isCompleted: isCompletedWorkflow }
                }
              : tab
          ))
        }
      }
    }
  }, [workflowActive, claimWorkflowPolicy, isCompletedWorkflow])

  useEffect(() => {
    if (claimStatusWorkflow) {
      const existingTab = aiActionTabs.find(
        (tab) =>
          tab.type === "claim_status_workflow" &&
          tab.data?.policyId === claimStatusWorkflow.policy.id &&
          tab.data?.view === claimStatusWorkflow.view,
      )

      if (!existingTab) {
        const viewTitle =
          claimStatusWorkflow.view === "escalate"
            ? "Escalate to F-ops"
            : claimStatusWorkflow.view === "communication_history"
              ? "Communication History"
              : "Claim status"
        createAIActionTab("claim_status_workflow", viewTitle, {
          policyId: claimStatusWorkflow.policy.id,
          view: claimStatusWorkflow.view,
        })
      }
    }
  }, [claimStatusWorkflow])

  useEffect(() => {
    if (editPolicyWorkflow) {
      const existingTab = aiActionTabs.find(tab => 
        tab.type === 'edit_policy_workflow' && 
        tab.data?.policyId === editPolicyWorkflow.policy.id &&
        tab.data?.editKind === editPolicyWorkflow.editKind
      )
      
      if (!existingTab) {
        const tabTitle = "Edit policy flow"
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
        const tabTitle = "Policy details"
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

  const closeAllManualFlows = () => {
    setPolicyGateAction(null)
    setGatedPolicy(null)
    setShowRequestDocumentsManual(false)
    setSimpleManualTask(null)
    setShowCommunicationHistory(false)
    setShowPaymentHistory(false)
    setShowKycVerificationLogs(false)
  }

  const closePolicyGate = () => {
    setPolicyGateAction(null)
    setGatedPolicy(null)
  }

  const handlePolicyGatePolicySelect = (policy: Policy) => {
    if (!isManualMode && policyGateAction === "raise-claim") {
      closePolicyGate()
      onSectionChange?.("ai")
      onCTAPressed?.("raise_claim", policy)
      return
    }
    if (!isManualMode && policyGateAction === "edit-policy") {
      closePolicyGate()
      onSectionChange?.("ai")
      onCTAPressed?.("edit_policy", policy)
      return
    }
    setGatedPolicy(policy)
  }

  const renderPolicyGateWorkflow = () => {
    if (!policyGateAction || !customer) return null
    return (
      <PolicyGatedManualWorkflow
        actionId={policyGateAction}
        policy={gatedPolicy}
        customer={customer}
        customerPolicies={customerPolicies || []}
        displayPhone={displayPhone}
        onPolicySelect={handlePolicyGatePolicySelect}
        onBackFromPolicySelect={closePolicyGate}
        onBackFromWorkflow={closePolicyGate}
        onToast={(message) => addToast(message, "success")}
      />
    )
  }

  const handleManualActionClick = (actionId: string) => {
    closeAllManualFlows()

    const task = getTaskById(actionId)
    if (task?.requiresPolicy) {
      setPolicyGateAction(actionId as CrmTaskId)
      return
    }

    if (actionId === "request-documents") {
      setShowRequestDocumentsManual(true)
    } else if (actionId === "re-assign-ticket") {
      setSimpleManualTask("re-assign-ticket")
    } else if (actionId === "transfer-call") {
      setSimpleManualTask("transfer-call")
    } else if (actionId === "communication-history") {
      if (isManualMode) {
        setShowCommunicationHistory(true)
        if (onWidthChange) {
          onWidthChange(Math.round(viewportWidth * 0.42))
        }
        return
      }
      if (onSectionChange) {
        onSectionChange("ai")
      }
      const tabId = createAIActionTab('communication_history', 'Communication History')
      setActiveTabId(tabId)
      if (onWidthChange) {
        const expandedWidthForHistory = Math.round(viewportWidth * 0.42)
        onWidthChange(expandedWidthForHistory)
      }
    } else if (actionId === "payment-history") {
      if (isManualMode) {
        setShowPaymentHistory(true)
        if (onWidthChange) {
          onWidthChange(Math.round(viewportWidth * 0.4))
        }
        return
      }
      // Switch to AI actions section and create payment history tab
      if (onSectionChange) {
        onSectionChange("ai")
      }
      const tabId = createAIActionTab('payment_history', 'Payment History')
      setActiveTabId(tabId)
      // Automatically expand width for better readability of payment history
      if (onWidthChange) {
        const expandedWidthForHistory = Math.round(viewportWidth * 0.40) // 40% of viewport
        onWidthChange(expandedWidthForHistory)
      }
    } else if (actionId === "kyc-verification" || actionId === "kyc-logs") {
      if (isManualMode) {
        setShowKycVerificationLogs(true)
        if (onWidthChange) {
          onWidthChange(Math.round(viewportWidth * 0.45))
        }
        return
      }
      if (actionId === "kyc-logs") {
        setShowKycVerificationLogs(true)
        if (onWidthChange) {
          onWidthChange(Math.round(viewportWidth * 0.45))
        }
      }
    } else if (actionId === "nearby-garages") {
      if (onSectionChange) {
        onSectionChange("ai")
      }
      const existingTab = aiActionTabs.find((t) => t.type === "nearby_garages")
      if (existingTab) {
        switchToTab(existingTab.id)
      } else {
        const tabId = createAIActionTab("nearby_garages", "Nearby Garages")
        setActiveTabId(tabId)
      }
    } else if (actionId === "similar-cases") {
      if (onSectionChange) {
        onSectionChange("ai")
      }
      const existingTab = aiActionTabs.find((t) => t.type === "similar_cases")
      if (existingTab) {
        switchToTab(existingTab.id)
      } else {
        const tabId = createAIActionTab("similar_cases", "Similar Cases")
        setActiveTabId(tabId)
      }
    } else if (actionId === "firefly") {
      window.open("https://firefly.acko.com", "_blank", "noopener,noreferrer")
    } else if (actionId === "freshdesk") {
      window.open("https://acko.freshdesk.com", "_blank", "noopener,noreferrer")
    } else if (actionId === "spectra") {
      window.open("https://spectra.acko.com", "_blank", "noopener,noreferrer")
    } else if (actionId === "create-child-ticket") {
      // Handle Create Child Ticket action
      console.log("Create child ticket activated")
      // You can add specific logic here, like opening ticket creation form
    }
    // Handle other manual actions here
  }

  // Legacy handler - now handled by tab system
  const handleAgenticSendCommunicationBack = () => {
    // This is now handled by closing the tab
  }

  const renderSimpleManualTask = () => {
    switch (simpleManualTask) {
      case "re-assign-ticket":
        return (
          <SimpleManualTaskPanel
            title="Re-assign ticket"
            description="Reassign this ticket to another agent or team."
            fields={[
              { label: "Assign to", placeholder: "Select agent or queue" },
              { label: "Reason", placeholder: "Why are you reassigning?", type: "textarea" },
            ]}
            submitLabel="Re-assign"
            onBack={() => setSimpleManualTask(null)}
            onSubmit={() => {
              addToast("Ticket reassigned successfully.", "success")
              setSimpleManualTask(null)
            }}
          />
        )
      case "transfer-call":
        return (
          <SimpleManualTaskPanel
            title="Transfer call"
            description="Transfer this call to another agent or department."
            fields={[{ label: "Transfer to", placeholder: "Team or agent name" }]}
            submitLabel="Transfer"
            onBack={() => setSimpleManualTask(null)}
            onSubmit={() => {
              addToast("Call transfer initiated.", "success")
              setSimpleManualTask(null)
            }}
          />
        )
      default:
        return null
    }
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
        "relative h-full shrink-0 border-l border-[#e7e7f0] bg-white group",
        !isDragging && "transition-all duration-300 ease-in-out",
        isRailOnlyView && "z-50 overflow-visible",
        className,
      )}
      style={{ width }}
    >
      {/* Enhanced resize handle with better visual feedback */}
      {!isRailOnlyView && !isManualMode && (
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
      {isRailOnlyView ? (
        <HelloRightPanelIconRail
          activeTab={activeRailTab}
          onTabChange={handleRailTabChange}
          manualMode={manualModeRailProps}
          isRailOnlyLayout
          className="overflow-visible"
        />
      ) : (
        <div className="flex h-full min-h-0 flex-row overflow-hidden">
          <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          {/* Content Area — in manual+power-tools: actions grid left + power tools panel right */}
          <div className="flex h-full min-h-0 flex-row overflow-hidden">

            {/* Left side: manual actions grid — always visible in manual mode */}
            <div className={cn(
              "overflow-y-auto",
              isManualMode ? "flex-1 px-8 pb-8" : "flex-1 px-4 pb-4",
            )}>
            {isManualMode ? (
              <div className="space-y-3">
                {policyGateAction ? (
                  renderPolicyGateWorkflow()
                ) : showRequestDocumentsManual ? (
                  <RequestDocumentsManualPanel
                    customer={customer}
                    onBack={() => setShowRequestDocumentsManual(false)}
                    onSent={(msg) => {
                      addToast(msg, "success")
                      setShowRequestDocumentsManual(false)
                    }}
                  />
                ) : simpleManualTask ? (
                  renderSimpleManualTask()
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
                    {/* Policy Related Actions Section */}
                    <div className="mb-6">
                      <h4 className="font-euclid text-xs font-semibold uppercase tracking-wide text-[#5b5675] mb-4">
                        POLICY RELATED ACTIONS
                      </h4>
                      <div className={cn(
                        isManualMode 
                          ? "grid grid-cols-3 gap-4" // 3 columns when full width
                          : "space-y-2" // stacked when narrow
                      )}>
                        {policyRelatedActionsItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleManualActionClick(item.id)}
                            className="w-full text-left p-4 bg-[#f8f7fc] hover:bg-[#f0f0f6] rounded-lg transition-colors"
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
                    </div>

                    {/* Other Quick Actions Section */}
                    <div className="mb-6">
                      <h4 className="font-euclid text-xs font-semibold uppercase tracking-wide text-[#5b5675] mb-4">
                        OTHER QUICK ACTIONS
                      </h4>
                      <div className={cn(
                        isManualMode 
                          ? "grid grid-cols-3 gap-4" // 3 columns for other quick actions when full width
                          : "space-y-2" // stacked when narrow
                      )}>
                        {quickActionsItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleManualActionClick(item.id)}
                            className="w-full text-left p-4 bg-[#f8f7fc] hover:bg-[#f0f0f6] rounded-lg transition-colors"
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
                    </div>

                    {/* Data Investigation Section */}
                    <div>
                      <h4 className="font-euclid text-xs font-semibold uppercase tracking-wide text-[#5b5675] mb-4">
                        DATA INVESTIGATION
                      </h4>
                      <div className={cn(
                        isManualMode 
                          ? "grid grid-cols-3 gap-4" // 3 columns for data investigation when full width
                          : "space-y-2" // stacked when narrow
                      )}>
                        {dataInvestigationItems.map((item) => (
                          <button
                            key={item.id}
                            onClick={() => handleManualActionClick(item.id)}
                            className="w-full text-left p-4 bg-[#f8f7fc] hover:bg-[#f0f0f6] rounded-lg transition-colors"
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
                    </div>
                  </>
                )}
              </div>
            ) : activeRailTab === "power-tools" ? (
              /* AI mode power tools — fills entire content area */
              <HelloPowerToolsPanel onToolClick={handleManualActionClick} />
            ) : (
              // Workflows rail tab — AI workflows + legacy manual-actions section
              <div>

                {activeSection === "manual-actions" && (
                  <div className="space-y-3">
                    {policyGateAction ? (
                      renderPolicyGateWorkflow()
                    ) : showRequestDocumentsManual ? (
                      <RequestDocumentsManualPanel
                        customer={customer}
                        onBack={() => setShowRequestDocumentsManual(false)}
                        onSent={(msg) => {
                          addToast(msg, "success")
                          setShowRequestDocumentsManual(false)
                        }}
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
                      <div className="flex items-center justify-center h-full">
                        <div className="text-center">
                          <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                            <Sparkles className="w-6 h-6 text-[#5b5675]" />
                          </div>
                          <p className="font-euclid text-sm text-[#5b5675] mb-2">
                            Manual actions in AI mode
                          </p>
                          <p className="font-euclid text-xs text-[#9c9aaf]">
                            Use the chat interface to trigger manual workflows with AI guidance
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeSection === "ai" && (
              <div className="h-full flex flex-col relative">
                {/* AI Section Header - Always show with 3-dot menu */}
                <div className="mb-3">
                  <div className="flex items-center justify-between pt-3 pb-0 border-0">
                    {/* Tabs Navigation - Only show when there are active tabs */}
                    {aiActionTabs.length > 0 ? (
                      <div className="flex flex-wrap gap-2">
                        {aiActionTabs.map((tab) => (
                          <div
                            key={tab.id}
                            className={cn(
                              "flex items-center gap-2 px-2 py-2 rounded-lg transition-colors cursor-pointer border",
                              tab.isActive 
                                ? "bg-[#f8f7fc] border-[#e0e0e8]" 
                                : "bg-[#f8f7fc] border-transparent text-[#36354c] hover:bg-[#f0f0f6]"
                            )}
                          >
                            <span 
                              onClick={() => switchToTab(tab.id)}
                              className={cn(
                                "font-euclid text-sm font-medium whitespace-nowrap",
                                tab.isActive ? "text-[#5b5675]" : "text-[#36354c]"
                              )}
                              title={tab.title}
                            >
                              {tab.title}
                            </span>
                            {tab.isActive && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation()
                                  closeTab(tab.id)
                                }}
                                className="flex items-center justify-center w-5 h-5 hover:bg-[#5b5675] hover:bg-opacity-10 rounded transition-colors"
                              >
                                <X className="w-3 h-3 text-[#5b5675]" />
                              </button>
                            )}
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div></div>
                    )}
                    
                    {/* 3-dot menu - Always show in AI section */}
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setShowTabsDropdown(!showTabsDropdown)}
                        className="flex items-center justify-center w-6 h-6 hover:bg-[#f0f0f6] rounded transition-colors"
                        aria-label="Workflow Menu"
                      >
                        <MoreVertical className="w-4 h-4 text-[#5b5675]" />
                      </button>
                      
                      {/* Workflow Dropdown */}
                      {showTabsDropdown && (
                        <>
                          <div 
                            className="fixed inset-0 z-40"
                            onClick={() => setShowTabsDropdown(false)}
                          />
                          <div className="absolute top-8 right-0 z-50 w-48 bg-white rounded-lg border border-[#e7e7f0] shadow-[0px_4px_4px_-2px_rgba(54,53,76,0.06)]">
                            <div className="py-[6px]">
                              <button
                                onClick={() => {
                                  // Create a new tab for task history
                                  createAIActionTab('task_history', 'Task History')
                                  setShowTabsDropdown(false)
                                }}
                                className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-[#f8f7fc] transition-colors"
                              >
                                <div className="font-euclid text-sm text-[#040222]">
                                  View task history
                                </div>
                              </button>
                            </div>
                          </div>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Tab Content Area */}
                <div 
                  ref={scrollContainerRef}
                  className="flex-1 min-h-0 overflow-y-auto relative"
                >
                  {(() => {
                    const activeTab = getActiveTab()
                    
                    if (!activeTab) {
                      return (
                        <div className="flex items-start justify-center h-full pt-16">
                          <div className="text-center">
                            <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                              <Sparkles className="w-6 h-6 text-[#5b5675]" />
                            </div>
                            <p className="font-euclid text-sm text-[#5b5675]">
                              AI workflows will appear here
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
                            onSent={() => {
                              closeTab(activeTab.id)
                              if (onWidthChange) {
                                onWidthChange(defaultExpandedWidth)
                              }
                              onSendCommunicationComplete?.()
                            }}
                            agenticIntent={activeTab.data}
                          />
                        )
                        
                      case 'raise_claim_workflow':
                        // Find the policy from customerPolicies using the stored policyId
                        const tabPolicyId = activeTab.data?.policyId
                        const tabPolicy = customerPolicies?.find(p => p.id === tabPolicyId) || claimWorkflowPolicy
                        const tabIsCompleted = activeTab.data?.isCompleted || isCompletedWorkflow
                        
                        if (customer && tabPolicy) {
                          // If this specific tab is marked as completed, show success state
                          if (activeTab.data?.isCompleted) {
                            return (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-[#0fa457] rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Check className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="font-euclid text-sm font-semibold text-[#040222] mb-2">
                                    Claim Raised Successfully
                                  </p>
                                  <p className="font-euclid text-xs text-[#5b5675] mb-4">
                                    Your claim for {tabPolicy.name || tabPolicy.vehicle} has been submitted successfully.
                                  </p>
                                  <div className="bg-[#f8f7fc] rounded-lg p-3 border border-[#e7e7f0]">
                                    <p className="font-euclid text-xs font-medium text-[#36354c] mb-1">
                                      Policy: {tabPolicy.policyNumber}
                                    </p>
                                    <p className="font-euclid text-xs text-[#5b5675]">
                                      {tabPolicy.name || tabPolicy.vehicle}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          
                          return (
                            <RaiseClaimWorkflowPanel
                              key={`sidebar-raise-claim-${tabPolicy.id}`}
                              customer={customer}
                              policy={tabPolicy}
                              displayPhone={displayPhone}
                              scrollContainerRef={scrollContainerRef}
                              onRcEmailSent={onRcEmailSent}
                              onClose={() => closeTab(activeTab.id)}
                              onFnolComplete={() => {
                                // Mark this specific tab as completed
                                setAiActionTabs(prev => prev.map(tab => 
                                  tab.id === activeTab.id 
                                    ? { 
                                        ...tab, 
                                        title: "Claim Raised Successfully",
                                        data: { ...tab.data, isCompleted: true }
                                      }
                                    : tab
                                ))
                                
                                // Call the original completion handler
                                onFnolComplete?.()
                              }}
                              showPanelHeader={false}
                              isCompleted={tabIsCompleted}
                            />
                          )
                        }
                        
                        // Fallback: show a message if policy data is not available
                        if (customer && !tabPolicy) {
                          return (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                                  <Sparkles className="w-6 h-6 text-[#5b5675]" />
                                </div>
                                <p className="font-euclid text-sm text-[#5b5675] mb-2">
                                  Claim workflow content
                                </p>
                                <p className="font-euclid text-xs text-[#5b5675]">
                                  {tabIsCompleted ? "Claim has been raised successfully" : "Loading claim workflow..."}
                                </p>
                              </div>
                            </div>
                          )
                        }
                        break

                      case "claim_status_workflow": {
                        const csPolicyId = activeTab.data?.policyId
                        const csPolicy =
                          customerPolicies?.find((p) => p.id === csPolicyId) ||
                          claimStatusWorkflow?.policy
                        const csView =
                          (activeTab.data?.view as ClaimStatusWorkflowView | undefined) ||
                          claimStatusWorkflow?.view ||
                          "timeline"
                        const csJtbd = claimStatusWorkflow?.jtbd

                        if (customer && csPolicy && csJtbd) {
                          return (
                            <ClaimStatusWorkflowPanel
                              key={`sidebar-claim-status-${csPolicy.id}-${csView}`}
                              jtbd={csJtbd}
                              policy={csPolicy}
                              customer={customer}
                              customerPolicies={customerPolicies}
                              view={csView}
                              onClose={() => {
                                closeTab(activeTab.id)
                                onClaimStatusWorkflowClose?.()
                              }}
                              onEscalationDone={onClaimStatusEscalationDone}
                            />
                          )
                        }
                        break
                      }
                        
                      case 'edit_policy_workflow':
                        // Find the policy from customerPolicies using the stored policyId
                        const editTabPolicyId = activeTab.data?.policyId
                        const editTabPolicy = customerPolicies?.find(p => p.id === editTabPolicyId) || editPolicyWorkflow?.policy
                        const editTabEditKind = activeTab.data?.editKind || editPolicyWorkflow?.editKind
                        
                        if (customer && editTabPolicy && editTabEditKind) {
                          // If this specific tab is marked as completed, show success state
                          if (activeTab.data?.isCompleted) {
                            return (
                              <div className="flex items-center justify-center h-full">
                                <div className="text-center">
                                  <div className="w-12 h-12 bg-[#0fa457] rounded-lg flex items-center justify-center mx-auto mb-3">
                                    <Check className="w-6 h-6 text-white" />
                                  </div>
                                  <p className="font-euclid text-sm font-semibold text-[#040222] mb-2">
                                    Policy Edited Successfully
                                  </p>
                                  <p className="font-euclid text-xs text-[#5b5675] mb-4">
                                    Your policy {editTabPolicy.name || editTabPolicy.vehicle} has been updated successfully.
                                  </p>
                                  <div className="bg-[#f8f7fc] rounded-lg p-3 border border-[#e7e7f0]">
                                    <p className="font-euclid text-xs font-medium text-[#36354c] mb-1">
                                      Policy: {editTabPolicy.policyNumber}
                                    </p>
                                    <p className="font-euclid text-xs text-[#5b5675]">
                                      {editTabPolicy.name || editTabPolicy.vehicle}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            )
                          }
                          
                          return (
                            <EditPolicyWorkflowPanel
                              key={`sidebar-edit-policy-${editTabPolicy.id}-${editTabEditKind}`}
                              customer={customer}
                              policy={editTabPolicy}
                              editKind={editTabEditKind}
                              scrollContainerRef={scrollContainerRef}
                              onRcEmailSent={onRcEmailSent}
                              onClose={() => closeTab(activeTab.id)}
                              onEditPolicyWorkflowComplete={() => {
                                // Mark this specific tab as completed
                                setAiActionTabs(prev => prev.map(tab => 
                                  tab.id === activeTab.id 
                                    ? { 
                                        ...tab, 
                                        title: "Policy Edited Successfully",
                                        data: { ...tab.data, isCompleted: true }
                                      }
                                    : tab
                                ))
                                
                                // Call the original completion handler
                                onEditPolicyWorkflowComplete?.()
                              }}
                              showPanelHeader={false}
                            />
                          )
                        }
                        
                        // Fallback: show a message if policy data is not available
                        if (customer && !editTabPolicy) {
                          return (
                            <div className="flex items-center justify-center h-full">
                              <div className="text-center">
                                <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                                  <Sparkles className="w-6 h-6 text-[#5b5675]" />
                                </div>
                                <p className="font-euclid text-sm text-[#5b5675] mb-2">
                                  Edit policy workflow content
                                </p>
                                <p className="font-euclid text-xs text-[#5b5675]">
                                  Loading edit policy workflow...
                                </p>
                              </div>
                            </div>
                          )
                        }
                        break
                        
                      case 'policy_detail':
                        // Find the policy from customerPolicies using the stored policyId
                        const detailTabPolicyId = activeTab.data?.policyId
                        const detailTabPolicy = customerPolicies?.find(p => p.id === detailTabPolicyId) || policyDetailForPane
                        
                        if (detailTabPolicy) {
                          return (
                            <PolicyDetailPanel
                              policy={detailTabPolicy}
                              variant="embedded"
                              showRelatedActions={false}
                              onPolicyActionClick={onCTAPressed}
                            />
                          )
                        }
                        
                        // Fallback: show a message if policy data is not available
                        return (
                          <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                              <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                                <Sparkles className="w-6 h-6 text-[#5b5675]" />
                              </div>
                              <p className="font-euclid text-sm text-[#5b5675] mb-2">
                                Policy details
                              </p>
                              <p className="font-euclid text-xs text-[#5b5675]">
                                Loading policy details...
                              </p>
                            </div>
                          </div>
                        )
                        break
                        
                      case 'self_serve_steps':
                        const stepType = activeTab.data?.stepType || "raise_claim"
                        return (
                          <div className="p-4">
                            <div className="bg-[#f8f7fc] rounded-lg p-4">
                              <h5 className="font-euclid text-sm font-semibold text-[#36354c] mb-3">
                                Customer Steps — {stepType === "raise_claim" ? "Raise Claim" : stepType === "edit_policy" ? "Edit Policy" : stepType}
                              </h5>
                              <div className="space-y-3">
                                <div className="text-xs text-[#5b5675] mb-4">Guide the customer through these steps</div>
                                {stepType === "raise_claim" && (
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-[#7c47e1] text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                                      <div className="flex-1">
                                        <h6 className="font-medium text-sm text-[#36354c] mb-1">Take Photos</h6>
                                        <p className="text-xs text-[#5b5675]">Guide customer to take clear photos of the damaged vehicle from multiple angles</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-[#7c47e1] text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                                      <div className="flex-1">
                                        <h6 className="font-medium text-sm text-[#36354c] mb-1">Upload Documents</h6>
                                        <p className="text-xs text-[#5b5675]">Help customer upload RC, driving license, and FIR if applicable</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-[#7c47e1] text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                                      <div className="flex-1">
                                        <h6 className="font-medium text-sm text-[#36354c] mb-1">Submit Claim</h6>
                                        <p className="text-xs text-[#5b5675]">Review all information and submit the claim for processing</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                                {stepType === "edit_policy" && (
                                  <div className="space-y-3">
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-[#7c47e1] text-white rounded-full flex items-center justify-center text-xs font-semibold">1</div>
                                      <div className="flex-1">
                                        <h6 className="font-medium text-sm text-[#36354c] mb-1">Select Details to Edit</h6>
                                        <p className="text-xs text-[#5b5675]">Choose which policy details need to be updated</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-[#7c47e1] text-white rounded-full flex items-center justify-center text-xs font-semibold">2</div>
                                      <div className="flex-1">
                                        <h6 className="font-medium text-sm text-[#36354c] mb-1">Provide New Information</h6>
                                        <p className="text-xs text-[#5b5675]">Enter the updated information and provide supporting documents if required</p>
                                      </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                      <div className="w-6 h-6 bg-[#7c47e1] text-white rounded-full flex items-center justify-center text-xs font-semibold">3</div>
                                      <div className="flex-1">
                                        <h6 className="font-medium text-sm text-[#36354c] mb-1">Review Changes</h6>
                                        <p className="text-xs text-[#5b5675]">Confirm all changes before submitting the policy update</p>
                                      </div>
                                    </div>
                                  </div>
                                )}
                              </div>
                            </div>
                          </div>
                        )
                        
                      case 'communication_history':
                        return (
                          <CommunicationHistoryPanel
                            customer={customer}
                            customerPolicies={customerPolicies}
                            onBack={() => closeTab(activeTab.id)}
                          />
                        )
                        
                      case 'payment_history':
                        return (
                          <PaymentHistoryPanel
                            customer={customer}
                            customerPolicies={customerPolicies}
                            onBack={() => closeTab(activeTab.id)}
                          />
                        )
                        
                      case 'nearby_garages':
                        return (
                          <NearbyGaragesPanel className="p-1" />
                        )

                      case 'similar_cases':
                        return (
                          <SimilarCasesPanel className="p-1" />
                        )

                      case 'task_history':
                        // Mock task history data - in real implementation, this would come from props or API
                        const taskHistoryData = [
                          {
                            id: 1,
                            timestamp: "14 May 2026 at 3:30 PM",
                            description: "Raise a claim - Ecosport Titanium 2025",
                            agent: "CX Priya",
                            duration: "12m 15s"
                          },
                          {
                            id: 2,
                            timestamp: "14 May 2026 at 3:30 PM",
                            description: "Send communication - Policy documents - Honda Activa 2020",
                            agent: "CX Priya",
                            duration: "12m 15s"
                          },
                          {
                            id: 3,
                            timestamp: "14 May 2026 at 3:30 PM",
                            description: "Edit policy - Edit Engine chasis number - Ecosport Titanium 2025",
                            agent: "CX Priya",
                            duration: "12m 15s"
                          }
                        ]

                        return (
                          <div className="flex flex-col gap-4 p-0">
                            {taskHistoryData.map((task) => (
                              <div 
                                key={task.id} 
                                className="border border-[#e7e7f0] rounded-[12px] px-4 py-[16px]"
                              >
                                <div className="flex flex-col gap-2">
                                  <div className="font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                                    {task.timestamp}
                                  </div>
                                  <div className="font-euclid text-[14px] font-medium leading-[20px] text-[#5b5675]">
                                    {task.description}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        )
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
                  <div className="h-full flex flex-col relative">
                    {/* Header with 3-dot menu for no active section */}
                    <div className="mb-3">
                      <div className="flex items-center justify-end pt-3 pb-0 border-0">
                        <div className="relative">
                          <button
                            type="button"
                            onClick={() => setShowTabsDropdown(!showTabsDropdown)}
                            className="flex items-center justify-center w-6 h-6 hover:bg-[#f0f0f6] rounded transition-colors"
                            aria-label="Workflow Menu"
                          >
                            <MoreVertical className="w-4 h-4 text-[#5b5675]" />
                          </button>
                          
                          {/* Workflow Dropdown */}
                          {showTabsDropdown && (
                            <>
                              <div 
                                className="fixed inset-0 z-40"
                                onClick={() => setShowTabsDropdown(false)}
                              />
                              <div className="absolute top-8 right-0 z-50 w-48 bg-white rounded-lg border border-[#e7e7f0] shadow-[0px_4px_4px_-2px_rgba(54,53,76,0.06)]">
                                <div className="py-[6px]">
                                  <button
                                    onClick={() => {
                                      // Create a new tab for task history
                                      createAIActionTab('task_history', 'Task History')
                                      setShowTabsDropdown(false)
                                      // Auto-switch to AI section
                                      onSectionChange?.("ai")
                                    }}
                                    className="flex items-center gap-3 w-full px-4 py-2 text-left hover:bg-[#f8f7fc] transition-colors"
                                  >
                                    <div className="font-euclid text-sm text-[#040222]">
                                      View task history
                                    </div>
                                  </button>
                                </div>
                              </div>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-start justify-center h-full pt-16">
                      <div className="text-center">
                        <div className="w-12 h-12 bg-[#f8f7fc] rounded-lg flex items-center justify-center mx-auto mb-3">
                          <Sparkles className="w-6 h-6 text-[#5b5675]" />
                        </div>
                        <p className="font-euclid text-sm text-[#5b5675]">
                          AI workflows will appear here
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
            </div>{/* end left content pane */}

            {/* Right side: power tools panel — only in manual mode when power-tools tab is active */}
            {isManualMode && activeRailTab === "power-tools" && (
              <div className="flex min-h-0 shrink-0 flex-col border-l border-[#e7e7f0] overflow-hidden" style={{ width: contentPaneWidth }}>
                <HelloPowerToolsPanel onToolClick={handleManualActionClick} />
              </div>
            )}

          </div>{/* end flex-row content area */}
          </div>{/* end flex-1 wrapper */}
          <HelloRightPanelIconRail
            activeTab={activeRailTab}
            onTabChange={handleRailTabChange}
            manualMode={manualModeRailProps}
            className="overflow-visible"
          />
        </div>
      )}
      <ToastContainer toasts={toasts} onRemove={removeToast} />
    </div>
  )
}