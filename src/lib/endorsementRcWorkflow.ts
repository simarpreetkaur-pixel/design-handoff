import type { EndorsementEditKind } from "@/types/crm"

/** Motor / identity fields where RC must be collected before Advisor UI update. */
export function endorsementRequiresRc(kind: EndorsementEditKind): boolean {
  return (
    kind === "policy_holder_name" ||
    kind === "engine_number" ||
    kind === "chassis_number" ||
    kind === "phone_number"
  )
}

/** Default email body for requesting RC copy (agent can edit before send). */
export const REQUEST_RC_COPY_EMAIL_BODY = `Dear Customer,

We need a clear copy of your vehicle Registration Certificate (RC) to process your Edit Policy request. Please reply to this email with a photo or PDF of your RC.

Thank you,
CX agent
ACKO Insurance`
