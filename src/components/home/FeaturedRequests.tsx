import { useMemo, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CITY } from '../../config'
import { useAuth } from '../../context/AuthContext'
import { useRequests } from '../../context/RequestsContext'
import { gsap, MOTION, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { RequestCard } from '../requests/RequestCard'
import { ButtonLink } from '../ui/Button'
import { Container } from '../ui/Container'
import { SectionHeading } from '../ui/SectionHeading'

const FEATURED_LIMIT = 4

/**
 * Mural de Chamadas em Destaque (#acoes): os pedidos mais urgentes da cidade,
 * seguidos de um convite para instituições cadastrarem o próprio pedido.
 */
export function FeaturedRequests() {
  const containerRef = useRef<HTMLElement>(null)
  const { requests, urgentRequests } = useRequests()
  const { user } = useAuth()

  const featured = useMemo(() => urgentRequests(FEATURED_LIMIT), [urgentRequests])
  const featuredKey = featured.map((r) => r.id).join('|')
  const highUrgencyCount = useMemo(
    () => requests.filter((r) => r.urgency === 'alta').length,
    [requests],
  )

  useGSAP(
    () => {
      const root = containerRef.current
      if (!root) return
      const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-featured-card]'))
      if (cards.length === 0) return

      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        // O estado inicial só é aplicado via JS com movimento permitido: sem JS, tudo fica visível.
        gsap.set(cards, { opacity: 0, y: 40 })
        const reveal = (batch: Element[]) =>
          gsap.to(batch, {
            opacity: 1,
            y: 0,
            duration: 0.7,
            ease: 'power3.out',
            stagger: 0.12,
            overwrite: true,
          })
        ScrollTrigger.batch(cards, {
          start: 'top 90%',
          once: true,
          onEnter: reveal,
          // Garante a revelação mesmo se a página carregar já rolada além dos cards
          onLeave: reveal,
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [featuredKey], revertOnUpdate: true },
  )

  const isBeneficiary = user?.kind === 'beneficiario'
  const ctaTarget = isBeneficiary ? '/acoes/nova' : '/cadastro?perfil=beneficiario'

  return (
    <section
      ref={containerRef}
      id="acoes"
      aria-labelledby="acoes-title"
      className="relative bg-surface-muted py-20 sm:py-28"
    >
      <Container>
        <div className="flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
          <SectionHeading
            id="acoes-title"
            eyebrow="Chamadas em destaque"
            title="Quem precisa de ajuda agora"
            description={`Os pedidos mais urgentes de ${CITY.name} neste momento. Algumas ajudas não podem esperar — e um pouco do seu tempo já faz diferença.`}
          />
          <ButtonLink to="/acoes" variant="secondary" className="self-start md:self-auto md:shrink-0">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path
                fillRule="evenodd"
                d="M8.16 2.58a1 1 0 0 1 .68 0l4.66 1.66 3.66-1.3A1 1 0 0 1 18.5 3.9v11.4a1 1 0 0 1-.66.94l-4.16 1.48a1 1 0 0 1-.68 0L8.34 16.06l-3.66 1.3A1 1 0 0 1 3.34 16.4V5a1 1 0 0 1 .66-.94l4.16-1.48ZM8 4.9 5.34 5.84v9.17L8 14.07V4.9Zm2 9.17 2.66.95V5.84L10 4.9v9.17Zm4.66.95 1.84-.66V5.2l-1.84.66v9.16Z"
                clipRule="evenodd"
              />
            </svg>
            Ver todas no mapa
          </ButtonLink>
        </div>

        {featured.length > 0 ? (
          <>
            {highUrgencyCount > 0 && (
              <p className="mt-8 inline-flex items-center gap-2 rounded-full bg-urgent-soft px-4 py-2 text-sm font-semibold text-urgent-ink">
                <span
                  aria-hidden="true"
                  className="inline-flex size-2.5 rounded-full bg-amber-600 ring-4 ring-amber-200"
                />
                {highUrgencyCount === 1
                  ? '1 pedido com urgência alta na cidade'
                  : `${highUrgencyCount} pedidos com urgência alta na cidade`}
              </p>
            )}

            <ul
              role="list"
              aria-label="Pedidos mais urgentes"
              className="mt-8 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4"
            >
              {featured.map((request) => (
                <li key={request.id} data-featured-card className="h-full">
                  <RequestCard request={request} headingLevel="h3" />
                </li>
              ))}
            </ul>
          </>
        ) : (
          <FeaturedEmptyState />
        )}

        {/* Faixa de chamada para instituições */}
        <div className="relative mt-16 overflow-hidden rounded-card bg-surface-raised p-6 shadow-card ring-1 ring-border sm:p-10 md:flex md:items-center md:gap-8 lg:gap-12">
          <div
            aria-hidden="true"
            className="pointer-events-none absolute -top-20 -right-20 size-64 rounded-full bg-urgent-soft/70 blur-2xl"
          />
          <FeaturedBeaconIllustration className="relative mx-auto mb-6 size-28 shrink-0 md:mx-0 md:mb-0 md:size-32" />
          <div className="relative flex-1 text-center md:text-left">
            <h3 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Sua instituição precisa de voluntários?
            </h3>
            <p className="mt-3 text-lg text-ink-muted">
              {isBeneficiary
                ? 'Publique um novo pedido em poucos minutos. Ele aparece no mapa e chega a voluntários do seu bairro.'
                : 'Cadastre seu pedido gratuitamente. Ele vira um pin no mapa da cidade e chega a voluntários perto de você.'}
            </p>
          </div>
          <div className="relative mt-8 flex flex-col items-center gap-2 md:mt-0 md:shrink-0 md:items-end">
            <ButtonLink to={ctaTarget} variant="urgent" size="lg" className="w-full sm:w-auto">
              Cadastrar pedido de ajuda
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M7.3 4.3a1 1 0 0 1 1.4 0l5 5a1 1 0 0 1 0 1.4l-5 5a1 1 0 0 1-1.4-1.4L11.6 10 7.3 5.7a1 1 0 0 1 0-1.4Z" />
              </svg>
            </ButtonLink>
            {!user && (
              <Link
                to={`/entrar?next=${encodeURIComponent('/acoes/nova')}`}
                className="focus-ring inline-flex min-h-12 items-center rounded-full px-4 text-base font-semibold text-primary underline-offset-4 hover:underline"
              >
                Já tem cadastro? Entrar
              </Link>
            )}
          </div>
        </div>
      </Container>
    </section>
  )
}

function FeaturedEmptyState() {
  return (
    <div className="mt-10 rounded-card bg-surface-raised px-6 py-14 text-center shadow-card ring-1 ring-border sm:px-10">
      <svg
        aria-hidden="true"
        viewBox="0 0 120 120"
        className="mx-auto size-24"
        fill="none"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <circle cx="60" cy="60" r="52" className="fill-primary-soft" />
        <path
          d="M60 88S34 73 34 54a14 14 0 0 1 26-7.2A14 14 0 0 1 86 54c0 19-26 34-26 34Z"
          className="fill-surface-raised stroke-primary"
          strokeWidth="4"
        />
        <path d="m49 57 7.5 7.5L72 49" className="stroke-primary" strokeWidth="5" />
      </svg>
      <h3 className="mt-6 text-2xl font-extrabold tracking-tight text-ink">
        Nenhuma chamada urgente no momento
      </h3>
      <p className="mx-auto mt-3 max-w-md text-lg text-ink-muted">
        Que boa notícia! Ainda assim, há muitas formas de ajudar. Explore as ações abertas no mapa da
        cidade.
      </p>
      <ButtonLink to="/acoes" variant="primary" className="mt-8">
        Explorar ações
      </ButtonLink>
    </div>
  )
}

/** Ilustração decorativa: casa com coração emitindo um "sinal" de chamada. */
function FeaturedBeaconIllustration({ className }: { className?: string }) {
  return (
    <svg aria-hidden="true" viewBox="0 0 128 128" className={className} fill="none">
      <circle cx="64" cy="64" r="60" className="fill-urgent-soft" />
      <path d="M26 40a46 46 0 0 1 14-14" className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
      <path d="M36 46a32 32 0 0 1 10-10" className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
      <path d="M102 40a46 46 0 0 0-14-14" className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
      <path d="M92 46a32 32 0 0 0-10-10" className="stroke-amber-500" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M34 70 64 46l30 24v28a4 4 0 0 1-4 4H38a4 4 0 0 1-4-4V70Z"
        className="fill-surface-raised stroke-navy-900"
        strokeWidth="5"
        strokeLinejoin="round"
      />
      <path
        d="M64 92s-12-7-12-15.5a6.5 6.5 0 0 1 12-3.4 6.5 6.5 0 0 1 12 3.4C76 85 64 92 64 92Z"
        className="fill-primary"
      />
    </svg>
  )
}
