import { useCallback, useEffect, useId, useMemo, useRef, useState } from "react"
import { Pause, Sparkles, User, Volume2 } from "lucide-react"

import { cn } from "@/lib/utils"
import {
  fetchElevenLabsTtsMp3,
  liveListeningVoiceIdForSpeaker,
  playMp3ArrayBuffer,
} from "@/lib/elevenLabsLiveListeningTts"
import type { Customer, EndorsementEditKind, InactivePolicy, Policy } from "@/types/crm"
import { CustomerProfileSidebar } from "@/components/crm/hello/CustomerProfileSidebar"
import { RightSidebar } from "@/components/crm/hello/RightSidebar"
import { useHelloRightSidebarState } from "@/components/crm/hello/useHelloRightSidebarState"
import {
  HelloChatColumnBackground,
  helloSplitShellTransitionClass,
} from "@/components/crm/hello/HelloChatPrimitives"
import { HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS, helloRaiseClaimVehicleLabel } from "@/components/crm/hello/helloRaiseClaimCopy"
import { HELLO_PROFILE_RIBBON_DEFAULT_EDIT_KIND } from "@/components/crm/hello/helloEditPolicyCopy"

/** Index in {@link LIVE_TRANSCRIPT_PRE_CLAIM_LINES} — AI surfaces Raise claim after this Raj line. */
const LIVE_TRANSCRIPT_RAISE_CLAIM_HINT_INDEX = 1
/**
 * Index in {@link LIVE_TRANSCRIPT_POST_CLAIM_LINES} — Raj’s health-policy ask; Edit policy suggestion
 * appears after this line plus {@link LIVE_LISTENING_EDIT_POLICY_HINT_DELAY_MS} so it feels model-driven.
 */
const LIVE_TRANSCRIPT_POST_RAJ_HEALTH_INDEX = 4

/** 
 * Live listening timing constants for perfect text-audio synchronization.
 * 
 * SYNCHRONIZATION STRATEGY:
 * 1. During typing indicator phase: Pre-load TTS audio for the upcoming line
 * 2. When typing ends: Display text and start audio playback simultaneously
 * 3. This ensures zero delay between text appearance and voice-over
 * 
 * Slower cadence so CX can read the live transcript ([Figma OMNI Post-Sales](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8653-56752)). 
 */
const LIVE_LISTENING_INITIAL_PAUSE_MS = 900
const LIVE_LISTENING_TYPING_MS = 1500  // Duration for TTS audio pre-loading
const LIVE_LISTENING_LINE_GAP_MS = 820  // Gap between transcript lines
const LIVE_LISTENING_RAISE_CLAIM_HINT_MS = 900
/** Pause after Raj mentions the health edit before surfacing Edit policy (demo pacing). */
const LIVE_LISTENING_EDIT_POLICY_HINT_DELAY_MS = 2800

/** Lines until CX agrees to raise on behalf — “claim raised” waits until FNOL is submitted in the workspace. */
const LIVE_TRANSCRIPT_PRE_CLAIM_LINES = [
  {
    speaker: "cx" as const,
    text: "Hello Raj ji, welcome to ACKO! Are you calling to raise a claim for your tata nexon?",
  },
  {
    speaker: "raj" as const,
    text: "Yes, actually I met with a small accident and there is some damage happened to my vehicle that's why I want to raise a claim.",
  },
  {
    speaker: "cx" as const,
    text: "Oh, I am so sorry to hear that sir, I hope you are okay and nothing happened to you.",
  },
  {
    speaker: "raj" as const,
    text: "So sweet of you to check, I am absolutely fine, thanks for asking. Just help me raise a claim.",
  },
  {
    speaker: "cx" as const,
    text: "Sure sir, I will share a link with you and guide you the process of how to raise a claim.",
  },
  {
    speaker: "raj" as const,
    text: "Can you only do that on my behalf?",
  },
  {
    speaker: "cx" as const,
    text: "Sure sir, let me do that for you sir — I’ll raise it here on the system now.",
  },
] as const

