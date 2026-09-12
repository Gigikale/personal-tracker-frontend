export function ComingSoonBadge({ label = 'Coming soon' }: { label?: string }) {
  return (
    <span className="inline-flex items-center rounded-full bg-accent-amber/15 px-2.5 py-1 text-[11px] font-bold text-accent-amber-hover">
      {label}
    </span>
  )
}

export function ComingSoonPanel({ title, description }: { title: string; description: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-line bg-surface-alt py-16 text-center">
      <ComingSoonBadge />
      <h3 className="font-display text-lg font-bold text-ink">{title}</h3>
      <p className="max-w-sm text-sm text-ink-muted">{description}</p>
    </div>
  )
}
