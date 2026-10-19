import type { LatLng } from './types'

export const CITY = {
  name: 'Petrópolis',
  state: 'RJ',
  center: { lat: -22.505, lng: -43.179 } satisfies LatLng,
  zoom: 12,
  /** Limites aproximados do município (geocodificação e mapa esquemático). */
  bounds: { north: -22.22, south: -22.58, west: -43.3, east: -43.03 },
} as const

/** Chave da Google Maps JavaScript API. Vazia → o app usa a visualização em lista. */
export const GOOGLE_MAPS_API_KEY: string = import.meta.env.VITE_GOOGLE_MAPS_API_KEY ?? ''

/** Map ID para AdvancedMarker. DEMO_MAP_ID funciona apenas em desenvolvimento. */
export const GOOGLE_MAPS_MAP_ID: string = import.meta.env.VITE_GOOGLE_MAPS_MAP_ID || 'DEMO_MAP_ID'

export const HAS_MAPS_KEY = GOOGLE_MAPS_API_KEY.trim().length > 0

/**
 * Opções do carregador da Maps API. O carregador é único por página: todos os
 * <APIProvider> precisam usar exatamente as mesmas opções (espalhe com {...MAPS_PROVIDER_PROPS}).
 */
export const MAPS_PROVIDER_PROPS = {
  apiKey: GOOGLE_MAPS_API_KEY,
  language: 'pt-BR',
  region: 'BR',
} as const

export const SITE = {
  name: 'Pontes',
  tagline: 'Voluntariado Municipal',
  contactEmail: 'pontes@prefeitura.exemplo.gov.br',
  contactPhone: '156',
} as const

/** Mensagem padrão enviada pelo botão de WhatsApp */
export const WHATSAPP_DEFAULT_MESSAGE = (title: string) =>
  `Olá, vi seu pedido "${title}" no Portal de Voluntariado Pontes e gostaria de ajudar!`
