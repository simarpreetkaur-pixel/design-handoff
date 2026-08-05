import { type ReactNode, useEffect, useId, useRef, useState } from "react"
import { Award, ChevronDown, Languages } from "lucide-react"

import { HELLO_POLICIES_PANEL_COLLAPSE_BEFORE_OPEN_MS } from "@/components/crm/hello/helloRaiseClaimCopy"
import type { HelloProfilePolicyRibbonAction } from "@/components/crm/hello/helloRaiseClaimCopy"

import { cn } from "@/lib/utils"
import { asset } from "@/lib/assets"
import type { Customer, InactivePolicy, Policy } from "@/types/crm"
import { Button } from "@/components/ui/button"

/** Mirrors {@link ActivePoliciesPanel} chip primary line — plan / product name first. */
function activePolicyChipPrimaryLabel(p: Policy): string {
  const n = p.name?.trim()
  if (n) return n
  const plan = p.planDisplayName?.trim()
  if (plan) return plan
  return p.type
}

export type HelloCustomerProfileBarProps = {
  customer: Customer
  /**
   * Hello flows only — when set (with {@link inactivePolicies} or alone), shows Figma “Policies”
   * control and expandable accordion. Omit in any non-Hello reuse.
   */
  activePolicies?: Policy[]
  inactivePolicies?: InactivePolicy[]
  /**
   * When set, active policy chips expand in-place to offer View / Raise / Edit; choosing one
   * closes the drawer and notifies the parent (typically opens the Hello split pane).
   */
  onActivePolicyRibbonAction?: (policy: Policy, action: HelloProfilePolicyRibbonAction) => void
  /** Non-policy ribbon rows (KYC / payment / communication) — optional demo wiring (e.g. toast). */
  onNonPolicyRibbonAction?: (action: HelloProfileNonPolicyRibbonActionId) => void
}

const RIBBON_POLICY_ACTION_LABELS: { action: HelloProfilePolicyRibbonAction; label: string }[] = [
  { action: "view_details", label: "View policy details" },
  { action: "raise_claim", label: "Raise a claim" },
  { action: "edit_policy", label: "Edit Policy" },
  { action: "share_policy_document", label: "Share policy document" },
]

/** Figma 8636:55508 — non-policy ribbon shortcuts (KYC / payments / comms). */
export type HelloProfileNonPolicyRibbonActionId =
  | "kyc_verification_logs"
  | "payment_history"
  | "communication_history"

type RibbonPolicyCascadeArm = "active" | "inactive"

const NON_POLICY_RIBBON_ROWS: { id: HelloProfileNonPolicyRibbonActionId; label: string }[] = [
  { id: "kyc_verification_logs", label: "KYC verification logs" },
  { id: "payment_history", label: "Payment History" },
  { id: "communication_history", label: "Communication history" },
]

export function helloProfileNonPolicyRibbonActionLabel(
  action: HelloProfileNonPolicyRibbonActionId,
): string {
  return NON_POLICY_RIBBON_ROWS.find((r) => r.id === action)?.label ?? action
}

export function helloProfileNonPolicyRibbonAckMessage(action: HelloProfileNonPolicyRibbonActionId): string {
  return `As requested, opening ${helloProfileNonPolicyRibbonActionLabel(action)} for you.`
}

function RibbonCascadeColumn({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div
      className={cn(
        "flex min-h-[7rem] w-[min(13rem,calc(100vw-3rem))] shrink-0 flex-col rounded-xl border border-[#e7e7f0] bg-white py-2 shadow-[0px_8px_28px_rgba(54,53,76,0.14)]",
        className,
      )}
    >
      {children}
    </div>
  )
}

function policyCascadeSecondaryLine(p: Policy): string {
  const v = p.vehicle?.trim()
  if (v) return v
  return p.policyNumber
}

const cascadeRowClass =
  "w-full px-3 py-2.5 text-left font-euclid text-[13px] leading-5 transition-colors outline-none focus-visible:bg-[#f5f3fc] focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-[#7c47e1]/20"
