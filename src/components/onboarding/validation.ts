import { findNeighborhood } from '../../data/neighborhoods'
import { isValidEmail, normalizeUrl, normalizeWhatsapp, onlyDigits } from '../../lib/contact'
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  IMAGE_ALT_MAX,
  SUMMARY_MAX,
  TITLE_MAX,
  hasAnyContact,
  normalizeSocial,
  todayISODate,
  type AddressDraft,
  type ContactDraft,
  type IdentityDraft,
  type RequestDraft,
  type VolunteerDraft,
} from './drafts'

/** Mensagens de erro indexadas pelo id do campo no DOM (na ordem visual). */
export type FieldErrors = Record<string, string>

/** IDs dos campos — compartilhados entre validação, ErrorSummary e componentes. */
export const IDS = {
  vol: {
    name: 'vol-name',
    email: 'vol-email',
    phone: 'vol-phone',
    neighborhood: 'vol-neighborhood',
    interests: 'vol-interests',
    availability: 'vol-availability',
    about: 'vol-about',
    consent: 'vol-consent',
  },
  identity: {
    entityType: 'ben-entity',
    name: 'ben-name',
    email: 'ben-email',
    document: 'ben-document',
    consent: 'ben-consent',
  },
  request: {
    title: 'req-title',
    summary: 'req-summary',
    description: 'req-description',
    category: 'req-category',
    urgency: 'req-urgency',
    needs: 'req-needs',
    volunteers: 'req-volunteers',
    deadline: 'req-deadline',
    image: 'req-image',
    imageAlt: 'req-image-alt',
  },
  address: {
    address: 'loc-address',
    neighborhood: 'loc-neighborhood',
  },
  contact: {
    group: 'contact-group',
    whatsapp: 'contact-whatsapp',
    email: 'contact-email',
    instagram: 'contact-instagram',
    facebook: 'contact-facebook',
    website: 'contact-website',
  },
} as const

export function hasErrors(errors: FieldErrors): boolean {
  return Object.keys(errors).length > 0
}

/* ---------------------------- Voluntário ---------------------------- */

export function validateVolunteerPersonal(d: VolunteerDraft): FieldErrors {
  const e: FieldErrors = {}
  const name = d.name.trim()
  if (!name) e[IDS.vol.name] = 'Informe seu nome completo.'
  else if (name.length < 3) e[IDS.vol.name] = 'O nome precisa ter pelo menos 3 letras.'
  if (!d.email.trim()) e[IDS.vol.email] = 'Informe seu e-mail.'
  else if (!isValidEmail(d.email)) e[IDS.vol.email] = 'Digite um e-mail válido, como nome@exemplo.com.'
  if (d.phone.trim() && !normalizeWhatsapp(d.phone)) {
    e[IDS.vol.phone] = 'Digite o telefone com DDD, como (24) 99999-0000.'
  }
  return e
}

export function validateVolunteerInterests(d: VolunteerDraft): FieldErrors {
  return d.interests.length === 0
    ? { [IDS.vol.interests]: 'Escolha pelo menos uma causa que você quer apoiar.' }
    : {}
}

export function validateVolunteerAvailability(d: VolunteerDraft): FieldErrors {
  const e: FieldErrors = {}
  if (d.availability.length === 0) {
    e[IDS.vol.availability] = 'Escolha pelo menos um período em que você pode ajudar.'
  }
  return e
}

export function validateVolunteerReview(d: VolunteerDraft): FieldErrors {
  return d.consent
    ? {}
    : { [IDS.vol.consent]: 'Para concluir, é preciso concordar com os termos e com a LGPD.' }
}

/* --------------------------- Beneficiário --------------------------- */

export function validateIdentity(d: IdentityDraft): FieldErrors {
  const e: FieldErrors = {}
  const isOrg = d.entityType === 'instituicao'
  const name = d.name.trim()
  if (!name) e[IDS.identity.name] = isOrg ? 'Informe o nome da instituição.' : 'Informe seu nome completo.'
  else if (name.length < 3) e[IDS.identity.name] = 'O nome precisa ter pelo menos 3 letras.'
  if (!d.email.trim()) e[IDS.identity.email] = 'Informe um e-mail de acesso.'
  else if (!isValidEmail(d.email)) e[IDS.identity.email] = 'Digite um e-mail válido, como nome@exemplo.com.'
  const digits = onlyDigits(d.document)
  if (digits.length > 0) {
    if (!isOrg && digits.length !== 11) e[IDS.identity.document] = 'O CPF deve ter 11 números.'
    if (isOrg && digits.length !== 14) e[IDS.identity.document] = 'O CNPJ deve ter 14 números.'
  }
  return e
}

