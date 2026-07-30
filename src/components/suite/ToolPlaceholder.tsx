import { useNavigate } from "react-router-dom"
import { Briefcase, LineChart, BrainCircuit, ArrowLeft, Plug } from "lucide-react"

type ToolId = "sales" | "insights" | "neo"

interface ToolMeta {
  name: string
  description: string
  icon: React.ReactNode
  color: string
  bgColor: string
  borderColor: string
}

const TOOL_META: Record<ToolId, ToolMeta> = {
  sales: {
    name: "Sales",
    description: "Pre-sales pipeline management, lead tracking & conversion workflows",
    icon: <Briefcase size={36} strokeWidth={1.5} />,
    color: "#0ea5e9",
    bgColor: "#e0f2fe",
    borderColor: "#bae6fd",
  },
  insights: {
    name: "Insights",
    description: "Analytics dashboards, reports & operational intelligence across all tools",
    icon: <LineChart size={36} strokeWidth={1.5} />,
    color: "#10b981",
    bgColor: "#d1fae5",
    borderColor: "#a7f3d0",
  },
  neo: {
    name: "Neo",
    description: "Next-generation AI agent platform for intelligent automation",
    icon: <BrainCircuit size={36} strokeWidth={1.5} />,
    color: "#f59e0b",
    bgColor: "#fef3c7",
    borderColor: "#fde68a",
  },
}

export function ToolPlaceholder({ tool }: { tool: ToolId }) {
  const navigate = useNavigate()
  const meta = TOOL_META[tool]

  return (
    <div className="flex flex-col items-center justify-center h-full min-h-[500px] gap-8 p-8 text-center">
      {/* Tool icon */}
      <div className="relative">
        <div
          className="size-24 rounded-2xl flex items-center justify-center"
          style={{
            backgroundColor: meta.bgColor,
            color: meta.color,
            border: `1px solid ${meta.borderColor}`,
          }}
        >
          {meta.icon}
        </div>

        {/* Animated connection indicator */}
        <div className="absolute -bottom-2 -right-2 size-8 rounded-full bg-white border border-[#e7e7f0] shadow-sm flex items-center justify-center">
          <Plug size={14} className="text-[#5b5675] animate-pulse" />
        </div>
      </div>

      {/* Text */}
      <div className="flex flex-col items-center gap-3 max-w-sm">
        <h1 className="text-[#36354c] text-2xl font-semibold">{meta.name}</h1>
        <p className="text-[#5b5675] text-sm leading-relaxed">{meta.description}</p>
      </div>

      {/* Status banner */}
      <div className="flex flex-col items-center gap-2">
        <div className="flex items-center gap-2.5 bg-[#fef3c7] border border-[#fde68a] text-[#92400e] text-sm font-medium px-5 py-3 rounded-xl">
          <span className="relative flex size-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#f59e0b] opacity-75" />
            <span className="relative inline-flex rounded-full size-2 bg-[#f59e0b]" />
          </span>
          Waiting to connect the flows
        </div>
        <p className="text-xs text-[#5b5675]/60">
          This tool is being integrated. It will be live soon.
        </p>
      </div>

      {/* Back link */}
      <button
        onClick={() => navigate("/suite")}
        className="flex items-center gap-1.5 text-sm text-[#7c47e1] hover:text-[#6a3bc5] font-medium transition-colors mt-2"
      >
        <ArrowLeft size={14} /> Back to all tools
      </button>
    </div>
  )
}
