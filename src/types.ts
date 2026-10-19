export type CategoryId =
  | 'animais'
  | 'idosos'
  | 'meio-ambiente'
  | 'alimentacao'
  | 'educacao'
  | 'saude'
  | 'moradia'
  | 'criancas'

export type Urgency = 'alta' | 'media' | 'baixa'

export interface LatLng {
  lat: number
  lng: number
}

/** Canais de contato que o criador da ação escolhe divulgar. Todos opcionais. */
export interface ContactChannels {
  /** Somente dígitos, com DDI + DDD. Ex.: "5524999990001" */
  whatsapp?: string
  email?: string
  /** URL completa do perfil */
  instagram?: string
  /** URL completa da página */
  facebook?: string
  /** URL completa do site institucional */
  website?: string
}

export interface HelpRequest {
  id: string
  title: string
  /** Resumo curto (≤ 140 caracteres) para cards e InfoWindow */
  summary: string
  /** Texto completo exibido na página de detalhes */
  description: string
  category: CategoryId
  urgency: Urgency
  /** Pessoa ou instituição que criou o pedido */
  organization: string
  neighborhood: string
  address: string
  location: LatLng
  /** ISO 8601 */
  createdAt: string
  /** ISO 8601 (data limite, opcional) */
  neededBy?: string
  volunteersNeeded?: number
  /** URL ou data URL de imagem enviada pelo criador */
  image?: string
  imageAlt?: string
  contact: ContactChannels
  /** O que concretamente é necessário (lista curta) */
  needs?: string[]
}

export type Availability = 'manha' | 'tarde' | 'noite' | 'fins-de-semana'

export interface VolunteerProfile {
  kind: 'voluntario'
  id: string
  name: string
  email: string
  phone?: string
  neighborhood?: string
  interests: CategoryId[]
  availability: Availability[]
  about?: string
  createdAt: string
}

export interface BeneficiaryProfile {
  kind: 'beneficiario'
  id: string
  /** Nome da pessoa ou razão social/nome fantasia da instituição */
  name: string
  entityType: 'pessoa' | 'instituicao'
  email: string
  /** CPF ou CNPJ (opcional no MVP) */
  document?: string
  contact: ContactChannels
  requestIds: string[]
  createdAt: string
}

export type UserProfile = VolunteerProfile | BeneficiaryProfile
