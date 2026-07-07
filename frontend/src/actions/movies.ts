'use server'

import { discoverMovies, getMoviesByGenre } from '@/services/tmdb'

export async function getMoviesByGenreAction(genreId: number, page: number = 1) {
  try {
    const res = await getMoviesByGenre(genreId, page)
    return res.results
  } catch (error) {
    console.error(`[Action] Error fetching movies for genre ${genreId}:`, error)
    return []
  }
}


export async function getVaultMoviesAction(startYear: string, endYear: string) {
  try {
    let gte = ''
    let lte = ''

    if (startYear === '1998' && endYear === 'Below') {
      lte = '1998-12-31'
    } else {
      gte = `${endYear}-01-01`
      lte = `${startYear}-12-31`
    }

    const [res1, res2] = await Promise.all([
      discoverMovies({
        'primary_release_date.gte': gte || undefined,
        'primary_release_date.lte': lte,
        page: 1,
      }),
      discoverMovies({
        'primary_release_date.gte': gte || undefined,
        'primary_release_date.lte': lte,
        page: 2,
      })
    ])

    return [...res1.results, ...res2.results]
  } catch (error) {
    console.error('[Action] Error fetching vault movies:', error)
    return []
  }
}
