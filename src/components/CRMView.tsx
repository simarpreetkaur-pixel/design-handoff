import { useParams, useNavigate, useLocation } from "react-router-dom"
import { useMemo, useState, useRef, useCallback, useEffect } from "react"
import { flushSync } from "react-dom"

import { useCall } from "@/context/CallContext"
import { mockCustomers, sunilGuptaGmcEditNameJtbd, sunilGuptaSwiftDzireEditNameJtbd } from "@/data/mockCustomers"
import { buildAiCompanionWelcomeMessage } from "@/lib/aiCompanionWelcome"
import { canonicalOngoingJtbdTitle } from "@/lib/canonicalOngoingLabels"
import { createChatEndorsementJtbd } from "@/lib/chatCreatedEndorsementJtbd"
import { createChatRaiseClaimJtbd } from "@/lib/chatCreatedRaiseClaimJtbd"
import type { EndorsementEditKind, JTBD, JTBDType, Policy } from "@/types/crm"
import type { CrmDemoState } from "@/types/navigation"
import { CustomerProfileCard } from "@/components/crm/CustomerProfileCard"
import { EditPhoneDialog } from "@/components/crm/EditPhoneDialog"
import { JTBDPanel } from "@/components/crm/JTBDPanel"
import { AIChatPanel, type AIChatCaseContext, type ChatMockCase } from "@/components/crm/AIChatPanel"
import {
  ClaimHandlerAppointmentModal,
  type ClaimHandlerAppointmentValue,
} from "@/components/crm/ClaimHandlerAppointmentModal"
import type { FlowActionValue } from "@/components/crm/ActionDetailPage"
import { QuickActionDetailPage, type QuickActionKey } from "@/components/crm/QuickActionDetailPage"
import { QuickActionsButton } from "@/components/crm/QuickActionsButton"
import { OzontelEndCallModal } from "@/components/OzontelEndCallModal"
import { OzontelDialer } from "@/components/OzontelDialer"
import { Pencil, PhoneForwarded, Search, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { performCustomerSearch } from "@/utils/customerSearch"

function UnknownCallerResolutionView({
  onCustomerResolved,
}: {
  onCustomerResolved: (customerId: string) => void
}) {
  const [query, setQuery] = useState("")
  const [error, setError] = useState("")
  const [busy, setBusy] = useState(false)

  const runSearch = async () => {
    const q = query.trim()
    if (!q) return
    setBusy(true)
    setError("")
    await new Promise((r) => window.setTimeout(r, 450))
    const res = performCustomerSearch(q)
    if (res.found && res.result) {
      onCustomerResolved(res.result.customer.id)
    } else {
      setError(
        "No data found for this number or ID. Ask the customer for their registered mobile number or policy ID, then try again.",
      )
    }
    setBusy(false)
  }

  return (
    <div className="flex min-h-[calc(100vh-72px)] w-full flex-col items-center justify-center bg-[#fafafa] px-6 py-12">
      <div className="w-full max-w-lg rounded-[12px] border border-[#e7e7f0] bg-white p-8 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]">
        <h2 className="font-euclid text-lg font-semibold text-[#040222]">No data from this number</h2>
        <p className="mt-2 font-euclid text-[14px] leading-5 text-[#5b5675]">
          We couldn&apos;t match the inbound caller ID to a profile. Ask the customer for their registered mobile
          number or policy ID and search below.
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
              placeholder="Registered mobile or policy number"
              className="min-w-0 flex-1 border-0 bg-transparent font-euclid text-[14px] text-[#36354c] outline-none placeholder:text-[#9c9aaf]"
              disabled={busy}
              aria-label="Registered mobile or policy number"
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
          Demo: search <span className="font-medium text-[#5b5675]">1234</span> to open Rajesh Kumar&apos;s profile.
        </p>
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
  const aiChatColumnRef = useRef<HTMLDivElement>(null)
  
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
  /** Bumped when Quick Actions FAB selects “Request document” — JTBDPanel opens Request RC modal. */
  const [requestRcFabNonce, setRequestRcFabNonce] = useState(0)

  /** Unknown JTBD iteration — full-bleed until split unlock (workflow create/guide, or KYC / something-else). */
  const [unknownJtbdSplitUnlocked, setUnknownJtbdSplitUnlocked] = useState(false)

  /** Raj Kapoor cold-inbound / raise-claim demo — alternate shell (Hello view placeholder). */
  const [rajKapoorCrmUiVariant, setRajKapoorCrmUiVariant] = useState<"classic" | "hello">("classic")

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
  
  const DEFAULT_CHAT_WIDTH = Math.round(334 * 1.1)
  const MIN_CHAT_WIDTH = DEFAULT_CHAT_WIDTH
  const MAX_CHAT_WIDTH = Math.floor(DEFAULT_CHAT_WIDTH * 1.3)

  const resolvedChatMockCase: ChatMockCase = useMemo(() => {
    if (crmDemo?.chatMockCase) return crmDemo.chatMockCase
    if (customerId === "anita-sharma") return "kyc_issuance"
    if (customerId === "raj-kapoor") return "raj_cold_nexon"
    if (customerId === "sunil-gupta") return "sunil_endorsement_edit_name"
    return "default"
  }, [crmDemo?.chatMockCase, customerId])

  const unknownJtbdFullBleed =
    resolvedChatMockCase === "unknown_jtbd_iteration" && !unknownJtbdSplitUnlocked

  const isRajKapoorRaiseClaimFlow =
    customerId === "raj-kapoor" && resolvedChatMockCase === "raj_cold_nexon"

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
    if (chatWorkflowTimerRef.current) {
      window.clearTimeout(chatWorkflowTimerRef.current)
      chatWorkflowTimerRef.current = null
    }
    setSelectedJtbd(null)
    setSunilEndorsementChoice(null)
    setOzontelPresalesTransferOpen(false)
    setChatCreatedEndorsementJtbd(null)
    setChatCreatedRaiseClaimJtbd(null)
    setChatWorkflowPreferredJtbdId(undefined)
    setLeftPanelChatWorkflowLoading(false)
    setLeftPanelRaiseClaimFlowLoading(false)
    setClaimHandlerAppointment(null)
    setClaimHandlerModalOpen(false)
    setRaiseClaimFocusRequest(null)
    setUnknownJtbdSplitUnlocked(false)
    setRajKapoorCrmUiVariant("classic")
  }, [customerId])

  const panelJtbds = useMemo(() => {
    if (!data) return []
    if (customerId === "sunil-gupta" && sunilEndorsementChoice === "swift") {
      return [sunilGuptaSwiftDzireEditNameJtbd]
    }
    if (customerId === "sunil-gupta" && sunilEndorsementChoice === "gmc") {
      return [sunilGuptaGmcEditNameJtbd]
    }
    const base = data.jtbds
    let list = [...base]
    if (chatCreatedEndorsementJtbd && !list.some((j) => j.id === chatCreatedEndorsementJtbd.id)) {
      list = [...list, chatCreatedEndorsementJtbd]
    }
    if (chatCreatedRaiseClaimJtbd && !list.some((j) => j.id === chatCreatedRaiseClaimJtbd.id)) {
      list = [...list, chatCreatedRaiseClaimJtbd]
    }
    return list
  }, [customerId, sunilEndorsementChoice, data, chatCreatedEndorsementJtbd, chatCreatedRaiseClaimJtbd])

  const effectiveInitialJtbdId = useMemo(() => {
    if (customerId === "sunil-gupta" && sunilEndorsementChoice === "swift") {
      return sunilGuptaSwiftDzireEditNameJtbd.id
    }
    if (customerId === "sunil-gupta" && sunilEndorsementChoice === "gmc") {
      return sunilGuptaGmcEditNameJtbd.id
    }
    return crmDemo?.initialSelectedJtbdId
  }, [customerId, sunilEndorsementChoice, crmDemo?.initialSelectedJtbdId])

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
      jtbdLabel: canonicalOngoingJtbdTitle(selectedJtbd),
      vehicle: selectedJtbd.vehicle,
      jtbdType: selectedJtbd.type,
      policyNumber: motor?.policyNumber,
    }
  }, [data, selectedJtbd])

  const claimHandlerModalContextSubtitle = useMemo(() => {
    if (!chatCaseContext) return undefined
    const pn = chatCaseContext.policyNumber?.trim()
    if (pn) return `${chatCaseContext.vehicle} - ${pn}`
    return chatCaseContext.vehicle
  }, [chatCaseContext])

  const aiCompanionWelcomeText = useMemo(() => {
    if (!data) return ""
    return buildAiCompanionWelcomeMessage(data.customer, selectedJtbd, data.activePolicies)
  }, [data, selectedJtbd])

  const workflowChatContext = useMemo(() => {
    if (!data) return undefined
    return {
      customerName: data.customer.name,
      activePolicies: data.activePolicies,
      callContextVehicle: data.customer.callContext.vehicle,
    }
  }, [data])

  /** Stable for the CRM visit / call so chat is not wiped when JTBD or injected tabs change; new customer or answered-call session gets a new key. */
  const aiCompanionSessionKey = useMemo(() => {
    const cust = customerId ?? ""
    const callTs = callState.data.callStartTime?.getTime()
    const mock = resolvedChatMockCase
    if (callTs != null) return `${cust}:call:${callTs}:${mock}`
    return `${cust}:crm:${mock}`
  }, [customerId, callState.data.callStartTime, resolvedChatMockCase])

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
      const trimmed = label.trim()
      const lower = trimmed.toLowerCase()
      if (
        lower.includes("schedule") &&
        (lower.includes("ch ") || lower.includes("claim handler"))
      ) {
        handleOpenClaimHandlerAppointment()
        return
      }
      if (lower.includes("send communication")) {
        setFlowActionFromChat("send_communication")
        return
      }
      if (lower.includes("advisor") || lower.includes("edit policy")) {
        setFlowActionFromChat("advisor_ui")
        return
      }
      setQuickActionDetailLabel(trimmed)
      setQuickActionDetail(key)
    },
    [handleOpenClaimHandlerAppointment],
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
      <div className="relative min-h-screen w-full overflow-x-hidden bg-[#fafafa]">
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
          <h1 className="min-w-0 flex-1 truncate font-euclid text-[28px] font-normal leading-[1.2] text-[#2c2067]">
            OMNI Support
          </h1>
        </div>

        <UnknownCallerResolutionView
          onCustomerResolved={(id) => {
            const bundle = mockCustomers[id]
            if (!bundle) return
            callState.openCRMForCustomer(id, bundle)
            navigate(`/crm/call/${id}`, { replace: true, state: { crmDemo } })
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

    const { customer, activePolicies, inactivePolicies } = data

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

        <div className="flex min-w-0 flex-1 items-center justify-between gap-4">
          <h1 className="min-w-0 truncate font-euclid text-[28px] font-normal leading-[1.2] text-[#2c2067]">
            OMNI Support
          </h1>
          <div className="flex min-w-0 shrink-0 flex-wrap items-center justify-end gap-3">
            {isRajKapoorRaiseClaimFlow ? (
              <div className="flex shrink-0 items-center gap-2 rounded-lg border border-[#f0f0f6] bg-[#f8f7fc] px-2 py-1.5">
                <span className="hidden whitespace-nowrap font-euclid text-xs font-medium text-[#5b5675] sm:inline">
                  Classic view
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={rajKapoorCrmUiVariant === "hello"}
                  aria-label="Toggle between Classic view and Hello view"
                  onClick={() =>
                    setRajKapoorCrmUiVariant((v) => (v === "classic" ? "hello" : "classic"))
                  }
                  className={cn(
                    "relative h-7 w-12 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/40",
                    rajKapoorCrmUiVariant === "hello" ? "bg-[#7c47e1]" : "bg-[#d8d6ea]",
                  )}
                >
                  <span
                    className={cn(
                      "pointer-events-none absolute top-0.5 left-0.5 block h-6 w-6 rounded-full bg-white shadow-sm transition-transform duration-200 ease-out",
                      rajKapoorCrmUiVariant === "hello" ? "translate-x-5" : "translate-x-0",
                    )}
                  />
                </button>
                <span className="hidden whitespace-nowrap font-euclid text-xs font-medium text-[#5b5675] sm:inline">
                  Hello view
                </span>
              </div>
            ) : null}
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

      {isRajKapoorRaiseClaimFlow && rajKapoorCrmUiVariant === "hello" ? (
        <div className="relative h-[calc(100vh-72px)] w-full bg-[#fafafa]" aria-label="Hello CRM view" />
      ) : (
        <>
      {/* Body — split CRM vs full-bleed AI (unknown JTBD iteration, phase 1) */}
      <div className="relative flex h-[calc(100vh-72px)] w-full min-h-0 flex-col">
        <div
          className={cn(
            "min-h-0 flex-1 overflow-hidden",
            resolvedChatMockCase === "unknown_jtbd_iteration"
              ? "motion-safe:grid motion-safe:transition-[grid-template-rows,grid-template-columns] motion-safe:duration-[1100ms] motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)] motion-reduce:transition-none"
              : "flex flex-row",
          )}
          style={
            resolvedChatMockCase === "unknown_jtbd_iteration"
              ? unknownJtbdFullBleed
                ? {
                    display: "grid",
                    gridTemplateRows: "auto minmax(0, 1fr)",
                    gridTemplateColumns: "minmax(0, 1fr)",
                    gridTemplateAreas: '"profile" "chat"',
                  }
                : {
                    display: "grid",
                    gridTemplateRows: "minmax(0, 1fr)",
                    gridTemplateColumns: `minmax(0, 1fr) minmax(0, ${aiChatWidth}px)`,
                    gridTemplateAreas: '"profile chat"',
                  }
              : undefined
          }
        >
          <div
            style={
              resolvedChatMockCase === "unknown_jtbd_iteration" ? { gridArea: "profile" } : undefined
            }
            className={
              resolvedChatMockCase === "unknown_jtbd_iteration"
                ? unknownJtbdFullBleed
                  ? "relative flex min-h-0 flex-col bg-[#fafafa]"
                  : "relative flex h-full min-h-0 flex-col overflow-hidden bg-[#fafafa]"
                : "relative h-full min-h-0 flex-1 overflow-hidden bg-[#fafafa]"
            }
          >
            {leftPanelChatWorkflowLoading || leftPanelRaiseClaimFlowLoading ? (
              <div
                className="absolute inset-0 z-[55] cursor-wait overflow-y-auto bg-[#fafafa]/95 [scrollbar-gutter:stable]"
                aria-busy
                aria-label={
                  leftPanelRaiseClaimFlowLoading ? "Opening raise claim" : "Creating workflow"
                }
              >
                <div className="flex min-h-full w-full min-w-0 flex-col gap-6 px-8 py-6">
                  <div className="h-[120px] w-full shrink-0 animate-pulse rounded-[12px] bg-[#ececf2]" />
                  <div className="grid w-full grid-cols-1 gap-4 sm:grid-cols-3">
                    <div className="h-[94px] w-full animate-pulse rounded-[12px] bg-[#e7e7f0] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]" />
                    <div className="h-[94px] w-full animate-pulse rounded-[12px] bg-[#e7e7f0] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]" />
                    <div className="h-[94px] w-full animate-pulse rounded-[12px] bg-[#e7e7f0] shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]" />
                  </div>
                  <div className="w-full space-y-3 rounded-[12px] border border-[#ececf2] bg-white p-4">
                    <div className="h-4 w-32 animate-pulse rounded bg-[#ececf2]" />
                    <div className="h-20 w-full animate-pulse rounded-lg bg-[#f4f4f6]" />
                    <div className="h-4 w-3/4 max-w-xl animate-pulse rounded bg-[#ececf2]" />
                    <div className="h-4 w-1/2 max-w-md animate-pulse rounded bg-[#ececf2]" />
                  </div>
                </div>
              </div>
            ) : null}

            {unknownJtbdFullBleed ? (
              <div className="relative min-h-0 w-full flex-1 overflow-y-auto overflow-x-hidden overscroll-y-contain px-6 pb-6 pt-6 [scrollbar-gutter:stable] sm:px-10">
                <CustomerProfileCard customer={customer} />
              </div>
            ) : (
              <div className="relative h-full min-h-0">
                <div className="h-full min-h-0 overflow-y-auto overflow-x-hidden overscroll-y-contain pb-24 px-8 [scrollbar-gutter:stable]">
                  <div className="flex w-full flex-col gap-6 py-6">
                    <CustomerProfileCard customer={customer} />

                    <JTBDPanel
                        key={`${customerId}-${mergedInitialJtbdId ?? ""}-${String(crmDemo?.chatMockCase ?? "")}-${sunilEndorsementChoice ?? ""}-${chatCreatedEndorsementJtbd?.id ?? ""}`}
                        customerId={customerId}
                        jtbds={panelJtbds}
                        activePolicies={activePolicies}
                        inactivePolicies={inactivePolicies}
                        onAskInChat={handleAskInChat}
                        onFocusChatComposer={focusChatComposer}
                        claimHandlerAppointment={claimHandlerAppointment}
                        onCancelClaimHandlerAppointment={handleCancelClaimHandlerAppointment}
                        onEditClaimHandlerAppointment={handleEditClaimHandlerAppointment}
                        raiseClaimFocusRequest={raiseClaimFocusRequest}
                        onRaiseClaimFocusConsumed={handleRaiseClaimFocusConsumed}
                        onSelectedJtbdChange={handleJtbdSelected}
                        onOpenQuickRelatedAction={handleOpenQuickRelatedAction}
                        openFlowFromParent={flowActionFromChat}
                        onOpenFlowFromParentConsumed={consumeOpenFlowFromChat}
                        initialSelectedJtbdId={mergedInitialJtbdId}
                        onPresalesTransferClick={
                          customerId === "ayush-singhal" ? handlePresalesTransferFromJtbd : undefined
                        }
                        customerEmailForRcRequest={data?.customer.email}
                        customerDisplayName={customer.name}
                        openRequestRcFromFabNonce={requestRcFabNonce}
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
                {!unknownJtbdFullBleed && !quickActionDetail ? (
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 z-50 flex justify-end p-6">
                    <div className="pointer-events-auto">
                      <QuickActionsButton
                        onSelectAction={(k) => {
                          if (k === "quick-action-1") {
                            setFlowActionFromChat("send_communication")
                            return
                          }
                          if (k === "quick-action-2") {
                            setRequestRcFabNonce((n) => n + 1)
                            return
                          }
                          if (k === "quick-action-3") {
                            handleOpenClaimHandlerAppointment()
                            return
                          }
                          setQuickActionDetailLabel(null)
                          setQuickActionDetail(k)
                        }}
                      />
                    </div>
                  </div>
                ) : null}
              </div>
            )}
          </div>

          <div
            ref={aiChatColumnRef}
            className={
              resolvedChatMockCase === "unknown_jtbd_iteration"
                ? unknownJtbdFullBleed
                  ? "relative flex min-h-0 flex-col overflow-hidden rounded-t-[20px] border border-b-0 border-[#e8e6f0] bg-white shadow-[0_-8px_40px_rgba(28,11,62,0.07)] motion-safe:transition-[border-color,box-shadow] motion-safe:duration-[1100ms] motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                  : "relative flex h-full min-h-0 shrink-0 overflow-hidden border-l border-[#e7e7f0] bg-white motion-safe:transition-[border-color] motion-safe:duration-[1100ms] motion-safe:ease-[cubic-bezier(0.25,0.46,0.45,0.94)]"
                : "relative h-full min-h-0 shrink-0 overflow-hidden border-l border-[#e7e7f0] bg-white transition-[width,flex-basis,border-color] duration-[800ms] ease-out"
            }
            style={
              resolvedChatMockCase === "unknown_jtbd_iteration"
                ? { gridArea: "chat" }
                : { width: `${aiChatWidth}px` }
            }
          >
            {!unknownJtbdFullBleed ? (
              <div
                className="absolute -left-2 top-0 z-10 flex h-full w-4 cursor-col-resize select-none items-stretch justify-center"
                onMouseDown={handleMouseDown}
                role="separator"
                aria-orientation="vertical"
                aria-label="Resize AI chat panel"
              >
                <span className="h-full w-px bg-[#e7e7f0] transition-colors hover:bg-[#7c47e1]" />
              </div>
            ) : null}

            <div
              className={cn(
                "flex h-full min-h-0 flex-col motion-safe:transition-[box-shadow] motion-safe:duration-[400ms] motion-safe:ease-[cubic-bezier(0.22,1,0.36,1)]",
                aiChatActive ? "ring-2 ring-[#7c47e1] ring-opacity-20" : "",
              )}
            >
              <AIChatPanel
                key={aiCompanionSessionKey}
                isActive={aiChatActive}
                preWrittenMessage={preWrittenMessage}
                askInChatNonce={askInChatNonce}
                chatComposerFocusNonce={chatComposerFocusNonce}
                onMessageUsed={handleMessageUsed}
                activeJtbdType={aiJtbdType}
                chatMockCase={resolvedChatMockCase}
                caseContext={chatCaseContext}
                contextualWelcomeText={
                  resolvedChatMockCase === "unknown_jtbd_iteration" ? undefined : aiCompanionWelcomeText
                }
                onCrmFlowAction={handleCrmFlowFromChat}
                onEndorsementPolicySelected={
                  customerId === "sunil-gupta" ? handleSunilEndorsementPolicyFromChat : undefined
                }
                workflowChatContext={workflowChatContext}
                onChatEndorsementWorkflowCreated={handleChatEndorsementWorkflowCreated}
                onChatRaiseClaimWorkflowCreated={handleChatRaiseClaimWorkflowCreated}
                onGoToRaiseClaimForPolicy={handleGoToRaiseClaimForPolicy}
                onRaiseClaimFlowLoadingChange={setLeftPanelRaiseClaimFlowLoading}
                onOpenClaimHandlerAppointment={handleOpenClaimHandlerAppointment}
                onUnknownJtbdSplitUnlock={handleUnknownJtbdSplitUnlock}
                fullBleedComposerAccessory={
                  unknownJtbdFullBleed ? (
                    <button
                      type="button"
                      onClick={handleOzontelClick}
                      title={isCrmOngoingSession ? "End Call" : "Open dialer"}
                      aria-label={isCrmOngoingSession ? "End call" : "Open Ozontel dialer"}
                      className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-[#e7e7f0] bg-white shadow-[0_2px_8px_rgba(28,11,62,0.06)] ring-1 ring-[#040222]/[0.03] transition hover:border-[#d8d6ea] hover:bg-[#fafafa] hover:shadow-[0_4px_14px_rgba(28,11,62,0.08)] active:scale-[0.98]"
                    >
                      <img
                        src="/icons/ozontel-dialer-icon.png"
                        alt=""
                        width={36}
                        height={36}
                        className="size-9 object-contain"
                      />
                    </button>
                  ) : undefined
                }
              />
            </div>
          </div>
        </div>
      </div>
        </>
      )}

        {!unknownJtbdFullBleed ? (
          <img
            onClick={handleOzontelClick}
            src="/icons/ozontel-dialer-icon.png"
            alt="Ozontel Dialer"
            className="fixed bottom-6 left-6 z-[60] h-14 w-14 cursor-pointer object-contain"
            title={isCrmOngoingSession ? "End Call" : "Open Dialer"}
          />
        ) : null}

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

        {ozontelPresalesTransferOpen && data?.customer ? (
          <div
            className="fixed bottom-24 left-6 z-[65] w-[min(100vw-3rem,312px)] overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]"
            role="dialog"
            aria-label="Ozontel transfer"
          >
            <div className="flex h-[46px] items-center border-b border-[#e7e7f0] bg-white px-3">
              <h3 className="text-[18px] font-bold leading-[34px] text-black">Ozontel</h3>
            </div>
            <div className="space-y-4 p-4">
              <p className="font-euclid text-sm leading-5 text-[#36354c]">
                Transfer this call to the Presales team for further assistance.
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
    </div>
  )
}
