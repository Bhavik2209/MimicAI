"use client"

import { FolderWithFiles, CalendarMark, UserRounded } from "@/components/ui/solar-icons"

interface ProjectContextSidebarProps {
    expanded: boolean
    projectName: string
    createdDate: string
    targetName: string
}

export function ProjectContextSidebar({ expanded, projectName, createdDate, targetName }: ProjectContextSidebarProps) {
    if (!expanded) {
        return (
            <div className="flex flex-col items-center py-6 border-b" style={{ borderColor: "var(--border)" }}>
                <div
                    className="flex items-center justify-center rounded-[10px]"
                    style={{ width: 32, height: 32, background: "rgba(12,14,22,0.6)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--gold)" }}
                >
                    {/* FolderWithFiles = research project that contains documents/data */}
                    <FolderWithFiles size={16} weight="BoldDuotone" color="var(--gold)" />
                </div>
            </div>
        )
    }

    return (
        <div className="py-6 px-5 border-b" style={{ borderColor: "var(--border)" }}>
            <div className="flex items-center gap-2 mb-4">
                <div
                    className="flex items-center justify-center rounded-[10px]"
                    style={{ width: 20, height: 20, background: "rgba(12,14,22,0.6)", border: "1px solid rgba(255,255,255,0.07)", color: "var(--gold)" }}
                >
                    <FolderWithFiles size={12} weight="Broken" color="var(--gold)" />
                </div>
                <span className="font-mono text-[10px] uppercase tracking-widest" style={{ color: "var(--text-3)" }}>
                    Project Context
                </span>
            </div>

            <div className="space-y-4">
                <div className="flex flex-col gap-1">
                    <h4 className="font-serif italic text-base leading-tight" style={{ color: "var(--ivory)", fontWeight: 500 }}>
                        {projectName}
                    </h4>
                </div>

                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-[11px]">
                        {/* CalendarMark = a date that's been pinned/marked — creation date */}
                        <CalendarMark size={12} weight="Linear" color="var(--text-3)" />
                        <span style={{ color: "var(--text-2)" }}>{createdDate}</span>
                    </div>
                    <div className="flex items-center gap-2 text-[11px]">
                        {/* UserRounded = the entity/person being researched */}
                        <UserRounded size={12} weight="Linear" color="var(--text-3)" />
                        <span style={{ color: "var(--text-2)" }}>{targetName}</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
