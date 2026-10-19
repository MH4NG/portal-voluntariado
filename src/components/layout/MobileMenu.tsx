import { useEffect, useRef, type RefObject } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { SITE } from '../../config'
import { gsap, MOTION, useGSAP } from '../../lib/gsap'
import { cn } from '../../lib/cn'
import type { UserProfile } from '../../types'
import { Button, ButtonLink } from '../ui/Button'
import { displayName, initials, profileLabel, type NavItem } from './navigation'

const FOCUSABLE =
  'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'

/** Regiões da página que ficam inertes enquanto o menu cobre a tela. */
const BACKGROUND_IDS = ['conteudo', 'contato']

interface MobileMenuProps {
  id: string
  open: boolean
  /** returnFocus: devolve o foco ao botão do menu (Esc ou fechamento explícito) */
  onClose: (returnFocus: boolean) => void
  toggleRef: RefObject<HTMLButtonElement | null>
  navItems: NavItem[]
  user: UserProfile | null
  loginHref: string
  onLogout: () => void
}

function ArrowIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="none" className="size-5 shrink-0">
      <path
        d="M7.5 4.5 13 10l-5.5 5.5"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
}

export function MobileMenu({
  id,
  open,
  onClose,
  toggleRef,
  navItems,
  user,
  loginHref,
  onLogout,
}: MobileMenuProps) {
  const panelRef = useRef<HTMLDivElement>(null)

  // Foco inicial, Esc, armadilha de foco (botão do menu + itens do painel), trava de rolagem e inert.
  useEffect(() => {
    if (!open) return
    const panel = panelRef.current
    if (!panel) return

    const root = document.documentElement
    const { body } = document
    const previousOverflow = [root.style.overflow, body.style.overflow]
    root.style.overflow = 'hidden'
    body.style.overflow = 'hidden'

    const background = BACKGROUND_IDS.map((bgId) => document.getElementById(bgId)).filter(
      (el): el is HTMLElement => el !== null,
    )
    background.forEach((el) => {
      el.inert = true
    })

    const firstItem = panel.querySelector<HTMLElement>(FOCUSABLE)
    firstItem?.focus({ preventScroll: true })

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        onClose(true)
        return
      }
      if (event.key !== 'Tab' || !panel) return
      const items = [
        toggleRef.current,
        ...Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)),
      ].filter((el): el is HTMLElement => el !== null && el.getClientRects().length > 0)
      if (items.length === 0) return
      const first = items[0]
      const last = items[items.length - 1]
      const active = document.activeElement as HTMLElement | null
      const inside = active !== null && items.includes(active)
      if (event.shiftKey && (!inside || active === first)) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && (!inside || active === last)) {
        event.preventDefault()
        first.focus()
      }
    }

    // Ao chegar no layout de desktop, o menu móvel deixa de fazer sentido.
    const desktop = window.matchMedia('(min-width: 64rem)')
    function onDesktop(event: MediaQueryListEvent) {
      if (event.matches) onClose(false)
    }

    document.addEventListener('keydown', onKeyDown)
    desktop.addEventListener('change', onDesktop)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      desktop.removeEventListener('change', onDesktop)
      root.style.overflow = previousOverflow[0]
      body.style.overflow = previousOverflow[1]
      background.forEach((el) => {
        el.inert = false
      })
    }
  }, [open, onClose, toggleRef])

  useGSAP(
    () => {
      if (!open) return
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        gsap.from(panelRef.current, { opacity: 0, y: -12, duration: 0.25, ease: 'power2.out' })
        gsap.from('[data-menu-item]', {
          opacity: 0,
          y: 14,
          duration: 0.35,
          ease: 'power3.out',
          stagger: 0.05,
          delay: 0.05,
        })
      })
      return () => mm.revert()
    },
    { scope: panelRef, dependencies: [open], revertOnUpdate: true },
  )

  const close = () => onClose(false)

  return (
    <div
      ref={panelRef}
      id={id}
      hidden={!open}
      className="fixed inset-x-0 top-18 bottom-0 z-40 overflow-y-auto overscroll-contain border-t border-border bg-surface lg:hidden"
    >
      <div className="mx-auto flex min-h-full w-full max-w-xl flex-col px-4 pt-4 pb-8 sm:px-6">
        <nav aria-label="Principal">
          <ul className="divide-y divide-border">
            {navItems.map((item) => {
              const content = (
                <>
                  <span className="flex flex-col">
                    <span className="font-display text-xl font-bold tracking-tight text-ink">
                      {item.label}
                    </span>
                    <span className="mt-0.5 text-sm text-ink-muted">{item.description}</span>
                  </span>
                  <ArrowIcon />
                </>
              )
              const itemClass =
                'group flex min-h-16 w-full items-center justify-between gap-4 rounded-xl px-3 py-3 text-ink-muted hover:bg-navy-50 focus-ring'
              return (
                <li key={item.id} data-menu-item>
                  {item.isRoute ? (
                    <NavLink
                      to={item.to}
                      end
                      onClick={close}
                      className={({ isActive }) =>
                        cn(itemClass, isActive && 'bg-primary-soft text-primary')
                      }
                    >
                      {content}
                    </NavLink>
                  ) : (
                    <Link to={item.to} onClick={close} className={itemClass}>
                      {content}
                    </Link>
                  )}
                </li>
              )
            })}
          </ul>
        </nav>

        <div data-menu-item className="mt-6 rounded-card border border-border bg-surface-raised p-5 shadow-card">
          {user ? (
            <>
              <div className="flex items-center gap-3">
                <span
                  aria-hidden="true"
                  className="flex size-12 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display text-base font-bold text-ink-inverse"
                >
                  {initials(user)}
                </span>
                <div className="min-w-0">
                  <p className="truncate font-display text-lg font-bold text-ink">
                    Olá, {displayName(user)}
                  </p>
                  <p className="truncate text-sm text-ink-muted">
                    {profileLabel(user)} · {user.email}
                  </p>
                </div>
              </div>
              <div className="mt-5 flex flex-col gap-3">
                {user.kind === 'beneficiario' && (
                  <ButtonLink to="/acoes/nova" onClick={close} className="w-full">
                    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                      <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
                    </svg>
                    Novo pedido
                  </ButtonLink>
                )}
                <Button variant="secondary" onClick={onLogout} className="w-full">
                  Sair
                </Button>
              </div>
            </>
          ) : (
            <>
              <p className="font-display text-lg font-bold text-ink">Faça parte da rede</p>
              <p className="mt-1 text-ink-muted">
                Cadastre-se para oferecer ajuda ou publicar um pedido.
              </p>
              <div className="mt-5 flex flex-col gap-3">
                <ButtonLink to="/cadastro" onClick={close} className="w-full">
                  Cadastre-se
                </ButtonLink>
                <ButtonLink to={loginHref} onClick={close} variant="secondary" className="w-full">
                  Entrar
                </ButtonLink>
              </div>
            </>
          )}
        </div>

        <p data-menu-item className="mt-auto pt-8 text-center text-sm text-ink-muted">
          Precisa falar com a prefeitura?{' '}
          <a
            href={`tel:${SITE.contactPhone}`}
            className="inline-flex min-h-12 items-center rounded-md px-1 font-semibold text-ink underline underline-offset-4 focus-ring"
          >
            Ligue {SITE.contactPhone}
          </a>
        </p>
      </div>
    </div>
  )
}
