import { useId, type FormEvent, type RefObject } from 'react'
import { CATEGORY_LIST } from '../../data/categories'
import { cn } from '../../lib/cn'
import type { CategoryId, Urgency } from '../../types'
import type { RequestFiltersState } from './useRequestFilters'

interface FiltersBarProps {
  filters: RequestFiltersState
  categoryCounts: Record<CategoryId, number>
  hasActiveFilters: boolean
  onQueryChange: (value: string) => void
  onToggleCategory: (id: CategoryId) => void
  onClearCategories: () => void
  onUrgencyChange: (value: Urgency | null) => void
  onClear: () => void
  /** Campo de busca: recebe o foco depois de "Limpar filtros" */
  searchInputRef?: RefObject<HTMLInputElement | null>
}

const URGENCY_OPTIONS: Array<{ value: Urgency | null; label: string }> = [
  { value: null, label: 'Todas' },
  { value: 'alta', label: 'Urgente' },
  { value: 'media', label: 'Média' },
  { value: 'baixa', label: 'Sem pressa' },
]

const chipBase =
  'relative inline-flex min-h-12 shrink-0 snap-start items-center gap-2 rounded-full px-4 text-sm font-semibold ' +
  'whitespace-nowrap transition-colors duration-150 focus-ring'

const chipIdle = 'bg-surface-raised text-ink ring-1 ring-navy-200 hover:bg-navy-50 hover:ring-navy-400'
const chipActive = 'bg-navy-900 text-ink-inverse ring-1 ring-navy-900 hover:bg-navy-800'

function CheckIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
      <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-7.5 7.5a1 1 0 0 1-1.4 0L3.3 9.7a1 1 0 1 1 1.4-1.4l3.8 3.8 6.8-6.8a1 1 0 0 1 1.4 0Z" />
    </svg>
  )
}

