import httpx
from app.config import settings

WIKIDATA_SEARCH_URL = settings.wikidata_search_url
WIKIDATA_ENTITY_URL = settings.wikidata_entity_url

ALLOWED_INSTANCE_SET = {"Q5"}  # Q5 = human

# Occupation QIDs that flag a person as a potential OpenAlex/academic subject
ACADEMIC_OCCUPATION_SET = {
    "Q169470",   # physicist
    "Q593644",   # chemist
    "Q121594",   # biologist
    "Q170790",   # mathematician
    "Q1622272",  # academic
    "Q1650915",  # researcher
    "Q36180",    # writer
    "Q901",      # scientist
}


async def safe_request(url: str, params: dict = None) -> dict:
    headers = {"User-Agent": "MimicAI/1.0 (your_email@example.com)"}
    async with httpx.AsyncClient() as client:
        response = await client.get(url, params=params, headers=headers, timeout=10.0)
        response.raise_for_status()
        return response.json()


async def wikidata_search(query: str) -> list:
    """Search Wikidata for entities matching the query string."""
    params = {
        "action": "wbsearchentities",
        "format": "json",
        "language": "en",
        "search": query,
        "limit": 10,
    }
    data = await safe_request(WIKIDATA_SEARCH_URL, params)
    return data.get("search", [])


async def fetch_entity_data(qid: str) -> dict:
    """Fetch full Wikidata entity by QID."""
    data = await safe_request(WIKIDATA_ENTITY_URL.format(qid))
    return data["entities"][qid]


def extract_claim(entity: dict, prop: str) -> list:
    """Extract claim values for a given property from a Wikidata entity."""
    claims = entity.get("claims", {}).get(prop, [])
    values = []
    for claim in claims:
        mainsnak = claim.get("mainsnak", {})
        datavalue = mainsnak.get("datavalue")
        if not datavalue:
            continue
        value = datavalue["value"]
        if isinstance(value, dict) and "id" in value:
            values.append(value["id"])
        else:
            values.append(value)
    return values


def extract_external_identifier(entity: dict, prop: str) -> list[str]:
    """Extract external identifier string values (e.g. ORCID P496) from entity claims."""
    values = []
    claims = entity.get("claims", {}).get(prop, [])
    for claim in claims:
        mainsnak = claim.get("mainsnak", {})
        datavalue = mainsnak.get("datavalue")
        if not datavalue:
            continue
        v = datavalue.get("value")
        if isinstance(v, str):
            values.append(v)
    return values


async def fetch_labels(qids: list[str]) -> dict[str, str]:
    """Batch-fetch English labels for a list of QIDs."""
    if not qids:
        return {}

    params = {
        "action": "wbgetentities",
        "format": "json",
        "ids": "|".join(qids),
        "languages": "en",
        "props": "labels",
    }

    data = await safe_request(WIKIDATA_SEARCH_URL, params)

    label_map = {}
    for qid, entity in data.get("entities", {}).items():
        label = entity.get("labels", {}).get("en", {}).get("value")
        label_map[qid] = label

    return label_map


def build_image_url(entity: dict) -> str | None:
    """Extract and build the Wikimedia image URL from entity data."""
    image_names = extract_claim(entity, "P18")
    if image_names:
        return f"https://commons.wikimedia.org/wiki/Special:FilePath/{image_names[0]}"
    return None


def classify_entity_type(description: str) -> str:
    """Basic keyword-based entity type classification."""
    desc = description.lower()
    if any(k in desc for k in ["actor", "physicist", "film actor", "producer", "director", "professor", "scientist", "politician"]):
        return "human"
    return "other"