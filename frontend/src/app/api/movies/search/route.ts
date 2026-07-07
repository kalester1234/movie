import { type NextRequest } from 'next/server'
import { searchMulti } from '@/services/tmdb'

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const query = searchParams.get('q')

  if (!query || query.length < 2) {
    return Response.json({ results: [] })
  }

  try {
    const multiRes = await searchMulti(query)
    
    // Sort by popularity or vote_average to prioritize relevance/popularity
    // TMDb default search is already fairly relevant, but we can return top 10.
    const results = multiRes.results
      .filter((item) => item.media_type !== 'person' || item.profile_path !== null)
      .slice(0, 10)

    return Response.json(
      { results },
      {
        headers: {
          'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        },
      }
    )
  } catch (err) {
    console.error('[Search API]', err)
    return Response.json({ results: [] }, { status: 500 })
  }
}
