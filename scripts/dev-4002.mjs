#!/usr/bin/env node
/**
 * Dev orchestration:
 * 1. Free ports 4002 (Vite) and 3001 (Express TTS) on macOS/Linux.
 * 2. Start the ElevenLabs TTS server (`server.js`), wait until `/health` responds.
 * 3. Start Vite on 4002 with `--strictPort`.
 *
 * This avoids "Failed to fetch" on the Live listening speaker when only Vite was running.
 */
import { execFileSync, spawn } from "node:child_process"
import path from "node:path"
import process from "node:process"
import { fileURLToPath } from "node:url"

const VITE_PORT = 4002
const TTS_PORT = 3001
const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..")
const viteBin = path.join(projectRoot, "node_modules", "vite", "bin", "vite.js")

function killListenersOnPort(port, label) {
  if (process.platform === "win32") {
    console.warn(`[dev] Skipping port ${port} cleanup on Windows (${label}). Stop conflicting processes manually if needed.`)
    return
  }
  try {
    const out = execFileSync("lsof", ["-ti", `tcp:${port}`], { encoding: "utf8" }).trim()
    if (!out) return
    const pids = [...new Set(out.split(/\s+/).filter(Boolean))]
    for (const pid of pids) {
      const n = Number.parseInt(pid, 10)
      if (!Number.isFinite(n)) continue
      try {
        process.kill(n, "SIGKILL")
        console.log(`[dev] Freed ${label} port ${port} (killed PID ${n})`)
      } catch {
        // process may have exited
      }
    }
  } catch {
    // lsof exits 1 when nothing is listening
  }
}

async function waitForTtsReady(ttsChild, maxMs = 15_000) {
  const start = Date.now()
  const healthUrl = `http://127.0.0.1:${TTS_PORT}/health`
  while (Date.now() - start < maxMs) {
    if (ttsChild.exitCode != null) {
      console.warn("[dev] TTS server exited before becoming ready — check server logs. Speaker button will fail until you run `npm run server`.")
      return false
    }
    try {
      const r = await fetch(healthUrl, { signal: AbortSignal.timeout(1500) })
      if (r.ok) {
        console.log(`[dev] TTS server ready at http://localhost:${TTS_PORT}`)
        return true
      }
    } catch {
      // ECONNREFUSED while server boots
    }
    await new Promise((r) => setTimeout(r, 120))
  }
  console.warn(
    `[dev] TTS server did not respond on port ${TTS_PORT} within ${maxMs}ms — run \`npm run server\` in another terminal, then retry the speaker button.`,
  )
  return false
}

async function main() {
  killListenersOnPort(VITE_PORT, "Vite")
  killListenersOnPort(TTS_PORT, "TTS")

  const ttsChild = spawn(process.execPath, ["--import", "./server-env.mjs", "./server.js"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  })

  ttsChild.on("error", (err) => {
    console.error("[dev] Failed to spawn TTS server:", err.message)
  })

  await waitForTtsReady(ttsChild)

  const viteChild = spawn(process.execPath, [viteBin, "--port", String(VITE_PORT), "--strictPort"], {
    cwd: projectRoot,
    stdio: "inherit",
    env: process.env,
  })

  viteChild.on("error", (err) => {
    console.error("[dev] Failed to start Vite:", err.message)
    try {
      ttsChild.kill("SIGTERM")
    } catch {
      // ignore
    }
    process.exit(1)
  })

  const stopTts = () => {
    if (ttsChild.exitCode != null) return
    try {
      ttsChild.kill("SIGTERM")
    } catch {
      // ignore
    }
    setTimeout(() => {
      try {
        ttsChild.kill("SIGKILL")
      } catch {
        // ignore
      }
    }, 2000)
  }

  const onSignal = () => {
    stopTts()
    try {
      viteChild.kill("SIGINT")
    } catch {
      // ignore
    }
  }
  process.on("SIGINT", onSignal)
  process.on("SIGTERM", onSignal)

  viteChild.on("exit", (code, signal) => {
    stopTts()
    if (signal) process.kill(process.pid, signal)
    process.exit(code ?? 0)
  })
}

main().catch((err) => {
  console.error("[dev]", err)
  process.exit(1)
})
