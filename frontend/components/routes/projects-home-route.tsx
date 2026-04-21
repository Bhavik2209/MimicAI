"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { HomePage } from "@/components/home-page"
import { deleteProject, listProjects, updateProject } from "@/lib/api"
import { authClient } from "@/lib/auth/client"
import { toast } from "@/hooks/use-toast"
import {
  cacheProject,
  cacheProjects,
  getCachedProjects,
  mapProjectResponse,
  removeCachedProject,
  type DashboardProject,
} from "@/lib/dashboard"

const LAST_PROJECT_TAB_KEY_PREFIX = "mimic.project.last-tab"

function getRememberedProjectTab(projectId: string): string {
  if (typeof globalThis === "undefined" || !globalThis.localStorage) {
    return "overview"
  }
  const value = globalThis.localStorage.getItem(`${LAST_PROJECT_TAB_KEY_PREFIX}.${projectId}`)
  return value?.trim() || "overview"
}

export function ProjectsHomeRoute() {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [projects, setProjects] = useState<DashboardProject[]>([])
  const [busyProjectId, setBusyProjectId] = useState<string | null>(null)
  const [isLoadingProjects, setIsLoadingProjects] = useState(true)

  useEffect(() => {
    if (isPending || !session?.user.id) return

    let mounted = true
    const userId = session.user.id

    const loadProjects = async () => {
      try {
        const cached = getCachedProjects(userId)
        if (cached && mounted) {
          setProjects(cached)
          setIsLoadingProjects(false)
          return
        }

        const data = await listProjects()
        if (!mounted) return
        const mapped = data.map(mapProjectResponse)
        cacheProjects(userId, mapped)
        setProjects(mapped)
      } catch (error) {
        console.error("Failed to load projects from API", error)
        toast({
          title: "Could not load projects",
          description: "Please refresh or try again in a moment.",
          variant: "destructive",
        })
      } finally {
        if (mounted) {
          setIsLoadingProjects(false)
        }
      }
    }

    loadProjects()
    return () => {
      mounted = false
    }
  }, [isPending, session?.user.id])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable

      if (isTyping) return

      // Alt+N: quickly create a new project from the projects home route.
      if (event.altKey && !event.shiftKey && event.key.toLowerCase() === "n") {
        event.preventDefault()
        router.push("/projects/create")
      }
    }

    globalThis.addEventListener("keydown", handleShortcut)
    return () => globalThis.removeEventListener("keydown", handleShortcut)
  }, [router])

  if (isPending || isLoadingProjects) {
    return (
      <AppShell
        activeTab="projects"
        onTabChange={() => {}}
        onLogoClick={() => router.push("/")}
        topBarBackground="var(--bg)"
        mainBackground="var(--bg)"
        hideSidebar
      >
        <div className="w-full h-full" style={{ padding: "24px 32px" }}>
          <div
            style={{
              height: 46,
              borderRadius: 10,
              background: "var(--surface-2)",
              border: "1px solid var(--border-soft)",
              marginBottom: 18,
            }}
          />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-[14px]">
            {["a", "b", "c", "d", "e", "f"].map((skeletonKey) => (
              <div
                key={`projects-skeleton-${skeletonKey}`}
                style={{
                  minHeight: 128,
                  borderRadius: 8,
                  border: "1px solid var(--border-soft)",
                  background: "var(--surface-2)",
                  animation: "tab-fade 160ms ease",
                }}
              />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  if (!session?.user.id) {
    return null
  }

  return (
    <AppShell
      activeTab="projects"
      onTabChange={() => {}}
      onLogoClick={() => router.push("/")}
      topBarBackground="var(--bg)"
      mainBackground="var(--bg)"
      hideSidebar
    >
      <HomePage
        projects={projects}
        onCreateProject={() => router.push("/projects/create")}
        onOpenProject={(projectId) => {
          const rememberedTab = getRememberedProjectTab(projectId)
          router.push(`/projects/${projectId}?tab=${encodeURIComponent(rememberedTab)}`)
        }}
        busyProjectId={busyProjectId}
        onEditProject={async (projectId, values) => {
          const project = projects.find((item) => item.id === projectId || item.backendProjectId === projectId)
          if (!project) return

          try {
            setBusyProjectId(projectId)
            const updated = await updateProject(projectId, {
              title: values.title,
              description: values.description || undefined,
            })
            const mapped = { ...mapProjectResponse(updated), researchData: project.researchData }
            if (session?.user.id) {
              cacheProject(session.user.id, mapped)
            }
            setProjects((prev) => prev.map((item) => (item.id === projectId || item.backendProjectId === projectId ? mapped : item)))
            toast({
              title: "Project updated",
              description: "Project details were saved successfully.",
            })
          } catch (error) {
            console.error("Failed to update project", error)
            toast({
              title: "Update failed",
              description: error instanceof Error ? error.message : "Could not update project.",
              variant: "destructive",
            })
          } finally {
            setBusyProjectId(null)
          }
        }}
        onDeleteProject={async (projectId) => {
          const project = projects.find((item) => item.id === projectId || item.backendProjectId === projectId)
          if (!project) return

          try {
            setBusyProjectId(projectId)
            await deleteProject(projectId)
            if (session?.user.id) {
              removeCachedProject(session.user.id, projectId)
            }
            setProjects((prev) => prev.filter((item) => item.id !== projectId && item.backendProjectId !== projectId))
            toast({
              title: "Project deleted",
              description: "The project was removed from your dashboard.",
            })
          } catch (error) {
            console.error("Failed to delete project", error)
            toast({
              title: "Delete failed",
              description: error instanceof Error ? error.message : "Could not delete project.",
              variant: "destructive",
            })
          } finally {
            setBusyProjectId(null)
          }
        }}
      />
    </AppShell>
  )
}
