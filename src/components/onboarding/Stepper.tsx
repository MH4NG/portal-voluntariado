import { cn } from '../../lib/cn'

interface StepperProps {
  steps: readonly string[]
  /** Índice da etapa atual (0-based) */
  current: number
  label?: string
  className?: string
}

/**
 * Indicador de progresso acessível: texto "Etapa X de Y: Nome", barra visual
 * e lista ordenada com aria-current="step" na etapa atual.
 */
export function Stepper({ steps, current, label = 'Etapas do cadastro', className }: StepperProps) {
  const total = steps.length
  const percent = Math.round(((current + 1) / total) * 100)

  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div>
        <p className="flex items-baseline justify-between gap-3 text-sm font-semibold text-ink">
          <span>
            Etapa {current + 1} de {total}: <span className="text-primary">{steps[current]}</span>
          </span>
          <span aria-hidden="true" className="tabular-nums text-ink-muted">
            {percent}%
          </span>
        </p>
        <div aria-hidden="true" className="mt-2 h-2 overflow-hidden rounded-full bg-navy-100">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal-500 to-primary transition-[width] duration-500 ease-out"
            style={{ width: `${percent}%` }}
          />
        </div>
      </div>

      <ol aria-label={label} className="flex items-start gap-2 lg:flex-col lg:gap-0">
        {steps.map((name, i) => {
          const status = i < current ? 'done' : i === current ? 'current' : 'todo'
          return (
            <li
              key={name}
              aria-current={status === 'current' ? 'step' : undefined}
              className={cn(
                'relative flex min-w-0 items-center gap-2 lg:flex-none lg:gap-3 lg:py-2',
                i === total - 1 ? 'flex-none' : 'flex-1',
                // linha conectora vertical no desktop
                i < total - 1 &&
                  'lg:after:absolute lg:after:top-[2.6rem] lg:after:left-4 lg:after:h-[calc(100%-2.2rem)] lg:after:w-0.5 lg:after:-translate-x-1/2 lg:after:content-[""]',
                i < total - 1 && (i < current ? 'lg:after:bg-primary' : 'lg:after:bg-navy-100'),
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ring-2',
                  status === 'done' && 'bg-primary text-on-primary ring-primary',
                  status === 'current' && 'bg-surface-raised text-primary ring-primary ring-offset-2 ring-offset-surface',
                  status === 'todo' && 'bg-surface-raised text-ink-muted ring-navy-200',
                )}
              >
                {status === 'done' ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                    <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" />
                  </svg>
                ) : (
                  i + 1
                )}
              </span>
              <span
                className={cn(
                  'sr-only text-sm lg:not-sr-only',
                  status === 'current' ? 'font-bold text-ink' : 'font-medium text-ink-muted',
                )}
              >
                {name}
                <span className="sr-only">
                  {status === 'done' ? ' (concluída)' : status === 'current' ? ' (etapa atual)' : ' (pendente)'}
                </span>
              </span>
              {i < total - 1 && (
                <span
                  aria-hidden="true"
                  className={cn('h-0.5 min-w-2 flex-1 rounded-full lg:hidden', i < current ? 'bg-primary' : 'bg-navy-100')}
                />
              )}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
