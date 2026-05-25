import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useMemo, useState, useRef, useCallback, useEffect } from "react"
import { flushSync } from "react-dom"

import { useCall } from "@/context/CallContext"
import {
  mockCustomers,
  rajKapoorClaimStatusNexonJtbd,
  rajKapoorRaiseClaimNexonJtbd,
  rajKapoorRoadSideAssistanceJtbd,
  rekhaGuptaClaimStatusEscalatedJtbd,
  sunilGuptaGmcEditNameJtbd,
  sunilGuptaRefundEscalationJtbd,
  sunilGuptaSwiftDzireEditNameJtbd,
} from "@/data/mockCustomers"
import {
  rekhaGuptaSupportHistoryEntries,
  rekhaGuptaSupportHistoryPreview,
} from "@/data/rekhaGuptaClaimStatusEscalated"
import { buildAiCompanionWelcomeMessage } from "@/lib/aiCompanionWelcome"
import { canonicalOngoingJtbdTitle } from "@/lib/canonicalOngoingLabels"
import { createChatEndorsementJtbd } from "@/lib/chatCreatedEndorsementJtbd"
import { createChatRaiseClaimJtbd } from "@/lib/chatCreatedRaiseClaimJtbd"
import type { EndorsementEditKind, JTBD, JTBDType, Policy, Customer } from "@/types/crm"
import type { CrmDemoState } from "@/types/navigation"
import { EditPolicyHelloView } from "@/components/crm/hello/EditPolicyHelloView"
import { RaiseClaimHelloView } from "@/components/crm/hello/RaiseClaimHelloView"
import { RoadsideAssistanceHelloView } from "@/components/crm/hello/RoadsideAssistanceHelloView"
import { EscalationCaseHelloView } from "@/components/crm/hello/EscalationCaseHelloView"
import { LiveListeningRaiseClaimHelloView } from "@/components/crm/hello/LiveListeningRaiseClaimHelloView"
import { EditPhoneDialog } from "@/components/crm/EditPhoneDialog"
import { AIChatPanel, type AIChatCaseContext, type ChatMockCase } from "@/components/crm/AIChatPanel"
import {
  ClaimHandlerAppointmentModal,
  type ClaimHandlerAppointmentValue,
} from "@/components/crm/ClaimHandlerAppointmentModal"
import { OzontelEndCallModal } from "@/components/OzontelEndCallModal"
import { OzontelDialer } from "@/components/OzontelDialer"
import { Pencil, PhoneForwarded, Search, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { performCustomerSearch } from "@/utils/customerSearch"
import {
  SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK,
  SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK,
  SUNIL_UNKNOWN_REASON_COMPANION_OPENER,
  SUNIL_UNKNOWN_REASON_DEMO_UNLOCK_LOOKUP_DIGITS,
} from "@/data/sunilEditPolicyUseCases"

function UnknownCallerResolutionView({
  onCustomerResolved,
}: {
  onCustomerResolved: (customerId: string, searchQuery: string) => void
}) {
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)
  const [skeletonLoading, setSkeletonLoading] = useState(false)

  const runSearch = async () => {
    const q = query.trim()
    if (!q) return
    setBusy(true)
    setError("")
    
    // Special handling for "1234" - show skeleton loading for 2 seconds
    if (q.toLowerCase() === "1234") {
      setSkeletonLoading(true)
      await new Promise((r) => window.setTimeout(r, 2000))
      setSkeletonLoading(false)
    } else {
      await new Promise((r) => window.setTimeout(r, 450))
    }
    
    const res = performCustomerSearch(q)
    if (res.found && res.result) {
      onCustomerResolved(res.result.customer.id, q)
    } else {
      setError(
      "No data found for this number or ID. Ask the customer for their registered mobile number or policy ID, then try again.",
      )
    }
    setBusy(false)
  }

  if (skeletonLoading) {
    return (
      <div className="flex h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden bg-[#fafafa]">
        <div className="w-[298px] shrink-0 border-r border-[#e7e7f0] bg-white p-4">
          <div className="space-y-4">
            <div className="h-6 w-40 rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
            <div className="h-24 w-full rounded-xl bg-[#ecebf3] motion-safe:animate-pulse" />
            <div className="h-32 w-full rounded-xl bg-[#ecebf3] motion-safe:animate-pulse" />
          </div>
        </div>
        <div className="flex min-h-0 flex-1 flex-col items-center justify-center px-6 py-12">
          <div className="h-64 w-full max-w-lg rounded-xl bg-[#ecebf3] motion-safe:animate-pulse" />
        </div>
        <div className="hidden w-12 shrink-0 border-l border-[#e7e7f0] bg-white lg:block" aria-hidden />
      </div>
    )
  }

  return (
    <div className="flex h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden bg-[#fafafa]">
      <aside className="flex w-[298px] shrink-0 flex-col gap-4 overflow-y-auto border-r border-[#e7e7f0] bg-white p-4 shadow-[2px_0px_4px_rgba(0,0,0,0.09)]">
        <p className="font-euclid text-xs font-medium uppercase tracking-wide text-[#5b5675]">
          Customer profile
        </p>
        <div className="rounded-xl border border-[#e7e7f0] bg-[#f8f7fc] p-4">
          <p className="font-euclid text-sm leading-5 text-[#5b5675]">
            Profile and policies load after you identify the caller.
          </p>
        </div>
      </aside>

      <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-y-auto px-6 py-12">
      <div className="w-full max-w-lg rounded-[12px] border border-[#e7e7f0] bg-white p-8 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]">
      <h2 className="font-euclid text-lg font-semibold text-[#040222]">Unknown caller</h2>
      <p className="mt-2 font-euclid text-[14px] leading-5 text-[#5b5675]">
        Customer is calling from non-registered number. Enter the registered mobile number/email ID/name to identify the user.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-stretch">
        <div className="flex min-h-12 flex-1 items-center gap-2 rounded-lg border border-[#e7e7f0] bg-[#fafafa] px-3">
          <Search className="size-5 shrink-0 text-[#5b5675]" aria-hidden />
          <input
            type="text"
            value={query}
            onChange={(e) => {
              setQuery(e.target.value)
              if (error) setError("")
            }}
            onKeyDown={(e) => {
              if (e.key === "Enter") void runSearch()
            }}
            placeholder="Registered mobile/email ID/name"
            className="min-w-0 flex-1 border-0 bg-transparent font-euclid text-[14px] text-[#36354c] outline-none placeholder:text-[#9c9aaf]"
            disabled={busy}
            aria-label="Registered mobile/email ID/name"
          />
        </div>
        <Button
          type="button"
          onClick={() => void runSearch()}
          disabled={busy || !query.trim()}
          className="h-12 shrink-0 rounded-lg bg-[#7c47e1] px-6 font-euclid text-[14px] font-semibold text-white hover:bg-[#7c47e1]/90 disabled:opacity-50"
        >
          {busy ? "Searching…" : "Search"}
        </Button>
      </div>
      {error ? (
        <div className="mt-4 flex gap-2 rounded-md border border-amber-200 bg-amber-50 p-3">
          <AlertCircle className="mt-0.5 size-5 shrink-0 text-amber-700" aria-hidden />
          <p className="font-euclid text-[13px] leading-5 text-amber-900">{error}</p>
        </div>
      ) : null}
      <p className="mt-6 font-euclid text-[12px] leading-[18px] text-[#9c9aaf]">
        Demo: search <span className="font-medium text-[#5b5675]">1234</span> to open Sunil Gupta&apos;s profile.
      </p>
      </div>
      </div>

      <div
        className="hidden shrink-0 border-l border-[#e7e7f0] bg-white lg:flex lg:w-12 lg:flex-col lg:items-center lg:pt-4"
        aria-hidden
      >
        <div className="size-8 rounded-lg bg-[#f8f7fc]" />
      </div>
    </div>
  )
}

