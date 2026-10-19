import { memo, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { CATEGORIES } from '../../data/categories'
import { cn } from '../../lib/cn'
import { daysUntil, formatShortDate } from '../../lib/format'
import { prefersReducedMotion } from '../../lib/gsap'
import type { HelpRequest } from '../../types'
import { ButtonLink } from '../ui/Button'
import { CategoryBadge, UrgencyBadge } from '../ui/Badge'
import { googleMapsSearchUrl, listItemId } from './mapUtils'
import type { SelectionSource } from './types'

interface RequestListProps {
  requests: HelpRequest[]
  selectedId: string | null
  selectionSource: SelectionSource
  selectionNonce: number
  /** false quando a lista está oculta (aba "Mapa" no mobile) */
  visible: boolean
  /** Exibe o botão "Ver no mapa" (apenas com o mapa interativo carregado) */
  canShowOnMap: boolean
  hasActiveFilters: boolean
  onSelect: (id: string | null, source: SelectionSource) => void
  onClearFilters: () => void
}

export function RequestList({
  requests,
  selectedId,
  selectionSource,
  selectionNonce,
  visible,
  canShowOnMap,
  hasActiveFilters,
  onSelect,
  onClearFilters,
}: RequestListProps) {
  // Ao selecionar pelo mapa (ou abrir com ?acao=), traz o item correspondente para a vista
  useEffect(() => {
    if (!visible || !selectedId || selectionSource === 'list') return
    const el = document.getElementById(listItemId(selectedId))
    el?.scrollIntoView({ block: 'nearest', behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
  }, [visible, selectedId, selectionSource, selectionNonce])

  if (requests.length === 0) {
    return <EmptyState hasActiveFilters={hasActiveFilters} onClearFilters={onClearFilters} />
  }

  return (
    <ul role="list" className="flex flex-col gap-4">
      {requests.map((request) => (
        <RequestListItem
          key={request.id}
          request={request}
          selected={request.id === selectedId}
          canShowOnMap={canShowOnMap}
          onSelect={onSelect}
        />
      ))}
    </ul>
  )
}

interface RequestListItemProps {
  request: HelpRequest
  selected: boolean
  canShowOnMap: boolean
  onSelect: (id: string | null, source: SelectionSource) => void
}

const actionClasses =
  'relative z-10 inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full px-4 ' +
  'text-sm font-semibold transition-colors focus-ring'

const RequestListItem = memo(function RequestListItem({
  request,
  selected,
  canShowOnMap,
  onSelect,
}: RequestListItemProps) {
  const category = CATEGORIES[request.category]
  const urgent = request.urgency === 'alta'
  const deadlineDays = request.neededBy ? daysUntil(request.neededBy) : null

  return (
    <li id={listItemId(request.id)} aria-current={selected ? 'true' : undefined} data-anim="list-item" className="scroll-mt-4">
      <article
        className={cn(
          'group relative overflow-hidden rounded-card bg-surface-raised p-4 shadow-card transition-shadow duration-200 sm:p-5',
          'hover:shadow-raised focus-within:ring-2 focus-within:ring-focus focus-within:outline-3 focus-within:outline-offset-3 focus-within:outline-focus',
          selected ? 'ring-2 ring-primary' : urgent ? 'ring-1 ring-amber-300' : 'ring-1 ring-border',
        )}
      >
        {/* Faixa lateral de destaque quando selecionada */}
        {selected && <span aria-hidden="true" className="absolute inset-y-0 left-0 w-1.5 bg-primary" />}

        <div className="flex gap-4">
          <span
            aria-hidden="true"
            className="grid size-12 shrink-0 place-items-center rounded-2xl text-2xl"
            style={{ background: `${category.pinColor}1a`, boxShadow: `inset 0 0 0 1px ${category.pinColor}33` }}
          >
            {category.emoji}
          </span>

          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-1.5">
              <UrgencyBadge urgency={request.urgency} />
              <CategoryBadge category={request.category} />
              {selected && (
                <span className="inline-flex items-center gap-1 rounded-full bg-primary-soft px-2.5 py-1 text-xs leading-none font-semibold text-teal-800">
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-3.5">
                    <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Zm0 8.25A2.25 2.25 0 1 1 10 5.75a2.25 2.25 0 0 1 0 4.5Z" />
                  </svg>
                  Em destaque no mapa
                </span>
              )}
            </div>

            <h3 className="mt-2 text-base leading-snug font-bold tracking-tight text-ink sm:text-lg">
              <Link
                to={`/acoes/${request.id}`}
                className="rounded-sm after:absolute after:inset-0 after:content-[''] hover:underline focus-visible:outline-none"
              >
                {request.title}
              </Link>
            </h3>

            <p className="mt-1.5 line-clamp-2 text-sm leading-relaxed text-ink-muted">{request.summary}</p>

            <dl className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm text-ink-muted">
              <div className="flex items-center gap-1.5">
                <dt>
                  <span className="sr-only">Bairro</span>
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-primary">
                    <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Zm0 8.25A2.25 2.25 0 1 1 10 5.75a2.25 2.25 0 0 1 0 4.5Z" />
                  </svg>
                </dt>
                <dd className="font-medium text-ink">{request.neighborhood}</dd>
              </div>
              <div className="flex min-w-0 items-center gap-1.5">
                <dt>
                  <span className="sr-only">Organização</span>
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                    <path d="M4 3a1 1 0 0 0-1 1v13h4v-3h6v3h4V8a1 1 0 0 0-1-1h-3V4a1 1 0 0 0-1-1H4Zm2 3h2v2H6V6Zm0 4h2v2H6v-2Zm4-4h2v2h-2V6Zm0 4h2v2h-2v-2Z" />
                  </svg>
                </dt>
                <dd className="truncate">{request.organization}</dd>
              </div>
              {request.neededBy && deadlineDays !== null && deadlineDays >= 0 && (
                <div className="flex items-center gap-1.5">
                  <dt>
                    <span className="sr-only">Prazo</span>
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                      <path fillRule="evenodd" clipRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4a.75.75 0 0 0-1.5 0v4c0 .2.08.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06l-2.28-2.28V6Z" />
                    </svg>
                  </dt>
                  <dd className={cn(deadlineDays <= 7 && 'font-semibold text-urgent-ink')}>
                    até {formatShortDate(request.neededBy)}
                  </dd>
                </div>
              )}
            </dl>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-border pt-3 sm:pl-16">
          {canShowOnMap && (
            <button
              type="button"
              data-map-button=""
              onClick={() => onSelect(request.id, 'list')}
              className={cn(
                actionClasses,
                selected
                  ? 'bg-primary text-on-primary hover:bg-primary-hover'
                  : 'bg-primary-soft text-teal-800 ring-1 ring-teal-200 hover:bg-teal-100',
              )}
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Zm0 8.25A2.25 2.25 0 1 1 10 5.75a2.25 2.25 0 0 1 0 4.5Z" />
              </svg>
              Ver no mapa
              <span className="sr-only">: {request.title}</span>
            </button>
          )}
          <a
            href={googleMapsSearchUrl(request.location)}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(actionClasses, 'text-ink hover:bg-navy-50')}
          >
            Abrir no Google Maps
            <span className="sr-only">: {request.address} (abre em nova aba)</span>
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4 text-ink-muted">
              <path d="M11 3a1 1 0 1 0 0 2h2.59l-6.3 6.3a1 1 0 1 0 1.42 1.4L15 6.42V9a1 1 0 1 0 2 0V4a1 1 0 0 0-1-1h-5ZM5 5a2 2 0 0 0-2 2v8c0 1.1.9 2 2 2h8a2 2 0 0 0 2-2v-3a1 1 0 1 0-2 0v3H5V7h3a1 1 0 0 0 0-2H5Z" />
            </svg>
          </a>
        </div>
      </article>
    </li>
  )
})

function EmptyState({
  hasActiveFilters,
  onClearFilters,
}: {
  hasActiveFilters: boolean
  onClearFilters: () => void
}) {
  return (
    <div className="flex flex-col items-center rounded-card bg-surface-raised px-6 py-10 text-center shadow-card ring-1 ring-border">
      <svg aria-hidden="true" viewBox="0 0 120 96" className="h-24 w-32" fill="none">
        <ellipse cx="60" cy="86" rx="42" ry="6" fill="#efe6d6" />
        <path d="M18 70c10-22 26-34 42-34s32 12 42 34" stroke="#9fb3c8" strokeWidth="4" strokeLinecap="round" strokeDasharray="2 9" />
        <path d="M60 14a16 16 0 0 0-16 16c0 12 16 28 16 28s16-16 16-28a16 16 0 0 0-16-16Z" fill="#0f766e" />
        <circle cx="60" cy="30" r="6" fill="#fff" />
        <circle cx="22" cy="70" r="6" fill="#fbbf24" />
        <circle cx="98" cy="70" r="6" fill="#5ccbbb" />
      </svg>
      <h3 className="mt-4 text-lg font-bold tracking-tight text-ink">Nenhuma ação encontrada</h3>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-ink-muted">
        {hasActiveFilters
          ? 'Tente outras palavras ou remova alguns filtros. Novas ações chegam todos os dias.'
          : 'Ainda não há ações publicadas. Que tal ser a primeira ponte?'}
      </p>
      <div className="mt-6 flex flex-wrap justify-center gap-3">
        {hasActiveFilters && (
          <button
            type="button"
            onClick={onClearFilters}
            className="inline-flex min-h-12 items-center justify-center rounded-full bg-primary px-5 font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover focus-ring"
          >
            Limpar filtros
          </button>
        )}
        <ButtonLink to="/acoes/nova" variant="secondary">
          Publicar um pedido de ajuda
        </ButtonLink>
      </div>
    </div>
  )
}
