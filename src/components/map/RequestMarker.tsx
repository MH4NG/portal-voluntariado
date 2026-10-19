import { AdvancedMarker, InfoWindow, useAdvancedMarkerRef } from '@vis.gl/react-google-maps'
import { memo, useCallback, useEffect, useRef } from 'react'
import type { HelpRequest } from '../../types'
import { listItemId, markerTitle } from './mapUtils'
import { MarkerPin } from './MarkerPin'
import { RequestInfoWindow, RequestInfoWindowHeader } from './RequestInfoWindow'
import type { SelectionSource } from './types'

interface RequestMarkerProps {
  request: HelpRequest
  selected: boolean
  /** Move o foco para o InfoWindow ao abrir (seleção vinda da lista) */
  focusInfoWindow: boolean
  onSelect: (id: string | null, source: SelectionSource) => void
}

const Z_SELECTED = 1000
const Z_URGENT = 100
/** Constante: um array novo a cada render faria o InfoWindow fechar e reabrir */
const PIXEL_OFFSET: [number, number] = [0, -6]

/**
 * Marcador de uma ação. Memoizado: ao trocar a seleção, apenas o marcador
 * anterior e o novo são renderizados de novo.
 */
export const RequestMarker = memo(function RequestMarker({
  request,
  selected,
  focusInfoWindow,
  onSelect,
}: RequestMarkerProps) {
  const [markerRef, marker] = useAdvancedMarkerRef()

  const handleClick = useCallback(() => onSelect(request.id, 'map'), [onSelect, request.id])

  // Evita fechar duas vezes (closeclick + close) e ignora fechamentos depois que outra ação foi selecionada
  const closingRef = useRef(false)
  const selectedRef = useRef(selected)
  const contentRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    selectedRef.current = selected
    if (selected) closingRef.current = false
  }, [selected])

  const handleClose = useCallback(() => {
    if (closingRef.current) return
    closingRef.current = true
    onSelect(null, 'map')
    // Devolve o foco a quem abriu o balão (WCAG 2.4.3): o botão "Ver no mapa" da lista,
    // se estiver visível, ou o próprio marcador.
    window.requestAnimationFrame(() => {
      const listButton = document
        .getElementById(listItemId(request.id))
        ?.querySelector<HTMLElement>('[data-map-button]')
      if (focusInfoWindow && listButton && listButton.offsetParent !== null) listButton.focus()
      else marker?.focus()
    })
  }, [focusInfoWindow, marker, onSelect, request.id])

  // Fechamento nativo (ex.: Esc no botão de fechar do Google): sincroniza a seleção.
  // Um fechamento programático seguido de reabertura (troca de opções) deixa o conteúdo no DOM e é ignorado.
  const handleNativeClose = useCallback(() => {
    window.requestAnimationFrame(() => {
      if (!selectedRef.current || contentRef.current?.isConnected) return
      handleClose()
    })
  }, [handleClose])

  return (
    <>
      <AdvancedMarker
        ref={markerRef}
        position={request.location}
        title={markerTitle(request)}
        onClick={handleClick}
        zIndex={selected ? Z_SELECTED : request.urgency === 'alta' ? Z_URGENT : undefined}
      >
        <MarkerPin category={request.category} urgency={request.urgency} selected={selected} />
      </AdvancedMarker>

      {selected && marker && (
        <InfoWindow
          anchor={marker}
          headerContent={<RequestInfoWindowHeader request={request} />}
          onCloseClick={handleClose}
          onClose={handleNativeClose}
          shouldFocus={focusInfoWindow}
          pixelOffset={PIXEL_OFFSET}
        >
          <div ref={contentRef}>
            <RequestInfoWindow request={request} onEscape={handleClose} />
          </div>
        </InfoWindow>
      )}
    </>
  )
})
