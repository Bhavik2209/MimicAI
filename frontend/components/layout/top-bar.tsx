"use client"

import { Search, Sun, Moon, Bell, Settings } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

interface TopBarProps {
  onSettingsClick?: () => void
  onLogoClick?: () => void
}

export function TopBar({ onSettingsClick, onLogoClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme()

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center px-6"
      style={{
        height: "var(--topbar-h)",
        background: "var(--panel-bg)",
        backdropFilter: "blur(20px)",
        WebkitBackdropFilter: "blur(20px)",
        borderBottom: "1px solid var(--panel-border)",
      }}
    >
      {/* Left — Logo */}
      <div
        className={`flex items-center gap-0 ${onLogoClick ? "cursor-pointer" : ""}`}
        onClick={onLogoClick}
        role={onLogoClick ? "button" : undefined}
        tabIndex={onLogoClick ? 0 : undefined}
        onKeyDown={onLogoClick ? (e) => e.key === "Enter" && onLogoClick() : undefined}
        style={{
          transition: "opacity var(--transition)",
          ...(onLogoClick && {
            opacity: 1,
          }),
        }}
        onMouseEnter={(e) => onLogoClick && (e.currentTarget.style.opacity = "0.85")}
        onMouseLeave={(e) => onLogoClick && (e.currentTarget.style.opacity = "1")}
      >
          <span
            className="font-sans"
            style={{
              fontSize: 22,
              fontWeight: 700,
              color: "var(--text-1)",
            }}
          >
            MIMIC
          </span>
          <span
            className="font-serif"
            style={{
              fontSize: 22,
              fontStyle: "italic",
              color: "var(--gold)",
              marginLeft: 6,
            }}
          >
            AI
          </span>
        </div>

      {/* Center — Search */}
      <div className="flex-1 flex justify-center px-6">
        <div
          className="relative flex items-center"
          style={{ width: "min(480px, 45%)", height: 38 }}
          role="search"
          aria-label="Global search"
        >
          <Search
            size={16}
            className="absolute left-3"
            style={{ color: "var(--header-text)", opacity: 0.7 }}
          />
          <input
            type="text"
            placeholder="Search any person — Turing, Tesla, Ambedkar..."
            className="w-full h-full pl-9 pr-12 font-sans rounded-[10px]"
            style={{
              fontSize: 14,
              background: "var(--header-search-bg)",
              border: "1px solid var(--header-search-border)",
              color: "var(--header-text)",
              outline: "none",
              transition: "var(--transition)",
              backdropFilter: "blur(12px)",
            }}
            aria-label="Search people"
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--gold)"
              e.currentTarget.style.boxShadow = "0 0 0 2px var(--header-search-focus)"
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--header-search-border)"
              e.currentTarget.style.boxShadow = "none"
            }}
          />
          <span
            className="absolute right-3 font-mono"
            style={{
              fontSize: 11,
              color: "var(--header-text)",
              opacity: 0.7,
              padding: "2px 6px",
              borderRadius: 4,
            }}
          >
            {"⌘K"}
          </span>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center"
            style={{
              width: 34,
              height: 34,
              borderRadius: 8,
              background: "transparent",
              color: "var(--text-2)",
              transition: "background 0.15s, color 0.15s",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = "var(--header-icon-hover)"
              e.currentTarget.style.color = "var(--text-1)"
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = "transparent"
              e.currentTarget.style.color = "var(--text-2)"
            }}
            aria-label="Settings"
          >
            <Settings size={18} />
          </button>
        )}
        <button
          onClick={toggleTheme}
          className="flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "transparent",
            color: "var(--text-2)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--header-icon-hover)"
            e.currentTarget.style.color = "var(--text-1)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "var(--text-2)"
          }}
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          className="relative flex items-center justify-center"
          style={{
            width: 34,
            height: 34,
            borderRadius: 8,
            background: "transparent",
            color: "var(--text-2)",
            transition: "background 0.15s, color 0.15s",
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = "var(--header-icon-hover)"
            e.currentTarget.style.color = "var(--text-1)"
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = "transparent"
            e.currentTarget.style.color = "var(--text-2)"
          }}
          aria-label="Notifications"
        >
          <Bell size={18} />
          <span
            className="absolute"
            style={{
              top: 8,
              right: 8,
              width: 6,
              height: 6,
              borderRadius: "50%",
              background: "var(--accent)",
            }}
          />
        </button>

        <div
          className="flex items-center justify-center rounded-full font-sans"
            style={{
              width: 32,
              height: 32,
              background: "var(--header-avatar-bg)",
              border: "1px solid var(--border)",
            color: "var(--gold)",
            fontSize: 13,
            fontWeight: 600,
          }}
        >
          MK
        </div>
      </div>
    </header>
  )
}
