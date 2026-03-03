"use client"

import { useState } from "react"
import { Check, ArrowLeft, ExternalLink } from "lucide-react"

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

const mockResults: EntityProfile[] = [
    {
        id: "tesla-1",
        name: "Nikola Tesla",
        descriptor: "Physicist | Inventor | 19th-20th Century",
        category: "Physicist",
        era: "1856–1943",
        region: "Austrian Empire / US",
        initials: "NT",
        imageUrl: "https://images.unsplash.com/photo-1581093191146-59998822080a?q=80&w=400&h=500&auto=format&fit=crop"
    },
    {
        id: "da-vinci-1",
        name: "Leonardo da Vinci",
        descriptor: "Polymath | Artist | Renaissance",
        category: "Polymath",
        era: "1452–1519",
        region: "Italy",
        initials: "LV",
        imageUrl: "https://images.unsplash.com/photo-1578301978693-85fa9c0320b9?q=80&w=400&h=500&auto=format&fit=crop"
    },
    {
        id: "curie-1",
        name: "Marie Curie",
        descriptor: "Physicist | Chemist | Nobel Laureate",
        category: "Physicist",
        era: "1867–1934",
        region: "Poland / France",
        initials: "MC",
        imageUrl: "https://images.unsplash.com/photo-1532187863486-abf9d39d5018?q=80&w=400&h=500&auto=format&fit=crop"
    }
]

interface EntitySelectionProps {
    onSelect: (profile: EntityProfile) => void
    onBack: () => void
}

export function EntitySelection({ onSelect, onBack }: EntitySelectionProps) {
    const [selectedId, setSelectedId] = useState<string | null>(null)

    const selectedProfile = mockResults.find(r => r.id === selectedId)

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
                        Select the specific profile to initiate reconstruction.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                    {mockResults.map((profile) => {
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
                    })}
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
