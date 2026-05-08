import { useEffect, useId, useRef, useState } from "react"
import { Award, ChevronDown, FileText, Languages } from "lucide-react"

import { HELLO_POLICIES_PANEL_COLLAPSE_BEFORE_OPEN_MS } from "@/components/crm/hello/helloRaiseClaimCopy"

import { cn } from "@/lib/utils"
import type { Customer, InactivePolicy, Policy } from "@/types/crm"
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

/** Mirrors {@link ActivePoliciesPanel} chip primary line — plan / product name first. */
function activePolicyChipPrimaryLabel(p: Policy): string {
  const n = p.name?.trim()
  if (n) return n
  const plan = p.planDisplayName?.trim()
  if (plan) return plan
  return p.type
}

/** Same health heuristic as Classic {@link ActivePoliciesPanel}. */
function isHelloHealthPolicy(p: Policy): boolean {
  return p.type === "Health Insurance" || p.id === "policy-health-1" || p.id === "policy-raj-health-1"
}

function policyIconPath(policy: Policy): string {
  if (policy.type === "Health Insurance") return "/icons/policy-health-line.png"
  if (
    policy.id === "policy-damage-1" ||
    policy.name.toLowerCase().includes("own damage") ||
    /\bactiva\b/i.test(policy.vehicle ?? "")
  ) {
    return "/icons/policy-bike-line.png"
  }
  return "/icons/policy-car-line.png"
}

function formatExpiryChip(expiry: string): string {
  return /^till /i.test(expiry) ? expiry : `Till ${expiry}`
}

/** Motor chip subtitle — vehicle name, else policy number (Classic parity). */
function motorChipSubtitle(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return v
  return policy.policyNumber
}

const activePolicyChipShellClass = cn(
  "flex w-full flex-col gap-1 rounded-[12px] border border-[#e7e7f0] bg-white px-3 py-2 text-left",
  "shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all duration-150",
  "hover:shadow-[0px_4px_8px_0px_rgba(0,0,0,0.12)]",
)

function ActivePolicyChipBody({ policy }: { policy: Policy }) {
  const health = isHelloHealthPolicy(policy)
  const iconSrc = policyIconPath(policy)
  return (
    <>
      <div className="flex w-full min-w-0 items-center gap-1">
        <div className="relative size-5 shrink-0 overflow-hidden">
          <img
            src={iconSrc}
            alt=""
            width={20}
            height={20}
            draggable={false}
            className="size-5 object-contain"
            aria-hidden
          />
        </div>
        <p className="min-w-0 flex-1 truncate font-euclid text-[13px] font-medium leading-5 text-[#36354c]">
          {activePolicyChipPrimaryLabel(policy)}
        </p>
      </div>
      <div className="flex min-w-0 flex-wrap items-center gap-x-1.5 font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
        {health && policy.members != null ? (
          <>
            <span>{policy.members} members</span>
            <span aria-hidden>•</span>
            <span>{formatExpiryChip(policy.expiryDate)}</span>
          </>
        ) : (
          <>
            <span className="min-w-0 truncate">{motorChipSubtitle(policy)}</span>
            <span aria-hidden>•</span>
            <span className="shrink-0">{formatExpiryChip(policy.expiryDate)}</span>
          </>
        )}
      </div>
    </>
  )
}

export type HelloCustomerProfileBarProps = {
  customer: Customer
  /**
   * Hello flows only — when set (with {@link inactivePolicies} or alone), shows Figma “Policies”
   * control and expandable accordion. Omit in any non-Hello reuse.
   */
  activePolicies?: Policy[]
  inactivePolicies?: InactivePolicy[]
  /** Hello only — active policy rows inject {@link HelloPolicyChatDetailCard} + assistance radios into chat (no split until an action). */
  onActivePolicyViewDetails?: (policy: Policy) => void
}

/**
 * Hello-only customer profile strip — [Figma OMNI Post-Sales 8540:1799](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8540-1799).
 * Chevron expands active / inactive policy accordions. Not used in Classic CRM.
 */
