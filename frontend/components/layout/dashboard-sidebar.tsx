"use client"

import {
  FolderWithFiles,
  Settings,
  UserRounded,
} from "@/components/ui/solar-icons"
import { Logo } from "@/components/ui/logo"

const navGroups = [
  {
    label: "INTELLIGENCE",
    items: [
      { id: "projects", label: "Projects", Icon: FolderWithFiles },
      { id: "settings", label: "Settings", Icon: Settings },
    ]
  }
]

interface DashboardSidebarProps {
  activeTab: string
  onTabChange: (tab: string) => void
}

export function DashboardSidebar({ activeTab, onTabChange }: DashboardSidebarProps) {
  return (
    <aside
      className="fixed left-0 flex flex-col"
      style={{
        top: "var(--topbar-h)",
        height: "calc(100vh - var(--topbar-h))",
        width: "var(--sidebar-w)",
        background: "var(--bg)",
        borderRight: "1px solid var(--border)",
        padding: "20px 0",
        zIndex: 40,
      }}
    >
      {/* Nav Groups */}
      <nav className="flex-1 space-y-6 overflow-y-auto">
        {navGroups.map((group) => (
          <div key={group.label}>
            <div
              className="font-mono text-[10px] uppercase tracking-[0.15em] mb-3 px-6"
              style={{ color: "var(--text-3)", opacity: 0.8 }}
            >
              {group.label}
            </div>
            <div className="space-y-0.5">
              {group.items.map((item) => {
                const isActive = activeTab === item.id
                const { Icon } = item
                return (
                  <button
                    key={item.id}
                    onClick={() => onTabChange(item.id)}
                    className="relative w-full flex items-center gap-3 px-6 py-2.5 transition-all group"
                    style={{
                      background: isActive ? "var(--gold-dim)" : "transparent",
                      color: isActive ? "var(--text-1)" : "var(--text-2)",
                      border: "none",
                      cursor: "pointer",
                      textAlign: "left",
                    }}
                    onMouseEnter={(e) => {
                      if (!isActive) e.currentTarget.style.background = "var(--surface-2)"
                    }}
                    onMouseLeave={(e) => {
                      if (!isActive) e.currentTarget.style.background = "transparent"
                    }}
                  >
                    {/* Gold active indicator */}
                    {isActive && (
                      <span
                        className="absolute left-0 top-0 bottom-0"
                        style={{
                          width: 3,
                          background: "var(--gold)",
                          borderRadius: "0 2px 2px 0",
                        }}
                      />
                    )}
                    <Icon
                      size={18}
                      weight={isActive ? "Broken" : "Linear"}
                      color={isActive ? "var(--gold)" : "var(--text-3)"}
                    />
                    <span
                      className="font-ui text-[14px] font-medium tracking-tight"
                      style={{ color: isActive ? "var(--text-1)" : "inherit" }}
                    >
                      {item.label}
                    </span>
                  </button>
                )
              })}
            </div>
          </div>
        ))}
      </nav>

      {/* User Section */}
      <div
        className="mt-auto px-6 py-6 border-t border-soft flex items-center gap-3"
        style={{ borderColor: "var(--border-soft)" }}
      >
        <div
          className="w-9 h-9 rounded-full flex items-center justify-center shrink-0"
          style={{ background: "var(--surface-3)", border: "1px solid var(--border-soft)" }}
        >
          <UserRounded size={18} weight="Linear" color="var(--text-2)" />
        </div>
        <div className="flex flex-col min-w-0">
          <span
            className="font-ui text-sm font-semibold truncate"
            style={{ color: "var(--text-1)" }}
          >
            Research User
          </span>
          <span
            className="font-mono text-[10px] truncate uppercase tracking-wider"
            style={{ color: "var(--text-3)" }}
          >
            Pro Plan
          </span>
        </div>
      </div>
    </aside>
  )
}