/** Plays only after the CX submits FNOL in the center workspace (demo continuity). */
const LIVE_TRANSCRIPT_POST_CLAIM_LINES = [
  {
    speaker: "cx" as const,
    text: "Sir, I have raised the claim on your behalf.",
  },
  {
    speaker: "cx" as const,
    text: "You will get a call back from the claim handler in 1–2 working days.",
  },
  {
    speaker: "raj" as const,
    text: "Thank you, I really appreciate the quick help.",
  },
  {
    speaker: "cx" as const,
    text: "Glad we could sort that, sir. Anything else I can help you with today?",
  },
  {
    speaker: "raj" as const,
    text: "Yes — can you also help me make an edit in my health insurance policy? My date of birth is wrong.",
  },
  {
    speaker: "cx" as const,
    text: "Sure sir, let me look at it for you.",
  },
] as const

/** Demo health-policy edit — closest workflow field for DOB correction in mock data. */
const LIVE_LISTENING_HEALTH_EDIT_KIND: EndorsementEditKind = "policy_holder_name"

function sleep(ms: number, signal: { cancelled: boolean }): Promise<void> {
  return new Promise((resolve) => {
    window.setTimeout(() => {
      if (!signal.cancelled) resolve()
    }, ms)
  })
}

/** Animated equalizer — reads as “live audio” (see wireframe [OMNI Post-Sales](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8647-56580)). */
function LiveListeningBarsIcon({ className }: { className?: string }) {
  return (
    <div
      className={cn("flex h-7 w-9 items-end justify-center gap-[3px] rounded-lg bg-[#f5f3fc] px-1.5 py-1 ring-1 ring-[#e7e7f0]", className)}
      aria-hidden
    >
      {[0, 1, 2].map((i) => (
        <span
          key={i}
          className="h-5 w-1 shrink-0 rounded-full bg-[#7c47e1] motion-safe:animate-live-listen-bar motion-reduce:opacity-80"
          style={{ animationDelay: `${i * 110}ms` }}
        />
      ))}
    </div>
  )
}

/** Transcript strip horizontal inset (24px) — bubbles span the inner width. */
const LIVE_LISTENING_TRANSCRIPT_PAD_CLASS = "px-6"

function TranscriptTypingShell({ side }: { side: "raj" | "cx" }) {
  const dots = (
    <span className="flex gap-1.5" aria-hidden>
      <span className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s]" />
      <span
        className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s] [animation-delay:150ms]"
      />
      <span
        className="size-1.5 animate-pulse rounded-full bg-[#b9a3ea] [animation-duration:1.1s] [animation-delay:300ms]"
      />
    </span>
  )

  const bubbleMax = "w-full max-w-full"

  if (side === "cx") {
    return (
      <div className="flex w-full min-w-0 justify-end">
        <div className={cn("inline-flex max-w-full flex-row-reverse items-start gap-2.5 align-top", bubbleMax)}>
          <div className="flex w-5 shrink-0 justify-center pt-0.5" aria-hidden>
            <div
              className={cn(
                "flex size-5 shrink-0 items-center justify-center overflow-hidden rounded",
                "bg-[#d4c2f5] ring-1 ring-[#c4b0e8]",
              )}
            >
              <User className="size-3 text-[#5920c5]" strokeWidth={2} aria-hidden />
            </div>
          </div>
          <div
            className={cn(
              "flex min-h-[44px] w-full min-w-0 flex-col items-start justify-center rounded-2xl rounded-tr-[2px] border border-[#d0c0ef] bg-[#E4D7FF] px-4 py-3 text-left",
              "shadow-[0px_1px_3px_rgba(54,53,76,0.06)]",
            )}
          >
            <div className="flex w-full justify-start">{dots}</div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full min-w-0 justify-start">
      <div className={cn("inline-flex max-w-full items-start gap-2.5 align-top", bubbleMax)}>
        <div className="flex w-5 shrink-0 justify-center pt-0.5" aria-hidden>
          <div className="flex size-5 shrink-0 items-center justify-center rounded bg-[#f5f3fc] ring-1 ring-[#e7e7f0]">
            <User className="size-3 text-[#5b5675]" strokeWidth={2} aria-hidden />
          </div>
        </div>
        <div className="flex min-h-[44px] w-full min-w-0 flex-col items-start justify-center rounded-2xl rounded-tl-[2px] border border-[#e7e7f0] bg-white px-4 py-3 text-left shadow-[0px_1px_3px_rgba(54,53,76,0.06)]">
          <span className="flex gap-1.5" aria-hidden>
            <span className="size-1.5 animate-pulse rounded-full bg-[#d4cfe8] [animation-duration:1.1s]" />
            <span
              className="size-1.5 animate-pulse rounded-full bg-[#d4cfe8] [animation-duration:1.1s] [animation-delay:150ms]"
            />
            <span
              className="size-1.5 animate-pulse rounded-full bg-[#d4cfe8] [animation-duration:1.1s] [animation-delay:300ms]"
            />
          </span>
        </div>
      </div>
    </div>
  )
}

