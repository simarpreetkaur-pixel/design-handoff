import { createContext, useContext, useState, useCallback, type ReactNode } from "react"

export type UserRole = "super_admin" | "admin" | "manager" | "agent" | "viewer"

export interface AuthUser {
  id: string
  name: string
  email: string
  avatarUrl?: string
  role: UserRole
}

interface AuthContextValue {
  user: AuthUser | null
  isAuthenticated: boolean
  login: (email: string) => AuthUser
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

/** Mock user directory — keyed by lowercase email. */
export const MOCK_USERS_BY_EMAIL: Record<string, AuthUser> = {
  "arun.verma@acko.tech": {
    id: "u1",
    name: "Arun Verma",
    email: "arun.verma@acko.tech",
    role: "super_admin",
  },
  "priya.sharma@acko.tech": {
    id: "u2",
    name: "Priya Sharma",
    email: "priya.sharma@acko.tech",
    role: "admin",
  },
  "rohan.mehta@acko.tech": {
    id: "u3",
    name: "Rohan Mehta",
    email: "rohan.mehta@acko.tech",
    role: "manager",
  },
  "neha.joshi@acko.tech": {
    id: "u4",
    name: "Neha Joshi",
    email: "neha.joshi@acko.tech",
    role: "agent",
  },
  "vikram.singh@acko.tech": {
    id: "u5",
    name: "Vikram Singh",
    email: "vikram.singh@acko.tech",
    role: "agent",
  },
  "anjali.rao@acko.tech": {
    id: "u6",
    name: "Anjali Rao",
    email: "anjali.rao@acko.tech",
    role: "agent",
  },
  "karan.patel@acko.tech": {
    id: "u7",
    name: "Karan Patel",
    email: "karan.patel@acko.tech",
    role: "viewer",
  },
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(() => {
    const stored = sessionStorage.getItem("omni_auth_user")
    return stored ? (JSON.parse(stored) as AuthUser) : null
  })

  const login = useCallback((email: string): AuthUser => {
    const normalised = email.trim().toLowerCase()
    const matched = MOCK_USERS_BY_EMAIL[normalised]
    const authedUser: AuthUser = matched ?? {
      id: "u-unknown",
      name: email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase()),
      email: normalised,
      role: "viewer",
    }
    setUser(authedUser)
    sessionStorage.setItem("omni_auth_user", JSON.stringify(authedUser))
    return authedUser
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    sessionStorage.removeItem("omni_auth_user")
  }, [])

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}

/** Roles that land on the Suite dashboard after login (vs. going straight to a tool). */
export function issuiteAdminRole(role: UserRole): boolean {
  return role === "super_admin" || role === "admin"
}

/** Super admin only — can manage roles and security. */
export function isSuperAdmin(role: UserRole): boolean {
  return role === "super_admin"
}

/** Admin and above — can manage users and teams. */
export function canManagePeople(role: UserRole): boolean {
  return role === "super_admin" || role === "admin"
}

/** Admin and above (but only Settings/Prefs for admin; full config for super_admin). */
export function canManageConfig(role: UserRole): boolean {
  return role === "super_admin" || role === "admin" || role === "manager"
}

/** Super admin and admin only — can view compliance/audit. */
export function canViewCompliance(role: UserRole): boolean {
  return role === "super_admin" || role === "admin"
}

/** Super admin only — security & SSO settings. */
export function canManageSecurity(role: UserRole): boolean {
  return role === "super_admin"
}
