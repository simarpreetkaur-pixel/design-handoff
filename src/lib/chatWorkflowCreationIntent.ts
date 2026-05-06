import type { Policy } from "@/types/crm"

export type ChatWorkflowIntentKind =
  | "policy_holder_email"
  | "policy_holder_name"
  | "phone_number"
  | "engine_number"
  | "chassis_number"
  | "endorsement_general"

export type ChatWorkflowIntent = {
  kind: ChatWorkflowIntentKind
  /** Human-readable vehicle / asset line for copy + JTBD card */
  vehicleLine: string
}

const VEHICLE_TOKEN_HINTS: { re: RegExp; label: string }[] = [
  { re: /\bactiva\b/i, label: "Honda Activa" },
  { re: /\becosport\b/i, label: "Ford Ecosport Titanium 2025" },
  { re: /\bnexon\b/i, label: "Tata Nexon 2025" },
  { re: /\bswift\b/i, label: "Maruti Suzuki Swift" },
  { re: /\bdzire\b/i, label: "Maruti Suzuki Swift Dzire" },
  { re: /\b(city|honda city)\b/i, label: "Honda City" },
  { re: /\bi10\b/i, label: "Hyundai i10" },
  { re: /\bjupiter\b/i, label: "TVS Jupiter" },
]

function vehicleFromPolicies(userText: string, policies: Policy[]): string | null {
  const lower = userText.toLowerCase()
  for (const p of policies) {
    if (!p.vehicle) continue
    const v = p.vehicle
    const tokens = v
      .toLowerCase()
      .split(/[\s,/]+/)
      .filter((w) => w.length > 2)
    const hits = tokens.filter((t) => lower.includes(t)).length
    if (hits >= 2) return v
    if (hits === 1 && tokens.length <= 3) return v
  }
  return null
}

function vehicleFromTokenHints(userText: string): string | null {
  for (const { re, label } of VEHICLE_TOKEN_HINTS) {
    if (re.test(userText)) return label
  }
  return null
}

function matchesVehicleMention(userText: string, vehicle: string | undefined): boolean {
  if (!vehicle?.trim()) return false
  const l = userText.toLowerCase()
  return vehicle
    .toLowerCase()
    .split(/\s+/)
    .filter((w) => w.length > 2)
    .some((token) => l.includes(token))
}

function resolveVehicleLine(
  userText: string,
  ctx: {
    policies: Policy[]
    callContextVehicle?: string
    caseVehicle?: string
  },
): string {
  return (
    vehicleFromPolicies(userText, ctx.policies) ??
    (matchesVehicleMention(userText, ctx.callContextVehicle)
      ? ctx.callContextVehicle!.trim()
      : null) ??
    vehicleFromTokenHints(userText) ??
    (matchesVehicleMention(userText, ctx.caseVehicle) ? ctx.caseVehicle!.trim() : null) ??
    ctx.caseVehicle?.trim() ??
    ctx.callContextVehicle?.trim() ??
    ctx.policies.find((p) => p.type === "Motor Insurance" && p.vehicle)?.vehicle ??
    "the vehicle on file"
  )
}

function detectPolicyHolderEmailIntent(t: string): boolean {
  return (
    /\b(policy\s*holder|insured)\b.*\bemail\b|\bemail\b.*\b(policy\s*holder|insured|holder)\b/i.test(t) ||
    /\b(edit|change|update|correct)\b.*\bemail\b/i.test(t)
  )
}

function detectPolicyHolderNameIntent(t: string): boolean {
  return (
    /\bpolicy\s*holder\s+name\b/i.test(t) ||
    /\b(policy\s*holder|insured)\b.*\bname\b|\bname\b.*\b(policy\s*holder|insured|holder)\b/i.test(t) ||
    /\b(edit|change|update|correct)\b.*\b(policy\s*holder|insured)\b.*\bname\b/i.test(t) ||
    /\bedit\b.*\bpolicy\s*holder\b.*\bname\b/i.test(t) ||
    /\b(holder)\b.*\bname\b.*\b(change|update|edit|correct)\b/i.test(t)
  )
}

function detectPhoneNumberEditIntent(t: string): boolean {
  return (
    /\b(edit|change|update|correct)\b.*\b(phone|mobile|contact\s*number)\b/i.test(t) ||
    /\b(phone|mobile|contact\s*number)\b.*\b(edit|change|update)\b/i.test(t)
  )
}

function detectEngineNumberEditIntent(t: string): boolean {
  return /\bengine\s*(number|no\.?)\b/i.test(t) && /\b(edit|change|update|correct)\b/i.test(t)
}

function detectChassisNumberEditIntent(t: string): boolean {
  return /\bchassis\s*(number|no\.?)\b/i.test(t) || /\bchasis\s*(number|no\.?)\b/i.test(t)
}

function detectEndorsementGeneralIntent(t: string): boolean {
  const s = t.trim().toLowerCase()
  if (s === "endorsement" || s === "an endorsement" || s === "new endorsement") return true
  return (
    /\b(new|create|start|open)\s+endorsement\b/i.test(t) ||
    /\bendorsement\s+(workflow|request|case|ticket|job)\b/i.test(t) ||
    /\bneed\s+(an?\s+)?endorsement\b/i.test(t)
  )
}

/** Short “edit / edit policy” entry — runs after specific edit-kind detectors. */
function detectPolicySurfaceEditIntent(t: string): boolean {
  const s = t.trim().toLowerCase()
  if (s === "edit" || s === "edit policy") return true
  return /\bedit\s+policy\b/i.test(t)
}

/**
 * Detects endorsement-style requests from chat (policy-holder email/name, or generic endorsement).
 */
export function parseChatWorkflowCreationIntent(
  userText: string,
  ctx: {
    policies: Policy[]
    callContextVehicle?: string
    caseVehicle?: string
  },
): ChatWorkflowIntent | null {
  const t = userText.trim()
  if (!t) return null

  const vehicleLine = resolveVehicleLine(t, ctx)

  if (detectPolicyHolderEmailIntent(t)) {
    return { kind: "policy_holder_email", vehicleLine }
  }
  if (detectPhoneNumberEditIntent(t)) {
    return { kind: "phone_number", vehicleLine }
  }
  if (detectEngineNumberEditIntent(t)) {
    return { kind: "engine_number", vehicleLine }
  }
  if (detectChassisNumberEditIntent(t)) {
    return { kind: "chassis_number", vehicleLine }
  }
  if (detectPolicyHolderNameIntent(t)) {
    return { kind: "policy_holder_name", vehicleLine }
  }
  if (detectEndorsementGeneralIntent(t)) {
    return { kind: "endorsement_general", vehicleLine }
  }
  if (detectPolicySurfaceEditIntent(t)) {
    return { kind: "endorsement_general", vehicleLine }
  }
  return null
}
