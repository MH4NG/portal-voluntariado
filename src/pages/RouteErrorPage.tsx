import { useEffect, useRef } from 'react'
import { isRouteErrorResponse, Link, useRouteError } from 'react-router-dom'
import { Button, ButtonLink } from '../components/ui/Button'
import { Container } from '../components/ui/Container'
import { Logo } from '../components/ui/Logo'
import { usePageTitle } from '../lib/usePageTitle'

interface RouteErrorPageProps {
  /** true quando o próprio layout falhou: a página desenha um cabeçalho mínimo e o <main>. */
  standalone?: boolean
}

/**
 * Erro inesperado ao carregar ou renderizar uma rota (ex.: falha de rede ao baixar
 * o código de uma página após uma atualização do portal).
 */
export function RouteErrorPage({ standalone = false }: RouteErrorPageProps) {
  usePageTitle('Algo deu errado')
  const error = useRouteError()
  const headingRef = useRef<HTMLHeadingElement>(null)

  useEffect(() => {
    if (import.meta.env.DEV) console.error(error)
    headingRef.current?.focus()
  }, [error])

  const detail = isRouteErrorResponse(error) ? `${error.status} ${error.statusText}`.trim() : null

  const content = (
    <Container className="py-16 sm:py-24">
      <div className="mx-auto max-w-xl rounded-card bg-surface-raised p-6 text-center shadow-card ring-1 ring-border sm:p-10">
        <p className="inline-flex items-center rounded-full bg-primary-soft px-4 py-1.5 text-sm font-bold tracking-widest text-primary uppercase">
          Erro inesperado
        </p>
        <h1
          ref={headingRef}
          tabIndex={-1}
          className="mt-5 font-display text-3xl font-extrabold tracking-tight text-ink focus:outline-none sm:text-4xl"
        >
          Algo deu errado por aqui
        </h1>
        <p className="mt-4 text-lg leading-relaxed text-ink-muted">
          Não conseguimos abrir esta página agora. Verifique sua conexão e tente de novo. Se o
          problema continuar, fale com a prefeitura pelo telefone 156.
        </p>
        {detail && <p className="mt-3 text-sm text-ink-muted">Código: {detail}</p>}
        <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
          <Button size="lg" onClick={() => window.location.reload()}>
            Tentar de novo
          </Button>
          <ButtonLink to="/" variant="secondary" size="lg" reloadDocument={standalone}>
            Voltar para o início
          </ButtonLink>
        </div>
      </div>
    </Container>
  )

  if (!standalone) return content

  return (
    <div className="flex min-h-dvh flex-col bg-surface">
      <header className="border-b border-border">
        <Container className="flex min-h-18 items-center">
          <Link to="/" reloadDocument className="inline-flex min-h-12 items-center rounded-lg focus-ring">
            <Logo />
            <span className="sr-only"> — página inicial</span>
          </Link>
        </Container>
      </header>
      <main id="conteudo" className="flex-1">
        {content}
      </main>
    </div>
  )
}
