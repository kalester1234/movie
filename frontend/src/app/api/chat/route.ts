import { NextRequest, NextResponse } from 'next/server';
import { tmdbClient } from '@/services/tmdbClient';
import { recommendationEngine } from '@/services/recommendationEngine';

export async function POST(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const userInput = searchParams.get('user_input');

  if (!userInput) {
    return NextResponse.json({ error: "Missing user_input parameter" }, { status: 400 });
  }

  try {
    const match = await tmdbClient.searchMulti(userInput);

    if (!match) {
      console.log(`Falling back to full AI hallucination for query: ${userInput}`);
      const mockReport = await recommendationEngine.generateFullMockReport(userInput);
      return NextResponse.json(mockReport);
    }

    const tmdbId = match.id;
    const mediaType = match.media_type || "movie";

    const [details, similar, recommended, providers] = await Promise.all([
      tmdbClient.getDetails(mediaType, tmdbId),
      tmdbClient.getSimilar(mediaType, tmdbId),
      tmdbClient.getRecommendations(mediaType, tmdbId),
      tmdbClient.getWatchProviders(mediaType, tmdbId)
    ]);

    const combined = [];
    const seen = new Set();
    for (const item of [...similar, ...recommended]) {
      if (!seen.has(item.id)) {
        seen.add(item.id);
        combined.push(item);
      }
    }

    const title = details.title || details.name;
    const originalTitle = details.original_title || details.original_name;
    const year = (details.release_date || details.first_air_date || "").substring(0, 4);

    const aiReport = await recommendationEngine.generateReport(title, year);

    const targetOverview = details.overview || "";
    const rankedResults: any = await recommendationEngine.rankAndEnrichSimilar(title, targetOverview, combined.slice(0, 40));

    const candidateDict: Record<number, any> = {};
    for (const m of combined) {
        candidateDict[m.id] = m;
    }

    const processRecommendationList = async (recList: any[]) => {
      const enriched = [];
      for (const r of recList) {
        const movieId = r.id;
        const recTitle = r.title;
        let sim = null;

        if (movieId && movieId !== 0 && candidateDict[movieId]) {
          sim = candidateDict[movieId];
        } else if (recTitle) {
          sim = await tmdbClient.searchMulti(recTitle);
        }

        if (sim) {
          const simTitle = sim.title || sim.name;
          enriched.push({
            title: simTitle,
            poster_path: sim.poster_path,
            backdrop_path: sim.backdrop_path,
            year: (sim.release_date || sim.first_air_date || "").substring(0, 4),
            rating: sim.vote_average,
            similarity_score: r.similarity_score,
            why_it_matches: r.why_it_matches,
            short_summary: r.short_summary
          });
        }
      }
      return enriched;
    };

    const top3 = await processRecommendationList(rankedResults.top3Recommendations || []);
    const top10 = await processRecommendationList(rankedResults.top10SimilarRecommendations || []);

    const report = {
      basic_info: {
        title: title,
        original_title: originalTitle,
        poster_path: details.poster_path,
        backdrop_path: details.backdrop_path,
        release_date: details.release_date || details.first_air_date,
        runtime: details.runtime || details.episode_run_time,
        status: details.status,
        genres: (details.genres || []).map((g: any) => g.name)
      },
      ratings: {
        tmdb: details.vote_average,
        votes: details.vote_count
      },
      streaming_platforms: providers,
      ai_insights: aiReport,
      top_3_recommendations: top3,
      top_10_similar_recommendations: top10,
      related_movies: combined.map((r: any) => ({
        title: r.title || r.name,
        poster_path: r.poster_path,
        year: (r.release_date || r.first_air_date || "").substring(0, 4),
        rating: r.vote_average
      }))
    };

    return NextResponse.json(report);
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}






