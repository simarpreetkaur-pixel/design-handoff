import { useEffect, useRef, useState } from "react"
import {
  ArrowLeft,
  Check,
  ChevronRight,
  Loader2,
  MapPin,
  TriangleAlert,
  Upload,
  X,
} from "lucide-react"

import type { Policy } from "@/types/crm"
import { Button } from "@/components/ui/button"
import {
  RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE,
  RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE,
} from "@/lib/raiseClaimGuidanceCopy"
import { cn } from "@/lib/utils"

// ─── Types ───────────────────────────────────────────────────────────────────

type Step =
  | "scenario"
  | "process_info"
  | "incident_description"
  | "more_details"
  | "upload_docs"
  | "verifying"
  | "cashless_info"
  | "garage_detail"
  | "network_garages"
  | "schedule_pickup"
  | "claim_informant"
  | "success"

type MoreDetails = {
  injuries: "yes" | "no" | null
  when: "yesterday" | "today" | "custom" | null
  customDate: string
  driverPresent: "yes" | "no" | null
  carLocation: "garage" | "with_me" | null
  towing: "request" | "safe" | null
}

const SCENARIOS = [
  {
    id: "accident",
    emoji: "🚗",
    title: "My car was damaged in an accident",
    desc: "My car was in a collision with a vehicle, person, or object",
  },
  {
    id: "no_accident",
    emoji: "🛞",
    title: "My car is damaged, but there was no accident",
    desc: "My car was damaged while it was parked, hit by a falling object, etc.",
  },
  {
    id: "stolen",
    emoji: "🚗",
    title: "My car has been stolen",
    desc: "My car is missing and I want to report it",
  },
  {
    id: "vandalised",
    emoji: "🛞",
    title: "My car was vandalised",
    desc: "My car's tyres/batteries/other parts were stolen or damaged",
  },
]

const PROCESS_STEPS = [
  {
    icon: "✍️",
    title: "Tell us what happened",
    desc: "Share when, where, and how the incident happened so we can assess your claim better.",
  },
  {
    icon: "🪪",
    title: "Upload documents",
    desc: "Upload your DL and RC. Make sure they are clear and visible.",
  },
  {
    icon: "🔍",
    title: "Damage survey",
    desc: "We'll inspect the damage during the survey. It is mandatory for claim review.",
  },
  {
    icon: "🛠️",
    title: "We review your claim",
    desc: "Our claims expert will assess the details and review your claim for approval.",
  },
  {
    icon: "💰",
    title: "Settlement and payout",
    desc: "On claim approval, we settle the approved amount. You pay your share after receiving a clear cost breakdown.",
  },
]

const TOWING_CONDITIONS = [
  "Flat or damaged tyres",
  "Deployed airbags",
  "Unable to start the engine",
  "Fluid leakage under the car",
  "Car is affected by flood",
  "Any other safety concerns",
]

const EXCLUSIVE_BENEFITS = [
  { label: "30% Faster Repair Service", highlight: "30% Faster" },
  { label: "Free pickup and drop", highlight: "Free" },
  { label: "Expert Technicians", highlight: null },
  { label: "20% Out-of-pocket savings", highlight: "20%" },
  { label: "Real-Time Tracking", highlight: null },
  { label: "Original Spare Parts", highlight: null },
]

const PICKUP_DATES = [
  { day: "TODAY", date: "09", slots: 0 },
  { day: "WED", date: "10", slots: 0 },
  { day: "THU", date: "11", slots: 3, selected: true },
  { day: "FRI", date: "12", slots: 6 },
  { day: "SAT", date: "13", slots: 5 },
]

const PICKUP_SLOTS = ["01:00 PM - 02:00 PM", "02:00 PM - 03:00 PM", "03:00 PM - 04:00 PM"]

// ─── Sub-screens ─────────────────────────────────────────────────────────────

function ScreenHeader({ title, onBack }: { title?: string; onBack?: () => void }) {
  return (
    <div className="flex shrink-0 items-center gap-2 border-b border-[#e7e7f0] px-4 py-3">
      {onBack ? (
        <button
          type="button"
          onClick={onBack}
          className="flex size-7 shrink-0 items-center justify-center rounded-full text-[#5b5675] hover:bg-[#f0f0f6]"
          aria-label="Back"
        >
          <ArrowLeft className="size-4" />
        </button>
      ) : null}
      {title ? (
        <p className="font-euclid text-[13px] font-semibold text-[#040222]">{title}</p>
      ) : null}
    </div>
  )
}

function ContinueBtn({
  label = "Continue",
  disabled,
  onClick,
}: {
  label?: string
  disabled?: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cn(
        "w-full rounded-[10px] py-3.5 font-euclid text-[14px] font-semibold transition-colors",
        disabled
          ? "bg-[#e4e4e9] text-[#a0a0b2] cursor-not-allowed"
          : "bg-[#0d8a4a] text-white hover:bg-[#0b7540]",
      )}
    >
      {label}
    </button>
  )
}

function SelectionBtn({
  label,
  selected,
  onClick,
}: {
  label: string
  selected: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex-1 rounded-lg border py-2.5 font-euclid text-[13px] font-medium transition-colors",
        selected ? "border-[#0d8a4a] bg-[#f0fdf6] text-[#0d8a4a]" : "border-[#e7e7f0] bg-white text-[#040222]",
      )}
    >
      {label}
    </button>
  )
}

