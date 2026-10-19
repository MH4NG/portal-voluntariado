import {
  APILoadingStatus,
  APIProvider,
  Map as GoogleMap,
  useApiLoadingStatus,
  useMap,
} from '@vis.gl/react-google-maps'
import { useCallback, useEffect, useRef } from 'react'
import { CITY, GOOGLE_MAPS_MAP_ID, HAS_MAPS_KEY, MAPS_PROVIDER_PROPS } from '../../config'
import type { HelpRequest } from '../../types'
import { MapFallback } from './MapFallback'
import { FOCUS_ZOOM, boundsOf } from './mapUtils'
import { RequestMarker } from './RequestMarker'
import type { MapAvailability, SelectionSource } from './types'

export interface RequestsMapProps {
  requests: HelpRequest[]
  selected: HelpRequest | null
  selectionSource: SelectionSource
  /** Incrementado a cada seleção, para recentralizar mesmo na mesma ação */
  selectionNonce: number
  /** false quando o mapa está oculto (aba "Lista" no mobile) */
  visible: boolean
  /** Desktop: 'cooperative' (Ctrl + rolagem). Mobile: 'greedy' (um dedo). */
  gestureHandling: 'greedy' | 'cooperative'
  onSelect: (id: string | null, source: SelectionSource) => void
  onAvailabilityChange: (availability: MapAvailability) => void
  onShowList?: () => void
}

/**
 * Mapa interativo das ações. Sem chave da API, ou se a API falhar (FAILED/AUTH_FAILURE),
 * cai para <MapFallback/> — a lista ao lado continua sendo o caminho completo.
 */
export function RequestsMap(props: RequestsMapProps) {
  if (!HAS_MAPS_KEY) {
    return (
      <MapFallback
        requests={props.requests}
        selectedId={props.selected?.id ?? null}
        reason="no-key"
        onShowList={props.onShowList}
      />
    )
  }

  return (
    <APIProvider {...MAPS_PROVIDER_PROPS}>
      <MapStage {...props} />
    </APIProvider>
  )
}

function MapStage({
  requests,
  selected,
  selectionSource,
  selectionNonce,
  visible,
  gestureHandling,
  onSelect,
  onAvailabilityChange,
  onShowList,
}: RequestsMapProps) {
  const status = useApiLoadingStatus()
  const failed = status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE
  const loaded = status === APILoadingStatus.LOADED

  useEffect(() => {
    onAvailabilityChange(failed ? 'unavailable' : loaded ? 'ready' : 'loading')
  }, [failed, loaded, onAvailabilityChange])

  const selectedId = selected?.id ?? null
  const handleMapClick = useCallback(() => {
    if (selectedId) onSelect(null, 'map')
  }, [onSelect, selectedId])

  if (failed) {
    return (
      <MapFallback requests={requests} selectedId={selectedId} reason="error" onShowList={onShowList} />
    )
  }

  return (
    <div className="relative size-full">
      <GoogleMap
        mapId={GOOGLE_MAPS_MAP_ID}
        defaultCenter={CITY.center}
        defaultZoom={CITY.zoom}
        gestureHandling={gestureHandling}
        disableDefaultUI
        zoomControl
        fullscreenControl
        clickableIcons={false}
        onClick={handleMapClick}
        className="size-full"
      >
        {requests.map((request) => {
          const isSelected = request.id === selectedId
          return (
            <RequestMarker
              key={request.id}
              request={request}
              selected={isSelected}
              focusInfoWindow={isSelected && selectionSource === 'list'}
              onSelect={onSelect}
            />
          )
        })}
        <CameraController
          requests={requests}
          selected={selected}
          selectionSource={selectionSource}
          selectionNonce={selectionNonce}
          visible={visible}
        />
      </GoogleMap>

      {!loaded && <MapSkeleton />}

      {loaded && requests.length === 0 && (
        <div className="pointer-events-none absolute inset-x-0 top-4 flex justify-center px-4">
          <p className="rounded-full bg-surface-raised px-4 py-2 text-sm font-semibold text-ink shadow-raised ring-1 ring-border">
            Nenhuma ação para mostrar no mapa com esses filtros
          </p>
        </div>
      )}
    </div>
  )
}

/** Ajusta a câmera: enquadra os resultados ao filtrar e centraliza a ação escolhida na lista. */
function CameraController({
  requests,
  selected,
  selectionSource,
  selectionNonce,
  visible,
}: Pick<RequestsMapProps, 'requests' | 'selected' | 'selectionSource' | 'selectionNonce' | 'visible'>) {
  const map = useMap()
  const didInitialFocus = useRef(false)
  const lastFitted = useRef<HelpRequest[] | null>(null)
  // Ao abrir a página com ?acao=, a câmera vai direto para a ação em vez de enquadrar tudo
  const skipFirstFit = useRef(selected !== null && selectionSource === 'url')

  // Enquadra os marcadores quando o conjunto filtrado muda (ou quando o mapa volta a ficar visível).
  // fitBounds não funciona com display:none, por isso esperamos o mapa estar visível.
  useEffect(() => {
    if (!map || !visible || lastFitted.current === requests) return
    lastFitted.current = requests
    if (skipFirstFit.current) {
      skipFirstFit.current = false
      return
    }
    const bounds = boundsOf(requests)
    if (!bounds) return
    if (requests.length === 1) {
      map.panTo(requests[0].location)
      map.setZoom(FOCUS_ZOOM)
      return
    }
    map.fitBounds(bounds, { top: 72, right: 48, bottom: 48, left: 48 })
  }, [map, requests, visible])

  // Centraliza a ação selecionada pela lista (ou vinda da URL). Clique no marcador
  // não precisa: o próprio InfoWindow faz o ajuste mínimo necessário.
  useEffect(() => {
    if (!map || !visible || !selected) return
    if (selectionSource === 'map') return
    if (selectionSource === 'url' && didInitialFocus.current) return
    didInitialFocus.current = true
    map.panTo(selected.location)
    const zoom = map.getZoom() ?? CITY.zoom
    if (zoom < 14) map.setZoom(14)
  }, [map, selected, selectionSource, selectionNonce, visible])

  return null
}

function MapSkeleton() {
  return (
    <div
      role="status"
      className="absolute inset-0 grid place-items-center overflow-hidden bg-navy-50"
    >
      <div aria-hidden="true" className="absolute inset-0 motion-safe:animate-pulse">
        <div className="absolute top-[20%] left-[10%] h-3 w-[70%] rotate-12 rounded-full bg-white/80" />
        <div className="absolute top-[55%] left-[-5%] h-3 w-[90%] -rotate-6 rounded-full bg-white/80" />
        <div className="absolute top-0 left-[45%] h-full w-3 rotate-6 rounded-full bg-white/80" />
        <div className="absolute top-[30%] left-[25%] size-24 rounded-full bg-teal-100/70" />
        <div className="absolute right-[15%] bottom-[18%] size-16 rounded-full bg-teal-100/70" />
      </div>
      <p className="relative rounded-full bg-surface-raised px-4 py-2 text-sm font-semibold text-ink shadow-card">
        Carregando o mapa…
      </p>
    </div>
  )
}
