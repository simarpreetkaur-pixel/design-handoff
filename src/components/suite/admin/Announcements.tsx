import { useState } from "react"
import { Megaphone, Plus, Send, X, CheckCircle2, Users, Globe } from "lucide-react"
import { Button } from "@/components/ui/button"
import { AdminPageWrapper } from "./AdminPageWrapper"
import { cn } from "@/lib/utils"

interface AnnouncementEntry {
  id: string
  title: string
  message: string
  audience: string
  sentAt: string
  sentBy: string
}

const PAST_ANNOUNCEMENTS: AnnouncementEntry[] = [
  { id: "ann1", title: "New Support routing rules live", message: "We've updated the ticket routing strategy to 'Skills-based'. Agents will now only receive tickets matching their expertise.", audience: "Support Team", sentAt: "Jul 2, 2026 · 10:00 AM", sentBy: "Priya Sharma" },
  { id: "ann2", title: "Scheduled maintenance on Jul 5", message: "OMNI Suite will undergo scheduled maintenance on July 5th from 2–4 AM IST. Please plan your work accordingly.", audience: "All users", sentAt: "Jul 1, 2026 · 4:30 PM", sentBy: "Arun Verma" },
  { id: "ann3", title: "Neo AI model upgraded to GPT-4o", message: "The Neo platform now uses GPT-4o as its default model. Expect faster and more accurate automation workflows.", audience: "Platform & Neo", sentAt: "Jun 28, 2026 · 9:15 AM", sentBy: "Arun Verma" },
]

export function Announcements() {
  const [composing, setComposing] = useState(false)
  const [title, setTitle] = useState("")
  const [message, setMessage] = useState("")
  const [audience, setAudience] = useState("All users")
  const [sent, setSent] = useState(false)
  const [past, setPast] = useState<AnnouncementEntry[]>(PAST_ANNOUNCEMENTS)

  function handleSend() {
    if (!title.trim() || !message.trim()) return
    const entry: AnnouncementEntry = {
      id: `ann${Date.now()}`,
      title: title.trim(),
      message: message.trim(),
      audience,
      sentAt: new Date().toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }),
      sentBy: "Arun Verma",
    }
    setPast((prev) => [entry, ...prev])
    setSent(true)
    setTimeout(() => {
      setSent(false)
      setComposing(false)
      setTitle("")
      setMessage("")
      setAudience("All users")
    }, 2000)
  }

  return (
    <AdminPageWrapper
      title="Announcements"
      description="Broadcast messages to specific teams or all users across OMNI Suite."
      action={
        !composing && (
          <Button
            onClick={() => setComposing(true)}
            className="bg-[#7c47e1] hover:bg-[#6a3bc5] text-white h-9 gap-2 text-sm"
          >
            <Plus size={15} /> New announcement
          </Button>
        )
      }
    >
      <div className="max-w-[720px] space-y-4">
        {/* Compose panel */}
        {composing && (
          <div className="bg-white border border-[#7c47e1]/30 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[#7c47e1]">
                <Megaphone size={16} />
                <span className="text-sm font-semibold">New announcement</span>
              </div>
              {!sent && (
                <button onClick={() => setComposing(false)} className="text-[#5b5675]/50 hover:text-[#5b5675]">
                  <X size={15} />
                </button>
              )}
            </div>

            {sent ? (
              <div className="flex flex-col items-center gap-2 py-4">
                <CheckCircle2 size={28} className="text-[#10b981]" />
                <p className="text-sm font-medium text-[#36354c]">Announcement sent!</p>
              </div>
            ) : (
              <>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Announcement title"
                  className="w-full h-9 px-3 text-sm border border-[#e7e7f0] rounded-lg bg-white text-[#36354c] placeholder:text-[#5b5675]/50 focus:outline-none focus:border-[#7c47e1] font-medium"
                />
                <textarea
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  placeholder="Write your message…"
                  rows={4}
                  className="w-full px-3 py-2.5 text-sm border border-[#e7e7f0] rounded-lg bg-white text-[#36354c] placeholder:text-[#5b5675]/50 focus:outline-none focus:border-[#7c47e1] resize-none"
                />
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-[#5b5675] font-medium">Send to:</span>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="h-8 px-2 text-sm border border-[#e7e7f0] rounded-lg bg-white text-[#5b5675] focus:outline-none focus:border-[#7c47e1]"
                    >
                      <option>All users</option>
                      <option>Support Team</option>
                      <option>Sales Team</option>
                      <option>Insights & Analytics</option>
                      <option>Platform & Neo</option>
                      <option>Admins only</option>
                    </select>
                  </div>
                  <Button
                    onClick={handleSend}
                    disabled={!title.trim() || !message.trim()}
                    className="bg-[#7c47e1] hover:bg-[#6a3bc5] text-white h-8 text-sm gap-1.5 disabled:opacity-50"
                  >
                    <Send size={13} /> Send
                  </Button>
                </div>
              </>
            )}
          </div>
        )}

        {/* Past announcements */}
        <div className="space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wider text-[#5b5675]/50">Recent announcements</p>
          {past.map((ann) => (
            <div key={ann.id} className="bg-white border border-[#e7e7f0] rounded-2xl p-5 space-y-2">
              <div className="flex items-start justify-between gap-3">
                <p className="text-[#36354c] font-semibold text-sm leading-snug">{ann.title}</p>
                <span className={cn(
                  "shrink-0 flex items-center gap-1 text-xs px-2 py-0.5 rounded-full border font-medium",
                  ann.audience === "All users"
                    ? "bg-[#efe9fb] text-[#7c47e1] border-[#d6c8f8]"
                    : "bg-[#f5f5f9] text-[#5b5675] border-[#e7e7f0]"
                )}>
                  {ann.audience === "All users" ? <Globe size={10} /> : <Users size={10} />}
                  {ann.audience}
                </span>
              </div>
              <p className="text-[#5b5675] text-sm leading-relaxed">{ann.message}</p>
              <p className="text-xs text-[#5b5675]/50">Sent by {ann.sentBy} · {ann.sentAt}</p>
            </div>
          ))}
        </div>
      </div>
    </AdminPageWrapper>
  )
}
