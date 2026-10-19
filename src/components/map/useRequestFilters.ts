import { useCallback, useDeferredValue, useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams, type SetURLSearchParams } from 'react-router-dom'
import { useRequests } from '../../context/RequestsContext'
import { CATEGORIES, CATEGORY_LIST, URGENCY } from '../../data/categories'
import { compareByUrgency } from '../../lib/sort'
import type { CategoryId, HelpRequest, Urgency } from '../../types'

/** Nomes dos parâmetros de URL (filtros compartilháveis). */
export const FILTER_PARAMS = {
  query: 'q',
  category: 'categoria',
  urgency: 'urgencia',
  selected: 'acao',
} as const

const QUERY_DEBOUNCE_MS = 300

export interface RequestFiltersState {
  /** Texto digitado (atualiza na hora; a URL é sincronizada com atraso) */
  query: string
  categories: CategoryId[]
  urgency: Urgency | null
  selectedId: string | null
}

export interface UseRequestFiltersResult {
  filters: RequestFiltersState
  /** Ações filtradas, ordenadas por urgência */
  results: HelpRequest[]
  /** Ação selecionada (apenas se estiver entre os resultados) */
  selected: HelpRequest | null
  total: number
  /** Quantas ações cada causa teria com os demais filtros aplicados */
  categoryCounts: Record<CategoryId, number>
  hasActiveFilters: boolean
  setQuery: (value: string) => void
  toggleCategory: (id: CategoryId) => void
  clearCategories: () => void
  setUrgency: (value: Urgency | null) => void
  select: (id: string | null) => void
  clearFilters: () => void
}

/** Remove acentos e caixa para uma busca tolerante ("Agua Verde" encontra "Água Verde"). */
export function normalizeText(value: string): string {
  return value.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase()
}

function tokenize(value: string): string[] {
  return normalizeText(value).split(/\s+/).filter(Boolean)
}

function parseCategories(values: string[]): CategoryId[] {
  const wanted = new Set(values.flatMap((v) => v.split(',')).map((v) => v.trim()))
  // Mantém a ordem canônica de CATEGORY_LIST e descarta valores inválidos
  return CATEGORY_LIST.map((c) => c.id).filter((id) => wanted.has(id))
}

function parseUrgency(value: string | null): Urgency | null {
  return value && Object.hasOwn(URGENCY, value) ? (value as Urgency) : null
}

function emptyCounts(): Record<CategoryId, number> {
  return Object.fromEntries(CATEGORY_LIST.map((c) => [c.id, 0])) as Record<CategoryId, number>
}

const URL_OPTIONS = { replace: true, preventScrollReset: true } as const

/**
 * Estado dos filtros da página /acoes, sincronizado com a URL:
 *   ?q=texto&categoria=animais&categoria=idosos&urgencia=alta&acao=<id>
 */
