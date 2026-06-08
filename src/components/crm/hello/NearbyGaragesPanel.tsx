import { useState, useEffect, useCallback, useRef } from "react"
import { Star, Calendar, MapPin } from "lucide-react"
import { cn } from "@/lib/utils"
import { Switch } from "@/components/ui/switch"

// ─── Mock data ────────────────────────────────────────────────────────────────

interface Garage {
  id: string
  name: string
  rating: number
  reviewCount: number
  area: string
  tags: string[]
  pickupTime: string
  isNetworkGarage: boolean
  imageUrl?: string
}

const ALL_GARAGES: Garage[] = [
  {
    id: "1",
    name: "Arodhana Garage",
    rating: 4.5,
    reviewCount: 900,
    area: "Whitefield",
    tags: ["Fast repairs", "1-year warranty"],
    pickupTime: "Today, 3 PM",
    isNetworkGarage: true,
  },
  {
    id: "2",
    name: "Speedfix Auto Works",
    rating: 4.2,
    reviewCount: 540,
    area: "Koramangala",
    tags: ["Multi-brand", "AC service"],
    pickupTime: "Tomorrow, 10 AM",
    isNetworkGarage: true,
  },
  {
    id: "3",
    name: "CarPoint Service Center",
    rating: 3.8,
    reviewCount: 210,
    area: "Indiranagar",
    tags: ["Quick service"],
    pickupTime: "Today, 6 PM",
    isNetworkGarage: false,
  },
  {
    id: "4",
    name: "Elite Motors",
    rating: 4.7,
    reviewCount: 1200,
    area: "HSR Layout",
    tags: ["Premium service", "Loaner car"],
    pickupTime: "Today, 2 PM",
    isNetworkGarage: true,
  },
  {
    id: "5",
    name: "QuickFix Garage",
    rating: 3.5,
    reviewCount: 89,
    area: "BTM Layout",
    tags: ["Budget friendly"],
    pickupTime: "Tomorrow, 12 PM",
    isNetworkGarage: false,
  },
]

// ─── Skeleton card ─────────────────────────────────────────────────────────────

function GarageCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-[#e7e7f0] bg-white p-4">
      <div className="mb-3 h-5 w-28 rounded bg-[#f0f0f6]" />
      <div className="mb-2 flex gap-4">
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-[#f0f0f6]" />
          <div className="h-3 w-24 rounded bg-[#f0f0f6]" />
          <div className="flex gap-2">
            <div className="h-5 w-16 rounded-lg bg-[#f0f0f6]" />
            <div className="h-5 w-20 rounded-lg bg-[#f0f0f6]" />
          </div>
        </div>
        <div className="h-[72px] w-[72px] shrink-0 rounded-xl bg-[#f0f0f6]" />
      </div>
      <div className="h-5 w-44 rounded-lg bg-[#f0f0f6]" />
    </div>
  )
}

// ─── Garage card ───────────────────────────────────────────────────────────────

