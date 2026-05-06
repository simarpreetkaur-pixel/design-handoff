import type { JTBD, Policy } from "@/types/crm"

function norm(s: string): string {
  return s.toLowerCase().replace(/\s+/g, " ").trim()
}

function significantTokens(s: string): string[] {
  return norm(s)
    .split(" ")
    .filter((t) => t.length > 2 && !/^20\d{2}$/.test(t))
}

/**
 * Best-effort match of the ongoing JTBD’s vehicle/subtitle line to an active policy
 * (motor by vehicle string, health by GMC / health hints).
 */
export function resolvePolicyForJtbd(jtbd: JTBD, activePolicies: Policy[]): Policy | null {
  if (activePolicies.length === 0) return null

  const jvRaw = jtbd.vehicle?.trim() ?? ""
  if (!jvRaw || jvRaw === "Various") {
    return activePolicies.find((p) => p.type === "Motor Insurance") ?? activePolicies[0] ?? null
  }

  const jn = norm(jvRaw)
  if (
    jn.includes("gmc") ||
    jn.includes("health policy") ||
    (jn.includes("acko") && jn.includes("medical"))
  ) {
    const health = activePolicies.find((p) => p.type.includes("Health"))
    if (health) return health
  }

  for (const p of activePolicies) {
    const v = p.vehicle?.trim()
    if (!v) continue
    const pv = norm(v)
    if (pv === jn || pv.includes(jn) || jn.includes(pv)) return p
  }

  for (const t of significantTokens(jvRaw)) {
    for (const p of activePolicies) {
      const v = p.vehicle?.trim()
      if (v && norm(v).includes(t)) return p
    }
  }

  return activePolicies.find((p) => p.type === "Motor Insurance") ?? activePolicies[0] ?? null
}

/** Single-line label for ACKO Alert policy dropdown (“Plan- Vehicle”). */
export function formatPolicyAlertOptionLabel(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return `${policy.name}- ${v}`
  const plan = policy.planDisplayName?.trim()
  if (plan) return `${policy.name}- ${plan}`
  return policy.name
}
