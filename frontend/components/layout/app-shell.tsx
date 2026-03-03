"use client"

import { TopBar } from "@/components/layout/top-bar"
import { Sidebar } from "@/components/layout/sidebar"
import { useSidebar } from "@/hooks/use-sidebar"
import { type ReactNode } from "react"

interface AppShellProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  onSettingsClick?: () => void
  onLogoClick?: () => void
  currentProfile?: {
    name: string
    category: string
    era: string
    initials: string
  } | null
  projectContext?: {
    name: string
    createdDate: string
    targetName: string
  } | null
  sidebarCollapsedDefault?: boolean
  hideSidebar?: boolean
}

export function AppShell({
  children,
  activeTab,
  onTabChange,
  onSettingsClick,
  onLogoClick,
  currentProfile,
  projectContext,
  sidebarCollapsedDefault = false,
  hideSidebar = false,
}: AppShellProps) {
  const { expanded, toggle } = useSidebar()
  const isChatMode = activeTab === "chat"

  // Force collapsed state if in chat mode
  const isExpanded = isChatMode ? false : (sidebarCollapsedDefault ? false : expanded)

  return (
    <div
      className="min-h-screen"
      style={{ background: "var(--bg)", overflow: "hidden" }}
    >
      <TopBar onSettingsClick={onSettingsClick} onLogoClick={onLogoClick} />
      {!hideSidebar && (
        <Sidebar
          expanded={isExpanded}
          onToggleSidebar={toggle}
          activeTab={activeTab}
          onTabChange={onTabChange}
          currentProfile={currentProfile}
        />
      )}
      <main
        id="main-scroll-container"
        className="relative"
        style={{
          marginLeft: hideSidebar ? 0 : (isExpanded ? "var(--sidebar-w)" : 56),
          paddingTop: "var(--topbar-h)",
          height: "100vh",
          overflowY: "auto",
          transition: "margin-left 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </main>
    </div>
  )
}
