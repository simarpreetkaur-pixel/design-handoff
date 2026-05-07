import { type RefObject, useEffect, useRef } from "react"
import { X } from "lucide-react"

import { EndorsementAdvisorPanel } from "@/components/crm/EndorsementAdvisorPanel"
import { helloEditWorkflowPaneTitle } from "@/components/crm/hello/helloEditPolicyCopy"
import { Button } from "@/components/ui/button"
import type { Policy } from "@/types/crm"
import { scrollElementWithinContainer } from "@/lib/utils"

export type EditPolicyWorkflowPanelProps = {
  policy: Policy
  scrollContainerRef?: RefObject<HTMLElement | null>
  onClose?: () => void
}

function vehicleLabel(policy: Policy): string {
  const v = policy.vehicle?.trim()
  if (v) return v
  const n = policy.name?.trim()
  if (n) return n
  const p = policy.planDisplayName?.trim()
  if (p) return p
  return policy.type || "Policy"
}

/** Scroll policy field list into view when panel mounts (Hello split reveal). */
const WORKFLOW_BODY_SCROLL_TOP_MS = 120

export function EditPolicyWorkflowPanel({
  policy,
  scrollContainerRef,
  onClose,
}: EditPolicyWorkflowPanelProps) {
  const bodyRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const container = scrollContainerRef?.current
    const target = bodyRef.current
    if (!container || !target) return
    const id = window.setTimeout(() => {
      scrollElementWithinContainer(container, target, {
        behavior: "smooth",
        topPadding: 8,
      })
    }, WORKFLOW_BODY_SCROLL_TOP_MS)
    return () => window.clearTimeout(id)
  }, [scrollContainerRef, policy.id])

  return (
    <div className="flex min-h-0 w-full flex-col gap-4">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <h2 className="min-w-0 flex-1 font-euclid text-[16px] font-semibold leading-6 text-[#040222]">
          {helloEditWorkflowPaneTitle(vehicleLabel(policy))}
        </h2>
        {onClose ? (
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 text-[#5b5675] hover:bg-[#f5f3fc] hover:text-[#36354c]"
            onClick={onClose}
            aria-label="Close workflow panel"
          >
            <X className="size-4" strokeWidth={2} />
          </Button>
        ) : null}
      </div>

      <div
        ref={bodyRef}
        className="min-h-0 min-w-0 flex-1 overflow-hidden"
      >
        <EndorsementAdvisorPanel
          policy={policy}
          onBack={onClose ?? (() => {})}
          embedded
          variant="helloPane"
        />
      </div>
    </div>
  )
}
