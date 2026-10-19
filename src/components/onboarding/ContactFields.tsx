import type { ReactNode } from 'react'
import { cn } from '../../lib/cn'
import { FieldError, TextField } from './FormField'
import type { ContactDraft } from './drafts'
import { IDS, type FieldErrors } from './validation'

interface ContactFieldsProps {
  value: ContactDraft
  onChange: (patch: Partial<ContactDraft>) => void
  errors: FieldErrors
  /** E-mail de acesso, oferecido como atalho para o e-mail público */
  suggestedEmail?: string
}

const ICONS = {
  whatsapp:
    'M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2Zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.3-.5 0-1 .2-3.3-.7-2.8-1.1-4.5-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2.1 1-2.4c.3-.3.6-.3.8-.3h.6c.2 0 .4 0 .6.5l.9 2.1c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.2-.3.3-.1.6.2.3.8 1.3 1.6 2.1 1.1 1 2.1 1.3 2.4 1.4.3.2.5.1.6 0l.9-1.1c.2-.3.4-.2.7-.1l2 1c.3.1.5.2.5.3.1.2.1.7-.1 1.3Z',
  email:
    'M3 6.5A2.5 2.5 0 0 1 5.5 4h13A2.5 2.5 0 0 1 21 6.5v11a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5v-11Zm2.3-.3 6.7 5.3 6.7-5.3a.5.5 0 0 0-.2 0h-13l-.2.1Zm13.7 2.1-6.4 5a1 1 0 0 1-1.2 0L5 8.3v9.2c0 .3.2.5.5.5h13c.3 0 .5-.2.5-.5V8.3Z',
  instagram:
    'M7.5 3h9A4.5 4.5 0 0 1 21 7.5v9a4.5 4.5 0 0 1-4.5 4.5h-9A4.5 4.5 0 0 1 3 16.5v-9A4.5 4.5 0 0 1 7.5 3Zm0 2A2.5 2.5 0 0 0 5 7.5v9A2.5 2.5 0 0 0 7.5 19h9a2.5 2.5 0 0 0 2.5-2.5v-9A2.5 2.5 0 0 0 16.5 5h-9ZM12 8a4 4 0 1 1 0 8 4 4 0 0 1 0-8Zm0 2a2 2 0 1 0 0 4 2 2 0 0 0 0-4Zm4.5-3.2a1 1 0 1 1 0 2 1 1 0 0 1 0-2Z',
  facebook:
    'M13.5 21v-7.5H16l.4-3h-2.9V8.6c0-.9.3-1.5 1.5-1.5h1.5V4.4c-.3 0-1.2-.1-2.2-.1-2.2 0-3.8 1.4-3.8 3.9v2.3H8v3h2.5V21h3Z',
  website:
    'M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20Zm6.9 6h-3a15.7 15.7 0 0 0-1.3-3.9A8 8 0 0 1 18.9 8ZM12 4c.8 1.1 1.5 2.5 1.9 4h-3.8c.4-1.5 1.1-2.9 1.9-4ZM4.3 14a8.2 8.2 0 0 1 0-4h3.4a16.5 16.5 0 0 0 0 4H4.3Zm.8 2h3c.3 1.4.8 2.7 1.3 3.9A8 8 0 0 1 5.1 16ZM8 8H5.1a8 8 0 0 1 4.3-3.9C8.9 5.3 8.4 6.6 8 8Zm4 12c-.8-1.1-1.5-2.5-1.9-4h3.8c-.4 1.5-1.1 2.9-1.9 4Zm2.3-6H9.7a14.7 14.7 0 0 1 0-4h4.6a14.7 14.7 0 0 1 0 4Zm.3 5.9c.5-1.2 1-2.5 1.3-3.9h3a8 8 0 0 1-4.3 3.9Zm1.7-5.9a16.5 16.5 0 0 0 0-4h3.4a8.2 8.2 0 0 1 0 4h-3.4Z',
} as const

function LabelWithIcon({ path, iconClass, children }: { path: string; iconClass: string; children: ReactNode }) {
  return (
    <span className="inline-flex items-center gap-2.5 align-middle">
      <span aria-hidden="true" className={cn('flex size-8 shrink-0 items-center justify-center rounded-lg', iconClass)}>
        <svg viewBox="0 0 24 24" fill="currentColor" className="size-5">
          <path d={path} />
        </svg>
      </span>
      {children}
    </span>
  )
}

/**
 * Etapa "Canais de contato": pelo menos um é obrigatório.
 * Não há chat interno — esses canais são exibidos publicamente no pedido.
 */
