'use client'


import useEmblaCarousel from 'embla-carousel-react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { motion } from 'framer-motion'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'
import type { TMDbMovie } from '@/types/movie'
import { cn } from '@/utils/helpers'

interface MovieCarouselProps {
  title: string
  subtitle?: string
  movies: TMDbMovie[]
  isLoading?: boolean
  viewAllHref?: string
  size?: 'sm' | 'md' | 'lg'
  accentColor?: string
}

export default function MovieCarousel({
  title,
  subtitle,
  movies,
  isLoading = false,
  viewAllHref,
  size = 'md',
  accentColor,
}: MovieCarouselProps) {
  const [emblaRef, emblaApi] = useEmblaCarousel({
    align: 'start',
    dragFree: true,
    containScroll: 'trimSnaps',
  })

  const scrollPrev = () => emblaApi?.scrollPrev()
  const scrollNext = () => emblaApi?.scrollNext()

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="py-2"
    >
      {/* Header */}
      <div className="flex items-end justify-between mb-5 px-1">
        <div>
          <h2
            className="text-xl md:text-2xl font-bold text-white flex items-center gap-2"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            {accentColor && (
              <span
                className="w-1 h-6 rounded-full inline-block"
                style={{ background: accentColor }}
                aria-hidden="true"
              />
            )}
            {title}
          </h2>
          {subtitle && (
            <p className="text-sm text-[--color-text-muted] mt-1">{subtitle}</p>
          )}
        </div>
        <div className="flex items-center gap-2">
          {/* Scroll buttons */}
          <button
            onClick={scrollPrev}
            className="hidden md:flex w-8 h-8 rounded-full glass items-center justify-center text-[--color-text-secondary] hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label={`Scroll ${title} left`}
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={scrollNext}
            className="hidden md:flex w-8 h-8 rounded-full glass items-center justify-center text-[--color-text-secondary] hover:text-white hover:bg-white/10 transition-all duration-200"
            aria-label={`Scroll ${title} right`}
          >
            <ChevronRight className="w-4 h-4" />
          </button>
          {viewAllHref && (
            <a
              href={viewAllHref}
              className="text-xs font-semibold text-[--color-text-muted] hover:text-white uppercase tracking-wider transition-colors duration-200 ml-2"
            >
              View All →
            </a>
          )}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative group/carousel">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-[--color-background] to-transparent z-10 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300" />
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-[--color-background] to-transparent z-10 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300" />

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-0 select-none">
            {isLoading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="shrink-0">
                    <SkeletonCard size={size} />
                  </div>
                ))
              : movies.map((movie, idx) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    size={size}
                    priority={idx < 4}
                  />
                ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
