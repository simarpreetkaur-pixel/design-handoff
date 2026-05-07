import type { JTBD, Policy, AgentAction } from "@/types/crm"

import { shortenVehicleLine } from "@/lib/endorsementChatWizard"
import { RAISE_CLAIM_TALKTRACK } from "@/lib/raiseClaimGuidanceCopy"

/** Same steps as chat-created raise-claim JTBD — use for demo JTBDs so Agent Actions stay aligned. */
export function buildStandardRaiseClaimAgentActions(idPrefix: string): AgentAction[] {
  return [
    {
      id: `${idPrefix}-1`,
      step: 1,
      description: "Request customer to share RC and license copy",
      cta: "Request RC",
      completed: false,
    },
    {
      id: `${idPrefix}-2`,
      step: 2,
      description: "Once the customer responds with the RC copy, download it from email.",
      cta: "",
      completed: false,
    },
    {
      id: `${idPrefix}-3`,
      step: 3,
      description: "Raise a claim on customer's behalf using link.",
      cta: "Raise Claim",
      completed: false,
    },
  ]
}

function claimTabVehicleSubtitle(policy: Policy): string {
  if (policy.vehicle?.trim()) {
    return shortenVehicleLine(policy.vehicle)
  }
  return policy.name.trim() || policy.type
}

/** JTBD injected when the agent completes the raise-claim chat wizard with “Yes, create new workflow”. */
export function createChatRaiseClaimJtbd(policy: Policy): JTBD {
  const vehicleSubtitle = claimTabVehicleSubtitle(policy)
  return {
    id: `jtbd-chat-raise-claim-${Date.now()}`,
    type: "claim",
    title: "Raise a Claim",
    vehicle: vehicleSubtitle,
    isActive: true,
    status: [],
    aiSummary: {
      sectionHeading: "Tip:",
      bullets: [RAISE_CLAIM_TALKTRACK],
    },
    agentActions: buildStandardRaiseClaimAgentActions("chat-raise-claim"),
    quickActions: ["Send communication", "Open Advisor UI", "Schedule CH Appointment"],
    askInChatPrefill: `What should I verify on policy ${policy.policyNumber} before raising this claim on behalf of the customer?`,
  }
}
