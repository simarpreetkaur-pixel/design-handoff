import { useLayoutEffect, useRef, useState, useCallback, type CSSProperties, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { type LucideIcon, Bot, PanelsTopLeft, Settings2 } from "lucide-react"

import { cn } from "@/lib/utils"
import { asset } from "@/lib/assets"
import type { CrmTaskId } from "@/lib/crmTasks"

export type HelloRightRailTab = "workflows" | "power-tools" | "manual-mode" | "similar-cases" | "existing-tickets"

const RAIL_WIDTH_PX = 52
/** Shared Lucide rail icon sizing — keeps all tabs visually consistent. */
const RAIL_ICON_CLASS = "size-5 shrink-0"
const RAIL_ICON_STROKE = 1.75

function RailLucideIcon({ icon: Icon }: { icon: LucideIcon }) {
  return <Icon className={RAIL_ICON_CLASS} strokeWidth={RAIL_ICON_STROKE} aria-hidden />
}

/** Crossed wrench + screwdriver — Lucide stroke style (Figma 9559:7542). */
function RailPowerToolsIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={RAIL_ICON_STROKE}
      strokeLinecap="round"
      strokeLinejoin="round"
      className={RAIL_ICON_CLASS}
      aria-hidden
    >
      {/* Lucide wrench path */}
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.106-3.105c.32-.322.863-.22.983.218a6 6 0 0 1-8.259 7.057l-7.91 7.91a1 1 0 0 1-2.999-3l7.91-7.91a6 6 0 0 1 7.057-8.259c.438.12.54.662.219.984z" />
      {/* Screwdriver crossing diagonally */}
      <path d="M18 4l2 2M20 6l-9 9M11 15l-2 2-3 1 1-3 2-2 2-2" />
    </svg>
  )
}

type HelloManualModeToggleFlyoutProps = {
  isManualMode: boolean
  onToggle: () => void
  className?: string
  style?: CSSProperties
}

/** Compact mode switcher flyout — shows current mode with a "Switch" button */
export function HelloManualModeToggleFlyout({
  isManualMode,
  onToggle,
  className,
  style,
}: HelloManualModeToggleFlyoutProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center justify-between gap-4 rounded-[10px] border border-[#e7e7f0] bg-white px-4 py-3 shadow-[0px_4px_12px_rgba(0,0,0,0.10)]",
        className,
      )}
      style={style}
      data-figma-ref="9434:2204"
    >
      <span className="whitespace-nowrap font-euclid text-[13px] font-medium text-[#040222]">
        {isManualMode ? "Switch to AI mode" : "Switch to manual mode"}
      </span>
      <button
        type="button"
        onClick={onToggle}
        className="shrink-0 rounded-[6px] bg-[#7c47e1] px-3 py-1.5 font-euclid text-[12px] font-semibold text-white transition-colors hover:bg-[#6b3ecf]"
      >
        Switch
      </button>
    </div>
  )
}

type HelloRightPanelIconRailProps = {
  activeTab: HelloRightRailTab
  onTabChange: (tab: HelloRightRailTab) => void
  manualMode?: {
    isManualMode: boolean
    onToggle: () => void
  }
  /**
   * When only the icon strip is visible (collapsed sidebar or manual-mode tab),
   * `activeRailTab` may still be `"workflows"` by default — do not show Workflows as selected.
   */
  isRailOnlyLayout?: boolean
  /** When true, renders a short text label below each icon (Figma UC6/UC7 design). */
  showLabels?: boolean
  /** Show red dot on "Similar cases" tab — indicates content is available. */
  hasSimilarCases?: boolean
  /** Show red dot on "Existing tickets" tab — indicates content is available. */
  hasExistingTickets?: boolean
  /** Hide the "Existing tickets" rail button entirely (e.g. Raise a Claim UC). */
  hideExistingTickets?: boolean
  /** Hide the "Similar cases" rail button entirely (e.g. Raise a Claim UC). */
  hideSimilarCases?: boolean
  className?: string
}

