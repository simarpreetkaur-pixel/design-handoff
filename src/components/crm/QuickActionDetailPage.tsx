import { ArrowLeft } from "lucide-react"

export type QuickActionKey = "quick-action-1" | "quick-action-2" | "quick-action-3"

const KEY_ORDER: QuickActionKey[] = ["quick-action-1", "quick-action-2", "quick-action-3"]

export function quickActionKeyForIndex(index: number): QuickActionKey {
  if (index < 0) return "quick-action-1"
  return KEY_ORDER[Math.min(index, KEY_ORDER.length - 1)]
}

const PAGE_COPY: Record<QuickActionKey, { title: string; subtitle: string; description: string }> = {
  "quick-action-1": {
    title: "Send communication",
    subtitle: "Message the customer",
    description:
      "Send an update to the customer via the channel you choose (e.g. SMS, email, or in-app), with the right template and context for this case.",
  },
  "quick-action-2": {
    title: "Request document",
    subtitle: "Ask for a file or proof",
    description:
      "Request a specific document from the customer (e.g. RC, ID, or claim proof), track what was asked, and follow up when the file is received.",
  },
  "quick-action-3": {
    title: "Arrange CH Appointment",
    subtitle: "Schedule claim handler",
    description:
      "Book or adjust a claim handler (CH) appointment for the customer, add notes, and confirm the slot with them on the call.",
  },
}

function isQuickActionKey(key: string): key is QuickActionKey {
  return key in PAGE_COPY
}

type QuickActionDetailPageProps = {
  actionKey: string
  onBack: () => void
  /** When opened from "Quick related actions", show this as the main title. */
  actionLabel?: string | null
}

const FALLBACK = PAGE_COPY["quick-action-1"]

export function QuickActionDetailPage({ actionKey, onBack, actionLabel = null }: QuickActionDetailPageProps) {
  const content = isQuickActionKey(actionKey) ? PAGE_COPY[actionKey] : FALLBACK
  const mainTitle = actionLabel?.trim() || content.title
  const subTitle = actionLabel ? "Quick related action" : content.subtitle

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center gap-3 border-b border-[#e7e7f0] bg-white px-4 py-4">
        <button
          type="button"
          onClick={onBack}
          className="flex h-9 w-9 items-center justify-center rounded-full text-[#2c2067] transition-colors hover:bg-[#f1edfc]"
          title="Go back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div>
          <h2 className="font-euclid text-[18px] font-medium leading-6 text-[#2c2067]">
            {mainTitle}
          </h2>
          <p className="font-euclid text-[14px] font-normal leading-5 text-[#6c6c80]">
            {subTitle}
          </p>
        </div>
      </div>

      <div className="px-4 py-6">
        <div className="rounded-xl border border-[#e7e7f0] bg-white p-6 shadow-sm">
          <div className="text-center">
            <div className="mb-4">
              <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#f1edfc]">
                <div className="h-8 w-8 rounded-full bg-[#7c47e1] opacity-20" />
              </div>
              <h3 className="mb-2 font-euclid text-[16px] font-medium text-[#2c2067]">
                {mainTitle}
              </h3>
              <p className="font-euclid text-[14px] leading-5 text-[#6c6c80]">
                {content.description}
              </p>
            </div>

            <div className="mx-auto my-6 max-w-sm space-y-3">
              <div className="h-2.5 rounded bg-[#f0f0f5]" />
              <div className="mx-auto h-2.5 w-4/5 rounded bg-[#f0f0f5]" />
              <div className="mx-auto h-2.5 w-3/5 rounded bg-[#f0f0f5]" />
            </div>

            <div className="mt-8 rounded-lg bg-[#f6f6f9] p-4">
              <p className="font-euclid text-[12px] leading-relaxed text-[#6c6c80]">
                This is a placeholder. The full {mainTitle} flow will be implemented here. Use{" "}
                <span className="font-medium">Go back</span> to return to the tab and context you
                were in.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
