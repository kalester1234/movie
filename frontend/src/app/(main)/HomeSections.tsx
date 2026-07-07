'use client'

import { motion } from 'framer-motion'
import Link from 'next/link'
import dynamic from 'next/dynamic'
import { getProfileUrl } from '@/utils/helpers'
import type { TMDbMovie, TMDbGenre, TMDbPerson } from '@/types/movie'
import {
  Sparkles, Zap, Heart, Ghost, Laugh, Globe, Clapperboard, Swords, Film, Star
} from 'lucide-react'

const GENRE_ICONS: Record<string, React.ElementType> = {
  Action: Zap,
  Comedy: Laugh,
  Drama: Clapperboard,
  Horror: Ghost,
  Romance: Heart,
  'Science Fiction': Film,
  Thriller: Swords,
  Adventure: Globe,
  Fantasy: Sparkles,
  Crime: Swords,
}

interface HomeSectionsProps {
  trendingMovies: TMDbMovie[]
  popularMovies: TMDbMovie[]
  topRatedMovies: TMDbMovie[]
  nowPlayingMovies: TMDbMovie[]
  upcomingMovies: TMDbMovie[]
  genres: TMDbGenre[]
  popularPeople: TMDbPerson[]
}

// Dynamically import heavy components to speed up compilation and render time
const MovieCarousel = dynamic(() => import('@/components/features/movies/MovieCarousel'))
const VaultSection = dynamic(() => import('@/components/features/movies/VaultSection'))
const HeroAutoplay = dynamic(() => import('@/components/shared/HeroAutoplay'))


export default function HomeSections({
  trendingMovies,
  popularMovies,
  topRatedMovies,
  nowPlayingMovies,
  upcomingMovies,
  genres,
  popularPeople,
}: HomeSectionsProps) {
  const heroMovies = trendingMovies.slice(0, 5)

  return (
    <>
      {heroMovies.length > 0 && <HeroAutoplay movies={heroMovies} />}
      
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-10 space-y-10">
        <VaultSection />

      {/* Trending This Week */}
      <MovieCarousel
        title="Trending This Week"
        subtitle="Most watched right now, globally"
        movies={trendingMovies}
        viewAllHref="/movies?sort=trending"
        accentColor="#ef4444"
      />

      {/* AI Picks Banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
        className="relative rounded-2xl overflow-hidden glass border border-[--color-primary]/20 p-8 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-[--color-primary]/10 to-[--color-secondary]/5 pointer-events-none" aria-hidden="true" />
        <div className="relative text-center md:text-left">
          <div className="flex items-center gap-2 justify-center md:justify-start mb-3">
            <Sparkles className="w-5 h-5 text-[--color-primary]" />
            <span className="text-sm font-bold text-[--color-primary] uppercase tracking-widest">AI Discovery</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>
            Find Your Perfect Movie
          </h2>
          <p className="text-[--color-text-secondary] max-w-md">
            Describe your mood, a genre, a vibe — CineNova AI finds exactly what you need.
          </p>
        </div>
        <Link
          href="/discover"
          className="relative shrink-0 flex items-center gap-2 px-8 py-4 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-all duration-200 shadow-[0_0_32px_rgba(124,58,237,0.3)] hover:shadow-[0_0_48px_rgba(124,58,237,0.5)]"
        >
          <Sparkles className="w-5 h-5" />
          Try AI Match
        </Link>
      </motion.div>

      {/* Popular Movies */}
      <MovieCarousel
        title="Popular Right Now"
        movies={popularMovies}
        viewAllHref="/movies?sort=popular"
        accentColor="#38bdf8"
      />

      {/* Now Playing */}
      <MovieCarousel
        title="Now Playing"
        subtitle="In cinemas this week"
        movies={nowPlayingMovies}
        viewAllHref="/movies?sort=now_playing"
        accentColor="#10b981"
      />

      {/* Top Rated */}
      <MovieCarousel
        title="Top Rated All Time"
        subtitle="The highest rated movies ever"
        movies={topRatedMovies}
        viewAllHref="/movies?sort=top_rated"
        accentColor="#f59e0b"
      />

      {/* Explore Genres */}
      {genres.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-xl md:text-2xl font-bold text-white mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Explore Genres
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
            {genres.slice(0, 12).map((genre) => {
              const Icon = GENRE_ICONS[genre.name] ?? Star
              return (
                <Link
                  key={genre.id}
                  href={`/movies?genre=${genre.id}`}
                  className="group flex flex-col items-center gap-3 p-5 rounded-xl glass border border-white/5 hover:border-[--color-primary]/30 hover:bg-[--color-primary]/5 transition-all duration-200 hover:-translate-y-1"
                >
                  <div className="w-10 h-10 rounded-xl bg-[--color-primary]/10 group-hover:bg-[--color-primary]/20 flex items-center justify-center transition-all duration-200">
                    <Icon className="w-5 h-5 text-[--color-primary]" />
                  </div>
                  <span className="text-sm font-semibold text-[--color-text-secondary] group-hover:text-white transition-colors duration-200 text-center">
                    {genre.name}
                  </span>
                </Link>
              )
            })}
          </div>
        </motion.section>
      )}

      {/* Upcoming */}
      <MovieCarousel
        title="Coming Soon"
        subtitle="Upcoming releases to look forward to"
        movies={upcomingMovies}
        viewAllHref="/movies?sort=upcoming"
        accentColor="#a78bfa"
      />

      {/* Popular People */}
      {popularPeople.length > 0 && (
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <h2
            className="text-xl md:text-2xl font-bold text-white mb-5"
            style={{ fontFamily: 'var(--font-display)' }}
          >
            Popular Talent
          </h2>
          <div className="flex gap-6 overflow-x-auto no-scrollbar pb-2">
            {popularPeople.slice(0, 15).map((person) => (
              <motion.div
                key={person.id}
                className="shrink-0 flex flex-col items-center gap-3 group cursor-pointer"
                whileHover={{ y: -4 }}
                transition={{ duration: 0.2 }}
              >
                <div className="w-20 h-20 rounded-full overflow-hidden ring-2 ring-white/10 group-hover:ring-[--color-primary]/50 transition-all duration-200">
                  <img
                    src={getProfileUrl(person.profile_path)}
                    alt={person.name}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(person.name)}&background=18181b&color=a1a1aa&size=80`
                    }}
                  />
                </div>
                <div className="text-center">
                  <p className="text-sm font-semibold text-white group-hover:text-[--color-primary] transition-colors w-24 truncate">
                    {person.name}
                  </p>
                  <p className="text-xs text-[--color-text-muted]">{person.known_for_department}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>
      )}
    </div>
    </>
  )
}
