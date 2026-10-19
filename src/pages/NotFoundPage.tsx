import { useRef } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { gsap, MOTION, useGSAP } from '../lib/gsap'
import { usePageTitle } from '../lib/usePageTitle'

/** Ilustração: uma ponte partida ao meio sobre o rio, com uma tábua caindo e o trecho a reconstruir tracejado. */
function BrokenBridgeIllustration() {
  return (
    <svg
      viewBox="0 0 520 340"
      role="img"
      aria-labelledby="ponte-partida-titulo"
      className="h-auto w-full max-w-xl"
    >
      <title id="ponte-partida-titulo">
        Ilustração de uma ponte partida ao meio sobre um rio, com uma placa escrita 404
      </title>

      {/* Céu e sol */}
      <rect x="8" y="8" width="504" height="324" rx="36" fill="#effcf9" />
      <circle cx="404" cy="86" r="42" fill="#fef3c7" />
      <circle cx="404" cy="86" r="26" fill="#fde68a" />

      {/* Nuvens */}
      <g fill="#ffffff">
        <rect x="64" y="58" width="96" height="26" rx="13" />
        <rect x="88" y="44" width="48" height="30" rx="15" />
        <rect x="284" y="40" width="74" height="20" rx="10" />
      </g>

      {/* Pássaros */}
      <g fill="none" stroke="#486581" strokeWidth="2.5" strokeLinecap="round">
        <path data-bird d="M206 66q7-7 14 0q7-7 14 0" />
        <path data-bird d="M240 88q5-5 10 0q5-5 10 0" />
      </g>

      {/* Rio */}
      <path d="M8 246h504v50a36 36 0 0 1-36 36H44a36 36 0 0 1-36-36Z" fill="#c8f2ea" />
      <g fill="none" stroke="#5ccbbb" strokeWidth="3" strokeLinecap="round">
        <path d="M188 272q12-8 24 0t24 0" />
        <path d="M276 292q12-8 24 0t24 0" />
        <path d="M214 314q10-7 20 0t20 0" />
      </g>

      {/* Margens */}
      <path d="M8 196h146l26 136H44a36 36 0 0 1-36-36Z" fill="#243b53" />
      <path d="M512 196H366l-26 136h136a36 36 0 0 0 36-36Z" fill="#243b53" />
      <path d="M8 196h146M366 196h146" stroke="#2fae9f" strokeWidth="6" strokeLinecap="round" />

      {/* Placa 404 */}
      <path d="M72 196v-42" stroke="#102a43" strokeWidth="6" strokeLinecap="round" />
      <rect x="36" y="118" width="72" height="40" rx="10" fill="#fbbf24" />
      <text
        x="72"
        y="146"
        textAnchor="middle"
        fontFamily="'Plus Jakarta Sans', Inter, sans-serif"
        fontSize="22"
        fontWeight="800"
        fill="#0a1c2e"
      >
        404
      </text>

      {/* Arco (partido) */}
      <g fill="none" stroke="#179286" strokeWidth="9" strokeLinecap="round">
        <path d="M152 188Q190 122 236 112" />
        <path d="M368 188Q330 122 284 112" />
      </g>

      {/* Tirantes */}
      <g stroke="#95e3d5" strokeWidth="4" strokeLinecap="round">
        <path d="M176 186v-38M200 186v-58M222 186v-68" />
        <path d="M344 186v-38M320 186v-58M298 186v-68" />
      </g>

      {/* Tabuleiro: duas metades com bordas quebradas */}
      <path d="M150 184h80l8 6-9 5 6 7h-85Z" fill="#334e68" />
      <path d="M370 184h-80l-8 6 9 5-6 7h85Z" fill="#334e68" />
      <path d="M150 184h80M370 184h-80" stroke="#fbbf24" strokeWidth="3" strokeLinecap="round" />

      {/* O trecho que falta construir */}
      <path
        d="M240 193h40"
        stroke="#627d98"
        strokeWidth="3"
        strokeLinecap="round"
        strokeDasharray="2 8"
      />

      {/* Tábua caindo */}
      <g data-plank>
        <g transform="rotate(16 262 236)">
          <rect x="244" y="230" width="36" height="11" rx="3" fill="#fbbf24" />
          <path d="M252 230v11M262 230v11M272 230v11" stroke="#d97706" strokeWidth="2" />
        </g>
        <g stroke="#829ab1" strokeWidth="2.5" strokeLinecap="round">
          <path d="M250 214v-8M262 212v-12M274 216v-8" />
        </g>
      </g>
    </svg>
  )
}

