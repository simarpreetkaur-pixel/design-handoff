import { BarChart3, TrendingUp, Users, Clock, Headphones, Zap } from "lucide-react"
import { AdminPageWrapper } from "./AdminPageWrapper"

interface StatCard {
  label: string
  value: string
  change: string
  up: boolean
  icon: React.ReactNode
  color: string
  bgColor: string
}

const STATS: StatCard[] = [
  { label: "Active users (30d)", value: "47", change: "+12% vs last month", up: true, icon: <Users size={20} />, color: "#7c47e1", bgColor: "#efe9fb" },
  { label: "Support tickets (30d)", value: "1,284", change: "+5% vs last month", up: true, icon: <Headphones size={20} />, color: "#0ea5e9", bgColor: "#e0f2fe" },
  { label: "Avg resolution time", value: "2.4h", change: "-18% vs last month", up: true, icon: <Clock size={20} />, color: "#10b981", bgColor: "#d1fae5" },
  { label: "Neo automations run", value: "342", change: "+38% vs last month", up: true, icon: <Zap size={20} />, color: "#f59e0b", bgColor: "#fef3c7" },
]

const TOOL_USAGE = [
  { tool: "Support", users: 32, sessions: 892, avgDuration: "24m", pct: 85 },
  { tool: "Sales", users: 8, sessions: 214, avgDuration: "18m", pct: 35 },
  { tool: "Insights", users: 6, sessions: 78, avgDuration: "12m", pct: 22 },
  { tool: "Neo", users: 3, sessions: 45, avgDuration: "8m", pct: 12 },
]

const TOP_AGENTS = [
  { name: "Neha Joshi", tickets: 148, csat: 4.8, resolution: "1.8h" },
  { name: "Shreya Das", tickets: 134, csat: 4.7, resolution: "2.1h" },
  { name: "Rohan Mehta", tickets: 112, csat: 4.6, resolution: "2.4h" },
  { name: "Vikram Singh", tickets: 98, csat: 4.5, resolution: "2.9h" },
]

export function UsageReports() {
  return (
    <AdminPageWrapper
      title="Usage Reports"
      description="Operational metrics and usage analytics across all OMNI Suite tools."
    >
      {/* Stat cards */}
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4 mb-6">
        {STATS.map((stat) => (
          <div key={stat.label} className="bg-white border border-[#e7e7f0] rounded-2xl p-5 flex flex-col gap-3">
            <div
              className="size-10 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: stat.bgColor, color: stat.color }}
            >
              {stat.icon}
            </div>
            <div>
              <p className="text-[#36354c] text-2xl font-semibold leading-none">{stat.value}</p>
              <p className="text-[#5b5675] text-xs mt-1">{stat.label}</p>
            </div>
            <div className={`flex items-center gap-1 text-xs font-medium ${stat.up ? "text-[#10b981]" : "text-red-500"}`}>
              <TrendingUp size={11} className={stat.up ? "" : "rotate-180"} />
              {stat.change}
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-5 max-w-[1000px]">
        {/* Tool usage breakdown */}
        <div className="bg-white border border-[#e7e7f0] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#e7e7f0] bg-[#fafafa]">
            <BarChart3 size={14} className="text-[#5b5675]/60" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/60">Tool usage (30d)</p>
          </div>
          <div className="px-5 py-4 space-y-4">
            {TOOL_USAGE.map((t) => (
              <div key={t.tool}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-sm font-medium text-[#36354c]">{t.tool}</span>
                  <span className="text-xs text-[#5b5675]">{t.users} users · {t.sessions} sessions · avg {t.avgDuration}</span>
                </div>
                <div className="h-1.5 bg-[#f5f5f9] rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[#7c47e1] transition-all"
                    style={{ width: `${t.pct}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Top agents */}
        <div className="bg-white border border-[#e7e7f0] rounded-2xl overflow-hidden">
          <div className="flex items-center gap-2 px-5 py-3.5 border-b border-[#e7e7f0] bg-[#fafafa]">
            <Users size={14} className="text-[#5b5675]/60" />
            <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/60">Top agents (30d)</p>
          </div>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#e7e7f0]">
                <th className="text-left px-5 py-2.5 text-xs font-medium text-[#5b5675]">Agent</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-[#5b5675]">Tickets</th>
                <th className="text-right px-4 py-2.5 text-xs font-medium text-[#5b5675]">CSAT</th>
                <th className="text-right px-5 py-2.5 text-xs font-medium text-[#5b5675]">Avg resolution</th>
              </tr>
            </thead>
            <tbody>
              {TOP_AGENTS.map((agent, i) => (
                <tr key={agent.name} className="border-b border-[#e7e7f0] last:border-0">
                  <td className="px-5 py-3 flex items-center gap-2.5">
                    <span className="text-[#5b5675]/40 text-xs w-4">{i + 1}</span>
                    <div className="size-7 rounded-md bg-[#efe9fb] text-[#7c47e1] flex items-center justify-center text-xs font-semibold">
                      {agent.name.split(" ").map((n) => n[0]).join("")}
                    </div>
                    <span className="text-[#36354c] font-medium text-sm">{agent.name}</span>
                  </td>
                  <td className="px-4 py-3 text-right text-[#5b5675]">{agent.tickets}</td>
                  <td className="px-4 py-3 text-right">
                    <span className="text-[#10b981] font-medium">{agent.csat}</span>
                  </td>
                  <td className="px-5 py-3 text-right text-[#5b5675]">{agent.resolution}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <p className="mt-5 text-xs text-[#5b5675]/50">
        Data reflects the last 30 days. Refresh to see the latest figures.
      </p>
    </AdminPageWrapper>
  )
}
