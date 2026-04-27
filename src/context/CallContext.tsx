import { createContext, useContext, type ReactNode } from "react"
import { useCallState } from '@/hooks/useCallState'
import type { CallStateHook } from '@/hooks/useCallState'

// Create the context
const CallContext = createContext<CallStateHook | undefined>(undefined)

// Provider component
interface CallProviderProps {
  children: ReactNode
}

export function CallProvider({ children }: CallProviderProps) {
  const callState = useCallState()
  
  return (
    <CallContext.Provider value={callState}>
      {children}
    </CallContext.Provider>
  )
}

// Hook to use the call context
export function useCall(): CallStateHook {
  const context = useContext(CallContext)
  
  if (context === undefined) {
    throw new Error('useCall must be used within a CallProvider')
  }
  
  return context
}

// Export the context for advanced use cases
export { CallContext }