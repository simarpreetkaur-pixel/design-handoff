/** Opening line — vehicle label includes year when present (e.g. Tata Nexon 2025). */
export function helloRsaOpeningLead(vehicleLabel: string): string {
  return `If the customer is calling for Road Side Assistance on their ${vehicleLabel}, transfer the call to RSA team.`
}

export const helloRsaTransferFollowupAi =
  "RSA transfer is ready — complete the handoff using your usual warm-transfer flow when the customer confirms."