export function useRequestFilters(): UseRequestFiltersResult {
  const { requests } = useRequests()
  const [params, setParams] = useSearchParams()

  // Mantém a referência mais recente de setParams para que os callbacks sejam estáveis
  // (evita re-renderizar todos os marcadores a cada navegação).
  const setParamsRef = useRef<SetURLSearchParams>(setParams)
  useEffect(() => {
    setParamsRef.current = setParams
  }, [setParams])

  const updateParams = useCallback((mutate: (next: URLSearchParams) => void) => {
    setParamsRef.current((prev) => {
      const next = new URLSearchParams(prev)
      mutate(next)
      return next
    }, URL_OPTIONS)
  }, [])

  // ---- Valores lidos da URL (chaves em string para memoização estável) ----
  const urlQuery = params.get(FILTER_PARAMS.query) ?? ''
  const categoryKey = params.getAll(FILTER_PARAMS.category).join(',')
  const categories = useMemo(() => parseCategories(categoryKey ? [categoryKey] : []), [categoryKey])
  const urgency = parseUrgency(params.get(FILTER_PARAMS.urgency))
  const selectedId = params.get(FILTER_PARAMS.selected)

  // ---- Busca: estado local imediato + escrita na URL com debounce ----
  const [query, setQueryState] = useState(urlQuery)
  const lastWrittenQuery = useRef(urlQuery)

  // URL → estado (ex.: botão Voltar do navegador)
  useEffect(() => {
    if (urlQuery !== lastWrittenQuery.current) {
      lastWrittenQuery.current = urlQuery
      setQueryState(urlQuery)
    }
  }, [urlQuery])

  // Estado → URL
  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed === lastWrittenQuery.current) return
    const timer = window.setTimeout(() => {
      lastWrittenQuery.current = trimmed
      updateParams((next) => {
        if (trimmed) next.set(FILTER_PARAMS.query, trimmed)
        else next.delete(FILTER_PARAMS.query)
      })
    }, QUERY_DEBOUNCE_MS)
    return () => window.clearTimeout(timer)
  }, [query, updateParams])

  // ---- Filtragem (memoizada) ----
  const sorted = useMemo(() => [...requests].sort(compareByUrgency), [requests])

  const searchIndex = useMemo(
    () =>
      new Map(
        requests.map((r) => [
          r.id,
          normalizeText(
            [r.title, r.summary, r.neighborhood, r.organization, CATEGORIES[r.category].label].join(' '),
          ),
        ]),
      ),
    [requests],
  )

  const deferredQuery = useDeferredValue(query)
  const tokens = useMemo(() => tokenize(deferredQuery), [deferredQuery])

  // Resultado antes do filtro de causa (base para as contagens dos chips)
  const beforeCategory = useMemo(
    () =>
      sorted.filter((r) => {
        if (urgency && r.urgency !== urgency) return false
        if (tokens.length === 0) return true
        const haystack = searchIndex.get(r.id) ?? ''
        return tokens.every((t) => haystack.includes(t))
      }),
    [sorted, urgency, tokens, searchIndex],
  )

  const categoryCounts = useMemo(() => {
    const counts = emptyCounts()
    for (const r of beforeCategory) counts[r.category] += 1
    return counts
  }, [beforeCategory])

  const results = useMemo(() => {
    if (categories.length === 0) return beforeCategory
    const set = new Set(categories)
    return beforeCategory.filter((r) => set.has(r.category))
  }, [beforeCategory, categories])

  const selected = useMemo(
    () => (selectedId ? (results.find((r) => r.id === selectedId) ?? null) : null),
    [results, selectedId],
  )

  // ---- Ações ----
  const setQuery = useCallback((value: string) => setQueryState(value), [])

  const toggleCategory = useCallback(
    (id: CategoryId) =>
      updateParams((next) => {
        const current = parseCategories(next.getAll(FILTER_PARAMS.category))
        const updated = current.includes(id) ? current.filter((c) => c !== id) : [...current, id]
        next.delete(FILTER_PARAMS.category)
        for (const c of parseCategories(updated)) next.append(FILTER_PARAMS.category, c)
      }),
    [updateParams],
  )

  const clearCategories = useCallback(
    () => updateParams((next) => next.delete(FILTER_PARAMS.category)),
    [updateParams],
  )

  const setUrgency = useCallback(
    (value: Urgency | null) =>
      updateParams((next) => {
        if (value) next.set(FILTER_PARAMS.urgency, value)
        else next.delete(FILTER_PARAMS.urgency)
      }),
    [updateParams],
  )

  const select = useCallback(
    (id: string | null) =>
      updateParams((next) => {
        if (id) next.set(FILTER_PARAMS.selected, id)
        else next.delete(FILTER_PARAMS.selected)
      }),
    [updateParams],
  )

  const clearFilters = useCallback(() => {
    lastWrittenQuery.current = ''
    setQueryState('')
    updateParams((next) => {
      next.delete(FILTER_PARAMS.query)
      next.delete(FILTER_PARAMS.category)
      next.delete(FILTER_PARAMS.urgency)
      next.delete(FILTER_PARAMS.selected)
    })
  }, [updateParams])

  const filters = useMemo<RequestFiltersState>(
    () => ({ query, categories, urgency, selectedId }),
    [query, categories, urgency, selectedId],
  )

  return {
    filters,
    results,
    selected,
    total: requests.length,
    categoryCounts,
    hasActiveFilters: query.trim().length > 0 || categories.length > 0 || urgency !== null,
    setQuery,
    toggleCategory,
    clearCategories,
    setUrgency,
    select,
    clearFilters,
  }
}
