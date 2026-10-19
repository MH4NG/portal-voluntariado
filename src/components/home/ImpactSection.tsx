import { useRef, type ReactNode } from 'react'
import { CITY } from '../../config'
import { IMPACT_STATS, type ImpactStat } from '../../data/stats'
import { formatNumber } from '../../lib/format'
import { gsap, MOTION, useGSAP } from '../../lib/gsap'
import { ButtonLink } from '../ui/Button'
import { Container } from '../ui/Container'
import { SectionHeading } from '../ui/SectionHeading'

export function ImpactSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const numberRefs = useRef<Array<HTMLSpanElement | null>>([])

  useGSAP(
    () => {
      const mm = gsap.matchMedia()

      mm.add(MOTION.ok, () => {
        const list = listRef.current
        if (!list) return

        const tl = gsap.timeline({
          scrollTrigger: { trigger: list, start: 'top 80%', once: true },
        })

        tl.from('[data-impact="card"]', {
          opacity: 0,
          y: 40,
          duration: 0.9,
          ease: 'power3.out',
          stagger: 0.12,
        })

        // Contadores: tween em um objeto simples e escrita direta no DOM (sem re-render do React)
        IMPACT_STATS.forEach((stat, i) => {
          const el = numberRefs.current[i]
          if (!el) return
          const counter = { val: 0 }
          // Reserva a largura do valor final para que os dígitos não "pulem" durante a contagem
          el.style.minWidth = `${el.getBoundingClientRect().width}px`
          el.textContent = formatNumber(0)
          tl.to(
            counter,
            {
              val: stat.value,
              duration: 2,
              ease: 'power2.out',
              onUpdate: () => {
                el.textContent = formatNumber(counter.val)
              },
              onComplete: () => {
                el.textContent = formatNumber(stat.value)
              },
            },
            0.15 + i * 0.12,
          )
        })

        // Ao reverter (ex.: preferência de movimento alterada), restaura os valores finais
        return () => {
          IMPACT_STATS.forEach((stat, i) => {
            const el = numberRefs.current[i]
            if (!el) return
            el.textContent = formatNumber(stat.value)
            el.style.minWidth = ''
          })
        }
      })

      return () => mm.revert()
    },
    { scope: sectionRef },
  )

  return (
    <section
      ref={sectionRef}
      id="impacto"
      aria-labelledby="impacto-title"
      className="relative isolate overflow-hidden bg-surface-inverse text-ink-inverse"
    >
      <ImpactBackdrop />

      <Container className="relative pt-24 pb-20 sm:pt-32 sm:pb-28 lg:pt-36 lg:pb-32">
        <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
          <SectionHeading
            id="impacto-title"
            inverse
            eyebrow="Nosso impacto"
            title="A cidade que se ajuda"
            description={`Cada número aqui é uma história de vizinhança: gente de ${CITY.name} que encontrou, pelo Pontes, um jeito de cuidar de quem está por perto.`}
          />
          <ButtonLink to="/cadastro?perfil=voluntario" variant="inverse" className="self-start lg:self-auto">
            Faça parte desses números
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              className="size-5"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
              focusable="false"
            >
              <path d="M4 10h12M11 5l5 5-5 5" />
            </svg>
          </ButtonLink>
        </div>

        <ul
          ref={listRef}
          role="list"
          className="mt-12 grid grid-cols-1 gap-4 sm:mt-14 sm:grid-cols-2 sm:gap-6 lg:grid-cols-4"
        >
          {IMPACT_STATS.map((stat, i) => (
            <ImpactCard
              key={stat.id}
              stat={stat}
              numberRef={(el) => {
                numberRefs.current[i] = el
              }}
            />
          ))}
        </ul>

        <p className="mt-8 text-sm text-ink-inverse-muted">
          Dados de demonstração do projeto-piloto do Pontes em {CITY.name}.
        </p>
      </Container>
    </section>
  )
}

interface ImpactCardProps {
  stat: ImpactStat
  numberRef: (el: HTMLSpanElement | null) => void
}

