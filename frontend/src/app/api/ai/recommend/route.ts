import { type NextRequest } from 'next/server'
import { getOpenAIClient, OPENAI_AVAILABLE } from '@/lib/openai'
import { searchMovies } from '@/services/tmdb'
import { createClient } from '@/lib/supabase/server'
import { z } from 'zod'

const RequestSchema = z.object({
  prompt: z.string().min(3).max(500),
})

export async function POST(request: NextRequest) {
  if (!OPENAI_AVAILABLE) {
    return Response.json(
      { error: 'OPENAI_API_KEY is not configured. Please add it to your .env.local file.' },
      { status: 503 }
    )
  }

  try {
    const body = await request.json()
    const result = RequestSchema.safeParse(body)
    
    if (!result.success) {
      return Response.json({ error: 'Invalid prompt provided.' }, { status: 400 })
    }

    const { prompt } = result.data
    const openai = getOpenAIClient()

    // 1. Get recommendations from OpenAI
    const systemInstruction = `You are an expert movie recommendation engine. The user will provide a prompt describing the kind of movies they want to watch. 
You MUST return a raw JSON object with the following exact structure:
{
  "mood_analysis": "A short, engaging paragraph analyzing what mood/vibe the user is looking for.",
  "reasoning_summary": "A brief summary of why you chose these films.",
  "watch_order": "Optional: A suggested watch order (e.g., Start with X, then Y for a double feature).",
  "recommendations": [
    {
      "title": "Movie Title",
      "year": 2023,
      "reason": "2-3 sentences explaining exactly why this fits their prompt.",
      "mood": "e.g., Mind-Bending, Heartwarming, Gritty",
      "similarity": "e.g., 95% Match"
    }
  ]
}
Provide exactly 4 to 6 movie recommendations in the array. Focus on highly rated, relevant movies.`

    const isGroq = process.env.OPENAI_API_KEY?.startsWith('gsk_')
    const response = await openai.chat.completions.create({
      model: isGroq ? 'llama-3.3-70b-versatile' : 'gpt-4o-mini',
      messages: [
        { role: 'system', content: systemInstruction },
        { role: 'user', content: prompt }
      ],
      response_format: { type: 'json_object' },
      temperature: 0.7,
    })

    const aiText = response.choices[0].message.content || '{}'
    
    let aiData
    try {
      aiData = JSON.parse(aiText)
    } catch (e) {
      console.error('Failed to parse AI response:', aiText)
      return Response.json({ error: 'Failed to generate recommendations. Please try again.' }, { status: 500 })
    }

    if (!aiData.recommendations || !Array.isArray(aiData.recommendations) || aiData.recommendations.length === 0) {
      return Response.json({ error: 'No recommendations found for your prompt.' }, { status: 404 })
    }

    // 2. Fetch movie details from TMDb to augment the AI recommendations
    const enrichedRecommendations = await Promise.all(
      aiData.recommendations.map(async (rec: any) => {
        try {
          const res = await searchMovies(rec.title, 1)
          const tmdbMovie = res.results[0]
          if (tmdbMovie) {
            return {
              ...rec,
              tmdbId: tmdbMovie.id,
              posterPath: tmdbMovie.poster_path,
              voteAverage: tmdbMovie.vote_average
            }
          }
        } catch (e) {
          // ignore tmdb fetch errors for individual movies
        }
        return rec
      })
    )

    aiData.recommendations = enrichedRecommendations

    // 3. Log to Supabase (optional, non-blocking)
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      await supabase.from('ai_history').insert({
        user_id: user.id,
        prompt: prompt,
        response: aiData
      })
    }

    return Response.json(aiData)
  } catch (error) {
    console.error('AI Route Error:', error)
    return Response.json({ error: 'An unexpected error occurred.' }, { status: 500 })
  }
}
