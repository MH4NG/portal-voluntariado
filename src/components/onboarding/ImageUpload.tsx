import { useRef, useState, type DragEvent } from 'react'
import { cn } from '../../lib/cn'
import { TextField } from './FormField'
import { IMAGE_ALT_MAX } from './drafts'
import { ACCEPTED_IMAGE_ATTR, formatBytes, resizeImageFile, validateImageFile } from './imageUtils'

interface ImageUploadProps {
  id: string
  altId: string
  image?: string
  alt: string
  altError?: string
  onChange: (patch: { image?: string; imageAlt?: string }) => void
}

type Status =
  | { kind: 'idle' }
  | { kind: 'processing'; name: string }
  | { kind: 'error'; message: string }
  | { kind: 'done'; message: string }

/**
 * Upload da imagem do pedido: <input type="file"> real (rotulado e acessível por teclado),
 * área de arrastar e soltar, prévia com remoção e texto alternativo obrigatório.
 */
export function ImageUpload({ id, altId, image, alt, altError, onChange }: ImageUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null)
  const [status, setStatus] = useState<Status>({ kind: 'idle' })
  const [dragging, setDragging] = useState(false)

  async function handleFile(file: File | undefined) {
    if (!file) return
    const invalid = validateImageFile(file)
    if (invalid) {
      setStatus({ kind: 'error', message: invalid })
      return
    }
    const hadImage = Boolean(image)
    setStatus({ kind: 'processing', name: file.name })
    try {
      const result = await resizeImageFile(file)
      onChange({ image: result.dataUrl })
      setStatus({
        kind: 'done',
        message: `Imagem "${file.name}" adicionada (${result.width}×${result.height} px, ${formatBytes(result.bytes)}). Agora descreva a imagem no campo abaixo.`,
      })
      // o seletor da área de soltar é desmontado ao surgir a prévia: leva o foco ao texto alternativo
      if (!hadImage) requestAnimationFrame(() => document.getElementById(altId)?.focus())
    } catch {
      setStatus({ kind: 'error', message: 'Não foi possível ler esta imagem. Tente outro arquivo JPG, PNG ou WebP.' })
    } finally {
      if (inputRef.current) inputRef.current.value = ''
    }
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault()
    setDragging(false)
    void handleFile(e.dataTransfer.files?.[0])
  }

  function handleRemove() {
    onChange({ image: undefined, imageAlt: '' })
    setStatus({ kind: 'done', message: 'Imagem removida.' })
    // devolve o foco ao seletor de arquivo, que continua na página
    requestAnimationFrame(() => inputRef.current?.focus())
  }

  const hintId = `${id}-hint`
  const statusId = `${id}-status`

  return (
    <div className="flex flex-col gap-3">
      <div className="flex flex-col gap-1">
        <p className="text-base font-semibold text-ink" id={`${id}-title`}>
          Imagem do pedido de ajuda
          <span className="ml-1.5 text-sm font-normal text-ink-muted">(opcional)</span>
        </p>
        <p id={hintId} className="text-sm text-ink-muted">
          Uma foto ajuda voluntários a entenderem o pedido. JPG, PNG ou WebP, até 5 MB. Evite mostrar rostos
          sem autorização.
        </p>
      </div>

      {image ? (
        <div className="overflow-hidden rounded-2xl border-2 border-navy-100 bg-surface-muted">
          <img
            src={image}
            alt={alt.trim() ? `Prévia: ${alt.trim()}` : 'Prévia da imagem enviada (descrição ainda não preenchida)'}
            className="aspect-[16/9] w-full object-cover"
          />
          <div className="flex flex-col gap-2 p-3 sm:flex-row sm:justify-end">
            <label
              htmlFor={id}
              className="relative inline-flex min-h-12 cursor-pointer items-center justify-center gap-2 rounded-full border-2 border-navy-900 bg-surface-raised px-5 font-semibold text-ink hover:bg-navy-50 has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-focus"
            >
              <input
                ref={inputRef}
                id={id}
                type="file"
                accept={ACCEPTED_IMAGE_ATTR}
                aria-describedby={`${hintId} ${statusId}`}
                onChange={(e) => void handleFile(e.target.files?.[0])}
                className="sr-only"
              />
              Trocar imagem
            </label>
            <button
              type="button"
              onClick={handleRemove}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-full px-5 font-semibold text-danger hover:bg-red-50 focus-ring"
            >
              <svg aria-hidden="true" viewBox="0 0 20 20" fill="currentColor" className="size-5">
                <path d="M8 2a1 1 0 0 0-1 1v1H4a1 1 0 0 0 0 2h12a1 1 0 1 0 0-2h-3V3a1 1 0 0 0-1-1H8Zm-3 6 .8 8.2A2 2 0 0 0 7.8 18h4.4a2 2 0 0 0 2-1.8L15 8H5Z" />
              </svg>
              Remover imagem
            </button>
          </div>
        </div>
      ) : (
        <div
          onDragOver={(e) => {
            e.preventDefault()
            setDragging(true)
          }}
          onDragLeave={() => setDragging(false)}
          onDrop={handleDrop}
          className={cn(
            'relative rounded-2xl border-2 border-dashed transition-colors',
            'has-[:focus-visible]:outline-3 has-[:focus-visible]:outline-offset-3 has-[:focus-visible]:outline-focus',
            dragging ? 'border-primary bg-primary-soft' : 'border-navy-400 bg-surface-muted hover:border-primary',
          )}
        >
          <label
            htmlFor={id}
            className="flex min-h-40 cursor-pointer flex-col items-center justify-center gap-3 px-6 py-8 text-center"
          >
            <span
              aria-hidden="true"
              className="flex size-14 items-center justify-center rounded-full bg-surface-raised text-primary shadow-card"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="size-7">
                <path d="M4 16.5V18a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-1.5M12 15V4m0 0L7.5 8.5M12 4l4.5 4.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </span>
            <span className="text-base font-semibold text-ink">
              <span className="text-primary underline decoration-2 underline-offset-4">Escolher uma imagem</span>
              <span className="hidden sm:inline"> ou arraste e solte aqui</span>
            </span>
            <span className="text-sm text-ink-muted">JPG, PNG ou WebP · até 5 MB</span>
            <input
              ref={inputRef}
              id={id}
              type="file"
              accept={ACCEPTED_IMAGE_ATTR}
              aria-describedby={`${hintId} ${statusId}`}
              onChange={(e) => void handleFile(e.target.files?.[0])}
              className="sr-only"
            />
          </label>
        </div>
      )}

      <p
        id={statusId}
        aria-live="polite"
        className={cn(
          'text-sm',
          status.kind === 'error' && 'flex items-start gap-1.5 font-semibold text-danger',
          status.kind === 'processing' && 'text-ink-muted',
          status.kind === 'done' && 'text-success',
          status.kind === 'idle' && 'sr-only',
        )}
      >
        {status.kind === 'processing' && `Processando "${status.name}"…`}
        {status.kind === 'error' && (
          <>
            <span className="sr-only">Erro: </span>
            {status.message}
          </>
        )}
        {status.kind === 'done' && status.message}
      </p>

      {image && (
        <TextField
          id={altId}
          label="Descrição da imagem (texto alternativo)"
          hint="Conte o que aparece na foto para quem usa leitor de tela. Ex.: Voluntários organizando caixas de alimentos em um galpão."
          required
          value={alt}
          maxLength={IMAGE_ALT_MAX}
          counter
          error={altError}
          onChange={(e) => onChange({ imageAlt: e.target.value })}
        />
      )}
    </div>
  )
}
