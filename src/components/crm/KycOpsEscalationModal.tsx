import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

/**
 * Escalation to KYC Ops — aligns with OMNI Post-Sales escalation pattern
 * @see https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=5927-15880
 */
export type KycOpsEscalationModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerName: string
  claimId: string
  policyNumber: string
}

export function KycOpsEscalationModal({
  open,
  onOpenChange,
  customerName,
  claimId,
  policyNumber,
}: KycOpsEscalationModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg gap-5 border-[#e7e7f0] bg-white p-5 font-euclid sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="space-y-1.5 text-left">
          <DialogTitle className="text-[16px] font-medium leading-6 text-[#36354c]">
            Escalate to KYC Ops
          </DialogTitle>
          <DialogDescription className="text-[14px] leading-5 text-[#5b5675]">
            This will raise a ticket to KYC Ops with the claim context. Confirm the identifiers below before
            submitting.
          </DialogDescription>
        </DialogHeader>

        <div className="flex flex-col gap-4">
          <div className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[#5b5675]">Claim ID</span>
            <p className="rounded-md border border-[#e7e7f0] bg-[#fafafa] px-3 py-2 text-[14px] font-medium text-[#36354c]">
              {claimId}
            </p>
          </div>
          <div className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[#5b5675]">Policy number</span>
            <p className="rounded-md border border-[#e7e7f0] bg-[#fafafa] px-3 py-2 text-[14px] text-[#36354c]">
              {policyNumber}
            </p>
          </div>
          <div className="grid gap-1.5">
            <span className="text-[13px] font-medium text-[#5b5675]">Customer</span>
            <p className="rounded-md border border-[#e7e7f0] bg-[#fafafa] px-3 py-2 text-[14px] text-[#36354c]">
              {customerName}
            </p>
          </div>
        </div>

        <DialogFooter className="mt-1 sm:justify-end">
          <Button
            type="button"
            className="h-10 rounded-md bg-[#7c47e1] px-6 text-[14px] font-medium text-white hover:bg-[#7c47e1]/90"
            onClick={() => onOpenChange(false)}
          >
            Submit escalation
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
