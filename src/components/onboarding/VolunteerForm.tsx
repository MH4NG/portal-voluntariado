import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { AVAILABILITY, CATEGORY_LIST } from '../../data/categories'
import { NEIGHBORHOODS } from '../../data/neighborhoods'
import { formatPhone, normalizeWhatsapp } from '../../lib/contact'
import { DUPLICATE_EMAIL_MESSAGE, hasAccount } from '../../lib/accounts'
import { createId } from '../../lib/id'
import type { Availability, CategoryId, VolunteerProfile } from '../../types'
import { CategoryBadge } from '../ui/Badge'
import { CheckboxCard, Checkbox, ChoiceGroup, Select, TextArea, TextField } from './FormField'
import { VolunteerSuccess } from './SignupSuccess'
import { ReviewItem, ReviewSection, StepForm, WizardLayout } from './StepLayout'
import { ABOUT_MAX, EMPTY_VOLUNTEER, type VolunteerDraft } from './drafts'
import { useWizard } from './useWizard'
import {
  IDS,
  validateVolunteerAvailability,
  validateVolunteerInterests,
  validateVolunteerPersonal,
  validateVolunteerReview,
  type FieldErrors,
} from './validation'

const STEPS = ['Seus dados', 'Interesses', 'Disponibilidade', 'Revisão'] as const
const STORAGE_KEY = 'pontes:rascunho:voluntario'

const CATEGORY_HINTS: Record<CategoryId, string> = {
  animais: 'Abrigos, resgates e lares temporários',
  idosos: 'Companhia, leitura e apoio no dia a dia',
  'meio-ambiente': 'Mutirões, plantio e reciclagem',
  alimentacao: 'Cozinhas solidárias e arrecadações',
  educacao: 'Reforço escolar, leitura e oficinas',
  saude: 'Campanhas, acolhimento e prevenção',
  moradia: 'Reparos, reformas e abrigo',
  criancas: 'Recreação, cuidado e atividades',
}

const AVAILABILITY_META: Record<Availability, { hint: string; icon: string }> = {
  manha: { hint: 'Entre 8h e 12h', icon: '🌅' },
  tarde: { hint: 'Entre 12h e 18h', icon: '☀️' },
  noite: { hint: 'Entre 18h e 22h', icon: '🌙' },
  'fins-de-semana': { hint: 'Sábados, domingos e feriados', icon: '📅' },
}

function validateStep(step: number, d: VolunteerDraft): FieldErrors {
  switch (step) {
    case 0: {
      const errors = validateVolunteerPersonal(d)
      // Não substitui silenciosamente um cadastro existente
      if (!errors[IDS.vol.email] && hasAccount(d.email)) errors[IDS.vol.email] = DUPLICATE_EMAIL_MESSAGE
      return errors
    }
    case 1:
      return validateVolunteerInterests(d)
    case 2:
      return validateVolunteerAvailability(d)
    default:
      return validateVolunteerReview(d)
  }
}

function toggle<T>(list: T[], item: T, on: boolean): T[] {
  return on ? (list.includes(item) ? list : [...list, item]) : list.filter((x) => x !== item)
}

interface VolunteerFormProps {
  /** Move o foco para a etapa ao montar (quando a pessoa acabou de escolher o perfil) */
  autoFocus?: boolean
  notice?: ReactNode
}

