import type { Metadata } from 'next'
import SearchClient from './SearchClient'

export const metadata: Metadata = {
  title: 'Search',
  description: 'Search for movies, actors, directors, and more on CineNova.',
}

import { Suspense } from 'react'

export default function SearchPage() {
  return (
    <Suspense fallback={<div className="min-h-screen py-20 flex justify-center"><div className="w-8 h-8 rounded-full border-2 border-white/20 border-t-[--color-primary] animate-spin" /></div>}>
      <SearchClient />
    </Suspense>
  )
}
