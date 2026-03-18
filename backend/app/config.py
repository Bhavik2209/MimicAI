"""Centralized application settings loaded from environment variables."""

from pydantic import BaseModel
from dotenv import load_dotenv

import os

# Load variables from .env in the current working directory (backend/)
load_dotenv()


class Settings(BaseModel):
	"""Runtime settings used by backend modules."""

	wikidata_search_url: str = "https://www.wikidata.org/w/api.php"
	wikidata_entity_url: str = (
		"https://www.wikidata.org/wiki/Special:EntityData/{}.json"
	)


settings = Settings(
	wikidata_search_url=os.getenv("WIKIDATA_SEARCH_URL", "https://www.wikidata.org/w/api.php"),
	wikidata_entity_url=os.getenv(
		"WIKIDATA_ENTITY_URL",
		"https://www.wikidata.org/wiki/Special:EntityData/{}.json",
	),
)

