import { useEffect, useRef, useState } from 'react'
import { useNavigation } from 'react-router-dom'
import { gsap, MOTION, useGSAP } from '../../lib/gsap'

type Phase = 'idle' | 'loading' | 'finishing'

/** Atraso antes de exibir a barra: navegações rápidas não piscam na tela. */
const SHOW_DELAY = 150
const FINISH_DURATION = 400

/**
 * Barra fina no topo enquanto rotas sob demanda (lazy) são carregadas.
 * Com movimento reduzido, a barra aparece estática (cheia), sem animação.
 */
export function NavigationProgress() {
  const navigation = useNavigation()
  const busy = navigation.state !== 'idle'
  const [phase, setPhase] = useState<Phase>('idle')
  const containerRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (busy) {
      const timer = window.setTimeout(() => setPhase('loading'), SHOW_DELAY)
      return () => window.clearTimeout(timer)
    }
    const frame = requestAnimationFrame(() =>
      setPhase((current) => (current === 'loading' ? 'finishing' : 'idle')),
    )
    const timer = window.setTimeout(
      () => setPhase((current) => (current === 'finishing' ? 'idle' : current)),
      FINISH_DURATION,
    )
    return () => {
      cancelAnimationFrame(frame)
      window.clearTimeout(timer)
    }
  }, [busy])

  useGSAP(
    () => {
      if (phase === 'idle') return
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        if (phase === 'loading') {
          gsap.fromTo(
            '[data-progress-bar]',
            { scaleX: 0.05 },
            { scaleX: 0.85, duration: 4, ease: 'power3.out' },
          )
        } else {
          gsap.fromTo(
            '[data-progress-bar]',
            { opacity: 1 },
            { opacity: 0, duration: 0.3, delay: 0.05, ease: 'power1.out' },
          )
        }
      })
      return () => mm.revert()
    },
    { scope: containerRef, dependencies: [phase], revertOnUpdate: true },
  )

  return (
    <div ref={containerRef} className="pointer-events-none fixed inset-x-0 top-0 z-60">
      {phase !== 'idle' && (
        <div role="progressbar" aria-label="Carregando a página" className="h-1 w-full bg-teal-100/60">
          <div data-progress-bar className="h-full w-full origin-left rounded-r-full bg-primary" />
        </div>
      )}
    </div>
  )
}
