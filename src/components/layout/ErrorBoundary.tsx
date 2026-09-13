import { Component, type ErrorInfo, type ReactNode } from 'react'

import { Button } from '../ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  error: Error | null
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null }

  static getDerivedStateFromError(error: Error): State {
    return { error }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Unhandled render error', error, info.componentStack)
  }

  render() {
    if (this.state.error) {
      return (
        <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-surface px-6 text-center">
          <h1 className="font-display text-xl font-bold text-ink">Something went wrong</h1>
          <p className="max-w-sm text-sm text-ink-muted">
            This page hit an unexpected error. Reloading usually fixes it — your data is safe.
          </p>
          <Button onClick={() => window.location.reload()}>Reload the app</Button>
        </div>
      )
    }

    return this.props.children
  }
}
