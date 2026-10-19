import { useId, useRef, useState, type FormEvent } from 'react'
import { flushSync } from 'react-dom'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { LogoMark } from '../components/ui/Logo'
import { useAuth } from '../context/AuthContext'
import { cn } from '../lib/cn'
import { isValidEmail } from '../lib/contact'
import { gsap, MOTION, useGSAP } from '../lib/gsap'
import { usePageTitle } from '../lib/usePageTitle'

/** Aceita apenas caminhos internos ("/acoes/nova"), evitando redirecionamentos para fora do portal. */
function safeNext(raw: string | null): string | null {
  if (!raw) return null
  if (!raw.startsWith('/') || raw.startsWith('//') || raw.startsWith('/\\')) return null
  if (raw.startsWith('/entrar')) return null
  return raw
}

const inputClass =
  'mt-2 block min-h-12 w-full rounded-xl border-2 bg-surface-raised px-4 py-3 text-base text-ink ' +
  'placeholder:text-ink-muted transition-colors duration-200 focus:border-primary focus-visible:outline-3 ' +
  'focus-visible:outline-offset-2 focus-visible:outline-focus'

function DecorativeBackdrop() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 800 400"
      preserveAspectRatio="xMidYMax slice"
      className="pointer-events-none absolute inset-x-0 bottom-0 h-72 w-full sm:h-96"
      fill="none"
    >
      <path d="M-40 380 Q200 120 400 300 T840 260" stroke="#95e3d5" strokeWidth="3" opacity="0.6" />
      <path d="M-40 400 Q220 180 420 340 T840 320" stroke="#bcccdc" strokeWidth="2" opacity="0.6" />
      <path d="M0 398h800" stroke="#fbbf24" strokeWidth="4" opacity="0.5" />
    </svg>
  )
}

