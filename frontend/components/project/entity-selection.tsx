"use client"

import { useState, useEffect } from "react"
import {
  CheckCircle,
  SquareAltArrowLeft,
  ArrowRightUp,
  CloseSquare
} from "@/components/ui/solar-icons"
import { searchEntities } from "@/lib/api"

const SEARCH_STAGE_INTERVAL_MS = 1400

const SEARCH_STAGES = [
    "Normalizing search intent",
    "Querying identity sources",
    "Ranking candidate matches",
    "Preparing profile previews",
]

function formatElapsed(ms: number) {
    const totalSeconds = Math.floor(ms / 1000)
    const minutes = Math.floor(totalSeconds / 60)
    const seconds = totalSeconds % 60
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
}

function AnimatedMimicLine() {
    return (
        <div
            style={{
                position: "relative",
                width: "min(240px, 52vw)",
                height: "min(128px, 28vw)",
            }}
        >
            <svg
                viewBox="0 0 280 200"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                aria-label="Mimic AI loading logo"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
                <path
                    d="M 20 180 L 20 60 A 40 40 0 0 1 100 60 L 100 120 A 40 40 0 0 0 180 120 L 180 60 A 40 40 0 0 1 260 60 L 260 180"
                    stroke="color-mix(in srgb, var(--accent) 18%, transparent)"
                    strokeWidth="40"
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                />
            </svg>

            <svg
                viewBox="0 0 280 200"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                aria-hidden="true"
                style={{ position: "absolute", inset: 0, width: "100%", height: "100%" }}
            >
                <path
                    d="M 20 180 L 20 60 A 40 40 0 0 1 100 60 L 100 120 A 40 40 0 0 0 180 120 L 180 60 A 40 40 0 0 1 260 60 L 260 180"
                    stroke="var(--accent)"
                    strokeWidth="40"
                    strokeLinecap="butt"
                    strokeLinejoin="round"
                    pathLength="1000"
                    strokeDasharray="220 780"
                    style={{
                        filter: "drop-shadow(0 0 16px color-mix(in srgb, var(--accent) 30%, transparent))",
                        animation: "mimic-logo-flow 2.8s linear infinite",
                    }}
                />
            </svg>
        </div>
    )
}

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
    onClose: () => void
}

