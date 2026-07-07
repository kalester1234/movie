'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Info, Play, ChevronLeft, ChevronRight } from 'lucide-react'
import { getBackdropUrl } from '@/utils/helpers'
import { getMovieVideos } from '@/services/tmdb'
import type { TMDbMovie } from '@/types/movie'

const ReactPlayer = dynamic(() => import('react-player'), { ssr: false }) as any

export default function HeroAutoplay({ movies }: { movies: TMDbMovie[] }) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [videoUrl, setVideoUrl] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [showVideo, setShowVideo] = useState(false)

  const activeMovie = movies[activeIndex]

  const handleNext = useCallback(() => {
    setActiveIndex((prev) => (prev + 1) % movies.length)
    setShowVideo(false)
  }, [movies.length])

  const handlePrev = useCallback(() => {
    setActiveIndex((prev) => (prev - 1 + movies.length) % movies.length)
    setShowVideo(false)
  }, [movies.length])

  // Auto-slide every 8 seconds if no video is actively being watched
  useEffect(() => {
    if (showVideo) return // Don't slide while video is playing

    const slideTimer = setInterval(handleNext, 8000)
    return () => clearInterval(slideTimer)
  }, [handleNext, showVideo])

  // Fetch trailer for the active movie
  useEffect(() => {
    let videoTimer: NodeJS.Timeout
    setVideoUrl(null)
    setShowVideo(false)
    setIsPlaying(false)

    if (!activeMovie) return

    const fetchVideo = async () => {
      try {
        const data = await getMovieVideos(activeMovie.id)
        const trailer = data.results.find(
          (v) => v.type === 'Trailer' && v.site === 'YouTube'
        ) || data.results.find((v) => v.site === 'YouTube')
        
        if (trailer) {
          setVideoUrl(`https://www.youtube.com/watch?v=${trailer.key}`)
          // Start playing after a delay (e.g., 4 seconds of dwelling)
          videoTimer = setTimeout(() => {
            setIsPlaying(true)
            setShowVideo(true)
          }, 4000)
        }
      } catch (e) {
        console.error('Failed to fetch hero video', e)
      }
    }
    fetchVideo()

    return () => clearTimeout(videoTimer)
  }, [activeMovie])

  if (!activeMovie) return null

  return (
    <div className="relative w-full h-[60vh] md:h-[80vh] bg-black overflow-hidden group -mt-16">
      {/* Background Image */}
      <AnimatePresence mode="wait">
        {!showVideo && (
          <motion.img
            key={`backdrop-${activeMovie.id}`}
            initial={{ opacity: 0, scale: 1.05 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1.2, ease: "easeInOut" }}
            src={getBackdropUrl(activeMovie.backdrop_path, 'original')}
            alt={activeMovie.title}
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
      </AnimatePresence>

      {/* Video Trailer */}
      {videoUrl && (
        <div
          className="absolute inset-0 w-full h-full pointer-events-none transition-opacity duration-1000 scale-[1.35] md:scale-[1.1]"
          style={{ opacity: showVideo ? 1 : 0 }}
        >
          <ReactPlayer
            url={videoUrl}
            width="100%"
            height="100%"
            playing={isPlaying}
            muted={true}
            loop={true}
            playsinline={true}
            config={{
              youtube: {
                playerVars: { disablekb: 1, controls: 0, modestbranding: 1, rel: 0, showinfo: 0, iv_load_policy: 3 }
              } as any
            }}
            onError={(e: any) => {
              // Ignore AbortError caused by ReactPlayer unmounting during play() initialization
              console.log('Video player gracefully exited.')
            }}
          />
        </div>
      )}

      {/* Gradients to blend into content */}
      <div className="absolute inset-0 bg-black/30" />
      <div className="absolute inset-0 gradient-overlay-bottom" />
      <div className="absolute inset-0 gradient-overlay-left md:w-[70%]" />

      {/* Navigation Arrows */}
      <div className="absolute inset-y-0 left-0 flex items-center justify-center w-[10%] z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handlePrev}
          className="w-12 h-12 rounded-full glass-strong flex items-center justify-center hover:scale-110 hover:bg-white/20 active:scale-95 transition-all text-white"
          aria-label="Previous slide"
        >
          <ChevronLeft className="w-8 h-8" />
        </button>
      </div>
      <div className="absolute inset-y-0 right-0 flex items-center justify-center w-[10%] z-30 opacity-0 group-hover:opacity-100 transition-opacity">
        <button
          onClick={handleNext}
          className="w-12 h-12 rounded-full glass-strong flex items-center justify-center hover:scale-110 hover:bg-white/20 active:scale-95 transition-all text-white"
          aria-label="Next slide"
        >
          <ChevronRight className="w-8 h-8" />
        </button>
      </div>

      {/* Content */}
      <div className="absolute inset-0 max-w-[1440px] mx-auto px-6 lg:px-16 flex flex-col justify-end pb-24 md:pb-32 pointer-events-none">
        <AnimatePresence mode="wait">
          <motion.div
            key={`content-${activeMovie.id}`}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="max-w-2xl pointer-events-auto"
          >
            <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-4 drop-shadow-2xl leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
              {activeMovie.title}
            </h1>
            <p className="text-sm md:text-lg text-white/90 line-clamp-3 mb-8 drop-shadow-md font-medium max-w-xl">
              {activeMovie.overview}
            </p>
            <div className="flex items-center gap-4 pointer-events-auto">
              <Link
                href={`/movie/${activeMovie.id}`}
                className="flex items-center gap-2 px-8 py-3.5 rounded-xl bg-white text-black font-bold hover:bg-white/90 transition-all hover:scale-105 active:scale-95 shadow-xl"
              >
                <Info className="w-5 h-5 text-black" />
                More Info
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Pagination Dots */}
      <div className="absolute bottom-10 left-0 right-0 flex justify-center gap-3 z-30 pointer-events-auto">
        {movies.map((m, idx) => (
          <button
            key={m.id}
            onClick={() => {
              setActiveIndex(idx)
              setShowVideo(false)
            }}
            className={`transition-all duration-300 rounded-full ${
              idx === activeIndex
                ? 'w-8 h-2 bg-[--color-primary] shadow-[0_0_10px_rgba(124,58,237,0.5)]'
                : 'w-2 h-2 bg-white/40 hover:bg-white/70'
            }`}
            aria-label={`Go to slide ${idx + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
