import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useRequests, type AddRequestResult } from '../../context/RequestsContext'
import type { BeneficiaryProfile } from '../../types'
import { ContactFields } from './ContactFields'
import { LocationPicker } from './LocationPicker'
import { RequestFields } from './RequestFields'
import { RequestReview } from './RequestReview'
import { RequestSuccess } from './SignupSuccess'
import { StepForm, WizardLayout } from './StepLayout'
import {
  EMPTY_ADDRESS,
  EMPTY_REQUEST,
  buildRequestInput,
  contactDraftFrom,
  type AddressDraft,
  type ContactDraft,
  type RequestDraft,
} from './drafts'
import { useWizard } from './useWizard'
import { validateAddress, validateContacts, validateRequest, type FieldErrors } from './validation'

const STEPS = ['Seu pedido', 'Endereço', 'Canais de contato', 'Revisão'] as const

interface NewRequestDraft {
  request: RequestDraft
  address: AddressDraft
  contact: ContactDraft
}

function validateStep(step: number, d: NewRequestDraft): FieldErrors {
  switch (step) {
    case 0:
      return validateRequest(d.request)
    case 1:
      return validateAddress(d.address)
    case 2:
      return validateContacts(d.contact)
    default:
      return {}
  }
}

function withoutImage(d: NewRequestDraft): NewRequestDraft {
  return { ...d, request: { ...d.request, image: undefined } }
}

/** Novo pedido para um beneficiário já cadastrado (reaproveita as etapas do cadastro). */
export function NewRequestForm({ user }: { user: BeneficiaryProfile }) {
  const { updateUser } = useAuth()
  const { addRequest } = useRequests()
  const [created, setCreated] = useState<AddRequestResult | null>(null)

  const initial = useMemo<NewRequestDraft>(
    () => ({ request: EMPTY_REQUEST, address: EMPTY_ADDRESS, contact: contactDraftFrom(user.contact) }),
    [user.contact],
  )
  const hydrate = useCallback(
    (stored: Partial<NewRequestDraft>, init: NewRequestDraft): NewRequestDraft => ({
      request: { ...init.request, ...stored.request },
      address: { ...init.address, ...stored.address },
      contact: { ...init.contact, ...stored.contact },
    }),
    [],
  )

  const w = useWizard<NewRequestDraft>({
    storageKey: `pontes:rascunho:novo-pedido:${user.id}`,
    initial,
    totalSteps: STEPS.length,
    validate: validateStep,
    hydrate,
    reduceForStorage: withoutImage,
  })
  const d = w.data

  if (created) {
    return (
      <RequestSuccess
        request={created.request}
        persisted={created.persisted}
        imageDropped={created.imageDropped}
        onCreateAnother={() => {
          w.reset(initial)
          setCreated(null)
        }}
      />
    )
  }

  const patch =
    <K extends keyof NewRequestDraft>(key: K) =>
    (p: Partial<NewRequestDraft[K]>) =>
      w.update((prev) => ({ ...prev, [key]: { ...prev[key], ...p } }))

  function handleSubmit() {
    if (!w.isLast) {
      w.next()
      return
    }
    if (!w.check()) return
    const { request, ...storage } = addRequest(
      buildRequestInput({ request: d.request, address: d.address, contact: d.contact, organization: user.name }),
    )
    updateUser({ requestIds: [...(user.requestIds ?? []), request.id] })
    w.finish()
    setCreated({ request, ...storage })
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
          key="pedido"
          {...common}
          title="Seu pedido"
          description="Quanto mais claro o pedido, mais fácil para um voluntário dizer “eu posso ajudar”."
        >
          <RequestFields value={d.request} onChange={patch('request')} errors={w.errors} />
        </StepForm>
      )
      break
    case 1:
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
    case 2:
      content = (
        <StepForm
          key="contato"
          {...common}
          title="Canais de contato"
          description="Trouxemos os contatos do seu cadastro. Ajuste se este pedido tiver outros responsáveis."
          showRequiredNote={false}
        >
          <ContactFields
            value={d.contact}
            onChange={patch('contact')}
            errors={w.errors}
            suggestedEmail={user.email}
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
          <RequestReview
            request={d.request}
            address={d.address}
            contact={d.contact}
            organization={user.name}
            steps={{ request: 0, address: 1, contact: 2 }}
            onEdit={w.goTo}
          />
        </StepForm>
      )
  }

  return (
    <WizardLayout
      eyebrow={user.name}
      title="Novo pedido de ajuda"
      intro={<p>Em 4 etapas, seu pedido aparece no mapa e no mural para voluntários de toda a cidade.</p>}
      steps={STEPS}
      current={w.step}
      stepsLabel="Etapas do novo pedido"
      backLink={{ to: '/acoes', label: 'Voltar para as ações' }}
    >
      {content}
    </WizardLayout>
  )
}
