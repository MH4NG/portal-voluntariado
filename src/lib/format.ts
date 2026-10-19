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

/** Data do calendário (AAAA-MM-DD) no fuso da cidade, para comparar dias e não instantes. */
const dayKeyFmt = new Intl.DateTimeFormat('en-CA', {
  timeZone: 'America/Sao_Paulo',
  year: 'numeric',
  month: '2-digit',
  day: '2-digit',
})

/** Diferença em dias de calendário (fuso America/Sao_Paulo) entre `date` e `now`. */
function calendarDayDiff(date: Date, now: Date): number {
  return Math.round((Date.parse(dayKeyFmt.format(date)) - Date.parse(dayKeyFmt.format(now))) / 86_400_000)
}

/** "há 3 horas", "ontem", "há 3 dias"… */
export function formatRelative(iso: string, now: Date = new Date()): string {
  const date = new Date(iso)
  const diffMs = date.getTime() - now.getTime()
  const hours = Math.round(diffMs / 3_600_000)
  if (Math.abs(hours) < 24) return hours === 0 ? 'agora' : relativeFmt.format(hours, 'hour')
  const days = calendarDayDiff(date, now)
  if (Math.abs(days) < 30) return relativeFmt.format(days, 'day')
  return relativeFmt.format(Math.round(days / 30), 'month')
}

/** O prazo já passou? */
export function isExpired(iso: string, now: Date = new Date()): boolean {
  return new Date(iso).getTime() < now.getTime()
}

/**
 * Dias de calendário restantes até a data (0 = termina hoje; negativo se já passou,
 * inclusive quando o horário do prazo já passou no próprio dia).
 */
export function daysUntil(iso: string, now: Date = new Date()): number {
  const diff = calendarDayDiff(new Date(iso), now)
  return isExpired(iso, now) ? Math.min(diff, -1) : diff
}
