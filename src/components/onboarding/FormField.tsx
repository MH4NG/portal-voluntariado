import {
  useEffect,
  useRef,
  type InputHTMLAttributes,
  type ReactNode,
  type Ref,
  type SelectHTMLAttributes,
  type TextareaHTMLAttributes,
} from 'react'
import { cn } from '../../lib/cn'
import type { FieldErrors } from './validation'

/* ------------------------------------------------------------------ */
/* Peças compartilhadas                                                */
/* ------------------------------------------------------------------ */

const inputBase =
  'block w-full min-h-12 rounded-xl border-2 border-navy-500 bg-surface-raised px-4 py-3 ' +
  'text-base leading-snug text-ink placeholder:text-ink-muted shadow-[inset_0_1px_2px_rgb(16_42_67/0.06)] ' +
  'transition-colors focus-ring focus:border-primary hover:border-navy-700 ' +
  'aria-[invalid=true]:border-danger aria-[invalid=true]:bg-red-50/40 ' +
  'disabled:cursor-not-allowed disabled:bg-navy-50 disabled:text-ink-muted'

function joinIds(...ids: unknown[]): string | undefined {
  const list = ids.filter((x): x is string => typeof x === 'string' && x.length > 0)
  return list.length ? list.join(' ') : undefined
}

function RequiredMark({ required, hideOptional }: { required?: boolean; hideOptional?: boolean }) {
  if (!required && hideOptional) return null
  return required ? (
    <span className="ml-1 text-danger" aria-hidden="true">
      *
    </span>
  ) : (
    <span className="ml-1.5 text-sm font-normal text-ink-muted">(opcional)</span>
  )
}

export function FieldError({ id, message }: { id: string; message?: string }) {
  if (!message) return null
  return (
    <p id={id} className="flex items-start gap-1.5 text-sm font-semibold text-danger">
      <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="mt-px size-4 shrink-0">
        <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 0 1 1 1v3.5a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
      </svg>
      <span>
        <span className="sr-only">Erro: </span>
        {message}
      </span>
    </p>
  )
}

function Hint({ id, children }: { id: string; children?: ReactNode }) {
  if (!children) return null
  return (
    <p id={id} className="text-sm text-ink-muted">
      {children}
    </p>
  )
}

/**
 * Contador de caracteres. O número visível é decorativo; leitores de tela recebem
 * o limite via aria-describedby e um aviso discreto (aria-live) só ao cruzar limiares.
 */
function CharCounter({ id, length, max, min }: { id: string; length: number; max?: number; min?: number }) {
  const remaining = max !== undefined ? max - length : undefined
  let live = ''
  if (remaining !== undefined) {
    if (remaining <= 0) live = 'Limite de caracteres atingido.'
    else if (remaining <= 10) live = 'Restam 10 caracteres ou menos.'
    else if (remaining <= 20) live = 'Restam 20 caracteres ou menos.'
  }
  const minReached = min !== undefined && length >= min

  return (
    <div className="flex flex-wrap items-center justify-end gap-x-3 text-sm text-ink-muted">
      <span id={id} className="sr-only">
        {min !== undefined && `Mínimo de ${min} caracteres. `}
        {max !== undefined && `Máximo de ${max} caracteres.`}
      </span>
      {min !== undefined && (
        <span aria-hidden="true" className={cn('inline-flex items-center gap-1', minReached && 'font-semibold text-success')}>
          {minReached ? (
            <>
              <svg viewBox="0 0 20 20" fill="currentColor" className="size-4">
                <path d="M16.7 5.3a1 1 0 0 1 0 1.4l-8 8a1 1 0 0 1-1.4 0l-4-4a1 1 0 1 1 1.4-1.4L8 12.6l7.3-7.3a1 1 0 0 1 1.4 0Z" />
              </svg>
              Mínimo atingido
            </>
          ) : (
            `Faltam ${min - length} para o mínimo`
          )}
        </span>
      )}
      {max !== undefined && (
        <span
          aria-hidden="true"
          className={cn('tabular-nums', remaining !== undefined && remaining <= 10 && 'font-semibold text-urgent-ink')}
        >
          {length}/{max}
        </span>
      )}
      <span className="sr-only" aria-live="polite">
        {live}
      </span>
    </div>
  )
}

