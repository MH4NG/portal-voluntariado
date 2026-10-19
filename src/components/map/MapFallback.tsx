import { memo, useMemo } from 'react'
import { CITY } from '../../config'
import { CATEGORIES } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { HelpRequest } from '../../types'
import { CITY_CENTER_SCHEMATIC, SCHEMATIC, projectToSchematic } from './mapUtils'

interface MapFallbackProps {
  requests: HelpRequest[]
  selectedId: string | null
  /** 'no-key': ambiente sem chave · 'error': a API falhou ao carregar/autenticar */
  reason: 'no-key' | 'error'
  /** No mobile, atalho para voltar à lista */
  onShowList?: () => void
}

/**
 * Exibido quando o Google Maps não está disponível. Explica a situação em linguagem
 * cidadã, mostra um mapa esquemático decorativo (aria-hidden) com a posição aproximada
 * das ações filtradas e lembra que a lista continua completa e navegável.
 */
export function MapFallback({ requests, selectedId, reason, onShowList }: MapFallbackProps) {
  return (
    <div
      className="relative flex size-full min-h-[22rem] flex-col overflow-x-hidden overflow-y-auto bg-[#e8efe9]"
      role={reason === 'error' ? 'status' : undefined}
    >
      <div className="relative min-h-24 flex-1">
        <SchematicMap requests={requests} selectedId={selectedId} />
      </div>

      <div className="relative p-4 pt-0 sm:p-6 sm:pt-0">
        <div className="mx-auto max-w-md rounded-card bg-surface-raised/95 p-5 shadow-raised ring-1 ring-border backdrop-blur-sm">
          <div className="flex items-start gap-3">
            <span
              aria-hidden="true"
              className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-soft text-primary"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-6" strokeLinecap="round" strokeLinejoin="round">
                <path d="M9 4 3 6.5v13L9 17l6 2.5 6-2.5v-13L15 6.5 9 4Z" />
                <path d="M9 4v13M15 6.5v13" />
              </svg>
            </span>
            <div className="min-w-0">
              <h3 className="font-display text-lg leading-snug font-bold tracking-tight text-ink">
                Mapa indisponível no momento
              </h3>
              <p className="mt-1 text-sm leading-relaxed text-ink-muted">
                Tudo continua acessível pela lista: lá você encontra cada ação, com o bairro e um link
                para abrir o endereço no Google Maps.
              </p>
            </div>
          </div>

          {onShowList && (
            <button
              type="button"
              onClick={onShowList}
              className="mt-4 inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-full bg-primary px-5 text-base font-semibold text-on-primary shadow-sm transition-colors hover:bg-primary-hover focus-ring lg:hidden"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M3 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm0 5a1 1 0 0 1 1-1h12a1 1 0 1 1 0 2H4a1 1 0 0 1-1-1Zm1 4a1 1 0 1 0 0 2h12a1 1 0 1 0 0-2H4Z" />
              </svg>
              Ver a lista de ações
            </button>
          )}

          <p className="mt-4 border-t border-border pt-3 text-xs leading-relaxed text-ink-muted">
            <span className="font-semibold text-ink">Para quem desenvolve: </span>
            {reason === 'no-key' ? (
              <>
                configure <code className="rounded bg-navy-50 px-1 py-0.5 font-mono text-[0.7rem] text-navy-800">VITE_GOOGLE_MAPS_API_KEY</code>{' '}
                (e, opcionalmente, <code className="rounded bg-navy-50 px-1 py-0.5 font-mono text-[0.7rem] text-navy-800">VITE_GOOGLE_MAPS_MAP_ID</code>) no
                arquivo <code className="font-mono text-[0.7rem]">.env.local</code> para ativar o mapa interativo.
              </>
            ) : (
              <>a Google Maps JavaScript API não carregou. Verifique a chave, as restrições de domínio e o Map ID.</>
            )}
          </p>
        </div>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Mapa esquemático (decorativo)
// ---------------------------------------------------------------------------

/** Contorno estilizado de Petrópolis: alongado no sentido norte–sul, do Centro Histórico até a Posse. */
const CITY_OUTLINE =
  'M270 26C306 30 336 64 334 112C332 160 318 200 312 244C306 292 298 338 280 382C262 426 236 470 196 492C160 510 120 504 98 478C76 452 60 414 54 372C48 330 50 290 62 254C76 214 104 186 138 158C172 130 196 96 216 64C232 40 248 24 270 26Z'

/** Rios estilizados: Piabanha (do Centro rumo ao norte), Quitandinha, Palatinato e Araras */
const RIVERS = [
  'M169 400C190 372 206 340 216 316C226 290 230 266 227 243C224 214 220 190 223 168C228 126 252 90 276 52',
  'M130 428C146 416 158 406 169 400',
  'M176 420C174 412 172 405 169 400',
  'M88 298C120 300 150 296 176 300C196 304 206 312 216 316',
]

/** Parques (lat/lng aproximados) */
const PARKS = [
  { lat: -22.455, lng: -43.09, r: 16 }, // Parque Nacional da Serra dos Órgãos (Bonfim)
  { lat: -22.43, lng: -43.265, r: 12 }, // Reserva Biológica de Araras
  { lat: -22.527, lng: -43.216, r: 7 }, // Lago Quitandinha
  { lat: -22.39, lng: -43.09, r: 9 }, // Vale do Cuiabá
]

const SchematicMap = memo(function SchematicMap({
  requests,
  selectedId,
}: {
  requests: HelpRequest[]
  selectedId: string | null
}) {
  const center = CITY_CENTER_SCHEMATIC

  // Vias estilizadas partindo do Centro Histórico
  const roads = useMemo(() => {
    const angles = [-100, -60, -20, 25, 70, 110, 150, 200, 245]
    return angles.map((deg) => {
      const rad = (deg * Math.PI) / 180
      const len = 260
      const bend = 18 * Math.sin(rad * 3)
      const x = center.x + Math.cos(rad) * len
      const y = center.y + Math.sin(rad) * len
      const cx = center.x + Math.cos(rad) * len * 0.5 + bend
      const cy = center.y + Math.sin(rad) * len * 0.5 - bend
      return `M${center.x} ${center.y}Q${cx} ${cy} ${x} ${y}`
    })
  }, [center])

  const parks = useMemo(() => PARKS.map((p) => ({ ...projectToSchematic(p), r: p.r })), [])

  // Desenha a selecionada por último para ficar por cima
  const dots = useMemo(() => {
    const projected = requests.map((r) => ({ request: r, ...projectToSchematic(r.location) }))
    return projected.sort((a, b) => Number(a.request.id === selectedId) - Number(b.request.id === selectedId))
  }, [requests, selectedId])

  const { width, height } = SCHEMATIC

  return (
    <svg
      aria-hidden="true"
      focusable="false"
      viewBox={`0 0 ${width} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      className="absolute inset-0 size-full p-4"
    >
      <defs>
        <pattern id="pontes-grid" width="16" height="16" patternUnits="userSpaceOnUse">
          <path d="M16 0H0V16" fill="none" stroke="#d6e2d9" strokeWidth="1" />
        </pattern>
        <clipPath id="pontes-city">
          <path d={CITY_OUTLINE} />
        </clipPath>
        <filter id="pontes-shadow" x="-10%" y="-10%" width="120%" height="120%">
          <feDropShadow dx="0" dy="6" stdDeviation="8" floodColor="#102a43" floodOpacity="0.12" />
        </filter>
      </defs>

      {/* Território */}
      <path d={CITY_OUTLINE} fill="#fdfbf7" filter="url(#pontes-shadow)" />
      <g clipPath="url(#pontes-city)">
        <rect width={width} height={height} fill="url(#pontes-grid)" />
        {parks.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} fill="#c8f2ea" />
        ))}
        {RIVERS.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#95e3d5" strokeWidth="4" strokeLinecap="round" />
        ))}
        {roads.map((d, i) => (
          <path key={i} d={d} fill="none" stroke="#ffffff" strokeWidth="5" strokeLinecap="round" />
        ))}
        {roads.map((d, i) => (
          <path key={`l-${i}`} d={d} fill="none" stroke="#efe6d6" strokeWidth="1.5" strokeLinecap="round" />
        ))}
      </g>
      <path d={CITY_OUTLINE} fill="none" stroke="#9fb3c8" strokeWidth="1.5" strokeDasharray="5 4" />

      {/* Centro */}
      <g>
        <circle cx={center.x} cy={center.y} r="4" fill="#102a43" />
        <text
          x={center.x + 8}
          y={center.y - 6}
          className="fill-navy-700 font-sans text-[9px] font-semibold tracking-wide uppercase"
        >
          Centro
        </text>
      </g>

      {/* Rosa dos ventos */}
      <g transform={`translate(${width - 30} 30)`}>
        <circle r="13" fill="#ffffff" stroke="#d9e2ec" />
        <path d="M0 -8 4 3 0 1 -4 3Z" fill="#102a43" />
        <text y="-16" textAnchor="middle" className="fill-navy-700 font-sans text-[8px] font-bold">
          N
        </text>
      </g>

      <text x="22" y={height - 14} className="fill-navy-600 font-display text-[11px] font-bold">
        {CITY.name}
      </text>

      {/* Ações filtradas */}
      {dots.map(({ request, x, y }) => {
        const selected = request.id === selectedId
        const urgent = request.urgency === 'alta'
        return (
          <g key={request.id} transform={`translate(${x} ${y})`}>
            {urgent && (
              <circle r={selected ? 15 : 11} fill="none" stroke="#fbbf24" strokeWidth="3" className={cn(!selected && 'opacity-90')} />
            )}
            {selected && <circle r="19" fill="none" stroke="#102a43" strokeWidth="2" strokeDasharray="3 3" />}
            <circle
              r={selected ? 10 : 7}
              fill={CATEGORIES[request.category].pinColor}
              stroke="#ffffff"
              strokeWidth="2.5"
            />
          </g>
        )
      })}
    </svg>
  )
})
