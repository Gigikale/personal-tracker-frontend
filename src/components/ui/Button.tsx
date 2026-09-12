import type { ButtonHTMLAttributes } from 'react'

type Variant = 'primary' | 'secondary' | 'ghost' | 'danger'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant
}

const variantClasses: Record<Variant, string> = {
  primary:
    'bg-accent-amber text-[#24150a] hover:bg-accent-amber-hover font-bold disabled:opacity-50 disabled:cursor-not-allowed',
  secondary:
    'bg-surface-alt text-ink border border-line hover:bg-line font-semibold disabled:opacity-50 disabled:cursor-not-allowed',
  ghost: 'bg-transparent text-ink-muted hover:text-ink font-semibold',
  danger: 'bg-transparent text-accent-coral hover:underline font-semibold',
}

export function Button({ variant = 'primary', className = '', ...props }: ButtonProps) {
  return (
    <button
      className={`rounded-xl px-4 py-2.5 text-sm transition-colors ${variantClasses[variant]} ${className}`}
      {...props}
    />
  )
}