export function CRMView() {
  const { customerId } = useParams<{ customerId: string }>()
  const navigate = useNavigate()
  const location = useLocation()
  const callState = useCall()

  const crmDemo = (location.state as { crmDemo?: CrmDemoState } | undefined)?.crmDemo
  const unknownCallerSearchQuery = (location.state as { unknownCallerSearchQuery?: string } | undefined)?.unknownCallerSearchQuery

  // AI Chat panel state
  const [aiChatWidth, setAiChatWidth] = useState(() => Math.round(334 * 1.1)) // +10% vs 334px ≈ 367px
  const [isResizing, setIsResizing] = useState(false)
  const [aiChatActive, setAiChatActive] = useState(false)
  const [preWrittenMessage, setPreWrittenMessage] = useState("")
  /** Bumps on each "Ask in chat" so the chat prefill effect runs once per click. */
  const [askInChatNonce, setAskInChatNonce] = useState(0)
  /** Bumps when Agent focuses the composer without prefilling. */
  const [chatComposerFocusNonce, setChatComposerFocusNonce] = useState(0)
  const [claimHandlerAppointment, setClaimHandlerAppointment] = useState<ClaimHandlerAppointmentValue | null>(null)
  const [claimHandlerModalOpen, setClaimHandlerModalOpen] = useState(false)
  const [claimHandlerModalMode, setClaimHandlerModalMode] = useState<"create" | "edit">("create")
  const [crmToast, setCrmToast] = useState<string | null>(null)
  const [sunilUnknownPolicyUnlockLoading, setSunilUnknownPolicyUnlockLoading] = useState(false)
  const aiChatColumnRef = useRef<HTMLDivElement>(null)
  
  // Ozontel states
  const [endCallModalOpen, setEndCallModalOpen] = useState(false)
  const [ozontelDialerVisible, setOzontelDialerVisible] = useState(false)
  
  // Phone edit state
  const [displayLookupPhone, setDisplayLookupPhone] = useState("")
  const [editPhoneDialogOpen, setEditPhoneDialogOpen] = useState(false)

  const handleEditPhone = useCallback(() => {
    setEditPhoneDialogOpen(true)
  }, [])

  const handleSavePhone = useCallback((newPhone: string) => {
    setDisplayLookupPhone(newPhone)
    setEditPhoneDialogOpen(false)
  }, [])

  // Ozontel handlers
  const handleOzontelClick = useCallback(() => {
    const isOngoingCall = callState.state === "active_call" || callState.state === "viewing_crm"
    if (isOngoingCall) {
      setEndCallModalOpen(true)
    } else {
      setOzontelDialerVisible(true)
    }
  }, [callState.state])

  const handleEndCall = useCallback(() => {
    callState.endCall()
    setEndCallModalOpen(false)
    navigate("/", { state: { omniCallToast: "call_ended" as const } })
  }, [callState, navigate])

  const handleCloseEndCallModal = useCallback(() => {
    setEndCallModalOpen(false)
  }, [])

  const handleCloseOzontelDialer = useCallback(() => {
    setOzontelDialerVisible(false)
  }, [])

  const handleCall = useCallback(() => {
    // Handle call initiation logic here
    setOzontelDialerVisible(false)
  }, [])

  const [aiJtbdType, setAiJtbdType] = useState<JTBDType>("claim")
  const [selectedJtbd, setSelectedJtbd] = useState<JTBD | null>(null)

  /** Unknown JTBD iteration — full-bleed until split unlock (workflow create/guide, or KYC / something-else). */
  const [unknownJtbdSplitUnlocked, setUnknownJtbdSplitUnlocked] = useState(false)


  /** Sunil endorsement demo — AI chat policy chips reveal JTBD */
  const [sunilEndorsementChoice, setSunilEndorsementChoice] = useState<"swift" | "gmc" | null>(null)
  /** JTBD created from AI Companion — endorsement */
  const [chatCreatedEndorsementJtbd, setChatCreatedEndorsementJtbd] = useState<JTBD | null>(null)
  /** JTBD created from AI Companion — raise claim workflow */
  const [chatCreatedRaiseClaimJtbd, setChatCreatedRaiseClaimJtbd] = useState<JTBD | null>(null)
  /** Select this JTBD tab after chat injects endorsement workflow */
  const [chatWorkflowPreferredJtbdId, setChatWorkflowPreferredJtbdId] = useState<string | undefined>(undefined)
  const [leftPanelChatWorkflowLoading, setLeftPanelChatWorkflowLoading] = useState(false)
  const [leftPanelRaiseClaimFlowLoading, setLeftPanelRaiseClaimFlowLoading] = useState(false)
  const chatWorkflowTimerRef = useRef<ReturnType<typeof window.setTimeout> | null>(null)
  /** Ayush renewal — Transfer to Presales opens Ozontel-style strip */
  const [ozontelPresalesTransferOpen, setOzontelPresalesTransferOpen] = useState(false)
  /** Raj RSA — Ozontel transfer strip (same pattern as Presales) */
  const [ozontelRsaTransferOpen, setOzontelRsaTransferOpen] = useState(false)

  const DEFAULT_CHAT_WIDTH = Math.round(334 * 1.1)
  const MIN_CHAT_WIDTH = DEFAULT_CHAT_WIDTH
  const MAX_CHAT_WIDTH = Math.floor(DEFAULT_CHAT_WIDTH * 1.3)

  const resolvedChatMockCase: ChatMockCase = useMemo(() => {
    if (crmDemo?.chatMockCase) return crmDemo.chatMockCase
    if (customerId === "anita-sharma") return "kyc_issuance"
    if (customerId === "raj-kapoor") return "raj_cold_nexon"
    if (customerId === "sunil-gupta") return SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK
    return "default"
  }, [crmDemo?.chatMockCase, customerId])

  const unknownJtbdFullBleed =
    resolvedChatMockCase === "unknown_jtbd_iteration" && !unknownJtbdSplitUnlocked

  // Check if currently in an ongoing session
  const isCrmOngoingSession = callState.state === "active_call" || callState.state === "viewing_crm"

  const isRajKapoorRaiseClaimFlow =
    customerId === "raj-kapoor" && resolvedChatMockCase === "raj_raise_claim_nexon_gmc"

  const isRajKapoorLiveListeningFlow =
    customerId === "raj-kapoor" && resolvedChatMockCase === "raj_live_listening_raise_claim"

  const isRajKapoorRsaFlow =
    customerId === "raj-kapoor" && resolvedChatMockCase === "raj_road_side_assistance"

  const isRajKapoorClaimStatusFlow =
    customerId === "raj-kapoor" && resolvedChatMockCase === "raj_cold_nexon"

  const isRekhaClaimStatusEscalatedFlow =
    customerId === "rekha-gupta" && resolvedChatMockCase === "rekha_claim_status_escalated"

  const isSunilEditPolicyHelloFlowCase3 =
    customerId === "sunil-gupta" && resolvedChatMockCase === SUNIL_EDIT_POLICY_USE_CASE_3_CHAT_MOCK
  const isSunilEditPolicyHelloFlowCase4 =
    customerId === "sunil-gupta" && resolvedChatMockCase === SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK
  const isSunilEditPolicyHelloFlow = isSunilEditPolicyHelloFlowCase3 || isSunilEditPolicyHelloFlowCase4

  const isSunilEscalationRefundFlow =
    customerId === "sunil-gupta" && resolvedChatMockCase === "sunil_escalation_refund_payment"

  /** Use case 3 only — Hello inbound copy + implied Swift motor policy (does not apply to Unknown reason / homepage Sunil default). */
  const sunilEditPolicyUc3HelloInbound = useMemo(() => {
    if (!isSunilEditPolicyHelloFlowCase3) return undefined
    if (crmDemo?.initialSelectedJtbdId !== sunilGuptaSwiftDzireEditNameJtbd.id) return undefined
    const vehicleLabel =
      crmDemo.callContextOverride?.vehicle?.trim() || "Maruti Suzuki Swift Dzire 2024"
    return {
      vehicleLabel,
      impliedMotorPolicyId: "policy-sunil-swift",
    }
  }, [
    isSunilEditPolicyHelloFlowCase3,
    crmDemo?.initialSelectedJtbdId,
    crmDemo?.callContextOverride?.vehicle,
  ])

  const handleUnknownJtbdSplitUnlock = useCallback(() => {
    const commit = () => {
      flushSync(() => {
      setUnknownJtbdSplitUnlocked(true)
      })
    }
    const doc = typeof document !== "undefined" ? document : null
    const vt = doc?.startViewTransition
    if (typeof vt === "function") {
      vt.call(doc, commit)
    } else {
      commit()
    }
  }, [])

  const data = useMemo(() => {
    if (!customerId) return null
    return mockCustomers[customerId] ?? null
  }, [customerId])

  const displayCustomer = useMemo((): Customer | null => {
    if (!data?.customer) return null
    const o = crmDemo?.callContextOverride
    if (!o?.reason && !o?.vehicle) return data.customer
    return {
      ...data.customer,
      callContext: {
      ...data.customer.callContext,
      ...(o.reason !== undefined ? { reason: o.reason } : {}),
      ...(o.vehicle !== undefined ? { vehicle: o.vehicle } : {}),
      },
    }
  }, [data, crmDemo?.callContextOverride])

  const sunilEscalationDemoMotorPolicy = useMemo((): Policy | null => {
    if (!isSunilEscalationRefundFlow || !displayCustomer) return null
    const v = displayCustomer.callContext.vehicle?.trim() || "Honda City"
    return {
      id: "policy-sunil-escalation-honda-city",
      name: "Comprehensive Plan",
      type: "Motor Insurance",
      policyNumber: "ACK-DEMO-REFUND-UPI",
      expiryDate: "—",
      vehicle: v,
      policyHolder: displayCustomer.name,
      planDisplayName: "Car_Comprehensive",
      policyPeriodLabel: "Failed purchase — refund pending",
      tenureLabel: "—",
    }
  }, [isSunilEscalationRefundFlow, displayCustomer])

  const sunilUnknownPoliciesUnlocked = useMemo(() => {
    if (!isSunilEditPolicyHelloFlowCase4) return true
    const digits = displayLookupPhone.replace(/\D/g, "")
    return digits === SUNIL_UNKNOWN_REASON_DEMO_UNLOCK_LOOKUP_DIGITS
  }, [isSunilEditPolicyHelloFlowCase4, displayLookupPhone])

  const effectiveActivePolicies = useMemo((): Policy[] => {
    if (!data?.activePolicies) return []
    if (isSunilEditPolicyHelloFlowCase4 && !sunilUnknownPoliciesUnlocked) return []
    return data.activePolicies
  }, [data, data?.activePolicies, isSunilEditPolicyHelloFlowCase4, sunilUnknownPoliciesUnlocked])

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
      // Use the search query from unknown caller resolution if available, otherwise use customer's phone
      setDisplayLookupPhone(unknownCallerSearchQuery || data.customer.phone)
    }
  }, [data?.customer, customerId, unknownCallerSearchQuery])

  useEffect(() => {
    if (chatWorkflowTimerRef.current) {
      window.clearTimeout(chatWorkflowTimerRef.current)
      chatWorkflowTimerRef.current = null
    }
    setSelectedJtbd(null)
    setSunilEndorsementChoice(null)
    setOzontelPresalesTransferOpen(false)
    setOzontelRsaTransferOpen(false)
    setChatCreatedEndorsementJtbd(null)
    setChatCreatedRaiseClaimJtbd(null)
    setChatWorkflowPreferredJtbdId(undefined)
    setLeftPanelChatWorkflowLoading(false)
    setLeftPanelRaiseClaimFlowLoading(false)
    setClaimHandlerAppointment(null)
    setClaimHandlerModalOpen(false)
    setRaiseClaimFocusRequest(null)
    setUnknownJtbdSplitUnlocked(false)
  }, [customerId, resolvedChatMockCase])

  /** Use case 3 (drawer) — Swift Dzire Edit Policy JTBD is already active in Classic view. */
  useEffect(() => {
    if (crmDemo?.initialSelectedJtbdId !== sunilGuptaSwiftDzireEditNameJtbd.id) return
    setSunilEndorsementChoice("swift")
  }, [customerId, crmDemo?.initialSelectedJtbdId])

  const panelJtbds = useMemo(() => {
    if (!data) return []
    if (customerId === "raj-kapoor" && resolvedChatMockCase === "raj_road_side_assistance") {
      return [rajKapoorRoadSideAssistanceJtbd]
    }
    if (customerId === "raj-kapoor" && resolvedChatMockCase === "raj_cold_nexon") {
      return [rajKapoorClaimStatusNexonJtbd]
    }
    if (customerId === "rekha-gupta" && resolvedChatMockCase === "rekha_claim_status_escalated") {
      return [rekhaGuptaClaimStatusEscalatedJtbd]
    }
    if (customerId === "sunil-gupta" && resolvedChatMockCase === "sunil_escalation_refund_payment") {
      return [sunilGuptaRefundEscalationJtbd]
    }
    if (customerId === "sunil-gupta" && sunilEndorsementChoice === "swift") {
      return [sunilGuptaSwiftDzireEditNameJtbd]
    }
    if (customerId === "sunil-gupta" && sunilEndorsementChoice === "gmc") {
      return [sunilGuptaGmcEditNameJtbd]
    }
    const base = data.jtbds
    let list = [...base]
    const demoRaiseClaimId = rajKapoorRaiseClaimNexonJtbd.id

    if (
      customerId === "raj-kapoor" &&
      (resolvedChatMockCase === "raj_raise_claim_nexon_gmc" ||
      resolvedChatMockCase === "raj_live_listening_raise_claim") &&
      !chatCreatedRaiseClaimJtbd &&
      !list.some((j) => j.id === demoRaiseClaimId)
    ) {
      list = [rajKapoorRaiseClaimNexonJtbd, ...list]
    }

    if (chatCreatedEndorsementJtbd && !list.some((j) => j.id === chatCreatedEndorsementJtbd.id)) {
      list = [...list, chatCreatedEndorsementJtbd]
    }
    if (chatCreatedRaiseClaimJtbd && !list.some((j) => j.id === chatCreatedRaiseClaimJtbd.id)) {
      list = list.filter((j) => j.id !== demoRaiseClaimId)
      list = [...list, chatCreatedRaiseClaimJtbd]
    }
    return list
  }, [
    customerId,
    sunilEndorsementChoice,
    data,
    chatCreatedEndorsementJtbd,
    chatCreatedRaiseClaimJtbd,
    resolvedChatMockCase,
  ])

  const effectiveInitialJtbdId = useMemo(() => {
    if (customerId === "raj-kapoor" && resolvedChatMockCase === "raj_road_side_assistance") {
      return rajKapoorRoadSideAssistanceJtbd.id
    }
    if (customerId === "sunil-gupta" && resolvedChatMockCase === "sunil_escalation_refund_payment") {
      return crmDemo?.initialSelectedJtbdId ?? sunilGuptaRefundEscalationJtbd.id
    }
    if (customerId === "sunil-gupta" && sunilEndorsementChoice === "swift") {
      return sunilGuptaSwiftDzireEditNameJtbd.id
    }
    if (customerId === "sunil-gupta" && sunilEndorsementChoice === "gmc") {
      return sunilGuptaGmcEditNameJtbd.id
    }
    if (
      customerId === "raj-kapoor" &&
      (resolvedChatMockCase === "raj_raise_claim_nexon_gmc" ||
      resolvedChatMockCase === "raj_live_listening_raise_claim")
    ) {
      return crmDemo?.initialSelectedJtbdId ?? rajKapoorRaiseClaimNexonJtbd.id
    }
    if (customerId === "raj-kapoor" && resolvedChatMockCase === "raj_cold_nexon") {
      return crmDemo?.initialSelectedJtbdId ?? rajKapoorClaimStatusNexonJtbd.id
    }
    if (customerId === "rekha-gupta" && resolvedChatMockCase === "rekha_claim_status_escalated") {
      return crmDemo?.initialSelectedJtbdId ?? rekhaGuptaClaimStatusEscalatedJtbd.id
    }
    return crmDemo?.initialSelectedJtbdId
  }, [customerId, sunilEndorsementChoice, crmDemo?.initialSelectedJtbdId, resolvedChatMockCase])

  const mergedInitialJtbdId = useMemo(() => {
    if (chatWorkflowPreferredJtbdId) return chatWorkflowPreferredJtbdId
    return effectiveInitialJtbdId
  }, [chatWorkflowPreferredJtbdId, effectiveInitialJtbdId])

  const handleSunilEndorsementPolicyFromChat = useCallback((policyKey: "swift" | "gmc") => {
    setSunilEndorsementChoice(policyKey)
    setAiJtbdType("claim")
  }, [])

  const handleChatEndorsementWorkflowCreated = useCallback(
    (payload: { policy: Policy; editKind: EndorsementEditKind }) => {
      if (chatWorkflowTimerRef.current) {
      window.clearTimeout(chatWorkflowTimerRef.current)
      }
      setLeftPanelChatWorkflowLoading(true)
      chatWorkflowTimerRef.current = window.setTimeout(() => {
      chatWorkflowTimerRef.current = null
      const jtbd = createChatEndorsementJtbd(payload.policy, payload.editKind)
      setChatCreatedEndorsementJtbd(jtbd)
      setChatWorkflowPreferredJtbdId(jtbd.id)
      setAiJtbdType("endorsement")
      setLeftPanelChatWorkflowLoading(false)
      }, 2000)
    },
    [],
  )

  const handleChatRaiseClaimWorkflowCreated = useCallback((payload: { policy: Policy }) => {
    if (chatWorkflowTimerRef.current) {
      window.clearTimeout(chatWorkflowTimerRef.current)
    }
    setLeftPanelChatWorkflowLoading(true)
    chatWorkflowTimerRef.current = window.setTimeout(() => {
      chatWorkflowTimerRef.current = null
      const jtbd = createChatRaiseClaimJtbd(payload.policy)
      setChatCreatedRaiseClaimJtbd(jtbd)
      setChatWorkflowPreferredJtbdId(jtbd.id)
      setAiJtbdType("claim")
      setLeftPanelChatWorkflowLoading(false)
    }, 2000)
  }, [])

  const [raiseClaimFocusRequest, setRaiseClaimFocusRequest] = useState<{
    nonce: number
    policyId: string
  } | null>(null)
  const raiseClaimFocusNonceRef = useRef(0)

  const handleGoToRaiseClaimForPolicy = useCallback((payload: { policyId: string }) => {
    raiseClaimFocusNonceRef.current += 1
    setRaiseClaimFocusRequest({ nonce: raiseClaimFocusNonceRef.current, policyId: payload.policyId })
  }, [])

  const handleRaiseClaimFocusConsumed = useCallback(() => {
    setRaiseClaimFocusRequest(null)
  }, [])

  const handlePresalesTransferFromJtbd = useCallback(() => {
    setOzontelPresalesTransferOpen(true)
  }, [])

  /** Ayush renewal — Transfer in Ozontel strip ends session and shows success on home. */
  const handleAyushPresalesTransferComplete = useCallback(() => {
    setOzontelPresalesTransferOpen(false)
    callState.endCall()
    navigate("/", { state: { omniCallToast: "transfer_success" as const } })
  }, [callState, navigate])

  /** RSA demo — Ozontel strip: Transfer ends call and returns home with success toast. */
  const handleRsaTransferOzontelOpen = useCallback(() => {
    setOzontelRsaTransferOpen(true)
  }, [])

  const handleRsaTransferComplete = useCallback(() => {
    setOzontelRsaTransferOpen(false)
    callState.endCall()
    navigate("/", { state: { omniCallToast: "transfer_success" as const } })
  }, [callState, navigate])

  const openChatWithPrefill = (message: string, jtbdType: JTBDType) => {
    setAiJtbdType(jtbdType)
    setAiChatActive(true)
    if (message) {
      setPreWrittenMessage(message)
      setAskInChatNonce((n) => n + 1)
    }
    if (aiChatColumnRef.current) {
      aiChatColumnRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }

  const focusChatComposer = useCallback((jtbdType: JTBDType) => {
    setAiJtbdType(jtbdType)
    setAiChatActive(true)
    setPreWrittenMessage("")
    setChatComposerFocusNonce((n) => n + 1)
    if (aiChatColumnRef.current) {
      aiChatColumnRef.current.scrollIntoView({ behavior: "smooth", block: "nearest" })
    }
  }, [])

  const handleAskInChat = (message: string, jtbdType: JTBDType) => {
    openChatWithPrefill(message, jtbdType)
  }

  const handleOpenClaimHandlerAppointment = useCallback(() => {
    setClaimHandlerModalMode(claimHandlerAppointment ? "edit" : "create")
    setClaimHandlerModalOpen(true)
  }, [claimHandlerAppointment])

  const handleConfirmClaimHandlerAppointment = useCallback(
    ({ scheduledAt, note }: { scheduledAt: string; note: string }) => {
      setClaimHandlerAppointment((prev) => {
      const isUpdate = prev != null
      window.queueMicrotask(() =>
        setCrmToast(
          isUpdate ? "Claim handler appointment updated." : "Claim handler appointment scheduled.",
        ),
      )
      return {
        id: prev?.id ?? `ch-${Date.now()}`,
        scheduledAt,
        note: note || undefined,
      }
      })
    },
    [],
  )

  const handleCancelClaimHandlerAppointment = useCallback(() => {
    setClaimHandlerAppointment(null)
    setCrmToast("Claim handler appointment cancelled.")
  }, [])

  const handleEditClaimHandlerAppointment = useCallback(() => {
    setClaimHandlerModalMode("edit")
    setClaimHandlerModalOpen(true)
  }, [])

  const handleMessageUsed = useCallback(() => {
    setPreWrittenMessage("")
  }, [])

  const handleJtbdSelected = useCallback((j: JTBD) => {
    setAiJtbdType(j.type)
    setSelectedJtbd(j)
  }, [])

  const chatCaseContext = useMemo((): AIChatCaseContext | null => {
    if (!data || !selectedJtbd) return null
    const firstToken = selectedJtbd.vehicle.split(/\s+/)[0]
    const motor =
      (firstToken
      ? effectiveActivePolicies.find(
          (p) =>
            p.vehicle && p.vehicle.toLowerCase().includes(firstToken.toLowerCase()),
        )
      : undefined) ?? effectiveActivePolicies.find((p) => p.type === "Motor Insurance")
    return {
      jtbdLabel: canonicalOngoingJtbdTitle(selectedJtbd),
      vehicle: selectedJtbd.vehicle,
      jtbdType: selectedJtbd.type,
      policyNumber: motor?.policyNumber,
    }
  }, [data, selectedJtbd, effectiveActivePolicies])

  const claimHandlerModalContextSubtitle = useMemo(() => {
    if (!chatCaseContext) return undefined
    const pn = chatCaseContext.policyNumber?.trim()
    if (pn) return `${chatCaseContext.vehicle} - ${pn}`
    return chatCaseContext.vehicle
  }, [chatCaseContext])

  const aiCompanionWelcomeText = useMemo(() => {
    if (!displayCustomer) return ""
    return buildAiCompanionWelcomeMessage(displayCustomer, selectedJtbd, effectiveActivePolicies)
  }, [displayCustomer, selectedJtbd, effectiveActivePolicies])

  const workflowChatContext = useMemo(() => {
    if (!data || !displayCustomer) return undefined
    const ongoingRaiseClaimWorkflowPresent = panelJtbds.some(
      (j) =>
      j.id === rajKapoorRaiseClaimNexonJtbd.id ||
      j.id.startsWith("jtbd-chat-raise-claim"),
    )
    return {
      customerName: displayCustomer.name,
      activePolicies: effectiveActivePolicies,
      callContextVehicle: displayCustomer.callContext.vehicle,
      ongoingRaiseClaimWorkflowPresent,
    }
  }, [data, displayCustomer, panelJtbds, effectiveActivePolicies])

  /** Stable for the CRM visit / call so chat is not wiped when JTBD or injected tabs change; new customer or answered-call session gets a new key. */
  const aiCompanionSessionKey = useMemo(() => {
    const cust = customerId ?? ""
    const callTs = callState.data.callStartTime?.getTime()
    const mock = resolvedChatMockCase
    if (callTs != null) return `${cust}:call:${callTs}:${mock}`
    return `${cust}:crm:${mock}`
  }, [customerId, callState.data.callStartTime, resolvedChatMockCase])





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

  useEffect(() => {
    if (!crmToast) return
    const t = window.setTimeout(() => setCrmToast(null), 3500)
    return () => window.clearTimeout(t)
  }, [crmToast])

  useEffect(() => {
    if (!aiChatActive) return
    const onPointerDown = (e: PointerEvent) => {
      if (isResizing) return
      const col = aiChatColumnRef.current
      if (!col || col.contains(e.target as Node)) return
      setAiChatActive(false)
    }
    document.addEventListener("pointerdown", onPointerDown, true)
    return () => document.removeEventListener("pointerdown", onPointerDown, true)
  }, [aiChatActive, isResizing])

  if (customerId === "unknown-caller") {
    const isCrmOngoingSessionUnknown =
      callState.state === "active_call" || callState.state === "viewing_crm"
    return (
      <div className="relativemin-h-screen w-full overflow-x-hidden bg-[#fafafa]">
      <div className="relativez-60 flex h-[72px] w-full items-center gap-[14px] bg-white px-[40px] py-[18px] border-b border-[#e7e7f0] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
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
        <h1 className="min-w-0 flex-1 truncate font-euclid text-[28px] font-normal leading-[1.2] text-[#2c2067]">
          OMNI Support
        </h1>
      </div>

      <UnknownCallerResolutionView
        onCustomerResolved={(id, searchQuery) => {
          const bundle = mockCustomers[id]
          if (!bundle) return
          callState.openCRMForCustomer(id, bundle)
          
          // Special case: If resolving to Sunil Gupta, use the Unknown reason chat mock case
          let finalCrmDemo = crmDemo
          if (id === "sunil-gupta") {
            finalCrmDemo = {
              ...crmDemo,
              chatMockCase: SUNIL_EDIT_POLICY_USE_CASE_4_UNKNOWN_REASON_CHAT_MOCK,
              callContextOverride: {
                reason: "Unknown",
              },
            }
          }
          
          navigate(`/crm/call/${id}`, { 
            replace: true, 
            state: { 
              crmDemo: finalCrmDemo,
              unknownCallerSearchQuery: searchQuery 
            } 
          })
        }}
      />

      <img
        onClick={handleOzontelClick}
        src="/icons/ozontel-dialer-icon.png"
        alt="Ozontel Dialer"
        className="fixed bottom-6 left-6 z-[60] h-14 w-14 cursor-pointer object-contain"
        title={isCrmOngoingSessionUnknown ? "End Call" : "Open Dialer"}
      />

      <OzontelEndCallModal
        isVisible={endCallModalOpen}
        onEndCall={handleEndCall}
        onClose={handleCloseEndCallModal}
      />

      <OzontelDialer
        isVisible={ozontelDialerVisible && !isCrmOngoingSessionUnknown}
        onAnswerCall={() => {}}
        onClose={handleCloseOzontelDialer}
        onCall={handleCall}
      />
      </div>
    )
  }

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

    const { inactivePolicies } = data
    const activePolicies = effectiveActivePolicies
    const profileCustomer = displayCustomer!
    const raiseClaimHelloPolicy =
      (isRekhaClaimStatusEscalatedFlow
        ? activePolicies.find((p) => p.id === "policy-rekha-nexon-motor")
        : activePolicies.find((p) => p.id === "policy-raj-motor-1")) ??
      activePolicies[0] ??
      data.activePolicies[0]

  return (
    <div className="relativemin-h-screen w-full overflow-x-hidden bg-[#fafafa]">
      {/* Top Navigation — Figma 8238:63527: shadow below bar; z-index so shadow isn’t lost */}
      <div className="relativez-60 flex h-[72px] w-full items-center gap-[14px] bg-white px-[40px] py-[18px] border-b border-[#e7e7f0] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
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

      <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
        <h1 className="min-w-0 truncate font-euclid text-[28px] font-normal leading-[1.2] text-[#2c2067]">
          OMNI Support
        </h1>
        <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-3">
          <div
            className="flex min-w-0 max-w-[min(100%,320px)] shrink-0 items-center gap-3 rounded-lg border border-solid border-[#f0f0f6] bg-[#f8f7fc] px-2 py-1.5"
            data-node-id="8393:28160"
          >
            <p className="flex min-w-0 items-baseline font-euclid text-xs font-normal leading-[18px] text-[#5b5675]">
              <span className="shrink-0">{`Showing results for: `}</span>
              <span className="min-w-0 truncate">{displayLookupPhone}</span>
            </p>
            <button
              type="button"
              onClick={handleEditPhone}
              className="flex size-4 shrink-0 items-center justify-center text-[#5b5675] transition-colors hover:text-[#040222]"
              title="Use a different number for lookup"
              aria-label="Use a different number for lookup"
              data-name="Edit"
            >
              <Pencil className="size-4" aria-hidden />
            </button>
          </div>
        </div>
      </div>
      </div>

      {isRajKapoorLiveListeningFlow ? (
      <div className="h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden relative">
        <LiveListeningRaiseClaimHelloView
          customer={profileCustomer}
          raiseClaimPolicy={raiseClaimHelloPolicy}
          activePolicies={activePolicies}
          inactivePolicies={inactivePolicies}
          displayPhone={displayLookupPhone}
          onHelloToast={(message) => setCrmToast(message)}
          className="h-full min-h-0 overflow-hidden"
        />
      </div>
      ) : isRajKapoorRaiseClaimFlow ? (
      <div className="h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden ">
        <RaiseClaimHelloView
          customer={profileCustomer}
          raiseClaimPolicy={raiseClaimHelloPolicy}
          activePolicies={activePolicies}
          inactivePolicies={inactivePolicies}
          displayPhone={displayLookupPhone}
          onHelloToast={(message) => setCrmToast(message)}
          className="h-full min-h-0 overflow-hidden"
        />
      </div>
      ) : isRajKapoorClaimStatusFlow ? (
      <div className="h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden ">
        <RaiseClaimHelloView
          customer={profileCustomer}
          raiseClaimPolicy={raiseClaimHelloPolicy}
          claimStatusJtbd={rajKapoorClaimStatusNexonJtbd}
          initialWorkflowType="claim_status"
          activePolicies={activePolicies}
          inactivePolicies={inactivePolicies}
          displayPhone={displayLookupPhone}
          onHelloToast={(message) => setCrmToast(message)}
          className="h-full min-h-0 overflow-hidden"
        />
      </div>
      ) : isRekhaClaimStatusEscalatedFlow ? (
      <div className="h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden ">
        <RaiseClaimHelloView
          customer={profileCustomer}
          raiseClaimPolicy={raiseClaimHelloPolicy}
          claimStatusJtbd={rekhaGuptaClaimStatusEscalatedJtbd}
          claimStatusVariant="escalated"
          initialWorkflowType="claim_status"
          activePolicies={activePolicies}
          inactivePolicies={inactivePolicies}
          displayPhone={displayLookupPhone}
          supportHistoryPreview={rekhaGuptaSupportHistoryPreview}
          supportHistoryEntries={rekhaGuptaSupportHistoryEntries}
          onHelloToast={(message) => setCrmToast(message)}
          className="h-full min-h-0 overflow-hidden"
        />
      </div>
      ) : isRajKapoorRsaFlow ? (
      <div className="h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden ">
        <RoadsideAssistanceHelloView
          customer={profileCustomer}
          activePolicies={activePolicies}
          inactivePolicies={inactivePolicies}
          displayPhone={displayLookupPhone}
          vehicleLabel={
            raiseClaimHelloPolicy.vehicle?.trim() ||
            profileCustomer.callContext.vehicle?.trim() ||
            "Tata Nexon"
          }
          onTransferClick={handleRsaTransferOzontelOpen}
          className="h-full min-h-0 overflow-hidden"
        />
      </div>
      ) : isSunilEscalationRefundFlow && sunilEscalationDemoMotorPolicy ? (
      <div className="h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden ">
        <EscalationCaseHelloView
          customer={profileCustomer}
          jtbd={sunilGuptaRefundEscalationJtbd}
          motorPolicy={sunilEscalationDemoMotorPolicy}
          activePolicies={activePolicies}
          inactivePolicies={inactivePolicies}
          displayPhone={displayLookupPhone}
          onAppointmentScheduled={handleConfirmClaimHandlerAppointment}
          onHelloToast={(message) => setCrmToast(message)}
          className="h-full min-h-0 overflow-hidden"
        />
      </div>
      ) : isSunilEditPolicyHelloFlow ? (
      <div className="h-[calc(100vh-72px)] min-h-0 w-full overflow-hidden ">
        <EditPolicyHelloView
          key={`edit-policy-hello-${sunilUnknownPoliciesUnlocked ? 'unlocked' : 'locked'}`}
          customer={profileCustomer}
          pickablePolicies={effectiveActivePolicies}
          inactivePolicies={inactivePolicies}
          displayPhone={displayLookupPhone}
          inboundEditPolicyContext={sunilEditPolicyUc3HelloInbound}
          isUnknownReasonCase={isSunilEditPolicyHelloFlowCase4}
          className="h-full min-h-0 overflow-hidden"
        />
      </div>
      ) : null}

      {/* Ozontel Dialer - always show */}
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
        onClose={() => setOzontelDialerVisible(false)}
      />

      {ozontelPresalesTransferOpen && data?.customer ? (
        <div
          className="fixed bottom-24 left-6 z-[65] w-[min(100vw-3rem,312px)] overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          role="dialog"
          aria-label="Ozontel presales transfer"
        >
          <div className="flex h-[46px] items-center border-b border-[#e7e7f0] bg-white px-3">
            <h3 className="text-[18px] font-bold leading-[34px] text-black">Ozontel</h3>
          </div>
          <div className="space-y-4 p-4">
            <p className="font-euclid text-sm leading-5 text-[#36354c]">
              Transfer this call to {profileCustomer.name} sales representative.
            </p>
            <div className="flex">
              <Button
                type="button"
                className="h-11 w-full gap-2 bg-[#7c47e1] font-euclid text-sm font-semibold text-white hover:bg-[#7c47e1]/90"
                onClick={handleAyushPresalesTransferComplete}
              >
                <PhoneForwarded className="h-4 w-4 shrink-0" aria-hidden />
                Transfer
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      {ozontelRsaTransferOpen && data?.customer ? (
        <div
          className="fixed bottom-24 left-6 z-[65] w-[min(100vw-3rem,312px)] overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
          role="dialog"
          aria-label="Ozontel RSA transfer"
        >
          <div className="flex h-[46px] items-center border-b border-[#e7e7f0] bg-white px-3">
            <h3 className="text-[18px] font-bold leading-[34px] text-black">Ozontel</h3>
          </div>
          <div className="space-y-4 p-4">
            <p className="font-euclid text-sm leading-5 text-[#36354c]">
              Transfer this call to the RSA team for roadside assistance.
            </p>
            <div className="flex">
              <Button
                type="button"
                className="h-11 w-full gap-2 bg-[#7c47e1] font-euclid text-sm font-semibold text-white hover:bg-[#7c47e1]/90"
                onClick={handleRsaTransferComplete}
              >
                <PhoneForwarded className="h-4 w-4 shrink-0" aria-hidden />
                Transfer
              </Button>
            </div>
          </div>
        </div>
      ) : null}

      <ClaimHandlerAppointmentModal
        open={claimHandlerModalOpen}
        onOpenChange={setClaimHandlerModalOpen}
        mode={claimHandlerModalMode}
        initialScheduledAt={claimHandlerAppointment?.scheduledAt}
        initialNote={claimHandlerAppointment?.note}
        contextSubtitle={claimHandlerModalContextSubtitle}
        onConfirm={handleConfirmClaimHandlerAppointment}
      />

      {/* Edit Phone Dialog */}
      <EditPhoneDialog
        open={editPhoneDialogOpen}
        onOpenChange={setEditPhoneDialogOpen}
        currentPhone={displayLookupPhone}
        onSave={handleSavePhone}
      />

      {crmToast ? (
        <div
          role="status"
          className="pointer-events-none fixed bottom-6 left-1/2 z-[95] max-w-[min(100vw-2rem,420px)] -translate-x-1/2 rounded-lg bg-[#040222] px-4 py-3 font-euclid text-[14px] font-medium leading-5 text-white shadow-lg"
        >
          {crmToast}
        </div>
      ) : null}

      {/* Full-page skeleton loader for Unknown reason policy unlock */}
      {sunilUnknownPolicyUnlockLoading && (
        <div className="fixed inset-0 z-[100] bg-[#fafafa]">
          {/* Top Navigation Skeleton */}
          <div className="flex h-[72px] w-full items-center gap-[14px] bg-white px-[40px] py-[18px] border-b border-[#e7e7f0] shadow-[0_1px_3px_rgba(0,0,0,0.1)]">
            <div className="h-[36px] w-[158px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
            <div className="h-[26px] w-[26px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
            <div className="h-[34px] flex-1 rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
            <div className="h-[36px] w-[120px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
          </div>
          
          {/* Main Content Skeleton */}
          <div className="flex h-[calc(100vh-72px)] w-full ">
            {/* Left Panel */}
            <div className="w-[300px] border-r border-[#e7e7f0] bg-white p-6">
              <div className="space-y-4">
                <div className="h-[24px] w-[200px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
                <div className="h-[80px] w-full rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
                <div className="h-[120px] w-full rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
                <div className="h-[60px] w-full rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
              </div>
            </div>
            
            {/* Main Chat Area */}
            <div className="flex-1 bg-[#fafafa] p-[40px]">
              <div className="flex h-full flex-col gap-4">
                <div className="h-[48px] w-[300px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
                <div className="flex flex-1 flex-col gap-3 rounded-xl bg-white p-6">
                  <div className="h-[20px] w-[150px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
                  <div className="space-y-3">
                    <div className="h-[60px] w-[400px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
                    <div className="ml-auto h-[40px] w-[200px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
                    <div className="h-[80px] w-[450px] rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
                  </div>
                </div>
                <div className="h-[60px] w-full rounded-md bg-[#ecebf3] motion-safe:animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
