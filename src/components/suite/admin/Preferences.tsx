import { useState } from "react"
import { Save } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { AdminPageWrapper } from "./AdminPageWrapper"
import { cn } from "@/lib/utils"
import { useAuth } from "@/contexts/AuthContext"

export function Preferences() {
  const { user } = useAuth()
  const [theme, setTheme] = useState<"light" | "system">("light")
  const [density, setDensity] = useState<"comfortable" | "compact">("comfortable")
  const [emailDigest, setEmailDigest] = useState(true)
  const [desktopNotif, setDesktopNotif] = useState(false)
  const [timezone, setTimezone] = useState("Asia/Kolkata")
  const [saved, setSaved] = useState(false)

  function handleSave() {
    setSaved(true)
    setTimeout(() => setSaved(false), 2500)
  }

  return (
    <AdminPageWrapper
      title="Preferences"
      description={`Personal preferences for ${user?.name ?? "your account"}.`}
    >
      <div className="max-w-[640px] space-y-4">
        {/* Appearance */}
        <PrefSection title="Appearance">
          <div className="px-5 py-4 space-y-3">
            <p className="text-sm font-medium text-[#36354c]">Theme</p>
            <div className="flex gap-3">
              {(["light", "system"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setTheme(t)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all",
                    theme === t
                      ? "bg-[#efe9fb] border-[#d6c8f8] text-[#7c47e1]"
                      : "bg-[#fafafa] border-[#e7e7f0] text-[#5b5675] hover:border-[#c4b8f5]"
                  )}
                >
                  {t === "light" ? "Light" : "System default"}
                </button>
              ))}
            </div>
          </div>
          <div className="px-5 py-4 border-t border-[#e7e7f0] space-y-3">
            <p className="text-sm font-medium text-[#36354c]">Display density</p>
            <div className="flex gap-3">
              {(["comfortable", "compact"] as const).map((d) => (
                <button
                  key={d}
                  onClick={() => setDensity(d)}
                  className={cn(
                    "flex-1 py-2.5 rounded-xl border text-sm font-medium capitalize transition-all",
                    density === d
                      ? "bg-[#efe9fb] border-[#d6c8f8] text-[#7c47e1]"
                      : "bg-[#fafafa] border-[#e7e7f0] text-[#5b5675] hover:border-[#c4b8f5]"
                  )}
                >
                  {d.charAt(0).toUpperCase() + d.slice(1)}
                </button>
              ))}
            </div>
          </div>
        </PrefSection>

        {/* Notifications */}
        <PrefSection title="Notifications">
          <PrefToggle
            label="Weekly email digest"
            description="Receive a weekly summary of activity across your tools."
            value={emailDigest}
            onChange={setEmailDigest}
          />
          <PrefToggle
            label="Desktop notifications"
            description="Get browser push notifications for mentions and alerts."
            value={desktopNotif}
            onChange={setDesktopNotif}
          />
        </PrefSection>

        {/* Localisation */}
        <PrefSection title="Localisation">
          <div className="flex items-center justify-between gap-6 px-5 py-4">
            <div>
              <p className="text-sm font-medium text-[#36354c]">Timezone</p>
              <p className="text-xs text-[#5b5675] mt-0.5">Used for timestamps in logs and reports.</p>
            </div>
            <select
              value={timezone}
              onChange={(e) => setTimezone(e.target.value)}
              className="h-9 px-3 text-sm border border-[#e7e7f0] rounded-md bg-white text-[#5b5675] focus:outline-none focus:border-[#7c47e1] transition-colors"
            >
              <option value="Asia/Kolkata">Asia/Kolkata (IST +5:30)</option>
              <option value="UTC">UTC</option>
              <option value="America/New_York">America/New_York (ET)</option>
              <option value="Europe/London">Europe/London (GMT)</option>
            </select>
          </div>
        </PrefSection>

        <div className="flex justify-end pt-2">
          <Button
            onClick={handleSave}
            className={cn(
              "h-9 gap-2 text-sm transition-all",
              saved ? "bg-[#10b981] hover:bg-[#10b981] text-white" : "bg-[#7c47e1] hover:bg-[#6a3bc5] text-white"
            )}
          >
            <Save size={14} /> {saved ? "Saved!" : "Save preferences"}
          </Button>
        </div>
      </div>
    </AdminPageWrapper>
  )
}

function PrefSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-white border border-[#e7e7f0] rounded-2xl overflow-hidden">
      <div className="px-5 py-3 bg-[#fafafa] border-b border-[#e7e7f0]">
        <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/60">{title}</p>
      </div>
      <div className="divide-y divide-[#e7e7f0]">{children}</div>
    </div>
  )
}

function PrefToggle({
  label,
  description,
  value,
  onChange,
}: {
  label: string
  description?: string
  value: boolean
  onChange: (v: boolean) => void
}) {
  return (
    <div className="flex items-center justify-between gap-6 px-5 py-4">
      <div>
        <p className="text-sm font-medium text-[#36354c]">{label}</p>
        {description && <p className="text-xs text-[#5b5675] mt-0.5">{description}</p>}
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  )
}
