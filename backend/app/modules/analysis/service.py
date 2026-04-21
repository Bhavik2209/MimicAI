"""High-level orchestration service for analysis agents."""

from app.modules.analysis.agents.personality.schemas import PersonalityAnalysis
from app.modules.analysis.agents.personality.service import analyze_personality


async def run_personality_analysis(entity_id: str) -> PersonalityAnalysis:
	"""Run personality analysis for one entity."""
	return await analyze_personality(entity_id)

