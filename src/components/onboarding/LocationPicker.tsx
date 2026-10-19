import {
  APIProvider,
  APILoadingStatus,
  AdvancedMarker,
  Map,
  Pin,
  useApiLoadingStatus,
  useMap,
  useMapsLibrary,
} from '@vis.gl/react-google-maps'
import { useEffect, useId, useState } from 'react'
import { CITY, GOOGLE_MAPS_MAP_ID, HAS_MAPS_KEY, MAPS_PROVIDER_PROPS } from '../../config'
import { NEIGHBORHOODS } from '../../data/neighborhoods'
import { cn } from '../../lib/cn'
import type { LatLng } from '../../types'
import { Select, TextField } from './FormField'
import { formatLatLng, resolveLocation, type AddressDraft } from './drafts'
import { IDS, type FieldErrors } from './validation'

/** Limites aproximados do município, para restringir a geocodificação. */
const CITY_BOUNDS = CITY.bounds

function insideCity(p: LatLng): boolean {
  return (
    p.lat >= CITY_BOUNDS.south && p.lat <= CITY_BOUNDS.north && p.lng >= CITY_BOUNDS.west && p.lng <= CITY_BOUNDS.east
  )
}

interface LocationPickerProps {
  value: AddressDraft
  onChange: (patch: Partial<AddressDraft>) => void
  errors: FieldErrors
}

/**
 * Etapa "Endereço": endereço + bairro e, com chave do Google Maps, geocodificação
 * e mapa com pin arrastável. Sem chave (ou se a API falhar), usa o centro do bairro.
 */
