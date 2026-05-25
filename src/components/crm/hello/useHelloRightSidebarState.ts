import { useCallback, useState } from "react"

export type HelloRightSidebarSection = "manual-actions" | "ai" | null

/**
 * Shared right-sidebar + manual/AI mode state for Hello CRM views (UC 4–8 migration).
 */
export function useHelloRightSidebarState() {
  const [rightSidebarCollapsed, setRightSidebarCollapsed] = useState(true)
  const [rightSidebarActiveSection, setRightSidebarActiveSection] =
    useState<HelloRightSidebarSection>(null)
  const [rightSidebarWidth, setRightSidebarWidth] = useState(() =>
    Math.round(window.innerWidth * 0.3),
  )
  const [isManualMode, setIsManualMode] = useState(false)
  const [showSkeletonLoader, setShowSkeletonLoader] = useState(false)
  const [manualActionTrigger, setManualActionTrigger] = useState<{
    actionId: string
    nonce: number
  } | null>(null)

  const openAiSidebar = useCallback(() => {
    setRightSidebarCollapsed(false)
    setRightSidebarActiveSection("ai")
  }, [])

  const openManualSidebar = useCallback(() => {
    setRightSidebarCollapsed(false)
    setRightSidebarActiveSection("manual-actions")
  }, [])

  const triggerManualAction = useCallback((actionId: string) => {
    setRightSidebarCollapsed(false)
    setRightSidebarActiveSection("manual-actions")
    setManualActionTrigger({ actionId, nonce: Date.now() })
  }, [])

  const handleRightSidebarToggle = useCallback(() => {
    setRightSidebarCollapsed((collapsed) => !collapsed)
  }, [])

  const handleRightSidebarSectionChange = useCallback((section: HelloRightSidebarSection) => {
    setRightSidebarActiveSection(section)
  }, [])

  const handleModeToggle = useCallback(() => {
    setShowSkeletonLoader(true)
    setRightSidebarCollapsed(false)
    const nextManual = !isManualMode
    window.setTimeout(() => {
      setIsManualMode(nextManual)
      setShowSkeletonLoader(false)
      setRightSidebarActiveSection(nextManual ? "manual-actions" : "ai")
    }, 2000)
  }, [isManualMode])

  return {
    rightSidebarCollapsed,
    rightSidebarActiveSection,
    rightSidebarWidth,
    isManualMode,
    showSkeletonLoader,
    manualActionTrigger,
    setRightSidebarWidth,
    openAiSidebar,
    openManualSidebar,
    triggerManualAction,
    handleRightSidebarToggle,
    handleRightSidebarSectionChange,
    handleModeToggle,
    setShowSkeletonLoader,
  }
}
