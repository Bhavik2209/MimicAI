"""
Timeline Agent - Extract historical events from Wikidata with dates.
"""
import httpx
from typing import List, Dict, Any, Optional
from sqlalchemy.ext.asyncio import AsyncSession
from app.modules.entity.utils import fetch_entity_data

HEADERS = {"User-Agent": "TimelineAgent/1.0"}

# Date qualifier property IDs
DATE_QUALIFIERS = {"P580", "P582", "P585", "P571", "P576"}

# Properties to skip (metadata, IDs, images)
SKIP_PROPS = {
    "P18", "P94", "P41", "P109", "P154", "P242", "P856", "P910", "P935",
    "P973", "P1566", "P214", "P213", "P244", "P227", "P349", "P268", "P269",
    "P270", "P271", "P409", "P496", "P648", "P723", "P906", "P1006", "P1015",
    "P1207", "P1368", "P1695", "P1830", "P2163", "P2860", "P4342", "P5587",
    "P6886", "P7085",
}

# Human-readable property labels
PROP_LABELS = {
    "P569": "Date of Birth", "P570": "Date of Death", "P571": "Inception",
    "P576": "Dissolved", "P580": "Start Time", "P582": "End Time",
    "P585": "Point in Time", "P39": "Position Held", "P108": "Employer",
    "P69": "Educated At", "P166": "Award Received", "P1344": "Participated In",
    "P509": "Cause of Death", "P119": "Place of Burial", "P20": "Place of Death",
    "P19": "Place of Birth", "P112": "Founded By", "P138": "Named After",
    "P155": "Follows", "P156": "Followed By", "P361": "Part Of",
    "P463": "Member Of", "P710": "Participant", "P793": "Significant Event",
    "P800": "Notable Work", "P1399": "Convicted Of", "P102": "Political Party",
    "P54": "Sports Team",
}


async def _safe_request(url: str, params: dict = None) -> dict:
    """Make HTTP request."""
    async with httpx.AsyncClient(timeout=15.0) as client:
        response = await client.get(url, params=params, headers=HEADERS)
        response.raise_for_status()
        return response.json()


def _parse_date(time_str: str, precision: int = 11) -> str:
    """Convert Wikidata time to readable date."""
    if not time_str:
        return ""
    time_str = time_str.lstrip("+").lstrip("-")
    try:
        if precision >= 11:
            return time_str[:10]
        elif precision >= 10:
            return time_str[:7]
        else:
            return time_str[:4]
    except:
        return time_str[:10]


def _extract_snak_value(snak: dict) -> str:
    """Extract value from a Wikidata snak - simplified to skip QID resolution."""
    snaktype = snak.get("snaktype")
    if snaktype != "value":
        return ""

    datavalue = snak.get("datavalue", {})
    dtype = datavalue.get("type")
    value = datavalue.get("value")

    if dtype == "wikibase-entityid":
        qid = value.get("id", "")
        return qid  # Just return the QID as-is
    elif dtype == "time":
        precision = value.get("precision", 11)
        return _parse_date(value.get("time", ""), precision)
    elif dtype == "string":
        return str(value)
    elif dtype == "monolingualtext":
        return value.get("text", "")
    elif dtype == "quantity":
        amount = value.get("amount", "").lstrip("+")
        unit_qid = value.get("unit", "").split("/")[-1]
        if unit_qid and unit_qid != "1":
            return f"{amount} {unit_qid}"
        return amount

    return ""


def _extract_all_events(claims: dict, prop_labels: dict) -> List[dict]:
    """Extract all events with dates from claims."""
    date_props = {"P569", "P570", "P571", "P576", "P577", "P580", "P582", "P585"}

    events = []

    for prop_id, statements in claims.items():
        if prop_id in SKIP_PROPS:
            continue

        prop_label = prop_labels.get(prop_id, f"Property:{prop_id}")

        for statement in statements:
            mainsnak = statement.get("mainsnak", {})
            qualifiers = statement.get("qualifiers", {})

            # Case 1: Property itself is a date
            if prop_id in date_props:
                datavalue = mainsnak.get("datavalue", {})
                if datavalue.get("type") == "time":
                    v = datavalue["value"]
                    date = _parse_date(v.get("time", ""), v.get("precision", 11))
                    events.append({
                        "type": prop_label,
                        "event": "",
                        "start": date,
                        "end": "",
                    })
                continue

            # Case 2: Statement has date qualifiers
            has_date = any(q in qualifiers for q in DATE_QUALIFIERS)
            if not has_date:
                continue

            # Extract main value
            val_str = _extract_snak_value(mainsnak)

            # Extract dates from qualifiers
            start_date = end_date = point_date = ""

            if "P580" in qualifiers:
                v = qualifiers["P580"][0]["datavalue"]["value"]
                start_date = _parse_date(v.get("time", ""), v.get("precision", 11))

            if "P582" in qualifiers:
                v = qualifiers["P582"][0]["datavalue"]["value"]
                end_date = _parse_date(v.get("time", ""), v.get("precision", 11))

            if "P585" in qualifiers:
                v = qualifiers["P585"][0]["datavalue"]["value"]
                point_date = _parse_date(v.get("time", ""), v.get("precision", 11))

            if "P571" in qualifiers:
                v = qualifiers["P571"][0]["datavalue"]["value"]
                if not start_date:
                    start_date = _parse_date(v.get("time", ""), v.get("precision", 11))

            final_start = start_date or point_date

            events.append({
                "type": prop_label,
                "event": val_str,
                "start": final_start or "Unknown",
                "end": end_date,
            })

    # Sort by start date
    events.sort(key=lambda x: x["start"] if x["start"] != "Unknown" else "9999")

    return events


async def _fetch_prop_labels(prop_ids: List[str]) -> dict:
    """Fetch human-readable labels for property IDs."""
    result = dict(PROP_LABELS)
    unknown = [p for p in prop_ids if p not in result]

    if not unknown:
        return result

    for i in range(0, len(unknown), 50):
        batch = unknown[i:i+50]
        params = {
            "action": "wbgetentities",
            "ids": "|".join(batch),
            "props": "labels",
            "languages": "en",
            "format": "json"
        }
        try:
            data = await _safe_request("https://www.wikidata.org/w/api.php", params)
            for pid, entity in data.get("entities", {}).items():
                label = entity.get("labels", {}).get("en", {}).get("value", pid)
                result[pid] = label
        except Exception:
            pass

    return result


async def timeline_agent(qid: str, db: AsyncSession) -> Dict[str, Any]:
    """
    Extract timeline events from Wikidata entity.
    """
    # Fetch entity data
    entity_data = await fetch_entity_data(qid)
    name = entity_data["labels"]["en"]["value"]
    description = entity_data.get("descriptions", {}).get("en", {}).get("value", "")
    claims = entity_data.get("claims", {})

    # Fetch property labels
    prop_labels = await _fetch_prop_labels(list(claims.keys()))

    # Extract events
    events = _extract_all_events(claims, prop_labels)

    return {
        "name": name,
        "description": description,
        "total_events": len(events),
        "timeline": events,
    }
