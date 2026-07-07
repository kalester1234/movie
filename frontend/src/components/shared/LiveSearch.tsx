'use client'

import { useState, useEffect, useRef, KeyboardEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X, Loader2, Star } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useDebounce } from '@/utils/hooks'
import { getPosterUrl, formatYear, cn } from '@/utils/helpers'
import type { TMDbMultiSearchResult } from '@/types/movie'

interface LiveSearchProps {
  onClose: () => void
}

const getMediaTypeLabel = (item: TMDbMultiSearchResult) => {
  if (item.media_type === 'movie') {
    if (item.genre_ids?.includes(99)) return 'Documentary'
    if (item.genre_ids?.includes(16)) return 'Anime/Cartoon'
    return 'Movie'
  }
  if (item.media_type === 'tv') {
    if (item.genre_ids?.includes(99)) return 'Documentary Series'
    if (item.genre_ids?.includes(16)) return 'Anime/Cartoon'
    return 'TV Series'
  }
  return 'Person'
}

export default function LiveSearch({ onClose }: LiveSearchProps) {
  const router = useRouter()
  const [query, setQuery] = useState('')
  const debouncedQuery = useDebounce(query, 300)
  const [results, setResults] = useState<TMDbMultiSearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [isOpen, setIsOpen] = useState(true)
  
  const containerRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    // Focus on mount
    inputRef.current?.focus()
    
    // Click outside handler
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        onClose()
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [onClose])

  useEffect(() => {
    if (debouncedQuery.length < 2) {
      setResults([])
      setIsOpen(false)
      setIsLoading(false)
      return
    }

    const fetchResults = async () => {
      setIsLoading(true)
      try {
        const res = await fetch(`/api/movies/search?q=${encodeURIComponent(debouncedQuery)}`)
        if (res.ok) {
          const data = await res.json()
          setResults(data.results || [])
          setIsOpen(true)
          setSelectedIndex(-1) // reset selection on new results
        }
      } catch (err) {
        console.error('Failed to fetch search results', err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchResults()
  }, [debouncedQuery])

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen) {
      if (e.key === 'Enter' && query.trim()) {
        e.preventDefault()
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        onClose()
      }
      return
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev < results.length - 1 ? prev + 1 : prev))
    } else if (e.key === 'ArrowUp') {
      e.preventDefault()
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1))
    } else if (e.key === 'Enter') {
      e.preventDefault()
      if (selectedIndex >= 0 && results[selectedIndex]) {
        handleSelect(results[selectedIndex])
      } else if (query.trim()) {
        router.push(`/search?q=${encodeURIComponent(query.trim())}`)
        onClose()
      }
    } else if (e.key === 'Escape') {
      onClose()
    }
  }

  const handleSelect = (item: TMDbMultiSearchResult) => {
    onClose()
    // For now, route everything to /movie/[id] since TV details page might not exist, 
    // but ideally we check item.media_type
    const route = item.media_type === 'person' ? `/search?q=${encodeURIComponent(item.name || '')}` : `/movie/${item.id}`
    router.push(route)
  }

  return (
    <div ref={containerRef} className="relative w-[320px] md:w-[400px]">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[--color-text-muted]" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Movies, TV Series, actors..."
          className="w-full pl-9 pr-10 py-2 rounded-xl glass text-sm text-white placeholder-[--color-text-muted] outline-none focus:border-[--color-primary] focus:glow-primary transition-all duration-200"
          aria-label="Search"
          role="combobox"
          aria-expanded={isOpen}
          aria-controls="search-results"
          aria-activedescendant={selectedIndex >= 0 ? `search-result-${selectedIndex}` : undefined}
        />
        {isLoading ? (
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <Loader2 className="w-4 h-4 text-[--color-primary] animate-spin" />
          </div>
        ) : (
          <button
            type="button"
            onClick={onClose}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[--color-text-muted] hover:text-white"
            aria-label="Close search"
          >
            <X className="w-4 h-4" />
          </button>
        )}
      </div>

      <AnimatePresence>
        {isOpen && query.length >= 2 && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#18181b]/95 backdrop-blur-xl border border-white/10 rounded-xl shadow-2xl overflow-hidden z-[100]"
            id="search-results"
            role="listbox"
          >
            {results.length > 0 ? (
              <ul className="max-h-[60vh] overflow-y-auto no-scrollbar py-2">
                {results.map((item, idx) => {
                  const title = item.title || item.name || 'Unknown'
                  const date = item.release_date || item.first_air_date
                  const isSelected = selectedIndex === idx
                  const imagePath = item.poster_path || item.profile_path
                  
                  return (
                    <li
                      key={`${item.media_type}-${item.id}`}
                      id={`search-result-${idx}`}
                      role="option"
                      aria-selected={isSelected}
                      onClick={() => handleSelect(item)}
                      onMouseEnter={() => setSelectedIndex(idx)}
                      className={cn(
                        'flex items-center gap-3 px-4 py-2 cursor-pointer transition-colors',
                        isSelected ? 'bg-white/10' : 'hover:bg-white/5'
                      )}
                    >
                      {/* Image */}
                      <div className="w-10 h-14 shrink-0 rounded overflow-hidden bg-white/5">
                        {imagePath ? (
                          <img
                            src={getPosterUrl(imagePath, 'sm')}
                            alt={title}
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-[10px] text-white/30 text-center">
                            No Img
                          </div>
                        )}
                      </div>
                      
                      {/* Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="text-sm font-semibold text-white truncate">{title}</h4>
                          {item.vote_average && item.vote_average > 0 ? (
                            <div className="flex items-center gap-1 shrink-0 text-xs text-white/80">
                              <Star className="w-3 h-3 text-[--color-gold] fill-[--color-gold]" />
                              {item.vote_average.toFixed(1)}
                            </div>
                          ) : null}
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-[10px] text-[--color-text-muted]">
                          {date && <span>{formatYear(date)}</span>}
                          {date && <span className="w-1 h-1 rounded-full bg-white/20" />}
                          <span className="uppercase tracking-wider font-semibold text-[--color-primary]/80">
                            {getMediaTypeLabel(item)}
                          </span>
                        </div>
                      </div>
                    </li>
                  )
                })}
              </ul>
            ) : (
              !isLoading && (
                <div className="px-4 py-8 text-center text-sm text-[--color-text-muted]">
                  No results found for "{query}"
                </div>
              )
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
