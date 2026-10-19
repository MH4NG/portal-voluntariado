import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { CITY, SITE } from '../../config'
import { buildMailto } from '../../lib/contact'
import { Container } from '../ui/Container'
import { Logo } from '../ui/Logo'

const linkClass =
  'inline-flex min-h-12 items-center gap-2 rounded-md text-ink-inverse-muted underline-offset-4 ' +
  'transition-colors duration-200 hover:text-ink-inverse hover:underline focus-ring-inverse'

const CURRENT_YEAR = new Date().getFullYear()

const portalLinks = [
  { label: 'Ações', to: '/acoes' },
  { label: 'Como Funciona', to: '/#como-funciona' },
  { label: 'Quero ajudar', to: '/cadastro?perfil=voluntario' },
  { label: 'Preciso de ajuda', to: '/cadastro?perfil=beneficiario' },
]

function ColumnHeading({ id, children }: { id: string; children: ReactNode }) {
  return (
    <h3 id={id} className="text-sm font-bold tracking-widest text-teal-200 uppercase">
      {children}
    </h3>
  )
}

function Icon({ name }: { name: 'mail' | 'phone' | 'pin' }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.75"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="size-5 shrink-0 text-teal-300"
    >
      {name === 'mail' && (
        <>
          <rect x="2.75" y="4.25" width="14.5" height="11.5" rx="2" />
          <path d="m3.5 5.5 6.5 5 6.5-5" />
        </>
      )}
      {name === 'phone' && (
        <path d="M4.5 2.75h2.2l1.3 3.5-1.75 1.1a9.5 9.5 0 0 0 4.4 4.4l1.1-1.75 3.5 1.3v2.2a1.75 1.75 0 0 1-1.75 1.75A12.75 12.75 0 0 1 2.75 4.5 1.75 1.75 0 0 1 4.5 2.75Z" />
      )}
      {name === 'pin' && (
        <>
          <path d="M10 17.5s5.5-5 5.5-9.5a5.5 5.5 0 0 0-11 0c0 4.5 5.5 9.5 5.5 9.5Z" />
          <circle cx="10" cy="8" r="2" />
        </>
      )}
    </svg>
  )
}

/** Arcos de ponte decorativos no topo do rodapé. */
function BridgeArcs() {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 1200 120"
      preserveAspectRatio="none"
      className="pointer-events-none absolute inset-x-0 top-0 h-20 w-full sm:h-28"
      fill="none"
    >
      <path d="M0 110 Q150 10 300 110 T600 110 T900 110 T1200 110" stroke="rgb(47 174 159 / 0.28)" strokeWidth="2" />
      <path d="M0 116 Q150 40 300 116 T600 116 T900 116 T1200 116" stroke="rgb(200 242 234 / 0.12)" strokeWidth="1.5" />
      <path d="M0 119h1200" stroke="rgb(251 191 36 / 0.35)" strokeWidth="2" />
    </svg>
  )
}

