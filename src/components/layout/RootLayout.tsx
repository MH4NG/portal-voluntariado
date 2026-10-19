import { useRef, type MouseEvent } from 'react'
import { Outlet, ScrollRestoration, useNavigation } from 'react-router-dom'
import { prefersReducedMotion } from '../../lib/gsap'
import { Footer } from './Footer'
import { Header } from './Header'
import { NavigationProgress } from './NavigationProgress'
import { focusElement, ScrollBehaviorGuard, useRouteEffects } from './useRouteEffects'

export function RootLayout() {
  const mainRef = useRef<HTMLElement>(null)
  const navigation = useNavigation()
  const busy = navigation.state === 'loading'
  const announcement = useRouteEffects(mainRef)

  // Sem alterar a URL (um "#conteudo" no histórico viraria uma navegação do roteador).
  const skipToContent = (event: MouseEvent<HTMLAnchorElement>) => {
    const main = mainRef.current
    if (!main) return
    event.preventDefault()
    main.scrollIntoView({ behavior: prefersReducedMotion() ? 'auto' : 'smooth', block: 'start' })
    focusElement(main)
  }

  return (
    <>
      {/* A ordem importa: o guard ajusta o scroll-behavior antes do ScrollRestoration rolar. */}
      <ScrollBehaviorGuard />
      <ScrollRestoration />

      <a
        href="#conteudo"
        onClick={skipToContent}
        className="sr-only-focusable fixed top-3 left-4 z-70 inline-flex min-h-12 items-center rounded-full bg-surface-inverse px-5 py-3 font-semibold text-ink-inverse shadow-raised focus-ring-inverse"
      >
        Pular para o conteúdo
      </a>

      <NavigationProgress />

      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {announcement}
      </div>

      <div className="flex min-h-dvh flex-col">
        <Header />
        <main
          id="conteudo"
          ref={mainRef}
          tabIndex={-1}
          aria-busy={busy || undefined}
          className="flex-1 focus:outline-none"
        >
          <Outlet />
        </main>
        <Footer />
      </div>
    </>
  )
}
