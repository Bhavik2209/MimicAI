from typing import Any

from app.modules.analysis.service import format_analysis_sections, retrieve_analysis_chunks


async def controversy_agent(
	*,
	entity_name: str,
	collection_name: str,
	context: str | None = None,
	top_k: int = 5,
	match_filter: dict[str, Any] | None = None,
) -> dict[str, Any]:
	"""Return display-ready controversy section from vector retrieval."""
	retrieval = await retrieve_analysis_chunks(
		entity_name=entity_name,
		collection_name=collection_name,
		context=context,
		top_k=top_k,
		match_filter=match_filter,
	)
	formatted = format_analysis_sections(retrieval)
	return {
		"entity_name": formatted["entity_name"],
		"controversy_section": formatted["controversy_section"],
	}
