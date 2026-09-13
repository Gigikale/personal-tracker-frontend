import { apiClient } from './apiClient'
import type {
  Budget,
  BudgetSummary,
  Category,
  CurrencyCode,
  Expense,
  Household,
  HouseholdBudget,
  HouseholdBudgetSummary,
  Notification,
  RecurringExpense,
  SavingsGoal,
  User,
} from '../types/api'

export interface AuthResult {
  user: User
  accessToken: string
  refreshToken: string
}

export const authApi = {
  signup: (data: {
    firstName: string
    lastName: string
    phoneNumber: string
    email: string
    password: string
  }) => apiClient.post<AuthResult>('/auth/signup', data).then((r) => r.data),

  login: (data: { email: string; password: string }) =>
    apiClient.post<AuthResult>('/auth/login', data).then((r) => r.data),

  logout: (refreshToken: string) => apiClient.post('/auth/logout', { refreshToken }),
}

export const usersApi = {
  getMe: () => apiClient.get<User>('/users/me').then((r) => r.data),
  updateMe: (data: { currency: CurrencyCode }) => apiClient.patch<User>('/users/me', data).then((r) => r.data),
}

export const categoriesApi = {
  list: () => apiClient.get<Category[]>('/categories').then((r) => r.data),
  create: (data: { name: string; icon?: string; color?: string }) =>
    apiClient.post<Category>('/categories', data).then((r) => r.data),
  update: (id: string, data: Partial<{ name: string; icon: string; color: string }>) =>
    apiClient.patch<Category>(`/categories/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/categories/${id}`),
}

export const expensesApi = {
  list: (params?: { categoryId?: string; from?: string; to?: string; page?: number; limit?: number }) =>
    apiClient.get<Expense[]>('/expenses', { params }).then((r) => ({
      data: r.data,
      total: Number(r.headers['x-total-count'] ?? r.data.length),
    })),
  create: (data: { categoryId: string; amount: number; description?: string; date: string }) =>
    apiClient.post<Expense>('/expenses', data).then((r) => r.data),
  update: (id: string, data: Partial<{ categoryId: string; amount: number; description: string; date: string }>) =>
    apiClient.patch<Expense>(`/expenses/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/expenses/${id}`),
  exportUrl: (format: 'csv' | 'pdf', params?: { categoryId?: string; from?: string; to?: string }) => {
    const search = new URLSearchParams({ format, ...params })
    return `${apiClient.defaults.baseURL}/expenses/export?${search.toString()}`
  },
}

export const budgetsApi = {
  list: (params?: { month?: number; year?: number }) =>
    apiClient.get<Budget[]>('/budgets', { params }).then((r) => r.data),
  summary: (params?: { month?: number; year?: number }) =>
    apiClient.get<BudgetSummary>('/budgets/summary', { params }).then((r) => r.data),
  create: (data: { categoryId?: string | null; amount: number; month: number; year: number }) =>
    apiClient.post<Budget>('/budgets', data).then((r) => r.data),
  update: (id: string, data: { amount: number }) =>
    apiClient.patch<Budget>(`/budgets/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/budgets/${id}`),
}

export const recurringExpensesApi = {
  list: () => apiClient.get<RecurringExpense[]>('/recurring-expenses').then((r) => r.data),
  create: (data: {
    categoryId: string
    amount: number
    description?: string
    frequency: string
    startDate: string
    endDate?: string
  }) => apiClient.post<RecurringExpense>('/recurring-expenses', data).then((r) => r.data),
  update: (
    id: string,
    data: Partial<{
      categoryId: string
      amount: number
      description: string
      frequency: string
      endDate: string | null
      isActive: boolean
    }>,
  ) => apiClient.patch<RecurringExpense>(`/recurring-expenses/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/recurring-expenses/${id}`),
}

export const notificationsApi = {
  list: (params?: { unreadOnly?: boolean }) =>
    apiClient
      .get<Notification[]>('/notifications', { params: params?.unreadOnly ? { unreadOnly: 'true' } : undefined })
      .then((r) => r.data),
  markRead: (id: string) => apiClient.patch<Notification>(`/notifications/${id}/read`).then((r) => r.data),
  markAllRead: () => apiClient.patch('/notifications/read-all'),
  remove: (id: string) => apiClient.delete(`/notifications/${id}`),
}

export const savingsGoalsApi = {
  list: () => apiClient.get<SavingsGoal[]>('/savings-goals').then((r) => r.data),
  create: (data: { name: string; targetAmount: number; targetDate?: string }) =>
    apiClient.post<SavingsGoal>('/savings-goals', data).then((r) => r.data),
  update: (id: string, data: Partial<{ name: string; targetAmount: number; targetDate: string | null }>) =>
    apiClient.patch<SavingsGoal>(`/savings-goals/${id}`, data).then((r) => r.data),
  contribute: (id: string, amount: number) =>
    apiClient.post<SavingsGoal>(`/savings-goals/${id}/contribute`, { amount }).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/savings-goals/${id}`),
}

export const householdsApi = {
  list: () => apiClient.get<Household[]>('/households').then((r) => r.data),
  get: (id: string) => apiClient.get<Household>(`/households/${id}`).then((r) => r.data),
  create: (data: { name: string }) => apiClient.post<Household>('/households', data).then((r) => r.data),
  update: (id: string, data: { name: string }) =>
    apiClient.patch<Household>(`/households/${id}`, data).then((r) => r.data),
  remove: (id: string) => apiClient.delete(`/households/${id}`),
  addMember: (id: string, email: string) =>
    apiClient.post<Household>(`/households/${id}/members`, { email }).then((r) => r.data),
  removeMember: (id: string, userId: string) => apiClient.delete(`/households/${id}/members/${userId}`),
  listBudgets: (id: string) => apiClient.get<HouseholdBudget[]>(`/households/${id}/budgets`).then((r) => r.data),
  createBudget: (id: string, data: { amount: number; month: number; year: number }) =>
    apiClient.post<HouseholdBudget>(`/households/${id}/budgets`, data).then((r) => r.data),
  updateBudget: (id: string, budgetId: string, data: { amount: number }) =>
    apiClient.patch<HouseholdBudget>(`/households/${id}/budgets/${budgetId}`, data).then((r) => r.data),
  removeBudget: (id: string, budgetId: string) => apiClient.delete(`/households/${id}/budgets/${budgetId}`),
  summary: (id: string, params?: { month?: number; year?: number }) =>
    apiClient
      .get<HouseholdBudgetSummary>(`/households/${id}/budgets/summary`, { params })
      .then((r) => r.data),
}