export type LiveListeningRaiseClaimHelloViewProps = {
  customer: Customer
  raiseClaimPolicy: Policy
  activePolicies: Policy[]
  inactivePolicies: InactivePolicy[]
  displayPhone?: string
  onHelloToast?: (message: string) => void
  className?: string
}

type LiveTranscriptLine = { id: string; speaker: "raj" | "cx"; text: string }

export function LiveListeningRaiseClaimHelloView({
  customer,
  raiseClaimPolicy,
  activePolicies,
  inactivePolicies,
  displayPhone,
  onHelloToast,
  className,
}: LiveListeningRaiseClaimHelloViewProps) {
  const typingStatusId = useId()
  const transcriptScrollRef = useRef<HTMLDivElement>(null)
  const sidebar = useHelloRightSidebarState()
  const postClaimTranscriptGenRef = useRef(0)
  /** Matches `callSimFollowing` — initialized true so the first transcript lines hear correct ref before effects run. */
  const callSimFollowingRef = useRef(true)
  const audioSyncGenRef = useRef(0)
  const audioQueueRef = useRef(Promise.resolve())
  const lineAudioAbortRef = useRef<AbortController | null>(null)
  const lastPlayedTranscriptIdRef = useRef<string | null>(null)

  /** Voice follows new transcript lines automatically; use the control to stop or resume. */
  const [callSimFollowing, setCallSimFollowing] = useState(true)

  const [transcript, setTranscript] = useState<LiveTranscriptLine[]>([])
  const [typingSide, setTypingSide] = useState<"raj" | "cx" | null>(null)
  const [raiseClaimSuggestionVisible, setRaiseClaimSuggestionVisible] = useState(false)
  const [editPolicySuggestionVisible, setEditPolicySuggestionVisible] = useState(false)
  const [raiseClaimWorkflowActive, setRaiseClaimWorkflowActive] = useState(false)
  const [editPolicyWorkflow, setEditPolicyWorkflow] = useState<{
    policy: Policy
    editKind: EndorsementEditKind
  } | null>(null)
  const [claimWorkflowDemoCompleted, setClaimWorkflowDemoCompleted] = useState(false)

  const vehicleLabel = helloRaiseClaimVehicleLabel(raiseClaimPolicy)

  const healthEditPolicy = useMemo(() => {
    return (
      activePolicies.find((p) => p.id === "policy-raj-gmc-1") ??
      activePolicies.find((p) => p.type === "Health Insurance") ??
      raiseClaimPolicy
    )
  }, [activePolicies, raiseClaimPolicy])

  const healthPolicyPaneLabel =
    healthEditPolicy.name?.trim() ||
    healthEditPolicy.planDisplayName?.trim() ||
    healthEditPolicy.type ||
    "Health policy"

  const openRaiseClaimInSidebar = useCallback(() => {
    setRaiseClaimSuggestionVisible(false)
    setEditPolicyWorkflow(null)
    setRaiseClaimWorkflowActive(true)
    sidebar.openAiSidebar()
  }, [sidebar])

  const openEditPolicyInSidebar = useCallback(() => {
    setEditPolicySuggestionVisible(false)
    setRaiseClaimWorkflowActive(false)
    setEditPolicyWorkflow({
      policy: healthEditPolicy,
      editKind: LIVE_LISTENING_HEALTH_EDIT_KIND,
    })
    sidebar.openAiSidebar()
  }, [healthEditPolicy, sidebar])

  useEffect(() => {
    const el = transcriptScrollRef.current
    if (!el) return
    window.requestAnimationFrame(() => {
      el.scrollTo({ top: el.scrollHeight, behavior: "smooth" })
    })
  }, [transcript, typingSide])

  /** Scripted live call — pre–FNOL lines only; post–claim lines run after workspace FNOL submit. */
  useEffect(() => {
    const signal = { cancelled: false }

    const run = async () => {
      await sleep(LIVE_LISTENING_INITIAL_PAUSE_MS, signal)
      if (signal.cancelled) return

      for (let i = 0; i < LIVE_TRANSCRIPT_PRE_CLAIM_LINES.length; i++) {
        const line = LIVE_TRANSCRIPT_PRE_CLAIM_LINES[i]!
        setTypingSide(line.speaker)
        
        // Pre-load audio during typing phase if voice simulation is following
        let audioBuffer: ArrayBuffer | null = null
        if (callSimFollowingRef.current) {
          try {
            const voiceId = liveListeningVoiceIdForSpeaker(line.speaker)
            // Create a fresh abort controller for this audio fetch
            const audioAc = new AbortController()
            if (signal.cancelled) audioAc.abort()
            audioBuffer = await fetchElevenLabsTtsMp3(line.text, voiceId, audioAc.signal)
          } catch (e) {
            // Continue without audio if fetch fails
            audioBuffer = null
          }
        }
        
        await sleep(LIVE_LISTENING_TYPING_MS, signal)
        if (signal.cancelled) return
        
        setTypingSide(null)
        const transcriptId = `live-pre-${i}`
        
        // Show text and start audio simultaneously
        setTranscript((prev) => [
          ...prev,
          { id: transcriptId, speaker: line.speaker, text: line.text },
        ])
        
        // Play pre-loaded audio immediately when text appears
        if (audioBuffer && callSimFollowingRef.current) {
          lastPlayedTranscriptIdRef.current = transcriptId
          // Create new abort controller for playback
          const playbackAc = new AbortController()
          lineAudioAbortRef.current = playbackAc
          void playMp3ArrayBuffer(audioBuffer, { 
            signal: playbackAc.signal 
          }).catch(() => {
            // Ignore playback errors to not break the flow
          })
        }

        if (i === LIVE_TRANSCRIPT_RAISE_CLAIM_HINT_INDEX) {
          await sleep(LIVE_LISTENING_RAISE_CLAIM_HINT_MS, signal)
          if (signal.cancelled) return
          setRaiseClaimSuggestionVisible(true)
        }

        await sleep(LIVE_LISTENING_LINE_GAP_MS, signal)
        if (signal.cancelled) return
      }
    }

    void run()

    return () => {
      signal.cancelled = true
    }
  }, [])

  /** After FNOL: resume transcript, then surface Edit policy after a deliberate pause. */
  useEffect(() => {
    if (!claimWorkflowDemoCompleted) return
    postClaimTranscriptGenRef.current += 1
    const gen = postClaimTranscriptGenRef.current
    const signal = { cancelled: false }

    const run = async () => {
      await sleep(LIVE_LISTENING_LINE_GAP_MS, signal)
      if (signal.cancelled || gen !== postClaimTranscriptGenRef.current) return

      for (let i = 0; i < LIVE_TRANSCRIPT_POST_CLAIM_LINES.length; i++) {
        const line = LIVE_TRANSCRIPT_POST_CLAIM_LINES[i]!
        setTypingSide(line.speaker)
        
        // Pre-load audio during typing phase if voice simulation is following
        let audioBuffer: ArrayBuffer | null = null
        if (callSimFollowingRef.current) {
          try {
            const voiceId = liveListeningVoiceIdForSpeaker(line.speaker)
            // Create a fresh abort controller for this audio fetch
            const audioAc = new AbortController()
            if (signal.cancelled) audioAc.abort()
            audioBuffer = await fetchElevenLabsTtsMp3(line.text, voiceId, audioAc.signal)
          } catch (e) {
            // Continue without audio if fetch fails
            audioBuffer = null
          }
        }
        
        await sleep(LIVE_LISTENING_TYPING_MS, signal)
        if (signal.cancelled || gen !== postClaimTranscriptGenRef.current) return
        
        setTypingSide(null)
        const transcriptId = `live-post-${i}`
        
        // Show text and start audio simultaneously
        setTranscript((prev) => [
          ...prev,
          { id: transcriptId, speaker: line.speaker, text: line.text },
        ])
        
        // Play pre-loaded audio immediately when text appears
        if (audioBuffer && callSimFollowingRef.current) {
          lastPlayedTranscriptIdRef.current = transcriptId
          // Create new abort controller for playback
          const playbackAc = new AbortController()
          lineAudioAbortRef.current = playbackAc
          void playMp3ArrayBuffer(audioBuffer, { 
            signal: playbackAc.signal 
          }).catch(() => {
            // Ignore playback errors to not break the flow
          })
        }

        if (i === LIVE_TRANSCRIPT_POST_RAJ_HEALTH_INDEX) {
          await sleep(LIVE_LISTENING_EDIT_POLICY_HINT_DELAY_MS, signal)
          if (signal.cancelled || gen !== postClaimTranscriptGenRef.current) return
          setEditPolicySuggestionVisible(true)
        }

        await sleep(LIVE_LISTENING_LINE_GAP_MS, signal)
        if (signal.cancelled || gen !== postClaimTranscriptGenRef.current) return
      }
    }

    void run()

    return () => {
      signal.cancelled = true
      postClaimTranscriptGenRef.current += 1
    }
  }, [claimWorkflowDemoCompleted])

  const handleRaiseClaimWorkflowComplete = useCallback(() => {
    onHelloToast?.("Claim raised — workspace will close (demo).")
    window.setTimeout(() => {
      setRaiseClaimWorkflowActive(false)
      setClaimWorkflowDemoCompleted(true)
    }, HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS)
  }, [onHelloToast])

  const handleEditPolicyWorkflowComplete = useCallback(() => {
    onHelloToast?.("Edit policy workflow submitted (demo).")
    window.setTimeout(() => {
      setEditPolicyWorkflow(null)
    }, HELLO_FNOL_SUCCESS_BEFORE_COLLAPSE_MS)
  }, [onHelloToast])

  const handleRcEmailSentFromWorkflow = useCallback(() => {
    onHelloToast?.("Your email has been queued for delivery.")
  }, [onHelloToast])

  const resetTranscriptAudioSync = useCallback(() => {
    audioSyncGenRef.current += 1
    lineAudioAbortRef.current?.abort()
    lineAudioAbortRef.current = null
    audioQueueRef.current = Promise.resolve()
  }, [])

  useEffect(() => {
    callSimFollowingRef.current = callSimFollowing
  }, [callSimFollowing])

  useEffect(() => {
    return () => {
      resetTranscriptAudioSync()
    }
  }, [resetTranscriptAudioSync])

  const handleToggleCallSimulation = useCallback(() => {
    if (callSimFollowing) {
      callSimFollowingRef.current = false
      resetTranscriptAudioSync()
      lastPlayedTranscriptIdRef.current = null
      setCallSimFollowing(false)
      return
    }
    callSimFollowingRef.current = true
    const last = transcript[transcript.length - 1]
    lastPlayedTranscriptIdRef.current = last?.id ?? null
    setCallSimFollowing(true)
  }, [callSimFollowing, transcript, resetTranscriptAudioSync])

  useEffect(() => {
    if (!callSimFollowing) return
    const last = transcript[transcript.length - 1]
    if (!last) return
    if (last.id === lastPlayedTranscriptIdRef.current) return
    
    // Skip audio for scripted lines that handle their own audio synchronously
    const isScriptedLine = last.id.startsWith('live-pre-') || last.id.startsWith('live-post-')
    if (isScriptedLine) return
    
    lastPlayedTranscriptIdRef.current = last.id

    const gen = audioSyncGenRef.current
    const ac = new AbortController()
    lineAudioAbortRef.current = ac

    audioQueueRef.current = audioQueueRef.current.then(async () => {
      if (gen !== audioSyncGenRef.current || !callSimFollowingRef.current) return
      const voiceId = liveListeningVoiceIdForSpeaker(last.speaker)
      try {
        const buf = await fetchElevenLabsTtsMp3(last.text, voiceId, ac.signal)
        if (gen !== audioSyncGenRef.current || !callSimFollowingRef.current) return
        await playMp3ArrayBuffer(buf, { signal: ac.signal })
      } catch (e) {
        if (e instanceof DOMException && e.name === "AbortError") return
        if (gen !== audioSyncGenRef.current || !callSimFollowingRef.current) return
        onHelloToast?.(e instanceof Error ? e.message : "Could not play transcript line.")
      }
    })
  }, [transcript, callSimFollowing, onHelloToast])

  const liveListeningRail = (
    <div className="relative z-10 flex h-full min-h-0 min-w-0 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 flex-col overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_1px_3px_rgba(54,53,76,0.06)]">
        <div className="flex shrink-0 items-center justify-between gap-3 border-b border-[#e7e7f0] px-4 py-3 sm:px-5">
          <div className="flex min-w-0 items-center gap-2">
            <LiveListeningBarsIcon className="shrink-0" />
            <h2 className="min-w-0 font-euclid text-[14px] font-medium leading-5 text-[#5b5675]">Live listening</h2>
          </div>
          <button
            type="button"
            className={cn(
              "inline-flex size-9 shrink-0 items-center justify-center rounded-lg border border-[#e7e7f0] bg-white text-[#5b5675] shadow-sm transition-colors",
              "hover:bg-[#f5f3fc] hover:text-[#5920c5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/25",
              callSimFollowing && "border-[#d0c0ef] bg-[#f8f5ff] text-[#5920c5]",
            )}
            aria-pressed={callSimFollowing}
            aria-label={
              callSimFollowing
                ? "Stop transcript voice"
                : "Resume transcript voice (Raj & CX)"
            }
            title="Voice follows the live transcript automatically. Click to stop; click again to resume from here. `npm run dev` starts TTS on port 3001; set ELEVENLABS_API_KEY or VITE_ELEVENLABS_API_KEY in .env.local"
            onClick={handleToggleCallSimulation}
          >
            {callSimFollowing ? <Pause className="size-[18px]" strokeWidth={2} /> : <Volume2 className="size-[18px]" strokeWidth={2} />}
          </button>
        </div>

        <div
          ref={transcriptScrollRef}
          className={cn(
            "box-border flex h-52 max-h-[min(36svh,20rem)] min-h-[5rem] shrink-0 flex-col overflow-y-auto overflow-x-hidden overscroll-y-contain bg-[#f8f7fc] py-3 [scrollbar-gutter:stable] sm:py-4",
            LIVE_LISTENING_TRANSCRIPT_PAD_CLASS,
          )}
          aria-live="polite"
          aria-relevant="additions"
        >
          <div className="flex h-full min-h-0 w-full min-w-0 flex-col">
            <div
              className={cn(
                "flex min-h-0 w-full flex-1 flex-col gap-2.5",
                transcript.length === 0 && !typingSide ? "justify-center" : "",
              )}
            >
              {transcript.length === 0 && !typingSide ? (
                <p className="py-4 text-center font-euclid text-[13px] leading-5 text-[#8b87a3]">
                  Waiting for live audio…
                </p>
              ) : null}
              {transcript.map((entry) => (
                <div
                  key={entry.id}
                  className={cn("flex w-full min-w-0", entry.speaker === "cx" ? "justify-end" : "justify-start")}
                >
                  <div
                    className={cn(
                      "w-full max-w-full rounded-xl border px-3.5 py-2.5 shadow-sm sm:px-4 sm:py-3",
                      entry.speaker === "cx"
                        ? "border-[#d0c0ef] bg-[#E4D7FF] text-left text-[#36354c]"
                        : "border-[#e7e7f0] bg-white text-left text-omni-n500",
                    )}
                  >
                    <p
                      className={cn(
                        "font-euclid text-[11px] font-semibold uppercase tracking-wide",
                        entry.speaker === "cx" ? "text-[#5920c5]/90" : "text-[#5b5675]",
                      )}
                    >
                      {entry.speaker === "cx" ? "CX agent" : "Raj Kapoor"}
                    </p>
                    <p
                      className={cn(
                        "mt-1.5 break-words font-euclid text-[13px] font-normal leading-5 sm:text-[14px] sm:leading-6",
                        entry.speaker === "cx" ? "text-[#36354c]" : "text-[#36354c]",
                      )}
                    >
                      {entry.text}
                    </p>
                  </div>
                </div>
              ))}
              {typingSide ? (
                <div role="status" aria-labelledby={typingStatusId}>
                  <span id={typingStatusId} className="sr-only">
                    {typingSide === "cx" ? "CX agent is speaking" : "Customer is speaking"}
                  </span>
                  <TranscriptTypingShell side={typingSide} />
                </div>
              ) : null}
            </div>
          </div>
        </div>

        <div className="flex min-h-0 flex-1 flex-col border-t border-[#e7e7f0] bg-white px-4 py-4 sm:px-6 sm:py-5">
          <div className="mb-4 flex shrink-0 items-center gap-2.5">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#efe9fb] ring-1 ring-[#e7e7f0]">
              <Sparkles className="size-[18px] text-[#7c47e1]" aria-hidden />
            </div>
            <div className="min-w-0">
              <p className="font-euclid text-[14px] font-semibold leading-5 text-[#2c2067]">AI Suggested actions</p>
              <p className="font-euclid text-[12px] leading-4 text-[#5b5675]">Based on the live transcript</p>
            </div>
          </div>

          <div className="min-h-0 flex-1">
            {!raiseClaimSuggestionVisible && !editPolicySuggestionVisible ? (
              <p className="font-euclid text-[13px] leading-5 text-[#5b5675]">
                Suggested actions will appear when the model detects intent from the live call.
              </p>
            ) : (
              <div className="flex flex-col gap-4">
                {raiseClaimSuggestionVisible ? (
                  <div className="flex min-h-0 flex-col rounded-xl border border-[#ececf2] bg-[#fbfbfc] p-4">
                    <p className="font-euclid text-[13px] font-semibold leading-5 text-[#2c2067]">Raise claim</p>
                    <p className="mt-1.5 font-euclid text-[13px] leading-5 text-[#5b5675]">
                      Customer asked to raise a claim — motor FNOL for{" "}
                      <span className="font-medium text-[#36354c]">{vehicleLabel}</span>.
                    </p>
                    <button
                      type="button"
                      className="mt-4 inline-flex h-11 w-auto shrink-0 self-start items-center justify-center rounded-lg border border-[#5920c5] bg-white px-4 font-euclid text-[14px] font-medium text-[#5920c5] shadow-[0px_5px_2px_rgba(18,18,18,0.04)] transition-colors hover:bg-[#faf8ff]"
                      onClick={openRaiseClaimInSidebar}
                    >
                      Open Raise claim
                    </button>
                  </div>
                ) : null}
                {editPolicySuggestionVisible ? (
                  <div className="flex min-h-0 flex-col rounded-xl border border-[#ececf2] bg-[#fbfbfc] p-4">
                    <p className="font-euclid text-[13px] font-semibold leading-5 text-[#2c2067]">Edit policy</p>
                    <p className="mt-1.5 font-euclid text-[13px] leading-5 text-[#5b5675]">
                      Customer mentioned a health policy edit — DOB correction on{" "}
                      <span className="font-medium text-[#36354c]">{healthPolicyPaneLabel}</span>.
                    </p>
                    <button
                      type="button"
                      className="mt-4 inline-flex h-11 w-auto shrink-0 self-start items-center justify-center rounded-lg border border-[#5920c5] bg-white px-4 font-euclid text-[14px] font-medium text-[#5920c5] shadow-[0px_5px_2px_rgba(18,18,18,0.04)] transition-colors hover:bg-[#faf8ff]"
                      onClick={openEditPolicyInSidebar}
                    >
                      Open Edit policy
                    </button>
                  </div>
                ) : null}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )

  return (
    <div
      data-omni-ai-surface="hello-live-listening-raise-claim"
      className={cn(
        "relative flex h-full min-h-0 w-full overflow-hidden bg-[#fafafa]",
        className,
      )}
      aria-label="Live listening — Hello CRM view"
    >
      <CustomerProfileSidebar
        customer={customer}
        activePolicies={activePolicies}
        inactivePolicies={inactivePolicies}
      />

      {sidebar.showSkeletonLoader ? (
        <div className="flex flex-1 items-center justify-center bg-[#fafafa]">
          <div className="h-48 w-full max-w-2xl animate-pulse rounded-xl bg-white shadow-sm" />
        </div>
      ) : (
        <>
          {!sidebar.isManualMode && (
            <div className="flex min-h-0 flex-1 flex-col">
              <div
                className={cn(
                  "relative flex min-h-0 w-full flex-1 flex-col overflow-hidden px-[40px] pt-5 pb-5 lg:pb-6",
                  helloSplitShellTransitionClass,
                )}
              >
                <HelloChatColumnBackground />
                {displayPhone ? (
                  <p className="sr-only">{`Lookup phone context: ${displayPhone}`}</p>
                ) : null}
                <div className="relative z-10 min-h-0 flex-1">{liveListeningRail}</div>
              </div>
            </div>
          )}

          <RightSidebar
            isCollapsed={sidebar.rightSidebarCollapsed}
            isOpen={!sidebar.rightSidebarCollapsed}
            onToggle={sidebar.handleRightSidebarToggle}
            activeSection={sidebar.rightSidebarActiveSection}
            onSectionChange={sidebar.handleRightSidebarSectionChange}
            width={sidebar.rightSidebarWidth}
            onWidthChange={sidebar.setRightSidebarWidth}
            isManualMode={sidebar.isManualMode}
            onModeToggle={sidebar.handleModeToggle}
            customer={customer}
            displayPhone={displayPhone}
            workflowActive={raiseClaimWorkflowActive}
            claimWorkflowPolicy={raiseClaimWorkflowActive ? raiseClaimPolicy : null}
            editPolicyWorkflow={editPolicyWorkflow}
            customerPolicies={activePolicies}
            onWorkflowClose={() => setRaiseClaimWorkflowActive(false)}
            onEditPolicyWorkflowClose={() => setEditPolicyWorkflow(null)}
            onFnolComplete={handleRaiseClaimWorkflowComplete}
            onEditPolicyWorkflowComplete={handleEditPolicyWorkflowComplete}
            onRcEmailSent={handleRcEmailSentFromWorkflow}
            onCTAPressed={(action, policy) => {
              if (action === "raise_claim") {
                setRaiseClaimWorkflowActive(true)
                setEditPolicyWorkflow(null)
                sidebar.openAiSidebar()
              }
              if (action === "edit_policy") {
                setRaiseClaimWorkflowActive(false)
                setEditPolicyWorkflow({
                  policy,
                  editKind: HELLO_PROFILE_RIBBON_DEFAULT_EDIT_KIND,
                })
                sidebar.openAiSidebar()
              }
              if (action === "view_details" || action === "share_policy_document") {
                sidebar.openAiSidebar()
              }
            }}
            triggerManualAction={sidebar.manualActionTrigger}
          />
        </>
      )}
    </div>
  )
}
