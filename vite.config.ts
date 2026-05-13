import { fileURLToPath, URL } from "node:url"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
  server: {
    port: 4002,
    /** `npm run dev` runs `scripts/dev-4002.mjs`, which frees 4002 first; keep strict so we never silently hop ports. */
    strictPort: true,
  },
})
