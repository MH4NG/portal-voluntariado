import { useCallback, useEffect, useRef, useState } from 'react'

export type CopyStatus = 'idle' | 'copied' | 'error'

/** Copia texto usando a Clipboard API, com fallback para navegadores antigos/contextos inseguros. */
export async function copyText(text: string): Promise<boolean> {
  try {
    if (typeof navigator !== 'undefined' && navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text)
      return true
    }
  } catch {
    // segue para o fallback
  }

  try {
    const textarea = document.createElement('textarea')
    textarea.value = text
    textarea.setAttribute('readonly', '')
    textarea.style.position = 'fixed'
    textarea.style.top = '0'
    textarea.style.left = '0'
    textarea.style.opacity = '0'
    document.body.appendChild(textarea)
    const previousFocus = document.activeElement as HTMLElement | null
    textarea.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(textarea)
    previousFocus?.focus()
    return ok
  } catch {
    return false
  }
}

/**
 * Estado de "copiado" com retorno automático para "idle".
 * Use o status para alimentar uma região aria-live (role="status").
 */
export function useClipboard(resetMs = 4000) {
  const [status, setStatus] = useState<CopyStatus>('idle')
  const timer = useRef<number | undefined>(undefined)

  useEffect(() => () => window.clearTimeout(timer.current), [])

  const copy = useCallback(
    async (text: string) => {
      window.clearTimeout(timer.current)
      setStatus('idle')
      const ok = await copyText(text)
      setStatus(ok ? 'copied' : 'error')
      timer.current = window.setTimeout(() => setStatus('idle'), ok ? resetMs : resetMs * 2)
      return ok
    },
    [resetMs],
  )

  return { status, copy }
}
