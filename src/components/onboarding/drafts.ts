import { CITY } from '../../config'
import type { NewHelpRequest } from '../../context/RequestsContext'
import { findNeighborhood } from '../../data/neighborhoods'
import { formatPhone, normalizeUrl, normalizeWhatsapp, onlyDigits } from '../../lib/contact'
import type {
  Availability,
  CategoryId,
  ContactChannels,
  HelpRequest,
  LatLng,
  Urgency,
} from '../../types'

/* ------------------------------------------------------------------ */
/* Rascunhos (estado dos formulários, sempre strings para inputs)      */
/* ------------------------------------------------------------------ */

export interface VolunteerDraft {
  name: string
  email: string
  phone: string
  neighborhood: string
  interests: CategoryId[]
  availability: Availability[]
  about: string
  consent: boolean
}

export const EMPTY_VOLUNTEER: VolunteerDraft = {
  name: '',
  email: '',
  phone: '',
  neighborhood: '',
  interests: [],
  availability: [],
  about: '',
  consent: false,
}

export type EntityType = 'pessoa' | 'instituicao'

export interface IdentityDraft {
  entityType: EntityType
  name: string
  email: string
  document: string
}

export const EMPTY_IDENTITY: IdentityDraft = {
  entityType: 'pessoa',
  name: '',
  email: '',
  document: '',
}

export interface RequestDraft {
  title: string
  summary: string
  description: string
  category: CategoryId | ''
  urgency: Urgency | ''
  needs: string[]
  volunteersNeeded: string
  /** yyyy-mm-dd (valor do input date) */
  neededBy: string
  /** data URL JPEG já reduzida */
  image?: string
  imageAlt: string
}

export const EMPTY_REQUEST: RequestDraft = {
  title: '',
  summary: '',
  description: '',
  category: '',
  urgency: '',
  needs: [],
  volunteersNeeded: '',
  neededBy: '',
  imageAlt: '',
}

export type LocationSource = 'geocoder' | 'manual'

export interface AddressDraft {
  address: string
  neighborhood: string
  /** Pin definido pelo geocodificador ou ajustado manualmente. null → centro do bairro. */
  pin: LatLng | null
  pinSource: LocationSource | null
}

export const EMPTY_ADDRESS: AddressDraft = {
  address: '',
  neighborhood: '',
  pin: null,
  pinSource: null,
}

export interface ContactDraft {
  whatsapp: string
  email: string
  instagram: string
  facebook: string
  website: string
}

export const EMPTY_CONTACT: ContactDraft = {
  whatsapp: '',
  email: '',
  instagram: '',
  facebook: '',
  website: '',
}

export const MAX_NEEDS = 6
export const TITLE_MAX = 80
export const SUMMARY_MAX = 140
export const DESCRIPTION_MIN = 40
export const DESCRIPTION_MAX = 2000
export const ABOUT_MAX = 500
export const IMAGE_ALT_MAX = 160

/* ------------------------------------------------------------------ */
/* Datas                                                               */
/* ------------------------------------------------------------------ */

