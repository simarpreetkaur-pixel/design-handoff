/**
 * Static prior-call transcript for Claim Status Hello — revealed via “View previous activity”.
 */

export type HelloPreviousActivityRow =
  | { id: string; kind: "session_divider"; label: string }
  | { id: string; kind: "ai"; text: string }
  | { id: string; kind: "cx"; text: string; identityLabel: string }

export function buildClaimStatusPreviousActivityRows(vehicleLabel: string): HelloPreviousActivityRow[] {
  const vehicle = vehicleLabel.trim() || "Tata Nexon"

  return [
    { id: "pa-div-raise", kind: "session_divider", label: "10 Feb · Raise a claim" },
    {
      id: "pa-raise-ai-1",
      kind: "ai",
      text: `Customer wanted to raise a claim for their ${vehicle}.`,
    },
    {
      id: "pa-raise-ai-2",
      kind: "ai",
      text: "What would you like to do?",
    },
    {
      id: "pa-raise-cx-1",
      kind: "cx",
      identityLabel: "CX Agent",
      text: "Raise it on customer's behalf",
    },
    {
      id: "pa-raise-ai-3",
      kind: "ai",
      text: "Claim registered for the rear-bumper damage. Shared FNOL reference and ACKO app deep link with the customer.",
    },
    { id: "pa-div-status", kind: "session_divider", label: "12 Feb · Claim status check" },
    {
      id: "pa-cs-ai-1",
      kind: "ai",
      text: `Customer called again to check claim status for their ${vehicle}.`,
    },
    {
      id: "pa-cs-cx-rahul",
      kind: "cx",
      identityLabel: "CX Rahul",
      text:
        "Informed the customer that the survey slot on 12 Feb was missed, the claim is still active, and repair estimate will stay on hold until Ops reschedules the survey.",
    },
    {
      id: "pa-cs-ai-2",
      kind: "ai",
      text: "Logged the update on the claim. Suggested the customer use the ACKO app to pick a garage once survey is cleared.",
    },
  ]
}
