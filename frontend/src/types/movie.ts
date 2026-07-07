export interface TMDbMovie {
  id: number
  title: string
  original_title: string
  overview: string
  poster_path: string | null
  backdrop_path: string | null
  release_date: string
  vote_average: number
  vote_count: number
  popularity: number
  genre_ids: number[]
  genres?: TMDbGenre[]
  adult: boolean
  original_language: string
  video: boolean
}

export interface TMDbMovieDetails extends TMDbMovie {
  runtime: number
  budget: number
  revenue: number
  status: string
  tagline: string
  homepage: string
  imdb_id: string
  production_companies: TMDbProductionCompany[]
  production_countries: { iso_3166_1: string; name: string }[]
  spoken_languages: { iso_639_1: string; name: string }[]
  belongs_to_collection: TMDbCollection | null
  videos?: { results: TMDbVideo[] }
  images?: TMDbImages
  credits?: TMDbCredits
  similar?: TMDbPaginatedResponse<TMDbMovie>
  recommendations?: TMDbPaginatedResponse<TMDbMovie>
  'watch/providers'?: TMDbWatchProviders
}

export interface TMDbGenre {
  id: number
  name: string
}

export interface TMDbProductionCompany {
  id: number
  name: string
  logo_path: string | null
  origin_country: string
}

export interface TMDbCollection {
  id: number
  name: string
  poster_path: string | null
  backdrop_path: string | null
}

export interface TMDbCastMember {
  id: number
  name: string
  character: string
  profile_path: string | null
  order: number
  known_for_department: string
}

export interface TMDbCrewMember {
  id: number
  name: string
  job: string
  department: string
  profile_path: string | null
}

export interface TMDbCredits {
  cast: TMDbCastMember[]
  crew: TMDbCrewMember[]
}

export interface TMDbVideo {
  id: string
  key: string
  name: string
  site: string
  type: string
  official: boolean
  published_at: string
}

export interface TMDbImage {
  file_path: string
  width: number
  height: number
  vote_average: number
}

export interface TMDbImages {
  backdrops: TMDbImage[]
  posters: TMDbImage[]
}

export interface TMDbPerson {
  id: number
  name: string
  profile_path: string | null
  known_for_department: string
  popularity: number
  biography?: string
  birthday?: string
  place_of_birth?: string
  known_for?: TMDbMovie[]
}

export interface TMDbMultiSearchResult {
  id: number
  media_type: 'movie' | 'tv' | 'person'
  title?: string // movie
  name?: string // tv/person
  original_title?: string
  original_name?: string
  overview?: string
  poster_path?: string | null // movie/tv
  profile_path?: string | null // person
  backdrop_path?: string | null
  release_date?: string // movie
  first_air_date?: string // tv
  vote_average?: number
  vote_count?: number
  genre_ids?: number[]
}

export interface TMDbPaginatedResponse<T> {
  page: number
  results: T[]
  total_pages: number
  total_results: number
}

export interface TMDbReview {
  id: string
  author: string
  author_details: {
    name: string
    username: string
    avatar_path: string | null
    rating: number | null
  }
  content: string
  created_at: string
}

export type TMDbTimeWindow = 'day' | 'week'
export type TMDbMediaType = 'movie' | 'tv' | 'all'

export interface TMDbProvider {
  logo_path: string
  provider_id: number
  provider_name: string
  display_priority: number
}

export interface TMDbWatchProviders {
  results: {
    [countryCode: string]: {
      link: string
      flatrate?: TMDbProvider[]
      rent?: TMDbProvider[]
      buy?: TMDbProvider[]
    }
  }
}

// Processed/UI types
export interface MovieCardData {
  id: number
  title: string
  posterPath: string | null
  backdropPath: string | null
  voteAverage: number
  releaseDate: string
  overview: string
  genreIds: number[]
  matchScore?: number
}

// Image URL helpers are in @/utils/helpers — getPosterUrl, getBackdropUrl, getProfileUrl
