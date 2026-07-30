import { useState } from "react"
import { Search, Download, Filter } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { AdminPageWrapper } from "./AdminPageWrapper"

type ActionCategory = "auth" | "user" | "config" | "role" | "access"

interface AuditEntry {
  id: string
  timestamp: string
  actor: string
  actorEmail: string
  action: string
  category: ActionCategory
  target: string
  details: string
  status: "success" | "failed"
}

const MOCK_LOGS: AuditEntry[] = [
  { id: "a1", timestamp: "2026-07-03 10:42:11", actor: "Arun Verma", actorEmail: "arun.verma@acko.tech", action: "User invited", category: "user", target: "karan.patel@acko.tech", details: "Invited with role: Viewer, tools: Insights", status: "success" },
  { id: "a2", timestamp: "2026-07-03 09:15:03", actor: "Priya Sharma", actorEmail: "priya.sharma@acko.tech", action: "Role changed", category: "role", target: "neha.joshi@acko.tech", details: "Changed from Viewer → Agent", status: "success" },
  { id: "a3", timestamp: "2026-07-03 08:55:44", actor: "Arun Verma", actorEmail: "arun.verma@acko.tech", action: "Login", category: "auth", target: "arun.verma@acko.tech", details: "Successful Google OAuth login", status: "success" },
  { id: "a4", timestamp: "2026-07-02 17:30:20", actor: "Priya Sharma", actorEmail: "priya.sharma@acko.tech", action: "User deactivated", category: "user", target: "anjali.rao@acko.tech", details: "Reason: Extended leave", status: "success" },
  { id: "a5", timestamp: "2026-07-02 16:10:05", actor: "Rohan Mehta", actorEmail: "rohan.mehta@acko.tech", action: "Tool config updated", category: "config", target: "Support — SLA Settings", details: "Default SLA changed from 4h → 2h", status: "success" },
  { id: "a6", timestamp: "2026-07-02 14:55:33", actor: "Arun Verma", actorEmail: "arun.verma@acko.tech", action: "Team created", category: "user", target: "Platform & Neo", details: "New team with 3 members", status: "success" },
  { id: "a7", timestamp: "2026-07-02 11:22:17", actor: "Priya Sharma", actorEmail: "priya.sharma@acko.tech", action: "Permission modified", category: "role", target: "Agent role", details: "Removed access to Insights", status: "success" },
  { id: "a8", timestamp: "2026-07-01 09:45:00", actor: "Unknown", actorEmail: "unknown@acko.tech", action: "Login attempt failed", category: "auth", target: "—", details: "Invalid domain: attacker@external.com", status: "failed" },
  { id: "a9", timestamp: "2026-07-01 08:30:11", actor: "Arun Verma", actorEmail: "arun.verma@acko.tech", action: "SSO domain added", category: "config", target: "acko.tech", details: "Allowed Google Workspace domain: acko.tech", status: "success" },
  { id: "a10", timestamp: "2026-06-30 17:05:44", actor: "Priya Sharma", actorEmail: "priya.sharma@acko.tech", action: "User role changed", category: "role", target: "rohan.mehta@acko.tech", details: "Changed from Agent → Manager", status: "success" },
  { id: "a11", timestamp: "2026-06-30 15:20:09", actor: "Rohan Mehta", actorEmail: "rohan.mehta@acko.tech", action: "Tool config updated", category: "config", target: "Support — Queue", details: "Priority queue threshold adjusted", status: "success" },
  { id: "a12", timestamp: "2026-06-29 10:10:55", actor: "Arun Verma", actorEmail: "arun.verma@acko.tech", action: "Login", category: "auth", target: "arun.verma@acko.tech", details: "Successful Google OAuth login", status: "success" },
]

const CATEGORY_LABELS: Record<ActionCategory, string> = {
  auth: "Authentication",
  user: "User Management",
  config: "Configuration",
  role: "Role & Access",
  access: "Access Control",
}

const CATEGORY_COLORS: Record<ActionCategory, string> = {
  auth: "bg-[#e0f2fe] text-[#0369a1] border-[#bae6fd]",
  user: "bg-[#efe9fb] text-[#7c47e1] border-[#d6c8f8]",
  config: "bg-[#fef3c7] text-[#92400e] border-[#fde68a]",
  role: "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]",
  access: "bg-[#f5f5f9] text-[#5b5675] border-[#e7e7f0]",
}

