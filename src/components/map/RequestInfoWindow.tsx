import type { HelpRequest } from '../../types'
import { ButtonLink } from '../ui/Button'
import { CategoryBadge, UrgencyBadge } from '../ui/Badge'

/** Título exibido no cabeçalho nativo do InfoWindow (ao lado do botão fechar). */
export function RequestInfoWindowHeader({ request }: { request: HelpRequest }) {
  return (
    <h3 className="pr-1 font-display text-base leading-snug font-bold tracking-tight text-ink">
      {request.title}
    </h3>
  )
}

/** Conteúdo do balão de informações de um marcador. */
export function RequestInfoWindow({ request, onEscape }: { request: HelpRequest; onEscape?: () => void }) {
  return (
    <div
      className="w-[min(18rem,80vw)] pb-1 font-sans text-ink"
      onKeyDown={(event) => {
        if (event.key === 'Escape' && onEscape) {
          event.stopPropagation()
          onEscape()
        }
      }}
    >
      <div className="flex flex-wrap gap-1.5">
        <CategoryBadge category={request.category} />
        <UrgencyBadge urgency={request.urgency} />
      </div>

      <p className="mt-3 line-clamp-3 text-sm leading-relaxed text-ink-muted">{request.summary}</p>

      <p className="mt-3 flex items-center gap-1.5 text-sm font-medium text-ink">
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4 shrink-0 text-primary">
          <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Zm0 8.25A2.25 2.25 0 1 1 10 5.75a2.25 2.25 0 0 1 0 4.5Z" />
        </svg>
        <span className="sr-only">Bairro: </span>
        {request.neighborhood}
        <span aria-hidden="true" className="text-navy-300">
          ·
        </span>
        <span className="truncate font-normal text-ink-muted">{request.organization}</span>
      </p>

      <ButtonLink to={`/acoes/${request.id}`} className="mt-4 w-full">
        Saber mais e ajudar
        <span className="sr-only">: {request.title}</span>
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
          <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
        </svg>
      </ButtonLink>
    </div>
  )
}
