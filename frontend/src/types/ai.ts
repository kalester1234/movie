export interface AIMovieRecommendation {
  title: string
  year?: number
  reason: string
  mood: string
  similarity: string
  tmdbId?: number
  posterPath?: string | null
  voteAverage?: number
}

export interface AIRecommendationResponse {
  recommendations: AIMovieRecommendation[]
  mood_analysis: string
  watch_order?: string
  reasoning_summary: string
}

export interface AIPromptSuggestion {
  text: string
  category: 'mood' | 'genre' | 'director' | 'era' | 'popular'
}

export const AI_PROMPT_SUGGESTIONS: AIPromptSuggestion[] = [
  { text: 'Mind-bending sci-fi like Interstellar', category: 'genre' },
  { text: 'Movies that make me cry', category: 'mood' },
  { text: 'Best psychological thrillers', category: 'genre' },
  { text: 'Underrated horror gems', category: 'genre' },
  { text: 'Family movies for the weekend', category: 'mood' },
  { text: 'Oscar winners after 2015', category: 'era' },
  { text: '90s cyberpunk classics', category: 'era' },
  { text: 'Movies by Christopher Nolan', category: 'director' },
]
