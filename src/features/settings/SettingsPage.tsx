import { useState } from 'react'

import { usersApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { CURRENCIES } from '../../lib/currency'
import type { CurrencyCode } from '../../types/api'
import { PageHeader } from '../../components/ui/PageHeader'
import { Card } from '../../components/ui/Card'
import { SettingsIcon } from '../../components/ui/icons'

export function SettingsPage() {
  const user = useAuthStore((s) => s.user)
  const updateUser = useAuthStore((s) => s.updateUser)
  const [saving, setSaving] = useState<CurrencyCode | null>(null)
  const [error, setError] = useState<string | null>(null)

  async function handleSelect(code: CurrencyCode) {
    if (code === user?.currency || saving) return
    setError(null)
    setSaving(code)
    try {
      const updated = await usersApi.updateMe({ currency: code })
      updateUser(updated)
    } catch {
      setError('Could not update your currency. Please try again.')
    } finally {
      setSaving(null)
    }
  }

  return (
    <div>
      <PageHeader
        title="Settings"
        description="Personalize how amounts are shown across the app."
        icon={<SettingsIcon width={20} height={20} />}
      />

      <Card className="max-w-xl">
        <h3 className="mb-1 font-display text-base font-bold text-ink">Currency</h3>
        <p className="mb-4 text-sm text-ink-muted">
          Choose the currency used for every amount you see — expenses, budgets, goals, and exports.
        </p>

        <div className="grid grid-cols-2 gap-3">
          {CURRENCIES.map((c) => {
            const active = user?.currency === c.code
            return (
              <button
                key={c.code}
                type="button"
                onClick={() => handleSelect(c.code)}
                disabled={saving !== null}
                className={`flex items-center gap-3 rounded-xl border-2 px-4 py-3.5 text-left transition-colors ${
                  active
                    ? 'border-brand-from bg-brand-from/10'
                    : 'border-line bg-surface-alt hover:border-brand-from/40'
                } ${saving !== null ? 'opacity-60' : ''}`}
              >
                <span
                  className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full font-display text-lg font-bold ${
                    active ? 'bg-brand-from text-white' : 'bg-surface text-ink'
                  }`}
                >
                  {c.symbol}
                </span>
                <span>
                  <span className="block text-sm font-bold text-ink">{c.code}</span>
                  <span className="block text-xs text-ink-muted">{c.label}</span>
                </span>
                {saving === c.code && <span className="ml-auto text-xs font-semibold text-ink-muted">Saving…</span>}
              </button>
            )
          })}
        </div>

        {error && <p className="mt-3 text-sm font-semibold text-accent-coral">{error}</p>}
      </Card>
    </div>
  )
}