export function Footer() {
  const mailto = buildMailto(SITE.contactEmail, 'Contato pelo Portal Pontes')
  const accessibilityMailto = buildMailto(
    SITE.contactEmail,
    'Acessibilidade no Portal Pontes',
    'Olá! Encontrei uma barreira de acessibilidade no portal:\n\nPágina:\nO que aconteceu:\n',
  )

  return (
    <footer
      id="contato"
      aria-labelledby="contato-titulo"
      className="relative overflow-hidden bg-surface-inverse text-ink-inverse"
    >
      <BridgeArcs />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -right-40 -bottom-40 size-112 rounded-full bg-teal-500/10 blur-3xl"
      />

      <Container className="relative pt-24 pb-10 sm:pt-32">
        <div className="grid gap-10 border-b border-white/10 pb-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <Link
              to="/"
              aria-label="Pontes — página inicial"
              className="-ml-1 inline-flex min-h-12 items-center rounded-xl p-1 focus-ring-inverse"
            >
              <Logo inverse />
            </Link>
            <p className="mt-5 max-w-md text-base leading-relaxed text-ink-inverse-muted">
              O {SITE.name} aproxima quem precisa de apoio de quem quer ajudar em {CITY.name}. Uma rede
              municipal de voluntariado feita de vizinhos, instituições e boas intenções que viram
              ação.
            </p>
          </div>

          <div className="lg:col-span-7 lg:pl-8">
            <h2
              id="contato-titulo"
              className="text-3xl font-extrabold tracking-tight text-ink-inverse sm:text-4xl"
            >
              Contato
            </h2>
            <p className="mt-3 max-w-xl text-lg text-ink-inverse-muted">
              Dúvidas, sugestões ou parcerias? Toda ponte começa com uma conversa — e a equipe da
              prefeitura está pronta para ouvir você.
            </p>
          </div>
        </div>

        <div className="grid gap-10 py-12 sm:grid-cols-2 lg:grid-cols-12 lg:gap-12">
          <nav aria-labelledby="rodape-portal" className="lg:col-span-3">
            <ColumnHeading id="rodape-portal">Portal</ColumnHeading>
            <ul className="mt-4 flex flex-col">
              {portalLinks.map((link) => (
                <li key={link.to}>
                  <Link to={link.to} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <section aria-labelledby="rodape-prefeitura" className="lg:col-span-4">
            <ColumnHeading id="rodape-prefeitura">Fale com a prefeitura</ColumnHeading>
            <address className="mt-4 not-italic">
              <ul className="flex flex-col">
                <li>
                  <a href={mailto} className={`${linkClass} break-all`}>
                    <Icon name="mail" />
                    <span>
                      <span className="sr-only">E-mail: </span>
                      {SITE.contactEmail}
                    </span>
                  </a>
                </li>
                <li>
                  <a href={`tel:${SITE.contactPhone}`} className={linkClass}>
                    <Icon name="phone" />
                    <span>
                      <span className="sr-only">Telefone: </span>
                      Central {SITE.contactPhone}
                    </span>
                  </a>
                </li>
                <li className="flex min-h-12 items-center gap-2 text-ink-inverse-muted">
                  <Icon name="pin" />
                  <span>
                    <span className="sr-only">Endereço: </span>
                    Paço Municipal — Centro, {CITY.name}
                  </span>
                </li>
              </ul>
            </address>
          </section>

          <section aria-labelledby="rodape-acessibilidade" className="sm:col-span-2 lg:col-span-5">
            <ColumnHeading id="rodape-acessibilidade">Acessibilidade</ColumnHeading>
            <p className="mt-4 leading-relaxed text-ink-inverse-muted">
              Buscamos seguir as diretrizes WCAG 2.1 nível AA: navegação completa por teclado,
              compatibilidade com leitores de tela, bom contraste e respeito à preferência por
              movimento reduzido.
            </p>
            <p className="mt-2">
              <a
                href={accessibilityMailto}
                className="-mx-1 inline-flex min-h-12 items-center rounded-md px-1 font-semibold text-ink-inverse underline underline-offset-4 hover:text-teal-200 focus-ring-inverse"
              >
                Encontrou alguma barreira? Conte para a gente
              </a>
            </p>
            <p className="mt-5 inline-flex items-start gap-2 rounded-xl border border-amber-300/40 bg-amber-300/10 px-4 py-3 text-sm font-semibold text-amber-100">
              <svg
                aria-hidden="true"
                viewBox="0 0 20 20"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.75"
                strokeLinecap="round"
                className="mt-px size-5 shrink-0"
              >
                <circle cx="10" cy="10" r="7.25" />
                <path d="M10 9v4.5M10 6.5v.01" />
              </svg>
              <span>
                Dados de demonstração — contatos fictícios. Pedidos, pessoas e instituições
                exibidos aqui são exemplos para testes.
              </span>
            </p>
          </section>
        </div>

        <div className="flex flex-col gap-6 border-t border-white/10 pt-8 text-sm text-ink-inverse-muted lg:flex-row lg:items-start lg:justify-between lg:gap-12">
          <p className="max-w-3xl leading-relaxed">
            <strong className="font-semibold text-ink-inverse">Privacidade (LGPD).</strong> O{' '}
            {SITE.name} trata apenas os dados necessários para conectar voluntários a quem precisa
            de ajuda, conforme a Lei nº 13.709/2018. Nesta versão de demonstração, seus dados
            ficam salvos somente neste navegador e não são enviados a nenhum servidor. Você decide
            quais canais de contato divulgar.
          </p>
          <p className="shrink-0">
            © {CURRENT_YEAR} Prefeitura de {CITY.name} · {SITE.name} — {SITE.tagline}
          </p>
        </div>
      </Container>
    </footer>
  )
}
