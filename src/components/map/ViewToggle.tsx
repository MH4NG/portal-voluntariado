import { cn } from '../../lib/cn'
import type { ResultsView } from './types'

interface ViewToggleProps {
  view: ResultsView
  onChange: (view: ResultsView) => void
  className?: string
}

const OPTIONS: Array<{ value: ResultsView; label: string; icon: string }> = [
  {
    value: 'map',
    label: 'Mapa',
    icon: 'M7.5 3.1a1 1 0 0 1 .8 0l4.2 1.9 3.9-1.8A1 1 0 0 1 18 4.1v11.3a1 1 0 0 1-.6.9l-4.5 2a1 1 0 0 1-.8 0L7.9 16.4 4 18.2A1 1 0 0 1 2.6 17.3V6a1 1 0 0 1 .6-.9l4.3-2ZM8 5.4v9.2l4 1.8V7.2L8 5.4Z',
  },
  {
    value: 'list',
    label: 'Lista',
    icon: 'M3 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H4Z',
  },
]

/** Alternância "Mapa | Lista" (mobile). No desktop as duas visões aparecem lado a lado. */
export function ViewToggle({ view, onChange, className }: ViewToggleProps) {
  return (
    <div
      role="group"
      aria-label="Modo de visualização"
      className={cn('inline-flex shrink-0 gap-1 rounded-full bg-surface-muted p-1 ring-1 ring-border', className)}
    >
      {OPTIONS.map((option) => {
        const pressed = view === option.value
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={pressed}
            onClick={() => onChange(option.value)}
            className={cn(
              'inline-flex min-h-12 min-w-12 items-center justify-center gap-1.5 rounded-full px-3 text-sm min-[400px]:gap-2 min-[400px]:px-4 font-semibold transition-colors focus-ring',
              pressed ? 'bg-navy-900 text-ink-inverse shadow-card' : 'text-ink-muted hover:bg-surface-raised hover:text-ink',
            )}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path d={option.icon} />
            </svg>
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
