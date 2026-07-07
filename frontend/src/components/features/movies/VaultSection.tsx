'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import useEmblaCarousel from 'embla-carousel-react'
import AutoScroll from 'embla-carousel-auto-scroll'
import { getVaultMoviesAction } from '@/actions/movies'
import MovieCard from './MovieCard'
import SkeletonCard from './SkeletonCard'
import type { TMDbMovie } from '@/types/movie'
import { Disc3 } from 'lucide-react'

const YEAR_RANGES = [
  { start: '2025', end: '2020' },
  { start: '2019', end: '2015' },
  { start: '2014', end: '2010' },
  { start: '2010', end: '2006' },
  { start: '2006', end: '2002' },
  { start: '2002', end: '1998' },
  { start: '1998', end: 'Below' },
]

export default function VaultSection() {
  const [activeTab, setActiveTab] = useState(0)
  const [moviesByYear, setMoviesByYear] = useState<Record<number, TMDbMovie[]>>({})
  const [isLoading, setIsLoading] = useState(true)

  const [emblaRef, emblaApi] = useEmblaCarousel(
    { align: 'start', dragFree: true, loop: true },
    [AutoScroll({ playOnInit: true, stopOnInteraction: false, speed: 1 })]
  )

  // We fetch movies when the active tab changes.
  useEffect(() => {
    async function loadMovies() {
      if (moviesByYear[activeTab]) {
        setIsLoading(false)
        return
      }

      setIsLoading(true)
      const range = YEAR_RANGES[activeTab]
      const results = await getVaultMoviesAction(range.start, range.end)
      
      setMoviesByYear(prev => ({ ...prev, [activeTab]: results }))
      setIsLoading(false)
    }
    loadMovies()
  }, [activeTab])

  const currentMovies = moviesByYear[activeTab] || []

  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-80px' }}
      transition={{ duration: 0.5, ease: 'easeOut' }}
      className="py-4 mt-8 bg-[#18181b]" // Dark background matching the image
    >
      {/* Header & Tabs Navigation matching The Vault */}
      <div className="flex flex-col md:flex-row items-center justify-center gap-8 md:gap-12 px-1 md:px-6 mb-8">
        
        {/* Year Range Tabs */}
        <div className="flex flex-wrap justify-center items-center bg-transparent border border-white/20 divide-x divide-white/20">
          {YEAR_RANGES.map((range, idx) => (
            <button
              key={idx}
              onClick={() => setActiveTab(idx)}
              className={`px-4 py-2 text-xs font-semibold whitespace-nowrap transition-colors ${
                activeTab === idx
                  ? 'bg-white text-black'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`}
            >
              {range.start}-{range.end}
            </button>
          ))}
        </div>
      </div>

      {/* Carousel */}
      <div className="relative group/carousel">
        {/* Left fade gradient */}
        <div className="absolute left-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-r from-[#18181b] to-transparent z-10 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300" />
        {/* Right fade gradient */}
        <div className="absolute right-0 top-0 bottom-0 w-12 md:w-24 bg-gradient-to-l from-[#18181b] to-transparent z-10 pointer-events-none opacity-0 group-hover/carousel:opacity-100 transition-opacity duration-300" />

        <div ref={emblaRef} className="overflow-hidden">
          <div className="flex gap-0 select-none">
            {isLoading
              ? Array.from({ length: 7 }).map((_, i) => (
                  <div key={i} className="shrink-0">
                    <SkeletonCard size="md" />
                  </div>
                ))
              : currentMovies.map((movie, idx) => (
                  <MovieCard
                    key={movie.id}
                    movie={movie}
                    size="md"
                    priority={idx < 4}
                    showDetails={false} // Match image: just posters
                  />
                ))}
          </div>
        </div>
      </div>
    </motion.section>
  )
}