function RailIconButton({
  label,
  tooltip,
  visibleLabel,
  isActive,
  onClick,
  showBadge,
  children,
}: {
  label: string
  tooltip: string
  visibleLabel?: string
  isActive: boolean
  onClick: () => void
  /** When true, renders the red availability dot (Figma 224:5583 / 224:5589). */
  showBadge?: boolean
  children: ReactNode
}) {
  const [isHovered, setIsHovered] = useState(false)
  const [isPressed, setIsPressed] = useState(false)

  const handleClick = useCallback(() => {
    setIsPressed(true)
    setIsHovered(false)
    onClick()
    // Reset after a short delay so tooltip doesn't flash back immediately
    setTimeout(() => setIsPressed(false), 300)
  }, [onClick])

  const showTooltip = isHovered && !isPressed && !visibleLabel

  return (
    // Single <button> wraps both icon and label so the whole area is clickable
    <button
      type="button"
      onClick={handleClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
      aria-label={label}
      aria-pressed={isActive}
      className="relative flex flex-col items-center gap-0.5 rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-[#7c47e1]/40"
    >
      {/* Icon circle */}
      <div
        className={cn(
          "relative flex size-10 items-center justify-center rounded-lg transition-colors",
          isActive ? "bg-[#f8f7fc] text-[#7c47e1]" : "text-[#5b5675] hover:bg-[#f8f7fc] hover:text-[#36354c]",
        )}
      >
        {children}
        {/* Red availability dot — Figma 224:5583 / 224:5589 */}
        {showBadge && (
          <span className="absolute right-1.5 top-1.5 size-2 rounded-full bg-[#e05752] ring-1 ring-white" />
        )}
      </div>

      {/* Visible label below icon */}
      {visibleLabel && (
        <span
          className={cn(
            "w-[39px] break-words text-center font-euclid text-[10px] leading-[13px]",
            isActive ? "text-[#7c47e1]" : "text-[#8b87a3]",
          )}
        >
          {visibleLabel}
        </span>
      )}

      {/* Tooltip — only shown on hover when no persistent label */}
      {showTooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#040222] px-2.5 py-1.5 font-euclid text-xs font-medium text-white shadow-sm"
        >
          {tooltip}
        </div>
      )}
    </button>
  )
}

const MANUAL_FLYOUT_GAP_PX = 8

function ManualModeFlyoutAnchor({
  show,
  manualMode,
  children,
}: {
  show: boolean
  manualMode: { isManualMode: boolean; onToggle: () => void }
  children: ReactNode
}) {
  const anchorRef = useRef<HTMLDivElement>(null)
  const [flyoutPos, setFlyoutPos] = useState<{ top: number; left: number } | null>(null)

  useLayoutEffect(() => {
    if (!show) {
      setFlyoutPos(null)
      return
    }

    const updatePosition = () => {
      const el = anchorRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      // Walk up to find the nearest positioned ancestor that may have been transformed,
      // then fall back to the rail's own left boundary for accurate screen coords.
      // We use the rail container's left edge (which equals window.innerWidth minus rail width)
      // to ensure the flyout always hugs the rail regardless of ancestor scroll/clip state.
      const railLeft = window.innerWidth - RAIL_WIDTH_PX
      setFlyoutPos({
        top: rect.top + rect.height / 2,
        left: railLeft - MANUAL_FLYOUT_GAP_PX,
      })
    }

    updatePosition()
    window.addEventListener("resize", updatePosition)
    window.addEventListener("scroll", updatePosition, true)
    return () => {
      window.removeEventListener("resize", updatePosition)
      window.removeEventListener("scroll", updatePosition, true)
    }
  }, [show])

  return (
    <div ref={anchorRef} className="relative flex items-center justify-center">
      {show && flyoutPos
        ? createPortal(
            <HelloManualModeToggleFlyout
              isManualMode={manualMode.isManualMode}
              onToggle={manualMode.onToggle}
              // -translate-x-full places the flyout's right edge at `left`, so it sits just
              // to the left of the rail with an 8 px gap.
              className="fixed z-[200] -translate-x-full -translate-y-1/2"
              style={{ top: flyoutPos.top, left: flyoutPos.left }}
            />,
            document.body,
          )
        : null}
      {children}
    </div>
  )
}

