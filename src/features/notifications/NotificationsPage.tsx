import { useEffect, useState } from 'react'

import { notificationsApi } from '../../lib/api'
import type { Notification } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Button } from '../../components/ui/Button'
import { Card } from '../../components/ui/Card'
import { TrashIcon } from '../../components/ui/icons'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)

  function load() {
    setLoading(true)
    notificationsApi
      .list()
      .then(setNotifications)
      .finally(() => setLoading(false))
  }

  useEffect(load, [])

  async function handleMarkRead(id: string) {
    await notificationsApi.markRead(id)
    load()
  }

  async function handleMarkAllRead() {
    await notificationsApi.markAllRead()
    load()
  }

  async function handleDelete(id: string) {
    await notificationsApi.remove(id)
    load()
  }

  const hasUnread = notifications.some((n) => !n.isRead)

  return (
    <div>
      <PageHeader
        title="Notifications"
        description="Budget alerts and recurring expense activity."
        action={
          hasUnread ? (
            <Button variant="secondary" onClick={handleMarkAllRead}>
              Mark all as read
            </Button>
          ) : undefined
        }
      />

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
                <button onClick={() => handleDelete(n.id)} className="text-ink-muted hover:text-accent-coral">
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
