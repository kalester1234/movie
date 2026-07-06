from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    PROJECT_NAME: str = "CineVerse AI"
    API_V1_STR: str = "/api/v1"
    
    # Security / Keys
    OPENAI_API_KEY: str = ""
    TMDB_API_KEY: str = ""
    MONGO_URI: str = "mongodb://localhost:27017"
    
    class Config:
        env_file = ".env"

settings = Settings()
