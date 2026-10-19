import { useId, type ReactNode } from 'react'
import { SITE } from '../../config'
import { cn } from '../../lib/cn'
import {
  buildMailto,
  buildRequestWhatsAppLink,
  formatPhone,
  isValidEmail,
  normalizeUrl,
  normalizeWhatsapp,
} from '../../lib/contact'
import type { ContactChannels, HelpRequest } from '../../types'
import { Button, ExternalButtonLink } from '../ui/Button'
import {
  CheckIcon,
  CopyIcon,
  FacebookIcon,
  GlobeIcon,
  InstagramIcon,
  MailIcon,
  ShieldIcon,
  WhatsAppIcon,
} from './ContactIcons'
import { useClipboard } from './useClipboard'

interface ContactActionsProps {
  request: HelpRequest
  className?: string
}

/** Só aceita URLs http(s) — nunca renderiza javascript:, data: etc. vindos de dados do usuário. */
function safeHttpUrl(value: string | undefined): string | null {
  if (!value) return null
  const url = normalizeUrl(value)
  if (!url) return null
  try {
    const { protocol } = new URL(url)
    return protocol === 'https:' || protocol === 'http:' ? url : null
  } catch {
    return null
  }
}

/** Aceita URL completa ou um @usuario do Instagram. */
function instagramUrl(value: string | undefined): string | null {
  const v = value?.trim()
  if (!v) return null
  const handle = v.match(/^@([A-Za-z0-9._]{1,30})$/)
  if (handle) return `https://www.instagram.com/${handle[1]}`
  return safeHttpUrl(v)
}

interface ResolvedChannels {
  whatsapp: string | null
  email: string | null
  instagram: string | null
  facebook: string | null
  website: string | null
}

function resolveChannels(contact: ContactChannels): ResolvedChannels {
  const email = contact.email?.trim()
  return {
    whatsapp: contact.whatsapp ? normalizeWhatsapp(contact.whatsapp) : null,
    email: email && isValidEmail(email) ? email : null,
    instagram: instagramUrl(contact.instagram),
    facebook: safeHttpUrl(contact.facebook),
    website: safeHttpUrl(contact.website),
  }
}

function hostLabel(url: string): string {
  try {
    const { hostname, pathname } = new URL(url)
    const path = pathname.replace(/\/+$/, '')
    return `${hostname.replace(/^www\./, '')}${path}`
  } catch {
    return url
  }
}

/**
 * Card de contato direto (briefing §4.3). Não há chat interno: a pessoa voluntária
 * fala direto com quem criou a ação, pelos canais que essa pessoa escolheu divulgar.
 */
export function ContactActions({ request, className }: ContactActionsProps) {
  const headingId = useId()
  const channels = resolveChannels(request.contact)
  const hasSocial = Boolean(channels.instagram || channels.facebook || channels.website)
  const hasAny = Boolean(channels.whatsapp || channels.email || hasSocial)

  return (
    <section
      aria-labelledby={headingId}
      className={cn(
        'relative overflow-hidden rounded-card bg-surface-raised p-5 shadow-raised ring-1 ring-border sm:p-7',
        className,
      )}
    >
      {/* faixa decorativa no topo do card */}
      <div
        aria-hidden="true"
        className="absolute inset-x-0 top-0 h-1.5 bg-linear-to-r from-teal-500 via-teal-600 to-navy-800"
      />

      <p className="text-sm font-bold tracking-widest text-primary uppercase">Contato direto</p>
      <h2 id={headingId} className="mt-2 text-2xl font-extrabold tracking-tight text-ink">
        Fale direto com quem precisa
      </h2>
      <p className="mt-3 text-ink-muted">
        Sem intermediários e sem chat interno: sua mensagem vai direto para{' '}
        <strong className="font-semibold text-ink">{request.organization}</strong>. Escolha o canal
        que for mais confortável para você.
      </p>

      {hasAny ? (
        <div className="mt-6 flex flex-col gap-6">
          {channels.whatsapp && (
            <WhatsAppChannel phone={channels.whatsapp} title={request.title} />
          )}
          {channels.email && <EmailChannel email={channels.email} title={request.title} />}
          {hasSocial && (
            <div>
              <h3 className="text-sm font-bold tracking-wide text-ink uppercase">
                Conheça mais sobre a iniciativa
              </h3>
              <ul className="mt-3 flex flex-col gap-3">
                {channels.instagram && (
                  <SocialLink href={channels.instagram} icon={<InstagramIcon />}>
                    Instagram
                  </SocialLink>
                )}
                {channels.facebook && (
                  <SocialLink href={channels.facebook} icon={<FacebookIcon />}>
                    Facebook
                  </SocialLink>
                )}
                {channels.website && (
                  <SocialLink
                    href={channels.website}
                    icon={<GlobeIcon />}
                    detail={hostLabel(channels.website)}
                  >
                    Site institucional
                  </SocialLink>
                )}
              </ul>
            </div>
          )}
        </div>
      ) : (
        <p className="mt-6 rounded-xl bg-surface-muted p-4 text-ink">
          Esta ação ainda não informou canais de contato.
        </p>
      )}

      <div className="mt-7 flex gap-3 rounded-xl bg-primary-soft p-4 text-sm text-ink">
        <ShieldIcon className="mt-0.5 text-primary" />
        <p>
          <strong className="font-semibold">Dica de segurança:</strong> combine encontros em locais
          públicos e nunca faça pagamentos antecipados.
        </p>
      </div>
    </section>
  )
}

