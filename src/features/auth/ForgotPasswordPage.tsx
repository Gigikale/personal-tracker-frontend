import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'

import { authApi } from '../../lib/api'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'

export function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      await authApi.forgotPassword(email)
    } finally {
      // Always show the same confirmation, whether or not an account exists for this email.
      setSubmitting(false)
      setSubmitted(true)
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display mb-1.5 text-2xl font-bold text-ink">Reset your password</h2>
      <p className="mb-6 text-sm text-ink-muted">
        Enter your email and we'll send you a link to choose a new password.
      </p>

      {submitted ? (
        <div className="rounded-xl border border-brand-from/30 bg-brand-from/10 px-4 py-3 text-sm font-semibold text-ink">
          If an account exists for {email}, we've sent a password reset link to it.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <Input
            id="email"
            label="Email"
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
          />
          <Button type="submit" disabled={submitting} className="mt-2 w-full">
            {submitting ? 'Sending…' : 'Send reset link'}
          </Button>
        </form>
      )}

      <p className="mt-6 text-center text-sm text-ink-muted">
        <Link to="/login" className="font-bold text-brand-from hover:text-accent-amber-hover">
          Back to log in
        </Link>
      </p>
    </AuthLayout>
  )
}
