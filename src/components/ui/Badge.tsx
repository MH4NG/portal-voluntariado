import { CATEGORIES, URGENCY } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { CategoryId, Urgency } from '../../types'

const badgeBase =
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold leading-none whitespace-nowrap'

export function CategoryBadge({ category, className }: { category: CategoryId; className?: string }) {
  const meta = CATEGORIES[category]
  return (
    <span className={cn(badgeBase, meta.badgeClass, className)}>
      <span aria-hidden="true">{meta.emoji}</span>
      {meta.label}
    </span>
  )
}

export function UrgencyBadge({ urgency, className }: { urgency: Urgency; className?: string }) {
  const meta = URGENCY[urgency]
  return (
    <span className={cn(badgeBase, meta.badgeClass, className)}>
      {urgency === 'alta' && (
        <svg aria-hidden="true" viewBox="0 0 20 20" className="size-4" fill="currentColor">
          <path d="M10 2a1 1 0 0 1 .87.5l7 12A1 1 0 0 1 17 16H3a1 1 0 0 1-.87-1.5l7-12A1 1 0 0 1 10 2Zm0 5a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 7.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
        </svg>
      )}
      {meta.label}
    </span>
  )
}
