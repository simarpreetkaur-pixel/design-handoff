import { useEffect, useMemo, useState } from "react"
import { CheckCircle2, FileText, RefreshCw } from "lucide-react"

import type { InactivePolicy, JTBD, JTBDType, Policy } from "@/types/crm"
import { canonicalOngoingJtbdTitle } from "@/lib/canonicalOngoingLabels"
import { ClaimStatusTimeline } from "@/components/crm/ClaimStatusTimeline"
import { AgentActions } from "@/components/crm/AgentActions"
import {
  ActionDetailPage,
  SendCommunicationPanel,
  communicationAckSubtitle,
  type CommunicationChannel,
  type FlowActionValue,
} from "@/components/crm/ActionDetailPage"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { ActivePoliciesPanel } from "@/components/crm/ActivePoliciesPanel"
import { InactivePoliciesPanel } from "@/components/crm/InactivePoliciesPanel"
import { RelatedSopsSection } from "@/components/crm/RelatedSopsSection"
import {
  quickActionKeyForIndex,
  type QuickActionKey,
} from "@/components/crm/QuickActionDetailPage"
import { resolvePolicyForJtbd } from "@/lib/resolvePolicyForJtbd"
import {
  formatClaimHandlerAppointmentDisplay,
  type ClaimHandlerAppointmentValue,
} from "@/components/crm/ClaimHandlerAppointmentModal"
import { RequestRcCopyModal } from "@/components/crm/RequestRcCopyModal"
import { KycOpsEscalationModal } from "@/components/crm/KycOpsEscalationModal"

/** Short draft for the chat box; agent can edit before sending */
const ASK_IN_CHAT_CLAIM = "What should I do next for garage drop-off?"

const ASK_IN_CHAT_RENEWAL = "What order: renewal quote (NCB) → WhatsApp/SMS link?"

function resolveInitialJtbdId(jtbds: JTBD[], initialSelectedJtbdId: string | undefined): string {
  if (initialSelectedJtbdId && jtbds.some((j) => j.id === initialSelectedJtbdId)) {
    return initialSelectedJtbdId
  }
  return jtbds.find((j) => j.isActive)?.id ?? jtbds[0]?.id ?? ""
}

function CommunicationAckToast({
  channel,
  onDismiss,
}: {
  channel: CommunicationChannel | null
  onDismiss: () => void
}) {
  if (!channel) return null
  return (
    <div
      role="status"
      className="fixed bottom-6 right-6 z-[80] max-w-sm rounded-lg border border-[#e7e7f0] bg-white p-4 shadow-lg"
    >
      <div className="flex items-start gap-3">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
          <CheckCircle2 className="h-4 w-4 text-[#15803d]" aria-hidden />
        </div>
        <div className="min-w-0 flex-1 pt-0.5">
          <p className="font-euclid text-[14px] font-medium leading-5 text-[#040222]">
            Communication queued
          </p>
          <p className="mt-0.5 font-euclid text-[13px] font-normal leading-5 text-[#5b5675]">
            {communicationAckSubtitle(channel)}
          </p>
        </div>
        <button
          type="button"
          onClick={onDismiss}
          className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#5b5675] hover:bg-[#f4f4f6]"
          aria-label="Dismiss"
        >
          ×
        </button>
      </div>
    </div>
  )
}

type TabKey = "ongoing" | "active" | "inactive"

