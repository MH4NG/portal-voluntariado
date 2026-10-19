import type { HTMLAttributes } from 'react'
import { cn } from '../../lib/cn'

/** Largura máxima + gutter responsivo (16px no mobile). */
export function Container({ className, ...props }: HTMLAttributes<HTMLDivElement>) {
  return <div className={cn('mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8', className)} {...props} />
}
