import { ArrowLeft } from "lucide-react"

import type { JTBDType, Policy } from "@/types/crm"
import { AiGuideCard } from "@/components/crm/AiGuideCard"

export type FlowActionValue =
  | "send_alert"
  | "send_communication"
  | "send_email"
  | "transfer_to_team"
  | "view_policy_document"
  | "share_document"
  | "raise_claim"
  | "endorsements"
  | "coverages"
  | "rapido_claims"
  /** Anita issuance — Related SOPs (opens same detail shell as other flow actions). */
  | "related_sop_kyc_name"
  | "related_sop_pre_inspection"

const PAGE_COPY: Record<
  FlowActionValue,
  { title: string; subtitle: string; description: string }
> = {
  send_alert: {
    title: "Send Alert",
    subtitle: "Send garage selection alert to customer",
    description:
      "This will send an in-app notification to the customer asking them to select their preferred garage for vehicle drop-off.",
  },
  send_communication: {
    title: "Send Communication",
    subtitle: "Share garage details via WhatsApp",
    description:
      "This will send garage contact details and location information to the customer via WhatsApp message.",
  },
  send_email: {
    title: "Send Email",
    subtitle: "Escalate issue via email",
    description:
      "This will send an email to the relevant team (KYC Ops) with customer details and issue context to expedite resolution.",
  },
  transfer_to_team: {
    title: "Transfer to Another Team",
    subtitle: "Hand over the call to specialized team",
    description:
      "This will transfer the active call to the appropriate specialist team who can better assist with this specific issue.",
  },
  view_policy_document: {
    title: "View policy document",
    subtitle: "Open the policy document in a secure view",
    description:
      "The customer’s policy document will open here. You can review coverage, terms, and share with the customer if needed.",
  },
  share_document: {
    title: "Share policy document",
    subtitle: "Send document link to the customer",
    description:
      "This will send a link to the policy document via SMS or email so the customer can access it on their device.",
  },
  raise_claim: {
    title: "Raise a Claim",
    subtitle: "Start a new claim for this policy",
    description:
      "You will be guided to capture claim details, incident information, and next steps. The customer can track progress in the app.",
  },
  endorsements: {
    title: "Endorsements",
    subtitle: "View or request policy changes",
    description:
      "View existing endorsements on this policy, or start a new endorsement request (e.g. vehicle or coverage updates).",
  },
  coverages: {
    title: "Coverages",
    subtitle: "See what is covered on this policy",
    description:
      "A full breakdown of inclusions, exclusions, and limits for this policy will be shown here for reference on the call.",
  },
  rapido_claims: {
    title: "Claims",
    subtitle: "Rapido trip policy claims",
    description:
      "View claim history and raise a new claim for this expired Rapido trip policy. The customer can track status in the app when applicable.",
  },
  related_sop_kyc_name: {
    title: "SOP: KYC name mismatch (Aadhaar vs policy)",
    subtitle: "Related SOP · Honda Activa 2026 issuance",
    description:
      "Use this when the policy name reflects a married surname but Aadhaar still shows the maiden name. Confirm both documents on file, capture the exact spelling mismatch, and document the last four attempts. Prefer a guided KYC re-upload when the customer can correct data in-app; escalate to KYC Ops only after re-upload fails twice or the case is time-bound for pre-inspection.",
  },
  related_sop_pre_inspection: {
    title: "SOP: Pre-inspection readiness after KYC",
    subtitle: "Related SOP · Motor issuance",
    description:
      "Pre-inspection should not be promised until KYC is green. If the customer pushes for inspection, explain the dependency chain (KYC → inspection slot → activation). Offer proactive ETA messaging and align with the inspection vendor calendar before sending any hard commitment.",
  },
}

function isFlowActionValue(key: string): key is FlowActionValue {
  return key in PAGE_COPY
}

const GENERIC: { title: string; subtitle: string; description: string } = {
  title: "Action",
  subtitle: "Complete this step",
  description: "Details for this action will appear here.",
}

function productLabelForPolicy(policy: Policy): string {
  if (policy.productCode === "car_comprehensive") {
    return "Car_Comprehensive"
  }
  return policy.name
}

const COVERAGE_CHAT_PREFILL = "What’s covered on this Tata Nexon Car_Comprehensive policy?"

const RAJ_KAPOOR_CUSTOMER_ID = "raj-kapoor"

type ActionDetailPageProps = {
  actionKey: string
  onBack: () => void
  claimPolicy?: Policy | null
  onAskInChatFromAction?: (message: string, jtbdType: JTBDType) => void
  customerId?: string
}

