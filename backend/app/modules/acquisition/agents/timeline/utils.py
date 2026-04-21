"""Timeline Agent - extract historical events using Wikidata SPARQL endpoint."""

import logging
from datetime import datetime

import httpx

logger = logging.getLogger(__name__)

SPARQL_ENDPOINT = "https://query.wikidata.org/sparql"
WIKIDATA_API = "https://www.wikidata.org/w/api.php"

HEADERS = {
    "User-Agent": "MimicAI-TimelineAgent/1.0 (https://github.com/mimicai)",
    "Accept": "application/sparql-results+json",
}

# ---------------------------------------------------------------------------
# SPARQL queries — one per category, all use SERVICE wikibase:label so QIDs
# are resolved server-side. No extra round trips needed.
# ---------------------------------------------------------------------------

# Core life milestones (birth, death, citizenship, occupation, religion, etc.)
QUERY_CORE = """
SELECT DISTINCT ?propLabel ?valueLabel ?start ?end ?pointInTime WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity ?claim ?statement .
  ?prop wikibase:statementProperty ?claim .
  ?statement ?ps ?value .

  # Only keep properties that are about the entity directly
  FILTER(?prop IN (
    wd:P569, wd:P570, wd:P19, wd:P20, wd:P27, wd:P21,
    wd:P106, wd:P509, wd:P140, wd:P172
  ))

  OPTIONAL {{ ?statement pq:P580 ?start . }}
  OPTIONAL {{ ?statement pq:P582 ?end . }}
  OPTIONAL {{ ?statement pq:P585 ?pointInTime . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?prop rdfs:label ?propLabel .
    ?value rdfs:label ?valueLabel .
  }}
}}
"""

# Education history
QUERY_EDUCATION = """
SELECT DISTINCT ?schoolLabel ?start ?end ?degreeLabel WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P69 ?statement .
  ?statement ps:P69 ?school .

  OPTIONAL {{ ?statement pq:P580 ?start . }}
  OPTIONAL {{ ?statement pq:P582 ?end . }}
  OPTIONAL {{ ?statement pq:P512 ?degree . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?school rdfs:label ?schoolLabel .
    ?degree rdfs:label ?degreeLabel .
  }}
}}
ORDER BY ?start
"""

# Positions / roles held
QUERY_POSITIONS = """
SELECT DISTINCT ?positionLabel ?orgLabel ?start ?end WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P39 ?statement .
  ?statement ps:P39 ?position .

  OPTIONAL {{ ?statement pq:P580 ?start . }}
  OPTIONAL {{ ?statement pq:P582 ?end . }}
  OPTIONAL {{ ?statement pq:P1268 ?org . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?position rdfs:label ?positionLabel .
    ?org rdfs:label ?orgLabel .
  }}
}}
ORDER BY ?start
"""

# Employer history
QUERY_EMPLOYER = """
SELECT DISTINCT ?employerLabel ?start ?end WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P108 ?statement .
  ?statement ps:P108 ?employer .

  OPTIONAL {{ ?statement pq:P580 ?start . }}
  OPTIONAL {{ ?statement pq:P582 ?end . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?employer rdfs:label ?employerLabel .
  }}
}}
ORDER BY ?start
"""

# Sports team memberships
QUERY_SPORTS = """
SELECT DISTINCT ?teamLabel ?start ?end ?leagueLabel WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P54 ?statement .
  ?statement ps:P54 ?team .

  OPTIONAL {{ ?statement pq:P580 ?start . }}
  OPTIONAL {{ ?statement pq:P582 ?end . }}
  OPTIONAL {{ ?statement pq:P118 ?league . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?team rdfs:label ?teamLabel .
    ?league rdfs:label ?leagueLabel .
  }}
}}
ORDER BY ?start
"""

# Awards and honours received
QUERY_AWARDS = """
SELECT DISTINCT ?awardLabel ?start ?conferredByLabel WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P166 ?statement .
  ?statement ps:P166 ?award .

  OPTIONAL {{ ?statement pq:P585 ?start . }}
  OPTIONAL {{ ?statement pq:P1027 ?conferredBy . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?award rdfs:label ?awardLabel .
    ?conferredBy rdfs:label ?conferredByLabel .
  }}
}}
ORDER BY ?start
"""

# Notable works (books, films, albums, etc.)
QUERY_WORKS = """
SELECT DISTINCT ?workLabel ?publicationDate WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P800 ?statement .
  ?statement ps:P800 ?work .

  OPTIONAL {{ ?work wdt:P577 ?publicationDate . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?work rdfs:label ?workLabel .
  }}
}}
ORDER BY ?publicationDate
"""

