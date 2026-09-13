import { render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HouseholdDetailPage } from './HouseholdDetailPage'
import { householdsApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

vi.mock('../../lib/api', () => ({
  householdsApi: {
    get: vi.fn(),
    summary: vi.fn(),
  },
}))

const HOUSEHOLD = {
  id: 'house-1',
  name: 'Our home',
  ownerId: 'owner-1',
  members: [
    { id: 'm1', userId: 'owner-1', role: 'OWNER', user: { firstName: 'Own', lastName: 'Er', email: 'owner@x.com' } },
    { id: 'm2', userId: 'partner-1', role: 'MEMBER', user: { firstName: 'Part', lastName: 'Ner', email: 'partner@x.com' } },
  ],
}

function baseSummary(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    budgetId: 'budget-1',
    month: 1,
    year: 2026,
    budgetAmount: 1000,
    actualSpent: 400,
    remaining: 600,
    percentUsed: 40,
    hasMixedCurrencies: false,
    byMember: [
      { userId: 'owner-1', name: 'Own Er', currency: 'USD', spent: 300 },
      { userId: 'partner-1', name: 'Part Ner', currency: 'USD', spent: 100 },
    ],
    ...overrides,
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/households/house-1']}>
      <Routes>
        <Route path="/households/:id" element={<HouseholdDetailPage />} />
      </Routes>
    </MemoryRouter>,
  )
}

describe('HouseholdDetailPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: { id: 'owner-1', currency: 'USD' } as never,
      accessToken: 't',
      refreshToken: 'r',
    })
    vi.mocked(householdsApi.get).mockResolvedValue(HOUSEHOLD as never)
  })

  it('does not show a currency warning when every member shares one currency', async () => {
    vi.mocked(householdsApi.summary).mockResolvedValue(baseSummary() as never)

    renderPage()

    await screen.findByText('Combined spend')
    expect(screen.queryByText(/different currencies/i)).not.toBeInTheDocument()
  })

  it('shows a warning banner and per-member currencies when members differ', async () => {
    vi.mocked(householdsApi.summary).mockResolvedValue(
      baseSummary({
        hasMixedCurrencies: true,
        byMember: [
          { userId: 'owner-1', name: 'Own Er', currency: 'USD', spent: 300 },
          { userId: 'partner-1', name: 'Part Ner', currency: 'NGN', spent: 100 },
        ],
      }) as never,
    )

    renderPage()

    expect(await screen.findByText(/different currencies/i)).toBeInTheDocument()
    expect(screen.getByText('$300.00')).toBeInTheDocument()
    expect(screen.getByText('₦100.00')).toBeInTheDocument()
  })
})
