import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { budgetsApi, categoriesApi, expensesApi } from '../../lib/api'
import { useCurrency } from '../../hooks/useCurrency'
import type { BudgetSummary, Category, Expense } from '../../types/api'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'
import { DashboardIcon } from '../../components/ui/icons'

function barColor(percentUsed: number | null) {
  if (percentUsed === null) return 'bg-ink-muted/40'
  if (percentUsed >= 100) return 'bg-accent-coral'
  if (percentUsed >= 80) return 'bg-accent-amber'
  return 'bg-brand-from'
}

function budgetStatus(percentUsed: number | null) {
  if (percentUsed === null) return { label: 'No budget set', className: 'bg-surface-alt text-ink-muted' }
  if (percentUsed >= 100) return { label: 'Over budget', className: 'bg-accent-coral/15 text-accent-coral' }
  if (percentUsed >= 80) return { label: 'Approaching limit', className: 'bg-accent-amber/15 text-accent-amber-hover' }
  return { label: 'On track', className: 'bg-brand-from/10 text-brand-from' }
}

function StatusBadge({ percentUsed }: { percentUsed: number | null }) {
  const status = budgetStatus(percentUsed)
  return (
    <span className={`whitespace-nowrap rounded-full px-2.5 py-1 text-xs font-bold ${status.className}`}>
      {status.label}
    </span>
  )
}

