import { useEffect, useState, type ChangeEvent, type ReactNode } from "react"
import type { LucideIcon } from "lucide-react"
import {
  ArrowLeft,
  CarFront,
  Check,
  ChevronDown,
  ChevronRight,
  CloudRain,
  Package,
  ShieldAlert,
} from "lucide-react"

import type { JTBDType, Policy } from "@/types/crm"
import { EndorsementAdvisorPanel } from "@/components/crm/EndorsementAdvisorPanel"
import { Button } from "@/components/ui/button"
import {
  RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE,
  RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE,
} from "@/lib/raiseClaimGuidanceCopy"
import { formatPolicyAlertOptionLabel } from "@/lib/resolvePolicyForJtbd"
import { cn } from "@/lib/utils"

/** Channel for the unified Send Communication flow (ACKO Alert is one option). */
export type CommunicationChannel = "email" | "whatsapp" | "message" | "acko_alert"

/** Toast body copy after a successful Send Communication action (demo). */
export function communicationAckSubtitle(channel: CommunicationChannel): string {
  switch (channel) {
    case "email":
      return "Your email has been queued for delivery."
    case "whatsapp":
      return "WhatsApp message has been queued for the customer."
    case "message":
      return "In-app message has been queued for the customer."
    case "acko_alert":
      return "ACKO Alert has been submitted for this policy."
    default:
      return "Communication has been queued."
  }
}

export type FlowActionValue =
  | "send_alert"
  | "send_communication"
  | "send_email"
  /** Sunil edit name — request RC + driving licence over email */
  | "rc_licence_send_email"
  | "advisor_ui"
  | "transfer_to_team"
  | "transfer_to_presales"
  | "view_policy_document"
  | "share_document"
  | "raise_claim"
  | "endorsements"
  | "coverages"
  | "rapido_claims"
  /** Anita issuance — Related SOPs (opens same detail shell as other flow actions). */
  | "related_sop_kyc_name"
  | "related_sop_pre_inspection"

const PAGE_COPY: Record<
  FlowActionValue,
  { title: string; subtitle: string; description: string }
> = {
  send_alert: {
    title: "Send ACKO Alert",
    subtitle: "Notify the customer in the ACKO app",
    description:
      "Send an in-app alert for the selected policy. Pick the action so the customer gets the right nudge.",
  },
  send_communication: {
    title: "Send Communication",
    subtitle: "Share garage details via WhatsApp",
    description:
      "This will send garage contact details and location information to the customer via WhatsApp message.",
  },
  send_email: {
    title: "Send Email",
    subtitle: "Escalate issue via email",
    description:
      "This will send an email to the relevant team (KYC Ops) with customer details and issue context to expedite resolution.",
  },
  rc_licence_send_email: {
    title: "Send RC & licence email",
    subtitle: "Request documents from the customer",
    description:
      "Send an email to the customer asking them to share a copy of the RC and driving licence for name verification before the policy edit is raised.",
  },
  advisor_ui: {
    title: "Advisor UI",
    subtitle: "Upload documents and update the name",
    description:
      "Open Advisor UI, upload the RC and driving licence copies against this policy, complete verification per SOP, and submit the name correction.",
  },
  transfer_to_team: {
    title: "Transfer to Another Team",
    subtitle: "Hand over the call to specialized team",
    description:
      "This will transfer the active call to the appropriate specialist team who can better assist with this specific issue.",
  },
  transfer_to_presales: {
    title: "Transfer to Presales",
    subtitle: "Renewal and quote assistance",
    description:
      "This will transfer the active call to the Presales team so they can help the customer with renewal, pricing, and the pay link for their policy.",
  },
  view_policy_document: {
    title: "View policy document",
    subtitle: "Open the policy document in a secure view",
    description:
      "The customer’s policy document will open here. You can review coverage, terms, and share with the customer if needed.",
  },
  share_document: {
    title: "Share policy document",
    subtitle: "Send document link to the customer",
    description:
      "This will send a link to the policy document via SMS or email so the customer can access it on their device.",
  },
  raise_claim: {
    title: "Raise a Claim",
    subtitle: "Start a new claim for this policy",
    description:
      "You will be guided to capture claim details, incident information, and next steps. The customer can track progress in the app.",
  },
  endorsements: {
    title: "Edit Policy",
    subtitle: "View or request policy changes",
    description:
      "Review prior policy edits on this policy, or start a new edit (e.g. vehicle or coverage updates).",
  },
  coverages: {
    title: "Coverages",
    subtitle: "See what is covered on this policy",
    description:
      "A full breakdown of inclusions, exclusions, and limits for this policy will be shown here for reference on the call.",
  },
  rapido_claims: {
    title: "Claims",
    subtitle: "Rapido trip policy claims",
    description:
      "View claim history and raise a new claim for this expired Rapido trip policy. The customer can track status in the app when applicable.",
  },
  related_sop_kyc_name: {
    title: "SOP: KYC name mismatch (Aadhaar vs policy)",
    subtitle: "Related SOP · Honda Activa 2026 issuance",
    description:
      "Use this when the policy name reflects a married surname but Aadhaar still shows the maiden name. Confirm both documents on file, capture the exact spelling mismatch, and document the last four attempts. Prefer a guided KYC re-upload when the customer can correct data in-app; escalate to KYC Ops only after re-upload fails twice or the case is time-bound for pre-inspection.",
  },
  related_sop_pre_inspection: {
    title: "SOP: Pre-inspection readiness after KYC",
    subtitle: "Related SOP · Motor issuance",
    description:
      "Pre-inspection should not be promised until KYC is green. If the customer pushes for inspection, explain the dependency chain (KYC → inspection slot → activation). Offer proactive ETA messaging and align with the inspection vendor calendar before sending any hard commitment.",
  },
}

