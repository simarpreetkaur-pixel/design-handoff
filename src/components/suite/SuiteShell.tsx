import { Navigate, Outlet, useNavigate } from "react-router-dom"
import { useAuth, issuiteAdminRole } from "@/contexts/AuthContext"
import { Sidebar } from "./Sidebar"

/** Wraps all authenticated Suite routes. Redirects to /login if not authenticated.
 *  Managers and agents are bounced directly to the Support tool. */
export function SuiteShell() {
  const { isAuthenticated, user, logout } = useAuth()
  const navigate = useNavigate()

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Managers / agents / viewers don't belong in the Suite dashboard — send them to Support
  if (user && !issuiteAdminRole(user.role)) {
    return <Navigate to="/" replace />
  }

  function handleLogout() {
    logout()
    navigate("/login")
  }

  return (
    <div className="flex flex-col h-screen w-screen overflow-hidden bg-[#fafafa]">
      {/* Top navigation bar — logo only */}
      <header className="shrink-0 flex items-center h-[72px] bg-white border-b border-[#e7e7f0] px-10 shadow-[0px_2px_5px_rgba(0,0,0,0.08)] z-20">
        <div className="flex items-center gap-4">
          <img src="/acko-logo.png" alt="ACKO" className="h-7 w-auto object-contain" />
          <div className="h-6 w-px bg-[#e7e7f0]" />
          <span className="text-[#2c2067] text-2xl font-normal leading-none tracking-tight">
            OMNI Suite
          </span>
        </div>
      </header>

      {/* Below nav: sidebar + content */}
      <div className="flex flex-1 overflow-hidden">
        <Sidebar user={user} onLogout={handleLogout} />
        <main className="flex-1 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
