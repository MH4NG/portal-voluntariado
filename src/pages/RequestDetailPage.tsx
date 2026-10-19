import { useId, useRef, type ReactNode } from 'react'
import { Link, useParams } from 'react-router-dom'
import { ContactActions } from '../components/requests/ContactActions'
import { CheckIcon, PinIcon } from '../components/requests/ContactIcons'
import { RelatedRequests } from '../components/requests/RelatedRequests'
import { RequestLocationMap } from '../components/requests/RequestLocationMap'
import { ShareButton } from '../components/requests/ShareButton'
import { CategoryBadge, UrgencyBadge } from '../components/ui/Badge'
import { ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { CITY } from '../config'
import { useRequests } from '../context/RequestsContext'
import { CATEGORIES } from '../data/categories'
import { cn } from '../lib/cn'
import { daysUntil, formatDate, formatRelative } from '../lib/format'
import { gsap, MOTION, useGSAP } from '../lib/gsap'
import { usePageTitle } from '../lib/usePageTitle'
import type { HelpRequest } from '../types'

/** Página de detalhes da ação + contato direto (briefing §4.3). */
export function RequestDetailPage() {
  const { id = '' } = useParams()
  const { getRequest } = useRequests()
  const request = getRequest(id)
  const containerRef = useRef<HTMLDivElement>(null)

  usePageTitle(request ? request.title : 'Ação não encontrada')

  useGSAP(
    () => {
      if (!request) return
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        gsap.from('[data-anim="header"] > *', {
          y: 18,
          opacity: 0,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.07,
        })
        gsap.from('[data-anim="contact"]', {
          y: 28,
          opacity: 0,
          duration: 0.7,
          ease: 'power3.out',
          delay: 0.2,
          clearProps: 'transform',
        })
        gsap.from('[data-anim="hero"]', {
          scale: 0.98,
          opacity: 0,
          duration: 0.8,
          ease: 'power2.out',
          delay: 0.15,
        })
      })
      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [request?.id], revertOnUpdate: true },
  )

  if (!request) return <RequestNotFound />

  return (
    <div ref={containerRef}>
      <Container className="pt-4 pb-16 sm:pt-6 lg:pb-24">
        <Breadcrumb title={request.title} />

        <div className="mt-4 grid gap-8 sm:mt-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,25rem)] lg:gap-x-12 xl:gap-x-16">
          <RequestHeader request={request} />

          {/* No mobile o contato vem logo após o cabeçalho, para agir rápido. */}
          <div
            data-anim="contact"
            className="lg:sticky lg:top-28 lg:col-start-2 lg:row-span-2 lg:row-start-1 lg:self-start"
          >
            <ContactActions request={request} />
          </div>

          <RequestBody request={request} />
        </div>
      </Container>

      <div className="border-t border-border bg-surface-muted py-16 sm:py-20">
        <Container>
          <RelatedRequests request={request} />
        </Container>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function Breadcrumb({ title }: { title: string }) {
  const linkClass =
    'inline-flex min-h-12 min-w-12 items-center justify-center rounded-md px-1 font-medium ' +
    'text-ink-muted underline-offset-4 hover:text-ink hover:underline'
  return (
    <nav aria-label="Trilha de navegação">
      <ol className="flex flex-wrap items-center gap-x-1 text-sm">
        <li className="flex items-center gap-1">
          <Link to="/" className={linkClass}>
            Início
          </Link>
          <Separator />
        </li>
        <li className="flex items-center gap-1">
          <Link to="/acoes" className={linkClass}>
            Ações
          </Link>
          <Separator />
        </li>
        <li className="flex min-h-12 min-w-0 max-w-full items-center">
          <span aria-current="page" className="block truncate px-1 font-semibold text-ink">
            {title}
          </span>
        </li>
      </ol>
    </nav>
  )
}

function Separator() {
  return (
    <span aria-hidden="true" className="text-border-strong">
      ›
    </span>
  )
}

/* ------------------------------------------------------------------ */

function deadlineLabel(days: number): string {
  if (days < 0) return 'prazo encerrado'
  if (days === 0) return 'termina hoje'
  if (days === 1) return 'falta 1 dia'
  return `faltam ${days} dias`
}

function RequestHeader({ request }: { request: HelpRequest }) {
  const deadlineDays = request.neededBy ? daysUntil(request.neededBy) : null
  const deadlineSoon = deadlineDays !== null && deadlineDays >= 0 && deadlineDays <= 7

  return (
    <header data-anim="header" className="lg:col-start-1 lg:row-start-1">
      <div className="flex flex-wrap gap-2">
        <CategoryBadge category={request.category} />
        <UrgencyBadge urgency={request.urgency} />
      </div>

      <h1 className="mt-5 text-3xl leading-tight font-extrabold tracking-tight text-ink sm:text-4xl lg:text-5xl lg:leading-[1.1]">
        {request.title}
      </h1>

      <p className="mt-4 max-w-2xl text-lg text-ink-muted">{request.summary}</p>

      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-ink-muted">
        <span>
          Publicado por <strong className="font-semibold text-ink">{request.organization}</strong>
        </span>
        <span aria-hidden="true" className="text-border-strong">
          •
        </span>
        <time dateTime={request.createdAt} title={formatDate(request.createdAt)}>
          {formatRelative(request.createdAt)}
        </time>
      </p>

      <dl className="mt-6 grid gap-3 sm:grid-cols-3">
        <MetaTile
          label="Bairro"
          icon={<PinIcon className="size-5" />}
          value={request.neighborhood}
          detail={`${CITY.name} – ${CITY.state}`}
        />
        <MetaTile
          label="Prazo"
          highlight={deadlineSoon}
          icon={<ClockIcon />}
          value={request.neededBy ? formatDate(request.neededBy) : 'Sem data definida'}
          detail={
            deadlineDays !== null ? (
              <span className={cn(deadlineSoon && 'font-semibold text-urgent-ink')}>
                {deadlineLabel(deadlineDays)}
              </span>
            ) : (
              'Ajuda contínua'
            )
          }
        />
        <MetaTile
          label="Voluntários"
          icon={<PeopleIcon />}
          value={
            request.volunteersNeeded
              ? `${request.volunteersNeeded} ${request.volunteersNeeded === 1 ? 'pessoa' : 'pessoas'}`
              : 'Toda ajuda conta'
          }
          detail={request.volunteersNeeded ? 'necessárias' : 'sem número fixo'}
        />
      </dl>

      <ShareButton
        title={request.title}
        text={`${request.organization} precisa de ajuda: ${request.summary}`}
        className="mt-6"
      />
    </header>
  )
}

function MetaTile({
  label,
  value,
  detail,
  icon,
  highlight = false,
}: {
  label: string
  value: ReactNode
  detail?: ReactNode
  icon: ReactNode
  highlight?: boolean
}) {
  return (
    <div
      className={cn(
        'relative rounded-2xl bg-surface-raised p-4 pl-17 ring-1 ring-border',
        highlight && 'bg-urgent-soft ring-2 ring-urgent',
      )}
    >
      <dt className="text-xs font-bold tracking-wider text-ink-muted uppercase">
        <span
          className={cn(
            'absolute top-4 left-4 flex size-10 items-center justify-center rounded-full',
            highlight ? 'bg-urgent text-on-urgent' : 'bg-primary-soft text-primary',
          )}
        >
          {icon}
        </span>
        {label}
      </dt>
      <dd className="mt-0.5 font-semibold text-ink">{value}</dd>
      {detail && <dd className="text-sm text-ink-muted">{detail}</dd>}
    </div>
  )
}

function ClockIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path fillRule="evenodd" clipRule="evenodd" d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm.75 4a.75.75 0 0 0-1.5 0v4c0 .2.08.39.22.53l2.5 2.5a.75.75 0 1 0 1.06-1.06l-2.28-2.28V6Z" />
    </svg>
  )
}

function PeopleIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
      <path d="M7 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6Zm7 0a2.5 2.5 0 1 0 0-5 2.5 2.5 0 0 0 0 5ZM1 16c0-3 2.7-5 6-5s6 2 6 5v1H1v-1Zm13.5 1H19v-.5c0-2.4-1.9-4.2-4.6-4.5 1 .9 1.6 2.1 1.6 3.5V17h-1.5Z" />
    </svg>
  )
}

/* ------------------------------------------------------------------ */

function RequestBody({ request }: { request: HelpRequest }) {
  const aboutId = useId()
  const needsId = useId()
  const whereId = useId()
  const paragraphs = request.description
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean)

  return (
    <div className="flex min-w-0 flex-col gap-12 lg:col-start-1 lg:row-start-2">
      <HeroVisual request={request} />

      <section aria-labelledby={aboutId}>
        <h2 id={aboutId} className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Sobre a ação
        </h2>
        <div className="mt-4 flex max-w-prose flex-col gap-4 text-lg leading-relaxed text-ink">
          {paragraphs.length > 0 ? (
            paragraphs.map((p, i) => (
              <p key={i} className="whitespace-pre-line">
                {p}
              </p>
            ))
          ) : (
            <p className="text-ink-muted">{request.summary}</p>
          )}
        </div>
      </section>

      {request.needs && request.needs.length > 0 && (
        <section aria-labelledby={needsId}>
          <h2 id={needsId} className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
            O que é necessário
          </h2>
          <p className="mt-2 text-ink-muted">
            Você pode ajudar com um ou mais itens — combine os detalhes direto com quem publicou.
          </p>
          <ul className="mt-5 grid gap-3 sm:grid-cols-2">
            {request.needs.map((need) => (
              <li
                key={need}
                className="flex items-start gap-3 rounded-2xl bg-surface-raised p-4 font-medium text-ink ring-1 ring-border"
              >
                <span className="flex size-7 shrink-0 items-center justify-center rounded-full bg-primary text-on-primary">
                  <CheckIcon className="size-4" />
                </span>
                <span className="pt-0.5">{need}</span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby={whereId}>
        <h2 id={whereId} className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
          Onde
        </h2>
        <div className="mt-4 flex items-start gap-3">
          <span className="mt-0.5 flex size-10 shrink-0 items-center justify-center rounded-full bg-primary-soft text-primary">
            <PinIcon />
          </span>
          <div>
            <p className="text-lg font-semibold text-ink">{request.address}</p>
            <p className="text-ink-muted">
              Bairro {request.neighborhood} · {CITY.name} – {CITY.state}
            </p>
          </div>
        </div>
        <RequestLocationMap request={request} className="mt-5" />
      </section>
    </div>
  )
}

/** Foto enviada pelo criador ou, na falta dela, um painel ilustrado da categoria. */
function HeroVisual({ request }: { request: HelpRequest }) {
  const category = CATEGORIES[request.category]

  if (request.image) {
    return (
      <div data-anim="hero" className="overflow-hidden rounded-card bg-navy-50 shadow-card">
        <img
          src={request.image}
          alt={request.imageAlt ?? ''}
          decoding="async"
          className="aspect-video w-full object-cover sm:aspect-2/1"
        />
      </div>
    )
  }

  const c = category.pinColor
  const dots: Array<[number, number]> = []
  for (let row = 0; row < 5; row++) {
    for (let col = 0; col < 6; col++) dots.push([620 + col * 26, 40 + row * 26])
  }

  return (
    <div
      data-anim="hero"
      aria-hidden="true"
      className="relative aspect-video overflow-hidden rounded-card ring-1 ring-border sm:aspect-2/1"
      style={{
        background: `radial-gradient(circle at 18% 22%, ${c}33, transparent 55%), radial-gradient(circle at 85% 85%, ${c}29, transparent 50%), linear-gradient(135deg, #f0f4f8, #f8f3ea)`,
      }}
    >
      <svg
        viewBox="0 0 800 400"
        preserveAspectRatio="xMidYMid slice"
        className="absolute inset-0 size-full"
      >
        {dots.map(([x, y]) => (
          <circle key={`${x}-${y}`} cx={x} cy={y} r="3" fill={c} opacity="0.18" />
        ))}
        {/* ponte: o símbolo do Pontes */}
        <g fill="none" stroke={c} strokeLinecap="round">
          <path d="M-20 330 Q 400 110 820 330" strokeWidth="8" opacity="0.28" />
          <path d="M-20 340 H820" strokeWidth="6" opacity="0.22" />
          {[120, 220, 320, 480, 580, 680].map((x) => {
            const t = (x + 20) / 840
            const y = 330 - 4 * 220 * t * (1 - t)
            return <path key={x} d={`M${x} ${y + 6} V340`} strokeWidth="4" opacity="0.2" />
          })}
        </g>
        <circle cx="110" cy="90" r="46" fill="#ffffff" opacity="0.5" />
        <circle cx="700" cy="300" r="70" fill="#ffffff" opacity="0.35" />
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span
          className="flex size-28 items-center justify-center rounded-full bg-white/90 text-6xl sm:size-36 sm:text-7xl"
          style={{ boxShadow: `0 0 0 12px ${c}1f, 0 18px 40px -16px rgb(16 42 67 / 0.35)` }}
        >
          {category.emoji}
        </span>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */

function RequestNotFound() {
  return (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto flex max-w-xl flex-col items-center text-center">
        <svg aria-hidden="true" viewBox="0 0 200 160" className="w-48 sm:w-56">
          <ellipse cx="100" cy="140" rx="70" ry="10" fill="#d9e2ec" />
          <path
            d="M20 120 Q 100 40 180 120"
            fill="none"
            stroke="#95e3d5"
            strokeWidth="8"
            strokeLinecap="round"
          />
          <path d="M20 126 H180" stroke="#bcccdc" strokeWidth="6" strokeLinecap="round" />
          <circle cx="92" cy="62" r="30" fill="#ffffff" stroke="#102a43" strokeWidth="7" />
          <path d="m114 84 22 22" stroke="#102a43" strokeWidth="9" strokeLinecap="round" />
          <text
            x="92"
            y="74"
            textAnchor="middle"
            fontSize="32"
            fontWeight="800"
            fill="#0f766e"
            fontFamily="'Plus Jakarta Sans', sans-serif"
          >
            ?
          </text>
        </svg>
        <p className="mt-6 text-sm font-bold tracking-widest text-primary uppercase">
          Ação não encontrada
        </p>
        <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl">
          Não encontramos esta ação
        </h1>
        <p className="mt-4 text-lg text-ink-muted">
          Ela pode ter sido concluída, removida por quem a publicou, ou o link pode estar incompleto.
          Há muitas outras pessoas e instituições esperando por uma mão amiga.
        </p>
        <div className="mt-8 flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
          <ButtonLink to="/acoes" size="lg" className="w-full sm:w-auto">
            Ver ações abertas
          </ButtonLink>
          <ButtonLink to="/" variant="secondary" size="lg" className="w-full sm:w-auto">
            Voltar ao início
          </ButtonLink>
        </div>
      </div>
    </Container>
  )
}
