"use client"

import { useState } from "react"
import { ProjectCreationForm } from "./project-creation-form"
import { EntitySelection } from "./entity-selection"
import { IntelligentLoading } from "./intelligent-loading"

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
    onComplete: (project: ProjectContext, profile: ProfileData) => void
    onClose: () => void
}

export function CreateProjectFlow({ onComplete, onClose }: CreateProjectFlowProps) {
    const [step, setStep] = useState<1 | 2 | 3>(1)
    const [projectData, setProjectData] = useState<ProjectContext | null>(null)
    const [selectedProfile, setSelectedProfile] = useState<ProfileData | null>(null)

    const handleSearch = (data: { name: string; description: string; target: string }) => {
        setProjectData({
            ...data,
            createdDate: new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
        })
        setStep(2)
    }

    const handleEntitySelect = (profile: ProfileData) => {
        setSelectedProfile(profile)
        setStep(3)
    }

    const handleLoadingComplete = () => {
        if (projectData && selectedProfile) {
            onComplete(projectData, selectedProfile)
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
                            onSelect={handleEntitySelect}
                            onBack={() => setStep(1)}
                        />
                    </div>
                )}

                {step === 3 && (
                    <div
                        className="animate-in fade-in slide-in-from-bottom-4 duration-500"
                        style={{ overflow: "hidden", height: "calc(100vh - var(--topbar-h))" }}
                    >
                        <IntelligentLoading onComplete={handleLoadingComplete} />
                    </div>
                )}
            </div>
        </div>
    )
}
