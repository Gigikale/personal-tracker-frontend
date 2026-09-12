import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { authApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { OAuthComingSoon } from './OAuthComingSoon'

export function LoginPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const [form, setForm] = useState({ email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  function updateField(field: keyof typeof form) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      setForm((prev) => ({ ...prev, [field]: e.target.value }))
      setErrors((prev) => ({ ...prev, [field]: '' }))
    }
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault()
    setSubmitError(null)
    setSubmitting(true)
    try {
      const result = await authApi.login(form)
      setSession(result.user, result.accessToken, result.refreshToken)
      navigate('/')
    } catch (err) {
      if (axios.isAxiosError(err) && err.response) {
        if (err.response.status === 400 && err.response.data?.errors) {
          const fieldErrors: Record<string, string> = {}
          for (const [field, messages] of Object.entries(err.response.data.errors as Record<string, string[]>)) {
            fieldErrors[field] = messages[0]
          }
          setErrors(fieldErrors)
        } else if (err.response.status === 401) {
          setSubmitError('Invalid email or password.')
        } else if (err.response.status === 429) {
          setSubmitError('Too many attempts. Please wait a bit and try again.')
        } else {
          setSubmitError(err.response.data?.message ?? 'Something went wrong. Please try again.')
        }
      } else {
        setSubmitError('Could not reach the server. Please try again.')
      }
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <AuthLayout>
      <h2 className="font-display mb-1.5 text-2xl font-bold text-ink">Welcome back</h2>
      <p className="mb-6 text-sm text-ink-muted">Log in to see where your money went.</p>

      {submitError && (
        <div className="mb-4 rounded-xl border border-accent-coral/30 bg-accent-coral/10 px-4 py-3 text-sm font-semibold text-accent-coral">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Input
          id="email"
          label="Email"
          type="email"
          value={form.email}
          onChange={updateField('email')}
          error={errors.email}
          placeholder="you@example.com"
        />

        <div>
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="password" className="block text-sm font-bold text-ink">
              Password
            </label>
            <span title="Coming soon — needs email delivery" className="cursor-not-allowed text-xs font-semibold text-ink-muted/60">
              Forgot password?
            </span>
          </div>
          <Input
            id="password"
            type="password"
            value={form.password}
            onChange={updateField('password')}
            error={errors.password}
            placeholder="Your password"
          />
        </div>

        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? 'Logging in…' : 'Log in'}
        </Button>
      </form>

      <OAuthComingSoon />

      <p className="mt-6 text-center text-sm text-ink-muted">
        Don't have an account?{' '}
        <Link to="/signup" className="font-bold text-brand-from hover:text-accent-amber-hover">
          Sign up
        </Link>
      </p>
    </AuthLayout>
  )
}