interface JTBDPanelProps {
  customerId?: string
  jtbds: JTBD[]
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  onAskInChat?: (message: string, jtbdType: JTBDType) => void
  /** Opens AI chat and focuses the composer without prefilling (Agent “Ask in the chat”). */
  onFocusChatComposer?: (jtbdType: JTBDType) => void
  claimHandlerAppointment?: ClaimHandlerAppointmentValue | null
  onCancelClaimHandlerAppointment?: () => void
  onEditClaimHandlerAppointment?: () => void
  /** From AI chat “Go to raise a claim” — open Active policies + raise-claim detail for this policy id. */
  raiseClaimFocusRequest?: { nonce: number; policyId: string } | null
  onRaiseClaimFocusConsumed?: () => void
  onSelectedJtbdChange?: (jtbd: JTBD) => void
  /** Open center-panel quick action detail (same overlay as global Quick Actions FAB). */
  onOpenQuickRelatedAction?: (key: QuickActionKey, label: string) => void
  /**
   * When the parent sets this (e.g. AI chat CTA), opens the same in-panel flow as Agent’s Next Actions.
   * Parent should clear `onOpenFlowFromParentConsumed` after open.
   */
  openFlowFromParent?: FlowActionValue | null
  onOpenFlowFromParentConsumed?: () => void
  /** From homepage demo or deep-link: pre-select a JTBD card */
  initialSelectedJtbdId?: string
  /** Ayush renewal: transfer opens Ozontel-style panel instead of action detail */
  onPresalesTransferClick?: () => void
  /** Raj RSA demo: open Ozontel transfer strip instead of action detail page */
  onRsaTransferOzontelOpen?: () => void
  /** Default “To” email when opening Request RC copy modal (agent can edit). */
  customerEmailForRcRequest?: string
  /** Default WhatsApp number when opening Request RC copy modal (agent can edit). */
  customerPhoneForRcRequest?: string
  /** Display name for escalation modals (e.g. KYC Ops). */
  customerDisplayName?: string
  /** Increment from parent (e.g. Quick Actions FAB “Request document”) to open Request RC modal. */
  openRequestRcFromFabNonce?: number
  /**
   * When false, hides “Ask in the chat” under Agent next actions.
   * Default: hidden for Ayush renewal only; parent can force off (e.g. RSA transfer-only journey).
   */
  showAgentAskInChat?: boolean
}

