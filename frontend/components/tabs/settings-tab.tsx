"use client"

import { useEffect, useState } from "react"
import { Sun2, Moon } from "@/components/ui/solar-icons"
import { useTheme } from "@/hooks/use-theme"
import {
  DEFAULT_USER_SETTINGS,
  readUserSettings,
  writeUserSettings,
  type UserSettings,
} from "@/lib/user-settings"

interface SettingsTabProps {
  projectName: string
  projectDescription?: string
  onSaveProjectDetails: (payload: { name: string; description: string }) => Promise<void>
  onUserSettingsChange: (settings: UserSettings) => void
}

const SHORTCUTS: Array<{ keys: string; action: string }> = [
  { keys: "Alt + N", action: "Create new project" },
  { keys: "Alt + 1..8", action: "Switch dashboard tab" },
  { keys: "Alt + E", action: "Export project report" },
]

function ToggleRow({
  label,
  description,
  checked,
  onChange,
  showDivider = true,
}: Readonly<{
  label: string
  description: string
  checked: boolean
  onChange: (next: boolean) => void
  showDivider?: boolean
}>) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns: "minmax(0, 1fr) auto",
        alignItems: "start",
        columnGap: 14,
        padding: "14px 0",
        borderBottom: showDivider ? "1px solid var(--border-soft)" : "none",
        cursor: "pointer",
      }}
    >
      <div style={{ minWidth: 0 }}>
        <div className="font-sans" style={{ fontSize: 14, color: "var(--text-1)", fontWeight: 550 }}>
          {label}
        </div>
        <p className="font-sans" style={{ marginTop: 4, fontSize: 12, lineHeight: 1.65, color: "var(--text-3)" }}>
          {description}
        </p>
      </div>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        style={{
          marginTop: 2,
          width: 44,
          height: 26,
          borderRadius: 999,
          border: "1px solid var(--border)",
          background: checked ? "var(--gold-dim)" : "var(--surface-2)",
          position: "relative",
          flexShrink: 0,
          transition: "all 180ms ease",
        }}
      >
        <span
          style={{
            position: "absolute",
            top: 3,
            left: checked ? 21 : 3,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: checked ? "var(--gold)" : "var(--text-3)",
            transition: "all 180ms ease",
          }}
        />
      </button>
    </div>
  )
}