/** Google Workspace–style vertical icon rail (Figma 9415:23488). */
export function HelloRightPanelIconRail({
  activeTab,
  onTabChange,
  manualMode,
  isRailOnlyLayout = false,
  showLabels = false,
  hasSimilarCases = false,
  hasExistingTickets = false,
  hideExistingTickets = false,
  hideSimilarCases = false,
  className,
}: HelloRightPanelIconRailProps) {
  const isInManualMode = manualMode?.isManualMode ?? false
  const workflowsVisuallyActive = activeTab === "workflows" && !isRailOnlyLayout && !isInManualMode

  const modeLabel   = isInManualMode ? "AI mode"           : "Manual mode"
  const modeTooltip = isInManualMode ? "Switch to AI mode" : "Switch to manual mode"

  const modeToggleButton = (
    <RailIconButton
      label={modeTooltip}
      tooltip={modeTooltip}
      visibleLabel={showLabels ? modeLabel : undefined}
      isActive={activeTab === "manual-mode"}
      onClick={() => onTabChange("manual-mode")}
    >
      {showLabels ? (
        isInManualMode
          ? <RailLucideIcon icon={Bot} />               /* "back to AI" — bot icon */
          : <img src={asset("/icons/rail-manual-mode.png")} alt="" className={RAIL_ICON_CLASS} />
      ) : (
        isInManualMode
          ? <RailLucideIcon icon={Bot} />
          : <RailLucideIcon icon={Settings2} />
      )}
    </RailIconButton>
  )

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col items-center border-l border-[#e7e7f0] bg-white py-4",
        className,
      )}
      style={{ width: showLabels ? 64 : RAIL_WIDTH_PX }}
      data-figma-ref="hello-right-panel-rail"
    >
      <div className="flex flex-col items-center gap-3">
        {/* 1. All tabs — hidden in manual mode */}
        {!isInManualMode && (
          <RailIconButton
            label="Workflows"
            tooltip="Open tabs"
            visibleLabel={showLabels ? "All tabs" : undefined}
            isActive={workflowsVisuallyActive}
            onClick={() => onTabChange("workflows")}
          >
            {showLabels ? (
              <img src={asset("/icons/rail-all-tabs.png")} alt="" className={RAIL_ICON_CLASS} />
            ) : (
              <RailLucideIcon icon={PanelsTopLeft} />
            )}
          </RailIconButton>
        )}

        {/* 2. Existing tickets — hidden when hideExistingTickets is true */}
        {!hideExistingTickets && (
          <RailIconButton
            label="Existing tickets"
            tooltip="Existing tickets"
            visibleLabel={showLabels ? "Existing tickets" : undefined}
            isActive={activeTab === "existing-tickets"}
            onClick={() => onTabChange("existing-tickets")}
            showBadge={hasExistingTickets}
          >
            <img src={asset("/icons/rail-existing-tickets.png")} alt="" className={RAIL_ICON_CLASS} />
          </RailIconButton>
        )}

        {/* 3. Similar cases — hidden when hideSimilarCases is true */}
        {!hideSimilarCases && (
          <RailIconButton
            label="Similar cases"
            tooltip="Similar cases"
            visibleLabel={showLabels ? "Similar cases" : undefined}
            isActive={activeTab === "similar-cases"}
            onClick={() => onTabChange("similar-cases")}
            showBadge={hasSimilarCases}
          >
            <img src={asset("/icons/rail-similar-cases.png")} alt="" className={RAIL_ICON_CLASS} />
          </RailIconButton>
        )}

        {/* 4. Power tools */}
        <RailIconButton
          label="Power tools"
          tooltip="Power tools"
          visibleLabel={showLabels ? "Power tools" : undefined}
          isActive={activeTab === "power-tools"}
          onClick={() => onTabChange("power-tools")}
        >
          {showLabels ? (
            <img src={asset("/icons/rail-power-tools.png")} alt="" className={RAIL_ICON_CLASS} />
          ) : (
            <RailPowerToolsIcon />
          )}
        </RailIconButton>

        {/* 5. Manual mode — always last */}
        {manualMode ? (
          <ManualModeFlyoutAnchor show={activeTab === "manual-mode"} manualMode={manualMode}>
            {modeToggleButton}
          </ManualModeFlyoutAnchor>
        ) : (
          modeToggleButton
        )}
      </div>
    </div>
  )
}

export const HELLO_RIGHT_PANEL_RAIL_WIDTH = RAIL_WIDTH_PX

type HelloPowerToolsPanelProps = {
  onToolClick: (toolId: CrmTaskId) => void
}

