/**
 * Resolves a public-folder asset path against Vite's base URL so it works
 * both on localhost (base="/") and on GitHub Pages (base="/design-handoff/").
 *
 * Usage:  <img src={asset("/icons/foo.png")} />
 */
export function asset(path: string): string {
  return `${import.meta.env.BASE_URL}${path.replace(/^\//, "")}`
}
