import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import { budgetsApi, categoriesApi, expensesApi } from '../../lib/api'
import { useCurrency } from '../../hooks/useCurrency'
import type { BudgetSummary, Category, Expense } from '../../types/api'
import { Card } from '../../components/ui/Card'
import { PageHeader } from '../../components/ui/PageHeader'

function barColor(percentUsed: number | null) {
  if (percentUsed === null) return 'bg-ink-muted/40'
  if (percentUsed >= 100) return 'bg-accent-coral'
  if (percentUsed >= 80) return 'bg-accent-amber'
  return 'bg-brand-from'
}

export function DashboardPage() {
  const { format } = useCurrency()
  const [summary, setSummary] = useState<BudgetSummary | null>(null)
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    Promise.all([budgetsApi.summary(), expensesApi.list(), categoriesApi.list()])
      .then(([s, e, c]) => {
        setSummary(s)
        setExpenses(e.slice(0, 6))
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

  return (
    <div>
      <PageHeader title="Dashboard" description={monthLabel} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <h3 className="mb-4 font-display text-base font-bold text-ink">Budget vs. actual</h3>

          {summary?.overall.budgetAmount !== null && (
            <div className="mb-5">
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink">Overall</span>
                <span className="text-sm text-ink-muted">
                  {format(summary!.overall.actualSpent)} / {format(summary!.overall.budgetAmount!)}
                </span>
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
                  <div className="mb-1.5 flex items-baseline justify-between">
                    <span className="text-sm font-semibold text-ink">{c.categoryName}</span>
                    <span className="text-sm text-ink-muted">
                      {format(c.actualSpent)} {c.budgetAmount !== null && `/ ${format(c.budgetAmount)}`}
                    </span>
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
    </div>
  )
}
