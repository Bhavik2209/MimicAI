"""Business logic for OpenAlex profile acquisition."""

from app.modules.entity.service import resolve_entity_identity

from .schemas import OpenAlexProfile
from .utils import openalex_agent


async def fetch_openalex_profile(entity_id: str) -> OpenAlexProfile | None:
    """Resolve entity context and fetch OpenAlex profile data."""
    resolved = await resolve_entity_identity(entity_id)

    resolved_name = resolved.resolved_name or entity_id
    payload = await openalex_agent(
        resolved_name=resolved_name,
        orcid_ids=resolved.orcid_ids,
        wikidata_id=entity_id,
    )

    if not payload:
        return None

    return OpenAlexProfile.model_validate(payload)
