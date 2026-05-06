import { useState, useEffect } from "react"

import { policyActions } from "@/data/mockCustomers"
import type { Policy } from "@/types/crm"
import { cn } from "@/lib/utils"

const HEALTH_MEMBERS: Record<string, { name: string; relation: string }[]> = {
  "policy-health-1": [
    { name: "Rajesh Kumar", relation: "Self" },
    { name: "Satish Kumar", relation: "Father" },
    { name: "Meera Bai", relation: "Mother" },
    { name: "Raju Kumar", relation: "Son" },
  ],
  "policy-raj-health-1": [
    { name: "Raj Kapoor", relation: "Self" },
    { name: "Kavita Kapoor", relation: "Spouse" },
  ],
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

function isHealthPolicy(p: Policy): boolean {
  return p.type === "Health Insurance" || p.id === "policy-health-1" || p.id === "policy-raj-health-1"
}

function formatExpiry(expiry: string) {
  return /^till /i.test(expiry) ? expiry : `Till ${expiry}`
}

/** Motor chip subtitle: car/bike name from `vehicle`; policy number if missing. */
function motorPolicyChipSubtitle(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return v
  return policy.policyNumber
}

type ActivePoliciesPanelProps = {
  policies: Policy[]
  /** Second arg is the policy row (needed for raise-claim context). */
  onPolicyActionClick?: (action: string, policy: Policy) => void
}

/**
 * Active policy selector + detail panel — Figma node 8395:28364
 * @see https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8395-28364
 */
export function ActivePoliciesPanel({ policies, onPolicyActionClick }: ActivePoliciesPanelProps) {
  const [selectedPolicyId, setSelectedPolicyId] = useState<string>(policies[0]?.id || "")

  useEffect(() => {
    if (policies.length > 0 && !policies.find((p) => p.id === selectedPolicyId)) {
      setSelectedPolicyId(policies[0].id)
    }
  }, [policies, selectedPolicyId])

  const selectedPolicy = policies.find((p) => p.id === selectedPolicyId)

  if (!policies.length) {
    return (
      <div className="rounded-[12px] border border-[#e2e2e2] bg-white p-8 text-center">
        <p className="font-euclid text-[14px] text-[#5b5675]">No active policies to display.</p>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col gap-6">
      {/* Policy chips — match ongoing JTBD cards: min 228px, max 280px per chip, gap 16 */}
      <div className="flex w-full flex-wrap gap-4">
        {policies.map((policy) => {
          const isSelected = selectedPolicyId === policy.id
          const isHealth = isHealthPolicy(policy)
          const iconSrc = policyIconPath(policy)

          return (
            <button
              key={policy.id}
              type="button"
              onClick={() => setSelectedPolicyId(policy.id)}
              className={cn(
                "flex min-w-[228px] flex-1 max-w-[280px] flex-col items-start overflow-hidden rounded-[12px] border border-[#e7e7f0] px-[16px] py-[12px] text-left shadow-[0px_2px_4px_0px_rgba(0,0,0,0.08)] transition-all cursor-pointer",
                isSelected
                  ? "bg-gradient-to-b from-[#7c47e1] to-[#44277b] to-[156.94%]"
                  : "bg-white hover:shadow-[0px_4px_8px_0px_rgba(0,0,0,0.12)]",
              )}
            >
              <div className="flex w-full min-w-0 flex-col gap-2">
                <div className="flex w-full items-center gap-1">
                  <div className="relative size-5 shrink-0 overflow-hidden">
                    <img
                      src={iconSrc}
                      alt=""
                      width={20}
                      height={20}
                      className={cn("size-5 object-contain", isSelected && "brightness-0 invert")}
                    />
                  </div>
                  <p
                    className={cn(
                      "min-w-0 flex-1 font-euclid text-[14px] font-medium leading-5",
                      isSelected ? "text-white" : "text-[#36354c]",
                    )}
                  >
                    {policy.name}
                  </p>
                </div>
                <div
                  className={cn(
                    "flex flex-wrap items-center gap-2 font-euclid text-[14px] font-normal leading-5",
                    isSelected ? "text-white" : "text-[#5b5675]",
                  )}
                >
                  {isHealth && policy.members != null ? (
                    <>
                      <span>{policy.members} members</span>
                      <span aria-hidden>•</span>
                      <span>{formatExpiry(policy.expiryDate)}</span>
                    </>
                  ) : (
                    <>
                      <span className="min-w-0 break-words">{motorPolicyChipSubtitle(policy)}</span>
                      <span aria-hidden>•</span>
                      <span>{formatExpiry(policy.expiryDate)}</span>
                    </>
                  )}
                </div>
              </div>
            </button>
          )
        })}
      </div>

      {selectedPolicy ? (
        <PolicyDetailPanel
          policy={selectedPolicy}
          isHealth={isHealthPolicy(selectedPolicy)}
          onPolicyActionClick={onPolicyActionClick}
        />
      ) : null}
    </div>
  )
}

type PolicyDetailPanelProps = {
  policy: Policy
  isHealth: boolean
  onPolicyActionClick?: (action: string, policy: Policy) => void
}

function PolicyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex min-w-0 flex-col gap-1">
      <p className="font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">{label}</p>
      <p className="font-euclid text-[14px] font-medium leading-5 text-[#36354c]">{value}</p>
    </div>
  )
}

