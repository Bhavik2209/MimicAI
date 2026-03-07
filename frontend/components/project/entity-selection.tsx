"use client"

import { useState, useEffect } from "react"
import { Check, ArrowLeft, ExternalLink, Loader2 } from "lucide-react"
import { searchEntities } from "@/lib/api"

interface EntityProfile {
    id: string
    name: string
    descriptor: string
    category: string
    era: string
    region: string
    initials: string
    imageUrl?: string
}

interface EntitySelectionProps {
    searchQuery: string
    onSelect: (profile: any) => void
    onBack: () => void
}

export function EntitySelection({ searchQuery, onSelect, onBack }: EntitySelectionProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [candidates, setCandidates] = useState<EntityProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true)
                const data = await searchEntities(searchQuery)

                const mapped: EntityProfile[] = data.map((item: any) => {
                    const nameParts = item.name.split(" ")
                    const initials = nameParts.length > 1
                        ? `${nameParts[0][0]}${nameParts[nameParts.length - 1][0]}`.toUpperCase()
                        : item.name.substring(0, 2).toUpperCase()

                    return {
                        id: item.wikidata_id,
                        name: item.name,
                        descriptor: item.description || "No description available",
                        category: "Wikidata Entity",
                        era: "Verified Record",
                        region: "Global",
                        initials: initials,
                        imageUrl: item.image_url
                    }
                })

                setCandidates(mapped)
            } catch (err) {
                console.error("Search error:", err)
                setError("Failed to fetch intelligence profiles.")
            } finally {
                setLoading(false)
            }
        }

        if (searchQuery) {
            fetchCandidates()
        }
    }, [searchQuery])

    const selectedProfile = candidates.find(r => r.id === selectedId)

    if (loading) {
        return (
            <div
                className="flex flex-col items-center justify-center p-6 gap-4"
                style={{ height: "100vh", background: "var(--bg)" }}
            >
                <Loader2 className="animate-spin text-gold" size={40} />
                <p className="font-serif italic text-xl text-text-2">Initializing Reconstruction...</p>
            </div>
        )
    }

    if (error) {
        return (
            <div
                className="flex flex-col items-center justify-center p-6 gap-6"
                style={{ height: "100vh", background: "var(--bg)" }}
            >
                <p className="font-sans text-text-3">{error}</p>
                <button onClick={onBack} className="btn btn-ghost">Return to Search</button>
            </div>
        )
    }

    return (
        <div
            className="flex flex-col items-center justify-center px-6 overflow-hidden transition-colors duration-300"
            style={{ height: "100vh", background: "var(--bg)" }}
        >
            <div className="w-full max-w-4xl animate-in fade-in duration-700" style={{ marginTop: "-40px" }}>
                <div className="text-center mb-4">
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest font-semibold mb-2 transition-all opacity-60 hover:opacity-100"
                        style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}
                    >
                        <ArrowLeft size={10} />
                        Modify Search
                    </button>
                    <h1 className="font-serif italic text-3xl mb-1" style={{ color: "var(--text-1)", fontWeight: 600 }}>
                        Resolve Intelligence Target
                    </h1>
                    <p className="font-sans text-xs" style={{ color: "var(--text-3)" }}>
                        Select the specific profile to initiate reconstruction for "{searchQuery}".
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {candidates.length > 0 ? (
                        candidates.map((profile) => {
                            const isSelected = selectedId === profile.id
                            return (
                                <div
                                    key={profile.id}
                                    onClick={() => setSelectedId(profile.id)}
                                    className="glass-card no-hover-lift group relative rounded-[20px] transition-all duration-500 cursor-pointer overflow-hidden"
                                    style={{
                                        height: "320px",
                                        borderColor: isSelected ? "rgba(163,191,250,0.4)" : undefined,
                                    }}
                                >
                                    {/* Image Background with Theme-Aware Gradient */}
                                    <div className="absolute inset-0">
                                        {profile.imageUrl && (
                                            <img
                                                src={profile.imageUrl}
                                                alt={profile.name}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                style={{
                                                    filter: isSelected
                                                        ? "grayscale(0) brightness(1.1)"
                                                        : "grayscale(1) brightness(0.7)"
                                                }}
                                            />
                                        )}
                                        {/* We use a multi-step gradient that adapts to the theme background */}
                                        <div
                                            className="absolute inset-0"
                                            style={{
                                                background: `linear-gradient(to top, var(--bg) 0%, transparent 60%, transparent 100%)`
                                            }}
                                        />
                                        {/* Subtle top overlay to ensure text readability in light mode */}
                                        <div
                                            className="absolute inset-0 opacity-20"
                                            style={{ background: "var(--bg)" }}
                                        />
                                    </div>

                                    {/* Content Overlay */}
                                    <div className="absolute inset-0 p-5 flex flex-col justify-end">
                                        <div className="mb-1.5">
                                            <span
                                                className="font-mono text-[8px] uppercase tracking-widest px-1.5 py-0.5 rounded"
                                                style={{
                                                    background: isSelected ? "var(--gold)" : "var(--surface-3)",
                                                    color: isSelected ? "var(--bg)" : "var(--gold)"
                                                }}
                                            >
                                                {isSelected ? "PROFILE SELECTED" : "VERIFIED MATCH"}
                                            </span>
                                        </div>

                                        <h3 className="font-serif text-xl mb-1" style={{ color: "var(--text-1)", fontWeight: 600 }}>
                                            {profile.name}
                                        </h3>

                                        <div className="space-y-0.5 mb-3">
                                            <div className="flex items-start gap-2">
                                                <span className="font-mono text-[8px] uppercase mt-0.5" style={{ color: "var(--gold)", whiteSpace: "nowrap" }}>Brief:</span>
                                                <span className="font-sans text-[10px] line-clamp-2 italic" style={{ color: "var(--text-2)", lineHeight: 1.4 }}>{profile.descriptor}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[8px] uppercase" style={{ color: "var(--gold)" }}>Affiliation:</span>
                                                <span className="font-sans text-[10px]" style={{ color: "var(--text-2)" }}>{profile.category}</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <span className="font-mono text-[8px] uppercase" style={{ color: "var(--gold)" }}>Active Era:</span>
                                                <span className="font-sans text-[10px]" style={{ color: "var(--text-2)" }}>{profile.era}</span>
                                            </div>
                                        </div>

                                        {/* Actions/Verify */}
                                        <div
                                            className="flex items-center justify-between pt-2.5 border-t transition-all duration-300"
                                            style={{
                                                opacity: isSelected ? 1 : 0.6,
                                                borderColor: "var(--border-soft)"
                                            }}
                                        >
                                            <span
                                                className="font-sans text-[9px] font-bold transition-colors flex items-center gap-1.5"
                                                style={{ color: "var(--text-3)" }}
                                            >
                                                <ExternalLink size={10} />
                                                PREVIEW RECORDS
                                            </span>
                                            {isSelected && (
                                                <div
                                                    className="flex items-center justify-center rounded-full"
                                                    style={{ background: "var(--gold)", width: 22, height: 22 }}
                                                >
                                                    <Check size={14} style={{ color: "var(--bg)" }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Selection Ring (Animated) */}
                                    {isSelected && (
                                        <div className="absolute inset-0 border-[2px] animate-pulse pointer-events-none" style={{ borderColor: "var(--gold)" }} />
                                    )}
                                </div>
                            )
                        })
                    ) : (
                        <div className="col-span-3 text-center py-10 text-text-3 font-serif">
                            No intelligence profiles found for "{searchQuery}".
                        </div>
                    )}
                </div>

                <div className="flex justify-center">
                    <button
                        disabled={!selectedId}
                        onClick={() => selectedProfile && onSelect(selectedProfile)}
                        className="btn btn-primary flex items-center justify-center gap-2 px-10 py-3 min-w-[300px] rounded-full"
                    >
                        Proceed with Selection
                        <Check size={18} />
                    </button>
                </div>
            </div>
        </div>
    )
}
