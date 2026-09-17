import { useEffect, useState } from 'react'

import { notificationsApi } from '../../lib/api'
import type { Notification } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { BellIcon, TrashIcon } from '../../components/ui/icons'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [actionError, setActionError] = useState<string | null>(null)

  function load() {
    setLoading(true)
    notificationsApi
      .list()
      .then(setNotifications)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleMarkRead(id: string) {
    setActionError(null)
    try {
      await notificationsApi.markRead(id)
      load()
    } catch {
      setActionError('Could not mark that as read. Please try again.')
    }
  }

  async function handleMarkAllRead() {
    setActionError(null)
    try {
      await notificationsApi.markAllRead()
      load()
    } catch {
      setActionError('Could not mark all as read. Please try again.')
    }
  }

  async function handleDelete(id: string) {
    setActionError(null)
    try {
      await notificationsApi.remove(id)
      load()
    } catch {
      setActionError('Could not delete that notification. Please try again.')
    }
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Budget alerts and recurring expense activity."
        icon={<BellIcon width={20} height={20} />}
        action={
          hasUnread ? (
            <Button variant="secondary" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          ) : undefined
        }
      />

      {actionError && <p className="mb-3 text-sm font-semibold text-accent-coral">{actionError}</p>}

      {loading ? (
        <p className="text-sm text-ink-muted">Loading…</p>
      ) : notifications.length === 0 ? (
        <Card className="text-center text-sm text-ink-muted">You're all caught up.</Card>
      ) : (
        <div className="flex flex-col gap-2.5">
          {notifications.map((n) => (
            <Card
              key={n.id}
              className={`flex items-start justify-between gap-3 ${!n.isRead ? 'border-brand-from/30 bg-brand-from/5' : ''}`}
            >
              <div className="min-w-0">
                <p className="font-semibold text-ink">{n.title}</p>
                <p className="text-sm text-ink-muted">{n.message}</p>
                <p className="mt-1 text-xs text-ink-muted/70">{new Date(n.createdAt).toLocaleString()}</p>
              </div>
              <div className="flex flex-shrink-0 items-center gap-3">
                {!n.isRead && (
                  <button onClick={() => handleMarkRead(n.id)} className="text-xs font-bold text-brand-from">
                    Mark read
                  </button>
                )}
                <button
                  onClick={() => handleDelete(n.id)}
                  title="Delete notification"
                  aria-label="Delete notification"
                  className="text-ink-muted hover:text-accent-coral"
                >
                  <TrashIcon width={16} height={16} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
