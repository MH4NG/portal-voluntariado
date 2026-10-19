import { WHATSAPP_DEFAULT_MESSAGE } from '../config'

/** Remove tudo que não for dígito. */
export function onlyDigits(value: string): string {
  return value.replace(/\D+/g, '')
}

/**
 * Normaliza um telefone brasileiro para o formato aceito por wa.me (DDI + DDD + número).
 * Aceita entradas como "(41) 99999-0001", "41999990001" ou "+55 41 99999-0001".
 * Retorna null se o número for inválido.
 */
export function normalizeWhatsapp(value: string): string | null {
  let digits = onlyDigits(value)
  if (digits.startsWith('00')) digits = digits.slice(2)
  if (digits.length === 10 || digits.length === 11) digits = `55${digits}`
  if (digits.length < 12 || digits.length > 13) return null
  return digits
}

/** Formata para exibição: +55 (41) 99999-0001 */
export function formatPhone(digits: string): string {
  const d = onlyDigits(digits)
  const m = d.match(/^(55)?(\d{2})(\d{4,5})(\d{4})$/)
  if (!m) return digits
  return `${m[1] ? '+55 ' : ''}(${m[2]}) ${m[3]}-${m[4]}`
}

export function buildWhatsAppLink(phone: string, message: string): string {
  const number = normalizeWhatsapp(phone) ?? onlyDigits(phone)
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}

export function buildRequestWhatsAppLink(phone: string, requestTitle: string): string {
  return buildWhatsAppLink(phone, WHATSAPP_DEFAULT_MESSAGE(requestTitle))
}

export function buildMailto(email: string, subject: string, body?: string): string {
  const params = new URLSearchParams()
  params.set('subject', subject)
  if (body) params.set('body', body)
  // URLSearchParams codifica espaço como "+", que clientes de e-mail não decodificam.
  return `mailto:${email}?${params.toString().replace(/\+/g, '%20')}`
}

export function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())
}

/** Aceita "exemplo.org", "www.x.com/y" ou URL completa; devolve URL https ou null. */
export function normalizeUrl(value: string): string | null {
  const v = value.trim()
  if (!v) return null
  const withProtocol = /^https?:\/\//i.test(v) ? v : `https://${v}`
  try {
    const url = new URL(withProtocol)
    if (!url.hostname.includes('.')) return null
    return url.toString()
  } catch {
    return null
  }
}
