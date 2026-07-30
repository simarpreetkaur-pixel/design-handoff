import { useState } from "react"
import { Users, Plus, MoreHorizontal, MessageCircle, Briefcase, LineChart, BrainCircuit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { AdminPageWrapper } from "./AdminPageWrapper"

interface Team {
  id: string
  name: string
  description: string
  memberCount: number
  tools: string[]
  lead: string
  color: string
}

const TOOL_ICONS: Record<string, React.ReactNode> = {
  Support: <MessageCircle size={12} />,
  Sales: <Briefcase size={12} />,
  Insights: <LineChart size={12} />,
  Neo: <BrainCircuit size={12} />,
}

const MOCK_TEAMS: Team[] = [
  { id: "t1", name: "Support Team", description: "Handles post-sales customer support, claim escalations, and policy queries.", memberCount: 12, tools: ["Support", "Insights"], lead: "Priya Sharma", color: "#7c47e1" },
  { id: "t2", name: "Sales Team", description: "Pre-sales pipeline, lead nurturing, and conversion tracking.", memberCount: 8, tools: ["Sales", "Insights"], lead: "Vikram Singh", color: "#0ea5e9" },
  { id: "t3", name: "Insights & Analytics", description: "Cross-functional data analysis, reporting, and operational intelligence.", memberCount: 4, tools: ["Insights"], lead: "Karan Patel", color: "#10b981" },
  { id: "t4", name: "Platform & Neo", description: "AI automation workflows and next-gen agent platform maintenance.", memberCount: 3, tools: ["Neo", "Support"], lead: "Arun Verma", color: "#f59e0b" },
]

export function TeamManagement() {
  const [teams, setTeams] = useState<Team[]>(MOCK_TEAMS)
  const [showNew, setShowNew] = useState(false)
  const [newName, setNewName] = useState("")
  const [newDesc, setNewDesc] = useState("")

  function handleAddTeam() {
    if (!newName.trim()) return
    const t: Team = {
      id: `t${Date.now()}`,
      name: newName.trim(),
      description: newDesc.trim(),
      memberCount: 0,
      tools: [],
      lead: "—",
      color: "#5b5675",
    }
    setTeams((prev) => [...prev, t])
    setNewName("")
    setNewDesc("")
    setShowNew(false)
  }

  function handleDeleteTeam(id: string) {
    setTeams((prev) => prev.filter((t) => t.id !== id))
  }

  return (
    <AdminPageWrapper
      title="Teams"
      description="Organise users into teams and control which tools each team has access to."
      action={
        <Button
          onClick={() => setShowNew(true)}
          className="bg-[#7c47e1] hover:bg-[#6a3bc5] text-white h-9 gap-2 text-sm"
        >
          <Plus size={15} /> New team
        </Button>
      }
    >
      {/* New team inline form */}
      {showNew && (
        <div className="mb-5 bg-white border border-[#7c47e1]/40 rounded-xl p-5 shadow-sm">
          <p className="text-sm font-semibold text-[#36354c] mb-3">Create new team</p>
          <div className="flex flex-col gap-3">
            <Input
              autoFocus
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="Team name"
            />
            <Input
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="Description (optional)"
            />
            <div className="flex gap-2">
              <Button onClick={handleAddTeam} className="bg-[#7c47e1] hover:bg-[#6a3bc5] text-white h-8 text-sm px-4">
                Create
              </Button>
              <Button variant="outline" onClick={() => setShowNew(false)} className="h-8 text-sm px-4 border-[#e7e7f0] text-[#5b5675]">
                Cancel
              </Button>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {teams.map((team) => (
          <div key={team.id} className="bg-white border border-[#e7e7f0] rounded-2xl p-5 flex flex-col gap-4 hover:border-[#c4b8f5] transition-colors">
            <div className="flex items-start justify-between gap-2">
              <div className="flex items-center gap-3">
                <div
                  className="size-10 rounded-xl flex items-center justify-center shrink-0"
                  style={{ backgroundColor: `${team.color}18`, color: team.color }}
                >
                  <Users size={20} />
                </div>
                <div>
                  <p className="text-[#36354c] font-semibold leading-snug">{team.name}</p>
                  <p className="text-[#5b5675] text-xs mt-0.5">{team.memberCount} members · Lead: {team.lead}</p>
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="size-7 flex items-center justify-center rounded-md hover:bg-[#f5f5f9] text-[#5b5675] shrink-0">
                    <MoreHorizontal size={15} />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-40">
                  <DropdownMenuItem>Edit team</DropdownMenuItem>
                  <DropdownMenuItem
                    onSelect={() => handleDeleteTeam(team.id)}
                    className="text-red-500 focus:text-red-500"
                  >
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {team.description && (
              <p className="text-[#5b5675] text-sm leading-relaxed">{team.description}</p>
            )}

            <div className="flex flex-wrap gap-2">
              {team.tools.length === 0 ? (
                <span className="text-xs text-[#5b5675]/50 italic">No tools assigned</span>
              ) : (
                team.tools.map((tool) => (
                  <span
                    key={tool}
                    className="flex items-center gap-1 px-2.5 py-1 bg-[#f5f5f9] border border-[#e7e7f0] text-[#5b5675] rounded-full text-xs font-medium"
                  >
                    {TOOL_ICONS[tool]} {tool}
                  </span>
                ))
              )}
            </div>
          </div>
        ))}
      </div>
    </AdminPageWrapper>
  )
}
