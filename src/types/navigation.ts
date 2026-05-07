import type { ChatMockCase } from "@/components/crm/AIChatPanel"

/** Passed via React Router `location.state` when opening CRM from homepage demo journeys */
export type CrmDemoState = {
  chatMockCase?: ChatMockCase
  /** JTBD card id from mock data (e.g. renewal on Rajesh) */
  initialSelectedJtbdId?: string
  /** Override opening-call context for this demo session (merged over mock customer). */
  callContextOverride?: {
    reason?: string
    vehicle?: string
  }
}
