import type { LatLng } from '../types'

export interface Neighborhood {
  name: string
  /** Centro aproximado do bairro (usado quando não há geocodificação disponível) */
  center: LatLng
}

/**
 * Bairros e distritos de Petrópolis (RJ) com coordenadas aproximadas do centro.
 * Servem de fallback para posicionar o pin quando a chave do Google Maps
 * não está configurada ou a API não carrega.
 */
export const NEIGHBORHOODS: Neighborhood[] = [
  { name: 'Alto da Serra', center: { lat: -22.5205, lng: -43.1735 } },
  { name: 'Araras', center: { lat: -22.429, lng: -43.247 } },
  { name: 'Bingen', center: { lat: -22.5085, lng: -43.201 } },
  { name: 'Bonsucesso', center: { lat: -22.432, lng: -43.162 } },
  { name: 'Carangola', center: { lat: -22.481, lng: -43.154 } },
  { name: 'Cascatinha', center: { lat: -22.473, lng: -43.165 } },
  { name: 'Castelânea', center: { lat: -22.493, lng: -43.184 } },
  { name: 'Caxambu', center: { lat: -22.5, lng: -43.156 } },
  { name: 'Centro', center: { lat: -22.505, lng: -43.1789 } },
  { name: 'Chácara Flora', center: { lat: -22.53, lng: -43.165 } },
  { name: 'Coronel Veiga', center: { lat: -22.512, lng: -43.168 } },
  { name: 'Corrêas', center: { lat: -22.443, lng: -43.14 } },
  { name: 'Duarte da Silveira', center: { lat: -22.514, lng: -43.183 } },
  { name: 'Independência', center: { lat: -22.532, lng: -43.201 } },
  { name: 'Itaipava', center: { lat: -22.387, lng: -43.131 } },
  { name: 'Itamarati', center: { lat: -22.485, lng: -43.143 } },
  { name: 'Morin', center: { lat: -22.492, lng: -43.162 } },
  { name: 'Mosela', center: { lat: -22.49, lng: -43.199 } },
  { name: 'Nogueira', center: { lat: -22.456, lng: -43.155 } },
  { name: 'Pedro do Rio', center: { lat: -22.33, lng: -43.134 } },
  { name: 'Posse', center: { lat: -22.242, lng: -43.09 } },
  { name: 'Quarteirão Ingelheim', center: { lat: -22.51, lng: -43.188 } },
  { name: 'Quissamã', center: { lat: -22.474, lng: -43.182 } },
  { name: 'Quitandinha', center: { lat: -22.527, lng: -43.212 } },
  { name: 'Retiro', center: { lat: -22.489, lng: -43.17 } },
  { name: 'Samambaia', center: { lat: -22.474, lng: -43.126 } },
  { name: 'São Sebastião', center: { lat: -22.522, lng: -43.155 } },
  { name: 'Secretário', center: { lat: -22.348, lng: -43.092 } },
  { name: 'Valparaíso', center: { lat: -22.4995, lng: -43.1925 } },
]

export const NEIGHBORHOOD_NAMES: string[] = NEIGHBORHOODS.map((n) => n.name)

export function findNeighborhood(name: string): Neighborhood | undefined {
  const key = name.trim().toLocaleLowerCase('pt-BR')
  return NEIGHBORHOODS.find((n) => n.name.toLocaleLowerCase('pt-BR') === key)
}
