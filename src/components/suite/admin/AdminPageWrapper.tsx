import type { ReactNode } from "react"

interface AdminPageWrapperProps {
  title: string
  description?: string
  action?: ReactNode
  children: ReactNode
}

export function AdminPageWrapper({ title, description, action, children }: AdminPageWrapperProps) {
  return (
    <div className="p-8 max-w-[1100px]">
      <div className="flex items-start justify-between gap-4 mb-6">
        <div>
          <h1 className="text-[#36354c] text-2xl font-semibold leading-tight">{title}</h1>
          {description && (
            <p className="text-[#5b5675] text-sm mt-1">{description}</p>
          )}
        </div>
        {action && <div className="shrink-0">{action}</div>}
      </div>
      {children}
    </div>
  )
}
