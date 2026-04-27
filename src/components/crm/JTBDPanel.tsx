import { useEffect, useState } from "react"
import { FileText, RefreshCw } from "lucide-react"

import type { InactivePolicy, JTBD, JTBDType, Policy } from "@/types/crm"
import { ClaimStatusTimeline } from "@/components/crm/ClaimStatusTimeline"
import { AgentActions } from "@/components/crm/AgentActions"
import { ActionDetailPage, type FlowActionValue } from "@/components/crm/ActionDetailPage"
import { ActivePoliciesPanel } from "@/components/crm/ActivePoliciesPanel"
import { InactivePoliciesPanel } from "@/components/crm/InactivePoliciesPanel"
import { AiGuideCard } from "@/components/crm/AiGuideCard"
import { RelatedSopsSection } from "@/components/crm/RelatedSopsSection"
import {
  quickActionKeyForIndex,
  type QuickActionKey,
} from "@/components/crm/QuickActionDetailPage"

/** Short draft for the chat box; agent can edit before sending */
const ASK_IN_CHAT_CLAIM = "What should I do next for garage drop-off?"

const ASK_IN_CHAT_RENEWAL = "What order: renewal quote (NCB) → WhatsApp/SMS link?"

type TabKey = "ongoing" | "active" | "inactive"

interface JTBDPanelProps {
  customerId?: string
  jtbds: JTBD[]
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  onAskInChat?: (message: string, jtbdType: JTBDType) => void
  /** Same as Ask in chat — prefill from Tip card “View detailed summary” */
  onAiGuideViewDetails?: (message: string, jtbdType: JTBDType) => void
  onSelectedJtbdChange?: (jtbd: JTBD) => void
  /** Open center-panel quick action detail (same overlay as global Quick Actions FAB). */
  onOpenQuickRelatedAction?: (key: QuickActionKey, label: string) => void
  /**
   * When the parent sets this (e.g. AI chat CTA), opens the same in-panel flow as Agent’s Next Actions.
   * Parent should clear `onOpenFlowFromParentConsumed` after open.
   */
  openFlowFromParent?: FlowActionValue | null
  onOpenFlowFromParentConsumed?: () => void
}

