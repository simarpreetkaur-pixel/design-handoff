/**
 * ElevenLabs TTS API for the Vite React app.
 * Run: `npm run server` (uses `server-env.mjs` for TLS + IPv4 order).
 *
 * Env: `VITE_ELEVENLABS_API_KEY` or `ELEVENLABS_API_KEY` in `.env.local` (project root).
 * The TTS server prefers `VITE_ELEVENLABS_API_KEY` when both are set so a stale shell `ELEVENLABS_API_KEY` does not override your `.env.local` key.
 */
import path from "node:path"
import { fileURLToPath } from "node:url"
import cors from "cors"
import dotenv from "dotenv"
import express from "express"
import { ElevenLabsClient } from "elevenlabs"

const __dirname = path.dirname(fileURLToPath(import.meta.url))

/** Base env first, then `.env.local` wins (override) so `VITE_*` keys aren’t shadowed by an empty `ELEVENLABS_API_KEY`). */
dotenv.config({ path: path.join(__dirname, ".env") })
dotenv.config({ path: path.join(__dirname, ".env.local"), override: true })

function normalizeApiKey() {
  const strip = (v) =>
    (v ?? "")
      .toString()
      .replace(/^\uFEFF/, "")
      .trim()
      .replace(/^["']|["']$/g, "")
  const fromEleven = strip(process.env.ELEVENLABS_API_KEY)
  const fromVite = strip(process.env.VITE_ELEVENLABS_API_KEY)
  // Prefer VITE_* first: devs usually put the real key in `.env.local` for Vite; a stale or wrong
  // `ELEVENLABS_API_KEY` from the shell or `.env` would otherwise win with `fromEleven || fromVite` and cause 401.
  return fromVite || fromEleven || ""
}

const PORT = Number(process.env.TTS_SERVER_PORT ?? 3001) || 3001
const apiKey = normalizeApiKey()

const client = apiKey ? new ElevenLabsClient({ apiKey }) : null

/** @param {import("stream").Readable} readable */
async function readableToBuffer(readable) {
  const chunks = []
  for await (const chunk of readable) {
    chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
  }
  return Buffer.concat(chunks)
}

const app = express()
app.disable("x-powered-by")
app.use(
  cors({
    origin: true,
    methods: ["GET", "POST", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Accept"],
  }),
)
app.use(express.json({ limit: "512kb" }))

app.get("/health", (_req, res) => {
  res.json({ ok: true, hasApiKey: Boolean(apiKey) })
})

app.post("/tts", async (req, res) => {
  try {
    if (!client || !apiKey) {
      return res.status(503).json({
        error: "Missing API key",
        message: "Set ELEVENLABS_API_KEY (or VITE_ELEVENLABS_API_KEY) in .env.local and restart the TTS server.",
      })
    }

    const { text, voiceId, modelId } = req.body ?? {}
    if (typeof text !== "string" || !text.trim()) {
      return res.status(400).json({ error: "Invalid body", message: "`text` must be a non-empty string." })
    }
    if (typeof voiceId !== "string" || !voiceId.trim()) {
      return res.status(400).json({ error: "Invalid body", message: "`voiceId` must be a non-empty string." })
    }

    const model_id =
      typeof modelId === "string" && modelId.trim() ? modelId.trim() : "eleven_multilingual_v2"

    const audioStream = await client.textToSpeech.convert(voiceId.trim(), {
      text: text.trim(),
      model_id,
    })

    const buf = await readableToBuffer(audioStream)

    res.setHeader("Content-Type", "audio/mpeg")
    res.setHeader("Cache-Control", "no-store")
    return res.status(200).send(buf)
  } catch (err) {
    const statusCode =
      err && typeof err === "object" && "statusCode" in err && typeof err.statusCode === "number"
        ? err.statusCode
        : 502
    const message = err instanceof Error ? err.message : String(err)
    console.error("[POST /tts]", message, err)
    return res.status(statusCode >= 400 && statusCode < 600 ? statusCode : 502).json({
      error: "ElevenLabs TTS failed",
      message,
    })
  }
})

app.use((err, _req, res, _next) => {
  console.error("[express]", err)
  res.status(500).json({ error: "Internal server error", message: err instanceof Error ? err.message : String(err) })
})

app.listen(PORT, () => {
  console.log(`[tts] http://localhost:${PORT}  (POST /tts, GET /health)`)
  if (!apiKey) {
    console.warn("[tts] No ELEVENLABS_API_KEY / VITE_ELEVENLABS_API_KEY — /tts will return 503 until .env.local is set.")
  } else {
    console.log(
      `[tts] ElevenLabs key loaded (${apiKey.length} chars, starts with ${apiKey.slice(0, 4)}…) — if you still get 401, rotate the key in ElevenLabs and update .env.local.`,
    )
  }
})
