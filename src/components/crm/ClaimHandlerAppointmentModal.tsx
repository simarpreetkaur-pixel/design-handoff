import { useEffect, useMemo, useState } from "react"
import { ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { cn } from "@/lib/utils"

export type ClaimHandlerAppointmentValue = {
  id: string
  scheduledAt: string
  note?: string
}

type TimeSlotDef = {
  id: string
  label: string
  startHour: number
  endHour: number
}

/** Matches [Figma OMNI — Claim handler appointment](https://www.figma.com/design/ItV6q2hj272EYkgVUtapxW/OMNI---Post-Sales?node-id=8473-11345) time grid (first window corrected to morning). */
const TIME_SLOTS: TimeSlotDef[] = [
  { id: "9-11", label: "9:00 AM - 11:00 AM", startHour: 9, endHour: 11 },
  { id: "11-13", label: "11:00 AM - 1:00 PM", startHour: 11, endHour: 13 },
  { id: "13-15", label: "1:00 PM - 3:00 PM", startHour: 13, endHour: 15 },
  { id: "15-17", label: "3:00 PM - 5:00 PM", startHour: 15, endHour: 17 },
]

function startOfLocalDay(d: Date): Date {
  const x = new Date(d)
  x.setHours(0, 0, 0, 0)
  return x
}

function addDays(base: Date, days: number): Date {
  const x = new Date(base)
  x.setDate(x.getDate() + days)
  return x
}

function buildScheduledAt(dayOffset: 0 | 1, slot: TimeSlotDef): string {
  const base = startOfLocalDay(new Date())
  const day = addDays(base, dayOffset)
  day.setHours(slot.startHour, 0, 0, 0)
  return day.toISOString()
}

function inferDayOffsetFromIso(iso: string): 0 | 1 {
  const appt = startOfLocalDay(new Date(iso))
  const today = startOfLocalDay(new Date())
  if (appt.getTime() === today.getTime()) return 0
  const tomorrow = addDays(today, 1)
  if (appt.getTime() === tomorrow.getTime()) return 1
  return 1
}

function inferSlotIdFromIso(iso: string): string {
  const d = new Date(iso)
  const hour = d.getHours() + d.getMinutes() / 60
  const found = TIME_SLOTS.find((s) => hour >= s.startHour && hour < s.endHour)
  return found?.id ?? TIME_SLOTS[0].id
}

function isSlotPastOnDay(dayOffset: 0 | 1, slot: TimeSlotDef, now: Date): boolean {
  if (dayOffset !== 0) return false
  const slotStart = buildScheduledAt(0, slot)
  return new Date(slotStart).getTime() <= now.getTime()
}

type ClaimHandlerAppointmentModalProps = {
  open: boolean
  onOpenChange: (open: boolean) => void
  mode: "create" | "edit"
  initialScheduledAt?: string | null
  initialNote?: string | null
  /** e.g. vehicle + policy (Figma header chip) */
  contextSubtitle?: string
  onConfirm: (value: { scheduledAt: string; note: string }) => void
}

export function ClaimHandlerAppointmentModal({
  open,
  onOpenChange,
  mode,
  initialScheduledAt,
  initialNote,
  contextSubtitle,
  onConfirm,
}: ClaimHandlerAppointmentModalProps) {
  const [dayOffset, setDayOffset] = useState<0 | 1>(0)
  const [slotId, setSlotId] = useState<string>(TIME_SLOTS[0].id)
  const [reason, setReason] = useState("")

  const now = new Date()

  useEffect(() => {
    if (!open) return
    if (mode === "edit" && initialScheduledAt) {
      const dOff = inferDayOffsetFromIso(initialScheduledAt)
      setDayOffset(dOff)
      setSlotId(inferSlotIdFromIso(initialScheduledAt))
      setReason(initialNote?.trim() ?? "")
    } else {
      setReason("")
      const firstDay: 0 | 1 = TIME_SLOTS.some((s) => !isSlotPastOnDay(0, s, new Date())) ? 0 : 1
      setDayOffset(firstDay)
      const pick =
        TIME_SLOTS.find((s) => !isSlotPastOnDay(firstDay, s, new Date())) ?? TIME_SLOTS[TIME_SLOTS.length - 1]
      setSlotId(pick.id)
    }
  }, [open, mode, initialScheduledAt, initialNote])

  const selectedSlot = TIME_SLOTS.find((s) => s.id === slotId) ?? TIME_SLOTS[0]

  const scheduledAtIso = useMemo(
    () => buildScheduledAt(dayOffset, selectedSlot),
    [dayOffset, selectedSlot],
  )

  const handleConfirm = () => {
    if (isSlotPastOnDay(dayOffset, selectedSlot, new Date())) return
    onConfirm({ scheduledAt: scheduledAtIso, note: reason.trim() })
    onOpenChange(false)
  }

  const slotDisabled = (slot: TimeSlotDef) => isSlotPastOnDay(dayOffset, slot, now)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent
        className="max-w-lg gap-6 border-[#e7e7f0] bg-white p-4 font-euclid sm:max-w-lg"
        showCloseButton
      >
        <DialogHeader className="space-y-0">
          <div className="flex w-full flex-col gap-4 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
            <DialogTitle className="text-left text-[16px] font-medium leading-6 text-[#36354c]">
              Claim Handler Appointment
            </DialogTitle>
            {contextSubtitle ? (
              <div
                className="flex shrink-0 items-center justify-between gap-2 rounded-lg border border-[#e7e7f0] px-3 py-1.5 sm:max-w-[min(100%,280px)]"
                aria-label="Claim context"
              >
                <span className="truncate text-left text-[14px] font-medium leading-5 text-[#36354c]">
                  {contextSubtitle}
                </span>
                <ChevronDown className="size-4 shrink-0 text-[#36354c]" aria-hidden />
              </div>
            ) : null}
          </div>
        </DialogHeader>

        <div className="flex flex-col gap-6">
          <div className="flex flex-col gap-2">
            <label htmlFor="claim-handler-reason" className="text-[14px] font-medium leading-4 text-[#5b5675]">
              Reason
            </label>
            <textarea
              id="claim-handler-reason"
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={3}
              placeholder="Describe why the customer needs a claim handler callback"
              className="w-full resize-none rounded-md border border-[#e7e7f0] p-3 text-[14px] leading-5 text-[#36354c] outline-none placeholder:text-[#5b5675] focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]/25"
            />
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium leading-4 text-[#5b5675]">Select date</p>
            <div className="flex gap-3">
              {([0, 1] as const).map((off) => (
                <button
                  key={off}
                  type="button"
                  onClick={() => {
                    setDayOffset(off)
                    const firstOk = TIME_SLOTS.find((s) => !isSlotPastOnDay(off, s, new Date()))
                    if (firstOk) setSlotId(firstOk.id)
                  }}
                  className={cn(
                    "flex h-12 min-h-12 flex-1 items-center justify-center rounded-md border px-5 text-[14px] font-normal leading-5 transition-colors",
                    dayOffset === off
                      ? "border-[#7c47e1] bg-[#f5f3fc] text-[#36354c] ring-1 ring-[#7c47e1]/30"
                      : "border-[#e7e7f0] bg-white text-[#36354c] hover:bg-[#fafafa]",
                  )}
                >
                  {off === 0 ? "Today" : "Tomorrow"}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <p className="text-[14px] font-medium leading-4 text-[#5b5675]">Select time</p>
            <div className="grid grid-cols-2 gap-3">
              {TIME_SLOTS.map((slot) => {
                const disabled = slotDisabled(slot)
                const selected = slot.id === slotId
                return (
                  <button
                    key={slot.id}
                    type="button"
                    disabled={disabled}
                    onClick={() => setSlotId(slot.id)}
                    className={cn(
                      "flex h-12 items-center justify-center rounded-md border p-2 text-center text-[14px] font-normal leading-5 transition-colors",
                      disabled && "cursor-not-allowed opacity-40",
                      selected && !disabled
                        ? "border-[#7c47e1] bg-[#f5f3fc] text-[#36354c] ring-1 ring-[#7c47e1]/30"
                        : "border-[#e5e5e5] bg-white text-[#36354c] hover:bg-[#fafafa]",
                    )}
                  >
                    {slot.label}
                  </button>
                )
              })}
            </div>
          </div>
        </div>

        <DialogFooter className="mt-2 flex-col sm:flex-col">
          <Button
            type="button"
            className="h-[42px] w-full rounded-md bg-[#7c47e1] text-[14px] font-medium text-white hover:bg-[#7c47e1]/90"
            onClick={handleConfirm}
            disabled={slotDisabled(selectedSlot)}
          >
            Schedule Callback
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

export function formatClaimHandlerAppointmentDisplay(iso: string): string {
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return iso
  return d.toLocaleString(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  })
}
