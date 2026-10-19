import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useRequests, type AddRequestResult } from '../../context/RequestsContext'
import { DUPLICATE_EMAIL_MESSAGE, hasAccount } from '../../lib/accounts'
import { createId } from '../../lib/id'
import type { BeneficiaryProfile } from '../../types'
import { ContactFields } from './ContactFields'
import { Checkbox, ChoiceGroup, RadioCard, TextField } from './FormField'
import { LocationPicker } from './LocationPicker'
import { RequestFields } from './RequestFields'
import { RequestReview } from './RequestReview'
import { RequestSuccess } from './SignupSuccess'
import { ReviewItem, ReviewSection, StepForm, WizardLayout } from './StepLayout'
import {
  EMPTY_ADDRESS,
  EMPTY_CONTACT,
  EMPTY_IDENTITY,
  EMPTY_REQUEST,
  buildRequestInput,
  formatDocument,
  normalizeContacts,
  type AddressDraft,
  type ContactDraft,
  type EntityType,
  type IdentityDraft,
  type RequestDraft,
} from './drafts'
import { useWizard } from './useWizard'
import {
  IDS,
  validateAddress,
  validateConsent,
  validateContacts,
  validateIdentity,
  validateRequest,
  type FieldErrors,
} from './validation'

const STEPS = ['Quem é você', 'Seu pedido', 'Endereço', 'Canais de contato', 'Revisão'] as const
const STORAGE_KEY = 'pontes:rascunho:beneficiario'

interface BeneficiaryDraft {
  identity: IdentityDraft
  request: RequestDraft
  address: AddressDraft
  contact: ContactDraft
  consent: boolean
}

const INITIAL: BeneficiaryDraft = {
  identity: EMPTY_IDENTITY,
  request: EMPTY_REQUEST,
  address: EMPTY_ADDRESS,
  contact: EMPTY_CONTACT,
  consent: false,
}

function hydrate(stored: Partial<BeneficiaryDraft>, initial: BeneficiaryDraft): BeneficiaryDraft {
  return {
    identity: { ...initial.identity, ...stored.identity },
    request: { ...initial.request, ...stored.request },
    address: { ...initial.address, ...stored.address },
    contact: { ...initial.contact, ...stored.contact },
    consent: Boolean(stored.consent),
  }
}

/** Se a cota do sessionStorage estourar, o rascunho é salvo sem a imagem. */
function withoutImage(d: BeneficiaryDraft): BeneficiaryDraft {
  return { ...d, request: { ...d.request, image: undefined } }
}

function validateStep(step: number, d: BeneficiaryDraft): FieldErrors {
  switch (step) {
    case 0: {
      const errors = validateIdentity(d.identity)
      // Não substitui silenciosamente um cadastro existente
      if (!errors[IDS.identity.email] && hasAccount(d.identity.email)) {
        errors[IDS.identity.email] = DUPLICATE_EMAIL_MESSAGE
      }
      return errors
    }
    case 1:
      return validateRequest(d.request)
    case 2:
      return validateAddress(d.address)
    case 3:
      return validateContacts(d.contact)
    default:
      return validateConsent(d.consent, IDS.identity.consent)
  }
}

const ENTITY_OPTIONS: Array<{ value: EntityType; label: string; description: string; icon: string }> = [
  { value: 'pessoa', label: 'Pessoa', description: 'Para você, sua família ou sua vizinhança.', icon: '🙋' },
  {
    value: 'instituicao',
    label: 'Instituição',
    description: 'ONG, associação, escola, coletivo ou projeto social.',
    icon: '🏛️',
  },
]

interface BeneficiaryFormProps {
  autoFocus?: boolean
  notice?: ReactNode
}

