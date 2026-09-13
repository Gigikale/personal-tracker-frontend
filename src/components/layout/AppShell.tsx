import { useEffect, useState } from 'react'
import { NavLink, Outlet, useLocation, useNavigate } from 'react-router-dom'

import { notificationsApi } from '../../lib/api'
import { useAuthStore } from '../../stores/authStore'
import { useThemeStore } from '../../stores/themeStore'
import { useRealtimeConnection } from '../../hooks/useRealtimeConnection'
import {
  BankIcon,
  BellIcon,
  BudgetIcon,
  CategoryIcon,
  CloseIcon,
  DashboardIcon,
  ExpenseIcon,
  HouseholdIcon,
  LogoutIcon,
  MenuIcon,
  MoonIcon,
  RecurringIcon,
  SavingsIcon,
  SettingsIcon,
  SunIcon,
} from '../ui/icons'
import { ComingSoonBadge } from '../ui/ComingSoon'

const navItems = [
  { to: '/', label: 'Dashboard', icon: DashboardIcon, end: true },
  { to: '/expenses', label: 'Expenses', icon: ExpenseIcon },
  { to: '/categories', label: 'Categories', icon: CategoryIcon },
  { to: '/budgets', label: 'Budgets', icon: BudgetIcon },
  { to: '/recurring-expenses', label: 'Recurring', icon: RecurringIcon },
  { to: '/savings-goals', label: 'Savings Goals', icon: SavingsIcon },
  { to: '/households', label: 'Households', icon: HouseholdIcon },
]

export function AppShell() {
  const user = useAuthStore((s) => s.user)
  const logout = useAuthStore((s) => s.logout)
  const theme = useThemeStore((s) => s.theme)
  const toggleTheme = useThemeStore((s) => s.toggle)
  const navigate = useNavigate()
  const location = useLocation()
  const [unreadCount, setUnreadCount] = useState(0)
  const [sidebarOpen, setSidebarOpen] = useState(false)

  useEffect(() => {
    setSidebarOpen(false)
  }, [location.pathname])

  useEffect(() => {
    notificationsApi
      .list({ unreadOnly: true })
      .then((n) => setUnreadCount(n.length))
      .catch(() => setUnreadCount(0))
  }, [])

  const realtimeStatus = useRealtimeConnection((event) => {
    if (event === 'notification.created') {
      setUnreadCount((n) => n + 1)
    }
  })

  const initials = `${user?.firstName?.[0] ?? ''}${user?.lastName?.[0] ?? ''}`.toUpperCase()
  const statusDotColor =
    realtimeStatus === 'online'
      ? 'bg-emerald-500'
      : realtimeStatus === 'connecting'
        ? 'bg-amber-400 animate-pulse'
        : 'bg-ink-muted/50'
  const statusLabel =
    realtimeStatus === 'online' ? 'Online' : realtimeStatus === 'connecting' ? 'Connecting…' : 'Offline'

  function handleLogout() {
    logout()
    navigate('/login')
  }

  return (
    <div className="flex min-h-screen flex-col bg-bg md:flex-row">
      <header className="flex items-center justify-between border-b border-line bg-surface px-4 py-3 md:hidden">
        <button
          onClick={() => setSidebarOpen(true)}
          aria-label="Open menu"
          className="p-1 text-ink-muted transition-colors hover:text-ink"
        >
          <MenuIcon width={22} height={22} />
        </button>
        <span className="font-display text-[15px] font-bold text-ink">Personal Tracker</span>
        <span className="w-[22px]" />
      </header>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/40 md:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-72 flex-shrink-0 flex-col overflow-y-auto border-r border-line bg-surface px-4 py-6 transition-transform duration-200 md:static md:z-auto md:w-60 md:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="mb-8 flex items-center justify-between px-2">
          <div className="flex items-center gap-2">
            <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
              <rect x="2" y="14" width="6" height="10" rx="2" fill="#F59E0B" />
              <rect x="10" y="8" width="6" height="16" rx="2" fill="#4F46E5" />
              <rect x="18" y="2" width="6" height="22" rx="2" fill="#FB7185" />
            </svg>
            <span className="font-display text-[15px] font-bold text-ink">Personal Tracker</span>
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
            className="p-1 text-ink-muted transition-colors hover:text-ink md:hidden"
          >
            <CloseIcon width={18} height={18} />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                  isActive
                    ? 'bg-brand-from/10 text-brand-from'
                    : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
                }`
              }
            >
              <Icon className="flex-shrink-0" />
              {label}
            </NavLink>
          ))}

          <div className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-muted/60">
            <BankIcon className="flex-shrink-0" />
            Bank Sync
            <ComingSoonBadge />
          </div>
        </nav>

        <div className="flex flex-col gap-1 border-t border-line pt-4">
          <NavLink
            to="/notifications"
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? 'bg-brand-from/10 text-brand-from' : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
              }`
            }
          >
            <span className="relative flex-shrink-0">
              <BellIcon />
              {unreadCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-coral px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              )}
            </span>
            Notifications
          </NavLink>

          <NavLink
            to="/settings"
            className={({ isActive }) =>
              `flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold transition-colors ${
                isActive ? 'bg-brand-from/10 text-brand-from' : 'text-ink-muted hover:bg-surface-alt hover:text-ink'
              }`
            }
          >
            <SettingsIcon className="flex-shrink-0" />
            Settings
          </NavLink>

          <button
            onClick={toggleTheme}
            className="flex items-center gap-2.5 rounded-xl px-3 py-2.5 text-sm font-semibold text-ink-muted transition-colors hover:bg-surface-alt hover:text-ink"
          >
            {theme === 'dark' ? <SunIcon /> : <MoonIcon />}
            {theme === 'dark' ? 'Light mode' : 'Dark mode'}
          </button>

          <div className="mt-2 flex items-center justify-between rounded-xl px-3 py-2">
            <div className="flex min-w-0 items-center gap-2.5">
              <span
                className="relative flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-brand-from/15 text-xs font-bold text-brand-from"
                title={statusLabel}
              >
                {initials}
                <span
                  className={`absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full border-2 border-surface ${statusDotColor}`}
                />
              </span>
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-ink">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="truncate text-xs text-ink-muted">{user?.email}</p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Log out"
              className="flex-shrink-0 rounded-lg p-2 text-ink-muted transition-colors hover:bg-surface-alt hover:text-accent-coral"
            >
              <LogoutIcon width={16} height={16} />
            </button>
          </div>
        </div>
      </aside>

      <main className="min-w-0 flex-1 overflow-y-auto px-4 py-6 md:px-8 md:py-8">
        <div className="mx-auto max-w-5xl">
          <Outlet />
        </div>
      </main>
    </div>
  )
}
