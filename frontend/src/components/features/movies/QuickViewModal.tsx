'use client'

import { useEffect, useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { X, Play, Plus, Check, Info } from 'lucide-react'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useUIStore } from '@/store/ui'
import { useUserStore } from '@/store/user'
import { getMovieDetails } from '@/services/tmdb'
import { getBackdropUrl, formatYear, cn } from '@/utils/helpers'
import type { TMDbMovieDetails, TMDbVideo } from '@/types/movie'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

export default function QuickViewModal() {
  const { quickViewMovie, setQuickViewMovie } = useUIStore()
  const { watchlist, toggleWatchlist } = useUserStore()
  const [details, setDetails] = useState<TMDbMovieDetails | null>(null)
  const [trailer, setTrailer] = useState<TMDbVideo | null>(null)
  const [isVideoReady, setIsVideoReady] = useState(false)

  const isWishlisted = quickViewMovie ? watchlist.includes(quickViewMovie.id) : false

  useEffect(() => {
    if (!quickViewMovie) {
      setDetails(null)
      setTrailer(null)
      setIsVideoReady(false)
      return
    }

    const fetchDetails = async () => {
      try {
        const data = await getMovieDetails(quickViewMovie.id)
        setDetails(data)
        
        const officialTrailer = data.videos?.results?.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || data.videos?.results?.find((v) => v.site === 'YouTube')
        
        if (officialTrailer) {
          setTrailer(officialTrailer)
        }
      } catch (e) {
        console.error('Failed to fetch movie details for Quick View', e)
      }
    }
    
    fetchDetails()
  }, [quickViewMovie])

  // Close on Escape key
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setQuickViewMovie(null)
    }
    if (quickViewMovie) window.addEventListener('keydown', handleEsc)
    return () => window.removeEventListener('keydown', handleEsc)
  }, [quickViewMovie, setQuickViewMovie])

  if (!quickViewMovie) return null

  const backdrop = details?.backdrop_path || quickViewMovie.backdrop_path

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-[300] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
        onClick={() => setQuickViewMovie(null)}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
          className="relative w-full max-w-3xl bg-[--color-surface] rounded-2xl overflow-hidden shadow-2xl border border-white/10"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Close Button */}
          <button
            onClick={() => setQuickViewMovie(null)}
            className="absolute top-4 right-4 w-10 h-10 z-50 rounded-full bg-black/60 backdrop-blur flex items-center justify-center text-white hover:bg-black/80 transition-all"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Media Header (Trailer or Image) */}
          <div className="relative w-full aspect-video bg-black overflow-hidden">
            {trailer ? (
              <div className={cn("absolute inset-0 transition-opacity duration-1000 scale-[1.1]", isVideoReady ? 'opacity-100' : 'opacity-0')}>
                <ReactPlayer
                  url={`https://www.youtube.com/watch?v=${trailer.key}`}
                  width="100%"
                  height="100%"
                  playing={true}
                  muted={true}
                  loop={true}
                  onReady={() => setIsVideoReady(true)}
                  config={{
                    youtube: {
                      playerVars: { disablekb: 1, controls: 0, modestbranding: 1, rel: 0, showinfo: 0 }
                    } as any
                  }}
                />
              </div>
            ) : null}

            {/* Fallback/Loading Backdrop */}
            <div className={cn("absolute inset-0 transition-opacity duration-1000", isVideoReady ? 'opacity-0' : 'opacity-100')}>
              {backdrop && (
                <img
                  src={getBackdropUrl(backdrop, 'lg')}
                  alt={quickViewMovie.title}
                  className="w-full h-full object-cover"
                />
              )}
            </div>

            {/* Gradient to text */}
            <div className="absolute inset-0 bg-gradient-to-t from-[--color-surface] to-transparent pointer-events-none" />
          </div>

          {/* Content */}
          <div className="px-8 pb-8 -mt-8 relative z-10">
            <h2 className="text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
              {quickViewMovie.title}
            </h2>
            <div className="flex items-center gap-3 text-sm text-[--color-text-muted] mb-4 font-semibold">
              <span className="text-[--color-success]">{quickViewMovie.vote_average.toFixed(1)} Rating</span>
              <span>{formatYear(quickViewMovie.release_date)}</span>
              {details?.runtime && <span>{Math.floor(details.runtime / 60)}h {details.runtime % 60}m</span>}
            </div>
            
            <p className="text-sm text-[--color-text-secondary] leading-relaxed line-clamp-3 mb-6">
              {details?.overview || quickViewMovie.overview}
            </p>

            <div className="flex items-center gap-4">
              <Link
                href={`/movie/${quickViewMovie.id}`}
                onClick={() => setQuickViewMovie(null)}
                className="flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all active:scale-95 shadow-lg"
              >
                <Play className="w-4 h-4 fill-black" />
                Full Details
              </Link>
              
              <button
                onClick={() => {
                  toggleWatchlist(quickViewMovie.id)
                }}
                className={cn(
                  'flex items-center justify-center w-12 h-12 rounded-full border transition-all duration-200 active:scale-95',
                  isWishlisted
                    ? 'bg-[--color-success]/20 border-[--color-success]/40 text-[--color-success]'
                    : 'glass text-white hover:bg-white/10'
                )}
                aria-label={isWishlisted ? "Remove from List" : "Add to List"}
              >
                {isWishlisted ? <Check className="w-5 h-5" /> : <Plus className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  )
}
