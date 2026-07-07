'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Info, Plus, Star, Heart, Check } from 'lucide-react'
import { cn, getPosterUrl, formatYear, getRatingBg } from '@/utils/helpers'
import { useUserStore } from '@/store/user'
import { useUIStore } from '@/store/ui'
import type { TMDbMovie } from '@/types/movie'

interface MovieCardProps {
  movie: TMDbMovie
  matchScore?: number
  size?: 'sm' | 'md' | 'lg'
  showDetails?: boolean
  priority?: boolean
}

export default function MovieCard({
  movie,
  matchScore,
  size = 'md',
  showDetails = true,
  priority = false,
}: MovieCardProps) {
  const { watchlist, toggleWatchlist } = useUserStore()
  const isWishlisted = watchlist.includes(movie.id)

  const [imgError, setImgError] = useState(false)
  const [isImgLoaded, setIsImgLoaded] = useState(false)

  const sizeClasses = {
    sm: 'w-[140px]',
    md: 'w-[185px]',
    lg: 'w-[240px]',
  }

  const posterUrl = imgError
    ? `https://via.placeholder.com/342x513/18181b/a1a1aa?text=${encodeURIComponent(movie.title)}`
    : getPosterUrl(movie.poster_path, size === 'lg' ? 'lg' : 'md')

  return (
    <div
      className={cn(
        'group relative shrink-0 cursor-pointer transition-transform duration-300 ease-[cubic-bezier(0.25,0.46,0.45,0.94)] hover:-translate-y-1.5 hover:scale-[1.03]',
        sizeClasses[size]
      )}
    >
      <Link href={`/movie/${movie.id}`} className="block" aria-label={movie.title}>
        {/* Poster */}
        <div className="relative aspect-[2/3] rounded-none overflow-hidden bg-[--color-card] shadow-none group-hover:shadow-[0_0_20px_rgba(0,0,0,0.5)] transition-shadow duration-300 group-hover:z-10">
          <img
            src={posterUrl}
            alt={movie.title}
            className={cn(
              "w-full h-full object-cover transition-all duration-700 group-hover:scale-105",
              isImgLoaded ? "opacity-100 blur-0" : "opacity-0 blur-md scale-110"
            )}
            onLoad={() => setIsImgLoaded(true)}
            onError={() => setImgError(true)}
            loading={priority ? 'eager' : 'lazy'}
          />

          {/* Hover Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
            {/* Quick View Button */}
            <button
              onClick={(e) => {
                e.preventDefault()
                useUIStore.getState().setQuickViewMovie(movie)
              }}
              className="w-12 h-12 rounded-full backdrop-blur-md border border-white/50 bg-white/20 text-white flex items-center justify-center shadow-lg hover:scale-110 hover:bg-white/30 transition-all duration-200"
              aria-label={`Preview ${movie.title}`}
            >
              <Info className="w-6 h-6" />
            </button>

            {/* Add to List Button */}
            <button
              onClick={(e) => {
                e.preventDefault() // Prevent navigation
                toggleWatchlist(movie.id) // Optimistic UI update via Zustand
              }}
              className={cn(
                'w-12 h-12 rounded-full backdrop-blur-md border flex items-center justify-center shadow-lg hover:scale-110 transition-all duration-200',
                isWishlisted 
                  ? 'bg-[--color-primary]/20 border-[--color-primary]/50 text-[--color-primary]' 
                  : 'bg-white/20 border-white/50 text-white hover:bg-white/30'
              )}
              aria-label={isWishlisted ? `Remove ${movie.title} from watchlist` : `Add ${movie.title} to watchlist`}
            >
              {isWishlisted ? (
                <Check className="w-6 h-6" strokeWidth={3} />
              ) : (
                <Plus className="w-6 h-6" />
              )}
            </button>
          </div>

          {/* Match Score Badge */}
          {matchScore && (
            <div className="absolute top-2 left-2 px-2 py-1 rounded-md bg-[--color-primary]/20 border border-[--color-primary]/40 backdrop-blur-sm">
              <span className="text-[10px] font-bold text-[--color-primary]">
                {matchScore}% MATCH
              </span>
            </div>
          )}

          {/* Rating Badge */}
          {movie.vote_average > 0 && (
            <div className={cn(
              'absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-md border backdrop-blur-sm text-[10px] font-bold',
              getRatingBg(movie.vote_average)
            )}>
              <Star className="w-2.5 h-2.5 fill-current" />
              {movie.vote_average.toFixed(1)}
            </div>
          )}
        </div>

        {/* Card Details */}
        {showDetails && (
          <div className="mt-2.5 px-0.5">
            <h3 className="text-sm font-semibold text-white truncate leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
              {movie.title}
            </h3>
            <p className="text-xs text-[--color-text-muted] mt-0.5">
              {formatYear(movie.release_date)}
            </p>
          </div>
        )}
      </Link>
    </div>
  )
}

