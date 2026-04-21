import {
  Widget,     // Overview — profile view
  UserId,          // Personality — individual traits
  SortByTime,      // Timeline — chronologically ordered events
  Siren,           // News — editorial feed, current events
  Suitcase,        // Work — career, professional output
  Documents,       // Resources — library of reference material
  ChatLine,        // Persona Chat — a live conversation bubble
  Settings,        // Settings — configuration
  MaximizeSquare2, // Collapse/expand sidebar control
} from "@/components/ui/solar-icons"

interface SidebarProps {
  expanded: boolean
  onToggleSidebar: () => void
  activeTab: string
  onTabChange: (tab: string) => void
  background?: string
  visibleTabs?: Partial<Record<string, boolean>>
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
      { id: "overview",     label: "Overview",     icon: Widget },
      { id: "personality",  label: "Personality",  icon: UserId },
      { id: "timeline",     label: "Timeline",     icon: SortByTime },
    ],
  },
  {
    label: "INSIGHTS",
    items: [
      { id: "news",         label: "News",         icon: Siren },
      { id: "work",         label: "Work",         icon: Suitcase },
      { id: "resources",    label: "Resources",    icon: Documents },
    ],
  },
  {
    label: "INTERACTION",
    items: [{ id: "chat", label: "Persona Chat", icon: ChatLine }],
  },
]

export function Sidebar({
  expanded,
  onToggleSidebar,
  activeTab,
  onTabChange,
  background,
  visibleTabs,
  currentProfile,
}: Readonly<SidebarProps>) {
  const filteredNavGroups = navGroups
    .map((group) => ({
      ...group,
      items: group.items.filter((item) => visibleTabs?.[item.id] !== false),
    }))
    .filter((group) => group.items.length > 0)

  return (
    <aside
      className="fixed left-0 flex flex-col overflow-hidden"
      style={{
        top: "var(--topbar-h)",
        height: "calc(100vh - var(--topbar-h))",
        width: expanded ? "var(--sidebar-w)" : 56,
        background: background || "var(--bg)",
        borderRight: "1px solid var(--border)",
        transition: "width 220ms cubic-bezier(0.4, 0, 0.2, 1)",
        zIndex: 40,
      }}
    >
      {/* Navigation Groups */}
      <nav className="flex-1 overflow-y-auto py-4" style={{ flex: 1, minHeight: 0, paddingLeft: 4, paddingRight: 4 }}>
        {filteredNavGroups.map((group) => (
          <div key={group.label}>
            {expanded && (
              <div
                className="font-mono"
                style={{
                  fontSize: 10,
                  fontWeight: 500,
                  textTransform: "uppercase",
                  letterSpacing: "0.15em",
                  color: "var(--text-3)",
                  padding: "20px 16px 6px 20px",
                  opacity: 0.8
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
                    background: isActive ? "var(--sidebar-active-bg)" : "transparent",
                    boxShadow: isActive ? "inset 0 0 0 1px var(--sidebar-active-border, transparent)" : "none",
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
                  title={expanded ? undefined : item.label}
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
                    style={{
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
          {/* MaximizeSquare2 flipped — collapse = pointing inward, expand = pointing outward */}
          <MaximizeSquare2
            size={16}
            weight="Linear"
            color="currentColor"
            style={{ transform: expanded ? "none" : "scaleX(-1)", transition: "transform 0.2s" }}
          />
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
            background: activeTab === "settings" ? "var(--sidebar-active-bg)" : "transparent",
            boxShadow: activeTab === "settings" ? "inset 0 0 0 1px var(--sidebar-active-border, transparent)" : "none",
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
          title={expanded ? undefined : "Settings"}
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
            weight={activeTab === "settings" ? "Broken" : "Linear"}
            color={activeTab === "settings" ? "var(--gold)" : "var(--text-3)"}
            style={{
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
