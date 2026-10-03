export interface Period {
  month: number
  year: number
}

export function getCurrentPeriod(): Period {
  const now = new Date()
  return { month: now.getUTCMonth() + 1, year: now.getUTCFullYear() }
}

export function addMonths(period: Period, delta: number): Period {
  const d = new Date(Date.UTC(period.year, period.month - 1 + delta, 1))
  return { month: d.getUTCMonth() + 1, year: d.getUTCFullYear() }
}

export function periodLabel(period: Period, style: 'long' | 'short' = 'long'): string {
  return new Date(Date.UTC(period.year, period.month - 1, 1)).toLocaleString('en-US', {
    month: style,
    ...(style === 'long' ? { year: 'numeric' as const } : {}),
  })
}

// Inclusive of the whole last day, so an expense logged at any time that day is still
// included by the backend's inclusive `to` (lte) filter.
export function periodBounds(period: Period): { start: Date; end: Date } {
  const start = new Date(Date.UTC(period.year, period.month - 1, 1))
  const end = new Date(Date.UTC(period.year, period.month, 0, 23, 59, 59, 999))
  return { start, end }
}

export function samePeriod(a: Period, b: Period): boolean {
  return a.month === b.month && a.year === b.year
}
