import { URGENCY } from '../data/categories'
import type { HelpRequest } from '../types'
import { isExpired } from './format'

/** Prazo já encerrado? (pedidos sem prazo nunca expiram) */
export function isRequestExpired(request: HelpRequest, now: Date = new Date()): boolean {
  return !!request.neededBy && isExpired(request.neededBy, now)
}

/**
 * Ordena pedidos abertos antes dos com prazo encerrado; depois por urgência (alta → baixa),
 * prazo mais próximo e, por fim, mais recente.
 */
export function compareByUrgency(a: HelpRequest, b: HelpRequest): number {
  const now = new Date()
  const aExpired = isRequestExpired(a, now)
  const bExpired = isRequestExpired(b, now)
  if (aExpired !== bExpired) return aExpired ? 1 : -1
  const byUrgency = URGENCY[a.urgency].rank - URGENCY[b.urgency].rank
  if (byUrgency !== 0) return byUrgency
  const aDeadline = a.neededBy ? Date.parse(a.neededBy) : Number.POSITIVE_INFINITY
  const bDeadline = b.neededBy ? Date.parse(b.neededBy) : Number.POSITIVE_INFINITY
  if (aDeadline !== bDeadline) return aDeadline - bDeadline
  return Date.parse(b.createdAt) - Date.parse(a.createdAt)
}
