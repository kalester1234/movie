import {
  TMDbMovie,
  TMDbMovieDetails,
  TMDbCredits,
  TMDbVideo,
  TMDbImages,
  TMDbPaginatedResponse,
  TMDbPerson,
  TMDbReview,
  TMDbGenre,
  TMDbTimeWindow,
  TMDbMultiSearchResult,
} from '@/types/movie'

const TMDB_BASE_URL = 'https://api.themoviedb.org/3'
const API_KEY = process.env.NEXT_PUBLIC_TMDB_API_KEY || process.env.TMDB_API_KEY

if (!API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('[TMDb] No API key found. Set NEXT_PUBLIC_TMDB_API_KEY in .env.local')
}

async function tmdbFetch<T>(
  endpoint: string,
  params: Record<string, string | number | boolean> = {},
  options: RequestInit = {}
): Promise<T> {
  const url = new URL(`${TMDB_BASE_URL}${endpoint}`)
  url.searchParams.set('api_key', API_KEY || 'MISSING_KEY')
  url.searchParams.set('language', 'en-US')
  Object.entries(params).forEach(([k, v]) => url.searchParams.set(k, String(v)))

  const res = await fetch(url.toString(), {
    next: { revalidate: 3600 }, // Cache for 1 hour
    ...options,
  })

  if (!res.ok) {
    throw new Error(`TMDb API error: ${res.status} ${res.statusText} for ${endpoint}`)
  }

  return res.json() as Promise<T>
}

// ─── Movies ────────────────────────────────────────────────────────────────

export async function getTrending(
  timeWindow: TMDbTimeWindow = 'week',
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch(`/trending/movie/${timeWindow}`, { page })
}

export async function getPopularMovies(
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch('/movie/popular', { page })
}

export async function getTopRatedMovies(
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch('/movie/top_rated', { page })
}

export async function getNowPlayingMovies(
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch('/movie/now_playing', { page })
}

export async function getUpcomingMovies(
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch('/movie/upcoming', { page })
}

export async function getMovieDetails(id: number): Promise<TMDbMovieDetails> {
  return tmdbFetch(`/movie/${id}`, { append_to_response: 'videos,images,credits,reviews,similar,recommendations,watch/providers' })
}

export async function getMovieCredits(id: number): Promise<TMDbCredits> {
  return tmdbFetch(`/movie/${id}/credits`)
}

export async function getMovieVideos(id: number): Promise<{ results: TMDbVideo[] }> {
  return tmdbFetch(`/movie/${id}/videos`)
}

export async function getMovieImages(id: number): Promise<TMDbImages> {
  return tmdbFetch(`/movie/${id}/images`, {
    include_image_language: 'en,null',
  })
}

export async function getSimilarMovies(
  id: number,
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch(`/movie/${id}/similar`, { page })
}

export async function getMovieRecommendations(
  id: number,
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch(`/movie/${id}/recommendations`, { page })
}

export async function getMovieReviews(
  id: number,
  page = 1
): Promise<TMDbPaginatedResponse<TMDbReview>> {
  return tmdbFetch(`/movie/${id}/reviews`, { page })
}

export async function getMoviesByGenre(
  genreId: number,
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch('/discover/movie', {
    with_genres: genreId,
    sort_by: 'popularity.desc',
    page,
  })
}

// ─── Search ────────────────────────────────────────────────────────────────

export async function searchMovies(
  query: string,
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch('/search/movie', { query, page, include_adult: false })
}

export async function searchPeople(
  query: string,
  page = 1
): Promise<TMDbPaginatedResponse<TMDbPerson>> {
  return tmdbFetch('/search/person', { query, page })
}

export async function searchMulti(
  query: string,
  page = 1
): Promise<TMDbPaginatedResponse<TMDbMultiSearchResult>> {
  return tmdbFetch('/search/multi', { query, page, include_adult: false })
}

// ─── People ────────────────────────────────────────────────────────────────

export async function getPersonDetails(id: number): Promise<TMDbPerson> {
  return tmdbFetch(`/person/${id}`, {
    append_to_response: 'movie_credits,images',
  })
}

export async function getPopularPeople(
  page = 1
): Promise<TMDbPaginatedResponse<TMDbPerson>> {
  return tmdbFetch('/person/popular', { page })
}

// ─── Genres ────────────────────────────────────────────────────────────────

export async function getGenres(): Promise<{ genres: TMDbGenre[] }> {
  return tmdbFetch('/genre/movie/list')
}

// ─── Discover ──────────────────────────────────────────────────────────────

export async function discoverMovies(params: {
  with_genres?: string
  sort_by?: string
  'vote_average.gte'?: number
  'vote_count.gte'?: number
  primary_release_year?: number
  'primary_release_date.gte'?: string
  'primary_release_date.lte'?: string
  with_cast?: string
  with_crew?: string
  page?: number
}): Promise<TMDbPaginatedResponse<TMDbMovie>> {
  return tmdbFetch('/discover/movie', {
    sort_by: 'popularity.desc',
    include_adult: false,
    ...params,
  })
}
