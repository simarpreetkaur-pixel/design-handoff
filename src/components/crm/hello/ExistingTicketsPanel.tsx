/**
 * ExistingTicketsPanel
 *
 * Freshdesk-style existing support tickets list.
 * Figma reference: node 247:6029 — screenshot of Freshdesk ticket list.
 * Styled with project design tokens for full consistency.
 */
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

// ─── Mock data (from Figma screenshot) ───────────────────────────────────────

type TicketPriority = "low" | "medium" | "high"
type TicketStatus = "open" | "pending" | "resolved"
type TicketBadge = "new" | "customer_responded" | null

interface FreshdeskTicket {
  id: number
  title: string
  requester: string
  avatarInitial: string
  avatarColor: string
  activityLine: string
  dueLine: string
  priority: TicketPriority
  group: string
  agent: string
  status: TicketStatus
  badge: TicketBadge
}

const MOCK_TICKETS: FreshdeskTicket[] = [
  {
    id: 572,
    title: "Unable to login",
    requester: "Abid K",
    avatarInitial: "A",
    avatarColor: "bg-[#7c47e1]",
    activityLine: "Created 3 days ago",
    dueLine: "First response due in 4 days",
    priority: "low",
    group: "Support",
    agent: "Sara S",
    status: "open",
    badge: "new",
  },
  {
    id: 567,
    title: "Unable to register an account",
    requester: "Abid K",
    avatarInitial: "A",
    avatarColor: "bg-[#7c47e1]",
    activityLine: "Agent responded 11 days ago",
    dueLine: "Due in 6 days",
    priority: "low",
    group: "Support",
    agent: "Sara S",
    status: "open",
    badge: null,
  },
  {
    id: 556,
    title: "Exchange instead of a refund?",
    requester: "Eleanore",
    avatarInitial: "E",
    avatarColor: "bg-[#e05752]",
    activityLine: "Customer responded 44 minutes ago",
    dueLine: "Due in 6 days",
    priority: "low",
    group: "Refunds an...",
    agent: "R. Sebasti...",
    status: "open",
    badge: "customer_responded",
  },
  {
    id: 555,
    title: "Possible to get an exchange?",
    requester: "Eleanore",
    avatarInitial: "E",
    avatarColor: "bg-[#e05752]",
    activityLine: "Agent responded 6 minutes ago",
    dueLine: "Due in 12 days",
    priority: "medium",
    group: "Refunds an...",
    agent: "Saul...",
    status: "open",
    badge: null,
  },
  {
    id: 547,
    title: "How do CC notifications work?",
    requester: "Saul",
    avatarInitial: "S",
    avatarColor: "bg-[#0fa457]",
    activityLine: "Agent responded 11 days ago",
    dueLine: "Due in 12 days",
    priority: "low",
    group: "Support",
    agent: "Susan...",
    status: "open",
    badge: null,
  },
  {
    id: 549,
    title: "Hello",
    requester: "Andrey P",
    avatarInitial: "A",
    avatarColor: "bg-[#f58700]",
    activityLine: "Agent responded a month ago",
    dueLine: "Due in 6 days",
    priority: "low",
    group: "Shipping",
    agent: "Riya febas...",
    status: "open",
    badge: null,
  },
]

// ─── Style helpers ────────────────────────────────────────────────────────────

const PRIORITY_CONFIG: Record<TicketPriority, { label: string; cls: string }> = {
  low:    { label: "Low",    cls: "text-[#5b5675]" },
  medium: { label: "Medium", cls: "text-[#f58700]" },
  high:   { label: "High",   cls: "text-[#e05752]" },
}

const STATUS_CONFIG: Record<TicketStatus, { label: string; cls: string }> = {
  open:     { label: "Open",     cls: "text-[#5b5675]" },
  pending:  { label: "Pending",  cls: "text-[#f58700]" },
  resolved: { label: "Resolved", cls: "text-[#0fa457]" },
}

