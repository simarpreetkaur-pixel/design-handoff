/**
 * ElevenLabs voices for the Raj / CX live-listening demo.
 * @see https://elevenlabs.io/app/voice-library?voiceId=uavKGt8JpB2lo1bcty9J — Raj
 * @see https://elevenlabs.io/app/voice-library?voiceId=2DRBj9T2XZ7Jmkcm6WCZ — CX agent
 */
export const ELEVENLABS_LIVE_LISTENING_RAJ_VOICE_ID = "uavKGt8JpB2lo1bcty9J"
export const ELEVENLABS_LIVE_LISTENING_CX_VOICE_ID = "2DRBj9T2XZ7Jmkcm6WCZ"

export function liveListeningVoiceIdForSpeaker(speaker: "raj" | "cx"): string {
  return speaker === "raj" ? ELEVENLABS_LIVE_LISTENING_RAJ_VOICE_ID : ELEVENLABS_LIVE_LISTENING_CX_VOICE_ID
}

const DEFAULT_MODEL_ID = "eleven_multilingual_v2"

/** Express TTS server (`npm run dev` starts it). Override with `VITE_TTS_SERVER_URL`. */
const TTS_SERVER_BASE = (import.meta.env.VITE_TTS_SERVER_URL as string | undefined)?.replace(/\/$/, "") ?? "http://127.0.0.1:3001"

export type LiveListeningTtsLine = { speaker: "raj" | "cx"; text: string }

function ttsEndpointUrl(): string {
  return `${TTS_SERVER_BASE}/tts`
}

function ttsDirectElevenLabsUrl(voiceId: string): string {
  return `https://api.elevenlabs.io/v1/text-to-speech/${voiceId}`
}

function ttsHeaders(): HeadersInit {
  const headers: Record<string, string> = {
    Accept: "audio/mpeg",
    "Content-Type": "application/json",
  }
  const key = import.meta.env.VITE_ELEVENLABS_API_KEY as string | undefined
  if (key && import.meta.env.PROD) {
    headers["xi-api-key"] = key
  }
  return headers
}

export async function fetchElevenLabsTtsMp3(
  text: string,
  voiceId: string,
  signal?: AbortSignal,
): Promise<ArrayBuffer> {
  const useLocalServer = import.meta.env.DEV || Boolean(import.meta.env.VITE_TTS_SERVER_URL)
  const url = useLocalServer ? ttsEndpointUrl() : ttsDirectElevenLabsUrl(voiceId)
  const body = useLocalServer
    ? JSON.stringify({ text, voiceId, modelId: DEFAULT_MODEL_ID })
    : JSON.stringify({ text, model_id: DEFAULT_MODEL_ID })

  let res: Response
  try {
    res = await fetch(url, {
      method: "POST",
      headers: ttsHeaders(),
      body,
      signal,
    })
  } catch (e) {
    const msg =
      e instanceof TypeError
        ? `${e.message} — run \`npm run dev\` (starts Vite + TTS on port 3001), or run \`npm run server\` separately.`
        : e instanceof Error
          ? e.message
          : String(e)
    throw new Error(`ElevenLabs request failed: ${msg}`)
  }
  if (!res.ok) {
    const detail = await res.text().catch(() => "")
    let hint = detail
    try {
      const parsed = JSON.parse(detail) as { message?: string; error?: string; detail?: string }
      hint = parsed.message ?? parsed.detail ?? parsed.error ?? detail
    } catch {
      // use raw detail
    }
    const fallback =
      res.status === 503
        ? "TTS server missing API key or unavailable — set ELEVENLABS_API_KEY in .env.local and run `npm run server`."
        : res.status === 401 || res.status === 403
          ? "Invalid or missing ElevenLabs API key on the TTS server."
          : res.status === 502
            ? "Bad gateway — retry or check the Express TTS server logs."
            : "Run `npm run server` for local TTS, or set VITE_ELEVENLABS_API_KEY for direct API in production builds."
    throw new Error(
      `ElevenLabs TTS failed (${res.status}). ${hint ? hint.slice(0, 200) : fallback}`,
    )
  }
  return res.arrayBuffer()
}

function sleep(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    const t = window.setTimeout(() => {
      signal?.removeEventListener("abort", onAbort)
      resolve()
    }, ms)
    const onAbort = () => {
      window.clearTimeout(t)
      signal?.removeEventListener("abort", onAbort)
      reject(new DOMException("Aborted", "AbortError"))
    }
    signal?.addEventListener("abort", onAbort)
  })
}

export function playMp3ArrayBuffer(buffer: ArrayBuffer, opts?: { signal?: AbortSignal }): Promise<void> {
  const blob = new Blob([buffer], { type: "audio/mpeg" })
  const url = URL.createObjectURL(blob)
  const audio = new Audio(url)

  const cleanup = () => {
    URL.revokeObjectURL(url)
    audio.removeAttribute("src")
    audio.load()
  }

  return new Promise((resolve, reject) => {
    const onAbort = () => {
      audio.pause()
      cleanup()
      reject(new DOMException("Aborted", "AbortError"))
    }
    opts?.signal?.addEventListener("abort", onAbort, { once: true })

    audio.onended = () => {
      opts?.signal?.removeEventListener("abort", onAbort)
      cleanup()
      resolve()
    }
    audio.onerror = () => {
      opts?.signal?.removeEventListener("abort", onAbort)
      cleanup()
      reject(new Error("Audio playback failed"))
    }

    opts?.signal?.throwIfAborted()
    void audio.play().catch((err) => {
      opts?.signal?.removeEventListener("abort", onAbort)
      cleanup()
      reject(err instanceof Error ? err : new Error(String(err)))
    })
  })
}

/** Sequential TTS + playback for the scripted live call (one ElevenLabs request per line). */
export async function playLiveListeningCallSimulation(
  lines: readonly LiveListeningTtsLine[],
  opts?: {
    signal?: AbortSignal
    gapMs?: number
    rajVoiceId?: string
    cxVoiceId?: string
  },
): Promise<void> {
  const gapMs = opts?.gapMs ?? 420
  const raj = opts?.rajVoiceId ?? ELEVENLABS_LIVE_LISTENING_RAJ_VOICE_ID
  const cx = opts?.cxVoiceId ?? ELEVENLABS_LIVE_LISTENING_CX_VOICE_ID

  for (const line of lines) {
    opts?.signal?.throwIfAborted()
    const voiceId = line.speaker === "raj" ? raj : cx
    const buffer = await fetchElevenLabsTtsMp3(line.text, voiceId, opts?.signal)
    await playMp3ArrayBuffer(buffer, { signal: opts?.signal })
    await sleep(gapMs, opts?.signal)
  }
}
