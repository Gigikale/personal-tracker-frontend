import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { usersApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { AuthLayout } from '../../components/layout/AuthLayout'

export function AuthCallbackPage() {
  const navigate = useNavigate()
  const setSession = useAuthStore((s) => s.setSession)
  const [error, setError] = useState(false)

  useEffect(() => {
    const params = new URLSearchParams(window.location.hash.slice(1))
    const accessToken = params.get('accessToken')
    const refreshToken = params.get('refreshToken')

    if (!accessToken || !refreshToken) {
      setError(true)
      return
    }

    useAuthStore.getState().setTokens(accessToken, refreshToken)
    usersApi
      .getMe()
      .then((user) => {
        setSession(user, accessToken, refreshToken)
        navigate('/', { replace: true })
      })
      .catch(() => setError(true))
  }, [navigate, setSession])

  return (
    <AuthLayout>
      {error ? (
        <>
          <h2 className="font-display mb-1.5 text-2xl font-bold text-ink">Sign-in failed</h2>
          <p className="text-sm text-ink-muted">Something went wrong completing that sign-in. Please try again.</p>
        </>
      ) : (
        <p className="text-sm text-ink-muted">Finishing sign-in…</p>
      )}
    </AuthLayout>
  )
}
