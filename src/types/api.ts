export type CurrencyCode = 'USD' | 'NGN'

export interface User {
  id: string
  email: string
  firstName: string
  lastName: string
  phoneNumber: string | null
  currency: CurrencyCode
}

export interface Category {
  id: string
  name: string
  icon: string | null
  color: string | null
}

export interface Expense {
  id: string
  categoryId: string
  amount: string
  description: string | null
  date: string
  recurringExpenseId: string | null
}

export interface Budget {
  id: string
  categoryId: string | null
  amount: string
  month: number
  year: number
  lastNotifiedThreshold: number | null
}

export interface BudgetSummaryLine {
  budgetAmount: number | null
  actualSpent: number
  remaining: number | null
  percentUsed: number | null
}

export interface BudgetSummary {
  month: number
  year: number
  overall: BudgetSummaryLine
  categories: (BudgetSummaryLine & { categoryId: string; categoryName: string })[]
}

export type RecurrenceFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'YEARLY'

export interface RecurringExpense {
  id: string
  categoryId: string
  amount: string
  description: string | null
  frequency: RecurrenceFrequency
  startDate: string
  nextRunDate: string
  endDate: string | null
  isActive: boolean
}

export type NotificationType = 'BUDGET_THRESHOLD' | 'RECURRING_EXPENSE' | 'SYSTEM'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  message: string
  isRead: boolean
  metadata: Record<string, unknown> | null
  createdAt: string
}

export interface SavingsGoal {
  id: string
  name: string
  targetAmount: string
  currentAmount: string
  targetDate: string | null
}

export type HouseholdRole = 'OWNER' | 'MEMBER'

export interface HouseholdMemberUser {
  id: string
  firstName: string
  lastName: string
  email: string
}

export interface HouseholdMember {
  id: string
  userId: string
  role: HouseholdRole
  user: HouseholdMemberUser
}

export interface Household {
  id: string
  name: string
  ownerId: string
  members: HouseholdMember[]
  invitedPending?: boolean
}

export interface HouseholdBudget {
  id: string
  amount: string
  month: number
  year: number
}

export interface HouseholdBudgetSummary {
  budgetId: string | null
  month: number
  year: number
  budgetAmount: number | null
  actualSpent: number
  remaining: number | null
  percentUsed: number | null
  hasMixedCurrencies: boolean
  byMember: { userId: string; name: string; currency: CurrencyCode; spent: number }[]
}
