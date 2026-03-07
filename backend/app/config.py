from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    wikidata_search_url: str = "https://www.wikidata.org/w/api.php"
    wikidata_entity_url: str = "https://www.wikidata.org/wiki/Special:EntityData/{}.json"
    openalex_base_url: str = "https://api.openalex.org"

    class Config:
        env_file = ".env"


settings = Settings()