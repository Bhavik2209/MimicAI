from .utils import (
    wikidata_search, 
    fetch_entity_data, 
    extract_claim, 
    build_image_url, 
    ALLOWED_INSTANCE_SET,
    fetch_labels,
    extract_external_identifier,
    ACADEMIC_OCCUPATION_SET
)
from app.repos import entity_repo, project_repo
from .schemas import (
    EntityCandidate, 
    EntityConfirmResponse, 
    LabelItem
)
from sqlalchemy.ext.asyncio import AsyncSession


async def resolve_entity_identity(qid: str) -> EntityConfirmResponse:
    """
    Detailed resolution of a Wikidata entity, typically after selection from search.
    """
    entity = await fetch_entity_data(qid)

    label = entity.get("labels", {}).get("en", {}).get("value")
    description = entity.get("descriptions", {}).get("en", {}).get("value")

    # --- Raw QID lists ---
    instance_of_ids = extract_claim(entity, "P31")   # instance of
    occupation_ids = extract_claim(entity, "P106")   # occupation
    nationality_ids = extract_claim(entity, "P27")   # country of citizenship
    birth_dates = extract_claim(entity, "P569")      # date of birth
    death_dates = extract_claim(entity, "P570")      # date of death
    image_names = extract_claim(entity, "P18")       # image

    # --- Batch resolve labels in one API call ---
    all_related_ids = set(instance_of_ids + occupation_ids + nationality_ids)
    label_map = await fetch_labels(list(all_related_ids))

    instance_of = [LabelItem(id=i, label=label_map.get(i)) for i in instance_of_ids]
    occupation = [LabelItem(id=o, label=label_map.get(o)) for o in occupation_ids]
    nationality = [LabelItem(id=n, label=label_map.get(n)) for n in nationality_ids]

    # --- Dates ---
    # Handle the structure of birth/death dates properly
    birth_date = None
    if birth_dates and isinstance(birth_dates[0], dict) and "time" in birth_dates[0]:
        birth_date = birth_dates[0]["time"][1:11]
        
    death_date = None
    if death_dates and isinstance(death_dates[0], dict) and "time" in death_dates[0]:
        death_date = death_dates[0]["time"][1:11]
        
    is_living = death_date is None

    # --- External identifiers ---
    orcid_ids = extract_external_identifier(entity, "P496")

    # --- Image ---
    image_url = build_image_url(entity)

    # --- OpenAlex candidacy flag ---
    # True if person is a human AND has at least one academic occupation
    is_human = any(i.id == "Q5" for i in instance_of)
    has_academic_occ = any(o.id in ACADEMIC_OCCUPATION_SET for o in occupation)
    openalex_candidate = is_human and has_academic_occ

    return EntityConfirmResponse(
        wikidata_id=qid,
        resolved_name=label,
        description=description,
        instance_of=instance_of,
        occupation=occupation,
        birth_date=birth_date,
        death_date=death_date,
        is_living=is_living,
        nationality=nationality,
        image_url=image_url,
        openalex_candidate=openalex_candidate,
        orcid_ids=orcid_ids,
        status="confirmed"
    )


async def search_entities(name: str) -> list[EntityCandidate]:
    """Search Wikidata for humans (Q5) matching the name, max 3 results."""
    raw_results = await wikidata_search(name)
    
    if not raw_results:
        return []

    candidates = []
    
    for result in raw_results:
        if len(candidates) >= 3:
            break

        qid = result["id"]
        try:
            entity_data = await fetch_entity_data(qid)
        except Exception:
            continue
            
        instance_ids = extract_claim(entity_data, "P31")

        # Only include humans (Q5)
        if any(i in ALLOWED_INSTANCE_SET for i in instance_ids):
            description = entity_data.get("descriptions", {}).get("en", {}).get("value")
            label = entity_data.get("labels", {}).get("en", {}).get("value") or result.get("label")
            image_url = build_image_url(entity_data)
            
            candidates.append(EntityCandidate(
                wikidata_id=qid,
                name=label,
                description=description,
                image_url=image_url
            ))

    return candidates


