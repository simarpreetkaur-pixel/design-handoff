/**
 * UC6 — Capability Showcase
 *
 * Demonstrates all CRM capabilities through an AI-guided command palette.
 * The right panel uses the exact same chrome-tab + HelloRightPanelIconRail
 * structure as UC1 (Edit Policy) and UC2 (Raise a Claim).
 */
import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type MouseEvent as ReactMouseEvent,
} from "react"
import {
  AlertTriangle,
  BookOpen,
  Calendar,
  Car,
  CreditCard,
  Download,
  FileSearch,
  FileText,
  History,
  MapPin,
  MessageSquare,
  MoreVertical,
  Search,
  Send,
  Shield,
  ShieldCheck,
  Sparkles,
  User,
  X,
} from "lucide-react"

import { cn } from "@/lib/utils"
import type { Customer, EndorsementEditKind, InactivePolicy, Policy } from "@/types/crm"
import { CustomerProfileSidebar } from "@/components/crm/hello/CustomerProfileSidebar"
import {
  HelloAiBubbleCard,
  HelloCxBubbleCard,
  TypingIndicator,
} from "@/components/crm/hello/HelloChatPrimitives"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import {
  HelloRightPanelIconRail,
  HelloPowerToolsPanel,
  type HelloRightRailTab,
} from "@/components/crm/hello/HelloRightPanelRail"
// UC2 right-panel components (same as Raise a Claim)
import {
  RequestDocsPanel,
  RaiseClaimAppMockup,
  ReviewDocsModal,
} from "@/components/crm/hello/RaiseClaimFigmaHelloView"
// UC1 right-panel component (same as Edit Policy)
import { SendAckoAlertPanel } from "@/components/crm/hello/EditPolicyFigmaHelloView"
// Standalone panels for other capabilities
import { CommunicationHistoryPanel } from "@/components/crm/hello/CommunicationHistoryPanel"
import { PaymentHistoryPanel } from "@/components/crm/hello/PaymentHistoryPanel"
import { RequestDocumentsManualPanel } from "@/components/crm/hello/RequestDocumentsManualPanel"
import { SendCommunicationManualPanel } from "@/components/crm/hello/SendCommunicationManualPanel"
import { NearbyGaragesPanel } from "@/components/crm/hello/NearbyGaragesPanel"
import { KycVerificationLogs } from "@/components/crm/hello/KycVerificationLogs"
import { SimilarCasesPanel } from "@/components/crm/hello/SimilarCasesPanel"
import { ClaimStatusDirectPanel } from "@/components/crm/hello/ClaimStatusDirectPanel"
import { EscalateIssuePanel } from "@/components/crm/hello/EscalateIssuePanel"
import { ExistingTicketsPanel } from "@/components/crm/hello/ExistingTicketsPanel"
import { Button } from "@/components/ui/button"

// ─── Capability definitions ────────────────────────────────────────────────────

type CapabilityId =
  | "view_policy"
  | "raise_claim"
  | "edit_policy"
  | "claim_status"
  | "comm_history"
  | "payment_history"
  | "request_docs"
  | "send_comm"
  | "nearby_garages"
  | "kyc_logs"
  | "similar_cases"
  | "escalate"

interface Capability {
  id: CapabilityId
  label: string
  description: string
  keywords: string[]
  requiresPolicy?: boolean
  requiresEditKind?: boolean
  /** Show "guide customer vs. do it on behalf" before opening the panel */
  requiresModeSelection?: boolean
  icon: React.ReactNode
}

const CAPABILITIES: Capability[] = [
  {
    id: "raise_claim",
    label: "Raise a Claim",
    description: "File an insurance claim on behalf of the customer",
    keywords: ["raise", "claim", "file", "accident", "damage", "fnol", "incident"],
    requiresPolicy: true,
    requiresModeSelection: true,
    icon: <Shield className="size-4" />,
  },
  {
    id: "edit_policy",
    label: "Edit Policy",
    description: "Update policy holder details or vehicle information",
    keywords: ["edit", "policy", "update", "change", "modify", "endorsement", "add", "name", "bank", "nominee"],
    requiresPolicy: true,
    requiresEditKind: true,
    icon: <FileText className="size-4" />,
  },
  {
    id: "claim_status",
    label: "Claim Status",
    description: "Check the current status of an active claim",
    keywords: ["status", "claim", "track", "update", "where", "progress", "approved", "pending"],
    requiresPolicy: true,
    icon: <ShieldCheck className="size-4" />,
  },
  {
    id: "comm_history",
    label: "Communication History",
    description: "View all past calls, emails, and WhatsApp messages",
    keywords: ["communication", "history", "calls", "emails", "chat", "previous", "past", "whatsapp", "messages"],
    icon: <History className="size-4" />,
  },
  {
    id: "payment_history",
    label: "Payment History",
    description: "View all payments, transactions, and receipts",
    keywords: ["payment", "history", "transaction", "paid", "premium", "receipt", "amount", "refund"],
    icon: <CreditCard className="size-4" />,
  },
  {
    id: "request_docs",
    label: "Request Documents",
    description: "Request RC copy, license or other documents from customer",
    keywords: ["request", "documents", "docs", "upload", "rc", "license", "papers"],
    icon: <FileSearch className="size-4" />,
  },
  {
    id: "send_comm",
    label: "Send Communication",
    description: "Send a message via WhatsApp, email or SMS",
    keywords: ["send", "communication", "message", "notify", "whatsapp", "email", "sms", "alert"],
    requiresPolicy: true,
    icon: <MessageSquare className="size-4" />,
  },
  {
    id: "nearby_garages",
    label: "Nearby Garages",
    description: "Find network garages near the customer's location",
    keywords: ["garage", "nearby", "workshop", "repair", "network", "service"],
    icon: <MapPin className="size-4" />,
  },
  {
    id: "kyc_logs",
    label: "KYC Verification Logs",
    description: "View KYC status and verification history",
    keywords: ["kyc", "verification", "logs", "identity"],
    icon: <BookOpen className="size-4" />,
  },
  {
    id: "similar_cases",
    label: "Similar Cases",
    description: "Find similar resolved cases for reference",
    keywords: ["similar", "cases", "related", "compare", "reference"],
    icon: <Search className="size-4" />,
  },
  {
    id: "escalate",
    label: "Escalate Issue",
    description: "Escalate the issue to a higher support group or team",
    keywords: ["escalate", "escalation", "raise", "issue", "supervisor", "manager", "team", "group", "child ticket"],
    requiresPolicy: false,
    icon: <AlertTriangle className="size-4" />,
  },
]

const EDIT_KIND_OPTIONS: { key: EndorsementEditKind; label: string }[] = [
  { key: "policy_holder_name", label: "Policy holder name" },
  { key: "policy_holder_email", label: "Policy holder email" },
  { key: "phone_number", label: "Phone number" },
  { key: "engine_number", label: "Engine number" },
  { key: "chassis_number", label: "Chassis number" },
]

// ─── Right panel tab system (mirrors UC1/UC2 exactly) ─────────────────────────

type ShowcaseTabId =
  | "request_docs"     // Raise a Claim step 1 (same as UC2)
  | "raise_claim"      // Raise a Claim step 2 (same as UC2)
  | "send_acko_alert"  // Edit Policy (same as UC1)
  | "claim_status"
  | "comm_history"
  | "payment_history"
  | "req_documents"
  | "send_comm"
  | "nearby_garages"
  | "kyc_logs"
  | "similar_cases"
  | "escalate"

const TAB_LABELS: Record<ShowcaseTabId, string> = {
  request_docs: "Request documents",
  raise_claim: "Do it for customer · Raise a claim",
  send_acko_alert: "Send Acko Alert",
  claim_status: "Claim Status",
  comm_history: "Communication History",
  payment_history: "Payment History",
  req_documents: "Request Documents",
  send_comm: "Send Communication",
  escalate: "Escalate Issue",
  nearby_garages: "Nearby Garages",
  kyc_logs: "KYC Logs",
  similar_cases: "Similar Cases",
}

