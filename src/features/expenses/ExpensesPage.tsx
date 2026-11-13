import { useEffect, useState, type FormEvent } from 'react'

import { apiClient } from '../../lib/apiClient'
import { categoriesApi, expensesApi } from '../../lib/api'
import { useCurrency } from '../../hooks/useCurrency'
import { getCurrentPeriod, periodBounds, periodLabel, samePeriod, type Period } from '../../lib/period'
import type { Category, Expense } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { MonthSwitcher } from '../../components/ui/MonthSwitcher'
import { CategoryBadge } from '../../components/ui/CategoryBadge'
import { DownloadIcon, EditIcon, ExpenseIcon, PlusIcon, TrashIcon } from '../../components/ui/icons'

function emptyForm() {
  return { categoryId: '', amount: '', description: '', date: new Date().toISOString().slice(0, 10) }
}

function initialRange() {
  const { start, end } = periodBounds(getCurrentPeriod())
  return { from: start.toISOString().slice(0, 10), to: end.toISOString().slice(0, 10) }
}

// 'custom' is any range typed into the date boxes.
type RangeMode = 'month' | 'year' | 'all' | 'custom'

const RANGE_OPTIONS: { mode: Exclude<RangeMode, 'custom'>; label: string }[] = [
  { mode: 'month', label: 'Month' },
  { mode: 'year', label: 'This year' },
  { mode: 'all', label: 'All time' },
]

const PAGE_SIZE = 25

