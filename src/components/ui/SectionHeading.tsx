import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'

interface SectionHeadingProps {
  id?: string
  eyebrow?: string
  title: ReactNode
  description?: ReactNode
  align?: 'left' | 'center'
  inverse?: boolean
  className?: string
}

export function SectionHeading({
  id,
  eyebrow,
  title,
  description,
  align = 'left',
  inverse = false,
  className,
}: SectionHeadingProps) {
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center', className)}>
      {eyebrow && (
        <p
          className={cn(
            'mb-3 text-sm font-bold tracking-widest uppercase',
            inverse ? 'text-teal-200' : 'text-primary',
          )}
        >
          {eyebrow}
        </p>
      )}
      <h2
        id={id}
        className={cn(
          'text-3xl font-extrabold tracking-tight sm:text-4xl',
          inverse ? 'text-ink-inverse' : 'text-ink',
        )}
      >
        {title}
      </h2>
      {description && (
        <p className={cn('mt-4 text-lg', inverse ? 'text-ink-inverse-muted' : 'text-ink-muted')}>
          {description}
        </p>
      )}
    </div>
  )
}
