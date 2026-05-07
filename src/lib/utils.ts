import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
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
