"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { useRouter } from "next/navigation"
import { AppShell } from "@/components/layout/app-shell"
import { ProfileHeader } from "@/components/profile/profile-header"
import { OverviewTab } from "@/components/tabs/overview-tab"
import { PersonalityTab } from "@/components/tabs/personality-tab"
import { TimelineTab } from "@/components/tabs/timeline-tab"
import { NewsTab } from "@/components/tabs/news-tab"
import { WorkTab } from "@/components/tabs/work-tab"
import { ResourcesTab } from "@/components/tabs/resources-tab"
import { PersonaChatTab } from "@/components/tabs/persona-chat-tab"
import { SettingsTab } from "@/components/tabs/settings-tab"
import { listProjects, runEntityResearch, updateProject } from "@/lib/api"
import { authClient } from "@/lib/auth/client"
import {
  buildProfile,
  buildProjectContext,
  cacheProject,
  cacheProjects,
  cacheResearch,
  getCachedProject,
  getCachedProjects,
  getCachedResearch,
  mapProjectResponse,
  type DashboardProject,
} from "@/lib/dashboard"
import { exportProjectReportPdf } from "@/lib/export-project-report"
import { DEFAULT_USER_SETTINGS, readUserSettings, type UserSettings } from "@/lib/user-settings"
import { toast } from "@/hooks/use-toast"

const VALID_TABS = new Set(["overview", "personality", "timeline", "news", "work", "resources", "chat", "settings"])
const LAST_PROJECT_TAB_KEY_PREFIX = "mimic.project.last-tab"

interface ProjectDashboardRouteProps {
  projectId: string
  tab: string
}

function normalizeTab(tabId: string | null | undefined): string {
  if (!tabId) return "overview"
  return VALID_TABS.has(tabId) ? tabId : "overview"
}

function buildProjectTabUrl(projectId: string, tabId: string): string {
  const resolvedTab = normalizeTab(tabId)
  return `/projects/${projectId}?tab=${encodeURIComponent(resolvedTab)}`
}

function getTabFromCurrentLocation(): string {
  if (typeof globalThis === "undefined") return "overview"
  const params = new URLSearchParams(globalThis.location.search)
  return normalizeTab(params.get("tab"))
}

function getInitialProjectState(userId: string | null, projectId: string) {
  if (!userId) {
    return {
      projects: [],
      activeResearch: null,
      loading: true,
    }
  }

  const cachedProject = getCachedProject(projectId)
  const cachedProjects = getCachedProjects(userId)
  const immediateProject =
    cachedProject ?? cachedProjects?.find((item) => item.id === projectId || item.backendProjectId === projectId) ?? null
  const cachedResearch = immediateProject
    ? getCachedResearch(immediateProject.wikidataId) ?? immediateProject.researchData ?? null
    : null

  return {
    projects: immediateProject ? cachedProjects ?? [immediateProject] : cachedProjects ?? [],
    activeResearch: cachedResearch,
    loading: immediateProject ? !cachedResearch && Boolean(immediateProject.wikidataId) : true,
  }
}

