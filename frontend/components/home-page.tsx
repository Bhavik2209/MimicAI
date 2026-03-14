"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  Plus,
  Search,
  ArrowUpDown,
  FolderOpen,
  ChevronDown,
  MoreHorizontal,
  Pencil,
  Archive,
  Trash2,
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

/* ─────────────────────────────────────────────────
   PROJECT CARD
───────────────────────────────────────────────── */
function ProjectCard({
  project,
  onClick,
}: {
  project: HomePageProject
  onClick: () => void
}) {
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Derive initials from targetName
  const initials = project.profile?.initials ||
    project.targetName
      .split(" ")
      .slice(0, 2)
      .map((w) => w[0]?.toUpperCase() ?? "")
      .join("")

  const description = project.description

  const formattedDate = (() => {
    try {
      return new Date(project.createdDate).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return project.createdDate
    }
  })()

  // Close menu on outside click
  useEffect(() => {
    if (!menuOpen) return
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener("mousedown", handler)
    return () => document.removeEventListener("mousedown", handler)
  }, [menuOpen])

  return (
    <article
      className="project-card reveal cursor-pointer"
      onClick={onClick}
      style={{
        background: "#FFFFFF",
        padding: 16,
        minHeight: 120,
        display: "flex",
        flexDirection: "column",
        fontFamily: "var(--font-ui), sans-serif",
        position: "relative",
      }}
    >
      <div style={{ display: "flex", gap: 16, flex: 1 }}>
        {/* LEFT: Image area */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: 8,
            flexShrink: 0,
            background: "var(--surface-3)",
            border: "1px solid var(--border-soft)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 20,
            fontWeight: 700,
            color: "var(--text-1)",
            fontFamily: "var(--font-primary), monospace",
          }}
        >
          {initials}
        </div>

        {/* RIGHT: Entity info */}
        <div style={{ flex: 1, minWidth: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {/* Entity name */}
          <div
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-1)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
              lineHeight: 1.2,
            }}
          >
            {project.targetName}
          </div>

          {/* Project name */}
          <div
            className="font-mono text-[12px]"
            style={{
              color: "var(--text-3)",
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            }}
          >
            Project: {project.name}
          </div>

          {/* Description */}
          {description && (
            <p
              className="font-ui text-[13px]"
              style={{
                margin: 0,
                color: "var(--text-3)",
                lineHeight: 1.4,
                display: "-webkit-box",
                WebkitLineClamp: 2,
                WebkitBoxOrient: "vertical",
                overflow: "hidden",
                marginTop: 4,
              }}
            >
              {description}
            </p>
          )}
        </div>
      </div>

      {/* BOTTOM: Date and options */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          paddingTop: 12,
          marginTop: 12,
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <span
          className="font-mono text-[11px]"
          style={{ color: "var(--text-3)" }}
        >
          {formattedDate}
        </span>

        {/* Menu icon */}
        <div style={{ position: "relative" }} ref={menuRef} onClick={(e) => e.stopPropagation()}>
          <button
            type="button"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{
              background: "none",
              border: "none",
              color: "var(--text-3)",
              cursor: "pointer",
              padding: 4,
              display: "flex",
              alignItems: "center",
            }}
          >
            <MoreHorizontal size={14} />
          </button>

          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: "calc(100% + 4px)",
                background: "var(--bg)",
                border: "1.5px solid rgba(25,23,46,0.14)",
                borderRadius: 8,
                padding: 4,
                minWidth: 120,
                boxShadow: "0 4px 20px rgba(0,0,0,0.10)",
                zIndex: 50,
              }}
            >
              {[
                { icon: Pencil, label: "Edit", color: "var(--text-2)" },
                { icon: Archive, label: "Archive", color: "var(--text-2)" },
                { icon: Trash2, label: "Delete", color: "#F87171" },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  type="button"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "6px 8px",
                    borderRadius: 6,
                    border: "none",
                    background: "transparent",
                    color,
                    fontSize: 12,
                    cursor: "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-ui), sans-serif",
                  }}
                  onClick={() => setMenuOpen(false)}
                >
                  <Icon size={12} />
                  {label}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>
    </article>
  )
}

