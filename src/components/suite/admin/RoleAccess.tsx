import { useState } from "react"
import { Plus, Info } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminPageWrapper } from "./AdminPageWrapper"

interface RoleDefinition {
  id: string
  name: string
  description: string
  color: string
  permissions: Record<string, boolean>
  isSystem: boolean
}

const TOOLS = ["Support", "Sales", "Insights", "Neo"]

const PERMISSION_GROUPS: { label: string; keys: string[] }[] = [
  {
    label: "Tool Access",
    keys: TOOLS.map((t) => `tool_${t.toLowerCase()}`),
  },
  {
    label: "User Management",
    keys: ["users_view", "users_invite", "users_deactivate", "users_change_role"],
  },
  {
    label: "Admin",
    keys: ["teams_manage", "roles_manage", "audit_logs_view", "security_manage"],
  },
]

const PERMISSION_LABELS: Record<string, string> = {
  tool_support: "Support",
  tool_sales: "Sales",
  tool_insights: "Insights",
  tool_neo: "Neo",
  users_view: "View all users",
  users_invite: "Invite users",
  users_deactivate: "Deactivate users",
  users_change_role: "Change user roles",
  teams_manage: "Manage teams",
  roles_manage: "Manage roles",
  audit_logs_view: "View audit logs",
  security_manage: "Security & SSO settings",
}

const DEFAULT_ROLES: RoleDefinition[] = [
  {
    id: "super_admin",
    name: "Super Admin",
    description: "Full unrestricted access to all tools and admin settings.",
    color: "#7c47e1",
    isSystem: true,
    permissions: Object.fromEntries(Object.keys(PERMISSION_LABELS).map((k) => [k, true])),
  },
  {
    id: "admin",
    name: "Admin",
    description: "Can manage users, teams, and tool configurations. Cannot change security settings.",
    color: "#0ea5e9",
    isSystem: true,
    permissions: {
      tool_support: true, tool_sales: true, tool_insights: true, tool_neo: true,
      users_view: true, users_invite: true, users_deactivate: true, users_change_role: true,
      teams_manage: true, roles_manage: false, audit_logs_view: true, security_manage: false,
    },
  },
  {
    id: "manager",
    name: "Manager",
    description: "Can view users and access their assigned tools and configurations.",
    color: "#10b981",
    isSystem: true,
    permissions: {
      tool_support: true, tool_sales: true, tool_insights: true, tool_neo: false,
      users_view: true, users_invite: false, users_deactivate: false, users_change_role: false,
      teams_manage: false, roles_manage: false, audit_logs_view: false, security_manage: false,
    },
  },
  {
    id: "agent",
    name: "Agent",
    description: "Can access assigned tools only. No admin capabilities.",
    color: "#5b5675",
    isSystem: true,
    permissions: {
      tool_support: true, tool_sales: false, tool_insights: false, tool_neo: false,
      users_view: false, users_invite: false, users_deactivate: false, users_change_role: false,
      teams_manage: false, roles_manage: false, audit_logs_view: false, security_manage: false,
    },
  },
  {
    id: "viewer",
    name: "Viewer",
    description: "Read-only access to Insights. No tool or admin actions.",
    color: "#f59e0b",
    isSystem: true,
    permissions: {
      tool_support: false, tool_sales: false, tool_insights: true, tool_neo: false,
      users_view: false, users_invite: false, users_deactivate: false, users_change_role: false,
      teams_manage: false, roles_manage: false, audit_logs_view: false, security_manage: false,
    },
  },
]

export function RoleAccess() {
  const [roles, setRoles] = useState<RoleDefinition[]>(DEFAULT_ROLES)
  const [selectedRoleId, setSelectedRoleId] = useState<string>("super_admin")

  const selectedRole = roles.find((r) => r.id === selectedRoleId)!

  function togglePermission(key: string) {
    if (selectedRole.isSystem && selectedRole.id === "super_admin") return
    setRoles((prev) =>
      prev.map((r) =>
        r.id === selectedRoleId
          ? { ...r, permissions: { ...r.permissions, [key]: !r.permissions[key] } }
          : r
      )
    )
  }

  return (
    <AdminPageWrapper
      title="Role & Access Control"
      description="Define what each role can see and do across the OMNI Suite."
      action={
        <Button className="bg-[#7c47e1] hover:bg-[#6a3bc5] text-white h-9 gap-2 text-sm">
          <Plus size={15} /> New role
        </Button>
      }
    >
      <div className="flex gap-5">
        {/* Role list */}
        <div className="w-56 shrink-0 flex flex-col gap-1.5">
          {roles.map((role) => (
            <button
              key={role.id}
              onClick={() => setSelectedRoleId(role.id)}
              className={`text-left w-full px-4 py-3 rounded-xl border text-sm transition-all ${
                selectedRoleId === role.id
                  ? "bg-[#efe9fb] border-[#d6c8f8] text-[#7c47e1] font-medium"
                  : "bg-white border-[#e7e7f0] text-[#5b5675] hover:bg-[#fafafa] hover:border-[#c4b8f5]"
              }`}
            >
              <div className="flex items-center gap-2">
                <span className="size-2 rounded-full shrink-0" style={{ backgroundColor: role.color }} />
                {role.name}
              </div>
            </button>
          ))}
        </div>

        {/* Permission matrix */}
        <div className="flex-1 bg-white border border-[#e7e7f0] rounded-2xl overflow-hidden">
          <div className="border-b border-[#e7e7f0] px-6 py-4 bg-[#fafafa]">
            <div className="flex items-center gap-2">
              <span className="size-3 rounded-full" style={{ backgroundColor: selectedRole.color }} />
              <h2 className="text-[#36354c] font-semibold">{selectedRole.name}</h2>
              {selectedRole.isSystem && (
                <span className="text-[10px] font-semibold uppercase tracking-wider bg-[#f5f5f9] border border-[#e7e7f0] text-[#5b5675] px-2 py-0.5 rounded-full">
                  System
                </span>
              )}
            </div>
            <p className="text-[#5b5675] text-sm mt-0.5">{selectedRole.description}</p>
          </div>

          <div className="p-6 space-y-6">
            {PERMISSION_GROUPS.map((group) => (
              <div key={group.label}>
                <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/50 mb-3">
                  {group.label}
                </p>
                <div className="space-y-2">
                  {group.keys.map((key) => {
                    const enabled = selectedRole.permissions[key]
                    const locked = selectedRole.id === "super_admin"
                    return (
                      <div
                        key={key}
                        className="flex items-center justify-between py-2.5 px-4 rounded-xl border border-[#e7e7f0] bg-[#fafafa]"
                      >
                        <span className="text-sm text-[#36354c]">{PERMISSION_LABELS[key]}</span>
                        <Switch
                          checked={enabled}
                          onCheckedChange={() => togglePermission(key)}
                          disabled={locked}
                          title={locked ? "Super admin always has full access" : undefined}
                        />
                      </div>
                    )
                  })}
                </div>
              </div>
            ))}

            {selectedRole.isSystem && selectedRole.id !== "super_admin" && (
              <Alert variant="info">
                <Info size={14} />
                <AlertDescription>
                  System roles can have permissions adjusted but cannot be deleted. Create a custom role for fully bespoke configurations.
                </AlertDescription>
              </Alert>
            )}
          </div>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