export function EntitySelection({ searchQuery, onSelect, onBack, onClose }: Readonly<EntitySelectionProps>) {
    const [selectedId, setSelectedId] = useState<string | null>(null)
    const [candidates, setCandidates] = useState<EntityProfile[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [elapsedMs, setElapsedMs] = useState(0)
    const [currentStage, setCurrentStage] = useState(0)

    useEffect(() => {
        const fetchCandidates = async () => {
            try {
                setLoading(true)
                const data = await searchEntities(searchQuery)

                const mapped: EntityProfile[] = data.slice(0, 3).map((item: any) => {
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

    useEffect(() => {
        if (!loading) return

        const clockTimer = globalThis.setInterval(() => {
            setElapsedMs((prev) => prev + 1000)
        }, 1000)

        const stageTimer = globalThis.setInterval(() => {
            setCurrentStage((prev) => (prev + 1) % SEARCH_STAGES.length)
        }, SEARCH_STAGE_INTERVAL_MS)

        return () => {
            globalThis.clearInterval(clockTimer)
            globalThis.clearInterval(stageTimer)
        }
    }, [loading])

    const selectedProfile = candidates.find(r => r.id === selectedId)

    if (loading) {
        return (
            <div className="flex items-center justify-center px-6 py-8" style={{ minHeight: "calc(100vh - var(--topbar-h))" }}>
                <div
                    className="w-full max-w-[760px] rounded-[32px] border px-6 py-8 sm:px-10 sm:py-9"
                    style={{
                        borderColor: "var(--border-soft)",
                        background:
                            "linear-gradient(180deg, color-mix(in srgb, var(--surface-2) 94%, transparent) 0%, color-mix(in srgb, var(--surface-1) 98%, transparent) 100%)",
                        boxShadow: "0 18px 44px rgba(0,0,0,0.18)",
                    }}
                >
                    <style>{`
                        @keyframes mimic-logo-flow {
                            from { stroke-dashoffset: 0; }
                            to { stroke-dashoffset: -1000; }
                        }
                        @keyframes loading-step-enter {
                            from { opacity: 0; transform: translateY(8px); }
                            to { opacity: 1; transform: translateY(0); }
                        }
                    `}</style>

                    <div className="mx-auto flex max-w-[520px] flex-col items-center text-center">
                        <AnimatedMimicLine />

                        <div
                            className="mt-6 font-mono text-[10px] uppercase tracking-[0.18em]"
                            style={{ color: "var(--text-3)" }}
                        >
                            Candidate search
                        </div>

                        <h1
                            className="mt-4 font-sans text-[24px] font-semibold leading-[1.06] tracking-[-0.03em] sm:text-[30px]"
                            style={{ color: "var(--text-1)" }}
                        >
                            Resolving entity matches for {" "}
                            <span className="block" style={{ color: "var(--accent)" }}>
                                {searchQuery}
                            </span>
                        </h1>

                        <p
                            className="mt-4 max-w-[40rem] font-sans text-[14px] leading-7 sm:text-[15px]"
                            style={{ color: "var(--text-2)" }}
                        >
                            We are finding and ranking the closest identity candidates before you select one profile.
                        </p>

                        <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
                            <div
                                className="rounded-full border px-3 py-2 font-mono text-[10px] uppercase tracking-[0.12em]"
                                style={{
                                    borderColor: "var(--border-soft)",
                                    color: "var(--text-3)",
                                    background: "color-mix(in srgb, var(--surface-2) 82%, transparent)",
                                }}
                            >
                                elapsed {formatElapsed(elapsedMs)}
                            </div>
                        </div>
                    </div>

                    <div className="mx-auto mt-7 max-w-[540px]">
                        <div
                            key={currentStage}
                            className="flex items-start gap-4 rounded-[18px] border px-4 py-4"
                            style={{
                                animation: "loading-step-enter 220ms ease-out",
                                borderColor: "var(--border-accent)",
                                background: "var(--gold-dim)",
                            }}
                        >
                            <div
                                className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border"
                                style={{
                                    borderColor: "var(--border-accent)",
                                    background: "var(--gold-dim)",
                                }}
                            >
                                <span
                                    style={{
                                        width: 7,
                                        height: 7,
                                        borderRadius: "999px",
                                        background: "var(--accent)",
                                        opacity: 0.9,
                                    }}
                                />
                            </div>

                            <div className="min-w-0 flex-1 pt-[1px] text-left">
                                <div
                                    className="font-mono text-[10px] uppercase tracking-[0.12em]"
                                    style={{ color: "var(--text-3)" }}
                                >
                                    Step {currentStage + 1} of {SEARCH_STAGES.length}
                                </div>
                                <div
                                    className="mt-2 font-sans text-[15px] font-medium leading-6"
                                    style={{ color: "var(--text-1)" }}
                                >
                                    {SEARCH_STAGES[currentStage]}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
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
            <div className="w-full max-w-[1050px] animate-in fade-in duration-700" style={{ marginTop: "-40px" }}>
                <div className="text-center mb-4 relative">
                    <button
                        onClick={onClose}
                        className="absolute -top-12 right-0 p-2 rounded-full transition-colors"
                        style={{
                            color: "var(--text-3)",
                            background: "var(--surface-2)",
                            border: "1px solid var(--border-soft)",
                        }}
                        title="Close Research"
                    >
                        <CloseSquare size={20} weight="Broken" />
                    </button>
                    <button
                        onClick={onBack}
                        className="inline-flex items-center gap-1.5 font-sans text-[10px] uppercase tracking-widest font-semibold mb-2 transition-all opacity-60 hover:opacity-100"
                        style={{ color: "var(--text-3)", background: "none", border: "none", cursor: "pointer" }}
                    >
                        <SquareAltArrowLeft size={10} />
                        Modify Search
                    </button>
                    <h1 className="font-sans italic text-3xl mb-1" style={{ color: "var(--text-1)", fontWeight: 800, letterSpacing: "-0.03em" }}>
                        Resolve Intelligence Target
                    </h1>
                    <p className="font-sans text-xs" style={{ color: "var(--text-3)", letterSpacing: "0.01em" }}>
                        Select the specific profile to initiate reconstruction for "{searchQuery}".
                    </p>
                </div>

                <div className="flex flex-col md:flex-row justify-center items-center gap-6 mb-10 w-full mx-auto">
                    {candidates.length > 0 ? (
                        candidates.map((profile) => {
                            const isSelected = selectedId === profile.id
                            return (
                                <button
                                    key={profile.id}
                                    onClick={() => setSelectedId(profile.id)}
                                    type="button"
                                    className="flex-1 no-hover-lift group relative rounded-[28px] transition-all duration-300 cursor-pointer overflow-hidden"
                                    style={{
                                        height: "400px",
                                        borderColor: isSelected ? "var(--gold)" : "var(--border-soft)",
                                        width: "100%",
                                        minWidth: "260px",
                                        maxWidth: "320px",
                                        textAlign: "left",
                                        borderWidth: 1,
                                        background: "var(--surface-1)",
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
                                        {/* Smooth bottom shadow for text legibility */}
                                        <div
                                            className="absolute inset-x-0 bottom-0 h-1/2"
                                            style={{
                                                background: "linear-gradient(to top, rgba(0, 0, 0, 1) 0%, rgba(0, 0, 0, 0.8) 20%, rgba(0, 0, 0, 0.4) 50%, transparent 100%)",
                                            }}
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

                                        <h3 className="font-sans text-2xl mb-1" style={{ color: "var(--text-1)", fontWeight: 700, letterSpacing: "-0.02em" }}>
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
                                                <ArrowRightUp size={10} />
                                                PREVIEW RECORDS
                                            </span>
                                            {isSelected && (
                                                <div
                                                    className="flex items-center justify-center rounded-full"
                                                    style={{ background: "var(--gold)", width: 22, height: 22 }}
                                                >
                                                    <CheckCircle size={14} weight="Broken" style={{ color: "var(--bg)" }} />
                                                </div>
                                            )}
                                        </div>
                                    </div>


                                </button>
                            )
                        })
                    ) : (
                        <div className="w-full text-center py-20 font-sans" style={{ color: "var(--text-3)" }}>
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
                        <CheckCircle size={18} weight="Bold" />
                    </button>
                </div>
            </div>
        </div>
    )
}
