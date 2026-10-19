import { URGENCY } from '../data/categories'
import type { HelpRequest } from '../types'

/** Ordena por urgência (alta → baixa), depois prazo mais próximo, depois mais recente. */
export function compareByUrgency(a: HelpRequest, b: HelpRequest): number {
  const byUrgency = URGENCY[a.urgency].rank - URGENCY[b.urgency].rank
  if (byUrgency !== 0) return byUrgency
  const aDeadline = a.neededBy ? Date.parse(a.neededBy) : Number.POSITIVE_INFINITY
  const bDeadline = b.neededBy ? Date.parse(b.neededBy) : Number.POSITIVE_INFINITY
  if (aDeadline !== bDeadline) return aDeadline - bDeadline
  return Date.parse(b.createdAt) - Date.parse(a.createdAt)
}