function WhatsAppChannel({ phone, title }: { phone: string; title: string }) {
  return (
    <div className="flex flex-col gap-2">
      <ExternalButtonLink
        href={buildRequestWhatsAppLink(phone, title)}
        size="lg"
        // verde escuro (#15803d → 5:1 com branco) para manter o contraste AA
        className="w-full bg-green-700! text-white! hover:bg-green-800!"
      >
        <WhatsAppIcon className="size-6" />
        Conversar no WhatsApp
      </ExternalButtonLink>
      <p className="text-center text-sm text-ink-muted">
        <span className="sr-only">Número de </span>WhatsApp:{' '}
        <span className="font-semibold text-ink tabular-nums">{formatPhone(phone)}</span>
        <span className="block">A mensagem já vai com o nome da ação preenchido.</span>
      </p>
    </div>
  )
}

function EmailChannel({ email, title }: { email: string; title: string }) {
  const { status, copy } = useClipboard()
  const subject = `Quero ajudar: ${title}`
  const body =
    `Olá! Vi seu pedido "${title}" no Portal de Voluntariado ${SITE.name} e gostaria de ajudar.\n\n` +
    'Podemos conversar sobre como posso contribuir? Seguem meus dados e minha disponibilidade:\n\n' +
    'Nome:\nTelefone:\nDisponibilidade:\n\nAté breve!'

  return (
    <div className="flex flex-col gap-3">
      <ExternalButtonLink
        href={buildMailto(email, subject, body)}
        newTab={false}
        variant="secondary"
        size="lg"
        className="w-full"
      >
        <MailIcon className="size-6" />
        Enviar e-mail
      </ExternalButtonLink>

      <div className="flex flex-col gap-2 rounded-xl border border-border bg-surface p-3 sm:flex-row sm:items-center sm:justify-between lg:flex-col lg:items-stretch">
        <p className="min-w-0 px-1 text-sm text-ink-muted">
          E-mail:{' '}
          <span className="font-semibold break-all text-ink select-all">{email}</span>
        </p>
        <Button
          variant="ghost"
          onClick={() => void copy(email)}
          className="w-full shrink-0 border border-border-strong sm:w-auto lg:w-full"
        >
          {status === 'copied' ? <CheckIcon className="text-success" /> : <CopyIcon />}
          Copiar e-mail
        </Button>
      </div>

      <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium">
        {status === 'copied' && (
          <span className="inline-flex items-center gap-1.5 text-success">
            <CheckIcon className="size-4" />
            E-mail copiado
          </span>
        )}
        {status === 'error' && (
          <span className="text-danger">
            Não foi possível copiar automaticamente. Selecione o endereço acima e copie manualmente.
          </span>
        )}
      </p>
    </div>
  )
}

function SocialLink({
  href,
  icon,
  detail,
  children,
}: {
  href: string
  icon: ReactNode
  detail?: string
  children: ReactNode
}) {
  return (
    <li>
      <ExternalButtonLink href={href} variant="secondary" className="w-full">
        {icon}
        <span>
          {children}
          {detail && <span className="sr-only">: {detail}</span>}
        </span>
      </ExternalButtonLink>
    </li>
  )
}