export function LoginPage() {
  usePageTitle('Entrar')
  const { user, login, logout } = useAuth()
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const next = safeNext(searchParams.get('next'))

  const [email, setEmail] = useState('')
  const [fieldError, setFieldError] = useState<string | null>(null)
  const [notFoundEmail, setNotFoundEmail] = useState<string | null>(null)
  const [redirecting, setRedirecting] = useState(false)

  const inputRef = useRef<HTMLInputElement>(null)
  const cardRef = useRef<HTMLDivElement>(null)

  const ids = useId()
  const emailId = `${ids}-email`
  const hintId = `${ids}-dica`
  const errorId = `${ids}-erro`

  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        gsap.from('[data-login-card]', { opacity: 0, y: 24, duration: 0.6, ease: 'power3.out' })
        gsap.from('[data-login-item]', {
          opacity: 0,
          y: 12,
          duration: 0.5,
          ease: 'power3.out',
          stagger: 0.06,
          delay: 0.12,
        })
      })
      return () => mm.revert()
    },
    { scope: cardRef },
  )

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const value = email.trim()
    setNotFoundEmail(null)

    if (!value) {
      setFieldError('Informe seu e-mail para entrar.')
      inputRef.current?.focus()
      return
    }
    if (!isValidEmail(value)) {
      setFieldError('Digite um e-mail válido, como nome@exemplo.com.')
      inputRef.current?.focus()
      return
    }

    setFieldError(null)
    // Atualizado no mesmo lote que o perfil: evita exibir por um instante o aviso
    // de "você já está conectado" enquanto a próxima página carrega.
    setRedirecting(true)
    if (login(value)) {
      navigate(next ?? '/', { replace: true })
    } else {
      setRedirecting(false)
      setNotFoundEmail(value)
    }
  }

  // Depois de "Sair" nesta página, o formulário volta e o foco vai para o campo de e-mail.
  const handleLogout = () => {
    flushSync(() => {
      logout()
      setEmail('')
    })
    inputRef.current?.focus()
  }

  const signupHref = (perfil?: 'voluntario' | 'beneficiario') =>
    perfil ? `/cadastro?perfil=${perfil}` : '/cadastro'

  const showConnected = user !== null && !redirecting

  return (
    <section
      aria-labelledby="login-titulo"
      className="relative isolate overflow-hidden bg-linear-to-b from-surface-muted to-surface"
    >
      <DecorativeBackdrop />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -top-32 -left-32 -z-10 size-96 rounded-full bg-teal-100/60 blur-3xl"
      />

      <Container className="relative flex justify-center py-12 sm:py-20 lg:py-24">
        <div ref={cardRef} className="w-full max-w-lg">
          <div
            data-login-card
            className="rounded-card border border-border bg-surface-raised p-6 shadow-raised sm:p-10"
          >
            <div data-login-item>
              <LogoMark className="size-12" />
            </div>

            {showConnected ? (
              <div>
                <h1
                  id="login-titulo"
                  data-login-item
                  className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
                >
                  Você já está conectado como {user.name}
                </h1>
                <p data-login-item className="mt-3 text-lg text-ink-muted">
                  Sessão ativa com o e-mail <strong className="break-all text-ink">{user.email}</strong>.
                  Continue de onde parou ou saia para entrar com outro perfil.
                </p>
                <div data-login-item className="mt-8 flex flex-col gap-3 sm:flex-row">
                  {next ? (
                    <ButtonLink to={next} size="lg" className="sm:flex-1">
                      Continuar
                    </ButtonLink>
                  ) : (
                    <ButtonLink to="/acoes" size="lg" className="sm:flex-1">
                      Ir para ações
                    </ButtonLink>
                  )}
                  <Button variant="secondary" size="lg" onClick={handleLogout} className="sm:flex-1">
                    Sair
                  </Button>
                </div>
                {next && (
                  <p data-login-item className="mt-4 text-center">
                    <Link
                      to="/acoes"
                      className="inline-flex min-h-12 items-center rounded-md px-2 font-semibold text-primary underline underline-offset-4 hover:text-primary-hover focus-ring"
                    >
                      Ir para ações
                    </Link>
                  </p>
                )}
              </div>
            ) : (
              <div>
                <h1
                  id="login-titulo"
                  data-login-item
                  className="mt-6 text-3xl font-extrabold tracking-tight text-ink sm:text-4xl"
                >
                  Que bom ver você por aqui
                </h1>
                <p data-login-item className="mt-3 text-lg text-ink-muted">
                  Entre com o e-mail do seu cadastro para publicar pedidos e acompanhar as ações da
                  sua região.
                </p>

                <form data-login-item noValidate onSubmit={handleSubmit} className="mt-8">
                  <label htmlFor={emailId} className="block text-base font-semibold text-ink">
                    E-mail
                  </label>
                  <p id={hintId} className="mt-1 text-sm text-ink-muted">
                    Use o mesmo e-mail informado no cadastro.
                  </p>
                  <input
                    ref={inputRef}
                    id={emailId}
                    name="email"
                    type="email"
                    inputMode="email"
                    autoComplete="email"
                    autoCapitalize="none"
                    autoCorrect="off"
                    spellCheck={false}
                    required
                    placeholder="nome@exemplo.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value)
                      if (fieldError) setFieldError(null)
                    }}
                    aria-invalid={fieldError ? true : undefined}
                    aria-describedby={cn(hintId, fieldError && errorId)}
                    className={cn(inputClass, fieldError ? 'border-danger' : 'border-navy-500')}
                  />
                  {/* Região sempre presente: o erro é anunciado mesmo quando o foco já está no campo (Enter). */}
                  <div role="alert">
                  {fieldError && (
                    <p id={errorId} className="mt-2 flex items-start gap-2 font-semibold text-danger">
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-5 shrink-0">
                        <path
                          fillRule="evenodd"
                          clipRule="evenodd"
                          d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 0 1 1 1v3.5a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.5a1.15 1.15 0 1 0 0-2.3 1.15 1.15 0 0 0 0 2.3Z"
                        />
                      </svg>
                      <span>
                        <span className="sr-only">Erro: </span>
                        {fieldError}
                      </span>
                    </p>
                  )}
                  </div>

                  {/* Região sempre presente: leitores de tela anunciam o conteúdo assim que ele surge. */}
                  <div role="alert">
                    {notFoundEmail && (
                      <div className="mt-5 rounded-xl border-2 border-danger/25 bg-danger/5 p-4">
                        <p className="font-semibold text-ink">
                          Não encontramos um cadastro com{' '}
                          <span className="break-all text-danger">{notFoundEmail}</span> neste
                          navegador.
                        </p>
                        <p className="mt-1 text-sm text-ink-muted">
                          Nesta versão de demonstração, os perfis ficam salvos apenas no navegador
                          em que foram criados. Confira o e-mail digitado ou faça seu cadastro.
                        </p>
                        <Link
                          to={signupHref()}
                          className="mt-2 inline-flex min-h-12 items-center gap-1 rounded-md font-semibold text-primary underline underline-offset-4 hover:text-primary-hover focus-ring"
                        >
                          Fazer meu cadastro
                          <span aria-hidden="true">→</span>
                        </Link>
                      </div>
                    )}
                  </div>

                  <Button type="submit" size="lg" disabled={redirecting} className="mt-6 w-full">
                    {redirecting ? 'Entrando…' : 'Entrar'}
                  </Button>
                  <p role="status" className="sr-only">
                    {redirecting ? 'Tudo certo! Levando você para a próxima página.' : ''}
                  </p>
                </form>

                <aside
                  data-login-item
                  aria-label="Sobre este login"
                  className="mt-8 flex gap-3 rounded-xl bg-primary-soft p-4 text-sm text-teal-900"
                >
                  <svg
                    aria-hidden="true"
                    viewBox="0 0 20 20"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                    className="mt-0.5 size-5 shrink-0"
                  >
                    <circle cx="10" cy="10" r="7.25" />
                    <path d="M10 9v4.5M10 6.5v.01" />
                  </svg>
                  <p>
                    <strong className="font-semibold">Login simulado.</strong> Este portal é uma
                    versão de demonstração: não pedimos senha e os perfis ficam salvos apenas neste
                    navegador.
                  </p>
                </aside>
              </div>
            )}
          </div>

          {!showConnected && (
            <div className="mt-8 text-center">
              <h2 className="font-display text-lg font-bold text-ink">Ainda não tem cadastro?</h2>
              <p className="mt-1 text-ink-muted">Escolha como você quer participar:</p>
              <div className="mt-4 flex flex-col justify-center gap-3 sm:flex-row">
                <ButtonLink to={signupHref('voluntario')} variant="secondary">
                  Quero ajudar
                </ButtonLink>
                <ButtonLink to={signupHref('beneficiario')} variant="secondary">
                  Preciso de ajuda
                </ButtonLink>
              </div>
            </div>
          )}
        </div>
      </Container>
    </section>
  )
}
