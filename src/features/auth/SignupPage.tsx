import { useState, type ChangeEvent, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axios from 'axios'

import { authApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { AuthLayout } from '../../components/layout/AuthLayout'
import { Input } from '../../components/ui/Input'
import { Button } from '../../components/ui/Button'
import { OAuthComingSoon } from './OAuthComingSoon'

function passwordStrength(password: string) {
  if (!password) return null
  let score = 0
  if (password.length >= 6) score = 1
  if (password.length >= 8 && /[0-9]/.test(password) && /[a-zA-Z]/.test(password)) score = 2
  if (password.length >= 10 && /[^A-Za-z0-9]/.test(password)) score = 3
  const bands = [
    null,
    { label: 'Weak password', color: 'bg-accent-coral', textColor: 'text-accent-coral', width: '33%' },
    { label: 'Good password', color: 'bg-accent-amber', textColor: 'text-accent-amber-hover', width: '66%' },
    { label: 'Strong password', color: 'bg-brand-from', textColor: 'text-brand-from', width: '100%' },
  ] as const
  return bands[score]
}

export function SignupPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)

  const [form, setForm] = useState({ firstName: '', lastName: '', phoneNumber: '', email: '', password: '' })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  const strength = passwordStrength(form.password)

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
      const result = await authApi.signup(form)
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
      <h2 className="font-display mb-1.5 text-2xl font-bold text-ink">Create your account</h2>
      <p className="mb-6 text-sm text-ink-muted">Start tracking your spending in minutes.</p>

      {submitError && (
        <div className="mb-4 rounded-xl border border-accent-coral/30 bg-accent-coral/10 px-4 py-3 text-sm font-semibold text-accent-coral">
          {submitError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-2 gap-3.5">
          <Input
            id="firstName"
            label="First name"
            value={form.firstName}
            onChange={updateField('firstName')}
            error={errors.firstName}
            placeholder="Jordan"
          />
          <Input
            id="lastName"
            label="Last name"
            value={form.lastName}
            onChange={updateField('lastName')}
            error={errors.lastName}
            placeholder="Rivera"
          />
        </div>

        <Input
          id="phoneNumber"
          label="Phone number"
          type="tel"
          value={form.phoneNumber}
          onChange={updateField('phoneNumber')}
          error={errors.phoneNumber}
          placeholder="+1 (555) 000-0000"
        />

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
          <Input
            id="password"
            label="Password"
            type="password"
            value={form.password}
            onChange={updateField('password')}
            error={errors.password}
            placeholder="At least 6 characters"
          />
          {strength && (
            <div className="mt-2">
              <div className="h-1 overflow-hidden rounded-full bg-line">
                <div className={`h-full rounded-full transition-all ${strength.color}`} style={{ width: strength.width }} />
              </div>
              <p className={`mt-1 text-[11.5px] font-bold ${strength.textColor}`}>{strength.label}</p>
            </div>
          )}
        </div>

        <Button type="submit" disabled={submitting} className="mt-2 w-full">
          {submitting ? 'Creating account…' : 'Create account'}
        </Button>
      </form>

      <OAuthComingSoon />

      <p className="mt-6 text-center text-sm text-ink-muted">
        Already have an account?{' '}
        <Link to="/login" className="font-bold text-brand-from hover:text-accent-amber-hover">
          Log in
        </Link>
      </p>
    </AuthLayout>
  )
}
