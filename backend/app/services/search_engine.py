import httpx
import json
from typing import List, Dict, Any
from app.core.config import settings
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate

class LLMSearchEngineFallback:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.7, 
            api_key=settings.OPENAI_API_KEY,
            base_url="https://api.groq.com/openai/v1", 
            model="llama3-70b-8192"
        ) if settings.OPENAI_API_KEY else None
        
        self.prompt = PromptTemplate(
            template="""You are a movie database API. Based on the user's criteria, return exactly 3 real movies.
Return ONLY a valid JSON array of objects, with no markdown formatting and no extra text.
Each object must have exactly these keys: "title", "release_date" (YYYY-MM-DD), and "overview".

Criteria: {criteria}
""",
            input_variables=["criteria"]
        )

    async def get_movies(self, criteria: str) -> List[Dict[str, Any]]:
        if not self.llm:
            return []
        try:
            response = await self.llm.ainvoke(self.prompt.format(criteria=criteria))
            # Clean up potential markdown formatting from LLM
            content = response.content.replace('```json', '').replace('```', '').strip()
            return json.loads(content)
        except Exception as e:
            print(f"LLM Fallback error: {e}")
            return []

class TMDbClient:
    def __init__(self):
        self.base_url = "https://api.themoviedb.org/3"
        self.headers = {"accept": "application/json"}
        self.use_fallback = False
        self.fallback = None
        
        if settings.TMDB_API_KEY:
            self.headers["Authorization"] = f"Bearer {settings.TMDB_API_KEY}"
        else:
            self.use_fallback = True
            self.fallback = LLMSearchEngineFallback()

    async def search_movie(self, query: str) -> List[Dict[str, Any]]:
        if self.use_fallback:
            return await self.fallback.get_movies(f"Search for a movie related to: {query}")
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/search/movie",
                headers=self.headers,
                params={"query": query, "include_adult": "false", "language": "en-US", "page": 1}
            )
            if response.status_code == 200:
                return response.json().get("results", [])
            return []
            
    async def get_similar_movies(self, movie_id: int) -> List[Dict[str, Any]]:
        if self.use_fallback:
            return await self.fallback.get_movies(f"Movies similar to the movie with ID {movie_id}")
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/movie/{movie_id}/similar",
                headers=self.headers,
                params={"language": "en-US", "page": 1}
            )
            if response.status_code == 200:
                return response.json().get("results", [])
            return []

    async def discover_movies(self, with_genres: str = None, with_keywords: str = None) -> List[Dict[str, Any]]:
        if self.use_fallback:
            criteria = []
            if with_genres: criteria.append(f"Genres IDs: {with_genres}")
            if with_keywords: criteria.append(f"Themes/Keywords: {with_keywords}")
            return await self.fallback.get_movies(f"Discover movies matching these criteria: {', '.join(criteria)}")
            
        params = {"include_adult": "false", "language": "en-US", "page": 1, "sort_by": "popularity.desc"}
        if with_genres:
            params["with_genres"] = with_genres
        if with_keywords:
            params["with_keywords"] = with_keywords
            
        async with httpx.AsyncClient() as client:
            response = await client.get(
                f"{self.base_url}/discover/movie",
                headers=self.headers,
                params=params
            )
            if response.status_code == 200:
                return response.json().get("results", [])
            return []

tmdb_client = TMDbClient()
