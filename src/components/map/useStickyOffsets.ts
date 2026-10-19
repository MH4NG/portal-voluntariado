import { useLayoutEffect, useState, type RefObject } from 'react'

/**
 * Mede a altura do cabeçalho do site (quando fixo/sticky) e da barra de resultados,
 * para que o mapa ocupe exatamente o restante da viewport: calc(100dvh - header - barra).
 */
export function useStickyOffsets(barRef: RefObject<HTMLElement | null>) {
  const [headerHeight, setHeaderHeight] = useState(0)
  const [barHeight, setBarHeight] = useState(0)

  useLayoutEffect(() => {
    const header = document.querySelector('header')
    const bar = barRef.current

    const measure = () => {
      if (header) {
        const position = getComputedStyle(header).position
        const overlays = position === 'fixed' || position === 'sticky'
        setHeaderHeight(overlays ? Math.round(header.getBoundingClientRect().height) : 0)
      }
      if (bar) setBarHeight(Math.round(bar.getBoundingClientRect().height))
    }

    measure()
    const observer = new ResizeObserver(measure)
    if (header) observer.observe(header)
    if (bar) observer.observe(bar)
    window.addEventListener('resize', measure)
    return () => {
      observer.disconnect()
      window.removeEventListener('resize', measure)
    }
  }, [barRef])

  return { headerHeight, barHeight }
}
