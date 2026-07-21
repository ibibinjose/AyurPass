"use client";

import { Component, type ReactNode } from "react";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
}

/**
 * Global error boundary that catches unhandled React rendering errors.
 * Displays a graceful fallback UI instead of a blank white screen.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: React.ErrorInfo) {
    // In production, this would report to Sentry/observability
    console.error("[ErrorBoundary]", error, info.componentStack);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: null });
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) return this.props.fallback;

      return (
        <div className="flex min-h-screen items-center justify-center bg-surface px-6">
          <div className="max-w-md text-center">
            <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-clay">
              <svg
                className="h-7 w-7 text-forest"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={1.5}
                stroke="currentColor"
                aria-hidden
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M12 9v3.75m9-.75a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9 3.75h.008v.008H12v-.008Z"
                />
              </svg>
            </div>
            <h1 className="font-display text-2xl font-semibold text-forest">
              Something went wrong
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-ink-secondary">
              An unexpected error occurred. This has been noted and we are looking into it.
            </p>
            <div className="mt-6 flex flex-col items-center gap-3">
              <button
                onClick={this.handleRetry}
                className="inline-flex min-h-10 items-center gap-2 rounded-full bg-forest px-5 py-2.5 text-sm font-semibold text-white hover:bg-forest-deep transition-colors"
              >
                Try again
              </button>
              <a
                href="/"
                className="text-sm font-medium text-ink-muted hover:text-forest transition-colors"
              >
                Go to homepage
              </a>
            </div>
            {process.env.NODE_ENV === "development" && this.state.error && (
              <details className="mt-6 rounded-xl border border-hairline bg-clay/30 p-4 text-left">
                <summary className="cursor-pointer text-xs font-semibold text-ink-muted">
                  Error details (dev only)
                </summary>
                <pre className="mt-2 overflow-auto text-xs text-red-700 whitespace-pre-wrap">
                  {this.state.error.message}
                  {"\n"}
                  {this.state.error.stack}
                </pre>
              </details>
            )}
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
