"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import {
  AddCircle,
  Magnifier,
  SortVertical,
  AltArrowDown,
  MenuDots,
  PenNewSquare,
  TrashBinTrash,
} from "@solar-icons/react"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog"

interface HomePageProject {
  id: string
  name: string
  targetName: string
  createdDate: string
  imageUrl?: string
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
  onEditProject: (projectId: string, values: { title: string; description?: string }) => void | Promise<void>
  onDeleteProject: (projectId: string) => void | Promise<void>
  busyProjectId?: string | null
}

/* ─────────────────────────────────────────────────
   PROJECT CARD
───────────────────────────────────────────────── */
function ProjectCard({
  project,
  onClick,
  onEdit,
  onDelete,
  busy,
}: {
  project: HomePageProject
  onClick: () => void
  onEdit: () => void | Promise<void>
  onDelete: () => void | Promise<void>
  busy?: boolean
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

  const formattedUpdatedDate = (() => {
    if (!project.lastUpdated) return ""
    try {
      return new Date(project.lastUpdated).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
      })
    } catch {
      return project.lastUpdated
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
        background: "var(--card-bg)",
        padding: 16,
        border: "1px solid var(--border)",
        borderRadius: 8,
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
            overflow: "hidden",
          }}
        >
          {project.imageUrl ? (
            <img
              src={project.imageUrl}
              alt={project.targetName}
              style={{ width: "100%", height: "100%", objectFit: "cover" }}
            />
          ) : (
            initials
          )}
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
        <div className="flex flex-col" style={{ gap: 2 }}>
          <span
            className="font-mono text-[11px]"
            style={{ color: "var(--text-3)" }}
          >
            Created: {formattedDate}
          </span>
          {formattedUpdatedDate ? (
            <span
              className="font-mono text-[11px]"
              style={{ color: "var(--text-3)" }}
            >
              Updated: {formattedUpdatedDate}
            </span>
          ) : null}
        </div>

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
            <MenuDots size={14} weight="Broken" />
          </button>
          {menuOpen && (
            <div
              style={{
                position: "absolute",
                right: 0,
                bottom: "calc(100% + 8px)",
                background: "var(--surface-2)",
                border: "1px solid color-mix(in srgb, var(--border) 90%, transparent)",
                borderRadius: 10,
                padding: "8px 0",
                minWidth: 156,
                backdropFilter: "blur(12px)",
                boxShadow: "0 12px 22px rgba(0, 0, 0, 0.22)",
                zIndex: 50,
              }}
            >
              {[
                { icon: PenNewSquare, label: "Edit", color: "var(--text-2)" },
                { icon: TrashBinTrash, label: "Delete", color: "#F87171" },
              ].map(({ icon: Icon, label, color }) => (
                <button
                  key={label}
                  type="button"
                  style={{
                    width: "100%",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    padding: "8px 14px",
                    borderRadius: 0,
                    border: "none",
                    background: "none",
                    color,
                    fontSize: 12,
                    cursor: busy ? "wait" : "pointer",
                    textAlign: "left",
                    fontFamily: "var(--font-ui), sans-serif",
                  }}
                  disabled={busy}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--surface-3)"
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "none"
                  }}
                  onClick={async () => {
                    setMenuOpen(false)
                    if (label === "Edit") {
                      await onEdit()
                    } else {
                      await onDelete()
                    }
                  }}
                >
                  <Icon size={12} weight="Broken" />
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
export function HomePage({
  projects,
  onCreateProject,
  onOpenProject,
  onEditProject,
  onDeleteProject,
  busyProjectId,
}: Readonly<HomePageProps>) {
  const [searchQuery, setSearchQuery] = useState("")
  const [sortBy, setSortBy] = useState<"newest" | "oldest" | "name">("newest")
  const [isSortOpen, setIsSortOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<HomePageProject | null>(null)
  const [projectPendingDelete, setProjectPendingDelete] = useState<HomePageProject | null>(null)
  const [editTitle, setEditTitle] = useState("")
  const [editDescription, setEditDescription] = useState("")

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
    result.sort((a, b) => {
      if (sortBy === "name") return a.name.localeCompare(b.name)
      const dateA = new Date(a.createdDate).getTime()
      const dateB = new Date(b.createdDate).getTime()
      return sortBy === "newest" ? dateB - dateA : dateA - dateB
    })
    return result
  }, [projects, searchQuery, sortBy])

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
            el.classList.add("visible")
          }
        })
      },
      { threshold: 0.1 }
    )
    cards.forEach((el) => observer.observe(el))
    return () => observer.disconnect()
  }, [filteredProjects])

  const handleEditOpen = (project: HomePageProject) => {
    setEditingProject(project)
    setEditTitle(project.name)
    setEditDescription(project.description || "")
  }

  const handleEditSubmit = async () => {
    if (!editingProject) return
    const title = editTitle.trim()
    if (!title) return

    await onEditProject(editingProject.id, {
      title,
      description: editDescription.trim() || undefined,
    })
    setEditingProject(null)
  }

  const handleDeleteConfirm = async () => {
    if (!projectPendingDelete) return
    await onDeleteProject(projectPendingDelete.id)
    setProjectPendingDelete(null)
  }

  return (
    <>
      <div
        className="intelligence-projects-page w-full h-full flex flex-col"
        style={{
          paddingLeft: 32,
          paddingRight: 32,
          paddingTop: 24,
          overflow: "hidden",
          background: "inherit",
        }}
      >
        {!isEmpty && (
          <div
            className="flex flex-wrap items-center gap-3 pb-4 mb-4 border-b"
            style={{ borderColor: "var(--border-soft)" }}
          >
            <div
              className="flex items-center gap-2 px-4"
              style={{
                flex: "0 1 360px",
                width: "100%",
                maxWidth: 360,
                height: 40,
                minWidth: 240,
                background: "var(--surface-3)",
                border: "1px solid var(--border-soft)",
                borderRadius: 10,
                transition: "border-color 0.2s, background 0.2s",
              }}
              onFocus={(e) => (e.currentTarget.style.borderColor = "var(--border)")}
              onBlur={(e) => (e.currentTarget.style.borderColor = "var(--border-soft)")}
            >
              <Magnifier size={14} style={{ flexShrink: 0, color: "var(--text-3)" }} />
              <input
                type="text"
                placeholder="Search projects or profiles..."
                className="bg-transparent outline-none font-ui text-sm w-full"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{ color: "var(--text-1)" }}
              />
            </div>

            <div className="relative shrink-0">
              <button
                className="flex items-center gap-2 font-mono text-[11px] px-4"
                style={{
                  color: "var(--text-2)",
                  background: "var(--surface-3)",
                  border: "1px solid var(--border-soft)",
                  borderRadius: 10,
                  cursor: "pointer",
                  height: 40,
                  minWidth: 158,
                  justifyContent: "space-between",
                }}
                onClick={() => setIsSortOpen(!isSortOpen)}
                type="button"
              >
                <span className="flex items-center gap-2">
                  <SortVertical size={12} style={{ color: "var(--text-3)" }} />
                  {activeSortLabel}
                </span>
                <AltArrowDown size={10} className={`transition-transform duration-200 ${isSortOpen ? "rotate-180" : ""}`} />
              </button>

              {isSortOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSortOpen(false)} />
                  <div
                    className="absolute right-0 mt-2 py-2 z-50 shadow-lg"
                    style={{
                      background: "var(--surface-2)",
                      border: "1px solid color-mix(in srgb, var(--border) 90%, transparent)",
                      borderRadius: 10,
                      minWidth: 156,
                      backdropFilter: "blur(12px)",
                      boxShadow: "0 12px 22px rgba(0, 0, 0, 0.22)",
                    }}
                  >
                    {sortOptions.map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => {
                          setSortBy(opt.value)
                          setIsSortOpen(false)
                        }}
                        className="w-full text-left px-4 py-2 font-ui text-xs transition-colors"
                        style={{
                          color: sortBy === opt.value ? "var(--gold)" : "var(--text-2)",
                          background: "none",
                          border: "none",
                          cursor: "pointer",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "var(--surface-3)"
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

            <button
              onClick={onCreateProject}
              className="btn-intelligence-primary flex items-center justify-center gap-2 shrink-0"
              style={{ height: 40, padding: "0 18px", fontSize: 13, borderRadius: 10, marginLeft: "auto" }}
            >
              <AddCircle size={16} />
              New Project
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto pb-10 pr-2 -mr-2" style={{ marginTop: 8, paddingTop: 8 }}>
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
                <AddCircle size={16} />
                New Project
              </button>
            </div>
          ) : filteredProjects.length === 0 ? (
            <div className="py-12 border-t" style={{ borderColor: "var(--border-soft)" }}>
              <p className="font-ui text-sm" style={{ color: "var(--text-3)" }}>
                No results for "{searchQuery}".
              </p>
              <div className="flex items-center gap-3 mt-4">
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  style={{
                    height: 34,
                    padding: "0 12px",
                    borderRadius: 8,
                    border: "1px solid var(--border-soft)",
                    background: "transparent",
                    color: "var(--text-2)",
                    cursor: "pointer",
                    fontSize: 12,
                    fontFamily: "var(--font-ui), sans-serif",
                  }}
                >
                  Clear search
                </button>
                <span className="font-mono" style={{ color: "var(--text-3)", fontSize: 11 }}>
                  Tip: `Alt + N` creates a new project
                </span>
              </div>
            </div>
          ) : (
            <div
              ref={gridRef}
              className="grid grid-cols-1 md:grid-cols-3 gap-[14px]"
            >
              {filteredProjects.map((project) => (
                <ProjectCard
                  key={project.id}
                  project={project}
                  onClick={() => onOpenProject(project.id)}
                  onEdit={() => handleEditOpen(project)}
                  onDelete={() => setProjectPendingDelete(project)}
                  busy={busyProjectId === project.id}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Dialog open={Boolean(editingProject)} onOpenChange={(open) => !open && setEditingProject(null)}>
        <DialogContent
          className="sm:max-w-xl"
          style={{ background: "var(--surface-1)", borderColor: "var(--border-soft)", padding: 0, overflow: "hidden" }}
        >
          <DialogHeader style={{ padding: "24px 28px 18px", borderBottom: "1px solid var(--border-soft)" }}>
            <DialogTitle className="font-sans" style={{ color: "var(--text-1)", fontSize: 20, fontWeight: 600 }}>
              Edit project
            </DialogTitle>
            <DialogDescription className="font-sans" style={{ color: "var(--text-3)", lineHeight: 1.6 }}>
              Update the project name and supporting description for this profile.
            </DialogDescription>
          </DialogHeader>

          <div style={{ padding: "22px 28px 26px" }}>
            <div className="flex flex-col gap-5">
              <div>
                <label htmlFor="edit-project-title" className="font-mono" style={{ display: "block", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Project title
                </label>
                <input
                  id="edit-project-title"
                  type="text"
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Enter project title"
                  style={{
                    width: "100%",
                    height: 44,
                    borderRadius: 10,
                    border: "1px solid var(--border-soft)",
                    background: "var(--surface-2)",
                    color: "var(--text-1)",
                    padding: "0 14px",
                    outline: "none",
                  }}
                />
              </div>

              <div>
                <label htmlFor="edit-project-description" className="font-mono" style={{ display: "block", fontSize: 11, color: "var(--text-3)", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 10 }}>
                  Description
                </label>
                <textarea
                  id="edit-project-description"
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Add a short note about the focus of this project"
                  style={{
                    width: "100%",
                    minHeight: 118,
                    borderRadius: 10,
                    border: "1px solid var(--border-soft)",
                    background: "var(--surface-2)",
                    color: "var(--text-1)",
                    padding: "12px 14px",
                    outline: "none",
                    resize: "vertical",
                    lineHeight: 1.6,
                  }}
                />
              </div>
            </div>

            <DialogFooter style={{ marginTop: 24 }}>
              <button
                type="button"
                onClick={() => setEditingProject(null)}
                style={{
                  height: 40,
                  padding: "0 16px",
                  borderRadius: 10,
                  border: "1px solid var(--border-soft)",
                  background: "transparent",
                  color: "var(--text-2)",
                  cursor: "pointer",
                }}
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleEditSubmit}
                disabled={!editTitle.trim() || busyProjectId === editingProject?.id}
                className="btn-intelligence-primary"
                style={{
                  height: 40,
                  padding: "0 18px",
                  borderRadius: 10,
                  opacity: !editTitle.trim() || busyProjectId === editingProject?.id ? 0.72 : 1,
                  cursor: !editTitle.trim() || busyProjectId === editingProject?.id ? "not-allowed" : "pointer",
                }}
              >
                {busyProjectId === editingProject?.id ? "Saving..." : "Save changes"}
              </button>
            </DialogFooter>
          </div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={Boolean(projectPendingDelete)} onOpenChange={(open) => !open && setProjectPendingDelete(null)}>
        <AlertDialogContent style={{ background: "var(--surface-1)", borderColor: "var(--border-soft)" }}>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-sans" style={{ color: "var(--text-1)", fontSize: 20, fontWeight: 600 }}>
              Delete project
            </AlertDialogTitle>
            <AlertDialogDescription className="font-sans" style={{ color: "var(--text-3)", lineHeight: 1.7 }}>
              {projectPendingDelete
                ? `Delete "${projectPendingDelete.name}"? This removes the project from your dashboard.`
                : "Delete this project?"}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel
              style={{
                height: 40,
                borderRadius: 10,
                borderColor: "var(--border-soft)",
                background: "transparent",
                color: "var(--text-2)",
              }}
            >
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={(e) => {
                e.preventDefault()
                void handleDeleteConfirm()
              }}
              style={{
                height: 40,
                borderRadius: 10,
                background: "#7f1d1d",
                border: "1px solid rgba(248, 113, 113, 0.18)",
                color: "#fee2e2",
              }}
            >
              {busyProjectId === projectPendingDelete?.id ? "Deleting..." : "Delete project"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