export function ExpensesPage() {
  const { format } = useCurrency()
  const [expenses, setExpenses] = useState<Expense[]>([])
  const [total, setTotal] = useState(0)
  const [totalAmount, setTotalAmount] = useState<number | null>(null)
  const [page, setPage] = useState(1)
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [categoryFilter, setCategoryFilter] = useState('')
  const [period, setPeriod] = useState<Period>(getCurrentPeriod)
  const [rangeMode, setRangeMode] = useState<RangeMode>('month')
  const [fromDate, setFromDate] = useState(() => initialRange().from)
  const [toDate, setToDate] = useState(() => initialRange().to)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  // The "to" date is inclusive of the whole day — the backend's `lte` filter compares full
  // timestamps, so a bare UTC-midnight value would exclude anything logged later that day.
  function toDateRangeParams() {
    return {
      ...(fromDate ? { from: new Date(`${fromDate}T00:00:00.000Z`).toISOString() } : {}),
      ...(toDate ? { to: new Date(`${toDate}T23:59:59.999Z`).toISOString() } : {}),
    }
  }

  function load() {
    setLoading(true)
    Promise.all([
      expensesApi.list({
        ...(categoryFilter ? { categoryId: categoryFilter } : {}),
        ...toDateRangeParams(),
        page,
        limit: PAGE_SIZE,
      }),
      categoriesApi.list(),
    ])
      .then(([e, c]) => {
        setExpenses(e.data)
        setTotal(e.total)
        setTotalAmount(e.totalAmount)
        setCategories(c)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [categoryFilter, fromDate, toDate, page])

  function handleCategoryFilterChange(value: string) {
    setCategoryFilter(value)
    setPage(1)
  }

  function handleDateFilterChange(field: 'from' | 'to', value: string) {
    if (field === 'from') setFromDate(value)
    else setToDate(value)
    setRangeMode('custom')
    setPage(1)
  }

  function handlePeriodChange(next: Period) {
    setPeriod(next)
    setRangeMode('month')
    const { start, end } = periodBounds(next)
    setFromDate(start.toISOString().slice(0, 10))
    setToDate(end.toISOString().slice(0, 10))
    setPage(1)
  }

  function handleRangeModeChange(mode: Exclude<RangeMode, 'custom'>) {
    if (mode === 'month') return handlePeriodChange(period)
    setRangeMode(mode)
    if (mode === 'year') {
      const year = getCurrentPeriod().year
      setFromDate(`${year}-01-01`)
      setToDate(`${year}-12-31`)
    } else {
      setFromDate('')
      setToDate('')
    }
    setPage(1)
  }

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))
  const rangeStart = total === 0 ? 0 : (page - 1) * PAGE_SIZE + 1
  const rangeEnd = Math.min(page * PAGE_SIZE, total)

  const categoryFor = (id: string) => categories.find((c) => c.id === id)
  const categoryName = (id: string) => categoryFor(id)?.name ?? 'Unknown'
  const isCurrentPeriod = samePeriod(period, getCurrentPeriod())

  const rangeLabel =
    rangeMode === 'month'
      ? periodLabel(period)
      : rangeMode === 'year'
        ? `${getCurrentPeriod().year} so far`
        : rangeMode === 'all'
          ? 'all time'
          : `${fromDate || 'the start'} to ${toDate || 'today'}`
  const emptyStateMessage = categoryFilter
    ? 'No expenses match these filters.'
    : rangeMode === 'all'
      ? 'No expenses yet — add your first one.'
      : rangeMode === 'custom'
        ? 'No expenses match these filters.'
        : `No expenses logged for ${rangeLabel}.`

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm())
    setError(null)
    setShowModal(true)
  }

  function openEdit(expense: Expense) {
    setEditingId(expense.id)
    setForm({
      categoryId: expense.categoryId,
      amount: expense.amount,
      description: expense.description ?? '',
      date: expense.date.slice(0, 10),
    })
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = {
        categoryId: form.categoryId,
        amount: Number(form.amount),
        description: form.description || undefined,
        date: new Date(form.date).toISOString(),
      }
      if (editingId) {
        await expensesApi.update(editingId, payload)
      } else {
        await expensesApi.create(payload)
      }
      setForm(emptyForm())
      setShowModal(false)
      load()
    } catch {
      setError('Could not save expense. Check the fields and try again.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this expense?')) return
    setActionError(null)
    try {
      await expensesApi.remove(id)
      load()
    } catch {
      setActionError('Could not delete that expense. Please try again.')
    }
  }

  async function handleExport(format: 'csv' | 'pdf') {
    const res = await apiClient.get('/expenses/export', {
      params: { format, ...(categoryFilter ? { categoryId: categoryFilter } : {}), ...toDateRangeParams() },
      responseType: 'blob',
    })
    const url = URL.createObjectURL(res.data)
    const a = document.createElement('a')
    a.href = url
    a.download = `expenses.${format}`
    a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <PageHeader
        title="Expenses"
        description="Everything you've logged, newest first."
        icon={<ExpenseIcon width={20} height={20} />}
        action={
          <div className="flex flex-wrap gap-2">
            <Button variant="secondary" onClick={() => handleExport('csv')} className="flex items-center gap-1.5">
              <DownloadIcon width={16} height={16} /> CSV
            </Button>
            <Button variant="secondary" onClick={() => handleExport('pdf')} className="flex items-center gap-1.5">
              <DownloadIcon width={16} height={16} /> PDF
            </Button>
            <Button onClick={openCreate} className="flex items-center gap-1.5">
              <PlusIcon width={16} height={16} /> Add expense
            </Button>
          </div>
        }
      />

      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Date range" className="flex rounded-xl border border-line bg-surface-alt p-1">
          {RANGE_OPTIONS.map((o) => (
            <button
              key={o.mode}
              onClick={() => handleRangeModeChange(o.mode)}
              aria-pressed={rangeMode === o.mode}
              className={`rounded-lg px-3 py-1.5 text-sm font-semibold ${rangeMode === o.mode ? 'bg-surface text-ink shadow-sm' : 'text-ink-muted hover:text-ink'}`}
            >
              {o.label}
            </button>
          ))}
        </div>
        {rangeMode === 'month' && (
          <MonthSwitcher period={period} onChange={handlePeriodChange} disableNext={isCurrentPeriod} />
        )}
        <select
          value={categoryFilter}
          onChange={(e) => handleCategoryFilterChange(e.target.value)}
          className="rounded-xl border border-line bg-surface-alt px-3 py-2 text-sm font-semibold text-ink"
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
        <input
          type="date"
          aria-label="From date"
          value={fromDate}
          max={toDate || undefined}
          onChange={(e) => handleDateFilterChange('from', e.target.value)}
          className="rounded-xl border border-line bg-surface-alt px-3 py-2 text-sm font-semibold text-ink"
        />
        <span className="text-sm text-ink-muted">to</span>
        <input
          type="date"
          aria-label="To date"
          value={toDate}
          min={fromDate || undefined}
          onChange={(e) => handleDateFilterChange('to', e.target.value)}
          className="rounded-xl border border-line bg-surface-alt px-3 py-2 text-sm font-semibold text-ink"
        />
      </div>

      {actionError && <p className="mb-3 text-sm font-semibold text-accent-coral">{actionError}</p>}

      {!loading && total > 0 && (
        <p className="mb-3 text-sm text-ink-muted">
          {total} {total === 1 ? 'expense' : 'expenses'}
          {categoryFilter && <> in <span className="font-semibold text-ink">{categoryName(categoryFilter)}</span></>}
          {' '}· {rangeLabel}
          {totalAmount !== null && (
            <>
              {' '}· <span className="font-bold text-ink">{format(totalAmount)}</span> total
            </>
          )}
        </p>
      )}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : expenses.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">{emptyStateMessage}</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3">Date</th>
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Description</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {expenses.map((expense) => (
                <tr key={expense.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 text-ink-muted">{expense.date.slice(0, 10)}</td>
                  <td className="px-4 py-3 font-semibold text-ink">
                    <div className="flex items-center gap-2">
                      {categoryFor(expense.categoryId) && (
                        <CategoryBadge category={categoryFor(expense.categoryId)!} size={24} />
                      )}
                      {categoryName(expense.categoryId)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">{expense.description ?? '—'}</td>
                  <td className="px-4 py-3 text-right font-bold text-ink">{format(Number(expense.amount))}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(expense)}
                        title="Edit expense"
                        aria-label="Edit expense"
                        className="text-ink-muted hover:text-brand-from"
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(expense.id)}
                        title="Delete expense"
                        aria-label="Delete expense"
                        className="text-ink-muted hover:text-accent-coral"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      )}

      {!loading && total > PAGE_SIZE && (
        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 text-sm text-ink-muted">
          <span>
            Showing {rangeStart}–{rangeEnd} of {total}
          </span>
          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="!px-3 !py-1.5 text-xs"
              disabled={page <= 1}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
            >
              Previous
            </Button>
            <span className="text-xs font-semibold text-ink">
              Page {page} of {totalPages}
            </span>
            <Button
              variant="secondary"
              className="!px-3 !py-1.5 text-xs"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            >
              Next
            </Button>
          </div>
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit expense' : 'Add expense'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Category</label>
              <select
                required
                value={form.categoryId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full rounded-xl border border-line bg-surface-alt px-3.5 py-2.5 text-[15px] text-ink"
              >
                <option value="" disabled>
                  Select a category
                </option>
                {categories.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div>
            <Input
              label="Amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="0.00"
            />
            <Input
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Weekly shop"
            />
            <Input
              label="Date"
              type="date"
              required
              value={form.date}
              onChange={(e) => setForm((p) => ({ ...p, date: e.target.value }))}
            />
            {error && <p className="text-sm font-semibold text-accent-coral">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Add expense'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
