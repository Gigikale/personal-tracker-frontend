import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { SavingsGoalsPage } from './SavingsGoalsPage'
import { savingsGoalsApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

vi.mock('../../lib/api', () => ({
  savingsGoalsApi: {
    list: vi.fn(),
  },
}))

function goal(overrides: Record<string, unknown>) {
  return {
    id: 'goal-1',
    name: 'Pay off debt',
    targetAmount: '1000000.00',
    currentAmount: '500000.00',
    targetDate: null,
    ...overrides,
  }
}

describe('SavingsGoalsPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: { id: 'user-1', currency: 'USD' } as never,
      accessToken: 't',
      refreshToken: 'r',
    })
  })

  it('shows how much is left to reach the goal', async () => {
    vi.mocked(savingsGoalsApi.list).mockResolvedValue([goal({})] as never)

    render(<SavingsGoalsPage />)

    expect(await screen.findByText('$500,000.00 remaining')).toBeInTheDocument()
    expect(screen.getByText('of $1,000,000.00')).toBeInTheDocument()
  })

  it('says the goal is reached instead of showing a negative remainder', async () => {
    vi.mocked(savingsGoalsApi.list).mockResolvedValue([goal({ currentAmount: '1200000.00' })] as never)

    render(<SavingsGoalsPage />)

    expect(await screen.findByText('Goal reached')).toBeInTheDocument()
    expect(screen.queryByText(/remaining/)).not.toBeInTheDocument()
  })
})
