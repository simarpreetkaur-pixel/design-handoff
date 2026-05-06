import { ArrowRight } from "lucide-react"

import type { AgentAction, JTBDType } from "@/types/crm"

interface AgentActionsProps {
  actions: AgentAction[]
  quickActions: string[]
  jtbdType: JTBDType
  askInChatPrefill: string
  onActionClick?: (actionType: string) => void
  onAskInChat?: (message: string, jtbdType: JTBDType) => void
  /** When set, CTA label "Escalate" opens KYC Ops escalation (e.g. Anita claim-payment KYC). */
  onEscalateClick?: () => void
  /** When set, "Ask in the chat" only opens/focuses the composer (no prefill). */
  onFocusChatComposer?: (jtbdType: JTBDType) => void
  onQuickActionClick?: (actionIndex: number, label: string) => void
  /** When false, hides the “Confused about any step?” chat prompt (e.g. Ayush renewal). */
  showAskInChat?: boolean
}

export function AgentActions({
  actions,
  quickActions,
  jtbdType,
  askInChatPrefill,
  onActionClick,
  onAskInChat,
  onEscalateClick,
  onFocusChatComposer,
  onQuickActionClick,
  showAskInChat = true,
}: AgentActionsProps) {
  const handleCTAClick = (actionType: string) => {
    onActionClick?.(actionType)
  }

  const handleAskInChatClick = () => {
    if (onFocusChatComposer) {
      onFocusChatComposer(jtbdType)
      return
    }
    onAskInChat?.(askInChatPrefill, jtbdType)
  }

  return (
    <div className="flex w-full flex-col">
      <div className="flex w-full flex-col gap-[8px]">
        <div className="font-euclid text-[14px] font-medium leading-[20px] text-[#040222]">
          Agent's next actions
        </div>

        <div className="flex w-full flex-col gap-3 rounded-[12px] border border-[#e7e7f0] bg-white py-4 pl-4 pr-[33px]">
          {actions.map((action) => (
            <div key={action.id} className="flex w-full items-center justify-between gap-3">
              <div className="min-w-0 flex-1 font-euclid text-[14px] font-normal leading-[20px] text-[#36354c]">
                <ol start={action.step} className="m-0 list-decimal p-0">
                  <li className="ms-[21px] break-words whitespace-normal">
                    <span className="whitespace-pre-line leading-[20px]">{action.description}</span>
                  </li>
                </ol>
              </div>
              {action.cta.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    const t = action.cta.toLowerCase()
                    if (t === "escalate" && onEscalateClick) {
                      onEscalateClick()
                      return
                    }
                    if (jtbdType === "renewal" && t.trim() === "transfer") {
                      handleCTAClick("transfer_to_presales")
                      return
                    }
                    if (t.includes("request rc")) {
                      handleCTAClick("request_rc_email")
                      return
                    }
                    if (/\braise\s+claim\b/.test(t) || t.trim() === "raise claim") {
                      handleCTAClick("raise_claim")
                      return
                    }
                    const kind =
                      t.includes("presales")
                        ? "transfer_to_presales"
                        : t.includes("advisor")
                          ? "advisor_ui"
                          : t.includes("edit policy") || t.includes("endorsements")
                            ? "endorsements"
                            : (t.includes("rc") || t.includes("licence")) && t.includes("email")
                              ? "rc_licence_send_email"
                              : t.includes("email")
                                ? "send_email"
                                : t.includes("transfer") || t.includes("another team")
                                  ? "transfer_to_team"
                                  : t.includes("communication") || t.includes("whatsapp") || t.includes("sms")
                                    ? "send_communication"
                                    : "send_alert"
                    handleCTAClick(kind)
                  }}
                  className="shrink-0 rounded-[8px] bg-[#efe9fb] px-3 py-2 transition-colors hover:bg-[#e4d7ff]"
                >
                  <div className="flex flex-col justify-center leading-[0]">
                    <p className="whitespace-nowrap font-euclid text-[14px] font-medium leading-[20px] text-[#5920c5]">
                      {action.cta}
                    </p>
                  </div>
                </button>
              ) : null}
            </div>
          ))}
        </div>

        {showAskInChat ? (
          <div
            className="relative w-full rounded-[8px]"
            style={{
              padding: "2px",
              background:
                "linear-gradient(90deg, rgba(9, 48, 101, 0.6) 0%, rgba(19, 105, 235, 0.6) 27.5%, rgba(250, 197, 21, 0.6) 60%, rgba(134, 203, 60, 0.6) 100%)",
            }}
          >
            <button
              type="button"
              onClick={handleAskInChatClick}
              className="group flex w-full items-center justify-between rounded-[6px] bg-white px-5 py-3.5 text-left transition-shadow duration-300 hover:shadow-md"
            >
              <div className="flex min-w-0 items-center gap-1">
                <img src="/icons/ai-icon.png" alt="" className="h-5 w-5 shrink-0" width={20} height={20} />
                <p className="font-euclid text-[14px] font-normal leading-[20px] text-[#5b5675]">
                  Confused about any step?
                </p>
              </div>
              <div className="ml-3 flex shrink-0 items-center gap-1">
                <span className="font-euclid text-[12px] font-medium leading-[14px] tracking-[0.18px] text-[#7c47e1]">
                  Ask in the chat
                </span>
                <ArrowRight className="h-4 w-4 text-[#7c47e1] transition-transform duration-300 group-hover:animate-arrow-bounce" />
              </div>
            </button>
          </div>
        ) : null}
      </div>

      {quickActions.length > 0 ? (
        <div className="mt-6 flex w-full flex-col gap-[8px]">
          <div className="font-euclid text-[14px] font-medium leading-[20px] text-[#040222]">
            Quick related actions
          </div>
          <div className="w-full rounded-[12px] border border-[#e7e7f0] bg-white px-4 py-3 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)]">
            <div className="flex flex-wrap items-center gap-2 gap-x-8">
              {quickActions.map((action, index) => (
                <button
                  key={action}
                  type="button"
                  onClick={() => onQuickActionClick?.(index, action)}
                  className="whitespace-nowrap rounded-sm font-euclid text-[14px] font-medium leading-[20px] text-[#7c47e1] transition-colors hover:text-[#5920c5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                >
                  {action}
                </button>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  )
}
