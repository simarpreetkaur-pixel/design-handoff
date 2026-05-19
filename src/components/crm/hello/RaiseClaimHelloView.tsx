import {
  type FocusEvent,
  type KeyboardEvent,
  type MouseEvent,
  type ReactNode,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
} from "react"
import { Send, X, Edit3, AlertCircle, Shield, CreditCard, MessageCircle, FileText, XCircle, Phone } from "lucide-react"

import {
  RAISE_CLAIM_CUSTOMER_STEPS,
  RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE,
  RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE,
  raiseClaimTalktrackParts,
} from "@/lib/raiseClaimGuidanceCopy"
import { formatPolicyChatRadioEcho, PolicyChatRadioContent } from "@/lib/policyChatRadioLabel"
import {
  endorsementEditRadioOptions,
  editKindToShortCopyHint,
  formatEndorsementPolicyRadioLabel,
} from "@/lib/endorsementChatWizard"
import { cn, customerFirstNameOrFull } from "@/lib/utils"
import type { Customer, EndorsementEditKind, InactivePolicy, JTBD, Policy } from "@/types/crm"
import {
  claimStatusPreviousCxSummaryCopy,
  helloClaimStatusChoices,
  HELLO_CLAIM_STATUS_CHOICE_PROMPT,
  HELLO_CLAIM_STATUS_ESCALATE_TOAST,
  HELLO_CLAIM_STATUS_FLOW_OFFER_ID,
  helloFopsEscalationSuccessHeadline,
  type HelloClaimStatusChoiceId,
} from "@/components/crm/hello/helloClaimStatusCopy"
import type { ClaimStatusWorkflowView } from "@/components/crm/hello/ClaimStatusWorkflowPanel"
import { HelloClaimStatusPreviousActivity } from "@/components/crm/hello/HelloClaimStatusPreviousActivity"
import { HelloViewPreviousActivityButton } from "@/components/crm/hello/HelloViewPreviousActivityButton"
import { handleChatMessageWithAgentic } from "@/lib/chatAgenticIntegration"
import type { AgenticIntent } from "@/lib/agenticIntentParser"
import {
  HelloAiBubbleCard,
  HelloClaimRaisedSuccessBody,
  HelloCxBubbleCard,
  HelloPolicyDetailPanelSkeleton,
  HelloRenewalReminderCard,
  HelloTellCustomerLabel,
  TypingIndicator,
  WorkflowPaneShimmerOverlay,
  createHelloChatIdentityStreak,
  helloTellCustomerCalloutClass,
  helloWorkflowOfferPickShellClass,
  HelloChatColumnBackground,
  HelloWorkflowSplitHandle,
  HELLO_SPLIT_GRIP_HOVER_BRIDGE_MS,
  HELLO_SPLIT_LEFT_DEFAULT_PCT,
  HELLO_SPLIT_LEFT_MAX_PCT,
  HELLO_SPLIT_LEFT_MIN_PCT,
  helloSplitShellTransitionClass,
  helloWorkflowPaneShellClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import { CustomerProfileSidebar } from "@/components/crm/hello/CustomerProfileSidebar"
import { RightSidebar } from "@/components/crm/hello/RightSidebar"
import {
  HelloCustomerProfileBar,
  helloProfileNonPolicyRibbonAckMessage,
  helloProfileNonPolicyRibbonActionLabel,
  type HelloProfileNonPolicyRibbonActionId,
} from "@/components/crm/hello/HelloCustomerProfileBar"
import { RaiseClaimWorkflowPanel } from "@/components/crm/hello/RaiseClaimWorkflowPanel"
import { EditPolicyWorkflowPanel } from "@/components/crm/hello/EditPolicyWorkflowPanel"
import { PolicyDetailPanel, HelloPolicyChatDetailCard } from "@/components/crm/ActivePoliciesPanel"
import { EndorsementAdvisorPanel } from "@/components/crm/EndorsementAdvisorPanel"
import { WorkflowOfferPick } from "@/components/crm/WorkflowOfferPick"
import { Button } from "@/components/ui/button"
import {
  HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS,
  HELLO_BOT_REPLY_AFTER_USER_MS,
  HELLO_OPENING_OFFER_ID,
  HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS,
  HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS,
  HELLO_WORKFLOW_PANE_SHIMMER_FADE_MS,
  HELLO_WORKFLOW_PANE_SHIMMER_HOLD_MS,
  HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS,
  helloComposerTriggersRaiseClaimOffer,
  helloFreeTextAckStub,
  helloPolicyBarWorkflowOfferPickOptions,
  helloProfileRibbonPolicyAckMessage,
  helloRaiseClaimChoices,
  helloRaiseClaimVehicleLabel,
  helloClaimRaisedSuccessHeadline,
  helloClaimRaisedSuccessQuotedLine,
  helloDefaultRenewalNudgeAfterClaim,
  HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
  HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS,
  HELLO_POLICY_BAR_ASSISTANCE_PROMPT,
  HELLO_RENEWAL_NUDGE_AFTER_SUCCESS_MS,
  HELLO_SECOND_ACK_TYPING_INDICATOR_MS,
  HELLO_SELF_SERVE_READ_PAUSE_MS,
  helloSureCreatingWorkflowAck,
  helloAgentBehalfNetworkGarageBulletsJoined,
  helloSomethingElseAckComposerAlways,
  helloCxResponderName,
  type HelloPolicyBarActionKey,
  type HelloRaiseClaimChoiceId,
} from "@/components/crm/hello/helloRaiseClaimCopy"
import { scheduleHelloProfileRibbonAckSequence } from "@/components/crm/hello/helloProfileRibbonAckSchedule"
import { HelloRibbonBlankSplitPane } from "@/components/crm/hello/HelloRibbonBlankSplitPane"
import {
  EDIT_POLICY_CUSTOMER_STEPS,
  EDIT_POLICY_CUSTOMER_TAT_LINE,
  EDIT_POLICY_HEALTH_NOTE_LINE,
  EDIT_POLICY_POLICYHOLDER_NAME_CUSTOMER_STEPS,
  EDIT_POLICY_POLICYHOLDER_NAME_TAT_LINE,
  HELLO_PROFILE_RIBBON_DEFAULT_EDIT_KIND,
  editPolicyPolicyholderNameSelfServeTip,
  editPolicyTalktrackAdvisorEmphasis,
  editPolicyTalktrackLead,
  editPolicyTalktrackMid,
  editPolicyTalktrackRcEmphasis,
  editPolicyTalktrackTrail,
  helloComposerTriggersEditPolicyOffer,
  helloEditPolicyAdvisorScriptForKind,
  helloEditPolicyModeChoices,
  helloEditPolicyModePickMessage,
  helloEditPolicyPolicyholderNameRcTellCustomer,
  helloEditPolicyPolicyPickContextLabel,
  helloEditPolicyPolicyPickPrompt,
  helloEditPolicySureAck,
  helloEditPolicyWhatToUpdatePrompt,
  helloEditPolicyWorkflowSuccessHeadline,
  helloEditPolicyWorkflowSuccessQuotedLine,
  type HelloEditPolicyModeChoiceId,
} from "@/components/crm/hello/helloEditPolicyCopy"
import {
  helloPolicyHeadingNumber,
  helloPolicyHeadingProduct,
  useHelloPolicyDetailPane,
} from "@/components/crm/hello/useHelloPolicyDetailPane"

function RaiseClaimSelfServeStepsPanel({ 
  onCancel, 
  onDone 
}: { 
  onCancel?: () => void; 
  onDone?: () => void 
}) {
  return (
    <div className="flex min-h-0 flex-col gap-4">
      {/* Header with Cancel button */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
            Customer Steps
          </p>
          <h2 className="mt-1 font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
            Steps to raise claim
          </h2>
          <p className="mt-1 font-euclid text-[13px] leading-5 text-[#5b5675]">
            Guide the customer through these steps to raise their claim.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          aria-label="Cancel steps guide"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {/* Steps content */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-xl border border-[#e7e7f0] bg-white p-4">
        <div>
          <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#5b5675]">
            Steps to raise claim
          </p>
          <ol className="mt-2.5 list-decimal space-y-2 pl-5 font-euclid text-[14px] leading-6 text-[#36354c] marker:font-medium marker:text-[#5b5675]">
            {RAISE_CLAIM_CUSTOMER_STEPS.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border-l-2 border-[#7c47e1]/35 bg-[#f8f7fc] p-3">
          <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#7c47e1]">
            Tell the customer
          </p>
          <div className="mt-2 space-y-2.5">
            <p className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
              {RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-[#e7e7f0]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#e7e7f0] bg-white px-4 py-2 font-euclid text-[14px] font-medium text-[#5b5675] transition-colors hover:bg-[#f4f4f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg bg-[#7c47e1] px-4 py-2 font-euclid text-[14px] font-medium text-white transition-colors hover:bg-[#6b3ccd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

function EditPolicySelfServeStepsPanel({ 
  editKind, 
  onCancel, 
  onDone 
}: { 
  editKind: EndorsementEditKind; 
  onCancel?: () => void; 
  onDone?: () => void 
}) {
  const steps = editKind === "policy_holder_name"
    ? EDIT_POLICY_POLICYHOLDER_NAME_CUSTOMER_STEPS
    : EDIT_POLICY_CUSTOMER_STEPS
  
  const tatLine = editKind === "policy_holder_name"
    ? EDIT_POLICY_POLICYHOLDER_NAME_TAT_LINE
    : EDIT_POLICY_CUSTOMER_TAT_LINE

  return (
    <div className="flex min-h-0 flex-col gap-4">
      {/* Header with Cancel button */}
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
            Customer Steps
          </p>
          <h2 className="mt-1 font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
            Steps for the customer
          </h2>
          <p className="mt-1 font-euclid text-[13px] leading-5 text-[#5b5675]">
            Guide the customer through these steps to complete their edit policy request.
          </p>
        </div>
        <button
          type="button"
          onClick={onCancel}
          className="inline-flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#040222] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          aria-label="Cancel steps guide"
        >
          <X className="size-5" aria-hidden />
        </button>
      </div>

      {/* Steps content */}
      <div className="flex min-h-0 flex-1 flex-col gap-4 rounded-xl border border-[#e7e7f0] bg-white p-4">
        <div>
          <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#5b5675]">
            Steps for the customer
          </p>
          <ol className="mt-2.5 list-decimal space-y-2 pl-5 font-euclid text-[14px] leading-6 text-[#36354c] marker:font-medium marker:text-[#5b5675]">
            {steps.map((step, index) => (
              <li key={index}>{step}</li>
            ))}
          </ol>
        </div>

        <div className="rounded-lg border-l-2 border-[#7c47e1]/35 bg-[#f8f7fc] p-3">
          <p className="font-euclid text-[12px] font-semibold uppercase tracking-wide text-[#7c47e1]">
            Tell the customer
          </p>
          <div className="mt-2 space-y-2.5">
            <p className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
              {tatLine}
            </p>
            <p className="border-l-2 border-[#7c47e1]/35 pl-3 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
              {EDIT_POLICY_HEALTH_NOTE_LINE}
            </p>
          </div>
        </div>

        {/* Action buttons */}
        <div className="mt-auto flex justify-end gap-3 pt-4 border-t border-[#e7e7f0]">
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg border border-[#e7e7f0] bg-white px-4 py-2 font-euclid text-[14px] font-medium text-[#5b5675] transition-colors hover:bg-[#f4f4f6] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onDone}
            className="rounded-lg bg-[#7c47e1] px-4 py-2 font-euclid text-[14px] font-medium text-white transition-colors hover:bg-[#6b3ccd] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  )
}

export type HelloAssistantBody =
  | { kind: "text"; text: string }
  | { kind: "agent_behalf_network_garage" }
  | { kind: "self_serve_tip" }
  | { kind: "raise_claim_offer"; offerId: string }
  | { kind: "raise_claim_policy_select"; offerId: string }
  | { kind: "edit_policy_policy_pick"; offerId: string }
  | { kind: "edit_policy_edit_pick"; offerId: string }
  | { kind: "edit_policy_mode_offer"; offerId: string; introText: string }
  | { kind: "edit_policy_self_serve_tip"; editField: EndorsementEditKind }
  | { kind: "edit_policy_workflow_success" }
  | { kind: "claim_raised_success" }
  | { kind: "renewal_reminder"; vehicleLabel: string; daysLeft: number }
  | { kind: "policy_bar_detail_card"; policyId: string }
  | { kind: "policy_bar_assistance_offer"; policyId: string; offerId: string }

export type HelloChatMessage =
  | { id: string; role: "user"; text: string }
  | { id: string; role: "assistant"; body: HelloAssistantBody }

export type RaiseClaimHelloViewProps = {
  customer: Customer
  raiseClaimPolicy?: Policy
  /** Hello profile bar — policy accordion (Figma 8540:1799). */
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  /** Shown for screen-reader context only (profile uses structured phone). */
  displayPhone?: string
  /** Demo toast when RC email is “sent” — excludes modal; aligns with Classic acknowledgment. */
  onHelloToast?: (message: string) => void
  /**
   * After FNOL success, show a renewal nudge card for another policy. `undefined` uses
   * {@link helloDefaultRenewalNudgeAfterClaim}; pass `null` to hide.
   */
  renewalNudgeAfterClaim?: { vehicleLabel: string; daysLeft: number } | null
  className?: string
  /** Determines the workflow type - "raise_claim" for claim raising, "claim_status" for checking status */
  initialWorkflowType?: "raise_claim" | "claim_status"
  /** JTBD data for claim status flow (required when initialWorkflowType is claim_status). */
  claimStatusJtbd?: JTBD
}

function WorkflowOpeningParagraph({ 
  vehicleLabel, 
  workflowType,
  hasSpecificPolicy
}: { 
  vehicleLabel: string
  workflowType?: "raise_claim" | "claim_status"
  hasSpecificPolicy?: boolean
}) {
  const workflowText = workflowType === "claim_status" ? "Check Claim Status" : "Raise a Claim"
  
  // If no specific policy context (like when searched), show generic message
  if (!hasSpecificPolicy && workflowType === "raise_claim") {
    return (
      <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
        <span>Please select which policy you'd like to </span>
        <span className="font-bold">raise a claim</span>
        <span> for.</span>
      </p>
    )
  }
  
  if (!hasSpecificPolicy && workflowType === "claim_status") {
    return (
      <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
        <span>Please select which policy you'd like to </span>
        <span className="font-bold">check claim status</span>
        <span> for.</span>
      </p>
    )
  }
  
  // Original message for specific policy context (initial call)
  return (
    <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
      <span>Customer is calling for </span>
      <span className="font-bold">{workflowText}</span>
      <span> on their </span>
      <span className="font-bold">{vehicleLabel}</span>
      <span>, select the appropriate option.</span>
    </p>
  )
}

/**
 * Hello-only transcript — workflow tasks live in {@link RaiseClaimWorkflowPanel}; chat stays conversational.
 */
export function RaiseClaimHelloView({
  customer,
  raiseClaimPolicy,
  activePolicies,
  inactivePolicies,
  displayPhone,
  onHelloToast,
  renewalNudgeAfterClaim,
  className,
  initialWorkflowType,
  claimStatusJtbd,
}: RaiseClaimHelloViewProps) {
  const isClaimStatusMode =
    initialWorkflowType === "claim_status" && Boolean(claimStatusJtbd)

  const typingLabelId = useId()
  const replyTypingLabelId = useId()
  const choicesRevealTypingLabelId = useId()
  const csIntroTypingLabelId = useId()
  const csTypingB12LabelId = useId()
  const csTypingB23LabelId = useId()
  const csTypingChoicesLabelId = useId()
  const listRef = useRef<HTMLDivElement>(null)
  const workflowPaneScrollRef = useRef<HTMLDivElement>(null)
  const splitGridRef = useRef<HTMLDivElement>(null)
  /** After `open()`, loading state resets subview — apply endorsements when pane is `ready`. */
  const pendingPolicyDetailSubviewRef = useRef<"detail" | "endorsements" | null>(null)
  const [splitResizeActive, setSplitResizeActive] = useState(false)
  const splitGripHoverBridgeRef = useRef<ReturnType<typeof setTimeout> | null>(null)
  const [leftCompanionHovered, setLeftCompanionHovered] = useState(false)
  const [leftCompanionFocusWithin, setLeftCompanionFocusWithin] = useState(false)
  const [splitGripHovered, setSplitGripHovered] = useState(false)

  const [helloSplitLeftPct, setHelloSplitLeftPct] = useState(HELLO_SPLIT_LEFT_DEFAULT_PCT)
  const [policyDetailSubview, setPolicyDetailSubview] = useState<"detail" | "endorsements">("detail")

  const openerVehicleLabel = raiseClaimPolicy ? helloRaiseClaimVehicleLabel(raiseClaimPolicy) : "your vehicle"

  const [openingTyping, setOpeningTyping] = useState(!isClaimStatusMode)
  const [openingVisible, setOpeningVisible] = useState(false)
  const [choicesRevealTyping, setChoicesRevealTyping] = useState(false)
  const [choicesVisible, setChoicesVisible] = useState(false)

  const [csIntroTyping, setCsIntroTyping] = useState(isClaimStatusMode)
  const [csShowB1, setCsShowB1] = useState(false)
  const [csTypingB12, setCsTypingB12] = useState(false)
  const [csShowB2, setCsShowB2] = useState(false)
  const [csTypingB23, setCsTypingB23] = useState(false)
  const [csShowB3, setCsShowB3] = useState(false)
  const [csTypingBeforeChoices, setCsTypingBeforeChoices] = useState(false)
  const [csChoicesVisible, setCsChoicesVisible] = useState(false)
  const [claimStatusPreviousActivityVisible, setClaimStatusPreviousActivityVisible] =
    useState(false)
  const [claimStatusWorkflow, setClaimStatusWorkflow] = useState<{
    view: ClaimStatusWorkflowView
  } | null>(null)
  const [spentOfferIds, setSpentOfferIds] = useState<Set<string>>(() => new Set())
  const [messages, setMessages] = useState<HelloChatMessage[]>([])
  const [composerText, setComposerText] = useState("")
  const [workflowActive, setWorkflowActive] = useState(false)
  
  // Autocomplete suggestions state
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestionIndex, setSelectedSuggestionIndex] = useState(-1)
  const composerRef = useRef<HTMLTextAreaElement>(null)
  
  // Manual action trigger for specific autocomplete suggestions
  const [manualActionTrigger, setManualActionTrigger] = useState<{ actionId: string; nonce: number } | null>(null)
  
  // State for triggering self-serve steps tabs from chat choices
  const [selfServeTabTrigger, setSelfServeTabTrigger] = useState<{ stepType: string; title: string; nonce: number } | null>(null)
  
  // Helper function to create self-serve steps tabs
  const createSelfServeStepsTab = useCallback((stepType: string, title: string) => {
    setSelfServeTabTrigger({ 
      stepType, 
      title, 
      nonce: Date.now() 
    })
  }, [])

  // Helper function to trigger manual actions in the right sidebar
  const triggerManualAction = useCallback((actionId: string) => {
    setManualActionTrigger({ actionId, nonce: Date.now() })
  }, [])
  
  const [selfServeStepsActive, setSelfServeStepsActive] = useState(false)
  const [selfServeStepsType, setSelfServeStepsType] = useState<"raise_claim" | "edit_policy" | null>(null)
  const [selfServeStepsEditKind, setSelfServeStepsEditKind] = useState<EndorsementEditKind | null>(null)
  const policyDetailPane = useHelloPolicyDetailPane()
  /** Shimmer mask phases on the right pane when the split opens */
  const [workflowShimmerPhase, setWorkflowShimmerPhase] = useState<"hidden" | "show" | "hide">(
    "hidden",
  )
  /** Typing dots before delayed assistant lines (composer, picks, workflow bridge, RC ack). */
  const [replyTyping, setReplyTyping] = useState(false)
  /** Policy targeted by composer “Edit Policy” flow (set before offer bubble or after multi-policy pick). */
  const [editFlowPolicy, setEditFlowPolicy] = useState<Policy | null>(null)
  /** Field to update — Classic `edit_pick` → `mode_pick` (after policy is known). */
  const [editFlowKind, setEditFlowKind] = useState<EndorsementEditKind | null>(null)
  const [editPolicyWorkflow, setEditPolicyWorkflow] = useState<{
    policy: Policy
    editKind: EndorsementEditKind
  } | null>(null)

  /** Policy chosen from profile-bar radios for Raise Claim workflow (defaults to journey prop). */
  const [activeWorkflowPolicy, setActiveWorkflowPolicy] = useState<Policy | null>(null)
  /** Track if we're viewing a completed workflow (read-only mode) */
  const [viewingCompletedWorkflow, setViewingCompletedWorkflow] = useState(false)


  const ribbonAckCleanupRef = useRef<(() => void) | null>(null)
  const [nonPolicyRibbonPane, setNonPolicyRibbonPane] = useState<HelloProfileNonPolicyRibbonActionId | null>(null)

  /** Right sidebar state - always present but collapsed by default */
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true)
  const [rightSidebarActiveSection, setRightSidebarActiveSection] = useState<"manual-actions" | "ai" | null>(null)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() => Math.round(window.innerWidth * 0.3))

  /** Mode switching state */
  const [isManualMode, setIsManualMode] = useState(false)
  const [showSkeletonLoader, setShowSkeletonLoader] = useState(false)

  /** Agentic workflow state */
  const [agenticIntent, setAgenticIntent] = useState<AgenticIntent | null>(null)

  // Available suggestions for autocomplete
  const availableSuggestions = [
    { id: "edit_policy", label: "Edit policy", description: "Make changes to policy details", icon: Edit3 },
    { id: "raise_claim", label: "Raise a claim", description: "Start a new claim process", icon: Shield },
    { id: "send_policy_document", label: "Send policy document", description: "Share policy documents with customer", icon: FileText },
    { id: "cancel_policy", label: "Cancel policy", description: "Cancel or terminate policy", icon: XCircle },
    { id: "payment_history", label: "Payment history", description: "View payment records", icon: CreditCard },
    { id: "communication_history", label: "Communication history", description: "View past interactions", icon: MessageCircle },
    { id: "transfer_call", label: "Transfer call", description: "Transfer call to another agent", icon: Phone },
    { id: "active_issues", label: "Active issues", description: "View ongoing policy issues", icon: AlertCircle },
  ]

  // Filter suggestions based on input text
  const filteredSuggestions = composerText.trim().length === 0 
    ? availableSuggestions 
    : availableSuggestions.filter(suggestion =>
        suggestion.label.toLowerCase().includes(composerText.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(composerText.toLowerCase())
      )

  useEffect(() => () => {
    ribbonAckCleanupRef.current?.()
    ribbonAckCleanupRef.current = null
  }, [])

  const editPolicySuccessPushedRef = useRef(false)
  const prevEditPolicyWorkflowRef = useRef<typeof editPolicyWorkflow>(null)

  useEffect(() => {
    if (editPolicyWorkflow && !prevEditPolicyWorkflowRef.current) {
      editPolicySuccessPushedRef.current = false
    }
    prevEditPolicyWorkflowRef.current = editPolicyWorkflow
  }, [editPolicyWorkflow])

  // Disable the old split logic - all workflow content now goes in right sidebar
  const rightPaneSplit = false

  const claimWorkflowPolicy = activeWorkflowPolicy ?? raiseClaimPolicy

  const clampSplitLeftPct = useCallback((pct: number) => {
    return Math.min(HELLO_SPLIT_LEFT_MAX_PCT, Math.max(HELLO_SPLIT_LEFT_MIN_PCT, pct))
  }, [])

  const clearSplitGripHoverBridge = useCallback(() => {
    if (splitGripHoverBridgeRef.current) {
      clearTimeout(splitGripHoverBridgeRef.current)
      splitGripHoverBridgeRef.current = null
    }
  }, [])

  const onCompanionMouseEnter = useCallback(() => {
    clearSplitGripHoverBridge()
    setLeftCompanionHovered(true)
  }, [clearSplitGripHoverBridge])

  const onCompanionMouseLeave = useCallback(() => {
    clearSplitGripHoverBridge()
    splitGripHoverBridgeRef.current = window.setTimeout(() => {
      setLeftCompanionHovered(false)
    }, HELLO_SPLIT_GRIP_HOVER_BRIDGE_MS)
  }, [clearSplitGripHoverBridge])

  const onCompanionFocusCapture = useCallback(() => {
    setLeftCompanionFocusWithin(true)
  }, [])

  const onCompanionBlurCapture = useCallback((e: FocusEvent<HTMLDivElement>) => {
    const next = e.relatedTarget
    if (next instanceof Node && e.currentTarget.contains(next)) return
    setLeftCompanionFocusWithin(false)
  }, [])

  const onSplitGripEnter = useCallback(() => {
    clearSplitGripHoverBridge()
    setSplitGripHovered(true)
  }, [clearSplitGripHoverBridge])

  const onSplitGripLeave = useCallback(() => {
    setSplitGripHovered(false)
  }, [])

  const handleSplitMouseDown = useCallback((e: MouseEvent<HTMLDivElement>) => {
    e.preventDefault()
    setSplitResizeActive(true)
  }, [])

  useEffect(() => {
    if (!splitResizeActive) return

    const onMove = (e: globalThis.MouseEvent) => {
      const grid = splitGridRef.current
      if (!grid) return
      const r = grid.getBoundingClientRect()
      const w = Math.max(1, r.width)
      setHelloSplitLeftPct(clampSplitLeftPct(((e.clientX - r.left) / w) * 100))
    }
    const onUp = () => setSplitResizeActive(false)

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
  }, [splitResizeActive, clampSplitLeftPct])

  useEffect(() => {
    return () => clearSplitGripHoverBridge()
  }, [clearSplitGripHoverBridge])

  useEffect(() => {
    if (!rightPaneSplit) {
      setSplitResizeActive(false)
      setHelloSplitLeftPct(HELLO_SPLIT_LEFT_DEFAULT_PCT)
      setSplitGripHovered(false)
      setLeftCompanionHovered(false)
      setLeftCompanionFocusWithin(false)
      clearSplitGripHoverBridge()
    }
  }, [rightPaneSplit, clearSplitGripHoverBridge])

  useEffect(() => {
    const mode = policyDetailPane.pane.mode
    if (mode === "closed") {
      pendingPolicyDetailSubviewRef.current = null
      setPolicyDetailSubview("detail")
      return
    }
    if (mode === "ready" && pendingPolicyDetailSubviewRef.current) {
      setPolicyDetailSubview(pendingPolicyDetailSubviewRef.current)
      pendingPolicyDetailSubviewRef.current = null
      return
    }
    if (mode === "loading" && !pendingPolicyDetailSubviewRef.current) {
      setPolicyDetailSubview("detail")
    }
  }, [policyDetailPane.pane.mode])

  const pushAssistant = (body: HelloAssistantBody) => {
    const id = `hello-a-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setMessages((prev) => [...prev, { id, role: "assistant", body }])
  }

  const handleRightSidebarToggle = () => {
    setRightSidebarCollapsed(!rightSidebarCollapsed)
    // If expanding, default to the AI section if a workflow is active
    if (
      rightSidebarCollapsed &&
      (workflowActive || editPolicyWorkflow || selfServeStepsActive || claimStatusWorkflow)
    ) {
      setRightSidebarActiveSection("ai")
    }
  }

  const handleRightSidebarSectionChange = (section: "manual-actions" | "ai" | null) => {
    setRightSidebarActiveSection(section)
  }

  const handleModeToggle = () => {
    // Show skeleton loader
    setShowSkeletonLoader(true)
    setRightSidebarCollapsed(false) // Ensure sidebar is open
    
    // After 2 seconds, switch the mode and hide skeleton loader
    setTimeout(() => {
      setIsManualMode(!isManualMode)
      setShowSkeletonLoader(false)
      
      // Set appropriate section based on mode
      if (!isManualMode) {
        // Switching to manual mode
        setRightSidebarActiveSection("manual-actions")
      } else {
        // Switching to AI mode
        setRightSidebarActiveSection("ai")
      }
    }, 2000)
  }

  const handleAgenticWorkflowTrigger = (intent: AgenticIntent, chatResponse: string) => {
    // Add the AI response to chat
    pushAssistant({ kind: "text", text: chatResponse })
    
    // Set the agentic intent to trigger the workflow
    setAgenticIntent(intent)
    
    // Ensure right sidebar is open and on AI section
    setRightSidebarCollapsed(false)
    setRightSidebarActiveSection("ai")
  }

  const handleAgenticIntentProcessed = () => {
    // Clear the intent after it's been processed
    setAgenticIntent(null)
  }

  const handlePolicyAction = ({ 
    policy, 
    action, 
    editKind 
  }: { 
    policy: Policy; 
    action: string; 
    editKind: EndorsementEditKind | null;
  }) => {
    // Generate a unique offer ID for this manual action
    const offerId = `manual-${action}-${Date.now()}`
    
    // Create user echo label
    const policyLabel = policy.vehicle || policy.name || policy.planDisplayName || "Policy"
    const actionLabel = action === "raise_claim" ? "Raise Claim" : "Edit Policy"
    const userEchoLabel = `${actionLabel} for ${policyLabel}`
    
    // Call the existing handler
    handleHelloPolicyBarAction(action as any, policy, offerId, userEchoLabel)
  }

  const handleHelloPolicyBarAction = (
    actionKey: HelloPolicyBarActionKey,
    policy: Policy,
    offerId: string,
    userEchoLabel: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))

    setMessages((prev) => [
      ...prev,
      { id: `hello-user-policy-bar-${Date.now()}`, role: "user", text: userEchoLabel },
    ])

    if (actionKey === "raise_claim") {
      setActiveWorkflowPolicy(policy)
      setEditPolicyWorkflow(null)
      policyDetailPane.close()
      setWorkflowActive(true)
      return
    }

    if (actionKey === "edit_policy") {
      setActiveWorkflowPolicy(null)
      policyDetailPane.close()
      setWorkflowActive(false)
      setEditFlowPolicy(policy)
      setEditFlowKind(null)
      window.setTimeout(() => {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({
            kind: "edit_policy_edit_pick",
            offerId: `policy-bar-edit-field-${Date.now()}`,
          })
        }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
      }, HELLO_BOT_REPLY_AFTER_USER_MS)
    }
  }

  useEffect(() => {
    if (isClaimStatusMode) return

    const timeouts: number[] = []
    let cancelled = false
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(window.setTimeout(fn, ms))
    }

    schedule(() => {
      if (cancelled) return
      setOpeningTyping(false)
      setOpeningVisible(true)
      schedule(() => {
        if (cancelled) return
        setChoicesRevealTyping(true)
        schedule(() => {
          if (cancelled) return
          setChoicesRevealTyping(false)
          setChoicesVisible(true)
        }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
      }, HELLO_RAISE_CLAIM_GAP_BEFORE_CHOICES_MS)
    }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)

    return () => {
      cancelled = true
      timeouts.forEach((t) => window.clearTimeout(t))
    }
  }, [isClaimStatusMode])

  useEffect(() => {
    if (!isClaimStatusMode || !claimStatusJtbd) return

    let cancelled = false
    const timeouts: ReturnType<typeof setTimeout>[] = []
    const schedule = (fn: () => void, ms: number) => {
      timeouts.push(
        setTimeout(() => {
          if (!cancelled) fn()
        }, ms),
      )
    }

    const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
    const pauseMs = HELLO_BOT_REPLY_AFTER_USER_MS

    schedule(() => {
      setCsIntroTyping(false)
      setCsShowB1(true)
    }, typingMs)

    const t1 = typingMs + pauseMs
    schedule(() => setCsTypingB12(true), t1)
    schedule(() => {
      setCsTypingB12(false)
      setCsShowB2(true)
    }, t1 + typingMs)

    const t2 = t1 + typingMs + pauseMs
    schedule(() => setCsTypingB23(true), t2)
    schedule(() => {
      setCsTypingB23(false)
      setCsShowB3(true)
    }, t2 + typingMs)

    const t3 = t2 + typingMs + pauseMs
    schedule(() => setCsTypingBeforeChoices(true), t3)
    schedule(() => {
      setCsTypingBeforeChoices(false)
      setCsChoicesVisible(true)
    }, t3 + typingMs)

    return () => {
      cancelled = true
      timeouts.forEach((t) => clearTimeout(t))
    }
  }, [isClaimStatusMode, claimStatusJtbd])

  useEffect(() => {
    if (!workflowActive && !editPolicyWorkflow) {
      setWorkflowShimmerPhase("hidden")
      return
    }
    setWorkflowShimmerPhase("show")
    const toHide = window.setTimeout(() => {
      setWorkflowShimmerPhase("hide")
    }, HELLO_WORKFLOW_PANE_SHIMMER_HOLD_MS)
    const toRemove = window.setTimeout(() => {
      setWorkflowShimmerPhase("hidden")
    }, HELLO_WORKFLOW_PANE_SHIMMER_HOLD_MS + HELLO_WORKFLOW_PANE_SHIMMER_FADE_MS)
    return () => {
      window.clearTimeout(toHide)
      window.clearTimeout(toRemove)
    }
  }, [workflowActive, editPolicyWorkflow])

  // Expand right sidebar and set AI section when workflows are active
  useEffect(() => {
    if (
      workflowActive ||
      editPolicyWorkflow ||
      selfServeStepsActive ||
      claimStatusWorkflow
    ) {
      setRightSidebarCollapsed(false)
      setRightSidebarActiveSection("ai")
    }
  }, [workflowActive, editPolicyWorkflow, selfServeStepsActive, claimStatusWorkflow])

  const handleRevealClaimStatusPreviousActivity = useCallback(() => {
    const el = listRef.current
    if (!el) {
      setClaimStatusPreviousActivityVisible(true)
      return
    }
    const prevScrollHeight = el.scrollHeight
    const prevScrollTop = el.scrollTop
    setClaimStatusPreviousActivityVisible(true)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => {
        el.scrollTop = prevScrollTop + (el.scrollHeight - prevScrollHeight)
      })
    })
  }, [])

  useEffect(() => {
    const el = listRef.current
    if (!el) return
    if (claimStatusPreviousActivityVisible) return
    // Keep the “View previous activity” pill in view — do not pin claim-status intro to the bottom.
    if (isClaimStatusMode && !claimStatusPreviousActivityVisible) return
    el.scrollTop = el.scrollHeight
  }, [
    openingTyping,
    openingVisible,
    choicesRevealTyping,
    messages,
    choicesVisible,
    spentOfferIds,
    workflowActive,
    editPolicyWorkflow,
    policyDetailPane.pane,
    replyTyping,
    workflowShimmerPhase,
    nonPolicyRibbonPane,
    csIntroTyping,
    csShowB1,
    csTypingB12,
    csShowB2,
    csTypingB23,
    csShowB3,
    csTypingBeforeChoices,
    csChoicesVisible,
    claimStatusWorkflow,
    claimStatusPreviousActivityVisible,
    isClaimStatusMode,
  ])

  const handleClaimStatusPick = useCallback(
    (key: HelloClaimStatusChoiceId, userEchoLabel: string) => {
      if (spentOfferIds.has(HELLO_CLAIM_STATUS_FLOW_OFFER_ID) || !claimStatusJtbd) return
      setSpentOfferIds((prev) => new Set(prev).add(HELLO_CLAIM_STATUS_FLOW_OFFER_ID))

      setMessages((prev) => [
        ...prev,
        { id: `claim-status-user-${Date.now()}`, role: "user", text: userEchoLabel },
      ])

      const policy = raiseClaimPolicy ?? activePolicies[0]
      if (!policy) return

      if (key === "escalate_f_ops") {
        setClaimStatusWorkflow({ view: "escalate" })
        onHelloToast?.(HELLO_CLAIM_STATUS_ESCALATE_TOAST)
      } else if (key === "view_communication_history") {
        setClaimStatusWorkflow({ view: "communication_history" })
      } else if (key === "view_claim_status_timeline" || key === "something_else") {
        setClaimStatusWorkflow({ view: "timeline" })
      }

      const assistantText =
        key === "escalate_f_ops"
          ? "Opening the F-ops escalation workspace on the right."
          : key === "view_communication_history"
            ? "Opening communication history on the right."
            : key === "view_claim_status_timeline"
              ? "Opening the claim status timeline on the right."
              : "Opening the claim status workspace on the right — you can review the timeline there."

      window.setTimeout(() => {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "text", text: assistantText })
        }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
      }, HELLO_BOT_REPLY_AFTER_USER_MS)
    },
    [
      activePolicies,
      claimStatusJtbd,
      onHelloToast,
      pushAssistant,
      raiseClaimPolicy,
      spentOfferIds,
    ],
  )

  const handleClaimStatusEscalationDone = useCallback(() => {
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        setMessages((prev) => [
          ...prev,
          {
            id: `escalation-success-${Date.now()}`,
            role: "assistant",
            body: { kind: "text", text: helloFopsEscalationSuccessHeadline },
          },
        ])
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, 300)
  }, [])

  const handleOpeningPick = (
    choiceId: HelloRaiseClaimChoiceId,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))

    setMessages((prev) => [
      ...prev,
      { id: `hello-user-pick-${Date.now()}`, role: "user", text: userEchoLabel },
    ])

    window.setTimeout(() => {
      if (choiceId === "self_serve") {
        const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
        const readMs = HELLO_SELF_SERVE_READ_PAUSE_MS
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "self_serve_tip" })
          window.setTimeout(() => {
            setReplyTyping(true)
            window.setTimeout(() => {
              setReplyTyping(false)
              pushAssistant({ kind: "text", text: "Opening the customer steps guide on the right." })
              window.setTimeout(() => {
                policyDetailPane.close()
                setWorkflowActive(false)
                setActiveWorkflowPolicy(null)
                setEditPolicyWorkflow(null)
                setSelfServeStepsType("raise_claim")
                setSelfServeStepsEditKind(null)
                setSelfServeStepsActive(true)
              }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
            }, typingMs)
          }, readMs)
        }, typingMs)
        return
      }

      if (choiceId === "something_else") {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "text", text: helloSomethingElseAckComposerAlways })
        }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
        return
      }

      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "text", text: helloSureCreatingWorkflowAck })
        window.setTimeout(() => {
          setReplyTyping(true)
          window.setTimeout(() => {
            setReplyTyping(false)
            pushAssistant({ kind: "agent_behalf_network_garage" })
            window.setTimeout(() => {
              policyDetailPane.close()
              setEditPolicyWorkflow(null)
              setWorkflowActive(true)
              setRightSidebarCollapsed(false)
              setRightSidebarActiveSection("ai")
            }, 1000)
          }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
        }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerEditPolicyPolicyPick = (
    policyId: string,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    const policy = activePolicies.find((p) => p.id === policyId)
    if (!policy) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))
    setEditFlowPolicy(policy)
    setEditFlowKind(null)
    setMessages((prev) => [
      ...prev,
      { id: `hello-user-edit-policy-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({
          kind: "edit_policy_edit_pick",
          offerId: `composer-edit-field-${Date.now()}`,
        })
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerEditPolicyEditKindPick = (
    editKind: EndorsementEditKind,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    const policy = editFlowPolicy
    if (!policy) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))
    setEditFlowKind(editKind)
    setMessages((prev) => [
      ...prev,
      { id: `hello-user-edit-field-${Date.now()}`, role: "user", text: userEchoLabel },
    ])
    const policyHead = formatEndorsementPolicyRadioLabel(policy).split("\n")[0]
    const introText = helloEditPolicyModePickMessage({
      policyHead,
      editPhrase: editKindToShortCopyHint(editKind),
      customerFirstName: customerFirstNameOrFull(customer.name),
    })
    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({
          kind: "edit_policy_mode_offer",
          offerId: `composer-edit-mode-${Date.now()}`,
          introText,
        })
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerEditPolicyModePick = (
    choiceId: HelloEditPolicyModeChoiceId,
    userEchoLabel: string,
    offerId: string,
  ) => {
    if (spentOfferIds.has(offerId)) return
    const policy = editFlowPolicy
    const kind = editFlowKind
    if (!policy || !kind) return
    setSpentOfferIds((prev) => new Set(prev).add(offerId))
    setMessages((prev) => [
      ...prev,
      { id: `hello-user-edit-pick-${Date.now()}`, role: "user", text: userEchoLabel },
    ])

    const typingMs = HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS
    const readMs = HELLO_SELF_SERVE_READ_PAUSE_MS

    window.setTimeout(() => {
      if (choiceId === "self_serve") {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "edit_policy_self_serve_tip", editField: kind })
          window.setTimeout(() => {
            setReplyTyping(true)
            window.setTimeout(() => {
              setReplyTyping(false)
              pushAssistant({ kind: "text", text: "Opening the customer steps guide on the right." })
              window.setTimeout(() => {
                policyDetailPane.close()
                setWorkflowActive(false)
                setActiveWorkflowPolicy(null)
                setEditPolicyWorkflow(null)
                setSelfServeStepsType("edit_policy")
                setSelfServeStepsEditKind(kind)
                setSelfServeStepsActive(true)
              }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
            }, typingMs)
          }, readMs)
        }, typingMs)
        return
      }

      const advisorScript = helloEditPolicyAdvisorScriptForKind(kind)

      if (kind === "policy_holder_name") {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({ kind: "text", text: helloEditPolicySureAck })
          window.setTimeout(() => {
            setReplyTyping(true)
            window.setTimeout(() => {
              setReplyTyping(false)
              pushAssistant({ kind: "text", text: helloEditPolicyPolicyholderNameRcTellCustomer })
              window.setTimeout(() => {
                policyDetailPane.close()
                setWorkflowActive(false)
                setEditPolicyWorkflow({ policy, editKind: kind })
              }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
            }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
          }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
        }, typingMs)
        return
      }

      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "text", text: helloEditPolicySureAck })
        window.setTimeout(() => {
          setReplyTyping(true)
          window.setTimeout(() => {
            setReplyTyping(false)
            pushAssistant({ kind: "text", text: advisorScript })
            window.setTimeout(() => {
              policyDetailPane.close()
              setWorkflowActive(false)
              setEditPolicyWorkflow({ policy, editKind: kind })
            }, HELLO_WORKFLOW_SPLIT_AFTER_ACK_MS)
          }, HELLO_SECOND_ACK_TYPING_INDICATOR_MS)
        }, HELLO_AGENT_BEHALF_PAUSE_AFTER_FIRST_ACK_MS)
      }, typingMs)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleRcEmailSentFromWorkflow = () => {
    onHelloToast?.("Your email has been queued for delivery.")
  }

  const handleEditPolicyWorkflowComplete = () => {
    if (editPolicySuccessPushedRef.current) return
    editPolicySuccessPushedRef.current = true
    window.setTimeout(() => {
      setEditPolicyWorkflow(null)
      setWorkflowActive(false)
      policyDetailPane.close()
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "edit_policy_workflow_success" })
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS)
  }

  const handleViewCompletedWorkflow = () => {
    if (claimWorkflowPolicy) {
      setActiveWorkflowPolicy(claimWorkflowPolicy)
      setWorkflowActive(true)
      setViewingCompletedWorkflow(true)
      setRightSidebarCollapsed(false)
      setRightSidebarActiveSection("ai")
    }
  }

  const handleFnolCompleteFromWorkflow = () => {
    const renewalNudge =
      renewalNudgeAfterClaim === undefined ? helloDefaultRenewalNudgeAfterClaim : renewalNudgeAfterClaim

    window.setTimeout(() => {
      setWorkflowActive(false)
      setViewingCompletedWorkflow(false)
      policyDetailPane.close()
      setRightSidebarCollapsed(true)
      setRightSidebarActiveSection(null)
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        pushAssistant({ kind: "claim_raised_success" })

        if (!renewalNudge) return

        window.setTimeout(() => {
          setReplyTyping(true)
          window.setTimeout(() => {
            setReplyTyping(false)
            pushAssistant({
              kind: "renewal_reminder",
              vehicleLabel: renewalNudge.vehicleLabel,
              daysLeft: renewalNudge.daysLeft,
            })
          }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
        }, HELLO_RENEWAL_NUDGE_AFTER_SUCCESS_MS)
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS)
  }

  const handleSuggestionSelect = (suggestion: typeof availableSuggestions[0]) => {
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    
    // Handle specific suggestions that should open panels directly
    if (suggestion.id === "payment_history" || suggestion.id === "communication_history" || suggestion.id === "active_issues") {
      // Add user message to chat
      setMessages((prev) => [...prev, { id: `hello-user-suggestion-${Date.now()}`, role: "user", text: suggestion.label }])
      
      let aiMessage = ""
      let actionId = ""
      
      if (suggestion.id === "payment_history") {
        aiMessage = "As requested, opening Payment history for you."
        actionId = "payment-history"
      } else if (suggestion.id === "communication_history") {
        aiMessage = "As requested, opening Communication history for you."
        actionId = "communication-history"
      } else if (suggestion.id === "active_issues") {
        aiMessage = "As requested, opening Active issues and verification logs for you."
        actionId = "kyc-verification"
      }
      
      // AI acknowledges and then opens the panel
      setTimeout(() => {
        setReplyTyping(true)
        setTimeout(() => {
          setReplyTyping(false)
          pushAssistant({
            kind: "text",
            text: aiMessage
          })
          
          // After 1 second, open the panel
          setTimeout(() => {
            setRightSidebarCollapsed(false)
            setRightSidebarActiveSection("manual-actions")
            // Trigger the manual action
            triggerManualAction(actionId)
          }, 1000)
          
        }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
      }, HELLO_BOT_REPLY_AFTER_USER_MS)
      
      // Clear the input for these direct actions
      setComposerText("")
      
    } else {
      // For other suggestions (edit policy, raise claim, etc.), immediately send the message
      // Clear the input first
      setComposerText("")
      
      // Add user message to chat immediately
      setMessages((prev) => [...prev, { id: `hello-user-suggestion-${Date.now()}`, role: "user", text: suggestion.label }])

      // Check if message should trigger agentic workflow
      const wasHandledByAgentic = handleChatMessageWithAgentic(
        suggestion.label,
        handleAgenticWorkflowTrigger
      )

      // If agentic system handled it, don't process with normal chat flow
      if (wasHandledByAgentic) {
        return
      }

      // Process with normal chat flow
      window.setTimeout(() => {
        setReplyTyping(true)
        window.setTimeout(() => {
          setReplyTyping(false)
          if (helloComposerTriggersEditPolicyOffer(suggestion.label)) {
            if (activePolicies.length === 0) {
              pushAssistant({
                kind: "text",
                text: "No active policy is available to edit right now.",
              })
              return
            }
            if (activePolicies.length >= 2) {
              setEditFlowPolicy(null)
              setEditFlowKind(null)
              pushAssistant({
                kind: "edit_policy_policy_pick",
                offerId: `suggestion-edit-pick-${Date.now()}`,
              })
            } else {
              setEditFlowPolicy(activePolicies[0]!)
              setEditFlowKind(null)
              pushAssistant({
                kind: "edit_policy_edit_pick",
                offerId: `suggestion-edit-field-${Date.now()}`,
              })
            }
            return
          }
          if (helloComposerTriggersRaiseClaimOffer(suggestion.label)) {
            const offerId = `suggestion-offer-${Date.now()}`
            
            // Check if this is a generic search without specific policy context
            if (!raiseClaimPolicy || suggestion.label.toLowerCase().trim() === "raise a claim") {
              pushAssistant({ kind: "raise_claim_policy_select", offerId })
            } else {
              pushAssistant({ kind: "raise_claim_offer", offerId })
            }
            return
          }
          pushAssistant({ kind: "text", text: helloFreeTextAckStub })
        }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
      }, HELLO_BOT_REPLY_AFTER_USER_MS)
    }
  }

  const handleComposerChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setComposerText(value)
    
    // Show suggestions if user is typing and there are matches
    if (value.trim().length > 0) {
      const matches = availableSuggestions.filter(suggestion =>
        suggestion.label.toLowerCase().includes(value.toLowerCase()) ||
        suggestion.description.toLowerCase().includes(value.toLowerCase())
      )
      setShowSuggestions(matches.length > 0)
      setSelectedSuggestionIndex(-1)
    } else {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }
  }

  const handleComposerFocus = () => {
    // Show all suggestions when focused if input is empty, or filtered suggestions if there's text
    if (composerText.trim().length === 0) {
      setShowSuggestions(true)
    } else if (filteredSuggestions.length > 0) {
      setShowSuggestions(true)
    }
  }

  const handleComposerBlur = (e: React.FocusEvent<HTMLTextAreaElement>) => {
    // Delay hiding suggestions to allow clicking on them
    setTimeout(() => {
      setShowSuggestions(false)
      setSelectedSuggestionIndex(-1)
    }, 150)
  }

  const handleSendComposer = () => {
    const trimmed = composerText.trim()
    if (!trimmed) return
    
    // Hide suggestions
    setShowSuggestions(false)
    setSelectedSuggestionIndex(-1)
    
    // Add user message to chat
    setMessages((prev) => [...prev, { id: `hello-user-${Date.now()}`, role: "user", text: trimmed }])
    setComposerText("")

    // Check if message should trigger agentic workflow
    const wasHandledByAgentic = handleChatMessageWithAgentic(
      trimmed,
      handleAgenticWorkflowTrigger
    )

    // If agentic system handled it, don't process with normal chat flow
    if (wasHandledByAgentic) {
      return
    }

    window.setTimeout(() => {
      setReplyTyping(true)
      window.setTimeout(() => {
        setReplyTyping(false)
        if (helloComposerTriggersEditPolicyOffer(trimmed)) {
          if (activePolicies.length === 0) {
            pushAssistant({
              kind: "text",
              text: "No active policy is available to edit right now.",
            })
            return
          }
          if (activePolicies.length >= 2) {
            setEditFlowPolicy(null)
            setEditFlowKind(null)
            pushAssistant({
              kind: "edit_policy_policy_pick",
              offerId: `composer-edit-pick-${Date.now()}`,
            })
          } else {
            setEditFlowPolicy(activePolicies[0]!)
            setEditFlowKind(null)
            pushAssistant({
              kind: "edit_policy_edit_pick",
              offerId: `composer-edit-field-${Date.now()}`,
            })
          }
          return
        }
        if (helloComposerTriggersRaiseClaimOffer(trimmed)) {
          const offerId = `composer-offer-${Date.now()}`
          
          // Check if this is a generic search without specific policy context
          // This happens when user searches "raise a claim" without a specific policy
          if (!raiseClaimPolicy || trimmed.toLowerCase().trim() === "raise a claim") {
            pushAssistant({ kind: "raise_claim_policy_select", offerId })
          } else {
            pushAssistant({ kind: "raise_claim_offer", offerId })
          }
          return
        }
        pushAssistant({ kind: "text", text: helloFreeTextAckStub })
      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
    }, HELLO_BOT_REPLY_AFTER_USER_MS)
  }

  const handleComposerKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    // Handle suggestions navigation
    if (showSuggestions && filteredSuggestions.length > 0) {
      if (e.key === "ArrowDown") {
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev < filteredSuggestions.length - 1 ? prev + 1 : 0
        )
        return
      }
      if (e.key === "ArrowUp") {
        e.preventDefault()
        setSelectedSuggestionIndex(prev => 
          prev > 0 ? prev - 1 : filteredSuggestions.length - 1
        )
        return
      }
      if (e.key === "Tab" && selectedSuggestionIndex >= 0) {
        e.preventDefault()
        handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex])
        return
      }
      if (e.key === "Escape") {
        e.preventDefault()
        setShowSuggestions(false)
        setSelectedSuggestionIndex(-1)
        return
      }
    }

    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      if (showSuggestions && selectedSuggestionIndex >= 0) {
        handleSuggestionSelect(filteredSuggestions[selectedSuggestionIndex])
      } else {
        handleSendComposer()
      }
    }
  }

  const renderAssistantBody = (body: HelloAssistantBody) => {
    switch (body.kind) {
      case "text":
        return (
          <p className="whitespace-pre-line font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            {body.text}
          </p>
        )
      case "agent_behalf_network_garage":
        return (
          <div className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
            <p>
              Meanwhile, you should inform the customer about{" "}
              <span className="font-bold">benefits</span>
              {" "}
              of giving your vehicle at the{" "}
              <span className="font-bold">Network Garage</span>:
            </p>
            <p className="mt-3 whitespace-pre-line">{helloAgentBehalfNetworkGarageBulletsJoined()}</p>
          </div>
        )
      case "claim_raised_success":
        return (
          <HelloClaimRaisedSuccessBody
            headline={helloClaimRaisedSuccessHeadline}
            quotedLine={helloClaimRaisedSuccessQuotedLine}
            onViewWorkflow={handleViewCompletedWorkflow}
          />
        )
      case "edit_policy_workflow_success":
        return (
          <HelloClaimRaisedSuccessBody
            headline={helloEditPolicyWorkflowSuccessHeadline}
            quotedLine={helloEditPolicyWorkflowSuccessQuotedLine}
          />
        )
      case "self_serve_tip": {
        const { lead, rc, mid, license, trail } = raiseClaimTalktrackParts
        return (
          <p className="min-w-0 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
            <span className="font-semibold text-[#5b5675]">Tip </span>
            {lead}
            <span className="font-semibold">{rc}</span>
            {mid}
            <span className="font-semibold">{license}</span>
            {trail}
          </p>
        )
      }
      case "raise_claim_offer":
        return null
      case "raise_claim_policy_select":
        return null
      case "edit_policy_policy_pick":
        return null
      case "edit_policy_edit_pick":
        return null
      case "edit_policy_mode_offer":
        return null
      case "edit_policy_self_serve_tip":
        if (body.editField === "policy_holder_name") {
          return (
            <p className="min-w-0 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
              <span className="font-semibold text-[#5b5675]">Tip </span>
              {editPolicyPolicyholderNameSelfServeTip}
            </p>
          )
        }
        return (
          <p className="min-w-0 font-euclid text-[14px] font-normal leading-6 text-[#36354c]">
            <span className="font-semibold text-[#5b5675]">Tip </span>
            {editPolicyTalktrackLead}
            <span className="font-semibold">{editPolicyTalktrackRcEmphasis}</span>
            {editPolicyTalktrackMid}
            <span className="font-semibold">{editPolicyTalktrackAdvisorEmphasis}</span>
            {editPolicyTalktrackTrail}
          </p>
        )
      case "renewal_reminder":
        return null
      case "policy_bar_detail_card":
        return null
      case "policy_bar_assistance_offer":
        return null
    }
  }

  const renderRaiseClaimAssistantMessageGroup = (
    message: HelloChatMessage & { role: "assistant" },
    streak: ReturnType<typeof createHelloChatIdentityStreak>,
  ): ReactNode => {
    const body = message.body
    if (body.kind === "policy_bar_detail_card") {
      const policy = activePolicies.find((p) => p.id === body.policyId)
      if (!policy) return null
      return (
        <div key={message.id} className="w-full min-w-0 max-w-full">
          <HelloAiBubbleCard fullWidth showIdentity={streak.nextAiBubbleShowIdentity()}>
            <HelloPolicyChatDetailCard policy={policy} />
          </HelloAiBubbleCard>
        </div>
      )
    }
    if (body.kind === "policy_bar_assistance_offer") {
      const policy = activePolicies.find((p) => p.id === body.policyId)
      if (!policy) return null
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                {HELLO_POLICY_BAR_ASSISTANCE_PROMPT}
              </p>
            </HelloAiBubbleCard>
          </div>
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={helloPolicyBarWorkflowOfferPickOptions()}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleHelloPolicyBarAction(key as HelloPolicyBarActionKey, policy, body.offerId, label)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "raise_claim_offer") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOpeningParagraph 
                vehicleLabel={openerVehicleLabel} 
                workflowType={initialWorkflowType}
                hasSpecificPolicy={!!raiseClaimPolicy}
              />
            </HelloAiBubbleCard>
          </div>
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={helloRaiseClaimChoices.map((c) => ({
                  key: c.id,
                  label: c.label,
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleOpeningPick(key as HelloRaiseClaimChoiceId, label, body.offerId)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "raise_claim_policy_select") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                <span>Which policy would you like to </span>
                <span className="font-bold">raise a claim</span>
                <span> for?</span>
              </p>
            </HelloAiBubbleCard>
          </div>
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={activePolicies.map((policy) => ({
                  key: policy.id,
                  label: `${policy.type} - ${policy.vehicle || policy.name || 'Policy'} (${policy.policyNumber})`,
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) => {
                  // Find the selected policy and set it as the raise claim policy
                  const selectedPolicy = activePolicies.find(p => p.id === key)
                  if (selectedPolicy) {
                    // Add user message to show their selection
                    setMessages((prev) => [
                      ...prev,
                      { id: `hello-user-policy-select-${Date.now()}`, role: "user", text: label },
                    ])
                    
                    // Set the selected policy as the active workflow policy
                    setActiveWorkflowPolicy(selectedPolicy)
                    setSpentOfferIds(prev => new Set(prev).add(body.offerId))
                    
                    // Now show the choice options (self-serve vs agent behalf)
                    window.setTimeout(() => {
                      setReplyTyping(true)
                      window.setTimeout(() => {
                        setReplyTyping(false)
                        pushAssistant({
                          kind: "raise_claim_offer",
                          offerId: `policy-select-choices-${Date.now()}`
                        })
                      }, HELLO_RAISE_CLAIM_TYPING_INDICATOR_MS)
                    }, HELLO_BOT_REPLY_AFTER_USER_MS)
                  }
                }}
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "edit_policy_policy_pick") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <>
                <p className="font-euclid text-[11px] font-normal normal-case text-[#5b5675] opacity-80">
                  {helloEditPolicyPolicyPickContextLabel}
                </p>
                <p className="mt-2 font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                  {helloEditPolicyPolicyPickPrompt}
                </p>
              </>
            </HelloAiBubbleCard>
          </div>
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={activePolicies.map((p) => ({
                  key: p.id,
                  label: <PolicyChatRadioContent policy={p} />,
                  userEchoLabel: formatPolicyChatRadioEcho(p),
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleComposerEditPolicyPolicyPick(key, label, body.offerId)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "edit_policy_edit_pick") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <p className="font-euclid text-[13px] font-normal leading-5 text-[#36354c]">
                {helloEditPolicyWhatToUpdatePrompt}
              </p>
            </HelloAiBubbleCard>
          </div>
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={endorsementEditRadioOptions().map((o) => ({
                  key: o.kind,
                  label: o.label,
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleComposerEditPolicyEditKindPick(key as EndorsementEditKind, label, body.offerId)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    if (body.kind === "edit_policy_mode_offer") {
      return (
        <div key={message.id} className="flex min-w-0 max-w-full flex-col gap-3 sm:gap-4">
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <p className="whitespace-pre-line font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                {body.introText}
              </p>
            </HelloAiBubbleCard>
          </div>
          <div className="min-w-0 max-w-full">
            <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
              <WorkflowOfferPick
                options={helloEditPolicyModeChoices(customerFirstNameOrFull(customer.name)).map((c) => ({
                  key: c.id,
                  label: c.label,
                }))}
                disabled={spentOfferIds.has(body.offerId)}
                onPick={(key, label) =>
                  handleComposerEditPolicyModePick(key as HelloEditPolicyModeChoiceId, label, body.offerId)
                }
              />
            </HelloAiBubbleCard>
          </div>
        </div>
      )
    }
    return (
      <div key={message.id} className="min-w-0 max-w-full">
        <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
          {renderAssistantBody(body)}
        </HelloAiBubbleCard>
      </div>
    )
  }

  const companionHeaderAndMessages = (
    <>
      <div
        ref={listRef}
        className={cn(
          "min-h-0 flex flex-1 flex-col items-start gap-3 overflow-y-auto overscroll-y-contain px-0 py-3 [scrollbar-gutter:stable] sm:py-4",
          isClaimStatusMode && !claimStatusPreviousActivityVisible && "pt-12 sm:pt-14",
        )}
        aria-live="polite"
        aria-relevant="additions text"
      >
        {displayPhone ? (
          <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
        ) : null}

        {claimStatusPreviousActivityVisible ? (
          <HelloClaimStatusPreviousActivity vehicleLabel={openerVehicleLabel} />
        ) : null}

        {(() => {
          const streak = createHelloChatIdentityStreak()
          return (
              <>
                {isClaimStatusMode && claimStatusJtbd ? (
                <>
                  {csIntroTyping ? (
                    <TypingIndicator
                      labelId={csIntroTypingLabelId}
                      showIdentity={streak.typingIndicatorShowIdentity()}
                    />
                  ) : null}
                  {csShowB1 ? (
                    <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                      <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                        Customer is calling to ask the Claim Status of their{" "}
                        <span className="font-semibold text-[#36354c]">{openerVehicleLabel}</span>.
                      </p>
                    </HelloAiBubbleCard>
                  ) : null}
                  {csTypingB12 ? (
                    <TypingIndicator
                      labelId={csTypingB12LabelId}
                      showIdentity={streak.typingIndicatorShowIdentity()}
                    />
                  ) : null}
                  {csShowB2 ? (
                    <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                      <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                        {claimStatusPreviousCxSummaryCopy(claimStatusJtbd)}
                      </p>
                    </HelloAiBubbleCard>
                  ) : null}
                  {csTypingB23 ? (
                    <TypingIndicator
                      labelId={csTypingB23LabelId}
                      showIdentity={streak.typingIndicatorShowIdentity()}
                    />
                  ) : null}
                  {csShowB3 ? (
                    <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                      <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                        Best possible action is to escalate this issue to F-ops team.
                      </p>
                    </HelloAiBubbleCard>
                  ) : null}
                  {csTypingBeforeChoices ? (
                    <TypingIndicator
                      labelId={csTypingChoicesLabelId}
                      showIdentity={streak.typingIndicatorShowIdentity()}
                    />
                  ) : null}
                  {csChoicesVisible ? (
                    <div className={helloWorkflowOfferPickShellClass}>
                      <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                        <p className="font-euclid text-[14px] font-normal leading-5 text-omni-n500">
                          {HELLO_CLAIM_STATUS_CHOICE_PROMPT}
                        </p>
                        <div className="mt-3">
                          <WorkflowOfferPick
                            options={helloClaimStatusChoices.map((c) => ({
                              key: c.id,
                              label: c.label,
                            }))}
                            disabled={spentOfferIds.has(HELLO_CLAIM_STATUS_FLOW_OFFER_ID)}
                            onPick={(key, label) =>
                              handleClaimStatusPick(key as HelloClaimStatusChoiceId, label)
                            }
                          />
                        </div>
                      </HelloAiBubbleCard>
                    </div>
                  ) : null}
                </>
              ) : null}

              {!isClaimStatusMode && openingTyping
                ? (() => {
                    const showIdentity = streak.typingIndicatorShowIdentity()
                    streak.afterAiTypingShell()
                    return <TypingIndicator labelId={typingLabelId} showIdentity={showIdentity} />
                  })()
                : null}

              {!isClaimStatusMode && openingVisible ? (
                <>
                  <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                    <WorkflowOpeningParagraph 
                      vehicleLabel={openerVehicleLabel} 
                      workflowType={initialWorkflowType}
                      hasSpecificPolicy={!!raiseClaimPolicy}
                    />
                  </HelloAiBubbleCard>
                  {choicesRevealTyping
                    ? (() => {
                        const showIdentity = streak.typingIndicatorShowIdentity()
                        streak.afterAiTypingShell()
                        return (
                          <TypingIndicator
                            labelId={choicesRevealTypingLabelId}
                            showIdentity={showIdentity}
                          />
                        )
                      })()
                    : null}
                  {choicesVisible ? (
                    <div className="min-w-0 max-w-full">
                      <HelloAiBubbleCard showIdentity={streak.nextAiBubbleShowIdentity()}>
                        <WorkflowOfferPick
                          options={helloRaiseClaimChoices.map((c) => ({
                            key: c.id,
                            label: c.label,
                          }))}
                          disabled={spentOfferIds.has(HELLO_OPENING_OFFER_ID)}
                          onPick={(key, label) =>
                            handleOpeningPick(key as HelloRaiseClaimChoiceId, label, HELLO_OPENING_OFFER_ID)
                          }
                        />
                      </HelloAiBubbleCard>
                    </div>
                  ) : null}
                </>
              ) : null}

              {messages.map((message) => {
                if (message.role === "assistant") {
                  if (message.body.kind === "renewal_reminder") {
                    streak.markAssistantBubbleSurface()
                    return (
                      <div key={message.id} className="min-w-0 max-w-full">
                        <HelloRenewalReminderCard
                          vehicleLabel={message.body.vehicleLabel}
                          daysLeft={message.body.daysLeft}
                        />
                      </div>
                    )
                  }
                  return renderRaiseClaimAssistantMessageGroup(message, streak)
                }

                return (
                  <div key={message.id} className="flex w-full min-w-0 justify-end">
                    <HelloCxBubbleCard showIdentity={streak.nextCxBubbleShowIdentity()}>
                      <p className="text-left font-euclid text-[14px] font-medium leading-5 text-white">
                        {message.text}
                      </p>
                    </HelloCxBubbleCard>
                  </div>
                )
              })}
              {replyTyping
                ? (() => {
                    const showIdentity = streak.typingIndicatorShowIdentity()
                    streak.afterAiTypingShell()
                    return <TypingIndicator labelId={replyTypingLabelId} showIdentity={showIdentity} />
                  })()
                : null}
            </>
          )
        })()}
      </div>
    </>
  )

  const companionComposer = (
    <div className="relative z-20 shrink-0 px-0 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-3">
      {/* Suggestions dropdown */}
      {showSuggestions && filteredSuggestions.length > 0 && (
        <div className="mx-auto w-full max-w-2xl min-w-0 mb-2">
          <div className="bg-white border border-[#e7e7f0] rounded-2xl shadow-lg overflow-hidden max-h-60 overflow-y-auto">
            {filteredSuggestions.map((suggestion, index) => {
              const Icon = suggestion.icon
              return (
                <button
                  key={suggestion.id}
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className={cn(
                    "w-full text-left px-4 py-3 hover:bg-[#f8f7fc] border-b border-[#e7e7f0] last:border-b-0 transition-colors",
                    selectedSuggestionIndex === index && "bg-[#f8f7fc]"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className="flex-shrink-0 w-8 h-8 bg-[#f8f7fc] rounded-lg flex items-center justify-center">
                      <Icon className="w-4 h-4 text-[#7c47e1]" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-euclid text-sm font-medium text-[#040222]">
                        {suggestion.label}
                      </div>
                      <div className="font-euclid text-xs text-[#5b5675] mt-1">
                        {suggestion.description}
                      </div>
                    </div>
                  </div>
                </button>
              )
            })}
            <div className="px-4 py-2 bg-[#fafafa] border-t border-[#e7e7f0]">
              <p className="font-euclid text-xs text-[#9c9aaf]">
                Use ↑↓ to navigate, Tab or Enter to select, Esc to close
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Single floating bar: elevated pill with inline input + send — not a separate tiny FAB */}
      <div className="mx-auto flex w-full max-w-2xl min-w-0 justify-center">
        <div
          className={cn(
            "flex w-full min-w-0 items-end gap-2 rounded-3xl border border-[#e7e7f0] bg-white py-2 pl-4 pr-2 sm:pl-5 sm:pr-1.5",
            "shadow-[0px_12px_40px_rgba(54,53,76,0.14),0px_4px_12px_rgba(54,53,76,0.06)]",
            "ring-1 ring-[#36354c]/[0.05]",
          )}
        >
          <label htmlFor="raise-claim-hello-composer" className="sr-only">
            Message as CX — {helloCxResponderName}
          </label>
          <textarea
            ref={composerRef}
            id="raise-claim-hello-composer"
            rows={1}
            value={composerText}
            onChange={handleComposerChange}
            onKeyDown={handleComposerKeyDown}
            onFocus={handleComposerFocus}
            onBlur={handleComposerBlur}
            placeholder="Type a message…"
            className={cn(
              "max-h-32 min-h-[44px] flex-1 resize-y rounded-2xl bg-white/80 py-2.5 pl-1 font-euclid text-[14px] leading-5 text-[#36354c]",
              "outline-none ring-0 placeholder:text-[#8b87a3]",
              "focus-visible:placeholder:text-[#a39eb8]",
            )}
          />
          <Button
            type="button"
            size="icon"
            onClick={handleSendComposer}
            disabled={!composerText.trim()}
            aria-label="Send message"
            className={cn(
              "mb-0.5 size-11 shrink-0 rounded-full bg-[#7c47e1] text-white shadow-md transition-[box-shadow,transform]",
              "hover:bg-[#6b3ccd] hover:shadow-lg active:scale-[0.98]",
              "disabled:pointer-events-none disabled:opacity-40",
            )}
          >
            <Send className="size-5" aria-hidden strokeWidth={2} />
          </Button>
        </div>
      </div>
    </div>
  )

  const showSplitGrip =
    rightPaneSplit &&
    (splitResizeActive ||
      splitGripHovered ||
      leftCompanionHovered ||
      leftCompanionFocusWithin)

  const aiCompanionColumn = (
    <div
      className={cn(
        "relative z-10 flex min-h-0 flex-col",
        HELLO_COMPOSER_SHADOW_CLEARANCE_CLASS,
        rightPaneSplit
          ? "min-h-0 w-full"
          : "min-h-[min(52vh,440px)] w-full lg:min-h-0",
        !rightPaneSplit && "flex-1",
      )}
      onMouseEnter={onCompanionMouseEnter}
      onMouseLeave={onCompanionMouseLeave}
      onFocusCapture={onCompanionFocusCapture}
      onBlurCapture={onCompanionBlurCapture}
    >
      {isClaimStatusMode && !claimStatusPreviousActivityVisible ? (
        <div className="pointer-events-none absolute inset-x-0 top-2 z-40 flex justify-center px-4">
          <HelloViewPreviousActivityButton
            className="pointer-events-auto"
            onClick={handleRevealClaimStatusPreviousActivity}
          />
        </div>
      ) : null}
      {companionHeaderAndMessages}
      {companionComposer}
    </div>
  )

  const policyDetailForPane =
    policyDetailPane.pane.mode === "closed" ? null : policyDetailPane.pane.policy
  const policyDetailLoading = policyDetailPane.pane.mode === "loading"
  const policyDetailHead =
    policyDetailForPane &&
    ({
      product: helloPolicyHeadingProduct(policyDetailForPane),
      number: helloPolicyHeadingNumber(policyDetailForPane),
    } as const)
  const policyDetailTitleForAria =
    policyDetailHead &&
    [policyDetailHead.product, policyDetailHead.number].filter(Boolean).join(" · ")

  return (
    <div
      data-omni-ai-surface={initialWorkflowType === "claim_status" ? "hello-claim-status" : "hello-raise-claim"}
      className={cn(
        "relative flex h-full min-h-0 w-full overflow-hidden bg-[#fafafa]",
        className,
      )}
      aria-label={initialWorkflowType === "claim_status" ? "Check claim status — Hello view" : "Raise a claim — Hello view"}
    >
      {/* Customer Profile Sidebar */}
      <CustomerProfileSidebar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
      />

      {/* Show skeleton loader during mode transition */}
      {showSkeletonLoader ? (
        <div className="flex-1 flex items-center justify-center bg-[#fafafa]">
          <div className="space-y-4 w-full max-w-2xl px-8">
            <div className="animate-pulse">
              {/* Main content skeleton */}
              <div className="bg-white rounded-xl p-6 mb-6 shadow-sm">
                <div className="h-6 bg-gray-200 rounded w-2/3 mb-4"></div>
                <div className="h-4 bg-gray-200 rounded w-full mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-4/5 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-3/5 mb-6"></div>
                
                {/* Chat message skeletons */}
                <div className="space-y-4">
                  <div className="flex justify-end">
                    <div className="h-10 bg-gray-200 rounded-2xl w-48"></div>
                  </div>
                  <div className="flex justify-start">
                    <div className="h-16 bg-gray-200 rounded-2xl w-64"></div>
                  </div>
                  <div className="flex justify-end">
                    <div className="h-8 bg-gray-200 rounded-2xl w-32"></div>
                  </div>
                </div>
              </div>
              
              {/* Right sidebar skeleton */}
              <div className="bg-white rounded-xl p-6 shadow-sm">
                <div className="h-5 bg-gray-200 rounded w-32 mb-4"></div>
                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                  <div className="h-20 bg-gray-200 rounded-lg"></div>
                </div>
                <div className="h-5 bg-gray-200 rounded w-28 mb-4"></div>
                <div className="grid grid-cols-3 gap-3">
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                  <div className="h-16 bg-gray-200 rounded-lg"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Main Content Area - Only show in AI Mode */}
          {!isManualMode && (
            <div className="flex-1 flex flex-col min-h-0">
              <div
                ref={splitGridRef}
                className={cn(
                  "relative flex min-h-0 w-full flex-1 flex-col gap-4 px-[40px] pt-5 pb-5 lg:pb-6",
                  "lg:grid lg:grid-rows-1 lg:items-stretch",
                  rightPaneSplit ? "lg:gap-5" : "lg:grid-cols-[minmax(0,1fr)_minmax(0,0fr)] lg:gap-0",
                  !splitResizeActive && helloSplitShellTransitionClass,
                )}
                style={
                  rightPaneSplit
                    ? {
                        gridTemplateColumns: `minmax(0,${helloSplitLeftPct}%) minmax(0,${100 - helloSplitLeftPct}%)`,
                      }
                    : undefined
                }
              >
                <HelloChatColumnBackground />
                {aiCompanionColumn}
                {/* Main chat content area - no more split workflow content */}
                <div className="relative z-10 min-h-0 min-w-0 overflow-hidden contents lg:block">
                  {/* All workflow content now appears in the right sidebar */}
                </div>
              </div>
            </div>
          )}

          {/* Right Sidebar - Always present at same level as other panes */}
          <RightSidebar
            isCollapsed={rightSidebarCollapsed}
            isOpen={!rightSidebarCollapsed}
            onToggle={handleRightSidebarToggle}
            activeSection={rightSidebarActiveSection}
            onSectionChange={handleRightSidebarSectionChange}
            width={rightSidebarWidth}
            onWidthChange={setRightSidebarWidth}
            // Mode switching props
            isManualMode={isManualMode}
            onModeToggle={handleModeToggle}
            workflowActive={workflowActive}
            editPolicyWorkflow={editPolicyWorkflow}
            customer={customer}
            displayPhone={displayPhone}
            claimWorkflowPolicy={claimWorkflowPolicy}
            claimStatusWorkflow={
              claimStatusWorkflow && claimStatusJtbd && claimWorkflowPolicy
                ? {
                    jtbd: claimStatusJtbd,
                    policy: claimWorkflowPolicy,
                    view: claimStatusWorkflow.view,
                  }
                : null
            }
            onClaimStatusWorkflowClose={() => setClaimStatusWorkflow(null)}
            onClaimStatusEscalationDone={handleClaimStatusEscalationDone}
            isCompletedWorkflow={viewingCompletedWorkflow}
            selfServeStepsActive={selfServeStepsActive}
            selfServeStepsType={selfServeStepsType}
            policyDetailForPane={policyDetailForPane}
            customerPolicies={activePolicies}
            onWorkflowClose={() => {
              setWorkflowActive(false)
              setActiveWorkflowPolicy(null)
              setViewingCompletedWorkflow(false)
            }}
            onEditPolicyWorkflowClose={() => setEditPolicyWorkflow(null)}
            onSelfServeStepsClose={() => setSelfServeStepsActive(false)}
            onPolicyDetailClose={() => policyDetailPane.close()}
            onRcEmailSent={handleRcEmailSentFromWorkflow}
            onFnolComplete={handleFnolCompleteFromWorkflow}
            onEditPolicyWorkflowComplete={handleEditPolicyWorkflowComplete}
            onCTAPressed={(action, policy) => {
              handlePolicyAction({
                policy,
                action,
                editKind: null,
              })
            }}
            onRCPageEmailSent={() => {
              // Callback when "Email" sent from RC Detail UI
            }}
            policyDetailSubview={policyDetailSubview}
            onPolicyDetailViewChange={(view) => {
              if (view === "endorsements") {
                setNonPolicyRibbonPane(null)
              }
              setPolicyDetailSubview(view)
            }}
            agenticIntent={agenticIntent}
            onAgenticIntentProcessed={handleAgenticIntentProcessed}
            triggerManualAction={manualActionTrigger}
            triggerSelfServeTab={selfServeTabTrigger}
          />
        </>
      )}
    </div>
  )
}