export function JTBDPanel({
  customerId,
  jtbds,
  activePolicies,
  inactivePolicies,
  onAskInChat,
  onFocusChatComposer,
  claimHandlerAppointment = null,
  onCancelClaimHandlerAppointment,
  onEditClaimHandlerAppointment,
  raiseClaimFocusRequest = null,
  onRaiseClaimFocusConsumed,
  onSelectedJtbdChange,
  onOpenQuickRelatedAction,
  openFlowFromParent,
  onOpenFlowFromParentConsumed,
  initialSelectedJtbdId,
  onPresalesTransferClick,
  onRsaTransferOzontelOpen,
  customerEmailForRcRequest,
  customerPhoneForRcRequest,
  customerDisplayName,
  openRequestRcFromFabNonce = 0,
  showAgentAskInChat,
}: JTBDPanelProps) {
  const hasJtbds = jtbds.length > 0
  const [activeTab, setActiveTab] = useState<TabKey>(jtbds.length === 0 ? "active" : "ongoing")
  const [requestRcModalOpen, setRequestRcModalOpen] = useState(false)
  const [requestRcSentToastOpen, setRequestRcSentToastOpen] = useState(false)
  const [requestRcSentChannel, setRequestRcSentChannel] = useState<
    "email" | "whatsapp" | null
  >(null)
  const [selectedJtbdId, setSelectedJtbdId] = useState<string>(() =>
    resolveInitialJtbdId(jtbds, initialSelectedJtbdId),
  )
  const [detailActionKey, setDetailActionKey] = useState<string | null>(null)
  const [claimContextPolicy, setClaimContextPolicy] = useState<Policy | null>(null)
  const [endorsementContextPolicy, setEndorsementContextPolicy] = useState<Policy | null>(null)
  const [agentCommunicationOpen, setAgentCommunicationOpen] = useState(false)
  const [agentCommunicationChannel, setAgentCommunicationChannel] =
    useState<CommunicationChannel>("whatsapp")
  const [agentDialogPolicyOverride, setAgentDialogPolicyOverride] = useState<Policy | null>(null)

  const selectedJtbd = jtbds.find((j) => j.id === selectedJtbdId)

  const [kycOpsEscalateOpen, setKycOpsEscalateOpen] = useState(false)

  const [communicationAckChannel, setCommunicationAckChannel] = useState<CommunicationChannel | null>(
    null,
  )

  useEffect(() => {
    if (!requestRcSentToastOpen) return
    const t = window.setTimeout(() => setRequestRcSentToastOpen(false), 4500)
    return () => window.clearTimeout(t)
  }, [requestRcSentToastOpen])

  useEffect(() => {
    if (communicationAckChannel === null) return
    const t = window.setTimeout(() => setCommunicationAckChannel(null), 4500)
    return () => window.clearTimeout(t)
  }, [communicationAckChannel])

  const kycEscalationContext = useMemo(() => {
    if (customerId !== "anita-sharma-claim-payment-kyc") return null
    const policyNumber = activePolicies[0]?.policyNumber?.trim() || "—"
    return {
      claimId: "CLM-OD-2026-104382",
      policyNumber,
      customerName: customerDisplayName?.trim() || "Anita Sharma",
    }
  }, [customerId, activePolicies, customerDisplayName])

  const resolvedShowAgentAskInChat =
    showAgentAskInChat !== undefined ? showAgentAskInChat : customerId !== "ayush-singhal"

  const jtbdAlertContextPolicy = useMemo(() => {
    if (!selectedJtbd || activePolicies.length === 0) return null
    return resolvePolicyForJtbd(selectedJtbd, activePolicies)
  }, [selectedJtbd, activePolicies])

  useEffect(() => {
    setSelectedJtbdId(resolveInitialJtbdId(jtbds, initialSelectedJtbdId))
  }, [customerId, jtbds, initialSelectedJtbdId])

  useEffect(() => {
    if (!raiseClaimFocusRequest) return
    const pol = activePolicies.find((p) => p.id === raiseClaimFocusRequest.policyId)
    if (!pol) {
      onRaiseClaimFocusConsumed?.()
      return
    }
    setActiveTab("active")
    setClaimContextPolicy(pol)
    setDetailActionKey("raise_claim")
    onRaiseClaimFocusConsumed?.()
  }, [raiseClaimFocusRequest, activePolicies, onRaiseClaimFocusConsumed])

  useEffect(() => {
    if (!openFlowFromParent) return
    if (
      openFlowFromParent === "transfer_to_presales" &&
      onPresalesTransferClick &&
      customerId === "ayush-singhal"
    ) {
      onPresalesTransferClick()
      onOpenFlowFromParentConsumed?.()
      return
    }
    if (openFlowFromParent === "send_alert" || openFlowFromParent === "send_communication") {
      setAgentDialogPolicyOverride(null)
      setAgentCommunicationChannel(openFlowFromParent === "send_alert" ? "acko_alert" : "whatsapp")
      setAgentCommunicationOpen(true)
      onOpenFlowFromParentConsumed?.()
      return
    }
    if (openFlowFromParent === "advisor_ui") {
      setClaimContextPolicy(null)
      setEndorsementContextPolicy(jtbdAlertContextPolicy ?? activePolicies[0] ?? null)
      setDetailActionKey("advisor_ui")
      onOpenFlowFromParentConsumed?.()
      return
    }
    if (openFlowFromParent === "transfer_to_rsa_team" && onRsaTransferOzontelOpen) {
      onRsaTransferOzontelOpen()
      onOpenFlowFromParentConsumed?.()
      return
    }
    setClaimContextPolicy(null)
    setEndorsementContextPolicy(null)
    setDetailActionKey(openFlowFromParent)
    onOpenFlowFromParentConsumed?.()
  }, [
    openFlowFromParent,
    onOpenFlowFromParentConsumed,
    onPresalesTransferClick,
    onRsaTransferOzontelOpen,
    customerId,
    jtbdAlertContextPolicy,
    activePolicies,
  ])

  useEffect(() => {
    if (openRequestRcFromFabNonce > 0) {
      setRequestRcModalOpen(true)
    }
  }, [openRequestRcFromFabNonce])

  useEffect(() => {
    if (!hasJtbds && activeTab === "ongoing") {
      setActiveTab("active")
    }
  }, [hasJtbds, activeTab])

  useEffect(() => {
    if (selectedJtbd) onSelectedJtbdChange?.(selectedJtbd)
  }, [selectedJtbd, onSelectedJtbdChange])

  const handleActionClick = (actionType: string) => {
    if (actionType === "transfer_to_presales" && onPresalesTransferClick) {
      onPresalesTransferClick()
      return
    }
    if (actionType === "request_rc_email") {
      setRequestRcModalOpen(true)
      return
    }
    if (actionType === "send_alert" || actionType === "send_communication") {
      setAgentDialogPolicyOverride(null)
      setAgentCommunicationChannel(actionType === "send_alert" ? "acko_alert" : "whatsapp")
      setAgentCommunicationOpen(true)
      return
    }
    if (actionType === "advisor_ui") {
      setClaimContextPolicy(null)
      setEndorsementContextPolicy(jtbdAlertContextPolicy ?? activePolicies[0] ?? null)
      setDetailActionKey("advisor_ui")
      return
    }
    if (actionType === "endorsements") {
      setClaimContextPolicy(null)
      setEndorsementContextPolicy(jtbdAlertContextPolicy ?? activePolicies[0] ?? null)
      setDetailActionKey("endorsements")
      return
    }
    if (actionType === "raise_claim") {
      setClaimContextPolicy(jtbdAlertContextPolicy ?? activePolicies[0] ?? null)
      setEndorsementContextPolicy(null)
      setDetailActionKey("raise_claim")
      return
    }
    if (actionType === "transfer_to_rsa_team" && onRsaTransferOzontelOpen) {
      onRsaTransferOzontelOpen()
      return
    }
    if (
      actionType === "send_email" ||
      actionType === "rc_licence_send_email" ||
      actionType === "transfer_to_team" ||
      actionType === "transfer_to_presales"
    ) {
      setEndorsementContextPolicy(null)
      setDetailActionKey(actionType)
    }
  }

  const handleBackToMain = () => {
    setDetailActionKey(null)
    setClaimContextPolicy(null)
    setEndorsementContextPolicy(null)
  }

  const closeAgentCommunication = () => {
    setAgentCommunicationOpen(false)
    setAgentDialogPolicyOverride(null)
  }

  const defaultCommunicationPolicy =
    agentDialogPolicyOverride ?? jtbdAlertContextPolicy ?? activePolicies[0] ?? null

  const handlePolicyActionClick = (action: string, policy?: Policy) => {
    if (action === "send_alert") {
      setAgentDialogPolicyOverride(policy ?? null)
      setAgentCommunicationChannel("acko_alert")
      setAgentCommunicationOpen(true)
      return
    }
    if (action === "send_communication") {
      setAgentDialogPolicyOverride(policy ?? null)
      setAgentCommunicationChannel("whatsapp")
      setAgentCommunicationOpen(true)
      return
    }
    if (action === "raise_claim" && policy) {
      setClaimContextPolicy(policy)
      setEndorsementContextPolicy(null)
    } else if (action === "endorsements") {
      setClaimContextPolicy(null)
      setEndorsementContextPolicy(policy ?? activePolicies[0] ?? null)
    } else {
      setClaimContextPolicy(null)
      setEndorsementContextPolicy(null)
    }
    setDetailActionKey(action)
  }

  const handleOpenRelatedSop = (detailActionKey: string) => {
    setClaimContextPolicy(null)
    setEndorsementContextPolicy(null)
    setDetailActionKey(detailActionKey)
  }

  if (detailActionKey) {
    return (
      <>
        <ActionDetailPage
          actionKey={detailActionKey}
          onBack={handleBackToMain}
          claimPolicy={detailActionKey === "raise_claim" ? claimContextPolicy : null}
          endorsementPolicy={
            detailActionKey === "endorsements" || detailActionKey === "advisor_ui"
              ? endorsementContextPolicy
              : null
          }
          jtbdContextPolicy={jtbdAlertContextPolicy}
          activePolicies={activePolicies}
          onAskInChatFromAction={onAskInChat}
          customerId={customerId}
          onCommunicationSent={(channel) => setCommunicationAckChannel(channel)}
        />
        <CommunicationAckToast
          channel={communicationAckChannel}
          onDismiss={() => setCommunicationAckChannel(null)}
        />
      </>
    )
  }

  return (
    <div className="w-full">
      {/* Tabs - full width layout */}
      <div className="relative h-[58px] bg-[#fafafa] w-full">
        <div className="absolute bottom-0 left-0 right-0 flex h-px items-center justify-center">
          <div className="h-full w-full bg-[#e7e7f0]" />
        </div>
        <div className="absolute bottom-0 left-0 right-0 flex items-center justify-center">
          <div className="flex w-full">
            {hasJtbds && (
            <button
              onClick={() => setActiveTab("ongoing")}
              className="flex flex-1 flex-col items-center cursor-pointer"
            >
              <div className="flex h-[54px] items-center justify-center overflow-hidden rounded-[36px] px-[16px] py-[8px]">
                <div className={`font-euclid text-[14px] leading-[22px] whitespace-nowrap ${
                  activeTab === "ongoing" 
                    ? "font-medium text-[#040222]" 
                    : "font-normal text-[#5b5675]"
                }`}>
                  Ongoing JTBD ({jtbds.length})
                </div>
              </div>
              <div className={`h-[4px] w-full rounded-[4px] ${
                activeTab === "ongoing" 
                  ? "bg-[#0fa457]" 
                  : "bg-white opacity-0"
              }`} />
            </button>
            )}
            
            {/* Active policies */}
            <button
              onClick={() => setActiveTab("active")}
              className="flex flex-1 flex-col items-center cursor-pointer"
            >
              <div className="flex h-[54px] items-center justify-center overflow-hidden rounded-[36px] px-[16px] py-[8px]">
                <div className={`font-euclid text-[14px] leading-[22px] whitespace-nowrap ${
                  activeTab === "active" 
                    ? "font-medium text-[#040222]" 
                    : "font-normal text-[#5b5675]"
                }`}>
                  Active policies ({activePolicies.length})
                </div>
              </div>
              <div className={`h-[4px] w-full rounded-[4px] ${
                activeTab === "active" 
                  ? "bg-[#0fa457]" 
                  : "bg-white opacity-0"
              }`} />
            </button>
            
            {/* Tab 3 - Inactive policies */}
            <button
              onClick={() => setActiveTab("inactive")}
              className="flex flex-1 flex-col items-center cursor-pointer"
            >
              <div className="flex h-[54px] items-center justify-center overflow-hidden rounded-[36px] px-[16px] py-[8px]">
                <div className={`font-euclid text-[14px] leading-[22px] whitespace-nowrap ${
                  activeTab === "inactive" 
                    ? "font-medium text-[#040222]" 
                    : "font-normal text-[#5b5675]"
                }`}>
                  Inactive policies ({inactivePolicies.length})
                </div>
              </div>
              <div className={`h-[4px] w-full rounded-[4px] ${
                activeTab === "inactive" 
                  ? "bg-[#0fa457]" 
                  : "bg-white opacity-0"
              }`} />
            </button>
            
          </div>
        </div>
      </div>

      {/* Content based on active tab - no horizontal padding (handled by parent) */}
      <div className="py-6 w-full">
        
        {/* Ongoing JTBD Tab Content */}
        {activeTab === "ongoing" && hasJtbds && (
          <>
            <div className="flex flex-wrap gap-4 mb-[20px] w-full">
              {jtbds.map((jtbd) => (
                <button
                  key={jtbd.id}
                  onClick={() => setSelectedJtbdId(jtbd.id)}
                  className={`flex min-w-[228px] flex-1 max-w-[280px] flex-wrap items-start justify-center overflow-hidden border border-[#e7e7f0] px-[16px] py-[12px] rounded-[12px] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer ${
                    selectedJtbdId === jtbd.id
                      ? "bg-gradient-to-b from-[#7c47e1] to-[#44277b]"
                      : "bg-white hover:shadow-[0px_4px_8px_0px_rgba(0,0,0,0.12)]"
                  }`}
                >
                  <div className="flex w-full flex-col items-start">
                    <div className="flex w-full flex-col items-start gap-[8px]">
                      <div className="flex w-full items-center">
                        <div className="flex items-center gap-[4px]">
                          <div className="size-[16px] overflow-hidden">
                            {jtbd.type === "renewal" ? (
                              <RefreshCw className={`h-[16px] w-[16px] ${
                                selectedJtbdId === jtbd.id ? "text-white" : "text-[#36354c]"
                              }`} />
                            ) : (
                              <FileText className={`h-[16px] w-[16px] ${
                                selectedJtbdId === jtbd.id ? "text-white" : "text-[#7c47e1]"
                              }`} />
                            )}
                          </div>
                          <div className={`font-euclid text-[14px] font-medium leading-[20px] ${
                            selectedJtbdId === jtbd.id ? "text-white" : "text-[#36354c]"
                          }`}>
                            {canonicalOngoingJtbdTitle(jtbd)}
                          </div>
                        </div>
                      </div>
                      <div className={`font-euclid text-[14px] font-normal leading-[20px] break-words ${
                        selectedJtbdId === jtbd.id ? "text-white" : "text-[#36354c]"
                      }`}>
                        {jtbd.vehicle}
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {/* Selected JTBD Details */}
            {selectedJtbd && (
              <div className="flex flex-col gap-[20px] w-full">

                {/* Status — omit when no steps (e.g. Ayush renewal) */}
                {(selectedJtbd.status?.length ?? 0) > 0 ? (
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="font-euclid text-[14px] font-medium leading-[20px] text-[#040222]">
                      Status
                    </div>
                  </div>
                  <ClaimStatusTimeline steps={selectedJtbd.status || []} jtbdType={selectedJtbd.type} />
                </div>
                ) : null}

                {/* Agent's Next Actions */}
                <AgentActions
                  actions={selectedJtbd.agentActions || []}
                  quickActions={selectedJtbd.quickActions || []}
                  jtbdType={selectedJtbd.type}
                  showAskInChat={resolvedShowAgentAskInChat}
                  askInChatPrefill={
                    selectedJtbd.askInChatPrefill ??
                    (selectedJtbd.type === "renewal" ? ASK_IN_CHAT_RENEWAL : ASK_IN_CHAT_CLAIM)
                  }
                  onActionClick={handleActionClick}
                  onAskInChat={onAskInChat}
                  onEscalateClick={
                    kycEscalationContext ? () => setKycOpsEscalateOpen(true) : undefined
                  }
                  onFocusChatComposer={onFocusChatComposer}
                  onQuickActionClick={(actionIndex, label) =>
                    onOpenQuickRelatedAction?.(quickActionKeyForIndex(actionIndex), label)
                  }
                />

                {claimHandlerAppointment ? (
                  <div className="flex w-full flex-col gap-[8px]">
                    <div className="font-euclid text-[14px] font-medium leading-[20px] text-[#040222]">
                      Claim handler appointment
                    </div>
                    <div className="flex w-full flex-col gap-2 rounded-[12px] border border-[#e7e7f0] bg-white py-4 pl-4 pr-4">
                      <div className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-2">
                        <p className="min-w-0 flex-1 font-euclid text-[14px] leading-5 text-[#36354c]">
                          Scheduled time:{" "}
                          <span className="font-medium">
                            {formatClaimHandlerAppointmentDisplay(claimHandlerAppointment.scheduledAt)}
                          </span>
                        </p>
                        <div className="flex shrink-0 flex-wrap items-center gap-4">
                          <button
                            type="button"
                            className="font-euclid text-[13px] font-medium text-[#7c47e1] underline-offset-2 hover:underline"
                            onClick={() => onCancelClaimHandlerAppointment?.()}
                          >
                            Cancel
                          </button>
                          <button
                            type="button"
                            className="font-euclid text-[13px] font-medium text-[#7c47e1] underline-offset-2 hover:underline"
                            onClick={() => onEditClaimHandlerAppointment?.()}
                          >
                            Edit time
                          </button>
                        </div>
                      </div>
                      {claimHandlerAppointment.note ? (
                        <p className="font-euclid text-[13px] leading-5 text-[#5b5675]">
                          Reason: {claimHandlerAppointment.note}
                        </p>
                      ) : null}
                    </div>
                  </div>
                ) : null}

                {selectedJtbd.relatedSops && selectedJtbd.relatedSops.length > 0 ? (
                  <RelatedSopsSection
                    rows={selectedJtbd.relatedSops}
                    onOpenSop={handleOpenRelatedSop}
                  />
                ) : null}
              </div>
            )}
          </>
        )}

        {/* Active Policies Tab Content */}
        {activeTab === "active" && (
          <div className="w-full">
            <ActivePoliciesPanel
              policies={activePolicies}
              onPolicyActionClick={handlePolicyActionClick}
            />
          </div>
        )}

        {/* Inactive policies — expired Rapido trips (same card system as active) */}
        {activeTab === "inactive" && (
          <div className="w-full">
            <InactivePoliciesPanel policies={inactivePolicies} onPolicyActionClick={handlePolicyActionClick} />
          </div>
        )}
        
      </div>
      <RequestRcCopyModal
        open={requestRcModalOpen}
        onOpenChange={setRequestRcModalOpen}
        defaultToEmail={customerEmailForRcRequest ?? ""}
        defaultToPhone={customerPhoneForRcRequest ?? ""}
        onSendSuccess={({ channel }) => {
          setRequestRcSentChannel(channel)
          setRequestRcSentToastOpen(true)
        }}
      />

      {requestRcSentToastOpen ? (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[80] max-w-sm rounded-lg border border-[#e7e7f0] bg-white p-4 shadow-lg"
        >
          <div className="flex items-start gap-3">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dcfce7]">
              <CheckCircle2 className="h-4 w-4 text-[#15803d]" aria-hidden />
            </div>
            <div className="min-w-0 flex-1 pt-0.5">
              <p className="font-euclid text-[14px] font-medium leading-5 text-[#040222]">Request sent</p>
              <p className="mt-0.5 font-euclid text-[13px] font-normal leading-5 text-[#5b5675]">
                {requestRcSentChannel === "whatsapp"
                  ? "RC copy request was queued for the customer on WhatsApp."
                  : "RC copy request email was queued for the customer."}
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setRequestRcSentToastOpen(false)
                setRequestRcSentChannel(null)
              }}
              className="flex h-6 w-6 shrink-0 items-center justify-center rounded text-[#5b5675] hover:bg-[#f4f4f6]"
              aria-label="Dismiss"
            >
              ×
            </button>
          </div>
        </div>
      ) : null}

      <CommunicationAckToast
        channel={communicationAckChannel}
        onDismiss={() => setCommunicationAckChannel(null)}
      />

      {kycEscalationContext ? (
        <KycOpsEscalationModal
          open={kycOpsEscalateOpen}
          onOpenChange={setKycOpsEscalateOpen}
          customerName={kycEscalationContext.customerName}
          claimId={kycEscalationContext.claimId}
          policyNumber={kycEscalationContext.policyNumber}
        />
      ) : null}

      <Dialog
        open={agentCommunicationOpen}
        onOpenChange={(open) => {
          if (!open) closeAgentCommunication()
        }}
      >
        <DialogContent
          className="max-h-[90dvh] max-w-lg gap-4 overflow-y-auto border-[#e7e7f0] bg-white p-4 font-euclid sm:max-w-lg"
          showCloseButton
        >
          <DialogHeader className="space-y-1 text-left">
            <DialogTitle className="font-euclid text-[16px] font-medium leading-6 text-[#36354c]">
              Send Communication
            </DialogTitle>
            <DialogDescription className="font-euclid text-[14px] leading-5 text-[#5b5675]">
              Choose how to reach the customer and confirm details before sending.
            </DialogDescription>
          </DialogHeader>
          <SendCommunicationPanel
            key={agentCommunicationChannel}
            layout="dialog"
            onClose={closeAgentCommunication}
            onSendComplete={({ channel }) => setCommunicationAckChannel(channel)}
            policies={activePolicies}
            defaultPolicy={defaultCommunicationPolicy}
            initialChannel={agentCommunicationChannel}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}
