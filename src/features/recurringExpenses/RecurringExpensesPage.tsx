import { useEffect, useState, type FormEvent } from 'react'

import { categoriesApi, recurringExpensesApi } from '../../lib/api'
import { useCurrency } from '../../hooks/useCurrency'
import type { Category, RecurrenceFrequency, RecurringExpense } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { CategoryBadge } from '../../components/ui/CategoryBadge'
import { EditIcon, PlusIcon, RecurringIcon, TrashIcon } from '../../components/ui/icons'

const frequencies: RecurrenceFrequency[] = ['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY']

const emptyForm = {
  categoryId: '',
  amount: '',
  description: '',
  frequency: 'MONTHLY' as RecurrenceFrequency,
  startDate: new Date().toISOString().slice(0, 10),
  endDate: '',
}

export function RecurringExpensesPage() {
  const { format } = useCurrency()
  const [items, setItems] = useState<RecurringExpense[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    Promise.all([recurringExpensesApi.list(), categoriesApi.list()])
      .then(([i, c]) => {
        setItems(i)
        setCategories(c)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const categoryFor = (id: string) => categories.find((c) => c.id === id)
  const categoryName = (id: string) => categoryFor(id)?.name ?? 'Unknown'

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
  }

  function openEdit(item: RecurringExpense) {
    setEditingId(item.id)
    setForm({
      categoryId: item.categoryId,
      amount: item.amount,
      description: item.description ?? '',
      frequency: item.frequency,
      startDate: item.startDate.slice(0, 10),
      endDate: item.endDate ? item.endDate.slice(0, 10) : '',
    })
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (editingId) {
        await recurringExpensesApi.update(editingId, {
          categoryId: form.categoryId,
          amount: Number(form.amount),
          description: form.description || undefined,
          frequency: form.frequency,
          endDate: form.endDate ? new Date(form.endDate).toISOString() : null,
        })
      } else {
        await recurringExpensesApi.create({
          categoryId: form.categoryId,
          amount: Number(form.amount),
          description: form.description || undefined,
          frequency: form.frequency,
          startDate: new Date(form.startDate).toISOString(),
        })
      }
      setShowModal(false)
      load()
    } catch {
      setError('Could not save the recurring expense.')
    } finally {
      setSubmitting(false)
    }
  }

  async function toggleActive(item: RecurringExpense) {
    setActionError(null)
    try {
      await recurringExpensesApi.update(item.id, { isActive: !item.isActive })
      load()
    } catch {
      setActionError('Could not update that recurring expense. Please try again.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this recurring expense?')) return
    setActionError(null)
    try {
      await recurringExpensesApi.remove(id)
      load()
    } catch {
      setActionError('Could not delete that recurring expense. Please try again.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Recurring Expenses"
        description="Subscriptions and bills that repeat automatically."
        icon={<RecurringIcon width={20} height={20} />}
        action={
          <Button onClick={openCreate} className="flex items-center gap-1.5">
            <PlusIcon width={16} height={16} /> New recurring expense
          </Button>
        }
      />

      {actionError && <p className="mb-3 text-sm font-semibold text-accent-coral">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : items.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">No recurring expenses yet.</Card>
      ) : (
        <div className="flex flex-col gap-3">
          {items.map((item) => (
            <Card key={item.id} className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-3">
                {categoryFor(item.categoryId) && <CategoryBadge category={categoryFor(item.categoryId)!} />}
                <div className="min-w-0">
                  <p className="truncate font-semibold text-ink">{item.description || categoryName(item.categoryId)}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {categoryName(item.categoryId)} · {item.frequency.toLowerCase()} · {format(Number(item.amount))} ·
                    next {item.nextRunDate.slice(0, 10)}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleActive(item)}
                  className={`rounded-full px-3 py-1 text-xs font-bold ${
                    item.isActive ? 'bg-brand-from/10 text-brand-from' : 'bg-surface-alt text-ink-muted'
                  }`}
                >
                  {item.isActive ? 'Active' : 'Paused'}
                </button>
                <button
                  onClick={() => openEdit(item)}
                  title="Edit recurring expense"
                  aria-label="Edit recurring expense"
                  className="text-ink-muted hover:text-brand-from"
                >
                  <EditIcon width={16} height={16} />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  title="Delete recurring expense"
                  aria-label="Delete recurring expense"
                  className="text-ink-muted hover:text-accent-coral"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit recurring expense' : 'New recurring expense'} onClose={() => setShowModal(false)}>
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
              placeholder="15.99"
            />
            <Input
              label="Description (optional)"
              value={form.description}
              onChange={(e) => setForm((p) => ({ ...p, description: e.target.value }))}
              placeholder="Streaming subscription"
            />
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Frequency</label>
              <select
                value={form.frequency}
                onChange={(e) => setForm((p) => ({ ...p, frequency: e.target.value as RecurrenceFrequency }))}
                className="w-full rounded-xl border border-line bg-surface-alt px-3.5 py-2.5 text-[15px] text-ink"
              >
                {frequencies.map((f) => (
                  <option key={f} value={f}>
                    {f.charAt(0) + f.slice(1).toLowerCase()}
                  </option>
                ))}
              </select>
            </div>
            {editingId ? (
              <Input
                label="End date (optional)"
                type="date"
                value={form.endDate}
                onChange={(e) => setForm((p) => ({ ...p, endDate: e.target.value }))}
              />
            ) : (
              <Input
                label="Start date"
                type="date"
                required
                value={form.startDate}
                onChange={(e) => setForm((p) => ({ ...p, startDate: e.target.value }))}
              />
            )}
            {error && <p className="text-sm font-semibold text-accent-coral">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
