import type { ReactNode } from 'react'

export function PageHeader({
  title,
  description,
  action,
  icon,
}: {
  title: string
  description?: string
  action?: ReactNode
  icon?: ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col items-start gap-4 sm:flex-row sm:justify-between">
      <div className="flex items-center gap-3">
        {icon && (
          <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-2xl bg-brand-from/10 text-brand-from">
            {icon}
          </span>
        )}
        <div>
          <h1 className="font-display text-2xl font-bold text-ink">{title}</h1>
          {description && <p className="mt-1 text-sm text-ink-muted">{description}</p>}
        </div>
      </div>
      {action}
    </div>
  )
}