function PolicyDetailPanel({
  policy,
  isHealth,
  onPolicyActionClick,
}: PolicyDetailPanelProps) {
  const members = policy.coveredMembers ?? HEALTH_MEMBERS[policy.id] ?? []
  const healthPolicyHolderDisplay =
    policy.policyHolder?.trim() ||
    members.find((m) => m.relation.toLowerCase() === "self")?.name ||
    "—"

  return (
    <div className="flex w-full flex-col gap-6 rounded-[12px] border border-[#e7e7f0] bg-white px-5 py-6 font-euclid">
      <div className="flex w-full flex-col gap-3">
        <div className="flex w-full items-center justify-between gap-3">
          <h3 className="text-[14px] font-medium leading-5 text-[#36354c]">View Policy Details</h3>
        </div>

        {/* Key-value: grid columns; labels 14 N400; values 14 medium N500 */}
        <div className="flex flex-col gap-[18px] rounded-2xl border border-[#e7e7f0] bg-white px-4 py-4 sm:px-5">
          {isHealth ? (
            <>
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
                <PolicyField label="Policy Holder" value={healthPolicyHolderDisplay} />
                <PolicyField label="Policy Type" value={policy.planDisplayName || policy.name} />
                <PolicyField label="Total coverage" value={policy.totalCoverage || "—"} />
              </div>
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-2 sm:max-w-[640px]">
                <PolicyField
                  label="Policy Period"
                  value={policy.policyPeriodLabel || formatExpiry(policy.expiryDate)}
                />
                <PolicyField label="Policy Tenure" value={policy.tenureLabel || "—"} />
              </div>
            </>
          ) : (
            <div className="flex flex-col gap-[18px]">
              <div className="grid grid-cols-1 gap-x-8 gap-y-5 sm:grid-cols-3">
                <PolicyField label="Policy Holder" value={policy.policyHolder || "—"} />
                <PolicyField label="Policy Number" value={policy.policyNumber} />
                <PolicyField
                  label="Policy Period"
                  value={policy.policyPeriodLabel || formatExpiry(policy.expiryDate)}
                />
              </div>
              {policy.vehicle ? (
                <div className="min-w-0 sm:max-w-[640px]">
                  <PolicyField label="Vehicle" value={policy.vehicle} />
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>

      {isHealth && members.length > 0 ? (
        <div className="flex w-full flex-col gap-3">
          <h4 className="text-[14px] font-medium leading-5 text-[#36354c]">Members covered under this policy</h4>
          <div className="flex w-full flex-wrap gap-3 sm:flex-nowrap">
            {members.map((member) => (
              <div
                key={member.name + member.relation}
                className="flex h-[75px] min-w-0 flex-1 flex-col items-center justify-center overflow-hidden rounded-xl border border-[#e7e7f0] bg-white px-2 text-center"
              >
                <p className="text-[14px] font-medium leading-5 text-[#36354c]">{member.name}</p>
                <p className="mt-0.5 text-[12px] font-normal leading-[18px] text-[#5b5675]">({member.relation})</p>
              </div>
            ))}
          </div>
        </div>
      ) : null}

      <div className="flex w-full flex-col gap-3">
        <h4 className="text-[14px] font-medium leading-5 text-[#36354c]">Policy Related Actions</h4>
        <div className="flex flex-wrap content-center gap-x-10 gap-y-2 rounded-xl border border-[#e7e7f0] bg-white p-4">
          {policyActions.map((action) => (
            <button
              key={action.id}
              type="button"
              onClick={() => onPolicyActionClick?.(action.action, policy)}
              className="font-euclid text-[14px] font-medium leading-5 text-[#7c47e1] transition-colors hover:text-[#44277b] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/20 rounded-sm"
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
