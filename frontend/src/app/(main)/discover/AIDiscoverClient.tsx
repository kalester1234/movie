'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Sparkles, Send, Clock, Star, TrendingUp, Loader2, Brain, Film } from 'lucide-react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import type { AIRecommendationResponse } from '@/types/ai'
import { AI_PROMPT_SUGGESTIONS } from '@/types/ai'
import { getPosterUrl } from '@/utils/helpers'

const EXAMPLE_PROMPTS = [
  'Recommend me mind-bending sci-fi like Interstellar',
  'I want to cry — emotional drama movies',
  'Best psychological thrillers that keep you guessing',
  'Underrated horror films after 2015',
  'Light-hearted family comedy for the weekend',
  'Movies with stunning cinematography and visuals',
]

export default function AIDiscoverClient() {
  const searchParams = useSearchParams()
  const initialQ = searchParams.get('q') || ''
  
  const [prompt, setPrompt] = useState(initialQ)
  const [isLoading, setIsLoading] = useState(false)
  const [result, setResult] = useState<AIRecommendationResponse | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [history, setHistory] = useState<string[]>([])
  
  const hasAutoFetched = useRef(false)

  const handleSubmit = async (e: React.FormEvent | null, overridePrompt?: string) => {
    if (e) e.preventDefault()
    const q = overridePrompt ?? prompt
    if (!q.trim() || isLoading) return

    setIsLoading(true)
    setError(null)
    setResult(null)

    try {
      const res = await fetch('/api/ai/recommend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt: q }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || 'AI is not configured yet. Please add your OPENAI_API_KEY.')
        return
      }

      setResult(data)
      setHistory((h) => [q, ...h.filter((item) => item !== q)].slice(0, 5))
      setPrompt('')
    } catch {
      setError('Failed to connect to AI. Make sure your API key is configured.')
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (initialQ && !hasAutoFetched.current) {
      hasAutoFetched.current = true
      handleSubmit(null, initialQ)
    }
  }, [initialQ])

  const useExample = (example: string) => {
    setPrompt(example)
    handleSubmit(null, example)
  }

  return (
    <div className="min-h-screen max-w-[1440px] mx-auto px-6 lg:px-16 py-20">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-12"
      >
        <div className="flex items-center justify-center gap-3 mb-4">
          <div className="w-12 h-12 rounded-2xl gradient-primary flex items-center justify-center">
            <Brain className="w-6 h-6 text-white" />
          </div>
        </div>
        <h1
          className="text-4xl md:text-5xl lg:text-6xl font-extrabold mb-4"
          style={{ fontFamily: 'var(--font-display)' }}
        >
          <span className="text-gradient">AI</span>{' '}
          <span className="text-white">Discovery</span>
        </h1>
        <p className="text-lg text-[--color-text-secondary] max-w-xl mx-auto">
          Speak to CineNova AI. Discover cinema that matches your mood, rhythm, and hidden desires.
        </p>
      </motion.div>

      {/* Prompt Input */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-3xl mx-auto mb-8"
      >
        <form
          onSubmit={handleSubmit}
          className="relative flex items-center gap-3 glass-strong rounded-2xl p-3 focus-within:ring-2 focus-within:ring-[--color-primary]/50 transition-all duration-200"
        >
          <Sparkles className="w-5 h-5 text-[--color-primary] ml-2 shrink-0" />
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Describe what you want to watch tonight..."
            className="flex-1 bg-transparent text-white text-base outline-none placeholder-[--color-text-muted] py-2"
            disabled={isLoading}
            aria-label="AI movie recommendation prompt"
          />
          <button
            type="submit"
            disabled={!prompt.trim() || isLoading}
            className="shrink-0 flex items-center gap-2 px-5 py-2.5 rounded-xl gradient-primary text-white font-semibold text-sm disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-all duration-200 active:scale-95"
            aria-label="Get AI recommendations"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
            <span className="hidden sm:inline">Discover</span>
          </button>
        </form>

        {/* Search History */}
        {history.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-xs text-[--color-text-muted] flex items-center gap-1">
              <Clock className="w-3 h-3" /> Recent:
            </span>
            {history.map((h) => (
              <button
                key={h}
                onClick={() => useExample(h)}
                className="text-xs px-3 py-1.5 rounded-lg glass text-[--color-text-secondary] hover:text-white hover:bg-white/10 transition-all duration-200 max-w-[200px] truncate"
              >
                {h}
              </button>
            ))}
          </div>
        )}

        {/* Example Prompts */}
        {!result && !isLoading && (
          <div className="flex items-center gap-2 mt-4 flex-wrap justify-center">
            <span className="text-xs text-[--color-text-muted]">Try:</span>
            {EXAMPLE_PROMPTS.slice(0, 4).map((ex) => (
              <button
                key={ex}
                onClick={() => useExample(ex)}
                className="text-xs px-3 py-1.5 rounded-full bg-[--color-secondary]/10 border border-[--color-secondary]/20 text-[--color-secondary] hover:bg-[--color-secondary]/20 transition-all duration-200"
              >
                {ex}
              </button>
            ))}
          </div>
        )}
      </motion.div>

      {/* Loading State */}
      <AnimatePresence>
        {isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass-strong rounded-2xl p-8 text-center">
              <div className="flex items-center justify-center gap-3 mb-4">
                <Loader2 className="w-6 h-6 text-[--color-primary] animate-spin" />
                <span className="text-white font-semibold">Analyzing your taste...</span>
              </div>
              <div className="space-y-2 text-sm text-[--color-text-muted]">
                <p className="animate-pulse">Detecting mood and genre preferences...</p>
                <p className="animate-pulse" style={{ animationDelay: '0.5s' }}>Matching against 10,000+ films...</p>
                <p className="animate-pulse" style={{ animationDelay: '1s' }}>Crafting personalized recommendations...</p>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error State */}
      <AnimatePresence>
        {error && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-3xl mx-auto"
          >
            <div className="glass rounded-2xl p-8 border border-[--color-favorite]/30 bg-[--color-favorite]/5">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-[--color-favorite]/20 flex items-center justify-center shrink-0">
                  <Brain className="w-5 h-5 text-[--color-favorite]" />
                </div>
                <div>
                  <p className="font-semibold text-white mb-1">AI Not Available</p>
                  <p className="text-sm text-[--color-text-secondary]">{error}</p>
                  <p className="text-xs text-[--color-text-muted] mt-2">
                    Add <code className="text-[--color-primary] bg-[--color-primary]/10 px-1 rounded">OPENAI_API_KEY</code> to your <code className="text-[--color-secondary] bg-[--color-secondary]/10 px-1 rounded">.env.local</code> file to enable AI recommendations.
                  </p>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Results */}
      <AnimatePresence>
        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="max-w-5xl mx-auto space-y-8"
          >
            {/* AI Analysis Card */}
            <div className="glass-strong rounded-2xl p-6 border border-[--color-primary]/20">
              <div className="flex items-center gap-2 mb-3">
                <Brain className="w-5 h-5 text-[--color-primary]" />
                <h2 className="font-bold text-white" style={{ fontFamily: 'var(--font-display)' }}>AI Analysis</h2>
              </div>
              <p className="text-[--color-text-secondary] text-sm leading-relaxed mb-3">
                {result.mood_analysis}
              </p>
              {result.watch_order && (
                <p className="text-xs text-[--color-text-muted] border-t border-white/5 pt-3 mt-3">
                  <strong className="text-white">Watch Order:</strong> {result.watch_order}
                </p>
              )}
            </div>

            {/* Recommendations Grid */}
            <div>
              <h2 className="text-xl font-bold text-white mb-5" style={{ fontFamily: 'var(--font-display)' }}>
                <Sparkles className="w-5 h-5 text-[--color-primary] inline mr-2" />
                Recommended For You
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {result.recommendations.map((rec, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    className="glass-card rounded-2xl overflow-hidden border border-white/5 hover:border-[--color-primary]/30 transition-all duration-300 group relative"
                  >
                    {rec.tmdbId && (
                      <Link href={`/movie/${rec.tmdbId}`} className="absolute inset-0 z-10" aria-label={`View ${rec.title}`} />
                    )}
                    
                    {rec.posterPath && (
                      <div className="relative h-40 overflow-hidden">
                        <img
                          src={getPosterUrl(rec.posterPath, 'lg')}
                          alt={rec.title}
                          className="w-full h-full object-cover object-top transition-transform duration-500 group-hover:scale-110"
                        />
                        <div className="absolute inset-0 gradient-overlay-bottom" />
                        {rec.voteAverage && (
                          <span className="absolute top-3 right-3 px-2 py-1 rounded-lg bg-black/60 backdrop-blur text-xs font-bold text-[--color-gold]">
                            ★ {rec.voteAverage.toFixed(1)}
                          </span>
                        )}
                      </div>
                    )}
                    <div className="p-5">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <h3 className="font-bold text-white text-base leading-snug" style={{ fontFamily: 'var(--font-display)' }}>
                          {rec.title} {rec.year && <span className="text-[--color-text-muted] font-normal text-sm">({rec.year})</span>}
                        </h3>
                      </div>
                      <div className="flex gap-2 flex-wrap mb-3">
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[--color-primary]/15 border border-[--color-primary]/20 text-[--color-primary] uppercase tracking-wider">
                          {rec.mood}
                        </span>
                        <span className="text-[10px] font-bold px-2 py-1 rounded-full bg-[--color-secondary]/15 border border-[--color-secondary]/20 text-[--color-secondary] uppercase tracking-wider">
                          {rec.similarity}
                        </span>
                      </div>
                      <p className="text-sm text-[--color-text-secondary] leading-relaxed line-clamp-3">
                        {rec.reason}
                      </p>
                      {rec.tmdbId && (
                        <Link
                          href={`/movie/${rec.tmdbId}`}
                          className="inline-flex items-center gap-1.5 mt-4 text-sm font-semibold text-[--color-primary] hover:text-[--color-primary-hover] transition-colors"
                        >
                          <Film className="w-4 h-4" />
                          View Details →
                        </Link>
                      )}
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Suggestions when idle */}
      {!result && !isLoading && !error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
          className="max-w-4xl mx-auto mt-8"
        >
          <p className="text-center text-sm text-[--color-text-muted] mb-6 uppercase tracking-widest">
            Popular Prompts
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {AI_PROMPT_SUGGESTIONS.map((suggestion) => (
              <button
                key={suggestion.text}
                onClick={() => useExample(suggestion.text)}
                className="glass-card rounded-xl p-4 text-left hover:border-[--color-primary]/30 hover:bg-[--color-primary]/5 border border-white/5 transition-all duration-200 group"
              >
                <p className="text-sm font-medium text-white group-hover:text-[--color-primary] transition-colors">
                  {suggestion.text}
                </p>
                <p className="text-xs text-[--color-text-muted] mt-1 capitalize">{suggestion.category}</p>
              </button>
            ))}
          </div>
        </motion.div>
      )}
    </div>
  )
}
