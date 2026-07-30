/**
 * UC6 — Raise a Claim (Figma design)
 * Flow: 3 options → Request Docs panel → Review modal → Raise Claim tab (app mockup)
 */
import { useCallback, useEffect, useId, useRef, useState } from "react"
import { AlertTriangle, Check, ChevronDown, MoreVertical, Send, X } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Customer, InactivePolicy, Policy } from "@/types/crm"
import { CustomerProfileSidebar } from "@/components/crm/hello/CustomerProfileSidebar"
import { HelloAiBubbleCard, HelloCxBubbleCard, TypingIndicator } from "@/components/crm/hello/HelloChatPrimitives"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import {
  HelloRightPanelIconRail,
  HelloPowerToolsPanel,
  type HelloRightRailTab,
} from "@/components/crm/hello/HelloRightPanelRail"
import { HELLO_BOT_REPLY_AFTER_USER_MS, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS } from "@/components/crm/hello/helloRaiseClaimCopy"
import {
  QuickCapabilityDrawer,
  type QuickDrawerItem,
} from "@/components/crm/hello/QuickCapabilityDrawer"

// ─── Types ────────────────────────────────────────────────────────────────────

type ChoiceId = "guide_customer" | "raise_on_behalf" | "something_else"

type RightTab = "request_docs" | "raise_claim"

const RIGHT_TAB_LABELS: Record<RightTab, string> = {
  request_docs: "Request documents",
  raise_claim: "Do it for customer · Raise a claim",
}

type RequestDocStatus = "idle" | "sent" | "received" | "reviewed"

// ─── Self-serve guide copy (Guide customer path) ──────────────────────────────

const SELF_SERVE_STEPS = [
  'Open the ACKO app and go to "My Policies".',
  "Select the Ecosport Titanium 2025 policy.",
  'Tap "File a Claim" and follow the steps on screen.',
  "Upload the RC Copy and Driving License when prompted.",
  "Your claim handler will call within 1\u20132 working days.",
]

// ─── Mobile app mockup (right panel Raise Claim tab) ─────────────────────────

const CLAIM_INCIDENT_OPTIONS = [
  {
    id: "accident",
    title: "My car was damaged in an accident",
    sub: "I hit another vehicle, a person, or an object.",
  },
  {
    id: "no_accident",
    title: "My car is damaged, but there was no accident",
    sub: "My car is damaged from parking mishaps, falling objects, etc.",
  },
  {
    id: "stolen",
    title: "My car has been stolen",
    sub: "My car is missing and I want to report it.",
  },
  {
    id: "parts_stolen",
    title: "My car parts or accessories were stolen/damaged/lost",
    sub: "",
  },
]

export interface RaiseClaimAppMockupProps {
  policyLabel?: string
  onClaimRaised?: () => void
}

