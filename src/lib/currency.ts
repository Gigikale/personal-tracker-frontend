import type { CurrencyCode } from '../types/api'

export const CURRENCIES: { code: CurrencyCode; symbol: string; label: string }[] = [
  { code: 'USD', symbol: '$', label: 'US Dollar' },
  { code: 'NGN', symbol: '₦', label: 'Nigerian Naira' },
]

export function currencySymbol(code: CurrencyCode | undefined | null): string {
  return CURRENCIES.find((c) => c.code === code)?.symbol ?? '$'
}

export function formatMoney(amount: number, code: CurrencyCode | undefined | null): string {
  const sign = amount < 0 ? '-' : ''
  return `${sign}${currencySymbol(code)}${Math.abs(amount).toFixed(2)}`
}