/** Tab(s) to open for each capability — matches the UC1/UC2 tab-open behavior. */
function initialTabsForCapability(id: CapabilityId): ShowcaseTabId[] {
  switch (id) {
    case "view_policy":  return ["comm_history"]  // closest panel in AI mode; manual mode has its own view
    case "raise_claim":  return ["request_docs"]
    case "edit_policy":  return ["send_acko_alert"]
    case "claim_status": return ["claim_status"]
    case "comm_history": return ["comm_history"]
    case "payment_history": return ["payment_history"]
    case "request_docs": return ["req_documents"]
    case "send_comm":    return ["send_comm"]
    case "nearby_garages": return ["nearby_garages"]
    case "kyc_logs":     return ["kyc_logs"]
    case "similar_cases": return ["similar_cases"]
    case "escalate":     return ["escalate"]
  }
}

// ─── Chat message types ────────────────────────────────────────────────────────

type EditMode = "self_serve" | "do_for_customer"
type ClaimMode = "guide_customer" | "do_on_behalf"

type MsgContent =
  | { kind: "text"; text: string }
  | { kind: "capability_options"; options: Capability[] }
  | { kind: "policy_options"; policies: Policy[]; capabilityId: CapabilityId }
  | { kind: "edit_kind_options"; policy: Policy }
  | { kind: "edit_mode_options"; policy: Policy; editKind: EndorsementEditKind }
  | { kind: "claim_mode_options"; policy: Policy }

interface ChatMsg {
  id: string
  role: "ai" | "cx"
  content: MsgContent
}

// ─── Workflow data ─────────────────────────────────────────────────────────────

interface WorkflowData {
  capabilityId: CapabilityId | null
  policy: Policy | null
  editKind: EndorsementEditKind | null
}

// ─── Manual mode action grid ───────────────────────────────────────────────────

interface ManualAction {
  label: string
  capabilityId: CapabilityId | null
  requiresPolicy?: boolean
}

const MANUAL_MODE_SECTIONS: { title: string; actions: ManualAction[] }[] = [
  {
    title: "Policy Related Actions",
    actions: [
      { label: "View policy",              capabilityId: "view_policy",     requiresPolicy: true  },
      { label: "Raise a claim",            capabilityId: "raise_claim",     requiresPolicy: true  },
      { label: "Edit policy",              capabilityId: "edit_policy",     requiresPolicy: true  },
      { label: "Cancel policy",            capabilityId: null,              requiresPolicy: true  },
      { label: "Claim handler call back",  capabilityId: null,              requiresPolicy: false },
      { label: "Send communication",       capabilityId: "send_comm",       requiresPolicy: true  },
      { label: "Road side assistance",     capabilityId: "nearby_garages",  requiresPolicy: false },
    ],
  },
  {
    title: "Other Quick Actions",
    actions: [
      { label: "Re-assign ticket",   capabilityId: "escalate",       requiresPolicy: false },
      { label: "Transfer call",      capabilityId: null,             requiresPolicy: false },
      { label: "Request documents",  capabilityId: "request_docs",   requiresPolicy: false },
    ],
  },
  {
    title: "Data Investigation",
    actions: [
      { label: "Communication history",  capabilityId: "comm_history",     requiresPolicy: false },
      { label: "Payment history",        capabilityId: "payment_history",  requiresPolicy: false },
      { label: "KYC logs",               capabilityId: "kyc_logs",         requiresPolicy: false },
    ],
  },
]


// ─── View Policy Document panel ───────────────────────────────────────────────

