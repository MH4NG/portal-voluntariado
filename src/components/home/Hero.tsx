import { Fragment, useRef } from 'react'
import { Link } from 'react-router-dom'
import { CITY } from '../../config'
import { useRequests } from '../../context/RequestsContext'
import { CATEGORIES } from '../../data/categories'
import { IMPACT_STATS } from '../../data/stats'
import { formatNumber } from '../../lib/format'
import { gsap, MOTION, useGSAP } from '../../lib/gsap'
import type { HelpRequest } from '../../types'
import { ButtonLink } from '../ui/Button'
import { Container } from '../ui/Container'
import { HeroPhotoKitchen, HeroPhotoPlanting, HeroScene } from './HeroIllustration'

const TITLE_WORDS = ['Ajudar', 'começa', 'com', 'uma']
const TITLE_HIGHLIGHT = 'ponte'
const TITLE_TEXT = `${TITLE_WORDS.join(' ')} ${TITLE_HIGHLIGHT}.`

const AVATARS = [
  { initials: 'AM', className: 'bg-teal-600 text-white' },
  { initials: 'JP', className: 'bg-navy-700 text-white' },
  { initials: 'LS', className: 'bg-teal-200 text-teal-900' },
  { initials: 'RC', className: 'bg-sand-200 text-navy-800' },
]

function statValue(id: string): number | undefined {
  return IMPACT_STATS.find((s) => s.id === id)?.value
}

