import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: '404 — Page Not Found',
}

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center text-center px-6">
      <div className="mb-8">
        <span className="text-8xl font-extrabold text-gradient" style={{ fontFamily: 'var(--font-display)' }}>
          404
        </span>
      </div>
      <h1 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
        Scene Not Found
      </h1>
      <p className="text-[--color-text-secondary] mb-8 max-w-sm">
        The page you're looking for has been cut from the production. Let's get you back to something good.
      </p>
      <Link
        href="/"
        className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
      >
        Back to Home
      </Link>
    </div>
  )
}