/** Data local de hoje no formato yyyy-mm-dd (para o atributo min do input date). */
export function todayISODate(now: Date = new Date()): string {
  const y = now.getFullYear()
  const m = String(now.getMonth() + 1).padStart(2, '0')
  const d = String(now.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

/** Converte yyyy-mm-dd em ISO no fim do dia, no fuso de Petrópolis/Brasília (UTC−3). */
export function dateInputToISO(value: string): string | undefined {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return undefined
  return `${value}T23:59:00-03:00`
}

/* ------------------------------------------------------------------ */
/* Documento (CPF/CNPJ)                                                */
/* ------------------------------------------------------------------ */

/** Máscara simples: CPF (000.000.000-00) ou CNPJ (00.000.000/0000-00). */
export function formatDocument(value: string, entityType: EntityType): string {
  const max = entityType === 'pessoa' ? 11 : 14
  const d = onlyDigits(value).slice(0, max)
  if (entityType === 'pessoa') {
    return d
      .replace(/^(\d{3})(\d)/, '$1.$2')
      .replace(/^(\d{3})\.(\d{3})(\d)/, '$1.$2.$3')
      .replace(/\.(\d{3})(\d{1,2})$/, '.$1-$2')
  }
  return d
    .replace(/^(\d{2})(\d)/, '$1.$2')
    .replace(/^(\d{2})\.(\d{3})(\d)/, '$1.$2.$3')
    .replace(/\.(\d{3})(\d)/, '.$1/$2')
    .replace(/(\d{4})(\d{1,2})$/, '$1-$2')
}

/* ------------------------------------------------------------------ */
/* Contatos                                                            */
/* ------------------------------------------------------------------ */

/** Aceita "@perfil", "perfil" ou URL. Devolve URL completa ou null. */
export function normalizeSocial(value: string, network: 'instagram' | 'facebook'): string | null {
  const v = value.trim()
  if (!v) return null
  const handle = v.replace(/^@/, '')
  if (/^[\w.]{2,50}$/.test(handle) && !handle.includes('..') && !/\.(com|br|org|net)$/i.test(handle)) {
    const host = network === 'instagram' ? 'www.instagram.com' : 'www.facebook.com'
    return `https://${host}/${handle}`
  }
  const url = normalizeUrl(v)
  if (!url) return null
  const hostname = new URL(url).hostname
  const expected = network === 'instagram' ? /(^|\.)instagram\.com$/i : /(^|\.)(facebook|fb)\.com$/i
  return expected.test(hostname) ? url : null
}

export function hasAnyContact(c: ContactDraft): boolean {
  return Object.values(c).some((v) => v.trim().length > 0)
}

/** Converte o rascunho em ContactChannels normalizado (só os campos válidos e preenchidos). */
export function normalizeContacts(c: ContactDraft): ContactChannels {
  const out: ContactChannels = {}
  const whatsapp = c.whatsapp.trim() ? normalizeWhatsapp(c.whatsapp) : null
  if (whatsapp) out.whatsapp = whatsapp
  if (c.email.trim()) out.email = c.email.trim().toLowerCase()
  const instagram = normalizeSocial(c.instagram, 'instagram')
  if (instagram) out.instagram = instagram
  const facebook = normalizeSocial(c.facebook, 'facebook')
  if (facebook) out.facebook = facebook
  const website = normalizeUrl(c.website)
  if (website) out.website = website
  return out
}

/** Preenche o rascunho de contatos a partir dos canais salvos no perfil. */
export function contactDraftFrom(channels?: ContactChannels): ContactDraft {
  return {
    whatsapp: channels?.whatsapp ? formatPhone(channels.whatsapp) : '',
    email: channels?.email ?? '',
    instagram: channels?.instagram ?? '',
    facebook: channels?.facebook ?? '',
    website: channels?.website ?? '',
  }
}

/* ------------------------------------------------------------------ */
/* Localização                                                         */
/* ------------------------------------------------------------------ */

function hashString(value: string): number {
  let h = 2166136261
  for (let i = 0; i < value.length; i++) {
    h ^= value.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return h >>> 0
}

/**
 * Centro do bairro + pequeno deslocamento determinístico (≈ até 350 m) derivado do endereço,
 * para que pedidos do mesmo bairro não fiquem com pins sobrepostos.
 */
export function fallbackLocation(neighborhood: string, address: string): LatLng {
  const base = findNeighborhood(neighborhood)?.center ?? CITY.center
  const key = address.trim().toLocaleLowerCase('pt-BR')
  if (!key) return { ...base }
  const h = hashString(key)
  const dx = ((h & 0xffff) / 0xffff) * 2 - 1
  const dy = (((h >>> 16) & 0xffff) / 0xffff) * 2 - 1
  const spread = 0.0032
  return {
    lat: Number((base.lat + dy * spread).toFixed(6)),
    lng: Number((base.lng + dx * spread).toFixed(6)),
  }
}

export function resolveLocation(a: AddressDraft): LatLng {
  return a.pin ?? fallbackLocation(a.neighborhood, a.address)
}

export function formatLatLng(p: LatLng): string {
  return `${p.lat.toFixed(5)}, ${p.lng.toFixed(5)}`
}

/* ------------------------------------------------------------------ */
/* Montagem do pedido                                                  */
/* ------------------------------------------------------------------ */

export function buildRequestInput(params: {
  request: RequestDraft
  address: AddressDraft
  contact: ContactDraft
  organization: string
}): NewHelpRequest {
  const { request: r, address: a, contact, organization } = params
  const volunteers = Number.parseInt(r.volunteersNeeded, 10)
  const needs = r.needs.map((n) => n.trim()).filter(Boolean)
  const neededBy = dateInputToISO(r.neededBy)
  const input: NewHelpRequest = {
    title: r.title.trim(),
    summary: r.summary.trim(),
    description: r.description.trim(),
    category: (r.category || 'alimentacao') as CategoryId,
    urgency: (r.urgency || 'media') as Urgency,
    organization: organization.trim(),
    neighborhood: findNeighborhood(a.neighborhood)?.name ?? a.neighborhood.trim(),
    address: a.address.trim(),
    location: resolveLocation(a),
    contact: normalizeContacts(contact),
  }
  if (neededBy) input.neededBy = neededBy
  if (Number.isFinite(volunteers) && volunteers > 0) input.volunteersNeeded = volunteers
  if (needs.length) input.needs = needs
  if (r.image) {
    input.image = r.image
    input.imageAlt = r.imageAlt.trim()
  }
  return input
}

/** Objeto temporário para a prévia do card na etapa de revisão. */
export function buildPreviewRequest(params: {
  request: RequestDraft
  address: AddressDraft
  contact: ContactDraft
  organization: string
}): HelpRequest {
  return {
    ...buildRequestInput(params),
    id: 'previa',
    createdAt: new Date().toISOString(),
    title: params.request.title.trim() || 'Título do seu pedido',
    summary: params.request.summary.trim() || 'O resumo do seu pedido aparecerá aqui.',
    neighborhood: params.address.neighborhood || 'Seu bairro',
  }
}