interface FieldProps {
  id: string
  label: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  /** Não exibe "(opcional)" — ex.: grupo em que pelo menos um campo é exigido */
  hideOptional?: boolean
  className?: string
}

/* ------------------------------------------------------------------ */
/* Campos de texto                                                     */
/* ------------------------------------------------------------------ */

type TextFieldProps = FieldProps &
  Omit<InputHTMLAttributes<HTMLInputElement>, 'id' | 'className' | 'required'> & {
    /** Mostra contador (usa maxLength) */
    counter?: boolean
    inputClassName?: string
    /** Conteúdo ao lado do input (ex.: botão "Adicionar") */
    addon?: ReactNode
    ref?: Ref<HTMLInputElement>
  }

export function TextField({
  id,
  label,
  hint,
  error,
  required,
  hideOptional,
  className,
  counter,
  inputClassName,
  addon,
  maxLength,
  value,
  ref,
  'aria-describedby': describedBy,
  ...props
}: TextFieldProps) {
  const length = typeof value === 'string' ? value.length : 0
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-base font-semibold text-ink">
        {label}
        <RequiredMark required={required} hideOptional={hideOptional} />
      </label>
      <Hint id={`${id}-hint`}>{hint}</Hint>
      <FieldError id={`${id}-error`} message={error} />
      <div className={addon ? 'flex flex-col gap-2 sm:flex-row' : undefined}>
        <input
          ref={ref}
          id={id}
          value={value}
          maxLength={maxLength}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={joinIds(
            hint && `${id}-hint`,
            error && `${id}-error`,
            counter && `${id}-counter`,
            describedBy,
          )}
          className={cn(inputBase, inputClassName)}
          {...props}
        />
        {addon}
      </div>
      {counter && <CharCounter id={`${id}-counter`} length={length} max={maxLength} />}
    </div>
  )
}

type TextAreaProps = FieldProps &
  Omit<TextareaHTMLAttributes<HTMLTextAreaElement>, 'id' | 'className' | 'required'> & {
    counter?: boolean
    minChars?: number
  }

export function TextArea({
  id,
  label,
  hint,
  error,
  required,
  className,
  counter,
  minChars,
  maxLength,
  value,
  rows = 4,
  'aria-describedby': describedBy,
  ...props
}: TextAreaProps) {
  const length = typeof value === 'string' ? value.trim().length : 0
  const rawLength = typeof value === 'string' ? value.length : 0
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-base font-semibold text-ink">
        {label}
        <RequiredMark required={required} />
      </label>
      <Hint id={`${id}-hint`}>{hint}</Hint>
      <FieldError id={`${id}-error`} message={error} />
      <textarea
        id={id}
        value={value}
        rows={rows}
        maxLength={maxLength}
        required={required}
        aria-invalid={error ? true : undefined}
        aria-describedby={joinIds(
          hint && `${id}-hint`,
          error && `${id}-error`,
          counter && `${id}-counter`,
          describedBy,
        )}
        className={cn(inputBase, 'resize-y leading-relaxed')}
        {...props}
      />
      {counter && (
        <CharCounter
          id={`${id}-counter`}
          length={minChars !== undefined ? length : rawLength}
          max={maxLength}
          min={minChars}
        />
      )}
    </div>
  )
}

type SelectProps = FieldProps &
  Omit<SelectHTMLAttributes<HTMLSelectElement>, 'id' | 'className' | 'required'> & {
    children: ReactNode
  }

