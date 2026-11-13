import { fireEvent, render, screen } from '@testing-library/react'
import { MemoryRouter, Route, Routes } from 'react-router-dom'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { HouseholdDetailPage } from './HouseholdDetailPage'
import { householdsApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import type { HouseholdBudgetYearSummary } from '../../types/api'

vi.mock('../../lib/api', () => ({
  householdsApi: {
    get: vi.fn(),
    summary: vi.fn(),
    yearSummary: vi.fn(),
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

function yearSummary(overrides: Partial<Record<string, unknown>> = {}) {
  const months: HouseholdBudgetYearSummary['months'] = Array.from({ length: 12 }, (_, i) => ({
    month: i + 1,
    budgetId: null,
    budgetAmount: null,
    actualSpent: 0,
    remaining: null,
    percentUsed: null,
  }))
  months[0] = { month: 1, budgetId: 'budget-1', budgetAmount: 1000, actualSpent: 450, remaining: 550, percentUsed: 45 }
  months[2] = { month: 3, budgetId: 'budget-3', budgetAmount: 500, actualSpent: 650, remaining: -150, percentUsed: 130 }
  return {
    year: 2026,
    hasMixedCurrencies: false,
    months,
    totals: {
      budgetedMonths: 2,
      budgetAmount: 1500,
      spentInBudgetedMonths: 1100,
      remaining: 400,
      percentUsed: 73.3,
      totalSpent: 1180,
    },
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
    vi.mocked(householdsApi.yearSummary).mockResolvedValue(yearSummary() as never)
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

  it('shows every month of the year with budget, spend and what is left', async () => {
    vi.mocked(householdsApi.summary).mockResolvedValue(baseSummary() as never)

    renderPage()

    expect(await screen.findByText('$550.00 left')).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(13) // header + 12 months
    expect(screen.getByText('$150.00 over')).toBeInTheDocument()
    expect(screen.getByText('$400.00 left')).toBeInTheDocument() // yearly remaining
    expect(screen.getByText('2 of 12 months')).toBeInTheDocument()
    expect(screen.getByText('$1,180.00 across the whole year')).toBeInTheDocument()
  })

  it('opens a month in the monthly view when it is picked from the year overview', async () => {
    vi.mocked(householdsApi.summary).mockResolvedValue(baseSummary() as never)
    vi.setSystemTime(new Date('2026-06-15T12:00:00Z'))

    renderPage()

    fireEvent.click(await screen.findByText('Mar'))
    await screen.findByText('Shared budget — March 2026')
    expect(householdsApi.summary).toHaveBeenLastCalledWith('house-1', { month: 3, year: 2026 })
    vi.useRealTimers()
  })
})
