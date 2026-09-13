import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import axios from 'axios'

import { SignupPage } from './SignupPage'
import { authApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

vi.mock('../../lib/api', () => ({
  authApi: { signup: vi.fn() },
}))

const mockNavigate = vi.fn()
vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

function renderSignupPage() {
  return render(
    <MemoryRouter>
      <SignupPage />
    </MemoryRouter>,
  )
}

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText('First name'), 'Jordan')
  await user.type(screen.getByLabelText('Last name'), 'Rivera')
  await user.type(screen.getByLabelText('Phone number'), '+15550001234')
  await user.type(screen.getByLabelText('Email'), 'jordan@example.com')
  await user.type(screen.getByLabelText('Password'), 'secret123')
}

describe('SignupPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: null, accessToken: null, refreshToken: null })
  })

  it('creates an account and stores the session on success', async () => {
    const user = userEvent.setup()
    vi.mocked(authApi.signup).mockResolvedValue({
      user: {
        id: '1',
        email: 'jordan@example.com',
        firstName: 'Jordan',
        lastName: 'Rivera',
        phoneNumber: '+15550001234',
        currency: 'USD',
      },
      accessToken: 'access-abc',
      refreshToken: 'refresh-abc',
    })

    renderSignupPage()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    await waitFor(() => expect(authApi.signup).toHaveBeenCalled())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/'))
    expect(useAuthStore.getState().accessToken).toBe('access-abc')
  })

  it('shows field-level errors returned by the server without navigating', async () => {
    const user = userEvent.setup()
    const error = Object.assign(new Error('Validation failed'), {
      isAxiosError: true,
      response: { status: 400, data: { errors: { email: ['An account with this email already exists'] } } },
    })
    vi.spyOn(axios, 'isAxiosError').mockReturnValue(true)
    vi.mocked(authApi.signup).mockRejectedValue(error)

    renderSignupPage()
    await fillValidForm(user)
    await user.click(screen.getByRole('button', { name: /create account/i }))

    expect(await screen.findByText('An account with this email already exists')).toBeInTheDocument()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('shows a password strength hint as the user types', async () => {
    const user = userEvent.setup()
    renderSignupPage()

    // 6+ chars, no mix of letters/digits required yet -> weak
    await user.type(screen.getByLabelText('Password'), 'abcdef')
    expect(screen.getByText('Weak password')).toBeInTheDocument()

    // 8+ chars with both letters and digits -> good
    await user.type(screen.getByLabelText('Password'), 'gh12')
    expect(screen.getByText('Good password')).toBeInTheDocument()
  })
})
