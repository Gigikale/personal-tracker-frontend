import { Link } from 'react-router-dom'

import { Button } from '../../components/ui/Button'

export function NotFoundPage() {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-center">
      <p className="font-display text-5xl font-bold text-ink">404</p>
      <h1 className="font-display text-lg font-bold text-ink">Page not found</h1>
      <p className="max-w-sm text-sm text-ink-muted">
        The page you're looking for doesn't exist or may have moved.
      </p>
      <Link to="/">
        <Button className="mt-2">Back to Dashboard</Button>
      </Link>
    </div>
  )
}
