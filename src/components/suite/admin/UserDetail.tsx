import { useParams, useNavigate } from "react-router-dom"
import { ArrowLeft, Mail, Shield, Users } from "lucide-react"
import { Button } from "@/components/ui/button"

const MOCK_USERS_MAP: Record<string, { name: string; email: string; role: string; team: string; status: string; tools: string[]; lastActive: string; joinedOn: string }> = {
  "u1": { name: "Arun Verma", email: "arun.verma@acko.tech", role: "Super Admin", team: "Platform", status: "Active", tools: ["Support", "Sales", "Insights", "Neo"], lastActive: "Today", joinedOn: "Jan 12, 2024" },
  "u2": { name: "Priya Sharma", email: "priya.sharma@acko.tech", role: "Admin", team: "Support", status: "Active", tools: ["Support", "Insights"], lastActive: "Today", joinedOn: "Mar 4, 2024" },
  "u3": { name: "Rohan Mehta", email: "rohan.mehta@acko.tech", role: "Manager", team: "Support", status: "Active", tools: ["Support"], lastActive: "Yesterday", joinedOn: "Jun 10, 2024" },
  "u4": { name: "Neha Joshi", email: "neha.joshi@acko.tech", role: "Agent", team: "Support", status: "Active", tools: ["Support"], lastActive: "2 days ago", joinedOn: "Aug 1, 2024" },
  "u5": { name: "Vikram Singh", email: "vikram.singh@acko.tech", role: "Agent", team: "Sales", status: "Active", tools: ["Sales"], lastActive: "Today", joinedOn: "Sep 5, 2024" },
  "u6": { name: "Anjali Rao", email: "anjali.rao@acko.tech", role: "Agent", team: "Support", status: "Inactive", tools: ["Support"], lastActive: "3 weeks ago", joinedOn: "Nov 20, 2023" },
  "u7": { name: "Karan Patel", email: "karan.patel@acko.tech", role: "Viewer", team: "Insights", status: "Pending", tools: ["Insights"], lastActive: "Never", joinedOn: "Jun 28, 2025" },
  "u8": { name: "Shreya Das", email: "shreya.das@acko.tech", role: "Agent", team: "Support", status: "Active", tools: ["Support"], lastActive: "Today", joinedOn: "Feb 14, 2025" },
}

export function UserDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const user = id ? MOCK_USERS_MAP[id] : null

  if (!user) {
    return (
      <div className="p-8">
        <p className="text-[#5b5675]">User not found.</p>
        <Button variant="ghost" onClick={() => navigate("/suite/users")} className="mt-4 gap-2 text-[#5b5675]">
          <ArrowLeft size={15} /> Back to users
        </Button>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-[800px]">
      <button
        onClick={() => navigate("/suite/users")}
        className="flex items-center gap-1.5 text-sm text-[#5b5675] hover:text-[#36354c] mb-6 transition-colors"
      >
        <ArrowLeft size={15} /> Back to User Management
      </button>

      <div className="bg-white border border-[#e7e7f0] rounded-2xl p-6 flex items-start gap-5 mb-5">
        <div className="size-14 rounded-xl bg-[#efe9fb] text-[#7c47e1] flex items-center justify-center text-xl font-semibold shrink-0">
          {user.name.split(" ").slice(0, 2).map((n: string) => n[0]).join("")}
        </div>
        <div className="flex-1">
          <h1 className="text-[#36354c] text-xl font-semibold">{user.name}</h1>
          <div className="flex flex-wrap items-center gap-3 mt-1">
            <span className="flex items-center gap-1 text-sm text-[#5b5675]">
              <Mail size={13} /> {user.email}
            </span>
            <span className="flex items-center gap-1 text-sm text-[#5b5675]">
              <Shield size={13} /> {user.role}
            </span>
            <span className="flex items-center gap-1 text-sm text-[#5b5675]">
              <Users size={13} /> {user.team}
            </span>
          </div>
        </div>
        <span className={`px-2.5 py-1 rounded-full text-xs font-medium border ${user.status === "Active" ? "bg-[#d1fae5] text-[#065f46] border-[#a7f3d0]" : user.status === "Pending" ? "bg-[#fef3c7] text-[#92400e] border-[#fde68a]" : "bg-[#f5f5f9] text-[#5b5675] border-[#e7e7f0]"}`}>
          {user.status}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <InfoCard label="Last active" value={user.lastActive} />
        <InfoCard label="Joined on" value={user.joinedOn} />
        <div className="bg-white border border-[#e7e7f0] rounded-xl p-4 col-span-2">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/50 mb-2">Tool access</p>
          <div className="flex flex-wrap gap-2">
            {user.tools.map((t: string) => (
              <span key={t} className="px-3 py-1 bg-[#efe9fb] text-[#7c47e1] border border-[#d6c8f8] rounded-full text-xs font-medium">
                {t}
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="bg-white border border-[#e7e7f0] rounded-xl p-4">
      <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/50 mb-1">{label}</p>
      <p className="text-[#36354c] text-sm font-medium">{value}</p>
    </div>
  )
}
