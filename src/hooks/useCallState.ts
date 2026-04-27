import { useState, useCallback } from 'react'

export type CallState = 
  | 'idle'           // No activity, default state
  | 'searching'      // User is searching for a customer
  | 'ringing'        // Incoming call or simulated call
  | 'active_call'    // Currently on an active call
  | 'viewing_crm'    // Viewing CRM without active call (from search)

export interface CallStateData {
  customerId?: string
  customerData?: any
  callStartTime?: Date
  searchQuery?: string
}

export interface CallStateHook {
  state: CallState
  data: CallStateData
  // Actions
  startSearch: (query: string) => void
  startRing: (customerId?: string) => void
  answerCall: (customerId: string, customerData?: any) => void
  endCall: () => void
  openCRMForCustomer: (customerId: string, customerData?: any) => void
  reset: () => void
}

const initialData: CallStateData = {
  customerId: undefined,
  customerData: undefined,
  callStartTime: undefined,
  searchQuery: undefined,
}

export function useCallState(): CallStateHook {
  const [state, setState] = useState<CallState>('idle')
  const [data, setData] = useState<CallStateData>(initialData)

  const startSearch = useCallback((query: string) => {
    setState('searching')
    setData(prev => ({
      ...prev,
      searchQuery: query,
      customerId: undefined,
      customerData: undefined,
      callStartTime: undefined,
    }))
  }, [])

  const startRing = useCallback((customerId?: string) => {
    setState('ringing')
    setData(prev => ({
      ...prev,
      customerId,
      callStartTime: undefined,
      searchQuery: undefined,
    }))
  }, [])

  const answerCall = useCallback((customerId: string, customerData?: any) => {
    setState('active_call')
    setData(prev => ({
      ...prev,
      customerId,
      customerData,
      callStartTime: new Date(),
      searchQuery: undefined,
    }))
  }, [])

  const endCall = useCallback(() => {
    setState('idle')
    setData(initialData)
  }, [])

  const openCRMForCustomer = useCallback((customerId: string, customerData?: any) => {
    setState('viewing_crm')
    setData(prev => ({
      ...prev,
      customerId,
      customerData,
      callStartTime: undefined,
      searchQuery: undefined,
    }))
  }, [])

  const reset = useCallback(() => {
    setState('idle')
    setData(initialData)
  }, [])

  return {
    state,
    data,
    startSearch,
    startRing,
    answerCall,
    endCall,
    openCRMForCustomer,
    reset,
  }
}