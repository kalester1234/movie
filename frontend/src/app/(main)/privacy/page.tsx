export default function PrivacyPolicyPage() {
  return (
    <div className="min-h-screen max-w-4xl mx-auto px-6 py-32">
      <h1 className="text-4xl font-black text-white mb-8" style={{ fontFamily: 'var(--font-display)' }}>
        Privacy Policy
      </h1>
      <div className="prose prose-invert prose-p:text-[--color-text-secondary] prose-h2:text-white max-w-none">
        <p className="lead text-lg mb-8">
          Last updated: {new Date().toLocaleDateString()}
        </p>
        
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">1. Data Collection</h2>
          <p className="mb-4">
            At CineNova AI, we collect information that helps us provide you with the best possible movie recommendation experience. This includes:
          </p>
          <ul className="list-disc pl-6 mb-4 space-y-2 text-[--color-text-secondary]">
            <li>Account information (email address for login purposes)</li>
            <li>Usage data (movies you interact with, watchlists, and search queries)</li>
            <li>Preferences and ratings to improve our AI matching algorithm</li>
          </ul>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">2. Use of Information</h2>
          <p className="mb-4">
            The data we collect is exclusively used to tailor your experience. Our AI models process your watch history to generate hyper-personalized movie suggestions. We do not sell your personal data to third parties.
          </p>
        </section>

        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-4">3. Security</h2>
          <p className="mb-4">
            We implement industry-standard security measures to protect your account and data. Your passwords are encrypted, and we use secure connections (HTTPS) across the entire platform.
          </p>
        </section>
      </div>
    </div>
  )
}