export function HelloCustomerProfileBar({
  customer,
  activePolicies,
  inactivePolicies,
  onActivePolicyViewDetails,
}: HelloCustomerProfileBarProps) {
  const kyc = customer.kycStatus
  const policiesPanelId = useId()
  const profileSectionRef = useRef<HTMLElement>(null)
  const policyDetailOpenTimerRef = useRef<number | null>(null)
  const [policiesOpen, setPoliciesOpen] = useState(false)

  const hasPolicies = activePolicies !== undefined || inactivePolicies !== undefined

  const clearPolicyDetailOpenTimer = () => {
    if (policyDetailOpenTimerRef.current !== null) {
      window.clearTimeout(policyDetailOpenTimerRef.current)
      policyDetailOpenTimerRef.current = null
    }
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
    }

    document.addEventListener("pointerdown", onPointerDown)
    return () => document.removeEventListener("pointerdown", onPointerDown)
  }, [hasPolicies, policiesOpen])
  const activeList = activePolicies ?? []
  const inactiveList = inactivePolicies ?? []

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

  return (
    <section
      ref={profileSectionRef}
      className="flex w-full flex-col border-b border-solid border-[#e7e7f0] bg-[#f8f7fc] py-4"
      data-node-id="8540:1799"
      aria-label="Customer profile"
      onMouseLeave={() => {
        setPoliciesOpen(false)
      }}
    >
      {/* Figma 8540:1800 — px 30 desktop spec; lg matches rest of Hello shell at 40 */}
      <div
        className="flex w-full flex-wrap items-center justify-between gap-x-4 gap-y-3 px-[30px] lg:px-[40px]"
        data-node-id="8540:1800"
      >
        {/* Figma 8540:1811 — single row: presence · name · meta strip (language | tenure | Policies ▼) */}
        <div
          className="flex min-w-0 flex-1 flex-wrap items-center gap-[9px]"
          data-node-id="8540:1811"
        >
          <span
            className="relative inline-flex size-[22px] shrink-0"
            role="img"
            aria-label="In call"
            data-node-id="8544:1674"
          >
            <img
              src="/icons/hello-in-call-presence.png"
              alt=""
              width={22}
              height={22}
              draggable={false}
              className="size-[22px] select-none object-contain motion-safe:animate-hello-in-call-breathe"
              aria-hidden
            />
          </span>
          <p
            className="shrink-0 font-euclid text-[18px] font-semibold leading-6 text-[#040222]"
            data-node-id="8540:1812"
          >
            {customer.name}
          </p>
          <div
            className="flex min-w-0 flex-wrap items-center gap-2 opacity-80 sm:gap-2"
            data-node-id="8540:1813"
          >
            <div className="flex items-center gap-1" data-node-id="8540:1814">
              <Languages className="size-4 shrink-0 text-[#5b5675]" aria-hidden />
              <span className="whitespace-nowrap font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                {customer.language}
              </span>
            </div>
            <span
              className="hidden h-4 w-px shrink-0 bg-[#e7e7f0] sm:block"
              aria-hidden
              data-node-id="8545:1679"
            />
            {customer.tenureWithAcko ? (
              <div className="flex items-center gap-1" data-node-id="8540:1817">
                <Award className="size-4 shrink-0 text-[#5b5675]" aria-hidden />
                <span className="whitespace-nowrap font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                  {customer.tenureWithAcko}
                </span>
              </div>
            ) : null}
            {hasPolicies ? (
              <>
                <span
                  className="hidden h-4 w-px shrink-0 bg-[#e7e7f0] sm:block"
                  aria-hidden
                  data-node-id="8559:1712"
                />
                <button
                  type="button"
                  id={`${policiesPanelId}-trigger`}
                  aria-expanded={policiesOpen}
                  aria-controls={`${policiesPanelId}-panel`}
                  aria-label={policiesOpen ? "Hide policies" : "Show policies"}
                  onClick={() => setPoliciesOpen((o) => !o)}
                  className={cn(
                    "inline-flex items-center gap-1 rounded-md font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]",
                    "outline-none transition-colors hover:bg-white/60 hover:text-[#36354c]",
                    "focus-visible:ring-2 focus-visible:ring-[#7c47e1]/25",
                  )}
                  data-node-id="8559:1760"
                >
                  <FileText className="size-4 shrink-0 text-[#5b5675]" aria-hidden />
                  <span data-node-id="8558:1701">Policies</span>
                  <ChevronDown
                    className={cn(
                      "size-4 shrink-0 text-[#5b5675] transition-transform duration-200",
                      policiesOpen ? "rotate-180" : "rotate-0",
                    )}
                    aria-hidden
                  />
                </button>
              </>
            ) : null}
          </div>
        </div>

        {/* Figma 8544:1678 */}
        <div className="flex shrink-0 flex-wrap items-center gap-3 sm:gap-3" data-node-id="8544:1678">
          <div className="flex items-center gap-2" data-node-id="8544:1679">
            <span className="whitespace-nowrap font-euclid text-[14px] font-normal leading-6 text-[#5b5675]">
              App install status
            </span>
            <div className="flex items-center gap-1">
              {customer.appStatus === "installed" ? (
                <>
                  <img
                    src="/icons/profile-card-tick.png"
                    alt=""
                    className="size-4 shrink-0 object-contain"
                    width={16}
                    height={16}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap font-euclid text-[14px] font-medium leading-normal text-[#0fa457]">
                    Installed
                  </span>
                </>
              ) : (
                <span className="whitespace-nowrap font-euclid text-[14px] font-medium leading-normal text-[#5b5675]">
                  Not installed
                </span>
              )}
            </div>
          </div>

          <span className="hidden h-[17px] w-px shrink-0 bg-[#e7e7f0] sm:block" aria-hidden data-node-id="8544:1684" />

          <div className="flex items-center gap-2" data-node-id="8544:1685">
            <span className="whitespace-nowrap font-euclid text-[14px] font-normal leading-6 text-[#5b5675]">
              KYC Status
            </span>
            <div className="flex items-center gap-1">
              {kycDisplay.tone === "success" ? (
                <>
                  <img
                    src="/icons/profile-card-tick.png"
                    alt=""
                    className="size-4 shrink-0 object-contain"
                    width={16}
                    height={16}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap font-euclid text-[14px] font-medium leading-normal text-[#0fa457]">
                    {kycDisplay.label}
                  </span>
                </>
              ) : kycDisplay.tone === "pending" ? (
                <>
                  <img
                    src="/icons/profile-card-kyc-pending.png"
                    alt=""
                    className="size-4 shrink-0 object-contain"
                    width={16}
                    height={16}
                    aria-hidden
                  />
                  <span className="whitespace-nowrap font-euclid text-[14px] font-medium leading-normal text-[#f58700]">
                    {kycDisplay.label}
                  </span>
                </>
              ) : (
                <span className="whitespace-nowrap font-euclid text-[14px] font-medium leading-normal text-[#5b5675]">
                  {kycDisplay.label}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      {hasPolicies ? (
        <div
          className={cn(
            "grid min-h-0 overflow-hidden",
            "transition-[grid-template-rows] duration-320 ease-[cubic-bezier(0.22,1,0.36,1)]",
            "motion-reduce:transition-none motion-reduce:duration-0",
            policiesOpen ? "grid-rows-[minmax(0,1fr)]" : "grid-rows-[0fr]",
          )}
        >
          <div className="min-h-0 overflow-hidden">
            <div
              id={`${policiesPanelId}-panel`}
              role="region"
              aria-hidden={!policiesOpen}
              aria-labelledby={`${policiesPanelId}-trigger`}
              className={cn(
                "mt-3 border-t border-[#e7e7f0] px-[30px] pt-3 pb-1 lg:px-[40px]",
                "motion-safe:transition-opacity motion-safe:duration-[240ms] motion-safe:ease-out",
                "motion-reduce:transition-none",
                policiesOpen ? "opacity-100" : "pointer-events-none opacity-0",
              )}
            >
              <Accordion
                key={policiesOpen ? "policies-drawer-open" : "policies-drawer-shut"}
                type="single"
                collapsible
                className="space-y-2"
              >
            <AccordionItem
              value="active"
              className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]"
            >
              <AccordionTrigger className="px-4 py-3 font-euclid text-[14px] font-semibold leading-6 text-[#040222] hover:no-underline">
                Active policies ({activeList.length})
              </AccordionTrigger>
              <AccordionContent className="min-h-0 px-2 pb-3 pt-0">
                {activeList.length === 0 ? (
                  <p className="px-2 py-2 font-euclid text-[13px] leading-5 text-[#5b5675]">
                    No active policies on file.
                  </p>
                ) : (
                  <ul className="max-h-[min(40vh,280px)] space-y-1 overflow-y-auto overscroll-y-contain px-1 [scrollbar-gutter:stable]">
                    {activeList.map((p) =>
                      onActivePolicyViewDetails ? (
                        <li key={p.id} className="list-none">
                          <button
                            type="button"
                            onClick={() => {
                              clearPolicyDetailOpenTimer()
                              setPoliciesOpen(false)
                              if (!onActivePolicyViewDetails) return
                              policyDetailOpenTimerRef.current = window.setTimeout(() => {
                                policyDetailOpenTimerRef.current = null
                                onActivePolicyViewDetails(p)
                              }, HELLO_POLICIES_PANEL_COLLAPSE_BEFORE_OPEN_MS)
                            }}
                            title="View policy details"
                            aria-label={`View policy details for ${activePolicyChipPrimaryLabel(p)}`}
                            className={cn(
                              "group relative cursor-pointer",
                              activePolicyChipShellClass,
                              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30",
                            )}
                          >
                            <div className="min-w-0 overflow-hidden pr-[5.25rem] sm:pr-24">
                              <ActivePolicyChipBody policy={p} />
                            </div>
                            <span className="pointer-events-none absolute right-2 top-1/2 max-w-[5rem] -translate-y-1/2 text-right font-euclid text-[10px] font-semibold leading-tight text-[#7c47e1] opacity-0 transition-opacity duration-150 group-hover:opacity-100 sm:right-2.5 sm:max-w-[6.75rem] sm:text-[11px]">
                              View policy details
                            </span>
                          </button>
                        </li>
                      ) : (
                        <li key={p.id} className={cn("list-none overflow-hidden", activePolicyChipShellClass, "cursor-default")}>
                          <ActivePolicyChipBody policy={p} />
                        </li>
                      ),
                    )}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>

            <AccordionItem
              value="inactive"
              className="overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]"
            >
              <AccordionTrigger className="px-4 py-3 font-euclid text-[14px] font-semibold leading-6 text-[#040222] hover:no-underline">
                Inactive policies ({inactiveList.length})
              </AccordionTrigger>
              <AccordionContent className="min-h-0 px-2 pb-3 pt-0">
                {inactiveList.length === 0 ? (
                  <p className="px-2 py-2 font-euclid text-[13px] leading-5 text-[#5b5675]">
                    No inactive policies on file.
                  </p>
                ) : (
                  <ul className="max-h-[min(40vh,280px)] space-y-1 overflow-y-auto overscroll-y-contain px-1 [scrollbar-gutter:stable]">
                    {inactiveList.map((p) => (
                      <li
                        key={p.id}
                        className="rounded-md border border-[#f0f0f6] bg-[#fafafa] px-3 py-2"
                      >
                        <p className="font-euclid text-[13px] font-semibold leading-5 text-[#040222]">
                          {p.productTitle}
                        </p>
                        <p className="mt-0.5 font-euclid text-[12px] font-normal leading-[18px] text-[#5b5675]">
                          {[p.policyNumber, p.periodLabel].filter(Boolean).join(" · ")}
                        </p>
                      </li>
                    ))}
                  </ul>
                )}
              </AccordionContent>
            </AccordionItem>
              </Accordion>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  )
}