/** Perfil B — pessoa ou instituição que precisa de ajuda: cadastro + primeiro pedido, em 5 etapas. */
export function BeneficiaryForm({ autoFocus = false, notice }: BeneficiaryFormProps) {
  const { register } = useAuth()
  const { addRequest } = useRequests()
  const [created, setCreated] = useState<AddRequestResult | null>(null)
  const w = useWizard<BeneficiaryDraft>({
    storageKey: STORAGE_KEY,
    initial: INITIAL,
    totalSteps: STEPS.length,
    validate: validateStep,
    hydrate,
    reduceForStorage: withoutImage,
    focusFirstStep: autoFocus,
  })
  const d = w.data

  if (created) {
    return (
      <RequestSuccess request={created.request} persisted={created.persisted} imageDropped={created.imageDropped} />
    )
  }

  const patch =
    <K extends 'identity' | 'request' | 'address' | 'contact'>(key: K) =>
    (p: Partial<BeneficiaryDraft[K]>) =>
      w.update((prev) => ({ ...prev, [key]: { ...prev[key], ...p } }))

  const setIdentity = patch('identity')
  const isOrg = d.identity.entityType === 'instituicao'
  const id = IDS.identity

  function handleSubmit() {
    if (!w.isLast) {
      w.next()
      return
    }
    if (!w.check()) return
    const name = d.identity.name.trim().replace(/\s+/g, ' ')
    const result = addRequest(
      buildRequestInput({ request: d.request, address: d.address, contact: d.contact, organization: name }),
    )
    const request = result.request
    const profile: BeneficiaryProfile = {
      kind: 'beneficiario',
      id: createId(name),
      name,
      entityType: d.identity.entityType,
      email: d.identity.email.trim().toLowerCase(),
      contact: normalizeContacts(d.contact),
      requestIds: [request.id],
      createdAt: new Date().toISOString(),
    }
    if (d.identity.document.trim()) profile.document = d.identity.document.trim()
    register(profile)
    w.finish()
    setCreated(result)
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
          key="quem"
          {...common}
          title="Quem é você"
          description="Conte quem está pedindo ajuda. O nome aparece no pedido; o e-mail de acesso, não."
        >
          <ChoiceGroup id={id.entityType} legend="Você está pedindo ajuda como…" required>
            {ENTITY_OPTIONS.map((opt) => (
              <RadioCard
                key={opt.value}
                name={id.entityType}
                value={opt.value}
                checked={d.identity.entityType === opt.value}
                onChange={() =>
                  setIdentity({
                    entityType: opt.value,
                    document: formatDocument(d.identity.document, opt.value),
                  })
                }
                label={opt.label}
                description={opt.description}
                icon={opt.icon}
              />
            ))}
          </ChoiceGroup>
          <TextField
            id={id.name}
            label={isOrg ? 'Nome da instituição' : 'Nome completo'}
            hint={isOrg ? 'Como a instituição é conhecida na comunidade.' : undefined}
            required
            autoComplete={isOrg ? 'organization' : 'name'}
            autoCapitalize="words"
            value={d.identity.name}
            maxLength={100}
            error={w.errors[id.name]}
            onChange={(e) => setIdentity({ name: e.target.value })}
          />
          <TextField
            id={id.email}
            label="E-mail de acesso"
            hint="Você usará este e-mail para entrar e acompanhar seus pedidos. Ele não aparece publicamente."
            required
            type="email"
            inputMode="email"
            autoComplete="email"
            autoCapitalize="none"
            spellCheck={false}
            value={d.identity.email}
            maxLength={120}
            error={w.errors[id.email]}
            onChange={(e) => setIdentity({ email: e.target.value })}
          />
          {w.errors[id.email] === DUPLICATE_EMAIL_MESSAGE && (
            <p className="-mt-3">
              <Link
                to={`/entrar?next=${encodeURIComponent('/acoes/nova')}`}
                className="inline-flex min-h-12 items-center gap-1.5 rounded-md font-semibold text-primary underline underline-offset-4 hover:text-primary-hover focus-ring"
              >
                Entrar com este e-mail
              </Link>
            </p>
          )}
          <TextField
            id={id.document}
            label={isOrg ? 'CNPJ' : 'CPF'}
            hint="Ajuda a dar mais confiança ao pedido. Não é exibido publicamente."
            inputMode="numeric"
            autoComplete="off"
            placeholder={isOrg ? '00.000.000/0000-00' : '000.000.000-00'}
            value={d.identity.document}
            maxLength={isOrg ? 18 : 14}
            error={w.errors[id.document]}
            onChange={(e) => setIdentity({ document: formatDocument(e.target.value, d.identity.entityType) })}
          />
        </StepForm>
      )
      break

    case 1:
      content = (
        <StepForm
          key="pedido"
          {...common}
          title="Seu pedido"
          description="Quanto mais claro o pedido, mais fácil para um voluntário dizer “eu posso ajudar”."
        >
          <RequestFields value={d.request} onChange={patch('request')} errors={w.errors} />
        </StepForm>
      )
      break

    case 2:
      content = (
        <StepForm
          key="endereco"
          {...common}
          title="Endereço"
          description="Onde a ajuda é necessária? É isso que posiciona seu pedido no mapa."
        >
          <LocationPicker value={d.address} onChange={patch('address')} errors={w.errors} />
        </StepForm>
      )
      break

    case 3:
      content = (
        <StepForm
          key="contato"
          {...common}
          title="Canais de contato"
          description="Como os voluntários podem falar com você?"
          showRequiredNote={false}
        >
          <ContactFields
            value={d.contact}
            onChange={patch('contact')}
            errors={w.errors}
            suggestedEmail={d.identity.email.trim() || undefined}
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
          description="Confira tudo antes de publicar. É assim que voluntários verão seu pedido."
          submitLabel="Publicar pedido"
          showRequiredNote={false}
        >
          <ReviewSection title="Quem é você" onEdit={() => w.goTo(0)}>
            <ReviewItem label="Perfil">{isOrg ? 'Instituição' : 'Pessoa'}</ReviewItem>
            <ReviewItem label={isOrg ? 'Nome da instituição' : 'Nome'}>{d.identity.name}</ReviewItem>
            <ReviewItem label="E-mail de acesso">{d.identity.email}</ReviewItem>
            <ReviewItem label={isOrg ? 'CNPJ' : 'CPF'}>{d.identity.document || 'Não informado'}</ReviewItem>
          </ReviewSection>
          <RequestReview
            request={d.request}
            address={d.address}
            contact={d.contact}
            organization={d.identity.name}
            steps={{ request: 1, address: 2, contact: 3 }}
            onEdit={w.goTo}
          />
          <Checkbox
            id={id.consent}
            required
            checked={d.consent}
            onChange={(consent) => w.update((prev) => ({ ...prev, consent }))}
            error={w.errors[id.consent]}
            label="Concordo com os termos e com o tratamento dos meus dados conforme a LGPD"
            hint="Os canais de contato e o endereço do pedido ficam visíveis publicamente para voluntários. O e-mail de acesso e o documento ficam privados."
          />
        </StepForm>
      )
  }

  return (
    <WizardLayout
      eyebrow="Pedido de ajuda"
      title="Vamos encontrar quem pode ajudar"
      intro={
        <p>
          Em 5 etapas, você cria seu cadastro e publica o pedido no mapa da cidade. Voluntários entram em contato
          direto com você.
        </p>
      }
      steps={STEPS}
      current={w.step}
      stepsLabel="Etapas do cadastro de pedido de ajuda"
      backLink={{ to: '/cadastro', label: 'Trocar perfil' }}
      notice={notice}
    >
      {content}
    </WizardLayout>
  )
}