/** Power tools list — Figma 9430:1683 */
export function HelloPowerToolsPanel({ onToolClick }: HelloPowerToolsPanelProps) {
  const autoTools: { id: CrmTaskId; label: string; url: string }[] = [
    { id: "advisor-ui", label: "Advisor UI", url: "" },
    { id: "network-garages", label: "Network Garages", url: "" },
    { id: "fnol", label: "FNOL", url: "" },
    { id: "firefly", label: "Firefly", url: "https://firefly.acko.com" },
  ]
  const healthTools: { id: CrmTaskId; label: string; url: string }[] = [
    { id: "spectra", label: "Spectra", url: "https://spectra.acko.com" },
    { id: "rap-tool", label: "RAP tool", url: "" },
  ]

  function ToolRow({ id, label, url }: { id: CrmTaskId; label: string; url: string }) {
    return (
      <button
        key={id}
        type="button"
        onClick={() => {
          window.open(url || "", "_blank", "noopener,noreferrer")
          onToolClick(id)
        }}
        className="group flex w-full items-center gap-2 rounded-xl border border-[#e7e7f0] bg-white px-3 py-2.5 text-left transition-colors hover:border-[#c9b8f5] hover:bg-[#ede9f9]"
      >
        {/* Placeholder icon */}
        <div className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-[#ede9f9] transition-colors group-hover:bg-white">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
            <rect x="2" y="2" width="5" height="5" rx="1.5" fill="#7c47e1" />
            <rect x="9" y="2" width="5" height="5" rx="1.5" fill="#7c47e1" opacity="0.5" />
            <rect x="2" y="9" width="5" height="5" rx="1.5" fill="#7c47e1" opacity="0.5" />
            <rect x="9" y="9" width="5" height="5" rx="1.5" fill="#7c47e1" opacity="0.3" />
          </svg>
        </div>
        <span className="min-w-0 flex-1 whitespace-nowrap font-euclid text-[13px] font-medium text-[#040222]">{label}</span>
        {/* External link indicator */}
        <svg
          width="14"
          height="14"
          viewBox="0 0 14 14"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          className="shrink-0 text-[#b0adc5] transition-colors group-hover:text-[#7c47e1]"
          aria-hidden="true"
        >
          <path d="M2.5 11.5L11.5 2.5M11.5 2.5H6.5M11.5 2.5V7.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
    )
  }

  function SectionLabel({ children }: { children: ReactNode }) {
    return (
      <p className="px-1 font-euclid text-[11px] font-semibold uppercase tracking-wider text-[#8b87a3]">
        {children}
      </p>
    )
  }

  return (
    <div className="flex h-full min-h-0 flex-col" data-figma-ref="9430:1683">
      <div className="shrink-0 border-b border-[#e7e7f0] px-4 py-4">
        <h3 className="font-euclid text-sm font-medium text-[#36354c]">Power tools</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-3 py-4">
        <div className="flex flex-col gap-5">
          {/* Auto section */}
          <div className="flex flex-col gap-2">
            <SectionLabel>Auto</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {autoTools.map((t) => (
                <ToolRow key={t.id} {...t} />
              ))}
            </div>
          </div>
          {/* Health section */}
          <div className="flex flex-col gap-2">
            <SectionLabel>Health</SectionLabel>
            <div className="flex flex-col gap-1.5">
              {healthTools.map((t) => (
                <ToolRow key={t.id} {...t} />
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

/** @deprecated Use flyout on {@link HelloRightPanelIconRail} — kept for re-exports */
export function HelloManualModeTogglePanel(props: HelloManualModeToggleFlyoutProps) {
  return <HelloManualModeToggleFlyout {...props} />
}

/** Empty-state panel shown when a rail tab has no data for the current use case. */
export function HelloEmptyRailPanel({ title, message }: { title: string; message: string }) {
  return (
    <div className="flex h-full min-h-0 flex-col">
      <div className="shrink-0 border-b border-[#e7e7f0] px-4 py-4">
        <h3 className="font-euclid text-sm font-medium text-[#36354c]">{title}</h3>
      </div>
      <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
        <div className="flex size-12 items-center justify-center rounded-full bg-[#f4f4f6]">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#8b87a3" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8" /><path d="m21 21-4.35-4.35" />
          </svg>
        </div>
        <p className="font-euclid text-[13px] leading-5 text-[#8b87a3]">{message}</p>
      </div>
    </div>
  )
}
