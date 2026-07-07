'use client'

import { useEffect, useState } from 'react'
import { BookMarked, Search, SlidersHorizontal, Loader2, Sparkles } from 'lucide-react'
import { getMovieDetails } from '@/services/tmdb'
import MovieCard from '@/components/features/movies/MovieCard'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useUserStore } from '@/store/user'
import type { TMDbMovieDetails } from '@/types/movie'

export default function WatchlistPage() {
  const router = useRouter()
  const { watchlist } = useUserStore()
  const [movies, setMovies] = useState<TMDbMovieDetails[]>([])
  const [loading, setLoading] = useState(true)

  const handleSuggest = () => {
    if (movies.length === 0) return
    const titles = movies.slice(0, 10).map(m => m.title).join(', ')
    const prompt = `I enjoy these movies: ${titles}. Recommend me some hidden gems and similar movies that I would love.`
    router.push(`/discover?q=${encodeURIComponent(prompt)}`)
  }

  useEffect(() => {
    const fetchMovies = async () => {
      setLoading(true)
      try {
        const moviePromises = watchlist.map(id => getMovieDetails(id))
        const results = await Promise.allSettled(moviePromises)
        
        const fetchedMovies = results
          .filter((res): res is PromiseFulfilledResult<TMDbMovieDetails> => res.status === 'fulfilled')
          .map(res => res.value)

        setMovies(fetchedMovies)
      } catch (error) {
        console.error("Failed to fetch watchlist movies", error)
      } finally {
        setLoading(false)
      }
    }

    if (watchlist.length > 0) {
      fetchMovies()
    } else {
      setMovies([])
      setLoading(false)
    }
  }, [watchlist])

  return (
    <div className="min-h-screen max-w-[1440px] mx-auto px-6 lg:px-16 py-20">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h1
            className="text-3xl font-bold text-white mb-2 flex items-center gap-3"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            <BookMarked className="w-7 h-7 text-[--color-primary]" />
            My Watchlist
          </h1>
          <p className="text-[--color-text-secondary]">{watchlist.length} movies saved</p>
        </div>
        <div className="flex gap-3">
          <button 
            onClick={handleSuggest}
            disabled={movies.length === 0}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl gradient-primary text-sm font-semibold text-white hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_15px_rgba(var(--color-primary-rgb),0.3)]">
            <Sparkles className="w-4 h-4" />
            Suggest
          </button>
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-muted]" />
            <input
              type="search"
              placeholder="Filter watchlist..."
              className="pl-10 pr-4 py-2.5 rounded-xl glass text-sm text-white placeholder-[--color-text-muted] outline-none focus:border-[--color-primary]/50 focus:ring-1 focus:ring-[--color-primary]/50 transition-all duration-200 w-56 bg-black/40 border border-white/10"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl glass bg-black/40 border border-white/10 text-sm text-[--color-text-secondary] hover:text-white transition-all duration-200">
            <SlidersHorizontal className="w-4 h-4" />
            Sort
          </button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center py-32">
          <Loader2 className="w-8 h-8 animate-spin text-[--color-primary]" />
        </div>
      ) : movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} size="md" />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="flex flex-col items-center justify-center py-32 text-center">
          <div className="w-20 h-20 rounded-2xl glass bg-black/40 border border-white/10 flex items-center justify-center mb-6">
            <BookMarked className="w-9 h-9 text-[--color-text-muted]" />
          </div>
          <h2 className="text-2xl font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)' }}>
            Your watchlist is empty
          </h2>
          <p className="text-[--color-text-secondary] max-w-sm mb-8">
            Start exploring and add movies you want to watch later. They'll show up here for easy access.
          </p>
          <Link
            href="/"
            className="px-6 py-3 rounded-xl gradient-primary text-white font-semibold hover:opacity-90 transition-opacity"
          >
            Discover Movies
          </Link>
        </div>
      )}
    </div>
  )
}
