import { useLayoutEffect, useRef, useState, useCallback, type CSSProperties, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { type LucideIcon, PanelsTopLeft, Settings2, ExternalLink } from "lucide-react"

import { cn } from "@/lib/utils"
import type { CrmTaskId } from "@/lib/crmTasks"

export type HelloRightRailTab = "workflows" | "power-tools" | "manual-mode"

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

/** Compact toggle card — Figma 9434:2204, aligned with manual-mode rail icon */
export function HelloManualModeToggleFlyout({
  isManualMode,
  onToggle,
  className,
  style,
}: HelloManualModeToggleFlyoutProps) {
  return (
    <div
      className={cn(
        "flex shrink-0 items-center gap-4 rounded-[10px] border border-[#e7e7f0] bg-white p-4 shadow-[0px_2px_4px_0px_rgba(0,0,0,0.06)]",
        className,
      )}
      style={style}
      data-figma-ref="9434:2204"
    >
      <span className="whitespace-nowrap font-euclid text-xs font-medium leading-[18px] text-[#040222]">
        {isManualMode ? "Switch to AI mode" : "Switch to manual mode"}
      </span>
      <label className="relative inline-flex shrink-0 cursor-pointer items-center">
        <input type="checkbox" checked={isManualMode} onChange={onToggle} className="peer sr-only" />
        <span
          className={cn(
            "h-6 w-10 rounded-full bg-[#e7e7f0] transition-colors after:absolute after:left-[2px] after:top-[2px] after:size-5 after:rounded-full after:bg-white after:transition-transform",
            "peer-checked:bg-[#7c47e1] peer-checked:after:translate-x-4",
            "peer-focus-visible:outline-none peer-focus-visible:ring-2 peer-focus-visible:ring-[#7c47e1]/30",
          )}
          aria-hidden
        />
      </label>
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
  className?: string
}

function RailIconButton({
  label,
  tooltip,
  isActive,
  onClick,
  children,
}: {
  label: string
  tooltip: string
  isActive: boolean
  onClick: () => void
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

  const showTooltip = isHovered && !isPressed

  return (
    <div className="relative flex items-center justify-center">
      <button
        type="button"
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); setIsPressed(false) }}
        aria-label={label}
        aria-pressed={isActive}
        className={cn(
          "relative flex size-10 items-center justify-center rounded-lg transition-colors",
          isActive ? "bg-[#f8f7fc] text-[#7c47e1]" : "text-[#5b5675] hover:bg-[#f8f7fc] hover:text-[#36354c]",
        )}
      >
        {children}
        {isActive ? (
          <span
            className="absolute left-0 top-1/2 h-6 w-[3px] -translate-y-1/2 rounded-r-full bg-[#7c47e1]"
            aria-hidden
          />
        ) : null}
      </button>
      {/* Tooltip — only shown on hover, dismissed immediately on click */}
      {showTooltip && (
        <div
          role="tooltip"
          className="pointer-events-none absolute right-[calc(100%+8px)] top-1/2 -translate-y-1/2 whitespace-nowrap rounded-md bg-[#040222] px-2.5 py-1.5 font-euclid text-xs font-medium text-white shadow-sm"
        >
          {tooltip}
        </div>
      )}
    </div>
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
  className,
}: HelloRightPanelIconRailProps) {
  const isInManualMode = manualMode?.isManualMode ?? false
  const workflowsVisuallyActive = activeTab === "workflows" && !isRailOnlyLayout && !isInManualMode

  const modeTooltip = isInManualMode ? "Switch to AI mode" : "Switch to manual mode"

  const modeToggleButton = (
    <RailIconButton
      label={modeTooltip}
      tooltip={modeTooltip}
      isActive={activeTab === "manual-mode"}
      onClick={() => onTabChange("manual-mode")}
    >
      <RailLucideIcon icon={Settings2} />
    </RailIconButton>
  )

  return (
    <div
      className={cn(
        "flex h-full shrink-0 flex-col items-center border-l border-[#e7e7f0] bg-white py-4",
        className,
      )}
      style={{ width: RAIL_WIDTH_PX }}
      data-figma-ref="hello-right-panel-rail"
    >
      <div className="flex flex-col items-center gap-2">
        {/* Workflows tab — hidden in manual mode */}
        {!isInManualMode && (
          <RailIconButton
            label="Workflows"
            tooltip="Open tabs"
            isActive={workflowsVisuallyActive}
            onClick={() => onTabChange("workflows")}
          >
            <RailLucideIcon icon={PanelsTopLeft} />
          </RailIconButton>
        )}

        {/* Power tools — always visible */}
        <RailIconButton
          label="Power tools"
          tooltip="Power tools"
          isActive={activeTab === "power-tools"}
          onClick={() => onTabChange("power-tools")}
        >
          <RailLucideIcon icon={ExternalLink} />
        </RailIconButton>

        {/* Mode toggle — always visible; shows confirmation flyout in both AI and manual mode */}
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
  const tools = [
    { id: "firefly" as const, label: "Firefly", iconSrc: "/icons/firefly.png" },
    { id: "freshdesk" as const, label: "Freshdesk", iconSrc: "/icons/freshdesk.png" },
    { id: "spectra" as const, label: "Spectra", iconSrc: "/icons/spectra.png" },
  ]

  return (
    <div className="flex h-full min-h-0 flex-col" data-figma-ref="9430:1683">
      <div className="shrink-0 border-b border-[#e7e7f0] px-4 py-4">
        <h3 className="font-euclid text-sm font-medium text-[#36354c]">Power tools</h3>
      </div>
      <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
        <div className="flex flex-col gap-3">
          {tools.map((tool) => (
            <button
              key={tool.id}
              type="button"
              onClick={() => onToolClick(tool.id)}
              className="flex w-full items-center gap-3 rounded-xl bg-[#f8f7fc] px-4 py-3 text-left transition-colors hover:bg-[#f0f0f6]"
            >
              <div className="flex size-[45px] shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#e7e7f0] bg-white">
                <img src={tool.iconSrc} alt="" className="size-full object-contain p-1" />
              </div>
              <span className="font-euclid text-sm font-medium text-[#040222]">{tool.label}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}

/** @deprecated Use flyout on {@link HelloRightPanelIconRail} — kept for re-exports */
export function HelloManualModeTogglePanel(props: HelloManualModeToggleFlyoutProps) {
  return <HelloManualModeToggleFlyout {...props} />
}
