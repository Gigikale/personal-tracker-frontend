import { render, screen, waitFor, within } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'

import { ExpensesPage } from './ExpensesPage'
import { categoriesApi, expensesApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'

vi.mock('../../lib/api', () => ({
  expensesApi: {
    list: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    remove: vi.fn(),
  },
  categoriesApi: {
    list: vi.fn(),
  },
}))

const CATEGORY = { id: 'cat-1', name: 'Groceries', icon: null, color: null }

const EXPENSE = {
  id: 'exp-1',
  categoryId: 'cat-1',
  amount: '42.50',
  description: 'Weekly shop',
  date: '2026-01-15T00:00:00.000Z',
  recurringExpenseId: null,
}

function mockList(expenses = [EXPENSE], total = expenses.length) {
  vi.mocked(expensesApi.list).mockResolvedValue({ data: expenses, total })
  vi.mocked(categoriesApi.list).mockResolvedValue([CATEGORY])
}

describe('ExpensesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({ user: { id: 'u1', currency: 'USD' } as never, accessToken: 't', refreshToken: 'r' })
  })

  it('renders an empty state when there are no expenses', async () => {
    mockList([], 0)
    render(<ExpensesPage />)

    expect(await screen.findByText('No expenses yet — add your first one.')).toBeInTheDocument()
  })

  it('lists expenses with their category name and formatted amount', async () => {
    mockList()
    render(<ExpensesPage />)

    expect(await screen.findByText('Weekly shop')).toBeInTheDocument()
    const table = within(screen.getByRole('table'))
    expect(table.getByText('Groceries')).toBeInTheDocument()
    expect(table.getByText('$42.50')).toBeInTheDocument()
  })

  it('creates a new expense through the modal form', async () => {
    const user = userEvent.setup()
    mockList([], 0)
    vi.mocked(expensesApi.create).mockResolvedValue({ ...EXPENSE, id: 'exp-2' })

    render(<ExpensesPage />)
    await screen.findByText('No expenses yet — add your first one.')

    await user.click(screen.getByRole('button', { name: /add expense/i }))
    // The filter select and the modal's category select are both <select> elements;
    // the modal's is the one rendered last.
    const categorySelect = screen.getAllByRole('combobox').at(-1)!
    await user.selectOptions(categorySelect, 'cat-1')
    await user.type(screen.getByPlaceholderText('0.00'), '15.99')
    await user.type(screen.getByPlaceholderText('Weekly shop'), 'Coffee')

    // After creating, re-fetch should show the new expense.
    mockList([{ ...EXPENSE, id: 'exp-2', amount: '15.99', description: 'Coffee' }])

    // "Add expense" also labels the header button that opens the modal; the submit
    // button is the one rendered last.
    const submitButton = screen.getAllByRole('button', { name: 'Add expense' }).at(-1)!
    await user.click(submitButton)

    await waitFor(() =>
      expect(expensesApi.create).toHaveBeenCalledWith(
        expect.objectContaining({ categoryId: 'cat-1', amount: 15.99, description: 'Coffee' }),
      ),
    )
  })

  it('deletes an expense after confirmation', async () => {
    const user = userEvent.setup()
    mockList()
    vi.mocked(expensesApi.remove).mockResolvedValue(undefined as never)
    vi.spyOn(window, 'confirm').mockReturnValue(true)

    render(<ExpensesPage />)
    await screen.findByText('Weekly shop')

    await user.click(screen.getByLabelText('Delete expense'))

    await waitFor(() => expect(expensesApi.remove).toHaveBeenCalledWith('exp-1'))
  })

  it('does not delete when the confirmation is declined', async () => {
    const user = userEvent.setup()
    mockList()
    vi.spyOn(window, 'confirm').mockReturnValue(false)

    render(<ExpensesPage />)
    await screen.findByText('Weekly shop')

    await user.click(screen.getByLabelText('Delete expense'))

    expect(expensesApi.remove).not.toHaveBeenCalled()
  })
})
