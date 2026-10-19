import { cn } from '../../lib/cn'
import type { JourneyStep } from './HowItWorksData'

interface HowItWorksTimelineProps {
  steps: JourneyStep[]
}

/**
 * Linha do tempo vertical de uma jornada.
 * Mobile: linha à esquerda e cards à direita. lg: linha central com cards alternados.
 * Os atributos data-* são os ganchos usados pela animação em HowItWorks.
 */
export function HowItWorksTimeline({ steps }: HowItWorksTimelineProps) {
  const total = steps.length

  return (
    <div data-timeline className="relative mx-auto max-w-5xl">
      {/* Linha de conexão: trilho estático + traço de progresso (desenhado pelo scroll) */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute top-6 bottom-0 left-6 w-1 -translate-x-1/2 lg:left-1/2"
      >
        <div className="absolute inset-0 rounded-full bg-linear-to-b from-navy-100 via-navy-100 via-75% to-transparent" />
        <div
          data-timeline-progress
          className="absolute inset-0 origin-top rounded-full bg-linear-to-b from-teal-400 via-primary via-75% to-transparent"
        />
      </div>

      <ol className="relative space-y-8 sm:space-y-10 lg:space-y-4">
        {steps.map((step, index) => {
          const isLeft = index % 2 === 0
          const isLast = index === total - 1
          const Icon = step.icon
          const number = index + 1

          return (
            <li
              key={step.title}
              data-step
              className={cn(
                'relative grid grid-cols-[3rem_minmax(0,1fr)] gap-x-3 sm:gap-x-6',
                'lg:grid-cols-[minmax(0,1fr)_3rem_minmax(0,1fr)] lg:gap-x-10',
              )}
            >
              {/* Nó numerado sobre a linha */}
              <div
                data-step-node
                aria-hidden="true"
                className={cn(
                  'relative z-10 col-start-1 row-start-1 flex size-12 items-center justify-center self-start rounded-full',
                  'font-display text-lg font-extrabold shadow-[0_0_0_6px_var(--color-surface)] lg:col-start-2',
                  isLast
                    ? 'bg-primary text-on-primary'
                    : 'bg-surface-raised text-primary ring-2 ring-primary',
                )}
              >
                {number}
              </div>

              {/* Card do passo */}
              <div
                data-step-card
                className={cn(
                  'col-start-2 row-start-1 lg:max-w-md',
                  isLeft ? 'lg:col-start-1 lg:justify-self-end' : 'lg:col-start-3 lg:justify-self-start',
                )}
              >
                <article
                  className={cn(
                    'relative rounded-card bg-surface-raised p-5 shadow-card ring-1 ring-border sm:p-7',
                    'transition-shadow duration-300 hover:shadow-raised',
                  )}
                >
                  <div className="flex items-start gap-4">
                    <span
                      aria-hidden="true"
                      className={cn(
                        'flex size-12 shrink-0 items-center justify-center rounded-2xl',
                        isLast ? 'bg-primary text-on-primary' : 'bg-primary-soft text-primary',
                      )}
                    >
                      <Icon className="size-6" />
                    </span>
                    <h3 className="pt-0.5 text-xl leading-snug font-bold tracking-tight text-ink">
                      <span className="mb-1 block font-sans text-sm font-semibold tracking-normal text-primary">
                        Passo {number} de {total}
                        <span className="sr-only">:</span>
                      </span>
                      {step.title}
                    </h3>
                  </div>
                  <p className="mt-4 leading-relaxed text-ink-muted">{step.description}</p>
                  {step.tags && step.tags.length > 0 && (
                    <ul role="list" aria-label="Destaques" className="mt-5 flex flex-wrap gap-2">
                      {step.tags.map((tag) => (
                        <li
                          key={tag}
                          className="rounded-full bg-surface-muted px-3 py-1 text-sm font-medium text-ink-muted ring-1 ring-border"
                        >
                          {tag}
                        </li>
                      ))}
                    </ul>
                  )}
                </article>
              </div>

              {/* Numeral decorativo do lado oposto (somente telas grandes) */}
              <div
                data-step-numeral
                aria-hidden="true"
                className={cn(
                  'row-start-1 hidden self-start pt-1 lg:flex',
                  isLeft ? 'lg:col-start-3 lg:justify-start' : 'lg:col-start-1 lg:justify-end',
                )}
              >
                <span className="font-display text-8xl leading-none font-extrabold tracking-tighter text-transparent select-none [-webkit-text-stroke:2px_var(--color-teal-200)]">
                  {String(number).padStart(2, '0')}
                </span>
              </div>
            </li>
          )
        })}
      </ol>
    </div>
  )
}
