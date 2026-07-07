import Link from 'next/link'
import { Film, X, Camera, Code2 } from 'lucide-react'

const footerLinks = {
  Discover: [
    { label: 'Trending', href: '/' },
    { label: 'AI Match', href: '/discover' },
    { label: 'Top Rated', href: '/movies?sort=top_rated' },
    { label: 'Upcoming', href: '/movies?sort=upcoming' },
    { label: 'Genres', href: '/movies' },
  ],
  Account: [
    { label: 'My Watchlist', href: '/watchlist' },
  ],
}

export default function Footer() {
  return (
    <footer className="border-t border-white/5 bg-[--color-surface] mt-auto">
      <div className="max-w-[1440px] mx-auto px-6 lg:px-16 py-16">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-10">
          {/* Brand */}
          <div className="col-span-2 md:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center">
                <Film className="w-4 h-4 text-white" />
              </div>
              <span
                className="text-lg font-bold text-gradient"
                style={{ fontFamily: 'var(--font-display)' }}
              >
                CineNova
              </span>
            </Link>
            <p className="text-sm text-[--color-text-secondary] leading-relaxed mb-6 max-w-[240px]">
              AI-powered movie discovery platform. Find your next favorite film with intelligent recommendations.
            </p>
            <div className="flex items-center gap-3">
              {[
                { Icon: X, label: 'X (Twitter)', href: '#' },
                { Icon: Camera, label: 'Instagram', href: '#' },
                { Icon: Code2, label: 'GitHub', href: '#' },
              ].map(({ Icon, label, href }) => (
                <a
                  key={label}
                  href={href}
                  aria-label={label}
                  className="w-9 h-9 rounded-lg glass flex items-center justify-center text-[--color-text-muted] hover:text-white hover:border-[--color-primary]/30 transition-all duration-200"
                >
                  <Icon className="w-4 h-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Groups */}
          {Object.entries(footerLinks).map(([group, links]) => (
            <div key={group}>
              <h4
                className="text-xs font-bold text-[--color-text-muted] uppercase tracking-widest mb-4"
              >
                {group}
              </h4>
              <ul className="flex flex-col gap-2.5">
                {links.map(({ label, href }) => (
                  <li key={label}>
                    <Link
                      href={href}
                      className="text-sm text-[--color-text-secondary] hover:text-white transition-colors duration-200"
                    >
                      {label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[--color-text-muted]">
            © {new Date().getFullYear()} CineNova AI. All rights reserved.
          </p>
          <p className="text-xs text-[--color-text-muted]">
            Movie data provided by{' '}
            <a
              href="https://www.themoviedb.org"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--color-secondary] hover:underline"
            >
              TMDb
            </a>
          </p>
        </div>
      </div>
    </footer>
  )
}
