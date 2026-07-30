import { useState } from "react"
import { ChevronDown, MessageCircle, Briefcase, LineChart, BrainCircuit, Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { AdminPageWrapper } from "./AdminPageWrapper"
import { cn } from "@/lib/utils"

interface ConfigField {
  key: string
  label: string
  description?: string
  type: "text" | "number" | "toggle" | "select"
  value: string | boolean | number
  options?: string[]
}

interface ToolConfig {
  id: string
  name: string
  icon: React.ReactNode
  color: string
  bgColor: string
  fields: ConfigField[]
}

const TOOL_CONFIGS: ToolConfig[] = [
  {
    id: "support",
    name: "Support",
    icon: <MessageCircle size={20} strokeWidth={1.5} />,
    color: "#7c47e1",
    bgColor: "#efe9fb",
    fields: [
      { key: "default_sla", label: "Default SLA (hours)", description: "Maximum response time for standard tickets.", type: "number", value: 4 },
      { key: "priority_sla", label: "Priority SLA (hours)", description: "Maximum response time for P1/P2 tickets.", type: "number", value: 1 },
      { key: "auto_assign", label: "Auto-assign tickets", description: "Automatically assign incoming tickets to available agents.", type: "toggle", value: true },
      { key: "routing_strategy", label: "Routing strategy", type: "select", value: "Round robin", options: ["Round robin", "Least loaded", "Skills-based", "Manual"] },
      { key: "tts_enabled", label: "Live listening (TTS)", description: "Enable real-time speech synthesis for agents.", type: "toggle", value: true },
      { key: "escalation_threshold", label: "Escalation threshold (mins)", description: "Trigger escalation after ticket is unresolved for this duration.", type: "number", value: 60 },
    ],
  },
  {
    id: "sales",
    name: "Sales",
    icon: <Briefcase size={20} strokeWidth={1.5} />,
    color: "#0ea5e9",
    bgColor: "#e0f2fe",
    fields: [
      { key: "pipeline_stages", label: "Default pipeline stages", type: "text", value: "Lead, Qualified, Proposal, Negotiation, Won" },
      { key: "lead_timeout", label: "Lead timeout (days)", description: "Auto-archive leads with no activity after this period.", type: "number", value: 30 },
      { key: "auto_follow_up", label: "Auto follow-up reminders", type: "toggle", value: true },
      { key: "conversion_goal", label: "Monthly conversion goal (%)", type: "number", value: 15 },
    ],
  },
  {
    id: "insights",
    name: "Insights",
    icon: <LineChart size={20} strokeWidth={1.5} />,
    color: "#10b981",
    bgColor: "#d1fae5",
    fields: [
      { key: "report_frequency", label: "Automated report frequency", type: "select", value: "Weekly", options: ["Daily", "Weekly", "Monthly"] },
      { key: "data_retention", label: "Data retention (months)", type: "number", value: 12 },
      { key: "public_dashboards", label: "Allow public dashboard links", type: "toggle", value: false },
    ],
  },
  {
    id: "neo",
    name: "Neo",
    icon: <BrainCircuit size={20} strokeWidth={1.5} />,
    color: "#f59e0b",
    bgColor: "#fef3c7",
    fields: [
      { key: "ai_model", label: "Default AI model", type: "select", value: "GPT-4o", options: ["GPT-4o", "Claude 3.5 Sonnet", "Gemini 2.0 Flash"] },
      { key: "max_tokens", label: "Max tokens per response", type: "number", value: 2048 },
      { key: "debug_mode", label: "Enable debug mode", description: "Show reasoning traces in agent responses.", type: "toggle", value: false },
    ],
  },
]

export function ToolConfigurations() {
  const [configs, setConfigs] = useState<ToolConfig[]>(TOOL_CONFIGS)
  const [openTool, setOpenTool] = useState<string>("support")
  const [saved, setSaved] = useState<Record<string, boolean>>({})

  function updateField(toolId: string, key: string, value: string | boolean | number) {
    setConfigs((prev) =>
      prev.map((t) =>
        t.id === toolId
          ? { ...t, fields: t.fields.map((f) => (f.key === key ? { ...f, value } : f)) }
          : t
      )
    )
  }

  function handleSave(toolId: string) {
    setSaved((prev) => ({ ...prev, [toolId]: true }))
    setTimeout(() => setSaved((prev) => ({ ...prev, [toolId]: false })), 2500)
  }

  return (
    <AdminPageWrapper
      title="Tool Configurations"
      description="Adjust per-tool settings, SLAs, routing strategies, and AI parameters."
    >
      <div className="space-y-3 max-w-[780px]">
        {configs.map((tool) => {
          const isOpen = openTool === tool.id
          return (
            <div key={tool.id} className="bg-white border border-[#e7e7f0] rounded-2xl overflow-hidden">
              {/* Header */}
              <button
                onClick={() => setOpenTool(isOpen ? "" : tool.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-[#fafafa] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div
                    className="size-9 rounded-xl flex items-center justify-center"
                    style={{ backgroundColor: tool.bgColor, color: tool.color }}
                  >
                    {tool.icon}
                  </div>
                  <span className="text-[#36354c] font-semibold">{tool.name}</span>
                  <span className="text-xs text-[#5b5675]/50">{tool.fields.length} settings</span>
                </div>
                <ChevronDown
                  size={16}
                  className={cn("text-[#5b5675] transition-transform", isOpen && "rotate-180")}
                />
              </button>

              {/* Fields */}
              {isOpen && (
                <div className="border-t border-[#e7e7f0] px-5 py-4 space-y-4">
                  {tool.fields.map((field) => (
                    <div key={field.key} className="flex items-center justify-between gap-6">
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#36354c]">{field.label}</p>
                        {field.description && (
                          <p className="text-xs text-[#5b5675] mt-0.5">{field.description}</p>
                        )}
                      </div>

                      {field.type === "toggle" && (
                        <Switch
                          checked={field.value as boolean}
                          onCheckedChange={(v) => updateField(tool.id, field.key, v)}
                        />
                      )}

                      {field.type === "number" && (
                        <Input
                          type="number"
                          value={field.value as number}
                          onChange={(e) => updateField(tool.id, field.key, Number(e.target.value))}
                          className="w-24 h-8 text-sm text-right"
                        />
                      )}

                      {field.type === "text" && (
                        <Input
                          type="text"
                          value={field.value as string}
                          onChange={(e) => updateField(tool.id, field.key, e.target.value)}
                          className="w-60 h-8 text-sm"
                        />
                      )}

                      {field.type === "select" && (
                        <select
                          value={field.value as string}
                          onChange={(e) => updateField(tool.id, field.key, e.target.value)}
                          className="h-8 px-2 text-sm border border-[#e7e7f0] rounded-md bg-white text-[#5b5675] focus:outline-none focus:border-[#7c47e1] transition-colors"
                        >
                          {field.options?.map((o) => <option key={o}>{o}</option>)}
                        </select>
                      )}
                    </div>
                  ))}

                  <div className="flex justify-end pt-2 border-t border-[#e7e7f0]">
                    <Button
                      onClick={() => handleSave(tool.id)}
                      className={cn(
                        "h-8 text-sm gap-2 transition-all",
                        saved[tool.id]
                          ? "bg-[#10b981] hover:bg-[#10b981] text-white"
                          : "bg-[#7c47e1] hover:bg-[#6a3bc5] text-white"
                      )}
                    >
                      <Save size={13} />
                      {saved[tool.id] ? "Saved!" : "Save changes"}
                    </Button>
                  </div>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </AdminPageWrapper>
  )
}
