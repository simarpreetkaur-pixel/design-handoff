import { useState, useRef, useEffect } from "react"
import { Search, Phone, AlertCircle } from "lucide-react"
import { useLocation, useNavigate } from "react-router-dom"

import { CallSessionToast, type CallSessionToastVariant } from "@/components/CallSessionToast"
import { Button } from "@/components/ui/button"
import { IncomingCallModal } from "@/components/IncomingCallModal"
import { OzontelDialer } from "@/components/OzontelDialer"
import { SimulateCallPickerDialog } from "@/components/SimulateCallPickerDialog"
import { useCall } from "@/context/CallContext"
import type { SimulateLiveScenarioId } from "@/data/simulateCallScenarios"
import { performCustomerSearch } from "@/utils/customerSearch"

export function Homepage() {
  const navigate = useNavigate()
  const location = useLocation()
  const callState = useCall()
  const [searchQuery, setSearchQuery] = useState("")
  const [simulatePickerOpen, setSimulatePickerOpen] = useState(false)
  const [ozontelVisible, setOzontelVisible] = useState(false)
  const [sessionToast, setSessionToast] = useState<CallSessionToastVariant | null>(null)
  const [searchError, setSearchError] = useState("")
  const [isSearching, setIsSearching] = useState(false)
  /** Avoid clearing active call when the incoming modal closes right after "Answer" */
  const skipIncomingCloseResetRef = useRef(false)

  useEffect(() => {
    const s = location.state as { omniCallToast?: string } | undefined
    if (s?.omniCallToast !== "dispose") return
    navigate("/", { replace: true })
    queueMicrotask(() => {
      setSessionToast("dispose")
    })
  }, [location.state, navigate])

  useEffect(() => {
    if (!sessionToast) return
    const id = window.setTimeout(() => setSessionToast(null), 5000)
    return () => window.clearTimeout(id)
  }, [sessionToast])

  const handleSearch = async () => {
    const query = searchQuery.trim()
    if (!query) return

    setIsSearching(true)
    setSearchError("")
    
    // Start search state
    callState.startSearch(query)

    try {
      // Simulate brief search delay for better UX
      await new Promise(resolve => setTimeout(resolve, 500))
      
      const searchResult = performCustomerSearch(query)
      
      if (searchResult.found && searchResult.result) {
        // Customer found - navigate to CRM view in viewing_crm state
        callState.openCRMForCustomer(
          searchResult.result.customer.id,
          searchResult.result
        )
        navigate(`/crm/call/${searchResult.result.customer.id}`)
      } else {
        // Customer not found
        setSearchError("Customer not found. Please check the phone number, email, or name.")
        callState.reset()
      }
    } catch (error) {
      console.error("Search error:", error)
      setSearchError("An error occurred while searching. Please try again.")
      callState.reset()
    } finally {
      setIsSearching(false)
    }
  }

  const handleSimulateLiveCall = () => {
    setSimulatePickerOpen(true)
  }

  const handleSelectSimulateScenario = (customerId: SimulateLiveScenarioId) => {
    callState.startRing(customerId)
  }

  const handleOpenOzontel = () => {
    // Show appropriate dialer based on current call state
    if (callState.state === 'active_call') {
      // If on active call, this should show end call modal (handled in CRM view)
      return
    }
    
    // Open default Ozontel dialer
    setOzontelVisible(true)
  }

  const handleCloseOzontel = () => {
    setOzontelVisible(false)
  }

  const handleCall = (phoneNumber: string) => {
    // Mock call functionality - for now just show a toast
    console.log('Calling:', phoneNumber)
    setOzontelVisible(false)
    
    // For demo, we could start a ringing state with a generic customer
    // This is where you'd integrate with real telephony
    alert(`Calling ${phoneNumber}... (Mock call)`)
  }

  const handleAnswerCallFromModal = () => {
    // Answer the call from modal - transition to active call state
    const customerId = callState.data.customerId || "rajesh-kumar"

    skipIncomingCloseResetRef.current = true
    callState.answerCall(customerId)
    setOzontelVisible(false)
    navigate(`/crm/call/${customerId}`)
  }

  const handleAnswerCallFromOzontel = () => {
    // Answer the call from Ozontel dialer - transition to active call state
    const customerId = callState.data.customerId || "rajesh-kumar"
    
    callState.answerCall(customerId)
    setOzontelVisible(false)
    navigate(`/crm/call/${customerId}`)
  }

  const handleIncomingModalOpenChange = (open: boolean) => {
    if (!open) {
      if (skipIncomingCloseResetRef.current) {
        skipIncomingCloseResetRef.current = false
        return
      }
      if (callState.state === "ringing") {
        if (ozontelVisible) {
          setOzontelVisible(false)
        }
        callState.reset()
      }
    }
  }

  const handleCallTimeout = () => {
    if (ozontelVisible) {
      setOzontelVisible(false)
    }
    callState.reset()
    setSessionToast("timeout")
  }

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value)
    // Clear search error when user starts typing
    if (searchError) {
      setSearchError("")
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSearch()
    }
  }

  return (
    <div className="relative min-h-screen w-full bg-gradient-to-br from-[#f8f7fc] via-[#f3f7ff] to-[#f8fdff]">
      {/* Top Navigation */}
      <div className="flex h-[72px] w-full items-center gap-4 bg-white px-10 py-4 shadow-[0px_2px_10px_0px_rgba(0,0,0,0.08)]">
        {/* ACKO Logo */}
        <div className="flex h-10 items-center">
          <img
            src="/acko-logo.png"
            alt="ACKO"
            className="h-10 w-auto object-contain"
          />
        </div>

        {/* Separator */}
        <div className="h-8 w-px bg-gray-300" />

        {/* OMNI Support text */}
        <h1 className="text-[28px] font-normal leading-tight text-[#2c2067]">
          OMNI Support
        </h1>
      </div>

      {/* Main Content */}
      <div className="flex min-h-[calc(100vh-72px)] flex-col items-center justify-center px-4 py-20">
        {/* Welcome Section */}
        <div className="mb-10 flex flex-col items-center text-center">
          {/* Waving hand emoji */}
          <div className="mb-6 text-8xl">👋</div>
          
          {/* Welcome text */}
          <div className="space-y-2">
            <h2 className="text-4xl font-semibold leading-tight text-omni-n600">
              Hello, Welcome to{" "}
              <span className="text-[#7c47e1]">OMNI Support</span>
            </h2>
            <p className="text-base text-omni-n400">
              Search using registered mobile/ Policy Number or Email ID
            </p>
          </div>
        </div>

        {/* Search Section */}
        <div className="w-full max-w-2xl">
          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className={`flex flex-1 items-center gap-3 rounded-lg border px-4 py-3 shadow-sm transition-colors ${
              searchError ? 'border-red-300 bg-red-50' : 'border-[#e9e1e1] bg-white'
            }`}>
              <Search className={`h-5 w-5 ${searchError ? 'text-red-400' : 'text-omni-n400'}`} />
              <input
                type="text"
                placeholder="Search using mobile number, email, or name"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyPress={handleKeyPress}
                disabled={isSearching}
                className="w-full border-0 bg-transparent text-base text-omni-n600 placeholder-omni-n400 outline-none disabled:cursor-not-allowed"
              />
            </div>

            {/* Search Button */}
            <Button
              onClick={handleSearch}
              disabled={isSearching || !searchQuery.trim()}
              className="h-12 px-8 rounded-lg bg-[#7c47e1] text-base font-semibold text-white hover:bg-[#7c47e1]/90 focus:ring-2 focus:ring-[#7c47e1]/20 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSearching ? (
                <div className="flex items-center gap-2">
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  Searching...
                </div>
              ) : (
                'Search'
              )}
            </Button>
          </div>
          
          {/* Search Error */}
          {searchError && (
            <div className="mt-3 flex items-start gap-2 rounded-md bg-red-50 border border-red-200 p-3">
              <AlertCircle className="h-5 w-5 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-700">{searchError}</p>
            </div>
          )}
        </div>
      </div>

      {/* Ozontel Dialer Icon - Bottom Left */}
      <img
        onClick={handleOpenOzontel}
        src="/icons/ozontel-dialer-icon.png"
        alt="Ozontel Dialer"
        className="fixed bottom-6 left-6 z-[60] h-14 w-14 cursor-pointer object-contain"
        title="Open Ozontel Dialer"
      />

      {/* Simulate Live Call Button - Bottom Right */}
      <Button
        onClick={handleSimulateLiveCall}
        className="fixed bottom-6 right-6 flex h-12 items-center gap-2 rounded-full bg-[#7c47e1] px-6 py-3 shadow-lg hover:bg-[#7c47e1]/90 hover:shadow-xl focus:ring-2 focus:ring-[#7c47e1]/20"
        title="Simulate Live Call"
      >
        <Phone className="h-5 w-5 text-white" />
        <span className="text-sm font-semibold text-white">Simulate Live Call</span>
      </Button>

      {/* Incoming Call Modal - only show when state is ringing */}
      <SimulateCallPickerDialog
        open={simulatePickerOpen}
        onOpenChange={setSimulatePickerOpen}
        onSelectScenario={handleSelectSimulateScenario}
      />

      <IncomingCallModal
        open={callState.state === "ringing"}
        onOpenChange={handleIncomingModalOpenChange}
        onAnswerCall={handleAnswerCallFromModal}
        onTimeout={handleCallTimeout}
      />
      
      {/* Ozontel Dialer - only show when not on active call */}
      <OzontelDialer 
        isVisible={ozontelVisible && callState.state !== 'active_call'} 
        onAnswerCall={handleAnswerCallFromOzontel}
        onClose={handleCloseOzontel}
        onCall={handleCall}
      />

      {sessionToast && (
        <CallSessionToast variant={sessionToast} onDismiss={() => setSessionToast(null)} />
      )}
    </div>
  )
}