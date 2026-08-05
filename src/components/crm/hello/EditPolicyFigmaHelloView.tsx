/**
 * UC7 — Edit Policy (Figma design)
 * Flow: 3 options → Send ACKO Alert (self-serve) OR "Advisor UI will show here" (do it for customer)
 */
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { AlertTriangle, Check, ChevronDown, Loader2, MoreVertical, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer, InactivePolicy, Policy } from "@/types/crm"
import { CustomerProfileSidebar } from "@/components/crm/hello/CustomerProfileSidebar"
import { HelloAiBubbleCard, HelloCxBubbleCard, HelloTellCustomerLabel, TypingIndicator } from "@/components/crm/hello/HelloChatPrimitives"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import {
  HelloRightPanelIconRail,
  HelloPowerToolsPanel,
  type HelloRightRailTab,
} from "@/components/crm/hello/HelloRightPanelRail"
import { HELLO_BOT_REPLY_AFTER_USER_MS, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS } from "@/components/crm/hello/helloRaiseClaimCopy"

// ─── Types ────────────────────────────────────────────────────────────────────

type ChoiceId = "self_serve" | "do_it_for_customer" | "view_policy_doc" | "check_ticket" | "something_else"

type RightPanelKind = "send_acko_alert" | "advisor_ui" | "policy_doc"

const PANEL_LABELS: Record<RightPanelKind, string> = {
  send_acko_alert: "Send Acko Alert",
  advisor_ui: "Edit policy",
  policy_doc: "Policy document",
}

// ─── Send ACKO Alert Panel ────────────────────────────────────────────────────

export interface SendAckoAlertPanelProps {
  onSent: () => void
}

const POLICIES = [
  "Ecosport Titanium 2025",
  "Honda Activa 2020",
  "Corporate Health Plan",
]

const MAIN_ACTIONS = [
  "Raise an auto claim",
  "Edit policy",
  "Access corporate policy",
  "Steps to raise health reimbursement claim",
  "Raise a health claim",
]

const EDIT_SUB_ACTIONS = ["Chassis number", "Engine number", "Policy start date"]

type SendState = "idle" | "sending" | "sent"

