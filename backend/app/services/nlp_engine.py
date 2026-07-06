import json
from pydantic import BaseModel, Field
from typing import List, Optional
from langchain_openai import ChatOpenAI
from langchain_core.prompts import PromptTemplate
from app.core.config import settings

class IntentResponse(BaseModel):
    is_ambiguous: bool = Field(description="True if the query is too vague to recommend something specific.")
    clarifying_question: Optional[str] = Field(None, description="If ambiguous, a follow-up question to ask the user.")
    intent: str = Field(description="recommend_similar, recommend_genre, explain, etc.")
    genres: List[str] = Field(default_factory=list, description="Extracted genres")
    mood: Optional[str] = Field(None, description="Extracted mood or atmosphere")
    keywords: List[str] = Field(default_factory=list, description="Other keywords like themes, pacing, etc.")
    target_titles: List[str] = Field(default_factory=list, description="Specific movie or series names mentioned")

class NLPEngine:
    def __init__(self):
        # Pointing to Groq using the OpenAI client wrapper
        self.llm = ChatOpenAI(
            temperature=0, 
            api_key=settings.OPENAI_API_KEY, 
            base_url="https://api.groq.com/openai/v1", 
            model="llama3-70b-8192"
        ) if settings.OPENAI_API_KEY else None
        
        self.prompt = PromptTemplate(
            template="""You are the core NLP engine for CineVerse AI. 
Analyze the user's entertainment query.
If the query is too ambiguous (e.g. "I want to watch something"), set is_ambiguous to true and provide a clarifying_question (e.g. "What genre are you in the mood for?").
Otherwise, extract the genres, mood, keywords (themes), and any specific target_titles mentioned.
Respond ONLY with a JSON object that perfectly matches this schema:
{{
    "is_ambiguous": boolean,
    "clarifying_question": "string or null",
    "intent": "string",
    "genres": ["string"],
    "mood": "string or null",
    "keywords": ["string"],
    "target_titles": ["string"]
}}

Query: {query}
""",
            input_variables=["query"]
        )

    async def process_query(self, query: str) -> IntentResponse:
        if not self.llm:
            # Fallback mock if no API key is provided
            return IntentResponse(
                is_ambiguous=False,
                intent="recommend_genre",
                genres=[],
                target_titles=[]
            )
            
        try:
            chain = self.prompt | self.llm
            result = await chain.ainvoke({"query": query})
            
            # The result is expected to be a JSON string, let's parse it
            data = json.loads(result.content)
            return IntentResponse(**data)
        except Exception as e:
            # Safe fallback if parsing fails or API fails
            print(f"NLP Engine Error: {e}")
            return IntentResponse(
                is_ambiguous=True,
                clarifying_question="I'm having trouble understanding. Could you specify a genre or a movie you like?",
                intent="unknown",
            )

nlp_engine = NLPEngine()
