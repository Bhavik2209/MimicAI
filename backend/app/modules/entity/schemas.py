from pydantic import BaseModel
from uuid import UUID
from typing import List, Optional


class EntitySearchRequest(BaseModel):
    name: str


class EntityCandidate(BaseModel):
    wikidata_id: str
    name: str
    description: Optional[str] = None
    image_url: Optional[str] = None


class LabelItem(BaseModel):
    id: str
    label: Optional[str] = None


class EntityConfirmRequest(BaseModel):
    wikidata_id: str


class EntityConfirmResponse(BaseModel):
    wikidata_id: str
    resolved_name: Optional[str] = None
    description: Optional[str] = None
    instance_of: List[LabelItem] = []
    occupation: List[LabelItem] = []
    birth_date: Optional[str] = None
    death_date: Optional[str] = None
    is_living: bool = True
    nationality: List[LabelItem] = []
    image_url: Optional[str] = None
    openalex_candidate: bool = False
    orcid_ids: List[str] = []
    status: str = "confirmed"


