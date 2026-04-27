import { Phone } from "lucide-react"

import { SIMULATE_LIVE_SCENARIOS, type SimulateLiveScenarioId } from "@/data/simulateCallScenarios"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

type SimulateCallPickerDialogProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSelectScenario: (customerId: SimulateLiveScenarioId) => void
}

export function SimulateCallPickerDialog({
  open,
  onOpenChange,
  onSelectScenario,
}: SimulateCallPickerDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="w-[min(100%-1.5rem,440px)] gap-0 border border-[#e7e7f0] bg-white p-0 shadow-lg sm:max-w-[440px]"
        showCloseButton
      >
        <DialogHeader className="border-b border-[#f0f0f6] px-6 py-4 text-left">
          <div className="mb-1 flex h-9 w-9 items-center justify-center rounded-full bg-[#f1edfc]">
            <Phone className="h-4 w-4 text-[#7c47e1]" aria-hidden />
          </div>
          <DialogTitle className="font-euclid text-[18px] font-semibold leading-6 text-[#2c2067]">
            Simulate live call
          </DialogTitle>
          <p className="pt-1 font-euclid text-[14px] font-normal leading-5 text-[#5b5675]">
            Choose a customer and scenario. You’ll get an incoming call screen, then the CRM
            after you answer.
          </p>
        </DialogHeader>

        <ul className="max-h-[min(60vh,420px)] list-none space-y-0 overflow-y-auto p-2">
          {SIMULATE_LIVE_SCENARIOS.map((row) => (
            <li key={row.customerId}>
              <Button
                type="button"
                variant="ghost"
                className="h-auto w-full flex-col items-stretch gap-0.5 rounded-xl px-4 py-3.5 text-left font-euclid hover:bg-[#f8f7fc] focus-visible:ring-2 focus-visible:ring-[#7c47e1]/30"
                onClick={() => {
                  onSelectScenario(row.customerId)
                  onOpenChange(false)
                }}
              >
                <span className="text-[15px] font-medium leading-5 text-[#040222]">
                  {row.displayName}
                </span>
                <span className="text-[13px] font-normal leading-5 text-[#5b5675]">
                  {row.subheader}
                </span>
              </Button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  )
}
