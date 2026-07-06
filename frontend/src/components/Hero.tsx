import React from 'react';

export const Hero = ({ data, onSearch }: { data: any, onSearch?: (title: string) => void }) => {
  const { basic_info, ai_insights, ratings, streaming_platforms } = data;
  const top3 = data.top_3_recommendations || [];
  
  const backdropUrl = basic_info.backdrop_path 
    ? `https://image.tmdb.org/t/p/original${basic_info.backdrop_path}`
    : 'https://www.transparenttextures.com/patterns/stardust.png';
    
  const posterUrl = basic_info.poster_path
    ? `https://image.tmdb.org/t/p/w500${basic_info.poster_path}`
    : null;

  return (
    <div className="relative w-full min-h-[80vh] flex items-center">
      <div 
        className="absolute inset-0 bg-cover bg-center z-0"
        style={{ backgroundImage: `url(${backdropUrl})` }}
      />
      <div className="absolute inset-0 bg-gradient-to-r from-black via-black/80 to-transparent z-10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0f] via-transparent to-transparent z-10" />

      <div className="relative z-20 max-w-[1600px] w-full mx-auto px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 pt-12">
        <div className="lg:col-span-3 flex justify-center lg:justify-start items-start">
          {posterUrl && (
            <img src={posterUrl} alt="Poster" className="w-72 h-[432px] object-cover shrink-0 rounded-xl shadow-2xl shadow-red-900/50 hidden md:block border border-white/10" />
          )}
        </div>
        
        <div className="lg:col-span-4 flex flex-col">
          <h1 className="text-6xl font-black text-white mb-2 tracking-tight">
            {basic_info.title} <span className="text-gray-400 font-normal">({basic_info.release_date?.substring(0,4)})</span>
          </h1>
          
          <div className="flex flex-wrap items-center gap-4 text-sm font-semibold mb-6">
            <span className="text-yellow-400 flex items-center gap-1">
              ⭐ {ratings.tmdb ? ratings.tmdb.toFixed(1) : 'N/A'}
            </span>
            <span className="bg-red-600 px-2 py-1 rounded text-white">{ai_insights.recommendation_score}</span>
            <span className="text-gray-300 border border-gray-600 px-2 py-1 rounded">{basic_info.runtime} min</span>
            <span className="text-gray-300">{basic_info.status}</span>
          </div>
          
          <div className="flex flex-wrap gap-2 mb-6">
            {basic_info.genres.map((g: string, i: number) => (
              <span key={i} className="bg-white/10 px-3 py-1 rounded-full text-sm text-gray-200 backdrop-blur-sm border border-white/5">{g}</span>
            ))}
          </div>

          <div className="bg-white/5 border border-white/10 rounded-xl p-5 mb-6 backdrop-blur-md">
            <h3 className="text-red-500 font-bold mb-2 uppercase tracking-wider text-sm">Spoiler-Free Summary</h3>
            <p className="text-gray-300 leading-relaxed text-sm line-clamp-6">
              {ai_insights.summary}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-6 mb-8">
            <div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Why People Love It</h3>
              <p className="text-gray-200 text-sm leading-relaxed line-clamp-3">{ai_insights.why_people_love_it || "AI analysis unavailable."}</p>
            </div>
            <div>
              <h3 className="text-gray-400 text-sm uppercase tracking-wider mb-2">Mood & Themes</h3>
              <div className="flex flex-wrap gap-1">
                {[...(ai_insights.mood || []), ...(ai_insights.themes || [])].map((t: string, i: number) => (
                  <span key={i} className="text-xs text-red-300 bg-red-950/50 px-2 py-1 rounded">{t}</span>
                ))}
              </div>
            </div>
          </div>
          
          {streaming_platforms && streaming_platforms.length > 0 && (
            <div className="flex flex-col gap-3 mt-4">
              <span className="text-gray-400 text-sm uppercase tracking-wider font-semibold">Available on</span>
              <div className="flex flex-wrap gap-4">
                {streaming_platforms.map((p: any, i: number) => (
                  <div 
                    key={i} 
                    className="flex items-center gap-3 bg-[#1a1a1a]/80 backdrop-blur-md border border-[#e50914]/40 shadow-[0_0_12px_rgba(229,9,20,0.15)] px-4 py-2 rounded-xl hover:scale-105 hover:bg-[#252525] hover:border-[#e50914]/80 transition-all duration-300 cursor-pointer group"
                  >
                    {p.logo_path ? (
                      <img src={`https://image.tmdb.org/t/p/w45${p.logo_path}`} alt={p.name} className="w-6 h-6 rounded-md object-cover" />
                    ) : (
                      <div className="w-6 h-6 rounded-md bg-white/10 flex items-center justify-center">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-4 h-4 text-gray-300">
                          <path d="M19.5 3h-15C3.12 3 2 4.12 2 5.5v13C2 19.88 3.12 21 4.5 21h15c1.38 0 2.5-1.12 2.5-2.5v-13C22 4.12 20.88 3 19.5 3zM10 15.5v-7l6 3.5-6 3.5z" />
                        </svg>
                      </div>
                    )}
                    <span className="text-sm font-semibold text-white group-hover:text-white/90">{p.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Side Panel: Top 3 Recommendations */}
        <div className="lg:col-span-4 lg:col-start-9 flex flex-col items-end">
          {top3.length > 0 && (
            <div className="w-full max-w-[420px] flex flex-col gap-4">
            <h3 className="text-white font-bold text-lg mb-2">Top 3 Recommendations</h3>
            {top3.map((movie: any, idx: number) => (
              <div key={idx} className="bg-white/5 border border-white/10 rounded-xl p-4 backdrop-blur-md flex flex-col gap-3 transition hover:bg-white/10">
                <div className="flex gap-4">
                  {movie.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w200${movie.poster_path}`} alt={movie.title} className="w-16 h-24 object-cover rounded shadow-md shrink-0" />
                  ) : (
                    <div className="w-16 h-24 bg-gray-800 rounded shrink-0 flex items-center justify-center text-xs text-gray-500 text-center">No Image</div>
                  )}
                  <div className="flex flex-col flex-1">
                    <h4 className="text-white font-bold leading-tight">{movie.title}</h4>
                    <span className="text-gray-400 text-xs mb-1">{movie.year} • ⭐ {movie.rating ? movie.rating.toFixed(1) : 'N/A'}</span>
                    <span className="text-red-500 font-bold text-xs mt-1 block">
                      {movie.similarity_score ? `${movie.similarity_score}% Match` : ''}
                    </span>
                    {movie.why_it_matches && (
                      <p className="text-gray-300 text-xs line-clamp-2 leading-relaxed">
                        "{movie.why_it_matches}"
                      </p>
                    )}
                  </div>
                </div>
                <button 
                  onClick={() => onSearch && onSearch(movie.title)}
                  className="w-full bg-white/10 hover:bg-white/20 text-white text-xs font-semibold py-2 rounded transition"
                >
                  View Details
                </button>
              </div>
            ))}
          </div>
        )}
        </div>

      </div>
    </div>
  );
};
