import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** First token of a full name — for “guide {name}” style copy; falls back to “the customer”. */
export function customerFirstNameOrFull(full: string): string {
  const t = full.trim()
  if (!t) return "the customer"
  const parts = t.split(/\s+/).filter(Boolean)
  return parts[0] ?? t
}

/**
 * Scrolls an element into view inside a scrollable container only — does not scroll the document.
 * Prefer over `Element.scrollIntoView()` when nested panes must not move the page.
 */
export function scrollElementWithinContainer(
  container: HTMLElement,
  element: HTMLElement,
  options?: { behavior?: ScrollBehavior; topPadding?: number },
): void {
  const topPadding = options?.topPadding ?? 8
  const cRect = container.getBoundingClientRect()
  const eRect = element.getBoundingClientRect()
  const deltaTop = eRect.top - cRect.top - topPadding

  if (Math.abs(deltaTop) < 2) return

  container.scrollTo({
    top: container.scrollTop + deltaTop,
    behavior: options?.behavior ?? "smooth",
  })
}