export function LocationPicker({ value, onChange, errors }: LocationPickerProps) {
  const id = IDS.address
  const location = resolveLocation(value)
  const titleId = useId()

  return (
    <>
      <TextField
        id={id.address}
        label="Endereço"
        hint="Rua, número e complemento. Ex.: R. XV de Novembro, 1000 — sala 2."
        required
        autoComplete="street-address"
        value={value.address}
        maxLength={140}
        error={errors[id.address]}
        onChange={(e) =>
          onChange({ address: e.target.value, ...(value.pin ? { pin: null, pinSource: null } : {}) })
        }
      />
      <Select
        id={id.neighborhood}
        label="Bairro"
        hint={`Bairros de ${CITY.name}.`}
        required
        value={value.neighborhood}
        error={errors[id.neighborhood]}
        onChange={(e) => onChange({ neighborhood: e.target.value, pin: null, pinSource: null })}
      >
        <option value="">Selecione o bairro</option>
        {NEIGHBORHOODS.map((n) => (
          <option key={n.name} value={n.name}>
            {n.name}
          </option>
        ))}
      </Select>

      <section aria-labelledby={titleId} className="flex flex-col gap-4 rounded-2xl border-2 border-navy-100 p-4 sm:p-5">
        <h3 id={titleId} className="text-lg font-bold text-ink">
          Posição no mapa
        </h3>
        {HAS_MAPS_KEY ? (
          <APIProvider {...MAPS_PROVIDER_PROPS}>
            <MapPinEditor value={value} location={location} onChange={onChange} />
          </APIProvider>
        ) : (
          <FallbackNotice neighborhood={value.neighborhood} />
        )}
        <p className="text-sm text-ink-muted">
          Coordenadas do pin: <span className="font-mono text-ink tabular-nums">{formatLatLng(location)}</span>
          <span className="block sm:inline">
            {' '}
            {value.pinSource === 'geocoder' && '(localizado pelo endereço)'}
            {value.pinSource === 'manual' && '(ajustado por você)'}
            {!value.pin && (value.neighborhood ? `(aproximado, ${value.neighborhood})` : '(centro da cidade)')}
          </span>
        </p>
      </section>
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Fallback sem mapa                                                   */
/* ------------------------------------------------------------------ */

function FallbackNotice({ neighborhood, failed }: { neighborhood: string; failed?: boolean }) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
      <svg aria-hidden="true" viewBox="0 0 120 80" className="h-20 w-30 shrink-0 self-center rounded-xl bg-navy-50">
        <path d="M0 26h120M0 56h120M34 0v80M84 0v80" stroke="#d9e2ec" strokeWidth="6" />
        <path d="M0 70 60 10l60 40" stroke="#bcccdc" strokeWidth="3" fill="none" />
        <circle cx="60" cy="40" r="22" fill="#5ccbbb" opacity="0.25" />
        <path d="M60 18c-8 0-14 6-14 14 0 10 14 24 14 24s14-14 14-24c0-8-6-14-14-14Z" fill="#0f766e" />
        <circle cx="60" cy="32" r="5" fill="#fff" />
      </svg>
      <div>
        <p className="font-semibold text-ink">O pin será posicionado no centro do bairro</p>
        <p className="mt-1 text-sm text-ink-muted">
          {failed ? 'Não conseguimos carregar o mapa agora. ' : ''}
          Usamos um ponto aproximado {neighborhood ? `em ${neighborhood}` : 'no bairro escolhido'} para que
          voluntários encontrem seu pedido no mapa. O endereço completo aparece na página do pedido.
        </p>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Mapa com geocodificação (somente com chave)                         */
/* ------------------------------------------------------------------ */

type GeoState =
  | { kind: 'idle' }
  | { kind: 'loading' }
  | { kind: 'error'; message: string }
  | { kind: 'ok'; message: string }

const NUDGE = 0.0003 // ≈ 30 m

function MapPinEditor({
  value,
  location,
  onChange,
}: {
  value: AddressDraft
  location: LatLng
  onChange: (patch: Partial<AddressDraft>) => void
}) {
  const status = useApiLoadingStatus()
  const geocoding = useMapsLibrary('geocoding')
  const [geo, setGeo] = useState<GeoState>({ kind: 'idle' })
  // Anúncio curto só após ações explícitas no pin (as coordenadas em si não são lidas a cada mudança)
  const [pinMessage, setPinMessage] = useState('')

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return <FallbackNotice neighborhood={value.neighborhood} failed />
  }

  const ready = status === APILoadingStatus.LOADED

  function setManual(p: LatLng, message = 'Pin ajustado no mapa.') {
    onChange({ pin: { lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)) }, pinSource: 'manual' })
    // limpa antes para repetir o anúncio quando a mesma ação é feita de novo
    setPinMessage('')
    requestAnimationFrame(() => setPinMessage(message))
  }

  const locating = !ready || geo.kind === 'loading'

  async function locate() {
    if (!value.address.trim() || !value.neighborhood) {
      setGeo({ kind: 'error', message: 'Preencha o endereço e escolha o bairro antes de localizar no mapa.' })
      return
    }
    if (!geocoding) {
      setGeo({ kind: 'error', message: 'O mapa ainda está carregando. Tente novamente em instantes.' })
      return
    }
    setGeo({ kind: 'loading' })
    try {
      const geocoder = new geocoding.Geocoder()
      const { results } = await geocoder.geocode({
        address: `${value.address.trim()}, ${value.neighborhood}, ${CITY.name} - ${CITY.state}, Brasil`,
        region: 'br',
        bounds: CITY_BOUNDS,
        componentRestrictions: { country: 'BR', locality: CITY.name },
      })
      const first = results[0]
      const p = first ? { lat: first.geometry.location.lat(), lng: first.geometry.location.lng() } : null
      if (!p || !insideCity(p)) {
        setGeo({
          kind: 'error',
          message: `Não encontramos esse endereço em ${CITY.name}. O pin ficou no centro do bairro — você pode ajustá-lo no mapa.`,
        })
        onChange({ pin: null, pinSource: null })
        return
      }
      onChange({ pin: { lat: Number(p.lat.toFixed(6)), lng: Number(p.lng.toFixed(6)) }, pinSource: 'geocoder' })
      setGeo({ kind: 'ok', message: 'Endereço localizado. Confira o pin e ajuste se precisar.' })
    } catch {
      setGeo({
        kind: 'error',
        message: 'Não foi possível localizar o endereço agora. O pin ficará no centro do bairro, e você pode ajustá-lo no mapa.',
      })
    }
  }

  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm text-ink-muted">
        Localize o endereço e, se precisar, clique no mapa ou arraste o pin até o ponto exato. Também é possível
        usar os botões de direção.
      </p>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
        <button
          type="button"
          onClick={() => {
            // aria-disabled (e não disabled) para o botão não perder o foco enquanto localiza
            if (locating) return
            void locate()
          }}
          aria-disabled={locating || undefined}
          className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full bg-navy-900 px-5 font-semibold text-ink-inverse hover:bg-navy-800 focus-ring aria-disabled:cursor-not-allowed aria-disabled:bg-navy-700 aria-disabled:hover:bg-navy-700"
        >
          <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
            <path d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Zm0 8.25A2.25 2.25 0 1 1 10 5.75a2.25 2.25 0 0 1 0 4.5Z" />
          </svg>
          {geo.kind === 'loading' ? 'Localizando…' : 'Localizar no mapa'}
        </button>
        <p
          aria-live="polite"
          className={cn(
            'text-sm',
            geo.kind === 'error' && 'font-semibold text-danger',
            geo.kind === 'ok' && 'font-semibold text-success',
          )}
        >
          {!ready && 'Carregando o mapa…'}
          {(geo.kind === 'error' || geo.kind === 'ok') && geo.message}
        </p>
      </div>

      <div
        role="region"
        aria-label="Mapa para ajustar a posição do pin"
        className="relative h-64 overflow-hidden rounded-xl bg-navy-50 ring-1 ring-border sm:h-80"
      >
        {ready && (
          <Map
            mapId={GOOGLE_MAPS_MAP_ID}
            defaultCenter={location}
            defaultZoom={value.pin ? 16 : 15}
            gestureHandling="cooperative"
            disableDefaultUI
            zoomControl
            clickableIcons={false}
            onClick={(e) => {
              if (e.detail.latLng) setManual(e.detail.latLng)
            }}
            className="size-full"
          >
            <AdvancedMarker
              position={location}
              draggable
              title="Pin do pedido. Arraste para ajustar a posição."
              onDragEnd={(e) => {
                const ll = e.latLng
                if (ll) setManual({ lat: ll.lat(), lng: ll.lng() })
              }}
            >
              <Pin background="#0f766e" borderColor="#102a43" glyphColor="#ffffff" scale={1.2} />
            </AdvancedMarker>
            <FollowPin location={location} />
          </Map>
        )}
      </div>

      <fieldset className="flex flex-wrap items-center gap-2">
        <legend className="sr-only">Mover o pin</legend>
        <span aria-hidden="true" className="mr-1 text-sm font-semibold text-ink-muted">
          Mover pin:
        </span>
        {(
          [
            ['norte', '↑', { lat: NUDGE, lng: 0 }],
            ['sul', '↓', { lat: -NUDGE, lng: 0 }],
            ['oeste', '←', { lat: 0, lng: -NUDGE }],
            ['leste', '→', { lat: 0, lng: NUDGE }],
          ] as const
        ).map(([dir, arrow, delta]) => (
          <button
            key={dir}
            type="button"
            onClick={() =>
              setManual({ lat: location.lat + delta.lat, lng: location.lng + delta.lng }, `Pin movido para o ${dir}.`)
            }
            className="inline-flex size-12 items-center justify-center rounded-full border-2 border-navy-200 bg-surface-raised text-lg font-bold text-ink hover:border-navy-400 hover:bg-navy-50 focus-ring"
          >
            <span aria-hidden="true">{arrow}</span>
            <span className="sr-only">Mover pin para o {dir}</span>
          </button>
        ))}
      </fieldset>
      <p className="sr-only" aria-live="polite">
        {pinMessage}
      </p>
    </div>
  )
}

/** Recentraliza o mapa quando o pin muda (geocodificação, botões ou troca de bairro). */
function FollowPin({ location }: { location: LatLng }) {
  const map = useMap()
  const { lat, lng } = location
  useEffect(() => {
    map?.panTo({ lat, lng })
  }, [map, lat, lng])
  return null
}
