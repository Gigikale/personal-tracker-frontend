import { useAuthStore } from '../stores/authStore'
import { currencySymbol, formatMoney } from '../lib/currency'

export function useCurrency() {
  const code = useAuthStore((s) => s.user?.currency ?? 'USD')
  return { code, symbol: currencySymbol(code), format: (amount: number) => formatMoney(amount, code) }
}
