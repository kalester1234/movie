"use client";
import React, { useState, useEffect, useRef } from 'react';
import { Hero } from '@/components/Hero';
import { MovieCarousel } from '@/components/MovieCarousel';

export default function Home() {
  const [query, setQuery] = useState('');
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Autocomplete state
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showDropdown, setShowDropdown] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const executeSearch = async (queryText: string) => {
    if (!queryText.trim()) return;
    setQuery(queryText);
    setShowDropdown(false);
    setLoading(true);
    setError('');
    
    try {
      const res = await fetch(`/api/chat?user_input=${encodeURIComponent(queryText)}`, {
        method: 'POST'
      });
      const result = await res.json();
      
      if (result.error) {
        setError(result.error);
        setData(null);
      } else {
        setData(result);
      }
    } catch (err) {
      setError("Failed to connect to backend server.");
    } finally {
      setLoading(false);
    }
  };

  const searchMovie = async (e: React.FormEvent) => {
    e.preventDefault();
    executeSearch(query);
  };

  // Debounced autocomplete fetch
  useEffect(() => {
    const fetchSuggestions = async () => {
      if (query.trim().length < 2) {
        setSuggestions([]);
        setShowDropdown(false);
        return;
      }
      try {
        const res = await fetch(`/api/chat/autocomplete?query=${encodeURIComponent(query)}`);
        const result = await res.json();
        setSuggestions(result || []);
        setShowDropdown(true);
        setSelectedIndex(-1);
      } catch (err) {
        setSuggestions([]);
      }
    };

    const debounceTimer = setTimeout(() => {
      fetchSuggestions();
    }, 300);

    return () => clearTimeout(debounceTimer);
  }, [query]);

  // Close dropdown on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!showDropdown || suggestions.length === 0) return;
    
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : prev));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === 'Enter') {
      if (selectedIndex >= 0 && selectedIndex < suggestions.length) {
        e.preventDefault();
        executeSearch(suggestions[selectedIndex].title);
      }
    } else if (e.key === 'Escape') {
      setShowDropdown(false);
    }
  };

  return (
    <main className="min-h-screen bg-[#0a0a0f]">
      {/* Combined Navbar */}
      <div className="sticky top-0 z-50 bg-[#0a0a0f]/80 backdrop-blur-md border-b border-white/10 px-8 py-4 flex items-center justify-between gap-8">
        
        {/* Logo */}
        <div className="flex items-center gap-2 shrink-0">
          <div className="w-10 h-10 bg-red-600 rounded-lg flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6 text-white">
              <path d="M4.5 4.5a3 3 0 00-3 3v9a3 3 0 003 3h8.25a3 3 0 003-3v-9a3 3 0 00-3-3H4.5zM19.94 18.75l-2.69-2.69V7.94l2.69-2.69c.944-.945 2.56-.276 2.56 1.06v11.38c0 1.336-1.616 2.005-2.56 1.06z" />
            </svg>
          </div>
          <h1 className="text-2xl font-black tracking-tight text-white hidden sm:block">
            CineVerse <span className="text-red-500">AI</span>
          </h1>
        </div>

        {/* Search Bar with Autocomplete */}
        <div ref={dropdownRef} className="flex-1 max-w-2xl relative">
          <form onSubmit={searchMovie} className="relative z-50">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              onFocus={() => { if (query.trim().length >= 2 && suggestions.length > 0) setShowDropdown(true); }}
              placeholder="Enter any movie or TV series title..."
              className="w-full bg-white/5 border border-white/10 rounded-full py-3 px-6 text-white focus:border-red-500 focus:outline-none focus:bg-black transition-all"
            />
            <button type="submit" disabled={loading} className="absolute right-2 top-1/2 -translate-y-1/2 bg-red-600 px-4 py-1.5 rounded-full text-white font-medium hover:bg-red-700 disabled:opacity-50">
              {loading ? 'Searching...' : 'Search'}
            </button>
          </form>

          {/* Floating Dropdown */}
          {showDropdown && suggestions.length > 0 && (
            <div className="absolute top-full mt-2 w-full bg-[#14141a]/95 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl overflow-hidden z-40 max-h-[450px] overflow-y-auto custom-scrollbar">
              {suggestions.map((item, index) => (
                <div 
                  key={item.id} 
                  onClick={() => executeSearch(item.title)}
                  onMouseEnter={() => setSelectedIndex(index)}
                  className={`flex items-center gap-4 p-3 cursor-pointer transition-colors ${selectedIndex === index ? 'bg-white/10' : 'hover:bg-white/5'}`}
                >
                  {item.poster_path ? (
                    <img src={`https://image.tmdb.org/t/p/w92${item.poster_path}`} alt={item.title} className="w-12 h-16 object-cover rounded shadow-md shrink-0" />
                  ) : (
                    <div className="w-12 h-16 bg-white/5 rounded shrink-0 flex items-center justify-center text-[10px] text-gray-500 text-center">No Image</div>
                  )}
                  <div className="flex flex-col flex-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-white font-bold text-sm line-clamp-1">{item.title}</h4>
                      <span className="text-[10px] uppercase font-bold text-gray-400 bg-white/10 px-1.5 py-0.5 rounded">{item.media_type}</span>
                    </div>
                    <span className="text-gray-400 text-xs mt-1">{item.year} • ⭐ {item.rating ? item.rating.toFixed(1) : 'N/A'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Empty div for right-side balance */}
        <div className="w-[140px] hidden sm:block shrink-0"></div>
      </div>

      {error && <div className="p-8 text-center text-red-500">{error}</div>}

      {!data && !loading && !error && (
        <div className="flex flex-col items-center justify-center h-[70vh] text-center opacity-50">
          <h2 className="text-3xl font-bold text-white mb-2">Global Entertainment Dashboard</h2>
          <p className="text-gray-400">Search for any movie or TV show worldwide to get a full AI report.</p>
        </div>
      )}

      {data && (
        <div className="pb-24">
          <Hero data={data} onSearch={executeSearch} />
          
          <div className="max-w-[1600px] mx-auto px-8 mt-12 space-y-16">
            <MovieCarousel title="Top 10 Similar Recommendations" movies={data.top_10_similar_recommendations} isEnriched={true} />
            <MovieCarousel title="Related Movies" movies={data.related_movies} />
          </div>
        </div>
      )}
    </main>
  );
}
