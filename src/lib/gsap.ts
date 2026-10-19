import { useGSAP } from '@gsap/react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'

gsap.registerPlugin(ScrollTrigger, useGSAP)

/**
 * Media queries para gsap.matchMedia(). Sempre anime dentro de MOTION.ok
 * e garanta que o conteúdo fique visível/estático em MOTION.reduce.
 *
 * Padrão:
 *   useGSAP(() => {
 *     const mm = gsap.matchMedia()
 *     mm.add(MOTION.ok, () => { gsap.from(...) })
 *     return () => mm.revert()
 *   }, { scope: ref })
 */
export const MOTION = {
  ok: '(prefers-reduced-motion: no-preference)',
  reduce: '(prefers-reduced-motion: reduce)',
} as const

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia(MOTION.reduce).matches
}

export { gsap, ScrollTrigger, useGSAP }
