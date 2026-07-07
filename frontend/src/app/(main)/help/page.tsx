export default function HelpCenterPage() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-32">
      <h1 className="text-4xl font-black text-white mb-4" style={{ fontFamily: 'var(--font-display)' }}>
        Help Center
      </h1>
      <p className="text-lg text-[--color-text-secondary] mb-12">
        How can we assist your cinematic experience today?
      </p>

      <div className="space-y-8">
        <div className="glass-strong rounded-2xl p-6 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-3">How does the AI Match work?</h3>
          <p className="text-[--color-text-secondary] leading-relaxed">
            Our AI Match system uses advanced natural language processing to understand your highly specific prompts. You can search by mood, aesthetic, hidden themes, or even complex story arcs. The AI analyzes your intent and cross-references it with thousands of movies to find the perfect suggestion.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-6 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-3">How do I save a movie to my Watchlist?</h3>
          <p className="text-[--color-text-secondary] leading-relaxed">
            You must be signed in to save movies. Once logged in, simply hover over any movie poster and click the "+" icon that appears in the center, or click the small heart icon in the corner of a poster to add it to your Watchlist.
          </p>
        </div>

        <div className="glass-strong rounded-2xl p-6 border border-white/5">
          <h3 className="text-xl font-bold text-white mb-3">Why are there missing movie posters?</h3>
          <p className="text-[--color-text-secondary] leading-relaxed">
            We source our movie imagery dynamically from the TMDB database. Occasionally, older or extremely niche indie films may lack a high-resolution poster. In these cases, we display a fallback placeholder with the title text.
          </p>
        </div>
      </div>
    </div>
  )
}
