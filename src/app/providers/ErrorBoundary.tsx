import { Component, type ErrorInfo, type ReactNode } from 'react'
import { logger } from '@/services/logger'

type Props = { children: ReactNode; label?: string }
type State = { hasError: boolean }

/** Minimal calm fallback — no visual redesign beyond existing empty-state tone. */
export class ErrorBoundary extends Component<Props, State> {
  override state: State = { hasError: false }

  static getDerivedStateFromError(): State {
    return { hasError: true }
  }

  override componentDidCatch(error: Error, info: ErrorInfo) {
    logger.error('ui_error_boundary', {
      label: this.props.label ?? 'root',
      message: error.message,
      stack: info.componentStack?.slice(0, 500),
    })
  }

  override render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 text-sm text-[var(--muted)]">
          Something went wrong. Please try again.
          <button
            type="button"
            className="mt-3 block text-[var(--accent)] font-bold"
            onClick={() => this.setState({ hasError: false })}
          >
            Retry
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
