import { Suspense } from 'react'
import { notFound } from 'next/navigation'
import Image from 'next/image'
import Link from 'next/link'
import { getMovieDetails } from '@/services/tmdb'
import { getBackdropUrl, getPosterUrl, formatYear, getRatingBg, cn, formatCurrency } from '@/utils/helpers'
import { Star, Clock, Calendar, Film, DollarSign, Globe, TrendingUp, Play } from 'lucide-react'
import VideoPlayer from '@/components/movie/VideoPlayer'
import MovieDetailClient from './MovieDetailClient'
import MovieCard from '@/components/features/movies/MovieCard'
import AISuggestions from '@/components/movie/AISuggestions'

export const revalidate = 3600 // Cache for 1 hour

interface MoviePageProps {
  params: Promise<{ id: string }>
}

function formatRuntime(minutes: number) {
  const h = Math.floor(minutes / 60)
  const m = minutes % 60
  return h > 0 ? `${h}h ${m}m` : `${m}m`
}

export default async function MoviePage({ params }: MoviePageProps) {
  const resolvedParams = await params
  const movieId = parseInt(resolvedParams.id, 10)
  if (isNaN(movieId)) return notFound()

  let movie
  try {
    movie = await getMovieDetails(movieId)
  } catch (error) {
    return notFound()
  }

  const backdropUrl = movie.backdrop_path
    ? getBackdropUrl(movie.backdrop_path, 'original')
    : null

  const posterUrl = movie.poster_path
    ? getPosterUrl(movie.poster_path, 'lg')
    : null

  // Get streaming providers (defaults to US for now)
  const countryCode = 'US'
  const watchData = movie['watch/providers']?.results?.[countryCode]
  
  const officialTrailer = movie.videos?.results?.find(
    (v) => v.type === 'Trailer' && v.site === 'YouTube' && v.official
  ) || movie.videos?.results?.find((v) => v.site === 'YouTube')

  return (
    <div className="relative min-h-screen bg-[--color-background] pb-20">
      {/* Cinematic Ambient Glow */}
      {backdropUrl && (
        <div 
          className="absolute inset-0 top-0 left-0 right-0 h-[120vh] w-full z-0 opacity-40 pointer-events-none"
          style={{
            backgroundImage: `url(${backdropUrl})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'blur(100px)',
            WebkitMaskImage: 'linear-gradient(to bottom, black 0%, transparent 100%)'
          }}
          aria-hidden="true"
        />
      )}

      {/* ─── Hero Section ─── */}
      <div className="relative w-full h-[60vh] md:h-[80vh] overflow-hidden z-10">
        {backdropUrl ? (
          <Image
            src={backdropUrl}
            alt={movie.title}
            fill
            className="object-cover object-top"
            priority
            unoptimized
          />
        ) : (
          <div className="absolute inset-0 bg-zinc-900" />
        )}
        
        {/* Gradient overlays to blend into the background */}
        <div className="absolute inset-0 bg-black/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-[--color-background] via-[--color-background]/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-[--color-background] via-[--color-background]/80 to-transparent md:w-[70%]" />

        {/* Hero Content */}
        <div className="absolute inset-0 max-w-[1440px] mx-auto px-6 lg:px-16 flex items-end pb-12 md:pb-24">
          <div className="flex flex-col md:flex-row gap-8 md:gap-12 items-start md:items-end w-full">
            
            {/* Poster Card */}
            {posterUrl && (
              <div className="hidden md:block w-[260px] lg:w-[320px] shrink-0 rounded-2xl overflow-hidden shadow-2xl ring-1 ring-white/10 relative z-10">
                <Image
                  src={posterUrl}
                  alt={movie.title}
                  width={320}
                  height={480}
                  className="w-full h-auto object-cover"
                  priority
                  unoptimized
                />
              </div>
            )}

            {/* Info */}
            <div className="flex-1 relative z-10 w-full">
              <div className="flex flex-wrap gap-2 mb-4">
                {movie.genres?.map((g) => (
                  <span key={g.id} className="px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-wider bg-white/10 border border-white/20 text-white backdrop-blur-md">
                    {g.name}
                  </span>
                ))}
              </div>
              
              <h1 className="text-4xl md:text-5xl lg:text-7xl font-extrabold text-white mb-2 leading-tight" style={{ fontFamily: 'var(--font-display)' }}>
                {movie.title}
              </h1>
              
              {movie.tagline && (
                <p className="text-lg md:text-2xl text-[--color-text-secondary] italic mb-6 font-light">
                  "{movie.tagline}"
                </p>
              )}

              <div className="flex flex-wrap items-center gap-6 text-sm md:text-base text-[--color-text-muted] font-medium mb-6">
                {movie.vote_average > 0 && (
                  <div className="flex items-center gap-1.5 text-white">
                    <Star className="w-5 h-5 fill-[--color-gold] text-[--color-gold]" />
                    <span className="font-bold text-lg">{movie.vote_average.toFixed(1)}</span>
                    <span className="text-xs opacity-60 ml-1">({movie.vote_count} votes)</span>
                  </div>
                )}
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4" />
                  {formatYear(movie.release_date)}
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4" />
                  {formatRuntime(movie.runtime)}
                </div>
                {movie.status !== 'Released' && (
                  <div className="px-2 py-0.5 rounded bg-[--color-primary]/20 text-[--color-primary] text-xs font-bold uppercase">
                    {movie.status}
                  </div>
                )}
              </div>
              
              <div className="mt-8">
                <MovieDetailClient 
                  movie={{
                    id: movie.id,
                    title: movie.title,
                    poster_path: movie.poster_path,
                    homepage: movie.homepage
                  } as any} 
                  trailer={officialTrailer} 
                />
              </div>

            </div>
            
            {/* ─── Recommended Movies (Banner Right Side) ─── */}
            {movie.recommendations?.results && movie.recommendations.results.length > 0 && (
              <div className="hidden xl:block w-[580px] shrink-0 relative z-10 self-end mb-4 bg-black/20 backdrop-blur-md p-6 rounded-[2rem] border border-white/10">
                <h3 className="text-base font-bold text-white mb-5 uppercase tracking-widest opacity-90 flex items-center justify-between">
                  <span>More Like This</span>
                </h3>
                <div className="flex gap-5 overflow-x-auto pb-2 scrollbar-hide snap-x">
                  {movie.recommendations.results.slice(0, 3).map(recommendedMovie => (
                    <Link href={`/movie/${recommendedMovie.id}`} key={recommendedMovie.id} className="w-[160px] shrink-0 group block relative rounded-2xl overflow-hidden ring-1 ring-white/10 aspect-[2/3] snap-start hover:ring-white/40 transition-all duration-300 shadow-2xl">
                      <Image
                        src={getPosterUrl(recommendedMovie.poster_path, 'sm')}
                        alt={recommendedMovie.title}
                        fill
                        className="object-cover group-hover:scale-110 transition-transform duration-500"
                      />
                      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors duration-300 flex items-center justify-center">
                        <Play className="w-10 h-10 text-white opacity-0 group-hover:opacity-100 transition-opacity duration-300 drop-shadow-2xl" />
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}

          </div>
        </div>
      </div>

      {/* ─── Main Content ─── */}
      <div className="relative z-10 max-w-[1440px] mx-auto px-6 lg:px-16 mt-8 md:mt-12 grid grid-cols-1 lg:grid-cols-3 gap-12">
        
        {/* Left Column: Overview, Cast, Trailer */}
        <div className="lg:col-span-2 space-y-12">
          
          {/* ─── Similar Movies (Mobile Only) ─── */}
          {movie.similar?.results && movie.similar.results.length > 0 && (
            <div className="block lg:hidden">
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Similar Movies</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {movie.similar.results.slice(0, 10).map(similarMovie => (
                  <MovieCard key={similarMovie.id} movie={similarMovie} size="sm" />
                ))}
              </div>
            </div>
          )}

          {/* Overview */}
          <section>
            <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Storyline</h2>
            <p className="text-lg text-[--color-text-secondary] leading-relaxed">
              {movie.overview || "No overview available."}
            </p>
          </section>

          {/* Top Cast */}
          {movie.credits?.cast && movie.credits.cast.length > 0 && (
            <section>
              <h2 className="text-2xl font-bold text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>Top Cast</h2>
              <div className="flex gap-4 overflow-x-auto pb-4 scrollbar-hide snap-x">
                {movie.credits.cast.slice(0, 10).map(actor => (
                  <div key={actor.id} className="w-[120px] shrink-0 snap-start group">
                    <div className="w-[120px] h-[120px] rounded-full overflow-hidden bg-white/5 mb-3 ring-2 ring-transparent group-hover:ring-[--color-primary]/50 transition-all duration-300">
                      {actor.profile_path ? (
                        <Image
                          src={getPosterUrl(actor.profile_path, 'sm')}
                          alt={actor.name}
                          width={120}
                          height={120}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs text-[--color-text-muted]">No Image</div>
                      )}
                    </div>
                    <p className="text-sm font-semibold text-white truncate text-center">{actor.name}</p>
                    <p className="text-xs text-[--color-text-muted] truncate text-center">{actor.character}</p>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
        {/* Right Column: Streaming, Details */}
        <div className="space-y-8">
          
          {/* Where to Watch (Streaming) */}
          <div className="glass-strong rounded-2xl p-6 border border-white/5">
            <h3 className="text-lg font-bold text-white mb-4 border-b border-white/10 pb-4" style={{ fontFamily: 'var(--font-display)' }}>
              Where to Watch
            </h3>
            
            {!watchData ? (
              <p className="text-sm text-[--color-text-muted]">No streaming data available for this region.</p>
            ) : (
              <div className="space-y-5">
                {watchData.flatrate && (
                  <div>
                    <p className="text-xs text-[--color-text-muted] uppercase tracking-wider mb-2 font-semibold">Stream</p>
                    <div className="flex flex-wrap gap-3">
                      {watchData.flatrate.map(provider => (
                        <div key={provider.provider_id} className="relative group cursor-help">
                          <Image
                            src={getPosterUrl(provider.logo_path, 'sm')}
                            alt={provider.provider_name}
                            width={44}
                            height={44}
                            className="rounded-xl ring-1 ring-white/20 shadow-md group-hover:scale-110 group-hover:ring-[--color-primary] transition-all"
                            title={provider.provider_name}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {watchData.rent && (
                  <div>
                    <p className="text-xs text-[--color-text-muted] uppercase tracking-wider mb-2 font-semibold">Rent</p>
                    <div className="flex flex-wrap gap-3">
                      {watchData.rent.map(provider => (
                        <div key={provider.provider_id} className="relative group cursor-help">
                          <Image
                            src={getPosterUrl(provider.logo_path, 'sm')}
                            alt={provider.provider_name}
                            width={40}
                            height={40}
                            className="rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                            title={provider.provider_name}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {watchData.buy && (
                  <div>
                    <p className="text-xs text-[--color-text-muted] uppercase tracking-wider mb-2 font-semibold">Buy</p>
                    <div className="flex flex-wrap gap-3">
                      {watchData.buy.map(provider => (
                        <div key={provider.provider_id} className="relative group cursor-help">
                          <Image
                            src={getPosterUrl(provider.logo_path, 'sm')}
                            alt={provider.provider_name}
                            width={40}
                            height={40}
                            className="rounded-lg opacity-80 hover:opacity-100 transition-opacity"
                            title={provider.provider_name}
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                
                <a
                  href={watchData.link}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-4 block w-full py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-center text-sm font-semibold text-white transition-colors border border-white/10"
                >
                  View on JustWatch →
                </a>
                <p className="text-[10px] text-[--color-text-muted] text-center mt-2 opacity-50">Powered by JustWatch</p>
              </div>
            )}
          </div>

          {/* Movie Info Details */}
          <div className="glass-card rounded-2xl p-6 border border-white/5 space-y-4">
            <h3 className="text-lg font-bold text-white mb-2" style={{ fontFamily: 'var(--font-display)' }}>Info</h3>
            
            {movie.budget > 0 && (
              <div>
                <p className="text-xs text-[--color-text-muted] uppercase tracking-wider">Budget</p>
                <p className="text-sm text-white font-medium flex items-center gap-1.5 mt-0.5">
                  <DollarSign className="w-4 h-4 text-[--color-primary]" />
                  {formatCurrency(movie.budget)}
                </p>
              </div>
            )}
            
            {movie.revenue > 0 && (
              <div>
                <p className="text-xs text-[--color-text-muted] uppercase tracking-wider">Revenue</p>
                <p className="text-sm text-white font-medium flex items-center gap-1.5 mt-0.5">
                  <TrendingUp className="w-4 h-4 text-[--color-secondary]" />
                  {formatCurrency(movie.revenue)}
                </p>
              </div>
            )}
            
            {movie.production_companies?.length > 0 && (
              <div>
                <p className="text-xs text-[--color-text-muted] uppercase tracking-wider">Studios</p>
                <div className="text-sm text-white font-medium mt-0.5 flex flex-wrap gap-1">
                  {movie.production_companies.map((c, i) => (
                    <span key={c.id}>
                      {c.name}{i < movie.production_companies.length - 1 ? ', ' : ''}
                    </span>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* AI Suggestions */}
          <AISuggestions movieTitle={movie.title} movieYear={movie.release_date?.substring(0, 4)} />

        </div>
      </div>

      {/* ─── Similar Movies (Desktop Only) ─── */}
      {movie.similar?.results && movie.similar.results.length > 0 && (
        <div className="hidden lg:block relative z-10 max-w-[1440px] mx-auto px-6 lg:px-16 mt-8 pb-10">
          <h2 className="text-2xl font-bold text-white mb-6" style={{ fontFamily: 'var(--font-display)' }}>Similar Movies</h2>
          <div className="flex gap-4 overflow-x-auto pb-6 scrollbar-hide snap-x">
            {movie.similar.results.slice(0, 15).map(similarMovie => (
              <MovieCard key={similarMovie.id} movie={similarMovie} size="md" />
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
