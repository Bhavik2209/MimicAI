const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL || "/api/backend").replace(/\/$/, "")

async function requestJson<T>(path: string, init?: RequestInit): Promise<T> {
    const url = `${API_BASE_URL}${path}`
    let response: Response

    try {
        response = await fetch(url, init)
    } catch (error) {
        const reason = error instanceof Error ? error.message : "Network request failed"
        throw new Error(`Network error while calling ${url}: ${reason}`)
    }

    if (!response.ok) {
        let detail = ""
        try {
            const text = await response.text()
            if (text) {
                try {
                    const parsed = JSON.parse(text) as { detail?: string }
                    detail = parsed?.detail || text
                } catch {
                    detail = text
                }
            }
        } catch {
            detail = ""
        }

        throw new Error(
            detail
                ? `Request failed (${response.status}) for ${url}: ${detail}`
                : `Request failed (${response.status}) for ${url}`
        )
    }

    return response.json() as Promise<T>
}

export interface EntitySearchCandidate {
    wikidata_id: string
    name: string
    description?: string | null
    image_url?: string | null
}

export interface ProjectCreateRequest {
    title: string
    description?: string
    entity_id?: string
}

export interface ProjectUpdateRequest {
    title: string
    description?: string
}

export interface ProjectDeleteResponse {
    status: string
    project_id: string
}

export interface ProjectResponse {
    id: string
    user_id: string
    title: string
    description?: string | null
    entity_id?: string | null
    entity_name?: string | null
    entity_image_url?: string | null
    entity_wikidata_id?: string | null
    created_at: string
    updated_at: string
}

export interface CharacterTrait {
    trait: string
    evidence: string
}

export interface PersonalityProfile {
    core_character_traits: CharacterTrait[]
    cognitive_style: string
    emotional_register: string
    self_concept: string
}

export interface RhetoricalDNA {
    signature_moves: string[]
    sentence_energy: string
    favourite_abstractions: string[]
}

export interface Worldview {
    core_beliefs: string[]
    recurring_themes: string[]
    internal_tensions?: string | null
}

export interface QuoteCluster {
    label: string
    summary: string
    personality_insight: string
    representative_quotes: string[]
}

export interface QuotesAnalysis {
    executive_summary?: string
    // New schema
    personality_profile?: PersonalityProfile
    rhetorical_dna?: RhetoricalDNA
    worldview?: Worldview
    quote_clusters?: QuoteCluster[]
    influence_and_legacy?: string
    analyst_caveats?: string[]

    // Old schema / Backward compatibility
    voice_and_tone?: string
    worldview_and_values?: string
    communication_patterns?: string[]
    section_analysis?: Array<{
        title?: string
        summary?: string
        insights?: string[]
        supporting_quotes?: string[]
    }>
    presentation_notes?: string[]
}

export interface ResearchRunResponse {
    status: string
    basic_info?: {
        name?: string
        image_url?: string | null
        description?: string | null
        wikidata_id?: string
    }
    acquisition?: {
        wiki?: {
            entity_id?: string
            wikipedia_title?: string
            intro_summary?: string
            sections?: Array<{
                section?: string
                text?: string
            }>
        }
        socials?: {
            website?: string[]
            twitter?: Array<{ url?: string; handle?: string }>
            facebook?: Array<{ url?: string; handle?: string }>
            instagram?: Array<{ url?: string; handle?: string }>
            linkedin?: Array<{ url?: string; handle?: string }>
            youtube?: Array<{ url?: string; handle?: string }>
        }
        quotes?: {
            name?: string
            entity_id?: string
            analysis?: QuotesAnalysis
            quotes?: Array<string | { quote?: string }>
        }
        openalex?: Record<string, unknown> | null
        timeline?: {
            entity_id?: string
            description?: string
            total_events?: number
            timeline?: Array<{
                start?: string
                end?: string
                type?: string
                event?: string
            }>
        }
        news?: Array<{
            url?: string
            title?: string
            source?: string
            published_at?: string
        }>
        resources?: Array<{
            source_type?: string
            title?: string | null
            url?: string
        }>
        conversation?: {
            videos?: Array<{
                url?: string
                title?: string
            }>
        }
    }
    analysis?: {
        personality?: QuotesAnalysis
        display?: {
            controversy_section?: {
                items?: unknown[]
            }
        }
    }
    vector_store?: {
        collection?: string
        stored_points?: number
        source_counts?: Record<string, number>
    }
}

export async function searchEntities(name: string) {
    return requestJson<EntitySearchCandidate[]>("/entity/search", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    })
}

export async function createProject(payload: ProjectCreateRequest) {
    return requestJson<ProjectResponse>("/project/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
}

export async function listProjects() {
    return requestJson<ProjectResponse[]>("/project")
}

export async function updateProject(projectId: string, payload: ProjectUpdateRequest) {
    return requestJson<ProjectResponse>(`/project/${projectId}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    })
}

export async function deleteProject(projectId: string) {
    return requestJson<ProjectDeleteResponse>(`/project/${projectId}`, {
        method: "DELETE",
    })
}

const inFlightProjectRequests = new Map<string, Promise<ProjectResponse>>()
const inFlightResearchRequests = new Map<string, Promise<ResearchRunResponse>>()

export async function createProjectDeduped(payload: ProjectCreateRequest) {
    const key = payload.entity_id || payload.title || "unknown"
    const existing = inFlightProjectRequests.get(key)
    if (existing) {
        return existing
    }

    const requestPromise = createProject(payload).finally(() => {
        inFlightProjectRequests.delete(key)
    })
    inFlightProjectRequests.set(key, requestPromise)
    return requestPromise
}

export async function runEntityResearch(entityId: string) {
    const key = entityId.trim()
    const existing = inFlightResearchRequests.get(key)
    if (existing) {
        return existing
    }

    const requestPromise = requestJson<ResearchRunResponse>(`/research/${key}`).finally(() => {
        inFlightResearchRequests.delete(key)
    })
    inFlightResearchRequests.set(key, requestPromise)
    return requestPromise
}
