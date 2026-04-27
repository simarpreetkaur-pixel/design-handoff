import { useEffect, useState } from "react"
import { Phone } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

interface EditPhoneDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  currentPhone: string
  onSave: (newPhone: string) => void
}

export function EditPhoneDialog({
  open,
  onOpenChange,
  currentPhone,
  onSave,
}: EditPhoneDialogProps) {
  const [phone, setPhone] = useState(currentPhone)

  useEffect(() => {
    if (open) {
      setPhone(currentPhone)
    }
  }, [open, currentPhone])

  const handleSave = () => {
    onSave(phone.trim())
    onOpenChange(false)
  }

  const handleCancel = () => {
    setPhone(currentPhone) // Reset to original
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Phone className="h-5 w-5" />
            Edit Phone Number
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-[#5b5675]">
            The caller may be using a different number than the one on their policy. 
            Update the display to show the correct lookup results.
          </p>
          
          <div className="space-y-2">
            <label htmlFor="phone-input" className="text-sm font-medium text-[#040222]">
              Phone Number
            </label>
            <div className="flex items-center gap-3 rounded-lg border border-[#e7e7f0] px-4 py-3 shadow-sm transition-colors focus-within:border-[#7c47e1] focus-within:ring-2 focus-within:ring-[#7c47e1]/20">
              <Phone className="h-5 w-5 text-[#5b5675]" />
              <input
                id="phone-input"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="Enter phone number"
                className="w-full border-0 bg-transparent text-base text-[#040222] placeholder-[#5b5675] outline-none"
              />
            </div>
          </div>
          
          <div className="flex justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleCancel}
              className="px-4 py-2"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSave}
              className="bg-[#7c47e1] px-4 py-2 hover:bg-[#7c47e1]/90"
            >
              Save
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}