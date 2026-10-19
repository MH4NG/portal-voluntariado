import { CATEGORIES } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { CategoryId, Urgency } from '../../types'

interface MarkerPinProps {
  category: CategoryId
  urgency: Urgency
  selected: boolean
}

/**
 * Pino em formato de gota com o emoji da causa.
 * A caixa externa tem 48×56px (alvo de toque ≥ 48px) e a ponta da gota fica
 * exatamente no centro inferior — o ponto de ancoragem padrão do AdvancedMarker.
 * Urgência alta: anel âmbar fixo + selo "!" (não depende só de cor) e um pulso
 * suave apenas quando o sistema permite animações (motion-safe).
 */
export function MarkerPin({ category, urgency, selected }: MarkerPinProps) {
  const meta = CATEGORIES[category]
  const urgent = urgency === 'alta'

  return (
    <div
      aria-hidden="true"
      className={cn(
        'relative h-14 w-12 origin-bottom cursor-pointer transition-transform duration-200 ease-out',
        selected ? 'scale-125' : 'hover:scale-110',
      )}
    >
      {urgent && (
        <span className="absolute top-2 left-1/2 size-10 -translate-x-1/2 rounded-full bg-urgent/70 motion-safe:animate-ping motion-safe:[animation-iteration-count:3]" />
      )}
      <span
        className={cn(
          'absolute top-2 left-1/2 flex size-10 -translate-x-1/2 -rotate-45 items-center justify-center',
          'rounded-[50%_50%_50%_0] border-[3px]',
          selected ? 'border-navy-950' : 'border-white',
        )}
        style={{
          background: meta.pinColor,
          boxShadow: urgent
            ? '0 0 0 3px #fbbf24, 0 6px 14px -4px rgb(10 28 46 / 0.55)'
            : '0 6px 14px -4px rgb(10 28 46 / 0.5)',
        }}
      >
        <span className="rotate-45 text-lg leading-none">{meta.emoji}</span>
      </span>
      {urgent && (
        <span className="absolute top-0 right-0 grid size-5 place-items-center rounded-full bg-urgent font-display text-xs font-black text-on-urgent ring-2 ring-white">
          !
        </span>
      )}
    </div>
  )
}