function ImpactCard({ stat, numberRef }: ImpactCardProps) {
  const finalText = formatNumber(stat.value)
  const prefix = stat.prefix ?? ''
  const suffix = stat.suffix ?? ''

  return (
    <li
      data-impact="card"
      className="relative flex h-full flex-col overflow-hidden rounded-card border border-white/10 bg-white/4 p-6 shadow-card backdrop-blur-sm sm:p-7"
    >
      <span
        aria-hidden="true"
        className="absolute inset-x-6 top-0 h-px bg-linear-to-r from-transparent via-teal-300/70 to-transparent"
      />
      <span
        aria-hidden="true"
        className="grid size-12 place-items-center rounded-2xl bg-teal-400/15 text-teal-200 ring-1 ring-teal-300/20"
      >
        {STAT_ICONS[stat.id] ?? DEFAULT_ICON}
      </span>

      <p className="mt-6">
        {/* Número animado: apenas visual. O valor final fica no texto sr-only ao lado. */}
        <span
          aria-hidden="true"
          className="flex items-baseline gap-1 font-display text-5xl leading-none font-extrabold tracking-tight text-ink-inverse tabular-nums"
        >
          {prefix.trim() && <span className="text-3xl text-teal-200">{prefix.trim()}</span>}
          <span
            ref={numberRef}
            className="inline-block text-left"
          >
            {finalText}
          </span>
          {suffix.trim() && <span className="text-2xl font-bold text-teal-200">{suffix.trim()}</span>}
        </span>
        <span className="sr-only">{`${prefix}${finalText}${suffix} `}</span>
        <span className="mt-3 block text-base font-semibold text-teal-100">{stat.label}</span>
      </p>

      <p className="mt-2 text-sm leading-relaxed text-ink-inverse-muted">{stat.description}</p>
    </li>
  )
}

/** Fundo decorativo: arco superior (continuação do Hero), brilhos e arcos de ponte. */
function ImpactBackdrop() {
  return (
    <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10 overflow-hidden">
      <div className="absolute top-8 left-1/4 size-112 rounded-full bg-teal-500/15 blur-3xl" />
      <div className="absolute -right-32 -bottom-40 size-128 rounded-full bg-teal-400/10 blur-3xl" />
      <svg
        viewBox="0 0 1200 400"
        preserveAspectRatio="xMidYMax slice"
        className="absolute inset-x-0 bottom-0 h-64 w-full text-white/5 sm:h-80"
        focusable="false"
      >
        <g fill="none" stroke="currentColor" strokeWidth={2}>
          <path d="M-40 400 Q300 40 640 400" />
          <path d="M560 400 Q900 40 1240 400" />
          <path d="M120 400 Q300 200 480 400" />
          <path d="M720 400 Q900 200 1080 400" />
        </g>
      </svg>
      {/* Arco superior desenhado por último para ficar acima dos brilhos */}
      <svg
        viewBox="0 0 1440 64"
        preserveAspectRatio="none"
        className="absolute inset-x-0 top-0 block h-10 w-full text-surface sm:h-16"
        focusable="false"
      >
        <path d="M0 0H1440V10C1080 64 360 64 0 10Z" fill="currentColor" />
      </svg>
    </div>
  )
}

const iconProps = {
  viewBox: '0 0 24 24',
  className: 'size-6',
  fill: 'none',
  stroke: 'currentColor',
  strokeWidth: 1.9,
  strokeLinecap: 'round',
  strokeLinejoin: 'round',
  focusable: 'false',
} as const

const STAT_ICONS: Record<string, ReactNode> = {
  voluntarios: (
    <svg {...iconProps}>
      <path d="M16 20v-1.5a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4V20" />
      <circle cx="9" cy="7.5" r="3.5" />
      <path d="M22 20v-1.5a4 4 0 0 0-3-3.87" />
      <path d="M16 4.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  alimentos: (
    <svg {...iconProps}>
      <path d="M3 10h18l-1.6 8.4a2 2 0 0 1-2 1.6H6.6a2 2 0 0 1-2-1.6Z" />
      <path d="m8 10 3.2-6M16 10l-3.2-6" />
      <path d="M9 14v2.5M12 14v2.5M15 14v2.5" />
    </svg>
  ),
  acoes: (
    <svg {...iconProps}>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 2.8 2.8L16.5 9.5" />
    </svg>
  ),
  instituicoes: (
    <svg {...iconProps}>
      <path d="M3 21h18" />
      <path d="M5 21V8l7-4 7 4v13" />
      <path d="M9 21v-5h6v5" />
      <path d="M9 11h.01M12 11h.01M15 11h.01" />
    </svg>
  ),
}

const DEFAULT_ICON = (
  <svg {...iconProps}>
    <path d="M12 20s-7-4.3-9-8.7C1.6 8.1 3.6 4.5 7.1 4.5c2 0 3.4 1 4.1 2.3h1.6c.7-1.3 2.1-2.3 4.1-2.3 3.5 0 5.5 3.6 4.1 6.8C19 15.7 12 20 12 20Z" />
  </svg>
)
