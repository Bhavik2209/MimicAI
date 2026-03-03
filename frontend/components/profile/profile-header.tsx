"use client"

import { RefreshCw, Layers, Share2, ExternalLink, ArrowLeft } from "lucide-react"

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
  }
  activeTab: string
  onTabChange: (tab: string) => void
  onBackToProjects?: () => void
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase()
}

export function ProfileHeader({ profile, activeTab, onTabChange, projectContext, onBackToProjects }: ProfileHeaderProps) {
  const displayName = projectContext ? projectContext.targetName : profile.name
  const initials = getInitials(displayName)

  return (
    <div
      style={{
        position: "sticky",
        top: 0,
        zIndex: 20,
        background: "var(--panel-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--panel-border)",
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
                background: "var(--surface-2)",
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
                e.currentTarget.style.background = "var(--surface-2)"
              }}
              title="Return to Projects"
            >
              <ArrowLeft size={16} />
            </button>
          )}

          <div
            className="flex items-center justify-center rounded-full font-serif shrink-0"
            style={{
              width: 44,
              height: 44,
              background: "var(--gold-dim)",
              color: "var(--gold)",
              fontSize: 16,
              fontStyle: "italic",
              fontWeight: 600,
            }}
          >
            {initials}
          </div>

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
              className="font-serif"
              style={{
                fontSize: 24,
                fontWeight: 600,
                fontStyle: "italic",
                color: "var(--ivory)",
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
          {[
            { icon: RefreshCw, label: "Regenerate" },
            { icon: Layers, label: "Compare" },
            { icon: Share2, label: "Share" },
            { icon: ExternalLink, label: "Export" },
          ].map(({ icon: Icon, label }) => (
            <button key={label} className="btn btn-ghost flex items-center gap-2 py-2 px-4 text-sm font-medium">
              <Icon size={14} /> {label}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
