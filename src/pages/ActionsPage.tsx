import { useCallback, useEffect, useId, useRef, useState, type CSSProperties } from 'react'
import { FiltersBar } from '../components/map/FiltersBar'
import { RequestList } from '../components/map/RequestList'
import { RequestsMap } from '../components/map/RequestsMap'
import type { MapAvailability, ResultsView, SelectionSource } from '../components/map/types'
import { useMediaQuery, LG_QUERY } from '../components/map/useMediaQuery'
import { useRequestFilters } from '../components/map/useRequestFilters'
import { useStickyOffsets } from '../components/map/useStickyOffsets'
import { ViewToggle } from '../components/map/ViewToggle'
import { ButtonLink } from '../components/ui/Button'
import { CITY, HAS_MAPS_KEY } from '../config'
import { cn } from '../lib/cn'
import { formatNumber } from '../lib/format'
import { gsap, MOTION, prefersReducedMotion, useGSAP } from '../lib/gsap'
import { usePageTitle } from '../lib/usePageTitle'

const LIVE_DEBOUNCE_MS = 600

function countLabel(n: number): string {
  if (n === 0) return 'Nenhuma ação encontrada'
  if (n === 1) return '1 ação encontrada'
  return `${formatNumber(n)} ações encontradas`
}

/**
 * /acoes — mapa interativo + lista filtrável (briefing §4.2).
 * Mobile: alternância "Mapa | Lista". Desktop (lg): lista à esquerda e mapa fixo à direita.
 * Filtros e seleção ficam na URL (?q=&categoria=&urgencia=&acao=) para serem compartilháveis.
 */
