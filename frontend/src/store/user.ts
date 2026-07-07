import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { User } from '@supabase/supabase-js'

interface UserState {
  user: User | null
  watchlist: number[] // array of movie_ids
  favorites: number[] // array of movie_ids
  setUser: (user: User | null) => void
  setWatchlist: (watchlist: number[]) => void
  setFavorites: (favorites: number[]) => void
  toggleWatchlist: (movieId: number) => void
  toggleFavorite: (movieId: number) => void
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      user: null,
      watchlist: [],
      favorites: [],
      setUser: (user) => set({ user }),
      setWatchlist: (watchlist) => set({ watchlist }),
      setFavorites: (favorites) => set({ favorites }),
      toggleWatchlist: (movieId) =>
        set((state) => ({
          watchlist: state.watchlist.includes(movieId)
            ? state.watchlist.filter((id) => id !== movieId)
            : [...state.watchlist, movieId],
        })),
      toggleFavorite: (movieId) =>
        set((state) => ({
          favorites: state.favorites.includes(movieId)
            ? state.favorites.filter((id) => id !== movieId)
            : [...state.favorites, movieId],
        })),
    }),
    {
      name: 'cinenova-storage', // name of the item in the storage (must be unique)
      partialize: (state) => ({ watchlist: state.watchlist, favorites: state.favorites }),
    }
  )
)
