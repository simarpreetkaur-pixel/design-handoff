import { MoreHorizontal } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCall } from "@/context/CallContext"
import { OzontelDialerDefault } from "@/components/OzontelDialerDefault"
import { mockCustomers } from "@/data/mockCustomers"

type OzontelDialerProps = {
  isVisible: boolean
  onAnswerCall?: () => void
  onClose?: () => void
  onCall?: (phoneNumber: string) => void
}

export function OzontelDialer({ 
  isVisible, 
  onAnswerCall,
  onClose,
  onCall
}: OzontelDialerProps) {
  const callState = useCall()

  if (!isVisible) return null

  // For active calls, show customer-specific dialer
  if (callState.state === 'ringing' && callState.data.customerId) {
    const customerData = mockCustomers[callState.data.customerId]
    const customer = customerData?.customer
    
    if (customer) {
      // Get initials for avatar
      const initials = customer.name
        .split(' ')
        .map(n => n[0])
        .join('')
        .toUpperCase()
        .substring(0, 2)

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

            {/* Call Interface Content */}
            <div className="p-5">
              <div className="mx-auto w-[270px]">
                {/* User Profile */}
                <div className="mb-8 mt-12 flex flex-col items-center gap-3">
                  {/* Avatar */}
                  <div className="relative">
                    <div className="flex h-[68.5px] w-[68.5px] items-center justify-center rounded-full bg-gradient-to-br from-[#e87d7d] to-[#d83d37]">
                      <span className="text-[32.88px] font-light text-white">
                        {initials}
                      </span>
                    </div>
                  </div>
                  
                  {/* User Info */}
                  <div className="text-center">
                    <h4 className="text-xl font-bold text-black">
                      {customer.name}
                    </h4>
                    <p className="text-xs font-bold text-black">
                      {customer.phone}
                    </p>
                  </div>
                </div>

                {/* Answer Call Button */}
                <div className="flex justify-center">
                  <Button
                    onClick={onAnswerCall}
                    className="h-12 w-[170px] rounded-lg bg-[#0fa457] px-5 py-2.5 text-base font-semibold tracking-[0.1px] text-white hover:bg-[#0fa457]/90 focus:ring-2 focus:ring-[#0fa457]/20"
                  >
                    Answer Call
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )
    }
  }

  // For all other states (idle, searching, viewing_crm), show default dialer
  return (
    <OzontelDialerDefault
      isVisible={isVisible}
      onCall={onCall}
      onClose={onClose}
    />
  )
}