# Member of (organisations, parties, committees)
QUERY_MEMBERSHIP = """
SELECT DISTINCT ?orgLabel ?start ?end WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P463 ?statement .
  ?statement ps:P463 ?org .

  OPTIONAL {{ ?statement pq:P580 ?start . }}
  OPTIONAL {{ ?statement pq:P582 ?end . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?org rdfs:label ?orgLabel .
  }}
}}
ORDER BY ?start
"""

# Significant events (elections, conflicts, discoveries, etc.)
QUERY_EVENTS = """
SELECT DISTINCT ?eventLabel ?start ?end WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P793 ?statement .
  ?statement ps:P793 ?event .

  OPTIONAL {{ ?statement pq:P585 ?start . }}
  OPTIONAL {{ ?statement pq:P580 ?start2 . }}
  OPTIONAL {{ ?statement pq:P582 ?end . }}

  BIND(COALESCE(?start, ?start2) AS ?start)

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?event rdfs:label ?eventLabel .
  }}
}}
ORDER BY ?start
"""

# Convicted of (legal events)
QUERY_LEGAL = """
SELECT DISTINCT ?crimeLabel ?start WHERE {{
  VALUES ?entity {{ wd:{qid} }}

  ?entity p:P1399 ?statement .
  ?statement ps:P1399 ?crime .

  OPTIONAL {{ ?statement pq:P585 ?start . }}

  SERVICE wikibase:label {{
    bd:serviceParam wikibase:language "en" .
    ?crime rdfs:label ?crimeLabel .
  }}
}}
ORDER BY ?start
"""


# ---------------------------------------------------------------------------
# HTTP helpers
# ---------------------------------------------------------------------------

async def _sparql(query: str) -> list[dict]:
    """Run a SPARQL query and return the bindings list."""
    async with httpx.AsyncClient(timeout=20.0) as client:
        response = await client.get(
            SPARQL_ENDPOINT,
            params={"query": query, "format": "json"},
            headers=HEADERS,
        )
        response.raise_for_status()
        data = response.json()
        return data.get("results", {}).get("bindings", [])


