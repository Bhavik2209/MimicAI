from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    wikidata_search_url: str
    wikidata_entity_url: str
    wikipedia_api_url: str
    openalex_base_url: str
    news_api_url: str
    news_api_key: str
    youtube_api_key: str = ""
    wikiquote_api_url: str
    youtube_search_url: str
    youtube_video_url: str

    # Gemini
    gemini_api_key: str
    embedding_model: str 
    # Qdrant
    qdrant_url: str
    qdrant_api_key: str

    class Config:
        env_file = ".env"


settings = Settings()