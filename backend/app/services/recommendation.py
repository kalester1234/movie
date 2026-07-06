from typing import List, Dict, Any
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.core.config import settings

class RecommendationEngine:
    def __init__(self):
        self.llm = ChatOpenAI(
            temperature=0.7, 
            api_key=settings.OPENAI_API_KEY,
            base_url="https://api.groq.com/openai/v1", 
            model="llama3-70b-8192"
        ) if settings.OPENAI_API_KEY else None
        
        self.explanation_prompt = PromptTemplate(
            template="""You are CineVerse AI. Explain why the user will like the movie "{title}".
The user's query was: "{query}"
The movie's synopsis is: "{overview}"

Keep the explanation to 2-3 sentences, completely spoiler-free. Make it sound enthusiastic and personalized.
""",
            input_variables=["title", "query", "overview"]
        )

    async def generate_explanation(self, title: str, query: str, overview: str) -> str:
        if not self.llm:
            return "Based on your preferences, this movie seems like a great match!"
            
        try:
            chain = self.explanation_prompt | self.llm
            result = await chain.ainvoke({"title": title, "query": query, "overview": overview})
            return result.content.strip()
        except Exception:
            return "Based on your preferences, this movie seems like a great match!"

recommendation_engine = RecommendationEngine()
