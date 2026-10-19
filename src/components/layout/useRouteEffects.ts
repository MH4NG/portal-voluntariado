import { useEffect, useLayoutEffect, useRef, useState, type RefObject } from 'react'
import { useLocation, useNavigationType } from 'react-router-dom'
import { prefersReducedMotion, ScrollTrigger } from '../../lib/gsap'

const NATIVELY_FOCUSABLE = 'a[href], button, input, select, textarea, summary, iframe, [contenteditable="true"]'

/** Busca o elemento apontado pelo hash (#id), tolerando ids com caracteres codificados. */
function findHashTarget(hash: string): HTMLElement | null {
  if (!hash || hash === '#') return null
  try {
    return document.getElementById(decodeURIComponent(hash.slice(1)))
  } catch {
    return null
  }
}

/** Executa algo com rolagem instantânea (o index.css define scroll-behavior: smooth no <html>). */
function withInstantScroll(fn: () => void) {
  const root = document.documentElement
  const previous = root.style.scrollBehavior
  root.style.scrollBehavior = 'auto'
  try {
    fn()
  } finally {
    root.style.scrollBehavior = previous
  }
}

/**
 * Move o foco para um elemento sem rolar a página. Se ele não for focável,
 * recebe tabindex="-1" temporariamente (removido no blur, para não poluir a ordem de tabulação).
 */
export function focusElement(el: HTMLElement) {
  const needsTabIndex = !el.hasAttribute('tabindex') && !el.matches(NATIVELY_FOCUSABLE)
  if (needsTabIndex) {
    el.setAttribute('tabindex', '-1')
    // Contêineres (seções, rodapé) não precisam de anel de foco: não são controles.
    el.style.outline = 'none'
    el.addEventListener(
      'blur',
      () => {
        el.removeAttribute('tabindex')
        el.style.removeProperty('outline')
      },
      { once: true },
    )
  }
  el.focus({ preventScroll: true })
}

/**
 * Deve ser renderizado ANTES de <ScrollRestoration/>: o index.css usa scroll-behavior: smooth,
 * o que faria o "voltar ao topo" de cada troca de página acontecer em câmera lenta.
 * Aqui a rolagem fica instantânea em trocas de página e suave só em âncoras na mesma página.
 */
export function ScrollBehaviorGuard() {
  const { pathname, search, hash, key } = useLocation()
  const previousPage = useRef<string | null>(null)

  useLayoutEffect(() => {
    const page = pathname + search
    const samePageAnchor = previousPage.current === page && hash !== ''
    previousPage.current = page
    if (samePageAnchor) return

    const root = document.documentElement
    const previous = root.style.scrollBehavior
    root.style.scrollBehavior = 'auto'
    const frame = requestAnimationFrame(() => {
      root.style.scrollBehavior = previous
    })
    return () => {
      cancelAnimationFrame(frame)
      root.style.scrollBehavior = previous
    }
  }, [pathname, search, hash, key])

  return null
}

/**
 * Efeitos de acessibilidade/rolagem a cada navegação:
 * - troca de página: foco vai para o <main> e o novo título é anunciado (aria-live);
 * - âncoras (/#como-funciona, #contato): rola até o alvo (respeitando movimento reduzido) e foca nele;
 * - ScrollTrigger.refresh() no próximo frame, para animações com pin medirem o novo layout.
 */
export function useRouteEffects(mainRef: RefObject<HTMLElement | null>): string {
  const location = useLocation()
  const navigationType = useNavigationType()
  const [announcement, setAnnouncement] = useState('')
  const previousPathname = useRef<string | null>(null)
  /** Elemento focado no instante do commit (antes de as páginas rodarem seus efeitos). */
  const focusBeforeCommit = useRef<Element | null>(null)

  const { pathname, hash, key } = location

  useEffect(() => {
    const previous = previousPathname.current
    previousPathname.current = pathname
    const isFirstLoad = previous === null
    const pathChanged = !isFirstLoad && previous !== pathname

    let frame1 = 0
    let frame2 = 0
    let clearTimer = 0
    let announceTimer = 0

    if (!isFirstLoad || hash) {
      frame1 = requestAnimationFrame(() => {
        withInstantScroll(() => ScrollTrigger.refresh())

        frame2 = requestAnimationFrame(() => {
          const main = mainRef.current
          const target = findHashTarget(hash)
          // Em "voltar/avançar" o ScrollRestoration devolve a posição salva; não brigamos com ele.
          const restoring = navigationType === 'POP' && pathChanged

          if (target && !restoring) {
            const instant = isFirstLoad || pathChanged || prefersReducedMotion()
            target.scrollIntoView({ behavior: instant ? 'auto' : 'smooth', block: 'start' })
            focusElement(target)
            return
          }

          if (!pathChanged || !main) return
          const active = document.activeElement
          // Se a nova página já posicionou o foco dentro do conteúdo, respeitamos a escolha dela.
          const pageManagedFocus =
            active !== null &&
            active !== document.body &&
            active !== main &&
            active !== focusBeforeCommit.current &&
            main.contains(active)
          if (!pageManagedFocus) focusElement(main)
        })
      })
    }

    if (pathChanged) {
      // Limpa e reescreve: garante que leitores de tela anunciem mesmo títulos repetidos.
      clearTimer = window.setTimeout(() => setAnnouncement(''), 0)
      announceTimer = window.setTimeout(() => {
        setAnnouncement(`Página carregada: ${document.title}`)
      }, 150)
    }

    return () => {
      focusBeforeCommit.current = document.activeElement
      cancelAnimationFrame(frame1)
      cancelAnimationFrame(frame2)
      window.clearTimeout(clearTimer)
      window.clearTimeout(announceTimer)
    }
  }, [pathname, hash, key, navigationType, mainRef])

  return announcement
}
