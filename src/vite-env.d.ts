/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_ELEVENLABS_API_KEY?: string
  /** Base URL for the Express TTS server (default `http://localhost:3001`). */
  readonly VITE_TTS_SERVER_URL?: string
}
