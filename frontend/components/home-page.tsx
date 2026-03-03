"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  Plus,
  Search,
  ArrowUpDown,
  FolderOpen,
  ChevronDown,
  MoreHorizontal,
  ExternalLink,
} from "lucide-react"

interface HomePageProject {
  id: string
  name: string
  targetName: string
  createdDate: string
  description?: string
  lastUpdated?: string
  status?: "active" | "archived"
  profile?: { name: string; category: string; era: string; initials?: string }
  agentCount?: number
  sourceCount?: number
}

interface HomePageProps {
  projects: HomePageProject[]
  onCreateProject: () => void
  onOpenProject: (projectId: string) => void
}

export function HomePage({ projects, onCreateProject, onOpenProject }: HomePageProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [filter, setFilter] = useState<"all" | "active" | "archived">("all")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest")
  const [isSortOpen, setIsSortOpen] = useState(false)

  const sortOptions = [
    { label: "Newest First", value: "newest" as const },
    { label: "Oldest First", value: "oldest" as const },
    { label: "A-Z Name", value: "name" as const },
  ]

  const activeSortLabel = sortOptions.find(o => o.value === sortBy)?.label || "Sort"

  const filteredProjects = useMemo(() => {
    let result = [...projects]

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.targetName.toLowerCase().includes(q)
      )
    }

    // Filter
    if (filter !== "all") {
      result = result.filter(p => p.status === filter)
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      const dateA = new Date(a.createdDate).getTime()
      const dateB = new Date(b.createdDate).getTime()
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })

    return result
  }, [projects, searchQuery, filter, sortBy])

  const isEmpty = projects.length === 0
  const gridRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const grid = gridRef.current
    if (!grid) return
    const cards = grid.querySelectorAll(".project-card.reveal")
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry, i) => {
          if (entry.isIntersecting) {
            const el = entry.target as HTMLElement
            el.style.transitionDelay = `${Array.from(cards).indexOf(el) * 0.08}s`
            el.classList.add("visible")
          }
        })
      },
      { threshold: 0.1 }
    )
    cards.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [filteredProjects])

  return (
    <div className="intelligence-projects-page mx-auto w-full max-w-[1320px] px-6 py-12 min-h-screen">
      {/* 1. PAGE HEADER */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-10">
        <div>
          <h1
            className="font-serif italic"
            style={{
              color: "var(--text-1)",
              fontSize: "clamp(32px, 4vw, 48px)",
              fontWeight: 400,
              letterSpacing: "-0.01em",
            }}
          >
            Intelligence Projects
          </h1>
          <p
            className="font-sans"
            style={{ fontSize: 14, color: "var(--text-2)", marginTop: 6 }}
          >
            Create and manage structured research sessions.
          </p>
          <div
            style={{
              width: 48,
              height: 1,
              background: "linear-gradient(90deg, var(--gold), transparent)",
              marginTop: 16,
              opacity: 0.5,
            }}
          />
        </div>

        <button
          onClick={onCreateProject}
          className="btn-intelligence-primary flex items-center gap-2"
        >
          <Plus size={18} strokeWidth={2.5} />
          New Project
        </button>
      </div>

      {/* 2. CONTROLS */}
      {isEmpty ? null : (
        <div
          className="flex flex-col lg:flex-row lg:items-center gap-4 p-5 mb-10"
          style={{
            background: "var(--control-bg)",
            backdropFilter: "blur(12px)",
            WebkitBackdropFilter: "blur(12px)",
            border: "1px solid var(--control-border)",
            borderRadius: 20,
          }}
        >
          <div className="flex flex-1 items-center gap-3 px-4 py-2.5">
            <Search size={18} style={{ color: "var(--text-3)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search projects by name or target..."
              className="intelligence-search-input w-full bg-transparent outline-none pl-0"
              style={{ padding: "10px 0" }}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-1">
              {(["all", "active", "archived"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setFilter(t)}
                  className={`intelligence-filter-tab capitalize ${filter === t ? "active" : ""}`}
                >
                  {t}
                </button>
              ))}
            </div>

            <div className="relative">
              <button
                className="flex items-center gap-2 font-mono text-xs font-medium px-4 py-2 rounded-[10px] transition-colors"
                style={{
                  color: "var(--text-2)",
                  background: "var(--control-bg)",
                  border: "1px solid var(--control-border)",
                  cursor: "pointer",
                }}
                onClick={() => setIsSortOpen(!isSortOpen)}
              >
                <ArrowUpDown size={14} style={{ color: "var(--text-3)" }} />
                {activeSortLabel}
                <ChevronDown size={12} className={`transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} style={{ color: "var(--text-3)" }} />
              </button>

              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 py-1.5 z-50 rounded-[14px]"
                    style={{
                      background: "var(--surface-1)",
                      border: "1px solid var(--border-soft)",
                      minWidth: 160,
                    }}
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        onClick={() => {
                          setSortBy(opt.value)
                          setIsSortOpen(false)
                        }}
                        className="w-full text-left px-4 py-2.5 font-sans text-xs transition-colors rounded-[10px] mx-1"
                        style={{
                          color: sortBy === opt.value ? "var(--gold)" : "var(--text-2)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--control-bg)"
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "none"
                        }}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 3. PROJECT LIST / EMPTY STATE */}
      <div>
        {isEmpty ? (
          <div className="intelligence-empty-state flex flex-col items-center justify-center text-center max-w-md mx-auto">
            <span
              className="font-mono mb-6"
              style={{
                fontSize: 48,
                color: "var(--text-3)",
                opacity: 0.6,
              }}
            >
              ∅
            </span>
            <h2
              className="font-serif text-2xl mb-2 italic"
              style={{ color: "var(--text-2)", fontWeight: 400 }}
            >
              No intelligence profiles yet
            </h2>
            <p
              className="font-sans mb-8"
              style={{ fontSize: 14, color: "var(--text-3)", lineHeight: 1.5 }}
            >
              Start by researching a person.
            </p>
            <button onClick={onCreateProject} className="btn-intelligence-primary flex items-center gap-2">
              <Plus size={18} strokeWidth={2.5} />
              New Project
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-16" style={{ borderBottom: "1px solid var(--border-soft)" }}>
            <p className="font-sans text-sm" style={{ color: "var(--text-3)" }}>
              No projects found matching your search.
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5"
          >
            {filteredProjects.map((project) => {
              const isActive = project.status !== "archived"
              const personaLine =
                project.description ||
                (project.profile
                  ? `${project.profile.category} · ${project.profile.era}`
                  : null)
              const agentsLabel =
                project.agentCount != null || project.sourceCount != null
                  ? `${project.agentCount ?? "—"} agents · ${project.sourceCount ?? "—"} sources`
                  : null
              return (
                <article
                  key={project.id}
                  onClick={() => onOpenProject(project.id)}
                  className="project-card reveal flex flex-col cursor-pointer"
                  style={{ padding: "24px 20px" }}
                >
                  <div className="relative flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <h3
                        className="font-serif text-xl font-light italic leading-tight"
                        style={{
                          color: "var(--text-1)",
                          letterSpacing: "-0.02em",
                        }}
                      >
                        {project.targetName}
                      </h3>
                      <p
                        className="font-sans text-sm mt-0.5"
                        style={{ color: "var(--text-3)" }}
                      >
                        {project.name}
                      </p>
                    </div>
                    <span
                      className="font-mono flex items-center gap-1.5 flex-shrink-0"
                      style={{
                        fontSize: 10,
                        letterSpacing: "0.1em",
                        padding: "3px 10px",
                        borderRadius: 100,
                        background: isActive
                          ? "rgba(56,189,248,0.1)"
                          : "rgba(255,255,255,0.06)",
                        border: `1px solid ${isActive ? "rgba(56,189,248,0.2)" : "rgba(255,255,255,0.08)"}`,
                        color: isActive ? "var(--teal)" : "var(--text-3)",
                      }}
                    >
                      {isActive ? (
                        <>
                          <span
                            style={{
                              width: 4,
                              height: 4,
                              borderRadius: "50%",
                              background: "var(--teal)",
                              boxShadow: "0 0 6px var(--teal)",
                            }}
                          />
                          Active
                        </>
                      ) : (
                        "Archived"
                      )}
                    </span>
                  </div>

                  {personaLine && (
                    <p
                      className="font-sans mt-2"
                      style={{
                        fontSize: 12,
                        lineHeight: 1.5,
                        color: "var(--text-3)",
                      }}
                    >
                      {personaLine}
                    </p>
                  )}

                  <div
                    className="mt-4 pt-4"
                    style={{
                      borderTop: "1px solid rgba(255,255,255,0.05)",
                      margin: "16px 0",
                    }}
                  />

                  {agentsLabel && (
                    <p
                      className="font-mono mb-2"
                      style={{
                        fontSize: 10,
                        color: "var(--gold)",
                        opacity: 0.7,
                      }}
                    >
                      {agentsLabel}
                    </p>
                  )}

                  <div className="flex items-center justify-between">
                    <span
                      className="font-mono"
                      style={{
                        fontSize: 10,
                        color: "var(--text-3)",
                        letterSpacing: "0.08em",
                      }}
                    >
                      {project.createdDate}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        onOpenProject(project.id)
                      }}
                      className="p-1 rounded transition-colors"
                      style={{ color: "var(--text-3)" }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--text-1)"
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color = "var(--text-3)"
                      }}
                      aria-label="More options"
                    >
                      <MoreHorizontal size={16} />
                    </button>
                  </div>
                </article>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
