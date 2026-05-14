import type { EndorsementEditKind, Policy } from "@/types/crm"

import type { ChatWorkflowIntent, ChatWorkflowIntentKind } from "@/lib/chatWorkflowCreationIntent"

export type EndorsementWizardBootstrap =
  | { entry: "no_motor" }
  | { entry: "policy_pick"; policies: Policy[]; customerName: string }
  | { entry: "edit_pick"; policy: Policy; customerName: string }
  | {
      entry: "mode_pick"
      policy: Policy
      editKind: EndorsementEditKind
      customerName: string
    }

const EDIT_RADIO_LABELS: { kind: EndorsementEditKind; label: string }[] = [
  { kind: "policy_holder_name", label: "Policy Holder Name" },
  { kind: "policy_holder_email", label: "Policy Holder Email ID" },
  { kind: "phone_number", label: "Phone number" },
  { kind: "engine_number", label: "Engine number" },
  { kind: "chassis_number", label: "Chassis number" },
]

export function endorsementEditRadioOptions(): { kind: EndorsementEditKind; label: string }[] {
  return EDIT_RADIO_LABELS
}

export function workflowIntentKindToEditKind(
  kind: ChatWorkflowIntentKind,
): EndorsementEditKind | null {
  switch (kind) {
    case "policy_holder_email":
      return "policy_holder_email"
    case "policy_holder_name":
      return "policy_holder_name"
    case "phone_number":
      return "phone_number"
    case "engine_number":
      return "engine_number"
    case "chassis_number":
      return "chassis_number"
    default:
      return null
  }
}

/** Motor policies suitable for endorsement policy-picker (must show vehicle or plan identity). */
export function listMotorPoliciesWithVehicle(policies: Policy[]): Policy[] {
  return policies.filter((p) => p.type === "Motor Insurance" && Boolean(p.vehicle?.trim() || p.name?.trim()))
}

/**
 * Policies the agent may run an endorsement against from chat (motor with identity line + health / GMC).
 * Used so generic “edit policy” still offers a policy choice when motor + health both exist (e.g. Sunil).
 */
export function listPoliciesForEndorsementPolicyPick(policies: Policy[]): Policy[] {
  const motors = listMotorPoliciesWithVehicle(policies)
  const motorIds = new Set(motors.map((m) => m.id))
  const healthLike = policies.filter(
    (p) =>
      !motorIds.has(p.id) &&
      (/\bhealth\b/i.test(p.type) ||
        /\bmedical\b/i.test(p.type) ||
        /\bgmc\b/i.test(p.name) ||
        /\bgmc\b/i.test(p.planDisplayName ?? "")),
  )
  return [...motors, ...healthLike]
}

/** Resolve one policy from NL when multiple endorsement targets exist (motor + health, etc.). */
export function tryResolveEndorsementPickerPolicy(userText: string, pickable: Policy[]): Policy | null {
  if (pickable.length === 0) return null
  const lower = normalize(userText)
  const c = compact(userText)

  for (const p of pickable) {
    const pnCompact = compact(p.policyNumber)
    if (pnCompact.length >= 6 && c.includes(pnCompact)) return p
  }

  const motors = listMotorPoliciesWithVehicle(pickable)
  const fromMotor = tryResolveMotorPolicyFromText(userText, motors)
  if (fromMotor) return fromMotor

  if (/\bgmc\b/i.test(lower)) {
    const g = pickable.find((p) => /\bgmc\b/i.test(p.name) || /\bgmc\b/i.test(p.planDisplayName ?? ""))
    if (g) return g
  }
  if (/\bswift\b/i.test(lower) || /\bdzire\b/i.test(lower)) {
    const s = pickable.find(
      (p) =>
        p.type === "Motor Insurance" &&
        (/\bswift\b/i.test(p.vehicle ?? "") || /\bdzire\b/i.test(p.vehicle ?? "")),
    )
    if (s) return s
  }

  return null
}

/** Two-line label for policy radio (matches product copy spec). */
export function formatEndorsementPolicyRadioLabel(p: Policy): string {
  const vehicleLine = shortenVehicleLine(p.vehicle ?? p.name)
  return `${p.name} — ${vehicleLine}\nPolicy number: ${p.policyNumber}`
}

export function shortenVehicleLine(vehicleOrName: string): string {
  const v = vehicleOrName.trim()
  if (!v) return "Motor"
  const m = v.match(/^(.{1,48}?\d{4})\b/)
  if (m) return m[1].trim()
  return v.length > 52 ? `${v.slice(0, 49)}…` : v
}

function normalize(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim()
}

function compact(s: string): string {
  return s.replace(/\s/g, "").toLowerCase()
}