export function DashboardPage() {
  const { format } = useCurrency()
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([budgetsApi.summary(), expensesApi.list({ limit: 6 }), categoriesApi.list()])
      .then(([s, e, c]) => {
        setSummary(s)
        setExpenses(e.data)
        setCategories(c)
      })
      .finally(() => setLoading(false))
  }, [])

  const categoryName = (id: string) => categories.find((c) => c.id === id)?.name ?? 'Unknown'
  const monthLabel = summary
    ? new Date(Date.UTC(summary.year, summary.month - 1, 1)).toLocaleString('en-US', {
        month: 'long',
        year: 'numeric',
      })
    : ''

  if (loading) return <p className="text-sm text-ink-muted">Loading…</p>

  const overall = summary?.overall
  const hasOverallBudget = overall?.budgetAmount !== null && overall?.budgetAmount !== undefined

  // When there's no explicit "Overall" budget, fall back to aggregating the per-category
  // budgets so the summary cards still mean something instead of showing "No budget set".
  const budgetedCategories = summary?.categories.filter((c) => c.budgetAmount !== null) ?? []
  const fallbackBudgetTotal = budgetedCategories.length
    ? budgetedCategories.reduce((sum, c) => sum + (c.budgetAmount ?? 0), 0)
    : null
  const fallbackSpentInBudgeted = budgetedCategories.reduce((sum, c) => sum + c.actualSpent, 0)
  const worstCategoryPercent = budgetedCategories.length
    ? Math.max(...budgetedCategories.map((c) => c.percentUsed ?? 0))
    : null

  const effectiveBudgetAmount = hasOverallBudget ? overall!.budgetAmount : fallbackBudgetTotal
  const effectiveRemaining = hasOverallBudget
    ? overall!.remaining
    : fallbackBudgetTotal !== null
      ? fallbackBudgetTotal - fallbackSpentInBudgeted
      : null
  const effectivePercentUsed = hasOverallBudget ? overall!.percentUsed : worstCategoryPercent

  // Categories already come back sorted by actual spend (highest first) from the API.
  const topSpending = (summary?.categories ?? []).filter((c) => c.actualSpent > 0).slice(0, 6)
  const maxSpent = topSpending.length ? Math.max(...topSpending.map((c) => c.actualSpent)) : 0

  return (
    <div>
      <PageHeader title="Dashboard" description={monthLabel} icon={<DashboardIcon width={20} height={20} />} />

      <div className="mb-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
        <Card>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-muted">Total spent</p>
          <p className="font-display text-2xl font-bold text-ink">{format(overall?.actualSpent ?? 0)}</p>
        </Card>
        <Card>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-muted">Total budget</p>
          <p className="font-display text-2xl font-bold text-ink">
            {effectiveBudgetAmount !== null ? format(effectiveBudgetAmount) : '—'}
          </p>
        </Card>
        <Card>
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-muted">Remaining</p>
          <p
            className={`font-display text-2xl font-bold ${
              effectiveRemaining !== null && effectiveRemaining < 0 ? 'text-accent-coral' : 'text-ink'
            }`}
          >
            {effectiveRemaining !== null ? format(effectiveRemaining) : '—'}
          </p>
        </Card>
        <Card className="flex flex-col justify-between">
          <p className="mb-1 text-xs font-bold uppercase tracking-wide text-ink-muted">Status</p>
          <StatusBadge percentUsed={effectivePercentUsed} />
        </Card>
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Budget vs. actual</h3>

          {summary?.overall.budgetAmount !== null && (
            <div className="mb-5">
              <div className="mb-1.5 flex items-baseline justify-between gap-2">
                <span className="text-sm font-semibold text-ink">Overall</span>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-ink-muted">
                    {format(summary!.overall.actualSpent)} / {format(summary!.overall.budgetAmount!)}
                  </span>
                  {(summary!.overall.percentUsed ?? 0) >= 80 && <StatusBadge percentUsed={summary!.overall.percentUsed} />}
                </div>
              </div>
              <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className={`h-full rounded-full ${barColor(summary!.overall.percentUsed)}`}
                  style={{ width: `${Math.min(summary!.overall.percentUsed ?? 0, 100)}%` }}
                />
              </div>
            </div>
          )}

          {summary && summary.categories.length === 0 ? (
            <p className="text-sm text-ink-muted">
              No budgets set for this month yet.{' '}
              <Link to="/budgets" className="font-bold text-brand-from">
                Create one
              </Link>
              .
            </p>
          ) : (
            <div className="flex flex-col gap-4">
              {summary?.categories.map((c) => (
                <div key={c.categoryId}>
                  <div className="mb-1.5 flex items-baseline justify-between gap-2">
                    <span className="text-sm font-semibold text-ink">{c.categoryName}</span>
                    <div className="flex items-center gap-2">
                      <span className="text-sm text-ink-muted">
                        {format(c.actualSpent)} {c.budgetAmount !== null && `/ ${format(c.budgetAmount)}`}
                      </span>
                      {(c.percentUsed ?? 0) >= 80 && <StatusBadge percentUsed={c.percentUsed} />}
                    </div>
                  </div>
                  {c.budgetAmount !== null && (
                    <div className="h-2.5 overflow-hidden rounded-full bg-surface-alt">
                      <div
                        className={`h-full rounded-full ${barColor(c.percentUsed)}`}
                        style={{ width: `${Math.min(c.percentUsed ?? 0, 100)}%` }}
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </Card>

        <Card>
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink">Recent expenses</h3>
            <Link to="/expenses" className="text-xs font-bold text-brand-from">
              View all
            </Link>
          </div>
          {expenses.length === 0 ? (
            <p className="text-sm text-ink-muted">No expenses logged yet.</p>
          ) : (
            <ul className="flex flex-col gap-3">
              {expenses.map((e) => (
                <li key={e.id} className="flex items-center justify-between text-sm">
                  <div className="min-w-0">
                    <p className="truncate font-semibold text-ink">{e.description || categoryName(e.categoryId)}</p>
                    <p className="text-xs text-ink-muted">{categoryName(e.categoryId)}</p>
                  </div>
                  <span className="flex-shrink-0 font-bold text-ink">{format(Number(e.amount))}</span>
                </li>
              ))}
            </ul>
          )}
        </Card>
      </div>

      {topSpending.length > 0 && (
        <Card className="mt-5">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Top spending categories</h3>
          <div className="flex flex-col gap-3">
            {topSpending.map((c) => (
              <div key={c.categoryId} className="flex items-center gap-3">
                <span className="w-28 flex-shrink-0 truncate text-sm font-semibold text-ink">{c.categoryName}</span>
                <div className="h-2.5 flex-1 overflow-hidden rounded-full bg-surface-alt">
                  <div
                    className="h-full rounded-full bg-brand-from"
                    style={{ width: `${maxSpent > 0 ? (c.actualSpent / maxSpent) * 100 : 0}%` }}
                  />
                </div>
                <span className="w-20 flex-shrink-0 text-right text-sm font-bold text-ink">{format(c.actualSpent)}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  )
}
