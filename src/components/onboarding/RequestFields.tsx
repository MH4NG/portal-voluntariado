import { useRef, useState, type KeyboardEvent } from 'react'
import { CATEGORY_LIST } from '../../data/categories'
import type { CategoryId, Urgency } from '../../types'
import { ChoiceGroup, RadioCard, Select, TextArea, TextField } from './FormField'
import { ImageUpload } from './ImageUpload'
import {
  DESCRIPTION_MAX,
  DESCRIPTION_MIN,
  MAX_NEEDS,
  SUMMARY_MAX,
  TITLE_MAX,
  todayISODate,
  type RequestDraft,
} from './drafts'
import { IDS, type FieldErrors } from './validation'

const URGENCY_OPTIONS: Array<{ value: Urgency; label: string; description: string; icon: string }> = [
  {
    value: 'alta',
    label: 'Urgente',
    description: 'Precisa de ajuda nos próximos dias. O pedido ganha destaque em âmbar no mural.',
    icon: '⚡',
  },
  {
    value: 'media',
    label: 'Média',
    description: 'Importante, mas pode esperar algumas semanas.',
    icon: '🗓️',
  },
  {
    value: 'baixa',
    label: 'Sem pressa',
    description: 'Ajuda contínua ou sem data definida.',
    icon: '🌱',
  },
]

interface RequestFieldsProps {
  value: RequestDraft
  onChange: (patch: Partial<RequestDraft>) => void
  errors: FieldErrors
}

/** Campos da etapa "Seu pedido" (usados no cadastro e em /acoes/nova). */
export function RequestFields({ value, onChange, errors }: RequestFieldsProps) {
  const id = IDS.request
  return (
    <>
      <TextField
        id={id.title}
        label="Título do pedido"
        hint="Uma frase curta e direta. Ex.: Mutirão para pintar a creche do bairro."
        required
        value={value.title}
        maxLength={TITLE_MAX}
        counter
        autoComplete="off"
        error={errors[id.title]}
        onChange={(e) => onChange({ title: e.target.value })}
      />
      <TextArea
        id={id.summary}
        label="Resumo"
        hint="Aparece nos cards e no mapa. Conte em uma ou duas frases o que você precisa."
        required
        rows={2}
        value={value.summary}
        maxLength={SUMMARY_MAX}
        counter
        error={errors[id.summary]}
        onChange={(e) => onChange({ summary: e.target.value })}
      />
      <TextArea
        id={id.description}
        label="Descrição completa"
        hint="Explique a situação, como os voluntários podem ajudar, horários e qualquer cuidado importante."
        required
        rows={6}
        value={value.description}
        maxLength={DESCRIPTION_MAX}
        minChars={DESCRIPTION_MIN}
        counter
        error={errors[id.description]}
        onChange={(e) => onChange({ description: e.target.value })}
      />
      <Select
        id={id.category}
        label="Categoria"
        required
        value={value.category}
        error={errors[id.category]}
        onChange={(e) => onChange({ category: e.target.value as CategoryId | '' })}
      >
        <option value="">Selecione uma categoria</option>
        {CATEGORY_LIST.map((c) => (
          <option key={c.id} value={c.id}>
            {c.label}
          </option>
        ))}
      </Select>

      <ChoiceGroup
        id={id.urgency}
        legend="Qual a urgência?"
        required
        error={errors[id.urgency]}
        gridClassName="sm:grid-cols-3"
      >
        {URGENCY_OPTIONS.map((opt) => (
          <RadioCard
            key={opt.value}
            name={id.urgency}
            value={opt.value}
            checked={value.urgency === opt.value}
            onChange={() => onChange({ urgency: opt.value })}
            label={opt.label}
            description={opt.description}
            icon={opt.icon}
            invalid={Boolean(errors[id.urgency])}
            describedBy={errors[id.urgency] ? `${id.urgency}-error` : undefined}
          />
        ))}
      </ChoiceGroup>

      <NeedsEditor needs={value.needs} onChange={(needs) => onChange({ needs })} error={errors[id.needs]} />

      <div className="grid gap-6 sm:grid-cols-2">
        <TextField
          id={id.volunteers}
          label="Quantos voluntários?"
          hint="Um número aproximado ajuda no planejamento."
          type="number"
          inputMode="numeric"
          min={1}
          max={500}
          step={1}
          value={value.volunteersNeeded}
          error={errors[id.volunteers]}
          onChange={(e) => onChange({ volunteersNeeded: e.target.value })}
        />
        <TextField
          id={id.deadline}
          label="Prazo"
          hint="Até quando você precisa de ajuda?"
          type="date"
          min={todayISODate()}
          value={value.neededBy}
          error={errors[id.deadline]}
          onChange={(e) => onChange({ neededBy: e.target.value })}
        />
      </div>

      <ImageUpload
        id={id.image}
        altId={id.imageAlt}
        image={value.image}
        alt={value.imageAlt}
        altError={errors[id.imageAlt]}
        onChange={(patch) => onChange(patch)}
      />
    </>
  )
}