/** Resolve a single motor policy from NL, or null if ambiguous / none. */
export function tryResolveMotorPolicyFromText(userText: string, motorPolicies: Policy[]): Policy | null {
  if (motorPolicies.length === 0) return null
  const lower = normalize(userText)
  const c = compact(userText)

  for (const p of motorPolicies) {
    const pnCompact = compact(p.policyNumber)
    if (pnCompact.length >= 6 && c.includes(pnCompact)) return p
  }

  if (/\bthird\s*party\b/i.test(userText)) {
    const hit = motorPolicies.find((p) => /third/i.test(p.name))
    if (hit) return hit
  }
  if (/\bcomprehensive\b/i.test(userText)) {
    const hit = motorPolicies.find((p) => /comprehensive/i.test(p.name))
    if (hit) return hit
  }
  if (/\bown\s*damage\b/i.test(userText)) {
    const hit = motorPolicies.find((p) => /own\s*damage/i.test(p.name))
    if (hit) return hit
  }

  const hits: Policy[] = []
  for (const p of motorPolicies) {
    if (!p.vehicle) continue
    const tokens = p.vehicle
      .toLowerCase()
      .split(/[\s,/]+/)
      .filter((w) => w.length > 2)
    const tokenHit = tokens.some((t) => lower.includes(t))
    if (tokenHit) hits.push(p)
  }
  if (hits.length === 1) return hits[0]
  if (hits.length > 1) {
    const byActiva = hits.filter((p) => /\bactiva\b/i.test(p.vehicle ?? ""))
    if (byActiva.length === 1) return byActiva[0]
    const byNexon = hits.filter((p) => /\bnexon\b/i.test(p.vehicle ?? ""))
    if (byNexon.length === 1) return byNexon[0]
    return null
  }

  if (/\bactiva\b/i.test(lower)) {
    const a = motorPolicies.find((p) => /\bactiva\b/i.test(p.vehicle ?? ""))
    if (a) return a
  }
  if (/\becosport\b/i.test(lower)) {
    const e = motorPolicies.find((p) => /\becosport\b/i.test(p.vehicle ?? ""))
    if (e) return e
  }

  return null
}

/** Infer edit field from free text (tighter than workflow intent). */
export function tryResolveEditKindFromText(userText: string): EndorsementEditKind | null {
  const t = userText.trim()
  if (!t) return null
  if (detectChassisInText(t)) return "chassis_number"
  if (detectEngineInText(t)) return "engine_number"
  if (/\b(edit|change|update|correct)\b.*\b(phone|mobile|contact\s*number)\b/i.test(t)) return "phone_number"
  if (/\b(phone|mobile)\b.*\b(edit|change|update)\b/i.test(t)) return "phone_number"
  if (detectPolicyHolderEmailInText(t)) return "policy_holder_email"
  if (detectPolicyHolderNameInText(t)) return "policy_holder_name"
  return null
}

function detectChassisInText(t: string): boolean {
  return (
    /\bchassis\s*(number|no\.?)?\b/i.test(t) ||
    /\bchasis\s*(number|no\.?)?\b/i.test(t) ||
    (/\bchassis\b/i.test(t) && /\b(edit|change|update|correct)\b/i.test(t))
  )
}

function detectEngineInText(t: string): boolean {
  return /\bengine\s*(number|no\.?)?\b/i.test(t) && /\b(edit|change|update|correct)\b/i.test(t)
}

function detectPolicyHolderEmailInText(t: string): boolean {
  return (
    /\b(policy\s*holder|insured)\b.*\bemail\b|\bemail\b.*\b(policy\s*holder|insured|holder)\b/i.test(t) ||
    /\b(edit|change|update|correct)\b.*\bemail\b/i.test(t)
  )
}

function detectPolicyHolderNameInText(t: string): boolean {
  return (
    /\bpolicy\s*holder\s+name\b/i.test(t) ||
    /\b(policy\s*holder|insured)\b.*\bname\b/i.test(t) ||
    /\b(edit|change|update|correct)\b.*\b(policy\s*holder|insured)\b.*\bname\b/i.test(t)
  )
}

/**
 * First screen of the endorsement wizard: policy pick, edit pick, mode pick only, or no eligible policy.
 */
export function buildEndorsementWizardBootstrap(
  userText: string,
  workflowIntent: ChatWorkflowIntent,
  customerName: string,
  policies: Policy[],
): EndorsementWizardBootstrap {
  const pickable = listPoliciesForEndorsementPolicyPick(policies)
  if (pickable.length === 0) {
    return { entry: "no_motor" }
  }

  const editFromIntent = workflowIntentKindToEditKind(workflowIntent.kind)
  const editFromText = tryResolveEditKindFromText(userText)
  const resolvedEdit = editFromText ?? editFromIntent

  const resolvedPolicy = tryResolveEndorsementPickerPolicy(userText, pickable)

  if (resolvedPolicy && resolvedEdit) {
    return {
      entry: "mode_pick",
      policy: resolvedPolicy,
      editKind: resolvedEdit,
      customerName,
    }
  }

  if (pickable.length >= 2 && !resolvedPolicy) {
    return { entry: "policy_pick", policies: pickable, customerName }
  }

  if (pickable.length >= 2 && resolvedPolicy && !resolvedEdit) {
    return { entry: "edit_pick", policy: resolvedPolicy, customerName }
  }

  const only = pickable[0]!
  if (resolvedEdit) {
    return { entry: "mode_pick", policy: only, editKind: resolvedEdit, customerName }
  }
  return { entry: "edit_pick", policy: only, customerName }
}

export function editKindToDisplayLabel(kind: EndorsementEditKind): string {
  const row = EDIT_RADIO_LABELS.find((r) => r.kind === kind)
  return row?.label ?? kind
}

export function editKindToShortCopyHint(kind: EndorsementEditKind): string {
  switch (kind) {
    case "policy_holder_email":
      return "policy-holder email"
    case "policy_holder_name":
      return "policy-holder name"
    case "phone_number":
      return "phone number on the policy"
    case "engine_number":
      return "engine number"
    case "chassis_number":
      return "chassis number"
    default:
      return "this policy edit"
  }
}
