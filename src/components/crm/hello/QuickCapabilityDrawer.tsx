/**
 * QuickCapabilityDrawer — shared quick-actions drawer for all Hello views.
 *
 * Purely presentational: all state (open/close, highlight, items) is managed
 * by the parent. The drawer floats above the composer search bar using
 * `position: absolute; bottom: 100%`.
 */
import type { RefObject } from "react"
import { Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

export interface QuickDrawerItem {
  id: string
  label: string
  description?: string
  icon?: React.ReactNode
}

export interface QuickCapabilityDrawerProps {
  /** Forwarded ref — used by the parent for click-outside detection. */
  containerRef: RefObject<HTMLDivElement>
  items: QuickDrawerItem[]
  highlightIndex: number
  onHighlightChange: (i: number) => void
  onSelect: (item: QuickDrawerItem) => void
}

export function QuickCapabilityDrawer({
  containerRef,
  items,
  highlightIndex,
  onHighlightChange,
  onSelect,
}: QuickCapabilityDrawerProps) {
  if (items.length === 0) return null

  return (
    <div
      ref={containerRef}
      className="absolute bottom-full left-10 right-10 z-50 mb-1 overflow-hidden rounded-xl border border-[#e7e7f0] bg-white shadow-[0px_-4px_24px_rgba(54,53,76,0.12)]"
      role="listbox"
      aria-label="Available actions"
    >
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-[#f0f0f6] px-4 py-2">
        <Sparkles className="size-3.5 shrink-0 text-[#7c47e1]" aria-hidden />
        <p className="font-euclid text-[11px] font-semibold uppercase tracking-wide text-[#9c9aaf]">
          Quick Actions
        </p>
      </div>

      {/* Items */}
      <div className="max-h-[260px] overflow-y-auto py-1">
        {items.map((item, i) => (
          <button
            key={item.id}
            type="button"
            role="option"
            aria-selected={i === highlightIndex}
            onMouseEnter={() => onHighlightChange(i)}
            onClick={() => onSelect(item)}
            className={cn(
              "flex w-full items-center gap-3 px-4 py-2.5 text-left transition-colors",
              i === highlightIndex ? "bg-[#f5f3fc]" : "hover:bg-[#fafafa]",
            )}
          >
            {item.icon != null && (
              <span
                className={cn(
                  "flex size-8 shrink-0 items-center justify-center rounded-lg",
                  i === highlightIndex
                    ? "bg-[#7c47e1] text-white"
                    : "bg-[#f5f3fc] text-[#7c47e1]",
                )}
              >
                {item.icon}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="block font-euclid text-[13px] font-semibold leading-5 text-[#040222]">
                {item.label}
              </span>
              {item.description && (
                <span className="block font-euclid text-[11px] leading-4 text-[#5b5675]">
                  {item.description}
                </span>
              )}
            </span>
            {i === highlightIndex && (
              <span className="shrink-0 rounded border border-[#e7e7f0] bg-white px-1.5 py-0.5 font-euclid text-[10px] text-[#9c9aaf]">
                ↵
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Footer */}
      <div className="border-t border-[#f0f0f6] px-4 py-2">
        <p className="font-euclid text-[10px] text-[#c5c2d6]">
          ↑↓ navigate · ↵ select · Esc dismiss
        </p>
      </div>
    </div>
  )
}