export function ProjectDashboardRoute({ projectId, tab }: Readonly<ProjectDashboardRouteProps>) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const userId = session?.user.id ?? null
  const initialState = getInitialProjectState(userId, projectId)
  const [projects, setProjects] = useState<DashboardProject[]>(initialState.projects)
  const [activeResearch, setActiveResearch] = useState<any>(initialState.activeResearch)
  const [loading, setLoading] = useState(initialState.loading)
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS)
  const [exportState, setExportState] = useState<"idle" | "loading" | "success">("idle")
  const [isRetryingResearch, setIsRetryingResearch] = useState(false)
  const [currentTab, setCurrentTab] = useState(normalizeTab(tab))
  const exportResetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  const activeTab = currentTab

  useEffect(() => {
    const resolvedTab = normalizeTab(tab)
    if (resolvedTab !== tab) {
      router.replace(buildProjectTabUrl(projectId, resolvedTab))
      return
    }
    setCurrentTab(resolvedTab)
  }, [projectId, router, tab])

  useEffect(() => {
    const handlePopState = () => {
      setCurrentTab(getTabFromCurrentLocation())
    }

    globalThis.addEventListener("popstate", handlePopState)
    return () => globalThis.removeEventListener("popstate", handlePopState)
  }, [])

  useEffect(() => {
    return () => {
      if (exportResetTimeoutRef.current) {
        globalThis.clearTimeout(exportResetTimeoutRef.current)
      }
    }
  }, [])

  useEffect(() => {
    setUserSettings(readUserSettings())
  }, [])

  useEffect(() => {
    if (isPending || !userId) return

    let mounted = true

    const loadProject = async () => {
      setLoading(true)
      try {
        const cachedProject = getCachedProject(projectId)
        const cachedProjects = getCachedProjects(userId)
        const immediateProject =
          cachedProject ?? cachedProjects?.find((item) => item.id === projectId || item.backendProjectId === projectId) ?? null

        if (immediateProject) {
          setProjects(cachedProjects ?? [immediateProject])
          const cachedResearch = getCachedResearch(immediateProject.wikidataId) ?? immediateProject.researchData ?? null
          if (cachedResearch) {
            setActiveResearch(cachedResearch)
            setLoading(false)
            return
          }

          if (immediateProject.wikidataId) {
            const research = await runEntityResearch(immediateProject.wikidataId)
            if (!mounted) return
            setActiveResearch(research)
            cacheResearch(immediateProject.wikidataId, research)
            const hydratedProject = { ...immediateProject, researchData: research }
            cacheProject(userId, hydratedProject)
            setProjects((prev) =>
              prev.map((item) =>
                item.id === immediateProject.id || item.backendProjectId === immediateProject.backendProjectId
                  ? hydratedProject
                  : item
              )
            )
          } else {
            setActiveResearch(null)
          }

          setLoading(false)
          return
        }

        const data = await listProjects()
        if (!mounted) return
        const mapped = data.map(mapProjectResponse)
        cacheProjects(userId, mapped)
        setProjects(mapped)

        const project = mapped.find((item) => item.id === projectId || item.backendProjectId === projectId)
        if (!project) {
          router.replace("/projects")
          return
        }

        const cachedResearch = getCachedResearch(project.wikidataId)
        if (cachedResearch) {
          setActiveResearch(cachedResearch)
          const hydratedProject = { ...project, researchData: cachedResearch }
          cacheProject(userId, hydratedProject)
          setProjects((prev) => prev.map((item) => (item.id === project.id ? hydratedProject : item)))
          setLoading(false)
          return
        }

        if (project.wikidataId) {
          const research = await runEntityResearch(project.wikidataId)
          if (!mounted) return
          setActiveResearch(research)
          cacheResearch(project.wikidataId, research)
          setProjects((prev) =>
            prev.map((item) =>
              item.id === project.id
                ? {
                    ...item,
                    researchData: research,
                  }
                : item
            )
          )
          cacheProject(userId, { ...project, researchData: research })
        } else {
          setActiveResearch(null)
        }
      } catch (error) {
        console.error("Failed to load project route", error)
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadProject()
    return () => {
      mounted = false
    }
  }, [isPending, projectId, router, userId])

  const activeProject = useMemo(
    () => projects.find((item) => item.id === projectId || item.backendProjectId === projectId) ?? null,
    [projectId, projects]
  )

  const profile = activeProject ? buildProfile(activeProject, activeResearch) : null
  const projectContext = activeProject ? buildProjectContext(activeProject) : null

  const hasNewsData = Boolean(activeResearch?.acquisition?.news?.length)
  const hasWorkData = Boolean(
    (activeResearch as Record<string, unknown> | undefined)?.acquisition &&
      (((activeResearch as Record<string, unknown>).acquisition) as Record<string, unknown>)?.openalex
  )

  const visibleTabs: Partial<Record<string, boolean>> = {
    overview: userSettings.showOverviewTab,
    personality: userSettings.showPersonalityTab,
    timeline: userSettings.showTimelineTab,
    news: hasNewsData && userSettings.showNewsTab,
    work: hasWorkData && userSettings.showWorkTab,
    resources: userSettings.showResourcesTab,
    chat: userSettings.showChatTab,
  }

  useEffect(() => {
    if (activeTab === "settings") return
    if (visibleTabs[activeTab] !== false) return

    const fallbackOrder = ["overview", "personality", "timeline", "resources", "chat", "settings"]
    const nextTab = fallbackOrder.find((tabId) => tabId === "settings" || visibleTabs[tabId] !== false) || "settings"
    setCurrentTab(nextTab)
    globalThis.history.pushState({}, "", buildProjectTabUrl(projectId, nextTab))
  }, [activeTab, projectId, visibleTabs])

  const handleTabChange = (nextTab: string) => {
    if (!VALID_TABS.has(nextTab) || nextTab === activeTab) return
    setCurrentTab(nextTab)
    globalThis.history.pushState({}, "", buildProjectTabUrl(projectId, nextTab))
  }

  const handleRetryResearch = async () => {
    const targetWikidataId = activeProject?.wikidataId
    if (!targetWikidataId) {
      toast({
        title: "Missing entity id",
        description: "This project does not have a linked Wikidata id yet.",
        variant: "destructive",
      })
      return
    }

    try {
      setIsRetryingResearch(true)
      const research = await runEntityResearch(targetWikidataId)
      setActiveResearch(research)
      cacheResearch(targetWikidataId, research)

      if (activeProject) {
        const hydratedProject = { ...activeProject, researchData: research }
        setProjects((prev) =>
          prev.map((item) =>
            item.id === activeProject.id || item.backendProjectId === activeProject.backendProjectId
              ? hydratedProject
              : item
          )
        )
        if (userId) {
          cacheProject(userId, hydratedProject)
        }
      }

      toast({
        title: "Research refreshed",
        description: "Latest source data is now available.",
      })
    } catch (error) {
      console.error("Research retry failed", error)
      toast({
        title: "Refresh failed",
        description: error instanceof Error ? error.message : "Could not refresh research data.",
        variant: "destructive",
      })
    } finally {
      setIsRetryingResearch(false)
    }
  }

  useEffect(() => {
    if (typeof globalThis === "undefined" || !globalThis.localStorage) return
    globalThis.localStorage.setItem(`${LAST_PROJECT_TAB_KEY_PREFIX}.${projectId}`, activeTab)
  }, [activeTab, projectId])

  useEffect(() => {
    const handleShortcut = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      const isTyping =
        target?.tagName === "INPUT" ||
        target?.tagName === "TEXTAREA" ||
        target?.isContentEditable

      if (isTyping || !event.altKey || event.shiftKey) return

      const tabByNumber: Record<string, string> = {
        "1": "overview",
        "2": "personality",
        "3": "timeline",
        "4": "news",
        "5": "work",
        "6": "resources",
        "7": "chat",
        "8": "settings",
      }

      const nextTab = tabByNumber[event.key]
      if (nextTab && VALID_TABS.has(nextTab) && visibleTabs[nextTab] !== false) {
        event.preventDefault()
        handleTabChange(nextTab)
        return
      }

      if (event.key.toLowerCase() === "e") {
        event.preventDefault()
        void handleExportClick()
      }
    }

    globalThis.addEventListener("keydown", handleShortcut)
    return () => globalThis.removeEventListener("keydown", handleShortcut)
  }, [visibleTabs, activeTab, exportState, profile, projectId])

  const handleExportClick = async () => {
    if (!profile) return
    if (exportState === "loading") return

    const activeElement = globalThis.document.activeElement
    if (activeElement instanceof HTMLElement) {
      activeElement.blur()
    }

    if (exportResetTimeoutRef.current) {
      globalThis.clearTimeout(exportResetTimeoutRef.current)
      exportResetTimeoutRef.current = null
    }

    try {
      setExportState("loading")
      await exportProjectReportPdf({
        profile,
        projectContext,
        researchData: activeResearch,
      })
      setExportState("success")
      exportResetTimeoutRef.current = globalThis.setTimeout(() => {
        setExportState("idle")
        exportResetTimeoutRef.current = null
      }, 1800)
    } catch (error) {
      console.error("Export failed", error)
      setExportState("idle")
    }
  }

  const handleProjectDetailsSave = async (payload: { name: string; description: string }) => {
    if (!activeProject) return

    const targetProjectId = activeProject.backendProjectId || activeProject.id
    const updated = await updateProject(targetProjectId, {
      title: payload.name,
      description: payload.description || undefined,
    })

    const mapped = mapProjectResponse(updated)
    const merged: DashboardProject = {
      ...activeProject,
      ...mapped,
      researchData: activeProject.researchData,
    }

    setProjects((prev) =>
      prev.map((item) =>
        item.id === activeProject.id || item.backendProjectId === activeProject.backendProjectId ? merged : item
      )
    )

    if (userId) {
      cacheProject(userId, merged)
    }
  }

  const renderTab = () => {
    const renderEmptyState = (title: string, description: string) => (
      <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
        <div style={{ border: "1px dashed var(--border-soft)", borderRadius: 22, padding: "44px 28px", background: "rgba(255,255,255,0.02)" }}>
          <h3 className="font-sans" style={{ fontSize: 18, color: "var(--text-1)", fontWeight: 550, textAlign: "center", marginBottom: 10 }}>
            {title}
          </h3>
          <p className="font-sans" style={{ fontSize: 15, color: "var(--text-2)", lineHeight: 1.75, textAlign: "center", maxWidth: 520, margin: "0 auto" }}>
            {description}
          </p>
          <div className="flex items-center justify-center gap-3" style={{ marginTop: 18 }}>
            <button
              type="button"
              onClick={() => void handleRetryResearch()}
              disabled={isRetryingResearch}
              className="font-sans"
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--gold)",
                background: "var(--gold-dim)",
                color: "var(--text-1)",
                fontSize: 14,
                fontWeight: 520,
                cursor: isRetryingResearch ? "wait" : "pointer",
                opacity: isRetryingResearch ? 0.75 : 1,
              }}
            >
              {isRetryingResearch ? "Refreshing..." : "Retry research"}
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("overview")}
              className="font-sans"
              style={{
                padding: "10px 14px",
                borderRadius: 10,
                border: "1px solid var(--border-soft)",
                background: "transparent",
                color: "var(--text-2)",
                fontSize: 14,
                cursor: "pointer",
              }}
            >
              Go to overview
            </button>
          </div>
        </div>
      </div>
    )

    if (!activeResearch && activeTab !== "settings" && activeTab !== "chat") {
      return renderEmptyState(
        "Research data not loaded",
        "This tab needs completed research output. Retry research to fetch and index data for this project."
      )
    }

    if (activeTab === "news" && !hasNewsData) {
      return renderEmptyState(
        "No news data yet",
        "No recent coverage was available for this entity in the last run. Retry research to attempt a fresh fetch."
      )
    }

    if (activeTab === "work" && !hasWorkData) {
      return renderEmptyState(
        "No work data yet",
        "Publication and citation data was not available in the last run. Retry research to fetch updated records."
      )
    }

    if (
      activeTab === "resources" &&
      !activeResearch?.acquisition?.resources?.length &&
      !activeResearch?.acquisition?.conversation?.videos?.length
    ) {
      return renderEmptyState(
        "No resource links yet",
        "The current run has no external resource links. Retry research to regenerate source links and transcripts."
      )
    }

    switch (activeTab) {
      case "overview":
        return <OverviewTab researchData={activeResearch} />
      case "personality":
        return <PersonalityTab researchData={activeResearch} />
      case "timeline":
        return <TimelineTab researchData={activeResearch} />
      case "news":
        return <NewsTab researchData={activeResearch} />
      case "work":
        return <WorkTab researchData={activeResearch} />
      case "resources":
        return <ResourcesTab researchData={activeResearch} />
      case "chat":
        return (
          <PersonaChatTab
            entityWikidataId={activeProject?.wikidataId || activeResearch?.basic_info?.wikidata_id || ""}
            entityName={profile?.name || activeProject?.profile.name || "Entity"}
            entityInitials={profile?.initials || activeProject?.profile.initials}
            entityImageUrl={profile?.imageUrl}
            projectId={activeProject?.backendProjectId || activeProject?.id || ""}
            defaultWebSearch={userSettings.defaultWebSearch}
            defaultKnowledgeBase={userSettings.defaultKnowledgeBase}
            onBack={() => router.push("/projects")}
          />
        )
      case "settings":
        return (
          <SettingsTab
            projectName={activeProject?.name || ""}
            projectDescription={activeProject?.description || ""}
            onSaveProjectDetails={handleProjectDetailsSave}
            onUserSettingsChange={setUserSettings}
          />
        )
      default:
        return <OverviewTab researchData={activeResearch} />
    }
  }

  if (isPending || loading || !activeProject || !profile) {
    return (
      <AppShell
        activeTab={activeTab}
        onTabChange={handleTabChange}
        onLogoClick={() => router.push("/")}
        topBarBackground="var(--bg)"
        mainBackground="var(--bg)"
        sidebarBackground="var(--bg)"
      >
        <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
          <div style={{ height: 18, width: 140, borderRadius: 6, background: "var(--surface-2)", marginBottom: 14 }} />
          <div style={{ height: 34, width: "56%", borderRadius: 8, background: "var(--surface-2)", marginBottom: 18 }} />
          <div style={{ height: 14, width: "100%", borderRadius: 6, background: "var(--surface-2)", marginBottom: 8 }} />
          <div style={{ height: 14, width: "86%", borderRadius: 6, background: "var(--surface-2)", marginBottom: 26 }} />
          <div className="grid gap-3" style={{ gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))" }}>
            {["a", "b", "c", "d", "e", "f"].map((skeletonKey) => (
              <div
                key={`dashboard-skeleton-${skeletonKey}`}
                style={{
                  height: 112,
                  borderRadius: 14,
                  border: "1px solid var(--border-soft)",
                  background: "var(--surface-2)",
                }}
              />
            ))}
          </div>
        </div>
      </AppShell>
    )
  }

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      visibleTabs={visibleTabs}
      onSettingsClick={() => router.push(buildProjectTabUrl(projectId, "settings"))}
      onLogoClick={() => router.push("/")}
      topBarBackground="var(--bg)"
      mainBackground="var(--bg)"
      sidebarBackground="var(--bg)"
      projectContext={projectContext}
      currentProfile={{
        name: profile.name,
        category: profile.category,
        era: profile.era,
        initials: profile.initials,
      }}
    >
      <div className="dashboard-page" style={{ minHeight: "100%" }}>
        {activeTab !== "chat" && activeTab !== "settings" && (
          <ProfileHeader
            profile={profile}
            activeTab={activeTab}
            onTabChange={handleTabChange}
            projectContext={projectContext}
            onBackToProjects={() => router.push("/projects")}
            onExportClick={handleExportClick}
            exportState={exportState}
          />
        )}
        <div style={{ opacity: 1, animation: "tab-fade 120ms ease" }}>
          {renderTab()}
        </div>
      </div>
    </AppShell>
  )
}
