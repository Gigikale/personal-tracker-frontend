import { useEffect, useState } from 'react'

import { householdsApi } from '../../lib/api'
import { useCurrency } from '../../hooks/useCurrency'
import { getCurrentPeriod, periodLabel, type Period } from '../../lib/period'
import type { HouseholdBudgetYearSummary } from '../../types/api'
import { Card } from '../../components/ui/Card'
import { ChevronLeftIcon, ChevronRightIcon } from '../../components/ui/icons'

// The household's whole year: each month's shared budget, combined spend and what's left,
// plus totals for the months that have a budget. Picking a month opens it in the monthly view.
export function HouseholdYearOverview({
  householdId,
  period,
  onSelectMonth,
  refreshKey,
}: {
  householdId: string
  period: Period
  onSelectMonth: (period: Period) => void
  refreshKey?: unknown
}) {
  const { format } = useCurrency()
  const current = getCurrentPeriod()
  const [year, setYear] = useState(period.year)
  const [shownPeriodYear, setShownPeriodYear] = useState(period.year)
  const [data, setData] = useState<HouseholdBudgetYearSummary | null>(null)
  const [error, setError] = useState(false)

  // Follow the monthly view into another year (e.g. paging back from January).
  if (period.year !== shownPeriodYear) {
    setShownPeriodYear(period.year)
    setYear(period.year)
  }

  useEffect(() => {
    let cancelled = false
    householdsApi
      .yearSummary(householdId, year)
      .then((d) => {
        if (cancelled) return
        setData(d)
        setError(false)
      })
      .catch(() => !cancelled && setError(true))
    return () => {
      cancelled = true
    }
  }, [householdId, year, refreshKey])

  const remainingText = (remaining: number) =>
    remaining < 0 ? `${format(-remaining)} over` : `${format(remaining)} left`

  return (
    <Card className="mt-5">
      <div className="mb-4 flex items-center justify-between gap-3">
        <h3 className="font-display text-base font-bold text-ink">Year overview</h3>
        <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-alt px-1.5 py-1.5">
          <button
            onClick={() => setYear((y) => y - 1)}
            aria-label="Previous year"
            title="Previous year"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-line hover:text-ink"
          >
            <ChevronLeftIcon width={16} height={16} />
          </button>
          <span className="min-w-[3.5rem] text-center text-sm font-semibold text-ink">{year}</span>
          <button
            onClick={() => setYear((y) => y + 1)}
            disabled={year >= current.year}
            aria-label="Next year"
            title="Next year"
            className="rounded-lg p-1.5 text-ink-muted hover:bg-line hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
          >
            <ChevronRightIcon width={16} height={16} />
          </button>
        </div>
      </div>

      {error ? (
        <p className="text-sm font-semibold text-accent-coral">Could not load the year overview.</p>
      ) : !data || data.year !== year ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : (
        <>
          <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
            <div className="rounded-xl bg-surface-alt px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Budgeted</p>
              <p className="font-bold text-ink">{format(data.totals.budgetAmount)}</p>
              <p className="text-xs text-ink-muted">
                {data.totals.budgetedMonths} of 12 months
              </p>
            </div>
            <div className="rounded-xl bg-surface-alt px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Spent</p>
              <p className="font-bold text-ink">{format(data.totals.spentInBudgetedMonths)}</p>
              <p className="text-xs text-ink-muted">{format(data.totals.totalSpent)} across the whole year</p>
            </div>
            <div className="rounded-xl bg-surface-alt px-3 py-2.5">
              <p className="text-xs font-bold uppercase tracking-wide text-ink-muted">Remaining</p>
              <p className={`font-bold ${data.totals.remaining < 0 ? 'text-accent-coral' : 'text-ink'}`}>
                {data.totals.budgetedMonths ? remainingText(data.totals.remaining) : '—'}
              </p>
              <p className="text-xs text-ink-muted">
                {data.totals.percentUsed !== null ? `${data.totals.percentUsed}% of budget used` : 'No budgets this year'}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full whitespace-nowrap text-xs sm:text-sm">
              <thead>
                <tr className="text-left text-xs font-bold uppercase tracking-wide text-ink-muted">
                  <th className="py-1.5 pr-3">Month</th>
                  <th className="py-1.5 pr-3 text-right">Budget</th>
                  <th className="py-1.5 pr-3 text-right">Spent</th>
                  <th className="py-1.5 text-right">Remaining</th>
                </tr>
              </thead>
              <tbody>
                {data.months.map((m) => {
                  const p = { month: m.month, year }
                  const future = year > current.year || (year === current.year && m.month > current.month)
                  const selected = period.year === year && period.month === m.month
                  return (
                    <tr
                      key={m.month}
                      onClick={() => !future && onSelectMonth(p)}
                      className={`border-t border-line ${future ? 'text-ink-muted/60' : 'cursor-pointer hover:bg-surface-alt'} ${selected ? 'bg-surface-alt font-semibold' : ''}`}
                    >
                      <td className="py-2 pr-3 text-ink">{periodLabel(p, 'short')}</td>
                      <td className="py-2 pr-3 text-right text-ink">
                        {m.budgetAmount !== null ? format(m.budgetAmount) : '—'}
                      </td>
                      <td className="py-2 pr-3 text-right text-ink">{format(m.actualSpent)}</td>
                      <td
                        className={`py-2 text-right ${m.remaining !== null && m.remaining < 0 ? 'font-semibold text-accent-coral' : 'text-ink'}`}
                      >
                        {m.remaining !== null ? remainingText(m.remaining) : '—'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          {data.hasMixedCurrencies && (
            <p className="mt-3 text-xs font-semibold text-accent-amber">
              Members use different currencies, so these totals are approximate.
            </p>
          )}
        </>
      )}
    </Card>
  )
}
