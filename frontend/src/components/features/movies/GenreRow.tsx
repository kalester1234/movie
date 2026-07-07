'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { getMoviesByGenreAction } from '@/actions/movies'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'
import type { TMDbMovie, TMDbGenre } from '@/types/movie'
import { ChevronDown, Loader2 } from 'lucide-react'

interface GenreRowProps {
  genre: TMDbGenre
  initialMovies: TMDbMovie[]
}

const ITEMS_PER_ROW = 6 // Grid max cols

export default function GenreRow({ genre, initialMovies }: GenreRowProps) {
  const [movies, setMovies] = useState<TMDbMovie[]>(initialMovies)
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_ROW)
  const [page, setPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)

  const handleShowMore = async () => {
    // If we have enough movies loaded in state to show the next row
    if (visibleCount + ITEMS_PER_ROW <= movies.length) {
      setVisibleCount(prev => prev + ITEMS_PER_ROW)
      return
    }

    // Otherwise, fetch the next page from TMDB
    setIsLoading(true)
    const nextPage = page + 1
    const newMovies = await getMoviesByGenreAction(genre.id, nextPage)
    
    if (newMovies.length > 0) {
      setMovies(prev => [...prev, ...newMovies])
      setPage(nextPage)
      setVisibleCount(prev => prev + ITEMS_PER_ROW)
    }
    
    setIsLoading(false)
  }

  const visibleMovies = movies.slice(0, visibleCount)

  if (visibleMovies.length === 0) return null

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-50px' }}
      transition={{ duration: 0.5 }}
      className="py-6 border-b border-white/5 last:border-0"
    >
      <div className="flex items-center justify-between mb-6 px-1">
        <h2 className="text-2xl font-bold text-white capitalize flex items-center gap-2" style={{ fontFamily: 'var(--font-display)' }}>
          <span className="w-1 h-6 rounded-full bg-[--color-primary]" aria-hidden="true" />
          {genre.name}
        </h2>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-x-4 gap-y-8 px-1">
        {visibleMovies.map((movie, idx) => (
          <div key={`${movie.id}-${idx}`}>
            <MovieCard movie={movie} size="md" />
          </div>
        ))}
      </div>

      <div className="mt-8 flex justify-center">
        <button
          onClick={handleShowMore}
          disabled={isLoading}
          className="flex items-center gap-2 px-6 py-3 rounded-full bg-white/5 hover:bg-white/10 text-white font-medium transition-all duration-200 border border-white/10"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              Show More <ChevronDown className="w-4 h-4 text-[--color-text-muted]" />
            </>
          )}
        </button>
      </div>
    </motion.section>
  )
}
