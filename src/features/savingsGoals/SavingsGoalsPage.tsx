import { useEffect, useState, type FormEvent } from 'react'

import { savingsGoalsApi } from '../../lib/api'
import { useCurrency } from '../../hooks/useCurrency'
import type { SavingsGoal } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { EditIcon, PlusIcon, SavingsIcon, TrashIcon } from '../../components/ui/icons'

const emptyForm = { name: '', targetAmount: '', targetDate: '' }

export function SavingsGoalsPage() {
  const { format } = useCurrency()
  const [goals, setGoals] = useState<SavingsGoal[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState(emptyForm)
  const [contributions, setContributions] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    savingsGoalsApi
      .list()
      .then(setGoals)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setForm(emptyForm)
    setError(null)
    setShowModal(true)
  }

  function openEdit(goal: SavingsGoal) {
    setEditingId(goal.id)
    setForm({
      name: goal.name,
      targetAmount: goal.targetAmount,
      targetDate: goal.targetDate ? goal.targetDate.slice(0, 10) : '',
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
        await savingsGoalsApi.update(editingId, {
          name: form.name,
          targetAmount: Number(form.targetAmount),
          targetDate: form.targetDate ? new Date(form.targetDate).toISOString() : null,
        })
      } else {
        await savingsGoalsApi.create({ name: form.name, targetAmount: Number(form.targetAmount) })
      }
      setForm(emptyForm)
      setShowModal(false)
      load()
    } catch {
      setError('Could not save the savings goal.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleContribute(id: string) {
    const amount = Number(contributions[id])
    if (!amount) return
    try {
      await savingsGoalsApi.contribute(id, amount)
      setContributions((p) => ({ ...p, [id]: '' }))
      load()
    } catch {
      alert('That would take the balance below 0.')
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this savings goal?')) return
    await savingsGoalsApi.remove(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Savings Goals"
        description="Set a target and chip away at it."
        icon={<SavingsIcon width={20} height={20} />}
        action={
          <Button onClick={openCreate} className="flex items-center gap-1.5">
            <PlusIcon width={16} height={16} /> New goal
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : goals.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">No savings goals yet — create your first one.</Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {goals.map((g) => {
            const current = Number(g.currentAmount)
            const target = Number(g.targetAmount)
            const pct = target > 0 ? Math.min((current / target) * 100, 100) : 0
            return (
              <Card key={g.id}>
                <div className="mb-2 flex items-start justify-between">
                  <h3 className="font-semibold text-ink">{g.name}</h3>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => openEdit(g)}
                      title="Edit savings goal"
                      aria-label="Edit savings goal"
                      className="text-ink-muted hover:text-brand-from"
                    >
                      <EditIcon width={16} height={16} />
                    </button>
                    <button
                      onClick={() => handleDelete(g.id)}
                      title="Delete savings goal"
                      aria-label="Delete savings goal"
                      className="text-ink-muted hover:text-accent-coral"
                    >
                      <TrashIcon width={16} height={16} />
                    </button>
                  </div>
                </div>
                <p className="mb-2 text-sm text-ink-muted">
                  {format(current)} <span className="text-ink-muted/70">of {format(target)}</span>
                </p>
                <div className="mb-3 h-2 overflow-hidden rounded-full bg-surface-alt">
                  <div className="h-full rounded-full bg-brand-from" style={{ width: `${pct}%` }} />
                </div>
                <div className="flex gap-2">
                  <input
                    type="number"
                    placeholder="Amount"
                    value={contributions[g.id] ?? ''}
                    onChange={(e) => setContributions((p) => ({ ...p, [g.id]: e.target.value }))}
                    className="w-full rounded-lg border border-line bg-surface-alt px-3 py-1.5 text-sm text-ink"
                  />
                  <Button variant="secondary" onClick={() => handleContribute(g.id)} className="flex-shrink-0 !px-3 !py-1.5 text-xs">
                    Add
                  </Button>
                </div>
              </Card>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Edit savings goal' : 'New savings goal'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Name"
              required
              value={form.name}
              onChange={(e) => setForm((p) => ({ ...p, name: e.target.value }))}
              placeholder="New laptop"
            />
            <Input
              label="Target amount"
              type="number"
              min="0.01"
              step="0.01"
              required
              value={form.targetAmount}
              onChange={(e) => setForm((p) => ({ ...p, targetAmount: e.target.value }))}
              placeholder="1000.00"
            />
            {editingId && (
              <Input
                label="Target date (optional)"
                type="date"
                value={form.targetDate}
                onChange={(e) => setForm((p) => ({ ...p, targetDate: e.target.value }))}
              />
            )}
            {error && <p className="text-sm font-semibold text-accent-coral">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create goal'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
