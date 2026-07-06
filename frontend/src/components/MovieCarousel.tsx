import React from 'react';

export const MovieCarousel = ({ title, movies, isEnriched = false, isHiddenGems = false }: { title: string, movies: any[], isEnriched?: boolean, isHiddenGems?: boolean }) => {
  if (!movies || movies.length === 0) return null;

  return (
    <div className="mb-12">
      <h2 className="text-2xl font-bold text-white mb-6 pl-2 border-l-4 border-red-600">{title}</h2>
      
      <div className="flex overflow-x-auto gap-6 pb-8 snap-x hide-scrollbar">
        {movies.map((movie, idx) => {
          const posterUrl = movie.poster_path ? `https://image.tmdb.org/t/p/w300${movie.poster_path}` : null;
          
          return (
            <div key={idx} className="min-w-[280px] max-w-[280px] snap-start flex-shrink-0 bg-white/5 border border-white/10 rounded-xl overflow-hidden hover:scale-105 transition-transform duration-300">
              {posterUrl ? (
                <img src={posterUrl} alt={movie.title} className="w-full h-[400px] object-cover" />
              ) : (
                <div className="w-full h-[400px] bg-gray-900 flex items-center justify-center text-gray-500 text-sm">No Poster</div>
              )}
              
              <div className="p-4">
                <h3 className="font-bold text-white text-lg truncate mb-1">{movie.title}</h3>
                <div className="flex items-center justify-between text-xs text-gray-400 mb-3">
                  <span>{movie.year}</span>
                  {movie.rating && <span className="text-yellow-500">⭐ {movie.rating.toFixed(1)}</span>}
                </div>

                {isEnriched && (
                  <>
                    <div className="text-green-400 font-black text-sm mb-2">
                      {movie.similarity_score ? `${movie.similarity_score}% Match` : ''}
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-3 mb-2">{movie.short_summary}</p>
                    <p className="text-xs text-red-300 italic line-clamp-3">"{movie.why_it_matches}"</p>
                  </>
                )}

                {isHiddenGems && (
                  <>
                    <div className="flex gap-1 mb-2 overflow-hidden">
                      {movie.genres?.map((g: string, i: number) => (
                         <span key={i} className="text-[10px] bg-white/10 px-1.5 py-0.5 rounded">{g}</span>
                      ))}
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-3 mb-2">{movie.summary}</p>
                    <p className="text-[11px] text-red-300 bg-red-950/30 p-2 rounded">🔥 {movie.why_deserves_attention}</p>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
