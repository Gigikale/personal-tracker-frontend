import { useEffect, useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { householdsApi } from '../../lib/api'
import type { Household } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { HouseholdIcon, PlusIcon } from '../../components/ui/icons'

export function HouseholdsPage() {
  const [households, setHouseholds] = useState<Household[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [name, setName] = useState('')
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    householdsApi
      .list()
      .then(setHouseholds)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleCreate(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await householdsApi.create({ name })
      setName('')
      setShowModal(false)
      load()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div>
      <PageHeader
        title="Households"
        description="Share a budget with your partner or family."
        action={
          <Button onClick={() => setShowModal(true)} className="flex items-center gap-1.5">
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
          {households.map((h) => (
            <Link key={h.id} to={`/households/${h.id}`}>
              <Card className="flex items-center gap-3 transition-colors hover:border-brand-from">
                <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl bg-brand-from/10 text-brand-from">
                  <HouseholdIcon width={18} height={18} />
                </div>
                <div>
                  <p className="font-semibold text-ink">{h.name}</p>
                  <p className="text-xs text-ink-muted">
                    {h.members.length} member{h.members.length === 1 ? '' : 's'}
                  </p>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}

      {showModal && (
        <Modal title="New household" onClose={() => setShowModal(false)}>
          <form onSubmit={handleCreate} className="flex flex-col gap-4">
            <Input label="Name" required value={name} onChange={(e) => setName(e.target.value)} placeholder="Our home" autoFocus />
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Creating…' : 'Create household'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