export function AuditLogs() {
  const [search, setSearch] = useState("")
  const [filterCategory, setFilterCategory] = useState<ActionCategory | "all">("all")
  const [filterStatus, setFilterStatus] = useState<"all" | "success" | "failed">("all")
  const [expanded, setExpanded] = useState<string | null>(null)

  const filtered = MOCK_LOGS.filter((log) => {
    const q = search.toLowerCase()
    return (
      (log.actor.toLowerCase().includes(q) ||
        log.action.toLowerCase().includes(q) ||
        log.target.toLowerCase().includes(q) ||
        log.details.toLowerCase().includes(q)) &&
      (filterCategory === "all" || log.category === filterCategory) &&
      (filterStatus === "all" || log.status === filterStatus)
    )
  })

  return (
    <AdminPageWrapper
      title="Audit Logs"
      description="A full audit trail of all admin actions and authentication events in the OMNI Suite."
      action={
        <Button variant="outline" className="border-[#e7e7f0] text-[#5b5675] h-9 gap-2 text-sm hover:border-[#c4b8f5]">
          <Download size={15} /> Export CSV
        </Button>
      }
    >
      {/* Filters */}
      <div className="flex flex-wrap gap-3 mb-5">
        <div className="relative flex-1 min-w-[220px]">
          <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#5b5675]/50 pointer-events-none" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by actor, action, or target…"
            className="pl-9"
          />
        </div>
        <select
          value={filterCategory}
          onChange={(e) => setFilterCategory(e.target.value as ActionCategory | "all")}
          className="h-9 px-3 text-sm border border-[#e7e7f0] rounded-md bg-white text-[#5b5675] focus:outline-none focus:border-[#7c47e1] transition-colors"
        >
          <option value="all">All categories</option>
          {Object.entries(CATEGORY_LABELS).map(([v, l]) => (
            <option key={v} value={v}>{l}</option>
          ))}
        </select>
        <select
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value as "all" | "success" | "failed")}
          className="h-9 px-3 text-sm border border-[#e7e7f0] rounded-md bg-white text-[#5b5675] focus:outline-none focus:border-[#7c47e1] transition-colors"
        >
          <option value="all">All statuses</option>
          <option value="success">Success</option>
          <option value="failed">Failed</option>
        </select>
        <div className="flex items-center gap-1.5 text-xs text-[#5b5675]/60">
          <Filter size={12} /> {filtered.length} entries
        </div>
      </div>

      {/* Log table */}
      <div className="bg-white border border-[#e7e7f0] rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#e7e7f0] bg-[#fafafa]">
              <th className="text-left px-4 py-3 font-medium text-[#5b5675] w-[165px]">Timestamp</th>
              <th className="text-left px-4 py-3 font-medium text-[#5b5675]">Actor</th>
              <th className="text-left px-4 py-3 font-medium text-[#5b5675]">Action</th>
              <th className="text-left px-4 py-3 font-medium text-[#5b5675]">Category</th>
              <th className="text-left px-4 py-3 font-medium text-[#5b5675]">Status</th>
            </tr>
          </thead>
          <tbody>
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-10 text-center text-[#5b5675]/60 text-sm">
                  No audit entries match your filters.
                </td>
              </tr>
            ) : (
              filtered.map((log) => (
                <>
                  <tr
                    key={log.id}
                    className="border-b border-[#e7e7f0] last:border-0 hover:bg-[#fafafa] cursor-pointer"
                    onClick={() => setExpanded(expanded === log.id ? null : log.id)}
                  >
                    <td className="px-4 py-3 text-[#5b5675] text-xs font-mono whitespace-nowrap">{log.timestamp}</td>
                    <td className="px-4 py-3">
                      <p className="text-[#36354c] font-medium leading-none">{log.actor}</p>
                      <p className="text-[#5b5675] text-xs mt-0.5">{log.actorEmail}</p>
                    </td>
                    <td className="px-4 py-3 text-[#36354c]">{log.action}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${CATEGORY_COLORS[log.category]}`}>
                        {CATEGORY_LABELS[log.category]}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium border ${log.status === "success" ? "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]" : "bg-red-50 text-red-600 border-red-200"}`}>
                        {log.status === "success" ? "Success" : "Failed"}
                      </span>
                    </td>
                  </tr>
                  {expanded === log.id && (
                    <tr key={`${log.id}-detail`} className="bg-[#fafafa] border-b border-[#e7e7f0]">
                      <td colSpan={5} className="px-4 py-3">
                        <div className="flex flex-wrap gap-6 text-xs text-[#5b5675]">
                          <span><strong className="text-[#36354c]">Target:</strong> {log.target}</span>
                          <span><strong className="text-[#36354c]">Details:</strong> {log.details}</span>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))
            )}
          </tbody>
        </table>
      </div>
    </AdminPageWrapper>
  )
}