export function SettingsTab({
  projectName,
  projectDescription,
  onSaveProjectDetails,
  onUserSettingsChange,
}: Readonly<SettingsTabProps>) {
  const { theme, setTheme } = useTheme()
  const [name, setName] = useState(projectName)
  const [description, setDescription] = useState(projectDescription || "")
  const [userSettings, setUserSettings] = useState<UserSettings>(DEFAULT_USER_SETTINGS)
  const [isSaving, setIsSaving] = useState(false)
  const [status, setStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  useEffect(() => {
    setName(projectName)
    setDescription(projectDescription || "")
  }, [projectDescription, projectName])

  useEffect(() => {
    const stored = readUserSettings()
    setUserSettings(stored)
    onUserSettingsChange(stored)
  }, [onUserSettingsChange])

  const updateUserSetting = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setUserSettings((prev) => {
      const next = { ...prev, [key]: value }
      writeUserSettings(next)
      onUserSettingsChange(next)
      return next
    })
  }

  const hasChanges = name.trim() !== projectName.trim() || description.trim() !== (projectDescription || "").trim()

  const handleSave = async () => {
    const nextName = name.trim()
    if (!nextName) {
      setStatus("error")
      setErrorMessage("Project name is required.")
      return
    }

    setIsSaving(true)
    setStatus("idle")
    setErrorMessage("")

    try {
      await onSaveProjectDetails({
        name: nextName,
        description: description.trim(),
      })
      setStatus("success")
    } catch (error) {
      setStatus("error")
      setErrorMessage(error instanceof Error ? error.message : "Failed to update project settings.")
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div style={{ maxWidth: 820, margin: "0 auto", padding: "48px 40px 96px" }}>
      <section className="mb-12">
        <div className="flex items-center gap-2 mb-4">
          <span
            className="font-mono text-[var(--gold)]"
            style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.18em", fontWeight: 600 }}
          >
            Settings
          </span>
          <div
            style={{
              height: 1,
              flex: 1,
              background: "linear-gradient(to right, var(--gold-soft), transparent)",
              opacity: 0.3,
            }}
          ></div>
        </div>

        <h2
          className="font-sans"
          style={{ fontSize: 28, fontWeight: 650, color: "var(--text-1)", letterSpacing: "-0.02em", marginBottom: 14 }}
        >
          Workspace configuration
        </h2>

        <p className="font-sans" style={{ fontSize: 16, color: "var(--text-1)", lineHeight: 1.82, maxWidth: 720 }}>
          Keep only practical settings that are wired and working in the app.
        </p>
      </section>

      <div className="flex flex-col gap-6">
        <section className="glass-card" style={{ borderRadius: 20, padding: 24 }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Project
          </span>
          <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 6 }}>
            Name and description
          </h3>

          <div style={{ marginTop: 16, display: "grid", gap: 14 }}>
            <label className="font-sans" style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 520 }}>Project name</span>
              <input
                type="text"
                value={name}
                onChange={(event) => setName(event.target.value)}
                placeholder="Enter project name"
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-1)",
                  borderRadius: 10,
                  padding: "11px 12px",
                  fontSize: 14,
                }}
              />
            </label>

            <label className="font-sans" style={{ display: "grid", gap: 8 }}>
              <span style={{ fontSize: 13, color: "var(--text-2)", fontWeight: 520 }}>Description</span>
              <textarea
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder="Add a short description"
                rows={4}
                style={{
                  width: "100%",
                  border: "1px solid var(--border)",
                  background: "var(--surface-2)",
                  color: "var(--text-1)",
                  borderRadius: 10,
                  padding: "11px 12px",
                  fontSize: 14,
                  resize: "vertical",
                }}
              />
            </label>

            <div style={{ display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
              <button
                type="button"
                onClick={handleSave}
                disabled={!hasChanges || isSaving}
                className="font-sans"
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid var(--gold)",
                  background: "var(--gold-dim)",
                  color: "var(--text-1)",
                  fontSize: 14,
                  fontWeight: 520,
                  cursor: !hasChanges || isSaving ? "not-allowed" : "pointer",
                  opacity: !hasChanges || isSaving ? 0.6 : 1,
                }}
              >
                {isSaving ? "Saving..." : "Save changes"}
              </button>

              {status === "success" && (
                <span className="font-sans" style={{ fontSize: 13, color: "var(--text-2)" }}>
                  Project details updated.
                </span>
              )}

              {status === "error" && (
                <span className="font-sans" style={{ fontSize: 13, color: "var(--danger, #b42318)" }}>
                  {errorMessage}
                </span>
              )}
            </div>
          </div>
        </section>

        <section className="glass-card" style={{ borderRadius: 20, padding: 24 }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Dashboard
          </span>
          <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 6 }}>
            Tab visibility
          </h3>

          <ToggleRow
            label="Show Overview tab"
            description="Show the Overview tab in the sidebar."
            checked={userSettings.showOverviewTab}
            onChange={(next) => updateUserSetting("showOverviewTab", next)}
          />
          <ToggleRow
            label="Show Personality tab"
            description="Show the Personality tab in the sidebar."
            checked={userSettings.showPersonalityTab}
            onChange={(next) => updateUserSetting("showPersonalityTab", next)}
          />
          <ToggleRow
            label="Show Timeline tab"
            description="Show the Timeline tab in the sidebar."
            checked={userSettings.showTimelineTab}
            onChange={(next) => updateUserSetting("showTimelineTab", next)}
          />

          <ToggleRow
            label="Show News tab"
            description="Show the News tab when data exists for this project."
            checked={userSettings.showNewsTab}
            onChange={(next) => updateUserSetting("showNewsTab", next)}
          />
          <ToggleRow
            label="Show Work tab"
            description="Show the Work tab when publication or citation data exists."
            checked={userSettings.showWorkTab}
            onChange={(next) => updateUserSetting("showWorkTab", next)}
          />
          <ToggleRow
            label="Show Resources tab"
            description="Show the Resources tab in the sidebar."
            checked={userSettings.showResourcesTab}
            onChange={(next) => updateUserSetting("showResourcesTab", next)}
          />
          <ToggleRow
            label="Show Persona Chat tab"
            description="Show the Persona Chat tab in the sidebar."
            checked={userSettings.showChatTab}
            onChange={(next) => updateUserSetting("showChatTab", next)}
          />
        </section>

        <section className="glass-card" style={{ borderRadius: 20, padding: 24 }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Chat
          </span>
          <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 6 }}>
            Default retrieval modes
          </h3>

          <ToggleRow
            label="Enable Web search by default"
            description="New chat sessions start with Web search enabled."
            checked={userSettings.defaultWebSearch}
            onChange={(next) => updateUserSetting("defaultWebSearch", next)}
          />
          <ToggleRow
            label="Enable Knowledge base by default"
            description="New chat sessions start with Knowledge base enabled."
            checked={userSettings.defaultKnowledgeBase}
            onChange={(next) => updateUserSetting("defaultKnowledgeBase", next)}
            showDivider={false}
          />
        </section>

        <section className="glass-card" style={{ borderRadius: 20, padding: 24 }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Productivity
          </span>
          <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 6 }}>
            Keyboard shortcuts
          </h3>

          <div style={{ marginTop: 16, border: "1px solid var(--border-soft)", borderRadius: 12, overflow: "hidden" }}>
            {SHORTCUTS.map((shortcut, index) => (
              <div
                key={shortcut.keys}
                style={{
                  display: "grid",
                  gridTemplateColumns: "140px minmax(0, 1fr)",
                  gap: 12,
                  alignItems: "center",
                  padding: "10px 12px",
                  borderBottom: index === SHORTCUTS.length - 1 ? "none" : "1px solid var(--border-soft)",
                  background: index % 2 === 0 ? "rgba(255,255,255,0.015)" : "transparent",
                }}
              >
                <kbd
                  className="font-sans"
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid var(--border-soft)",
                    borderRadius: 8,
                    padding: "6px 8px",
                    fontSize: 12,
                    color: "var(--text-2)",
                    background: "var(--surface-2)",
                  }}
                >
                  {shortcut.keys}
                </kbd>
                <span className="font-sans" style={{ fontSize: 14, color: "var(--text-2)" }}>
                  {shortcut.action}
                </span>
              </div>
            ))}
          </div>
        </section>

        <section className="glass-card" style={{ borderRadius: 20, padding: 24 }}>
          <span className="font-mono" style={{ fontSize: 10, color: "var(--gold)", textTransform: "uppercase", letterSpacing: "0.1em" }}>
            Appearance
          </span>
          <h3 className="font-sans" style={{ fontSize: 18, fontWeight: 600, color: "var(--text-1)", marginTop: 6 }}>
            Theme
          </h3>

          <div className="grid md:grid-cols-2 gap-3" style={{ marginTop: 16 }}>
            <button
              type="button"
              onClick={() => setTheme("light")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${theme === "light" ? "var(--gold)" : "var(--border-soft)"}`,
                background: theme === "light" ? "var(--gold-dim)" : "transparent",
                color: "var(--text-1)",
              }}
            >
              <Sun2 size={16} color="var(--gold)" />
              <span className="font-sans" style={{ fontSize: 14, fontWeight: 520 }}>Light mode</span>
            </button>

            <button
              type="button"
              onClick={() => setTheme("dark")}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "12px 14px",
                borderRadius: 12,
                border: `1px solid ${theme === "dark" ? "var(--gold)" : "var(--border-soft)"}`,
                background: theme === "dark" ? "var(--gold-dim)" : "transparent",
                color: "var(--text-1)",
              }}
            >
              <Moon size={16} color="var(--gold)" />
              <span className="font-sans" style={{ fontSize: 14, fontWeight: 520 }}>Dark mode</span>
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
