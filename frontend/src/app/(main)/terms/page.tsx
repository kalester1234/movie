export default function TermsOfServicePage() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-32">
      <h1 className="text-4xl font-black text-white mb-8" style={{ fontFamily: 'var(--font-display)' }}>
        Terms of Service
      </h1>
      <div className="prose prose-invert prose-p:text-[--color-text-secondary] prose-h2:text-white max-w-none">
        <p className="lead text-lg mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
          <p className="mb-4">
            By accessing and using CineNova AI, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by these terms, please do not use this platform.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
          <p className="mb-4">
            CineNova AI grants you a personal, non-exclusive, non-transferable license to use our platform for discovering movies and generating AI recommendations for personal entertainment purposes.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">3. External APIs and Data</h2>
          <p className="mb-4">
            Our platform utilizes external data sources, including TMDB. By using our service, you acknowledge that movie data, posters, and metadata are provided by third-party services and are subject to their respective terms and conditions.
          </p>
        </section>
      </div>
    </div>
  )
}
