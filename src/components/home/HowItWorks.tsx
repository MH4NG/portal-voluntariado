import { useId, useRef, useState, type KeyboardEvent } from 'react'
import { cn } from '../../lib/cn'
import { gsap, MOTION, ScrollTrigger, useGSAP } from '../../lib/gsap'
import { ButtonLink } from '../ui/Button'
import { Container } from '../ui/Container'
import { SectionHeading } from '../ui/SectionHeading'
import { JOURNEYS, type JourneyId } from './HowItWorksData'
import { HowItWorksTimeline } from './HowItWorksTimeline'

/**
 * Seção "Como funciona" (#como-funciona).
 * Duas jornadas apresentadas no padrão WAI-ARIA de abas (ativação automática,
 * tabindex itinerante, setas/Home/End). Cada jornada é uma linha do tempo cujos
 * passos são revelados conforme a rolagem (GSAP + ScrollTrigger, scrub).
 */
export function HowItWorks() {
  const containerRef = useRef<HTMLElement>(null)
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([])
  const [activeTab, setActiveTab] = useState<JourneyId>('voluntario')
  const baseId = useId()

  const tabId = (id: JourneyId) => `${baseId}-aba-${id}`
  const panelId = (id: JourneyId) => `${baseId}-painel-${id}`

  function selectByIndex(index: number) {
    const count = JOURNEYS.length
    const next = JOURNEYS[(index + count) % count]
    setActiveTab(next.id)
    tabRefs.current[(index + count) % count]?.focus()
  }

  function handleTabKeyDown(event: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (event.key) {
      case 'ArrowRight':
        selectByIndex(index + 1)
        break
      case 'ArrowLeft':
        selectByIndex(index - 1)
        break
      case 'Home':
        selectByIndex(0)
        break
      case 'End':
        selectByIndex(JOURNEYS.length - 1)
        break
      default:
        return
    }
    event.preventDefault()
  }

  useGSAP(
    () => {
      const root = containerRef.current
      const panel = root?.querySelector<HTMLElement>(`[data-panel="${activeTab}"]`)
      const mm = gsap.matchMedia()

      mm.add({ motion: MOTION.ok, lg: '(min-width: 1024px)' }, (context) => {
        const { motion, lg } = context.conditions ?? {}
        if (!motion || !panel) return

        const distance = lg ? 60 : 24

        // Linha de conexão desenhada de cima para baixo ao longo de toda a lista
        const timeline = panel.querySelector('[data-timeline]')
        const progress = panel.querySelector('[data-timeline-progress]')
        if (timeline && progress) {
          gsap.fromTo(
            progress,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: timeline, start: 'top 70%', end: 'bottom 60%', scrub: 0.6 },
            },
          )
        }

        // Cada passo entra com fade + deslize lateral controlado pela rolagem
        panel.querySelectorAll<HTMLElement>('[data-step]').forEach((step, index) => {
          const direction = index % 2 === 0 ? -1 : 1
          const card = step.querySelector('[data-step-card]')
          const node = step.querySelector('[data-step-node]')
          const numeral = step.querySelector('[data-step-numeral]')

          const tl = gsap.timeline({
            scrollTrigger: { trigger: step, start: 'top 85%', end: 'top 55%', scrub: 0.6 },
          })
          if (node) tl.from(node, { opacity: 0, scale: 0.4, ease: 'back.out(2)' }, 0)
          if (card) tl.from(card, { opacity: 0, x: direction * distance, ease: 'power2.out' }, 0)
          if (numeral && lg) {
            tl.from(numeral, { opacity: 0, x: -direction * distance * 0.6, ease: 'power2.out' }, 0.1)
          }
        })
      })

      // A altura do painel muda entre as abas: recalcula todos os gatilhos da página
      ScrollTrigger.refresh()

      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [activeTab], revertOnUpdate: true },
  )

  return (
    <section
      ref={containerRef}
      id="como-funciona"
      aria-labelledby="como-funciona-title"
      className="relative overflow-clip bg-surface py-20 sm:py-28"
    >
      {/* Decoração de fundo */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-24 -right-24 size-96 rounded-full bg-teal-100/50 blur-3xl" />
        <div className="absolute bottom-0 -left-32 size-80 rounded-full bg-sand-200/60 blur-3xl" />
      </div>

      <Container className="relative">
        <SectionHeading
          id="como-funciona-title"
          eyebrow="Passo a passo"
          title="Como funciona"
          description="Em poucos passos, quem quer ajudar encontra quem precisa — sem intermediários, sem burocracia e sem custo."
          align="center"
        />

        {/* Abas das jornadas */}
        <div className="mt-10 flex justify-center sm:mt-12">
          <div
            role="tablist"
            aria-label="Escolha a sua jornada"
            className="grid w-full max-w-xl grid-cols-2 gap-1.5 rounded-full bg-surface-raised p-1.5 shadow-card ring-1 ring-border"
          >
            {JOURNEYS.map((journey, index) => {
              const selected = journey.id === activeTab
              const TabIcon = journey.tabIcon
              return (
                <button
                  key={journey.id}
                  ref={(el) => {
                    tabRefs.current[index] = el
                  }}
                  type="button"
                  role="tab"
                  id={tabId(journey.id)}
                  aria-selected={selected}
                  aria-controls={panelId(journey.id)}
                  tabIndex={selected ? 0 : -1}
                  onClick={() => setActiveTab(journey.id)}
                  onKeyDown={(event) => handleTabKeyDown(event, index)}
                  className={cn(
                    'focus-ring inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full px-3 py-2',
                    'text-sm leading-tight font-semibold transition-colors duration-200 sm:px-5 sm:text-base',
                    selected
                      ? 'bg-surface-inverse text-ink-inverse shadow-card'
                      : 'text-ink hover:bg-navy-50',
                  )}
                >
                  <TabIcon className="hidden size-5 shrink-0 min-[400px]:block" />
                  <span>{journey.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {JOURNEYS.map((journey) => {
          const selected = journey.id === activeTab
          return (
            <div
              key={journey.id}
              role="tabpanel"
              id={panelId(journey.id)}
              aria-labelledby={tabId(journey.id)}
              tabIndex={0}
              hidden={!selected}
              data-panel={journey.id}
              className="focus-ring mt-10 rounded-card sm:mt-14"
            >
              <p className="mx-auto mb-10 max-w-xl text-center text-lg text-ink-muted sm:mb-14">
                {journey.intro}
              </p>
              <HowItWorksTimeline steps={journey.steps} />
            </div>
          )
        })}

        {/* Chamada final */}
        <div className="relative mx-auto mt-16 max-w-5xl overflow-hidden rounded-card bg-primary-soft px-6 py-10 ring-1 ring-teal-100 sm:mt-20 sm:px-10 lg:flex lg:items-center lg:justify-between lg:gap-10">
          <svg
            aria-hidden="true"
            viewBox="0 0 200 200"
            className="pointer-events-none absolute -right-10 -bottom-12 size-56 text-teal-100"
            fill="none"
            stroke="currentColor"
            strokeWidth="14"
          >
            <path d="M20 150c30-60 130-60 160 0" strokeLinecap="round" />
            <path d="M55 150c18-32 72-32 90 0" strokeLinecap="round" />
          </svg>
          <div className="relative max-w-xl">
            <h3 className="text-2xl font-extrabold tracking-tight text-ink sm:text-3xl">
              Pronto para fazer parte?
            </h3>
            <p className="mt-3 text-lg text-ink-muted">
              O cadastro é gratuito e leva poucos minutos. Escolha como você quer participar.
            </p>
          </div>
          <div className="relative mt-8 flex flex-col gap-3 sm:flex-row lg:mt-0 lg:shrink-0">
            {JOURNEYS.map((journey) => (
              <ButtonLink
                key={journey.id}
                to={journey.cta.to}
                variant={journey.id === activeTab ? 'primary' : 'secondary'}
                size="lg"
              >
                {journey.cta.label}
              </ButtonLink>
            ))}
          </div>
        </div>
      </Container>
    </section>
  )
}
