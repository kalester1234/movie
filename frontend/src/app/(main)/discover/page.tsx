import type { Metadata } from 'next'
import AIDiscoverClient from './AIDiscoverClient'

export const metadata: Metadata = {
  title: 'AI Match — Discover Your Next Movie',
  description: 'Use AI to find movies that match your mood, taste, and preferences. Powered by CineNova AI.',
}

import { Suspense } from 'react'

export default function DiscoverPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading AI Discovery...</div>}>
      <AIDiscoverClient />
    </Suspense>
  )
}
