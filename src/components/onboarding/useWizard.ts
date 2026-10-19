import { useCallback, useEffect, useMemo, useState } from 'react'
import { hasErrors, type FieldErrors } from './validation'

/* ------------------------------------------------------------------ */
/* Rascunho no sessionStorage                                          */
/* ------------------------------------------------------------------ */

function readSession<T>(key: string): T | null {
  try {
    const raw = window.sessionStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

/** Grava o rascunho; se exceder a cota, tenta a versão reduzida (ex.: sem imagem). */
function writeSession(key: string, value: unknown, reduced?: unknown) {
  try {
    window.sessionStorage.setItem(key, JSON.stringify(value))
  } catch {
    if (reduced === undefined) return
    try {
      window.sessionStorage.setItem(key, JSON.stringify(reduced))
    } catch {
      /* storage indisponível — segue apenas em memória */
    }
  }
}

export function clearSessionDraft(key: string) {
  try {
    window.sessionStorage.removeItem(key)
  } catch {
    /* ignore */
  }
}

/* ------------------------------------------------------------------ */
/* Hook do assistente em etapas                                        */
/* ------------------------------------------------------------------ */

interface WizardOptions<T> {
  storageKey: string
  initial: T
  totalSteps: number
  /** Valida a etapa informada — retorna erros na ordem visual */
  validate: (step: number, data: T) => FieldErrors
  /** Mesclagem do rascunho salvo com os valores iniciais (tolera versões antigas) */
  hydrate?: (stored: Partial<T>, initial: T) => T
  /** Versão reduzida do rascunho para quando a cota do storage estourar */
  reduceForStorage?: (data: T) => T
  /** Mover o foco para o título da primeira etapa exibida */
  focusFirstStep?: boolean
}

interface StoredDraft<T> {
  step: number
  data: Partial<T>
}

export function useWizard<T extends object>({
  storageKey,
  initial,
  totalSteps,
  validate,
  hydrate,
  reduceForStorage,
  focusFirstStep = false,
}: WizardOptions<T>) {
  const [state, setState] = useState<{ step: number; data: T }>(() => {
    const stored = readSession<StoredDraft<T>>(storageKey)
    if (!stored || typeof stored !== 'object' || !stored.data) return { step: 0, data: initial }
    const data = hydrate ? hydrate(stored.data, initial) : { ...initial, ...stored.data }
    const step = Number.isInteger(stored.step) ? Math.min(Math.max(stored.step, 0), totalSteps - 1) : 0
    return { step, data }
  })
  /** Ids de campos cujo erro está sendo exibido (desde o último "Continuar" com falha) */
  const [shownErrorIds, setShownErrorIds] = useState<string[]>([])
  const [attempt, setAttempt] = useState(0)
  const [direction, setDirection] = useState<1 | -1>(1)
  const [focusHeading, setFocusHeading] = useState(focusFirstStep)
  const [finished, setFinished] = useState(false)

  const { step, data } = state

  useEffect(() => {
    if (finished) return
    const payload: StoredDraft<T> = { step, data }
    const reduced = reduceForStorage ? { step, data: reduceForStorage(data) } : undefined
    writeSession(storageKey, payload, reduced)
  }, [storageKey, step, data, reduceForStorage, finished])

  /**
   * Erros visíveis: revalidados a cada alteração, mas só para os campos que já
   * falharam — o erro some assim que a pessoa corrige, sem "gritar" antes do envio.
   */
  const errors = useMemo<FieldErrors>(() => {
    if (shownErrorIds.length === 0) return {}
    const current = validate(step, data)
    const out: FieldErrors = {}
    for (const [id, msg] of Object.entries(current)) {
      if (shownErrorIds.includes(id)) out[id] = msg
    }
    return out
  }, [shownErrorIds, validate, step, data])

  const update = useCallback((fn: (prev: T) => T) => {
    setState((s) => ({ ...s, data: fn(s.data) }))
  }, [])

  const goTo = useCallback(
    (target: number) => {
      const next = Math.min(Math.max(target, 0), totalSteps - 1)
      setDirection(next >= step ? 1 : -1)
      setState((s) => ({ ...s, step: next }))
      setShownErrorIds([])
      setFocusHeading(true)
    },
    [totalSteps, step],
  )

  /** Valida a etapa atual; em caso de erro exibe o resumo e retorna false. */
  const check = useCallback((): boolean => {
    const found = validate(step, data)
    if (hasErrors(found)) {
      setShownErrorIds(Object.keys(found))
      setAttempt((n) => n + 1)
      return false
    }
    setShownErrorIds([])
    return true
  }, [validate, step, data])

  const next = useCallback(() => {
    if (!check()) return false
    goTo(step + 1)
    return true
  }, [check, goTo, step])

  const back = useCallback(() => goTo(step - 1), [goTo, step])

  /** Encerra o assistente e apaga o rascunho. */
  const finish = useCallback(() => {
    setFinished(true)
    clearSessionDraft(storageKey)
  }, [storageKey])

  /** Recomeça do zero (ex.: "criar outro pedido"). */
  const reset = useCallback(
    (data: T) => {
      clearSessionDraft(storageKey)
      setState({ step: 0, data })
      setShownErrorIds([])
      setFinished(false)
      setFocusHeading(true)
      setDirection(1)
    },
    [storageKey],
  )

  return {
    step,
    data,
    update,
    errors,
    attempt,
    direction,
    focusHeading,
    finished,
    isLast: step === totalSteps - 1,
    goTo,
    next,
    back,
    check,
    finish,
    reset,
  }
}