// Step 1
function ScenarioScreen({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      <h2 className="font-euclid text-[20px] font-bold leading-7 text-[#040222]">
        Tell us what happened{" "}
        <span className="text-[#7c47e1]">to your vehicle</span>
      </h2>
      <div className="flex flex-col gap-3">
        {SCENARIOS.map((s) => (
          <button
            key={s.id}
            type="button"
            onClick={() => onSelect(s.id)}
            className="flex w-full flex-col gap-1 rounded-xl border border-[#e7e7f0] bg-white p-4 text-left shadow-[0px_1px_3px_rgba(54,53,76,0.06)] hover:border-[#c5bde8]"
          >
            <span className="text-2xl">{s.emoji}</span>
            <p className="font-euclid text-[14px] font-bold leading-5 text-[#040222]">{s.title}</p>
            <p className="font-euclid text-[12px] leading-4 text-[#6c6c80]">{s.desc}</p>
          </button>
        ))}
      </div>
    </div>
  )
}

// Step 2
function ProcessInfoScreen({ onGetStarted }: { onGetStarted: () => void }) {
  return (
    <div className="flex flex-col gap-5 p-4 pb-6">
      <h2 className="font-euclid text-[20px] font-bold leading-7 text-[#040222]">
        How does our{" "}
        <span className="text-[#7c47e1]">claim process work?</span>
      </h2>

      {/* Process bar */}
      <div className="flex items-center justify-between rounded-xl bg-[#f4f4f6] p-3">
        {["Report", "Review", "Repair", "Settle"].map((label, i) => (
          <div key={label} className="flex items-center gap-1">
            <div className="flex flex-col items-center gap-1">
              <div className="flex size-8 items-center justify-center rounded-full bg-white text-base shadow-sm">
                {["📄", "🚗", "🔧", "🤝"][i]}
              </div>
              <span className="font-euclid text-[10px] text-[#5b5675]">{label}</span>
            </div>
            {i < 3 && <span className="mb-4 text-[#c5c5d0]">→</span>}
          </div>
        ))}
      </div>

      {/* Steps */}
      <div className="flex flex-col">
        {PROCESS_STEPS.map((step, i) => (
          <div key={step.title} className="flex gap-3">
            <div className="flex flex-col items-center">
              <div className="flex size-8 shrink-0 items-center justify-center rounded-full border-2 border-[#7c47e1] bg-[#f4f0fd] text-sm">
                {step.icon}
              </div>
              {i < PROCESS_STEPS.length - 1 && (
                <div className="w-px flex-1 border-l-2 border-dashed border-[#c5bde8] my-1" />
              )}
            </div>
            <div className="pb-4 min-w-0 flex-1">
              <p className="font-euclid text-[13px] font-bold text-[#7c47e1]">{step.title}</p>
              <p className="mt-0.5 font-euclid text-[12px] leading-[18px] text-[#5b5675]">{step.desc}</p>
            </div>
          </div>
        ))}
      </div>

      <button
        type="button"
        onClick={onGetStarted}
        className="w-full rounded-[10px] bg-[#0d8a4a] py-3.5 font-euclid text-[14px] font-semibold text-white hover:bg-[#0b7540]"
      >
        Get started
      </button>
    </div>
  )
}

// NCB bottom sheet — overlays the current screen
function NcbBottomSheet({ onReport, onDismiss }: { onReport: () => void; onDismiss: () => void }) {
  return (
    <div className="absolute inset-0 z-10 flex flex-col justify-end rounded-[22px] overflow-hidden">
      {/* dark backdrop */}
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onDismiss}
        aria-hidden
      />
      {/* sheet */}
      <div className="relative z-10 flex flex-col gap-4 rounded-t-2xl bg-white p-4 pb-6 shadow-[0_-4px_20px_rgba(0,0,0,0.15)]">
        <div className="flex justify-end">
          <button type="button" onClick={onDismiss} className="text-[#5b5675] hover:text-[#040222]">
            <X className="size-5" />
          </button>
        </div>
        <div className="flex justify-center text-5xl">🧾</div>
        <h2 className="font-euclid text-[18px] font-bold leading-6 text-[#040222]">
          Know how{" "}
          <span className="text-[#7c47e1]">your NCB gets impacted before you claim</span>
        </h2>
        <div className="rounded-xl border border-[#f4b8b8] bg-gradient-to-b from-[#fff5f5] to-[#fff9f0] p-4">
          <p className="font-euclid text-[13px] font-bold leading-5 text-[#c0392b]">
            You will lose the 50% NCB discount on your upcoming renewal
          </p>
          <p className="mt-2 font-euclid text-[12px] leading-5 text-[#040222]">
            Your NCB discount is <strong>affected only after your claim is settled,</strong> not when you report it.
          </p>
          <button type="button" className="mt-2 font-euclid text-[12px] text-[#7c47e1] underline">
            What is No Claim Bonus and how does it work?
          </button>
        </div>
        <button
          type="button"
          onClick={onReport}
          className="w-full rounded-[10px] bg-[#0d8a4a] py-3.5 font-euclid text-[14px] font-semibold text-white hover:bg-[#0b7540]"
        >
          Report a claim
        </button>
        <button
          type="button"
          onClick={onDismiss}
          className="w-full text-center font-euclid text-[13px] text-[#7c47e1]"
        >
          I don't want to report a claim
        </button>
      </div>
    </div>
  )
}

// Step 4
function IncidentDescriptionScreen({
  onContinue,
}: {
  onContinue: (text: string) => void
}) {
  const [text, setText] = useState("")
  const isValid = text.trim().length >= 2

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      <h2 className="font-euclid text-[20px] font-bold leading-7 text-[#040222]">
        Can you tell us{" "}
        <span className="text-[#7c47e1]">how the incident took place?</span>
      </h2>
      <div className="rounded-xl border border-[#e7e7f0]">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          rows={7}
          placeholder="Example: I was parking my car at the mall yesterday when I scraped the left side against a pillar. The rear bumper has a dent and the tail light cover is cracked"
          className="w-full resize-none rounded-xl px-3 py-3 font-euclid text-[13px] leading-5 text-[#040222] placeholder:text-[#a0a0b2] outline-none"
        />
        <p className="px-3 pb-2 text-right font-euclid text-[11px] text-[#a0a0b2]">Minimum 2 characters</p>
      </div>
      <div>
        <p className="font-euclid text-[12px] text-[#5b5675]">Include these details below for a better estimate</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {["Incident details", "Damage details", "When it happened", "Who was driving"].map((tag) => (
            <span
              key={tag}
              className="rounded-full border border-[#f0c080] bg-[#fff8ec] px-3 py-1 font-euclid text-[12px] text-[#b07010]"
            >
              {tag}
            </span>
          ))}
        </div>
      </div>
      <ContinueBtn disabled={!isValid} onClick={() => onContinue(text)} />
    </div>
  )
}

