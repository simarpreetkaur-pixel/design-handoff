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

We need clear copies of your vehicle Registration Certificate (RC) and your driving licence to process your request. Please reply to this email with photos or PDFs of both documents.

Thank you,
CX agent
ACKO Insurance`

/** Default WhatsApp text when requesting RC copy (agent can edit before send). */
export const REQUEST_RC_COPY_WHATSAPP_MESSAGE = `Hi — we need clear photos or PDFs of your vehicle RC and your driving licence to process your request. Please share both here when you can.

Thank you,
ACKO CX`
