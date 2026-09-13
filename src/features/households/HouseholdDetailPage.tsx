import { useEffect, useState, type FormEvent } from 'react'
import { Link, useParams } from 'react-router-dom'

import { householdsApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { useCurrency } from '../../hooks/useCurrency'
import { formatMoney } from '../../lib/currency'
import type { Household, HouseholdBudgetSummary } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { EditIcon, TrashIcon } from '../../components/ui/icons'

const now = new Date()

function barColor(percentUsed: number | null) {
  if (percentUsed === null) return 'bg-ink-muted/40'
  if (percentUsed >= 100) return 'bg-accent-coral'
  if (percentUsed >= 80) return 'bg-accent-amber'
  return 'bg-brand-from'
}

export function HouseholdDetailPage() {
  const { id } = useParams<{ id: string }>()
  const user = useAuthStore((s) => s.user)
  const { format } = useCurrency()
  const [household, setHousehold] = useState<Household | null>(null)
  const [summary, setSummary] = useState<HouseholdBudgetSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteError, setInviteError] = useState<string | null>(null)
  const [budgetAmount, setBudgetAmount] = useState('')
  const [budgetError, setBudgetError] = useState<string | null>(null)
  const [editingBudget, setEditingBudget] = useState(false)

  function load() {
    if (!id) return
    setLoading(true)
    Promise.all([householdsApi.get(id), householdsApi.summary(id)])
      .then(([h, s]) => {
        setHousehold(h)
        setSummary(s)
      })
      .finally(() => setLoading(false))
  }

  useEffect(load, [id])

  if (loading || !household || !summary) return <p className="text-sm text-ink-muted">Loading…</p>

  const isOwner = household.ownerId === user?.id

  async function handleInvite(e: FormEvent) {
    e.preventDefault()
    setInviteError(null)
    try {
      await householdsApi.addMember(id!, inviteEmail)
      setInviteEmail('')
      load()
    } catch {
      setInviteError('Could not add that member — check the email or they may already be added.')
    }
  }

  async function handleRemove(userId: string) {
    if (!confirm('Remove this member?')) return
    await householdsApi.removeMember(id!, userId)
    load()
  }

  async function handleSetBudget(e: FormEvent) {
    e.preventDefault()
    setBudgetError(null)
    try {
      await householdsApi.createBudget(id!, {
        amount: Number(budgetAmount),
        month: now.getUTCMonth() + 1,
        year: now.getUTCFullYear(),
      })
      setBudgetAmount('')
      load()
    } catch {
      setBudgetError('A budget for this month may already exist.')
    }
  }

  function openEditBudget() {
    setBudgetAmount(String(summary!.budgetAmount ?? ''))
    setBudgetError(null)
    setEditingBudget(true)
  }

  async function handleUpdateBudget(e: FormEvent) {
    e.preventDefault()
    setBudgetError(null)
    try {
      await householdsApi.updateBudget(id!, summary!.budgetId!, { amount: Number(budgetAmount) })
      setEditingBudget(false)
      load()
    } catch {
      setBudgetError('Could not save changes.')
    }
  }

  async function handleDeleteBudget() {
    if (!confirm('Delete this shared budget for the month?')) return
    await householdsApi.removeBudget(id!, summary!.budgetId!)
    load()
  }

  return (
    <div>
      <Link to="/households" className="mb-4 inline-block text-sm font-semibold text-ink-muted hover:text-ink">
        ← Households
      </Link>
      <PageHeader title={household.name} description={`${household.members.length} member(s)`} />

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <Card className="lg:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-display text-base font-bold text-ink">Shared budget this month</h3>
            {summary.budgetAmount !== null && !editingBudget && (
              <div className="flex items-center gap-2">
                <button
                  onClick={openEditBudget}
                  title="Edit shared budget"
                  aria-label="Edit shared budget"
                  className="text-ink-muted hover:text-brand-from"
                >
                  <EditIcon width={16} height={16} />
                </button>
                <button
                  onClick={handleDeleteBudget}
                  title="Delete shared budget"
                  aria-label="Delete shared budget"
                  className="text-ink-muted hover:text-accent-coral"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            )}
          </div>

          {summary.hasMixedCurrencies && (
            <p className="mb-4 rounded-lg border border-accent-amber/40 bg-accent-amber/10 px-3 py-2 text-xs font-semibold text-accent-amber">
              Members of this household use different currencies. The combined totals below add up raw amounts
              without converting between currencies, so treat them as approximate — check each member's own spend
              for an accurate figure.
            </p>
          )}
          {summary.budgetAmount === null ? (
            <form onSubmit={handleSetBudget} className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label="Monthly budget amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="1500.00"
                />
              </div>
              <Button type="submit">Set budget</Button>
            </form>
          ) : editingBudget ? (
            <form onSubmit={handleUpdateBudget} className="flex items-end gap-3">
              <div className="flex-1">
                <Input
                  label="Monthly budget amount"
                  type="number"
                  min="0.01"
                  step="0.01"
                  required
                  autoFocus
                  value={budgetAmount}
                  onChange={(e) => setBudgetAmount(e.target.value)}
                  placeholder="1500.00"
                />
              </div>
              <Button type="submit">Save</Button>
              <Button type="button" variant="secondary" onClick={() => setEditingBudget(false)}>
                Cancel
              </Button>
            </form>
          ) : (
            <>
              <div className="mb-1.5 flex items-baseline justify-between">
                <span className="text-sm font-semibold text-ink">Combined spend</span>
                <span className="text-sm text-ink-muted">
                  {format(summary.actualSpent)} / {format(summary.budgetAmount)}
                </span>
              </div>
              <div className="mb-5 h-2.5 overflow-hidden rounded-full bg-surface-alt">
                <div
                  className={`h-full rounded-full ${barColor(summary.percentUsed)}`}
                  style={{ width: `${Math.min(summary.percentUsed ?? 0, 100)}%` }}
                />
              </div>

              <h4 className="mb-2 text-xs font-bold uppercase tracking-wide text-ink-muted">By member</h4>
              <div className="flex flex-col gap-2">
                {summary.byMember.map((m) => (
                  <div key={m.userId} className="flex items-center justify-between text-sm">
                    <span className="text-ink">{m.name}</span>
                    <span className="font-bold text-ink">{formatMoney(m.spent, m.currency)}</span>
                  </div>
                ))}
              </div>
            </>
          )}
          {budgetError && <p className="mt-2 text-sm font-semibold text-accent-coral">{budgetError}</p>}
        </Card>

        <Card>
          <h3 className="mb-4 font-display text-base font-bold text-ink">Members</h3>
          <ul className="mb-4 flex flex-col gap-3">
            {household.members.map((m) => (
              <li key={m.id} className="flex items-center justify-between text-sm">
                <div>
                  <p className="font-semibold text-ink">
                    {m.user.firstName} {m.user.lastName}
                    {m.role === 'OWNER' && <span className="ml-1.5 text-xs font-bold text-brand-from">Owner</span>}
                  </p>
                  <p className="text-xs text-ink-muted">{m.user.email}</p>
                </div>
                {(isOwner || m.userId === user?.id) && m.role !== 'OWNER' && (
                  <button
                    onClick={() => handleRemove(m.userId)}
                    className="text-xs font-semibold text-ink-muted hover:text-accent-coral"
                  >
                    Remove
                  </button>
                )}
              </li>
            ))}
          </ul>

          {isOwner && (
            <form onSubmit={handleInvite} className="flex flex-col gap-2 border-t border-line pt-4">
              <label className="text-xs font-bold uppercase tracking-wide text-ink-muted">Add a member</label>
              <div className="flex gap-2">
                <input
                  type="email"
                  required
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  placeholder="partner@example.com"
                  className="w-full rounded-lg border border-line bg-surface-alt px-3 py-1.5 text-sm text-ink"
                />
                <Button type="submit" variant="secondary" className="flex-shrink-0 !px-3 !py-1.5 text-xs">
                  Add
                </Button>
              </div>
              {inviteError && <p className="text-xs font-semibold text-accent-coral">{inviteError}</p>}
            </form>
          )}
        </Card>
      </div>
    </div>
  )
}