export function Hero() {
  const sectionRef = useRef<HTMLElement>(null)
  const { urgentRequests } = useRequests()
  const urgent = urgentRequests(1)[0]

  const volunteers = statValue('voluntarios')
  const partners = statValue('instituicoes')
  const completed = statValue('acoes')

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MOTION.ok, () => {
        // Entrada em cascata: tudo já está visível no DOM; gsap.from só anima a partir do estado oculto.
        const tl = gsap.timeline({ defaults: { ease: 'power3.out', duration: 0.9 } })
        tl.from('[data-hero="eyebrow"]', { opacity: 0, y: 16, duration: 0.7 })
          .from('[data-hero="word"]', { opacity: 0, yPercent: 45, stagger: 0.08 }, '-=0.45')
          .from(
            '[data-hero="underline"]',
            { opacity: 0, scaleX: 0, transformOrigin: '0% 50%', duration: 0.7, ease: 'power2.out' },
            '-=0.35',
          )
          .from('[data-hero="lead"]', { opacity: 0, y: 20 }, '-=0.55')
          .from('[data-hero="cta"]', { opacity: 0, y: 20, stagger: 0.12 }, '-=0.65')
          .from('[data-hero="trust"]', { opacity: 0, y: 16 }, '-=0.6')
          .from('[data-hero="scene"]', { opacity: 0, y: 48, duration: 1.1 }, 0.3)
          .from('[data-hero="photo"]', { opacity: 0, y: 36, stagger: 0.14 }, 0.6)
          .from('[data-hero="floating"]', { opacity: 0, y: 24, stagger: 0.15 }, 0.85)

        // Flutuação curta e finita (WCAG 2.2.2): cada movimento termina em repouso em menos de 5 s
        gsap.utils.toArray<HTMLElement>('[data-hero="float"]').forEach((el, i) => {
          gsap.to(el, {
            y: i % 2 === 0 ? -10 : 8,
            duration: 1.1,
            ease: 'sine.inOut',
            repeat: 1,
            yoyo: true,
            delay: 1.2 + i * 0.3,
          })
        })
        gsap.to('[data-hero="heart"]', {
          scale: 1.18,
          transformOrigin: '50% 50%',
          duration: 0.6,
          ease: 'sine.inOut',
          repeat: 3,
          yoyo: true,
          delay: 1.4,
        })
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      id="inicio"
      aria-labelledby="hero-title"
      className="relative isolate overflow-hidden bg-surface"
    >
      <HeroBackdrop />

      <Container className="grid items-center gap-y-14 pt-12 pb-20 sm:pt-16 sm:pb-24 lg:grid-cols-12 lg:gap-x-10 lg:pt-20 lg:pb-28">
        {/* Coluna de texto */}
        <div className="lg:col-span-6">
          <p
            data-hero="eyebrow"
            className="inline-flex items-center gap-2.5 rounded-full bg-surface-raised/90 px-4 py-2 text-sm font-semibold text-teal-700 shadow-sm ring-1 ring-teal-200"
          >
            <span aria-hidden="true" className="relative flex size-2.5">
              <span className="absolute inline-flex size-full rounded-full bg-teal-400 opacity-70 motion-safe:animate-ping motion-safe:[animation-iteration-count:3]" />
              <span className="relative inline-flex size-2.5 rounded-full bg-teal-500" />
            </span>
            Voluntariado em {CITY.name}
          </p>

          <h1
            id="hero-title"
            className="mt-6 text-[2.5rem] leading-[1.04] font-extrabold tracking-tight text-ink sm:text-6xl sm:leading-[1.02] lg:text-7xl"
          >
            {/* Texto íntegro para leitores de tela; a versão visual é dividida em palavras para a animação */}
            <span className="sr-only">{TITLE_TEXT}</span>
            <span aria-hidden="true">
              {TITLE_WORDS.map((word) => (
                <Fragment key={word}>
                  <span data-hero="word" className="inline-block">
                    {word}
                  </span>{' '}
                </Fragment>
              ))}
              <span data-hero="word" className="inline-block whitespace-nowrap">
                <span className="relative inline-block">
                  <svg
                    data-hero="underline"
                    viewBox="0 0 120 20"
                    preserveAspectRatio="none"
                    className="absolute -bottom-[0.16em] left-[-0.04em] h-[0.34em] w-[calc(100%+0.08em)] text-teal-200"
                    focusable="false"
                  >
                    <path
                      d="M4 17 Q60 -6 116 17"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth={7}
                      strokeLinecap="round"
                      vectorEffect="non-scaling-stroke"
                    />
                  </svg>
                  <span className="relative text-primary">{TITLE_HIGHLIGHT}</span>
                </span>
                <span className="-ml-[0.04em]">.</span>
              </span>
            </span>
          </h1>

          <p data-hero="lead" className="mt-6 max-w-xl text-lg leading-relaxed text-ink-muted sm:text-xl">
            O Pontes conecta quem precisa de ajuda a quem quer ajudar, aqui em {CITY.name}. Encontre ações
            perto de você, ofereça seu tempo ou peça apoio — sem burocracia e com contato direto.
          </p>

          <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
            <ButtonLink
              data-hero="cta"
              to="/cadastro?perfil=voluntario"
              variant="primary"
              size="lg"
              className="w-full shadow-card sm:w-auto"
            >
              <HeartIcon />
              Quero Ajudar
            </ButtonLink>
            <ButtonLink
              data-hero="cta"
              to="/cadastro?perfil=beneficiario"
              variant="secondary"
              size="lg"
              className="w-full sm:w-auto"
            >
              <HandIcon />
              Preciso de Ajuda
            </ButtonLink>
          </div>

          <p data-hero="cta" className="mt-3 text-base text-ink-muted">
            Só quer conhecer?{' '}
            <Link
              to="/acoes"
              className="group inline-flex min-h-12 items-center gap-1.5 rounded-md font-semibold text-ink underline decoration-teal-300 decoration-2 underline-offset-4 transition-colors hover:decoration-primary focus-ring"
            >
              Veja as ações no mapa
              <ArrowIcon className="size-4 transition-transform group-hover:translate-x-0.5" />
            </Link>
          </p>

          <div
            data-hero="trust"
            className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5 border-t border-border pt-6"
          >
            {volunteers !== undefined && (
              <div className="flex items-center gap-3">
                <div aria-hidden="true" className="flex -space-x-1.5">
                  {AVATARS.map((a) => (
                    <span
                      key={a.initials}
                      className={`grid size-10 place-items-center rounded-full text-[0.6875rem] font-bold ring-2 ring-surface ${a.className}`}
                    >
                      {a.initials}
                    </span>
                  ))}
                </div>
                <p className="text-sm leading-snug text-ink-muted">
                  <strong className="block font-display text-base font-bold text-ink">
                    {formatNumber(volunteers)} voluntários
                  </strong>
                  já cadastrados em {CITY.name}
                </p>
              </div>
            )}
            {partners !== undefined && (
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="grid size-10 place-items-center rounded-full bg-primary-soft text-primary ring-1 ring-teal-100"
                >
                  <BuildingIcon />
                </span>
                <p className="text-sm leading-snug text-ink-muted">
                  <strong className="block font-display text-base font-bold text-ink">
                    {formatNumber(partners)} instituições
                  </strong>
                  parceiras na rede
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Coluna visual */}
        <div className="relative mx-auto w-full max-w-xl sm:pb-12 lg:col-span-6 lg:max-w-none lg:pb-8">
          <div
            data-hero="scene"
            className="relative overflow-hidden rounded-[2rem] bg-teal-50 shadow-raised ring-1 ring-navy-900/5"
          >
            <HeroScene
              className="block h-auto w-full"
              label="Ilustração: uma ponte em arco sobre um rio liga dois bairros de Petrópolis, com as montanhas da serra ao fundo. Pessoas de diferentes idades, uma delas em cadeira de rodas, atravessam a ponte e se encontram no meio, com um coração acima delas. Ao redor há casas, árvores da Mata Atlântica, hortênsias, a Catedral e o Palácio de Cristal."
            />
          </div>

          {/* Colagem de "fotos" ilustradas de ações sociais */}
          <figure
            data-hero="photo"
            className="absolute bottom-20 -left-3 hidden w-36 -rotate-6 rounded-2xl bg-surface-raised p-2 pb-2.5 shadow-raised ring-1 ring-navy-900/5 sm:block lg:bottom-6 lg:-left-10 lg:w-40"
          >
            <HeroPhotoPlanting
              className="block h-auto w-full rounded-xl"
              label="Ilustração: duas pessoas plantam e regam uma muda de árvore."
            />
            <figcaption className="mt-2 px-1 text-xs font-semibold text-ink">Mutirão de plantio no Siméria</figcaption>
          </figure>
          <figure
            data-hero="photo"
            className="absolute -top-6 -right-3 hidden w-40 rotate-[5deg] rounded-2xl bg-surface-raised p-2 pb-2.5 shadow-raised ring-1 ring-navy-900/5 sm:block lg:-right-3 lg:w-44"
          >
            <HeroPhotoKitchen
              className="block h-auto w-full rounded-xl"
              label="Ilustração: voluntárias de avental servem comida de uma panela grande, ao lado de marmitas."
            />
            <figcaption className="mt-2 px-1 text-xs font-semibold text-ink">Cozinha solidária no Alto da Serra</figcaption>
          </figure>

          {/* Cartões flutuantes */}
          {completed !== undefined && (
            <div data-hero="floating" className="absolute top-6 left-4 hidden sm:block lg:top-10 lg:-left-6">
              <div
                data-hero="float"
                className="flex items-center gap-3 rounded-2xl border border-white/70 bg-white/85 px-4 py-3 shadow-raised backdrop-blur-md"
              >
                <span aria-hidden="true" className="grid size-9 place-items-center rounded-full bg-primary-soft text-primary">
                  <CheckIcon />
                </span>
                <p className="text-sm leading-tight text-ink-muted">
                  <strong className="block font-display text-lg font-extrabold text-ink tabular-nums">
                    {formatNumber(completed)}
                  </strong>
                  ações concluídas
                </p>
              </div>
            </div>
          )}

          {urgent && (
            <div
              data-hero="floating"
              className="relative z-10 mx-3 -mt-10 sm:absolute sm:right-6 sm:-bottom-2 sm:mx-0 sm:mt-0 sm:w-80 lg:right-2 lg:-bottom-4"
            >
              <div data-hero="float">
                <HeroUrgentCard request={urgent} />
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}

function HeroUrgentCard({ request }: { request: HelpRequest }) {
  const category = CATEGORIES[request.category]
  const urgentLabel = request.urgency === 'alta' ? 'Nova chamada urgente' : 'Chamada em destaque'

  return (
    <Link
      to={`/acoes/${request.id}`}
      className="group flex min-h-12 items-start gap-3 rounded-2xl border border-white/70 bg-white/90 p-4 shadow-raised backdrop-blur-md transition-colors hover:bg-white focus-ring"
    >
      <span
        aria-hidden="true"
        className="mt-0.5 grid size-10 shrink-0 place-items-center rounded-xl bg-urgent text-on-urgent"
      >
        <MegaphoneIcon />
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-1.5 text-xs font-bold tracking-wider text-urgent-ink uppercase">
          {urgentLabel}
        </span>
        <span className="mt-1 line-clamp-2 block font-display text-[0.95rem] leading-snug font-bold text-ink group-hover:underline">
          {request.title}
        </span>
        <span className="mt-1 block text-sm text-ink-muted">
          <span aria-hidden="true">{category.emoji} </span>
          {request.neighborhood}
          {request.volunteersNeeded ? ` · precisa de ${request.volunteersNeeded} ${request.volunteersNeeded === 1 ? 'pessoa' : 'pessoas'}` : ''}
        </span>
      </span>
      <ArrowIcon className="mt-1 size-5 shrink-0 text-ink-muted transition-transform group-hover:translate-x-0.5" />
    </Link>
  )
}

/** Fundo decorativo: manchas de cor suaves + grade de pontos com máscara radial. */
function HeroBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute -top-40 -right-32 size-120 rounded-full bg-teal-100/80 blur-3xl sm:size-160" />
      <div className="absolute top-1/3 -left-48 size-104 rounded-full bg-sand-200/70 blur-3xl" />
      <div className="absolute right-1/4 bottom-16 size-96 rounded-full bg-navy-100/40 blur-3xl" />
      <svg
        className="absolute inset-0 h-full w-full text-navy-900/7 [mask-image:radial-gradient(ellipse_70%_60%_at_70%_30%,black,transparent)]"
        focusable="false"
      >
        <defs>
          <pattern id="hero-dots" width="22" height="22" patternUnits="userSpaceOnUse">
            <circle cx="2" cy="2" r="1.4" fill="currentColor" />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#hero-dots)" />
      </svg>
    </div>
  )
}

/* Ícones decorativos (sempre aria-hidden) */

function HeartIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 24 24" className="size-5" fill="currentColor" focusable="false">
      <path d="M12 21s-7.5-4.6-9.6-9.3C.9 8.3 3 4.5 6.8 4.5c2.1 0 3.6 1.1 4.4 2.5h1.6c.8-1.4 2.3-2.5 4.4-2.5 3.8 0 5.9 3.8 4.4 7.2C19.5 16.4 12 21 12 21Z" />
    </svg>
  )
}

function HandIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M18 11V6a2 2 0 0 0-4 0v5" />
      <path d="M14 10V4a2 2 0 0 0-4 0v6" />
      <path d="M10 10.5V6a2 2 0 0 0-4 0v8" />
      <path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.86-5.99-2.34l-3.6-3.6a2 2 0 0 1 2.83-2.82L7 15" />
    </svg>
  )
}

function ArrowIcon({ className }: { className?: string }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={className}
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M4 10h12M11 5l5 5-5 5" />
    </svg>
  )
}

function BuildingIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-5h6v5" />
      <path d="M9 11h.01M12 11h.01M15 11h.01" />
    </svg>
  )
}

function CheckIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2.4}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="m5 12.5 4.5 4.5L19 7.5" />
    </svg>
  )
}

function MegaphoneIcon() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 24 24"
      className="size-5"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
      focusable="false"
    >
      <path d="M3 11v2a1 1 0 0 0 1 1h2l5 4V6L6 10H4a1 1 0 0 0-1 1Z" />
      <path d="M15.5 8.5a5 5 0 0 1 0 7" />
      <path d="M18.5 5.5a9 9 0 0 1 0 13" />
    </svg>
  )
}
