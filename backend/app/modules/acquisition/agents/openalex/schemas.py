"""Schemas for OpenAlex profile response."""

from pydantic import BaseModel, Field


class OpenAlexMetrics(BaseModel):
    """Author-level metric summary from OpenAlex."""

    works_count: int = 0
    cited_by_count: int = 0
    h_index: int = 0


class OpenAlexInstitution(BaseModel):
    """Primary institution metadata for an author."""

    name: str | None = None
    country: str | None = None
    type: str | None = None


class OpenAlexTopic(BaseModel):
    """A topic associated with the author."""

    name: str | None = None
    field: str | None = None


class OpenAlexWork(BaseModel):
    """A top cited work by the author."""

    title: str | None = None
    year: int | None = None
    citations: int = 0
    venue: str | None = None


class OpenAlexCoauthor(BaseModel):
    """A frequent collaborator for the author."""

    openalex_id: str
    name: str | None = None
    collaboration_count: int = 0


class OpenAlexProfile(BaseModel):
    """Normalized OpenAlex profile returned by the API route."""

    openalex_author_id: str
    name: str | None = None
    metrics: OpenAlexMetrics
    primary_institution: OpenAlexInstitution | None = None
    top_topics: list[OpenAlexTopic] = Field(default_factory=list)
    top_works: list[OpenAlexWork] = Field(default_factory=list)
    top_coauthors: list[OpenAlexCoauthor] = Field(default_factory=list)