export function FiltersBar({
  filters,
  categoryCounts,
  hasActiveFilters,
  onQueryChange,
  onToggleCategory,
  onClearCategories,
  onUrgencyChange,
  onClear,
  searchInputRef,
}: FiltersBarProps) {
  const uid = useId()
  const searchId = `${uid}-busca`
  const searchHintId = `${uid}-busca-dica`
  const categoriesLabelId = `${uid}-causas`
  const noCategory = filters.categories.length === 0

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    // A busca já é aplicada enquanto a pessoa digita
    event.preventDefault()
  }

  return (
    <form role="search" aria-label="Filtrar ações" onSubmit={handleSubmit} className="flex flex-col gap-5">
      <div className="flex flex-col gap-5 lg:flex-row lg:items-end lg:gap-6">
        {/* Busca textual */}
        <div className="min-w-0 flex-1 lg:max-w-xl">
          <label htmlFor={searchId} className="mb-2 block text-sm font-semibold text-ink">
            Buscar por ação, bairro ou instituição
          </label>
          <div className="relative">
            <svg
              aria-hidden="true"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="pointer-events-none absolute top-1/2 left-4 size-5 -translate-y-1/2 text-ink-muted"
            >
              <path d="M8.5 2a6.5 6.5 0 0 1 5.18 10.43l3.95 3.95a1 1 0 0 1-1.42 1.42l-3.95-3.95A6.5 6.5 0 1 1 8.5 2Zm0 2a4.5 4.5 0 1 0 0 9 4.5 4.5 0 0 0 0-9Z" />
            </svg>
            <input
              ref={searchInputRef}
              id={searchId}
              type="search"
              inputMode="search"
              enterKeyHint="search"
              autoComplete="off"
              spellCheck={false}
              value={filters.query}
              onChange={(e) => onQueryChange(e.target.value)}
              aria-describedby={searchHintId}
              placeholder="Ex.: cozinha, Itaipava, abrigo"
              className={cn(
                'block min-h-12 w-full rounded-full border-2 border-navy-500 bg-surface-raised py-3 pr-4 pl-12',
                'text-base text-ink placeholder:text-ink-muted shadow-sm',
                'transition-colors hover:border-navy-700 focus:border-navy-900 focus-ring',
              )}
            />
          </div>
          <p id={searchHintId} className="sr-only">
            Os resultados são atualizados enquanto você digita.
          </p>
        </div>

        {/* Urgência — controle segmentado com rádios nativos (setas do teclado funcionam) */}
        <fieldset className="min-w-0 lg:w-[26rem]">
          <legend className="mb-2 block text-sm font-semibold text-ink">Urgência</legend>
          <div className="grid grid-cols-4 gap-1 rounded-full bg-surface-muted p-1 ring-1 ring-border">
            {URGENCY_OPTIONS.map((option) => {
              const checked = filters.urgency === option.value
              return (
                <label key={option.label} className="relative block min-w-0 cursor-pointer">
                  <input
                    type="radio"
                    name={`${uid}-urgencia`}
                    value={option.value ?? ''}
                    checked={checked}
                    onChange={() => onUrgencyChange(option.value)}
                    className="peer sr-only"
                  />
                  <span
                    className={cn(
                      'flex min-h-12 items-center justify-center gap-1 rounded-full px-1.5 text-center text-sm leading-tight transition-colors sm:px-3',
                      'peer-focus-visible:outline-3 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-focus',
                      checked
                        ? option.value === 'alta'
                          ? 'bg-urgent font-bold text-on-urgent shadow-card'
                          : 'bg-navy-900 font-bold text-ink-inverse shadow-card'
                        : 'font-medium text-ink-muted hover:bg-surface-raised/70 hover:text-ink',
                    )}
                  >
                    {option.value === 'alta' && (
                      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="hidden size-4 shrink-0 min-[400px]:block">
                        <path d="M10 2a1 1 0 0 1 .87.5l7 12A1 1 0 0 1 17 16H3a1 1 0 0 1-.87-1.5l7-12A1 1 0 0 1 10 2Zm0 5a1 1 0 0 0-1 1v3a1 1 0 1 0 2 0V8a1 1 0 0 0-1-1Zm0 7.25a1.25 1.25 0 1 0 0-2.5 1.25 1.25 0 0 0 0 2.5Z" />
                      </svg>
                    )}
                    {checked && option.value !== 'alta' && (
                      <span className="hidden shrink-0 min-[400px]:block">
                        <CheckIcon />
                      </span>
                    )}
                    {option.label}
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>
      </div>

      {/* Causas — botões de alternância (seleção múltipla) */}
      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between gap-3">
          <p id={categoriesLabelId} className="text-sm font-semibold text-ink">
            Causas
          </p>
          <button
            type="button"
            onClick={() => {
              // aria-disabled (e não disabled) para o botão não perder o foco ao limpar
              if (hasActiveFilters) onClear()
            }}
            aria-disabled={!hasActiveFilters || undefined}
            className={cn(
              '-mr-3 inline-flex min-h-12 items-center gap-2 rounded-full px-3 text-sm font-semibold transition-colors focus-ring',
              'text-primary underline-offset-4 hover:bg-primary-soft hover:underline',
              'aria-disabled:cursor-not-allowed aria-disabled:text-navy-500 aria-disabled:no-underline aria-disabled:hover:bg-transparent',
            )}
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
              <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
            </svg>
            Limpar filtros
          </button>
        </div>
        <div className="relative -mx-4 min-w-0 sm:mx-0">
          <div
            role="group"
            aria-labelledby={categoriesLabelId}
            className={cn(
              'relative flex snap-x scroll-px-4 gap-2 overflow-x-auto px-4 pt-1 pb-3 [scrollbar-width:thin]',
              'sm:flex-wrap sm:overflow-visible sm:px-0 sm:pb-1',
            )}
          >
            <button
              type="button"
              aria-pressed={noCategory}
              onClick={onClearCategories}
              className={cn(chipBase, noCategory ? chipActive : chipIdle)}
            >
              {noCategory && <CheckIcon />}
              Todas as causas
            </button>
            {CATEGORY_LIST.map((category) => {
              const pressed = filters.categories.includes(category.id)
              const count = categoryCounts[category.id]
              return (
                <button
                  key={category.id}
                  type="button"
                  aria-pressed={pressed}
                  onClick={() => onToggleCategory(category.id)}
                  className={cn(chipBase, pressed ? chipActive : chipIdle)}
                >
                  {pressed ? <CheckIcon /> : <span aria-hidden="true">{category.emoji}</span>}
                  {category.label}
                  <span
                    className={cn(
                      'min-w-6 rounded-full px-1.5 py-0.5 text-center text-xs font-bold tabular-nums',
                      pressed ? 'bg-white/15 text-ink-inverse' : 'bg-navy-50 text-navy-700',
                    )}
                  >
                    {count}
                    <span className="sr-only">{count === 1 ? ' ação' : ' ações'}</span>
                  </span>
                </button>
              )
            })}
            {/* Espaçador para que o último chip não fique sob o degradê */}
            <span aria-hidden="true" className="w-6 shrink-0 sm:hidden" />
          </div>
          {/* Indicação visual de que a fileira rola horizontalmente (só no mobile) */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute top-0 right-0 bottom-3 w-12 bg-linear-to-l from-surface via-surface/80 to-transparent sm:hidden"
          />
        </div>
      </div>
    </form>
  )
}
