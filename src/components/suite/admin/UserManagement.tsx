import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Search, UserPlus, MoreHorizontal, ChevronUp, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminPageWrapper } from "./AdminPageWrapper"

export type Role = "super_admin" | "admin" | "manager" | "agent" | "viewer"
export type UserStatus = "active" | "inactive" | "pending"

export interface MockUser {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  team: string
  lastActive: string
  tools: string[]
}

const MOCK_USERS: MockUser[] = [
  { id: "u1", name: "Arun Verma", email: "arun.verma@acko.tech", role: "super_admin", status: "active", team: "Platform", lastActive: "Today", tools: ["Support", "Sales", "Insights", "Neo"] },
  { id: "u2", name: "Priya Sharma", email: "priya.sharma@acko.tech", role: "admin", status: "active", team: "Support", lastActive: "Today", tools: ["Support", "Insights"] },
  { id: "u3", name: "Rohan Mehta", email: "rohan.mehta@acko.tech", role: "manager", status: "active", team: "Support", lastActive: "Yesterday", tools: ["Support"] },
  { id: "u4", name: "Neha Joshi", email: "neha.joshi@acko.tech", role: "agent", status: "active", team: "Support", lastActive: "2 days ago", tools: ["Support"] },
  { id: "u5", name: "Vikram Singh", email: "vikram.singh@acko.tech", role: "agent", status: "active", team: "Sales", lastActive: "Today", tools: ["Sales"] },
  { id: "u6", name: "Anjali Rao", email: "anjali.rao@acko.tech", role: "agent", status: "inactive", team: "Support", lastActive: "3 weeks ago", tools: ["Support"] },
  { id: "u7", name: "Karan Patel", email: "karan.patel@acko.tech", role: "viewer", status: "pending", team: "Insights", lastActive: "Never", tools: ["Insights"] },
  { id: "u8", name: "Shreya Das", email: "shreya.das@acko.tech", role: "agent", status: "active", team: "Support", lastActive: "Today", tools: ["Support"] },
]

const ROLE_LABELS: Record<Role, string> = {
  super_admin: "Super Admin",
  admin: "Admin",
  manager: "Manager",
  agent: "Agent",
  viewer: "Viewer",
}

const ROLE_COLORS: Record<Role, string> = {
  super_admin: "bg-[#efe9fb] text-[#7c47e1] border-[#d6c8f8]",
  admin: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
  manager: "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]",
  agent: "bg-[#f5f5f9] text-[#5b5675] border-[#e7e7f0]",
  viewer: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
}

const STATUS_COLORS: Record<UserStatus, string> = {
  active: "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]",
  inactive: "bg-[#f5f5f9] text-[#5b5675] border-[#e7e7f0]",
  pending: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
}

type SortField = "name" | "role" | "status" | "team" | "lastActive"

