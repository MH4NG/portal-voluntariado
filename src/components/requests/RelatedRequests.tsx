import { useId, useMemo } from 'react'
import { CITY } from '../../config'
import { CATEGORIES } from '../../data/categories'
import { useRequests } from '../../context/RequestsContext'
import { compareByUrgency } from '../../lib/sort'
import type { HelpRequest } from '../../types'
import { ButtonLink } from '../ui/Button'
import { RequestCard } from './RequestCard'

interface RelatedRequestsProps {
  request: HelpRequest
  limit?: number
  className?: string
}

/** Até 3 ações da mesma categoria; completa com as mais urgentes quando faltar. */
export function RelatedRequests({ request, limit = 3, className }: RelatedRequestsProps) {
  const headingId = useId()
  const { requests } = useRequests()

  const related = useMemo(() => {
    const others = requests.filter((r) => r.id !== request.id).sort(compareByUrgency)
    const sameCategory = others.filter((r) => r.category === request.category)
    const picked = sameCategory.slice(0, limit)
    if (picked.length < limit) {
      const pickedIds = new Set(picked.map((r) => r.id))
      picked.push(...others.filter((r) => !pickedIds.has(r.id)).slice(0, limit - picked.length))
    }
    return { items: picked, onlySameCategory: sameCategory.length >= limit }
  }, [requests, request.id, request.category, limit])

  if (related.items.length === 0) return null

  const categoryLabel = CATEGORIES[request.category].label

  return (
    <section aria-labelledby={headingId} className={className}>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="max-w-2xl">
          <p className="mb-3 text-sm font-bold tracking-widest text-primary uppercase">
            Continue ajudando
          </p>
          <h2 id={headingId} className="text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
            Outras ações que precisam de você
          </h2>
          <p className="mt-3 text-lg text-ink-muted">
            {related.onlySameCategory
              ? `Mais pedidos na categoria “${categoryLabel}” em ${CITY.name}.`
              : `Pedidos parecidos e os mais urgentes de ${CITY.name} neste momento.`}
          </p>
        </div>
        <ButtonLink to="/acoes" variant="secondary" className="w-full shrink-0 sm:w-auto">
          Ver todas as ações
        </ButtonLink>
      </div>

      <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {related.items.map((item) => (
          <li key={item.id} className="h-full">
            <RequestCard request={item} headingLevel="h3" />
          </li>
        ))}
      </ul>
    </section>
  )
}
