import type { ReactNode } from 'react'

export function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen bg-bg">
      <div className="relative hidden w-[480px] flex-shrink-0 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-from to-brand-to p-11 lg:flex">
        <div className="pointer-events-none absolute -right-16 -top-20 h-72 w-72 rounded-full bg-accent-coral opacity-30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-28 -left-16 h-80 w-80 rounded-full bg-accent-amber opacity-20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2.5">
          <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
            <rect x="2" y="14" width="6" height="10" rx="2" fill="#F59E0B" />
            <rect x="10" y="8" width="6" height="16" rx="2" fill="#FFFFFF" fillOpacity="0.92" />
            <rect x="18" y="2" width="6" height="22" rx="2" fill="#FB7185" />
          </svg>
          <span className="font-display text-lg font-bold text-white">Personal Tracker</span>
        </div>

        <div className="relative z-10">
          <h1 className="font-display mb-3.5 text-4xl font-bold leading-tight text-white">
            See your
            <br />
            money clearly.
          </h1>
          <p className="max-w-xs text-sm leading-relaxed text-white/75">
            Track spending, hit your budget, and build the habit — one clear dashboard at a time.
          </p>
        </div>

        <div className="relative z-10 w-64 -rotate-2 rounded-2xl border border-white/20 bg-white/10 p-5 shadow-xl backdrop-blur-xl">
          <div className="mb-2.5 flex items-center justify-between">
            <span className="text-xs font-semibold text-white/70">Dining budget</span>
            <span className="text-xs font-bold text-white">68%</span>
          </div>
          <div className="h-2 overflow-hidden rounded-full bg-white/20">
            <div className="h-full w-[68%] rounded-full bg-accent-amber" />
          </div>
          <div className="mt-2.5 text-sm font-bold text-white">
            $340 <span className="font-medium text-white/70">/ $500</span>
          </div>
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-[400px]">{children}</div>
      </div>
    </div>
  )
}
