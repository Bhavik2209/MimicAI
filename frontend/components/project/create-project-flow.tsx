"use client"

import { useState } from "react"
import { DangerTriangle, Restart } from "@/components/ui/solar-icons"
import { ProjectCreationForm } from "./project-creation-form"
import { EntitySelection } from "./entity-selection"
import { IntelligentLoading } from "./intelligent-loading"
import type { ProjectResponse, ResearchRunResponse } from "@/lib/api"

interface ProjectContext {
    name: string
    description: string
    target: string
    createdDate: string
}

interface ProfileData {
    id: string
    name: string
    initials: string
    category: string
    era: string
}

interface CreateProjectFlowProps {
    onComplete: (
        project: ProjectContext,
        profile: ProfileData,
        result: { projectRecord: ProjectResponse; research: ResearchRunResponse }
    ) => void
    onClose: () => void
}

export function CreateProjectFlow({ onComplete, onClose }: Readonly<CreateProjectFlowProps>) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [projectData, setProjectData] = useState<ProjectContext | null>(null)
    const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null)
    const [flowError, setFlowError] = useState<string | null>(null)
    const [loadingKey, setLoadingKey] = useState(0)

    const handleSearch = (data: { name: string; description: string; target: string }) => {
        setProjectData({
            ...data,
            createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        })
        setStep(2)
    }

    const handleEntitySelect = (profile: ProfileData) => {
        setSelectedProfile(profile)
        setFlowError(null)
        setStep(3)
    }

    const handleLoadingComplete = (result: { projectRecord: ProjectResponse; research: ResearchRunResponse }) => {
        if (projectData && selectedProfile) {
            onComplete(projectData, selectedProfile, result)
        }
    }

    return (
        <div
            style={{
                background: "var(--bg)",
                overflow: step === 3 ? "hidden" : undefined,
                height: step === 3 ? "calc(100vh - var(--topbar-h))" : undefined,
            }}
        >
            <div className="transition-all duration-300 ease-in-out">
                {step === 1 && (
                    <ProjectCreationForm
                        onSearch={handleSearch}
                        onClose={onClose}
                    />
                )}

                {step === 2 && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <EntitySelection
                            searchQuery={projectData?.target || ""}
                            onSelect={handleEntitySelect}
                            onBack={() => setStep(1)}
                            onClose={onClose}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ overflow: "hidden", height: "calc(100vh - var(--topbar-h))" }}
                    >
                        {flowError ? (
                            <div className="w-full h-full flex items-center justify-center px-6">
                                <div
                                    className="w-full max-w-2xl rounded-[16px] p-8"
                                    style={{
                                        background: "var(--surface-1)",
                                        border: "1px solid var(--border)",
                                    }}
                                >
                                    <div className="flex items-center gap-3 mb-4">
                                        <DangerTriangle size={20} style={{ color: "#F87171" }} />
                                        <h3 className="font-sans" style={{ fontSize: 22, color: "var(--text-1)", fontWeight: 600 }}>
                                            Research Failed
                                        </h3>
                                    </div>
                                    <p className="font-sans" style={{ fontSize: 14, color: "var(--text-2)", lineHeight: 1.7 }}>
                                        We could not complete the research pipeline for this project. You can retry now,
                                        or go back and adjust the selected entity.
                                    </p>
                                    <div
                                        className="font-mono mt-4 rounded-[10px] p-3"
                                        style={{
                                            fontSize: 12,
                                            color: "var(--text-2)",
                                            background: "var(--surface-2)",
                                            border: "1px solid var(--border-soft)",
                                            whiteSpace: "pre-wrap",
                                            wordBreak: "break-word",
                                        }}
                                    >
                                        {flowError}
                                    </div>

                                    <div className="mt-6 flex gap-3">
                                        <button
                                            type="button"
                                            className="btn-intelligence-primary flex items-center gap-2"
                                            style={{ height: 36, padding: "0 16px", fontSize: 13 }}
                                            onClick={() => {
                                                setFlowError(null)
                                                setLoadingKey((prev) => prev + 1)
                                            }}
                                        >
                                            <Restart size={16} />
                                            Retry
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            style={{ height: 36, padding: "0 16px", fontSize: 13 }}
                                            onClick={() => {
                                                setFlowError(null)
                                                setStep(2)
                                            }}
                                        >
                                            Back to Entity Selection
                                        </button>

                                        <button
                                            type="button"
                                            className="btn btn-ghost"
                                            style={{ height: 36, padding: "0 16px", fontSize: 13 }}
                                            onClick={onClose}
                                        >
                                            Close
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <IntelligentLoading
                                key={loadingKey}
                                wikidataId={selectedProfile?.id || ""}
                                projectName={projectData?.name || ""}
                                projectDescription={projectData?.description}
                                contextHint={projectData?.description}
                                onComplete={handleLoadingComplete}
                                onError={(message) => {
                                    console.error("Research pipeline failed:", message)
                                    setFlowError(message)
                                }}
                            />
                        )}
                    </div>
                )}
            </div>
        </div>
    )
}