function isFlowActionValue(key: string): key is FlowActionValue {
  return key in PAGE_COPY
}

const GENERIC: { title: string; subtitle: string; description: string } = {
  title: "Action",
  subtitle: "Complete this step",
  description: "Details for this action will appear here.",
}

const COMMUNICATION_CHANNELS: { value: CommunicationChannel; label: string }[] = [
  { value: "email", label: "Email" },
  { value: "whatsapp", label: "WhatsApp" },
  { value: "message", label: "Message" },
  { value: "acko_alert", label: "ACKO Alert" },
]

const COMMUNICATE_TOPIC_OPTIONS: { value: string; label: string }[] = [
  { value: "general", label: "General update" },
  { value: "kyc_verification", label: "KYC verification" },
  { value: "garage_followup", label: "Garage / repair follow-up" },
]

const ACKO_ALERT_ACTION_OPTIONS: { value: string; label: string }[] = [
  { value: "garage_selection", label: "Garage selection" },
  { value: "document_upload", label: "Document upload" },
  { value: "renewal_nudge", label: "Renewal reminder" },
]

const ackoAlertSelectBaseClassName =
  "h-10 w-full cursor-pointer appearance-none rounded-lg border border-[#e7e7f0] bg-white py-2 pl-3 pr-10 font-euclid text-[14px] shadow-sm outline-none focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]/25"

function AckOAlertSelect({
  id,
  value,
  onChange,
  children,
}: {
  id: string
  value: string
  onChange: (e: ChangeEvent<HTMLSelectElement>) => void
  children: ReactNode
}) {
  const empty = value === ""
  return (
    <div className="relative w-full min-w-0">
      <select
        id={id}
        className={cn(
          ackoAlertSelectBaseClassName,
          empty ? "font-normal text-[#5b5675]" : "font-normal text-[#36354c]",
        )}
        value={value}
        onChange={onChange}
      >
        {children}
      </select>
      <ChevronDown
        className="pointer-events-none absolute right-3 top-1/2 size-4 -translate-y-1/2 text-[#5b5675]"
        aria-hidden
      />
    </div>
  )
}