/** Perfil A — cadastro de voluntário(a) em 4 etapas. */
export function VolunteerForm({ autoFocus = false, notice }: VolunteerFormProps) {
  const { register } = useAuth()
  const [profile, setProfile] = useState<VolunteerProfile | null>(null)
  const w = useWizard<VolunteerDraft>({
    storageKey: STORAGE_KEY,
    initial: EMPTY_VOLUNTEER,
    totalSteps: STEPS.length,
    validate: validateStep,
    focusFirstStep: autoFocus,
  })
  const d = w.data
  const id = IDS.vol

  if (profile) return <VolunteerSuccess profile={profile} />

  const set = (patch: Partial<VolunteerDraft>) => w.update((prev) => ({ ...prev, ...patch }))

  function handleSubmit() {
    if (!w.isLast) {
      w.next()
      return
    }
    if (!w.check()) return
    const phone = d.phone.trim() ? normalizeWhatsapp(d.phone) : null
    const p: VolunteerProfile = {
      kind: 'voluntario',
      id: createId(d.name),
      name: d.name.trim().replace(/\s+/g, ' '),
      email: d.email.trim().toLowerCase(),
      interests: d.interests,
      availability: d.availability,
      createdAt: new Date().toISOString(),
    }
    if (phone) p.phone = phone
    if (d.neighborhood) p.neighborhood = d.neighborhood
    if (d.about.trim()) p.about = d.about.trim()
    register(p)
    w.finish()
    setProfile(p)
  }

  const common = {
    errors: w.errors,
    attempt: w.attempt,
    focusHeading: w.focusHeading,
    direction: w.direction,
    onSubmit: handleSubmit,
    onBack: w.step > 0 ? w.back : undefined,
  }

  let content: ReactNode
  switch (w.step) {
    case 0:
      content = (
        <StepForm
          key="dados"
          {...common}
          title="Seus dados"
          description="Como podemos chamar e encontrar você? Seus contatos não aparecem publicamente."
        >
          <TextField
            id={id.name}
            label="Nome completo"
            required
            autoComplete="name"
            autoCapitalize="words"
            value={d.name}
            maxLength={100}
            error={w.errors[id.name]}
            onChange={(e) => set({ name: e.target.value })}
          />
          <TextField
            id={id.email}
            label="E-mail"
            hint="Você usará este e-mail para entrar no portal."
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={d.email}
            maxLength={120}
            error={w.errors[id.email]}
            onChange={(e) => set({ email: e.target.value })}
          />
          {w.errors[id.email] === DUPLICATE_EMAIL_MESSAGE && (
            <p className="-mt-3">
              <Link
                to={`/entrar?next=${encodeURIComponent('/acoes')}`}
                className="inline-flex min-h-12 items-center gap-1.5 rounded-md font-semibold text-primary underline underline-offset-4 hover:text-primary-hover focus-ring"
              >
                Entrar com este e-mail
              </Link>
            </p>
          )}
          <div className="grid gap-6 sm:grid-cols-2">
            <TextField
              id={id.phone}
              label="WhatsApp ou telefone"
              hint="Com DDD, ex.: (24) 99999-0000."
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              value={d.phone}
              maxLength={20}
              error={w.errors[id.phone]}
              onChange={(e) => set({ phone: e.target.value })}
              onBlur={() => {
                const n = d.phone.trim() ? normalizeWhatsapp(d.phone) : null
                if (n) set({ phone: formatPhone(n) })
              }}
            />
            <Select
              id={id.neighborhood}
              label="Bairro onde você mora"
              hint="Ajuda a sugerir ações perto de você."
              value={d.neighborhood}
              error={w.errors[id.neighborhood]}
              onChange={(e) => set({ neighborhood: e.target.value })}
            >
              <option value="">Prefiro não informar</option>
              {NEIGHBORHOODS.map((n) => (
                <option key={n.name} value={n.name}>
                  {n.name}
                </option>
              ))}
            </Select>
          </div>
        </StepForm>
      )
      break

    case 1:
      content = (
        <StepForm
          key="interesses"
          {...common}
          title="Interesses"
          description="Escolha as causas que tocam você. Vamos priorizar essas ações nas sugestões."
        >
          <ChoiceGroup
            id={id.interests}
            legend="Quais causas você quer apoiar?"
            hint="Escolha quantas quiser."
            required
            error={w.errors[id.interests]}
          >
            {CATEGORY_LIST.map((c) => (
              <CheckboxCard
                key={c.id}
                name={id.interests}
                value={c.id}
                checked={d.interests.includes(c.id)}
                onChange={(on) => set({ interests: toggle(d.interests, c.id, on) })}
                label={c.label}
                description={CATEGORY_HINTS[c.id]}
                icon={c.emoji}
                invalid={Boolean(w.errors[id.interests])}
                describedBy={w.errors[id.interests] ? `${id.interests}-error` : undefined}
              />
            ))}
          </ChoiceGroup>
          <p className="text-sm font-semibold text-ink-muted" aria-live="polite">
            {d.interests.length === 0
              ? 'Nenhuma causa selecionada.'
              : d.interests.length === 1
                ? '1 causa selecionada.'
                : `${d.interests.length} causas selecionadas.`}
          </p>
        </StepForm>
      )
      break

    case 2:
      content = (
        <StepForm
          key="disponibilidade"
          {...common}
          title="Disponibilidade"
          description="Quando fica melhor para você? Você combina os detalhes direto com quem precisa."
        >
          <ChoiceGroup
            id={id.availability}
            legend="Em quais períodos você pode ajudar?"
            hint="Escolha um ou mais períodos."
            required
            error={w.errors[id.availability]}
          >
            {(Object.keys(AVAILABILITY) as Availability[]).map((a) => (
              <CheckboxCard
                key={a}
                name={id.availability}
                value={a}
                checked={d.availability.includes(a)}
                onChange={(on) => set({ availability: toggle(d.availability, a, on) })}
                label={AVAILABILITY[a]}
                description={AVAILABILITY_META[a].hint}
                icon={AVAILABILITY_META[a].icon}
                invalid={Boolean(w.errors[id.availability])}
                describedBy={w.errors[id.availability] ? `${id.availability}-error` : undefined}
              />
            ))}
          </ChoiceGroup>
          <TextArea
            id={id.about}
            label="Conte um pouco sobre você"
            hint="Habilidades, experiências ou o que motiva você. Ex.: sou enfermeira aposentada e adoro cozinhar."
            rows={4}
            value={d.about}
            maxLength={ABOUT_MAX}
            counter
            error={w.errors[id.about]}
            onChange={(e) => set({ about: e.target.value })}
          />
        </StepForm>
      )
      break

    default:
      content = (
        <StepForm
          key="revisao"
          {...common}
          title="Revisão"
          description="Confira suas informações antes de concluir. Você pode editar qualquer parte."
          submitLabel="Concluir cadastro"
          showRequiredNote={false}
        >
          <ReviewSection title="Seus dados" onEdit={() => w.goTo(0)}>
            <ReviewItem label="Nome">{d.name}</ReviewItem>
            <ReviewItem label="E-mail">{d.email}</ReviewItem>
            <ReviewItem label="WhatsApp ou telefone">
              {d.phone.trim() ? formatPhone(normalizeWhatsapp(d.phone) ?? d.phone) : 'Não informado'}
            </ReviewItem>
            <ReviewItem label="Bairro">{d.neighborhood || 'Não informado'}</ReviewItem>
          </ReviewSection>
          <ReviewSection title="Interesses" onEdit={() => w.goTo(1)}>
            <ReviewItem label="Causas" wide>
              <ul className="mt-1 flex flex-wrap gap-2">
                {d.interests.map((c) => (
                  <li key={c}>
                    <CategoryBadge category={c} />
                  </li>
                ))}
              </ul>
            </ReviewItem>
          </ReviewSection>
          <ReviewSection title="Disponibilidade" onEdit={() => w.goTo(2)}>
            <ReviewItem label="Períodos" wide>
              {d.availability.map((a) => AVAILABILITY[a]).join(', ')}
            </ReviewItem>
            {d.about.trim() && (
              <ReviewItem label="Sobre você" wide>
                <span className="font-normal whitespace-pre-line">{d.about.trim()}</span>
              </ReviewItem>
            )}
          </ReviewSection>
          <Checkbox
            id={id.consent}
            required
            checked={d.consent}
            onChange={(consent) => set({ consent })}
            error={w.errors[id.consent]}
            label="Concordo com os termos e com o tratamento dos meus dados conforme a LGPD"
            hint="Seus dados são usados apenas para conectar você a ações voluntárias e nunca são vendidos. Você pode pedir a exclusão a qualquer momento pelos canais de contato da prefeitura."
          />
        </StepForm>
      )
  }

  return (
    <WizardLayout
      eyebrow="Cadastro de voluntário(a)"
      title="Que bom ter você por aqui"
      intro={
        <p>
          Em 4 etapas rápidas, conhecemos suas causas e horários para sugerir ações que combinam com você.
        </p>
      }
      steps={STEPS}
      current={w.step}
      stepsLabel="Etapas do cadastro de voluntário(a)"
      backLink={{ to: '/cadastro', label: 'Trocar perfil' }}
      notice={notice}
    >
      {content}
    </WizardLayout>
  )
}
