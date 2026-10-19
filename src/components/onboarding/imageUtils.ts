/**
 * Utilitários de imagem para o upload do pedido de ajuda.
 * A imagem é reduzida no navegador (canvas) e codificada como JPEG em data URL,
 * para caber no localStorage do MVP sem backend.
 */

export const ACCEPTED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/webp'] as const
export const ACCEPTED_IMAGE_ATTR = ACCEPTED_IMAGE_TYPES.join(',')
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024
export const MAX_IMAGE_DIMENSION = 1280
/** Teto do data URL final (~ 300 KB) para caber vários pedidos com foto na cota do localStorage. */
const MAX_OUTPUT_CHARS = 400_000

export interface ProcessedImage {
  dataUrl: string
  width: number
  height: number
  /** Tamanho aproximado do JPEG final, em bytes */
  bytes: number
}

export function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`
  if (bytes < 1024 * 1024) return `${Math.round(bytes / 1024)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1).replace('.', ',')} MB`
}

/** Retorna uma mensagem de erro em pt-BR ou null se o arquivo for aceito. */
export function validateImageFile(file: File): string | null {
  if (!(ACCEPTED_IMAGE_TYPES as readonly string[]).includes(file.type)) {
    return 'Formato não aceito. Envie uma imagem JPG, PNG ou WebP.'
  }
  if (file.size > MAX_IMAGE_BYTES) {
    return `A imagem tem ${formatBytes(file.size)}. O tamanho máximo é 5 MB.`
  }
  return null
}

interface Drawable {
  source: CanvasImageSource
  width: number
  height: number
  release: () => void
}

async function loadDrawable(file: File): Promise<Drawable> {
  if (typeof createImageBitmap === 'function') {
    try {
      const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' })
      return { source: bitmap, width: bitmap.width, height: bitmap.height, release: () => bitmap.close() }
    } catch {
      /* alguns navegadores não decodificam WebP via bitmap — tenta com <img> */
    }
  }
  const url = URL.createObjectURL(file)
  try {
    const img = new Image()
    img.decoding = 'async'
    img.src = url
    await img.decode()
    return {
      source: img,
      width: img.naturalWidth,
      height: img.naturalHeight,
      release: () => URL.revokeObjectURL(url),
    }
  } catch (err) {
    URL.revokeObjectURL(url)
    throw err
  }
}

function encode(drawable: Drawable, maxDimension: number, quality: number): ProcessedImage {
  const scale = Math.min(1, maxDimension / Math.max(drawable.width, drawable.height))
  const width = Math.max(1, Math.round(drawable.width * scale))
  const height = Math.max(1, Math.round(drawable.height * scale))
  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) throw new Error('canvas-indisponivel')
  // Fundo branco: PNG/WebP com transparência ficariam pretos em JPEG
  ctx.fillStyle = '#ffffff'
  ctx.fillRect(0, 0, width, height)
  ctx.imageSmoothingEnabled = true
  ctx.imageSmoothingQuality = 'high'
  ctx.drawImage(drawable.source, 0, 0, width, height)
  const dataUrl = canvas.toDataURL('image/jpeg', quality)
  const base64Length = dataUrl.length - dataUrl.indexOf(',') - 1
  return { dataUrl, width, height, bytes: Math.round((base64Length * 3) / 4) }
}

/**
 * Reduz a imagem para no máximo `maxDimension` px no lado maior e codifica como JPEG.
 * Se o resultado ainda for grande, tenta novamente com qualidade/dimensão menores.
 */
export async function resizeImageFile(
  file: File,
  { maxDimension = MAX_IMAGE_DIMENSION, quality = 0.8 }: { maxDimension?: number; quality?: number } = {},
): Promise<ProcessedImage> {
  const drawable = await loadDrawable(file)
  try {
    const attempts: Array<[number, number]> = [
      [maxDimension, quality],
      [maxDimension, 0.7],
      [1024, 0.7],
      [800, 0.65],
      [640, 0.6],
    ]
    let result = encode(drawable, attempts[0][0], attempts[0][1])
    for (let i = 1; i < attempts.length && result.dataUrl.length > MAX_OUTPUT_CHARS; i++) {
      result = encode(drawable, attempts[i][0], attempts[i][1])
    }
    return result
  } finally {
    drawable.release()
  }
}