export function Select({
  id,
  label,
  hint,
  error,
  required,
  className,
  children,
  'aria-describedby': describedBy,
  ...props
}: SelectProps) {
  return (
    <div className={cn('flex flex-col gap-2', className)}>
      <label htmlFor={id} className="text-base font-semibold text-ink">
        {label}
        <RequiredMark required={required} />
      </label>
      <Hint id={`${id}-hint`}>{hint}</Hint>
      <FieldError id={`${id}-error`} message={error} />
      <div className="relative">
        <select
          id={id}
          required={required}
          aria-invalid={error ? true : undefined}
          aria-describedby={joinIds(hint && `${id}-hint`, error && `${id}-error`, describedBy)}
          className={cn(inputBase, 'cursor-pointer appearance-none pr-12')}
          {...props}
        >
          {children}
        </select>
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="pointer-events-none absolute top-1/2 right-4 size-5 -translate-y-1/2 text-ink-muted"
        >
          <path d="M5.3 7.3a1 1 0 0 1 1.4 0L10 10.6l3.3-3.3a1 1 0 1 1 1.4 1.4l-4 4a1 1 0 0 1-1.4 0l-4-4a1 1 0 0 1 0-1.4Z" />
        </svg>
      </div>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Grupos de escolha (fieldset + legend)                               */
/* ------------------------------------------------------------------ */

interface ChoiceGroupProps {
  id: string
  legend: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
  /** Classes do grid de opções */
  gridClassName?: string
  className?: string
  children: ReactNode
}

export function ChoiceGroup({
  id,
  legend,
  hint,
  error,
  required,
  gridClassName,
  className,
  children,
}: ChoiceGroupProps) {
  return (
    <fieldset
      id={id}
      aria-describedby={joinIds(hint && `${id}-hint`, error && `${id}-error`)}
      className={cn('min-w-0', className)}
    >
      <legend className="text-lg font-bold text-ink">
        {legend}
        <RequiredMark required={required} />
      </legend>
      <div className="mt-2 flex flex-col gap-2">
        <Hint id={`${id}-hint`}>{hint}</Hint>
        <FieldError id={`${id}-error`} message={error} />
      </div>
      <div className={cn('mt-4 grid gap-3', gridClassName ?? 'sm:grid-cols-2')}>{children}</div>
    </fieldset>
  )
}

interface ChoiceCardProps {
  name: string
  value: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  description?: ReactNode
  /** Ícone/emoji decorativo */
  icon?: ReactNode
  invalid?: boolean
  /** Ids extras para aria-describedby (ex.: erro do grupo) */
  describedBy?: string
  required?: boolean
}

function ChoiceCard({
  type,
  name,
  value,
  checked,
  onChange,
  label,
  description,
  icon,
  invalid,
  describedBy,
  required,
}: ChoiceCardProps & { type: 'checkbox' | 'radio' }) {
  const id = `${name}-${value}`
  const descId = description ? `${id}-desc` : undefined
  return (
    <label
      htmlFor={id}
      className={cn(
        'relative flex min-h-16 cursor-pointer items-start gap-3 rounded-2xl border-2 bg-surface-raised p-4',
        'transition-[border-color,background-color,box-shadow] duration-150',
        'hover:border-navy-400 hover:shadow-card',
        checked ? 'border-primary bg-primary-soft shadow-card' : 'border-navy-200',
        invalid && !checked && 'border-danger/70',
      )}
    >
      <input
        id={id}
        type={type}
        name={name}
        value={value}
        checked={checked}
        required={required}
        onChange={(e) => onChange(e.target.checked)}
        aria-invalid={invalid ? true : undefined}
        aria-describedby={joinIds(descId, describedBy)}
        className="mt-0.5 size-6 shrink-0 cursor-pointer accent-primary"
      />
      <span className="flex min-w-0 flex-1 flex-col gap-0.5">
        <span className="flex items-center gap-2 text-base font-semibold text-ink">
          {icon && (
            <span aria-hidden="true" className="text-xl leading-none">
              {icon}
            </span>
          )}
          {label}
        </span>
        {description && (
          <span id={descId} className="text-sm text-ink-muted">
            {description}
          </span>
        )}
      </span>
      {checked && (
        <svg
          aria-hidden="true"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="absolute top-3 right-3 size-5 text-primary"
        >
          <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm3.7 6.2-4.5 4.5a.9.9 0 0 1-1.3 0l-2-2a.9.9 0 1 1 1.3-1.3l1.4 1.4 3.8-3.9a.9.9 0 0 1 1.3 1.3Z" />
        </svg>
      )}
    </label>
  )
}

export function CheckboxCard(props: ChoiceCardProps) {
  return <ChoiceCard type="checkbox" {...props} />
}

export function RadioCard(props: ChoiceCardProps) {
  return <ChoiceCard type="radio" {...props} />
}

/* ------------------------------------------------------------------ */
/* Checkbox simples (consentimento)                                    */
/* ------------------------------------------------------------------ */

interface CheckboxProps {
  id: string
  checked: boolean
  onChange: (checked: boolean) => void
  label: ReactNode
  hint?: ReactNode
  error?: string
  required?: boolean
}

export function Checkbox({ id, checked, onChange, label, hint, error, required }: CheckboxProps) {
  return (
    <div className="flex flex-col gap-2">
      <FieldError id={`${id}-error`} message={error} />
      <label
        htmlFor={id}
        className={cn(
          'flex min-h-12 cursor-pointer items-start gap-3 rounded-2xl border-2 bg-surface-raised p-4',
          checked ? 'border-primary bg-primary-soft' : error ? 'border-danger' : 'border-navy-200',
        )}
      >
        <input
          id={id}
          type="checkbox"
          checked={checked}
          required={required}
          onChange={(e) => onChange(e.target.checked)}
          aria-invalid={error ? true : undefined}
          aria-describedby={joinIds(hint && `${id}-hint`, error && `${id}-error`)}
          className="mt-0.5 size-6 shrink-0 cursor-pointer accent-primary"
        />
        <span className="text-base font-semibold text-ink">
          {label}
          {required && (
            <span className="ml-1 text-danger" aria-hidden="true">
              *
            </span>
          )}
        </span>
      </label>
      <Hint id={`${id}-hint`}>{hint}</Hint>
    </div>
  )
}

/* ------------------------------------------------------------------ */
/* Resumo de erros                                                     */
/* ------------------------------------------------------------------ */

const FOCUSABLE = 'input:not([type=hidden]), select, textarea, button'

/** Move o foco para o campo com erro (ou o primeiro controle dentro de um fieldset). */
function focusField(id: string) {
  const el = document.getElementById(id)
  if (!el) return
  const target = el.matches(FOCUSABLE) ? el : el.querySelector<HTMLElement>(FOCUSABLE)
  const label = el.closest('fieldset')?.querySelector('legend') ?? document.querySelector(`label[for="${id}"]`)
  ;(label ?? el).scrollIntoView({ block: 'center' })
  target?.focus({ preventScroll: true })
}

interface ErrorSummaryProps {
  errors: FieldErrors
  /** Incrementado a cada tentativa de envio com erro → recebe o foco */
  focusKey: number
}

export function ErrorSummary({ errors, focusKey }: ErrorSummaryProps) {
  const ref = useRef<HTMLDivElement>(null)
  const entries = Object.entries(errors)

  useEffect(() => {
    if (focusKey > 0) ref.current?.focus()
  }, [focusKey])

  if (entries.length === 0) return null

  return (
    <div
      ref={ref}
      tabIndex={-1}
      aria-labelledby="resumo-erros-titulo"
      className="rounded-2xl border-2 border-danger bg-red-50 p-5 focus-ring"
    >
      <p id="resumo-erros-titulo" className="flex items-center gap-2 font-display text-lg font-bold text-danger">
        <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5 shrink-0">
          <path d="M10 2a8 8 0 1 0 0 16 8 8 0 0 0 0-16Zm0 4a1 1 0 0 1 1 1v3.5a1 1 0 1 1-2 0V7a1 1 0 0 1 1-1Zm0 8.5a1.25 1.25 0 1 1 0-2.5 1.25 1.25 0 0 1 0 2.5Z" />
        </svg>
        {entries.length === 1
          ? 'Falta corrigir 1 item para continuar'
          : `Faltam corrigir ${entries.length} itens para continuar`}
      </p>
      <ul className="mt-3 flex flex-col gap-1">
        {entries.map(([id, message]) => (
          <li key={id}>
            <a
              href={`#${id}`}
              onClick={(e) => {
                e.preventDefault()
                focusField(id)
              }}
              className="inline-flex min-h-12 items-center rounded-md font-semibold text-red-900 underline decoration-2 underline-offset-4 hover:decoration-4"
            >
              {message}
            </a>
          </li>
        ))}
      </ul>
    </div>
  )
}
