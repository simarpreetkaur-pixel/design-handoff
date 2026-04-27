import { useParams, useNavigate } from "react-router-dom"
import { useMemo, useState, useRef, useCallback, useEffect } from "react"

import { useCall } from "@/context/CallContext"
import { mockCustomers } from "@/data/mockCustomers"
import type { JTBD, JTBDType } from "@/types/crm"
import { CustomerProfileCard } from "@/components/crm/CustomerProfileCard"
import { EditPhoneDialog } from "@/components/crm/EditPhoneDialog"
import { JTBDPanel } from "@/components/crm/JTBDPanel"
import { AIChatPanel, type AIChatCaseContext } from "@/components/crm/AIChatPanel"
import type { FlowActionValue } from "@/components/crm/ActionDetailPage"
import { QuickActionDetailPage, type QuickActionKey } from "@/components/crm/QuickActionDetailPage"
import { QuickActionsButton } from "@/components/crm/QuickActionsButton"
import { OzontelEndCallModal } from "@/components/OzontelEndCallModal"
import { OzontelDialer } from "@/components/OzontelDialer"

export function CRMView() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const callState = useCall()

  // AI Chat panel state
  const [aiChatWidth, setAiChatWidth] = useState(() => Math.round(334 * 1.1)) // +10% vs 334px ≈ 367px
  const [isResizing, setIsResizing] = useState(false)
  const [aiChatActive, setAiChatActive] = useState(false)
  const [preWrittenMessage, setPreWrittenMessage] = useState("")
  /** Bumps on each "Ask in chat" so the chat prefill effect runs once per click. */
  const [askInChatNonce, setAskInChatNonce] = useState(0)
  const aiChatRef = useRef<HTMLDivElement>(null)
  
  // Ozontel states
  const [endCallModalOpen, setEndCallModalOpen] = useState(false)
  const [ozontelDialerVisible, setOzontelDialerVisible] = useState(false)
  
  // Phone edit state
  const [displayLookupPhone, setDisplayLookupPhone] = useState("")
  const [editPhoneDialogOpen, setEditPhoneDialogOpen] = useState(false)

  const [aiJtbdType, setAiJtbdType] = useState<JTBDType>("claim")
  const [selectedJtbd, setSelectedJtbd] = useState<JTBD | null>(null)
  /** Drives in-panel flow from AI chat CTA (same as Agent’s Next Actions). */
  const [flowActionFromChat, setFlowActionFromChat] = useState<FlowActionValue | null>(null)
  const [quickActionDetail, setQuickActionDetail] = useState<QuickActionKey | null>(null)
  const [quickActionDetailLabel, setQuickActionDetailLabel] = useState<string | null>(null)
  
  const DEFAULT_CHAT_WIDTH = Math.round(334 * 1.1)
  const MIN_CHAT_WIDTH = DEFAULT_CHAT_WIDTH
  const MAX_CHAT_WIDTH = Math.floor(DEFAULT_CHAT_WIDTH * 1.3)

  const data = useMemo(() => {
    if (!customerId) return null
    return mockCustomers[customerId] ?? null
  }, [customerId])

  // Sync call state with current customer on mount
  useEffect(() => {
    if (customerId && data && callState.state === 'idle') {
      // If we're viewing CRM but not in an active call, set viewing_crm state
      callState.openCRMForCustomer(customerId, data)
    }
  }, [customerId, data, callState])

  // Initialize and reset display phone when customer changes
  useEffect(() => {
    if (data?.customer) {
      setDisplayLookupPhone(data.customer.phone)
    }
  }, [data?.customer, customerId])

  useEffect(() => {
    setSelectedJtbd(null)
  }, [customerId])

  const openChatWithPrefill = (message: string, jtbdType: JTBDType) => {
    setAiJtbdType(jtbdType)
    setAiChatActive(true)
    if (message) {
      setPreWrittenMessage(message)
      setAskInChatNonce((n) => n + 1)
    }
    if (aiChatRef.current) {
      aiChatRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }

  const handleAskInChat = (message: string, jtbdType: JTBDType) => {
    openChatWithPrefill(message, jtbdType)
  }

  const handleAiGuideViewDetails = (message: string, jtbdType: JTBDType) => {
    openChatWithPrefill(message, jtbdType)
  }

  const handleMessageUsed = useCallback(() => {
    setPreWrittenMessage("")
  }, [])

  const handleJtbdSelected = useCallback((j: JTBD) => {
    setAiJtbdType(j.type)
    setSelectedJtbd(j)
  }, [])

  const chatCaseContext = useMemo((): AIChatCaseContext | null => {
    if (!data || !selectedJtbd) return null
    const { activePolicies } = data
    const firstToken = selectedJtbd.vehicle.split(/\s+/)[0]
    const motor =
      (firstToken
        ? activePolicies.find(
            (p) =>
              p.vehicle && p.vehicle.toLowerCase().includes(firstToken.toLowerCase()),
          )
        : undefined) ?? activePolicies.find((p) => p.type === "Motor Insurance")
    return {
      jtbdLabel: selectedJtbd.title,
      vehicle: selectedJtbd.vehicle,
      jtbdType: selectedJtbd.type,
      policyNumber: motor?.policyNumber,
    }
  }, [data, selectedJtbd])

  const consumeOpenFlowFromChat = useCallback(() => {
    setFlowActionFromChat(null)
  }, [])

  const handleCrmFlowFromChat = useCallback((action: FlowActionValue) => {
    setFlowActionFromChat(action)
  }, [])

  const closeQuickActionDetail = useCallback(() => {
    setQuickActionDetail(null)
    setQuickActionDetailLabel(null)
  }, [])

  const handleOpenQuickRelatedAction = useCallback(
    (key: QuickActionKey, label: string) => {
      setQuickActionDetailLabel(label)
      setQuickActionDetail(key)
    },
    [],
  )

  const isCrmOngoingSession =
    callState.state === "active_call" || callState.state === "viewing_crm"

  const handleOzontelClick = () => {
    // CRM is opened in viewing_crm; answered calls use active_call — both get End Call, not the dialer
    if (isCrmOngoingSession) {
      setEndCallModalOpen(true)
    } else {
      setOzontelDialerVisible(true)
    }
  }

  const handleEndCall = () => {
    // End the call and reset call state, then navigate back to homepage
    callState.endCall()
    setEndCallModalOpen(false)
    navigate("/", { state: { omniCallToast: "dispose" } })
  }

  const handleCloseEndCallModal = () => {
    setEndCallModalOpen(false)
  }

  const handleCloseOzontelDialer = () => {
    setOzontelDialerVisible(false)
  }

  const handleCall = (phoneNumber: string) => {
    // Mock call functionality
    console.log('Calling:', phoneNumber)
    setOzontelDialerVisible(false)
    alert(`Calling ${phoneNumber}... (Mock call)`)
  }

  const handleEditPhone = () => {
    setEditPhoneDialogOpen(true)
  }

  const handleSavePhone = (newPhone: string) => {
    setDisplayLookupPhone(newPhone)
    // TODO: In a real implementation, this would trigger a new customer lookup
  }

  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    e.preventDefault()
    setIsResizing(true)
  }, [])

  useEffect(() => {
    if (!isResizing) return

    const onMove = (e: MouseEvent) => {
      const newWidth = window.innerWidth - e.clientX
      const clampedWidth = Math.max(
        MIN_CHAT_WIDTH,
        Math.min(MAX_CHAT_WIDTH, newWidth),
      )
      setAiChatWidth(clampedWidth)
    }
    const onUp = () => setIsResizing(false)

    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
    document.body.style.cursor = "col-resize"
    document.body.style.userSelect = "none"

    return () => {
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
      document.body.style.cursor = ""
      document.body.style.userSelect = ""
    }
  }, [isResizing, MIN_CHAT_WIDTH, MAX_CHAT_WIDTH])

  if (!data) {
    return (
      <div className="flex min-h-screen w-full flex-col items-center justify-center bg-[#fafafa]">
        <p className="text-base text-[#6c6c80]">Customer not found.</p>
        <button
          onClick={() => navigate("/")}
          className="mt-4 rounded-md bg-[#7c47e1] px-4 py-2 text-sm font-semibold text-white"
        >
          Go to Home
        </button>
      </div>
    )
  }

    const { customer, jtbds, activePolicies, inactivePolicies } = data

  return (
    <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fafafa]">
        {/* Top Navigation — Figma 8238:63527: shadow below bar; z-index so shadow isn’t lost */}
        <div className="relative z-20 flex h-[72px] w-full items-center gap-[14px] bg-white px-[40px] py-[18px] shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]">
        <div className="flex h-[36px] w-[158px] items-center overflow-hidden">
          <img
            src="/acko-logo.png"
            alt="ACKO"
            className="h-[36px] w-auto object-contain"
          />
        </div>

        <div className="flex h-[26px] w-0 items-center justify-center">
          <div className="h-0 w-[26px] rotate-90 border-t border-[#e7e7f0]" />
        </div>

        <div className="flex min-w-0 flex-1 items-center">
          <h1 className="truncate font-euclid text-[28px] font-normal leading-[1.2] text-[#2c2067]">
            OMNI Support
          </h1>
        </div>
      </div>

      {/* Body - Two panel layout */}
      <div className="flex h-[calc(100vh-72px)] w-full">
        {/* Left Panel - Main content with profile and JTBD */}
        <div className="relative h-full min-h-0 flex-1 overflow-hidden bg-[#fafafa]">
          <div className="relative h-full min-h-0">
            <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain pb-24 [scrollbar-gutter:stable] px-8">
              <div className="flex flex-col gap-6 py-6 w-full">
                {/* Customer Profile Card */}
                <CustomerProfileCard
                  customer={customer}
                  displayLookupPhone={displayLookupPhone}
                  onEditPhone={handleEditPhone}
                />

                {/* JTBD Panel */}
                <JTBDPanel
                  key={customerId}
                  customerId={customerId}
                  jtbds={jtbds}
                  activePolicies={activePolicies}
                  inactivePolicies={inactivePolicies}
                  onAskInChat={handleAskInChat}
                  onAiGuideViewDetails={handleAiGuideViewDetails}
                  onSelectedJtbdChange={handleJtbdSelected}
                  onOpenQuickRelatedAction={handleOpenQuickRelatedAction}
                  openFlowFromParent={flowActionFromChat}
                  onOpenFlowFromParentConsumed={consumeOpenFlowFromChat}
                />
              </div>
            </div>
            {quickActionDetail ? (
              <div
                className="absolute inset-0 z-[70] min-h-0 overflow-y-auto overflow-x-hidden bg-[#fafafa] [scrollbar-gutter:stable]"
                role="dialog"
                aria-label="Quick action"
              >
                <QuickActionDetailPage
                  actionKey={quickActionDetail}
                  actionLabel={quickActionDetailLabel}
                  onBack={closeQuickActionDetail}
                />
              </div>
            ) : null}
            {quickActionDetail ? null : (
              <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-end p-6">
                <div className="pointer-events-auto">
                  <QuickActionsButton
                    onSelectAction={(k) => {
                      setQuickActionDetailLabel(null)
                      setQuickActionDetail(k)
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>

          {/* Right Panel - Resizable AI Chat Panel */}
          <div className="relative h-full bg-white overflow-y-auto shrink-0 border-l border-[#e7e7f0]" style={{ width: `${aiChatWidth}px` }}>
            
            {/* Resize handle: wide hit area so drag is reliable (16px) */}
            <div
              className="absolute -left-2 top-0 z-10 flex h-full w-4 cursor-col-resize select-none items-stretch justify-center"
              onMouseDown={handleMouseDown}
              role="separator"
              aria-orientation="vertical"
              aria-label="Resize AI chat panel"
            >
              <span className="h-full w-px bg-[#e7e7f0] transition-colors hover:bg-[#7c47e1]" />
            </div>
            
            <div ref={aiChatRef} className={`h-full transition-all duration-200 ${aiChatActive ? 'ring-2 ring-[#7c47e1] ring-opacity-20' : ''}`}>
              <AIChatPanel
                isActive={aiChatActive}
                preWrittenMessage={preWrittenMessage}
                askInChatNonce={askInChatNonce}
                onMessageUsed={handleMessageUsed}
                activeJtbdType={aiJtbdType}
                chatMockCase={
                  customerId === "anita-sharma"
                    ? "kyc_issuance"
                    : customerId === "raj-kapoor"
                    ? "raj_cold_nexon"
                    : "default"
                }
                caseContext={chatCaseContext}
                onCrmFlowAction={handleCrmFlowFromChat}
              />
            </div>
          </div>
      </div>

        {/* Ozontel Dialer Icon - Bottom Left */}
        <img
          onClick={handleOzontelClick}
          src="/icons/ozontel-dialer-icon.png"
          alt="Ozontel Dialer"
          className="fixed bottom-6 left-6 z-[60] h-14 w-14 cursor-pointer object-contain"
          title={isCrmOngoingSession ? "End Call" : "Open Dialer"}
        />

        {/* Ozontel End Call Modal */}
        <OzontelEndCallModal
          isVisible={endCallModalOpen}
          onEndCall={handleEndCall}
          onClose={handleCloseEndCallModal}
        />

        {/* Ozontel Dialer - for non-active call states */}
        <OzontelDialer
          isVisible={ozontelDialerVisible && !isCrmOngoingSession}
          onAnswerCall={() => {}} // Not used in CRM view context
          onClose={handleCloseOzontelDialer}
          onCall={handleCall}
        />

        {/* Edit Phone Dialog */}
        <EditPhoneDialog
          open={editPhoneDialogOpen}
          onOpenChange={setEditPhoneDialogOpen}
          currentPhone={displayLookupPhone}
          onSave={handleSavePhone}
        />
    </div>
  )
}
