'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Plus, Check, Heart, Share2, ExternalLink, X } from 'lucide-react'
import type { TMDbMovieDetails, TMDbVideo } from '@/types/movie'
import { useUserStore } from '@/store/user'

interface MovieDetailClientProps {
  movie: TMDbMovieDetails
  trailer?: TMDbVideo
}

export default function MovieDetailClient({ movie, trailer }: MovieDetailClientProps) {
  const { watchlist, favorites, toggleWatchlist, toggleFavorite } = useUserStore()
  
  const inWatchlist = watchlist.includes(movie.id)
  const isFavorite = favorites.includes(movie.id)
  
  const [showTrailer, setShowTrailer] = useState(false)
  const [isSticky, setIsSticky] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setIsSticky(window.scrollY > 500)
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <>
      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {trailer && (
          <button
            onClick={() => setShowTrailer(true)}
            className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-lg hover:glow-primary active:scale-95"
            aria-label={`Watch trailer for ${movie.title}`}
          >
            <Play className="w-4 h-4 fill-white" />
            Watch Trailer
          </button>
        )}

        <button
          onClick={() => {
            toggleWatchlist(movie.id)
          }}
          className={`flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-sm transition-all duration-200 active:scale-95 ${
            inWatchlist
              ? 'bg-[--color-success]/20 border border-[--color-success]/40 text-[--color-success]'
              : 'glass text-white hover:bg-white/10'
          }`}
          aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
          aria-pressed={inWatchlist}
        >
          {inWatchlist ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
          {inWatchlist ? 'In Watchlist' : 'Add to List'}
        </button>

        <button
          onClick={() => {
            toggleFavorite(movie.id)
          }}
          className={`p-3 rounded-xl transition-all duration-200 active:scale-95 ${
            isFavorite
              ? 'bg-[--color-favorite]/20 border border-[--color-favorite]/40 text-[--color-favorite]'
              : 'glass text-[--color-text-secondary] hover:text-white'
          }`}
          aria-label={isFavorite ? 'Remove from favorites' : 'Add to favorites'}
          aria-pressed={isFavorite}
        >
          <Heart className={`w-5 h-5 ${isFavorite ? 'fill-current' : ''}`} />
        </button>

        <button
          className="p-3 rounded-xl glass text-[--color-text-secondary] hover:text-white transition-all duration-200"
          aria-label="Share movie"
          onClick={() => {
            if (navigator.share) {
              navigator.share({ title: movie.title, url: window.location.href })
            }
          }}
        >
          <Share2 className="w-5 h-5" />
        </button>

        {movie.homepage && (
          <a
            href={movie.homepage}
            target="_blank"
            rel="noopener noreferrer"
            className="p-3 rounded-xl glass text-[--color-text-secondary] hover:text-white transition-all duration-200"
            aria-label="Official website"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        )}
      </div>

      {/* Trailer Modal */}
      <AnimatePresence>
        {showTrailer && trailer && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/90 backdrop-blur-md"
            onClick={() => setShowTrailer(false)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.25, 0.46, 0.45, 0.94] }}
              className="relative w-full max-w-5xl aspect-video rounded-2xl overflow-hidden shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <iframe
                src={`https://www.youtube.com/embed/${trailer.key}?autoplay=1&rel=0`}
                title={`${movie.title} Trailer`}
                className="w-full h-full"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
              />
              <button
                onClick={() => setShowTrailer(false)}
                className="absolute top-4 right-4 w-10 h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-all z-10"
                aria-label="Close trailer"
              >
                <X className="w-5 h-5" />
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </>
  )
}
