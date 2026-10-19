import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import { cn } from '../../lib/cn'
import { daysUntil, formatShortDate } from '../../lib/format'
import type { HelpRequest } from '../../types'
import { CategoryBadge, UrgencyBadge } from '../ui/Badge'

interface RequestCardProps {
  request: HelpRequest
  /** Nível do título dentro da hierarquia da página */
  headingLevel?: 'h2' | 'h3' | 'h4'
  className?: string
}

/**
 * Card de pedido de ajuda. O card inteiro é clicável via "stretched link" no título,
 * preservando um único ponto de foco por card para a navegação por teclado.
 */
export function RequestCard({ request, headingLevel: Heading = 'h3', className }: RequestCardProps) {
  const category = CATEGORIES[request.category]
  const deadlineDays = request.neededBy ? daysUntil(request.neededBy) : null

  return (
    <article
      className={cn(
        'group relative flex h-full flex-col overflow-hidden rounded-card bg-surface-raised shadow-card',
        'ring-1 ring-border transition-shadow duration-200 hover:shadow-raised',
        'focus-within:ring-2 focus-within:ring-focus',
        request.urgency === 'alta' && 'ring-2 ring-urgent',
        className,
      )}
    >
      <div className="relative aspect-[16/9] overflow-hidden bg-navy-50">
        {request.image ? (
          <img
            src={request.image}
            alt={request.imageAlt ?? ''}
            loading="lazy"
            decoding="async"
            className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center text-6xl"
            style={{
              background: `radial-gradient(circle at 30% 30%, ${category.pinColor}22, transparent 60%), linear-gradient(135deg, #f0f4f8, #f8f3ea)`,
            }}
          >
            {category.emoji}
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-2">
          <UrgencyBadge urgency={request.urgency} className="shadow-sm" />
        </div>
      </div>

      <div className="flex flex-1 flex-col gap-3 p-5">
        <CategoryBadge category={request.category} className="self-start" />
        <Heading className="text-lg font-bold leading-snug text-ink">
          <Link
            to={`/acoes/${request.id}`}
            className="rounded-sm after:absolute after:inset-0 after:content-[''] focus-visible:outline-none"
          >
            {request.title}
          </Link>
        </Heading>
        <p className="line-clamp-3 text-ink-muted">{request.summary}</p>

        <dl className="mt-auto flex flex-wrap gap-x-4 gap-y-1 pt-2 text-sm text-ink-muted">
          <div className="flex items-center gap-1.5">
            <dt>
              <span className="sr-only">Bairro</span>
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Zm0 8.25A2.25 2.25 0 1 1 10 5.75a2.25 2.25 0 0 1 0 4.5Z" />
              </svg>
            </dt>
            <dd className="font-medium text-ink">{request.neighborhood}</dd>
          </div>
          {request.neededBy && deadlineDays !== null && deadlineDays >= 0 && (
            <div className="flex items-center gap-1.5">
              <dt>
                <span className="sr-only">Prazo</span>
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4a.75.75 0 0 0-1.5 0v4c0 .2.08.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06l-2.28-2.28V6Z" />
                </svg>
              </dt>
              <dd className={cn(deadlineDays <= 7 && 'font-semibold text-urgent-ink')}>
                até {formatShortDate(request.neededBy)}
              </dd>
            </div>
          )}
          {request.volunteersNeeded && (
            <div className="flex items-center gap-1.5">
              <dt>
                <span className="sr-only">Voluntários necessários</span>
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1 16c0-3 2.7-5 6-5s6 2 6 5v1H1v-1Zm13.5 1H19v-.5c0-2.4-1.9-4.2-4.6-4.5 1 .9 1.6 2.1 1.6 3.5V17h-1.5Z" />
                </svg>
              </dt>
              <dd>{request.volunteersNeeded} vagas</dd>
            </div>
          )}
        </dl>

        <span
          aria-hidden="true"
          className="inline-flex items-center gap-1 font-semibold text-primary group-hover:underline"
        >
          Saber mais e ajudar
          <svg viewBox="0 0 20 20" fill="currentColor" className="size-4 transition-transform group-hover:translate-x-0.5">
            <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
          </svg>
        </span>
      </div>
    </article>
  )
}
