"use client"

import { useEffect, useState } from "react"

import { AppShell } from "@/components/layout/app-shell"
import { HomePage } from "@/components/home-page"
import { ProfileHeader } from "@/components/profile/profile-header"
import { OverviewTab } from "@/components/tabs/overview-tab"
import { PersonalityTab } from "@/components/tabs/personality-tab"
import { TimelineTab } from "@/components/tabs/timeline-tab"
import { ControversiesTab } from "@/components/tabs/controversies-tab"
import { NewsTab } from "@/components/tabs/news-tab"
import { ResourcesTab } from "@/components/tabs/resources-tab"
import { PersonaChatTab } from "@/components/tabs/persona-chat-tab"
import { SettingsTab } from "@/components/tabs/settings-tab"
import { CreateProjectFlow } from "@/components/project/create-project-flow"
import { LandingPage } from "@/components/landing-page"
import { LandingNav } from "@/components/layout/landing-nav"

const initialTeslaProfile = {
  name: "Nikola Tesla",
  category: "Physicist",
  era: "1856–1943",
  initials: "NT",
  tags: ["Electrical Engineering", "Alternating Current", "Wireless Energy", "Inventor"],
  subtitle:
    "Serbian-American inventor, electrical engineer, and futurist best known for his contributions to the design of the modern alternating current electricity supply system.",
  eyebrow: "",
}

interface ProjectContext {
  name: string
  createdDate: string
  targetName: string
}

interface Project {
  id: string
  name: string
  description?: string
  targetName: string
  createdDate: string
  profile: {
    name: string
    initials: string
    category: string
    era: string
  }
}

export default function Page() {
  console.log("[v0] Page component mounted")
  const [view, setView] = useState<"landing" | "home" | "create" | "profile">("landing")
  const [activeTab, setActiveTab] = useState("overview")
  const [projectContext, setProjectContext] = useState<ProjectContext | null>(null)
  const [profile, setProfile] = useState(initialTeslaProfile)
  const [projects, setProjects] = useState<Project[]>([])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const stored = window.localStorage.getItem("mimic.projects")
      if (stored) {
        const parsed = JSON.parse(stored) as Project[]
        if (Array.isArray(parsed)) {
          setProjects(parsed)
        }
      }
    } catch (error) {
      console.error("Failed to load projects from localStorage", error)
    }
  }, [])

  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem("mimic.projects", JSON.stringify(projects))
    } catch (error) {
      console.error("Failed to save projects to localStorage", error)
    }
  }, [projects])

  const handleStartCreate = () => {
    setView("create")
  }

  const handleProjectComplete = (project: any, selectedProfile: any) => {
    const newProject: Project = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      name: project.name,
      description: project.description,
      targetName: selectedProfile.name,
      createdDate: project.createdDate,
      profile: {
        name: selectedProfile.name,
        initials: selectedProfile.initials,
        category: selectedProfile.category,
        era: selectedProfile.era,
      },
    }

    setProjects((prev) => [newProject, ...prev])

    setProjectContext({
      name: newProject.name,
      createdDate: newProject.createdDate,
      targetName: newProject.targetName,
    })

    setProfile({
      ...initialTeslaProfile,
      name: newProject.profile.name,
      initials: newProject.profile.initials,
      category: newProject.profile.category,
      era: newProject.profile.era,
      eyebrow: "",
    })

    setView("profile")
    setActiveTab("overview")
  }

  const handleOpenProject = (projectId: string) => {
    const project = projects.find((p) => p.id === projectId)
    if (!project) return

    setProjectContext({
      name: project.name,
      createdDate: project.createdDate,
      targetName: project.targetName,
    })

    setProfile({
      ...initialTeslaProfile,
      name: project.profile.name,
      initials: project.profile.initials,
      category: project.profile.category,
      era: project.profile.era,
      eyebrow: "",
    })

    setView("profile")
    setActiveTab("overview")
  }

  const handleTabChange = (tab: string) => {
    setActiveTab(tab)
    if (view === "home") {
      setView("profile")
    }
  }

  const handleSettingsClick = () => {
    setView("profile")
    setActiveTab("settings")
  }

  const handleGetStarted = () => {
    setView("home")
  }

  const handleLogoClick = () => {
    setView("landing")
  }

  if (view === "landing") {
    return (
      <div className="landing-page" style={{ background: "transparent", minHeight: "100vh" }}>
        <LandingNav onTryMimic={handleGetStarted} />
        <LandingPage onGetStarted={handleGetStarted} />
      </div>
    )
  }

  if (view === "create") {
    return (
      <AppShell
        activeTab=""
        onTabChange={() => { }}
        hideSidebar
      >
        <CreateProjectFlow
          onComplete={handleProjectComplete}
          onClose={() => setView("home")}
        />
      </AppShell>
    )
  }

  if (view === "home") {
    return (
      <AppShell
        activeTab="projects"
        onTabChange={handleTabChange}
        onSettingsClick={handleSettingsClick}
        onLogoClick={handleLogoClick}
        hideSidebar
      >
        <HomePage
          projects={projects}
          onCreateProject={handleStartCreate}
          onOpenProject={handleOpenProject}
        />
      </AppShell>
    )
  }

  // STEP 4: Main Intelligence Dashboard
  const renderTab = () => {
    switch (activeTab) {
      case "overview":
        return <OverviewTab />
      case "personality":
        return <PersonalityTab />
      case "timeline":
        return <TimelineTab />
      case "controversies":
        return <ControversiesTab />
      case "news":
        return <NewsTab />
      case "resources":
        return <ResourcesTab />
      case "chat":
        return <PersonaChatTab onBack={() => handleTabChange("overview")} />
      case "settings":
        return <SettingsTab />
      default:
        return <OverviewTab />
    }
  }

  return (
    <AppShell
      activeTab={activeTab}
      onTabChange={handleTabChange}
      onSettingsClick={handleSettingsClick}
      onLogoClick={handleLogoClick}
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
            onTabChange={setActiveTab}
            projectContext={projectContext}
            onBackToProjects={() => setView("home")}
          />
        )}
        <div
          key={activeTab}
          style={{
            opacity: 1,
            animation: "tab-fade 160ms ease",
          }}
        >
          {renderTab()}
        </div>
      </div>
    </AppShell>
  )
}
