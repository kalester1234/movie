import { Suspense } from 'react'
import type { Metadata } from 'next'
import {
  getTrending,
  getPopularMovies,
  getTopRatedMovies,
  getNowPlayingMovies,
  getUpcomingMovies,
  getGenres,
  getPopularPeople,
} from '@/services/tmdb'
import HeroBanner from '@/components/features/movies/HeroBanner'
import { SkeletonHero } from '@/components/features/movies/SkeletonCard'
import HomeSections from './HomeSections'

import type { TMDbMovie } from '@/types/movie'

function minimizeMovie(m: TMDbMovie): TMDbMovie {
  return {
    id: m.id,
    title: m.title,
    original_title: m.original_title || '',
    overview: m.overview || '',
    poster_path: m.poster_path,
    backdrop_path: m.backdrop_path,
    release_date: m.release_date || '',
    vote_average: m.vote_average || 0,
    vote_count: m.vote_count || 0,
    popularity: m.popularity || 0,
    genre_ids: m.genre_ids || [],
    adult: m.adult || false,
    original_language: m.original_language || '',
    video: m.video || false,
  }
}

function minimizeMovies(movies: any[]): TMDbMovie[] {
  if (!movies || !Array.isArray(movies)) return []
  return movies.map(minimizeMovie)
}

export const metadata: Metadata = {
  title: 'CineNova — Discover Movies Powered by AI',
  description:
    'Discover your next favorite movie with AI-powered personalized recommendations. Browse trending, top-rated, and upcoming films.',
}

export default async function HomePage() {
  const [trending, popular, topRated, nowPlaying, upcoming, genreData, people] =
    await Promise.allSettled([
      getTrending('week'),
      getPopularMovies(),
      getTopRatedMovies(),
      getNowPlayingMovies(),
      getUpcomingMovies(),
      getGenres(),
      getPopularPeople(),
    ])

  const trendingMovies = trending.status === 'fulfilled' ? minimizeMovies(trending.value.results) : []
  const popularMovies = popular.status === 'fulfilled' ? minimizeMovies(popular.value.results) : []
  const topRatedMovies = topRated.status === 'fulfilled' ? minimizeMovies(topRated.value.results) : []
  const nowPlayingMovies = nowPlaying.status === 'fulfilled' ? minimizeMovies(nowPlaying.value.results) : []
  const upcomingMovies = upcoming.status === 'fulfilled' ? minimizeMovies(upcoming.value.results) : []
  const genres = genreData.status === 'fulfilled' ? genreData.value.genres : []
  const popularPeople = people.status === 'fulfilled' ? people.value.results : []

  // Hero: top 8 trending
  const heroMovies = trendingMovies.slice(0, 8)

  return (
    <div className="min-h-screen">
      {/* All Sections (Client Component for interactivity) */}
      <HomeSections
        trendingMovies={trendingMovies}
        popularMovies={popularMovies}
        topRatedMovies={topRatedMovies}
        nowPlayingMovies={nowPlayingMovies}
        upcomingMovies={upcomingMovies}
        genres={genres}
        popularPeople={popularPeople}
      />
    </div>
  )
}
