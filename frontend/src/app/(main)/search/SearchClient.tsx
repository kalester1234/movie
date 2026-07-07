'use client'

import { useState, useEffect, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, Film, User, Loader2 } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import MovieCard from '@/components/features/movies/MovieCard'
import SkeletonCard from '@/components/features/movies/SkeletonCard'
import { getPosterUrl, getProfileUrl } from '@/utils/helpers'
import type { TMDbMovie, TMDbPerson } from '@/types/movie'

async function fetchSearch(query: string) {
  const res = await fetch(`/api/movies/search?q=${encodeURIComponent(query)}`)
  if (!res.ok) throw new Error('Search failed')
  return res.json() as Promise<{ movies: TMDbMovie[]; people: TMDbPerson[] }>
}

export default function SearchClient() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  const [inputValue, setInputValue] = useState(initialQ)
  const [query, setQuery] = useState(initialQ)
  const [activeTab, setActiveTab] = useState<'movies' | 'people'>('movies')

  // Debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery(inputValue)
      if (inputValue) {
        router.replace(`/search?q=${encodeURIComponent(inputValue)}`, { scroll: false })
      }
    }, 400)
    return () => clearTimeout(timer)
  }, [inputValue, router])

  const { data, isLoading, isFetching } = useQuery({
    queryKey: ['search', query],
    queryFn: () => fetchSearch(query),
    enabled: query.length >= 2,
    placeholderData: (prev) => prev,
  })

  const movies = data?.movies ?? []
  const people = data?.people ?? []

  return (
    <div className="min-h-screen max-w-[1440px] mx-auto px-6 lg:px-16 py-20">
      {/* Search Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-10"
      >
        <h1 className="text-3xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>
          Discover Movies
        </h1>

        {/* Search Input */}
        <div className="relative max-w-2xl">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[--color-text-muted]" />
          {isFetching && (
            <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-primary] animate-spin" />
          )}
          <input
            type="search"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            placeholder="Search movies, actors, directors..."
            className="w-full pl-12 pr-12 py-4 rounded-2xl glass-strong text-white text-lg placeholder-[--color-text-muted] outline-none focus:ring-2 focus:ring-[--color-primary]/50 transition-all duration-200"
            autoFocus
            aria-label="Search movies and people"
          />
        </div>
      </motion.div>

      {/* Tabs */}
      {query.length >= 2 && (
        <div className="flex gap-1 mb-8 w-fit glass rounded-xl p-1">
          {(['movies', 'people'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all duration-200 ${
                activeTab === tab
                  ? 'bg-[--color-primary] text-white'
                  : 'text-[--color-text-secondary] hover:text-white'
              }`}
            >
              {tab === 'movies' ? <Film className="w-4 h-4" /> : <User className="w-4 h-4" />}
              {tab === 'movies' ? `Movies (${movies.length})` : `People (${people.length})`}
            </button>
          ))}
        </div>
      )}

      {/* Results */}
      <AnimatePresence mode="wait">
        {query.length < 2 ? (
          <motion.div
            key="empty"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-24 text-center"
          >
            <Search className="w-16 h-16 text-[--color-text-muted] mb-4" />
            <p className="text-xl font-semibold text-white mb-2">What are you looking for?</p>
            <p className="text-[--color-text-secondary]">Type at least 2 characters to search movies, actors, and directors.</p>
          </motion.div>
        ) : isLoading ? (
          <motion.div key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
              {Array.from({ length: 14 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          </motion.div>
        ) : activeTab === 'movies' ? (
          <motion.div key="movies" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {movies.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-xl font-semibold text-white mb-2">No movies found</p>
                <p className="text-[--color-text-secondary]">Try a different search term.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-7 gap-4">
                {movies.map((movie) => (
                  <MovieCard key={movie.id} movie={movie} />
                ))}
              </div>
            )}
          </motion.div>
        ) : (
          <motion.div key="people" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            {people.length === 0 ? (
              <div className="text-center py-24">
                <p className="text-xl font-semibold text-white mb-2">No people found</p>
                <p className="text-[--color-text-secondary]">Try a different name.</p>
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-6">
                {people.map((person) => (
                  <div key={person.id} className="flex flex-col items-center gap-3 group">
                    <div className="w-full aspect-square rounded-2xl overflow-hidden ring-1 ring-white/10 group-hover:ring-[--color-primary]/50 transition-all duration-200">
                      <img
                        src={getProfileUrl(person.profile_path)}
                        alt={person.name}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=18181b&color=a1a1aa&size=200`
                        }}
                      />
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold text-white group-hover:text-[--color-primary] transition-colors">{person.name}</p>
                      <p className="text-xs text-[--color-text-muted]">{person.known_for_department}</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