export function JTBDPanel({
  customerId,
  jtbds,
  activePolicies,
  inactivePolicies,
  onAskInChat,
  onAiGuideViewDetails,
  onSelectedJtbdChange,
  onOpenQuickRelatedAction,
  openFlowFromParent,
  onOpenFlowFromParentConsumed,
}: JTBDPanelProps) {
  const hasJtbds = jtbds.length > 0
  const [activeTab, setActiveTab] = useState<TabKey>(jtbds.length === 0 ? "active" : "ongoing")
  const [selectedJtbdId, setSelectedJtbdId] = useState<string>(
    jtbds.find((j) => j.isActive)?.id ?? jtbds[0]?.id ?? "",
  )
  const [detailActionKey, setDetailActionKey] = useState<string | null>(null)
  const [claimContextPolicy, setClaimContextPolicy] = useState<Policy | null>(null)

  const selectedJtbd = jtbds.find((j) => j.id === selectedJtbdId)

  useEffect(() => {
    if (!openFlowFromParent) return
    setDetailActionKey(openFlowFromParent)
    onOpenFlowFromParentConsumed?.()
  }, [openFlowFromParent, onOpenFlowFromParentConsumed])

  useEffect(() => {
    if (!hasJtbds && activeTab === "ongoing") {
      setActiveTab("active")
    }
  }, [hasJtbds, activeTab])

  useEffect(() => {
    if (selectedJtbd) onSelectedJtbdChange?.(selectedJtbd)
  }, [selectedJtbd, onSelectedJtbdChange])

  const handleActionClick = (actionType: string) => {
    if (
      actionType === "send_alert" ||
      actionType === "send_communication" ||
      actionType === "send_email" ||
      actionType === "transfer_to_team"
    ) {
      setDetailActionKey(actionType)
    }
  }

  const handleBackToMain = () => {
    setDetailActionKey(null)
    setClaimContextPolicy(null)
  }

  const handlePolicyActionClick = (action: string, policy?: Policy) => {
    if (action === "raise_claim" && policy) {
      setClaimContextPolicy(policy)
    } else {
      setClaimContextPolicy(null)
    }
    setDetailActionKey(action)
  }

  const handleOpenRelatedSop = (detailActionKey: string) => {
    setClaimContextPolicy(null)
    setDetailActionKey(detailActionKey)
  }

  const handleSummarisePolicyInChat = (policy: Policy, policyKind: "health" | "motor") => {
    const prefill = policyKind === "health" 
      ? `Summarise this health policy (${policy.name}) and suggest next steps for customer support.`
      : `Summarise this motor policy (${policy.name} - ${policy.vehicle || policy.policyNumber}) and suggest next steps for customer support.`
    
    onAskInChat?.(prefill, "claim") // Use "claim" as default JTBD type for policy actions
  }

  if (detailActionKey) {
    return (
      <ActionDetailPage
        actionKey={detailActionKey}
        onBack={handleBackToMain}
        claimPolicy={detailActionKey === "raise_claim" ? claimContextPolicy : null}
        onAskInChatFromAction={onAskInChat}
        customerId={customerId}
      />
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
            <div className="flex flex-wrap gap-4 mb-6 w-full">
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
                            {jtbd.type === "claim" ? (
                              <FileText className={`h-[16px] w-[16px] ${
                                selectedJtbdId === jtbd.id ? "text-white" : "text-[#7c47e1]"
                              }`} />
                            ) : (
                              <RefreshCw className={`h-[16px] w-[16px] ${
                                selectedJtbdId === jtbd.id ? "text-white" : "text-[#36354c]"
                              }`} />
                            )}
                          </div>
                          <div className={`font-euclid text-[14px] font-medium leading-[20px] ${
                            selectedJtbdId === jtbd.id ? "text-white" : "text-[#36354c]"
                          }`}>
                            {jtbd.title}
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
              <div className="flex flex-col gap-6 w-full">
                
                {/* Tip card (if present) — same shell as "Confused about any step?" in AgentActions */}
                {selectedJtbd.aiSummary && (
                  <AiGuideCard
                    bullets={selectedJtbd.aiSummary.bullets}
                    sectionHeading={selectedJtbd.aiSummary.sectionHeading}
                    headerIconVariant={selectedJtbd.aiSummary.headerIconVariant}
                    viewDetailsLabel={selectedJtbd.aiSummary.viewDetailsLabel}
                    onViewDetails={() => {
                      const pre =
                        selectedJtbd.aiSummary?.viewDetailsChatPrefill?.trim() ||
                        "Show me a detailed summary of this case and recommended agent actions."
                      onAiGuideViewDetails?.(pre, selectedJtbd.type)
                    }}
                  />
                )}

                {/* Status Section */}
                <div className="flex flex-col gap-2 w-full">
                  <div className="flex items-center justify-between w-full">
                    <div className="font-euclid text-[14px] font-medium leading-[20px] text-[#040222]">
                      Status
                    </div>
                  </div>
                  <ClaimStatusTimeline steps={selectedJtbd.status || []} jtbdType={selectedJtbd.type} />
                </div>

                {/* Agent's Next Actions */}
                <AgentActions
                  actions={selectedJtbd.agentActions || []}
                  quickActions={selectedJtbd.quickActions || []}
                  jtbdType={selectedJtbd.type}
                  askInChatPrefill={
                    selectedJtbd.askInChatPrefill ??
                    (selectedJtbd.type === "renewal" ? ASK_IN_CHAT_RENEWAL : ASK_IN_CHAT_CLAIM)
                  }
                  onActionClick={handleActionClick}
                  onAskInChat={onAskInChat}
                  onQuickActionClick={(actionIndex, label) =>
                    onOpenQuickRelatedAction?.(quickActionKeyForIndex(actionIndex), label)
                  }
                />

                {selectedJtbd.relatedSops && selectedJtbd.relatedSops.length > 0 ? (
                  <RelatedSopsSection
                    rows={selectedJtbd.relatedSops}
                    jtbdType={selectedJtbd.type}
                    onOpenSop={handleOpenRelatedSop}
                    onAskInChat={onAskInChat}
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
              onSummarisePolicyInChat={handleSummarisePolicyInChat}
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
    </div>
  )
}
