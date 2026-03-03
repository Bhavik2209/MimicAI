import {
  BookOpen,
  Brain,
  Network,
  AlertCircle,
  Newspaper,
  Library,
  MessageSquare,
  PanelLeftClose,
  PanelLeft,
  Settings,
} from "lucide-react"

interface SidebarProps {
  expanded: boolean
  onToggleSidebar: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  currentProfile?: {
    name: string
    category: string
    era: string
    initials: string
  } | null
}

const navGroups = [
  {
    label: "PROFILE",
    items: [
      { id: "overview", label: "Overview", icon: BookOpen },
      { id: "personality", label: "Personality", icon: Brain },
      { id: "timeline", label: "Timeline", icon: Network },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { id: "controversies", label: "Controversies", icon: AlertCircle },
      { id: "news", label: "News", icon: Newspaper },
      { id: "resources", label: "Resources", icon: Library },
    ],
  },
  {
    label: "INTERACTION",
    items: [{ id: "chat", label: "Persona Chat", icon: MessageSquare }],
  },
]

export function Sidebar({
  expanded,
  onToggleSidebar,
  activeTab,
  onTabChange,
  currentProfile,
}: SidebarProps) {
  return (
    <aside
      className="fixed left-0 flex flex-col overflow-hidden"
      style={{
        top: "var(--topbar-h)",
        height: "calc(100vh - var(--topbar-h))",
        width: expanded ? "var(--sidebar-w)" : 56,
        background: "var(--panel-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderRight: "1px solid var(--panel-border)",
        transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 40,
      }}
    >
      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-4" style={{ flex: 1, minHeight: 0, paddingLeft: 4, paddingRight: 4 }}>
        {navGroups.map((group) => (
          <div key={group.label}>
            {expanded && (
              <div
                className="font-sans"
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.1em",
                  color: "var(--text-3)",
                  padding: "20px 16px 6px 20px",
                }}
              >
                {group.label}
              </div>
            )}
            {group.items.map((item) => {
              const isActive = activeTab === item.id
              const Icon = item.icon
              return (
                <button
                  key={item.id}
                  onClick={() => onTabChange(item.id)}
                  className="relative flex items-center w-full"
                  style={{
                    gap: expanded ? 10 : 0,
                    padding: expanded ? "9px 16px 9px 20px" : "9px 0",
                    justifyContent: expanded ? "flex-start" : "center",
                    background: isActive ? "var(--gold-dim)" : "transparent",
                    transition: "var(--transition)",
                    cursor: "pointer",
                    border: "none",
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "var(--surface-2)"
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive)
                      e.currentTarget.style.background = "transparent"
                  }}
                  title={!expanded ? item.label : undefined}
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
                    style={{
                      color: isActive ? "var(--text-1)" : "var(--text-3)",
                      transition: "var(--transition)",
                      flexShrink: 0,
                    }}
                  />
                  {expanded && (
                    <span
                      className="font-sans truncate"
                      style={{
                        fontSize: 14,
                        fontWeight: isActive ? 500 : 400,
                        color: isActive ? "var(--text-1)" : "var(--text-2)",
                        transition: "var(--transition)",
                        opacity: 1,
                      }}
                    >
                      {item.label}
                    </span>
                  )}
                </button>
              )
            })}
          </div>
        ))}
      </nav>

      {/* Collapse toggle — bottom of sidebar */}
      <div
        className="shrink-0"
        style={{
          padding: "8px",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <button
          onClick={onToggleSidebar}
          className="glass-card flex items-center justify-center rounded-[10px] w-full"
          style={{
            height: 32,
            background: "var(--control-bg)",
            border: "1px solid var(--control-border)",
            color: "var(--text-3)",
            cursor: "pointer",
            transition: "var(--transition)",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--surface-3)"
            e.currentTarget.style.color = "var(--gold)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "var(--surface-2)"
            e.currentTarget.style.color = "var(--text-3)"
          }}
          aria-label={expanded ? "Collapse sidebar" : "Expand sidebar"}
        >
          {expanded ? (
            <PanelLeftClose size={16} />
          ) : (
            <PanelLeft size={16} />
          )}
        </button>
      </div>

      {/* Settings — fixed at bottom */}
      <div
        className="shrink-0"
        style={{
          padding: "8px 0 12px",
          borderTop: "1px solid var(--border-soft)",
        }}
      >
        <button
          onClick={() => onTabChange("settings")}
          className="relative flex items-center w-full"
          style={{
            gap: expanded ? 10 : 0,
            padding: expanded ? "9px 16px 9px 20px" : "9px 0",
            justifyContent: expanded ? "flex-start" : "center",
            background: activeTab === "settings" ? "var(--gold-dim)" : "transparent",
            transition: "var(--transition)",
            cursor: "pointer",
            border: "none",
          }}
          onMouseEnter={(e) => {
            if (activeTab !== "settings")
              e.currentTarget.style.background = "var(--surface-2)"
          }}
          onMouseLeave={(e) => {
            if (activeTab !== "settings")
              e.currentTarget.style.background = "transparent"
          }}
          title={!expanded ? "Settings" : undefined}
        >
          {activeTab === "settings" && (
            <span
              className="absolute left-0 top-0 bottom-0"
              style={{
                width: 3,
                background: "var(--gold)",
                borderRadius: "0 2px 2px 0",
              }}
            />
          )}
          <Settings
            size={18}
            style={{
              color: activeTab === "settings" ? "var(--text-1)" : "var(--text-3)",
              transition: "var(--transition)",
              flexShrink: 0,
            }}
          />
          {expanded && (
            <span
              className="font-sans truncate"
              style={{
                fontSize: 14,
                fontWeight: activeTab === "settings" ? 500 : 400,
                color: activeTab === "settings" ? "var(--text-1)" : "var(--text-2)",
                transition: "var(--transition)",
              }}
            >
              Settings
            </span>
          )}
        </button>
      </div>
    </aside>
  )
}
