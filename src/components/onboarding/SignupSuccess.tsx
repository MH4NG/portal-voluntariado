import { useEffect, useMemo, useRef, type ReactNode } from 'react'
import { useRequests } from '../../context/RequestsContext'
import { CATEGORIES } from '../../data/categories'
import { MOTION, gsap, useGSAP } from '../../lib/gsap'
import { compareByUrgency } from '../../lib/sort'
import type { HelpRequest, VolunteerProfile } from '../../types'
import { RequestCard } from '../requests/RequestCard'
import { Button, ButtonLink } from '../ui/Button'
import { Container } from '../ui/Container'
import { SuccessIllustration } from './Illustrations'

/* ------------------------------------------------------------------ */
/* Moldura comum: título focado ao montar + animação discreta          */
/* ------------------------------------------------------------------ */

function SuccessShell({
  title,
  lead,
  actions,
  children,
}: {
  title: string
  lead: ReactNode
  actions: ReactNode
  children?: ReactNode
}) {
  const ref = useRef<HTMLDivElement>(null)
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    headingRef.current?.focus({ preventScroll: true })
    window.scrollTo({ top: 0 })
  }, [])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })
        tl.from('[data-anim="badge"]', { scale: 0.4, opacity: 0, transformOrigin: '50% 50%', duration: 0.6, ease: 'back.out(1.8)' })
          .from('[data-anim="confetti"] > *', { y: 10, opacity: 0, duration: 0.5, stagger: 0.05 }, '-=0.3')
          .from('[data-anim="rise"]', { y: 18, opacity: 0, duration: 0.5, stagger: 0.08, clearProps: 'opacity,transform' }, '-=0.4')
      })
      return () => mm.revert()
    },
    { scope: ref },
  )

  return (
    <div ref={ref} className="relative overflow-hidden bg-surface">
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-56 left-1/2 size-160 -translate-x-1/2 rounded-full bg-teal-100/60 blur-3xl"
      />
      <Container className="relative py-12 sm:py-20">
        <div className="mx-auto flex max-w-2xl flex-col items-center text-center">
          <SuccessIllustration className="w-40 sm:w-48" />
          <h1
            ref={headingRef}
            tabIndex={-1}
            data-anim="rise"
            className="mt-4 rounded-md text-4xl font-extrabold tracking-tight text-ink focus:outline-none sm:text-5xl"
          >
            {title}
          </h1>
          <div data-anim="rise" className="mt-4 text-lg text-ink-muted">
            {lead}
          </div>
          <div data-anim="rise" className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row sm:justify-center">
            {actions}
          </div>
        </div>
        {children}
      </Container>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Voluntário                                                          */
/* ------------------------------------------------------------------ */

export function VolunteerSuccess({ profile }: { profile: VolunteerProfile }) {
  const { requests, urgentRequests } = useRequests()
  const firstName = profile.name.trim().split(/\s+/)[0] || profile.name
  const firstInterest = profile.interests[0]

  const { list, matched } = useMemo(() => {
    const matches = requests.filter((r) => profile.interests.includes(r.category)).sort(compareByUrgency)
    return matches.length > 0
      ? { list: matches.slice(0, 3), matched: true }
      : { list: urgentRequests(3), matched: false }
  }, [requests, urgentRequests, profile.interests])

  return (
    <SuccessShell
      title={`Boas-vindas, ${firstName}!`}
      lead={
        <p>
          Seu cadastro está pronto. Agora é só escolher uma ação e falar direto com quem precisa, por WhatsApp,
          e-mail ou redes sociais.
        </p>
      }
      actions={
        <>
          <ButtonLink
            to={firstInterest ? `/acoes?categoria=${firstInterest}` : '/acoes'}
            size="lg"
          >
            {firstInterest ? `Ver ações de ${CATEGORIES[firstInterest].label}` : 'Ver ações'}
          </ButtonLink>
          <ButtonLink to="/acoes" variant="secondary" size="lg">
            Explorar o mapa
          </ButtonLink>
        </>
      }
    >
      {list.length > 0 && (
        <section aria-labelledby="sugestoes-titulo" className="mx-auto mt-16 max-w-6xl sm:mt-20">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-bold tracking-widest text-primary uppercase">
                {matched ? 'Combina com você' : 'Precisam de ajuda agora'}
              </p>
              <h2 id="sugestoes-titulo" className="mt-1 text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
                {matched ? 'Sugestões a partir dos seus interesses' : 'Pedidos urgentes na cidade'}
              </h2>
            </div>
          </div>
          <ul className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {list.map((r) => (
              <li key={r.id} data-anim="rise">
                <RequestCard request={r} headingLevel="h3" />
              </li>
            ))}
          </ul>
        </section>
      )}
    </SuccessShell>
  )
}

/* ------------------------------------------------------------------ */
/* Pedido publicado (beneficiário / novo pedido)                       */
/* ------------------------------------------------------------------ */

export function RequestSuccess({
  request,
  onCreateAnother,
  persisted = true,
  imageDropped = false,
}: {
  request: HelpRequest
  onCreateAnother?: () => void
  /** false = o navegador não conseguiu guardar o pedido (fica visível só nesta sessão) */
  persisted?: boolean
  /** true = o pedido foi guardado sem a foto, por falta de espaço no navegador */
  imageDropped?: boolean
}) {
  const storageWarning = !persisted
    ? 'Atenção: não conseguimos guardar o pedido neste navegador. Ele fica visível enquanto esta aba estiver aberta; para não perdê-lo, libere espaço no navegador e publique novamente.'
    : imageDropped
      ? 'Não conseguimos guardar a foto neste navegador; o pedido foi salvo sem imagem.'
      : null

  const channels = [
    request.contact.whatsapp && 'WhatsApp',
    request.contact.email && 'e-mail',
    request.contact.instagram && 'Instagram',
    request.contact.facebook && 'Facebook',
    request.contact.website && 'site',
  ].filter(Boolean) as string[]
  const channelText =
    channels.length > 1 ? `${channels.slice(0, -1).join(', ')} e ${channels[channels.length - 1]}` : channels[0]

  return (
    <SuccessShell
      title="Seu pedido já está no mapa!"
      lead={
        <p>
          Voluntários de {request.neighborhood} e de toda a cidade já podem ver “{request.title}” e falar com você
          {channelText ? ` por ${channelText}` : ''}.
          {storageWarning && (
            <span className="mt-4 block rounded-2xl bg-urgent-soft px-4 py-3 text-base font-semibold text-urgent-ink">
              {storageWarning}
            </span>
          )}
        </p>
      }
      actions={
        <>
          <ButtonLink to={`/acoes/${request.id}`} size="lg">
            Ver meu pedido
          </ButtonLink>
          <ButtonLink to={`/acoes?acao=${encodeURIComponent(request.id)}`} variant="secondary" size="lg">
            Ver no mapa
          </ButtonLink>
        </>
      }
    >
      <div className="mx-auto mt-16 grid max-w-5xl gap-8 sm:mt-20 md:grid-cols-[minmax(0,1fr)_20rem] md:items-start lg:gap-12">
        <section aria-labelledby="proximos-passos" data-anim="rise" className="rounded-card bg-surface-raised p-6 shadow-card ring-1 ring-border sm:p-8">
          <h2 id="proximos-passos" className="text-2xl font-extrabold tracking-tight text-ink">
            Próximos passos
          </h2>
          <ol className="mt-5 flex flex-col gap-5">
            {[
              ['Fique de olho nos seus canais', 'Voluntários entram em contato direto — responda assim que puder para não perder a ajuda.'],
              ['Combine os detalhes', 'Confirme dia, horário e local com cada voluntário antes do encontro.'],
              ['Compartilhe o pedido', 'Envie o link do pedido para amigos e grupos do bairro. Quanto mais gente vê, mais rápido a ajuda chega.'],
            ].map(([title, text], i) => (
              <li key={title} className="flex gap-4">
                <span
                  aria-hidden="true"
                  className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary-soft font-display font-bold text-primary ring-1 ring-teal-200"
                >
                  {i + 1}
                </span>
                <div>
                  <h3 className="font-bold text-ink">{title}</h3>
                  <p className="mt-1 text-ink-muted">{text}</p>
                </div>
              </li>
            ))}
          </ol>
          {onCreateAnother && (
            <div className="mt-6 border-t border-border pt-6">
              <Button variant="ghost" onClick={onCreateAnother} className="-ml-3">
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                  <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
                </svg>
                Criar outro pedido
              </Button>
            </div>
          )}
        </section>
        <section aria-labelledby="seu-card" data-anim="rise">
          <h2 id="seu-card" className="mb-3 text-sm font-bold tracking-widest text-ink-muted uppercase">
            Como seu pedido aparece
          </h2>
          <RequestCard request={request} headingLevel="h3" />
        </section>
      </div>
    </SuccessShell>
  )
}
