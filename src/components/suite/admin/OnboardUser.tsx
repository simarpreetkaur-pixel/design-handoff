import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Send, Plus, X, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { AdminPageWrapper } from "./AdminPageWrapper"

type Role = "admin" | "manager" | "agent" | "viewer"
type Tool = "Support" | "Sales" | "Insights" | "Neo"

const ROLE_OPTIONS: { value: Role; label: string; description: string }[] = [
  { value: "admin", label: "Admin", description: "Manage users, teams and configurations" },
  { value: "manager", label: "Manager", description: "View users and access assigned tools" },
  { value: "agent", label: "Agent", description: "Access assigned tools only" },
  { value: "viewer", label: "Viewer", description: "Read-only access to Insights" },
]

const TOOL_OPTIONS: Tool[] = ["Support", "Sales", "Insights", "Neo"]

interface InviteRow {
  id: string
  email: string
  role: Role
  tools: Tool[]
}

export function OnboardUser() {
  const navigate = useNavigate()
  const [invites, setInvites] = useState<InviteRow[]>([{ id: "1", email: "", role: "agent", tools: ["Support"] }])
  const [sent, setSent] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  function addRow() {
    setInvites((prev) => [
      ...prev,
      { id: String(Date.now()), email: "", role: "agent", tools: ["Support"] },
    ])
  }

  function removeRow(id: string) {
    setInvites((prev) => prev.filter((r) => r.id !== id))
  }

  function updateEmail(id: string, email: string) {
    setInvites((prev) => prev.map((r) => (r.id === id ? { ...r, email } : r)))
    setErrors((e) => { const copy = { ...e }; delete copy[id]; return copy })
  }

  function updateRole(id: string, role: Role) {
    setInvites((prev) => prev.map((r) => (r.id === id ? { ...r, role } : r)))
  }

  function toggleTool(id: string, tool: Tool) {
    setInvites((prev) =>
      prev.map((r) => {
        if (r.id !== id) return r
        const has = r.tools.includes(tool)
        return { ...r, tools: has ? r.tools.filter((t) => t !== tool) : [...r.tools, tool] }
      })
    )
  }

  function validate() {
    const newErrors: Record<string, string> = {}
    invites.forEach((r) => {
      if (!r.email.trim()) {
        newErrors[r.id] = "Email is required"
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(r.email)) {
        newErrors[r.id] = "Enter a valid email address"
      }
    })
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  function handleSend() {
    if (!validate()) return
    setSent(true)
  }

  if (sent) {
    return (
      <div className="p-8 max-w-[600px] flex flex-col items-center text-center gap-5 pt-20">
        <div className="size-16 rounded-full bg-[#d1fae5] flex items-center justify-center">
          <CheckCircle2 size={32} className="text-[#10b981]" />
        </div>
        <div>
          <h2 className="text-[#36354c] text-xl font-semibold">Invites sent!</h2>
          <p className="text-[#5b5675] text-sm mt-1">
            {invites.length} invitation{invites.length !== 1 ? "s" : ""} sent. Users will receive an email to join OMNI Suite.
          </p>
        </div>
        <div className="flex gap-3">
          <Button
            onClick={() => { setSent(false); setInvites([{ id: "1", email: "", role: "agent", tools: ["Support"] }]) }}
            variant="outline"
            className="border-[#e7e7f0] text-[#5b5675] h-9"
          >
            Send more invites
          </Button>
          <Button
            onClick={() => navigate("/suite/users")}
            className="bg-[#7c47e1] hover:bg-[#6a3bc5] text-white h-9"
          >
            Go to User Management
          </Button>
        </div>
      </div>
    )
  }

  return (
    <AdminPageWrapper
      title="Onboard User"
      description="Invite new members to OMNI Suite. They'll receive an email with setup instructions."
    >
      <div className="max-w-[780px] space-y-3">
        {invites.map((row, idx) => (
          <div
            key={row.id}
            className="bg-white border border-[#e7e7f0] rounded-2xl p-5 flex flex-col gap-4"
          >
            <div className="flex items-center justify-between">
              <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/50">
                Invite #{idx + 1}
              </p>
              {invites.length > 1 && (
                <button
                  onClick={() => removeRow(row.id)}
                  className="text-[#5b5675]/50 hover:text-red-400 transition-colors"
                >
                  <X size={15} />
                </button>
              )}
            </div>

            {/* Email */}
            <div className="flex flex-col gap-1.5">
              <Label htmlFor={`email-${row.id}`} className="text-xs text-[#5b5675]">
                Email address
              </Label>
              <Input
                id={`email-${row.id}`}
                type="email"
                value={row.email}
                onChange={(e) => updateEmail(row.id, e.target.value)}
                placeholder="name@acko.tech"
                className={errors[row.id] ? "border-red-400 focus:border-red-400" : ""}
              />
              {errors[row.id] && <p className="text-red-400 text-xs">{errors[row.id]}</p>}
            </div>

            {/* Role */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-[#5b5675]">Role</Label>
              <div className="grid grid-cols-2 gap-2">
                {ROLE_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => updateRole(row.id, opt.value)}
                    className={`text-left p-3 rounded-xl border text-sm transition-all ${
                      row.role === opt.value
                        ? "bg-[#efe9fb] border-[#d6c8f8] text-[#7c47e1]"
                        : "bg-[#fafafa] border-[#e7e7f0] text-[#5b5675] hover:border-[#c4b8f5]"
                    }`}
                  >
                    <p className="font-medium leading-none">{opt.label}</p>
                    <p className="text-xs mt-0.5 opacity-70">{opt.description}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Tool access */}
            <div className="flex flex-col gap-2">
              <Label className="text-xs text-[#5b5675]">Tool access</Label>
              <div className="flex flex-wrap gap-2">
                {TOOL_OPTIONS.map((tool) => (
                  <button
                    key={tool}
                    onClick={() => toggleTool(row.id, tool)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                      row.tools.includes(tool)
                        ? "bg-[#efe9fb] border-[#d6c8f8] text-[#7c47e1]"
                        : "bg-[#fafafa] border-[#e7e7f0] text-[#5b5675] hover:border-[#c4b8f5]"
                    }`}
                  >
                    {tool}
                  </button>
                ))}
              </div>
            </div>
          </div>
        ))}

        <button
          onClick={addRow}
          className="flex items-center gap-2 text-sm text-[#7c47e1] hover:text-[#6a3bc5] font-medium transition-colors py-1"
        >
          <Plus size={15} /> Add another invite
        </button>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSend}
            className="bg-[#7c47e1] hover:bg-[#6a3bc5] text-white h-10 gap-2 px-6"
          >
            <Send size={15} />
            Send invite{invites.length > 1 ? "s" : ""}
          </Button>
        </div>
      </div>
    </AdminPageWrapper>
  )
}
