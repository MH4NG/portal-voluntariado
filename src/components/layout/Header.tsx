import { useCallback, useEffect, useRef, useState } from 'react'
import { flushSync } from 'react-dom'
import { Link, NavLink, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { cn } from '../../lib/cn'
import { Button, ButtonLink } from '../ui/Button'
import { buttonClasses } from '../ui/buttonStyles'
import { Container } from '../ui/Container'
import { Logo } from '../ui/Logo'
import { MobileMenu } from './MobileMenu'
import { displayName, initials, profileLabel, useLoginHref, useNavItems } from './navigation'

const MENU_ID = 'menu-principal-movel'

function useScrolled(threshold = 8): boolean {
  const [scrolled, setScrolled] = useState(false)
  useEffect(() => {
    let frame = 0
    const update = () => {
      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => setScrolled(window.scrollY > threshold))
    }
    update()
    window.addEventListener('scroll', update, { passive: true })
    return () => {
      cancelAnimationFrame(frame)
      window.removeEventListener('scroll', update)
    }
  }, [threshold])
  return scrolled
}

const navLinkBase =
  'relative inline-flex min-h-12 items-center rounded-full px-4 text-[0.9375rem] font-semibold whitespace-nowrap ' +
  'transition-colors duration-200 hover:bg-navy-50 hover:text-ink focus-ring'

function ActiveIndicator() {
  return (
    <span
      aria-hidden="true"
      className="absolute inset-x-4 bottom-1.5 h-0.5 rounded-full bg-primary"
    />
  )
}

export function Header() {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navItems = useNavItems()
  const loginHref = useLoginHref()
  const scrolled = useScrolled()

  // O menu só está aberto para a localização em que foi aberto: qualquer navegação o fecha.
  const [menuKey, setMenuKey] = useState<string | null>(null)
  const menuOpen = menuKey === location.key

  const toggleRef = useRef<HTMLButtonElement>(null)
  const loginLinkRef = useRef<HTMLAnchorElement>(null)
  const [status, setStatus] = useState('')

  const closeMenu = useCallback((returnFocus: boolean) => {
    setMenuKey(null)
    if (returnFocus) toggleRef.current?.focus()
  }, [])

  const handleLogout = () => {
    const fromMenu = menuOpen
    flushSync(() => {
      logout()
      setMenuKey(null)
      setStatus('Você saiu da sua conta.')
    })
    // O botão "Sair" deixou de existir: o foco vai para um ponto previsível.
    if (fromMenu) toggleRef.current?.focus()
    else loginLinkRef.current?.focus()
  }

  // Limpa a mensagem para que um novo "Sair" seja anunciado novamente.
  useEffect(() => {
    if (!status) return
    const timer = window.setTimeout(() => setStatus(''), 4000)
    return () => window.clearTimeout(timer)
  }, [status])

  const elevated = scrolled || menuOpen

  return (
    <header className="sticky top-0 z-40">
      {/* Fundo separado: backdrop-filter no próprio <header> prenderia o painel fixo do menu móvel. */}
      <div
        aria-hidden="true"
        className={cn(
          'absolute inset-0 -z-10 border-b backdrop-blur-md transition-[background-color,border-color,box-shadow] duration-300',
          elevated
            ? 'border-border bg-surface/95 shadow-[0_10px_30px_-18px_rgb(16_42_67/0.35)]'
            : 'border-transparent bg-surface/90',
        )}
      />

      <Container className="flex h-18 items-center gap-4">
        <Link
          to="/"
          aria-label="Pontes — página inicial"
          className="-ml-1 inline-flex min-h-12 shrink-0 items-center rounded-xl p-1 focus-ring"
        >
          <Logo />
        </Link>

        <nav aria-label="Principal" className="hidden flex-1 justify-center lg:flex">
          <ul className="flex items-center gap-1">
            {navItems.map((item) => (
              <li key={item.id}>
                {item.isRoute ? (
                  <NavLink
                    to={item.to}
                    end
                    className={({ isActive }) =>
                      cn(navLinkBase, isActive ? 'text-ink' : 'text-ink-muted')
                    }
                  >
                    {({ isActive }) => (
                      <>
                        {item.label}
                        {isActive && <ActiveIndicator />}
                      </>
                    )}
                  </NavLink>
                ) : (
                  <Link to={item.to} className={cn(navLinkBase, 'text-ink-muted')}>
                    {item.label}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        <div className="ml-auto hidden items-center gap-2 lg:flex">
          {user ? (
            <>
              <div className="mr-1 hidden min-w-0 items-center gap-2.5 xl:flex">
                <span
                  aria-hidden="true"
                  className="flex size-10 shrink-0 items-center justify-center rounded-full bg-navy-900 font-display text-sm font-bold text-ink-inverse"
                >
                  {initials(user)}
                </span>
                <p className="flex min-w-0 flex-col leading-tight">
                  <span className="max-w-44 truncate text-sm font-semibold text-ink">
                    Olá, {displayName(user)}
                  </span>
                  <span className="max-w-44 truncate text-xs text-ink-muted">
                    {profileLabel(user)}
                  </span>
                </p>
              </div>
              {user.kind === 'beneficiario' && (
                <ButtonLink to="/acoes/nova" className="whitespace-nowrap">
                  <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                    <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
                  </svg>
                  Novo pedido
                </ButtonLink>
              )}
              <Button variant="ghost" onClick={handleLogout}>
                Sair
              </Button>
            </>
          ) : (
            <>
              <Link ref={loginLinkRef} to={loginHref} className={buttonClasses('ghost')}>
                Entrar
              </Link>
              <ButtonLink to="/cadastro">Cadastre-se</ButtonLink>
            </>
          )}
        </div>

        <button
          ref={toggleRef}
          type="button"
          aria-expanded={menuOpen}
          aria-controls={MENU_ID}
          onClick={() => (menuOpen ? closeMenu(false) : setMenuKey(location.key))}
          className={cn(
            'ml-auto inline-flex min-h-12 min-w-12 items-center justify-center gap-2 rounded-full border-2 px-3 font-semibold transition-colors duration-200 focus-ring lg:hidden',
            menuOpen
              ? 'border-navy-900 bg-navy-900 text-ink-inverse'
              : 'border-border-strong bg-surface-raised text-ink hover:bg-navy-50',
          )}
        >
          <span aria-hidden="true" className="relative block h-3.5 w-5">
            <span
              className={cn(
                'absolute left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300',
                menuOpen ? 'top-1.5 rotate-45' : 'top-0',
              )}
            />
            <span
              className={cn(
                'absolute top-1.5 left-0 h-0.5 w-5 rounded-full bg-current transition-opacity duration-200',
                menuOpen && 'opacity-0',
              )}
            />
            <span
              className={cn(
                'absolute left-0 h-0.5 w-5 rounded-full bg-current transition-transform duration-300',
                menuOpen ? 'top-1.5 -rotate-45' : 'top-3',
              )}
            />
          </span>
          <span className="text-sm">Menu</span>
        </button>
      </Container>

      <MobileMenu
        id={MENU_ID}
        open={menuOpen}
        onClose={closeMenu}
        toggleRef={toggleRef}
        navItems={navItems}
        user={user}
        loginHref={loginHref}
        onLogout={handleLogout}
      />

      <p role="status" className="sr-only">
        {status}
      </p>
    </header>
  )
}
