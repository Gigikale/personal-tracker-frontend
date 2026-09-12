import { useEffect } from 'react'
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { useThemeStore } from './stores/themeStore'
import { ProtectedRoute } from './components/layout/ProtectedRoute'
import { AppShell } from './components/layout/AppShell'
import { LoginPage } from './features/auth/LoginPage'
import { SignupPage } from './features/auth/SignupPage'
import { DashboardPage } from './features/dashboard/DashboardPage'
import { CategoriesPage } from './features/categories/CategoriesPage'
import { ExpensesPage } from './features/expenses/ExpensesPage'
import { BudgetsPage } from './features/budgets/BudgetsPage'
import { RecurringExpensesPage } from './features/recurringExpenses/RecurringExpensesPage'
import { SavingsGoalsPage } from './features/savingsGoals/SavingsGoalsPage'
import { HouseholdsPage } from './features/households/HouseholdsPage'
import { HouseholdDetailPage } from './features/households/HouseholdDetailPage'
import { NotificationsPage } from './features/notifications/NotificationsPage'
import { SettingsPage } from './features/settings/SettingsPage'

function App() {
  const theme = useThemeStore((s) => s.theme)

  useEffect(() => {
    document.documentElement.classList.toggle('dark', theme === 'dark')
  }, [theme])

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/signup" element={<SignupPage />} />

        <Route element={<ProtectedRoute />}>
          <Route element={<AppShell />}>
            <Route index element={<DashboardPage />} />
            <Route path="/expenses" element={<ExpensesPage />} />
            <Route path="/categories" element={<CategoriesPage />} />
            <Route path="/budgets" element={<BudgetsPage />} />
            <Route path="/recurring-expenses" element={<RecurringExpensesPage />} />
            <Route path="/savings-goals" element={<SavingsGoalsPage />} />
            <Route path="/households" element={<HouseholdsPage />} />
            <Route path="/households/:id" element={<HouseholdDetailPage />} />
            <Route path="/notifications" element={<NotificationsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
