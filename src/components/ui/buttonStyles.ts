import { cn } from '../../lib/cn'

export type ButtonVariant = 'primary' | 'secondary' | 'urgent' | 'ghost' | 'inverse'
export type ButtonSize = 'md' | 'lg'

const base =
  'inline-flex items-center justify-center gap-2 rounded-full font-semibold leading-tight ' +
  'transition-colors duration-200 select-none text-center ' +
  'disabled:cursor-not-allowed disabled:opacity-60 ' +
  'focus-visible:outline-3 focus-visible:outline-offset-3'

const variants: Record<ButtonVariant, string> = {
  primary:
    'bg-primary text-on-primary hover:bg-primary-hover focus-visible:outline-focus shadow-sm',
  secondary:
    'bg-surface-raised text-ink border-2 border-navy-900 hover:bg-navy-50 focus-visible:outline-focus',
  urgent: 'bg-urgent text-on-urgent hover:bg-urgent-hover focus-visible:outline-focus shadow-sm',
  ghost: 'bg-transparent text-ink hover:bg-navy-50 focus-visible:outline-focus',
  inverse:
    'bg-transparent text-ink-inverse border-2 border-white/80 hover:bg-white/10 focus-visible:outline-focus-inverse',
}

/** Todos os tamanhos garantem alvo de toque ≥ 48×48px. */
const sizes: Record<ButtonSize, string> = {
  md: 'min-h-12 min-w-12 px-5 py-3 text-base',
  lg: 'min-h-14 min-w-14 px-7 py-4 text-lg',
}

export function buttonClasses(
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  className?: string,
): string {
  return cn(base, variants[variant], sizes[size], className)
}