/* ─────────────────────────────────────────────────
   HOME PAGE
───────────────────────────────────────────────── */
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

  const activeSortLabel = sortOptions.find((o) => o.value === sortBy)?.label || "Sort"

  const filteredProjects = useMemo(() => {
    let result = [...projects]
    if (searchQuery) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) || p.targetName.toLowerCase().includes(q)
      )
    }
    if (filter !== "all") {
      result = result.filter((p) => p.status === filter)
    }
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
        entries.forEach((entry) => {
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
    <div className="intelligence-projects-page w-full h-full flex flex-col" style={{ paddingLeft: 32, paddingRight: 32, paddingTop: 24, overflow: "hidden" }}>
      {/* 1. COMPACT PAGE HEADER */}
      <div
        className="flex items-center justify-between gap-6 pb-4 mb-4 border-b"
        style={{ height: 64, borderColor: "var(--border-soft)" }}
      >
        <div>
          <h1
            className="font-mono"
            style={{
              color: "var(--text-1)",
              fontSize: 11,
              fontWeight: 700,
              textTransform: "uppercase",
              letterSpacing: "0.15em",
              margin: 0
            }}
          >
            Intelligence Projects
          </h1>
          <p className="font-ui" style={{ fontSize: 12, color: "var(--text-3)", margin: 0 }}>
            Manage and research verified intelligence profiles.
          </p>
        </div>

        <button
          onClick={onCreateProject}
          className="btn-intelligence-primary flex items-center gap-2"
          style={{ height: 36, padding: "0 16px", fontSize: 13 }}
        >
          <Plus size={16} />
          New Project
        </button>
      </div>

      {/* 2. SLIM CONTROLS */}
      {!isEmpty && (
        <div
          className="flex items-center gap-6 mb-5"
          style={{ height: 36 }}
        >
          {/* Search Input */}
          <div
            className="flex items-center gap-2 px-3 h-full"
            style={{ background: "rgba(0,0,0,0.04)", border: "1.5px solid transparent", borderRadius: 6, width: 340, transition: "border-color 0.2s" }}
            onFocus={(e) => (e.currentTarget.style.borderColor = "rgba(25,23,46,0.20)")}
            onBlur={(e) => (e.currentTarget.style.borderColor = "transparent")}
          >
            <Search size={14} style={{ color: "var(--text-3)", flexShrink: 0 }} />
            <input
              type="text"
              placeholder="Search..."
              className="bg-transparent outline-none font-ui text-sm w-full"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          {/* Filter Tabs */}
          <div className="flex flex-1 justify-center items-center gap-4 h-full">
            {(["all", "active", "archived"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setFilter(t)}
                className={`font-ui text-xs font-medium capitalize h-full px-2 transition-colors relative`}
                style={{
                  color: filter === t ? "var(--text-1)" : "var(--text-3)",
                  background: "none",
                  border: "none",
                  cursor: "pointer"
                }}
              >
                {t}
                {filter === t && (
                  <span
                    className="absolute bottom-[-10px] left-0 right-0 h-[2px] bg-gold rounded-full"
                    style={{ background: "var(--gold)" }}
                  />
                )}
              </button>
            ))}
          </div>

          {/* Sort Dropdown */}
          <div className="relative h-full">
            <button
              className="flex items-center gap-2 font-mono text-[11px] h-full px-3"
              style={{
                color: "var(--text-2)",
                background: "rgba(0,0,0,0.04)",
                border: "1.5px solid transparent",
                borderRadius: 6,
                cursor: "pointer",
              }}
              onClick={() => setIsSortOpen(!isSortOpen)}
            >
              <ArrowUpDown size={12} style={{ color: "var(--text-3)" }} />
              {activeSortLabel}
              <ChevronDown
                size={10}
                className={`transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`}
              />
            </button>

            {isSortOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                <div
                  className="absolute right-0 mt-2 py-2 z-50 shadow-lg"
                  style={{
                    background: "var(--bg)",
                    border: "1.5px solid rgba(25,23,46,0.14)",
                    borderRadius: 8,
                    minWidth: 140,
                    backdropFilter: "blur(12px)",
                  }}
                >
                  {sortOptions.map((opt) => (
                    <button
                      key={opt.value}
                      onClick={() => {
                        setSortBy(opt.value)
                        setIsSortOpen(false)
                      }}
                      className="w-full text-left px-4 py-2 font-ui text-xs transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                      style={{
                        color: sortBy === opt.value ? "var(--gold)" : "var(--text-2)",
                        background: "none",
                        border: "none",
                        cursor: "pointer",
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
      )}

      {/* 3. PROJECT GRID */}
      <div className="flex-1 overflow-y-auto pb-10 pr-2 -mr-2" style={{ marginTop: 20, paddingTop: 8 }}>
        {isEmpty ? (
          <div className="flex flex-col items-center justify-center text-center py-20 max-w-sm mx-auto">
            <span
              className="font-mono mb-4"
              style={{ fontSize: 40, color: "var(--text-3)", opacity: 0.5 }}
            >
              / EMPTY
            </span>
            <h2
              className="font-ui text-xl mb-2 font-semibold"
              style={{ color: "var(--text-1)" }}
            >
              No Projects Found
            </h2>
            <p
              className="font-ui mb-6"
              style={{ fontSize: 13, color: "var(--text-3)", lineHeight: 1.5 }}
            >
              Get started by creating your first intelligence project.
            </p>
            <button
              onClick={onCreateProject}
              className="btn-intelligence-primary flex items-center gap-2"
            >
              <Plus size={16} />
              New Project
            </button>
          </div>
        ) : filteredProjects.length === 0 ? (
          <div className="py-12 border-t" style={{ borderColor: "var(--border-soft)" }}>
            <p className="font-ui text-sm" style={{ color: "var(--text-3)" }}>
              No results for "{searchQuery}".
            </p>
          </div>
        ) : (
          <div
            ref={gridRef}
            className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-[14px]"
          >
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                onClick={() => onOpenProject(project.id)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
