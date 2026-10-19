import { CITY } from '../../config'
import { CATEGORIES, URGENCY } from '../../data/categories'
import type { HelpRequest, LatLng } from '../../types'

/** Limites aproximados do município (usados no mapa esquemático de fallback). */
export const CITY_BOUNDS = CITY.bounds

/** Dimensões do viewBox do mapa esquemático (proporção real do município ≈ 0,69). */
export const SCHEMATIC = { width: 372, height: 520, padding: 24 } as const

/** Zoom usado ao focar uma única ação. */
export const FOCUS_ZOOM = 15

/** Projeção equiretangular simples lat/lng → coordenadas do SVG esquemático. */
export function projectToSchematic({ lat, lng }: LatLng): { x: number; y: number } {
  const { width, height, padding } = SCHEMATIC
  const nx = clamp((lng - CITY_BOUNDS.west) / (CITY_BOUNDS.east - CITY_BOUNDS.west), 0, 1)
  const ny = clamp((CITY_BOUNDS.north - lat) / (CITY_BOUNDS.north - CITY_BOUNDS.south), 0, 1)
  return {
    x: padding + nx * (width - padding * 2),
    y: padding + ny * (height - padding * 2),
  }
}

export const CITY_CENTER_SCHEMATIC = projectToSchematic(CITY.center)

/** Mesmo formato de google.maps.LatLngBoundsLiteral. */
export interface BoundsLiteral {
  north: number
  south: number
  east: number
  west: number
}

/** Retângulo que contém todas as ações (null se a lista estiver vazia). */
export function boundsOf(requests: HelpRequest[]): BoundsLiteral | null {
  if (requests.length === 0) return null
  let north = -90
  let south = 90
  let east = -180
  let west = 180
  for (const { location } of requests) {
    north = Math.max(north, location.lat)
    south = Math.min(south, location.lat)
    east = Math.max(east, location.lng)
    west = Math.min(west, location.lng)
  }
  return { north, south, east, west }
}

/** Link universal do Google Maps (abre o app no celular, ou o site no desktop). */
export function googleMapsSearchUrl({ lat, lng }: LatLng): string {
  return `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
}

/** Nome acessível do marcador (atributo title do AdvancedMarker). */
export function markerTitle(request: HelpRequest): string {
  const urgency = URGENCY[request.urgency].label
  const category = CATEGORIES[request.category].label
  return `${request.title} — ${urgency}, ${category}, ${request.neighborhood}`
}

export function listItemId(requestId: string): string {
  return `acao-item-${requestId}`
}

function clamp(n: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, n))
}
