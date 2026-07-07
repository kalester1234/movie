import { Suspense } from 'react'
import type { Metadata } from 'next'
import { getGenres, getMoviesByGenre } from '@/services/tmdb'
import GenreRow from '@/components/features/movies/GenreRow'
import { SkeletonHero } from '@/components/features/movies/SkeletonCard'

export const metadata: Metadata = {
  title: 'Movies By Genre — CineNova',
  description: 'Browse our entire movie collection sorted alphabetically by genre.',
}

export default async function MoviesPage() {
  // 1. Fetch all genres
  const { genres } = await getGenres()

  // 2. Sort genres alphabetically
  const sortedGenres = [...genres].sort((a, b) => a.name.localeCompare(b.name))

  // 3. Fetch initial movies for each genre to avoid client-side waterfall
  // We only fetch Page 1 (20 movies) for each genre initially
  const genreMoviesPromises = sortedGenres.map(genre => getMoviesByGenre(genre.id, 1))
  const resolvedMovies = await Promise.allSettled(genreMoviesPromises)

  return (
    <div className="min-h-screen max-w-[1440px] mx-auto px-6 lg:px-16 py-32">
      <div className="mb-12">
        <h1 className="text-4xl md:text-5xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
          Explore Movies
        </h1>
        <p className="text-[--color-text-secondary] text-lg max-w-2xl">
          Browse through our massive collection categorized by genre. Click 'Show More' to continuously easily load the next row of movies.
        </p>
      </div>

      <div className="space-y-12">
        {sortedGenres.map((genre, idx) => {
          const result = resolvedMovies[idx]
          const initialMovies = result.status === 'fulfilled' ? result.value.results : []
          
          return (
            <GenreRow 
              key={genre.id} 
              genre={genre} 
              initialMovies={initialMovies} 
            />
          )
        })}
      </div>
    </div>
  )
}
