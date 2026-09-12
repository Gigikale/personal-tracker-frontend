import { useEffect, useState, type FormEvent } from 'react'

import { categoriesApi } from '../../lib/api'
import type { Category } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { EditIcon, PlusIcon, TrashIcon } from '../../components/ui/icons'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function load() {
    setLoading(true)
    categoriesApi
      .list()
      .then(setCategories)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  function openCreate() {
    setEditingId(null)
    setName('')
    setError(null)
    setShowModal(true)
  }

  function openEdit(category: Category) {
    setEditingId(category.id)
    setName(category.name)
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      if (editingId) {
        await categoriesApi.update(editingId, { name })
      } else {
        await categoriesApi.create({ name })
      }
      setName('')
      setShowModal(false)
      load()
    } catch {
      setError('Could not save category — the name may already be in use.')
    } finally {
      setSubmitting(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this category?')) return
    await categoriesApi.remove(id)
    load()
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group your expenses so budgets and reports make sense."
        action={
          <Button onClick={openCreate} className="flex items-center gap-1.5">
            <PlusIcon width={16} height={16} /> New category
          </Button>
        }
      />

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">No categories yet — create your first one.</Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <span className="font-semibold text-ink">{c.name}</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openEdit(c)}
                  title="Edit category"
                  aria-label="Edit category"
                  className="text-ink-muted hover:text-brand-from"
                >
                  <EditIcon width={16} height={16} />
                </button>
                <button
                  onClick={() => handleDelete(c.id)}
                  title="Delete category"
                  aria-label="Delete category"
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
        <Modal title={editingId ? 'Edit category' : 'New category'} onClose={() => setShowModal(false)}>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            <Input
              label="Name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Groceries"
              autoFocus
              required
            />
            {error && <p className="text-sm font-semibold text-accent-coral">{error}</p>}
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Saving…' : editingId ? 'Save changes' : 'Create category'}
            </Button>
          </form>
        </Modal>
      )}
    </div>
  )
}
