import { useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { AdminPageWrapper } from "./AdminPageWrapper"
import { cn } from "@/lib/utils"

export function Settings() {
  const [suiteName, setSuiteName] = useState("OMNI Suite")
  const [supportEmail, setSupportEmail] = useState("omni-support@acko.tech")
  const [sessionTimeout, setSessionTimeout] = useState(60)
  const [mfaRequired, setMfaRequired] = useState(false)
  const [maintenanceMode, setMaintenanceMode] = useState(false)
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AdminPageWrapper
      title="Settings"
      description="Global configuration for the OMNI Suite workspace."
    >
      <div className="max-w-[680px] space-y-4">
        <Section title="Workspace">
          <Field label="Suite name" description="Displayed in the top nav and emails.">
            <Input
              value={suiteName}
              onChange={(e) => setSuiteName(e.target.value)}
              className="w-48 h-8 text-sm"
            />
          </Field>
          <Field label="Support email" description="Contact email shown to users in system notifications.">
            <Input
              type="email"
              value={supportEmail}
              onChange={(e) => setSupportEmail(e.target.value)}
              className="w-56 h-8 text-sm"
            />
          </Field>
        </Section>

        <Section title="Session & Security">
          <Field label="Session timeout (minutes)" description="Auto-logout idle sessions after this duration.">
            <Input
              type="number"
              value={sessionTimeout}
              onChange={(e) => setSessionTimeout(Number(e.target.value))}
              className="w-24 h-8 text-sm text-right"
            />
          </Field>
          <ToggleField
            label="Require MFA"
            description="Enforce multi-factor authentication for all users."
            value={mfaRequired}
            onChange={setMfaRequired}
          />
        </Section>

        <Section title="Operations">
          <ToggleField
            label="Maintenance mode"
            description="Temporarily show a maintenance banner to all non-admin users."
            value={maintenanceMode}
            onChange={setMaintenanceMode}
            danger={maintenanceMode}
          />
        </Section>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            className={cn(
              "h-9 gap-2 text-sm transition-all",
              saved ? "bg-[#10b981] hover:bg-[#10b981] text-white" : "bg-[#7c47e1] hover:bg-[#6a3bc5] text-white"
            )}
          >
            <Save size={14} />
            {saved ? "Saved!" : "Save settings"}
          </Button>
        </div>
      </div>
    </AdminPageWrapper>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e7e7f0] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 bg-[#fafafa] border-b border-[#e7e7f0]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/60">{title}</p>
      </div>
      <div className="divide-y divide-[#e7e7f0]">{children}</div>
    </div>
  )
}

function Field({ label, description, children }: { label: string; description?: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-[#36354c]">{label}</p>
        {description && <p className="text-xs text-[#5b5675] mt-0.5">{description}</p>}
      </div>
      <div className="shrink-0">{children}</div>
    </div>
  )
}

function ToggleField({
  label,
  description,
  value,
  onChange,
  danger,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
  danger?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between gap-6 px-5 py-4", danger && "bg-red-50/40")}>
      <div>
        <p className={cn("text-sm font-medium", danger ? "text-red-600" : "text-[#36354c]")}>{label}</p>
        {description && <p className="text-xs text-[#5b5675] mt-0.5">{description}</p>}
      </div>
      <Switch
        checked={value}
        onCheckedChange={onChange}
        className={danger && value ? "data-[state=checked]:bg-red-500" : undefined}
      />
    </div>
  )
}
