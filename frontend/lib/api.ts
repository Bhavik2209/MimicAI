const API_BASE_URL = "http://localhost:8000"

export async function searchEntities(name: string) {
    const response = await fetch(`${API_BASE_URL}/entities/search`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ name }),
    })

    if (!response.ok) {
        throw new Error("Failed to search entities")
    }

    return response.json()
}

export async function confirmEntity(wikidataId: string) {
    const response = await fetch(`${API_BASE_URL}/entities/confirm`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({ wikidata_id: wikidataId }),
    })

    if (!response.ok) {
        throw new Error("Failed to confirm entity")
    }

    return response.json()
}
