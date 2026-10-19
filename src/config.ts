import type { LatLng } from './types'

export const CITY = {
  name: 'Curitiba',
  state: 'PR',
  center: { lat: -25.4372, lng: -49.2697 } satisfies LatLng,
  zoom: 12,
} as const

/** Chave da Google Maps JavaScript API. Vazia → o app usa a visualização em lista. */
export const GOOGLE_MAPS_API_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

/** Map ID para AdvancedMarker. DEMO_MAP_ID funciona apenas em desenvolvimento. */
export const GOOGLE_MAPS_MAP_ID: string = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

export const HAS_MAPS_KEY = GOOGLE_MAPS_API_KEY.trim().length > 0

export const SITE = {
  name: 'Pontes',
  tagline: 'Voluntariado Municipal',
  contactEmail: 'pontes@prefeitura.exemplo.gov.br',
  contactPhone: '156',
} as const

/** Mensagem padrão enviada pelo botão de WhatsApp */
export const WHATSAPP_DEFAULT_MESSAGE = (title: string) =>
  `Olá, vi seu pedido "${title}" no Portal de Voluntariado Pontes e gostaria de ajudar!`