export function validateConsent(consent: boolean, id: string): FieldErrors {
  return consent ? {} : { [id]: 'Para publicar, é preciso concordar com os termos e com a LGPD.' }
}

/* ------------------------------ Pedido ------------------------------ */

export function validateRequest(d: RequestDraft, today: string = todayISODate()): FieldErrors {
  const e: FieldErrors = {}
  const id = IDS.request
  const title = d.title.trim()
  if (!title) e[id.title] = 'Dê um título ao seu pedido.'
  else if (title.length < 8) e[id.title] = 'O título precisa ter pelo menos 8 caracteres.'
  else if (title.length > TITLE_MAX) e[id.title] = `O título pode ter no máximo ${TITLE_MAX} caracteres.`

  const summary = d.summary.trim()
  if (!summary) e[id.summary] = 'Escreva um resumo curto do pedido.'
  else if (summary.length > SUMMARY_MAX) e[id.summary] = `O resumo pode ter no máximo ${SUMMARY_MAX} caracteres.`

  const description = d.description.trim()
  if (!description) e[id.description] = 'Descreva o pedido com mais detalhes.'
  else if (description.length < DESCRIPTION_MIN) {
    const missing = DESCRIPTION_MIN - description.length
    e[id.description] = `A descrição precisa ter pelo menos ${DESCRIPTION_MIN} caracteres (faltam ${missing}).`
  } else if (description.length > DESCRIPTION_MAX) {
    e[id.description] = `A descrição pode ter no máximo ${DESCRIPTION_MAX} caracteres.`
  }

  if (!d.category) e[id.category] = 'Escolha a categoria que melhor descreve o pedido.'
  if (!d.urgency) e[id.urgency] = 'Indique a urgência do pedido.'

  if (d.volunteersNeeded.trim()) {
    const n = Number(d.volunteersNeeded)
    if (!Number.isInteger(n) || n < 1 || n > 500) {
      e[id.volunteers] = 'Informe um número inteiro de voluntários entre 1 e 500.'
    }
  }

  if (d.neededBy) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(d.neededBy)) e[id.deadline] = 'Informe uma data válida.'
    else if (d.neededBy < today) e[id.deadline] = 'O prazo não pode ser uma data que já passou.'
  }

  if (d.image) {
    const alt = d.imageAlt.trim()
    if (!alt) e[id.imageAlt] = 'Descreva a imagem para quem usa leitor de tela.'
    else if (alt.length < 5) e[id.imageAlt] = 'A descrição da imagem precisa ter pelo menos 5 caracteres.'
    else if (alt.length > IMAGE_ALT_MAX) {
      e[id.imageAlt] = `A descrição da imagem pode ter no máximo ${IMAGE_ALT_MAX} caracteres.`
    }
  }
  return e
}

/* ----------------------------- Endereço ----------------------------- */

export function validateAddress(d: AddressDraft): FieldErrors {
  const e: FieldErrors = {}
  const address = d.address.trim()
  if (!address) e[IDS.address.address] = 'Informe o endereço onde a ajuda é necessária.'
  else if (address.length < 5) e[IDS.address.address] = 'Informe rua e número, como R. XV de Novembro, 1000.'
  if (!d.neighborhood) e[IDS.address.neighborhood] = 'Escolha o bairro.'
  else if (!findNeighborhood(d.neighborhood)) e[IDS.address.neighborhood] = 'Escolha um bairro da lista.'
  return e
}

/* ----------------------------- Contatos ----------------------------- */

export function validateContacts(d: ContactDraft): FieldErrors {
  const e: FieldErrors = {}
  const id = IDS.contact
  if (!hasAnyContact(d)) {
    e[id.group] = 'Preencha pelo menos um canal de contato para os voluntários falarem com você.'
    return e
  }
  if (d.whatsapp.trim() && !normalizeWhatsapp(d.whatsapp)) {
    e[id.whatsapp] = 'Digite o WhatsApp com DDD, como (24) 99999-0000.'
  }
  if (d.email.trim() && !isValidEmail(d.email)) {
    e[id.email] = 'Digite um e-mail válido, como contato@exemplo.org.'
  }
  if (d.instagram.trim() && !normalizeSocial(d.instagram, 'instagram')) {
    e[id.instagram] = 'Use o @ do perfil ou o link completo do Instagram.'
  }
  if (d.facebook.trim() && !normalizeSocial(d.facebook, 'facebook')) {
    e[id.facebook] = 'Use o nome da página ou o link completo do Facebook.'
  }
  if (d.website.trim() && !normalizeUrl(d.website)) {
    e[id.website] = 'Digite um endereço de site válido, como www.exemplo.org.br.'
  }
  return e
}
