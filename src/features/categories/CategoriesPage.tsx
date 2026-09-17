import { useEffect, useState, type FormEvent } from 'react'

import { categoriesApi } from '../../lib/api'
import type { Category } from '../../types/api'
import { CATEGORY_COLOR_OPTIONS, CATEGORY_ICON_OPTIONS, fallbackCategoryColor } from '../../lib/categoryVisuals'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { CategoryBadge } from '../../components/ui/CategoryBadge'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { CategoryIcon, EditIcon, PlusIcon, TrashIcon } from '../../components/ui/icons'

export function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [icon, setIcon] = useState('')
  const [color, setColor] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

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
    setIcon('')
    setColor('')
    setError(null)
    setShowModal(true)
  }

  function openEdit(category: Category) {
    setEditingId(category.id)
    setName(category.name)
    setIcon(category.icon ?? '')
    setColor(category.color ?? '')
    setError(null)
    setShowModal(true)
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      const payload = { name, icon: icon || undefined, color: color || undefined }
      if (editingId) {
        await categoriesApi.update(editingId, payload)
      } else {
        await categoriesApi.create(payload)
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
    setActionError(null)
    try {
      await categoriesApi.remove(id)
      load()
    } catch {
      setActionError('Could not delete that category. Please try again.')
    }
  }

  return (
    <div>
      <PageHeader
        title="Categories"
        description="Group your expenses so budgets and reports make sense."
        icon={<CategoryIcon width={20} height={20} />}
        action={
          <Button onClick={openCreate} className="flex items-center gap-1.5">
            <PlusIcon width={16} height={16} /> New category
          </Button>
        }
      />

      {actionError && <p className="mb-3 text-sm font-semibold text-accent-coral">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : categories.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">No categories yet — create your first one.</Card>
      ) : (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          {categories.map((c) => (
            <Card key={c.id} className="flex items-center justify-between">
              <div className="flex min-w-0 items-center gap-2.5">
                <CategoryBadge category={c} />
                <span className="truncate font-semibold text-ink">{c.name}</span>
              </div>
              <div className="flex flex-shrink-0 items-center gap-2">
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

            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Icon (optional)</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_ICON_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setIcon(icon === option ? '' : option)}
                    aria-label={`Use icon ${option}`}
                    className={`flex h-9 w-9 items-center justify-center rounded-lg border-2 text-lg transition-colors ${
                      icon === option ? 'border-brand-from bg-brand-from/10' : 'border-line bg-surface-alt'
                    }`}
                  >
                    {option}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-bold text-ink">Color (optional)</label>
              <div className="flex flex-wrap gap-2">
                {CATEGORY_COLOR_OPTIONS.map((option) => (
                  <button
                    key={option}
                    type="button"
                    onClick={() => setColor(color === option ? '' : option)}
                    aria-label={`Use color ${option}`}
                    className={`h-8 w-8 rounded-full border-2 transition-transform ${
                      color === option ? 'scale-110 border-ink' : 'border-transparent'
                    }`}
                    style={{ backgroundColor: option }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-center gap-2.5 rounded-xl border border-line bg-surface-alt px-3.5 py-2.5">
              <CategoryBadge category={{ name: name || 'Category', icon, color: color || fallbackCategoryColor(name || 'Category') }} />
              <span className="text-sm text-ink-muted">Preview</span>
            </div>

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
