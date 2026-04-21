"""Centralized application settings loaded from environment variables."""

from pathlib import Path
import os

from dotenv import load_dotenv
from pydantic import BaseModel

# Load variables from .env in the backend folder explicitly
env_path = Path(__file__).resolve().parent.parent / ".env"
if env_path.exists():
    load_dotenv(dotenv_path=env_path, override=True)
else:
    # Try current directory as fallback
    load_dotenv(override=True)


class Settings(BaseModel):
    """Runtime settings used by backend modules."""

    database_url: str = ""
    internal_api_key: str = ""
    wikidata_search_url: str = "https://www.wikidata.org/w/api.php"
    wikidata_entity_url: str = "https://www.wikidata.org/wiki/Special:EntityData/{}.json"
    openalex_base_url: str = "https://api.openalex.org"
    news_api_url: str = "https://newsdata.io/api/1/news"
    news_api_key: str = ""
    wikipedia_api_url: str = "https://en.wikipedia.org/w/api.php"
    wikiquote_api_url: str = "https://en.wikiquote.org/w/api.php"
    
    api_ninjas_key: str = ""

    youtube_api_key: str = ""
    youtube_transcript_api_key: str = ""
    youtube_search_url: str = "https://www.googleapis.com/youtube/v3/search"
    youtube_video_url: str = "https://www.googleapis.com/youtube/v3/videos"
    qdrant_url: str = ""
    qdrant_api_key: str = ""
    qdrant_collection: str = "entity_memory_minilm"
    qdrant_chat_memory_collection: str = "chat_memory_minilm"
    qdrant_vector_size: int = 384
    gemini_api_key: str = ""
    llm_model: str = "gemini-2.5-flash"
    groq_api_key: str = ""
    groq_model: str = "qwen/qwen3-32b"
    embedding_model: str = "sentence-transformers/all-MiniLM-L6-v2"
    huggingface_api_key: str = ""
    huggingface_inference_url: str = "https://api-inference.huggingface.co/models"
    huggingface_provider: str = "hf-inference"
    tavily_api_key: str = ""
    mem0_api_key: str = ""
    mem0_enabled: bool = False
    memory_provider_mode: str = "mem0_hybrid"
    mem0_timeout_ms: int = 1200
    mem0_max_results: int = 4
    chat_history_limit: int = 4
    memory_context_max_chars: int = 900
    retrieved_context_max_chars: int = 1600
    qdrant_chat_memory_enabled: bool = True
    run_startup_schema_sync: bool = True


settings = Settings(
    database_url=os.getenv("DATABASE_URL", ""),
    internal_api_key=os.getenv("INTERNAL_API_KEY", ""),
    wikidata_search_url=os.getenv("WIKIDATA_SEARCH_URL", "https://www.wikidata.org/w/api.php"),
    wikidata_entity_url=os.getenv(
        "WIKIDATA_ENTITY_URL",
        "https://www.wikidata.org/wiki/Special:EntityData/{}.json",
    ),
    openalex_base_url=os.getenv(
        "OPENALEX_BASE_URL",
        "https://api.openalex.org",
    ),
    news_api_url=os.getenv(
        "NEWS_API_URL",
        "https://newsdata.io/api/1/news",
    ),
    news_api_key=os.getenv("NEWS_API_KEY", ""),
    wikipedia_api_url=os.getenv(
        "WIKIPEDIA_API_URL",
        "https://en.wikipedia.org/w/api.php",
    ),
    wikiquote_api_url=os.getenv(
        "WIKIQUOTE_API_URL",
        "https://en.wikiquote.org/w/api.php",
    ),
    api_ninjas_key=os.getenv("API_NINJAS_KEY", ""),

    youtube_api_key=os.getenv("YOUTUBE_API_KEY", ""),
    youtube_transcript_api_key=os.getenv("YOUTUBE_TRANSCRIPT_API_KEY", ""),
    youtube_search_url=os.getenv(
        "YOUTUBE_SEARCH_URL",
        "https://www.googleapis.com/youtube/v3/search",
    ),
    youtube_video_url=os.getenv(
        "YOUTUBE_VIDEO_URL",
        "https://www.googleapis.com/youtube/v3/videos",
    ),
    qdrant_url=os.getenv("QDRANT_URL", ""),
    qdrant_api_key=os.getenv("QDRANT_API_KEY", ""),
    qdrant_collection=os.getenv("QDRANT_COLLECTION", "entity_memory_minilm"),
    qdrant_chat_memory_collection=os.getenv("QDRANT_CHAT_MEMORY_COLLECTION", "chat_memory_minilm"),
    qdrant_vector_size=int(os.getenv("QDRANT_VECTOR_SIZE", "384")),
    gemini_api_key=os.getenv("GEMINI_API_KEY", ""),
    llm_model=os.getenv("LLM_MODEL", "gemini-2.5-flash"),
    groq_api_key=os.getenv("GROQ_API_KEY", ""),
    groq_model=os.getenv("GROQ_MODEL", "qwen/qwen3-32b"),
    embedding_model=os.getenv("EMBEDDING_MODEL", "sentence-transformers/all-MiniLM-L6-v2"),
    huggingface_api_key=os.getenv("HUGGINGFACE_API_KEY", ""),
    huggingface_inference_url=os.getenv(
        "HUGGINGFACE_INFERENCE_URL",
        "https://api-inference.huggingface.co/models",
    ),
    huggingface_provider=os.getenv("HUGGINGFACE_PROVIDER", "hf-inference"),
    tavily_api_key=os.getenv("TAVILY_API_KEY", ""),
    mem0_api_key=os.getenv("MEM0_API_KEY", ""),
    mem0_enabled=os.getenv("MEM0_ENABLED", "false").strip().lower() in {"1", "true", "yes", "on"},
    memory_provider_mode=os.getenv("MEMORY_PROVIDER_MODE", "mem0_hybrid").strip().lower(),
    mem0_timeout_ms=int(os.getenv("MEM0_TIMEOUT_MS", "1200")),
    mem0_max_results=int(os.getenv("MEM0_MAX_RESULTS", "4")),
    chat_history_limit=int(os.getenv("CHAT_HISTORY_LIMIT", "4")),
    memory_context_max_chars=int(os.getenv("MEMORY_CONTEXT_MAX_CHARS", "900")),
    retrieved_context_max_chars=int(os.getenv("RETRIEVED_CONTEXT_MAX_CHARS", "1600")),
    qdrant_chat_memory_enabled=os.getenv("QDRANT_CHAT_MEMORY_ENABLED", "true").strip().lower() in {"1", "true", "yes", "on"},
    run_startup_schema_sync=os.getenv("RUN_STARTUP_SCHEMA_SYNC", "true").strip().lower() in {"1", "true", "yes", "on"},
)