const cascadeRowNeutralClass = "text-[#040222] hover:bg-[#f8f7fc]"
const cascadeRowSelectedClass = "bg-[#efe9fb] font-medium text-[#7c47e1]"

/**
 * Hello-only customer profile strip — ribbon row matches
 * [Figma 8636:55508 / 8636:55509](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8636-55508).
 * Policy / non-policy pills: cascade uses hover/focus for policy drill-down; **Actions** columns (policy + non-policy) open the next panel / run only on click.
 */
export function HelloCustomerProfileBar({
  customer,
  activePolicies,
  inactivePolicies,
  onActivePolicyRibbonAction,
  onNonPolicyRibbonAction,
}: HelloCustomerProfileBarProps) {
  const kyc = customer.kycStatus
  const policiesPanelId = useId()
  const profileSectionRef = useRef<HTMLElement>(null)
  const policyDetailOpenTimerRef = useRef<number | null>(null)
  const [policiesOpen, setPoliciesOpen] = useState(false)
  /** Which ribbon pill opened the cascade. */
  const [ribbonDrawerFace, setRibbonDrawerFace] = useState<"policy" | "non-policy">("policy")
  const [cascadePolicyArm, setCascadePolicyArm] = useState<RibbonPolicyCascadeArm | null>(null)
  /** 1 = Active/Inactive only; 2 = + policy list (hover/focus); 3 = + actions/details — actions are click-only. */
  const [policyCascadeStep, setPolicyCascadeStep] = useState<1 | 2 | 3>(1)
  const [cascadeActivePolicyId, setCascadeActivePolicyId] = useState<string | null>(null)
  const [cascadeInactivePolicyId, setCascadeInactivePolicyId] = useState<string | null>(null)
  const [cascadeNonPolicyRowId, setCascadeNonPolicyRowId] = useState<HelloProfileNonPolicyRibbonActionId | null>(null)
  const [nonPolicyCascadeStep, setNonPolicyCascadeStep] = useState<1 | 2>(1)

  const hasPolicies = activePolicies !== undefined || inactivePolicies !== undefined
  const activeList = activePolicies ?? []
  const inactiveList = inactivePolicies ?? []

  const clearPolicyDetailOpenTimer = () => {
    if (policyDetailOpenTimerRef.current !== null) {
      window.clearTimeout(policyDetailOpenTimerRef.current)
      policyDetailOpenTimerRef.current = null
    }
  }

  const runRibbonAction = (policy: Policy, action: HelloProfilePolicyRibbonAction) => {
    if (!onActivePolicyRibbonAction) return
    clearPolicyDetailOpenTimer()
    setCascadeActivePolicyId(null)
    setCascadeInactivePolicyId(null)
    setPoliciesOpen(false)
    setPolicyCascadeStep(1)
    setCascadePolicyArm(null)
    setRibbonDrawerFace("policy")
    policyDetailOpenTimerRef.current = window.setTimeout(() => {
      policyDetailOpenTimerRef.current = null
      onActivePolicyRibbonAction(policy, action)
    }, HELLO_POLICIES_PANEL_COLLAPSE_BEFORE_OPEN_MS)
  }

  useEffect(() => () => clearPolicyDetailOpenTimer(), [])

  useEffect(() => {
    if (!hasPolicies || !policiesOpen) return

    const onPointerDown = (event: PointerEvent) => {
      const root = profileSectionRef.current
      const target = event.target
      if (!root || !(target instanceof Node)) return
      if (root.contains(target)) return
      setPoliciesOpen(false)
      setCascadeActivePolicyId(null)
      setCascadeInactivePolicyId(null)
      setCascadeNonPolicyRowId(null)
      setCascadePolicyArm(null)
      setPolicyCascadeStep(1)
      setNonPolicyCascadeStep(1)
      setRibbonDrawerFace("policy")
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [hasPolicies, policiesOpen])

  const kycDisplay = (() => {
    switch (kyc) {
      case "verified":
        return { label: "Verified", tone: "success" as const }
      case "pending":
        return { label: "Pending", tone: "pending" as const }
      case "not_applicable":
        return { label: "N/A", tone: "muted" as const }
      default:
        return { label: "—", tone: "muted" as const }
    }
  })()

  const selectedActivePolicy =
    cascadeActivePolicyId !== null
      ? (activeList.find((p) => p.id === cascadeActivePolicyId) ?? null)
      : null
  const selectedInactivePolicy =
    cascadeInactivePolicyId !== null
      ? (inactiveList.find((p) => p.id === cascadeInactivePolicyId) ?? null)
      : null

  const showPolicyListForArm = (arm: RibbonPolicyCascadeArm) => {
    setCascadePolicyArm(arm)
    if (arm === "active") {
      setCascadeInactivePolicyId(null)
      setCascadeActivePolicyId(null)
    } else {
      setCascadeActivePolicyId(null)
      setCascadeInactivePolicyId(null)
    }
    setPolicyCascadeStep(2)
  }

  const selectActivePolicyRow = (p: Policy) => {
    setCascadeActivePolicyId(p.id)
    setCascadeInactivePolicyId(null)
    setPolicyCascadeStep(3)
  }

  const selectInactivePolicyRow = (p: InactivePolicy) => {
    setCascadeInactivePolicyId(p.id)
    setCascadeActivePolicyId(null)
    setPolicyCascadeStep(3)
  }

  const showNonPolicyRecord = (id: HelloProfileNonPolicyRibbonActionId) => {
    setCascadeNonPolicyRowId(id)
    setNonPolicyCascadeStep(2)
  }

  const runNonPolicyOpen = () => {
    if (!cascadeNonPolicyRowId) return
    onNonPolicyRibbonAction?.(cascadeNonPolicyRowId)
    setPoliciesOpen(false)
    setCascadeNonPolicyRowId(null)
    setNonPolicyCascadeStep(1)
  }

  return (
    <section
      ref={profileSectionRef}
      className="flex w-full flex-col border-b border-solid border-[#e7e7f0] bg-[#f8f7fc] py-4"
      data-node-id="8636:55508"
      aria-label="Customer profile"
      onMouseLeave={() => {
        setPoliciesOpen(false)
        setCascadeActivePolicyId(null)
        setCascadeInactivePolicyId(null)
        setCascadeNonPolicyRowId(null)
        setCascadePolicyArm(null)
        setPolicyCascadeStep(1)
        setNonPolicyCascadeStep(1)
        setRibbonDrawerFace("policy")
      }}
    >
      {/* Figma 8636:55509 — px 30; lg matches Hello shell at 40. App/KYC live in left meta strip; pills on right. */}
      <div
        className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 px-[30px] lg:px-[40px]"
        data-node-id="8636:55509"
      >
        {/* Left: presence · name · language | tenure | app | KYC (8636:55511 + 8636:55517) */}
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-[9px]"
          data-node-id="8636:55511"
        >
          <span
            className="relative inline-flex size-[22px] shrink-0 items-center justify-center"
            role="img"
            aria-label="In call"
            data-node-id="8636:55512"
          >
            <span className="size-2.5 shrink-0 rounded-full bg-[#0fa457]" aria-hidden />
          </span>
          <p
            className="shrink-0 font-euclid text-[18px] font-semibold leading-6 text-[#040222]"
            data-node-id="8636:55516"
          >
            {customer.name}
          </p>
          <div
            className="flex min-w-0 flex-wrap items-center gap-2 opacity-80 sm:gap-2"
            data-node-id="8636:55517"
          >
            <div className="flex items-center gap-1" data-node-id="8636:55518">
              <Languages className="size-4 shrink-0 text-[#5b5675]" aria-hidden />
              <span className="whitespace-nowrap font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                {customer.language}
              </span>
            </div>
            <span className="h-4 w-px shrink-0 bg-[#e7e7f0]" aria-hidden data-node-id="8636:55521" />
            {customer.tenureWithAcko ? (
              <>
                <div className="flex items-center gap-1" data-node-id="8636:55522">
                  <Award className="size-4 shrink-0 text-[#5b5675]" aria-hidden />
                  <span className="whitespace-nowrap font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                    {customer.tenureWithAcko}
                  </span>
                </div>
                <span className="h-4 w-px shrink-0 bg-[#e7e7f0]" aria-hidden data-node-id="8636:55525" />
              </>
            ) : null}
            {/* App + KYC inline after tenure — Figma 8636:56189 */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-2" data-node-id="8636:56189">
              <div className="flex items-center gap-2" data-node-id="8636:56190">
                <span className="whitespace-nowrap font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                  App install status
                </span>
                <div className="flex items-center gap-1">
                  {customer.appStatus === "installed" ? (
                    <>
                      <img
                        src={asset("/icons/profile-card-tick.png")}
                        alt=""
                        className="size-4 shrink-0 object-contain"
                        width={16}
                        height={16}
                        aria-hidden
                      />
                      <span className="whitespace-nowrap font-euclid text-[12px] font-medium leading-normal text-[#0fa457]">
                        Installed
                      </span>
                    </>
                  ) : (
                    <span className="whitespace-nowrap font-euclid text-[12px] font-medium leading-normal text-[#5b5675]">
                      Not installed
                    </span>
                  )}
                </div>
              </div>
              <span className="h-4 w-px shrink-0 bg-[#e7e7f0]" aria-hidden data-node-id="8636:56195" />
              <div className="flex items-center gap-2" data-node-id="8636:56196">
                <span className="whitespace-nowrap font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                  KYC Status
                </span>
                <div className="flex items-center gap-1">
                  {kycDisplay.tone === "success" ? (
                    <>
                      <img
                        src={asset("/icons/profile-card-tick.png")}
                        alt=""
                        className="size-4 shrink-0 object-contain"
                        width={16}
                        height={16}
                        aria-hidden
                      />
                      <span className="whitespace-nowrap font-euclid text-[12px] font-medium leading-normal text-[#0fa457]">
                        {kycDisplay.label}
                      </span>
                    </>
                  ) : kycDisplay.tone === "pending" ? (
                    <>
                      <img
                        src={asset("/icons/profile-card-kyc-pending.png")}
                        alt=""
                        className="size-4 shrink-0 object-contain"
                        width={16}
                        height={16}
                        aria-hidden
                      />
                      <span className="whitespace-nowrap font-euclid text-[12px] font-medium leading-normal text-[#f58700]">
                        {kycDisplay.label}
                      </span>
                    </>
                  ) : (
                    <span className="whitespace-nowrap font-euclid text-[12px] font-medium leading-normal text-[#5b5675]">
                      {kycDisplay.label}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right: pills — each trigger anchors its own cascade (L1 right-aligned to that pill). */}
        {hasPolicies ? (
          <div className="flex shrink-0 flex-wrap items-center justify-end gap-3 sm:gap-4" data-node-id="8636:56219">
            <div className="relative z-[60]">
              <button
                type="button"
                id={`${policiesPanelId}-policy-actions-pill`}
                aria-expanded={policiesOpen && ribbonDrawerFace === "policy"}
                aria-controls={`${policiesPanelId}-policy-cascade`}
                onClick={() => {
                  if (policiesOpen && ribbonDrawerFace === "policy") {
                    setPoliciesOpen(false)
                    setCascadeActivePolicyId(null)
                    setCascadeInactivePolicyId(null)
                    setCascadePolicyArm(null)
                    setPolicyCascadeStep(1)
                    return
                  }
                  if (policiesOpen && ribbonDrawerFace === "non-policy") {
                    setRibbonDrawerFace("policy")
                    setCascadeNonPolicyRowId(null)
                    setNonPolicyCascadeStep(1)
                    setCascadeActivePolicyId(null)
                    setCascadeInactivePolicyId(null)
                    setCascadePolicyArm(null)
                    setPolicyCascadeStep(1)
                    setPoliciesOpen(true)
                    return
                  }
                  setRibbonDrawerFace("policy")
                  setCascadeNonPolicyRowId(null)
                  setNonPolicyCascadeStep(1)
                  setCascadeActivePolicyId(null)
                  setCascadeInactivePolicyId(null)
                  setCascadePolicyArm(null)
                  setPolicyCascadeStep(1)
                  setPoliciesOpen(true)
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border border-[#d0bdf4]/40 bg-[#efe9fb] px-2 py-1",
                  "font-euclid text-[12px] font-normal leading-[18px] text-[#7c47e1]",
                  "outline-none transition-colors hover:bg-[#e8dff9] focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30",
                  policiesOpen && ribbonDrawerFace === "policy" && "border-[#7c47e1]/45 bg-[#e8dff9]",
                )}
                data-node-id="8636:55531"
              >
                Policy actions
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-[#7c47e1] transition-transform duration-200",
                    policiesOpen && ribbonDrawerFace === "policy" ? "rotate-180" : "rotate-0",
                  )}
                  aria-hidden
                />
              </button>
              {policiesOpen && ribbonDrawerFace === "policy" ? (
                <div
                  id={`${policiesPanelId}-policy-cascade`}
                  role="region"
                  aria-labelledby={`${policiesPanelId}-policy-actions-pill`}
                  className="absolute right-0 top-[calc(100%+6px)] flex max-w-[calc(100vw-2rem)] flex-row items-stretch gap-1 pb-1"
                >
                  {policyCascadeStep >= 3 && cascadePolicyArm === "active" && selectedActivePolicy ? (
                    onActivePolicyRibbonAction ? (
                      <RibbonCascadeColumn>
                        <p className="border-b border-[#ececf2] px-3 pb-2 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                          Actions
                        </p>
                        <div className="flex min-h-0 flex-1 flex-col px-1 pt-1">
                          {RIBBON_POLICY_ACTION_LABELS.map(({ action, label }) => (
                            <button
                              key={action}
                              type="button"
                              onClick={() => runRibbonAction(selectedActivePolicy, action)}
                              className={cn(
                                cascadeRowClass,
                                "rounded-md font-medium text-[#7c47e1] hover:bg-[#f5f3fc]",
                              )}
                            >
                              {label}
                            </button>
                          ))}
                        </div>
                      </RibbonCascadeColumn>
                    ) : (
                      <RibbonCascadeColumn>
                        <p className="border-b border-[#ececf2] px-3 pb-2 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                          Policy
                        </p>
                        <p className="px-3 pt-3 font-euclid text-[13px] font-semibold text-[#040222]">
                          {activePolicyChipPrimaryLabel(selectedActivePolicy)}
                        </p>
                        <p className="mt-2 px-3 font-euclid text-[12px] leading-[18px] text-[#5b5675]">
                          Workflow actions are not available in this view.
                        </p>
                      </RibbonCascadeColumn>
                    )
                  ) : null}
                  {policyCascadeStep >= 3 && cascadePolicyArm === "inactive" && selectedInactivePolicy ? (
                    <RibbonCascadeColumn>
                      <p className="border-b border-[#ececf2] px-3 pb-2 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                        Details
                      </p>
                      <p className="px-3 pt-2 font-euclid text-[12px] leading-[18px] text-[#5b5675]">
                        Inactive policies are view-only here. Use policy records for full history.
                      </p>
                      <p className="mt-2 px-3 font-euclid text-[13px] font-semibold text-[#040222]">
                        {selectedInactivePolicy.productTitle}
                      </p>
                      <p className="mt-1 px-3 font-euclid text-[12px] text-[#5b5675]">
                        {[selectedInactivePolicy.policyNumber, selectedInactivePolicy.periodLabel]
                          .filter(Boolean)
                          .join(" · ")}
                      </p>
                    </RibbonCascadeColumn>
                  ) : null}

                  {policyCascadeStep >= 2 && cascadePolicyArm !== null ? (
                    <RibbonCascadeColumn>
                      {cascadePolicyArm === "active" ? (
                        activeList.length === 0 ? (
                          <p className="px-3 py-6 font-euclid text-[13px] leading-5 text-[#5b5675]">
                            No active policies on file.
                          </p>
                        ) : (
                          <ul className="flex max-h-[min(50vh,320px)] flex-col overflow-y-auto py-1">
                            {activeList.map((p) => (
                              <li key={p.id} className="list-none">
                                <button
                                  type="button"
                                  onPointerEnter={() => selectActivePolicyRow(p)}
                                  onFocus={() => selectActivePolicyRow(p)}
                                  className={cn(
                                    cascadeRowClass,
                                    cascadeActivePolicyId === p.id ? cascadeRowSelectedClass : cascadeRowNeutralClass,
                                  )}
                                >
                                  <span className="block font-medium">{activePolicyChipPrimaryLabel(p)}</span>
                                  <span className="mt-0.5 block text-[12px] font-normal text-[#5b5675]">
                                    {policyCascadeSecondaryLine(p)}
                                  </span>
                                </button>
                              </li>
                            ))}
                          </ul>
                        )
                      ) : inactiveList.length === 0 ? (
                        <p className="px-3 py-6 font-euclid text-[13px] leading-5 text-[#5b5675]">
                          No inactive policies on file.
                        </p>
                      ) : (
                        <ul className="flex max-h-[min(50vh,320px)] flex-col overflow-y-auto py-1">
                          {inactiveList.map((p) => (
                            <li key={p.id} className="list-none">
                              <button
                                type="button"
                                onPointerEnter={() => selectInactivePolicyRow(p)}
                                onFocus={() => selectInactivePolicyRow(p)}
                                className={cn(
                                  cascadeRowClass,
                                  cascadeInactivePolicyId === p.id ? cascadeRowSelectedClass : cascadeRowNeutralClass,
                                )}
                              >
                                <span className="block font-medium">{p.productTitle}</span>
                                <span className="mt-0.5 block text-[12px] font-normal text-[#5b5675]">
                                  {[p.policyNumber, p.periodLabel].filter(Boolean).join(" · ")}
                                </span>
                              </button>
                            </li>
                          ))}
                        </ul>
                      )}
                    </RibbonCascadeColumn>
                  ) : null}

                  <RibbonCascadeColumn>
                    <p className="border-b border-[#ececf2] px-3 pb-2 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                      Policies
                    </p>
                    <div className="flex flex-col py-1">
                      <button
                        type="button"
                        onPointerEnter={() => showPolicyListForArm("active")}
                        onFocus={() => showPolicyListForArm("active")}
                        className={cn(
                          cascadeRowClass,
                          cascadePolicyArm === "active" && policyCascadeStep >= 2
                            ? cascadeRowSelectedClass
                            : cascadeRowNeutralClass,
                        )}
                      >
                        Active policies ({activeList.length})
                      </button>
                      <button
                        type="button"
                        onPointerEnter={() => showPolicyListForArm("inactive")}
                        onFocus={() => showPolicyListForArm("inactive")}
                        className={cn(
                          cascadeRowClass,
                          cascadePolicyArm === "inactive" && policyCascadeStep >= 2
                            ? cascadeRowSelectedClass
                            : cascadeRowNeutralClass,
                        )}
                      >
                        Inactive policies ({inactiveList.length})
                      </button>
                    </div>
                  </RibbonCascadeColumn>
                </div>
              ) : null}
            </div>
            <div className="relative z-[60]">
              <button
                type="button"
                id={`${policiesPanelId}-non-policy-pill`}
                aria-expanded={policiesOpen && ribbonDrawerFace === "non-policy"}
                aria-controls={`${policiesPanelId}-non-policy-cascade`}
                onClick={() => {
                  if (policiesOpen && ribbonDrawerFace === "non-policy") {
                    setPoliciesOpen(false)
                    setCascadeNonPolicyRowId(null)
                    setNonPolicyCascadeStep(1)
                    return
                  }
                  if (policiesOpen && ribbonDrawerFace === "policy") {
                    setRibbonDrawerFace("non-policy")
                    setPolicyCascadeStep(1)
                    setCascadePolicyArm(null)
                    setCascadeActivePolicyId(null)
                    setCascadeInactivePolicyId(null)
                    setCascadeNonPolicyRowId(null)
                    setNonPolicyCascadeStep(1)
                    return
                  }
                  setRibbonDrawerFace("non-policy")
                  setPolicyCascadeStep(1)
                  setCascadePolicyArm(null)
                  setCascadeActivePolicyId(null)
                  setCascadeInactivePolicyId(null)
                  setCascadeNonPolicyRowId(null)
                  setNonPolicyCascadeStep(1)
                  setPoliciesOpen(true)
                }}
                className={cn(
                  "inline-flex items-center gap-1 rounded-md border border-[#d0bdf4]/40 bg-[#efe9fb] px-2 py-1",
                  "font-euclid text-[12px] font-normal leading-[18px] text-[#7c47e1]",
                  "outline-none transition-colors hover:bg-[#e8dff9] focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30",
                  policiesOpen && ribbonDrawerFace === "non-policy" && "border-[#7c47e1]/45 bg-[#e8dff9]",
                )}
                data-node-id="8636:56207"
              >
                Non-policy actions
                <ChevronDown
                  className={cn(
                    "size-4 shrink-0 text-[#7c47e1] transition-transform duration-200",
                    policiesOpen && ribbonDrawerFace === "non-policy" ? "rotate-180" : "rotate-0",
                  )}
                  aria-hidden
                />
              </button>
              {policiesOpen && ribbonDrawerFace === "non-policy" ? (
                <div
                  id={`${policiesPanelId}-non-policy-cascade`}
                  role="region"
                  aria-labelledby={`${policiesPanelId}-non-policy-pill`}
                  className="absolute right-0 top-[calc(100%+6px)] flex max-w-[calc(100vw-2rem)] flex-row items-stretch gap-1 pb-1"
                >
                  {nonPolicyCascadeStep >= 2 && cascadeNonPolicyRowId ? (
                    <RibbonCascadeColumn>
                      <p className="border-b border-[#ececf2] px-3 pb-2 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                        Summary
                      </p>
                      <div className="flex flex-1 flex-col gap-3 px-3 pt-3">
                        <p className="font-euclid text-[14px] font-semibold leading-6 text-[#040222]">
                          {helloProfileNonPolicyRibbonActionLabel(cascadeNonPolicyRowId)}
                        </p>
                        <p className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
                          Open this record in the workspace to review details and next steps.
                        </p>
                        <Button
                          type="button"
                          size="sm"
                          className="w-full shrink-0 bg-[#7c47e1] font-euclid text-[13px] hover:bg-[#6b3bcc]"
                          onClick={runNonPolicyOpen}
                        >
                          Open
                        </Button>
                      </div>
                    </RibbonCascadeColumn>
                  ) : null}

                  <RibbonCascadeColumn>
                    <p className="border-b border-[#ececf2] px-3 pb-2 font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#5b5675]">
                      Actions
                    </p>
                    <ul className="flex flex-col py-1">
                      {NON_POLICY_RIBBON_ROWS.map(({ id, label }) => (
                        <li key={id} className="list-none">
                          <button
                            type="button"
                            onClick={() => showNonPolicyRecord(id)}
                            className={cn(
                              cascadeRowClass,
                              cascadeNonPolicyRowId === id && nonPolicyCascadeStep >= 2
                                ? cascadeRowSelectedClass
                                : cascadeRowNeutralClass,
                            )}
                          >
                            {label}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </RibbonCascadeColumn>
                </div>
              ) : null}
            </div>
          </div>
        ) : null}
      </div>
    </section>
  )
}
