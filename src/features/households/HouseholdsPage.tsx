import { useEffect, useState, type FormEvent, type MouseEvent } from 'react'
import { Link } from 'react-router-dom'

import { householdsApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import type { Household } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { EditIcon, HouseholdIcon, PlusIcon, TrashIcon } from '../../components/ui/icons'

export function HouseholdsPage() {
  const user = useAuthStore((s) => s.user)
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    householdsApi
      .list()
      .then(setHouseholds)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setName('')
    setError(null)
    setShowModal(true)
  }

  function openEdit(e: MouseEvent, household: Household) {
    e.preventDefault()
    e.stopPropagation()
    setEditingId(household.id)
    setName(household.name)
    setError(null)
    setShowModal(true)
  }

  async function handleDelete(e: MouseEvent, id: string) {
    e.preventDefault()
    e.stopPropagation()
    if (!confirm('Delete this household? This removes it for every member.')) return
    await householdsApi.remove(id)
    load()
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (editingId) {
        await householdsApi.update(editingId, { name })
      } else {
        await householdsApi.create({ name })
      }
      setName('')
      setShowModal(false)
      load()
    } catch {
      setError('Could not save the household.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Households"
        description="Share a budget with your partner or family."
        icon={<HouseholdIcon width={20} height={20} />}
        action={
          <Button onClick={openCreate} className="flex items-center gap-1.5">
            <PlusIcon width={16} height={16} /> New household
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : households.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">
          No households yet — create one to start sharing a budget.
        </Card>
      ) : (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {households.map((h) => {
            const isOwner = h.ownerId === user?.id
            return (
              <Link key={h.id} to={`/households/${h.id}`}>
                <Card className="flex items-center gap-3 transition-colors hover:border-brand-from">
                  <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-from/10 text-brand-from">
                    <HouseholdIcon width={18} height={18} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold text-ink">{h.name}</p>
                    <p className="text-xs text-ink-muted">
                      {h.members.length} member{h.members.length === 1 ? '' : 's'}
                    </p>
                  </div>
                  {isOwner && (
                    <div className="flex flex-shrink-0 items-center gap-2">
                      <button
                        onClick={(e) => openEdit(e, h)}
                        title="Rename household"
                        aria-label="Rename household"
                        className="text-ink-muted hover:text-brand-from"
                      >
                        <EditIcon width={16} height={16} />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, h.id)}
                        title="Delete household"
                        aria-label="Delete household"
                        className="text-ink-muted hover:text-accent-coral"
                      >
                        <TrashIcon width={16} height={16} />
                      </button>
                    </div>
                  )}
                </Card>
              </Link>
            )
          })}
        </div>
      )}

      {showModal && (
        <Modal title={editingId ? 'Rename household' : 'New household'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Our home" autoFocus />
            {error && <p className="text-sm font-semibold text-accent-coral">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create household'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
