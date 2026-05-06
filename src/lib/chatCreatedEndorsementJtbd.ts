import type { EndorsementEditKind, JTBD, Policy } from "@/types/crm"

import { shortenVehicleLine } from "@/lib/endorsementChatWizard"
import { endorsementRequiresRc } from "@/lib/endorsementRcWorkflow"

function describeEditForActions(kind: EndorsementEditKind): string {
  switch (kind) {
    case "policy_holder_email":
      return "the policy holder email ID"
    case "policy_holder_name":
      return "the policy holder name"
    case "phone_number":
      return "the registered phone number on the policy"
    case "engine_number":
      return "the engine number on the policy"
    case "chassis_number":
      return "the chassis number on the policy"
    default:
      return "the requested policy details"
  }
}

/** Second line of JTBD tab — matches Claim/Renewal tabs (vehicle only, no policy number). */
function jtbdTabVehicleSubtitle(policy: Policy): string {
  return shortenVehicleLine(policy.vehicle ?? policy.name)
}

/** JTBD injected when the agent completes the endorsement wizard with “create workflow”. */
export function createChatEndorsementJtbd(policy: Policy, editKind: EndorsementEditKind): JTBD {
  const change = describeEditForActions(editKind)
  const vehicleSubtitle = jtbdTabVehicleSubtitle(policy)
  const needsRc = endorsementRequiresRc(editKind)

  const agentActions = needsRc
    ? [
        {
          id: "chat-endorse-rc-1",
          step: 1,
          description:
            "Request RC copy from the customer over email.",
          cta: "Request RC",
          completed: false,
        },
        {
          id: "chat-endorse-rc-2",
          step: 2,
          description: "Once the customer responds with the RC copy, download it from email.",
          cta: "",
          completed: false,
        },
        {
          id: "chat-endorse-rc-3",
          step: 3,
          description:
            "Open Edit Policy, update the policy details, and upload the RC copy.",
          cta: "Edit Policy",
          completed: false,
        },
        {
          id: "chat-endorse-rc-4",
          step: 4,
          description:
            "Inform the customer that the update TAT is typically up to 48 hours once inputs are complete.",
          cta: "",
          completed: false,
        },
      ]
    : [
        {
          id: "chat-endorse-email-1",
          step: 1,
          description: `Send an ACKO Alert to the customer so they can update ${change} on ${policy.name}.`,
          cta: "Send ACKO Alert",
          completed: false,
        },
        {
          id: "chat-endorse-email-2",
          step: 2,
          description:
            "Open Edit Policy and make the update on the customer's behalf. RC copy is not required for email ID changes.",
          cta: "Edit Policy",
          completed: false,
        },
        {
          id: "chat-endorse-email-3",
          step: 3,
          description:
            "Inform the customer that the update TAT is typically up to 48 hours once inputs are complete.",
          cta: "",
          completed: false,
        },
      ]

  return {
    id: `jtbd-chat-endorsement-${Date.now()}`,
    type: "endorsement",
    title: "Edit Policy",
    vehicle: vehicleSubtitle,
    isActive: true,
    status: [],
    agentActions,
    quickActions: ["Send communication", "Send ACKO Alert", "Edit Policy"],
    askInChatPrefill: `What should I verify in Edit Policy before updating ${change} for policy ${policy.policyNumber}?`,
  }
}
