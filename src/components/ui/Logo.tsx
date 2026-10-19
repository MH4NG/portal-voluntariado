import { cn } from '../../lib/cn'

/** Marca Pontes: um arco de ponte sobre uma linha, a conexão entre duas margens. */
export function LogoMark({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 64" aria-hidden="true" className={cn('size-10', className)}>
      <rect width="64" height="64" rx="14" fill="#102a43" />
      <path
        d="M10 42c6-14 14-21 22-21s16 7 22 21"
        fill="none"
        stroke="#2fae9f"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path d="M8 44h48" stroke="#fbbf24" strokeWidth="5" strokeLinecap="round" />
      <path
        d="M22 44V31M32 44V26M42 44V31"
        stroke="#c8f2ea"
        strokeWidth="3.5"
        strokeLinecap="round"
      />
    </svg>
  )
}

export function Logo({ inverse = false, className }: { inverse?: boolean; className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <LogoMark />
      <span className="flex flex-col leading-none">
        <span
          className={cn(
            'font-display text-xl font-extrabold tracking-tight',
            inverse ? 'text-ink-inverse' : 'text-ink',
          )}
        >
          Pontes
        </span>
        <span
          className={cn(
            'mt-0.5 text-xs font-medium',
            inverse ? 'text-ink-inverse-muted' : 'text-ink-muted',
          )}
        >
          Voluntariado Municipal
        </span>
      </span>
    </span>
  )
}
