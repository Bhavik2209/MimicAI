"use client"

import { useState } from "react"
import { 
  AltArrowRight, 
  Magnifier, 
  SquareAltArrowLeft, 
  CloseSquare 
} from "@/components/ui/solar-icons"

interface ProjectFormData {
    name: string
    description: string
    target: string
}

interface ProjectCreationFormProps {
    onSearch: (data: ProjectFormData) => void
    onClose: () => void
}

export function ProjectCreationForm({ onSearch, onClose }: Readonly<ProjectCreationFormProps>) {
    const [subStep, setSubStep] = useState<"info" | "target">("info")
    const [formData, setFormData] = useState<ProjectFormData>({
        name: "",
        description: "",
        target: "",
    })

    const isInfoValid = formData.name.trim().length > 0
    const isTargetValid = formData.target.trim().length > 1

    const fieldBaseStyle = {
        background: "var(--surface-2)",
        border: "1px solid var(--border-soft)",
        color: "var(--text-1)",
        boxShadow: "none",
        backdropFilter: "blur(8px)",
    } as const

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            {/* Backdrop */}
            <button
                type="button"
                aria-label="Close modal"
                className="absolute inset-0 animate-in fade-in duration-300"
                style={{
                    background: "rgba(5, 5, 8, 0.58)",
                    backdropFilter: "blur(6px)",
                    border: "none",
                    cursor: "pointer",
                }}
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="glass-card no-hover-lift relative w-full max-w-xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden rounded-[20px] shadow-2xl p-8"
                style={{
                    border: "1px solid var(--border)",
                    background: "var(--surface-1)",
                    boxShadow: "0 26px 80px rgba(0,0,0,0.5), 0 0 0 1px var(--border-soft)",
                }}
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full transition-colors"
                    style={{
                        color: "var(--text-3)",
                        background: "color-mix(in srgb, var(--surface-3) 80%, transparent)",
                        border: "1px solid var(--border-soft)",
                    }}
                >
                    <CloseSquare size={20} weight="Broken" />
                </button>

                <div className="relative text-center mb-8">
                    <h2 className="font-sans text-4xl mb-2" style={{ color: "var(--text-1)", fontWeight: 700, letterSpacing: "-0.02em" }}>
                        {subStep === "info" ? "New Project Details" : "Define Research Target"}
                    </h2>
                    <p className="font-sans text-base" style={{ color: "var(--text-2)" }}>
                        {subStep === "info"
                            ? "Initialize your research context."
                            : "Specify the persona for this intelligence analysis."}
                    </p>
                </div>

                <div className="relative min-h-[340px] flex flex-col justify-between">
                    {subStep === "info" ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col gap-2">
                                <label htmlFor="project-name" className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                                    Project Name <span style={{ color: "var(--gold)" }}>*</span>
                                </label>
                                <input
                                    id="project-name"
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Victorian Tech Innovations"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="font-sans w-full px-4 py-3 rounded-[10px] outline-none transition-all"
                                    style={{
                                        fontSize: 15,
                                        ...fieldBaseStyle,
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "var(--gold)"
                                        e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--gold) 22%, transparent)"
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 22%, var(--border) 78%)"
                                        e.currentTarget.style.boxShadow = "inset 0 1px 0 color-mix(in srgb, var(--ivory) 24%, transparent)"
                                    }}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="project-context" className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                                    Context (Optional)
                                </label>
                                <textarea
                                    id="project-context"
                                    placeholder="Provide brief research goals..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="font-sans w-full px-4 py-3 rounded-[10px] outline-none transition-all resize-none"
                                    style={{
                                        fontSize: 15,
                                        minHeight: 138,
                                        ...fieldBaseStyle,
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "var(--gold)"
                                        e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--gold) 22%, transparent)"
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 22%, var(--border) 78%)"
                                        e.currentTarget.style.boxShadow = "inset 0 1px 0 color-mix(in srgb, var(--ivory) 24%, transparent)"
                                    }}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    disabled={!isInfoValid}
                                    onClick={() => setSubStep("target")}
                                    className="btn-intelligence-primary flex items-center gap-2"
                                    style={{ height: 36, padding: "0 16px", fontSize: 13 }}
                                >
                                    Configure Target
                                    <AltArrowRight size={18} weight="Broken" />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <button
                                onClick={() => setSubStep("info")}
                                className="btn btn-ghost flex items-center gap-1.5 text-xs font-medium mb-2 py-1 px-0"
                            >
                                <SquareAltArrowLeft size={14} weight="Broken" />
                                Back to Information
                            </button>

                            <div className="flex flex-col gap-2">
                                <label htmlFor="target-name" className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                                    Target Name <span style={{ color: "var(--gold)" }}>*</span>
                                </label>
                                <input
                                    id="target-name"
                                    type="text"
                                    autoFocus
                                    placeholder="Enter persona name..."
                                    value={formData.target}
                                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    className="font-sans w-full px-4 py-5 rounded-[10px] outline-none transition-all text-lg"
                                    style={{
                                        ...fieldBaseStyle,
                                    }}
                                    onFocus={(e) => {
                                        e.currentTarget.style.borderColor = "var(--gold)"
                                        e.currentTarget.style.boxShadow = "0 0 0 3px color-mix(in srgb, var(--gold) 22%, transparent)"
                                    }}
                                    onBlur={(e) => {
                                        e.currentTarget.style.borderColor = "color-mix(in srgb, var(--gold) 22%, var(--border) 78%)"
                                        e.currentTarget.style.boxShadow = "inset 0 1px 0 color-mix(in srgb, var(--ivory) 24%, transparent)"
                                    }}
                                />
                                <p className="font-sans text-[11px] mt-2 italic" style={{ color: "var(--text-3)", lineHeight: 1.5 }}>
                                    Our agents will perform high-fidelity bio-reconstruction based on this name.
                                </p>
                            </div>

                            <div className="flex justify-end pt-8">
                                <button
                                    disabled={!isTargetValid}
                                    onClick={() => onSearch(formData)}
                                    className="btn-intelligence-primary flex items-center gap-2"
                                    style={{ height: 36, padding: "0 16px", fontSize: 13 }}
                                >
                                    <Magnifier size={18} weight="Broken" />
                                    Initiate Research
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mt-8">
                    <div
                        className="w-10 h-1.5 rounded-full transition-all duration-300"
                        style={{
                            background: subStep === "info" ? "var(--gold)" : "var(--surface-3)",
                            opacity: subStep === "info" ? 1 : 0.65,
                        }}
                    />
                    <div
                        className="w-10 h-1.5 rounded-full transition-all duration-300"
                        style={{
                            background: subStep === "target" ? "var(--gold)" : "var(--surface-3)",
                            opacity: subStep === "target" ? 1 : 0.65,
                        }}
                    />
                </div>
            </div>
        </div>
    )
}
