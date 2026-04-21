"use client"

import { CheckCircle, Export, Refresh, ShareCircle, SquareAltArrowLeft } from "@/components/ui/solar-icons"

interface ProfileHeaderProps {
  projectContext?: {
    name: string
    createdDate: string
    targetName: string
  } | null
  profile: {
    name: string
    category: string
    era: string
    tags: string[]
    subtitle: string
    eyebrow: string
    imageUrl?: string
  }
  activeTab: string
  onTabChange: (tab: string) => void
  onBackToProjects?: () => void
  onExportClick?: () => void
  exportState?: "idle" | "loading" | "success"
}

export function ProfileHeader({
  profile,
  activeTab,
  onTabChange,
  projectContext,
  onBackToProjects,
  onExportClick,
  exportState = "idle",
}: Readonly<ProfileHeaderProps>) {
  const displayName = projectContext ? projectContext.targetName : profile.name
  const exportLabel = exportState === "loading" ? "Exporting..." : exportState === "success" ? "Exported" : "Export"
  const ExportIcon = exportState === "loading" ? Refresh : exportState === "success" ? CheckCircle : Export

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
        padding: "14px 24px 16px",
      }}
    >
      <div className="flex items-center justify-between gap-6 flex-wrap">
        {/* Left — Back + Avatar + Title block */}
        <div className="flex items-center gap-4 min-w-0 flex-1">
          {onBackToProjects && (
            <button
              onClick={onBackToProjects}
              className="flex items-center justify-center rounded-lg shrink-0"
              style={{
                width: 32,
                height: 32,
                background: "var(--bg)",
                border: "1px solid var(--border-soft)",
                color: "var(--text-3)",
                cursor: "pointer",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.color = "var(--gold)"
                e.currentTarget.style.background = "var(--gold-dim)"
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.color = "var(--text-3)"
                e.currentTarget.style.background = "var(--bg)"
              }}
              title="Return to Projects"
            >
              <SquareAltArrowLeft size={16} weight="Linear" color="currentColor" />
            </button>
          )}

          <div className="min-w-0 flex-1">
            <span
              className="font-mono"
              style={{
                fontSize: 10,
                color: "var(--gold)",
                textTransform: "uppercase",
                letterSpacing: "0.1em",
                display: "block",
                marginBottom: 2,
              }}
            >
              {profile.eyebrow}
            </span>
            <h1
              style={{
                fontFamily: "'Tchig mono', monospace",
                fontSize: 24,
                fontWeight: 600,
                color: "var(--text-1)",
                letterSpacing: "-0.02em",
                lineHeight: 1.2,
              }}
            >
              {displayName}
            </h1>
            {projectContext ? (
              <p
                className="font-sans mt-1"
                style={{ fontSize: 13, color: "var(--text-3)" }}
              >
                {projectContext.name}
                <span className="font-mono ml-2" style={{ fontSize: 11, color: "var(--text-3)" }}>
                  · {projectContext.createdDate}
                </span>
              </p>
            ) : (
              <p
                className="font-sans mt-0.5"
                style={{ fontSize: 12, color: "var(--text-3)" }}
              >
                {profile.subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Right — Actions */}
        <div className="flex items-center gap-2 shrink-0">
          <button className="btn-dashboard-action" type="button">
            <ShareCircle size={14} weight="Linear" /> Share
          </button>
          <button
            className="btn-dashboard-action export-action-btn"
            onClick={onExportClick}
            type="button"
            disabled={exportState === "loading"}
            style={{
              opacity: exportState === "loading" ? 0.82 : 1,
              cursor: exportState === "loading" ? "wait" : "pointer",
            }}
          >
            <ExportIcon
              size={14}
              weight={exportState === "success" ? "Bold" : "Linear"}
              className={exportState === "loading" ? "animate-spin" : undefined}
            />{" "}
            {exportLabel}
          </button>
        </div>
      </div>
    </div>
  )
}
