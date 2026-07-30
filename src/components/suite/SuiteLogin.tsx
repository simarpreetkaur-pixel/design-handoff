import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth, issuiteAdminRole } from "@/contexts/AuthContext"
import { Button } from "@/components/ui/button"

/* Figma assets — node 2:781 */
const imgBgGradient = "https://www.figma.com/api/mcp/asset/a9672a80-4eec-452f-a1c3-66ba5fcd324b"
const imgEllipseGlow = "https://www.figma.com/api/mcp/asset/60dd0ddf-8af1-4fee-97ab-d89b7c3a100d"

export function SuiteLogin() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState("")
  const [keepSignedIn, setKeepSignedIn] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault()
    if (!email.trim()) return
    setLoading(true)
    setError("")
    // Simulate brief auth delay
    await new Promise((r) => setTimeout(r, 600))
    const authedUser = login(email)
    // Route based on role: suite admins → dashboard, everyone else → Support tool directly
    if (issuiteAdminRole(authedUser.role)) {
      navigate("/suite")
    } else {
      navigate("/")
    }
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden">
      {/* ── LEFT PANEL — light form side ── */}
      <div className="relative flex w-1/2 flex-col overflow-hidden bg-white">
        {/* Subtle pink/purple gradient in the top-left corner */}
        <img
          src={imgBgGradient}
          alt=""
          aria-hidden
          className="pointer-events-none absolute inset-0 h-full w-full object-cover object-top opacity-60 select-none"
        />

        {/* Form — positioned at ~139px from left, ~282px from top (matching Figma canvas) */}
        <div
          className="relative z-10 flex flex-col gap-6 w-[360px]"
          style={{ marginLeft: "139px", marginTop: "282px" }}
        >
          {/* Heading */}
          <div className="flex flex-col gap-2">
            <h1
              className="text-[30px] font-bold leading-[36px] text-[#0a0a0a]"
              style={{ fontFamily: "var(--font-omni-sans)" }}
            >
              Sign in to OMNI Suite
            </h1>
            <p className="text-sm font-normal leading-[20px] text-[#737373]">
              Enter your work email to access your dashboard
            </p>
          </div>

          {/* Form fields */}
          <form onSubmit={handleLogin} className="flex flex-col gap-4">
            {/* Email field */}
            <div className="flex flex-col gap-2">
              <label
                htmlFor="email"
                className="text-sm font-medium leading-none text-[#0a0a0a]"
              >
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError("") }}
                placeholder="name@acko.tech"
                required
                className="h-9 w-full rounded-[8px] border border-[#e5e5e5] bg-white px-3 py-1 text-sm italic text-[#737373] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] placeholder:text-[#737373] focus:outline-none focus:border-[#7c47e1] focus:not-italic transition-colors"
              />
              {error && <p className="text-xs text-red-500">{error}</p>}
              {/* Demo hint */}
              <div className="flex flex-col gap-1 mt-1 p-3 rounded-lg bg-[#f5f5f9] border border-[#e7e7f0]">
                <p className="text-[11px] font-semibold text-[#5b5675] uppercase tracking-wider mb-0.5">Demo accounts</p>
                {[
                  { email: "arun.verma@acko.tech", role: "Super Admin" },
                  { email: "priya.sharma@acko.tech", role: "Admin" },
                  { email: "rohan.mehta@acko.tech", role: "Manager → Support" },
                  { email: "neha.joshi@acko.tech", role: "Agent → Support" },
                ].map(({ email: demoEmail, role }) => (
                  <button
                    key={demoEmail}
                    type="button"
                    onClick={() => setEmail(demoEmail)}
                    className="flex items-center justify-between w-full text-left px-0 py-0.5 group"
                  >
                    <span className="text-xs text-[#7c47e1] group-hover:underline font-mono">{demoEmail}</span>
                    <span className="text-[10px] text-[#5b5675]/60 ml-2 shrink-0">{role}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* Keep signed in + Unable to sign in */}
            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <div
                  onClick={() => setKeepSignedIn((v) => !v)}
                  className={`size-4 rounded-[4px] border border-[#e5e5e5] flex items-center justify-center shrink-0 cursor-pointer shadow-[0px_1px_3px_0px_rgba(0,0,0,0.10),0px_1px_2px_-1px_rgba(0,0,0,0.10)] transition-colors ${keepSignedIn ? "bg-[#7c47e1] border-[#7c47e1]" : "bg-white"}`}
                >
                  {keepSignedIn && (
                    <svg width="10" height="8" viewBox="0 0 10 8" fill="none" aria-hidden>
                      <path d="M1 4L3.5 6.5L9 1" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  )}
                </div>
                <span className="text-sm font-medium leading-none text-[#0a0a0a]">
                  Keep me signed in
                </span>
              </label>
              <button
                type="button"
                className="text-sm text-[#737373] underline underline-offset-2 decoration-[#737373] hover:text-[#0a0a0a] transition-colors whitespace-nowrap"
              >
                Unable to sign in?
              </button>
            </div>

            {/* Log in button */}
            <Button
              type="submit"
              disabled={loading}
              className="w-full h-9 bg-[#7c47e1] hover:bg-[#6a3bc5] text-white text-sm font-medium rounded-[8px] shadow-none disabled:opacity-70 transition-colors"
            >
              {loading ? "Signing in…" : "Log in"}
            </Button>
          </form>
        </div>
      </div>

      {/* ── RIGHT PANEL — dark branding side ── */}
      <div
        className="relative flex w-1/2 flex-col items-center justify-center overflow-hidden"
        style={{ backgroundColor: "#0e0e0e" }}
      >
        {/* Large purple radial glow ellipse — matches Figma node 5:1069 */}
        {/* Position: left -634px, top -472px, size 1174×1174 within the 640px right panel */}
        <div
          className="pointer-events-none absolute select-none"
          style={{
            left: "-634px",
            top: "-472px",
            width: "1174px",
            height: "1174px",
          }}
        >
          <img
            src={imgEllipseGlow}
            alt=""
            aria-hidden
            className="block h-full w-full object-cover"
          />
        </div>

        {/* Center content — ACKO logo + tagline */}
        <div className="relative z-10 flex flex-col items-center gap-[31px] px-8">
          {/* ACKO horizontal logo (white version) */}
          <img
            src="/acko-logo-white.png"
            alt="ACKO"
            className="h-[58px] w-auto object-contain shrink-0"
          />

          {/* Tagline */}
          <p
            className="text-center text-[30px] font-semibold leading-[1.16] text-white max-w-[571px]"
            style={{ fontFamily: "var(--font-omni-sans)" }}
          >
            One Platform for intelligent customer operations.
          </p>
        </div>
      </div>
    </div>
  )
}
