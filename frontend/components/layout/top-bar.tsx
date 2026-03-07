"use client"

import { useState } from "react"
import { Sun, Moon, Bell, Settings } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"
import { Logo } from "@/components/ui/logo"

interface TopBarProps {
  onSettingsClick?: () => void
  onLogoClick?: () => void
}

export function TopBar({ onSettingsClick, onLogoClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme()
  const [logoHovered, setLogoHovered] = useState(false)

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-6"
      style={{
        height: "var(--topbar-h)",
        background: "var(--bg)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {/* Left — Unified Logo Lockup */}
      <div
        className={onLogoClick ? "cursor-pointer" : ""}
        onClick={onLogoClick}
        role={onLogoClick ? "button" : undefined}
        tabIndex={onLogoClick ? 0 : undefined}
        onKeyDown={onLogoClick ? (e) => e.key === "Enter" && onLogoClick() : undefined}
        onMouseEnter={() => setLogoHovered(true)}
        onMouseLeave={() => setLogoHovered(false)}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Logo
            style={{
              height: 24,
              width: "auto",
              flexShrink: 0,
              color: "var(--gold)",
              transition: "transform 0.3s ease",
              transform: logoHovered ? "scale(1.04)" : "scale(1)",
            }}
          />
          <div className="flex items-center gap-1 font-ui text-[20px] font-bold tracking-tight">
            <span style={{ color: "var(--text-1)" }}>Mimic</span>
            <span style={{ color: "var(--gold)", fontWeight: 400 }}>AI</span>
          </div>
        </div>
      </div>

      {/* Right — Actions */}
      <div className="flex items-center gap-2">
        {onSettingsClick && (
          <button
            onClick={onSettingsClick}
            className="flex items-center justify-center"
            style={{
              width: 34, height: 34, borderRadius: 8,
              background: "transparent", color: "var(--text-2)",
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
            width: 34, height: 34, borderRadius: 8,
            background: "transparent", color: "var(--text-2)",
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
            width: 34, height: 34, borderRadius: 8,
            background: "transparent", color: "var(--text-2)",
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
              top: 8, right: 8, width: 6, height: 6,
              borderRadius: "50%", background: "var(--accent)",
            }}
          />
        </button>

        <div
          className="flex items-center justify-center rounded-full font-sans"
          style={{
            width: 32, height: 32,
            background: "var(--header-avatar-bg)",
            border: "1px solid var(--border)",
            color: "var(--gold)",
            fontSize: 13, fontWeight: 600,
          }}
        >
          MK
        </div>
      </div>
    </header>
  )
}
