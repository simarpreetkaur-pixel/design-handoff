import { useCallback, useEffect, useRef, useState } from "react"

import { HELLO_POLICY_DETAIL_SKELETON_MS } from "@/components/crm/hello/helloRaiseClaimCopy"
import type { Policy } from "@/types/crm"

export type HelloPolicyDetailPane =
  | { mode: "closed" }
  | { mode: "loading"; policy: Policy }
  | { mode: "ready"; policy: Policy }

export function helloPolicyHeadingProduct(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return v
  const n = policy.name?.trim()
  if (n) return n
  const p = policy.planDisplayName?.trim()
  if (p) return p
  return policy.type || "Policy"
}

export function helloPolicyHeadingNumber(policy: Policy): string | null {
  const num = policy.policyNumber?.trim()
  return num || null
}

export function useHelloPolicyDetailPane() {
  const [pane, setPane] = useState<HelloPolicyDetailPane>({ mode: "closed" })
  const loadTimerRef = useRef<number | null>(null)

  const clearTimer = useCallback(() => {
    if (loadTimerRef.current !== null) {
      window.clearTimeout(loadTimerRef.current)
      loadTimerRef.current = null
    }
  }, [])

  useEffect(() => () => clearTimer(), [clearTimer])

  const open = useCallback(
    (policy: Policy) => {
      clearTimer()
      setPane({ mode: "loading", policy })
      loadTimerRef.current = window.setTimeout(() => {
        loadTimerRef.current = null
        setPane({ mode: "ready", policy })
      }, HELLO_POLICY_DETAIL_SKELETON_MS)
    },
    [clearTimer],
  )

  const close = useCallback(() => {
    clearTimer()
    setPane({ mode: "closed" })
  }, [clearTimer])

  return {
    pane,
    open,
    close,
    isOpen: pane.mode !== "closed",
  }
}