function ViewPolicyDocPanel({ policy }: { policy: Policy }) {
  const [downloading, setDownloading] = useState(false)
  const [downloaded, setDownloaded] = useState(false)

  const handleDownload = () => {
    setDownloading(true)
    setTimeout(() => { setDownloading(false); setDownloaded(true) }, 1800)
  }

  const rows: { label: string; value: string }[] = [
    { label: "Policy number",   value: policy.policyNumber },
    { label: "Policy type",     value: policy.type },
    { label: "Policy holder",   value: policy.policyHolder ?? "—" },
    { label: "Vehicle",         value: policy.vehicle ?? "—" },
    { label: "Expiry date",     value: policy.expiryDate },
    ...(policy.totalCoverage  ? [{ label: "Total coverage", value: policy.totalCoverage  }] : []),
    ...(policy.tenureLabel    ? [{ label: "Tenure",         value: policy.tenureLabel    }] : []),
    ...(policy.planDisplayName ? [{ label: "Plan",          value: policy.planDisplayName }] : []),
  ]

  return (
    <div className="flex flex-col gap-5 px-8 py-6 font-euclid">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[11px] font-medium uppercase tracking-widest text-[#9c9aaf]">Policy document</p>
          <h2 className="mt-0.5 text-[20px] font-semibold text-[#040222]">
            {policy.vehicle ?? policy.name}
          </h2>
          <p className="text-[13px] text-[#5b5675]">{policy.policyNumber}</p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading || downloaded}
          className={cn(
            "flex items-center gap-2 rounded-lg px-4 py-2.5 text-[13px] font-medium transition-colors",
            downloaded
              ? "border border-[#0fa457] bg-[#edfaf4] text-[#0fa457]"
              : "border border-[#7c47e1] bg-[#f5f3fc] text-[#7c47e1] hover:bg-[#ede9fb]",
          )}
        >
          <Download className={cn("size-4", downloading && "animate-bounce")} />
          {downloaded ? "Downloaded" : downloading ? "Downloading…" : "Download PDF"}
        </button>
      </div>

      {/* Policy details card */}
      <div className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-white">
        {/* Mock PDF header stripe */}
        <div className="flex items-center gap-3 border-b border-[#e7e7f0] bg-[#f8f7fc] px-5 py-3.5">
          <FileText className="size-5 text-[#7c47e1]" />
          <span className="text-[13px] font-semibold text-[#040222]">Policy Certificate</span>
          <span className="ml-auto rounded bg-[#edfaf4] px-2 py-0.5 text-[11px] font-medium text-[#0fa457]">Active</span>
        </div>
        <div className="divide-y divide-[#f0f0f6]">
          {rows.map(({ label, value }) => (
            <div key={label} className="flex items-center justify-between px-5 py-3">
              <span className="text-[13px] text-[#9c9aaf]">{label}</span>
              <span className="text-[13px] font-medium text-[#040222]">{value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Coverage highlights */}
      <div className="rounded-xl border border-[#e7e7f0] bg-white">
        <div className="border-b border-[#f0f0f6] px-5 py-3">
          <p className="text-[12px] font-semibold uppercase tracking-wide text-[#9c9aaf]">Coverage highlights</p>
        </div>
        <div className="grid grid-cols-3 gap-px bg-[#f0f0f6]">
          {[
            { Icon: Car,      label: "Own damage",       value: "₹8.5L" },
            { Icon: Shield,   label: "Third party",      value: "Unlimited" },
            { Icon: User,     label: "Personal accident", value: "₹15L" },
            { Icon: Calendar, label: "Zero depreciation", value: "Included" },
            { Icon: Shield,   label: "Roadside assist",  value: "Included" },
            { Icon: CreditCard, label: "NCB protect",    value: "50%" },
          ].map(({ Icon, label, value }) => (
            <div key={label} className="flex flex-col gap-1 bg-white px-4 py-3.5">
              <Icon className="size-4 text-[#7c47e1]" />
              <p className="text-[11px] text-[#9c9aaf]">{label}</p>
              <p className="text-[13px] font-semibold text-[#040222]">{value}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Helpers ───────────────────────────────────────────────────────────────────

function matchCapabilities(query: string): Capability[] {
  const q = query.toLowerCase().trim()
  if (!q) return CAPABILITIES
  return CAPABILITIES.filter(
    (cap) =>
      cap.keywords.some((kw) => q.includes(kw) || kw.includes(q)) ||
      cap.label.toLowerCase().includes(q) ||
      cap.description.toLowerCase().includes(q),
  )
}

let _msgId = 0
function nextId() {
  return `msg-${++_msgId}`
}

const TYPING_MS = 900
const BOT_REPLY_MS = 1200

/** Documents required per edit field — shown to the agent before opening the panel. */
const EDIT_KIND_DOCS: Partial<Record<EndorsementEditKind, string>> = {
  policy_holder_name: "Aadhar card, PAN card, or Passport (any valid govt. photo ID)",
  engine_number: "Vehicle Registration Certificate (RC)",
  chassis_number: "Vehicle Registration Certificate (RC) and chassis plate photo",
}

const EDIT_KIND_LABELS: Partial<Record<EndorsementEditKind, string>> = {
  policy_holder_name: "Policy holder name",
  policy_holder_email: "Policy holder email",
  phone_number: "Phone number",
  engine_number: "Engine number",
  chassis_number: "Chassis number",
}

// ─── Component ────────────────────────────────────────────────────────────────

export interface CapabilityShowcaseHelloViewProps {
  customer: Customer
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  className?: string
}

export function CapabilityShowcaseHelloView({
  customer,
  activePolicies,
  inactivePolicies,
  className,
}: CapabilityShowcaseHelloViewProps) {
  // ── Chat state ──────────────────────────────────────────────────────────────
  const [messages, setMessages] = useState<ChatMsg[]>([])
  const [composerValue, setComposerValue] = useState("")
  const [aiTyping, setAiTyping] = useState(false)
  const [greetingShown, setGreetingShown] = useState(false)
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [drawerHighlight, setDrawerHighlight] = useState(0)
  const [lockedMsgIds, setLockedMsgIds] = useState<Set<string>>(new Set())

  // ── Right panel state (mirrors UC1/UC2) ─────────────────────────────────────
  const [rightPanelOpen, setRightPanelOpen] = useState(false)
  const [openTabs, setOpenTabs] = useState<ShowcaseTabId[]>([])
  const [activeTabId, setActiveTabId] = useState<ShowcaseTabId | null>(null)
  const [tabHistory, setTabHistory] = useState<ShowcaseTabId[]>([])
  const [showTabsDropdown, setShowTabsDropdown] = useState(false)
  const [activeRailTab, setActiveRailTab] = useState<HelloRightRailTab>("workflows")

  // ── Workflow data (policy/editKind for right panel rendering) ───────────────
  const [workflowData, setWorkflowData] = useState<WorkflowData>({
    capabilityId: null,
    policy: null,
    editKind: null,
  })
  const [docsApproved, setDocsApproved] = useState(false)
  /** Tab to open automatically once the doc-request is sent (used by edit-policy on-behalf flow) */
  const [pendingTabAfterDocs, setPendingTabAfterDocs] = useState<ShowcaseTabId | null>(null)
  const [isManualMode, setIsManualMode] = useState(false)
  /** Manual mode step machine */
  const [manualStep, setManualStep] = useState<"grid" | "policy_select" | "workflow">("grid")
  const [manualSelectedAction, setManualSelectedAction] = useState<ManualAction | null>(null)
  const [manualSelectedPolicy, setManualSelectedPolicy] = useState<Policy | null>(null)
  const [showReviewModal, setShowReviewModal] = useState(false)

  // ── Right panel resize ────────────────────────────────────────────────────────
  const [rightPanelWidth, setRightPanelWidth] = useState(420)
  const resizingRef = useRef(false)
  const resizeStartXRef = useRef(0)
  const resizeStartWidthRef = useRef(420)

  const handleResizeMouseDown = useCallback((e: ReactMouseEvent) => {
    e.preventDefault()
    resizingRef.current = true
    resizeStartXRef.current = e.clientX
    resizeStartWidthRef.current = rightPanelWidth

    const onMove = (ev: MouseEvent) => {
      if (!resizingRef.current) return
      const delta = resizeStartXRef.current - ev.clientX
      const newWidth = Math.min(680, Math.max(320, resizeStartWidthRef.current + delta))
      setRightPanelWidth(newWidth)
    }
    const onUp = () => {
      resizingRef.current = false
      document.removeEventListener("mousemove", onMove)
      document.removeEventListener("mouseup", onUp)
    }
    document.addEventListener("mousemove", onMove)
    document.addEventListener("mouseup", onUp)
  }, [rightPanelWidth])

  const chatEndRef = useRef<HTMLDivElement>(null)
  const composerRef = useRef<HTMLInputElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  const typingLabelId = useId()

  const filteredCapabilities = composerValue.trim()
    ? matchCapabilities(composerValue)
    : CAPABILITIES

  // ── Auto-scroll ─────────────────────────────────────────────────────────────
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [messages, aiTyping])

  // ── Greeting on mount ───────────────────────────────────────────────────────
  useEffect(() => {
    const t = window.setTimeout(() => {
      setAiTyping(true)
      const t2 = window.setTimeout(() => {
        setAiTyping(false)
        setGreetingShown(true)
        setMessages([
          {
            id: nextId(),
            role: "ai",
            content: {
              kind: "text",
              text: `Hi! I'm your AI assistant for ${customer.name}'s session. Type what the customer needs help with — I'll suggest the right action and open it for you.`,
            },
          },
        ])
      }, TYPING_MS)
      return () => window.clearTimeout(t2)
    }, 600)
    return () => window.clearTimeout(t)
  }, [customer.name])

  // ── Close drawer on outside click ──────────────────────────────────────────
  useEffect(() => {
    if (!drawerOpen) return
    const handler = (e: MouseEvent) => {
      if (
        drawerRef.current && !drawerRef.current.contains(e.target as Node) &&
        composerRef.current && !composerRef.current.contains(e.target as Node)
      ) setDrawerOpen(false)
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [drawerOpen])

  // ── Tab management (same API as UC1/UC2) ────────────────────────────────────
  const openTab = useCallback((tab: ShowcaseTabId) => {
    setOpenTabs((prev) => (prev.includes(tab) ? prev : [...prev, tab]))
    setActiveTabId(tab)
    setTabHistory((prev) => (prev.includes(tab) ? prev : [...prev, tab]))
    setRightPanelOpen(true)
    setActiveRailTab("workflows")
  }, [])

  const closeTab = useCallback(
    (tab: ShowcaseTabId) => {
      setOpenTabs((prev) => {
        const next = prev.filter((t) => t !== tab)
        if (activeTabId === tab) {
          setActiveTabId(next.length > 0 ? next[next.length - 1] : null)
        }
        if (next.length === 0) setRightPanelOpen(false)
        return next
      })
    },
    [activeTabId],
  )

  const handleRailTabChange = useCallback((tab: HelloRightRailTab) => {
    if (tab === "manual-mode") {
      // Toggle manual mode flyout; stay on current rail tab
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
    if (tab === "similar-cases" || tab === "existing-tickets") {
      if (activeRailTab === tab) {
        setActiveRailTab("workflows")
      } else {
        setActiveRailTab(tab)
      }
      return
    }
    // workflows / all-tabs — toggle panel
    if (activeRailTab === "workflows" && rightPanelOpen) {
      setRightPanelOpen(false)
    } else {
      setActiveRailTab("workflows")
      setRightPanelOpen(true)
    }
  }, [activeRailTab, rightPanelOpen])

  // ── Manual mode step machine handlers ───────────────────────────────────────

  const resetManualMode = useCallback(() => {
    setManualStep("grid")
    setManualSelectedAction(null)
    setManualSelectedPolicy(null)
  }, [])

  /** Called when agent clicks a tile in the manual-mode action grid. */
  const handleManualActionClick = useCallback((action: ManualAction) => {
    if (!action.capabilityId) return  // placeholder / not yet implemented
    setManualSelectedAction(action)
    if (action.requiresPolicy && activePolicies.length > 1) {
      setManualStep("policy_select")
    } else {
      const policy = action.requiresPolicy ? (activePolicies[0] ?? null) : null
      setManualSelectedPolicy(policy)
      setWorkflowData({ capabilityId: action.capabilityId, policy, editKind: null })
      setManualStep("workflow")
    }
  }, [activePolicies])

  /** Called when agent picks a policy in the manual-mode policy selection step. */
  const handleManualPolicySelected = useCallback((policy: Policy) => {
    if (!manualSelectedAction?.capabilityId) return
    setManualSelectedPolicy(policy)
    setWorkflowData({ capabilityId: manualSelectedAction.capabilityId, policy, editKind: null })
    setManualStep("workflow")
  }, [manualSelectedAction])

  // ── Helpers ─────────────────────────────────────────────────────────────────

  const addMsg = useCallback((msg: Omit<ChatMsg, "id">) => {
    setMessages((prev) => [...prev, { ...msg, id: nextId() }])
  }, [])

  const lockMsg = useCallback((id: string) => {
    setLockedMsgIds((prev) => new Set([...prev, id]))
  }, [])

  const addAiMsg = useCallback(
    (content: MsgContent) => {
      setAiTyping(true)
      const t = window.setTimeout(() => {
        setAiTyping(false)
        addMsg({ role: "ai", content })
      }, BOT_REPLY_MS)
      return () => window.clearTimeout(t)
    },
    [addMsg],
  )

  // ── Capability selected ─────────────────────────────────────────────────────
  const handleCapabilitySelected = useCallback(
    (cap: Capability, sourceMsgId?: string) => {
      if (sourceMsgId) lockMsg(sourceMsgId)
      addMsg({ role: "cx", content: { kind: "text", text: cap.label } })

      if (cap.requiresPolicy && activePolicies.length > 0) {
        const msgId = nextId()
        window.setTimeout(() => {
          setAiTyping(true)
          window.setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              {
                id: msgId,
                role: "ai",
                content: { kind: "policy_options", policies: activePolicies, capabilityId: cap.id },
              },
            ])
          }, BOT_REPLY_MS)
        }, 0)
      } else {
        // Open right panel immediately
        setWorkflowData({ capabilityId: cap.id, policy: null, editKind: null })
        addAiMsg({ kind: "text", text: `Opening **${cap.label}**…` })
        window.setTimeout(() => {
          const tabs = initialTabsForCapability(cap.id)
          tabs.forEach((tab) => openTab(tab))
        }, BOT_REPLY_MS + 200)
      }
    },
    [activePolicies, addMsg, addAiMsg, lockMsg, openTab],
  )

  // ── Policy selected ─────────────────────────────────────────────────────────
  const handlePolicySelected = useCallback(
    (policy: Policy, capabilityId: CapabilityId, sourceMsgId?: string) => {
      if (sourceMsgId) lockMsg(sourceMsgId)
      addMsg({
        role: "cx",
        content: { kind: "text", text: `${policy.vehicle ?? policy.type} · ${policy.policyNumber}` },
      })

      const cap = CAPABILITIES.find((c) => c.id === capabilityId)
      if (!cap) return

      if (cap.requiresEditKind) {
        const msgId = nextId()
        window.setTimeout(() => {
          setAiTyping(true)
          window.setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              { id: msgId, role: "ai", content: { kind: "edit_kind_options", policy } },
            ])
          }, BOT_REPLY_MS)
        }, 0)
      } else if (cap.requiresModeSelection) {
        // Ask guide vs. on behalf before opening any panel
        const msgId = nextId()
        window.setTimeout(() => {
          setAiTyping(true)
          window.setTimeout(() => {
            setAiTyping(false)
            setMessages((prev) => [
              ...prev,
              {
                id: nextId(),
                role: "ai",
                content: {
                  kind: "text",
                  text: `Got it — **${cap.label}** for ${policy.vehicle ?? policy.type}. How would you like to proceed?`,
                },
              },
              { id: msgId, role: "ai", content: { kind: "claim_mode_options", policy } },
            ])
          }, BOT_REPLY_MS)
        }, 0)
      } else {
        setWorkflowData({ capabilityId, policy, editKind: null })
        addAiMsg({ kind: "text", text: `Opening **${cap.label}** for ${policy.vehicle ?? policy.type}…` })
        window.setTimeout(() => {
          const tabs = initialTabsForCapability(capabilityId)
          tabs.forEach((tab) => openTab(tab))
        }, BOT_REPLY_MS + 200)
      }
    },
    [addMsg, addAiMsg, lockMsg, openTab],
  )

  // ── Edit kind selected → show mode options (guide vs. do it for customer) ───
  const handleEditKindSelected = useCallback(
    (editKind: EndorsementEditKind, policy: Policy, sourceMsgId?: string) => {
      if (sourceMsgId) lockMsg(sourceMsgId)
      const kindLabel = EDIT_KIND_LABELS[editKind] ?? (EDIT_KIND_OPTIONS.find((o) => o.key === editKind)?.label ?? editKind)
      addMsg({ role: "cx", content: { kind: "text", text: kindLabel } })

      const docs = EDIT_KIND_DOCS[editKind]
      const docsNote = docs ? ` Customer will need: **${docs}**.` : ""
      const modePrompt = `Got it — editing **${kindLabel}** for ${policy.vehicle ?? policy.type}.${docsNote} How would you like to proceed?`

      const msgId = nextId()
      window.setTimeout(() => {
        setAiTyping(true)
        window.setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            {
              id: msgId,
              role: "ai",
              content: { kind: "text", text: modePrompt },
            },
          ])
          const modeMsgId = nextId()
          window.setTimeout(() => {
            setMessages((prev) => [
              ...prev,
              { id: modeMsgId, role: "ai", content: { kind: "edit_mode_options", policy, editKind } },
            ])
          }, 200)
        }, BOT_REPLY_MS)
      }, 0)
    },
    [addMsg, lockMsg],
  )

  // ── Edit mode selected (guide vs. do it for customer) ────────────────────────
  const handleEditModeSelected = useCallback(
    (mode: EditMode, policy: Policy, editKind: EndorsementEditKind, sourceMsgId?: string) => {
      if (sourceMsgId) lockMsg(sourceMsgId)
      const modeLabel = mode === "self_serve" ? "Guide the customer (self-serve)" : "Do it on customer's behalf"
      addMsg({ role: "cx", content: { kind: "text", text: modeLabel } })
      setWorkflowData({ capabilityId: "edit_policy", policy, editKind })

      if (mode === "self_serve") {
        addAiMsg({
          kind: "text",
          text: `Sharing the Acko self-serve alert with the customer for **${EDIT_KIND_LABELS[editKind] ?? editKind}**…`,
        })
        window.setTimeout(() => openTab("send_acko_alert"), BOT_REPLY_MS + 200)
      } else {
        // On-behalf: request RC copy first, then open the advisor panel
        const docsText = EDIT_KIND_DOCS[editKind]
          ? `To update **${EDIT_KIND_LABELS[editKind] ?? editKind}** on the customer's behalf, we need the customer's **${EDIT_KIND_DOCS[editKind]}** first. Requesting documents now.`
          : `To update **${EDIT_KIND_LABELS[editKind] ?? editKind}** on the customer's behalf, we need to request the required documents from the customer first.`
        addAiMsg({ kind: "text", text: docsText })
        setPendingTabAfterDocs("send_acko_alert")
        window.setTimeout(() => openTab("req_documents"), BOT_REPLY_MS + 200)
      }
    },
    [addMsg, addAiMsg, lockMsg, openTab],
  )

  // ── Claim mode selected (guide vs. do it on behalf) ─────────────────────────
  const handleClaimModeSelected = useCallback(
    (mode: ClaimMode, policy: Policy, sourceMsgId?: string) => {
      if (sourceMsgId) lockMsg(sourceMsgId)
      const modeLabel = mode === "guide_customer" ? "Guide the customer (self-serve)" : "Do it on customer's behalf"
      addMsg({ role: "cx", content: { kind: "text", text: modeLabel } })
      setWorkflowData({ capabilityId: "raise_claim", policy, editKind: null })

      if (mode === "guide_customer") {
        addAiMsg({
          kind: "text",
          text: `Guide the customer through these steps:\n1. Open the ACKO app and go to "My Policies".\n2. Select the **${policy.vehicle ?? policy.type}** policy.\n3. Tap "File a Claim" and follow the steps on screen.\n4. Upload the RC Copy and Driving License when prompted.\n5. Their claim handler will call within 1–2 working days.`,
        })
        window.setTimeout(() => openTab("send_acko_alert"), BOT_REPLY_MS + 200)
      } else {
        addAiMsg({
          kind: "text",
          text: `Raising a claim requires 2 steps:\n1. Request RC Copy & License from the customer\n2. Raise claim on their behalf`,
        })
        window.setTimeout(() => openTab("request_docs"), BOT_REPLY_MS + 200)
      }
    },
    [addMsg, addAiMsg, lockMsg, openTab],
  )

  // ── Claim raised (close panel + success message) ─────────────────────────────
  const handleClaimRaised = useCallback(() => {
    const policyLabel = workflowData.policy?.vehicle ?? workflowData.policy?.type ?? "the policy"
    setOpenTabs([])
    setActiveTabId(null)
    setRightPanelOpen(false)
    window.setTimeout(() => {
      addAiMsg({
        kind: "text",
        text: `✅ Claim raised successfully for **${policyLabel}**. Please inform the customer that a **claim handler will call within 2 hours** on their registered mobile number.`,
      })
    }, 300)
  }, [workflowData.policy, addAiMsg])

  // ── Composer change ─────────────────────────────────────────────────────────
  const handleComposerChange = (val: string) => {
    setComposerValue(val)
    setDrawerOpen(val.trim().length > 0)
    setDrawerHighlight(0)
  }

  // ── Keyboard nav ────────────────────────────────────────────────────────────
  const handleComposerKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (drawerOpen && filteredCapabilities.length > 0) {
      if (e.key === "ArrowDown") { e.preventDefault(); setDrawerHighlight((h) => Math.min(h + 1, filteredCapabilities.length - 1)); return }
      if (e.key === "ArrowUp") { e.preventDefault(); setDrawerHighlight((h) => Math.max(h - 1, 0)); return }
      if (e.key === "Enter" && !e.shiftKey) {
        e.preventDefault()
        const cap = filteredCapabilities[drawerHighlight]
        if (cap) { setDrawerOpen(false); setComposerValue(""); handleCapabilitySelected(cap) }
        return
      }
      if (e.key === "Escape") { setDrawerOpen(false); return }
    }
    if (e.key === "Enter" && !e.shiftKey && !drawerOpen) { e.preventDefault(); handleSendFreeText() }
  }

  // ── Send free text ──────────────────────────────────────────────────────────
  const handleSendFreeText = () => {
    const text = composerValue.trim()
    if (!text) return
    setComposerValue("")
    setDrawerOpen(false)
    addMsg({ role: "cx", content: { kind: "text", text } })

    const matched = matchCapabilities(text)
    if (matched.length === 1) {
      const cap = matched[0]
      addAiMsg({ kind: "text", text: `Got it! I'll help with **${cap.label}**.` })
      window.setTimeout(() => handleCapabilitySelected(cap), BOT_REPLY_MS + 200)
    } else if (matched.length > 1) {
      window.setTimeout(() => {
        setAiTyping(true)
        window.setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: nextId(), role: "ai", content: { kind: "capability_options", options: matched } },
          ])
        }, BOT_REPLY_MS)
      }, 0)
    } else {
      window.setTimeout(() => {
        setAiTyping(true)
        window.setTimeout(() => {
          setAiTyping(false)
          setMessages((prev) => [
            ...prev,
            { id: nextId(), role: "ai", content: { kind: "text", text: "I'm not sure what you're looking for. Could you give me more detail, or pick from the actions below?" } },
            { id: nextId(), role: "ai", content: { kind: "capability_options", options: CAPABILITIES } },
          ])
        }, BOT_REPLY_MS)
      }, 0)
    }
  }

  // ── Review docs flow (mirrors UC2) ──────────────────────────────────────────
  const handleDocsSent = useCallback(() => {
    // Status is tracked within RequestDocsPanel; we listen for "Review documents" click
  }, [])

  const handleAlreadyHaveDocs = useCallback(() => {
    setDocsApproved(true)
    openTab("raise_claim")
  }, [openTab])

  const handleApproveDocuments = useCallback(() => {
    setShowReviewModal(false)
    setDocsApproved(true)
    openTab("raise_claim")
  }, [openTab])

  // ── Render chat message ─────────────────────────────────────────────────────
  const renderMsg = (msg: ChatMsg) => {
    const isLocked = lockedMsgIds.has(msg.id)

    if (msg.role === "cx") {
      return (
        <div key={msg.id} className="flex w-full justify-end">
          <HelloCxBubbleCard showIdentity>
            <p className="font-euclid text-[14px] leading-5 text-[#36354c]">
              {msg.content.kind === "text" ? msg.content.text : ""}
            </p>
          </HelloCxBubbleCard>
        </div>
      )
    }

    if (msg.content.kind === "text") {
      const renderLine = (line: string, key: number) => {
        const parts = line.split(/\*\*([^*]+)\*\*/)
        const rendered = parts.map((part, i) =>
          i % 2 === 0 ? part : <strong key={i} className="font-semibold text-[#040222]">{part}</strong>,
        )
        // Numbered list item (e.g. "1. Request RC...")
        const numberedMatch = line.match(/^(\d+)\.\s(.*)/)
        if (numberedMatch) {
          const restParts = numberedMatch[2].split(/\*\*([^*]+)\*\*/)
          const restRendered = restParts.map((p, i) =>
            i % 2 === 0 ? p : <strong key={i} className="font-semibold text-[#040222]">{p}</strong>,
          )
          return (
            <div key={key} className="flex gap-2">
              <span className="shrink-0 font-euclid text-[14px] leading-5 text-[#7c47e1] font-semibold">{numberedMatch[1]}.</span>
              <span className="font-euclid text-[14px] leading-5 text-[#36354c]">{restRendered}</span>
            </div>
          )
        }
        return (
          <p key={key} className="font-euclid text-[14px] leading-5 text-[#36354c]">
            {rendered}
          </p>
        )
      }
      const lines = msg.content.text.split("\n")
      const hasMultipleLines = lines.length > 1
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            {hasMultipleLines ? (
              <div className="flex flex-col gap-1.5">
                {lines.map((line, i) => renderLine(line, i))}
              </div>
            ) : (
              renderLine(lines[0], 0)
            )}
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content.kind === "capability_options") {
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex flex-col gap-2">
              <p className="font-euclid text-[13px] leading-5 text-[#5b5675]">Which action would you like to perform?</p>
              <WorkflowOfferPick
                disabled={isLocked}
                options={msg.content.options.map((cap) => ({
                  key: cap.id,
                  label: (
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-euclid text-[13px] font-semibold leading-5 text-[#040222]">{cap.label}</span>
                      <span className="font-euclid text-[12px] leading-4 text-[#5b5675]">{cap.description}</span>
                    </span>
                  ),
                  userEchoLabel: cap.label,
                }))}
                onPick={(key) => {
                  const cap = CAPABILITIES.find((c) => c.id === key)
                  if (cap) handleCapabilitySelected(cap, msg.id)
                }}
              />
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content.kind === "policy_options") {
      const { policies, capabilityId } = msg.content
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex flex-col gap-2">
              <p className="font-euclid text-[13px] leading-5 text-[#5b5675]">Which active policy should I use?</p>
              <WorkflowOfferPick
                disabled={isLocked}
                options={policies.map((p) => ({
                  key: p.id,
                  label: (
                    <span className="flex min-w-0 flex-col gap-0.5">
                      <span className="font-euclid text-[13px] font-semibold leading-5 text-[#040222]">{p.vehicle ?? p.type}</span>
                      <span className="font-euclid text-[12px] leading-4 text-[#5b5675]">{p.policyNumber}</span>
                    </span>
                  ),
                  userEchoLabel: `${p.vehicle ?? p.type} · ${p.policyNumber}`,
                }))}
                onPick={(key) => {
                  const policy = policies.find((p) => p.id === key)
                  if (policy) handlePolicySelected(policy, capabilityId, msg.id)
                }}
              />
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content.kind === "edit_kind_options") {
      const { policy } = msg.content
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity>
            <div className="flex flex-col gap-2">
              <p className="font-euclid text-[13px] leading-5 text-[#5b5675]">What would you like to edit?</p>
              <WorkflowOfferPick
                disabled={isLocked}
                options={EDIT_KIND_OPTIONS.map((o) => ({ key: o.key, label: o.label }))}
                onPick={(key) => handleEditKindSelected(key as EndorsementEditKind, policy, msg.id)}
              />
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content.kind === "edit_mode_options") {
      const { policy, editKind } = msg.content
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity={false}>
            <div className="flex flex-col gap-2">
              <WorkflowOfferPick
                disabled={isLocked}
                options={[
                  { key: "self_serve", label: "Guide the customer (self-serve)" },
                  { key: "do_for_customer", label: "Do it on customer's behalf" },
                ]}
                onPick={(key) => handleEditModeSelected(key as EditMode, policy, editKind, msg.id)}
              />
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    if (msg.content.kind === "claim_mode_options") {
      const { policy } = msg.content
      return (
        <div key={msg.id} className="min-w-0 max-w-full">
          <HelloAiBubbleCard showIdentity={false}>
            <div className="flex flex-col gap-2">
              <WorkflowOfferPick
                disabled={isLocked}
                options={[
                  { key: "guide_customer", label: "Guide the customer (self-serve)" },
                  { key: "do_on_behalf", label: "Do it on customer's behalf" },
                ]}
                onPick={(key) => handleClaimModeSelected(key as ClaimMode, policy, msg.id)}
              />
            </div>
          </HelloAiBubbleCard>
        </div>
      )
    }

    return null
  }

  // ── Right panel content (exact same tab body as UC1/UC2) ────────────────────
  const renderTabContent = (tabId: ShowcaseTabId) => {
    switch (tabId) {
      case "request_docs":
        return (
          <RequestDocsPanel
            onAlreadyHaveDocs={handleAlreadyHaveDocs}
            onDocsSent={handleDocsSent}
          />
        )
      case "raise_claim":
        return (
          <RaiseClaimAppMockup
            policyLabel={workflowData.policy?.vehicle ?? workflowData.policy?.type ?? "Tata Nexon"}
            onClaimRaised={handleClaimRaised}
          />
        )
      case "send_acko_alert":
        return <SendAckoAlertPanel onSent={() => {}} />
      case "claim_status":
        return workflowData.policy ? (
          <ClaimStatusDirectPanel policy={workflowData.policy} />
        ) : (
          // Fallback: use first active policy if somehow no policy in workflow state
          activePolicies[0] ? (
            <ClaimStatusDirectPanel policy={activePolicies[0]} />
          ) : null
        )
      case "comm_history":
        return (
          <CommunicationHistoryPanel
            customer={customer as never}
            customerPolicies={activePolicies.map((p) => ({
              id: p.id,
              number: p.policyNumber ?? "",
              type: p.type,
              vehicleMake: p.vehicle?.split(" ")[0],
              vehicleModel: p.vehicle,
              vehicleNumber: "",
            })) as never}
            onBack={() => closeTab("comm_history")}
          />
        )
      case "payment_history":
        return (
          <PaymentHistoryPanel
            customer={customer as never}
            customerPolicies={activePolicies.map((p) => ({
              id: p.id,
              number: p.policyNumber ?? "",
              type: p.type,
              vehicleMake: p.vehicle?.split(" ")[0],
              vehicleModel: p.vehicle,
            })) as never}
            onBack={() => closeTab("payment_history")}
          />
        )
      case "req_documents":
        return (
          <div className="p-4">
            <RequestDocumentsManualPanel
              customer={customer}
              onBack={() => closeTab("req_documents")}
              onSent={() => {
                if (pendingTabAfterDocs) {
                  const nextTab = pendingTabAfterDocs
                  setPendingTabAfterDocs(null)
                  window.setTimeout(() => {
                    openTab(nextTab)
                    addAiMsg({ kind: "text", text: "Documents requested. Opening the advisor panel to complete the update." })
                  }, 400)
                }
              }}
            />
          </div>
        )
      case "send_comm":
        return workflowData.policy ? (
          <div className="p-4">
            <SendCommunicationManualPanel
              customer={customer}
              initialPolicy={workflowData.policy}
              onBack={() => closeTab("send_comm")}
              onSent={() => {}}
            />
          </div>
        ) : null
      case "nearby_garages":
        return (
          <div className="p-2">
            <NearbyGaragesPanel />
          </div>
        )
      case "kyc_logs":
        return (
          <div className="p-4">
            <KycVerificationLogs customerName={customer.name} onBack={() => closeTab("kyc_logs")} />
          </div>
        )
      case "similar_cases":
        return (
          <div className="p-4">
            <SimilarCasesPanel />
          </div>
        )
      case "escalate":
        return (
          <EscalateIssuePanel
            onSubmit={() => {
              setOpenTabs([])
              setActiveTabId(null)
              setRightPanelOpen(false)
              window.setTimeout(() => {
                addAiMsg({ kind: "text", text: "✅ Escalation raised successfully. The relevant team will review and respond to the customer shortly." })
              }, 200)
            }}
          />
        )
    }
  }

  // In manual mode: no right panel, everything is inline in the center pane
  const showRightContentArea = !isManualMode && rightPanelOpen && activeRailTab === "workflows"
  const anyRightPanelVisible =
    !isManualMode && (
      showRightContentArea ||
      (rightPanelOpen && activeRailTab === "power-tools") ||
      activeRailTab === "similar-cases" ||
      activeRailTab === "existing-tickets"
    )

  // ─── Layout (mirrors UC1/UC2 exactly) ────────────────────────────────────────
  return (
    <div className={cn("relative flex w-full overflow-hidden bg-[#fafafa]", className)}>

      {/* ── Left sidebar (same as UC1/UC2) ──────────────────────────────── */}
      <CustomerProfileSidebar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
        showTabs
        className="shrink-0"
      />

      {/* ── Chat / Manual-mode column ────────────────────────────────────── */}
      <div
        className={cn(
          "relative flex min-h-0 min-w-0 flex-1 flex-col",
          anyRightPanelVisible && "border-r border-[#e7e7f0]",
        )}
      >
        {/* ── MANUAL MODE: step-based flow entirely in center pane ── */}
        {isManualMode ? (
          <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">

            {/* ── STEP 1: Action grid ── */}
            {manualStep === "grid" && (
              <div className="px-10 py-6">
                {MANUAL_MODE_SECTIONS.map((section) => (
                  <div key={section.title} className="mb-7">
                    <p className="mb-3 font-euclid text-[11px] font-medium uppercase tracking-widest text-[#9c9aaf]">
                      {section.title}
                    </p>
                    <div className="grid grid-cols-4 gap-2">
                      {section.actions.map((action) => {
                        const isPlaceholder = action.capabilityId === null
                        return (
                          <button
                            key={action.label}
                            type="button"
                            disabled={isPlaceholder}
                            onClick={() => handleManualActionClick(action)}
                            className={cn(
                              "rounded-lg border px-3 py-2.5 text-left font-euclid text-[13px] font-medium transition-colors",
                              isPlaceholder
                                ? "cursor-default border-[#f0f0f6] bg-white text-[#c5c2d6]"
                                : "border-[#e7e7f0] bg-white text-[#36354c] hover:border-[#c7b8f0] hover:bg-[#f5f3fc] hover:text-[#040222]",
                            )}
                          >
                            {action.label}
                          </button>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* ── STEP 2: Policy selection ── */}
            {manualStep === "policy_select" && manualSelectedAction && (
              <div className="flex flex-col px-10 py-6">
                {/* Back + breadcrumb */}
                <button
                  type="button"
                  onClick={resetManualMode}
                  className="mb-6 flex items-center gap-1.5 self-start font-euclid text-[12px] text-[#7c47e1] hover:underline"
                >
                  <span>←</span>
                  <span>Back to actions</span>
                </button>
                <p className="mb-1 font-euclid text-[18px] font-semibold text-[#040222]">
                  {manualSelectedAction.label}
                </p>
                <p className="mb-5 font-euclid text-[13px] text-[#5b5675]">
                  Select the policy for which you want to take this action.
                </p>
                <div className="flex flex-col gap-2">
                  {activePolicies.map((p) => (
                    <button
                      key={p.id}
                      type="button"
                      onClick={() => handleManualPolicySelected(p)}
                      className="flex items-center justify-between rounded-xl border border-[#e7e7f0] bg-white px-4 py-3.5 text-left transition-colors hover:border-[#c7b8f0] hover:bg-[#f5f3fc]"
                    >
                      <div>
                        <p className="font-euclid text-[14px] font-semibold text-[#040222]">
                          {p.vehicle ?? p.name}
                        </p>
                        <p className="font-euclid text-[12px] text-[#9c9aaf]">{p.policyNumber}</p>
                      </div>
                      <span className="font-euclid text-[13px] text-[#7c47e1]">Select →</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* ── STEP 3: Workflow UI (inline, no right panel) ── */}
            {manualStep === "workflow" && manualSelectedAction?.capabilityId && (
              <div className="flex flex-col">
                {/* Back button header */}
                <div className="flex shrink-0 items-center gap-3 border-b border-[#e7e7f0] px-10 py-3">
                  <button
                    type="button"
                    onClick={resetManualMode}
                    className="flex items-center gap-1.5 font-euclid text-[12px] text-[#7c47e1] hover:underline"
                  >
                    <span>←</span>
                    <span>Back</span>
                  </button>
                  {manualSelectedPolicy && (
                    <>
                      <span className="text-[#e7e7f0]">|</span>
                      <span className="font-euclid text-[12px] text-[#5b5675]">
                        {manualSelectedPolicy.vehicle ?? manualSelectedPolicy.name}
                      </span>
                    </>
                  )}
                  <span className="ml-auto font-euclid text-[12px] font-semibold text-[#040222]">
                    {manualSelectedAction.label}
                  </span>
                </div>

                {/* Workflow content */}
                <div className="min-h-0 flex-1 overflow-y-auto">
                  {manualSelectedAction.capabilityId === "view_policy" && manualSelectedPolicy && (
                    <ViewPolicyDocPanel policy={manualSelectedPolicy} />
                  )}
                  {manualSelectedAction.capabilityId === "raise_claim" && (
                    <div className="flex justify-center py-6">
                      <RaiseClaimAppMockup
                        policyLabel={manualSelectedPolicy ? (manualSelectedPolicy.vehicle ?? manualSelectedPolicy.name) : undefined}
                        onClaimRaised={resetManualMode}
                      />
                    </div>
                  )}
                  {manualSelectedAction.capabilityId === "edit_policy" && (
                    <div className="px-10 py-6">
                      <SendAckoAlertPanel onSent={resetManualMode} />
                    </div>
                  )}
                  {manualSelectedAction.capabilityId === "comm_history" && (
                    <CommunicationHistoryPanel
                      customer={customer}
                      customerPolicies={activePolicies.map((p) => ({ id: p.id, number: p.policyNumber, type: p.type, vehicleMake: p.vehicle ?? "" }))}
                      onBack={resetManualMode}
                    />
                  )}
                  {manualSelectedAction.capabilityId === "payment_history" && (
                    <PaymentHistoryPanel
                      customer={customer}
                      customerPolicies={activePolicies.map((p) => ({ id: p.id, number: p.policyNumber, type: p.type, vehicleMake: p.vehicle ?? "" }))}
                      onBack={resetManualMode}
                    />
                  )}
                  {manualSelectedAction.capabilityId === "kyc_logs" && (
                    <KycVerificationLogs onBack={resetManualMode} />
                  )}
                  {manualSelectedAction.capabilityId === "request_docs" && (
                    <div className="px-6 py-6">
                      <RequestDocsPanel
                        onAlreadyHaveDocs={resetManualMode}
                        onDocsSent={resetManualMode}
                      />
                    </div>
                  )}
                  {manualSelectedAction.capabilityId === "send_comm" && manualSelectedPolicy && (
                    <div className="px-6 py-6">
                      <SendCommunicationManualPanel
                        customer={customer}
                        initialPolicy={manualSelectedPolicy}
                        onBack={resetManualMode}
                        onSent={resetManualMode}
                      />
                    </div>
                  )}
                  {manualSelectedAction.capabilityId === "nearby_garages" && (
                    <div className="px-6 py-6">
                      <NearbyGaragesPanel />
                    </div>
                  )}
                  {manualSelectedAction.capabilityId === "escalate" && (
                    <div className="flex justify-center py-6">
                      <div className="w-full max-w-lg px-6">
                        <EscalateIssuePanel onSubmit={resetManualMode} />
                      </div>
                    </div>
                  )}
                  {manualSelectedAction.capabilityId === "claim_status" && manualSelectedPolicy && (
                    <div className="px-6 py-6">
                      <ClaimStatusDirectPanel policy={manualSelectedPolicy} />
                    </div>
                  )}
                </div>
              </div>
            )}

          </div>
        ) : (
          <>
            {/* ── AI CHAT MODE: scrollable transcript ── */}
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-y-contain">
              <div className="relative flex min-h-full flex-col items-start gap-4 px-10 py-5">
                {/* Capability grid — shown after greeting, before any action taken */}
                {greetingShown && messages.length === 1 && openTabs.length === 0 && (
                  <HelloAiBubbleCard showIdentity={false} fullWidth>
                    <div className="flex flex-col gap-3">
                      <p className="font-euclid text-[12px] font-medium uppercase tracking-wide text-[#9c9aaf]">
                        All available actions
                      </p>
                      <div className="grid grid-cols-2 gap-2">
                        {CAPABILITIES.map((cap) => (
                          <button
                            key={cap.id}
                            type="button"
                            onClick={() => handleCapabilitySelected(cap)}
                            className="flex items-start gap-2.5 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3 py-2.5 text-left transition-colors hover:bg-[#f5f3fc] hover:border-[#c7b8f0] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                          >
                            <span className="mt-0.5 shrink-0 text-[#7c47e1]">{cap.icon}</span>
                            <span className="min-w-0 flex-1">
                              <span className="block font-euclid text-[12px] font-semibold leading-5 text-[#040222]">{cap.label}</span>
                              <span className="block font-euclid text-[11px] leading-4 text-[#5b5675]">{cap.description}</span>
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </HelloAiBubbleCard>
                )}

                {!greetingShown && aiTyping && <TypingIndicator labelId={typingLabelId} showIdentity />}
                {messages.map(renderMsg)}
                {greetingShown && aiTyping && <TypingIndicator labelId={typingLabelId} showIdentity={false} />}
                <div ref={chatEndRef} />
              </div>
            </div>

            {/* Composer (same as UC1/UC2 input bar) */}
            <div className="relative shrink-0 border-t border-[#e7e7f0] px-10 py-3">
          {/* Quick-action drawer — floats above composer (same position as UC1/UC2) */}
          {drawerOpen && filteredCapabilities.length > 0 && (
            <div
              ref={drawerRef}
              className="absolute bottom-full left-10 right-10 z-50 mb-1 overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_-4px_24px_rgba(54,53,76,0.12)]"
              role="listbox"
              aria-label="Available actions"
            >
              <div className="flex items-center gap-2 border-b border-[#f0f0f6] px-4 py-2">
                <Sparkles className="size-3.5 shrink-0 text-[#7c47e1]" aria-hidden />
                <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#9c9aaf]">Quick Actions</p>
              </div>
              <div className="max-h-[260px] overflow-y-auto py-1">
                {filteredCapabilities.map((cap, i) => (
                  <button
                    key={cap.id}
                    type="button"
                    role="option"
                    aria-selected={i === drawerHighlight}
                    onMouseEnter={() => setDrawerHighlight(i)}
                    onClick={() => { setDrawerOpen(false); setComposerValue(""); handleCapabilitySelected(cap) }}
                    className={cn(
                      "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
                      i === drawerHighlight ? "bg-[#f5f3fc]" : "hover:bg-[#fafafa]",
                    )}
                  >
                    <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", i === drawerHighlight ? "bg-[#7c47e1] text-white" : "bg-[#f5f3fc] text-[#7c47e1]")}>
                      {cap.icon}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block font-euclid text-[13px] font-semibold leading-5 text-[#040222]">{cap.label}</span>
                      <span className="block font-euclid text-[11px] leading-4 text-[#5b5675]">{cap.description}</span>
                    </span>
                    {i === drawerHighlight && (
                      <span className="shrink-0 rounded border border-[#e7e7f0] bg-white px-1.5 py-0.5 font-euclid text-[10px] text-[#9c9aaf]">↵</span>
                    )}
                  </button>
                ))}
              </div>
              <div className="border-t border-[#f0f0f6] px-4 py-2">
                <p className="font-euclid text-[10px] text-[#c5c2d6]">↑↓ navigate · ↵ select · Esc dismiss</p>
              </div>
            </div>
          )}

          {/* Input bar — matches UC1 exactly */}
          <div className="flex items-center gap-3 rounded-2xl border border-[#e7e7f0] bg-white px-4 py-3 shadow-sm">
            <input
              ref={composerRef}
              type="text"
              value={composerValue}
              onChange={(e) => handleComposerChange(e.target.value)}
              onKeyDown={handleComposerKeyDown}
              onFocus={() => setDrawerOpen(true)}
              placeholder={greetingShown ? "Ask anything here..." : "Loading…"}
              disabled={!greetingShown}
              className="min-w-0 flex-1 font-euclid text-[14px] text-[#36354c] outline-none placeholder:text-[#8b87a3] disabled:opacity-50"
            />
            <Button
              type="button"
              size="icon"
              onClick={handleSendFreeText}
              disabled={!composerValue.trim() || !greetingShown}
              className="size-8 shrink-0 rounded-full bg-[#5c30c9] text-white hover:bg-[#4a27a0] disabled:pointer-events-none disabled:opacity-40"
            >
              <Send className="size-4" aria-hidden strokeWidth={2} />
            </Button>
          </div>
            </div>
          </>
        )}
      </div>

      {/* ── Right content panel (exact same structure as UC1/UC2) ─────────── */}
      {showRightContentArea && (
        <div
          className="relative flex h-full shrink-0 flex-col border-l border-[#e7e7f0] bg-white"
          style={{ width: rightPanelWidth }}
        >
          {/* Drag-to-resize handle */}
          <div
            onMouseDown={handleResizeMouseDown}
            className="absolute inset-y-0 left-0 z-20 w-1 cursor-col-resize group"
            title="Drag to resize"
          >
            <div className="absolute inset-y-0 left-0 w-1 bg-transparent transition-colors group-hover:bg-[#7c47e1]/20 group-active:bg-[#7c47e1]/40" />
          </div>
          {/* Workflow tabs — Chrome-style persistent tab bar */}
          <>
            {/* Tab header row */}
            <div className="flex shrink-0 items-center justify-between px-3 pt-3 pb-2">
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
                      <span className={cn("font-euclid text-sm font-medium whitespace-nowrap", activeTabId === tab ? "text-[#5b5675]" : "text-[#36354c]")}>
                        {TAB_LABELS[tab]}
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

              {/* 3-dot menu */}
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
                              {TAB_LABELS[tab]}
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

            {/* Divider */}
            {openTabs.length > 0 && <div className="shrink-0 border-b border-[#e7e7f0]" />}

            {/* Active tab content */}
            {activeTabId !== null && (
              <div className="min-h-0 flex-1 overflow-y-auto">
                {renderTabContent(activeTabId)}
              </div>
            )}

            {/* "Already have documents" footer — mirrors UC2 */}
            {activeTabId === "request_docs" && !docsApproved && (
              <div className="shrink-0 border-t border-[#e7e7f0] px-4 py-3 text-center">
                <button
                  type="button"
                  onClick={handleAlreadyHaveDocs}
                  className="font-euclid text-[13px] font-medium text-[#7c47e1] hover:underline"
                >
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
        </div>
      )}

      {/* Power tools panel */}
      {!isManualMode && rightPanelOpen && activeRailTab === "power-tools" && (
        <div
          className="relative flex h-full shrink-0 flex-col border-l border-[#e7e7f0] bg-white"
          style={{ width: rightPanelWidth }}
        >
          <div onMouseDown={handleResizeMouseDown} className="absolute inset-y-0 left-0 z-20 w-1 cursor-col-resize group">
            <div className="absolute inset-y-0 left-0 w-1 bg-transparent transition-colors group-hover:bg-[#7c47e1]/20 group-active:bg-[#7c47e1]/40" />
          </div>
          <HelloPowerToolsPanel onToolClick={() => {}} />
        </div>
      )}

      {/* Similar cases panel — Figma 224:5585 */}
      {!isManualMode && activeRailTab === "similar-cases" && (
        <div
          className="relative flex h-full shrink-0 flex-col border-l border-[#e7e7f0] bg-white"
          style={{ width: rightPanelWidth }}
        >
          <div onMouseDown={handleResizeMouseDown} className="absolute inset-y-0 left-0 z-20 w-1 cursor-col-resize group">
            <div className="absolute inset-y-0 left-0 w-1 bg-transparent transition-colors group-hover:bg-[#7c47e1]/20 group-active:bg-[#7c47e1]/40" />
          </div>
          <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
            <SimilarCasesPanel />
          </div>
        </div>
      )}

      {/* Existing tickets panel — Figma 247:6029 */}
      {!isManualMode && activeRailTab === "existing-tickets" && (
        <div
          className="relative flex h-full shrink-0 flex-col border-l border-[#e7e7f0] bg-white"
          style={{ width: rightPanelWidth }}
        >
          <div onMouseDown={handleResizeMouseDown} className="absolute inset-y-0 left-0 z-20 w-1 cursor-col-resize group">
            <div className="absolute inset-y-0 left-0 w-1 bg-transparent transition-colors group-hover:bg-[#7c47e1]/20 group-active:bg-[#7c47e1]/40" />
          </div>
          <ExistingTicketsPanel />
        </div>
      )}

      {/* Right icon rail — always visible (same as UC1/UC2) */}
      <HelloRightPanelIconRail
        activeTab={activeRailTab}
        onTabChange={handleRailTabChange}
        isRailOnlyLayout={!anyRightPanelVisible}
        showLabels
        hasSimilarCases
        hasExistingTickets
        manualMode={{
          isManualMode,
          onToggle: () => {
            setIsManualMode((prev) => {
              if (prev) {
                // Exiting manual mode — reset the step machine
                setManualStep("grid")
                setManualSelectedAction(null)
                setManualSelectedPolicy(null)
              } else {
                // Entering manual mode — close any open right content panel
                setRightPanelOpen(false)
              }
              return !prev
            })
            setActiveRailTab("workflows")
          },
        }}
      />

      {/* Review documents modal (mirrors UC2) */}
      {showReviewModal && (
        <ReviewDocsModal
          onClose={() => setShowReviewModal(false)}
          onApprove={handleApproveDocuments}
        />
      )}
    </div>
  )
}