const BADGE_CONFIG: Record<NonNullable<TicketBadge>, { label: string; cls: string }> = {
  new:                { label: "New",                cls: "bg-[#e8f5e8] text-[#0fa457]" },
  customer_responded: { label: "Customer responded", cls: "bg-[#eef2ff] text-[#4f6ef5]" },
}

// ─── Ticket row ───────────────────────────────────────────────────────────────

function TicketRow({ ticket }: { ticket: FreshdeskTicket }) {
  const priority = PRIORITY_CONFIG[ticket.priority]
  const status   = STATUS_CONFIG[ticket.status]

  return (
    <div className="flex w-full items-start gap-2.5 border-b border-[#f0f0f6] px-3 py-2.5 last:border-b-0 hover:bg-[#f8f7fc] transition-colors cursor-pointer">

      {/* Avatar */}
      <div
        className={cn(
          "mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full font-euclid text-[10px] font-bold text-white",
          ticket.avatarColor,
        )}
      >
        {ticket.avatarInitial}
      </div>

      {/* Main content */}
      <div className="min-w-0 flex-1">
        {/* Badge */}
        {ticket.badge && (
          <span className={cn("mb-1 inline-block rounded px-1.5 py-0.5 font-euclid text-[10px] font-semibold leading-none", BADGE_CONFIG[ticket.badge].cls)}>
            {BADGE_CONFIG[ticket.badge].label}
          </span>
        )}

        {/* Title */}
        <p className="font-euclid text-[12px] font-semibold leading-[17px] text-[#040222]">
          {ticket.title}
          <span className="ml-1 font-normal text-[#9c9aaf]">#{ticket.id}</span>
        </p>

        {/* Activity */}
        <p className="mt-0.5 font-euclid text-[11px] leading-4 text-[#9c9aaf]">
          <span className="text-[#5b5675]">{ticket.requester}</span>
          {" · "}
          {ticket.activityLine}
          {" · "}
          {ticket.dueLine}
        </p>
      </div>

      {/* Right metadata — Priority / Group+Agent / Status, each with chevron ↓ */}
      <div className="flex shrink-0 flex-col items-end gap-1">
        {/* Priority */}
        <div className={cn("flex items-center gap-0.5 font-euclid text-[10px] font-medium", priority.cls)}>
          {priority.label}
          <ChevronDown className="size-2.5 shrink-0" strokeWidth={2} />
        </div>

        {/* Group / Agent */}
        <p className="max-w-[72px] truncate text-right font-euclid text-[10px] leading-none text-[#9c9aaf]">
          {ticket.group} / {ticket.agent}
        </p>

        {/* Status */}
        <div className={cn("flex items-center gap-0.5 font-euclid text-[10px] font-medium", status.cls)}>
          {status.label}
          <ChevronDown className="size-2.5 shrink-0" strokeWidth={2} />
        </div>
      </div>
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export interface ExistingTicketsPanelProps {
  tickets?: FreshdeskTicket[]
}

export function ExistingTicketsPanel({ tickets = MOCK_TICKETS }: ExistingTicketsPanelProps) {
  const openCount = tickets.filter((t) => t.status === "open").length

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="shrink-0 border-b border-[#e7e7f0] px-4 py-3">
        <div className="flex items-center gap-2">
          <h3 className="font-euclid text-[14px] font-semibold text-[#040222]">Existing Tickets</h3>
          <span className="rounded-full bg-[#f0f0f6] px-2 py-0.5 font-euclid text-[11px] font-semibold text-[#5b5675]">
            {tickets.length}
          </span>
        </div>
        <p className="mt-0.5 font-euclid text-[12px] text-[#5b5675]">
          {openCount} open · Freshdesk
        </p>
      </div>

      {/* Ticket list */}
      <div className="min-h-0 flex-1 overflow-y-auto">
        {tickets.map((ticket) => (
          <TicketRow key={ticket.id} ticket={ticket} />
        ))}
      </div>
    </div>
  )
}