/* ------------------------------------------------------------------ */
/* Lista "O que é necessário" (adicionar/remover, máx. 6)              */
/* ------------------------------------------------------------------ */

function NeedsEditor({
  needs,
  onChange,
  error,
}: {
  needs: string[]
  onChange: (needs: string[]) => void
  error?: string
}) {
  const id = IDS.request.needs
  const [draft, setDraft] = useState('')
  const [message, setMessage] = useState('')
  const [localError, setLocalError] = useState('')
  const inputRef = useRef<HTMLInputElement>(null)
  const full = needs.length >= MAX_NEEDS

  // Erro transitório (o foco não muda ao pressionar Enter): também vai para a região aria-live.
  // Limpa antes para que a mesma mensagem seja anunciada de novo.
  function fail(msg: string) {
    setLocalError(msg)
    setMessage('')
    requestAnimationFrame(() => setMessage(msg))
  }

  function add() {
    const item = draft.trim()
    if (!item) {
      fail('Escreva o item antes de adicionar.')
      inputRef.current?.focus()
      return
    }
    if (needs.some((n) => n.toLocaleLowerCase('pt-BR') === item.toLocaleLowerCase('pt-BR'))) {
      fail('Este item já está na lista.')
      return
    }
    if (full) {
      fail(`Limite de ${MAX_NEEDS} itens atingido. Remova um item para adicionar outro.`)
      return
    }
    onChange([...needs, item])
    setDraft('')
    setLocalError('')
    setMessage(`"${item}" adicionado. ${needs.length + 1} de ${MAX_NEEDS} itens.`)
    inputRef.current?.focus()
  }

  function remove(index: number) {
    const item = needs[index]
    const next = needs.filter((_, i) => i !== index)
    onChange(next)
    setMessage(`"${item}" removido. ${next.length} de ${MAX_NEEDS} itens.`)
    setLocalError('')
    inputRef.current?.focus()
  }

  function handleKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    // Enter adiciona o item em vez de enviar a etapa
    if (e.key === 'Enter') {
      e.preventDefault()
      add()
    }
  }

  return (
    <div className="flex flex-col gap-3">
      <TextField
        id={id}
        label="O que é necessário?"
        hint={
          full
            ? `Você chegou ao limite de ${MAX_NEEDS} itens. Remova um para adicionar outro.`
            : `Liste até ${MAX_NEEDS} itens concretos. Ex.: Doação de cobertores, Ajuda com transporte.`
        }
        ref={inputRef}
        value={draft}
        maxLength={60}
        autoComplete="off"
        enterKeyHint="done"
        error={localError || error}
        onKeyDown={handleKeyDown}
        onChange={(e) => {
          setDraft(e.target.value)
          if (localError) setLocalError('')
        }}
        addon={
          <button
            type="button"
            onClick={add}
            aria-disabled={full || undefined}
            className="inline-flex min-h-12 shrink-0 items-center justify-center gap-2 rounded-xl border-2 border-navy-900 bg-surface-raised px-5 font-semibold text-ink hover:bg-navy-50 focus-ring aria-disabled:cursor-not-allowed aria-disabled:opacity-60"
          >
            <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
              <path d="M10 4a1 1 0 0 1 1 1v4h4a1 1 0 1 1 0 2h-4v4a1 1 0 1 1-2 0v-4H5a1 1 0 1 1 0-2h4V5a1 1 0 0 1 1-1Z" />
            </svg>
            Adicionar<span className="sr-only"> item à lista</span>
          </button>
        }
      />
      {needs.length > 0 && (
        <ul aria-label="Itens necessários" className="flex flex-wrap gap-2">
          {needs.map((n, i) => (
            <li
              key={n}
              className="inline-flex max-w-full items-center gap-1 rounded-full bg-primary-soft py-1 pr-1 pl-4 text-base font-medium text-teal-900 ring-1 ring-teal-200"
            >
              <span className="min-w-0 break-words">{n}</span>
              <button
                type="button"
                onClick={() => remove(i)}
                className="inline-flex size-12 shrink-0 items-center justify-center rounded-full text-teal-900 hover:bg-teal-100 focus-ring"
              >
                <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-4">
                  <path d="M5.3 5.3a1 1 0 0 1 1.4 0L10 8.6l3.3-3.3a1 1 0 1 1 1.4 1.4L11.4 10l3.3 3.3a1 1 0 0 1-1.4 1.4L10 11.4l-3.3 3.3a1 1 0 0 1-1.4-1.4L8.6 10 5.3 6.7a1 1 0 0 1 0-1.4Z" />
                </svg>
                <span className="sr-only">Remover {n}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
      <p className="sr-only" aria-live="polite">
        {message}
      </p>
    </div>
  )
}
