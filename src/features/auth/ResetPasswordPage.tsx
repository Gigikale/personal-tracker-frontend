import { useState, type FormEvent } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import axios from 'axios'

import { authApi } from '../../lib/api'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ResetPasswordPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const token = searchParams.get('token') ?? ''

  const [password, setPassword] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setError(null)
    setSubmitting(true)
    try {
      await authApi.resetPassword(token, password)
      setDone(true)
      setTimeout(() => navigate('/login'), 2000)
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        setError(err.response.data?.message ?? 'This reset link is invalid or has expired.')
      } else {
        setError('Could not reach the server. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (!token) {
    return (
      <AuthLayout>
        <h2 className="font-display mb-1.5 text-2xl font-bold text-ink">Invalid link</h2>
        <p className="mb-6 text-sm text-ink-muted">
          This password reset link is missing its token. Request a new one from the login page.
        </p>
        <Link to="/forgot-password" className="font-bold text-brand-from hover:text-accent-amber-hover">
          Request a new link
        </Link>
      </AuthLayout>
    )
  }

  return (
    <AuthLayout>
      <h2 className="font-display mb-1.5 text-2xl font-bold text-ink">Choose a new password</h2>
      <p className="mb-6 text-sm text-ink-muted">This will end any other sessions currently signed in.</p>

      {done ? (
        <div className="rounded-xl border border-brand-from/30 bg-brand-from/10 px-4 py-3 text-sm font-semibold text-ink">
          Password updated. Redirecting you to log in…
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && (
            <div className="rounded-xl border border-accent-coral/30 bg-accent-coral/10 px-4 py-3 text-sm font-semibold text-accent-coral">
              {error}
            </div>
          )}
          <Input
            id="password"
            label="New password"
            type="password"
            required
            minLength={6}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
          />
          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? 'Saving…' : 'Save new password'}
          </Button>
        </form>
      )}
    </AuthLayout>
  )
}