export function ActionDetailPage({
  actionKey,
  onBack,
  claimPolicy = null,
  onAskInChatFromAction,
  customerId,
}: ActionDetailPageProps) {
  const content = isFlowActionValue(actionKey) ? PAGE_COPY[actionKey] : GENERIC

  const isRaiseClaimWithContext =
    actionKey === "raise_claim" && claimPolicy != null

  if (isRaiseClaimWithContext) {
    const p = claimPolicy
    const productLabel = productLabelForPolicy(p)
    const vehicleLine = p.vehicle ?? "this vehicle"

    const raiseClaimGuideBullets =
      customerId === RAJ_KAPOOR_CUSTOMER_ID
        ? [
            "Car comprehensive — confirm coverages before saying what’s claimable.",
          ]
        : [
            `${productLabel} · ${vehicleLine} — use as the policy baseline.`,
            "Before FNOL: what, when, where; third parties or injuries?",
            "Match answers to coverages (OD, liability, add-ons); don’t over-promise.",
          ]

    return (
      <div className="w-full">
        <div className="mb-2 flex items-center gap-3 border-b border-[#e7e7f0] bg-white px-4 py-4">
          <button
            type="button"
            onClick={onBack}
            className="flex h-9 w-9 items-center justify-center rounded-full text-[#2c2067] transition-colors hover:bg-[#f1edfc]"
            title="Go back"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h2 className="font-euclid text-[18px] font-medium leading-6 text-[#2c2067]">
              {content.title}
            </h2>
            <p className="font-euclid text-[14px] font-normal leading-5 text-[#6c6c80]">
              {vehicleLine} · {productLabel}
            </p>
          </div>
        </div>

        <div className="w-full max-w-4xl space-y-6 px-4 py-6">
          <AiGuideCard
            bullets={raiseClaimGuideBullets}
            viewDetailsLabel="ASK ABOUT COVERAGES"
            onViewDetails={() => onAskInChatFromAction?.(COVERAGE_CHAT_PREFILL, "claim")}
          />

          <div className="rounded-xl border border-[#e7e7f0] bg-white p-6 shadow-sm">
            <div className="text-center">
              <div className="mb-4">
                <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1edfc]">
                  <div className="h-8 w-8 rounded-full bg-[#7c47e1] opacity-20" />
                </div>
                <h3 className="mb-2 font-euclid text-[16px] font-medium text-[#2c2067]">
                  {content.title}
                </h3>
                <p className="font-euclid text-[14px] leading-5 text-[#6c6c80]">
                  {content.description}
                </p>
              </div>

              <div className="mx-auto my-6 max-w-sm space-y-3">
                <div className="h-2.5 rounded bg-[#f0f0f5]" />
                <div className="mx-auto h-2.5 w-4/5 rounded bg-[#f0f0f5]" />
                <div className="mx-auto h-2.5 w-3/5 rounded bg-[#f0f0f5]" />
              </div>

              <div className="mt-8 rounded-lg bg-[#f6f6f9] p-4">
                <p className="font-euclid text-[12px] leading-relaxed text-[#6c6c80]">
                  This is a placeholder page. The full {content.title.toLowerCase()} experience will
                  be implemented here.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-3 border-b border-[#e7e7f0] bg-white px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#2c2067] transition-colors hover:bg-[#f1edfc]"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-euclid text-[18px] font-medium leading-6 text-[#2c2067]">
            {content.title}
          </h2>
          <p className="font-euclid text-[14px] font-normal leading-5 text-[#6c6c80]">
            {content.subtitle}
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="rounded-xl border border-[#e7e7f0] bg-white p-6 shadow-sm">
          <div className="text-center">
            <div className="mb-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1edfc]">
                <div className="h-8 w-8 rounded-full bg-[#7c47e1] opacity-20" />
              </div>
              <h3 className="mb-2 font-euclid text-[16px] font-medium text-[#2c2067]">
                {content.title}
              </h3>
              <p className="font-euclid text-[14px] leading-5 text-[#6c6c80]">
                {content.description}
              </p>
            </div>

            <div className="mx-auto my-6 max-w-sm space-y-3">
              <div className="h-2.5 rounded bg-[#f0f0f5]" />
              <div className="mx-auto h-2.5 w-4/5 rounded bg-[#f0f0f5]" />
              <div className="mx-auto h-2.5 w-3/5 rounded bg-[#f0f0f5]" />
            </div>

            <div className="mt-8 rounded-lg bg-[#f6f6f9] p-4">
              <p className="font-euclid text-[12px] leading-relaxed text-[#6c6c80]">
                This is a placeholder page. The full {content.title.toLowerCase()} experience will
                be implemented here.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
