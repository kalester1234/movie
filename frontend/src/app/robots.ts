import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/api/', '/profile', '/watchlist'],
    },
    sitemap: 'https://cinenova.app/sitemap.xml',
  }
}
