import { useCallback, useSyncExternalStore } from 'react'

/** Breakpoint `lg` do Tailwind (64rem). */
export const LG_QUERY = '(min-width: 64rem)'

/** Estado reativo de uma media query (seguro para SSR: false no servidor). */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const mql = window.matchMedia(query)
      mql.addEventListener('change', onChange)
      return () => mql.removeEventListener('change', onChange)
    },
    [query],
  )
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  )
}
