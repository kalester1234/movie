"use client";
import React, { useState, useRef, useEffect } from 'react';
import { MovieCard, Movie } from './MovieCard';

interface Message {
  type: 'user' | 'ai';
  text: string;
  movies?: Movie[];
}

export const ChatBox = () => {
  const [messages, setMessages] = useState<Message[]>([
    { type: 'ai', text: 'Welcome to CineVerse AI. Tell me what kind of movie or vibe you are looking for tonight!' }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || loading) return;

    const userQuery = input.trim();
    setInput('');
    setMessages(prev => [...prev, { type: 'user', text: userQuery }]);
    setLoading(true);

    try {
      const response = await fetch(`http://127.0.0.1:8000/api/v1/chat/?user_input=${encodeURIComponent(userQuery)}`, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
      });
      
      const data = await response.json();
      
      if (data.recommendations && data.recommendations.length > 0) {
        setMessages(prev => [...prev, { 
          type: 'ai', 
          text: `I found some great matches based on your request:`,
          movies: data.recommendations
        }]);
      } else {
        setMessages(prev => [...prev, { type: 'ai', text: data.reply || "I couldn't process that request." }]);
      }
    } catch (error) {
      setMessages(prev => [...prev, { type: 'ai', text: "Error connecting to the AI brain. Is the backend server running?" }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)] max-w-5xl mx-auto">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.map((msg, idx) => (
          <div key={idx} className={`flex ${msg.type === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] ${msg.type === 'user' ? 'bg-red-600 text-white px-6 py-3 rounded-2xl rounded-tr-sm' : ''}`}>
              {msg.type === 'ai' && (
                <div className="flex items-center gap-2 mb-2">
                  <div className="w-8 h-8 rounded-full bg-red-600 flex items-center justify-center font-bold text-xs">AI</div>
                  <span className="font-semibold text-gray-300">CineVerse</span>
                </div>
              )}
              
              <div className={msg.type === 'ai' ? 'text-gray-300 text-lg leading-relaxed mb-4' : 'text-lg'}>
                {msg.text}
              </div>

              {msg.movies && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  {msg.movies.map((movie, mIdx) => (
                    <MovieCard key={mIdx} movie={movie} />
                  ))}
                </div>
              )}
            </div>
          </div>
        ))}
        
        {loading && (
          <div className="flex justify-start">
            <div className="flex items-center gap-3 text-gray-400">
              <div className="w-8 h-8 rounded-full bg-red-900/50 flex items-center justify-center animate-pulse">AI</div>
              <div className="flex gap-1">
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce"></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></span>
                <span className="w-2 h-2 bg-gray-500 rounded-full animate-bounce" style={{ animationDelay: '0.4s' }}></span>
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="glass-panel p-4 pb-8 sticky bottom-0 z-10 w-full rounded-t-3xl">
        <form onSubmit={handleSubmit} className="relative max-w-4xl mx-auto">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="E.g., I'm looking for a mind-bending sci-fi movie like Inception..."
            className="w-full bg-white/5 border border-white/10 rounded-full py-4 pl-6 pr-16 text-white placeholder-gray-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition-all text-lg"
            disabled={loading}
          />
          <button 
            type="submit"
            disabled={loading || !input.trim()}
            className="absolute right-2 top-2 bottom-2 bg-red-600 hover:bg-red-700 disabled:bg-gray-700 disabled:cursor-not-allowed text-white w-12 rounded-full flex items-center justify-center transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 19.5l15-15m0 0H8.25m11.25 0v11.25" />
            </svg>
          </button>
        </form>
      </div>
    </div>
  );
};
