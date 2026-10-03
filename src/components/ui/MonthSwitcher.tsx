import { addMonths, periodLabel, type Period } from '../../lib/period'
import { ChevronLeftIcon, ChevronRightIcon } from './icons'

export function MonthSwitcher({
  period,
  onChange,
  disableNext,
}: {
  period: Period
  onChange: (period: Period) => void
  disableNext?: boolean
}) {
  return (
    <div className="flex items-center gap-1 rounded-xl border border-line bg-surface-alt px-1.5 py-1.5">
      <button
        onClick={() => onChange(addMonths(period, -1))}
        aria-label="Previous month"
        title="Previous month"
        className="rounded-lg p-1.5 text-ink-muted hover:bg-line hover:text-ink"
      >
        <ChevronLeftIcon width={16} height={16} />
      </button>
      <span className="min-w-[8.5rem] text-center text-sm font-semibold text-ink">{periodLabel(period)}</span>
      <button
        onClick={() => onChange(addMonths(period, 1))}
        disabled={disableNext}
        aria-label="Next month"
        title="Next month"
        className="rounded-lg p-1.5 text-ink-muted hover:bg-line hover:text-ink disabled:cursor-not-allowed disabled:opacity-30 disabled:hover:bg-transparent"
      >
        <ChevronRightIcon width={16} height={16} />
      </button>
    </div>
  )
}
