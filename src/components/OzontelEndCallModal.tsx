import { MoreHorizontal, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useCall } from "@/context/CallContext"
import { mockCustomers } from "@/data/mockCustomers"

type OzontelEndCallModalProps = {
  isVisible: boolean
  onEndCall?: () => void
  onClose?: () => void
}

export function OzontelEndCallModal({ 
  isVisible, 
  onEndCall,
  onClose 
}: OzontelEndCallModalProps) {
  const callState = useCall()

  if (!isVisible) return null

  // Get current customer data from call state
  const customerId = callState.data.customerId
  const customerData = customerId ? mockCustomers[customerId] : null
  const customer = customerData?.customer

  // Duration only for metered phone calls; CRM viewing_crm has no start time
  const callDuration =
    callState.state === "active_call" && callState.data.callStartTime
      ? Math.floor(
          (Date.now() - callState.data.callStartTime.getTime()) / 1000,
        )
      : 0

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }

  // Fallback data if no customer found
  const displayName = customer?.name || "Unknown Caller"
  const displayPhone = customer?.phone || "+91 XXXXX XXXXX"
  const initials = displayName
    .split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 z-[70]"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="fixed left-6 bottom-[5.1rem] z-[80] w-[312px]">
        {/* Main Ozontel Container */}
        <div className="overflow-hidden rounded-lg border border-[#e7e7f0] bg-white shadow-[0px_4px_4px_0px_rgba(0,0,0,0.25)]">
          {/* Header */}
          <div className="flex h-[46px] items-center justify-between border-b border-[#e7e7f0] bg-white px-2.5 py-2">
            <div className="flex items-center gap-2">
              <h3 className="text-[18px] font-bold leading-[34px] text-black">
                Ozontel
              </h3>
              {callState.state === "active_call" && (
                <div className="flex items-center gap-1 text-[12px] text-[#0fa457]">
                  <div className="h-2 w-2 animate-pulse rounded-full bg-[#0fa457]" />
                  <span className="font-semibold">ON CALL</span>
                </div>
              )}
            </div>
            <button
              onClick={onClose}
              className="flex h-7 w-7 items-center justify-center rounded-md bg-[#ede7fb] p-1 hover:bg-[#e4d7ff] transition-colors"
              title="Close"
            >
              <MoreHorizontal className="h-5 w-5 text-[#7c47e1]" />
            </button>
          </div>

          {/* Call Interface Content */}
          <div className="p-5">
            <div className="mx-auto w-[270px]">
              {/* Call Duration */}
              {callState.state === 'active_call' && callState.data.callStartTime && (
                <div className="text-center mb-4">
                  <div className="font-euclid text-[14px] text-[#6c6c80]">Call Duration</div>
                  <div className="font-euclid text-[20px] font-semibold text-[#2c2067]">
                    {formatDuration(callDuration)}
                  </div>
                </div>
              )}

              {/* User Profile */}
              <div className="mb-8 mt-8 flex flex-col items-center gap-3">
                {/* Avatar */}
                <div className="relative">
                  <div className="flex h-[68.5px] w-[68.5px] items-center justify-center rounded-full bg-gradient-to-br from-[#e87d7d] to-[#d83d37]">
                    <span className="text-[32.88px] font-light text-white">
                      {initials}
                    </span>
                  </div>
                  {/* Call indicator */}
                  {callState.state === 'active_call' && (
                    <div className="absolute -bottom-1 -right-1 flex h-6 w-6 items-center justify-center rounded-full bg-[#0fa457] border-2 border-white">
                      <Phone className="h-3 w-3 text-white" />
                    </div>
                  )}
                </div>
                
                {/* User Info */}
                <div className="text-center">
                  <h4 className="text-xl font-bold text-black">
                    {displayName}
                  </h4>
                  <p className="text-xs font-bold text-black">
                    {displayPhone}
                  </p>
                </div>
              </div>

              {/* End Call Button */}
              <div className="flex justify-center">
                <Button
                  onClick={onEndCall}
                  className="h-12 w-[170px] rounded-lg bg-[#dc3545] px-5 py-2.5 text-base font-semibold tracking-[0.1px] text-white hover:bg-[#dc3545]/90 focus:ring-2 focus:ring-[#dc3545]/20 transition-colors"
                >
                  <Phone className="h-4 w-4 mr-2" />
                  End Call
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}