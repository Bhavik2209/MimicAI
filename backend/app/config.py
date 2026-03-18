"""Centralized application settings loaded from environment variables."""

from pathlib import Path
import os

from dotenv import load_dotenv
from pydantic import BaseModel

# Load variables from .env in the backend folder explicitly
env_path = Path(__file__).parent.parent / ".env"
load_dotenv(dotenv_path=env_path)


class Settings(BaseModel):
    """Runtime settings used by backend modules."""

    wikidata_search_url: str = "https://www.wikidata.org/w/api.php"
    wikidata_entity_url: str = "https://www.wikidata.org/wiki/Special:EntityData/{}.json"
    openalex_base_url: str = "https://api.openalex.org"
    news_api_url: str = "https://newsdata.io/api/1/news"
    news_api_key: str = ""


settings = Settings(
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
)