export function RaiseClaimAppMockup({ policyLabel = "Tata Nexon", onClaimRaised }: RaiseClaimAppMockupProps) {
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [step, setStep] = useState<"select" | "submitting" | "success">("select")

  const handleRaise = () => {
    if (!selectedId) return
    setStep("submitting")
    window.setTimeout(() => {
      setStep("success")
      window.setTimeout(() => {
        onClaimRaised?.()
      }, 1800)
    }, 1400)
  }

  return (
    <div className="flex w-full flex-col gap-4 px-4 py-6">
      <div className="mx-auto w-full max-w-[300px]">
        <div className="relative w-full overflow-hidden rounded-[28px] border-2 border-[#e7e7f0] bg-[#f4f4f6] p-2 shadow-[0px_12px_40px_rgba(28,11,62,0.12)]">
          <div className="relative h-[520px] overflow-y-auto rounded-[22px] bg-white">

            {/* ── Success state ── */}
            {step === "success" ? (
              <div className="flex h-full flex-col items-center justify-center gap-4 p-6 text-center">
                <div className="flex size-14 items-center justify-center rounded-full bg-[#e8f5e8]">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#0fa457" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <div>
                  <p className="font-euclid text-[15px] font-bold text-[#040222]">Claim raised!</p>
                  <p className="mt-1 font-euclid text-[11px] leading-4 text-[#5b5675]">
                    Your claim has been registered. A claim handler will call you within 2 hours.
                  </p>
                </div>
                <div className="w-full rounded-xl border border-[#e7e7f0] bg-[#f8f7fc] px-3 py-2.5">
                  <p className="font-euclid text-[10px] font-medium uppercase tracking-wide text-[#9c9aaf]">Claim ID</p>
                  <p className="mt-0.5 font-euclid text-[13px] font-semibold text-[#040222]">
                    CLM{Math.floor(100000 + Math.random() * 900000)}
                  </p>
                </div>
              </div>
            ) : (
              <div className="flex flex-col gap-4 p-4">
                {/* App header */}
                <div className="flex items-center gap-2 border-b border-[#f0f0f5] pb-3">
                  <div className="flex size-8 items-center justify-center rounded-full bg-[#5c30c9]">
                    <span className="font-euclid text-[11px] font-bold text-white">A</span>
                  </div>
                  <div>
                    <p className="font-euclid text-[13px] font-semibold text-[#040222]">Raise a claim</p>
                    <p className="font-euclid text-[11px] text-[#5b5675]">{policyLabel}</p>
                  </div>
                </div>

                {/* Tell us what happened */}
                <div>
                  <p className="mb-3 font-euclid text-[13px] font-semibold text-[#040222]">Tell us what happened</p>
                  <div className="flex flex-col gap-2">
                    {CLAIM_INCIDENT_OPTIONS.map((item) => {
                      const isSelected = selectedId === item.id
                      return (
                        <button
                          key={item.id}
                          type="button"
                          disabled={step === "submitting"}
                          onClick={() => setSelectedId(item.id)}
                          className={cn(
                            "flex w-full items-center justify-between rounded-xl border p-3 gap-2 text-left transition-colors",
                            isSelected
                              ? "border-[#7c47e1] bg-[#f4f0fb]"
                              : "border-[#e7e7f0] bg-white hover:border-[#c9b8f5]",
                          )}
                        >
                          <div className="flex items-start gap-2">
                            <div
                              className={cn(
                                "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
                                isSelected ? "border-[#7c47e1] bg-[#7c47e1]" : "border-[#c5c2d6]",
                              )}
                            >
                              {isSelected && <div className="size-1.5 rounded-full bg-white" />}
                            </div>
                            <div>
                              <p className="font-euclid text-[11px] font-semibold leading-[15px] text-[#040222]">
                                {item.title}
                              </p>
                              {item.sub && (
                                <p className="mt-0.5 font-euclid text-[10px] leading-[14px] text-[#5b5675]">
                                  {item.sub}
                                </p>
                              )}
                            </div>
                          </div>
                          <ChevronDown className="size-3.5 shrink-0 -rotate-90 text-[#5b5675]" />
                        </button>
                      )
                    })}
                  </div>
                </div>

                {/* Raise a claim CTA */}
                <button
                  type="button"
                  onClick={handleRaise}
                  disabled={!selectedId || step === "submitting"}
                  className={cn(
                    "flex w-full items-center justify-center rounded-xl py-3 font-euclid text-[13px] font-semibold text-white transition-all",
                    selectedId && step !== "submitting"
                      ? "bg-[#5c30c9] hover:bg-[#4e28ad] active:scale-[0.98]"
                      : "cursor-not-allowed bg-[#c9b8f5]",
                  )}
                >
                  {step === "submitting" ? (
                    <span className="flex items-center gap-2">
                      <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                      </svg>
                      Submitting…
                    </span>
                  ) : (
                    "Raise a claim"
                  )}
                </button>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  )
}

// ─── Request Documents Panel ──────────────────────────────────────────────────

export interface RequestDocsPanelProps {
  onAlreadyHaveDocs: () => void
  onDocsSent: () => void
  onReviewDocs?: () => void
}

export function RequestDocsPanel({ onAlreadyHaveDocs, onDocsSent, onReviewDocs }: RequestDocsPanelProps) {
  const [viaWhatsapp, setViaWhatsapp] = useState(true)
  const [viaEmail, setViaEmail] = useState(false)
  const [selectedDocs, setSelectedDocs] = useState<string[]>([])
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [status, setStatus] = useState<"idle" | "sent" | "received">("idle")
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const docOptions = ["License copy", "RC Copy", "Insurance copy"]

  const addDoc = (doc: string) => {
    if (!selectedDocs.includes(doc)) {
      setSelectedDocs((prev) => [...prev, doc])
    }
    setDropdownOpen(false)
  }

  const removeDoc = (doc: string) => {
    setSelectedDocs((prev) => prev.filter((d) => d !== doc))
  }

  const handleSend = () => {
    setStatus("sent")
    onDocsSent()
    timerRef.current = setTimeout(() => {
      setStatus("received")
    }, 3000)
  }

  useEffect(() => {
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [])

  const defaultMessage =
    "Hi – we need clear photos or PDFs of your vehicle RC to process your request. Please share it here when you can.\n\nThank you,\nACKO CX"

  return (
    <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-4 py-5">
      {/* Request via */}
      <div className="flex flex-col gap-2.5">
        <p className="font-euclid text-[13px] font-semibold text-[#040222]">Request via</p>
        <div className="flex items-center gap-4">
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={viaWhatsapp}
              onChange={(e) => setViaWhatsapp(e.target.checked)}
              className="size-4 accent-[#5c30c9]"
            />
            <span className="font-euclid text-[13px] text-[#36354c]">WhatsApp</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2">
            <input
              type="checkbox"
              checked={viaEmail}
              onChange={(e) => setViaEmail(e.target.checked)}
              className="size-4 accent-[#5c30c9]"
            />
            <span className="font-euclid text-[13px] text-[#36354c]">Email</span>
          </label>
        </div>
      </div>

      {/* Mobile number */}
      <div className="flex flex-col gap-1.5">
        <p className="font-euclid text-[12px] font-medium text-[#5b5675]">Mobile number</p>
        <div className="rounded-lg border border-[#e7e7f0] px-3 py-2.5">
          <span className="font-euclid text-[13px] text-[#36354c]">+91 9555539998</span>
        </div>
      </div>

      {/* Select policy documents */}
      <div className="flex flex-col gap-1.5">
        <p className="font-euclid text-[12px] font-medium text-[#5b5675]">Select policy documents to request</p>

        {/* Selected tags */}
        {selectedDocs.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {selectedDocs.map((doc) => (
              <span
                key={doc}
                className="flex items-center gap-1 rounded-md bg-[#ede9fb] px-2 py-1 font-euclid text-[12px] font-medium text-[#5c30c9]"
              >
                {doc}
                <button type="button" onClick={() => removeDoc(doc)} className="ml-0.5">
                  <X className="size-3 text-[#7c47e1]" />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Dropdown trigger */}
        <div className="relative">
          <button
            type="button"
            onClick={() => setDropdownOpen((o) => !o)}
            className="flex w-full items-center justify-between rounded-lg border border-[#e7e7f0] bg-white px-3 py-2.5"
          >
            <span className="font-euclid text-[13px] text-[#8b87a3]">
              {selectedDocs.length > 0 ? "Add more…" : "Select policy"}
            </span>
            <ChevronDown className="size-4 text-[#5b5675]" />
          </button>
          {dropdownOpen && (
            <div className="absolute left-0 top-full z-20 mt-1 w-full overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-md">
              {docOptions.map((opt) => (
                <button
                  key={opt}
                  type="button"
                  onClick={() => addDoc(opt)}
                  className="flex w-full items-center px-3 py-2.5 text-left font-euclid text-[13px] text-[#36354c] hover:bg-[#f8f7fc]"
                >
                  {opt}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Message to send (after docs selected) */}
      {selectedDocs.length > 0 && (
        <div className="flex flex-col gap-1.5">
          <p className="font-euclid text-[12px] font-medium text-[#5b5675]">Message to send</p>
          <textarea
            defaultValue={defaultMessage}
            rows={5}
            className="w-full resize-none rounded-lg border border-[#e7e7f0] px-3 py-2.5 font-euclid text-[13px] text-[#36354c] outline-none focus:border-[#7c47e1]"
          />
        </div>
      )}

      {/* Send / Sent state */}
      {status === "idle" && (
        <button
          type="button"
          onClick={handleSend}
          disabled={selectedDocs.length === 0}
          className={cn(
            "w-full rounded-xl py-3 font-euclid text-[14px] font-semibold transition-colors",
            selectedDocs.length > 0
              ? "bg-[#5c30c9] text-white hover:bg-[#4a27a0]"
              : "bg-[#e7e7f0] text-[#8b87a3] cursor-not-allowed",
          )}
        >
          Send
        </button>
      )}

      {status === "sent" && (
        <button
          type="button"
          disabled
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ede9fb] py-3 font-euclid text-[14px] font-medium text-[#7c47e1]"
        >
          <svg className="size-4 animate-spin" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
            <circle cx="12" cy="12" r="10" strokeOpacity="0.25" />
            <path d="M12 2a10 10 0 0 1 10 10" />
          </svg>
          Request sent · Waiting for documents
        </button>
      )}

      {status === "received" && (
        <div className="flex flex-col gap-3">
          <div className="flex items-center gap-2">
            <Check className="size-4 text-[#0d8a4a]" strokeWidth={2.5} />
            <span className="font-euclid text-[13px] font-semibold text-[#0d8a4a]">2 documents received</span>
          </div>
          <button
            type="button"
            onClick={() => onReviewDocs?.()}
            className="w-full rounded-xl bg-[#5c30c9] py-3 font-euclid text-[14px] font-semibold text-white hover:bg-[#4a27a0]"
          >
            Review documents
          </button>
        </div>
      )}

    </div>
  )
}

// ─── Review Documents Modal ───────────────────────────────────────────────────

export interface ReviewDocsModalProps {
  onClose: () => void
  onApprove: () => void
}

export function ReviewDocsModal({ onClose, onApprove }: ReviewDocsModalProps) {
  const [selectedFile, setSelectedFile] = useState<"rc" | "license">("rc")

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="flex w-full max-w-[640px] flex-col gap-4 rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center justify-between">
          <h2 className="font-euclid text-[16px] font-semibold text-[#040222]">Review documents</h2>
          <button type="button" onClick={onClose} className="text-[#5b5675] hover:text-[#040222]">
            <X className="size-5" />
          </button>
        </div>

        <div className="flex gap-4">
          {/* File list */}
          <div className="flex w-40 shrink-0 flex-col gap-2">
            <p className="font-euclid text-[12px] font-semibold text-[#5b5675]">Documents</p>
            {[
              { id: "rc" as const, label: "RC Copy.PNG", size: "2.3 MB" },
              { id: "license" as const, label: "Driving_license.PNG", size: "2.3 MB" },
            ].map((file) => (
              <button
                key={file.id}
                type="button"
                onClick={() => setSelectedFile(file.id)}
                className={cn(
                  "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-left transition-colors",
                  selectedFile === file.id
                    ? "border-[#7c47e1] bg-[#f4f0fb]"
                    : "border-[#e7e7f0] bg-white",
                )}
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="shrink-0 text-[#7c47e1]">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
                <div>
                  <p className="font-euclid text-[11px] font-medium text-[#36354c]">{file.label}</p>
                  <p className="font-euclid text-[10px] text-[#8b87a3]">{file.size}</p>
                </div>
                <ChevronDown className="-rotate-90 ml-auto size-3.5 shrink-0 text-[#5b5675]" />
              </button>
            ))}
          </div>

          {/* Image preview */}
          <div className="flex flex-1 items-center justify-center rounded-xl border border-[#e7e7f0] bg-[#f8f7fc] p-3">
            {selectedFile === "rc" ? (
              <div className="flex w-full flex-col items-center gap-2">
                <div className="rounded-lg bg-[#f4d03f] p-4 text-center w-full max-w-[200px]">
                  <p className="font-euclid text-[10px] font-bold text-[#7d6608] uppercase">Certificate of Registration</p>
                  <p className="mt-1 font-euclid text-[8px] text-[#7d6608]">Department of Transport, Govt of Bihar</p>
                  <div className="mt-3 flex flex-col gap-1 text-left">
                    {["Regd. No.", "Name", "S/W/D of", "Address", "Vehicle Class", "Chassis No.", "Engine No.", "Registration Date"].map((lbl) => (
                      <div key={lbl} className="flex justify-between">
                        <span className="font-euclid text-[7px] text-[#7d6608]">{lbl}</span>
                        <div className="h-1.5 w-16 rounded bg-[#c9a90a]/30" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex w-full flex-col items-center gap-2">
                <div className="rounded-lg bg-[#d5f5e3] p-4 text-center w-full max-w-[200px]">
                  <p className="font-euclid text-[10px] font-bold text-[#0d6b3a] uppercase">Driving License</p>
                  <div className="mt-3 flex flex-col gap-1 text-left">
                    {["DL No.", "Name", "DOB", "Valid Till", "Class"].map((lbl) => (
                      <div key={lbl} className="flex justify-between">
                        <span className="font-euclid text-[7px] text-[#0d6b3a]">{lbl}</span>
                        <div className="h-1.5 w-16 rounded bg-[#0d6b3a]/20" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-3 border-t border-[#e7e7f0] pt-4">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-[#7c47e1] px-5 py-2.5 font-euclid text-[14px] font-medium text-[#7c47e1] hover:bg-[#f4f0fb]"
          >
            Request again
          </button>
          <button
            type="button"
            onClick={onApprove}
            className="rounded-xl bg-[#5c30c9] px-5 py-2.5 font-euclid text-[14px] font-medium text-white hover:bg-[#4a27a0]"
          >
            Approve documents
          </button>
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

interface RaiseClaimFigmaHelloViewProps {
  customer: Customer
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  className?: string
}

type MessageRole = "ai" | "cx"

interface ChatMessage {
  id: string
  role: MessageRole
  content:
    | "intro"
    | "options"
    | "cx_choice"
    | "ncb_warning"
    | "two_steps"
    | "guide_steps"
    | "something_else_ack"
    | "claim_success"
    | "claim_tell_customer"
    | "raise_claim_cmd"       // cx typed "Raise a claim" via quick drawer
    | "policy_picker"         // ai asks which policy
    | "policy_selected"       // cx picked a policy
    | "policy_claim_options"  // ai shows 3 claim options for the drawer flow
  choiceLabel?: string
  claimId?: string
  policyId?: string
}

const QUICK_ITEMS: QuickDrawerItem[] = [
  {
    id: "raise_claim",
    label: "Raise a claim",
    description: "Raise a motor insurance claim on customer's behalf",
  },
]


export function RaiseClaimFigmaHelloView({
  customer,
  activePolicies,
  inactivePolicies,
  className,
}: RaiseClaimFigmaHelloViewProps) {
  const vehicleLabel = "Ecosport Titanium"

  // Rail + right panel state
  const [activeRailTab, setActiveRailTab] = useState<HelloRightRailTab>("workflows")
  const [isManualMode, setIsManualMode] = useState(false)
  const [rightPanelOpen, setRightPanelOpen] = useState(false)

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

  const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
  const pauseMs = HELLO_BOT_REPLY_AFTER_USER_MS
  const introTypingLabelId = useId()
  const optionsTypingLabelId = useId()
  const replyTypingLabelId = useId()

  // Staggered initial load
  const [showIntroTyping, setShowIntroTyping] = useState(true)
  const [showBubble1, setShowBubble1] = useState(false)
  const [showTypingBeforeOptions, setShowTypingBeforeOptions] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  // Typing indicator after user picks
  const [aiTyping, setAiTyping] = useState(false)

  // Chat state
  const [messages, setMessages] = useState<ChatMessage[]>([])
  const [choiceMade, setChoiceMade] = useState<ChoiceId | null>(null)

  // Chrome-style persistent tabs
  const [openTabs, setOpenTabs] = useState<RightTab[]>([])
  const [activeTabId, setActiveTabId] = useState<RightTab | null>(null)
  const [tabHistory, setTabHistory] = useState<RightTab[]>([])
  const [showTabsDropdown, setShowTabsDropdown] = useState(false)
  const [showReviewModal, setShowReviewModal] = useState(false)
  const [docsApproved, setDocsApproved] = useState(false)

  const [composerValue, setComposerValue] = useState("")

  // Quick drawer
  const [quickDrawerOpen, setQuickDrawerOpen] = useState(false)
  const [quickHighlight, setQuickHighlight] = useState(0)
  const quickDrawerRef = useRef<HTMLDivElement>(null)

  // Policy picker drawer flow
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null)
  const [drawerChoiceMade, setDrawerChoiceMade] = useState<string | null>(null)

  const drawerItems = composerValue.trim().length > 0
    ? QUICK_ITEMS.filter((item) =>
        item.label.toLowerCase().includes(composerValue.toLowerCase().trim()),
      )
    : QUICK_ITEMS

  const openTab = useCallback((tab: RightTab) => {
    setOpenTabs((prev) => (prev.includes(tab) ? prev : [...prev, tab]))
    setTabHistory((prev) => (prev.includes(tab) ? prev : [...prev, tab]))
    setActiveTabId(tab)
    setRightPanelOpen(true)
    setActiveRailTab("workflows")
  }, [])

  const closeTab = useCallback((tab: RightTab) => {
    setOpenTabs((prev) => {
      const next = prev.filter((t) => t !== tab)
      if (next.length === 0) {
        setActiveTabId(null)
        setRightPanelOpen(false)
      } else {
        setActiveTabId((cur) => (cur === tab ? next[next.length - 1] : cur))
      }
      return next
    })
  }, [])

  const chatEndRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, showBubble1, showOptions, aiTyping])

  // Close quick drawer on outside click
  useEffect(() => {
    if (!quickDrawerOpen) return
    const handleClick = (e: MouseEvent) => {
      if (quickDrawerRef.current && !quickDrawerRef.current.contains(e.target as Node)) {
        setQuickDrawerOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClick)
    return () => document.removeEventListener("mousedown", handleClick)
  }, [quickDrawerOpen])

  // Stagger the initial two AI messages with typing indicators
  useEffect(() => {
    let cancelled = false
    const schedule = (fn: () => void, ms: number) =>
      setTimeout(() => { if (!cancelled) fn() }, ms)
    const t0 = typingMs
    schedule(() => { setShowIntroTyping(false); setShowBubble1(true) }, t0)
    schedule(() => setShowTypingBeforeOptions(true), t0 + pauseMs)
    schedule(() => { setShowTypingBeforeOptions(false); setShowOptions(true) }, t0 + pauseMs + typingMs)
    return () => { cancelled = true }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const handlePick = useCallback((key: string, label: string) => {
    const choiceId = key as ChoiceId
    setChoiceMade(choiceId)

    const cxMsg: ChatMessage = {
      id: `cx-${Date.now()}`,
      role: "cx",
      content: "cx_choice",
      choiceLabel: label,
    }

    if (choiceId === "raise_on_behalf") {
      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: "ncb", role: "ai", content: "ncb_warning" },
            { id: "two-steps", role: "ai", content: "two_steps" },
          ])
          setTimeout(() => openTab("request_docs"), 400)
        }, typingMs)
      }, pauseMs)
    } else if (choiceId === "guide_customer") {
      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [...prev, { id: "guide", role: "ai", content: "guide_steps" }])
        }, typingMs)
      }, pauseMs)
    } else {
      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [...prev, { id: "else", role: "ai", content: "something_else_ack" }])
        }, typingMs)
      }, pauseMs)
    }
  }, [openTab, pauseMs, typingMs])

  const handleAlreadyHaveDocs = useCallback(() => {
    setDocsApproved(true)
    openTab("raise_claim")
  }, [openTab])

  const handleDocsSent = useCallback(() => {
    // status is managed within RequestDocsPanel; we listen for the "Review" click
  }, [])

  const handleApprove = useCallback(() => {
    setShowReviewModal(false)
    setDocsApproved(true)
    openTab("raise_claim")
  }, [openTab])

  const handleClaimRaised = useCallback(() => {
    const claimId = `CLM${Math.floor(100000 + Math.random() * 900000)}`
    // Close the raise_claim tab
    closeTab("raise_claim")
    // Post success + tell-customer messages to chat after brief delay
    setTimeout(() => {
      setAiTyping(true)
      setTimeout(() => {
        setAiTyping(false)
        setRightPanelOpen(false)
        setMessages((prev) => [
          ...prev,
          { id: "claim-success", role: "ai" as const, content: "claim_success" as const, claimId },
          { id: "claim-tell", role: "ai" as const, content: "claim_tell_customer" as const },
        ])
      }, typingMs)
    }, pauseMs)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [closeTab])

  // ── Quick drawer handlers ────────────────────────────────────────────────────

  const handleSendMessage = useCallback(() => {
    const val = composerValue.trim()
    if (!val) return
    setQuickDrawerOpen(false)
    setComposerValue("")
  }, [composerValue])

  const handleComposerChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value
    setComposerValue(val)
    if (val.trim().length > 0) {
      setQuickDrawerOpen(true)
      setQuickHighlight(0)
    } else {
      setQuickDrawerOpen(false)
    }
  }, [])

  const handleComposerKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (!quickDrawerOpen || drawerItems.length === 0) {
        if (e.key === "Enter") handleSendMessage()
        return
      }
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setQuickHighlight((i) => (i + 1) % drawerItems.length)
      } else if (e.key === "ArrowUp") {
        e.preventDefault()
        setQuickHighlight((i) => (i - 1 + drawerItems.length) % drawerItems.length)
      } else if (e.key === "Enter") {
        e.preventDefault()
        handleQuickSelect(drawerItems[quickHighlight])
      } else if (e.key === "Escape") {
        setQuickDrawerOpen(false)
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [quickDrawerOpen, drawerItems, quickHighlight, handleSendMessage],
  )

  const handleQuickSelect = useCallback(
    (item: QuickDrawerItem) => {
      setComposerValue("")
      setQuickDrawerOpen(false)

      if (item.id === "raise_claim") {
        const cxMsg: ChatMessage = {
          id: `cx-${Date.now()}`,
          role: "cx",
          content: "raise_claim_cmd",
          choiceLabel: "Raise a claim",
        }
        setMessages((prev) => [...prev, cxMsg])
        setTimeout(() => {
          setAiTyping(true)
          setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: `policy-picker-${Date.now()}`, role: "ai", content: "policy_picker" },
            ])
          }, typingMs)
        }, pauseMs)
      }
    },
    [pauseMs, typingMs],
  )

  const handlePolicyPick = useCallback(
    (policy: Policy) => {
      if (selectedPolicyId !== null) return
      setSelectedPolicyId(policy.id)
      const cxMsg: ChatMessage = {
        id: `cx-${Date.now()}`,
        role: "cx",
        content: "policy_selected",
        choiceLabel: policy.vehicle ?? policy.name,
        policyId: policy.id,
      }
      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: `claim-opts-${Date.now()}`, role: "ai", content: "policy_claim_options" },
          ])
        }, typingMs)
      }, pauseMs)
    },
    [selectedPolicyId, pauseMs, typingMs],
  )

  const handleDrawerPick = useCallback(
    (key: string, label: string) => {
      setDrawerChoiceMade(key)
      const cxMsg: ChatMessage = {
        id: `cx-${Date.now()}`,
        role: "cx",
        content: "cx_choice",
        choiceLabel: label,
      }
      if (key === "raise_on_behalf") {
        setMessages((prev) => [...prev, cxMsg])
        setTimeout(() => {
          setAiTyping(true)
          setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: `ncb-d-${Date.now()}`, role: "ai", content: "ncb_warning" },
              { id: `two-d-${Date.now()}`, role: "ai", content: "two_steps" },
            ])
            setTimeout(() => openTab("request_docs"), 400)
          }, typingMs)
        }, pauseMs)
        return
      }
      if (key === "guide_customer") {
        setMessages((prev) => [...prev, cxMsg])
        setTimeout(() => {
          setAiTyping(true)
          setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: `guide-d-${Date.now()}`, role: "ai", content: "guide_steps" },
            ])
          }, typingMs)
        }, pauseMs)
        return
      }
      setMessages((prev) => [...prev, cxMsg])
      setTimeout(() => {
        setAiTyping(true)
        setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: `else-d-${Date.now()}`, role: "ai", content: "something_else_ack" },
          ])
        }, typingMs)
      }, pauseMs)
    },
    [openTab, pauseMs, typingMs],
  )

  // ── Render chat message ─────────────────────────────────────────────────────

  const renderMessage = (msg: ChatMessage) => {
    if (msg.role === "cx") {
      return (
        <div key={msg.id} className="flex w-full justify-end">
          <HelloCxBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">{msg.choiceLabel}</p>
          </HelloCxBubbleCard>
        </div>
      )
    }

    if (msg.content === "intro") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              Customer is calling to{" "}
              <span className="font-semibold text-[#040222]">Raise a claim</span> for their{" "}
              <span className="font-semibold text-[#040222]">{vehicleLabel}</span>, check with the
              customer if they want to raise a claim on their own or agent should assist?
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
                { key: "guide_customer", label: "Guide customer to raise claim" },
                { key: "raise_on_behalf", label: "Raise it on customer's behalf" },
                { key: "something_else", label: "Customer called for something else" },
              ]}
              disabled={false}
              selectedKey={null}
              onPick={handlePick}
            />
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "ncb_warning") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex flex-col gap-3">
              <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                This policy has no NCB Protect – once the claim is settled, the customer's{" "}
                <span className="font-semibold text-[#040222]">25% NCB discount will reset to 0%.</span>
              </p>
              <div className="rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5">
                <p className="font-euclid text-[12px] font-semibold text-[#5b5675]">Tell the customer:</p>
                <p className="mt-1 font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
                  <span className="text-[#8b87a3]">&ldquo;</span>
                  Just so you know, you don't have NCB Protect on this policy. If this claim is settled,
                  you'll lose your No Claim Bonus. Would you still like to go ahead?
                  <span className="text-[#8b87a3]">&rdquo;</span>
                </p>
              </div>
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "two_steps") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex flex-col gap-2">
              <p className="font-euclid text-[14px] leading-5 text-[#36354c]">Raising a claim requires 2 steps:</p>
              <ol className="ml-4 flex flex-col gap-1 list-decimal">
                <li className="font-euclid text-[14px] leading-5 text-[#36354c]">
                  Request RC Copy &amp; License from the customer
                </li>
                <li className="font-euclid text-[14px] leading-5 text-[#36354c]">
                  Raise claim on their behalf
                </li>
              </ol>
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "guide_steps") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex flex-col gap-3">
              <p className="font-euclid text-[14px] font-medium leading-5 text-[#040222]">
                Guide the customer through these steps:
              </p>
              <ol className="ml-4 flex flex-col gap-2 list-decimal">
                {SELF_SERVE_STEPS.map((step) => (
                  <li key={step} className="font-euclid text-[13px] leading-[18px] text-[#36354c]">
                    {step}
                  </li>
                ))}
              </ol>
              <div className="rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5">
                <p className="font-euclid text-[12px] font-semibold text-[#5b5675]">Tell the customer:</p>
                <p className="mt-1 font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
                  <span className="text-[#8b87a3]">&ldquo;</span>
                  Please follow these steps on your ACKO app. Your claim handler will contact you within 1–2 working days once your claim is submitted.
                  <span className="text-[#8b87a3]">&rdquo;</span>
                </p>
              </div>
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "something_else_ack") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              Understood. Please continue assisting the customer with their actual concern.
            </p>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "claim_success") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex flex-col gap-2.5">
              <div className="flex items-center gap-2">
                <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#ecfdf5] ring-1 ring-[#d1fae5]">
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                </div>
                <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                  Claim successfully raised for{" "}
                  <span className="font-semibold text-[#040222]">{vehicleLabel}</span>.
                </p>
              </div>
              {msg.claimId && (
                <div className="rounded-lg border border-[#e7e7f0] bg-[#f8f7fc] px-3 py-2">
                  <p className="font-euclid text-[10px] font-medium uppercase tracking-wide text-[#9c9aaf]">Claim ID</p>
                  <p className="mt-0.5 font-euclid text-[13px] font-semibold text-[#040222]">{msg.claimId}</p>
                </div>
              )}
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "claim_tell_customer") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5">
              <p className="font-euclid text-[12px] font-semibold text-[#5b5675]">Tell the customer:</p>
              <p className="mt-1 font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
                <span className="text-[#8b87a3]">&ldquo;</span>
                Your claim has been successfully registered. A claim handler will call you within 2 hours to guide you through the next steps.
                <span className="text-[#8b87a3]">&rdquo;</span>
              </p>
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "raise_claim_cmd" || msg.content === "policy_selected") {
      return (
        <div key={msg.id} className="flex w-full justify-end">
          <HelloCxBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">{msg.choiceLabel}</p>
          </HelloCxBubbleCard>
        </div>
      )
    }

    if (msg.content === "policy_picker") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex flex-col gap-3">
              <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
                Which policy would you like to raise a claim for?
              </p>
              <div className="flex flex-col gap-2">
                {activePolicies.map((policy) => (
                  <button
                    key={policy.id}
                    type="button"
                    onClick={() => handlePolicyPick(policy)}
                    className={cn(
                      "flex flex-col gap-0.5 rounded-lg border px-3 py-2.5 text-left transition-colors",
                      selectedPolicyId === policy.id
                        ? "border-[#7c47e1] bg-[#f0ecfa]"
                        : selectedPolicyId !== null
                          ? "cursor-default border-[#e7e7f0] bg-[#fafafa] opacity-50"
                          : "border-[#e7e7f0] bg-white hover:border-[#b9a0f0] hover:bg-[#f9f7fe]",
                    )}
                  >
                    <p className="font-euclid text-[13px] font-semibold text-[#040222]">
                      {policy.vehicle ?? policy.name}
                    </p>
                    <p className="font-euclid text-[11px] text-[#8b87a3]">
                      {policy.policyNumber} · Expires {policy.expiryDate}
                    </p>
                  </button>
                ))}
              </div>
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content === "policy_claim_options") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity={false}>
            <WorkflowOfferPick
              options={[
                { key: "guide_customer", label: "Customer will do it themselves" },
                { key: "raise_on_behalf", label: "Raise it on customer's behalf" },
                { key: "something_else", label: "Customer called for something else" },
              ]}
              onPick={handleDrawerPick}
              selectedKey={drawerChoiceMade ?? undefined}
            />
          </HelloAiBubbleCard>
        </div>
      )
    }

    return null
  }

  // ── Layout ──────────────────────────────────────────────────────────────────

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
        <>{/* ── AI mode: chat scroll ── */}
        <div className="min-h-0 flex flex-1 flex-col items-start gap-3 overflow-y-auto overscroll-y-contain px-10 py-5">
          {showIntroTyping && <TypingIndicator labelId={introTypingLabelId} showIdentity />}
          {showBubble1 && renderMessage({ id: "intro", role: "ai", content: "intro" })}
          {showTypingBeforeOptions && <TypingIndicator labelId={optionsTypingLabelId} showIdentity={false} />}
          {showOptions && renderMessage({ id: "options", role: "ai", content: "options" })}
          {messages.map(renderMessage)}
          {aiTyping && <TypingIndicator labelId={replyTypingLabelId} showIdentity={false} />}
          <div ref={chatEndRef} />
        </div>

        {/* Input bar */}
        <div className="relative shrink-0 border-t border-[#e7e7f0] px-10 py-3">
          {/* Quick drawer — floats above the input */}
          {quickDrawerOpen && drawerItems.length > 0 && (
            <QuickCapabilityDrawer
              containerRef={quickDrawerRef}
              items={drawerItems}
              highlightIndex={quickHighlight}
              onHighlightChange={setQuickHighlight}
              onSelect={handleQuickSelect}
            />
          )}
          <div className="flex items-center gap-3 rounded-2xl border border-[#e7e7f0] bg-white px-4 py-3 shadow-sm">
            <input
              type="text"
              value={composerValue}
              onChange={handleComposerChange}
              onKeyDown={handleComposerKeyDown}
              onFocus={() => setQuickDrawerOpen(true)}
              placeholder="Ask anything here..."
              className="min-w-0 flex-1 font-euclid text-[14px] text-[#36354c] outline-none placeholder:text-[#8b87a3]"
            />
            <button type="button" onClick={handleSendMessage} className="flex size-8 shrink-0 items-center justify-center rounded-full bg-[#5c30c9]">
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


          {/* Workflow tabs — Chrome-style persistent tab bar */}
          {activeRailTab === "workflows" && (
            <>
              {/* Tab header row — always visible; border-b only when tabs are open */}
              <div className="flex shrink-0 items-center justify-between px-3 pt-3 pb-2">
                {/* Tabs — shown only when tabs exist */}
                {openTabs.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {openTabs.map((tab) => (
                      <div
                        key={tab}
                        className={cn(
                          "flex cursor-pointer items-center gap-2 rounded-lg border px-2 py-2 transition-colors",
                          activeTabId === tab
                            ? "border-[#e0e0e8] bg-[#f8f7fc]"
                            : "border-transparent bg-[#f8f7fc] hover:bg-[#f0f0f6]",
                        )}
                        onClick={() => setActiveTabId(tab)}
                      >
                        <span
                          className={cn(
                            "font-euclid text-sm font-medium whitespace-nowrap",
                            activeTabId === tab ? "text-[#5b5675]" : "text-[#36354c]",
                          )}
                        >
                          {RIGHT_TAB_LABELS[tab]}
                        </span>
                        {activeTabId === tab && (
                          <button
                            type="button"
                            onClick={(e) => { e.stopPropagation(); closeTab(tab) }}
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
                      <div className="absolute right-0 top-8 z-50 w-56 overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0px_4px_4px_-2px_rgba(54,53,76,0.06)]">
                        <div className="py-1.5">
                          {tabHistory.filter((t) => !openTabs.includes(t)).length > 0 ? (
                            tabHistory.filter((t) => !openTabs.includes(t)).map((tab) => (
                              <button
                                key={tab}
                                type="button"
                                onClick={() => { openTab(tab); setShowTabsDropdown(false) }}
                                className="flex w-full items-center px-4 py-2 text-left font-euclid text-sm text-[#040222] transition-colors hover:bg-[#f8f7fc]"
                              >
                                {RIGHT_TAB_LABELS[tab]}
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

              {/* Panel content — only active tab shown */}
              {activeTabId !== null && (
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {activeTabId === "request_docs" && (
                    <RequestDocsPanel
                      onAlreadyHaveDocs={handleAlreadyHaveDocs}
                      onDocsSent={handleDocsSent}
                      onReviewDocs={() => setShowReviewModal(true)}
                    />
                  )}
                  {activeTabId === "raise_claim" && (
                    <RaiseClaimAppMockup onClaimRaised={handleClaimRaised} />
                  )}
                </div>
              )}
              {activeTabId === "request_docs" && !docsApproved && (
                <div className="shrink-0 border-t border-[#e7e7f0] px-4 py-3 text-center">
                  <button type="button" onClick={handleAlreadyHaveDocs} className="font-euclid text-[13px] font-medium text-[#7c47e1] hover:underline">
                    Already have documents
                  </button>
                </div>
              )}

              {/* Empty state */}
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
                  <p className="font-euclid text-[13px] text-[#8b87a3]">No active tabs. Select an option from the chat to open a workflow.</p>
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
        hideExistingTickets
        hideSimilarCases
      />

      {/* Review documents modal */}
      {showReviewModal && (
        <ReviewDocsModal
          onClose={() => setShowReviewModal(false)}
          onApprove={handleApprove}
        />
      )}
    </div>
  )
}
