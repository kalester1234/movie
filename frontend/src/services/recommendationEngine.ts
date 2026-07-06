export class RecommendationEngine {
    private baseUrl: string = "https://api.groq.com/openai/v1/chat/completions";
    private model: string = "llama-3.1-8b-instant";
  
    private async callLLM(promptText: string) {
      const apiKey = process.env.OPENAI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key Missing");
      }
  
      const response = await fetch(this.baseUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: "user", content: promptText }],
          temperature: 0.1,
          response_format: { type: "json_object" }
        })
      });
  
      if (!response.ok) {
        throw new Error(`LLM Error: ${response.statusText}`);
      }
  
      const data = await response.json();
      return data.choices[0].message.content;
    }
  
    async generateReport(title: string, year: string) {
      const promptText = `You are CineVerse AI, an expert entertainment recommendation engine.
  Analyze this movie/series: "${title}" (Released: ${year}).
  
  Generate a JSON object containing the following exact keys with highly accurate analysis:
  {
      "summary": "Short, crisp 2-3 sentence spoiler-free summary (max 50 words) explaining the story, setting, and premise.",
      "why_people_love_it": "Explain why it is praised (storytelling, acting, direction, cinematography, music, impact, etc).",
      "themes": ["List", "of", "Themes"],
      "mood": ["List", "of", "Moods"],
      "content_warnings": ["Warnings", "if", "applicable"],
      "recommendation_score": "e.g. ⭐⭐⭐⭐⭐ Perfect Match",
      "hidden_gems": [
          {
              "title": "Underrated Title 1",
              "year": "YYYY",
              "genres": ["Genre"],
              "summary": "Short summary",
              "why_deserves_attention": "Why it is a hidden gem"
          }
      ]
  }
  
  Return ONLY valid JSON. No markdown tags. No extra text.`;
  
      try {
        const content = await this.callLLM(promptText);
        let parsed = JSON.parse(content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim());
        return parsed;
      } catch (e) {
        console.error("AI Report generation error:", e);
        return {
          summary: "Information currently unavailable.",
          why_people_love_it: "Information currently unavailable.",
          themes: [],
          mood: [],
          content_warnings: [],
          recommendation_score: "⭐⭐⭐ Good Match",
          hidden_gems: []
        };
      }
    }
  
    async rankAndEnrichSimilar(targetTitle: string, targetOverview: string, candidates: any[]) {
      if (candidates.length === 0) return { top3Recommendations: [], top10SimilarRecommendations: [] };
  
      const slimCandidates = candidates.map(c => ({
        id: c.id,
        title: c.title || c.name,
        overview: c.overview,
        release_date: c.release_date || c.first_air_date,
        vote_average: c.vote_average
      }));
  
const promptText = `
Act as a professional movie recommendation engine API. I will give you a target movie and a list of candidates. You must return ONLY a JSON object containing the matches.

Target Movie: "${targetTitle}"
Target Overview: ${targetOverview}

Candidates List (JSON):
${JSON.stringify(slimCandidates)}

INSTRUCTIONS:
1. Compare each candidate from the Candidates List against the Target Movie.
2. Estimate a "similarity_score" (0 to 100) based on franchise, plot, genre, and themes. The top matches MUST score 90 or above. Ignore matches below 75.
3. Return the results as a JSON object with a "recommendations" array. DO NOT WRITE ANY CODE.
4. CRITICAL: You MUST ONLY select movies that are present in the Candidates List provided above. Do not invent or hallucinate movies.

EXAMPLE OUTPUT:
{
  "recommendations": [
    {
      "id": 123,
      "title": "Example Sequel",
      "similarity_score": 95,
      "why_it_matches": "This is a direct sequel in the same universe.",
      "short_summary": "The hero returns for another adventure."
    }
  ]
}

CRITICAL: Return ONLY the JSON object. Nothing else.`;

    try {
      const content = await this.callLLM(promptText);
      console.log("RAW LLM OUTPUT:", content);
      require('fs').writeFileSync('/Users/ai-in/Documents/task 6 movies ai agent/frontend/llm_output.txt', content);
      
      let cleanedContent = content.trim();
      let parsed: any[] = [];
      
      try {
         parsed = JSON.parse(cleanedContent);
         if (parsed.recommendations && Array.isArray(parsed.recommendations)) {
           parsed = parsed.recommendations;
         }
      } catch (e) {
         const match = cleanedContent.match(/\[[\s\S]*\]/);
         if (match) {
           parsed = JSON.parse(match[0]);
         } else {
           throw new Error("Could not extract JSON array from LLM response");
         }
      }

      if (!Array.isArray(parsed)) {
        // Sometimes LLMs wrap it in an object like {"matches": [...]}
        const possibleArray = Object.values(parsed).find(val => Array.isArray(val));
        if (possibleArray) {
          parsed = possibleArray;
        } else {
          parsed = [];
        }
      }

      // Mathematical Filter in TypeScript
      const top3Recommendations = [];
      const top10SimilarRecommendations = [];

      // Ensure sorted
      parsed.sort((a, b) => {
        const scoreA = parseInt(a.similarity_score) || 0;
        const scoreB = parseInt(b.similarity_score) || 0;
        return scoreB - scoreA;
      });

      console.log("LLM Parsed array size:", parsed.length);
      
      for (const item of parsed) {
        const score = parseInt(item.similarity_score) || 0;
        
        let tmdbMovie = candidates.find(c => c.id === item.id || (c.title && c.title.toLowerCase() === item.title.toLowerCase()));
        
        // If the AI hallucinated a perfect match that isn't in candidates, fetch its real metadata!
        if (!tmdbMovie) {
           console.log("Fetching hallucinated movie:", item.title);
           const searchUrl = `https://api.themoviedb.org/3/search/movie?query=${encodeURIComponent(item.title)}&api_key=${process.env.TMDB_API_KEY}`;
           console.log("Search URL:", searchUrl);
           const searchRes = await fetch(searchUrl).then(r => r.json());
           console.log("Search Results length:", searchRes.results?.length);
           if (searchRes.results && searchRes.results.length > 0) {
             tmdbMovie = searchRes.results[0];
           } else {
             console.log("Hallucinated movie not found on TMDB");
             continue; // Cannot find movie anywhere
           }
        }
        
        const yearMatch = tmdbMovie.release_date ? tmdbMovie.release_date.substring(0, 4) : "N/A";
        
        const recObj = {
          id: tmdbMovie.id || item.id || 0,
          title: tmdbMovie.title || item.title,
          poster_path: tmdbMovie.poster_path,
          year: yearMatch,
          rating: tmdbMovie.vote_average || 0,
          similarity_score: score,
          why_it_matches: item.why_it_matches,
          short_summary: item.short_summary
        };
        
        if (score >= 90 && top3Recommendations.length < 3) {
          top3Recommendations.push(recObj);
        } else if (score >= 75 && top10SimilarRecommendations.length < 10) {
          top10SimilarRecommendations.push(recObj);
        }
      }

      return { top3Recommendations, top10SimilarRecommendations };
    } catch (e) {
      console.error("Bulk semantic reranking error:", e);
      return { top3Recommendations: [], top10SimilarRecommendations: [] };
    }
  }
    
    async generateFullMockReport(query: string) {
       const promptText = `You are CineVerse AI. The user searched for: "${query}".
Because the TMDb API is unavailable, you must hallucinate and generate a COMPLETE massive JSON dashboard payload from your own memory.

Return a JSON object EXACTLY like this:
{
  "basic_info": {
    "title": "The exact movie title",
    "original_title": "Original Title",
    "poster_path": null,
    "backdrop_path": null,
    "release_date": "YYYY-MM-DD",
    "runtime": 120,
    "status": "Released",
    "genres": ["Genre 1", "Genre 2"]
  },
  "ratings": { "tmdb": 8.5, "votes": 10000 },
  "streaming_platforms": ["Netflix", "Prime Video"],
  "ai_insights": {
    "summary": "Short, crisp 2-3 sentence spoiler-free summary (max 50 words)...",
    "why_people_love_it": "Why people love it...",
    "themes": ["Theme 1", "Theme 2"],
    "mood": ["Mood 1", "Mood 2"],
    "content_warnings": ["Warning 1"],
    "recommendation_score": "⭐⭐⭐⭐⭐ Perfect Match",
    "hidden_gems": []
  },
  "top_3_recommendations": [],
  "top_10_similar_recommendations": [],
  "related_movies": []
}

Return ONLY valid JSON. No markdown tags. No extra text!`;

      try {
        const content = await this.callLLM(promptText);
        let parsed = JSON.parse(content.replace(/\`\`\`json/g, '').replace(/\`\`\`/g, '').trim());
        return parsed;
      } catch (e) {
        console.error("Mock report error:", e);
        return { error: "Failed to generate mock report" };
      }
    }
  }
  
  export const recommendationEngine = new RecommendationEngine();
