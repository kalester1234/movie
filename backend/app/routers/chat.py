from fastapi import APIRouter
from app.services.nlp_engine import nlp_engine
from app.services.search_engine import tmdb_client
from app.services.recommendation import recommendation_engine

router = APIRouter()

@router.post("/")
async def chat_interaction(user_input: str):
    # 1. Process intent using NLP
    nlp_response = await nlp_engine.process_query(user_input)
    
    # 2. Check for ambiguity
    if nlp_response.is_ambiguous:
        return {
            "user_query": user_input,
            "reply": nlp_response.clarifying_question or "Could you give me a bit more detail about what you're looking for?"
        }
        
    # 3. Retrieve Candidate Movies
    candidates = []
    if nlp_response.target_titles:
        # Search for the first mentioned title
        search_results = await tmdb_client.search_movie(nlp_response.target_titles[0])
        if search_results:
            movie_id = search_results[0].get("id")
            candidates = await tmdb_client.get_similar_movies(movie_id)
    else:
        # If no specific title, discover using keywords (simulated genre matching for now)
        candidates = await tmdb_client.discover_movies()
        
    # 4. Handle no matches
    if not candidates:
        return {
            "user_query": user_input,
            "reply": "I couldn't find an exact match for your request, but here are some closely related recommendations based on your preferences."
        }
        
    # 5. Build enriched recommendations (Limit to top 3 for speed)
    final_recs = []
    for movie in candidates[:3]:
        title = movie.get("title", "Unknown")
        overview = movie.get("overview", "")
        # Generate personalized explanation using LLM
        explanation = await recommendation_engine.generate_explanation(title, user_input, overview)
        
        final_recs.append({
            "title": title,
            "year": movie.get("release_date", "")[:4] if movie.get("release_date") else "Unknown",
            "similarity_score": "High", # Placeholder for actual vector score
            "streaming_on": ["Check Local Providers"],
            "why_you_will_like_it": explanation,
            "genres": nlp_response.genres # In a full system, map TMDb genre IDs
        })

    return {
        "user_query": user_input,
        "detected_intent": nlp_response.intent,
        "recommendations": final_recs
    }
