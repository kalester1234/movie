import { clsx, type ClassValue } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// ─── TMDb Image URLs ────────────────────────────────────────────────────────

const TMDB_IMAGE_BASE = 'https://image.tmdb.org/t/p'

export function getPosterUrl(path: string | null, size: 'sm' | 'md' | 'lg' | 'xl' | 'original' = 'md'): string {
  if (!path) return `https://via.placeholder.com/342x513/18181b/71717a?text=No+Image`
  const sizeMap = { sm: 'w185', md: 'w342', lg: 'w500', xl: 'w780', original: 'original' }
  return `${TMDB_IMAGE_BASE}/${sizeMap[size]}${path}`
}

export function getBackdropUrl(path: string | null, size: 'sm' | 'md' | 'lg' | 'original' = 'lg'): string {
  if (!path) return `https://via.placeholder.com/1280x720/09090b/71717a?text=No+Backdrop`
  const sizeMap = { sm: 'w300', md: 'w780', lg: 'w1280', original: 'original' }
  return `${TMDB_IMAGE_BASE}/${sizeMap[size]}${path}`
}

export function getProfileUrl(path: string | null, size = 'w185'): string {
  if (!path) return `https://ui-avatars.com/api/?background=18181b&color=a1a1aa&size=185`
  return `${TMDB_IMAGE_BASE}/${size}${path}`
}

// ─── Formatting ─────────────────────────────────────────────────────────────

export function formatRuntime(minutes: number): string {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export function formatVoteAverage(vote: number): string {
  return vote.toFixed(1)
}

export function formatCurrency(amount: number): string {
  if (amount === 0) return 'N/A'
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(amount)
}

export function formatDate(dateStr: string): string {
  if (!dateStr) return 'TBA'
  return new Date(dateStr).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export function formatYear(dateStr: string): string {
  if (!dateStr) return 'TBA'
  return new Date(dateStr).getFullYear().toString()
}

export function truncate(str: string, length: number): string {
  if (str.length <= length) return str
  return str.slice(0, length).trimEnd() + '…'
}

export function getRatingColor(rating: number): string {
  if (rating >= 8) return 'text-emerald-400'
  if (rating >= 6.5) return 'text-yellow-400'
  if (rating >= 5) return 'text-orange-400'
  return 'text-red-400'
}

export function getRatingBg(rating: number): string {
  if (rating >= 8) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
  if (rating >= 6.5) return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
  if (rating >= 5) return 'bg-orange-500/20 text-orange-400 border-orange-500/30'
  return 'bg-red-500/20 text-red-400 border-red-500/30'
}
