import {
  AdvancedMarker,
  APILoadingStatus,
  APIProvider,
  Map as GoogleMap,
  Pin,
  useApiLoadingStatus,
} from '@vis.gl/react-google-maps'
import { GOOGLE_MAPS_MAP_ID, HAS_MAPS_KEY, MAPS_PROVIDER_PROPS } from '../../config'
import { CATEGORIES } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { HelpRequest } from '../../types'
import { ButtonLink, ExternalButtonLink } from '../ui/Button'
import { DirectionsIcon, MapIcon } from './ContactIcons'

interface RequestLocationMapProps {
  request: HelpRequest
  className?: string
}

function directionsUrl({ lat, lng }: HelpRequest['location']): string {
  return `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`
}

/**
 * Mini-mapa da ação. Com chave da API mostra o Google Maps; sem chave (ou se a API
 * falhar) mostra uma ilustração decorativa. Os links de rota e do mapa do portal
 * estão sempre disponíveis, independentemente do mapa.
 */
export function RequestLocationMap({ request, className }: RequestLocationMapProps) {
  return (
    <div className={cn('flex flex-col gap-4', className)}>
      <div className="relative h-64 overflow-hidden rounded-card bg-navy-50 ring-1 ring-border">
        {HAS_MAPS_KEY ? (
          <APIProvider {...MAPS_PROVIDER_PROPS}>
            <LiveMap request={request} />
          </APIProvider>
        ) : (
          <MiniMapIllustration color={CATEGORIES[request.category].pinColor} />
        )}
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap">
        <ExternalButtonLink
          href={directionsUrl(request.location)}
          variant="secondary"
          className="w-full sm:w-auto"
        >
          <DirectionsIcon />
          Como chegar (Google Maps)
        </ExternalButtonLink>
        <ButtonLink
          to={`/acoes?acao=${encodeURIComponent(request.id)}`}
          variant="ghost"
          className="w-full border border-border-strong sm:w-auto"
        >
          <MapIcon />
          Ver no mapa do portal
        </ButtonLink>
      </div>
    </div>
  )
}

function LiveMap({ request }: { request: HelpRequest }) {
  const status = useApiLoadingStatus()
  const category = CATEGORIES[request.category]

  if (status === APILoadingStatus.FAILED || status === APILoadingStatus.AUTH_FAILURE) {
    return <MiniMapIllustration color={category.pinColor} />
  }

  return (
    <>
      <p className="sr-only">
        Mapa interativo com a localização de “{request.title}”. Use as setas para mover o mapa e
        as teclas + e − para aproximar ou afastar.
      </p>
      {status !== APILoadingStatus.LOADED && (
        <div
          aria-hidden="true"
          className="absolute inset-0 animate-pulse bg-linear-to-br from-navy-50 to-sand-100"
        />
      )}
      <GoogleMap
        // remonta ao trocar de ação, pois defaultCenter só vale na montagem
        key={request.id}
        className="size-full"
        mapId={GOOGLE_MAPS_MAP_ID}
        defaultCenter={request.location}
        defaultZoom={15}
        gestureHandling="cooperative"
        disableDefaultUI
        clickableIcons={false}
      >
        <AdvancedMarker position={request.location} title={request.title}>
          <Pin background={category.pinColor} borderColor="#ffffff" glyphColor="#ffffff" scale={1.2} />
        </AdvancedMarker>
      </GoogleMap>
    </>
  )
}

/** Ilustração de mapa (decorativa) usada sem chave da API ou quando ela falha. */
function MiniMapIllustration({ color }: { color: string }) {
  return (
    <>
      <svg
        aria-hidden="true"
        viewBox="0 0 640 256"
        preserveAspectRatio="xMidYMid slice"
        className="size-full"
      >
        <rect width="640" height="256" fill="#f8f3ea" />
        {/* quadras */}
        <g fill="#efe6d6">
          <rect x="24" y="20" width="120" height="70" rx="10" />
          <rect x="24" y="118" width="120" height="118" rx="10" />
          <rect x="176" y="20" width="110" height="70" rx="10" />
          <rect x="354" y="20" width="110" height="70" rx="10" />
          <rect x="354" y="166" width="110" height="70" rx="10" />
          <rect x="496" y="118" width="130" height="118" rx="10" />
        </g>
        {/* parques */}
        <g fill="#c8f2ea">
          <rect x="176" y="166" width="110" height="70" rx="14" />
          <rect x="496" y="20" width="130" height="70" rx="14" />
        </g>
        <g fill="#95e3d5">
          <circle cx="206" cy="196" r="9" />
          <circle cx="232" cy="210" r="7" />
          <circle cx="258" cy="190" r="8" />
          <circle cx="536" cy="46" r="8" />
          <circle cx="572" cy="60" r="10" />
          <circle cx="604" cy="42" r="6" />
        </g>
        {/* rio */}
        <path
          d="M-10 250 C 90 200, 140 240, 230 150 S 420 60, 650 110"
          fill="none"
          stroke="#bcccdc"
          strokeWidth="14"
          strokeLinecap="round"
          opacity="0.7"
        />
        {/* ruas */}
        <g fill="none" strokeLinecap="round">
          <g stroke="#d9e2ec" strokeWidth="18">
            <path d="M0 104 H640" />
            <path d="M320 0 V256" />
          </g>
          <g stroke="#ffffff" strokeWidth="12">
            <path d="M0 104 H640" />
            <path d="M320 0 V256" />
          </g>
          <g stroke="#ffffff" strokeWidth="6">
            <path d="M160 0 V256" />
            <path d="M480 0 V256" />
            <path d="M0 152 H640" />
          </g>
        </g>
        {/* marcador */}
        <ellipse cx="320" cy="131" rx="12" ry="4" fill="#102a43" opacity="0.18" />
        <circle cx="320" cy="108" r="40" fill={color} opacity="0.1" />
        <circle cx="320" cy="108" r="24" fill={color} opacity="0.16" />
        <g transform="translate(296 86) scale(2.4)">
          <path
            d="M10 2a6 6 0 0 0-6 6c0 4.5 6 10 6 10s6-5.5 6-10a6 6 0 0 0-6-6Z"
            fill={color}
            stroke="#ffffff"
            strokeWidth="1"
          />
          <circle cx="10" cy="8" r="2.4" fill="#ffffff" />
        </g>
      </svg>
      <p className="absolute bottom-3 left-3 rounded-full bg-surface-raised/95 px-3 py-1 text-xs font-semibold text-ink-muted shadow-sm">
        Mapa ilustrativo
      </p>
    </>
  )
}