export function NotFoundPage() {
  usePageTitle('Página não encontrada')
  const { pathname } = useLocation()
  const containerRef = useRef<HTMLDivElement>(null)

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        gsap.from('[data-reveal]', {
          opacity: 0,
          y: 18,
          duration: 0.6,
          ease: 'power3.out',
          stagger: 0.08,
        })
        gsap.from('[data-illustration]', { opacity: 0, scale: 0.96, duration: 0.8, ease: 'power3.out' })
        // Balanço curto e finito da tábua (~4,4 s, termina em repouso — WCAG 2.2.2).
        gsap.set('[data-plank]', { svgOrigin: '262 236' })
        gsap
          .timeline({ delay: 0.4, defaults: { ease: 'sine.inOut' } })
          .to('[data-plank]', { y: -6, rotation: -3, duration: 0.7 })
          .to('[data-plank]', { y: 4, rotation: 3, duration: 1.4 })
          .to('[data-plank]', { y: -3, rotation: -1.5, duration: 1.1 })
          .to('[data-plank]', { y: 0, rotation: 0, duration: 0.8 })
        gsap.from('[data-bird]', { x: -10, opacity: 0, duration: 1, ease: 'power2.out', stagger: 0.2, delay: 0.3 })
      })
      return () => mm.revert()
    },
    { scope: containerRef },
  )

  return (
    <section aria-labelledby="nao-encontrada-titulo" className="relative overflow-hidden">
      <Container className="py-12 sm:py-20 lg:py-24">
        <div
          ref={containerRef}
          className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16"
        >
          <div className="order-2 lg:order-1">
            <p
              data-reveal
              className="inline-flex items-center gap-2 rounded-full bg-primary-soft px-4 py-1.5 text-sm font-bold tracking-widest text-primary uppercase"
            >
              Erro 404
            </p>
            <h1
              id="nao-encontrada-titulo"
              data-reveal
              className="mt-5 text-4xl font-extrabold tracking-tight text-ink sm:text-5xl"
            >
              Esta ponte ainda não chegou até aqui
            </h1>
            <p data-reveal className="mt-5 max-w-xl text-lg leading-relaxed text-ink-muted">
              Não encontramos a página que você procurou. Ela pode ter mudado de endereço ou nunca
              ter existido. Mas não se preocupe: ainda há muitos caminhos para ajudar e ser ajudado.
            </p>
            {pathname !== '/' && (
              <p data-reveal className="mt-4 text-sm text-ink-muted">
                Endereço procurado:{' '}
                <code className="rounded-md bg-surface-muted px-2 py-1 font-mono text-ink break-all">
                  {pathname}
                </code>
              </p>
            )}
            <div data-reveal className="mt-8 flex flex-col gap-3 sm:flex-row">
              <ButtonLink to="/" size="lg">
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="size-5">
                  <path d="M3.5 9.5 10 4l6.5 5.5M5.5 8v8h9V8" />
                </svg>
                Voltar para o início
              </ButtonLink>
              <ButtonLink to="/acoes" variant="secondary" size="lg">
                Ver ações perto de você
              </ButtonLink>
            </div>
            <p data-reveal className="mt-8 text-ink-muted">
              Acha que algo deveria estar aqui?{' '}
              <Link
                to={{ hash: '#contato' }}
                className="inline-flex min-h-12 items-center rounded-md font-semibold text-primary underline underline-offset-4 hover:text-primary-hover focus-ring"
              >
                Fale com a prefeitura
              </Link>
            </p>
          </div>

          <div data-illustration className="order-1 flex justify-center lg:order-2">
            <BrokenBridgeIllustration />
          </div>
        </div>
      </Container>
    </section>
  )
}