export function SendCommunicationPanel({
  onClose,
  layout = "page",
  policies = [],
  defaultPolicy = null,
  initialChannel = "whatsapp",
  onSendComplete,
}: {
  onClose: () => void
  layout?: "page" | "dialog"
  policies?: Policy[]
  defaultPolicy?: Policy | null
  initialChannel?: CommunicationChannel
  /** Called when the agent confirms Send with valid fields (before dialog/page closes). */
  onSendComplete?: (detail: { channel: CommunicationChannel }) => void
}) {
  const [channel, setChannel] = useState<CommunicationChannel>(initialChannel)
  const fallbackId = policies[0]?.id ?? ""
  const [policyId, setPolicyId] = useState(() => defaultPolicy?.id ?? fallbackId)
  const [communicateTopic, setCommunicateTopic] = useState<string>("")
  const [action, setAction] = useState("")

  useEffect(() => {
    setChannel(initialChannel)
  }, [initialChannel])

  useEffect(() => {
    const nextId = defaultPolicy?.id ?? policies[0]?.id ?? ""
    setPolicyId(nextId)
    setAction("")
    setCommunicateTopic("")
  }, [defaultPolicy?.id, policies])

  useEffect(() => {
    if (channel !== "acko_alert") {
      setAction("")
    }
  }, [channel])

  const selectPlaceholder = (
    <option value="" disabled>
      Select an option
    </option>
  )

  const pageTitle = "Send Communication"

  if (policies.length === 0) {
    const emptyMsg = (
      <p className="font-euclid text-[14px] leading-5 text-[#6c6c80]">
        No active policies are available to send a communication for.
      </p>
    )
    if (layout === "dialog") {
      return <div className="flex min-h-0 flex-col gap-4">{emptyMsg}</div>
    }
    return (
      <div className="flex min-h-0 w-full flex-col bg-white">
        <div className="flex shrink-0 items-center gap-3 border-b border-[#e7e7f0] px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            className="group flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
            aria-label="Back"
          >
            <ArrowLeft className="size-5 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden />
          </button>
          <h2 className="min-w-0 font-euclid text-[18px] font-semibold leading-6 text-[#2c2067]">{pageTitle}</h2>
        </div>
        <div className="px-5 py-5">{emptyMsg}</div>
      </div>
    )
  }

  const ackoDisabled =
    channel === "acko_alert" && (!action || policyId.length === 0)

  const needsCommunicateTopic = channel !== "acko_alert" && communicateTopic === ""

  const sendDisabled = ackoDisabled || needsCommunicateTopic

  const formSection = (
    <div className="min-h-0 flex-1 overflow-y-auto px-5 py-5">
      <div className="grid w-full min-w-0 grid-cols-1 items-center gap-x-6 gap-y-4 text-sm font-medium leading-5 min-[480px]:grid-cols-[minmax(0,140px)_minmax(0,1fr)]">
        <label htmlFor="send-comm-channel" className="text-[#5b5675]">
          Send via
        </label>
        <AckOAlertSelect
          id="send-comm-channel"
          value={channel}
          onChange={(e) => setChannel(e.target.value as CommunicationChannel)}
        >
          {COMMUNICATION_CHANNELS.map((c) => (
            <option key={c.value} value={c.value}>
              {c.label}
            </option>
          ))}
        </AckOAlertSelect>

        {channel !== "acko_alert" ? (
          <>
            <label htmlFor="send-comm-topic" className="text-[#5b5675]">
              Communicate
            </label>
            <AckOAlertSelect
              id="send-comm-topic"
              value={communicateTopic}
              onChange={(e) => setCommunicateTopic(e.target.value)}
            >
              {selectPlaceholder}
              {COMMUNICATE_TOPIC_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </AckOAlertSelect>
          </>
        ) : null}

        <label htmlFor="send-comm-policy" className="text-[#5b5675]">
          Policy
        </label>
        <AckOAlertSelect id="send-comm-policy" value={policyId} onChange={(e) => setPolicyId(e.target.value)}>
          {policies.map((p) => (
            <option key={p.id} value={p.id}>
              {formatPolicyAlertOptionLabel(p)}
            </option>
          ))}
        </AckOAlertSelect>

        {channel === "acko_alert" ? (
          <>
            <label htmlFor="send-comm-ack-action" className="text-[#5b5675]">
              Select action
            </label>
            <AckOAlertSelect id="send-comm-ack-action" value={action} onChange={(e) => setAction(e.target.value)}>
              {selectPlaceholder}
              {ACKO_ALERT_ACTION_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </AckOAlertSelect>
          </>
        ) : null}
      </div>
    </div>
  )

  const handleConfirmSend = () => {
    if (sendDisabled) return
    onSendComplete?.({ channel })
    onClose()
  }

  const footer = (
    <div className="shrink-0 border-t border-[#e7e7f0] bg-white px-5 py-4">
      <div className="flex justify-end">
        <Button
          type="button"
          className="h-10 rounded-lg bg-[#7c47e1] px-6 font-euclid text-[14px] font-medium text-white hover:bg-[#7c47e1]/90"
          onClick={handleConfirmSend}
          disabled={sendDisabled}
        >
          Send communication
        </Button>
      </div>
    </div>
  )

  if (layout === "dialog") {
    return (
      <div className="flex max-h-[min(70dvh,520px)] min-h-0 w-full flex-col bg-white">
        {formSection}
        {footer}
      </div>
    )
  }

  return (
    <div className="flex min-h-0 w-full flex-col bg-white">
      <div className="flex shrink-0 items-center gap-3 border-b border-[#e7e7f0] px-5 py-4">
        <button
          type="button"
          onClick={onClose}
          className="group flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
          aria-label="Back"
        >
          <ArrowLeft className="size-5 shrink-0 transition-transform group-hover:-translate-x-0.5" aria-hidden />
        </button>
        <h2 className="min-w-0 font-euclid text-[18px] font-semibold leading-6 text-[#2c2067]">{pageTitle}</h2>
      </div>
      {formSection}
      {footer}
    </div>
  )
}

const RAISE_CLAIM_SCENARIO_OPTIONS: {
  id: string
  title: string
  description?: string
  Icon: LucideIcon
}[] = [
  {
    id: "accident",
    title: "My car was damaged in an accident",
    description: "I hit another vehicle, a person, or an object.",
    Icon: CarFront,
  },
  {
    id: "no_accident",
    title: "My car is damaged, but there was no accident",
    description: "My car is damaged from parking mishaps, falling objects, etc.",
    Icon: CloudRain,
  },
  {
    id: "theft_vehicle",
    title: "My car has been stolen",
    description: "My car is missing and I want to report it.",
    Icon: ShieldAlert,
  },
  {
    id: "parts",
    title: "My car parts or accessories were stolen/damaged/lost",
    Icon: Package,
  },
]

function RaiseFnolPanel({ policy, onBack }: { policy: Policy; onBack: () => void }) {
  const [selectedScenarioId, setSelectedScenarioId] = useState<string | null>(null)
  const [mobileClaimSubmitted, setMobileClaimSubmitted] = useState(false)

  const planLine = [policy.name, policy.vehicle].filter(Boolean).join(" · ")

  return (
    <div className="flex w-full flex-col bg-white">
      {/* Header — Figma: back + title + policy line (8395:28220) */}
      <div className="flex shrink-0 flex-col gap-1 border-b border-[#e7e7f0] px-5 py-4">
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={onBack}
            className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
            aria-label="Back"
          >
            <ArrowLeft className="size-5" aria-hidden />
          </button>
          <h2 className="min-w-0 font-euclid text-[16px] font-medium leading-6 text-[#040222]">Raise a claim</h2>
        </div>
        {planLine ? (
          <p className="pl-12 font-euclid text-[14px] font-medium leading-5 text-[#5b5675]">{planLine}</p>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        {/* Device lab + interactive phone — Figma lavender tray (8480:11628) + mobile UI */}
        <div className="flex w-full justify-center">
          <div className="w-full max-w-[907px] rounded-[15px] border-[0.5px] border-[#e0e0e8] bg-[#f8f7fd] px-6 py-8 sm:px-9 sm:py-8">
            <div className="mx-auto flex w-full max-w-[300px] flex-col items-center">
              {/* Phone chrome */}
              <div className="relative w-full overflow-hidden rounded-[28px] border-2 border-[#e7e7f0] bg-[#f4f4f6] p-2 shadow-[0px_12px_40px_rgba(28,11,62,0.12)]">
                <div className="max-h-[min(72vh,640px)] overflow-y-auto rounded-[22px] bg-white">
                  <div className="flex flex-col gap-4 p-4 pb-6">
                    {mobileClaimSubmitted ? (
                      <div
                        className="flex flex-col items-center gap-4 px-1 pb-2 pt-6 text-center"
                        role="status"
                        aria-live="polite"
                      >
                        <div
                          className="flex size-[52px] shrink-0 animate-raise-claim-tick-pop items-center justify-center rounded-full bg-[#dcfce7] ring-[6px] ring-[#bbf7d0]"
                          aria-hidden
                        >
                          <Check className="size-7 text-[#15803d]" strokeWidth={2.75} />
                        </div>
                        <div className="animate-raise-claim-msg-fade space-y-2.5">
                          <p className="font-euclid text-[13px] font-semibold leading-5 text-[#166534]">
                            {RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE}
                          </p>
                          <p className="font-euclid text-[12px] font-medium leading-5 text-[#36354c]">
                            {RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE}
                          </p>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
                          Tell us what happened
                        </h3>

                        <div className="flex flex-col gap-2.5">
                          {RAISE_CLAIM_SCENARIO_OPTIONS.map((opt) => {
                            const Icon = opt.Icon
                            const selected = selectedScenarioId === opt.id
                            return (
                              <button
                                key={opt.id}
                                type="button"
                                onClick={() => setSelectedScenarioId(opt.id)}
                                className={cn(
                                  "flex w-full items-stretch gap-2.5 rounded-xl border bg-white p-3 text-left shadow-[0px_1px_3px_rgba(54,53,76,0.06)] transition-colors",
                                  selected
                                    ? "border-[#7c47e1] ring-1 ring-[#7c47e1]/25"
                                    : "border-[#e7e7f0] hover:border-[#d1d5db]",
                                )}
                              >
                                <div className="flex size-10 shrink-0 items-center justify-center self-center rounded-lg bg-[#f4f4f6]">
                                  <Icon className="size-5 text-[#5b5675]" aria-hidden />
                                </div>
                                <div className="min-w-0 flex-1 self-center">
                                  <p className="font-euclid text-[13px] font-semibold leading-[18px] text-[#040222]">
                                    {opt.title}
                                  </p>
                                  {opt.description ? (
                                    <p className="mt-0.5 font-euclid text-[11px] font-normal leading-4 text-[#6c6c80]">
                                      {opt.description}
                                    </p>
                                  ) : null}
                                </div>
                                <ChevronRight
                                  className="size-4 shrink-0 self-center text-[#36354c] opacity-80"
                                  aria-hidden
                                />
                              </button>
                            )
                          })}
                        </div>

                        <Button
                          type="button"
                          disabled={!selectedScenarioId}
                          onClick={() => setMobileClaimSubmitted(true)}
                          className="h-11 w-full rounded-xl bg-[#7c47e1] font-euclid text-[14px] font-semibold text-white shadow-[0px_2px_8px_rgba(92,50,201,0.2)] hover:bg-[#6b3ccd] disabled:bg-[#e7e7f0] disabled:text-[#9c9aaf] disabled:shadow-none"
                        >
                          Raise a claim
                        </Button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

type ActionDetailPageProps = {
  actionKey: string
  onBack: () => void
  claimPolicy?: Policy | null
  /**
   * Policy for Edit Policy: Active policies “Edit Policy” action, or advisor flow from a
   * name-edit / policy-edit JTBD (including chat-created workflow).
   */
  endorsementPolicy?: Policy | null
  /** When opening Send ACKO Alert from an ongoing JTBD, the policy inferred from that job. */
  jtbdContextPolicy?: Policy | null
  /** All active policies — used to populate the policy dropdown. */
  activePolicies?: Policy[]
  onAskInChatFromAction?: (message: string, jtbdType: JTBDType) => void
  customerId?: string
  /** Fires when Send Communication completes (demo acknowledgment). */
  onCommunicationSent?: (channel: CommunicationChannel) => void
}

export function ActionDetailPage({
  actionKey,
  onBack,
  claimPolicy = null,
  endorsementPolicy = null,
  jtbdContextPolicy = null,
  activePolicies = [],
  onAskInChatFromAction: _onAskInChatFromAction,
  customerId: _customerId,
  onCommunicationSent,
}: ActionDetailPageProps) {
  const content = isFlowActionValue(actionKey) ? PAGE_COPY[actionKey] : GENERIC

  if (actionKey === "send_alert" || actionKey === "send_communication") {
    const policies = activePolicies
    if (policies.length === 0) {
    return (
        <div className="w-full px-4 py-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-[#2c2067] transition-colors hover:bg-[#f1edfc]"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="font-euclid text-[14px] text-[#6c6c80]">
            No active policies are available to send a communication for.
          </p>
        </div>
      )
    }
    const defaultPolicy = jtbdContextPolicy ?? policies[0] ?? null
    const initialChannel = actionKey === "send_alert" ? "acko_alert" : "whatsapp"
    return (
      <div className="w-full">
        <div className="w-full overflow-hidden rounded-[12px] border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]">
          <SendCommunicationPanel
            onClose={onBack}
            onSendComplete={({ channel }) => onCommunicationSent?.(channel)}
            policies={policies}
            defaultPolicy={defaultPolicy}
            initialChannel={initialChannel}
            layout="page"
          />
                </div>
              </div>
    )
  }

  if (actionKey === "endorsements" || actionKey === "advisor_ui") {
    const policies = activePolicies
    const p = endorsementPolicy ?? jtbdContextPolicy ?? policies[0] ?? null
    if (!p) {
      return (
        <div className="w-full px-4 py-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-[#2c2067] transition-colors hover:bg-[#f1edfc]"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="font-euclid text-[14px] text-[#6c6c80]">
            {actionKey === "endorsements"
              ? "No active policy was found to open Edit Policy."
              : "No active policy was linked to this Advisor UI step. Pick a policy under Active policies or from the JTBD context, then try again."}
          </p>
        </div>
      )
    }
    return (
      <div className="w-full">
        <div className="w-full overflow-hidden rounded-[12px] border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]">
          <EndorsementAdvisorPanel policy={p} onBack={onBack} />
        </div>
      </div>
    )
  }

  if (actionKey === "raise_claim") {
    const policies = activePolicies
    const p = claimPolicy ?? jtbdContextPolicy ?? policies[0] ?? null
    if (!p) {
      return (
        <div className="w-full px-4 py-6">
          <button
            type="button"
            onClick={onBack}
            className="mb-4 flex h-9 w-9 items-center justify-center rounded-full text-[#2c2067] transition-colors hover:bg-[#f1edfc]"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <p className="font-euclid text-[14px] text-[#6c6c80]">
            No active policy was found to start the claim journey.
                </p>
              </div>
      )
    }
    return (
      <div className="w-full">
        <div className="w-full overflow-hidden rounded-[12px] border border-[#e7e7f0] bg-white shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]">
          <RaiseFnolPanel policy={p} onBack={onBack} />
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-3 border-b border-[#e7e7f0] bg-white px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#2c2067] transition-colors hover:bg-[#f1edfc]"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-euclid text-[18px] font-medium leading-6 text-[#2c2067]">
            {content.title}
          </h2>
          <p className="font-euclid text-[14px] font-normal leading-5 text-[#6c6c80]">
            {content.subtitle}
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="rounded-xl border border-[#e7e7f0] bg-white p-6 shadow-sm">
          <div className="text-center">
            <div className="mb-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1edfc]">
                <div className="h-8 w-8 rounded-full bg-[#7c47e1] opacity-20" />
              </div>
              <h3 className="mb-2 font-euclid text-[16px] font-medium text-[#2c2067]">
                {content.title}
              </h3>
              <p className="font-euclid text-[14px] leading-5 text-[#6c6c80]">
                {content.description}
              </p>
            </div>

            <div className="mx-auto my-6 max-w-sm space-y-3">
              <div className="h-2.5 rounded bg-[#f0f0f5]" />
              <div className="mx-auto h-2.5 w-4/5 rounded bg-[#f0f0f5]" />
              <div className="mx-auto h-2.5 w-3/5 rounded bg-[#f0f0f5]" />
            </div>

            <div className="mt-8 rounded-lg bg-[#f6f6f9] p-4">
              <p className="font-euclid text-[12px] leading-relaxed text-[#6c6c80]">
                This is a placeholder page. The full {content.title.toLowerCase()} experience will
                be implemented here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