function GarageCard({ garage }: { garage: Garage }) {
  return (
    <div className="rounded-xl border border-[#e7e7f0] bg-white p-4 flex flex-col gap-3">
      {/* ACKO Certified badge */}
      {garage.isNetworkGarage && (
        <div className="flex">
          <div className="flex items-center gap-1.5 rounded-full bg-[#08864b] pl-2 pr-3 py-1">
            <svg width="16" height="12" viewBox="0 0 16 12" fill="none" aria-hidden>
              <path d="M8 0L10.5 4.5H15L11.5 7.5L13 12L8 9L3 12L4.5 7.5L1 4.5H5.5L8 0Z" fill="white" />
            </svg>
            <span className="font-euclid text-[10px] font-semibold tracking-[-0.1px] text-white">
              ACKO CERTIFIED
            </span>
          </div>
        </div>
      )}

      {/* Name + image row */}
      <div className="flex items-start gap-4">
        <div className="flex flex-1 min-w-0 flex-col gap-1">
          <p className="font-euclid text-[14px] font-medium leading-5 text-[#040222]">
            {garage.name}
          </p>
          {/* Rating */}
          <div className="flex items-center gap-1">
            <Star className="size-3 fill-[#f5a623] text-[#f5a623]" aria-hidden />
            <span className="font-euclid text-[12px] leading-[18px] text-[#5b5675]">
              {garage.rating} ({garage.reviewCount.toLocaleString()}) • {garage.area}
            </span>
          </div>
          {/* Tags */}
          <div className="flex flex-wrap gap-2 mt-0.5">
            {garage.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-lg bg-[#f5f0ff] px-2 py-1 font-euclid text-[12px] leading-[18px] text-[#451999]"
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
        {/* Garage image placeholder */}
        <div className="size-[72px] shrink-0 rounded-xl border border-[#e7e7f0] bg-[#f8f7fc] flex items-center justify-center overflow-hidden">
          <MapPin className="size-6 text-[#9c9aaf]" aria-hidden />
        </div>
      </div>

      {/* Pickup availability */}
      <div className="flex items-center gap-2 rounded-lg bg-[#e2f5ff] px-3 py-1">
        <Calendar className="size-4 shrink-0 text-[#5b5675]" aria-hidden />
        <p className="font-euclid text-[12px] leading-[18px]">
          <span className="text-[#5b5675]">Pickup available: </span>
          <span className="font-medium text-[#040222]">{garage.pickupTime}</span>
        </p>
      </div>

      {/* More details */}
      <div>
        <button
          type="button"
          className="rounded-full border border-[#757575] px-2 py-0.5 font-euclid text-[12px] leading-[18px] text-[#757575] transition-colors hover:border-[#36354c] hover:text-[#36354c]"
        >
          More details
        </button>
      </div>
    </div>
  )
}

// ─── Range slider ──────────────────────────────────────────────────────────────

/**
 * The fill, thumb and label are driven directly by a CSS custom property
 * (--pct) written on every `input` event (synchronous, pointer-move granularity)
 * so the track fill follows the thumb with zero React render lag.
 */
function RadiusSlider({
  value,
  onChange,
}: {
  value: number
  onChange: (v: number) => void
}) {
  const min = 1
  const max = 25
  const rootRef = useRef<HTMLDivElement>(null)

  // Keep the CSS custom property in sync whenever the committed value changes
  // (covers programmatic resets, not just drag).
  useEffect(() => {
    const pct = ((value - min) / (max - min)) * 100
    rootRef.current?.style.setProperty("--pct", `${pct}`)
  }, [value])

  const handleInput = (e: React.FormEvent<HTMLInputElement>) => {
    const v = Number((e.target as HTMLInputElement).value)
    const pct = ((v - min) / (max - min)) * 100
    // Write the CSS var synchronously — no React re-render needed for visuals
    rootRef.current?.style.setProperty("--pct", `${pct}`)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(e.target.value))
  }

  const initPct = ((value - min) / (max - min)) * 100

  return (
    <div
      ref={rootRef}
      className="w-full"
      // CSS custom properties consumed by the visual child elements
      style={{ "--pct": `${initPct}` } as React.CSSProperties}
    >
      <div className="relative h-2">
        {/* Track */}
        <div className="absolute inset-y-0 left-0 right-0 rounded-full bg-[#f0f0f6]" />
        {/* Fill — width driven by CSS var, transition makes it visually smooth */}
        <div
          className="absolute inset-y-0 left-0 rounded-full bg-[#7c47e1]"
          style={{ width: "calc(var(--pct) * 1%)" }}
        />
        {/* Native range — transparent so our custom track/thumb show through */}
        <input
          type="range"
          min={min}
          max={max}
          defaultValue={value}
          onInput={handleInput}
          onChange={handleChange}
          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          aria-label="Radius in kilometres"
          style={{ touchAction: "none" }}
        />
        {/* Custom thumb */}
        <div
          className="pointer-events-none absolute top-1/2 size-3 -translate-y-1/2 rounded-full border border-[#e7e7f0] bg-white shadow-[0px_1px_2px_rgba(0,0,0,0.25)]"
          style={{
            left: "calc(var(--pct) * 1%)",
            transform: "translate(-50%, -50%)",
          }}
          aria-hidden
        />
      </div>
      {/* Value label — position mirrors thumb */}
      <div
        className="pointer-events-none mt-2 flex"
        style={{ paddingLeft: "calc(var(--pct) * 1% - 10px)" }}
      >
        <span className="rounded bg-[#7c47e1] px-1.5 py-0.5 font-euclid text-[11px] font-medium text-white">
          {value} km
        </span>
      </div>
    </div>
  )
}


// ─── Main panel ───────────────────────────────────────────────────────────────

export interface NearbyGaragesPanelProps {
  className?: string
}

export function NearbyGaragesPanel({ className }: NearbyGaragesPanelProps) {
  const [pinCode, setPinCode] = useState("")
  const [radius, setRadius] = useState(5)
  const [networkOnly, setNetworkOnly] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [garages, setGarages] = useState<Garage[]>(() =>
    ALL_GARAGES.filter((g) => g.isNetworkGarage),
  )

  // Any filter change triggers 2-second skeleton reload
  const runFilter = useCallback(
    (nextNetworkOnly: boolean) => {
      setIsLoading(true)
      window.setTimeout(() => {
        setGarages(
          ALL_GARAGES.filter((g) => (nextNetworkOnly ? g.isNetworkGarage : true)),
        )
        setIsLoading(false)
      }, 2000)
    },
    [],
  )

  // Debounce pin + radius changes (500 ms) then trigger load
  useEffect(() => {
    if (!pinCode && radius === 5) return // skip initial mount
    setIsLoading(true)
    const t = window.setTimeout(() => {
      setGarages(
        ALL_GARAGES.filter((g) => (networkOnly ? g.isNetworkGarage : true)),
      )
      setIsLoading(false)
    }, 2000)
    return () => window.clearTimeout(t)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [pinCode, radius])

  const handleToggle = (v: boolean) => {
    setNetworkOnly(v)
    runFilter(v)
  }

  return (
    <div className={cn("flex flex-col gap-4 font-euclid", className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="font-euclid text-[14px] font-semibold leading-5 text-[#040222]">
          Nearby Garages
        </h3>
      </div>

      {/* Filters */}
      <div className="flex flex-col gap-4 rounded-xl bg-[#f8f7fc] p-4">
        {/* PIN code */}
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="nearby-pin"
            className="font-euclid text-[12px] font-medium leading-[18px] text-[#36354c]"
          >
            Enter PIN code
          </label>
          <input
            id="nearby-pin"
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={pinCode}
            onChange={(e) => setPinCode(e.target.value.replace(/\D/g, ""))}
            placeholder="Enter customer's PIN code"
            className="w-full rounded-md border border-[#e5e5e5] bg-white px-3 py-2.5 font-euclid text-[14px] leading-5 text-[#36354c] outline-none placeholder:text-[#9c9aaf] focus:border-[#7c47e1] focus:ring-1 focus:ring-[#7c47e1]/20"
          />
        </div>

        {/* Radius */}
        <div className="flex flex-col gap-3">
          <span className="font-euclid text-[12px] font-medium leading-[18px] text-[#36354c]">
            Select radius range (kms)
          </span>
          <RadiusSlider value={radius} onChange={setRadius} />
        </div>

        {/* Network only toggle */}
        <label className="flex cursor-pointer items-center gap-3">
          <span className="font-euclid text-[12px] font-medium leading-[18px] text-[#36354c]">
            Show network garages only
          </span>
          <Switch
            checked={networkOnly}
            onCheckedChange={handleToggle}
          />
        </label>
      </div>

      {/* Results */}
      <div className="flex flex-col gap-3">
        {isLoading ? (
          <>
            <GarageCardSkeleton />
            <GarageCardSkeleton />
            <GarageCardSkeleton />
          </>
        ) : garages.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-10 text-center">
            <MapPin className="mb-3 size-8 text-[#9c9aaf]" aria-hidden />
            <p className="font-euclid text-[14px] text-[#5b5675]">
              No garages found in this area.
            </p>
            <p className="mt-1 font-euclid text-[12px] text-[#9c9aaf]">
              Try increasing the radius or disabling the network-only filter.
            </p>
          </div>
        ) : (
          garages.map((garage) => <GarageCard key={garage.id} garage={garage} />)
        )}
      </div>
    </div>
  )
}
