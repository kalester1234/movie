'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Loader2, ChevronRight, Star } from 'lucide-react'
import Link from 'next/link'
import { getPosterUrl } from '@/utils/helpers'

interface AIRecommendation {
  title: string
  year: number
  reason: string
  mood: string
  similarity: string
  tmdbId?: number
  posterPath?: string
  voteAverage?: number
}

interface AIResponse {
  mood_analysis: string
  reasoning_summary: string
  recommendations: AIRecommendation[]
}

interface AISuggestionsProps {
  movieTitle: string
  movieYear?: string
}

export default function AISuggestions({ movieTitle, movieYear }: AISuggestionsProps) {
  const [data, setData] = useState<AIResponse | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleFetchSuggestions = async () => {
    setIsLoading(true)
    setError(null)
    
    const prompt = `I just watched ${movieTitle} ${movieYear ? `(${movieYear})` : ''} and absolutely loved it. Please suggest 4 highly appropriate and relevant movies that share its specific themes, tone, pacing, and overall quality.`

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt })
      })

      if (!res.ok) {
        throw new Error('Failed to fetch recommendations')
      }

      const json = await res.json()
      setData(json)
    } catch (err) {
      setError('Unable to fetch AI suggestions right now. Please try again later.')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="glass-strong rounded-2xl p-6 border border-white/5 relative overflow-hidden group">
      {/* Background Glow */}
      <div className="absolute inset-0 bg-gradient-to-br from-[--color-primary]/10 to-[--color-secondary]/5 pointer-events-none opacity-50" />
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-5 h-5 text-[--color-primary]" />
          <h3 className="text-lg font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>
            AI Perfect Match
          </h3>
        </div>

        {!data && !isLoading && (
          <div className="text-center py-6">
            <p className="text-sm text-[--color-text-secondary] mb-6">
              Loved {movieTitle}? Let CineNova AI analyze its unique vibe and suggest the most appropriate movies for you to watch next.
            </p>
            <button
              onClick={handleFetchSuggestions}
              className="relative inline-flex items-center gap-2 px-6 py-3 rounded-xl gradient-primary text-white font-bold hover:opacity-90 transition-all shadow-[0_0_20px_rgba(124,58,237,0.3)] hover:shadow-[0_0_30px_rgba(124,58,237,0.5)] active:scale-95"
            >
              <Sparkles className="w-4 h-4" />
              Find Similar Movies
            </button>
            {error && <p className="text-xs text-red-400 mt-4">{error}</p>}
          </div>
        )}

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-10 space-y-4">
            <div className="relative">
              <Loader2 className="w-8 h-8 text-[--color-primary] animate-spin" />
              <div className="absolute inset-0 bg-[--color-primary] blur-xl opacity-20 rounded-full" />
            </div>
            <p className="text-xs font-semibold text-[--color-primary] animate-pulse uppercase tracking-widest">
              Analyzing Themes...
            </p>
          </div>
        )}

        <AnimatePresence>
          {data && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-6"
            >
              <div className="bg-white/5 p-4 rounded-xl border border-white/10 text-sm text-[--color-text-secondary] leading-relaxed italic">
                "{data.mood_analysis}"
              </div>

              <div className="space-y-4">
                {data.recommendations.map((rec, idx) => (
                  <div key={idx} className="flex gap-4 group/rec relative bg-black/20 p-3 rounded-xl border border-white/5 hover:bg-white/5 hover:border-white/10 transition-all duration-300">
                    {/* Poster */}
                    <div className="w-16 h-24 shrink-0 rounded-lg overflow-hidden bg-white/10 relative shadow-md">
                      {rec.posterPath ? (
                        <img src={getPosterUrl(rec.posterPath, 'sm')} alt={rec.title} className="w-full h-full object-cover group-hover/rec:scale-110 transition-transform duration-500" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 text-center p-1">No Image</div>
                      )}
                      
                      {rec.tmdbId && (
                        <Link href={`/movie/${rec.tmdbId}`} className="absolute inset-0 bg-black/0 group-hover/rec:bg-black/40 flex items-center justify-center transition-all duration-300 opacity-0 group-hover/rec:opacity-100">
                          <ChevronRight className="w-6 h-6 text-white" />
                        </Link>
                      )}
                    </div>
                    
                    {/* Details */}
                    <div className="flex-1 min-w-0 py-1">
                      <div className="flex justify-between items-start gap-2 mb-1">
                        <Link href={rec.tmdbId ? `/movie/${rec.tmdbId}` : '#'} className="text-sm font-bold text-white truncate hover:text-[--color-primary] transition-colors">
                          {rec.title} <span className="font-normal text-white/50">({rec.year})</span>
                        </Link>
                        {rec.voteAverage ? (
                          <div className="flex items-center gap-1 shrink-0 bg-black/40 px-1.5 py-0.5 rounded text-[10px] font-bold text-[--color-gold]">
                            <Star className="w-3 h-3 fill-current" />
                            {rec.voteAverage.toFixed(1)}
                          </div>
                        ) : null}
                      </div>
                      <div className="flex gap-2 mb-2">
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[--color-primary] bg-[--color-primary]/10 px-2 py-0.5 rounded">
                          {rec.similarity}
                        </span>
                        <span className="text-[10px] uppercase font-bold tracking-wider text-[--color-secondary] bg-[--color-secondary]/10 px-2 py-0.5 rounded truncate">
                          {rec.mood}
                        </span>
                      </div>
                      <p className="text-xs text-[--color-text-muted] line-clamp-3 leading-snug">
                        {rec.reason}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}
