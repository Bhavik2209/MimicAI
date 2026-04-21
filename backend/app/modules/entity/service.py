"""Business logic for entity search and identity confirmation."""

from uuid import UUID

from fastapi import HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession

from app.modules.entity.schemas import EntityCreateRequest, EntityCreateResponse
from app.repos.entity_repo import create_entity, get_entity_by_id, get_entity_by_wikidata_id

from .schemas import EntityCandidate, EntityConfirmResponse, LabelItem
from .utils import (
	ACADEMIC_OCCUPATION_SET,
	ALLOWED_INSTANCE_SET,
	build_image_url,
	extract_claim,
	extract_external_identifier,
	fetch_entity_data,
	fetch_labels,
	wikidata_search,
)


async def create_entity_record(
	db: AsyncSession,
	entity_id: str,
	payload: EntityCreateRequest,
) -> EntityCreateResponse:
	"""Create one entity row after consistency and uniqueness checks."""
	if payload.wikidata_id != entity_id:
		raise HTTPException(
			status_code=status.HTTP_400_BAD_REQUEST,
			detail="Path entity_id and body wikidata_id do not match",
		)

	if await get_entity_by_id(db, payload.id):
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="Entity id already exists",
		)

	if await get_entity_by_wikidata_id(db, payload.wikidata_id):
		raise HTTPException(
			status_code=status.HTTP_409_CONFLICT,
			detail="Entity wikidata_id already exists",
		)

	entity = await create_entity(
		db=db,
		entity_id=payload.id,
		wikidata_id=payload.wikidata_id,
		name=payload.name,
		description=payload.description,
		image_url=payload.image_url,
	)
	return EntityCreateResponse(
		id=entity.id,
		wikidata_id=entity.wikidata_id,
		name=entity.name,
		description=entity.description,
		image_url=entity.image_url,
		created_at=entity.created_at,
		updated_at=entity.updated_at,
	)


async def resolve_entity_identity(qid: str) -> EntityConfirmResponse:
	"""Resolve detailed identity metadata for a Wikidata entity."""
	entity = await fetch_entity_data(qid)

	label = entity.get("labels", {}).get("en", {}).get("value")
	description = entity.get("descriptions", {}).get("en", {}).get("value")

	instance_of_ids = extract_claim(entity, "P31")
	occupation_ids = extract_claim(entity, "P106")
	nationality_ids = extract_claim(entity, "P27")
	birth_dates = extract_claim(entity, "P569")
	death_dates = extract_claim(entity, "P570")

	all_related_ids = set(instance_of_ids + occupation_ids + nationality_ids)
	label_map = await fetch_labels(list(all_related_ids))

	instance_of = [LabelItem(id=i, label=label_map.get(i)) for i in instance_of_ids]
	occupation = [LabelItem(id=o, label=label_map.get(o)) for o in occupation_ids]
	nationality = [LabelItem(id=n, label=label_map.get(n)) for n in nationality_ids]

	birth_date: str | None = None
	if birth_dates and isinstance(birth_dates[0], dict) and "time" in birth_dates[0]:
		birth_date = birth_dates[0]["time"][1:11]

	death_date: str | None = None
	if death_dates and isinstance(death_dates[0], dict) and "time" in death_dates[0]:
		death_date = death_dates[0]["time"][1:11]

	orcid_ids = extract_external_identifier(entity, "P496")
	image_url = build_image_url(entity)

	is_human = any(item.id == "Q5" for item in instance_of)
	has_academic_occ = any(item.id in ACADEMIC_OCCUPATION_SET for item in occupation)

	return EntityConfirmResponse(
		wikidata_id=qid,
		resolved_name=label,
		description=description,
		instance_of=instance_of,
		occupation=occupation,
		birth_date=birth_date,
		death_date=death_date,
		is_living=death_date is None,
		nationality=nationality,
		image_url=image_url,
		openalex_candidate=is_human and has_academic_occ,
		orcid_ids=orcid_ids,
		status="confirmed",
	)


async def search_entities(name: str) -> list[EntityCandidate]:
	"""Search Wikidata and return up to three human candidates."""
	raw_results = await wikidata_search(name)
	if not raw_results:
		return []

	candidates: list[EntityCandidate] = []

	for result in raw_results:
		if len(candidates) >= 3:
			break

		qid = result.get("id")
		if not qid:
			continue

		try:
			entity_data = await fetch_entity_data(qid)
		except Exception:
			continue

		instance_ids = extract_claim(entity_data, "P31")
		if not any(instance_id in ALLOWED_INSTANCE_SET for instance_id in instance_ids):
			continue

		description = entity_data.get("descriptions", {}).get("en", {}).get("value")
		label = entity_data.get("labels", {}).get("en", {}).get("value") or result.get("label")

		candidates.append(
			EntityCandidate(
				wikidata_id=qid,
				name=label or qid,
				description=description,
				image_url=build_image_url(entity_data),
			)
		)

	return candidates

