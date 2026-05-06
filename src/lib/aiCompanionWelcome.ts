import type { Customer, JTBD, Policy } from "@/types/crm"
import { canonicalOngoingJtbdTitle } from "@/lib/canonicalOngoingLabels"

function customerFirstNameForWelcome(fullName: string): string {
  const t = fullName.trim()
  if (!t) return "the customer"
  const parts = t.split(/\s+/).filter(Boolean)
  return parts[0] ?? t
}

function policyTokensMatchCallContext(policyVehicle: string, callCtx: string): boolean {
  const pt = policyVehicle.toLowerCase()
  const ct = callCtx.toLowerCase()
  const first = ct.split(/\s+/).filter(Boolean)[0]
  if (first && first.length > 2 && pt.includes(first)) return true
  const cw = ct.split(/\s+/).filter((w) => w.length > 2)
  return cw.some((w) => pt.includes(w))
}

function appendModelYearIfMissing(line: string, motorPolicy: Policy | undefined): string {
  if (!motorPolicy?.vehicle) return line
  const year = motorPolicy.vehicle.match(/\b(20\d{2})\b/)?.[1]
  if (!year || line.includes(year)) return line
  if (policyTokensMatchCallContext(motorPolicy.vehicle, line)) {
    return `${line} ${year}`.trim()
  }
  return line
}

/**
 * Human-readable asset line for the AI Companion opener (motor, health plan, or fallback).
 */
export function buildCompanionCaseAssetLine(
  customer: Customer,
  jtbd: JTBD | null,
  activePolicies: Policy[],
): string {
  const ccv = customer.callContext.vehicle?.trim()
  const jv = jtbd?.vehicle?.trim()
  const firstMotor = activePolicies.find((p) => p.type === "Motor Insurance" && p.vehicle)

  if (!jtbd || !jv || jv === "Various") {
    if (ccv) {
      return appendModelYearIfMissing(ccv, firstMotor)
    }
    if (firstMotor?.vehicle) return firstMotor.vehicle
    const health = activePolicies.find((p) => p.type.includes("Health"))
    return health?.planDisplayName ?? health?.name ?? "their policy on file"
  }

  if (/gmc|health policy/i.test(jv)) {
    const health = activePolicies.find((p) => p.type.includes("Health"))
    return health?.planDisplayName ?? health?.name ?? jv
  }

  if (ccv) {
    const yearInJtbd = jv.match(/\b(20\d{2})\b/)?.[1]
    const yearInCc = ccv.match(/\b(20\d{2})\b/)?.[1]
    if (yearInJtbd && !yearInCc) {
      return `${ccv} ${yearInJtbd}`.trim()
    }
    if (ccv.length >= jv.length) return appendModelYearIfMissing(ccv, firstMotor)
    return appendModelYearIfMissing(jv, firstMotor)
  }

  return appendModelYearIfMissing(jv, firstMotor)
}

function formatCallTopic(reason: string, jtbd: JTBD | null): string {
  const r = reason.trim()
  if (!r) return jtbd?.title?.trim() || "a support query"
  return r
}

/**
 * Opening line for AI Companion — same pattern for every CRM use case.
 */
export function buildAiCompanionWelcomeMessage(
  customer: Customer,
  jtbd: JTBD | null,
  activePolicies: Policy[],
): string {
  const asset = buildCompanionCaseAssetLine(customer, jtbd, activePolicies)
  const name = customer.name.trim()
  const reason = customer.callContext.reason?.trim() ?? ""
  const closing =
    "Let me know if you need any assistance in solving their query."

  if (!jtbd) {
    if (/^unknown$/i.test(reason)) {
      const first = customerFirstNameForWelcome(name)
      return `Ask ${first} the reason for their call and ask me anything if you have any doubts.`
    }
    const topic = formatCallTopic(reason, null)
    return `Looks like ${name} is calling for ${topic} for ${asset}. ${closing}`
  }

  if (/^unknown$/i.test(reason)) {
    const jtbdHint = canonicalOngoingJtbdTitle(jtbd)
    return `Looks like ${name} is calling — reason not logged in IVR. The open job is “${jtbdHint}” on ${asset}. ${closing}`
  }

  const topic = formatCallTopic(reason, jtbd)
  return `${name} is probably calling for ${topic}, ${closing}`
}