// Step 5
function MoreDetailsScreen({
  details,
  onChange,
  onContinue,
}: {
  details: MoreDetails
  onChange: (d: Partial<MoreDetails>) => void
  onContinue: () => void
}) {
  const isValid =
    details.injuries !== null &&
    details.when !== null &&
    details.driverPresent !== null &&
    details.carLocation !== null

  return (
    <div className="flex flex-col gap-5 p-4 pb-6">
      <h2 className="font-euclid text-[20px] font-bold leading-7 text-[#040222]">
        Share a{" "}
        <span className="text-[#7c47e1]">few more details</span>
      </h2>

      {/* Q1 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#040222] font-euclid text-[11px] font-bold text-white">1</span>
          <p className="font-euclid text-[13px] font-semibold text-[#040222]">Did the accident result in any deaths or serious injuries?</p>
        </div>
        <div className="flex gap-3">
          <SelectionBtn label="Yes" selected={details.injuries === "yes"} onClick={() => onChange({ injuries: "yes" })} />
          <SelectionBtn label="No" selected={details.injuries === "no"} onClick={() => onChange({ injuries: "no" })} />
        </div>
      </div>

      {/* Q2 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#040222] font-euclid text-[11px] font-bold text-white">2</span>
          <p className="font-euclid text-[13px] font-semibold text-[#040222]">When did it happen?</p>
        </div>
        <div className="flex gap-3">
          <SelectionBtn label="Yesterday" selected={details.when === "yesterday"} onClick={() => onChange({ when: "yesterday" })} />
          <SelectionBtn label="Today" selected={details.when === "today"} onClick={() => onChange({ when: "today" })} />
        </div>
        <input
          type="text"
          placeholder="Date of accident"
          value={details.customDate}
          onChange={(e) => onChange({ customDate: e.target.value, when: "custom" })}
          className="rounded-lg border border-[#e7e7f0] px-3 py-2.5 font-euclid text-[13px] text-[#040222] outline-none placeholder:text-[#a0a0b2] focus:border-[#7c47e1]"
        />
      </div>

      {/* Q3 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#040222] font-euclid text-[11px] font-bold text-white">3</span>
          <p className="font-euclid text-[13px] font-semibold text-[#040222]">Was someone driving the car when it happened?</p>
        </div>
        <div className="flex gap-3">
          <SelectionBtn label="Yes" selected={details.driverPresent === "yes"} onClick={() => onChange({ driverPresent: "yes" })} />
          <SelectionBtn label="No" selected={details.driverPresent === "no"} onClick={() => onChange({ driverPresent: "no" })} />
        </div>
      </div>

      {/* Q4 */}
      <div className="flex flex-col gap-2">
        <div className="flex items-start gap-2">
          <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#040222] font-euclid text-[11px] font-bold text-white">4</span>
          <p className="font-euclid text-[13px] font-semibold text-[#040222]">Where is your car right now?</p>
        </div>
        <div className="flex gap-3">
          <SelectionBtn label="At a garage" selected={details.carLocation === "garage"} onClick={() => onChange({ carLocation: "garage" })} />
          <SelectionBtn label="With me" selected={details.carLocation === "with_me"} onClick={() => onChange({ carLocation: "with_me" })} />
        </div>
        {details.carLocation === "with_me" && (
          <div className="flex items-start gap-2 rounded-lg border border-[#e7e7f0] bg-[#f8f7fc] px-3 py-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#7c47e1]" />
            <p className="font-euclid text-[12px] leading-5 text-[#040222]">Abhinav Hermitage, 4th Cross Rd, Rustam Bagh Layout, Bengaluru, Karnataka 560017, India</p>
          </div>
        )}
        {details.carLocation === "garage" && (
          <div className="flex items-start gap-2 rounded-lg border border-[#e7e7f0] bg-[#f8f7fc] px-3 py-2">
            <MapPin className="mt-0.5 size-4 shrink-0 text-[#7c47e1]" />
            <p className="font-euclid text-[12px] leading-5 text-[#040222]">At a garage</p>
          </div>
        )}
        <div className="flex items-start gap-2 rounded-xl bg-[#f0edfb] px-3 py-2.5">
          <span className="text-base">🤝</span>
          <div>
            <p className="font-euclid text-[12px] font-bold text-[#7c47e1]">ACKO recommends:</p>
            <p className="font-euclid text-[12px] leading-4 text-[#5b5675]">Keep your car with you until survey is complete which is critical for claim review</p>
          </div>
        </div>
      </div>

      {/* Q5 towing — only if "with me" */}
      {details.carLocation === "with_me" && (
        <div className="flex flex-col gap-2">
          <div className="flex items-start gap-2">
            <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-[#040222] font-euclid text-[11px] font-bold text-white">5</span>
            <p className="font-euclid text-[13px] font-semibold text-[#040222]">Can the car be driven safely, or should we arrange a towing service?</p>
          </div>
          <div className="rounded-xl border border-[#e7e7f0] bg-white p-3">
            <p className="font-euclid text-[12px] text-[#5b5675]">
              Select <strong className="text-[#040222]">'Towing needed'</strong> if you notice any of the conditions listed below
            </p>
            <ul className="mt-2 flex flex-col gap-1">
              {TOWING_CONDITIONS.map((c) => (
                <li key={c} className="flex items-center gap-2">
                  <TriangleAlert className="size-4 shrink-0 text-[#f0a050]" />
                  <span className="font-euclid text-[12px] text-[#5b5675]">{c}</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="flex gap-3">
            <SelectionBtn label="Request towing" selected={details.towing === "request"} onClick={() => onChange({ towing: "request" })} />
            <SelectionBtn label="Safe to drive" selected={details.towing === "safe"} onClick={() => onChange({ towing: "safe" })} />
          </div>
        </div>
      )}

      <ContinueBtn
        disabled={!isValid || (details.carLocation === "with_me" && !details.towing)}
        onClick={onContinue}
      />
    </div>
  )
}

// Step 6a — address search
function AddressSearchScreen({ onSelect, onBack }: { onSelect: (addr: string) => void; onBack: () => void }) {
  const [query, setQuery] = useState("")

  return (
    <div className="flex flex-col">
      <ScreenHeader title="Select address" onBack={onBack} />
      <div className="flex flex-col gap-4 p-4">
        <input
          autoFocus
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search house no, apartment, street..."
          className="rounded-xl border border-[#7c47e1] px-3 py-2.5 font-euclid text-[13px] text-[#040222] outline-none placeholder:text-[#a0a0b2]"
        />
        <button
          type="button"
          onClick={() => onSelect("Abhinav Hermitage, 4th Cross Rd, Rustam Bagh Layout, Bengaluru, Karnataka 560017, India")}
          className="flex items-start gap-2 text-left"
        >
          <MapPin className="mt-0.5 size-5 shrink-0 text-[#7c47e1]" />
          <div>
            <p className="font-euclid text-[13px] font-bold text-[#7c47e1]">Use current location</p>
            <p className="font-euclid text-[12px] text-[#5b5675]">Detect address automatically using GPS</p>
          </div>
        </button>
        <div className="border-t border-dashed border-[#e7e7f0]" />
      </div>
    </div>
  )
}

// Step 6b — address details
function AddressDetailsScreen({
  address,
  onContinue,
  onBack,
}: {
  address: string
  onContinue: () => void
  onBack: () => void
}) {
  const [flat, setFlat] = useState("")
  const [building, setBuilding] = useState("")
  const [locType, setLocType] = useState<string | null>(null)

  return (
    <div className="flex flex-col">
      <ScreenHeader onBack={onBack} />
      <div className="flex flex-col gap-4 p-4 pb-6">
        <h2 className="font-euclid text-[16px] font-bold text-[#040222]">Help us with some more details</h2>
        <div className="rounded-xl bg-[#f4f4f6] p-3">
          <div className="flex items-center justify-between">
            <p className="font-euclid text-[13px] font-bold text-[#040222]">Abhinav Hermitage</p>
            <button type="button" className="font-euclid text-[12px] text-[#7c47e1]">Edit</button>
          </div>
          <p className="mt-0.5 font-euclid text-[12px] leading-5 text-[#5b5675]">{address}</p>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-euclid text-[13px] font-bold text-[#040222]">Select a location type</p>
          <div className="flex flex-wrap gap-2">
            {["Home/Office", "Accident site", "Police station"].map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setLocType(t)}
                className={cn(
                  "rounded-lg border px-4 py-2 font-euclid text-[13px]",
                  locType === t ? "border-[#0d8a4a] bg-[#f0fdf6] text-[#0d8a4a]" : "border-[#e7e7f0] text-[#040222]",
                )}
              >
                {t}
              </button>
            ))}
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <p className="font-euclid text-[13px] font-bold text-[#040222]">Add complete address</p>
          <input
            type="text"
            placeholder="Floor/Flat number"
            value={flat}
            onChange={(e) => setFlat(e.target.value)}
            className="rounded-xl border border-[#e7e7f0] px-3 py-2.5 font-euclid text-[13px] text-[#040222] outline-none focus:border-[#7c47e1]"
          />
          <input
            type="text"
            placeholder="Apartment/building name"
            value={building}
            onChange={(e) => setBuilding(e.target.value)}
            className="rounded-xl border border-[#e7e7f0] px-3 py-2.5 font-euclid text-[13px] text-[#040222] outline-none focus:border-[#7c47e1]"
          />
        </div>

        <ContinueBtn disabled={!locType} onClick={onContinue} />
      </div>
    </div>
  )
}

// Step 7 — Upload docs (pre-uploaded)
function UploadDocsScreen({ onContinue }: { onContinue: () => void }) {
  const docs = [
    { title: "Registration Certificate (RC)", detail: "Upload RC for KL01BB0275 - include both the front and back sides, even if the back is blank." },
    { title: "Driving Licence", detail: "Upload DL for Ajith S - include both the front and back sides, even if the back is blank." },
  ]

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      <h2 className="font-euclid text-[16px] font-bold text-[#040222]">Upload documents</h2>
      <div className="flex gap-4 border-b border-[#e7e7f0] pb-2">
        <button type="button" className="border-b-2 border-[#0d8a4a] pb-1 font-euclid text-[13px] font-semibold text-[#040222]">Upload Documents</button>
        <button type="button" className="pb-1 font-euclid text-[13px] text-[#5b5675]">Request Link</button>
      </div>
      <div className="flex flex-col gap-4">
        {docs.map((doc) => (
          <div key={doc.title} className="flex flex-col gap-3 rounded-xl border border-[#e7e7f0] bg-white p-4">
            <div>
              <p className="font-euclid text-[13px] font-bold text-[#040222]">{doc.title}</p>
              <p className="mt-0.5 font-euclid text-[11px] leading-4 text-[#5b5675]">{doc.detail}</p>
            </div>
            <div className="flex items-center gap-2 rounded-lg border border-[#d1f0e0] bg-[#f0faf5] px-3 py-2.5">
              <div className="flex size-5 shrink-0 items-center justify-center rounded-full bg-[#0d8a4a]">
                <Check className="size-3 text-white" strokeWidth={3} />
              </div>
              <span className="font-euclid text-[13px] font-medium text-[#0d8a4a]">Document uploaded</span>
            </div>
          </div>
        ))}
      </div>
      <ContinueBtn onClick={onContinue} />
    </div>
  )
}

// Step 8 — Verifying loader
function VerifyingScreen({ onDone }: { onDone: () => void }) {
  useEffect(() => {
    const t = window.setTimeout(onDone, 2000)
    return () => window.clearTimeout(t)
  }, [onDone])

  return (
    <div className="flex flex-col items-center justify-center gap-6 py-16">
      <div className="text-6xl">🪪</div>
      <p className="font-euclid text-[18px] font-bold text-[#7c47e1]">We are verifying your documents...</p>
      <div className="h-1.5 w-40 overflow-hidden rounded-full bg-[#e7e7f0]">
        <div className="h-full w-2/3 animate-pulse rounded-full bg-[#7c47e1]" />
      </div>
    </div>
  )
}

// Step 9 — Cashless info
function CashlessInfoScreen({ onProceed }: { onProceed: () => void }) {
  return (
    <div className="flex flex-col items-center gap-5 p-4 pb-6 text-center">
      <div className="text-5xl mt-4">🔧</div>
      <div>
        <p className="font-euclid text-[18px] font-bold text-[#040222]">Easy Cashless Claim Experience!</p>
        <p className="mt-1 font-euclid text-[13px] leading-5 text-[#5b5675]">Our expert team has handpicked top garages for a hassle-free claim experience.</p>
      </div>
      <button
        type="button"
        onClick={onProceed}
        className="w-full rounded-[10px] bg-[#0d8a4a] py-3.5 font-euclid text-[14px] font-semibold text-white hover:bg-[#0b7540]"
      >
        Proceed
      </button>
    </div>
  )
}

// Step 10 — Garage detail
function GarageDetailScreen({ onContinue, onWantDifferent }: { onContinue: () => void; onWantDifferent: () => void }) {
  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      <h2 className="font-euclid text-[16px] font-bold text-[#040222]">Here is a top rated garage near you</h2>

      <div className="flex items-center gap-2">
        <span className="rounded-full bg-[#1a7a40] px-2 py-0.5 font-euclid text-[11px] font-bold text-white">✦ ACKO OWNED</span>
        <span className="flex items-center gap-1 font-euclid text-[12px] font-semibold text-[#5b5675]">
          <span className="text-[#f59e0b]">★</span> 4.6
        </span>
      </div>

      <div>
        <p className="font-euclid text-[15px] font-bold text-[#040222]">Acko Drive Service Center</p>
        <p className="font-euclid text-[12px] text-[#5b5675]">Repair done at: ACKO Drive Service Centre (Near Hosur Road)</p>
      </div>

      <div className="flex items-center gap-1.5">
        <span>👍</span>
        <p className="font-euclid text-[12px] text-[#5b5675]">200+ Maruti, Chevrolet, Ford owners recommend it.</p>
      </div>

      {/* Photos grid */}
      <div className="grid grid-cols-2 gap-1 overflow-hidden rounded-xl">
        {[1, 2, 3].map((i) => (
          <div key={i} className="aspect-square bg-[#e7e7f0] flex items-center justify-center text-2xl">🏭</div>
        ))}
        <div className="relative aspect-square bg-[#e7e7f0] flex items-center justify-center">
          <span className="text-2xl">🏭</span>
          <div className="absolute inset-0 flex items-end justify-end bg-black/30 rounded-sm">
            <span className="m-2 font-euclid text-[11px] font-semibold text-white">📷 More photos</span>
          </div>
        </div>
      </div>

      {/* Benefits */}
      <p className="font-euclid text-[13px] font-bold text-[#040222]">Exclusive benefits</p>
      <div className="grid grid-cols-2 gap-2">
        {EXCLUSIVE_BENEFITS.map((b) => (
          <div key={b.label} className="flex items-center justify-between rounded-lg border border-[#e7e7f0] bg-white p-2.5">
            <p className="font-euclid text-[12px] text-[#040222]">
              {b.highlight ? (
                <>
                  <span className="font-bold text-[#0d8a4a]">{b.highlight}</span>{" "}
                  {b.label.replace(b.highlight, "").trim()}
                </>
              ) : b.label}
            </p>
          </div>
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <div className="rounded-xl bg-[#f0edfb] py-2.5 text-center">
          <p className="font-euclid text-[12px] font-semibold text-[#7c47e1]">Free doorstep pick-up available for you</p>
        </div>
        <button
          type="button"
          onClick={onContinue}
          className="w-full rounded-[10px] bg-[#0d8a4a] py-3.5 font-euclid text-[14px] font-semibold text-white hover:bg-[#0b7540]"
        >
          Continue
        </button>
        <button
          type="button"
          onClick={onWantDifferent}
          className="w-full text-center font-euclid text-[13px] text-[#7c47e1]"
        >
          I want a different garage
        </button>
      </div>
    </div>
  )
}

// Step 11 — Schedule pickup
function SchedulePickupScreen({ onDone }: { onDone: () => void }) {
  const [selectedDate, setSelectedDate] = useState("11")
  const [selectedSlot, setSelectedSlot] = useState<string | null>(null)

  return (
    <div className="flex flex-col gap-5 p-4 pb-6">
      <h2 className="font-euclid text-[16px] font-bold text-[#040222]">Schedule your complementary pickup</h2>
      <p className="font-euclid text-[12px] leading-5 text-[#5b5675]">Our crew will come to your doorstep, survey the damage, pick up your car and drop it at the garage.</p>

      <div className="flex items-start gap-2 rounded-xl border border-[#e7e7f0] bg-white p-3">
        <span className="text-base">🎁</span>
        <div>
          <p className="font-euclid text-[12px] font-bold text-[#040222]">This is on us, completely free</p>
          <p className="font-euclid text-[11px] leading-4 text-[#5b5675]">Courtesy pickup, survey and garage drop off at no extra cost.</p>
        </div>
      </div>

      {/* Date picker */}
      <div className="flex gap-2">
        {PICKUP_DATES.map((d) => (
          <button
            key={d.date}
            type="button"
            onClick={() => d.slots > 0 && setSelectedDate(d.date)}
            className={cn(
              "flex flex-1 flex-col items-center rounded-lg border py-2 font-euclid text-center transition-colors",
              selectedDate === d.date
                ? "border-[#0d8a4a] bg-[#f0fdf6] text-[#0d8a4a]"
                : d.slots === 0
                ? "border-[#e7e7f0] text-[#a0a0b2] cursor-not-allowed"
                : "border-[#e7e7f0] text-[#040222]",
            )}
          >
            <span className="text-[10px] font-semibold">{d.day}</span>
            <span className="text-[15px] font-bold">{d.date}</span>
            <span className="text-[10px]">{d.slots === 0 ? "0 slots" : `${d.slots} Slots`}</span>
          </button>
        ))}
      </div>

      {/* Time slots */}
      <div className="flex flex-col gap-2">
        {PICKUP_SLOTS.map((slot) => (
          <button
            key={slot}
            type="button"
            onClick={() => setSelectedSlot(slot)}
            className={cn(
              "w-full rounded-xl border py-3 font-euclid text-[13px] font-medium transition-colors",
              selectedSlot === slot
                ? "border-[#0d8a4a] bg-[#f0fdf6] text-[#0d8a4a]"
                : "border-[#e7e7f0] bg-white text-[#040222]",
            )}
          >
            {slot}
          </button>
        ))}
      </div>

      <button
        type="button"
        disabled={!selectedSlot}
        onClick={onDone}
        className={cn(
          "w-full rounded-[10px] py-3.5 font-euclid text-[14px] font-semibold transition-colors",
          selectedSlot ? "bg-[#0d8a4a] text-white hover:bg-[#0b7540]" : "bg-[#e4e4e9] text-[#a0a0b2] cursor-not-allowed",
        )}
      >
        Schedule pickup
      </button>
    </div>
  )
}

// Step 12 — Claim informant details
const INFORMANT_TYPES = ["Self", "Spouse", "Parent", "Sibling", "Friend", "Other"]

function ClaimInformantScreen({ onDone }: { onDone: () => void }) {
  const [informantType, setInformantType] = useState("")
  const [typeOpen, setTypeOpen] = useState(false)
  const [name, setName] = useState("")
  const [phone, setPhone] = useState("")
  const [comments, setComments] = useState("")

  const isValid = informantType !== "" && name.trim() !== "" && phone.trim() !== ""

  return (
    <div className="flex flex-col gap-4 p-4 pb-6">
      <h2 className="font-euclid text-[18px] font-bold text-[#040222]">Claim informant details</h2>

      {/* Informant type dropdown */}
      <div className="relative">
        <button
          type="button"
          onClick={() => setTypeOpen((v) => !v)}
          className="flex h-12 w-full items-center justify-between rounded-xl border border-[#e7e7f0] bg-white px-4 font-euclid text-[13px] transition-colors focus-visible:outline-none"
        >
          <span className={informantType ? "text-[#040222]" : "text-[#a0a0b2]"}>
            {informantType || "Informant type"}
          </span>
          <ChevronRight className={cn("size-4 text-[#5b5675] transition-transform", typeOpen && "rotate-90")} />
        </button>
        {typeOpen && (
          <div className="absolute left-0 top-[calc(100%+4px)] z-20 w-full rounded-xl border border-[#e7e7f0] bg-white py-1 shadow-md">
            {INFORMANT_TYPES.map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => { setInformantType(t); setTypeOpen(false) }}
                className="flex w-full items-center gap-2 px-4 py-2.5 text-left hover:bg-[#f8f7fc]"
              >
                <span className="font-euclid text-[13px] text-[#040222]">{t}</span>
                {informantType === t && <Check className="ml-auto size-4 text-[#7c47e1]" />}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Name */}
      <input
        type="text"
        placeholder="Informant Name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="h-12 rounded-xl border border-[#e7e7f0] bg-white px-4 font-euclid text-[13px] text-[#040222] outline-none placeholder:text-[#a0a0b2] focus:border-[#7c47e1]"
      />

      {/* Phone */}
      <div className="flex h-12 items-center gap-2 rounded-xl border border-[#e7e7f0] bg-white px-4 focus-within:border-[#7c47e1]">
        <span className="shrink-0 font-euclid text-[13px] font-semibold text-[#040222]">+91</span>
        <div className="h-4 w-px bg-[#e7e7f0]" />
        <input
          type="tel"
          placeholder="Informant Number"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
          className="flex-1 bg-transparent font-euclid text-[13px] text-[#040222] outline-none placeholder:text-[#a0a0b2]"
        />
      </div>

      {/* Comments */}
      <textarea
        placeholder="Informant comments"
        value={comments}
        onChange={(e) => setComments(e.target.value)}
        rows={5}
        className="resize-none rounded-xl border border-[#e7e7f0] bg-white px-4 py-3 font-euclid text-[13px] text-[#040222] outline-none placeholder:text-[#a0a0b2] focus:border-[#7c47e1]"
      />

      <ContinueBtn label="Make a claim" disabled={!isValid} onClick={onDone} />
    </div>
  )
}

// Step — success
function SuccessScreen() {
  return (
    <div className="flex flex-col items-center gap-4 px-1 pb-2 pt-10 text-center">
      <div className="flex size-[52px] shrink-0 animate-raise-claim-tick-pop items-center justify-center rounded-full bg-[#dcfce7] ring-[6px] ring-[#bbf7d0]">
        <Check className="size-7 text-[#15803d]" strokeWidth={2.75} />
      </div>
      <div className="animate-raise-claim-msg-fade space-y-2.5">
        <p className="font-euclid text-[13px] font-semibold leading-5 text-[#166534]">
          {RAISE_CLAIM_HANDLER_CALLBACK_MESSAGE}
        </p>
        <p className="font-euclid text-[12px] font-medium leading-5 text-[#36354c]">
          {RAISE_CLAIM_SETTLEMENT_TAT_MESSAGE}
        </p>
      </div>
    </div>
  )
}

// Network garages data
const NETWORK_GARAGES = [
  {
    id: "g1",
    name: "Maruti Suzuki Service (Chowgule Industries)",
    rating: null,
    area: "Katraj",
    tag: "Acko manages end to end",
  },
  {
    id: "g2",
    name: "Novel Car Care",
    rating: 4.6,
    area: "Kothrud",
    tag: "Acko manages end to end",
  },
  {
    id: "g3",
    name: "Maruti Suzuki ARENA (Chowgule Industries, Pune, Ambegaon)",
    rating: null,
    area: "Ambegaon Budruk",
    tag: "Acko manages end to end",
  },
]

function NetworkGaragesScreen({ onSelect }: { onSelect: () => void }) {
  return (
    <div className="flex flex-col gap-0 pb-4">
      {/* Header */}
      <div className="px-4 pb-3 pt-4">
        <h2 className="font-euclid text-[17px] font-extrabold leading-[1.25] text-[#040222]">
          Where do you want to get your<br />car repaired?
        </h2>
      </div>

      {/* Search + filter bar */}
      <div className="flex items-center gap-2 px-4 pb-3">
        <button
          type="button"
          className="flex size-9 shrink-0 items-center justify-center rounded-full border border-[#e7e7f0] bg-white"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
            <circle cx="6.5" cy="6.5" r="4.5" stroke="#5b5675" strokeWidth="1.5" />
            <path d="M10 10L13 13" stroke="#5b5675" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
        </button>
        <button
          type="button"
          className="flex items-center gap-2 rounded-full bg-[#040222] px-4 py-2.5"
        >
          <div className="flex size-4 items-center justify-center rounded-full border-2 border-white">
            <div className="size-1.5 rounded-full bg-white" />
          </div>
          <span className="font-euclid text-[13px] font-semibold text-white">Maruti garages for you</span>
        </button>
      </div>

      {/* Section label */}
      <p className="px-4 pb-2 font-euclid text-[11px] text-[#a0a0b2]">Premium garages near you</p>

      {/* Garage cards */}
      <div className="flex flex-col gap-3 px-3">
        {NETWORK_GARAGES.map((g) => (
          <div
            key={g.id}
            className="rounded-2xl border border-[#e7e7f0] bg-white p-4"
          >
            {/* ACKO Certified badge */}
            <div className="mb-3 inline-flex items-center gap-1.5 rounded-full bg-[#7c47e1] px-3 py-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                <path d="M6 1L7.5 4.5H11L8.5 6.5L9.5 10L6 8L2.5 10L3.5 6.5L1 4.5H4.5L6 1Z" fill="white" />
              </svg>
              <span className="font-euclid text-[10px] font-bold uppercase tracking-wide text-white">ACKO CERTIFIED</span>
            </div>

            <div className="flex items-start justify-between gap-3">
              <div className="flex flex-1 flex-col gap-1.5">
                <p className="font-euclid text-[13px] font-bold leading-5 text-[#040222]">{g.name}</p>

                {/* Rating + area */}
                <div className="flex items-center gap-1">
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden>
                    <path d="M6 1L7.24 4.27H10.72L7.98 6.18L9 9.5L6 7.5L3 9.5L4.02 6.18L1.28 4.27H4.76L6 1Z"
                      fill={g.rating ? "#f59e0b" : "none"} stroke={g.rating ? "#f59e0b" : "#a0a0b2"} strokeWidth="1" />
                  </svg>
                  <span className="font-euclid text-[11px] text-[#5b5675]">
                    {g.rating ? g.rating : "--"} • {g.area}
                  </span>
                </div>

                {/* Tag */}
                <div className="inline-flex w-fit items-center rounded-full bg-[#f0edfb] px-2.5 py-1">
                  <span className="font-euclid text-[10px] font-medium text-[#7c47e1]">{g.tag}</span>
                </div>

                {/* More details button */}
                <button
                  type="button"
                  onClick={onSelect}
                  className="mt-1 w-fit rounded-full border border-[#e7e7f0] bg-white px-3.5 py-1.5 font-euclid text-[12px] font-medium text-[#040222] hover:border-[#c5bde8]"
                >
                  More details
                </button>
              </div>

              {/* Garage photo placeholder */}
              <div className="size-[72px] shrink-0 overflow-hidden rounded-xl bg-[#e7e7f0] flex items-center justify-center">
                <span className="text-3xl">🏭</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

// ─── Main Component ───────────────────────────────────────────────────────────

export type RaiseFnolPanelVariant = "page" | "embedded"

export function RaiseFnolPanel({
  policy,
  onBack,
  variant = "page",
  onClaimSubmitted,
}: {
  policy: Policy
  onBack?: () => void
  variant?: RaiseFnolPanelVariant
  onClaimSubmitted?: () => void
}) {
  const [step, setStep] = useState<Step>("scenario")
  const [selectedScenario, setSelectedScenario] = useState<string | null>(null)
  const [_incidentText, setIncidentText] = useState("")
  const [showNcbSheet, setShowNcbSheet] = useState(false)
  const [moreDetails, setMoreDetails] = useState<MoreDetails>({
    injuries: null,
    when: null,
    customDate: "",
    driverPresent: null,
    carLocation: null,
    towing: null,
  })

  const scrollRef = useRef<HTMLDivElement>(null)

  // Scroll to top on step change
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" })
  }, [step])

  const planLine = [policy.name, policy.vehicle].filter(Boolean).join(" · ")
  const embedded = variant === "embedded"

  const stepHistory = useRef<Step[]>([])

  function goTo(next: Step) {
    stepHistory.current.push(step)
    setStep(next)
  }

  function goBack() {
    const prev = stepHistory.current.pop()
    if (prev) setStep(prev)
  }

  function renderStep() {
    switch (step) {
      case "scenario":
        return (
          <ScenarioScreen
            onSelect={(id) => {
              setSelectedScenario(id)
              goTo("process_info")
            }}
          />
        )
      case "process_info":
        return (
          <div className="relative">
            <ProcessInfoScreen onGetStarted={() => setShowNcbSheet(true)} />
            {showNcbSheet && (
              <NcbBottomSheet
                onReport={() => { setShowNcbSheet(false); goTo("incident_description") }}
                onDismiss={() => setShowNcbSheet(false)}
              />
            )}
          </div>
        )
      case "incident_description":
        return (
          <IncidentDescriptionScreen
            onContinue={(text) => {
              setIncidentText(text)
              goTo("more_details")
            }}
          />
        )
      case "more_details":
        return (
          <MoreDetailsScreen
            details={moreDetails}
            onChange={(d) => setMoreDetails((prev) => ({ ...prev, ...d }))}
            onContinue={() => goTo("upload_docs")}
          />
        )
      case "upload_docs":
        return <UploadDocsScreen onContinue={() => goTo("verifying")} />
      case "verifying":
        return <VerifyingScreen onDone={() => goTo("cashless_info")} />
      case "cashless_info":
        return <CashlessInfoScreen onProceed={() => goTo("garage_detail")} />
      case "garage_detail":
        return (
          <GarageDetailScreen
            onContinue={() => goTo("schedule_pickup")}
            onWantDifferent={() => goTo("network_garages")}
          />
        )
      case "network_garages":
        return <NetworkGaragesScreen onSelect={() => goTo("schedule_pickup")} />
      case "schedule_pickup":
        return (
          <SchedulePickupScreen
            onDone={() => goTo("claim_informant")}
          />
        )
      case "claim_informant":
        return (
          <ClaimInformantScreen
            onDone={() => {
              setStep("success")
              onClaimSubmitted?.()
            }}
          />
        )
      case "success":
        return <SuccessScreen />
    }
  }

  // Steps that show a back arrow at top
  const stepsWithBack: Step[] = ["incident_description", "more_details", "upload_docs", "garage_detail", "network_garages", "schedule_pickup", "claim_informant"]

  const phoneInner = (
    // Fixed height — phone size NEVER changes regardless of content
    <div
      ref={scrollRef}
      className="relative h-[580px] overflow-y-auto rounded-[22px] bg-white"
    >
      {stepsWithBack.includes(step) ? (
        <div className="flex flex-col">
          <div className="flex shrink-0 items-center border-b border-[#e7e7f0] px-3 py-2.5">
            <button
              type="button"
              onClick={goBack}
              className="flex size-6 items-center justify-center rounded-full text-[#5b5675] hover:bg-[#f0f0f6]"
            >
              <ArrowLeft className="size-4" />
            </button>
          </div>
          {renderStep()}
        </div>
      ) : (
        renderStep()
      )}
    </div>
  )

  if (embedded) {
    return (
      <div className="flex min-h-0 w-full flex-col">
        <div className="flex w-full justify-center">
          <div className="box-content w-full max-w-[907px] rounded-[15px] border-[0.5px] border-[#e0e0e8] bg-[#f8f7fd] px-4 py-6 sm:px-6 sm:py-8">
            <div className="mx-auto flex w-full max-w-[300px] flex-col items-center">
              <div className="relative w-full overflow-hidden rounded-[28px] border-2 border-[#e7e7f0] bg-[#f4f4f6] p-2 shadow-[0px_12px_40px_rgba(28,11,62,0.12)]">
                {phoneInner}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex w-full flex-col bg-white">
      <div className="flex shrink-0 flex-col gap-1 border-b border-[#e7e7f0] px-5 py-4">
        <div className="flex items-center gap-3">
          {onBack ? (
            <button
              type="button"
              onClick={onBack}
              className="flex size-9 shrink-0 items-center justify-center rounded-full text-[#5b5675] transition-colors hover:bg-[#f4f4f6] hover:text-[#36354c]"
              aria-label="Back"
            >
              <ArrowLeft className="size-5" aria-hidden />
            </button>
          ) : null}
          <h2 className="min-w-0 font-euclid text-[16px] font-medium leading-6 text-[#040222]">Raise a claim</h2>
        </div>
        {planLine ? (
          <p className={cn("font-euclid text-[14px] font-medium leading-5 text-[#5b5675]", onBack ? "pl-12" : "")}>
            {planLine}
          </p>
        ) : null}
      </div>

      <div className="flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto px-5 py-5">
        <div className="flex w-full justify-center">
          <div className="w-full max-w-[907px] rounded-[15px] border-[0.5px] border-[#e0e0e8] bg-[#f8f7fd] px-6 py-8 sm:px-9 sm:py-8">
            <div className="mx-auto flex w-full max-w-[300px] flex-col items-center">
              <div className="relative w-full overflow-hidden rounded-[28px] border-2 border-[#e7e7f0] bg-[#f4f4f6] p-2 shadow-[0px_12px_40px_rgba(28,11,62,0.12)]">
                {phoneInner}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
