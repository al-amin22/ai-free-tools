import Link from 'next/link'
import { ShieldCheck } from 'lucide-react'

interface PrivacyNoticeProps {
  className?: string
}

export default function PrivacyNotice({ className = '' }: PrivacyNoticeProps) {
  return (
    <p
      className={`flex items-start gap-1.5 text-[11px] text-gray-400 leading-relaxed ${className}`}
    >
      <ShieldCheck size={12} className="mt-0.5 shrink-0 text-green-400" />
      <span>
        We don&apos;t store your inputs. All data is processed in real-time and
        immediately discarded.{' '}
        <Link
          href="/privacy"
          className="underline underline-offset-2 hover:text-gray-600 transition-colors"
        >
          Privacy Policy
        </Link>
      </span>
    </p>
  )
}
