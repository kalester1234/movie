import { create } from 'zustand'
import { TMDbMovie } from '@/types/movie'

interface UIState {
  quickViewMovie: TMDbMovie | null
  setQuickViewMovie: (movie: TMDbMovie | null) => void
}

export const useUIStore = create<UIState>((set) => ({
  quickViewMovie: null,
  setQuickViewMovie: (movie) => set({ quickViewMovie: movie }),
}))
