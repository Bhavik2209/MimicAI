"use client"

import { useState } from "react"
import { ArrowRight, Search, ChevronLeft, X } from "lucide-react"

interface ProjectFormData {
    name: string
    description: string
    target: string
}

interface ProjectCreationFormProps {
    onSearch: (data: ProjectFormData) => void
    onClose: () => void
}

export function ProjectCreationForm({ onSearch, onClose }: ProjectCreationFormProps) {
    const [subStep, setSubStep] = useState<"info" | "target">("info")
    const [formData, setFormData] = useState<ProjectFormData>({
        name: "",
        description: "",
        target: "",
    })

    const isInfoValid = formData.name.trim().length > 0
    const isTargetValid = formData.target.trim().length > 1

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center px-6">
            {/* Backdrop */}
            <div
                className="absolute inset-0 bg-black/60 backdrop-blur-sm animate-in fade-in duration-300"
                onClick={onClose}
            />

            {/* Modal Container */}
            <div
                className="glass-card no-hover-lift relative w-full max-w-xl animate-in fade-in zoom-in-95 duration-300 overflow-hidden rounded-[20px] shadow-2xl p-8"
            >
                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 rounded-full hover:bg-surface-2 transition-colors"
                    style={{ color: "var(--text-3)" }}
                >
                    <X size={20} />
                </button>

                <div className="text-center mb-8">
                    <h2 className="font-serif italic text-3xl mb-2" style={{ color: "var(--ivory)", fontWeight: 600 }}>
                        {subStep === "info" ? "New Project Details" : "Define Research Target"}
                    </h2>
                    <p className="font-sans text-sm" style={{ color: "var(--text-3)" }}>
                        {subStep === "info"
                            ? "Initialize your research context."
                            : "Specify the persona for this intelligence analysis."}
                    </p>
                </div>

                <div className="relative min-h-[340px] flex flex-col justify-between">
                    {subStep === "info" ? (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="flex flex-col gap-2">
                                <label className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                                    Project Name <span style={{ color: "var(--gold)" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="e.g. Victorian Tech Innovations"
                                    value={formData.name}
                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                    className="font-sans w-full px-4 py-3 rounded-[10px] outline-none transition-all"
                                    style={{
                                        background: "var(--control-bg)",
                                        border: "1px solid var(--control-border)",
                                        color: "var(--text-1)",
                                        fontSize: 15,
                                        backdropFilter: "blur(12px)",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                                />
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                                    Context (Optional)
                                </label>
                                <textarea
                                    placeholder="Provide brief research goals..."
                                    rows={4}
                                    value={formData.description}
                                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                                    className="font-sans w-full px-4 py-3 rounded-[10px] outline-none transition-all resize-none"
                                    style={{
                                        background: "var(--control-bg)",
                                        border: "1px solid var(--control-border)",
                                        color: "var(--text-1)",
                                        fontSize: 15,
                                        backdropFilter: "blur(12px)",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                                />
                            </div>

                            <div className="flex justify-end pt-4">
                                <button
                                    disabled={!isInfoValid}
                                    onClick={() => setSubStep("target")}
                                    className="btn btn-primary flex items-center gap-2 px-8 py-3.5"
                                >
                                    Configure Target
                                    <ArrowRight size={18} />
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                            <button
                                onClick={() => setSubStep("info")}
                                className="btn btn-ghost flex items-center gap-1.5 text-xs font-medium mb-2 py-1 px-0"
                            >
                                <ChevronLeft size={14} />
                                Back to Information
                            </button>

                            <div className="flex flex-col gap-2">
                                <label className="font-sans text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--text-2)" }}>
                                    Target Name <span style={{ color: "var(--gold)" }}>*</span>
                                </label>
                                <input
                                    type="text"
                                    autoFocus
                                    placeholder="Enter persona name..."
                                    value={formData.target}
                                    onChange={(e) => setFormData({ ...formData, target: e.target.value })}
                                    className="font-sans w-full px-4 py-5 rounded-[10px] outline-none transition-all text-lg"
                                    style={{
                                        background: "var(--control-bg)",
                                        border: "1px solid var(--control-border)",
                                        color: "var(--text-1)",
                                        backdropFilter: "blur(12px)",
                                    }}
                                    onFocus={(e) => (e.currentTarget.style.borderColor = "var(--gold)")}
                                    onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
                                />
                                <p className="font-sans text-[11px] mt-2 italic" style={{ color: "var(--text-3)", lineHeight: 1.5 }}>
                                    Our agents will perform high-fidelity bio-reconstruction based on this name.
                                </p>
                            </div>

                            <div className="flex justify-end pt-8">
                                <button
                                    disabled={!isTargetValid}
                                    onClick={() => onSearch(formData)}
                                    className="btn btn-primary flex items-center gap-2 px-10 py-4"
                                >
                                    <Search size={18} />
                                    Initiate Research
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Step Indicator */}
                <div className="flex justify-center gap-2 mt-8">
                    <div
                        className="w-8 h-1 rounded-full transition-all duration-300"
                        style={{ background: subStep === "info" ? "var(--gold)" : "var(--surface-3)" }}
                    />
                    <div
                        className="w-8 h-1 rounded-full transition-all duration-300"
                        style={{ background: subStep === "target" ? "var(--gold)" : "var(--surface-3)" }}
                    />
                </div>
            </div>
        </div>
    )
}
