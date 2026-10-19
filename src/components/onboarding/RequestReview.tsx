import { CATEGORIES, URGENCY } from '../../data/categories'
import { formatPhone } from '../../lib/contact'
import { formatDate } from '../../lib/format'
import { RequestCard } from '../requests/RequestCard'
import { ReviewItem, ReviewSection } from './StepLayout'
import {
  buildPreviewRequest,
  dateInputToISO,
  formatLatLng,
  normalizeContacts,
  resolveLocation,
  type AddressDraft,
  type ContactDraft,
  type RequestDraft,
} from './drafts'

interface RequestReviewProps {
  request: RequestDraft
  address: AddressDraft
  contact: ContactDraft
  organization: string
  /** Índices das etapas para os botões "Editar" */
  steps: { request: number; address: number; contact: number }
  onEdit: (step: number) => void
}

function displayUrl(url: string): string {
  return url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/$/, '')
}

/** Resumo do pedido + prévia visual do card, usados na etapa de revisão. */
export function RequestReview({ request, address, contact, organization, steps, onEdit }: RequestReviewProps) {
  const channels = normalizeContacts(contact)
  const neededBy = dateInputToISO(request.neededBy)
  const preview = buildPreviewRequest({ request, address, contact, organization })

  return (
    <div className="grid gap-8 xl:grid-cols-[minmax(0,1fr)_18rem] xl:items-start">
      <div className="flex min-w-0 flex-col gap-4">
        <ReviewSection title="Seu pedido" onEdit={() => onEdit(steps.request)}>
          <ReviewItem label="Título" wide>
            {request.title}
          </ReviewItem>
          <ReviewItem label="Resumo" wide>
            <span className="font-normal">{request.summary}</span>
          </ReviewItem>
          <ReviewItem label="Descrição" wide>
            <span className="line-clamp-4 font-normal whitespace-pre-line">{request.description}</span>
          </ReviewItem>
          <ReviewItem label="Categoria">
            {request.category ? CATEGORIES[request.category].label : '—'}
          </ReviewItem>
          <ReviewItem label="Urgência">{request.urgency ? URGENCY[request.urgency].label : '—'}</ReviewItem>
          {request.needs.length > 0 && (
            <ReviewItem label="O que é necessário" wide>
              <ul className="mt-1 flex flex-wrap gap-2">
                {request.needs.map((n) => (
                  <li key={n} className="rounded-full bg-primary-soft px-3 py-1 text-sm font-medium text-teal-900">
                    {n}
                  </li>
                ))}
              </ul>
            </ReviewItem>
          )}
          <ReviewItem label="Voluntários">
            {request.volunteersNeeded ? `${request.volunteersNeeded}` : 'Não informado'}
          </ReviewItem>
          <ReviewItem label="Prazo">{neededBy ? formatDate(neededBy) : 'Sem prazo definido'}</ReviewItem>
          <ReviewItem label="Imagem" wide>
            {request.image ? (
              <span className="flex items-center gap-3">
                <img src={request.image} alt="" className="size-14 shrink-0 rounded-lg object-cover" />
                <span className="font-normal">{request.imageAlt}</span>
              </span>
            ) : (
              'Sem imagem'
            )}
          </ReviewItem>
        </ReviewSection>

        <ReviewSection title="Endereço" onEdit={() => onEdit(steps.address)}>
          <ReviewItem label="Endereço" wide>
            {address.address}
          </ReviewItem>
          <ReviewItem label="Bairro">{address.neighborhood}</ReviewItem>
          <ReviewItem label="Coordenadas do pin">
            <span className="font-mono text-sm tabular-nums">{formatLatLng(resolveLocation(address))}</span>
          </ReviewItem>
        </ReviewSection>

        <ReviewSection title="Canais de contato" onEdit={() => onEdit(steps.contact)}>
          {channels.whatsapp && <ReviewItem label="WhatsApp">{formatPhone(channels.whatsapp)}</ReviewItem>}
          {channels.email && <ReviewItem label="E-mail público">{channels.email}</ReviewItem>}
          {channels.instagram && <ReviewItem label="Instagram">{displayUrl(channels.instagram)}</ReviewItem>}
          {channels.facebook && <ReviewItem label="Facebook">{displayUrl(channels.facebook)}</ReviewItem>}
          {channels.website && <ReviewItem label="Site">{displayUrl(channels.website)}</ReviewItem>}
        </ReviewSection>
      </div>

      <figure className="flex flex-col gap-3 xl:sticky xl:top-28">
        <figcaption className="text-sm font-bold tracking-widest text-ink-muted uppercase">
          Prévia do card no mural
        </figcaption>
        {/* Prévia apenas visual: o conteúdo já está listado acima, então fica fora da ordem de foco */}
        <div inert aria-hidden="true" className="pointer-events-none select-none">
          <RequestCard request={preview} headingLevel="h4" />
        </div>
      </figure>
    </div>
  )
}
