import type { AIRecommendationResponse } from './ai'

export interface UserProfile {
  id: string
  username: string | null
  avatar_url: string | null
  favorite_genres: string[]
  created_at: string
}

export interface WatchlistItem {
  id: string
  user_id: string
  movie_id: number
  created_at: string
  movie?: {
    title: string
    poster_path: string | null
    vote_average: number
    release_date: string
  }
}

export interface WatchHistoryItem {
  id: string
  user_id: string
  movie_id: number
  watched_at: string
  progress: number
  rating: number | null
}

export interface Review {
  id: string
  user_id: string
  movie_id: number
  rating: number
  review: string | null
  is_spoiler: boolean
  created_at: string
  profiles?: UserProfile
}

export interface AIHistoryItem {
  id: string
  user_id: string
  prompt: string
  response: AIRecommendationResponse
  created_at: string
}

export interface UserStats {
  movies_watched: number
  hours_watched: number
  favorite_genre: string
  reviews_written: number
  watchlist_count: number
}
