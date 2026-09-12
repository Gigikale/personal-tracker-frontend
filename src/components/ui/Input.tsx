import type { InputHTMLAttributes } from 'react'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
}

export function Input({ label, error, className = '', id, ...props }: InputProps) {
  return (
    <div>
      {label && (
        <label htmlFor={id} className="mb-1.5 block text-sm font-bold text-ink">
          {label}
        </label>
      )}
      <input
        id={id}
        className={`w-full rounded-xl border bg-surface-alt px-3.5 py-2.5 text-[15px] text-ink outline-none transition-colors placeholder:text-ink-muted/60 focus:border-brand-from focus:ring-4 focus:ring-brand-from/20 ${
          error ? 'border-accent-coral' : 'border-line'
        } ${className}`}
        {...props}
      />
      {error && <p className="mt-1.5 text-xs font-bold text-accent-coral">{error}</p>}
    </div>
  )
}
