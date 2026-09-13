import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'

import { LoginPage } from './LoginPage'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

vi.mock('../../lib/api', () => ({
  authApi: { login: vi.fn() },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderLoginPage() {
  return render(
    <MemoryRouter>
      <LoginPage />
    </MemoryRouter>,
  )
}

describe('LoginPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null })
  })

  it('logs in and stores the session on success', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.login).mockResolvedValue({
      user: { id: '1', email: 'a@example.com', firstName: 'A', lastName: 'B', phoneNumber: null, currency: 'USD' },
      accessToken: 'access-123',
      refreshToken: 'refresh-123',
    })

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'a@example.com')
    await user.type(screen.getByLabelText('Password'), 'secret123')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    await waitFor(() => {
      expect(authApi.login).toHaveBeenCalledWith({ email: 'a@example.com', password: 'secret123' })
    })
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
    expect(useAuthStore.getState().accessToken).toBe('access-123')
  })

  it('shows an error message on invalid credentials', async () => {
    const user = userEvent.setup()
    const error = Object.assign(new Error('Unauthorized'), {
      isAxiosError: true,
      response: { status: 401, data: { message: 'Invalid email or password' } },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(authApi.login).mockRejectedValue(error)

    renderLoginPage()

    await user.type(screen.getByLabelText('Email'), 'a@example.com')
    await user.type(screen.getByLabelText('Password'), 'wrong')
    await user.click(screen.getByRole('button', { name: /log in/i }))

    expect(await screen.findByText('Invalid email or password.')).toBeInTheDocument()
    expect(useAuthStore.getState().accessToken).toBeNull()
  })
})