export function ContactFields({ value, onChange, errors, suggestedEmail }: ContactFieldsProps) {
  const id = IDS.contact
  const groupError = errors[id.group]

  return (
    <fieldset
      id={id.group}
      aria-describedby={cn(`${id.group}-hint`, groupError && `${id.group}-error`)}
      className="flex min-w-0 flex-col gap-6"
    >
      <legend className="sr-only">Canais de contato (preencha pelo menos um)</legend>

      <div
        id={`${id.group}-hint`}
        className="flex gap-3 rounded-2xl bg-primary-soft p-4 text-base text-teal-900 ring-1 ring-teal-200"
      >
        <svg
          aria-hidden="true"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          className="mt-0.5 size-6 shrink-0"
        >
          <path d="M12 21a9 9 0 1 0-9-9c0 1.6.4 3.1 1.2 4.4L3 21l4.6-1.2A9 9 0 0 0 12 21Z" strokeLinejoin="round" />
          <path d="M12 8v.01M12 11v5" strokeLinecap="round" />
        </svg>
        <p>
          <strong className="font-semibold">Preencha pelo menos um canal.</strong> Eles aparecem publicamente
          no seu pedido para que voluntários falem direto com você, já que o Pontes não tem chat interno.
          Divulgue apenas contatos que você aceita compartilhar.
        </p>
      </div>

      <FieldError id={`${id.group}-error`} message={groupError} />

      <TextField
        id={id.whatsapp}
        label={
          <LabelWithIcon path={ICONS.whatsapp} iconClass="bg-green-100 text-green-800">
            WhatsApp
          </LabelWithIcon>
        }
        hint="Com DDD. Voluntários abrirão uma conversa com uma mensagem pronta sobre o seu pedido."
        type="tel"
        inputMode="tel"
        autoComplete="tel"
        placeholder="(24) 99999-0000"
        value={value.whatsapp}
        hideOptional
        error={errors[id.whatsapp]}
        onChange={(e) => onChange({ whatsapp: e.target.value })}
      />

      <div className="flex flex-col gap-2">
        <TextField
          id={id.email}
          label={
            <LabelWithIcon path={ICONS.email} iconClass="bg-navy-100 text-navy-800">
              E-mail público
            </LabelWithIcon>
          }
          hint="Pode ser diferente do e-mail de acesso."
          type="email"
          inputMode="email"
          autoComplete="email"
          autoCapitalize="none"
          spellCheck={false}
          placeholder="contato@exemplo.org"
          value={value.email}
          hideOptional
          error={errors[id.email]}
          onChange={(e) => onChange({ email: e.target.value })}
        />
        {suggestedEmail && !value.email.trim() && (
          <button
            type="button"
            onClick={() => onChange({ email: suggestedEmail })}
            className="inline-flex min-h-12 max-w-full items-center gap-2 self-start rounded-full px-3 text-left text-sm font-semibold break-all text-primary hover:bg-primary-soft focus-ring"
          >
            Usar meu e-mail de acesso ({suggestedEmail})
          </button>
        )}
      </div>

      <TextField
        id={id.instagram}
        label={
          <LabelWithIcon path={ICONS.instagram} iconClass="bg-pink-100 text-pink-900">
            Instagram
          </LabelWithIcon>
        }
        hint="O @ do perfil ou o link completo."
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="@seuperfil"
        value={value.instagram}
        hideOptional
        error={errors[id.instagram]}
        onChange={(e) => onChange({ instagram: e.target.value })}
      />

      <TextField
        id={id.facebook}
        label={
          <LabelWithIcon path={ICONS.facebook} iconClass="bg-blue-100 text-blue-900">
            Facebook
          </LabelWithIcon>
        }
        hint="O nome da página ou o link completo."
        inputMode="url"
        autoComplete="off"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="facebook.com/suapagina"
        value={value.facebook}
        hideOptional
        error={errors[id.facebook]}
        onChange={(e) => onChange({ facebook: e.target.value })}
      />

      <TextField
        id={id.website}
        label={
          <LabelWithIcon path={ICONS.website} iconClass="bg-teal-100 text-teal-900">
            Site
          </LabelWithIcon>
        }
        type="url"
        inputMode="url"
        autoComplete="url"
        autoCapitalize="none"
        spellCheck={false}
        placeholder="www.exemplo.org.br"
        value={value.website}
        hideOptional
        error={errors[id.website]}
        onChange={(e) => onChange({ website: e.target.value })}
      />
    </fieldset>
  )
}
