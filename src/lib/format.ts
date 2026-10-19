const dateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'long', year: 'numeric' })
const shortDateFmt = new Intl.DateTimeFormat('pt-BR', { day: '2-digit', month: 'short' })
const numberFmt = new Intl.NumberFormat('pt-BR')
const relativeFmt = new Intl.RelativeTimeFormat('pt-BR', { numeric: 'auto' })

export function formatDate(iso: string): string {
  return dateFmt.format(new Date(iso))
}

export function formatShortDate(iso: string): string {
  return shortDateFmt.format(new Date(iso))
}

export function formatNumber(n: number): string {
  return numberFmt.format(Math.round(n))
}

/** "há 3 dias", "ontem", "hoje"… */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const diffMs = new Date(iso).getTime() - now.getTime()
  const days = Math.round(diffMs / 86_400_000)
  if (Math.abs(days) < 1) {
    const hours = Math.round(diffMs / 3_600_000)
    return hours === 0 ? 'agora' : relativeFmt.format(hours, 'hour')
  }
  if (Math.abs(days) < 30) return relativeFmt.format(days, 'day')
  return relativeFmt.format(Math.round(days / 30), 'month')
}

/** Dias restantes até a data (negativo se já passou). */
export function daysUntil(iso: string, now: Date = new Date()): number {
  return Math.ceil((new Date(iso).getTime() - now.getTime()) / 86_400_000)
}
