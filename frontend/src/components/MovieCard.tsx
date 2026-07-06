import React from 'react';

export interface Movie {
  title: string;
  year: string;
  similarity_score: string;
  streaming_on: string[];
  why_you_will_like_it: string;
  genres: string[];
}

export const MovieCard = ({ movie }: { movie: Movie }) => {
  return (
    <div className="glass rounded-xl overflow-hidden transition-all duration-300 hover:scale-[1.02] hover:shadow-2xl hover:shadow-red-900/20 group">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-gray-400">
              {movie.title}
            </h3>
            <div className="flex items-center gap-3 mt-2 text-sm text-gray-400">
              <span className="bg-white/10 px-2 py-1 rounded">{movie.year}</span>
              <span className="text-green-400 font-semibold">{movie.similarity_score} Match</span>
            </div>
          </div>
        </div>

        <p className="text-gray-300 text-sm leading-relaxed mb-6">
          {movie.why_you_will_like_it}
        </p>

        <div className="flex flex-wrap gap-2 mb-4">
          {movie.genres.map((genre, idx) => (
            <span key={idx} className="text-xs px-3 py-1 rounded-full border border-gray-700 text-gray-400">
              {genre}
            </span>
          ))}
        </div>

        <div className="pt-4 border-t border-white/10 flex justify-between items-center">
          <div className="text-xs text-gray-500">
            Available on: <span className="text-gray-300">{movie.streaming_on.join(', ')}</span>
          </div>
          <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
            Watch Trailer
          </button>
        </div>
      </div>
    </div>
  );
};
