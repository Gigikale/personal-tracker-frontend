export function OAuthComingSoon() {
  return (
    <div>
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-line" />
        <span className="text-[11px] font-bold tracking-wide text-ink-muted">OR</span>
        <div className="h-px flex-1 bg-line" />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <button
          type="button"
          disabled
          title="Coming soon — Google sign-in isn't wired up yet"
          className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-surface-alt px-3 py-3 text-[13.5px] font-bold text-ink-muted opacity-60"
        >
          <svg width="16" height="16" viewBox="0 0 48 48">
            <path
              fill="#FFC107"
              d="M43.6 20.5H42V20H24v8h11.3C33.9 32.6 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"
            />
            <path
              fill="#FF3D00"
              d="M6.3 14.7l6.6 4.8C14.6 15.1 18.9 12 24 12c3.1 0 5.9 1.2 8 3.1l5.7-5.7C34.5 6.1 29.5 4 24 4c-7.5 0-14 4.1-17.7 10.7z"
            />
            <path
              fill="#4CAF50"
              d="M24 44c5.3 0 10.1-2 13.7-5.4l-6.3-5.3C29.4 34.9 26.8 36 24 36c-5.3 0-9.8-3.4-11.4-8.1l-6.5 5C9.9 39.8 16.4 44 24 44z"
            />
            <path
              fill="#1976D2"
              d="M43.6 20.5H42V20H24v8h11.3c-.8 2.2-2.2 4.1-4.1 5.5l6.3 5.3C39.9 36.6 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"
            />
          </svg>
          Google
        </button>
        <button
          type="button"
          disabled
          title="Coming soon — Apple sign-in isn't wired up yet"
          className="flex cursor-not-allowed items-center justify-center gap-2 rounded-xl border border-line bg-surface-alt px-3 py-3 text-[13.5px] font-bold text-ink-muted opacity-60"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor">
            <path d="M16.365 1.43c0 1.14-.42 2.06-1.26 2.86-.9.86-1.98 1.36-3.12 1.27-.06-1.08.42-2.16 1.2-2.9.84-.8 2.16-1.34 3.06-1.36.06.05.12.09.12.13zM20.6 17.14c-.5 1.14-.74 1.65-1.38 2.66-.9 1.4-2.16 3.15-3.72 3.16-1.38.02-1.74-.9-3.6-.9-1.86 0-2.28.88-3.66.92-1.56.05-2.76-1.5-3.66-2.9C2.7 17.6 1.98 13.2 3.6 10.4c.84-1.44 2.34-2.36 3.96-2.38 1.44-.02 2.4.98 3.6.98 1.2 0 2.7-1.22 4.56-1.04.78.03 2.96.31 4.36 2.36-.12.07-2.6 1.52-2.58 4.52.02 3.6 3.16 4.8 3.1 4.8z" />
          </svg>
          Apple
        </button>
      </div>
      <p className="mt-2 text-center text-[11px] text-ink-muted">Social sign-in is coming soon.</p>
    </div>
  )
}