export function ActionsPage() {
  usePageTitle('Ações no mapa')

  const {
    filters,
    results,
    selected,
    total,
    categoryCounts,
    hasActiveFilters,
    setQuery,
    toggleCategory,
    clearCategories,
    setUrgency,
    select,
    clearFilters,
  } = useRequestFilters()

  // Depois de limpar os filtros, o foco vai para a busca (o botão usado pode sumir ou ficar inativo)
  const searchInputRef = useRef<HTMLInputElement>(null)
  const handleClearFilters = useCallback(() => {
    clearFilters()
    requestAnimationFrame(() => searchInputRef.current?.focus())
  }, [clearFilters])

  const isLg = useMediaQuery(LG_QUERY)
  const [availability, setAvailability] = useState<MapAvailability>(
    HAS_MAPS_KEY ? 'loading' : 'unavailable',
  )
  // null = ainda não escolhida: mapa quando disponível, senão a lista
  const [viewChoice, setViewChoice] = useState<ResultsView | null>(null)
  const view: ResultsView = viewChoice ?? (availability === 'unavailable' ? 'list' : 'map')
  const mapVisible = isLg || view === 'map'
  const listVisible = isLg || view === 'list'

  const [selection, setSelection] = useState<{ source: SelectionSource; nonce: number }>({
    source: 'url',
    nonce: 0,
  })

  const handleSelect = useCallback(
    (id: string | null, source: SelectionSource) => {
      setSelection((prev) => ({ source, nonce: prev.nonce + 1 }))
      select(id)
      // "Ver no mapa" no mobile leva direto ao mapa
      if (id && source === 'list') setViewChoice('map')
    },
    [select],
  )

  const showList = useCallback(() => setViewChoice('list'), [])

  // ---- Medidas para o mapa ocupar exatamente o restante da tela ----
  const rootRef = useRef<HTMLDivElement>(null)
  const barRef = useRef<HTMLDivElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)
  const { headerHeight, barHeight } = useStickyOffsets(barRef)

  // Ao trocar de visão no mobile, alinha o conteúdo logo abaixo da barra fixa
  const previousView = useRef(view)
  const hasSelection = selected !== null
  useEffect(() => {
    if (previousView.current === view) return
    previousView.current = view
    if (isLg || !contentRef.current) return
    if (view === 'list' && hasSelection) return // a lista rola até o item selecionado
    const top = contentRef.current.getBoundingClientRect().top + window.scrollY - headerHeight - barHeight
    if (view === 'map' || window.scrollY > top) {
      window.scrollTo({ top: Math.max(0, top), behavior: prefersReducedMotion() ? 'auto' : 'smooth' })
    }
  }, [view, isLg, hasSelection, headerHeight, barHeight])

  // ---- Contagem anunciada com atraso (evita uma leitura a cada tecla) ----
  const count = results.length
  const message = countLabel(count)
  const [liveMessage, setLiveMessage] = useState(message)
  useEffect(() => {
    const timer = window.setTimeout(() => setLiveMessage(message), LIVE_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [message])

  // ---- Animação de entrada (somente com movimento permitido) ----
  useGSAP(
    () => {
      const mm = gsap.matchMedia()
      mm.add(MOTION.ok, () => {
        const root = rootRef.current
        if (!root) return
        const intro = root.querySelectorAll('[data-anim="intro"] > *')
        if (intro.length > 0) {
          gsap.from(intro, {
            y: 14,
            opacity: 0,
            duration: 0.6,
            ease: 'power3.out',
            stagger: 0.07,
            clearProps: 'transform,opacity',
          })
        }
        const items = Array.from(root.querySelectorAll('[data-anim="list-item"]')).slice(0, 8)
        if (items.length > 0) {
          gsap.from(items, {
            y: 18,
            opacity: 0,
            duration: 0.5,
            ease: 'power2.out',
            stagger: 0.05,
            delay: 0.15,
            clearProps: 'transform,opacity',
          })
        }
      })
      return () => mm.revert()
    },
    { scope: rootRef },
  )

  const uid = useId()
  const listTitleId = `${uid}-lista`
  const mapTitleId = `${uid}-mapa`

  const offsets = {
    '--header-h': `${headerHeight}px`,
    '--bar-h': `${barHeight}px`,
  } as CSSProperties

  return (
    <div ref={rootRef} style={offsets} className="bg-surface">
      {/* Cabeçalho da página + filtros */}
      <div className="px-4 pt-6 pb-5 sm:px-6 lg:px-8 lg:pt-8">
        <div data-anim="intro" className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-2xl">
            <p className="text-sm font-bold tracking-widest text-primary uppercase">
              Mapa de ações · {CITY.name}
            </p>
            <h1 className="mt-1 text-2xl leading-tight font-extrabold tracking-tight text-ink sm:text-3xl">
              Ações perto de você
            </h1>
            <p className="mt-2 text-base leading-relaxed text-ink-muted">
              Encontre quem precisa de uma mão no seu bairro. Filtre por causa ou urgência e fale
              direto com quem organiza.
            </p>
          </div>
          <ButtonLink to="/acoes/nova" variant="secondary" className="self-start sm:self-auto">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M10 3a1 1 0 0 1 1 1v5h5a1 1 0 1 1 0 2h-5v5a1 1 0 1 1-2 0v-5H4a1 1 0 1 1 0-2h5V4a1 1 0 0 1 1-1Z" />
            </svg>
            Publicar pedido de ajuda
          </ButtonLink>
        </div>

        <div className="mt-6">
          <FiltersBar
            filters={filters}
            categoryCounts={categoryCounts}
            hasActiveFilters={hasActiveFilters}
            onQueryChange={setQuery}
            onToggleCategory={toggleCategory}
            onClearCategories={clearCategories}
            onUrgencyChange={setUrgency}
            onClear={handleClearFilters}
            searchInputRef={searchInputRef}
          />
        </div>
      </div>

      {/* Barra de resultados — fixa abaixo do cabeçalho no mobile */}
      <div
        ref={barRef}
        className="sticky top-(--header-h) z-20 border-y border-border bg-surface/95 backdrop-blur-md lg:static lg:z-auto lg:bg-surface lg:backdrop-blur-none"
      >
        <div className="flex min-h-16 items-center justify-between gap-3 px-4 py-2 sm:px-6 lg:px-8">
          <p aria-hidden="true" className="min-w-0 text-sm text-ink-muted sm:text-base">
            <span className="font-display text-xl font-extrabold text-ink tabular-nums">
              {formatNumber(count)}
            </span>{' '}
            <span className="font-semibold text-ink">
              {count === 1 ? 'ação encontrada' : 'ações encontradas'}
            </span>
            {hasActiveFilters && count < total && (
              <span className="hidden min-[400px]:inline"> de {formatNumber(total)}</span>
            )}
          </p>
          <p role="status" aria-live="polite" aria-atomic="true" className="sr-only">
            {liveMessage}
          </p>
          <ViewToggle view={view} onChange={setViewChoice} className="lg:hidden" />
        </div>
      </div>

      {/* Lista + mapa */}
      <div
        ref={contentRef}
        className="lg:grid lg:grid-cols-[26.25rem_minmax(0,1fr)] xl:grid-cols-[28rem_minmax(0,1fr)]"
      >
        <section
          aria-labelledby={listTitleId}
          className={cn(
            'bg-surface-muted px-4 py-6 sm:px-6 lg:block lg:border-r lg:border-border lg:px-6',
            !listVisible && 'hidden',
          )}
        >
          <h2 id={listTitleId} className="sr-only">
            Lista de ações
          </h2>
          <p className="mb-5 flex items-start gap-2 text-sm leading-relaxed text-ink-muted">
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="mt-0.5 size-4 shrink-0 text-primary">
              <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 1 1 0 2 1 1 0 0 1 0-2Zm1 8a1 1 0 1 1-2 0v-4a1 1 0 1 1 2 0v4Z" />
            </svg>
            <span>Use a lista para navegar pelas ações; o mapa mostra as mesmas ações.</span>
          </p>
          <RequestList
            requests={results}
            selectedId={selected?.id ?? null}
            selectionSource={selection.source}
            selectionNonce={selection.nonce}
            visible={listVisible}
            canShowOnMap={availability === 'ready'}
            hasActiveFilters={hasActiveFilters}
            onSelect={handleSelect}
            onClearFilters={handleClearFilters}
          />
        </section>

        <section
          aria-labelledby={mapTitleId}
          className={cn('relative isolate z-0 lg:block', !mapVisible && 'hidden')}
        >
          <h2 id={mapTitleId} className="sr-only">
            Mapa das ações
          </h2>
          <p className="sr-only">
            O mapa mostra as mesmas ações da lista. Com leitor de tela, prefira a lista: cada ação
            tem o botão “Abrir no Google Maps”.
          </p>
          <div className="h-[calc(100dvh-var(--header-h)-var(--bar-h))] min-h-96 lg:sticky lg:top-(--header-h) lg:h-[calc(100dvh-var(--header-h))]">
            <RequestsMap
              requests={results}
              selected={selected}
              selectionSource={selection.source}
              selectionNonce={selection.nonce}
              visible={mapVisible}
              gestureHandling={isLg ? 'cooperative' : 'greedy'}
              onSelect={handleSelect}
              onAvailabilityChange={setAvailability}
              onShowList={showList}
            />
          </div>
        </section>
      </div>
    </div>
  )
}
