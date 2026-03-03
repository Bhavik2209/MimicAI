"use client"

import { Sun, Moon } from "lucide-react"
import { useTheme } from "@/hooks/use-theme"

export function SettingsTab() {
  const { theme, toggleTheme } = useTheme()

  return (
    <div
      style={{
        minHeight: "calc(100vh - var(--topbar-h))",
        background: "var(--bg)",
        padding: "32px 24px 48px",
      }}
    >
      <div style={{ maxWidth: 600, margin: "0 auto" }}>
        <h1
          className="font-serif"
          style={{
            fontSize: 28,
            fontWeight: 600,
            fontStyle: "italic",
            color: "var(--text-1)",
            letterSpacing: "-0.02em",
            marginBottom: 8,
          }}
        >
          Settings
        </h1>
        <p
          className="font-sans"
          style={{
            fontSize: 14,
            color: "var(--text-3)",
            marginBottom: 32,
          }}
        >
          Customize your MIMIC AI experience
        </p>

        {/* Appearance */}
        <section className="glass-card rounded-[20px] p-7 mb-5">
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              color: "var(--gold)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Appearance
          </span>
          <h2
            className="font-sans"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-1)",
              marginTop: 4,
              marginBottom: 20,
            }}
          >
            Theme
          </h2>

          <div className="flex items-center gap-4">
            <button onClick={toggleTheme} className="btn btn-soft flex items-center gap-3">
              {theme === "dark" ? (
                <Sun size={20} style={{ color: "var(--gold)" }} />
              ) : (
                <Moon size={20} style={{ color: "var(--gold)" }} />
              )}
              <span>
                {theme === "dark" ? "Switch to Light Mode" : "Switch to Dark Mode"}
              </span>
            </button>
            <span
              className="font-sans"
              style={{ fontSize: 13, color: "var(--text-3)" }}
            >
              Current: {theme === "dark" ? "Dark" : "Light"}
            </span>
          </div>
        </section>

        {/* Placeholder for future settings */}
        <section className="glass-card rounded-[20px] p-7 mb-5">
          <span
            className="font-mono"
            style={{
              fontSize: 10,
              color: "var(--text-3)",
              textTransform: "uppercase",
              letterSpacing: "0.1em",
            }}
          >
            Coming soon
          </span>
          <h2
            className="font-sans"
            style={{
              fontSize: 16,
              fontWeight: 600,
              color: "var(--text-2)",
              marginTop: 4,
            }}
          >
            More options
          </h2>
          <p
            className="font-sans mt-2"
            style={{ fontSize: 14, color: "var(--text-3)" }}
          >
            Additional settings will appear here as they become available.
          </p>
        </section>
      </div>
    </div>
  )
}
