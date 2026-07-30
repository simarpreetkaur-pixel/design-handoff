import { useNavigate } from "react-router-dom"
import { MessageCircle, Briefcase, LineChart, BrainCircuit, ArrowRight } from "lucide-react"
import { useAuth } from "@/contexts/AuthContext"

interface BaseTool {
  id: string
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
  /** Route for super_admin or always-available tools */
  route: string
  /** Tools that every role can access (not just super_admin) */
  alwaysAvailable: boolean
}

const BASE_TOOLS: BaseTool[] = [
  {
    id: "support",
    name: "Support",
    description: "Post-sales CRM for support agents — customer search, policy actions & call flows",
    icon: <MessageCircle size={32} strokeWidth={1.5} />,
    color: "#7c47e1",
    bgColor: "#efe9fb",
    borderColor: "#d6c8f8",
    route: "/",
    alwaysAvailable: true,
  },
  {
    id: "sales",
    name: "Sales",
    description: "Pre-sales pipeline management, lead tracking & conversion workflows",
    icon: <Briefcase size={32} strokeWidth={1.5} />,
    color: "#0ea5e9",
    bgColor: "#e0f2fe",
    borderColor: "#bae6fd",
    route: "/suite/sales",
    alwaysAvailable: false,
  },
  {
    id: "insights",
    name: "Insights",
    description: "Analytics dashboards, reports & operational intelligence across all tools",
    icon: <LineChart size={32} strokeWidth={1.5} />,
    color: "#10b981",
    bgColor: "#d1fae5",
    borderColor: "#a7f3d0",
    route: "/suite/insights",
    alwaysAvailable: false,
  },
  {
    id: "neo",
    name: "Neo",
    description: "Next-generation AI agent platform for intelligent automation",
    icon: <BrainCircuit size={32} strokeWidth={1.5} />,
    color: "#f59e0b",
    bgColor: "#fef3c7",
    borderColor: "#fde68a",
    route: "/suite/neo",
    alwaysAvailable: false,
  },
]

export function SuiteDashboard() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const isSuperAdmin = user?.role === "super_admin"

  function handleToolClick(tool: BaseTool) {
    const available = tool.alwaysAvailable || isSuperAdmin
    if (!available) return
    navigate(tool.route)
  }

  return (
    <div className="p-8 max-w-[1100px]">
      {/* Page header */}
      <div className="mb-8">
        <h1 className="text-[#36354c] text-2xl font-semibold leading-tight">
          Welcome back, {user?.name?.split(" ")[0]}
        </h1>
        <p className="text-[#5b5675] text-sm mt-1">
          Choose a tool to get started, or manage your workspace from the left panel.
        </p>
      </div>

      {/* Tool grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {BASE_TOOLS.map((tool) => {
          const available = tool.alwaysAvailable || isSuperAdmin
          return (
            <ToolCard
              key={tool.id}
              tool={tool}
              available={available}
              onClick={() => handleToolClick(tool)}
            />
          )
        })}
      </div>
    </div>
  )
}

interface ToolCardProps {
  tool: BaseTool
  available: boolean
  onClick: () => void
}

function ToolCard({ tool, available, onClick }: ToolCardProps) {
  return (
    <button
      onClick={onClick}
      disabled={!available}
      className={cn(
        "group relative text-left bg-white border border-[#e7e7f0] rounded-2xl p-6 flex flex-col gap-4 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1] focus-visible:ring-offset-2",
        available
          ? "hover:border-[#c4b8f5] hover:shadow-[0_4px_20px_rgba(124,71,225,0.10)] cursor-pointer"
          : "opacity-50 cursor-not-allowed"
      )}
    >
      {/* Icon */}
      <div
        className="size-14 rounded-xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-105"
        style={{
          backgroundColor: tool.bgColor,
          color: tool.color,
          border: `1px solid ${tool.borderColor}`,
        }}
      >
        {tool.icon}
      </div>

      {/* Text */}
      <div className="flex-1">
        <div className="flex items-center justify-between gap-2">
          <span className="text-[#36354c] text-lg font-semibold leading-snug">{tool.name}</span>
          {!available && (
            <span className="shrink-0 text-[10px] font-semibold uppercase tracking-wider text-[#5b5675]/50 bg-[#f5f5f9] border border-[#e7e7f0] px-2 py-0.5 rounded-full">
              Soon
            </span>
          )}
        </div>
        <p className="mt-1 text-[#5b5675] text-sm leading-relaxed">{tool.description}</p>
      </div>

      {/* Open arrow — visible on hover for available tools */}
      {available && (
        <div className="flex items-center gap-1 text-[#7c47e1] text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
          Open tool <ArrowRight size={13} />
        </div>
      )}
    </button>
  )
}

function cn(...classes: (string | boolean | undefined)[]) {
  return classes.filter(Boolean).join(" ")
}