async def _fetch_entity_meta(qid: str) -> dict:
    """Fetch name and description from Wikidata API."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        params = {
            "action": "wbgetentities",
            "ids": qid,
            "props": "labels|descriptions",
            "languages": "en",
            "format": "json",
        }
        response = await client.get(WIKIDATA_API, params=params, headers=HEADERS)
        response.raise_for_status()
        data = response.json()
        entity = data.get("entities", {}).get(qid, {})
        return {
            "name": entity.get("labels", {}).get("en", {}).get("value", qid),
            "description": entity.get("descriptions", {}).get("en", {}).get("value", ""),
        }


# ---------------------------------------------------------------------------
# Value extraction helpers
# ---------------------------------------------------------------------------

def _val(binding: dict, key: str) -> str:
    """Safely extract a string value from a SPARQL binding."""
    return binding.get(key, {}).get("value", "")


def _date(binding: dict, key: str) -> str:
    """Extract and truncate an ISO date from a SPARQL binding."""
    raw = _val(binding, key)
    if not raw:
        return ""
    # Wikidata returns full ISO: 2001-09-11T00:00:00Z — keep only date part
    return raw[:10]


def _sort_key(event: dict) -> str:
    """Return a sortable string from start date, defaulting to far future."""
    return event.get("start") or "9999-12-31"


# ---------------------------------------------------------------------------
# Per-category extractors
# ---------------------------------------------------------------------------

def _extract_core(rows: list[dict]) -> list[dict]:
    """Extract core life facts (birth, death, nationality, occupation, etc.)."""
    events = []
    for row in rows:
        prop = _val(row, "propLabel")
        value = _val(row, "valueLabel")
        start = _date(row, "start") or _date(row, "pointInTime")
        end = _date(row, "end")

        if not value:
            continue

        events.append({
            "category": "life",
            "type": prop,
            "label": value,
            "start": start,
            "end": end,
        })
    return events


def _extract_education(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        school = _val(row, "schoolLabel")
        degree = _val(row, "degreeLabel")
        if not school:
            continue
        label = f"{degree} at {school}" if degree else school
        events.append({
            "category": "education",
            "type": "Educated At",
            "label": label,
            "start": _date(row, "start"),
            "end": _date(row, "end"),
        })
    return events


def _extract_positions(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        position = _val(row, "positionLabel")
        org = _val(row, "orgLabel")
        if not position:
            continue
        label = f"{position} at {org}" if org else position
        events.append({
            "category": "career",
            "type": "Position Held",
            "label": label,
            "start": _date(row, "start"),
            "end": _date(row, "end"),
        })
    return events


def _extract_employer(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        employer = _val(row, "employerLabel")
        if not employer:
            continue
        events.append({
            "category": "career",
            "type": "Employer",
            "label": employer,
            "start": _date(row, "start"),
            "end": _date(row, "end"),
        })
    return events


def _extract_sports(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        team = _val(row, "teamLabel")
        league = _val(row, "leagueLabel")
        if not team:
            continue
        label = f"{team} ({league})" if league else team
        events.append({
            "category": "sports",
            "type": "Sports Team",
            "label": label,
            "start": _date(row, "start"),
            "end": _date(row, "end"),
        })
    return events


def _extract_awards(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        award = _val(row, "awardLabel")
        conferred_by = _val(row, "conferredByLabel")
        if not award:
            continue
        label = f"{award} (by {conferred_by})" if conferred_by else award
        events.append({
            "category": "award",
            "type": "Award Received",
            "label": label,
            "start": _date(row, "start"),
            "end": "",
        })
    return events


def _extract_works(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        work = _val(row, "workLabel")
        if not work:
            continue
        events.append({
            "category": "work",
            "type": "Notable Work",
            "label": work,
            "start": _date(row, "publicationDate"),
            "end": "",
        })
    return events


def _extract_membership(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        org = _val(row, "orgLabel")
        if not org:
            continue
        events.append({
            "category": "membership",
            "type": "Member Of",
            "label": org,
            "start": _date(row, "start"),
            "end": _date(row, "end"),
        })
    return events


def _extract_events(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        event = _val(row, "eventLabel")
        if not event:
            continue
        events.append({
            "category": "event",
            "type": "Significant Event",
            "label": event,
            "start": _date(row, "start"),
            "end": _date(row, "end"),
        })
    return events


def _extract_legal(rows: list[dict]) -> list[dict]:
    events = []
    for row in rows:
        crime = _val(row, "crimeLabel")
        if not crime:
            continue
        events.append({
            "category": "legal",
            "type": "Convicted Of",
            "label": crime,
            "start": _date(row, "start"),
            "end": "",
        })
    return events


# ---------------------------------------------------------------------------
# Deduplication
# ---------------------------------------------------------------------------

def _deduplicate(events: list[dict]) -> list[dict]:
    """Remove duplicate events (same category + label + start date)."""
    seen: set[tuple] = set()
    unique: list[dict] = []
    for event in events:
        key = (event["category"], event["label"].lower(), event["start"])
        if key not in seen:
            seen.add(key)
            unique.append(event)
    return unique


# ---------------------------------------------------------------------------
# Main agent entry point
# ---------------------------------------------------------------------------

async def timeline_agent(entity_id: str) -> dict:
    """
    Extract a full chronological timeline for a Wikidata entity using SPARQL.

    Args:
        entity_id: Wikidata QID (e.g. "Q23" for George Washington)

    Returns:
        dict with entity metadata and sorted timeline events
    """
    qid = entity_id.strip()

    # Fetch name and description in parallel with queries
    meta = await _fetch_entity_meta(qid)

    # Run all SPARQL queries — each targets a specific domain
    # We run them sequentially to avoid hammering the SPARQL endpoint.
    # Switch to asyncio.gather if you want parallelism (mind rate limits).
    queries = [
        (QUERY_CORE, _extract_core),
        (QUERY_EDUCATION, _extract_education),
        (QUERY_POSITIONS, _extract_positions),
        (QUERY_EMPLOYER, _extract_employer),
        (QUERY_SPORTS, _extract_sports),
        (QUERY_AWARDS, _extract_awards),
        (QUERY_WORKS, _extract_works),
        (QUERY_MEMBERSHIP, _extract_membership),
        (QUERY_EVENTS, _extract_events),
        (QUERY_LEGAL, _extract_legal),
    ]

    all_events: list[dict] = []

    for query_template, extractor in queries:
        try:
            rows = await _sparql(query_template.format(qid=qid))
            all_events.extend(extractor(rows))
        except Exception as exc:
            logger.warning("SPARQL query failed for %s: %s", qid, exc)

    # Deduplicate and sort chronologically
    all_events = _deduplicate(all_events)
    all_events.sort(key=_sort_key)

    return {
        "entity_id": qid,
        "name": meta["name"],
        "description": meta["description"],
        "total_events": len(all_events),
        "timeline": all_events,
    }