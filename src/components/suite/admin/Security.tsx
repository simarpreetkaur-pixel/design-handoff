import { useState } from "react"
import { Shield, Lock, AlertTriangle, Save, Plus, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AdminPageWrapper } from "./AdminPageWrapper"
import { cn } from "@/lib/utils"

export function Security() {
  const [allowedDomains, setAllowedDomains] = useState(["acko.tech", "ackoinsurance.com"])
  const [newDomain, setNewDomain] = useState("")
  const [ssoEnabled, setSsoEnabled] = useState(true)
  const [ssoProvider, setSsoProvider] = useState("Google Workspace")
  const [forceLogoutEnabled, setForceLogoutEnabled] = useState(false)
  const [ipWhitelist, setIpWhitelist] = useState(false)
  const [saved, setSaved] = useState(false)

  function addDomain() {
    const d = newDomain.trim().toLowerCase()
    if (d && !allowedDomains.includes(d)) {
      setAllowedDomains((prev) => [...prev, d])
    }
    setNewDomain("")
  }

  function removeDomain(domain: string) {
    setAllowedDomains((prev) => prev.filter((d) => d !== domain))
  }

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AdminPageWrapper
      title="Security & SSO"
      description="Manage authentication, allowed domains, and access control policies for the OMNI Suite."
    >
      <div className="max-w-[680px] space-y-4">
        {/* SSO Config */}
        <SecSection title="Single Sign-On (SSO)" icon={<Shield size={15} />}>
          <ToggleRow
            label="Enable SSO"
            description="Require all users to authenticate via SSO. Disabling falls back to email/password."
            value={ssoEnabled}
            onChange={setSsoEnabled}
          />
          {ssoEnabled && (
            <div className="flex items-center justify-between gap-6 px-5 py-4 border-t border-[#e7e7f0]">
              <div>
                <p className="text-sm font-medium text-[#36354c]">SSO Provider</p>
                <p className="text-xs text-[#5b5675] mt-0.5">Identity provider used for authentication.</p>
              </div>
              <select
                value={ssoProvider}
                onChange={(e) => setSsoProvider(e.target.value)}
                className="h-9 px-3 text-sm border border-[#e7e7f0] rounded-md bg-white text-[#5b5675] focus:outline-none focus:border-[#7c47e1] transition-colors"
              >
                <option>Google Workspace</option>
                <option>Microsoft Azure AD</option>
                <option>Okta</option>
                <option>OneLogin</option>
              </select>
            </div>
          )}
        </SecSection>

        {/* Allowed domains */}
        <SecSection title="Allowed Domains" icon={<Lock size={15} />}>
          <div className="px-5 py-4">
            <p className="text-sm text-[#5b5675] mb-3">
              Only users with email addresses from these domains can sign in. Invite links will be rejected for other domains.
            </p>
            <div className="flex flex-wrap gap-2 mb-3">
              {allowedDomains.map((domain) => (
                <span
                  key={domain}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-[#efe9fb] border border-[#d6c8f8] text-[#7c47e1] rounded-full text-xs font-medium"
                >
                  @{domain}
                  <button onClick={() => removeDomain(domain)} className="hover:text-red-400 transition-colors">
                    <X size={11} />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && addDomain()}
                placeholder="example.com"
                className="flex-1 h-8 text-sm"
              />
              <Button
                onClick={addDomain}
                variant="outline"
                className="h-8 px-3 text-sm gap-1.5 border-[#e7e7f0] text-[#5b5675] hover:border-[#c4b8f5]"
              >
                <Plus size={13} /> Add
              </Button>
            </div>
          </div>
        </SecSection>

        {/* Advanced */}
        <SecSection title="Advanced Policies" icon={<AlertTriangle size={15} />}>
          <ToggleRow
            label="Force logout on role change"
            description="Immediately terminate active sessions when a user's role is modified."
            value={forceLogoutEnabled}
            onChange={setForceLogoutEnabled}
          />
          <ToggleRow
            label="IP allowlist"
            description="Restrict sign-in to specific IP ranges. Configure ranges after enabling."
            value={ipWhitelist}
            onChange={setIpWhitelist}
            divider
          />
          {ipWhitelist && (
            <div className="px-5 py-3 border-t border-[#e7e7f0]">
              <Alert variant="warning">
                <AlertTriangle size={14} />
                <AlertDescription>
                  IP allowlist is enabled. Contact your network administrator to configure allowed IP ranges.
                </AlertDescription>
              </Alert>
            </div>
          )}
        </SecSection>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            className={cn(
              "h-9 gap-2 text-sm transition-all",
              saved ? "bg-[#10b981] hover:bg-[#10b981] text-white" : "bg-[#7c47e1] hover:bg-[#6a3bc5] text-white"
            )}
          >
            <Save size={14} /> {saved ? "Saved!" : "Save security settings"}
          </Button>
        </div>
      </div>
    </AdminPageWrapper>
  )
}

function SecSection({
  title,
  icon,
  children,
}: {
  title: string
  icon?: React.ReactNode
  children: React.ReactNode
}) {
  return (
    <div className="bg-white border border-[#e7e7f0] rounded-2xl overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3 bg-[#fafafa] border-b border-[#e7e7f0]">
        {icon && <span className="text-[#5b5675]/60">{icon}</span>}
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/60">{title}</p>
      </div>
      <div className="divide-y divide-[#e7e7f0]">{children}</div>
    </div>
  )
}

function ToggleRow({
  label,
  description,
  value,
  onChange,
  divider = false,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
  divider?: boolean
}) {
  return (
    <div className={cn("flex items-center justify-between gap-6 px-5 py-4", divider && "border-t border-[#e7e7f0]")}>
      <div>
        <p className="text-sm font-medium text-[#36354c]">{label}</p>
        {description && <p className="text-xs text-[#5b5675] mt-0.5">{description}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}
