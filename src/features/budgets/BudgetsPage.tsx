import { useEffect, useState, type FormEvent } from 'react'

import { budgetsApi, categoriesApi } from '../../lib/api'
import { useCurrency } from '../../hooks/useCurrency'
import type { Budget, Category } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { CategoryBadge } from '../../components/ui/CategoryBadge'
import { BudgetIcon, EditIcon, PlusIcon, TrashIcon } from '../../components/ui/icons'

const now = new Date()
const emptyForm = { categoryId: '', amount: '', month: now.getUTCMonth() + 1, year: now.getUTCFullYear() }

export function BudgetsPage() {
  const { format } = useCurrency()
  const [budgets, setBudgets] = useState<Budget[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    Promise.all([budgetsApi.list(), categoriesApi.list()])
      .then(([b, c]) => {
        setBudgets(b)
        setCategories(c)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  const categoryFor = (id: string | null) => (id ? categories.find((c) => c.id === id) : undefined)
  const categoryName = (id: string | null) => (id ? categoryFor(id)?.name ?? 'Unknown' : 'Overall')

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
  }

  function openEdit(budget: Budget) {
    setEditingId(budget.id)
    setForm({ categoryId: budget.categoryId ?? '', amount: budget.amount, month: budget.month, year: budget.year })
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (editingId) {
        await budgetsApi.update(editingId, { amount: Number(form.amount) })
      } else {
        await budgetsApi.create({
          categoryId: form.categoryId || null,
          amount: Number(form.amount),
          month: form.month,
          year: form.year,
        })
      }
      setShowModal(false)
      load()
    } catch {
      setError(editingId ? 'Could not save changes.' : 'A budget for this category and period may already exist.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this budget?')) return
    await budgetsApi.remove(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Budgets"
        description="Set monthly limits, overall or per category."
        icon={<BudgetIcon width={20} height={20} />}
        action={
          <Button onClick={openCreate} className="flex items-center gap-1.5">
            <PlusIcon width={16} height={16} /> New budget
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : budgets.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">No budgets yet — create your first one.</Card>
      ) : (
        <Card className="overflow-x-auto p-0">
          <table className="w-full min-w-[480px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs font-bold uppercase tracking-wide text-ink-muted">
                <th className="px-4 py-3">Category</th>
                <th className="px-4 py-3">Period</th>
                <th className="px-4 py-3 text-right">Amount</th>
                <th className="px-4 py-3" />
              </tr>
            </thead>
            <tbody>
              {budgets.map((b) => (
                <tr key={b.id} className="border-b border-line last:border-0">
                  <td className="px-4 py-3 font-semibold text-ink">
                    <div className="flex items-center gap-2">
                      {categoryFor(b.categoryId) && <CategoryBadge category={categoryFor(b.categoryId)!} size={24} />}
                      {categoryName(b.categoryId)}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-ink-muted">
                    {b.month}/{b.year}
                  </td>
                  <td className="px-4 py-3 text-right font-bold text-ink">{format(Number(b.amount))}</td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <button
                        onClick={() => openEdit(b)}
                        title="Edit budget"
                        aria-label="Edit budget"
                        className="text-ink-muted hover:text-brand-from"
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        onClick={() => handleDelete(b.id)}
                        title="Delete budget"
                        aria-label="Delete budget"
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

      {showModal && (
        <Modal title={editingId ? 'Edit budget' : 'New budget'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Category</label>
              <select
                value={form.categoryId}
                disabled={!!editingId}
                onChange={(e) => setForm((p) => ({ ...p, categoryId: e.target.value }))}
                className="w-full rounded-xl border border-line bg-surface-alt px-3.5 py-2.5 text-[15px] text-ink disabled:opacity-60"
              >
                <option value="">Overall (no category)</option>
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
              autoFocus={!!editingId}
              value={form.amount}
              onChange={(e) => setForm((p) => ({ ...p, amount: e.target.value }))}
              placeholder="500.00"
            />
            <div className="grid grid-cols-2 gap-3.5">
              <Input
                label="Month"
                type="number"
                min="1"
                max="12"
                required
                disabled={!!editingId}
                value={form.month}
                onChange={(e) => setForm((p) => ({ ...p, month: Number(e.target.value) }))}
              />
              <Input
                label="Year"
                type="number"
                required
                disabled={!!editingId}
                value={form.year}
                onChange={(e) => setForm((p) => ({ ...p, year: Number(e.target.value) }))}
              />
            </div>
            {editingId && <p className="-mt-2 text-xs text-ink-muted">Category and period can't be changed — delete and recreate the budget instead.</p>}
            {error && <p className="text-sm font-semibold text-accent-coral">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create budget'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
