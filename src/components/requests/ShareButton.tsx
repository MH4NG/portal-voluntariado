import { useState } from 'react'
import { cn } from '../../lib/cn'
import type { ButtonVariant } from '../ui/buttonStyles'
import { Button } from '../ui/Button'
import { CheckIcon, ShareIcon } from './ContactIcons'
import { useClipboard } from './useClipboard'

interface ShareButtonProps {
  title: string
  text?: string
  /** URL a compartilhar; padrão: a página atual */
  url?: string
  variant?: ButtonVariant
  className?: string
}

/**
 * Compartilha via Web Share API (celulares). Sem suporte, copia o link
 * e anuncia o resultado numa região aria-live.
 */
export function ShareButton({ title, text, url, variant = 'secondary', className }: ShareButtonProps) {
  const { status, copy } = useClipboard()
  const [shared, setShared] = useState(false)

  async function handleClick() {
    const shareUrl = url ?? window.location.href
    const data: ShareData = { title, text, url: shareUrl }

    if (typeof navigator.share === 'function' && (!navigator.canShare || navigator.canShare(data))) {
      try {
        await navigator.share(data)
        setShared(true)
        window.setTimeout(() => setShared(false), 4000)
        return
      } catch (error) {
        // Usuário fechou a folha de compartilhamento: não faz nada.
        if (error instanceof DOMException && error.name === 'AbortError') return
        // Outros erros (ex.: permissão negada): tenta copiar o link.
      }
    }
    await copy(shareUrl)
  }

  const copied = status === 'copied'

  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <Button variant={variant} onClick={() => void handleClick()} className="w-full sm:w-auto">
        {copied ? <CheckIcon className="text-success" /> : <ShareIcon />}
        Compartilhar
      </Button>
      <p role="status" aria-live="polite" className="min-h-5 text-sm font-medium empty:min-h-0">
        {copied && <span className="text-success">Link copiado</span>}
        {shared && <span className="text-success">Obrigado por compartilhar!</span>}
        {status === 'error' && (
          <span className="text-danger">
            Não foi possível copiar o link. Copie o endereço da barra do navegador.
          </span>
        )}
      </p>
    </div>
  )
}
