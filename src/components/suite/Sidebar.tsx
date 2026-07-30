import { NavLink } from "react-router-dom"
import {
  LayoutGrid,
  Users,
  UsersRound,
  ShieldCheck,
  UserPlus,
  Settings,
  Star,
  LogOut,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { type AuthUser, type UserRole } from "@/contexts/AuthContext"

interface SidebarProps {
  user: AuthUser | null
  onLogout: () => void
}

interface NavItemProps {
  to: string
  icon: React.ReactNode
  label: string
  end?: boolean
}

function NavItem({ to, icon, label, end }: NavItemProps) {
  return (
    <NavLink
      to={to}
      end={end}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium transition-colors",
          isActive
            ? "bg-[#efe9fb] text-[#7c47e1]"
            : "text-[#5b5675] hover:bg-[#f5f5f9] hover:text-[#36354c]"
        )
      }
    >
      <span className="shrink-0 size-[18px] flex items-center justify-center">{icon}</span>
      <span className="flex-1 leading-none">{label}</span>
    </NavLink>
  )
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="px-3.5 pt-5 pb-1 text-[10px] font-semibold uppercase tracking-widest text-[#5b5675]/50 select-none">
      {children}
    </p>
  )
}

function Divider() {
  return <div className="mx-3 my-1 border-t border-[#e7e7f0]" />
}

function UserAvatar({ name }: { name: string }) {
  const initials = name
    .split(" ")
    .slice(0, 2)
    .map((n) => n[0])
    .join("")
    .toUpperCase()
  return (
    <div className="size-8 rounded-md bg-[#efe9fb] text-[#7c47e1] flex items-center justify-center text-xs font-semibold leading-none shrink-0">
      {initials}
    </div>
  )
}

function RoleBadge({ role }: { role: UserRole }) {
  const labels: Record<UserRole, string> = {
    super_admin: "Super Admin",
    admin: "Admin",
    manager: "Manager",
    agent: "Agent",
    viewer: "Viewer",
  }
  const colors: Record<UserRole, string> = {
    super_admin: "bg-[#efe9fb] text-[#7c47e1]",
    admin: "bg-[#e0f2fe] text-[#0369a1]",
    manager: "bg-[#d1fae5] text-[#065f46]",
    agent: "bg-[#f5f5f9] text-[#5b5675]",
    viewer: "bg-[#fef3c7] text-[#92400e]",
  }
  return (
    <span className={cn("text-[10px] font-semibold px-2 py-0.5 rounded-full", colors[role])}>
      {labels[role]}
    </span>
  )
}

export function Sidebar({ user, onLogout }: SidebarProps) {
  const role: UserRole = user?.role ?? "viewer"
  const isSuperAdmin = role === "super_admin"
  const isAdmin = role === "admin"

  return (
    <aside className="flex flex-col h-full w-[248px] shrink-0 bg-white border-r border-[#e7e7f0]">
      {/* ── Scrollable nav area ── */}
      <div className="flex-1 overflow-y-auto pt-5">

        {/* All tools — visible to every role in the suite shell */}
        <div className="flex flex-col gap-0.5 px-3">
          <NavItem to="/suite" end icon={<LayoutGrid size={18} />} label="All tools" />
        </div>

        {/* ── People section ──
            Super Admin: Users, Teams, Roles & Access, Onboard
            Admin:       Users, Teams, Onboard (no Roles — can't create/edit permission sets)
        */}
        {(isSuperAdmin || isAdmin) && (
          <>
            <Divider />
            <SectionLabel>People</SectionLabel>
            <div className="flex flex-col gap-0.5 px-3">
              <NavItem to="/suite/users" icon={<Users size={18} />} label="User Management" />
              <NavItem to="/suite/teams" icon={<UsersRound size={18} />} label="Teams" />
              {isSuperAdmin && (
                <NavItem to="/suite/roles" icon={<ShieldCheck size={18} />} label="Role & Access" />
              )}
              <NavItem to="/suite/onboard" icon={<UserPlus size={18} />} label="Onboard User" />
            </div>
          </>
        )}

        {/* ── Account section ──
            Admin gets Settings + Preferences (personal config).
            Super Admin manages workspace-level settings the same way,
            but via the full Settings page — we still surface it here.
        */}
        {(isSuperAdmin || isAdmin) && (
          <>
            <Divider />
            <SectionLabel>Account</SectionLabel>
            <div className="flex flex-col gap-0.5 px-3">
              {isSuperAdmin && (
                <NavItem to="/suite/settings" icon={<Settings size={18} />} label="Settings" />
              )}
              <NavItem to="/suite/preferences" icon={<Star size={18} />} label="Preferences" />
            </div>
          </>
        )}
      </div>

      {/* ── User profile footer — pinned to bottom ── */}
      <div className="shrink-0">
        <div className="mx-3 border-t border-[#e7e7f0]" />
        <div className="px-3 pt-3 pb-5">
          {/* User info */}
          <div className="flex items-center gap-3 px-2.5 py-2.5 rounded-xl mb-0.5">
            {user && <UserAvatar name={user.name} />}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-[#36354c] leading-none truncate">{user?.name}</p>
              <p className="text-xs text-[#5b5675] leading-none mt-1 truncate">{user?.email}</p>
              {user && <RoleBadge role={user.role} />}
            </div>
          </div>

          {/* Sign out */}
          <button
            onClick={onLogout}
            className="flex items-center gap-2.5 w-full px-3.5 py-2.5 rounded-xl text-sm font-medium text-[#5b5675] hover:bg-[#fafafa] hover:text-[#36354c] transition-colors"
          >
            <LogOut size={16} className="shrink-0" />
            <span className="leading-none">Sign out</span>
          </button>
        </div>
      </div>
    </aside>
  )
}