export function UserManagement() {
  const navigate = useNavigate()
  const [search, setSearch] = useState("")
  const [filterRole, setFilterRole] = useState<Role | "all">("all")
  const [filterStatus, setFilterStatus] = useState<UserStatus | "all">("all")
  const [sortField, setSortField] = useState<SortField>("name")
  const [sortDir, setSortDir] = useState<"asc" | "desc">("asc")
  const [users, setUsers] = useState<MockUser[]>(MOCK_USERS)

  function handleSort(field: SortField) {
    if (sortField === field) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"))
    } else {
      setSortField(field)
      setSortDir("asc")
    }
  }

  function handleToggleStatus(userId: string) {
    setUsers((prev) =>
      prev.map((u) =>
        u.id === userId
          ? { ...u, status: u.status === "active" ? "inactive" : "active" }
          : u
      )
    )
  }

  const filtered = users
    .filter((u) => {
      const q = search.toLowerCase()
      return (
        (u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q)) &&
        (filterRole === "all" || u.role === filterRole) &&
        (filterStatus === "all" || u.status === filterStatus)
      )
    })
    .sort((a, b) => {
      const av = a[sortField as keyof MockUser] as string
      const bv = b[sortField as keyof MockUser] as string
      return sortDir === "asc" ? av.localeCompare(bv) : bv.localeCompare(av)
    })

  function SortIcon({ field }: { field: SortField }) {
    if (sortField !== field) return <span className="opacity-30"><ChevronUp size={12} /></span>
    return sortDir === "asc" ? <ChevronUp size={12} /> : <ChevronDown size={12} />
  }

  return (
    <AdminPageWrapper
      title="User Management"
      description="Manage who has access to the OMNI Suite and their roles."
      action={
        <Button
          onClick={() => navigate("/suite/onboard")}
          className="bg-[#7c47e1] hover:bg-[#6a3bc5] text-white h-9 gap-2 text-sm"
        >
          <UserPlus size={15} />
          Invite user
        </Button>
      }
    >
      {/* Filters row */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5b5675]/50 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by name or email…"
            className="pl-9"
          />
        </div>
        <select
          value={filterRole}
          onChange={(e) => setFilterRole(e.target.value as Role | "all")}
          className="h-9 px-3 text-sm border border-[#e7e7f0] rounded-md bg-white text-[#5b5675] focus:outline-none focus:border-[#7c47e1] transition-colors"
        >
          <option value="all">All roles</option>
          {Object.entries(ROLE_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as UserStatus | "all")}
          className="h-9 px-3 text-sm border border-[#e7e7f0] rounded-md bg-white text-[#5b5675] focus:outline-none focus:border-[#7c47e1] transition-colors"
        >
          <option value="all">All statuses</option>
          <option value="active">Active</option>
          <option value="inactive">Inactive</option>
          <option value="pending">Pending</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-white border border-[#e7e7f0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e7e7f0] bg-[#fafafa]">
              {(["name", "role", "team", "status", "lastActive"] as SortField[]).map((f) => (
                <th key={f} className="text-left px-4 py-3 font-medium text-[#5b5675] whitespace-nowrap">
                  <button
                    onClick={() => handleSort(f)}
                    className="flex items-center gap-1 hover:text-[#36354c] transition-colors"
                  >
                    {f === "lastActive" ? "Last active" : f.charAt(0).toUpperCase() + f.slice(1)}
                    <SortIcon field={f} />
                  </button>
                </th>
              ))}
              <th className="px-4 py-3" />
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-10 text-center text-[#5b5675]/60 text-sm">
                  No users match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((u) => (
                <tr
                  key={u.id}
                  className="border-b border-[#e7e7f0] last:border-0 hover:bg-[#fafafa] cursor-pointer"
                  onClick={() => navigate(`/suite/users/${u.id}`)}
                >
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="size-8 rounded-md bg-[#efe9fb] text-[#7c47e1] flex items-center justify-center text-xs font-semibold shrink-0">
                        {u.name.split(" ").slice(0, 2).map((n) => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-[#36354c] leading-none">{u.name}</p>
                        <p className="text-[#5b5675] text-xs mt-0.5">{u.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${ROLE_COLORS[u.role]}`}>
                      {ROLE_LABELS[u.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5b5675]">{u.team}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${STATUS_COLORS[u.status]}`}>
                      {u.status.charAt(0).toUpperCase() + u.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-[#5b5675]">{u.lastActive}</td>
                  <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <button className="size-7 flex items-center justify-center rounded-md hover:bg-[#f5f5f9] text-[#5b5675] transition-colors">
                          <MoreHorizontal size={15} />
                        </button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end" className="w-44">
                        <DropdownMenuItem onSelect={() => navigate(`/suite/users/${u.id}`)}>
                          View details
                        </DropdownMenuItem>
                        <DropdownMenuItem onSelect={() => handleToggleStatus(u.id)}>
                          {u.status === "active" ? "Deactivate" : "Activate"}
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <p className="mt-3 text-xs text-[#5b5675]/50">{filtered.length} of {users.length} users</p>
    </AdminPageWrapper>
  )
}
