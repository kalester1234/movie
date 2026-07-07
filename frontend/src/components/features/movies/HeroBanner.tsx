'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Play, Info, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react'
import { getBackdropUrl, formatYear, truncate } from '@/utils/helpers'
import type { TMDbMovie } from '@/types/movie'
import { SkeletonHero } from './SkeletonCard'

interface HeroBannerProps {
  movies: TMDbMovie[]
  isLoading?: boolean
}

export default function HeroBanner({ movies, isLoading = false }: HeroBannerProps) {
  const [current, setCurrent] = useState(0)
  const [direction, setDirection] = useState(1)

  const go = useCallback((idx: number) => {
    setDirection(idx > current ? 1 : -1)
    setCurrent(idx)
  }, [current])

  const next = useCallback(() => {
    go((current + 1) % movies.length)
  }, [current, go, movies.length])

  const prev = useCallback(() => {
    go((current - 1 + movies.length) % movies.length)
  }, [current, go, movies.length])

  // Auto-advance
  useEffect(() => {
    if (movies.length <= 1) return
    const timer = setInterval(next, 7000)
    return () => clearInterval(timer)
  }, [next, movies.length])

  if (isLoading) return <SkeletonHero />
  if (!movies.length) return null

  const movie = movies[current]
  const backdropUrl = getBackdropUrl(movie.backdrop_path, 'original')

  const variants = {
    enter: (dir: number) => ({
      x: dir > 0 ? '5%' : '-5%',
      opacity: 0,
      scale: 1.02,
    }),
    center: { x: 0, opacity: 1, scale: 1 },
    exit: (dir: number) => ({
      x: dir > 0 ? '-5%' : '5%',
      opacity: 0,
      scale: 0.98,
    }),
  }

  return (
    <section className="relative w-full h-[78vh] min-h-[540px] max-h-[860px] overflow-hidden" aria-label="Featured movies">
      {/* Background Image */}
      <AnimatePresence initial={false} custom={direction} mode="sync">
        <motion.div
          key={movie.id}
          custom={direction}
          variants={variants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{ duration: 0.6, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="absolute inset-0"
          aria-hidden="true"
        >
          <img
            src={backdropUrl}
            alt=""
            className="w-full h-full object-cover object-top"
          />
          {/* Gradient overlays */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#09090b] via-[#09090b]/70 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#09090b] via-transparent to-[#09090b]/30" />
        </motion.div>
      </AnimatePresence>

      {/* Content */}
      <div className="relative h-full max-w-[1440px] mx-auto px-6 lg:px-16 flex flex-col justify-end pb-14">
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={movie.id + '-content'}
            custom={direction}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.45, ease: 'easeOut' }}
            className="max-w-2xl"
          >
            {/* Badge */}
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs font-bold uppercase tracking-widest text-[--color-secondary] flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-[--color-secondary] animate-pulse" aria-hidden="true" />
                Featured
              </span>
              <span className="text-xs text-[--color-text-muted]">•</span>
              <span className="text-xs text-[--color-text-muted]">{formatYear(movie.release_date)}</span>
              {movie.vote_average > 0 && (
                <>
                  <span className="text-xs text-[--color-text-muted]">•</span>
                  <span className="text-xs font-semibold text-[--color-gold]">
                    ★ {movie.vote_average.toFixed(1)}
                  </span>
                </>
              )}
            </div>

            {/* Title */}
            <h1
              className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-none tracking-tight mb-4"
              style={{ fontFamily: 'var(--font-display)' }}
            >
              {movie.title}
            </h1>

            {/* Overview */}
            <p className="text-base md:text-lg text-[--color-text-secondary] leading-relaxed mb-8 max-w-xl">
              {truncate(movie.overview, 180)}
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-wrap items-center gap-3">
              <Link
                href={`/movie/${movie.id}`}
                className="flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-semibold text-sm hover:opacity-90 transition-all duration-200 shadow-lg hover:shadow-[0_0_24px_rgba(124,58,237,0.4)] active:scale-95"
              >
                <Play className="w-4 h-4 fill-white" />
                Explore Movie
              </Link>
              <Link
                href="/discover"
                className="flex items-center gap-2 px-6 py-3 rounded-xl glass text-white font-semibold text-sm hover:bg-white/10 transition-all duration-200 active:scale-95"
              >
                <Sparkles className="w-4 h-4 text-[--color-primary]" />
                AI Recommend
              </Link>
              <Link
                href={`/movie/${movie.id}`}
                className="flex items-center gap-2 px-5 py-3 rounded-xl text-[--color-text-secondary] hover:text-white font-semibold text-sm transition-all duration-200"
              >
                <Info className="w-4 h-4" />
                More Info
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>

        {/* Slide Controls */}
        <div className="absolute right-6 lg:right-16 bottom-16 flex items-center gap-3">
          <button
            onClick={prev}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-white hover:bg-white/15 transition-all duration-200"
            aria-label="Previous featured movie"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          {/* Dot indicators */}
          <div className="flex gap-1.5" role="tablist" aria-label="Featured movie slides">
            {movies.slice(0, 8).map((m, i) => (
              <button
                key={m.id}
                role="tab"
                aria-selected={i === current}
                aria-label={`Go to ${m.title}`}
                onClick={() => go(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === current
                    ? 'w-6 bg-white'
                    : 'w-1.5 bg-white/30 hover:bg-white/50'
                }`}
              />
            ))}
          </div>

          <button
            onClick={next}
            className="w-9 h-9 rounded-full glass flex items-center justify-center text-white hover:bg-white/15 transition-all duration-200"
            aria-label="Next featured movie"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </section>
  )
}
