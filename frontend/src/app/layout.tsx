import type { Metadata } from 'next'
import './globals.css'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { ThemeProvider } from 'next-themes'

export const metadata: Metadata = {
  title: {
    default: 'CineNova — AI Movie Recommendations',
    template: '%s | CineNova',
  },
  description:
    'Discover your next favorite movie with AI-powered personalized recommendations. Search, discover, and track movies with CineNova.',
  keywords: ['movies', 'AI recommendations', 'movie discovery', 'watchlist', 'film ratings'],
  authors: [{ name: 'CineNova' }],
  creator: 'CineNova',
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://cinenova.app',
    siteName: 'CineNova',
    title: 'CineNova — AI Movie Recommendations',
    description: 'Discover your next favorite movie with AI-powered personalized recommendations.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'CineNova — AI Movie Recommendations',
    description: 'Discover your next favorite movie with AI-powered personalized recommendations.',
  },
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem={false}
          forcedTheme="dark"
        >
          <QueryProvider>
            {children}
          </QueryProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
