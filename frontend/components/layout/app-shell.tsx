"use client"

import { TopBar } from "@/components/layout/top-bar"
import { Sidebar } from "@/components/layout/sidebar"
import { useSidebar } from "@/hooks/use-sidebar"
import { type ReactNode } from "react"

interface AppShellProps {
  children: ReactNode
  activeTab: string
  onTabChange: (tab: string) => void
  visibleTabs?: Partial<Record<string, boolean>>
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
  customSidebar?: ReactNode
  topBarBackground?: string
  mainBackground?: string
  sidebarBackground?: string
}

export function AppShell({
  children,
  activeTab,
  onTabChange,
  visibleTabs,
  onSettingsClick,
  onLogoClick,
  currentProfile,
  projectContext,
  sidebarCollapsedDefault = false,
  hideSidebar = false,
  customSidebar,
  topBarBackground,
  mainBackground,
  sidebarBackground,
}: Readonly<AppShellProps>) {
  const { expanded, toggle } = useSidebar()
  const isExpanded = sidebarCollapsedDefault ? false : expanded

  let mainMarginLeft: string | number = 0
  if (!hideSidebar) {
    mainMarginLeft = isExpanded ? "var(--sidebar-w)" : 56
  }

  return (
    <div
      className="min-h-screen"
      style={{
        overflow: "hidden",
      }}
    >
      <TopBar onSettingsClick={onSettingsClick} onLogoClick={onLogoClick} background={topBarBackground} />
      {!hideSidebar && (
        customSidebar || (
          <Sidebar
            expanded={isExpanded}
            onToggleSidebar={toggle}
            activeTab={activeTab}
            onTabChange={onTabChange}
            background={sidebarBackground}
            visibleTabs={visibleTabs}
            currentProfile={currentProfile}
          />
        )
      )}
      <main
        id="main-scroll-container"
        className="relative"
        style={{
          marginLeft: mainMarginLeft,
          paddingTop: "var(--topbar-h)",
          height: "100vh",
          background: mainBackground || "var(--bg)",
          overflowY: "auto",
          transition: "margin-left 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        }}
      >
        {children}
      </main>
    </div>
  )
}
