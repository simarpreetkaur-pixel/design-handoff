import { useState } from "react"
import { MoreHorizontal, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"

type OzontelDialerDefaultProps = {
  isVisible: boolean
  onCall?: (phoneNumber: string) => void
  onClose?: () => void
}

export function OzontelDialerDefault({ 
  isVisible, 
  onCall,
  onClose 
}: OzontelDialerDefaultProps) {
  const [phoneNumber, setPhoneNumber] = useState("")

  if (!isVisible) return null

  const handleCall = () => {
    if (phoneNumber.trim() && onCall) {
      onCall(phoneNumber.trim())
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleCall()
    }
  }

  const formatPhoneNumber = (value: string) => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')
    
    // Format as +91 XXXXX XXXXX for Indian numbers
    if (digits.length <= 10) {
      return digits.replace(/(\d{5})(\d{0,5})/, '$1 $2').trim()
    }
    
    // For longer numbers, just group them nicely
    return digits.replace(/(\d{2})(\d{5})(\d{0,5})/, '+$1 $2 $3').trim()
  }

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedValue = formatPhoneNumber(e.target.value)
    setPhoneNumber(formattedValue)
  }

  return (
    <div className="fixed left-6 bottom-[5.1rem] z-[60] w-[312px]">
      {/* Main Ozontel Container */}
      <div className="overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
        {/* Header */}
        <div className="flex h-[46px] items-center justify-between border-b border-[#e7e7f0] bg-white px-2.5 py-2">
          <h3 className="text-[18px] font-bold leading-[34px] text-black">
            Ozontel
          </h3>
          <button 
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ede7fb] p-1 hover:bg-[#ddd0f7] transition-colors"
            title="Close dialer"
          >
            <MoreHorizontal className="h-5 w-5 text-[#7c47e1]" />
          </button>
        </div>

        {/* Dialer Content */}
        <div className="p-5">
          <div className="mx-auto w-[270px]">
            {/* Dial Interface */}
            <div className="flex flex-col items-center gap-6">
              {/* Title */}
              <div className="text-center">
                <h4 className="font-euclid text-[20px] font-semibold text-[#2c2067] mb-2">
                  Dial a Number
                </h4>
                <p className="font-euclid text-[14px] text-[#6c6c80]">
                  Enter phone number to make a call
                </p>
              </div>

              {/* Phone Number Input */}
              <div className="w-full">
                <div className="relative">
                  <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
                    <Phone className="h-5 w-5 text-[#6c6c80]" />
                  </div>
                  <input
                    type="tel"
                    placeholder="+91 XXXXX XXXXX"
                    value={phoneNumber}
                    onChange={handlePhoneChange}
                    onKeyPress={handleKeyPress}
                    className="w-full rounded-lg border border-[#e7e7f0] bg-white pl-11 pr-4 py-3 font-euclid text-[16px] text-[#2c2067] placeholder-[#6c6c80] outline-none focus:border-[#7c47e1] focus:ring-2 focus:ring-[#7c47e1]/20 transition-colors"
                    maxLength={20}
                  />
                </div>
              </div>

              {/* Number Pad (Optional - can be added later) */}
              <div className="text-center">
                <p className="font-euclid text-[12px] text-[#6c6c80] mb-4">
                  Or use the number pad below
                </p>
                <div className="text-[14px] text-[#a0a0a0]">
                  Number pad coming soon...
                </div>
              </div>

              {/* Call Button */}
              <div className="w-full mt-4">
                <Button
                  onClick={handleCall}
                  disabled={!phoneNumber.trim()}
                  className="w-full h-[48px] rounded-lg bg-[#0fa457] hover:bg-[#0d8a49] disabled:bg-[#e7e7f0] disabled:text-[#a0a0a0] text-white font-euclid text-[16px] font-semibold transition-colors"
                  title={phoneNumber.trim() ? `Call ${phoneNumber}` : "Enter a phone number"}
                >
                  <Phone className="h-5 w-5 mr-2" />
                  {phoneNumber.trim() ? `Call ${phoneNumber}` : 'Enter Number'}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}