export function Dropdown({
  label,
  value,
  options,
  open,
  onToggle,
  onSelect,
}: {
  label: string
  value: string | null
  options: string[]
  open: boolean
  onToggle: () => void
  onSelect: (v: string) => void
}) {
  return (
    <div className="flex flex-col gap-1.5">
      <p className="font-euclid text-[13px] font-semibold text-[#040222]">{label}</p>
      <div className="relative">
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); onToggle() }}
          className="flex w-full items-center justify-between rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5"
        >
          <span className={cn("font-euclid text-[13px]", value ? "text-[#36354c]" : "text-[#8b87a3]")}>
            {value ?? "Select an option"}
          </span>
          <ChevronDown className="size-4 text-[#5b5675]" />
        </button>
        {open && (
          <div
            className="absolute left-0 top-full z-30 mt-1 w-full overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-md"
            onClick={(e) => e.stopPropagation()}
          >
            {options.map((opt) => (
              <button
                key={opt}
                type="button"
                onClick={(e) => { e.stopPropagation(); onSelect(opt) }}
                className={cn(
                  "flex w-full items-center px-3 py-2.5 text-left font-euclid text-[13px] hover:bg-[#f8f7fc]",
                  value === opt ? "bg-[#ede9fb] text-[#5c30c9] font-medium" : "text-[#36354c]",
                )}
              >
                {opt}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export function SendAckoAlertPanel({ onSent }: SendAckoAlertPanelProps) {
  const [openDropdown, setOpenDropdown] = useState<"policy" | "action" | "sub" | null>(null)
  const [selectedPolicy, setSelectedPolicy] = useState<string | null>(null)
  const [selectedAction, setSelectedAction] = useState<string | null>(null)
  const [selectedSub, setSelectedSub] = useState<string | null>(null)
  const [sendState, setSendState] = useState<SendState>("idle")

  const toggle = (key: "policy" | "action" | "sub") =>
    setOpenDropdown((prev) => (prev === key ? null : key))

  const isEditPolicy = selectedAction === "Edit policy"
  const canSend = Boolean(selectedPolicy && selectedAction && (!isEditPolicy || selectedSub))

  const handleSend = () => {
    if (!canSend || sendState !== "idle") return
    setSendState("sending")
    setTimeout(() => {
      setSendState("sent")
      // Close panel and push success to chat after brief pause
      setTimeout(() => onSent(), 800)
    }, 1200)
  }

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 px-4 py-5" onClick={() => setOpenDropdown(null)}>
      <Dropdown
        label="Select Policy"
        value={selectedPolicy}
        options={POLICIES}
        open={openDropdown === "policy"}
        onToggle={() => toggle("policy")}
        onSelect={(v) => { setSelectedPolicy(v); setOpenDropdown(null) }}
      />

      <Dropdown
        label="Select for which action you want to send ACKO Alert"
        value={selectedAction}
        options={MAIN_ACTIONS}
        open={openDropdown === "action"}
        onToggle={() => toggle("action")}
        onSelect={(v) => { setSelectedAction(v); setSelectedSub(null); setOpenDropdown(null) }}
      />

      {isEditPolicy && (
        <Dropdown
          label="Select what to edit"
          value={selectedSub}
          options={EDIT_SUB_ACTIONS}
          open={openDropdown === "sub"}
          onToggle={() => toggle("sub")}
          onSelect={(v) => { setSelectedSub(v); setOpenDropdown(null) }}
        />
      )}

      {/* Send button — 3 states */}
      {sendState === "idle" && (
        <button
          type="button"
          onClick={(e) => { e.stopPropagation(); handleSend() }}
          disabled={!canSend}
          className={cn(
            "w-full rounded-xl py-3 font-euclid text-[14px] font-semibold transition-colors",
            canSend
              ? "bg-[#5c30c9] text-white hover:bg-[#4a27a0]"
              : "cursor-not-allowed bg-[#e7e7f0] text-[#8b87a3]",
          )}
        >
          Send
        </button>
      )}

      {sendState === "sending" && (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ede9fb] py-3 font-euclid text-[14px] font-semibold text-[#5c30c9]"
        >
          <Loader2 className="size-4 animate-spin" />
          Sending ACKO alert
        </button>
      )}

      {sendState === "sent" && (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#16a34a] py-3 font-euclid text-[14px] font-semibold text-white"
        >
          <Check className="size-4" strokeWidth={2.5} />
          Sent
        </button>
      )}
    </div>
  )
}

// ─── Policy PDF Viewer ────────────────────────────────────────────────────────

function PolicyPdfViewer() {
  return (
    <div className="flex h-full flex-col bg-[#525659]">
      {/* PDF toolbar */}
      <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#3a3d3f] bg-[#3c3f41] px-3 py-1.5">
        <div className="flex items-center gap-2">
          <span className="font-euclid text-[11px] text-[#c8c9ca]">Page</span>
          <span className="w-7 rounded border border-[#5a5d5f] bg-[#525659] px-1 text-center font-euclid text-[11px] text-[#e8e9ea]">1</span>
          <span className="font-euclid text-[11px] text-[#c8c9ca]">/ 4</span>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" className="flex size-6 items-center justify-center rounded text-[#c8c9ca] hover:bg-[#4a4d4f]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M11 8v6M8 11h6" />
            </svg>
          </button>
          <span className="font-euclid text-[11px] text-[#c8c9ca]">100%</span>
          <button type="button" className="flex size-6 items-center justify-center rounded text-[#c8c9ca] hover:bg-[#4a4d4f]">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35M8 11h6" />
            </svg>
          </button>
        </div>
      </div>

      {/* PDF page — scrollable, no fixed aspect ratio */}
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="mx-auto w-full overflow-hidden rounded bg-white shadow-[0_4px_20px_rgba(0,0,0,0.45)]">

          {/* Purple header band */}
          <div className="bg-[#5c30c9] px-5 py-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-euclid text-[18px] font-bold tracking-tight text-white">ACKO</div>
                <div className="mt-1 font-euclid text-[10px] text-[#c4b5fd]">ACKO General Insurance Ltd.</div>
                <div className="font-euclid text-[10px] text-[#c4b5fd]">2nd Floor, Hustlehub, Bangalore – 560103</div>
              </div>
              <div className="text-right">
                <div className="font-euclid text-[10px] font-semibold uppercase tracking-widest text-[#e0d9ff]">Motor Insurance</div>
                <div className="mt-1 font-euclid text-[10px] text-[#c4b5fd]">Policy No: DCCR10462314331/00</div>
                <div className="font-euclid text-[10px] text-[#c4b5fd]">Issue Date: 12 Jan 2025</div>
              </div>
            </div>
          </div>
          {/* Accent gradient bar */}
          <div className="h-[3px] bg-gradient-to-r from-[#7c47e1] via-[#a855f7] to-[#3b1e8e]" />

          {/* Page content */}
          <div className="flex flex-col gap-4 px-5 py-4 text-[#1a1a1a]">

            {/* Certificate title */}
            <div className="text-center">
              <div className="font-euclid text-[13px] font-bold uppercase tracking-[0.14em] text-[#36354c]">Certificate of Insurance</div>
              <div className="mt-1 font-euclid text-[10px] text-[#8b87a3]">Policy Period: 12 Jan 2025 – 11 Jan 2026</div>
            </div>

            {/* Insured details — striped table */}
            <div>
              <div className="mb-2 font-euclid text-[10px] font-bold uppercase tracking-[0.1em] text-[#5c30c9]">Insured Details</div>
              <div className="overflow-hidden rounded-lg border border-[#e7e7f0]">
                {[
                  { label: "Insured Name", value: "Rajesh Kumar" },
                  { label: "Date of Birth", value: "1st Aug 1978" },
                  { label: "Vehicle", value: "Ford Ecosport Titanium 2025" },
                  { label: "Registration No.", value: "KA 01 AB 1234" },
                ].map(({ label, value }, i) => (
                  <div key={label} className={cn("flex items-center px-3 py-2", i % 2 === 0 ? "bg-[#fafafa]" : "bg-white")}>
                    <div className="w-[45%] font-euclid text-[10px] text-[#8b87a3]">{label}</div>
                    <div className="font-euclid text-[11px] font-semibold text-[#36354c]">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Coverage details — 3-col cards */}
            <div>
              <div className="mb-2 font-euclid text-[10px] font-bold uppercase tracking-[0.1em] text-[#5c30c9]">Coverage Details</div>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: "Plan Type", value: "Comprehensive" },
                  { label: "IDV", value: "₹8,50,000" },
                  { label: "NCB Discount", value: "20%" },
                  { label: "PA Cover", value: "₹15,00,000" },
                  { label: "Zero Dep", value: "Included" },
                  { label: "Policy Term", value: "1 Year" },
                ].map(({ label, value }) => (
                  <div key={label} className="rounded-lg bg-[#f8f7fc] px-3 py-2">
                    <div className="font-euclid text-[10px] text-[#8b87a3]">{label}</div>
                    <div className="mt-0.5 font-euclid text-[11px] font-semibold text-[#36354c]">{value}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Bank details — action required */}
            <div className="rounded-lg border border-dashed border-[#f59e0b] bg-[#fffbeb] px-4 py-3">
              <div className="mb-2 flex items-center gap-1.5">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
                <div className="font-euclid text-[10px] font-bold uppercase tracking-wide text-[#b45309]">Bank Details — Action Required</div>
              </div>
              <div className="grid grid-cols-3 gap-x-3">
                {["Bank Name", "Account No.", "IFSC Code"].map((f) => (
                  <div key={f}>
                    <div className="font-euclid text-[10px] text-[#92400e]">{f}</div>
                    <div className="mt-0.5 font-euclid text-[10px] italic text-[#d4d2e3]">Not provided</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Terms placeholder */}
            <div>
              <div className="mb-2 font-euclid text-[10px] font-bold uppercase tracking-[0.1em] text-[#5b5675]">Terms & Conditions</div>
              <div className="flex flex-col gap-1.5">
                {Array.from({ length: 9 }).map((_, i) => (
                  <div key={i} className={cn("h-[5px] rounded-full bg-[#f0f0f4]", i === 8 ? "w-1/2" : "w-full")} />
                ))}
              </div>
            </div>

            {/* Footer — signature + stamp + page */}
            <div className="flex items-end justify-between border-t border-[#e7e7f0] pt-3">
              <div>
                <div className="mb-1 h-4 w-16 border-b border-[#5c30c9]" />
                <div className="font-euclid text-[9px] text-[#8b87a3]">Authorised Signatory</div>
                <div className="font-euclid text-[8px] text-[#c4c2d4]">ACKO General Insurance Ltd.</div>
              </div>
              <div className="flex flex-col items-center gap-1">
                <div className="flex h-9 w-9 items-center justify-center rounded-full border-2 border-[#5c30c9] opacity-50">
                  <span className="text-center font-euclid text-[6px] font-bold leading-tight text-[#5c30c9]">ACKO<br/>INSURED</span>
                </div>
                <div className="font-euclid text-[8px] text-[#c4c2d4]">Official Seal</div>
              </div>
              <div className="text-right">
                <div className="font-euclid text-[9px] text-[#8b87a3]">Page 1 of 4</div>
                <div className="mt-0.5 font-euclid text-[8px] text-[#c4c2d4]">CIN: U66000KA2016PLC086984</div>
              </div>
            </div>

          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Existing Tickets Panel ───────────────────────────────────────────────────

const EXISTING_TICKET = {
  id: "TK-2024-8847",
  subject: "Chassis Number Update – Ecosport Titanium",
  policy: "MTNDCR824725 – Ecosport Titanium 2025",
  status: "In Progress" as const,
  raisedAgo: "5 hours ago",
  description:
    "Customer requested to update policy start date. Endorsement request submitted and pending processing by underwriting team.",
  priority: "Medium" as const,
  channel: "Phone",
}

function ExistingTicketsPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col" data-figma-ref="existing-tickets-panel">
      <div className="shrink-0 border-b border-[#e7e7f0] px-4 py-4">
        <h3 className="font-euclid text-sm font-medium text-[#36354c]">Existing tickets</h3>
        <p className="mt-0.5 font-euclid text-[11px] text-[#8b87a3]">1 open ticket for this case</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-4">
          {/* Single existing ticket card */}
          <div className="rounded-xl border border-[#e7e7f0] bg-white">
            {/* Ticket header */}
            <div className="flex items-start justify-between gap-2 border-b border-[#f0f0f6] px-4 py-3">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-euclid text-[11px] font-semibold text-[#8b87a3] tracking-wide">#{EXISTING_TICKET.id}</span>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#fff7ed] px-2 py-0.5">
                    <span className="size-1.5 rounded-full bg-[#f58700]" />
                    <span className="font-euclid text-[10px] font-semibold text-[#f58700]">{EXISTING_TICKET.status}</span>
                  </span>
                </div>
                <p className="mt-1 font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">
                  {EXISTING_TICKET.subject}
                </p>
              </div>
              <a
                href={`https://acko.freshdesk.com/a/tickets/${EXISTING_TICKET.id}`}
                target="_blank"
                rel="noopener noreferrer"
                title="Open in Freshdesk"
                className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-md text-[#8b87a3] transition-colors hover:bg-[#f0f0f6] hover:text-[#7c47e1]"
              >
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M7 17L17 7M17 7H7M17 7v10" />
                </svg>
              </a>
            </div>

            {/* Ticket body */}
            <div className="px-4 py-3">
              <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
                {EXISTING_TICKET.description}
              </p>
              <div className="mt-3 grid grid-cols-2 gap-y-2">
                <div>
                  <p className="font-euclid text-[10px] text-[#8b87a3]">Policy</p>
                  <p className="mt-0.5 font-euclid text-[11px] font-medium text-[#36354c]">{EXISTING_TICKET.policy}</p>
                </div>
                <div>
                  <p className="font-euclid text-[10px] text-[#8b87a3]">Raised</p>
                  <p className="mt-0.5 font-euclid text-[11px] font-medium text-[#36354c]">{EXISTING_TICKET.raisedAgo}</p>
                </div>
                <div>
                  <p className="font-euclid text-[10px] text-[#8b87a3]">Priority</p>
                  <p className="mt-0.5 font-euclid text-[11px] font-medium text-[#36354c]">{EXISTING_TICKET.priority}</p>
                </div>
                <div>
                  <p className="font-euclid text-[10px] text-[#8b87a3]">Channel</p>
                  <p className="mt-0.5 font-euclid text-[11px] font-medium text-[#36354c]">{EXISTING_TICKET.channel}</p>
                </div>
              </div>
            </div>

          </div>

        </div>
      </div>
    </div>
  )
}

// ─── Similar Cases Panel ──────────────────────────────────────────────────────

const SIMILAR_CASES = [
  {
    id: "SC-001",
    title: "Chassis number update – Hyundai Creta",
    context: "Customer requested chassis number correction after RC reissue. Endorsement processed within 24 hours.",
    status: "Resolved",
    resolvedAgo: "2 days ago",
    outcome: "Chassis number updated successfully; customer notified via app.",
  },
  {
    id: "SC-002",
    title: "Chassis number mismatch – Honda City",
    context: "Chassis number on policy did not match RC copy. Escalated to underwriting for manual verification and update.",
    status: "Resolved",
    resolvedAgo: "1 week ago",
    outcome: "Underwriting team verified RC and applied chassis number correction within 12 hrs.",
  },
  {
    id: "SC-003",
    title: "Chassis number edit delayed – Maruti Brezza",
    context: "Customer queried why chassis number change was not reflected on app after 48 hours. Backend sync issue identified.",
    status: "Resolved",
    resolvedAgo: "3 days ago",
    outcome: "Sync issue resolved on backend; updated chassis number reflected within 2 hours.",
  },
]

function SimilarCasesPanel() {
  return (
    <div className="flex h-full min-h-0 flex-col" data-figma-ref="similar-cases-panel">
      <div className="shrink-0 border-b border-[#e7e7f0] px-4 py-4">
        <h3 className="font-euclid text-sm font-medium text-[#36354c]">Similar cases</h3>
        <p className="mt-0.5 font-euclid text-[11px] text-[#8b87a3]">{SIMILAR_CASES.length} cases matched by AI</p>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {SIMILAR_CASES.map((c) => (
            <div key={c.id} className="rounded-xl border border-[#e7e7f0] bg-white px-4 py-3">
              <p className="font-euclid text-[13px] font-semibold leading-5 text-[#36354c]">{c.title}</p>
              <p className="mt-1.5 font-euclid text-[12px] leading-[18px] text-[#5b5675]">{c.context}</p>
              <div className="mt-2.5 rounded-lg bg-[#f8f7fc] px-3 py-2">
                <p className="font-euclid text-[10px] font-semibold uppercase tracking-wide text-[#8b87a3] mb-0.5">Resolution</p>
                <p className="font-euclid text-[11px] leading-[16px] text-[#5b5675]">{c.outcome}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Main component ───────────────────────────────────────────────────────────

const MANUAL_SECTIONS: { title: string; actions: string[] }[] = [
  {
    title: "Policy Related Actions",
    actions: ["View policy", "Raise a claim", "Edit policy", "Cancel policy", "Claim handler call back", "Send communication", "Road side assistance"],
  },
  {
    title: "Other Quick Actions",
    actions: ["Re-assign ticket", "Transfer call", "Request documents"],
  },
  {
    title: "Data Investigation",
    actions: ["Communication history", "Payment history", "KYC logs"],
  },
]

interface EditPolicyFigmaHelloViewProps {
  customer: Customer
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  className?: string
}

type MessageContent =
  | "intro"
  | "ai_guidance"
  | "options"
  | "cx_self_serve"
  | "ai_self_serve_guide"
  | "ai_alert_success"
  | "ai_alert_tell_customer"
  | "cx_do_for_customer"
  | "ai_do_for_customer_ack"
  | "cx_view_policy"
  | "ai_view_policy_ack"
  | "cx_check_ticket"
  | "ai_ticket_opened"
  | "cx_something_else"
  | "ai_something_else_ack"

interface ChatMessage {
  id: string
  role: "ai" | "cx"
  content: MessageContent
}


export function EditPolicyFigmaHelloView({
  customer,
  activePolicies,
  inactivePolicies,
  className,
}: EditPolicyFigmaHelloViewProps) {
  const vehicleLabel = "Ecosport Titanium"

  // Rail + right panel state
  const [activeRailTab, setActiveRailTab] = useState<HelloRightRailTab>("workflows")
  const [isManualMode, setIsManualMode] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const pauseMs = HELLO_BOT_REPLY_AFTER_USER_MS
  const introTypingLabelId = useId()
  const guidanceTypingLabelId = useId()
  const optionsTypingLabelId = useId()
  const replyTypingLabelId = useId()

  // Staggered initial load: intro → guidance → options
  const [showIntroTyping, setShowIntroTyping] = useState(true)
  const [showBubble1, setShowBubble1] = useState(false)
  const [showTypingBeforeGuidance, setShowTypingBeforeGuidance] = useState(false)
  const [showGuidanceBubble, setShowGuidanceBubble] = useState(false)
  const [showTypingBeforeOptions, setShowTypingBeforeOptions] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  // Typing indicator after user picks
  const [aiTyping, setAiTyping] = useState(false)

  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [choiceMade, setChoiceMade] = useState<ChoiceId | null>(null)
  // Chrome-style persistent tabs: open tabs list + which tab is active
  const [openTabs, setOpenTabs] = useState<RightPanelKind[]>([])
  const [activeTabId, setActiveTabId] = useState<RightPanelKind | null>(null)
  const [tabHistory, setTabHistory] = useState<RightPanelKind[]>([])
  const [showTabsDropdown, setShowTabsDropdown] = useState(false)
  const [alertSent, setAlertSent] = useState(false)

  // Quick drawer state
  const [composerValue, setComposerValue] = useState("")

  const openTab = useCallback((kind: RightPanelKind) => {
    setOpenTabs((prev) => (prev.includes(kind) ? prev : [...prev, kind]))
    setTabHistory((prev) => (prev.includes(kind) ? prev : [...prev, kind]))
    setActiveTabId(kind)
    setRightPanelOpen(true)
    setActiveRailTab("workflows")
  }, [])

  const closeTab = useCallback((kind: RightPanelKind) => {
    setOpenTabs((prev) => {
      const next = prev.filter((k) => k !== kind)
      if (next.length === 0) {
        setActiveTabId(null)
        setRightPanelOpen(false)
      } else {
        setActiveTabId((cur) => (cur === kind ? next[next.length - 1] : cur))
      }
      return next
    })
  }, [])

  const handleRailTabChange = useCallback((tab: HelloRightRailTab) => {
    if (tab === "manual-mode") {
      setActiveRailTab((prev) => (prev === "manual-mode" ? "workflows" : "manual-mode"))
      return
    }
    if (tab === "power-tools") {
      if (activeRailTab === "power-tools") {
        setActiveRailTab("workflows")
        setRightPanelOpen(false)
      } else {
        setActiveRailTab("power-tools")
        setRightPanelOpen(true)
      }
      return
    }
    if (tab === "existing-tickets") {
      if (activeRailTab === "existing-tickets") {
        setActiveRailTab("workflows")
        setRightPanelOpen(false)
      } else {
        setActiveRailTab("existing-tickets")
        setRightPanelOpen(true)
      }
      return
    }
    if (tab === "similar-cases") {
      if (activeRailTab === "similar-cases") {
        setActiveRailTab("workflows")
        setRightPanelOpen(false)
      } else {
        setActiveRailTab("similar-cases")
        setRightPanelOpen(true)
      }
      return
    }
    // workflows / all-tabs
    if (activeRailTab === "workflows" && rightPanelOpen) {
      setRightPanelOpen(false)
    } else {
      setActiveRailTab("workflows")
      setRightPanelOpen(true)
    }
  }, [activeRailTab, rightPanelOpen])

  const manualModeProps = {
    isManualMode,
    onToggle: () => {
      setIsManualMode((prev) => {
        const next = !prev
        if (next) setRightPanelOpen(false)
        return next
      })
      setActiveRailTab("workflows")
    },
  }

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showBubble1, showGuidanceBubble, showOptions, aiTyping])

  // Stagger: intro → guidance → options (3 AI beats)
  useEffect(() => {
    let cancelled = false
    const schedule = (fn: () => void, ms: number) =>
      setTimeout(() => { if (!cancelled) fn() }, ms)
    const t0 = typingMs
    // Beat 1: intro bubble
    schedule(() => { setShowIntroTyping(false); setShowBubble1(true) }, t0)
    // Beat 2: guidance bubble
    schedule(() => setShowTypingBeforeGuidance(true), t0 + pauseMs)
    schedule(() => { setShowTypingBeforeGuidance(false); setShowGuidanceBubble(true) }, t0 + pauseMs + typingMs)
    // Beat 3: action options
    schedule(() => setShowTypingBeforeOptions(true), t0 + pauseMs + typingMs + pauseMs)
    schedule(() => { setShowTypingBeforeOptions(false); setShowOptions(true) }, t0 + pauseMs + typingMs + pauseMs + typingMs)
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePick = useCallback((key: string, _label: string) => {
    const choiceId = key as ChoiceId
    setChoiceMade(choiceId)

    if (choiceId === "self_serve") {
      setMessages((prev) => [...prev, { id: "cx-ss", role: "cx", content: "cx_self_serve" }])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [...prev, { id: "ai-ss-guide", role: "ai", content: "ai_self_serve_guide" }])
          setTimeout(() => openTab("send_acko_alert"), 450)
        }, typingMs)
      }, pauseMs)
    } else if (choiceId === "do_it_for_customer") {
      setMessages((prev) => [...prev, { id: "cx-difc", role: "cx", content: "cx_do_for_customer" }])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [...prev, { id: "ai-difc-ack", role: "ai", content: "ai_do_for_customer_ack" }])
          setTimeout(() => openTab("advisor_ui"), 450)
        }, typingMs)
      }, pauseMs)
    } else if (choiceId === "view_policy_doc") {
      setMessages((prev) => [...prev, { id: "cx-vpd", role: "cx", content: "cx_view_policy" }])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [...prev, { id: "ai-vpd-ack", role: "ai", content: "ai_view_policy_ack" }])
          setTimeout(() => openTab("policy_doc"), 450)
        }, typingMs)
      }, pauseMs)
    } else if (choiceId === "check_ticket") {
      setMessages((prev) => [...prev, { id: "cx-ct", role: "cx", content: "cx_check_ticket" }])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [...prev, { id: "ai-ct-ack", role: "ai", content: "ai_ticket_opened" }])
          // Open the existing tickets panel in the rail
          setTimeout(() => {
            setActiveRailTab("existing-tickets")
            setRightPanelOpen(true)
          }, 450)
        }, typingMs)
      }, pauseMs)
    } else if (choiceId === "something_else") {
      setMessages((prev) => [...prev, { id: "cx-se", role: "cx", content: "cx_something_else" }])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [...prev, { id: "ai-se-ack", role: "ai", content: "ai_something_else_ack" }])
        }, typingMs)
      }, pauseMs)
    }
  }, [openTab, pauseMs, typingMs])

  const handleAlertSent = useCallback(() => {
    setAlertSent(true)
    closeTab("send_acko_alert")
    setTimeout(() => {
      setAiTyping(true)
      setTimeout(() => {
        setAiTyping(false)
        setMessages((prev) => [
          ...prev,
          { id: "ai-alert-success", role: "ai", content: "ai_alert_success" },
          { id: "ai-alert-tell", role: "ai", content: "ai_alert_tell_customer" },
        ])
      }, typingMs)
    }, pauseMs)
  }, [closeTab, pauseMs, typingMs])

  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === "cx") {
      const labels: Record<MessageContent, string> = {
        intro: "",
        ai_guidance: "",
        options: "",
        cx_self_serve: "Share self-serve link",
        ai_self_serve_guide: "",
        ai_alert_success: "",
        ai_alert_tell_customer: "",
        cx_do_for_customer: "Do it on customer's behalf",
        ai_do_for_customer_ack: "",
        cx_view_policy: "View policy document",
        ai_view_policy_ack: "",
        cx_check_ticket: "Check ticket status",
        ai_ticket_opened: "",
        cx_something_else: "Customer called for something else",
        ai_something_else_ack: "",
      }
      return (
        <div key={msg.id} className="flex w-full justify-end">
          <HelloCxBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">{labels[msg.content]}</p>
          </HelloCxBubbleCard>
        </div>
      )
    }

    if (msg.content === "intro") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              Customer is calling to know the status on{" "}
              <span className="font-semibold text-[#040222]">ongoing Chassis Number endorsement</span>{" "}
              in the policy document of{" "}
              <span className="font-semibold text-[#040222]">{vehicleLabel}</span>
            </p>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ai_guidance") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              The endorsement request was raised <span className="font-semibold text-[#040222]">5 hours ago</span> and
              it takes <span className="font-semibold text-[#040222]">48 hours</span> time for the edit request to
              reflect on the app, ask customer to wait for the time being.
            </p>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "options") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity={false}>
            <WorkflowOfferPick
              options={[
                { key: "check_ticket", label: "Check ticket status" },
                { key: "something_else", label: "Customer called for something else" },
              ]}
              disabled={false}
              selectedKey={
                choiceMade === "check_ticket" ? "check_ticket"
                : choiceMade === "something_else" ? "something_else"
                : null
              }
              onPick={handlePick}
            />
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ai_self_serve_guide") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              To send a self-serve link, send a ACKO alert and select main action as{" "}
              <span className="font-semibold text-[#040222]">"Edit policy"</span> and sub action as{" "}
              <span className="font-semibold text-[#040222]">"Chassis number"</span>.
            </p>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ai_alert_success") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex items-center gap-2">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] ring-1 ring-[#d1fae5]">
                <Check className="size-3 text-[#059669]" strokeWidth={2.5} />
              </div>
              <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                ACKO Alert successfully sent to edit bank name on the policy.
              </p>
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ai_alert_tell_customer") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5">
              <HelloTellCustomerLabel />
              <p className="mt-1 font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
                &ldquo;You would have received a notification on your phone, just click on it and edit your bank name there.&rdquo;
              </p>
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ai_do_for_customer_ack") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              As requested, opening the edit policy workspace for you.
            </p>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ai_view_policy_ack") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              As requested, opening the policy document for{" "}
              <span className="font-semibold text-[#040222]">Ecosport Titanium 2025</span>.
            </p>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ai_ticket_opened") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex items-start gap-2">
              <div className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#fff7ed] ring-1 ring-[#fed7aa]">
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#f58700" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                Found existing ticket{" "}
                <span className="font-semibold text-[#040222]">#TK-2024-8847</span> for this
                endorsement. Opening ticket details in the panel.
              </p>
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ai_something_else_ack") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              Understood. How can I help the customer today?
            </p>
          </HelloAiBubbleCard>
        </div>
      )
    }

    return null
  }

  // Manual mode uses the center pane for actions — hide the workflow content panel
  const showRightContentArea = !isManualMode && rightPanelOpen

  return (
    <div className={cn("relative flex w-full bg-[#fafafa]", className)}>
      {/* Left sidebar */}
      <CustomerProfileSidebar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
        showTabs
        className="shrink-0"
        onViewPolicyDoc={() => openTab("policy_doc")}
        activeCases={[
          {
            title: "Ongoing endorsement",
            subtitle: "Ecosport Titanium 2025",
            details: [
              { label: "Endorsement",       value: "Chassis number" },
              { label: "Endorsement date",  value: "30th May 2026" },
              { label: "Policy holder",     value: customer.name },
              { label: "Policy document",   value: "Link", isLink: true },
            ],
          },
        ]}
      />

      {/* Center panel — manual mode grid OR chat */}
      <div
        className={cn(
          "relative flex min-h-0 flex-1 flex-col",
          showRightContentArea ? "border-r border-[#e7e7f0]" : "",
        )}
      >
        {/* ── Manual mode: action grid ── */}
        {isManualMode ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain px-10 py-6">
            {MANUAL_SECTIONS.map((section) => (
              <div key={section.title} className="mb-7">
                <p className="mb-3 font-euclid text-[11px] font-medium uppercase tracking-widest text-[#9c9aaf]">
                  {section.title}
                </p>
                <div className="grid grid-cols-4 gap-2">
                  {section.actions.map((action) => (
                    <button
                      key={action}
                      type="button"
                      className="rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5 text-left font-euclid text-[13px] font-medium text-[#36354c] transition-colors hover:border-[#c7b8f0] hover:bg-[#f5f3fc] hover:text-[#040222]"
                    >
                      {action}
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
        <>{/* ── AI mode: chat ── */}
        <div className="min-h-0 flex flex-1 flex-col items-start gap-3 overflow-y-auto overscroll-y-contain px-10 py-5">
          {showIntroTyping && <TypingIndicator labelId={introTypingLabelId} showIdentity />}
          {showBubble1 && renderMessage({ id: "intro", role: "ai", content: "intro" })}
          {showTypingBeforeGuidance && <TypingIndicator labelId={guidanceTypingLabelId} showIdentity />}
          {showGuidanceBubble && renderMessage({ id: "guidance", role: "ai", content: "ai_guidance" })}
          {showTypingBeforeOptions && <TypingIndicator labelId={optionsTypingLabelId} showIdentity={false} />}
          {showOptions && renderMessage({ id: "options", role: "ai", content: "options" })}
          {messages.map(renderMessage)}
          {aiTyping && <TypingIndicator labelId={replyTypingLabelId} showIdentity={false} />}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="relative shrink-0 border-t border-[#e7e7f0] px-10 py-3">
          <div className="flex items-center gap-3 rounded-2xl border border-[#e7e7f0] bg-white px-4 py-3 shadow-sm">
            <input
              type="text"
              value={composerValue}
              onChange={(e) => setComposerValue(e.target.value)}
              placeholder="Ask anything here..."
              className="min-w-0 flex-1 font-euclid text-[14px] text-[#36354c] outline-none placeholder:text-[#8b87a3]"
            />
            <button type="button" className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5c30c9]">
              <Send className="size-4 text-white" />
            </button>
          </div>
        </div>
        </>)}
      </div>

      {/* Right content panel */}
      {showRightContentArea && (
        <div className="flex h-full w-[380px] shrink-0 flex-col border-l border-[#e7e7f0] bg-white">
          {/* Power tools */}
          {activeRailTab === "power-tools" && (
            <HelloPowerToolsPanel onToolClick={() => {}} />
          )}

          {/* Existing tickets */}
          {activeRailTab === "existing-tickets" && (
            <ExistingTicketsPanel />
          )}

          {/* Similar cases */}
          {activeRailTab === "similar-cases" && (
            <SimilarCasesPanel />
          )}

          {/* Workflow panels — Chrome-style persistent tab bar */}
          {activeRailTab === "workflows" && (
            <>
              {/* Tab header row — always visible; border-b only when tabs are open */}
              <div className="flex shrink-0 items-center justify-between px-3 pt-3 pb-2">
                {/* Tabs — shown only when tabs exist */}
                {openTabs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {openTabs.map((kind) => (
                      <div
                        key={kind}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 transition-colors",
                          activeTabId === kind
                            ? "border-[#e0e0e8] bg-[#f8f7fc]"
                            : "border-transparent bg-[#f8f7fc] hover:bg-[#f0f0f6]",
                        )}
                        onClick={() => setActiveTabId(kind)}
                      >
                        <span
                          className={cn(
                            "font-euclid text-sm font-medium whitespace-nowrap",
                            activeTabId === kind ? "text-[#5b5675]" : "text-[#36354c]",
                          )}
                        >
                          {PANEL_LABELS[kind]}
                        </span>
                        {activeTabId === kind && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); closeTab(kind) }}
                            className="flex size-5 items-center justify-center rounded transition-colors hover:bg-[#5b5675]/10"
                          >
                            <X className="size-3 text-[#5b5675]" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                ) : (
                  <div />
                )}

                {/* 3-dot menu — always visible */}
                <div className="relative">
                  <button
                    type="button"
                    onClick={() => setShowTabsDropdown((v) => !v)}
                    className="flex size-6 items-center justify-center rounded transition-colors hover:bg-[#f0f0f6]"
                    aria-label="Workflow menu"
                  >
                    <MoreVertical className="size-4 text-[#5b5675]" />
                  </button>
                  {showTabsDropdown && (
                    <>
                      <div className="fixed inset-0 z-40" onClick={() => setShowTabsDropdown(false)} />
                      <div className="absolute right-0 top-8 z-50 w-48 overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0px_4px_4px_-2px_rgba(54,53,76,0.06)]">
                        <div className="py-1.5">
                          {tabHistory.filter((k) => !openTabs.includes(k)).length > 0 ? (
                            tabHistory.filter((k) => !openTabs.includes(k)).map((kind) => (
                              <button
                                key={kind}
                                type="button"
                                onClick={() => { openTab(kind); setShowTabsDropdown(false) }}
                                className="flex w-full items-center px-4 py-2 text-left font-euclid text-sm text-[#040222] transition-colors hover:bg-[#f8f7fc]"
                              >
                                {PANEL_LABELS[kind]}
                              </button>
                            ))
                          ) : (
                            <p className="px-4 py-2 font-euclid text-sm text-[#9c9aaf]">No recent activity</p>
                          )}
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>

              {/* Divider — only when tabs are open */}
              {openTabs.length > 0 && (
                <div className="shrink-0 border-b border-[#e7e7f0]" />
              )}

              {/* Panel bodies — only the active tab's content is shown */}
              {activeTabId === "send_acko_alert" && (
                <div className="min-h-0 flex-1 overflow-visible">
                  <SendAckoAlertPanel onSent={handleAlertSent} />
                </div>
              )}

              {activeTabId === "advisor_ui" && (
                <div className="flex h-full items-center justify-center p-8">
                  <div className="text-center">
                    <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-[#f4f0fb]">
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7c47e1" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <rect x="2" y="3" width="20" height="14" rx="2" />
                        <path d="M8 21h8M12 17v4" />
                      </svg>
                    </div>
                    <p className="font-euclid text-[15px] font-semibold text-[#36354c]">Advisor UI will show here</p>
                    <p className="mt-2 font-euclid text-[13px] leading-5 text-[#8b87a3]">
                      The advisor interface for editing the policy on the customer's behalf is coming soon.
                    </p>
                  </div>
                </div>
              )}

              {activeTabId === "policy_doc" && (
                <div className="min-h-0 flex-1 overflow-hidden">
                  <PolicyPdfViewer />
                </div>
              )}

              {/* Empty state — no tabs open */}
              {openTabs.length === 0 && (
                <div className="flex h-full flex-col items-center justify-center gap-3 p-8 text-center">
                  <div className="flex size-12 items-center justify-center rounded-full bg-[#f4f4f6]">
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b87a3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                      <rect x="3" y="3" width="7" height="7" rx="1" />
                      <rect x="14" y="3" width="7" height="7" rx="1" />
                      <rect x="3" y="14" width="7" height="7" rx="1" />
                      <rect x="14" y="14" width="7" height="7" rx="1" />
                    </svg>
                  </div>
                  <p className="font-euclid text-[13px] text-[#8b87a3]">
                    No active tabs. Select an option from the chat to open a workflow.
                  </p>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Right icon rail — always visible on far right */}
      <HelloRightPanelIconRail
        activeTab={activeRailTab}
        onTabChange={handleRailTabChange}
        manualMode={manualModeProps}
        isRailOnlyLayout={!showRightContentArea}
        showLabels
        hasExistingTickets
        hasSimilarCases
      />
    </div>
  )
}
