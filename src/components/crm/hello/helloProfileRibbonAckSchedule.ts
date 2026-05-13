import {
  HELLO_PROFILE_RIBBON_ACK_TYPING_MS,
  HELLO_PROFILE_RIBBON_AFTER_ACK_MS,
} from "@/components/crm/hello/helloRaiseClaimCopy"

export type HelloProfileRibbonAckCallbacks = {
  setTyping: (value: boolean) => void
  appendAck: () => void
  thenOpen: () => void
}

/**
 * Profile ribbon: show typing for {@link HELLO_PROFILE_RIBBON_ACK_TYPING_MS}, append ack, then open the right pane.
 * Returns a disposer to clear timers (call before starting another sequence or on unmount).
 */
export function scheduleHelloProfileRibbonAckSequence(cb: HelloProfileRibbonAckCallbacks): () => void {
  let openTimer: number | null = null
  cb.setTyping(true)
  const typingTimer = window.setTimeout(() => {
    cb.setTyping(false)
    cb.appendAck()
    openTimer = window.setTimeout(() => {
      openTimer = null
      cb.thenOpen()
    }, HELLO_PROFILE_RIBBON_AFTER_ACK_MS)
  }, HELLO_PROFILE_RIBBON_ACK_TYPING_MS)
  return () => {
    window.clearTimeout(typingTimer)
    if (openTimer !== null) window.clearTimeout(openTimer)
  }
}
