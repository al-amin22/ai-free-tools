'use client'

import { AlertCircle, RefreshCw, Mail, ChevronRight } from 'lucide-react'

// Maps internal error codes → user-friendly messages + next step
const ERROR_MAP: Record<
  string,
  { title: string; message: string; action?: { label: string; href?: string; onClick?: string } }
> = {
  rate_limit: {
    title:   "You've reached the free limit",
    message: "Free users can generate 5 documents per hour. Sign up for free to get 20/hour.",
    action:  { label: 'Sign up free — it takes 10 seconds', href: '/signup' },
  },
  ai_timeout: {
    title:   'Generation is taking longer than usual',
    message: 'Our AI servers are busy right now. Your request will usually complete in under 30 seconds.',
    action:  { label: 'Try again', onClick: 'retry' },
  },
  ai_failed: {
    title:   'Generation failed',
    message: "We couldn't generate your document right now. We've already been notified and are looking into it.",
    action:  { label: 'Try again', onClick: 'retry' },
  },
  validation_failed: {
    title:   'Generated output was incomplete',
    message: 'Our quality check caught an issue with the output. This can happen with very specific inputs.',
    action:  { label: 'Try with slightly different inputs', onClick: 'retry' },
  },
  network: {
    title:   'Connection issue',
    message: "It looks like you're offline or our server is temporarily unavailable.",
    action:  { label: 'Try again', onClick: 'retry' },
  },
  unknown: {
    title:   'Something went wrong',
    message: "We're not sure what happened, but we've logged the error. Please try again.",
    action:  { label: 'Try again', onClick: 'retry' },
  },
}

interface ErrorMessageProps {
  code?:      string  // key from ERROR_MAP
  onRetry?:   () => void
  className?: string
}

export default function ErrorMessage({
  code      = 'unknown',
  onRetry,
  className = '',
}: ErrorMessageProps) {
  const error = ERROR_MAP[code] ?? ERROR_MAP['unknown']

  const handleAction = () => {
    if (error.action?.onClick === 'retry' && onRetry) onRetry()
  }

  return (
    <div
      role="alert"
      className={`rounded-xl border border-red-100 bg-red-50 p-5 ${className}`}
    >
      <div className="flex gap-3">
        <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" aria-hidden />
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold text-red-800">{error.title}</p>
          <p className="mt-1 text-sm text-red-700 leading-relaxed">{error.message}</p>

          {error.action && (
            <div className="mt-3">
              {error.action.href ? (
                <a
                  href={error.action.href}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-red-600 px-4 py-2 text-xs font-semibold text-white hover:bg-red-700 transition-colors"
                >
                  {error.action.label}
                  <ChevronRight size={12} />
                </a>
              ) : (
                <button
                  onClick={handleAction}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-red-200 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 transition-colors"
                >
                  <RefreshCw size={12} />
                  {error.action.label}
                </button>
              )}
            </div>
          )}
        </div>
      </div>

      <p className="mt-4 flex items-center gap-1 text-[11px] text-red-400">
        <Mail size={11} />
        Still having issues?{' '}
        <a
          href="mailto:support@aifreetools.us"
          className="underline underline-offset-2 hover:text-red-600"
        >
          Contact support
        </a>
      </p>
    </div>
  )
}
